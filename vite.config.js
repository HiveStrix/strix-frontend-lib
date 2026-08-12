import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { buildNovelties } from './scripts/novelties.mjs';

// Un solo entry: el catálogo. La exploración de dieciséis direcciones que
// vivía en explore.html ya cumplió su función — ver el historial de git.

// «Lo último que entró», como módulo virtual — no como archivo generado que
// alguien tiene que acordarse de correr. `buildNovelties()` lee el propio
// historial de git (ver scripts/novelties.mjs); acá sólo se lo envuelve en
// un módulo que App.svelte puede importar como cualquier otro. Se calcula
// una sola vez por proceso: el dev server no re-lee git en cada HMR, y un
// build de producción es exactamente una foto de «lo último» al momento de
// buildear, que es lo que tiene sentido para algo que se llama así.
const NOVELTIES_ID = 'virtual:sx-novelties';
const RESOLVED_NOVELTIES_ID = '\0' + NOVELTIES_ID;

function noveltiesPlugin() {
  let cached;
  return {
    name: 'sx-novelties',
    resolveId(id) {
      if (id === NOVELTIES_ID) return RESOLVED_NOVELTIES_ID;
    },
    load(id) {
      if (id !== RESOLVED_NOVELTIES_ID) return;
      if (!cached) cached = buildNovelties();
      return `export const novelties = ${JSON.stringify(cached)};\n`;
    }
  };
}

export default defineConfig({
  plugins: [svelte(), noveltiesPlugin()],
  server: { port: 5180 }
});
