// Resuelve los tokens a color real y mide contraste. Sin dependencias.
//
// POR QUE EXISTE. Un token no es un color: es una referencia que se resuelve
// contra otros tokens. `--sx-edge` puede leerse razonable en el objeto y dar
// 1.13:1 en pantalla, que es exactamente lo que pasaba. Mirar el archivo no lo
// detecta; resolverlo si. Este script es la lección de la exploración hecha
// comprobable: cuatro intentos se perdieron por copiar el NOMBRE de un token en
// vez de su VALOR, y lo que lo atrapó fue resolver y comparar números.
//
// POR QUE CORRE CONTRA LOS DOS TEMAS. Este archivo corrió durante toda su vida
// contra `TOKENS` nada más, y el modo oscuro se armó — tres tokens nuevos
// incluidos — sin que nada lo midiera. El resultado: una fila seleccionada en
// oscuro se pintaba con el lavanda CLARO de `--sx-accent-pick` (heredado, sin
// ligar) y encima le caía la tinta oscura. 2.99 donde el piso es 4.5, y nadie
// lo vio porque «se ve bastante bien» en el navegador no es una medición — es
// exactamente la trampa que este archivo existe para cerrar, y sólo la cerraba
// para un tema. Un tema que no se mide es un tema que se ve bien y falla.
//
// Por eso `resolve()` recibe el juego de tokens como parámetro en vez de leer
// el `TOKENS` claro de un closure: el oscuro es un REBINDING de roles sobre la
// misma base (arranca de `{...TOKENS, ...TOKENS_DARK}`, que es exactamente
// cómo se apila en el navegador — custom properties, no una hoja aparte), así
// que un `var(--sx-accent)` dentro de un valor oscuro tiene que resolver contra
// el acento OSCURO. Resolverlo siempre contra el claro habría sido la misma
// trampa una vez más, sólo que adentro del propio arnés.
import { TOKENS, TOKENS_DARK } from '../src/lib/tokens.js';

const hex = (h) => {
  const s = h.length === 4 ? h.slice(1).split('').map((c) => c + c).join('') : h.slice(1);
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};
const over = (fg, a, bg) => fg.map((c, i) => c * a + bg[i] * (1 - a));

/**
 * Resuelve un valor de token a [r,g,b], componiendo lo translucido sobre `bg`.
 * `tokens` es el juego contra el que se resuelven las referencias `var(...)` —
 * pasarlo explícito (en vez de cerrar sobre el claro) es lo que permite que
 * este mismo código sirva para los dos temas sin mentir en uno de ellos.
 */
export function resolve(value, tokens = TOKENS, bg = [255, 255, 255], depth = 0) {
  if (depth > 12) throw new Error('referencia circular: ' + value);
  const v = String(value).trim();

  let m = v.match(/^var\(\s*(--sx-[\w-]+)\s*(?:,\s*([\s\S]+))?\)$/);
  if (m) {
    const t = tokens[m[1]];
    if (t === undefined && !m[2]) throw new Error('token sin ligar: ' + m[1]);
    return resolve(t ?? m[2], tokens, bg, depth + 1);
  }
  m = v.match(/^color-mix\(\s*in\s+srgb\s*,\s*([\s\S]+?)\s+(\d+(?:\.\d+)?)%\s*,\s*([\s\S]+?)\s*\)$/);
  if (m) {
    const p = parseFloat(m[2]) / 100;
    const a = resolve(m[1], tokens, bg, depth + 1);
    const b = m[3].trim() === 'transparent' ? bg : resolve(m[3], tokens, bg, depth + 1);
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
//
// El mismo juego de CHECKS corre contra los dos temas — ver runContract más
// abajo. Un check no dice «el claro» ni «el oscuro»: dice qué rol se dibuja
// sobre qué rol, y el tema es sólo con qué diccionario se resuelve ese rol.
const TONES = ['positive', 'attention', 'critical', 'info', 'neutral'];
const CHECKS = [
  ['--sx-edge',   '--sx-surface', 3.0, 'borde de control sobre superficie'],
  ['--sx-edge',   '--sx-ground',  3.0, 'borde de control sobre el fondo'],
  // UN BORDE TIENE DOS LADOS. Las dos comprobaciones de arriba miden contra
  // superficie y contra fondo, que hoy son el mismo blanco: es una sola medición
  // escrita dos veces. Un control en hover, o un checkbox dentro de una fila
  // seleccionada, tiene su borde rodeado del fondo del ESTADO. Ahí es donde el
  // borde caía a 2.71 sin que nada avisara.
  ['--sx-edge',  '--sx-accent-soft', 3.0, 'borde de control sobre un estado'],
  // Y el texto que se dibuja ENCIMA de un estado. --sx-accent-soft pasó a ser
  // fondo de texto en buena parte de la librería (`grep -rl "var(--sx-accent-soft)"
  // src/lib` da el número de hoy) y nadie lo estaba midiendo.
  ['--sx-ink-3', '--sx-accent-soft', 4.5, 'texto terciario sobre un estado'],
  ['--sx-ink-2', '--sx-accent-soft', 4.5, 'texto secundario sobre un estado'],
  ['--sx-edge',  '--sx-accent-pick', 3.0, 'borde de control sobre una fila elegida'],
  ['--sx-ink-3', '--sx-accent-pick', 4.5, 'texto terciario sobre una fila elegida'],
  ['--sx-ink-2', '--sx-accent-pick', 4.5, 'texto secundario sobre una fila elegida'],
  // StackedBar.svelte, .rest: el segmento que dice cuánto falta es un dato, no
  // ambiente, y se pinta con --sx-edge sobre el fondo REAL de .track
  // (--sx-sunk) — no contra --sx-surface, que no es lo que hay detrás de la
  // barra. Antes de este arnés .rest usaba --sx-line (ambiente, sin piso) y
  // resolvía a 1.15:1; es el cuarto caso de un token usado para un trabajo que
  // no es el suyo.
  ['--sx-edge',  '--sx-sunk', 3.0, 'segmento "resta" de StackedBar sobre el fondo del track'],
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
INFO.push(['--sx-thead', '--sx-surface', 'banda de encabezado sobre la tarjeta']);
INFO.push(['--sx-accent-edge', '--sx-surface', 'filo del acento sobre superficie']);
INFO.push(['--sx-accent', '--sx-surface', 'el acento pleno, para el anillo de selección']);

// Solo los tokens que SON un color. Una sombra o una fuente no se resuelven a
// un color y pedirselo es ruido, no una comprobacion.
const NO_COLOR = /^--sx-(e-|r-|t-|s-|w-|z-|font|ease|fast|beat|slow|touch)/;

// EL TERCER HUECO. Este archivo ya se extendió dos veces por la misma razón —
// primero medía `--sx-edge` contra dos fondos que resolvían al mismo blanco
// (una sola medición escrita dos veces), después corría contra un solo tema
// (el oscuro se armó con tres tokens nuevos y nada los medía) — y las dos
// veces el defecto vivía en lo que NO se medía, no en lo medido. Hay un
// tercero: `--sx-chrome-tint` es una perilla, no un detalle cosmético — se
// mezcla en toda la rampa neutra, y `--sx-edge`, `--sx-ink-2` e `--sx-ink-3`
// cuelgan de esa rampa. El README documenta DOS valores como soportados —el
// morado por defecto y un gris neutro para un core que no quiere la traza de
// marca— y hasta ahora el arnés sólo corrió contra el morado. Con el gris,
// en oscuro, `--sx-surface` se corre lo suficiente para que
// `--sx-accent-pick` se aclare de más, y `--sx-edge` (2.87), `--sx-ink-3`
// (4.27) e `--sx-ink-2` (4.39) caen bajo el piso sin que ningún tema por sí
// solo lo mostrara: hacía falta la matriz completa, tema × perilla, para que
// apareciera.
const CHROME_KNOBS = [
  ['#6541BE', 'cromo morado'],
  ['#8E8E93', 'cromo gris']
];

// El oscuro no es una segunda hoja: es `TOKENS_DARK` pisando roles sobre
// `TOKENS`, exactamente como se apila `:root[data-sx-theme="dark"]` sobre
// `:root` en el navegador. Medir sólo `TOKENS_DARK` aislado mediría un objeto
// que no existe en pantalla. La perilla del cromo vive en `TOKENS` (el
// oscuro no la re-liga), así que alcanza con pisarla antes de apilar.
const THEMES = [
  ['claro', (tint) => ({ ...TOKENS, '--sx-chrome-tint': tint })],
  ['oscuro', (tint) => ({ ...TOKENS, '--sx-chrome-tint': tint, ...TOKENS_DARK })]
];

/**
 * Corre el contrato duro (CHECKS + resolubilidad de todo token-color) contra
 * un juego de tokens ya apilado. No imprime nada — devuelve la lista de
 * comprobaciones que fallaron, para que el llamador decida cómo mostrarlas.
 */
function evalContract(tokens) {
  const fails = [];
  const ground = resolve(tokens['--sx-ground'], tokens);
  for (const [fg, bg, min, checkLabel] of CHECKS) {
    const b = resolve(tokens[bg], tokens, ground);
    const r = ratio(resolve(tokens[fg], tokens, b), b);
    if (r < min) fails.push({ fg, bg, r, min, checkLabel });
  }
  for (const [k, v] of Object.entries(tokens)) {
    if (NO_COLOR.test(k)) continue;
    try {
      resolve(v, tokens, ground);
    } catch (e) {
      fails.push({ fg: k, bg: null, r: null, min: null, checkLabel: 'NO RESUELVE — ' + e.message });
    }
  }
  return fails;
}

// CHECKS × {claro, oscuro} × {las perillas de arriba}: la matriz completa, no
// dos listas. Cuatro combinaciones × diecisiete comprobaciones son demasiadas
// filas para leer una por una, así que la salida es un resumen por
// combinación —cuántas pasan, cuántas fallan— y el detalle completo sólo de
// lo que falla. Si nadie puede leer la salida, nadie la va a correr.
let malas = 0;
const resumen = [];
const detalle = [];
for (const [temaNombre, apilar] of THEMES) {
  for (const [tint, tintLabel] of CHROME_KNOBS) {
    const label = `${temaNombre} · ${tintLabel}`;
    const fails = evalContract(apilar(tint));
    malas += fails.length;
    resumen.push({ label, total: CHECKS.length, fails });
    if (fails.length) detalle.push({ label, fails });
  }
}

console.log('\n── MATRIZ DE CONTRASTE — contrato duro × 2 temas × 2 perillas ──');
console.log('combinación'.padEnd(26) + 'pasan  fallan');
console.log('-'.repeat(40));
for (const s of resumen) {
  const ok = s.total - s.fails.length;
  console.log(`${s.label.padEnd(26)} ${String(ok).padStart(5)}  ${String(s.fails.length).padStart(6)}`);
}
console.log('-'.repeat(40));

if (detalle.length) {
  console.log('\n── detalle de lo que falla ──────────────────────────────────');
  for (const d of detalle) {
    console.log(`\n${d.label}`);
    console.log('token                    sobre               real    piso   \n' + '-'.repeat(64));
    for (const f of d.fails) {
      if (f.bg) {
        console.log(
          `${f.fg.padEnd(24)} ${f.bg.padEnd(19)} ${f.r.toFixed(2).padStart(5)}  ${f.min.toFixed(1)}  FALLA — ${f.checkLabel}`
        );
      } else {
        console.log(`${f.fg.padEnd(24)} ${f.checkLabel}`);
      }
    }
  }
}
console.log(malas ? `\n${malas} comprobacion(es) fallando en la matriz` : '\nla matriz entera pasa: 4 combinaciones, 0 fallas');

// Las líneas de abajo son informativas (no suman a `malas`) y se miden una
// sola vez, sobre el claro con la perilla por defecto: no cambian de rol
// entre temas ni perillas y duplicarlas sería ruido, no comprobación.
console.log('\ninformativo — no rompe el build (medido en TEMA CLARO, cromo morado)');
{
  const ground = resolve(TOKENS['--sx-ground'], TOKENS);
  for (const [fg, bg, label] of INFO) {
    const b = resolve(TOKENS[bg], TOKENS, ground);
    console.log(`  ${fg.padEnd(22)} ${ratio(resolve(TOKENS[fg], TOKENS, b), b).toFixed(2).padStart(5)}   ${label}`);
  }
}
console.log('-'.repeat(64));
process.exit(malas ? 1 : 0);
