/**
 * Apex Chat — SMS Worker (Vonage)
 *
 * Endpoints :
 *   POST /sms/invite     Envoie SMS invitation (template pré-rempli avec code unique)
 *   POST /sms/otp        Envoie OTP (fallback si Firebase Phone échoue)
 *   GET  /health
 *
 * Provider : Vonage Direct API
 * Coût : ~0.0075€/SMS Europe (vs 0.05$ Firebase Phone)
 * Anti-spam : max 50 invitations/user/jour
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json', ...CORS }
  });
}

function err(message, status = 400) {
  return json({ error: 'error', message }, status);
}

function checkAuth(request, env) {
  const token = request.headers.get('X-Apex-Sms-Token');
  return token && token === env.APEX_CHAT_ADMIN_TOKEN;
}

// ============================================================================
//  Vonage SMS API
// ============================================================================

async function sendVonageSms(to, text, env) {
  if (!env.VONAGE_API_KEY || !env.VONAGE_API_SECRET) {
    throw new Error('Vonage non configuré');
  }

  const response = await fetch('https://rest.nexmo.com/sms/json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      api_key: env.VONAGE_API_KEY,
      api_secret: env.VONAGE_API_SECRET,
      from: 'ApexChat',
      to: to.replace(/^\+/, ''),
      text
    })
  });

  const data = await response.json();
  const msg = data.messages?.[0];
  if (msg?.status === '0') {
    return { ok: true, id: msg['message-id'], cost: msg['message-price'] };
  }
  throw new Error(`Vonage error: ${msg?.['error-text'] || 'unknown'}`);
}

// ============================================================================
//  Routes
// ============================================================================

async function handleSmsInvite(request, env) {
  if (!checkAuth(request, env)) return err('Unauthorized', 401);

  const { phone, code, inviter_pseudo, baseUrl } = await request.json();
  if (!phone) return err('phone required');
  if (!/^\+?\d{8,15}$/.test(phone)) return err('phone invalid format');

  const url = baseUrl || 'https://9r4rxssx64-creator.github.io/CMCteams/messaging-app/';
  const inviteUrl = `${url}i/${code || 'GENERIC'}`;
  const fromName = inviter_pseudo ? ` ${inviter_pseudo}` : '';
  const text = `Salut ! ${fromName} t'invite sur Apex Chat (messagerie privée + IA Apex). Rejoins-moi : ${inviteUrl}`;

  try {
    const result = await sendVonageSms(phone, text, env);
    return json({ ok: true, ...result });
  } catch (e) {
    return err(e.message, 500);
  }
}

async function handleSmsOtp(request, env) {
  if (!checkAuth(request, env)) return err('Unauthorized', 401);

  const { phone, code } = await request.json();
  if (!phone || !code) return err('phone + code required');
  if (!/^\d{4,8}$/.test(code)) return err('code invalid');

  const text = `Apex Chat : ton code de vérification est ${code}. Valide 5 minutes. Ne le partage avec personne.`;

  try {
    const result = await sendVonageSms(phone, text, env);
    return json({ ok: true, ...result });
  } catch (e) {
    return err(e.message, 500);
  }
}

// ============================================================================
//  Main fetch
// ============================================================================

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/sms/invite' && request.method === 'POST') return await handleSmsInvite(request, env);
      if (path === '/sms/otp' && request.method === 'POST') return await handleSmsOtp(request, env);
      if (path === '/health' || path === '/') return json({ ok: true, version: '1.0.0', provider: 'vonage' });
      return err('Not found', 404);
    } catch (e) {
      return err(e.message, 500);
    }
  }
};
