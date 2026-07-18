import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const indexPath = resolve(process.cwd(), 'dist', 'index.html');

if (!existsSync(indexPath)) {
  console.error('\n[Spicey build] dist/index.html mungon.');
  console.error('[Spicey build] Ekzekuto nga root folder i projektit dhe perdor: npm run build:ios\n');
  process.exit(1);
}

console.log('[Spicey build] OK: dist/index.html u krijua.');
