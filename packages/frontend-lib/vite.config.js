import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'node:path';

// Two entries: the catalogue (the system as it stands) and the exploration
// (seven directions side by side, for choosing one).
export default defineConfig({
  plugins: [svelte()],
  server: { port: 5180 },
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        explore: resolve(process.cwd(), 'explore.html')
      }
    }
  }
});
