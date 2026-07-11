import baseConfig from './vite.config.js';

export default async function previewConfig(env) {
  const config = typeof baseConfig === 'function' ? await baseConfig(env) : baseConfig;
  return {
    ...config,
    cacheDir: '.vite-preview-cache',
    optimizeDeps: {
      ...(config.optimizeDeps || {}),
      entries: ['index.html'],
    },
  };
}
