// sw.js dagi oldindan keshlanadigan fayllar ro'yxati va kesh versiyasini yangilaydi.
// Har kod o'zgarishidan keyin ishga tushiring: node tools/build-sw.mjs
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const root = new URL('..', import.meta.url).pathname;
export async function listAppFiles() {
  const out = ['index.html', 'manifest.webmanifest'];
  async function walk(dir) {
    for (const e of await readdir(join(root, dir), { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else if (/\.(js|png)$/.test(e.name)) out.push(p.split('\\').join('/'));
    }
  }
  await walk('src');
  await walk('icons');
  return out.sort();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = await listAppFiles();
  const h = createHash('sha256');
  for (const f of files) h.update(f).update(await readFile(join(root, f)));
  const version = h.digest('hex').slice(0, 10);
  const tpl = await readFile(join(root, 'sw.js'), 'utf8');
  const next = tpl
    .replace(/const VERSION = '[^']*';/, `const VERSION = '${version}';`)
    .replace(/const FILES = \[[\s\S]*?\];/, `const FILES = [\n${files.map((f) => `  './${f}',`).join('\n')}\n];`);
  await writeFile(join(root, 'sw.js'), next);
  console.log('sw.js:', files.length, 'fayl, versiya', version);
}
