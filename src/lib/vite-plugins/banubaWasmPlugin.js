/**
 * Vite plugin to ensure Banuba WASM files are served with correct MIME types
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function banubaWasmPlugin() {
  return {
    name: 'banuba-wasm-plugin',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.includes('/banuba/') && req.url.endsWith('.wasm')) {
          res.setHeader('Content-Type', 'application/wasm');
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        }
        next();
      });
    },
    buildStart() {
      // Ensure Banuba assets are available
      const banubaSrc = path.join(__dirname, '../../public', 'banuba');
      if (fs.existsSync(banubaSrc)) {
        const files = fs.readdirSync(banubaSrc);
        console.log('🎭 Banuba assets found:', files.join(', '));
      } else {
        console.warn('⚠️ Banuba assets folder not found at:', banubaSrc);
      }
    }
  };
}