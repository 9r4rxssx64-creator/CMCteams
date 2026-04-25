#!/usr/bin/env node
/**
 * Tests Apex modules (v12.252+) — 20+ cas critiques
 *
 * Charge le JS extrait de apex-ai/index.html dans un sandbox vm avec
 * mocks browser (localStorage, window, document, crypto, fetch, navigator)
 * et execute les fonctions critiques.
 *
 * Usage: node tests/apex-modules.test.js
 * Exit code: 0 = OK / 1 = FAIL
 */

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

// ---------------- Mocks browser ----------------

const _localStorageBackend = Object.create(null);
const localStorage = {
  getItem: function (k) {
    return Object.prototype.hasOwnProperty.call(_localStorageBackend, k) ? _localStorageBackend[k] : null;
  },
  setItem: function (k, v) {
    _localStorageBackend[k] = String(v);
  },
  removeItem: function (k) {
    delete _localStorageBackend[k];
  },
  clear: function () {
    for (const k in _localStorageBackend) delete _localStorageBackend[k];
  }
};

// hasOwnProperty + iteration support (used by _axCompressAll)
Object.defineProperty(localStorage, "hasOwnProperty", {
  value: function (k) {
    return Object.prototype.hasOwnProperty.call(_localStorageBackend, k);
  },
  enumerable: false
});

const cryptoMock = {
  getRandomValues: function (arr) {
    for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
    return arr;
  }
};

function mkEl() {
  const el = {
    style: {},
    classList: {
      add: function () {},
      remove: function () {},
      contains: function () {
        return false;
      },
      toggle: function () {}
    },
    children: [],
    childNodes: [],
    appendChild: function (c) {
      this.children.push(c);
      return c;
    },
    removeChild: function () {},
    addEventListener: function () {},
    removeEventListener: function () {},
    setAttribute: function () {},
    getAttribute: function () {
      return null;
    },
    querySelector: function () {
      return null;
    },
    querySelectorAll: function () {
      return [];
    },
    getBoundingClientRect: function () {
      return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };
    },
    focus: function () {},
    blur: function () {},
    click: function () {},
    remove: function () {},
    innerHTML: "",
    textContent: "",
    value: ""
  };
  return el;
}

const documentMock = {
  body: mkEl(),
  documentElement: mkEl(),
  head: mkEl(),
  createElement: function () {
    return mkEl();
  },
  createTextNode: function (t) {
    return { textContent: t };
  },
  getElementById: function () {
    return null;
  },
  querySelector: function () {
    return null;
  },
  querySelectorAll: function () {
    return [];
  },
  addEventListener: function () {},
  removeEventListener: function () {},
  cookie: ""
};

const navigatorMock = {
  userAgent: "node-test",
  language: "fr-FR",
  languages: ["fr-FR", "fr"],
  onLine: true,
  clipboard: {
    writeText: function () {
      return Promise.resolve();
    }
  },
  permissions: {
    query: function () {
      return Promise.resolve({ state: "prompt" });
    }
  },
  vibrate: function () {}
};

const windowMock = {
  location: { href: "https://test.local/", hostname: "test.local", protocol: "https:", origin: "https://test.local", pathname: "/" },
  innerWidth: 375,
  innerHeight: 812,
  devicePixelRatio: 2,
  matchMedia: function () {
    return { matches: false, addEventListener: function () {}, removeEventListener: function () {} };
  },
  addEventListener: function () {},
  removeEventListener: function () {},
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  requestAnimationFrame: function (cb) {
    return setTimeout(cb, 16);
  },
  cancelAnimationFrame: function (id) {
    return clearTimeout(id);
  },
  localStorage: localStorage,
  sessionStorage: localStorage,
  crypto: cryptoMock,
  fetch: function () {
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}), text: () => Promise.resolve("") });
  },
  AbortController: class {
    constructor() {
      this.signal = { aborted: false };
    }
    abort() {
      this.signal.aborted = true;
    }
  },
  Notification: undefined,
  speechSynthesis: undefined,
  navigator: navigatorMock,
  document: documentMock,
  console: console,
  btoa: function (s) {
    return Buffer.from(s, "binary").toString("base64");
  },
  atob: function (s) {
    return Buffer.from(s, "base64").toString("binary");
  }
};

windowMock.window = windowMock;

// ---------------- Charge le JS Apex ----------------

const apexHtmlPath = path.join(__dirname, "..", "apex-ai", "index.html");
if (!fs.existsSync(apexHtmlPath)) {
  console.error("FAIL: apex-ai/index.html introuvable a", apexHtmlPath);
  process.exit(1);
}

const html = fs.readFileSync(apexHtmlPath, "utf8");
const lastScriptStart = html.lastIndexOf("<script>");
const lastScriptEnd = html.lastIndexOf("</script>");
if (lastScriptStart < 0 || lastScriptEnd < 0) {
  console.error("FAIL: pas de bloc <script> trouve dans apex-ai/index.html");
  process.exit(1);
}
const apexJs = html.slice(lastScriptStart + "<script>".length, lastScriptEnd);

// Sandbox global
const sandbox = Object.assign({}, windowMock, {
  localStorage: localStorage,
  document: documentMock,
  navigator: navigatorMock,
  crypto: cryptoMock,
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  Promise: Promise,
  Date: Date,
  Math: Math,
  JSON: JSON,
  Object: Object,
  Array: Array,
  String: String,
  Number: Number,
  Boolean: Boolean,
  Error: Error,
  RegExp: RegExp,
  Buffer: Buffer,
  process: { env: {} },
  btoa: windowMock.btoa,
  atob: windowMock.atob,
  fetch: windowMock.fetch,
  AbortController: windowMock.AbortController,
  Uint8Array: Uint8Array,
  Map: Map,
  Set: Set,
  WeakMap: WeakMap,
  WeakSet: WeakSet
});
sandbox.globalThis = sandbox;
sandbox.self = sandbox;
sandbox.window = sandbox;

// Catch all top-level errors during script load (dont fail tests if some
// init code expects browser-only APIs we havent mocked)
let loadWarn = 0;
try {
  vm.createContext(sandbox);
  vm.runInContext(apexJs, sandbox, { filename: "apex-ai/index.html (extracted)", timeout: 10000 });
} catch (e) {
  loadWarn++;
  console.warn("[load-warn]", e.message ? e.message.slice(0, 200) : e);
}

// ---------------- Test runner ----------------

const results = [];
function test(name, fn) {
  try {
    const r = fn();
    if (r === false) {
      results.push({ name, ok: false, err: "returned false" });
      console.log("FAIL  " + name);
    } else {
      results.push({ name, ok: true });
      console.log("ok    " + name);
    }
  } catch (e) {
    results.push({ name, ok: false, err: e.message });
    console.log("FAIL  " + name + " - " + e.message);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || "assertion failed");
}

const fnExists = (n) => typeof sandbox[n] === "function";

// ---------------- 20+ tests ----------------

console.log("\n=== Apex Modules Test Suite (v12.252+) ===\n");

test("axCalcBMI(70, 1.75) renvoie ~22.9", () => {
  if (!fnExists("axCalcBMI")) throw new Error("axCalcBMI manquante");
  const r = sandbox.axCalcBMI(70, 1.75);
  assert(r && typeof r === "object", "result should be object");
  assert(Math.abs(r.bmi - 22.9) < 0.05, "bmi=" + r.bmi);
  assert(typeof r.categorie === "string", "categorie should be string");
});

test("axCalcBMI(0,0) renvoie null (validation entrees)", () => {
  if (!fnExists("axCalcBMI")) throw new Error("axCalcBMI manquante");
  const r = sandbox.axCalcBMI(0, 0);
  assert(r === null, "expected null, got " + JSON.stringify(r));
});

test("axCalcBMI(120, 1.70) categorie obesite", () => {
  if (!fnExists("axCalcBMI")) throw new Error("axCalcBMI manquante");
  const r = sandbox.axCalcBMI(120, 1.7);
  assert(r && r.bmi > 30, "bmi should be >30, got " + (r && r.bmi));
});

test("axMedicalLookup(\"doliprane\") retourne objet OTC valide", () => {
  if (!fnExists("axMedicalLookup")) throw new Error("axMedicalLookup manquante");
  const r = sandbox.axMedicalLookup("doliprane");
  assert(r && typeof r === "object", "result should be object");
  assert(typeof r.dci === "string" && r.dci.length > 0, "dci missing");
  assert(typeof r.posologie === "string", "posologie missing");
});

test("axMedicalLookup(\"medicament_inconnu\") fallback Vidal", () => {
  if (!fnExists("axMedicalLookup")) throw new Error("axMedicalLookup manquante");
  const r = sandbox.axMedicalLookup("zzzzz_unknown_med");
  assert(r && typeof r === "object", "result should be object");
  assert(typeof r.vidal_url === "string" && r.vidal_url.indexOf("vidal.fr") >= 0, "vidal_url missing");
});

test("axCuisineSearch(\"ratatouille\") retourne au moins 1 result", () => {
  if (!fnExists("axCuisineSearch")) throw new Error("axCuisineSearch manquante");
  const r = sandbox.axCuisineSearch("ratatouille");
  assert(Array.isArray(r), "result should be array");
  assert(r.length >= 1, "should find at least 1 recette, got " + r.length);
  assert(r[0].nom.toLowerCase().indexOf("ratatouille") >= 0, "first hit name=" + r[0].nom);
});

test("axCuisineSearch(\"\") retourne tableau (pas crash)", () => {
  if (!fnExists("axCuisineSearch")) throw new Error("axCuisineSearch manquante");
  const r = sandbox.axCuisineSearch("");
  assert(Array.isArray(r), "result should be array even with empty query");
});

test("axCalcCalories([{nom:'pomme',grammes:100}]) > 0", () => {
  if (!fnExists("axCalcCalories")) throw new Error("axCalcCalories manquante");
  const r = sandbox.axCalcCalories([{ nom: "pomme", grammes: 100 }]);
  assert(r && typeof r === "object", "result should be object");
  assert(r.total_kcal > 0, "total_kcal should be > 0, got " + r.total_kcal);
  assert(Array.isArray(r.detail), "detail should be array");
});

test("axCalcCalories([]) retourne {total_kcal:0,detail:[]}", () => {
  if (!fnExists("axCalcCalories")) throw new Error("axCalcCalories manquante");
  const r = sandbox.axCalcCalories([]);
  assert(r && r.total_kcal === 0, "total_kcal should be 0, got " + (r && r.total_kcal));
  assert(Array.isArray(r.detail) && r.detail.length === 0, "detail should be empty array");
});

test("axCalcCalories(undefined) ne crashe pas", () => {
  if (!fnExists("axCalcCalories")) throw new Error("axCalcCalories manquante");
  const r = sandbox.axCalcCalories();
  assert(r && typeof r === "object", "should return object even if undefined");
});

test("axGetUserPin/axSetUserPin/axCheckUserPin round-trip OK", () => {
  if (!fnExists("axSetUserPin") || !fnExists("axGetUserPin") || !fnExists("axCheckUserPin")) {
    throw new Error("axSetUserPin/axGetUserPin/axCheckUserPin manquantes");
  }
  const uid = "test_user_" + Date.now();
  const pin = "9876";
  const setOk = sandbox.axSetUserPin(uid, pin);
  assert(setOk === true, "axSetUserPin should return true, got " + setOk);
  const stored = sandbox.axGetUserPin(uid);
  assert(stored && typeof stored === "string", "stored pin should be hash string");
  assert(sandbox.axCheckUserPin(uid, pin) === true, "axCheckUserPin should match");
  assert(sandbox.axCheckUserPin(uid, "0000") === false, "axCheckUserPin should reject wrong pin");
});

test("axGetUserPin sans uid retourne null (pas crash)", () => {
  if (!fnExists("axGetUserPin")) throw new Error("axGetUserPin manquante");
  const r = sandbox.axGetUserPin();
  assert(r === null, "should return null when no uid, got " + JSON.stringify(r));
});

test("axSetUserPin sans uid retourne false", () => {
  if (!fnExists("axSetUserPin")) throw new Error("axSetUserPin manquante");
  const r = sandbox.axSetUserPin(null, "1234");
  assert(r === false, "should return false when no uid, got " + JSON.stringify(r));
});

test("axApplyUserTheme(ADMIN_ID) ne crashe pas", () => {
  if (!fnExists("axApplyUserTheme")) throw new Error("axApplyUserTheme manquante");
  const adminId = sandbox.ADMIN_ID || "kdmc_admin";
  // Ne doit pas throw
  sandbox.axApplyUserTheme(adminId);
  assert(true, "no crash");
});

test("axApplyUserTheme(undefined) ne crashe pas", () => {
  if (!fnExists("axApplyUserTheme")) throw new Error("axApplyUserTheme manquante");
  // K is undefined or has no user — should silently bail
  sandbox.axApplyUserTheme();
  assert(true, "no crash");
});

test("_isFamilyUser sans user retourne false", () => {
  if (!fnExists("_isFamilyUser")) throw new Error("_isFamilyUser manquante");
  // Make sure K.user is null
  if (sandbox.K) sandbox.K.user = null;
  const r = sandbox._isFamilyUser();
  assert(r === false, "should return false when no user, got " + JSON.stringify(r));
});

test("_isFamilyUser avec admin retourne false", () => {
  if (!fnExists("_isFamilyUser")) throw new Error("_isFamilyUser manquante");
  const adminId = sandbox.ADMIN_ID || "kdmc_admin";
  if (sandbox.K) sandbox.K.user = { id: adminId, name: "Kevin DESARZENS" };
  const r = sandbox._isFamilyUser();
  assert(r === false, "admin should not be family, got " + JSON.stringify(r));
});

test("axDetectIntent(\"je veux faire une traduction\") trouve un studio", () => {
  if (!fnExists("axDetectIntent")) throw new Error("axDetectIntent manquante");
  const r = sandbox.axDetectIntent("je veux faire une traduction japonais");
  assert(r && typeof r === "object", "should return intent object");
  assert(r.studio === "traduction", "studio should be 'traduction', got " + (r && r.studio));
});

test("axDetectIntent(\"montage video\") trouve studio video", () => {
  if (!fnExists("axDetectIntent")) throw new Error("axDetectIntent manquante");
  const r = sandbox.axDetectIntent("je voudrais faire un montage video");
  assert(r && r.studio === "video", "studio should be 'video', got " + (r && r.studio));
});

test("axDetectIntent(\"\") retourne null", () => {
  if (!fnExists("axDetectIntent")) throw new Error("axDetectIntent manquante");
  const r = sandbox.axDetectIntent("");
  assert(r === null, "should return null on empty, got " + JSON.stringify(r));
});

test("axDetectIntent(\"texte sans intent reconnaissable\") retourne null", () => {
  if (!fnExists("axDetectIntent")) throw new Error("axDetectIntent manquante");
  const r = sandbox.axDetectIntent("zzzz qqqqq xxxxx");
  assert(r === null, "should return null on unrecognized, got " + JSON.stringify(r));
});

test("axCuisineConvert(\"1 cuillere a soupe\") retourne 15 ml", () => {
  if (!fnExists("axCuisineConvert")) throw new Error("axCuisineConvert manquante");
  const r = sandbox.axCuisineConvert("1 cuillere a soupe");
  assert(r && r.equivalent && r.equivalent.indexOf("15") >= 0, "should contain 15, got " + JSON.stringify(r));
});

test("ADMIN_ID est defini et non-vide", () => {
  assert(typeof sandbox.ADMIN_ID === "string" && sandbox.ADMIN_ID.length > 0, "ADMIN_ID missing or empty: " + sandbox.ADMIN_ID);
});

test("APP_VER est defini", () => {
  assert(typeof sandbox.APP_VER === "string" && sandbox.APP_VER.length > 0, "APP_VER missing or empty");
});

test("AX_MEDICAL_FR contient otc.doliprane", () => {
  assert(sandbox.AX_MEDICAL_FR && sandbox.AX_MEDICAL_FR.otc && sandbox.AX_MEDICAL_FR.otc.doliprane, "AX_MEDICAL_FR.otc.doliprane missing");
});

test("AX_CUISINE.recettes contient au moins 5 recettes", () => {
  assert(sandbox.AX_CUISINE && Array.isArray(sandbox.AX_CUISINE.recettes), "AX_CUISINE.recettes missing");
  assert(sandbox.AX_CUISINE.recettes.length >= 5, "expected >=5 recettes, got " + sandbox.AX_CUISINE.recettes.length);
});

// ---------------- Bilan ----------------

const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok).length;
const total = results.length;

console.log("\n=== Resultats ===");
console.log(`Total: ${total} | OK: ${passed} | FAIL: ${failed} | Load warns: ${loadWarn}`);

if (failed > 0) {
  console.log("\nEchecs:");
  results.filter((r) => !r.ok).forEach((r) => console.log("  - " + r.name + " : " + r.err));
}

process.exit(failed > 0 ? 1 : 0);
