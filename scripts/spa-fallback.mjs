// GitHub Pages не умеет отдавать index.html для клиентских маршрутов (/commissions и т.п.),
// поэтому после сборки создаём 404.html — копию index.html. Pages покажет её с кодом 404,
// но Vue Router подхватит путь и отрисует нужную страницу.
import {copyFileSync, existsSync} from 'node:fs';
import {resolve} from 'node:path';

const distDir = resolve(process.cwd(), 'dist');
const indexFile = resolve(distDir, 'index.html');
const fallbackFile = resolve(distDir, '404.html');

if (!existsSync(indexFile)) {
  console.error('[spa-fallback] dist/index.html not found — run "vite build" first');
  process.exit(1);
}

copyFileSync(indexFile, fallbackFile);
console.log('[spa-fallback] created dist/404.html');
