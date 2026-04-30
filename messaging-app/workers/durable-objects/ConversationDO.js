/**
 * ConversationDO — 1 Durable Object par conversation
 *
 * Responsabilités :
 *   - WebSocket multi-clients par conv (un client = un device user)
 *   - Séquencement messages (incrément local, garantit ordre strict)
 *   - Fan-out aux membres connectés (broadcast WS)
 *   - Persistence D1 toutes les 5s (audit + recovery)
 *   - Push notifications aux membres déconnectés (via push-worker)
 *   - Lecture flag KEVIN_INVISIBLE_ADMIN (architecture A→B→C)
 *   - État ratchet PQXDH persisté dans `storage` (clé "ratchet_state")
 *   - Stats live : member_count, messages_today, connected_now
 *
 * Le serveur ne déchiffre RIEN — il route uniquement des ciphertexts.
 */

export class ConversationDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();   // ws → {userId, deviceId, lastSeq, connectedAt}
    this.seq = 0;                 // séquence locale messages
    this.lastFlush = Date.now();
    this.pendingMessages = [];    // buffer avant flush D1
    this.config = null;

    // Hibernation : restore seq depuis storage
    state.blockConcurrencyWhile(async () => {
      this.seq = (await state.storage.get('seq')) || 0;
      this.config = await this.loadConfig();
    });
  }

  async loadConfig() {
    try {
      const stmt = await this.env.APEX_CHAT_DB.prepare('SELECT key, value FROM system_config').all();
      const config = {};
      for (const row of (stmt.results || [])) config[row.key] = row.value;
      return config;
    } catch (e) {
      return { KEVIN_INVISIBLE_ADMIN: 'false', ADMIN_MODE: 'B' };  // P0 FIX : default B
    }
  }

  // P0 FIX (audit) : vérification JWT HMAC-SHA256
  async verifyJWT(token) {
    if (!token || !this.env.JWT_SIGN_KEY) return null;
    const [h, p, s] = token.split('.');
    if (!h || !p || !s) return null;
    try {
      const key = await crypto.subtle.importKey(
        'raw', new TextEncoder().encode(this.env.JWT_SIGN_KEY),
        { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
      );
      const sigBytes = Uint8Array.from(
        atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(s.length + (4 - s.length % 4) % 4, '=')),
        c => c.charCodeAt(0)
      );
      const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(`${h}.${p}`));
      if (!valid) return null;
      const payload = JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/').padEnd(p.length + (4 - p.length % 4) % 4, '=')));
      if (payload.exp && payload.exp * 1000 < Date.now()) return null;
      return payload;
    } catch (e) {
      return null;
    }
  }

  async fetch(request) {
    const url = new URL(request.url);

    // Health endpoint
    if (url.pathname.endsWith('/health')) {
      return new Response(JSON.stringify({
        ok: true,
        connected: this.sessions.size,
        seq: this.seq,
        pending: this.pendingMessages.length
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // WebSocket upgrade
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('WebSocket required', { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];

    // P0 FIX (audit) : vérification JWT obligatoire + check membership
    const token = url.searchParams.get('token');
    const claimedUserId = url.searchParams.get('uid');
    const deviceId = url.searchParams.get('did') || crypto.randomUUID();

    if (!token || !claimedUserId) {
      server.accept();
      server.close(1008, 'Auth required');
      return new Response(null, { status: 101, webSocket: client });
    }

    // Vérifier JWT signature (HS256)
    const jwtPayload = await this.verifyJWT(token);
    if (!jwtPayload) {
      server.accept();
      server.close(1008, 'Invalid token');
      return new Response(null, { status: 101, webSocket: client });
    }

    // Le claimed userId DOIT correspondre au sub du JWT
    const userId = jwtPayload.sub;
    if (claimedUserId !== userId) {
      server.accept();
      server.close(1008, 'UID mismatch');
      return new Response(null, { status: 101, webSocket: client });
    }

    // Vérifier que le user est bien membre de cette conv (D1 query)
    const convId = url.searchParams.get('conv') || this.state.id.toString();
    try {
      const member = await this.env.APEX_CHAT_DB.prepare(
        'SELECT user_id, role FROM conversation_members WHERE conv_id=? AND user_id=?'
      ).bind(convId, userId).first();
      if (!member) {
        server.accept();
        server.close(1008, 'Not a member');
        return new Response(null, { status: 101, webSocket: client });
      }
    } catch (e) {
      server.accept();
      server.close(1011, 'DB error');
      return new Response(null, { status: 101, webSocket: client });
    }

    server.accept();
    this.sessions.set(server, {
      userId,
      deviceId,
      convId,                    // P0 FIX : convId D1 réel (pas DO id)
      lastSeq: 0,
      connectedAt: Date.now(),
      messageCount: 0,           // pour rate limit
      lastReset: Date.now()
    });

    // Send hello + last messages
    server.send(JSON.stringify({
      type: 'hello',
      seq: this.seq,
      connected: this.sessions.size,
      ts: Date.now()
    }));

    // Notifier membres présents
    this.broadcast({
      type: 'presence',
      userId,
      action: 'join',
      ts: Date.now()
    }, server);

    server.addEventListener('message', async (event) => {
      try {
        const msg = JSON.parse(event.data);
        await this.handleMessage(server, msg);
      } catch (e) {
        server.send(JSON.stringify({ type: 'error', message: e.message }));
      }
    });

    server.addEventListener('close', () => {
      const session = this.sessions.get(server);
      this.sessions.delete(server);
      if (session) {
        this.broadcast({
          type: 'presence',
          userId: session.userId,
          action: 'leave',
          ts: Date.now()
        });
      }
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  async handleMessage(ws, msg) {
    const session = this.sessions.get(ws);
    if (!session) return;

    // P0 FIX (audit) : rate limit 100 messages/min/session
    const now = Date.now();
    if (now - session.lastReset > 60000) {
      session.messageCount = 0;
      session.lastReset = now;
    }
    if (msg.type === 'message') {
      session.messageCount++;
      if (session.messageCount > 100) {
        return ws.send(JSON.stringify({ type: 'error', code: 'rate_limit',
          message: 'Trop de messages, attends 1 minute' }));
      }
    }

    switch (msg.type) {
      case 'message': {
        // Nouveau message chiffré (ciphertext)
        if (!msg.ciphertext) return ws.send(JSON.stringify({ type: 'error', message: 'ciphertext required' }));
        if (msg.ciphertext.length > 100000) return ws.send(JSON.stringify({ type: 'error', message: 'ciphertext too large (max 100KB)' }));

        // P0 FIX (audit) : utiliser blockConcurrencyWhile pour seq atomic
        await this.state.blockConcurrencyWhile(async () => {
          this.seq++;
          await this.state.storage.put('seq', this.seq);
        });

        const messageId = crypto.randomUUID();
        const ts = Date.now();

        const messageRecord = {
          id: messageId,
          conv_id: session.convId,        // P0 FIX (audit) : convId D1 réel (pas DO id)
          sender_id: session.userId,
          ciphertext: msg.ciphertext,
          mime: msg.mime || 'text/plain',
          ts,
          reply_to: msg.reply_to || null,
          thread_root: msg.thread_root || null,
          view_once: msg.view_once ? 1 : 0,
          expires_at: msg.expires_at || null,
          seq: this.seq
        };

        this.pendingMessages.push(messageRecord);

        // Fan-out immédiat aux clients connectés
        this.broadcast({
          type: 'message',
          ...messageRecord
        });

        // Push notif aux déconnectés (best-effort)
        await this.notifyOfflineMembers(messageRecord);

        // Flush D1 si > 10 messages OU > 5s
        if (this.pendingMessages.length >= 10 || Date.now() - this.lastFlush > 5000) {
          await this.flushToD1();
        }

        ws.send(JSON.stringify({ type: 'ack', id: messageId, seq: this.seq, ts }));
        break;
      }

      case 'typing':
        this.broadcast({
          type: 'typing',
          userId: session.userId,
          ts: Date.now()
        }, ws);
        break;

      case 'read': {
        // Marquer last_read_msg_id
        await this.env.APEX_CHAT_DB.prepare(
          'UPDATE conversation_members SET last_read_msg_id=? WHERE conv_id=? AND user_id=?'
        ).bind(msg.message_id, this.state.id.toString(), session.userId).run().catch(() => {});

        this.broadcast({
          type: 'read',
          userId: session.userId,
          message_id: msg.message_id,
          ts: Date.now()
        }, ws);
        break;
      }

      case 'reaction': {
        // Update reactions JSON
        const existing = await this.env.APEX_CHAT_DB.prepare(
          'SELECT reactions FROM messages WHERE id=?'
        ).bind(msg.message_id).first();
        if (existing) {
          let reactions = {};
          try { reactions = JSON.parse(existing.reactions || '{}'); } catch {}
          reactions[msg.emoji] = reactions[msg.emoji] || [];
          if (!reactions[msg.emoji].includes(session.userId)) {
            reactions[msg.emoji].push(session.userId);
          } else {
            reactions[msg.emoji] = reactions[msg.emoji].filter(u => u !== session.userId);
          }
          await this.env.APEX_CHAT_DB.prepare(
            'UPDATE messages SET reactions=? WHERE id=?'
          ).bind(JSON.stringify(reactions), msg.message_id).run();

          this.broadcast({
            type: 'reaction',
            message_id: msg.message_id,
            reactions,
            ts: Date.now()
          });
        }
        break;
      }

      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
        break;

      default:
        ws.send(JSON.stringify({ type: 'error', message: 'Type inconnu: ' + msg.type }));
    }
  }

  broadcast(payload, exclude = null) {
    const data = JSON.stringify(payload);
    for (const [ws, _session] of this.sessions) {
      if (ws === exclude) continue;
      try {
        ws.send(data);
      } catch (e) {
        // Client mort, on cleanup au prochain close
      }
    }
  }

  async notifyOfflineMembers(messageRecord) {
    try {
      // Récupérer tous les members de la conv
      const members = await this.env.APEX_CHAT_DB.prepare(
        'SELECT user_id FROM conversation_members WHERE conv_id=?'
      ).bind(messageRecord.conv_id).all();

      // Identifier ceux qui ne sont PAS connectés ici
      const connectedUsers = new Set([...this.sessions.values()].map(s => s.userId));
      const offline = (members.results || []).filter(m =>
        m.user_id !== messageRecord.sender_id && !connectedUsers.has(m.user_id)
      );

      if (offline.length === 0) return;

      // Push via worker push (best-effort, fire and forget)
      // L'IA Apex peut décrypter le message côté client si user en ligne, sinon notif générique
      const pushPayload = {
        title: 'Apex Chat',
        body: 'Nouveau message',
        tag: `conv-${messageRecord.conv_id}`,
        payload: {
          convId: messageRecord.conv_id,
          messageId: messageRecord.id,
          ts: messageRecord.ts
        }
      };

      for (const member of offline) {
        // Fire and forget — pas de await, on utilise waitUntil au niveau du worker parent
        fetch(`https://apex-push-worker.desarzens-kevin.workers.dev/broadcast`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Apex-Push-Token': this.env.APEX_CHAT_ADMIN_TOKEN || ''
          },
          body: JSON.stringify({
            topic: `user:${member.user_id}`,
            ...pushPayload
          })
        }).catch(() => {});  // best-effort
      }
    } catch (e) {
      console.error('notifyOfflineMembers error', e.message);
    }
  }

  async flushToD1() {
    if (this.pendingMessages.length === 0) return;

    const toFlush = [...this.pendingMessages];
    this.pendingMessages = [];
    this.lastFlush = Date.now();

    try {
      // Batch insert
      const stmt = this.env.APEX_CHAT_DB.prepare(
        `INSERT INTO messages (id, conv_id, sender_id, ciphertext, mime, ts, reply_to, thread_root, view_once, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      await this.env.APEX_CHAT_DB.batch(toFlush.map(m =>
        stmt.bind(m.id, m.conv_id, m.sender_id, m.ciphertext, m.mime, m.ts,
          m.reply_to, m.thread_root, m.view_once, m.expires_at)
      ));

      // Update conv last_msg_ts
      const lastMsg = toFlush[toFlush.length - 1];
      await this.env.APEX_CHAT_DB.prepare(
        'UPDATE conversations SET last_msg_id=?, last_msg_ts=? WHERE id=?'
      ).bind(lastMsg.id, lastMsg.ts, lastMsg.conv_id).run();
    } catch (e) {
      console.error('flushToD1 error', e.message);
      // Re-queue les messages perdus
      this.pendingMessages.unshift(...toFlush);
      // Push télémétrie
      this.env.TELEMETRY_QUEUE?.send({
        sentinel: 'do-flush-error',
        severity: 'err',
        msg: e.message,
        ts: Date.now()
      }).catch(() => {});
    }
  }

  async alarm() {
    // Hibernation alarm — flush si pending
    await this.flushToD1();
  }
}

/**
 * BroadcastDO — DO root pour channels broadcast > 5K membres
 * Sharding hiérarchique : root → N worker DOs (chaque shard ~5K subs max)
 */
export class BroadcastDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
    this.shards = [];

    state.blockConcurrencyWhile(async () => {
      this.shards = (await state.storage.get('shards')) || [];
    });
  }

  async fetch(request) {
    // Stub pour Phase 4 — implémentation détaillée avec sharding hiérarchique
    return new Response(JSON.stringify({ ok: true, type: 'BroadcastDO', shards: this.shards.length }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * PresenceDO — 1 par tenant région (FR/EU/US)
 * Heartbeat 30s, source de vérité online/last_seen
 */
export class PresenceDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.online = new Map();  // userId → { lastHeartbeat, devices: [...] }
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname.endsWith('/heartbeat')) {
      const { userId, deviceId } = await request.json();
      this.online.set(userId, {
        lastHeartbeat: Date.now(),
        deviceId
      });
      return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname.endsWith('/list')) {
      // Cleanup users inactifs > 90s
      const cutoff = Date.now() - 90000;
      for (const [uid, p] of this.online) {
        if (p.lastHeartbeat < cutoff) this.online.delete(uid);
      }
      return new Response(JSON.stringify({
        ok: true,
        online_count: this.online.size,
        users: [...this.online.keys()]
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname.endsWith('/check')) {
      const { userId } = await request.json();
      const p = this.online.get(userId);
      const isOnline = p && (Date.now() - p.lastHeartbeat < 90000);
      return new Response(JSON.stringify({ ok: true, online: !!isOnline, lastSeen: p?.lastHeartbeat }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not found', { status: 404 });
  }
}
