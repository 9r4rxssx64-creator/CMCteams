import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, '../index.html');
async function main(){
  const b = await chromium.launch({ headless:true });
  const p = await (await b.newContext()).newPage();
  await p.goto('file://'+INDEX_PATH,{waitUntil:'domcontentloaded',timeout:30000});
  await p.waitForFunction(() => Array.isArray(window.A.employees),{ timeout: 20000 });
  const out = await p.evaluate(() => {
    const targets = ['GAZAGNE F','BONO F','PORTA A','GATTI B','PUGNETTI S','LANDAU B','SOSSO G','COSTE W','TESTA G','COURTIN F','MOREL F','VIGNA M','EHRET G','CERETTI R','MIRANDA T'];
    return targets.map(n => {
      const e = window.A.employees.find(x => x.name === n);
      return e ? { name:e.name, family:e.family||'?', chef:!!e.chef, post:e.post||'?' } : { name:n, NOT_FOUND:true };
    });
  });
  out.forEach(o => console.log(JSON.stringify(o)));
  await b.close();
}
main().catch(e => { console.error('FATAL:', e.stack); process.exit(2); });
