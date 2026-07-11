import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, URL } from 'node:url';

function localApiPlugin() {
  return {
    name: 'spicey-local-api',
    configureServer(server) {
      const routes = {
        '/api/auth/login': () => import('./api/auth/login.js'),
        '/api/auth/signup': () => import('./api/auth/signup.js'),
        '/api/auth/forgot-password': () => import('./api/auth/forgot-password.js'),
        '/api/auth/update-password': () => import('./api/auth/update-password.js'),
        '/api/auth/me': () => import('./api/auth/me.js'),
        '/api/openai/realtime-session': () => import('./api/openai/realtime-session.js'),
        '/api/openai/voice-chat': () => import('./api/openai/voice-chat.js'),
        '/api/openai/text': () => import('./api/openai/text.js'),
        '/api/openai/image-edit': () => import('./api/openai/image-edit.js'),
        '/api/openai/image': () => import('./api/openai/image.js'),
        '/api/admin/deploy': () => import('./api/admin/deploy.js'),
      };

      Object.entries(routes).forEach(([route, loadHandler]) => {
        server.middlewares.use(route, async (req, res) => {
          try {
            const mod = await loadHandler();
            await mod.default(req, res);
          } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message || 'Local API failed' }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
  base: '/',
  cacheDir: '.vite-cache',
  logLevel: 'error',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    localApiPlugin(),
  ],
  };
});
