#!/usr/bin/env node
/* ============================================================================
 * decrypt.js — Déchiffre les captures planning chiffrées par l'app (côté Claude).
 *
 * Les plannings importés dans tools/planning-parser-tester sont chiffrés
 * (AES-GCM-256 / PBKDF2 200k SHA-256) sur l'appareil de Kevin, puis déposés
 * sur la branche `planning-captures` (jamais publiée). Le dépôt public ne
 * contient que du chiffré illisible. Ce script déchiffre avec la phrase secrète.
 *
 * USAGE (côté Claude Code) :
 *   git fetch origin planning-captures
 *   git checkout origin/planning-captures -- tools/planning-parser-tester/captures
 *   CAP_PASS="la-phrase-secrete-de-kevin" node tools/planning-parser-tester/captures/decrypt.js
 *   # -> écrit _decrypted/<name>.json (+ <name>.pdf) puis affiche un résumé
 *
 * AUTO-TEST (vérifie l'algo, aucune phrase requise) :
 *   node tools/planning-parser-tester/captures/decrypt.js --selftest
 *
 * Algo IDENTIQUE à l'app (index.html, module CAPTURE) :
 *   - PBKDF2(passphrase, salt 16o, 200000, SHA-256) -> clé AES-GCM 256
 *   - IV 12 octets, ciphertext = AES-GCM (tag inclus)
 *   - enveloppe JSON { v, alg, salt(b64), iv(b64), ct(b64), ts, meta }
 * ============================================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { webcrypto } = require("crypto");
const subtle = webcrypto.subtle;
const enc = new TextEncoder();
const dec = new TextDecoder();

function b642ab(b64) { return Uint8Array.from(Buffer.from(b64, "base64")); }
function ab2b64(buf) {
  return Buffer.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf)).toString("base64");
}

async function deriveKey(passphrase, salt) {
  const base = await subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 200000, hash: "SHA-256" },
    base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
  );
}
async function encryptEnvelope(plainObj, passphrase, meta) {
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const ct = await subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(plainObj)));
  return { v: 1, alg: "PBKDF2-200000-SHA256/AES-GCM-256",
    salt: ab2b64(salt), iv: ab2b64(iv), ct: ab2b64(ct), ts: Date.now(), meta: meta || {} };
}
async function decryptEnvelope(env, passphrase) {
  const salt = b642ab(env.salt), iv = b642ab(env.iv), ct = b642ab(env.ct);
  const key = await deriveKey(passphrase, salt);
  const pt = await subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return JSON.parse(dec.decode(pt));
}

(async () => {
  if (process.argv.includes("--selftest")) {
    const sample = { hello: "world", names: ["SANNA O", "LORENZI Y"], n: 42, accents: "été à Monaco" };
    const env = await encryptEnvelope(sample, "phrase-de-test-123", { month: 5, year: 2026 });
    const back = await decryptEnvelope(env, "phrase-de-test-123");
    const roundtripOk = JSON.stringify(back) === JSON.stringify(sample);
    let wrongRejected = false;
    try { await decryptEnvelope(env, "mauvaise-phrase"); } catch (_) { wrongRejected = true; }
    if (roundtripOk && wrongRejected) {
      console.log("✅ SELFTEST OK — roundtrip identique + mauvaise phrase rejetée (AES-GCM/PBKDF2 200k).");
      process.exit(0);
    }
    console.error(`❌ SELFTEST FAIL — roundtrip=${roundtripOk} wrongRejected=${wrongRejected}`);
    process.exit(1);
  }

  const pass = process.env.CAP_PASS;
  if (!pass) {
    console.error('CAP_PASS manquant. Usage : CAP_PASS="phrase secrète" node decrypt.js [dossier]');
    process.exit(2);
  }
  const dir = process.argv[2] || __dirname;
  const out = path.join(__dirname, "_decrypted");
  fs.mkdirSync(out, { recursive: true });
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".enc.json"));
  if (!files.length) { console.log("Aucune capture .enc.json dans " + dir); return; }

  let okN = 0;
  for (const f of files) {
    try {
      const env = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      const plain = await decryptEnvelope(env, pass);
      const base = f.replace(/\.enc\.json$/, "");
      fs.writeFileSync(path.join(out, base + ".json"), JSON.stringify(plain, null, 2));
      let pdfNote = "";
      if (plain.pdf_base64) {
        fs.writeFileSync(path.join(out, base + ".pdf"), Buffer.from(plain.pdf_base64, "base64"));
        pdfNote = " (+ .pdf)";
      }
      console.log(`✅ ${f}${pdfNote} · ${plain.filename || "?"} · ${(plain.rawText || "").length} car. texte`);
      okN++;
    } catch (e) {
      console.error(`❌ ${f} : ${e.message} — mauvaise phrase ou fichier corrompu ?`);
    }
  }
  console.log(`\n${okN}/${files.length} captures déchiffrées dans ${path.relative(process.cwd(), out)}/`);
})();
