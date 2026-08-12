// Generates tokens.css from tokens.js, so the two shapes cannot drift.
import { writeFileSync } from 'node:fs';
import { stylesheet } from '../src/lib/tokens.js';

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
