/**
 * Apex Chat — Crypto E2E (ESM module)
 *
 * Module ESM pur, importable en Node (tests vitest) ou en browser
 * (build step ou bundler). Source de vérité unique pour la crypto.
 *
 * Le wrapper `crypto.js` à la racine continue d'exposer `window.ApexCrypto`
 * pour compatibilité <script defer> ; il importe ce module ou en duplique
 * le code (sync via tools/sync-crypto.mjs).
 *
 * Chiffrement :
 *   - ECDH P-256 → derive shared secret
 *   - HKDF SHA-256 → stretch
 *   - AES-GCM 256 → encrypt messages (IV 12 bytes random, auth tag inclus)
 *   - PBKDF2 SHA-256 100k iterations → derive key from PIN
 *
 * Le serveur ne déchiffre RIEN — seul le client possède les clés privées.
 */

'use strict';

const enc = new TextEncoder();
const dec = new TextDecoder();

// ----------------------------------------------------------------------------
//  Helpers
// ----------------------------------------------------------------------------

export function bufToB64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

export function b64ToBuf(b64) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr.buffer;
}

export function bufToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function randomBytes(len) {
  return crypto.getRandomValues(new Uint8Array(len));
}

// ----------------------------------------------------------------------------
//  Identity keys (ECDH P-256)
// ----------------------------------------------------------------------------

export async function generateIdentityKeys() {
  // Paire ECDH extractable pour stockage chiffré (Phase 2b → non-extract via wrap JWK)
  return crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey', 'deriveBits'],
  );
}

export async function exportPublicKey(publicKey) {
  const jwk = await crypto.subtle.exportKey('jwk', publicKey);
  return btoa(JSON.stringify(jwk));
}

export async function importPublicKey(jwkB64) {
  const jwk = JSON.parse(atob(jwkB64));
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    [],
  );
}

export async function exportPrivateKey(privateKey) {
  const jwk = await crypto.subtle.exportKey('jwk', privateKey);
  return btoa(JSON.stringify(jwk));
}

export async function importPrivateKey(jwkB64) {
  const jwk = JSON.parse(atob(jwkB64));
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey', 'deriveBits'],
  );
}

// ----------------------------------------------------------------------------
//  ECDH derivation → AES-GCM 256 (HKDF SHA-256)
// ----------------------------------------------------------------------------

export async function deriveSharedKey(myPrivateKey, theirPublicKey) {
  const sharedBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: theirPublicKey },
    myPrivateKey,
    256,
  );

  const hkdfKey = await crypto.subtle.importKey(
    'raw',
    sharedBits,
    'HKDF',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: enc.encode('apex-chat-v1'),
      info: enc.encode('message-encryption'),
    },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

// ----------------------------------------------------------------------------
//  AES-GCM message encrypt / decrypt
// ----------------------------------------------------------------------------

export async function encryptMessage(plaintext, aesKey) {
  const iv = randomBytes(12);
  const data = enc.encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    data,
  );

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return bufToB64(combined);
}

export async function decryptMessage(ciphertextB64, aesKey) {
  const combined = new Uint8Array(b64ToBuf(ciphertextB64));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    ciphertext,
  );

  return dec.decode(plaintext);
}

// ----------------------------------------------------------------------------
//  PIN wrap (PBKDF2 100k → AES-GCM)
// ----------------------------------------------------------------------------

async function deriveKeyFromPin(pin, saltB64) {
  const salt = saltB64 ? new Uint8Array(b64ToBuf(saltB64)) : randomBytes(16);

  const pinKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  const aesKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    pinKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );

  return { aesKey, salt: bufToB64(salt) };
}

export async function wrapWithPin(payload, pin) {
  const { aesKey, salt } = await deriveKeyFromPin(pin);
  const ciphertext = await encryptMessage(JSON.stringify(payload), aesKey);
  return { ciphertext, salt };
}

export async function unwrapWithPin(ciphertext, salt, pin) {
  const { aesKey } = await deriveKeyFromPin(pin, salt);
  const plaintext = await decryptMessage(ciphertext, aesKey);
  return JSON.parse(plaintext);
}

// ----------------------------------------------------------------------------
//  Sessions par conversation (cache clé dérivée)
// ----------------------------------------------------------------------------

const sessionCache = new Map();

export async function establishSession(convId, myPrivateKey, theirPublicKey) {
  const aesKey = await deriveSharedKey(myPrivateKey, theirPublicKey);
  sessionCache.set(convId, aesKey);
  return aesKey;
}

export function getSessionKey(convId) {
  return sessionCache.get(convId);
}

export async function encryptForConv(convId, plaintext) {
  const aesKey = sessionCache.get(convId);
  if (!aesKey) throw new Error('Pas de session pour cette conversation');
  return encryptMessage(plaintext, aesKey);
}

export async function decryptForConv(convId, ciphertext) {
  const aesKey = sessionCache.get(convId);
  if (!aesKey) throw new Error('Pas de session pour cette conversation');
  return decryptMessage(ciphertext, aesKey);
}

// ----------------------------------------------------------------------------
//  Fingerprint (safety number — vérification visuelle)
// ----------------------------------------------------------------------------

export async function computeFingerprint(myPubKey, theirPubKey) {
  const myPubB64 = await exportPublicKey(myPubKey);
  const theirPubB64 = await exportPublicKey(theirPubKey);

  const combined = [myPubB64, theirPubB64].sort().join('|');
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(combined));
  const hex = bufToHex(hash);

  const short = hex.slice(0, 30);
  return short.match(/.{5}/g).join(' ');
}

// ----------------------------------------------------------------------------
//  Self-test
// ----------------------------------------------------------------------------

// Injection optionnelle (tests) pour couvrir 100% branches du selfTest défensif.
export async function selfTest(__deps = {}) {
  const _decrypt = __deps.decryptMessage || decryptMessage;
  const _unwrap = __deps.unwrapWithPin || unwrapWithPin;
  const _fp = __deps.computeFingerprint || computeFingerprint;
  try {
    const alice = await generateIdentityKeys();
    const bob = await generateIdentityKeys();

    const aliceShared = await deriveSharedKey(alice.privateKey, bob.publicKey);
    const bobShared = await deriveSharedKey(bob.privateKey, alice.publicKey);

    const msg = 'Salut Bob, message ultra-sécurisé 🛡';
    const ct = await encryptMessage(msg, aliceShared);
    const decrypted = await _decrypt(ct, bobShared);

    if (decrypted !== msg) return { ok: false, reason: 'roundtrip-mismatch' };

    const exported = await exportPrivateKey(alice.privateKey);
    const wrapped = await wrapWithPin({ key: exported }, '200807');
    const unwrapped = await _unwrap(wrapped.ciphertext, wrapped.salt, '200807');
    if (unwrapped.key !== exported) return { ok: false, reason: 'pin-wrap-mismatch' };

    const fp1 = await _fp(alice.publicKey, bob.publicKey);
    const fp2 = await _fp(bob.publicKey, alice.publicKey);
    if (fp1 !== fp2) return { ok: false, reason: 'fingerprint-not-symmetric' };

    return { ok: true, fingerprint: fp1, message_test: decrypted };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

// ----------------------------------------------------------------------------
//  Compat browser : expose window.ApexCrypto pour code legacy <script defer>
// ----------------------------------------------------------------------------

if (typeof window !== 'undefined') {
  window.ApexCrypto = {
    generateIdentityKeys,
    exportPublicKey,
    importPublicKey,
    exportPrivateKey,
    importPrivateKey,
    deriveSharedKey,
    establishSession,
    getSessionKey,
    encryptForConv,
    decryptForConv,
    encryptMessage,
    decryptMessage,
    wrapWithPin,
    unwrapWithPin,
    computeFingerprint,
    selfTest,
    randomBytes,
    bufToB64,
    b64ToBuf,
    bufToHex,
  };
}
