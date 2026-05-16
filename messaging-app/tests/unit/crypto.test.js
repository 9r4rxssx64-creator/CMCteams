/**
 * Tests crypto E2E (ECDH P-256 + AES-GCM 256 + HKDF + PBKDF2 100k)
 * Importe lib/crypto-core.js (ESM) → coverage v8 instrumentée.
 */
import { describe, it, expect } from 'vitest';
import * as api from '../../lib/crypto-core.js';

describe('ApexCrypto — module public API', () => {
  it('expose toutes les fonctions documentées', () => {
    const required = [
      'generateIdentityKeys', 'exportPublicKey', 'importPublicKey',
      'exportPrivateKey', 'importPrivateKey',
      'deriveSharedKey', 'establishSession', 'getSessionKey',
      'encryptForConv', 'decryptForConv',
      'encryptMessage', 'decryptMessage',
      'wrapWithPin', 'unwrapWithPin',
      'computeFingerprint', 'selfTest',
      'randomBytes', 'bufToB64', 'b64ToBuf', 'bufToHex',
    ];
    for (const fn of required) expect(typeof api[fn]).toBe('function');
  });
});

describe('ApexCrypto — utils', () => {
  it('randomBytes retourne Uint8Array de longueur demandée', () => {
    const buf = api.randomBytes(32);
    expect(buf).toBeInstanceOf(Uint8Array);
    expect(buf.length).toBe(32);
  });

  it('randomBytes 2 appels = 2 valeurs différentes (entropie)', () => {
    const a = api.randomBytes(16);
    const b = api.randomBytes(16);
    expect(api.bufToB64(a)).not.toBe(api.bufToB64(b));
  });

  it('bufToB64/b64ToBuf roundtrip', () => {
    const orig = api.randomBytes(64);
    const b64 = api.bufToB64(orig);
    expect(typeof b64).toBe('string');
    const back = new Uint8Array(api.b64ToBuf(b64));
    expect(Array.from(back)).toEqual(Array.from(orig));
  });

  it('bufToHex hex valide', () => {
    const buf = new Uint8Array([0x00, 0xff, 0xab, 0xcd]);
    expect(api.bufToHex(buf)).toBe('00ffabcd');
  });
});

describe('ApexCrypto — Identity keys', () => {
  it('genère un keypair ECDH P-256 valide', async () => {
    const kp = await api.generateIdentityKeys();
    expect(kp.publicKey).toBeDefined();
    expect(kp.privateKey).toBeDefined();
    expect(kp.publicKey.algorithm.name).toBe('ECDH');
    expect(kp.publicKey.algorithm.namedCurve).toBe('P-256');
  });

  it('export/import publicKey roundtrip cohérent', async () => {
    const kp = await api.generateIdentityKeys();
    const b64 = await api.exportPublicKey(kp.publicKey);
    expect(typeof b64).toBe('string');
    const back = await api.importPublicKey(b64);
    expect(back.algorithm.namedCurve).toBe('P-256');
  });

  it('export/import privateKey roundtrip cohérent', async () => {
    const kp = await api.generateIdentityKeys();
    const b64 = await api.exportPrivateKey(kp.privateKey);
    const back = await api.importPrivateKey(b64);
    expect(back.algorithm.namedCurve).toBe('P-256');
  });
});

describe('ApexCrypto — ECDH derivation', () => {
  it('Alice + Bob dérivent la MÊME clé partagée', async () => {
    const alice = await api.generateIdentityKeys();
    const bob = await api.generateIdentityKeys();

    const aliceK = await api.deriveSharedKey(alice.privateKey, bob.publicKey);
    const bobK = await api.deriveSharedKey(bob.privateKey, alice.publicKey);

    // Test indirect: chiffrer avec aliceK + déchiffrer avec bobK
    const ct = await api.encryptMessage('hello world', aliceK);
    const pt = await api.decryptMessage(ct, bobK);
    expect(pt).toBe('hello world');
  });

  it('Eve avec ses propres clés ne déchiffre PAS le message Alice→Bob', async () => {
    const alice = await api.generateIdentityKeys();
    const bob = await api.generateIdentityKeys();
    const eve = await api.generateIdentityKeys();

    const aliceK = await api.deriveSharedKey(alice.privateKey, bob.publicKey);
    const eveK = await api.deriveSharedKey(eve.privateKey, bob.publicKey);

    const ct = await api.encryptMessage('top secret', aliceK);
    await expect(api.decryptMessage(ct, eveK)).rejects.toBeDefined();
  });
});

describe('ApexCrypto — Sessions par conversation', () => {
  it('establishSession + getSessionKey + encryptForConv + decryptForConv', async () => {
    const alice = await api.generateIdentityKeys();
    const bob = await api.generateIdentityKeys();
    const convId = 'conv-' + Math.random();

    expect(api.getSessionKey(convId)).toBeUndefined();
    await api.establishSession(convId, alice.privateKey, bob.publicKey);
    expect(api.getSessionKey(convId)).toBeDefined();

    const ct = await api.encryptForConv(convId, 'message dans conv');
    expect(typeof ct).toBe('string');
    expect(ct.length).toBeGreaterThan(20);

    // Bob établit même session côté reception
    const bobConvId = 'conv-bob-' + Math.random();
    await api.establishSession(bobConvId, bob.privateKey, alice.publicKey);
    // Bob doit pouvoir déchiffrer car ECDH symétrique
    const bobAesKey = api.getSessionKey(bobConvId);
    const decoded = await api.decryptMessage(ct, bobAesKey);
    expect(decoded).toBe('message dans conv');
  });

  it('encryptForConv sans session établie → throw', async () => {
    await expect(api.encryptForConv('inexistant-' + Math.random(), 'msg')).rejects.toThrow();
  });

  it('decryptForConv sans session établie → throw', async () => {
    await expect(api.decryptForConv('inexistant-' + Math.random(), 'cipher==')).rejects.toThrow();
  });

  it('chaque encryptForConv produit un ciphertext différent (IV unique)', async () => {
    const alice = await api.generateIdentityKeys();
    const bob = await api.generateIdentityKeys();
    const convId = 'iv-uniq-' + Math.random();
    await api.establishSession(convId, alice.privateKey, bob.publicKey);
    const c1 = await api.encryptForConv(convId, 'identique');
    const c2 = await api.encryptForConv(convId, 'identique');
    expect(c1).not.toBe(c2);
  });
});

describe('ApexCrypto — wrapWithPin / unwrapWithPin (PBKDF2 100k)', () => {
  it('roundtrip wrap+unwrap avec PIN correct', async () => {
    const payload = { secret: 'private key data', n: 42 };
    const wrapped = await api.wrapWithPin(payload, '200807');
    expect(wrapped.ciphertext).toBeDefined();
    expect(wrapped.salt).toBeDefined();

    const back = await api.unwrapWithPin(wrapped.ciphertext, wrapped.salt, '200807');
    expect(back).toEqual(payload);
  });

  it('unwrap avec mauvais PIN → throw', async () => {
    const wrapped = await api.wrapWithPin({ k: 'v' }, '200807');
    await expect(api.unwrapWithPin(wrapped.ciphertext, wrapped.salt, '999999')).rejects.toBeDefined();
  });

  it('chaque wrap génère un salt différent', async () => {
    const w1 = await api.wrapWithPin({ k: 1 }, 'pin');
    const w2 = await api.wrapWithPin({ k: 1 }, 'pin');
    expect(w1.salt).not.toBe(w2.salt);
    expect(w1.ciphertext).not.toBe(w2.ciphertext);
  });
});

describe('ApexCrypto — computeFingerprint', () => {
  it('fingerprint déterministe pour mêmes paires', async () => {
    const alice = await api.generateIdentityKeys();
    const bob = await api.generateIdentityKeys();
    const fp1 = await api.computeFingerprint(alice.publicKey, bob.publicKey);
    const fp2 = await api.computeFingerprint(alice.publicKey, bob.publicKey);
    expect(fp1).toBe(fp2);
  });

  it('fingerprint symétrique (Alice↔Bob == Bob↔Alice)', async () => {
    const alice = await api.generateIdentityKeys();
    const bob = await api.generateIdentityKeys();
    const fp1 = await api.computeFingerprint(alice.publicKey, bob.publicKey);
    const fp2 = await api.computeFingerprint(bob.publicKey, alice.publicKey);
    expect(fp1).toBe(fp2);
  });

  it('fingerprint format 6 groupes de 5 chiffres séparés par espace', async () => {
    const alice = await api.generateIdentityKeys();
    const bob = await api.generateIdentityKeys();
    const fp = await api.computeFingerprint(alice.publicKey, bob.publicKey);
    expect(fp).toMatch(/^[0-9a-f]{5}( [0-9a-f]{5}){5}$/);
  });

  it('fingerprint différent pour paires différentes', async () => {
    const a = await api.generateIdentityKeys();
    const b = await api.generateIdentityKeys();
    const c = await api.generateIdentityKeys();
    const fpAB = await api.computeFingerprint(a.publicKey, b.publicKey);
    const fpAC = await api.computeFingerprint(a.publicKey, c.publicKey);
    expect(fpAB).not.toBe(fpAC);
  });
});

describe('ApexCrypto — encryptMessage/decryptMessage (raw)', () => {
  it('roundtrip avec clé partagée', async () => {
    const alice = await api.generateIdentityKeys();
    const bob = await api.generateIdentityKeys();
    const k = await api.deriveSharedKey(alice.privateKey, bob.publicKey);
    const ct = await api.encryptMessage('Hello 🌍', k);
    expect(typeof ct).toBe('string');
    const pt = await api.decryptMessage(ct, k);
    expect(pt).toBe('Hello 🌍');
  });

  it('decryptMessage tampered ciphertext → throw (auth tag GCM)', async () => {
    const alice = await api.generateIdentityKeys();
    const bob = await api.generateIdentityKeys();
    const k = await api.deriveSharedKey(alice.privateKey, bob.publicKey);
    const ct = await api.encryptMessage('original', k);
    // Flip 1 byte au milieu (alter le ciphertext)
    const buf = new Uint8Array(api.b64ToBuf(ct));
    buf[Math.floor(buf.length / 2)] ^= 0xff;
    const tampered = api.bufToB64(buf);
    await expect(api.decryptMessage(tampered, k)).rejects.toBeDefined();
  });

  it('encryptMessage gère unicode + émojis', async () => {
    const alice = await api.generateIdentityKeys();
    const bob = await api.generateIdentityKeys();
    const k = await api.deriveSharedKey(alice.privateKey, bob.publicKey);
    const msg = '🛡 message avec accents é à ç + emoji 🇫🇷👨‍💻';
    const ct = await api.encryptMessage(msg, k);
    const pt = await api.decryptMessage(ct, k);
    expect(pt).toBe(msg);
  });

  it('encryptMessage sur message vide', async () => {
    const alice = await api.generateIdentityKeys();
    const bob = await api.generateIdentityKeys();
    const k = await api.deriveSharedKey(alice.privateKey, bob.publicKey);
    const ct = await api.encryptMessage('', k);
    const pt = await api.decryptMessage(ct, k);
    expect(pt).toBe('');
  });

  it('encryptMessage gère gros payload (10KB)', async () => {
    const alice = await api.generateIdentityKeys();
    const bob = await api.generateIdentityKeys();
    const k = await api.deriveSharedKey(alice.privateKey, bob.publicKey);
    const msg = 'A'.repeat(10000);
    const ct = await api.encryptMessage(msg, k);
    const pt = await api.decryptMessage(ct, k);
    expect(pt).toBe(msg);
  });
});

describe('ApexCrypto — selfTest', () => {
  it('selfTest retourne ok:true + fingerprint', async () => {
    const r = await api.selfTest();
    expect(r.ok).toBe(true);
    expect(r.fingerprint).toMatch(/^[0-9a-f]{5}( [0-9a-f]{5}){5}$/);
    expect(r.message_test).toContain('Bob');
  });

  it('selfTest catch retourne ok:false si crypto.subtle.generateKey throw', async () => {
    const { vi } = await import('vitest');
    const original = globalThis.crypto.subtle.generateKey;
    const spy = vi.spyOn(globalThis.crypto.subtle, 'generateKey').mockRejectedValueOnce(new Error('crypto offline'));
    const r = await api.selfTest();
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('crypto offline');
    spy.mockRestore();
    expect(globalThis.crypto.subtle.generateKey).toBe(original);
  });

  it('selfTest detect roundtrip-mismatch (decrypt incorrect)', async () => {
    const r = await api.selfTest({ decryptMessage: async () => 'autre message' });
    expect(r).toEqual({ ok: false, reason: 'roundtrip-mismatch' });
  });

  it('selfTest detect pin-wrap-mismatch (unwrap incorrect)', async () => {
    const r = await api.selfTest({ unwrapWithPin: async () => ({ key: 'wrong' }) });
    expect(r).toEqual({ ok: false, reason: 'pin-wrap-mismatch' });
  });

  it('selfTest detect fingerprint-not-symmetric', async () => {
    let n = 0;
    const r = await api.selfTest({
      computeFingerprint: async () => (++n === 1 ? 'aaaaa bbbbb ccccc ddddd eeeee fffff' : 'differs'),
    });
    expect(r).toEqual({ ok: false, reason: 'fingerprint-not-symmetric' });
  });
});

describe('ApexCrypto — decryptForConv success path', () => {
  it('Alice encrypt + Bob decrypt via session côté Bob (roundtrip via decryptForConv)', async () => {
    const alice = await api.generateIdentityKeys();
    const bob = await api.generateIdentityKeys();
    const convA = 'conv-A-' + Math.random();
    const convB = 'conv-B-' + Math.random();

    await api.establishSession(convA, alice.privateKey, bob.publicKey);
    await api.establishSession(convB, bob.privateKey, alice.publicKey);

    const ct = await api.encryptForConv(convA, 'Coucou Bob');
    const pt = await api.decryptForConv(convB, ct);
    expect(pt).toBe('Coucou Bob');
  });
});
