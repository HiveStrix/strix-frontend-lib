import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Un solo entry: el catálogo. La exploración de dieciséis direcciones que
// vivía en explore.html ya cumplió su función — ver el historial de git.
export default defineConfig({
  plugins: [svelte()],
  server: { port: 5180 }
});
