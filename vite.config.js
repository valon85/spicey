import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, URL } from 'node:url';

function localApiPlugin() {
  return {
    name: 'spicey-local-api',
    configureServer(server) {
      server.middlewares.use('/api/subscriptions/admin/', async (req, res) => {
        try {
          req.url = req.originalUrl || req.url;
          const mod = await import('./server/api-routes/subscriptions/admin/[subscriptionId].js');
          await mod.default(req, res);
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: error.message || 'Local subscription update failed' }));
        }
      });

      const routes = {
        '/api/auth/login': () => import('./server/api-routes/auth/login.js'),
        '/api/auth/signup': () => import('./server/api-routes/auth/signup.js'),
        '/api/auth/forgot-password': () => import('./server/api-routes/auth/forgot-password.js'),
        '/api/auth/update-password': () => import('./server/api-routes/auth/update-password.js'),
        '/api/auth/me': () => import('./server/api-routes/auth/me.js'),
        '/api/openai/realtime-session': () => import('./server/api-routes/openai/realtime-session.js'),
        '/api/openai/voice-chat': () => import('./server/api-routes/openai/voice-chat.js'),
        '/api/openai/text': () => import('./server/api-routes/openai/text.js'),
        '/api/openai/image-edit': () => import('./server/api-routes/openai/image-edit.js'),
        '/api/openai/image': () => import('./server/api-routes/openai/image.js'),
        '/api/openai/video': () => import('./server/api-routes/openai/video.js'),
        '/api/youtube/reels': () => import('./server/api-routes/youtube/reels.js'),
        '/api/subscriptions/status': () => import('./server/api-routes/subscriptions/status.js'),
        '/api/subscriptions/gift': () => import('./server/api-routes/subscriptions/gift/index.js'),
        '/api/subscriptions/admin': () => import('./server/api-routes/subscriptions/admin/index.js'),
        '/api/admin/deploy': () => import('./server/api-routes/admin/deploy.js'),
        '/api/admin/mobile-artifacts/download': () => import('./server/api-routes/admin/mobile-artifacts/download.js'),
        '/api/admin/mobile-artifacts': () => import('./server/api-routes/admin/mobile-artifacts.js'),
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
  const reactPath = fileURLToPath(new URL('./node_modules/react', import.meta.url));
  const reactDomPath = fileURLToPath(new URL('./node_modules/react-dom', import.meta.url));

  return {
    base: '/',
    logLevel: 'error',
    resolve: {
      dedupe: ['react', 'react-dom', 'react-router-dom'],
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        react: reactPath,
        'react-dom': reactDomPath,
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    },
    server: {
      hmr: false,
    },
    plugins: [
      react(),
      localApiPlugin(),
    ],
  };
});
