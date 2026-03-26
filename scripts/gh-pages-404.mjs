import { copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const indexHtml = join(dist, 'index.html');
const notFoundHtml = join(dist, '404.html');

if (!existsSync(indexHtml)) {
  console.error('gh-pages-404: dist/index.html missing — run vite build first.');
  process.exit(1);
}

copyFileSync(indexHtml, notFoundHtml);
console.log('gh-pages-404: copied dist/index.html -> dist/404.html (SPA fallback for GitHub Pages).');
