// Resuelve los tokens a color real y mide contraste. Sin dependencias.
//
// POR QUE EXISTE. Un token no es un color: es una referencia que se resuelve
// contra otros tokens. `--sx-edge` puede leerse razonable en el objeto y dar
// 1.13:1 en pantalla, que es exactamente lo que pasaba. Mirar el archivo no lo
// detecta; resolverlo si. Este script es la lección de la exploración hecha
// comprobable: cuatro intentos se perdieron por copiar el NOMBRE de un token en
// vez de su VALOR, y lo que lo atrapó fue resolver y comparar números.
import { TOKENS } from '../src/lib/tokens.js';

const hex = (h) => {
  const s = h.length === 4 ? h.slice(1).split('').map((c) => c + c).join('') : h.slice(1);
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};
const over = (fg, a, bg) => fg.map((c, i) => c * a + bg[i] * (1 - a));

/** Resuelve un valor de token a [r,g,b], componiendo lo translucido sobre `bg`. */
export function resolve(value, bg = [255, 255, 255], depth = 0) {
  if (depth > 12) throw new Error('referencia circular: ' + value);
  const v = String(value).trim();

  let m = v.match(/^var\(\s*(--sx-[\w-]+)\s*(?:,\s*([\s\S]+))?\)$/);
  if (m) {
    const t = TOKENS[m[1]];
    if (t === undefined && !m[2]) throw new Error('token sin ligar: ' + m[1]);
    return resolve(t ?? m[2], bg, depth + 1);
  }
  m = v.match(/^color-mix\(\s*in\s+srgb\s*,\s*([\s\S]+?)\s+(\d+(?:\.\d+)?)%\s*,\s*([\s\S]+?)\s*\)$/);
  if (m) {
    const p = parseFloat(m[2]) / 100;
    const a = resolve(m[1], bg, depth + 1);
    const b = m[3].trim() === 'transparent' ? bg : resolve(m[3], bg, depth + 1);
    return a.map((c, i) => c * p + b[i] * (1 - p));
  }
  m = v.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)$/);
  if (m) return over([+m[1], +m[2], +m[3]], m[4] === undefined ? 1 : +m[4], bg);
  if (/^#[0-9a-fA-F]{3}$|^#[0-9a-fA-F]{6}$/.test(v)) return hex(v);
  if (v === 'transparent') return bg;
  throw new Error('valor no resoluble: ' + v);
}

const lum = (rgb) => {
  const c = rgb.map((x) => x / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
/** Razon de contraste WCAG entre dos colores ya resueltos. */
export const ratio = (a, b) => {
  const [la, lb] = [lum(a), lum(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

// ── el contrato ──────────────────────────────────────────────────────────
// 3.0  limite de un componente de interfaz  (WCAG 1.4.11)
// 4.5  texto normal                          (WCAG 1.4.3)
const TONES = ['positive', 'attention', 'critical', 'info', 'neutral'];
const CHECKS = [
  ['--sx-edge',   '--sx-surface', 3.0, 'borde de control sobre superficie'],
  ['--sx-edge',   '--sx-ground',  3.0, 'borde de control sobre el fondo'],
  ['--sx-ink',    '--sx-surface', 4.5, 'texto principal'],
  ['--sx-ink-2',  '--sx-surface', 4.5, 'texto secundario'],
  ['--sx-ink-3',  '--sx-surface', 4.5, 'texto terciario'],
  ['--sx-accent-ink', '--sx-accent', 4.5, 'tinta sobre el acento'],
  ...TONES.map((t) => [`--sx-${t}`, `--sx-${t}-band`, 4.5, `tono ${t} sobre su banda`])
];
// Los filos de tono (--sx-positive-edge y compania) y el filo del acento
// (--sx-accent-edge) NO estan en el contrato, y vale escribir por que: 1.4.11
// pide 3:1 para el limite que hace falta para IDENTIFICAR un componente. Una
// pildora no se identifica por su filo — se identifica por su banda, su marca
// y su palabra, que es la regla que sostiene Pill.svelte. El filo es refuerzo.
// Lo mismo con --sx-accent-edge: se usa sólo en ChoiceCards.svelte:219 (borde
// de insignia dentro de tarjeta YA seleccionada) y SplitButton.svelte:135
// (raya divisoria dentro de botón). Se informan aparte para que no pasen
// inadvertidos, pero no rompen el build.
const INFO = TONES.map((t) => [`--sx-${t}-edge`, '--sx-surface', `filo del tono ${t}`]);
INFO.push(['--sx-accent-soft', '--sx-surface', 'hover sobre fila en reposo']);
INFO.push(['--sx-accent-edge', '--sx-surface', 'filo del acento sobre superficie']);

let malas = 0;
const ground = resolve(TOKENS['--sx-ground']);
console.log('token                    sobre               real    piso   \n' + '-'.repeat(64));
for (const [fg, bg, min, label] of CHECKS) {
  const b = resolve(TOKENS[bg], ground);
  const r = ratio(resolve(TOKENS[fg], b), b);
  const ok = r >= min;
  if (!ok) malas++;
  console.log(
    `${fg.padEnd(24)} ${bg.padEnd(19)} ${r.toFixed(2).padStart(5)}  ${min.toFixed(1)}  ${ok ? 'ok' : 'FALLA — ' + label}`
  );
}
// Solo los tokens que SON un color. Una sombra o una fuente no se resuelven a
// un color y pedirselo es ruido, no una comprobacion.
const NO_COLOR = /^--sx-(e-|r-|t-|s-|w-|z-|font|ease|fast|beat|slow|touch)/;
for (const [k, v] of Object.entries(TOKENS)) {
  if (NO_COLOR.test(k)) continue;
  try { resolve(v, ground); } catch (e) { malas++; console.log(`${k.padEnd(24)} NO RESUELVE — ${e.message}`); }
}
console.log('\ninformativo — no rompe el build');
for (const [fg, bg, label] of INFO) {
  const b = resolve(TOKENS[bg], ground);
  console.log(`  ${fg.padEnd(22)} ${ratio(resolve(TOKENS[fg], b), b).toFixed(2).padStart(5)}   ${label}`);
}
console.log('-'.repeat(64));
console.log(malas ? `${malas} comprobacion(es) fallando` : 'todo el contrato pasa');
process.exit(malas ? 1 : 0);
