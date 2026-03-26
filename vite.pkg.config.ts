import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte()],
  build: {
    lib: {
      entry: 'dist/index.js',
      name: 'armoria',
      formats: ['es']
    },
    rollupOptions: {
      external: ['$app/server']
    }
  }
});
