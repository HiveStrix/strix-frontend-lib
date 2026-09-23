// Generates tokens.css from tokens.js, so the two shapes cannot drift.
import { writeFileSync } from 'node:fs';
import { stylesheet, TOKENS, TOKENS_DARK } from '../src/lib/tokens.js';

// LA TRAMPA DEL ALIAS. Un `var()` dentro de una custom property se resuelve
// donde se DECLARA: un alias en `:root` que apunta a un token que el oscuro
// re-liga (`--sx-nest-bg: var(--sx-sunk)`) llega ya resuelto CLARO a todo
// subárbol `.sx-dark`. Pasó con --sx-field, y volvió a pasar con siete alias de
// la variante. Si un alias apunta a un token que TOKENS_DARK cambia, tiene que
// estar re-declarado ahí; si no, no se genera nada.
const trap = Object.entries(TOKENS)
  .filter(([k, v]) => !(k in TOKENS_DARK))
  .filter(([, v]) => [...String(v).matchAll(/var\((--sx-[\w-]+)/g)].some(([, ref]) => ref in TOKENS_DARK));
if (trap.length) {
  console.error('Alias sin re-declarar en TOKENS_DARK (en un .sx-dark quedarían claros):');
  for (const [k, v] of trap) console.error(`  ${k}: ${v}`);
  process.exit(1);
}

const header = `/* ============================================================================
   Strix — tokens
   GENERATED FROM src/lib/tokens.js — do not edit by hand.
   Run \`npm run tokens\` after changing the source.

   For a SvelteKit app: import this file once, at the root.
   For a Core module in a shadow root: import { hostTokens } from the library
   and inline the result in the root component's own <style>, because a linked
   stylesheet does not cross a shadow boundary and a strict CSP forbids the
   @import that would.
   ========================================================================= */\n\n`;

writeFileSync(new URL('../src/lib/tokens.css', import.meta.url), header + stylesheet());
console.log('tokens.css regenerado');
