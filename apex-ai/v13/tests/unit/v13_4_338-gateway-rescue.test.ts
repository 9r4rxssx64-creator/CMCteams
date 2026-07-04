/**
 * v13.4.338 — Secours ULTIME passerelle kdmc-apis (chatFallback.tryGatewayRescue).
 * Quand TOUS les providers Apex échouent, /ai du domaine (chaîne + Workers AI sans clé)
 * fournit une vraie réponse. Fail-open : toute erreur → null → fallback local inchangé.
 * vi.mock module-level interdit ici (on teste le vrai code) ; fetch stubbed par test
 * + restauré en afterEach (leçons #84/#89 : zéro fuite cross-fichier).
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { chatFallback } from '../../services/ai/chat-fallback.js';

const MSGS = [
  { role: 'system', content: 'sys' },
  { role: 'user', content: 'Bonjour Apex' },
];

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('v13.4.338 — tryGatewayRescue (passerelle kdmc-apis)', () => {
  it('réponse gateway ok → retourne le texte', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ ok: true, provider: 'workers-ai', text: 'Salut, je suis le secours domaine.' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    const out = await chatFallback.tryGatewayRescue(MSGS);
    expect(out).toContain('secours domaine');
    /* URL appelée = la passerelle /ai avec tag app */
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(String(call[0])).toContain('apis.kd-mc.com/ai');
  });

  it('HTTP non-ok (503 aucun provider) → null (fail-open)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{"ok":false}', { status: 503 })));
    expect(await chatFallback.tryGatewayRescue(MSGS)).toBeNull();
  });

  it('erreur réseau (fetch reject) → null, ne throw JAMAIS', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('net down'))));
    await expect(chatFallback.tryGatewayRescue(MSGS)).resolves.toBeNull();
  });

  it('texte trop court / data.ok false → null (anti message-vide)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: true, text: 'ok' }), { status: 200 })));
    expect(await chatFallback.tryGatewayRescue(MSGS)).toBeNull();
  });

  it('dernier message pas user (ou contenu non-string) → null sans fetch', async () => {
    const spy = vi.fn();
    vi.stubGlobal('fetch', spy);
    expect(await chatFallback.tryGatewayRescue([{ role: 'assistant', content: 'x' }])).toBeNull();
    expect(await chatFallback.tryGatewayRescue([{ role: 'user', content: [{ type: 'image' }] }])).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it('filtre : garde les 12 derniers messages texte, tronque à 8000 chars', async () => {
    const many = Array.from({ length: 20 }, (_, i) => ({
      role: i % 2 ? 'assistant' : 'user',
      content: 'm' + i,
    }));
    many.push({ role: 'user', content: 'x'.repeat(9000) });
    let body: { messages: Array<{ content: string }> } | null = null;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_u: string, init: { body: string }) => {
        body = JSON.parse(init.body) as typeof body;
        return new Response(JSON.stringify({ ok: true, text: 'réponse assez longue ici' }), { status: 200 });
      }),
    );
    await chatFallback.tryGatewayRescue(many);
    expect(body!.messages.length).toBeLessThanOrEqual(12);
    expect(body!.messages[body!.messages.length - 1]!.content.length).toBe(8000);
  });
});
