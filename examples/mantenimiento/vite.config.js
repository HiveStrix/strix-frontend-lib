import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte()
  ],
  // La librería entra por `file:` y npm la enlaza. Sin esto, Vite intenta
  // pre-empaquetarla como una dependencia normal y se topa con archivos .svelte
  // que no sabe leer en esa etapa.
  optimizeDeps: { exclude: ['@strix/frontend-lib'] },
  server: { port: 5200 }
});
