/* Tests Phase 1 modules extraits (ES6 module loadability + API surface) */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const MODULES_DIR = path.join(__dirname, '..', 'apex-ai', 'modules');
const modules = ['ax-quiet-mode.js', 'ax-cors-proxy.js', 'ax-listeners.js', 'ax-storage-cleanup.js'];

let pass = 0, fail = 0;

function test(name, fn){
  try{ fn(); console.log("ok    " + name); pass++; }
  catch(e){ console.log("FAIL  " + name + " - " + e.message); fail++; }
}

console.log("\n=== Tests Phase 1 modules extraits ===\n");

modules.forEach(function(modName){
  const fullPath = path.join(MODULES_DIR, modName);
  test(modName + " : fichier existe", function(){
    if(!fs.existsSync(fullPath)) throw new Error("File missing");
  });
  test(modName + " : syntaxe valide", function(){
    const src = fs.readFileSync(fullPath, 'utf-8');
    new vm.Script(src);
  });
  test(modName + " : IIFE + ES6 export pattern", function(){
    const src = fs.readFileSync(fullPath, 'utf-8');
    if(src.indexOf("(function(global)") < 0) throw new Error("Missing IIFE");
    if(src.indexOf("module.exports") < 0) throw new Error("Missing ES6 export");
  });
  test(modName + " : guard re-load (_axXxxLoaded)", function(){
    const src = fs.readFileSync(fullPath, 'utf-8');
    if(src.indexOf("Loaded") < 0) throw new Error("Missing reload guard");
  });
});

/* Module-specific tests */
test("ax-quiet-mode : helpers exposed", function(){
  const src = fs.readFileSync(path.join(MODULES_DIR, 'ax-quiet-mode.js'), 'utf-8');
  if(src.indexOf("_axIsQuietMode") < 0) throw new Error("Missing _axIsQuietMode");
  if(src.indexOf("axToggleQuietMode") < 0) throw new Error("Missing axToggleQuietMode");
});

test("ax-cors-proxy : 10 APIs blocked listed", function(){
  const src = fs.readFileSync(path.join(MODULES_DIR, 'ax-cors-proxy.js'), 'utf-8');
  ["ax_perplexity_key","ax_grok_key","ax_xai_key","ax_deepseek_key","ax_replicate_key",
   "ax_huggingface_key","ax_cohere_key","ax_github_token","ax_elevenlabs_key","ax_finnhub_key"].forEach(function(k){
    if(src.indexOf(k) < 0) throw new Error("Missing CORS-blocked key: "+k);
  });
});

test("ax-listeners : interceptor + cleanup helpers", function(){
  const src = fs.readFileSync(path.join(MODULES_DIR, 'ax-listeners.js'), 'utf-8');
  if(src.indexOf("axCleanupAllOrphanListeners") < 0) throw new Error("Missing axCleanupAllOrphanListeners");
  if(src.indexOf("axCleanupOrphanModalListeners") < 0) throw new Error("Missing axCleanupOrphanModalListeners");
  if(src.indexOf("axListenersHealth") < 0) throw new Error("Missing axListenersHealth");
});

test("ax-storage-cleanup : report + emergency", function(){
  const src = fs.readFileSync(path.join(MODULES_DIR, 'ax-storage-cleanup.js'), 'utf-8');
  if(src.indexOf("axStorageReport") < 0) throw new Error("Missing axStorageReport");
  if(src.indexOf("axStorageEmergencyCleanup") < 0) throw new Error("Missing axStorageEmergencyCleanup");
});

console.log("\n=== Resultats ===");
console.log("Total: " + (pass+fail) + " | OK: " + pass + " | FAIL: " + fail);
if(fail > 0) process.exit(1);
