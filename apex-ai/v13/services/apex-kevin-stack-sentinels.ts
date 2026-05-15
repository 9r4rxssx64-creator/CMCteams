/**
 * APEX v13.4.108 — Sentinelles dédiées Kevin stack (Vercel agents + Pinecone).
 *
 * Kevin context drop 2026-05-15 :
 *   - kdmc-agent-monaco.vercel.app (URL Agent + /api/health + /api/cron)
 *   - kdmc-bot-2026.vercel.app (Vercel bot)
 *   - apex-memory-octnsiv.svc.aped-4627-b74a.pinecone.io (Pinecone index)
 *
 * Sentinelles ajoutées (run via sentinels.register au boot) :
 *   1. kdmc-agent-monaco-health : ping /api/health toutes 10min, alerte si KO > 30min
 *   2. kdmc-bot-2026-health : idem
 *   3. pinecone-index-status : describe index toutes 30min
 */

import { logger } from '../core/logger.js';

import { sentinels } from './sentinels.js';

type SentinelResult = { ok: boolean; msg: string; ts: number };

const AGENT_MONACO_HEALTH_URL = 'https://kdmc-agent-monaco.vercel.app/api/health';
const BOT_2026_URL = 'https://kdmc-bot-2026.vercel.app';
const PINECONE_INDEX_HOST = 'apex-memory-octnsiv.svc.aped-4627-b74a.pinecone.io';

async function pingUrl(url: string, timeoutMs = 8000): Promise<{ ok: boolean; status?: number; msg: string }> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const resp = await fetch(url, { method: 'GET', signal: ctrl.signal });
    clearTimeout(t);
    return {
      ok: resp.ok,
      status: resp.status,
      msg: resp.ok ? `HTTP ${resp.status} OK` : `HTTP ${resp.status}`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, msg: msg.slice(0, 80) };
  }
}

export function registerKevinStackSentinels(): void {
  /* 1. kdmc-agent-monaco-health : Vercel agent principal Kevin */
  sentinels.register({
    id: 'kdmc-agent-monaco-health',
    name: 'KDMC Agent Monaco (Vercel)',
    desc: `Ping ${AGENT_MONACO_HEALTH_URL} toutes 10min`,
    intervalMs: 10 * 60 * 1000,
    check: async (): Promise<SentinelResult> => {
      const r = await pingUrl(AGENT_MONACO_HEALTH_URL);
      return {
        ok: r.ok,
        msg: r.ok ? `✅ Agent Monaco UP : ${r.msg}` : `❌ Agent Monaco DOWN : ${r.msg}`,
        ts: Date.now(),
      };
    },
  });

  /* 2. kdmc-bot-2026-health : Vercel bot Telegram */
  sentinels.register({
    id: 'kdmc-bot-2026-health',
    name: 'KDMC Bot 2026 (Vercel)',
    desc: `Ping ${BOT_2026_URL} toutes 10min`,
    intervalMs: 10 * 60 * 1000,
    check: async (): Promise<SentinelResult> => {
      const r = await pingUrl(BOT_2026_URL);
      return {
        ok: r.ok,
        msg: r.ok ? `✅ Bot 2026 UP : ${r.msg}` : `❌ Bot 2026 DOWN : ${r.msg}`,
        ts: Date.now(),
      };
    },
  });

  /* 3. pinecone-index-status : Vector DB Apex */
  sentinels.register({
    id: 'pinecone-index-status',
    name: 'Pinecone apex-memory index',
    desc: `Check Pinecone index ${PINECONE_INDEX_HOST} toutes 30min`,
    intervalMs: 30 * 60 * 1000,
    check: async (): Promise<SentinelResult> => {
      try {
        const { vault } = await import('./vault.js');
        const apiKey = await vault.readKey('ax_pinecone_key').catch(() => '');
        if (!apiKey) {
          return { ok: false, msg: 'Pinecone API key absente du Vault', ts: Date.now() };
        }
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 8000);
        const resp = await fetch(`https://${PINECONE_INDEX_HOST}/describe_index_stats`, {
          method: 'POST',
          headers: {
            'Api-Key': apiKey,
            'content-type': 'application/json',
            'X-Pinecone-API-Version': '2024-07',
          },
          body: JSON.stringify({}),
          signal: ctrl.signal,
        });
        clearTimeout(t);
        if (!resp.ok) {
          return { ok: false, msg: `Pinecone HTTP ${resp.status}`, ts: Date.now() };
        }
        const data = await resp.json() as { totalVectorCount?: number };
        return {
          ok: true,
          msg: `✅ Pinecone OK · ${data.totalVectorCount ?? 0} vectors`,
          ts: Date.now(),
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { ok: false, msg: `Pinecone check failed: ${msg.slice(0, 60)}`, ts: Date.now() };
      }
    },
  });

  logger.info('kevin-stack-sentinels', '✅ 3 sentinelles Kevin stack enregistrées');
}
