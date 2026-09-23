// The tokens, a second time, as a string.
//
// WHY THIS EXISTS AND IS NOT A DUPLICATE
//
// Strix ships two kinds of frontend and they consume tokens differently:
//
//   • A SvelteKit app (the Shell, Sarion) loads `tokens.css` into the document.
//     Custom properties inherit down normally and everything just works.
//
//   • A Core module is a Svelte custom element rendering in an OPEN SHADOW ROOT
//     under a strict CSP. Custom properties DO inherit across the shadow
//     boundary, so a module mounted inside the Shell picks the document's
//     tokens up for free — but a module must also work when nothing above it
//     defined them, and it cannot @import a stylesheet the CSP forbids. So it
//     needs to carry its own copy on `:host`.
//
// Keeping the copy here, generated from one source of truth, is the difference
// between "two places to change a colour" and "one place, two shapes". The CSS
// file is written from THIS object at build time — never edit tokens.css by
// hand; edit `TOKENS` and run `npm run tokens`.

// ─────────────────────────────────────────────────────────────────────────
// EL CROMO SE PRECOMPUTA EN JS, NO SE MEZCLA EN CSS. Hasta la v0.7.0 la rampa
// se escribía como `color-mix(in srgb, var(--sx-chrome-tint) N%, base)` y la
// perilla re-tintaba todo en runtime. Se cambió por un defecto REAL y
// verificado, no por gusto: Chromium rasteriza un mismo color-mix de forma
// DISTINTA según la capa compuesta en que caiga — el ground pintaba lila
// donde un stacking context (el z-index de PageHeader) forzaba su propia
// capa, y BLANCO plano en la capa base; en oscuro, el fondo de un botón
// outline (--sx-surface → n-800, otro color-mix) salía blanco brillante.
// Computed styles correctos, paint inconsistente — la misma familia del
// defecto de container-type+sticky que TopBar ya corrigió. Un hex literal
// pinta igual en todas las capas, siempre.
//
// LA PERILLA NO MURIÓ: CAMBIÓ DE FORMA. `--sx-chrome-tint` sigue declarada
// (informativa), pero re-ligarla ya no re-tinta la rampa. Un producto que
// quiera otra traza llama `chromeRamp(tint)` / `chromeRampDark(tint)` y pisa
// en su raíz los peldaños que estas funciones devuelven — una decisión, un
// lugar, mismo resultado, sin el color-mix roto. Los derivados del ACENTO
// (--sx-accent-soft/pick/edge, --sx-halo) siguen siendo color-mix: el acento
// es del producto y no se puede precomputar acá; pintan estados chicos donde
// el artefacto de capas no se manifestó.
// ─────────────────────────────────────────────────────────────────────────

// v0.8.8 — la perilla del cromo pasa a GRIS NEUTRO por defecto. El morado
// (#6541BE) leía tintado, sobre todo en oscuro; el usuario lo quiere gris
// parejo. `#8E8E93` es la traza gris que `scripts/contrast.mjs` ya validaba
// como la SEGUNDA perilla ("cromo gris") — toda la matriz de contraste
// (2 temas × 2 perillas) pasa con este valor, así que el cambio no arriesga
// ningún piso. Un módulo que quiera recuperar una traza de marca re-hornea la
// rampa con `chromeRamp()` desde su raíz; el default deja de imponer morado.
//
// VARIANTE COLORIDA (rama design/variante-colorida) — la perilla VUELVE al
// morado. No es un valor nuevo: `#6541BE` es la PRIMERA perilla que
// `scripts/contrast.mjs` valida («cromo morado»), así que toda la rampa ya está
// medida con él. Con esta traza el campo resuelve a #EEEAF8, que es el lienzo
// lila de la dirección neumórfica (#EFEBF8) — la base colorida sale de una
// perilla que el sistema ya tenía, no de una paleta paralela.
const TINT = '#6541BE';

const rgbOf = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
/** La misma aritmética que color-mix(in srgb): lerp sobre los canales sRGB. */
export const mixHex = (a, pct, b) => {
  const A = rgbOf(a), B = rgbOf(b), p = pct / 100;
  return '#' + A.map((c, i) => Math.round(c * p + B[i] * (1 - p)).toString(16).padStart(2, '0').toUpperCase()).join('');
};

// La receta del cromo, UNA vez: peldaño → [porcentaje de traza, base].
export const CHROME_RECIPES = {
  light: {
    '--sx-n-50': [4, '#FAFAFB'], '--sx-n-100': [5, '#F4F4F6'], '--sx-n-150': [6, '#EDEDF0'],
    '--sx-n-200': [8, '#DDDDE2'], '--sx-n-300': [8, '#BBBBC2'], '--sx-n-400': [8, '#7A7A7F'],
    '--sx-n-500': [8, '#5E5E64'], '--sx-n-700': [8, '#414146'], '--sx-n-800': [8, '#27272B'],
    // El campo baja de 11 % a 9 % con la variante colorida: con la traza morada
    // (TINT) el 11 % quedaba a 1.048 de --sx-accent-soft — `Card
    // variant="filled"` no se despegaba del campo, piso 1.05. A 9 % mide 1.08, y
    // la tarjeta blanca sigue a ~1.15 del campo: más escalón que el 11 % gris.
    '--sx-n-900': [7, '#1B1B1E'], '--sx-ground': [9, '#FFFFFF'], '--sx-thead': [9, '#FFFFFF']
  },
  dark: {
    '--sx-sunk': [8, '#1B1F22'], '--sx-line': [8, '#2C3134'], '--sx-ink': [4, '#EDEFF0'],
    '--sx-ink-2': [6, '#CED2D4'], '--sx-accent-edge': [8, '#3A3F43']
  }
};

const rampOf = (tint, recipes) =>
  Object.fromEntries(Object.entries(recipes).map(([k, [p, base]]) => [k, mixHex(tint, p, base)]));

/** Los peldaños del cromo claro para una traza dada — lo que un producto pisa
 *  en su raíz si no quiere el morado. Incluye la perilla informativa. */
export const chromeRamp = (tint) => ({ '--sx-chrome-tint': tint, ...rampOf(tint, CHROME_RECIPES.light) });

/** La mitad oscura. El thead oscuro deriva de la superficie (n-800 de la
 *  misma traza), así que se recomputa acá con la receta completa. */
export const chromeRampDark = (tint) => ({
  ...rampOf(tint, CHROME_RECIPES.dark),
  '--sx-thead': mixHex('#FFFFFF', 10, mixHex(tint, 8, '#27272B'))
});

const CHROME = chromeRamp(TINT);
const CHROME_DARK = chromeRampDark(TINT);

// ─────────────────────────────────────────────────────────────────────────
// LA ARCILLA DE CADA MÓDULO (variante colorida). Pedido del usuario: la Shell
// no tiene luz propia — adopta el fondo, el brillo y el acento del core que
// está montado, y cada core tiene la SUYA: Mantenimiento, un blanco amarillento
// con sombras cálidas; Clientes, uno rosado. Antes todos los cores emitían el
// mismo lila y la misma sombra violeta y sólo cambiaban el acento, así que un
// Mantenimiento amarillo dentro del Shell lila se leía como dos aplicaciones
// apiladas.
//
// LA RECETA ES LA DEL LILA, GIRADA Y DILUIDA. Cada rol (lienzo, superficie,
// pozo, la traza de los grises, la sombra de la arcilla) guarda la LUMINOSIDAD
// (OKLCH L) que tiene hoy en el lila, una fracción de su SATURACIÓN (C, ver
// CLAY_BG / CLAY_SHADOW) y toma el TONO (h) del acento del módulo. Así todos
// los módulos tienen exactamente el mismo volumen, la misma profundidad y el
// mismo contraste — sólo cambia hacia qué color tira la arcilla, apenas. Si el
// color no entra en sRGB a esa saturación, se baja la saturación, nunca la luz.
//
// PRECOMPUTADO, COMO EL CROMO (ver el banner de arriba): hex y rgba literales,
// nunca color-mix en CSS.
// ─────────────────────────────────────────────────────────────────────────
const toLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

/** hex → [L, C, h°] en OKLCH (Björn Ottosson). */
export const oklchOf = (h) => {
  const [r, g, b] = rgbOf(h).map((v) => toLin(v / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
};

const rgbFromOklch = (L, C, h) => {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  ].map(toGam);
};

/** [L, C, h°] → hex. Fuera de sRGB baja la saturación (nunca la luz). */
export const hexOfOklch = (L, C, h) => {
  let c = C, rgb = rgbFromOklch(L, c, h);
  while (c > 0 && rgb.some((v) => v < -1e-4 || v > 1 + 1e-4)) { c -= 0.002; rgb = rgbFromOklch(L, Math.max(c, 0), h); }
  return '#' + rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0').toUpperCase()).join('');
};

// Los roles de la arcilla y el color del lila del que sale cada receta. Los
// hex son los de TOKENS: si el lila cambia allá, hay que cambiarlo acá.
const CLAY_REF = {
  '--sx-ground': '#EFEBF8',
  '--sx-surface': '#F6F3FC',
  '--sx-sunk': '#E6E1F1',
  shadow: '#6541BE',   // rgba(101,65,190,·): la sombra de la arcilla
  float: '#4C3496'     // rgba(76,52,150,·): la de lo que flota (--sx-e-3)
};
const CLAY_LC = Object.fromEntries(Object.entries(CLAY_REF).map(([k, v]) => [k, oklchOf(v)]));

/** El tono de la arcilla para un acento. Un acento casi gris no tiene tono que
 *  prestar: cae al del lila, que es el del sistema. */
const clayHue = (accent) => {
  const [, C, h] = oklchOf(accent);
  return C < 0.03 ? oklchOf(TINT)[2] : h;
};
// Cada rol conserva su CORRIMIENTO de tono respecto de la traza (el lienzo lila
// no tira exactamente al mismo matiz que #6541BE): se gira el conjunto, no se
// aplana. Con el acento violeta, el giro es cero y sale el lila tal cual.
const TINT_H = oklchOf(TINT)[2];
const rot = (role, h, k = 1) => { const [L, C, h0] = CLAY_LC[role]; return hexOfOklch(L, C * k, (h0 - TINT_H + h + 360) % 360); };

// LA DILUCIÓN (pedido del usuario, 2026-09-23: «el color de fondo tiene que
// ser muy muy ligero — ahora toda la página se ve rosa»). Con la saturación
// entera del lila, el fondo de un módulo ERA su color: Clientes pintaba la
// pantalla de rosa. Los fondos de un módulo guardan el 36 % de la saturación
// del lila (un soplo del tono) y la sombra y la traza de los grises el 50 %. La luz no se toca: el volumen y el contraste son los mismos.
// El lila del Tablero (TOKENS) no se diluye: es la casa del Shell.
// 36 %: el usuario pidió subirlo 6 puntos sobre el 30 % («no se ve que se
// adapta»): a 30 % los fondos de los módulos eran casi el mismo neutro y el
// cambio de un módulo a otro no se percibía.
const CLAY_BG = 0.36, CLAY_SHADOW = 0.5;
const rgba = (hex, a) => `rgba(${rgbOf(hex).join(',')},${a})`;
const lumOf = (hex) => { const [r, g, b] = rgbOf(hex).map((v) => toLin(v / 255)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
/** La razón WCAG entre dos hex — la misma que mide scripts/contrast.mjs. */
const ratioOf = (a, b) => { const [x, y] = [lumOf(a), lumOf(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
// ΔE2000 (Sharma, Wu y Dalal 2005), para que la fila elegida de un módulo no
// se confunda con la banda de un estado. Es la misma fórmula que mide
// scripts/contrast.mjs, escrita otra vez a propósito: el arnés es la regla con
// la que se controla esto, no se importa de acá.
const labOf = (hex) => {
  const [R, G, B] = rgbOf(hex).map((v) => toLin(v / 255));
  const f = (t) => (t > (6 / 29) ** 3 ? Math.cbrt(t) : t / (3 * (6 / 29) ** 2) + 4 / 29);
  const fx = f((0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / 0.95047);
  const fy = f(0.2126729 * R + 0.7151522 * G + 0.072175 * B);
  const fz = f((0.0193339 * R + 0.119192 * G + 0.9503041 * B) / 1.08883);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
};
const dE = (x, y) => {
  const [L1, a1, b1] = labOf(x), [L2, a2, b2] = labOf(y);
  const rad = (d) => (d * Math.PI) / 180, deg = (r) => (r * 180) / Math.PI;
  const C7 = ((Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2) ** 7;
  const G = 0.5 * (1 - Math.sqrt(C7 / (C7 + 25 ** 7)));
  const A1 = a1 * (1 + G), A2 = a2 * (1 + G);
  const C1 = Math.hypot(A1, b1), C2 = Math.hypot(A2, b2);
  const hp = (a, b) => (a === 0 && b === 0 ? 0 : (deg(Math.atan2(b, a)) + 360) % 360);
  const h1 = hp(A1, b1), h2 = hp(A2, b2);
  let dh = C1 * C2 === 0 ? 0 : Math.abs(h2 - h1) <= 180 ? h2 - h1 : h2 - h1 > 180 ? h2 - h1 - 360 : h2 - h1 + 360;
  const dH = 2 * Math.sqrt(C1 * C2) * Math.sin(rad(dh / 2));
  const Lb = (L1 + L2) / 2, Cb = (C1 + C2) / 2;
  const hb = C1 * C2 === 0 ? h1 + h2 : Math.abs(h1 - h2) <= 180 ? (h1 + h2) / 2 : h1 + h2 < 360 ? (h1 + h2 + 360) / 2 : (h1 + h2 - 360) / 2;
  const T = 1 - 0.17 * Math.cos(rad(hb - 30)) + 0.24 * Math.cos(rad(2 * hb)) + 0.32 * Math.cos(rad(3 * hb + 6)) - 0.2 * Math.cos(rad(4 * hb - 63));
  const Cb7 = Cb ** 7, Rt = -Math.sin(rad(60 * Math.exp(-(((hb - 275) / 25) ** 2)))) * 2 * Math.sqrt(Cb7 / (Cb7 + 25 ** 7));
  const tL = (L2 - L1) / (1 + (0.015 * (Lb - 50) ** 2) / Math.sqrt(20 + (Lb - 50) ** 2));
  const tC = (C2 - C1) / (1 + 0.045 * Cb), tH = dH / (1 + 0.015 * Cb * T);
  return Math.sqrt(tL * tL + tC * tC + tH * tH + Rt * tC * tH);
};
const TONE_BANDS = ['#DDF0E4', '#FCEBD0', '#FCDDE3', '#E2E8F7', '#EDEBF3']; // positive, attention, critical, info, neutral

const INK = '#201E29';
const wellOf = (accent, sunk) => {
  let c = accent;
  while (ratioOf(mixHex(c, 66, INK), mixHex(c, 16, sunk)) < 3.05) c = mixHex('#000000', 2, c);
  return c;
};
/** El menor porcentaje de `accent` sobre `base`, desde `from`, que cumple `ok`. */
const washOf = (accent, base, from, ok) => {
  for (let p = from; p <= 60; p++) { const c = mixHex(accent, p, base); if (ok(c)) return [c, p]; }
  return [mixHex(accent, 60, base), 60];
};

// LA LUZ DE LA ARCILLA, una sola receta para el Tablero y para cada módulo.
// Segunda vez que el usuario pide bajarla (2026-09-23: «una pizca más
// discreto… adaptalo al fondo para que no sobresalga»): la luz ya no es blanco
// puro sino una versión muy clara de la SUPERFICIE de quien la emite (la mitad
// del camino entre su superficie y el blanco), y baja otra pizca — afuera .55
// (era .7), el filo de adentro .5 (.6–.65), lo hundido .6 (.75). El volumen lo
// sigue haciendo la sombra, que no se toca.
const clayElevation = (S, F, surface) => {
  const L = mixHex(surface, 50, '#FFFFFF');
  return {
    '--sx-e-1': `-3px -3px 8px ${rgba(L, .55)}, 3px 4px 10px ${rgba(S, .22)}, inset 1px 1px 1px ${rgba(L, .5)}, inset -1px -2px 4px ${rgba(S, .07)}`,
    '--sx-e-2': `-5px -5px 12px ${rgba(L, .55)}, 5px 6px 14px ${rgba(S, .26)}, inset 1px 1px 1px ${rgba(L, .5)}, inset -1px -2px 5px ${rgba(S, .08)}`,
    '--sx-e-card': `-7px -7px 16px ${rgba(L, .55)}, 7px 8px 20px ${rgba(S, .24)}, inset 1px 1px 1px ${rgba(L, .5)}, inset -2px -3px 7px ${rgba(S, .07)}`,
    '--sx-e-chip': `-2px -2px 6px ${rgba(L, .55)}, 2px 3px 8px ${rgba(S, .16)}, inset 1px 1px 0 ${rgba(L, .5)}`,
    '--sx-e-primary': `-3px -3px 8px ${rgba(L, .55)}, 3px 3px 12px color-mix(in srgb, var(--sx-accent) 35%, transparent)`,
    '--sx-e-3': `0 2px 6px -2px ${rgba(F, .10)}, 0 26px 56px -18px ${rgba(F, .32)}`,
    '--sx-e-sunk': `inset 2.5px 2.5px 6px ${rgba(S, .20)}, inset -2.5px -2.5px 6px ${rgba(L, .6)}`,
    '--sx-e-well': `inset 2.5px 2.5px 6px ${rgba(S, .20)}, inset -2.5px -2.5px 6px ${rgba(L, .6)}`,
    '--sx-e-pill': `inset 1.5px 1.5px 3px ${rgba(S, .14)}, inset -1.5px -1.5px 3px ${rgba(L, .6)}`
  };
};
/** La del Tablero: el lila de TOKENS, sin girar ni diluir. */
const LILAC_E = clayElevation(CLAY_REF.shadow, CLAY_REF.float, CLAY_REF['--sx-surface']);

/**
 * Los tokens de la arcilla de un módulo, claro y oscuro, a partir de su acento.
 * Lo que devuelve es exactamente lo que la Shell adopta (ver PALETTE_TOKENS).
 * @param {string} accent  el `--sx-accent` claro del módulo (hex #RRGGBB)
 */
export function clayTokens(accent) {
  const h = clayHue(accent);
  const tint = hexOfOklch(oklchOf(TINT)[0], oklchOf(TINT)[1] * CLAY_SHADOW, h);
  const S = rot('shadow', h, CLAY_SHADOW), F = rot('float', h, CLAY_SHADOW);
  const ground = rot('--sx-ground', h, CLAY_BG), surface = rot('--sx-surface', h, CLAY_BG), sunk = rot('--sx-sunk', h, CLAY_BG);
  const ramp = chromeRamp(tint);
  // EL BORDE, MEDIDO. --sx-edge aterriza en n-400; según el tono, la misma
  // traza da un gris un pelo más claro y un segmento de StackedBar sobre el
  // pozo quedaba en 2.999 (Costeo). Se oscurece de a 1 % hasta que pasa.
  while (ratioOf(mixHex(ramp['--sx-n-400'], 90, sunk), sunk) < 3.05 || ratioOf(ramp['--sx-n-400'], surface) < 3.05) {
    ramp['--sx-n-400'] = mixHex('#000000', 1, ramp['--sx-n-400']);
  }
  // LOS LAVADOS DEL ACENTO, MEDIDOS CONTRA ESTA ARCILLA. La receta de la lib
  // mezcla el acento contra blanco fijo (14 / 18 / 28 %). Sobre la superficie
  // crema de Mantenimiento, un amarillo al 14 % queda IGUAL a ella (1.001) y el
  // hover desaparece. Así que se busca el menor porcentaje, desde el de la
  // receta, que se despegue: el hover de la superficie y del lienzo, la
  // selección del hover. Precomputado en hex.
  // La base es la de la receta —blanco fijo—, así el violeta sale igual que
  // siempre (14 / 18 %) y sólo el acento que no se despega sube de porcentaje.
  const [soft, ps] = washOf(accent, '#FFFFFF', 14, (c) => ratioOf(c, surface) >= 1.05 && ratioOf(c, ground) >= 1.05);
  // La selección: se despega del hover y se LEE (tinta terciaria 4.5, borde
  // 3.0 — obligatorio). Y, si se puede sin romper eso, lejos de las bandas de
  // estado (ΔE ≥ 5.6, el piso del arnés con margen). Cuando las dos cosas
  // chocan (un acento rosa contra la banda de «crítico»), manda que se lea: el
  // choque de familia lo decide el acento del módulo, igual que en la clase 3
  // del arnés, y queda informado ahí.
  const reads = (c) => ratioOf(c, soft) >= 1.05 && ratioOf(ramp['--sx-n-500'], c) >= 4.55 && ratioOf(ramp['--sx-n-400'], c) >= 3.02;
  const from = Math.max(18, ps + 4);
  let [pick] = washOf(accent, '#FFFFFF', from, (c) => reads(c) && TONE_BANDS.every((b) => dE(c, b) >= 5.6));
  if (!reads(pick)) [pick] = washOf(accent, '#FFFFFF', from, reads);
  const light = {
    ...ramp,
    '--sx-ground': ground,
    '--sx-thead': ground,
    '--sx-surface': surface,
    '--sx-sunk': sunk,
    '--sx-accent-soft': soft,
    '--sx-accent-pick': pick,
    // El filo del acento, desde el 28 % de la receta hasta que se despegue de
    // la superficie como el del violeta (1.4): un amarillo al 28 % es un filo
    // que no se ve (Mantenimiento lo había subido a mano al 55 %).
    '--sx-accent-edge': washOf(accent, '#FFFFFF', 28, (c) => ratioOf(c, surface) >= 1.4)[0],
    // EL POZO DEL ACENTO. IconWell sin `hue` tiñe con el acento: el ícono al
    // 66 % contra la tinta sobre un pozo al 16 %. Con un acento CLARO (el ámbar
    // de Mantenimiento) el ícono daba 2.57 (piso 3). Acá el acento se oscurece
    // de a 2 % hasta que su pozo se lee; con un acento oscuro queda igual.
    '--sx-accent-well': wellOf(accent, sunk),
    ...clayElevation(S, F, surface)
  };
  // El oscuro: la misma traza en la rampa oscura (pozo, raya, tintas). Sus
  // sombras son negras y su luz casi nula en todos los módulos — ahí la arcilla
  // no tira hacia ningún color, así que no se re-declaran.
  // En oscuro el pozo del acento vuelve a ser el acento (oscuro) del módulo.
  const dark = { ...chromeRampDark(tint), '--sx-accent-well': 'var(--sx-accent)' };
  return { light, dark };
}

/**
 * La arcilla del módulo como CSS para su `:host`, claro y oscuro. Va DESPUÉS de
 * `hostTokens()` y `hostTokensDark()` en el mismo <style>:
 *
 *   const styles = hostTokens() + hostTokensDark() + clayHost('#F7B500') + hostBase();
 */
export const clayHost = (accent, selector = ':host', darkSelector = ':host([data-sx-theme="dark"])') => {
  const { light, dark } = clayTokens(accent);
  const d = (o) => Object.entries(o).map(([k, v]) => `  ${k}: ${v};`).join('\n');
  return `${selector} {\n${d(light)}\n}\n${darkSelector} {\n${d(dark)}\n}\n`;
};

/** The light theme: role tokens, tones, and the scales. */
export const TOKENS = {
  // LA PERILLA DEL CROMO, ahora INFORMATIVA: declara qué traza lleva la rampa,
  // pero re-ligarla ya no re-tinta nada — ver el banner de arriba. Quien quiera
  // otra traza usa chromeRamp()/chromeRampDark().
  '--sx-chrome-tint': TINT,

  // La rampa: neutros con una traza de la perilla. No es "gris teñido de marca"
  // — la traza es del 4 al 8 %, que afina sin leerse como color. Un gris puro al
  // lado de un acento morado se lee verdoso; eso es lo que corrige.
  '--sx-n-0': '#FFFFFF',
  '--sx-n-50': CHROME['--sx-n-50'],
  '--sx-n-100': CHROME['--sx-n-100'],
  '--sx-n-150': CHROME['--sx-n-150'],
  '--sx-n-200': CHROME['--sx-n-200'],
  '--sx-n-300': CHROME['--sx-n-300'],
  // n-400 es donde aterriza --sx-edge, el borde de un control.
  //
  // SU BASE SE OSCURECIÓ DE #8E8E93 A #828287, y la razón es que un borde tiene
  // dos lados. El valor viejo daba 3.47:1 contra blanco y cumplía — pero un
  // control en hover, o un checkbox dentro de una fila seleccionada, tiene su
  // borde rodeado de --sx-accent-soft por los dos lados, y ahí caía a 2.71.
  // Contra blanco cumplía y contra sí mismo no. Con la perilla del cromo en un
  // neutro el margen era todavía más chico, así que la base tiene que aguantar
  // las dos configuraciones:
  //     contra blanco:            4.03 morado / 3.77 gris
  //     contra --sx-accent-soft:  3.84 morado / 3.59 gris (hoy — medía 3.46 /
  //                               3.24 cuando --sx-accent-soft todavía mezclaba
  //                               al 16 %; bajó a 10 % después, ver ahí)
  // NO puede salir de la escala de tercios del resto del cromo: para llegar a
  // 3:1 mezclando marca haría falta un 64 %, que es un borde morado franco y no
  // mobiliario.
  //
  // SEGUNDA VEZ QUE SE OSCURECE, y por el mismo motivo: apareció un estado nuevo
  // debajo suyo. Con --sx-accent-pick (18 %) como fondo, la base #828287 daba
  // 3.05 morado / 2.86 gris. #7A7A7F da 3.38 / 3.16, y contra blanco sube de
  // 4.03 a 4.47.
  '--sx-n-400': CHROME['--sx-n-400'],
  // N-500 ES DONDE ATERRIZA --sx-ink-3, no --sx-neutral: --sx-neutral se fijó
  // a hex (ver el bloque de tonos, más abajo) y ya no toca la rampa — el único
  // consumidor de este peldaño hoy es --sx-ink-3, contra --sx-surface,
  // --sx-accent-soft y --sx-accent-pick. Su base da 4.95:1 con la traza y
  // 4.69:1 sin ella contra --sx-surface. En la dirección A daba 4.16 y estaba
  // por debajo de AA sin que nadie lo hubiera medido.
  //
  // También se oscurece por --sx-accent-pick: sobre ese relleno, la base #66666C
  // daba 4.42 morado / 4.12 gris, por debajo de AA. #5E5E64 da 4.94 / 4.60.
  '--sx-n-500': CHROME['--sx-n-500'],
  '--sx-n-700': CHROME['--sx-n-700'],
  '--sx-n-800': CHROME['--sx-n-800'],
  '--sx-n-900': CHROME['--sx-n-900'],

  // Los roles: qué es cada cosa, no de qué color es. Un producto que necesita
  // mover UNA cosa pisa el rol; uno que necesita mover todo lo que dependa de un
  // peldaño pisa la primitiva.
  //
  // El fondo es BLANCO, no un peldaño de la rampa. Es la silueta de Nácar: la
  // tarjeta no se lee por diferencia de tono contra el campo sino por la sombra
  // que deja. Es la desviación deliberada respecto de Prisma pastel.
  // EL CAMPO, CON UN TINTE MÍNIMO. Estuvo en blanco puro y el costo se vio
  // construyendo un módulo real: en claro, --sx-surface y --sx-ground daban
  // 1.000 entre sí —el MISMO blanco— así que una tarjeta no tenía ningún
  // límite salvo una sombra suave. En oscuro el escalón existe (1.159) y por
  // eso ahí todo se leía bien y en claro no se sabía dónde empezaba nada.
  //
  // Un 3 % no es un color: es el escalón que hace que una superficie blanca se
  // lea como superficie. Prisma lo tenía al 5 % por esta misma razón; acá se
  // había quitado y hubo que devolverlo.
  // Fue 6 % y ahora es 11 %, y la corrección es la misma lección una vuelta más
  // arriba. El 6 % se eligió como EL MÍNIMO que pasa el piso de 1.05 que este
  // repo exige para que dos superficies se consideren distinguibles (a 3 % daba
  // 1.046 morado / 1.029 gris, por debajo; ni el 5 % llegaba con la perilla
  // gris). Pero pasar el piso por un pelo no es lo mismo que leerse: a 6 % el
  // escalón contra --sx-surface mide 1.064, y en una pantalla real —un módulo
  // lleno de tarjetas blancas sobre el campo— se seguía leyendo como blanco
  // sobre blanco. El piso es un mínimo para no romper, no un objetivo de diseño.
  // A 11 % el escalón mide ~1.11, el doble, y ahí una tarjeta se lee como
  // tarjeta sin que el campo deje de ser un tinte. `--sx-thead` sube a 9 % por
  // el mismo motivo: la cabecera de una tabla se apoya SOBRE la superficie
  // blanca, así que compartir el 6 % del campo la dejaba invisible.
  // VARIANTE COLORIDA: el lienzo de Stitch, literal (Lila Canvas #EFEBF8).
  '--sx-ground': '#EFEBF8',
  // ARCILLA: la superficie deja de ser blanco puro (5 % de la traza) para que la
  // luz interna blanca de --sx-e-1 exista — blanco sobre blanco no infla nada.
  // El pozo baja al valor del campo (9 %) porque el escalón pozo/tarjeta tiene
  // que seguir pasando el piso de 1.05 contra una tarjeta que ya no es blanca.
  // La superficie levantada y el pozo de Stitch, literales (Surface Raised
  // #F6F3FC, Surface Sunk #E6E1F1). El pozo hondo es la mitad de la
  // profundidad: todo lo hundido —campos, rieles, pozos, contadores, pills de
  // estado— se lee como un hueco porque está un escalón claro por debajo.
  '--sx-surface': '#F6F3FC',
  '--sx-sunk': '#E6E1F1',
  // --sx-line separa filas y cierra cabeceras: es AMBIENTE y puede ser tenue.
  '--sx-line': 'var(--sx-n-150)',
  // --sx-edge es el límite de un CONTROL: dice dónde se puede escribir. Eso es
  // información, no decoración, y por eso salta cuatro peldaños respecto de
  // --sx-line en vez de acompañarlo. Los dos compartían token en la dirección A
  // y por eso el borde de un input daba 1.52:1.
  '--sx-edge': 'var(--sx-n-400)',
  '--sx-ink': 'var(--sx-n-900)',
  '--sx-ink-2': 'var(--sx-n-700)',
  '--sx-ink-3': 'var(--sx-n-500)',
  '--sx-ink-on': 'var(--sx-n-0)',
  // EL ENCABEZADO. Token propio y no --sx-sunk, porque --sx-sunk también pinta
  // los controles de formulario: cambiarle el color al encabezado movía también
  // los inputs. Mueve cabecera de tabla, cabecera de panel y pie de panel.
  //
  // ESTUVO EN BLANCO PURO Y ERA UN DEFECTO. La dirección pide un tinte al 6 %
  // (explore, [data-d='AD']); en blanco, tres piezas dejaron de existir: el pie
  // del panel quedaba blanco sobre una tarjeta blanca, la declaración de .head
  // era un no-op, y la cabecera de tabla no se separaba de sus filas.
  // La cabecera baja al lienzo: a 9 % quedaba a 1.045 de la superficie nueva.
  '--sx-thead': '#EFEBF8',
  // EL RESPLANDOR DE LAS SUPERFICIES, APAGADO POR DEFECTO. Es una perilla, no
  // un efecto: en 0 no dibuja nada y el sistema se comporta como siempre. Un
  // producto que quiera que sus tarjetas, paneles y pozos irradien sube este
  // número y le llega a todas de una vez, sin tocar un componente.
  //
  // POR QUÉ EXISTE. Dos módulos del ecosistema comparten estos tokens y tienen
  // que poder sentirse distintos; el resplandor es la palanca más barata para
  // eso, porque cambia el carácter de una pantalla entera desde una sola línea.
  // Va apagado por defecto porque una librería no impone un efecto: lo ofrece.
  //
  // El color sale del acento del producto, así que la perilla no elige el color
  // —eso ya lo eligió el módulo— sino cuánta luz.
  '--sx-glow': '0%',
  '--sx-glow-color': 'var(--sx-accent)',

  // LA FIRMA de Nácar: la luz que deja caer la barra superior en vez de una
  // raya. Ligarlo a `transparent` la apaga sin tocar ninguna regla.
  //
  // SUBIÓ DE 55 A 70 % después de mirarlo en pantalla. El 55 % venía de partir a
  // la mitad el valor de la dirección de origen (T · Halo claro, que lo pinta a
  // opacidad plena), y sobre blanco quedaba por debajo del umbral en que se
  // percibe: un resplandor sobre papel se apaga mucho más rápido que sobre un
  // fondo teñido. La geometría NO se toca — está calibrada al límite de lo
  // visible y bajarla no la hace discreta, la hace invisible. Lo que gradúa la
  // discreción es este porcentaje y sólo éste.
  '--sx-halo': 'color-mix(in srgb, var(--sx-accent) 70%, transparent)',

  // EL HUECO DEL ACENTO. Un producto lo llena ligando --sx-accent,
  // --sx-accent-ink, --sx-accent-soft y --sx-accent-edge en su raíz; es el
  // único color que un producto elige. --sx-accent-pick, más abajo, es un
  // quinto derivado que casi nunca hace falta tocar — ver el README, «Ligar
  // el acento».
  //
  // POR QUÉ EL DEFECTO YA NO ES CASI-NEGRO. Antes lo era, con el argumento de
  // que un acento sin ligar debía dar un primario usable. El argumento se cae en
  // Nácar por una razón mecánica: --sx-chrome-tint ya vale este mismo morado, así
  // que el mobiliario entero sale con su traza. Un acento casi-negro contra un
  // cromo violeta no es neutral: es una dirección desafinada de fábrica.
  '--sx-accent': '#6541BE',
  // Blanco sobre este morado da 6.88:1 — por encima de 4.5 con margen.
  '--sx-accent-ink': '#FFFFFF',
  // SIGUEN AL ACENTO. Eran dos peldaños fijos de la rampa, o sea grises: un
  // estado interactivo pintado con ellos se lee como una superficie más sucia,
  // no como una pieza que responde.
  //
  // EL 10 % ESTÁ MEDIDO Y NO ELEGIDO, y bajó desde 16 % por una razón que sólo
  // se ve mirando lo que va ENCIMA. A 16 % este token hacía dos trabajos —el
  // hover y el «seleccionado»— y para que el hover despegara tenía que gritar,
  // con lo cual se comía el contraste de lo que se dibujaba encima:
  //     --sx-edge  sobre accent-soft:  2.71  (piso 3.0)
  //     --sx-ink-3 sobre accent-soft:  4.57, y 4.25 con la perilla en gris
  // Al pasar «seleccionado» a su propio relleno, --sx-accent-pick (ver abajo),
  // este token se queda sólo con el hover y el focus, que son pasajeros y no
  // necesitan gritar. A 10 % (con las bases de n-400/n-500 ya oscurecidas por
  // --sx-accent-pick, ver ahí):
  //     --sx-edge  sobre accent-soft:  3.84 morado / 3.59 gris
  //     --sx-ink-3 sobre accent-soft:  5.61 morado / 5.22 gris
  // Sube de 10 % a 14 % junto con el campo. Al profundizar --sx-ground (6→11 %)
  // el relleno suave quedó a 1.048 contra él —por debajo del piso de 1.05— y una
  // `Card variant="filled"`, que no tiene sombra que la separe, se perdía sobre
  // el campo. Más traza acá la devuelve a ser una superficie; de paso sube el
  // contraste del texto que se apoya encima, no lo baja.
  '--sx-accent-soft': 'color-mix(in srgb, var(--sx-accent) 14%, #FFFFFF)',
  // EL RELLENO DE SELECCIÓN. Existe separado de --sx-accent-soft porque son dos
  // estados distintos y compartir token los volvía indistinguibles: seleccionar
  // una fila y pasar el puntero por la de al lado las dejaba iguales.
  //
  // POR QUÉ 18 %. Tiene que despegarse del hover (10 %) y aguantar lo que se
  // dibuja ENCIMA. Medido contra las dos configuraciones de --sx-chrome-tint:
  //     --sx-edge  encima:  3.38 morado / 3.16 gris   (piso 3.0)
  //     --sx-ink-3 encima:  4.94 morado / 4.60 gris   (piso 4.5)
  // A 20 % la tinta terciaria cae a 4.45 con la perilla en gris. 18 % es el
  // último escalón que aguanta las dos.
  '--sx-accent-pick': 'color-mix(in srgb, var(--sx-accent) 18%, #FFFFFF)',
  '--sx-accent-edge': 'color-mix(in srgb, var(--sx-accent) 28%, #FFFFFF)',

  // Semantic tones. Fixed across every product: "vencido" must look identical
  // in maintenance, billing and inventory or the vocabulary stops being one.
  //
  // VARIANTE COLORIDA: las bandas ganan croma — salvia, ámbar, coral e índigo
  // de la dirección neumórfica — pero la tinta de cada tono sigue siendo la
  // que carga el significado y sigue medida a 4.5 contra su banda. El color
  // sube en el relleno, no en la palabra.
  '--sx-positive': '#276A47',
  '--sx-positive-band': '#DDF0E4',
  '--sx-positive-edge': '#B5DCC5',
  '--sx-attention': '#8A5A00',
  '--sx-attention-band': '#FCEBD0',
  '--sx-attention-edge': '#F0D29C',
  // Coral en vez de rojo ladrillo: el mismo «crítico», con la temperatura de
  // la paleta nueva.
  '--sx-critical': '#B02840',
  '--sx-critical-band': '#FCDDE3',
  '--sx-critical-edge': '#F3BAC6',
  // Muted indigo, deliberately not blue: blue chrome is what every ERP already
  // looks like, and this is the one convention the system declines. La
  // variante le sube el croma sin cruzar a azul.
  '--sx-info': '#434A93',
  // La banda se corre hacia el azul FRÍO y no hacia el violeta: a #E4E6F8 quedaba
  // a ΔE 4.57 de la fila elegida con el acento morado (piso 5.3, `evalAccent`)
  // — «informativo» y «seleccionado» se leían como el mismo lavanda.
  '--sx-info-band': '#E2E8F7',
  '--sx-info-edge': '#C4C8EC',
  // FIJADO A HEX, como los otros cuatro. Apuntaba a la rampa (n-500/n-100/n-200),
  // así que su color cambiaba con el cromo de cada dirección: «ninguno» se veía
  // distinto entre dos productos, que es exactamente lo que la ley prohíbe. Estos
  // son los valores que resolvía con el cromo de Nácar, congelados.
  '--sx-neutral': '#666373',
  '--sx-neutral-band': '#EDEBF3',
  '--sx-neutral-edge': '#D3D1DF',

  // Depth comes from light, not outlines. Sobre un fondo blanco la sombra es lo
  // único que levanta una pieza, así que lleva dos capas: una corta que da el
  // asiento y una larga que da el aire. El tinte NO es gris — una sombra gris
  // bajo una familia lavanda parece suciedad — pero lleva un tercio del violeta
  // de Prisma pastel, no el violeta entero.
  //
  // VARIANTE COLORIDA — SOFT-UI DE STITCH, CON SU PROFUNDIDAD. Valores medidos
  // sobre los HTML que generó Stitch (getComputedStyle de cada pieza con sombra):
  // la profundidad no está en una sombra grande, está en que CADA pieza tiene la
  // suya, en dos direcciones.
  //   levantado · luz #FFF afuera arriba-izquierda + violeta afuera abajo-derecha
  //     --sx-e-card  contenedores: tarjeta, barra lateral, encabezado, tabla
  //     --sx-e-1     controles: botón, ítem activo, fila de lista
  //     --sx-e-2     el mismo control levantado un escalón (hover, tooltip)
  //     --sx-e-chip  lo más chico: chip de filtro, avatar, número de página
  //   hundido · lo inverso, adentro (ver --sx-e-sunk, --sx-e-well, --sx-e-pill)
  // Lo que FLOTA (--sx-e-3: menús, hojas, toasts, popups) no lleva la luz.
  // SUPER CLAY (pedido del usuario sobre la línea de Stitch): a cada nivel se le
  // suma, ADENTRO, un filo de luz de 1 px arriba-izquierda y un volumen violeta
  // abajo-derecha. Afuera sigue mandando la luz blanca de Stitch; adentro la
  // pieza se abulta en vez de ser una lámina con sombra.
  // LA LUZ, DOS VECES MÁS BAJA (pedidos del usuario, 2026-09-23: «el brillo
  // blanco está muy fuerte», y después «una pizca más discreto, adaptado al
  // fondo»): los valores salen de `clayElevation` (arriba, junto a la arcilla de
  // cada módulo) — una luz teñida de la propia superficie a .55 / .5 / .6. La
  // sombra violeta no se toca: el volumen sigue, lo que baja es el resplandor.
  '--sx-e-1': LILAC_E['--sx-e-1'],
  '--sx-e-2': LILAC_E['--sx-e-2'],
  '--sx-e-card': LILAC_E['--sx-e-card'],
  '--sx-e-chip': LILAC_E['--sx-e-chip'],
  // El primario de Stitch (tabla): la luz blanca afuera y una sombra del COLOR
  // del acento, fuerte. Se re-declara en oscuro (el acento cambia).
  '--sx-e-primary': LILAC_E['--sx-e-primary'],
  // El ítem activo de una navegación es un control levantado (Stitch, riel B).
  '--sx-e-nav': 'var(--sx-e-1)',
  '--sx-e-3': LILAC_E['--sx-e-3'],
  '--sx-e-inset': 'inset 0 1px 0 rgba(255,255,255,.9)',
  // EL TALLADO: lo inverso del relieve. La sombra entra por arriba-izquierda y
  // la luz sale por abajo-derecha, así que la pieza se lee HUNDIDA en su
  // superficie — un pozo, una ranura, un botón apretado.
  // HUNDIDO. --sx-e-sunk: campos, rieles, contadores (Stitch: 2.5/6 al .20).
  // --sx-e-well: el pozo de ícono, el mismo hueco. --sx-e-pill: lo chico que se
  // hunde — la pill de estado y el chip de filtro ELEGIDO (1.5/3 al .14).
  '--sx-e-sunk': LILAC_E['--sx-e-sunk'],
  '--sx-e-well': LILAC_E['--sx-e-well'],
  '--sx-e-pill': LILAC_E['--sx-e-pill'],
  // LA CAJA DE UN CONTROL, como perilla. Desde la v0.8.14 el campo se levantaba
  // con --sx-e-1; acá se talla. Son dos tokens y no un valor escrito en cada
  // componente para que la decisión siga siendo UNA: un producto que quiera el
  // campo levantado re-liga `--sx-e-field: var(--sx-e-1)` y
  // `--sx-field: var(--sx-surface)` en su raíz, sin tocar Field, Combobox,
  // DatePicker, Checkbox ni Radio.
  '--sx-e-field': 'var(--sx-e-sunk)',
  '--sx-field': 'var(--sx-sunk)',

  // La forma de Prisma: 12 y 22. Nada cuadrado, y nada casi-cuadrado.
  // VARIANTE COLORIDA: 16 y 24 — los de Stitch (campos rounded-2xl, tarjetas
  // 22–24). --sx-r-1 NO se mueve: es el radio del checkbox, y el checkbox tiene
  // que seguir leyéndose cuadrado al lado del radio redondo.
  '--sx-r-1': '8px',
  '--sx-r-2': '16px',
  // Super clay: el contenedor se redondea a 28 (Stitch va de 22 a 26).
  '--sx-r-3': '28px',
  '--sx-r-pill': '999px',

  // Major third off 15 — the smallest size that survives a dirty screen at
  // arm's length.
  '--sx-t-2xs': '11px',
  '--sx-t-xs': '12.5px',
  '--sx-t-sm': '13.5px',
  '--sx-t-md': '15px',
  '--sx-t-lg': '19px',
  '--sx-t-xl': '25px',
  '--sx-t-2xl': '33px',
  '--sx-t-3xl': '46px',
  '--sx-w-normal': '400',
  '--sx-w-medium': '550',
  '--sx-w-semi': '620',
  '--sx-w-bold': '700',

  // A system stack by constraint: @font-face inside a shadow root is ignored by
  // Chrome and Safari, so an embedded face would silently not load in exactly
  // the surfaces this library exists to serve. Personality comes from
  // treatment — weight contrast, negative tracking, tabular figures.
  //
  // VARIANTE COLORIDA: la familia se NOMBRA primero y el stack de sistema queda
  // detrás como red. La restricción de arriba sigue en pie y es por qué esto
  // funciona igual: un @font-face declarado DENTRO de un shadow root se ignora,
  // pero uno declarado en el DOCUMENTO sí alcanza a los shadow roots. La lib no
  // carga ninguna fuente: la carga el anfitrión (el Shell, el catálogo) y si no
  // la carga, el control cae al sistema y se ve como antes — nunca roto.
  '--sx-font':
    '"Outfit", ui-sans-serif, system-ui, -apple-system, "Segoe UI Variable Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  '--sx-font-mono':
    '"JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Roboto Mono", monospace',

  // LA PALETA DE CATEGORÍA. No son tonos: un tono dice «vencido» y es igual en
  // todos los productos; un matiz distingue COSAS (equipos, familias, series de
  // un gráfico) y no significa nada por sí solo. Por eso no tienen banda ni
  // piso de contraste propio: se usan como tinte (pozos de ícono, series), y
  // cuando cargan texto lo hacen a través de un tono o de --sx-ink.
  '--sx-hue-violet': '#6541BE',
  '--sx-hue-aqua': '#1FA6B8',
  '--sx-hue-coral': '#EE6079',
  '--sx-hue-amber': '#E39A2E',
  '--sx-hue-sage': '#4CA777',
  '--sx-hue-indigo': '#5566D6',

  // ── PERILLAS DE LA VARIANTE ─────────────────────────────────────────────
  // Cada una tiene en el componente un fallback que reproduce `main`; acá toman
  // el valor de la dirección de Stitch. Quitar una línea devuelve ese pedazo.
  //
  // Button: en Stitch los botones son de radio 12 (rounded-xl), no píldoras.
  // `--sx-btn-radius` lo fija; `--sx-btn-solid` es su relleno (en main, el degradé brillante);
  // `--sx-btn-gloss` es la opacidad del brillo especular de arriba (main: .42).
  '--sx-btn-radius': '14px',
  '--sx-btn-solid': 'var(--sx-accent)',
  '--sx-btn-gloss': '0',
  // PageHeader variant="banda": en Stitch no hay bloques saturados — el color
  // viaja en dosis chicas sobre tarjetas claras. `--sx-banda-tint` es cuánto
  // acento lleva el relleno (main: 100 %, el acento pleno); `--sx-banda-ink` la
  // tinta encima; `--sx-banda-remap` si las acciones de la banda se invierten
  // (main: 100 %, porque sobre un relleno de acento un botón de acento no se ve;
  // sobre un pastel sí, así que acá 0 %).
  // 22 %: el encabezado lleva el color del módulo en pastel. Se probó 0 %
  // (tarjeta clara, como Stitch) y el usuario lo pidió de vuelta: el color del
  // encabezado es cómo se sabe en qué módulo se está.
  '--sx-banda-tint': '22%',
  '--sx-banda-ink': 'var(--sx-ink)',
  '--sx-banda-remap': '0%',
  // Una banda con `tone` attention/critical se oscurece con tinta en main (1);
  // sobre el pastel eso da barro, así que la variante no (0).
  '--sx-banda-alarm': '0',
  // Pill: en Stitch las pills de estado son un hueco teñido, sin filo.
  '--sx-pill-line': 'transparent',
  // SidebarItems: el ítem activo es superficie levantada (--sx-e-nav), sin el
  // relleno de selección (0 % de --sx-accent-pick). Pagination: cada página
  // lleva superficie (100 %) para que su relieve tenga dónde apoyarse.
  '--sx-nav-pick': '0%',
  '--sx-pg-raise': '100%',
  // Sin filo de color a la izquierda en avisos y fichas (main: 3px): Toast y
  // ReviewPanel dicen el tono con su marca o su Pill. En Toast, la marca va en
  // un pozo hundido de su banda, como una Pill sin palabra.
  '--sx-tone-bar': '0px',
  '--sx-toast-mark': '1',
  '--sx-toast-mark-e': 'var(--sx-e-pill)',
  // Un estado (EmptyState, ErrorState) adentro de un contenedor se HUNDE en vez
  // de levantarse como otra tarjeta (main: superficie, --sx-e-1, radio 28).
  // Table, Card y Panel lo aplican solos; un contenedor del core, con `.sx-nest`.
  '--sx-nest-bg': 'var(--sx-sunk)',
  '--sx-nest-e': 'var(--sx-e-sunk)',
  '--sx-nest-r': 'var(--sx-r-2)',
  // Table: las columnas `numeric` en la mono (main: la fuente de la interfaz).
  '--sx-num-font': 'var(--sx-font-mono)',
  // Panel: cabecera sin banda (main: --sx-thead), como el patrón contenedor.
  '--sx-panel-head': 'transparent',
  // StatStrip como bandeja: pozo hundido, cifras en fichas levantadas (main:
  // mosaico con raya de 1px, sin relleno, con --sx-e-1 afuera).
  '--sx-strip-bg': 'var(--sx-sunk)',
  '--sx-strip-gap': 'var(--sx-s-2)',
  '--sx-strip-pad': 'var(--sx-s-2)',
  '--sx-strip-e': 'var(--sx-e-sunk)',
  '--sx-strip-cell-e': 'var(--sx-e-1)',
  '--sx-strip-cell-r': 'var(--sx-r-1)',

  // Quarters of a 16 rhythm. Every gap in the system is one of these.
  '--sx-s-1': '4px', '--sx-s-2': '8px', '--sx-s-3': '12px', '--sx-s-4': '16px',
  '--sx-s-5': '20px', '--sx-s-6': '24px', '--sx-s-8': '32px', '--sx-s-10': '40px',
  '--sx-s-12': '48px', '--sx-s-16': '64px', '--sx-s-20': '80px',

  // Motion earns its place by doing a job. Never ambience.
  '--sx-ease': 'cubic-bezier(.2, .8, .2, 1)',
  '--sx-fast': '120ms',
  '--sx-beat': '220ms',
  '--sx-slow': '380ms',

  // The veil behind anything that took the screen. It is a ROLE and not a mix
  // of the neutral ramp, because the ramp does NOT re-bind in dark: mixing
  // `--sx-n-900` over an `--sx-n-900` ground is exactly nothing, at any
  // percentage, and three components had independently discovered that and
  // patched around it three different ways.
  '--sx-scrim': 'rgba(26, 24, 34, .46)',

  '--sx-touch': '44px',
  '--sx-z-sticky': '40',
  '--sx-z-overlay': '900',
  '--sx-z-toast': '1100',

  // NO ES UNA CUSTOM PROPERTY, y está acá a propósito: los widgets NATIVOS
  // —el checkbox de Table, el date picker de DateInput, el dropdown de Select,
  // los scrollbars— no leen ningún token; leen `color-scheme`. Sin esta
  // declaración el navegador los pinta claros dentro del tema oscuro (un
  // checkbox blanco brillante en una tabla oscura), porque el atributo
  // `data-sx-theme` re-liga variables pero no le dice nada al motor. Viaja en
  // TOKENS para salir por las DOS formas a la vez: tokens.css y hostTokens().
  'color-scheme': 'light'
};

/** Dark is a re-binding of the roles, never a second stylesheet. */
export const TOKENS_DARK = {
  '--sx-ground': 'var(--sx-n-900)',
  '--sx-surface': 'var(--sx-n-800)',
  // RETINTADOS con la traza de --sx-chrome-tint, igual que toda la rampa del
  // claro — antes eran hex sueltos de la dirección anterior, sin el 8% que el
  // resto del sistema lleva, y por eso el oscuro se leía de otra familia que
  // el claro. `--sx-edge` sobre `--sx-sunk` sigue en el contrato duro
  // (piso 3.0) y aguanta de sobra: 5.68 morado / 5.35 gris.
  '--sx-sunk': CHROME_DARK['--sx-sunk'],
  '--sx-line': CHROME_DARK['--sx-line'],
  // FIJADO A HEX, y no a un peldaño de la rampa, por la misma razón que
  // --sx-ink-3 más abajo: un borde tiene DOS LADOS y los tres fondos posibles
  // debajo suyo (superficie, hover, selección) mandan el peor caso. Medido
  // contra la matriz completa (2 temas × 2 perillas del cromo), el peor caso
  // es siempre --sx-accent-pick con la perilla en gris:
  //     contra --sx-surface:      5.10 morado / 4.78 gris  (piso 3.0)
  //     contra --sx-ground:       5.91 morado / 5.63 gris  (piso 3.0)
  //     contra --sx-accent-soft:  4.24 morado / 3.97 gris  (piso 3.0)
  //     contra --sx-accent-pick:  3.47 morado / 3.26 gris  (piso 3.0) — el que manda
  // El valor viejo, #3A3F43, daba 1.33 contra superficie: un borde casi
  // invisible sobre su propio fondo, que es la clase de defecto que este
  // arnés existe para atrapar y que nada atrapaba porque nada lo medía en
  // este tema.
  '--sx-edge': '#9C9AA1',
  // RETINTADO con la traza de --sx-chrome-tint al 4% — la misma idea que
  // --sx-n-50 en el claro (el peldaño más claro de la rampa lleva la traza
  // más liviana). Sigue dando 11.6:1 / 11.1:1 (morado/gris) contra
  // --sx-surface, muy por encima del piso de 4.5: había margen de sobra para
  // ganar coherencia sin arriesgar nada del contrato.
  '--sx-ink': CHROME_DARK['--sx-ink'],
  // RETINTADO con la traza de --sx-chrome-tint al 6%. Es el que menos margen
  // tenía de los cinco hex fríos —está en el contrato duro contra tres
  // fondos, no sólo contra la superficie— así que se verificó el peor caso
  // antes de tocarlo: contra --sx-accent-pick con la perilla en gris quedaba
  // en 4.84 (piso 4.5, con 0.34 de margen). El resto sobraba: 7.08/7.28 contra
  // superficie, 5.88/6.04 contra --sx-accent-soft (gris/morado).
  //
  // BASE SUBIDA DE #BCC1C4 A #CED2D4 — el sexto caso, no una falla de
  // legibilidad. --sx-ink-3 (ver abajo) subió en su momento para pasar el
  // piso sobre --sx-accent-pick, y este token se retintó por separado; las
  // dos rutas independientes llegaron a valores casi iguales: 1.044:1 entre
  // sí con la perilla morada, 1.003:1 con la gris (piso 1.05 de la clase 2,
  // `scripts/contrast.mjs`) — la jerarquía de tres registros de texto se leía
  // como dos. --sx-ink-3 no se podía bajar sin volver a romper el piso sobre
  // --sx-accent-pick que lo subió la primera vez —es el más exigente de los
  // dos—, así que subió éste: contra --sx-ink-3, 1.14:1 morado / 1.18:1
  // gris. El resto mejora con el mismo movimiento, no se resiente: 5.87
  // morado / 5.73 gris contra --sx-accent-pick, 7.16 / 6.96 contra
  // --sx-accent-soft, 8.63 / 8.38 contra --sx-surface — todos con más margen
  // que antes, porque un texto más claro sobre un fondo oscuro siempre da
  // más contraste, nunca menos.
  '--sx-ink-2': CHROME_DARK['--sx-ink-2'],
  // SUBIÓ DE #8E9498 A #BEBDC1. El valor viejo pasaba sobre --sx-surface
  // (4.62) pero fallaba sobre los dos estados que --sx-accent-pick y
  // --sx-accent-soft producen una vez que esos dos dejan de heredar del claro
  // (ver abajo): 4.29 sobre hover, 2.99 sobre selección — el defecto que trajo
  // la tarea anterior.
  //
  // Verificado de nuevo contra la matriz completa (2 temas × 2 perillas): el
  // peor caso sigue siendo --sx-accent-pick, y sigue pasando con margen —
  // 5.17 morado / 4.86 gris (piso 4.5) — porque --sx-accent-soft y
  // --sx-accent-pick ya no aclaran mezclando blanco, mezclan el acento nuevo
  // (ver ahí), que es menos luminoso: el fondo quedó más oscuro, no más
  // claro, así que --sx-ink-3 no tuvo que subir de nuevo. Contra
  // --sx-accent-soft: 6.31 morado / 5.90 gris. Contra --sx-surface: 7.59
  // morado / 7.11 gris.
  //
  // Y ES UN HEX FIJO A PROPÓSITO, no un `var(--sx-n-400)`: n-400 es el peldaño
  // que --sx-edge (el claro) usa, y ya se movió dos veces en este trabajo por
  // razones que no tienen nada que ver con el oscuro — la próxima vez que se
  // mueva por el claro, el oscuro no puede quedar colgando de ese ajuste. Es
  // también por qué el arreglo de la convergencia con --sx-ink-2 de arriba se
  // hizo del otro lado: este valor es el que ya no tenía margen para moverse.
  '--sx-ink-3': '#BEBDC1',
  '--sx-ink-on': 'var(--sx-n-900)',
  // EL ENCABEZADO. Mismo rol que en claro — separar cabecera de tabla, pie de
  // panel — pero la dirección se invierte: en claro el thead es la superficie
  // con un tinte del 6%; en oscuro, oscurecer la superficie la hunde, y una
  // cabecera más oscura que su propia tarjeta se lee como un agujero recortado
  // en la tarjeta, no como una banda posada sobre ella. Aclararla con blanco
  // hace el mismo trabajo que el tinte del claro —una banda apenas distinta—
  // pero en la dirección que en oscuro SÍ se ve como una banda.
  //
  // SUBIÓ DE 6% A 10%, y no por legibilidad — contra --sx-surface ya pasaba
  // de sobra (1.09:1 citado acá antes era el número del CLARO copiado a este
  // bloque; el real, con el 6%, medía 1.20:1). El motivo es el sexto caso:
  // «pasa el contrato» no es lo mismo que «se distingue», y `--sx-thead`
  // (blanco al 6% sobre la superficie) y `--sx-accent-soft` (el acento al 8%,
  // y el acento del oscuro es un lavanda muy claro) llegaban por caminos
  // independientes al MISMO color — 1.002:1 entre sí con la perilla morada,
  // 1.000:1 con la gris — así que el hover de `.sortbtn` en `data/Table.svelte`
  // era un no-op sobre una cabecera que ya se veía idéntica al estado que
  // se supone debía reemplazar. Al 10 %: 1.14:1 morado / gris contra
  // --sx-accent-soft (piso 1.05 de la clase 2, `scripts/contrast.mjs`) y
  // 1.37:1 contra --sx-surface — todavía una banda, no un bloque. Se movió
  // --sx-thead y no --sx-accent-soft porque --sx-accent-soft pinta el hover
  // de casi toda la librería en oscuro; --sx-thead sólo mueve cabecera de
  // tabla, cabecera de panel y pie de panel — el ajuste más chico que cierra
  // el hueco.
  //
  // Se deriva de la superficie (n-800 de la misma traza) en vez de fijarse a
  // un hex suelto — la derivación vive en chromeRampDark(), precomputada por
  // el banner de arriba, así que sigue a la receta de la superficie si el
  // gris de base se recalibra.
  '--sx-thead': CHROME_DARK['--sx-thead'],
  // LA FIRMA, en oscuro. Sigue resolviendo `var(--sx-accent)`, así que cuando
  // el acento se movió de casi-blanco a lavanda (ver --sx-accent abajo) este
  // token heredó el cambio sin tocarse — es justo el punto de que sea una
  // perilla y no un hex propio.
  //
  // 18% sigue siendo la cifra elegida a mano, no medida por el arnés — este
  // token no está en el contrato duro ni en el informativo porque no es una
  // relación de texto ni de borde, es una sombra translúcida y su intensidad
  // es un juicio de diseño. El argumento de fondo no cambia con el acento
  // nuevo: #D1C6EC sigue siendo mucho más claro que la superficie oscura que
  // tiene detrás (10.18:1 contra tinta oscura, ver --sx-accent), así que la
  // relación de contraste sigue invertida y a favor del halo. Sigue sin
  // confirmarse mirando la pantalla — ver el reporte.
  '--sx-halo': 'color-mix(in srgb, var(--sx-accent) 18%, transparent)',
  // EL ACENTO YA NO ES CASI-BLANCO. Antes valía #EDEFF0, heredado de una
  // dirección donde el cromo era acromático y el acento hacía de tinta. Nácar
  // dice lo contrario: «el acento y el estado son el único color de la
  // pantalla», y con el acento casi-blanco el oscuro de Nácar no tenía color
  // de marca en NINGÚN píxel — el botón primario era un rectángulo blanco, el
  // foco era blanco, los enlaces eran blancos.
  //
  // En oscuro el acento tiene que seguir siendo CLARO (va sobre tinta oscura,
  // y --sx-accent-ink de abajo lo asume) pero llevando la marca: es el morado
  // de Nácar (#6541BE, el mismo hex que --sx-accent del claro) aclarado con
  // blanco. Se midió a tres mezclas — tinta oscura (`var(--sx-n-900)`)
  // encima, con la perilla del cromo en su default morado:
  //     62% blanco → #C4B7E6 → 8.81:1
  //     70% blanco → #D1C6EC → 10.18:1  ← elegido (9.70:1 con la perilla en gris)
  //     78% blanco → #DDD5F1 → 11.63:1
  // 70% deja marca reconocible — no se lava a blanco — y de sobra sobre el
  // piso de 4.5 para la tinta que se dibuja encima, en las dos perillas.
  '--sx-accent': '#D1C6EC',
  '--sx-accent-ink': 'var(--sx-n-900)',
  // LA TRAMPA CENTRAL DE ESTE TEMA, Y POR QUÉ YA NO APLICA. Hasta acá,
  // --sx-accent-soft y --sx-accent-pick ACLARABAN LA SUPERFICIE MEZCLANDO
  // BLANCO, no el acento — el comentario original lo justificaba así: «el
  // acento en oscuro YA es casi blanco, así que mezclarlo daría casi lo mismo
  // que mezclar blanco puro». Esa premisa se cae con el punto de arriba: el
  // acento ya no es casi blanco, es un lavanda con marca reconocible, así que
  // mezclar uno u otro deja de ser lo mismo. Seguir mezclando blanco sería
  // repetir, en oscuro, el mismo defecto que el CLARO de Nácar ya corrigió
  // para estos dos tokens («`--sx-accent-soft`, `--sx-accent-pick` y
  // `--sx-accent-edge` derivan del acento» en el README): un estado
  // interactivo pintado con un gris fijo se lee como una superficie más
  // sucia, no como una pieza que responde a LA marca.
  //
  // Se pasan a derivar de --sx-accent, igual que el claro — la única
  // diferencia es contra qué se mezclan: el claro mezcla contra blanco (su
  // superficie es blanca); el oscuro mezcla contra --sx-surface (la suya).
  // Mismos porcentajes que ya tenía —8% hover, 16% selección—, porque lo que
  // cambió no fue la proporción, fue CONTRA QUÉ se mezclaban:
  //     --sx-accent-soft → #393645 morado / #3C3B42 gris
  //     --sx-accent-pick → #464254 morado / #494751 gris
  // Contra la matriz completa (2 temas × 2 perillas) el peor caso sigue
  // siendo --sx-edge sobre --sx-accent-pick con la perilla en gris: 3.26:1
  // (piso 3.0, antes 2.87). --sx-ink-3 en el mismo fondo: 4.86:1 (piso 4.5,
  // antes 4.27). Con este cambio NINGUNO de --sx-edge, --sx-ink-2 e
  // --sx-ink-3 tuvo que moverse: el lavanda (#D1C6EC) es menos luminoso que
  // el blanco puro que mezclaban antes, así que el fondo resultante queda MÁS
  // oscuro a igual porcentaje y deja más margen, no menos. Es la razón por la
  // que esta tarea no tocó esos tres valores — la que resolvió el hueco fue
  // esta derivación, no otra vuelta de oscurecer texto.
  '--sx-accent-soft': 'color-mix(in srgb, var(--sx-accent) 8%, var(--sx-surface))',
  // Mismo cambio que --sx-accent-soft arriba, y el mismo motivo. Antes de
  // esta tarea este token ni siquiera existía en oscuro — heredaba el
  // `--sx-accent-pick` del CLARO, un lavanda pensado para oscurecer blanco,
  // cayendo sobre una superficie que ya era oscura; la fila seleccionada se
  // pintaba con ese lavanda y la tinta oscura encima caía a 2.99 contra un
  // piso de 4.5. Ese defecto es el que dio origen a esta tarea y ya está
  // cerrado por la derivación de arriba: ver los números ahí.
  '--sx-accent-pick': 'color-mix(in srgb, var(--sx-accent) 16%, var(--sx-surface))',
  // RETINTADO con la traza de --sx-chrome-tint al 8%, igual que el resto de
  // los hex fríos de este bloque. No está en el contrato duro ni en el
  // informativo —se usa sólo como filo de insignia ya seleccionada
  // (ChoiceCards.svelte) y como raya divisoria (SplitButton.svelte), ninguno
  // de los dos es lo que identifica el componente— así que no hay piso que
  // verificar; el retinte es coherencia de familia, no una comprobación.
  '--sx-accent-edge': CHROME_DARK['--sx-accent-edge'],
  // The bands invert to low-chroma fills: a pale band with dark text does not
  // survive being dropped onto a dark ground.
  '--sx-positive': '#8FCB9B', '--sx-positive-band': '#1D2C21', '--sx-positive-edge': '#2E4436',
  '--sx-attention': '#E7BE72', '--sx-attention-band': '#2E2415', '--sx-attention-edge': '#48381E',
  '--sx-critical': '#F0A79E', '--sx-critical-band': '#331B18', '--sx-critical-edge': '#4D2823',
  '--sx-info': '#ACADD6', '--sx-info-band': '#1F2033', '--sx-info-edge': '#33344F',
  // APUNTABA A var(--sx-n-400) — el mismo peldaño de la rampa que --sx-edge
  // (el claro) usa y que ya se movió dos veces por razones ajenas al oscuro.
  // Colgado de ahí daba 3.37 contra --sx-neutral-band, por debajo del piso de
  // 4.5, y encima quedaba a merced del próximo ajuste del claro. Se liga a
  // --sx-ink-3 en vez de fijarse a un hex propio: son el mismo trabajo —una
  // tinta gris clara, legible sobre superficies oscuras, que no puede depender
  // de un peldaño ajeno— y «ninguno» hereda directamente la garantía ya
  // verificada de --sx-ink-3 en lugar de duplicar el mismo número dos veces.
  // Da 8.06 contra --sx-neutral-band (piso 4.5).
  '--sx-neutral': 'var(--sx-ink-3)', '--sx-neutral-band': '#23272A', '--sx-neutral-edge': '#3A3F43',
  // Heavier in dark, and pure black rather than the ramp: on a near-black ground
  // the only thing that still reads as «behind» is more absence of light.
  '--sx-scrim': 'rgba(0, 0, 0, .62)',
  // VARIANTE COLORIDA: el soft-UI de Stitch en oscuro. La luz de afuera baja a
  // un 4 % (más, y el borde se lee como un filo luminoso); la sombra se hace
  // negra y más densa.
  '--sx-e-1': '-3px -3px 8px rgba(255,255,255,.04), 3px 4px 10px rgba(0,0,0,.5), inset 1px 1px 1px rgba(255,255,255,.06), inset -1px -2px 4px rgba(0,0,0,.25)',
  '--sx-e-2': '-5px -5px 12px rgba(255,255,255,.05), 5px 6px 14px rgba(0,0,0,.55), inset 1px 1px 1px rgba(255,255,255,.07), inset -1px -2px 5px rgba(0,0,0,.28)',
  '--sx-e-card': '-7px -7px 16px rgba(255,255,255,.04), 7px 8px 20px rgba(0,0,0,.55), inset 1px 1px 1px rgba(255,255,255,.06), inset -2px -3px 7px rgba(0,0,0,.25)',
  '--sx-e-chip': '-2px -2px 6px rgba(255,255,255,.035), 2px 3px 8px rgba(0,0,0,.45), inset 1px 1px 0 rgba(255,255,255,.05)',
  '--sx-e-primary': '-3px -3px 8px rgba(255,255,255,.04), 3px 3px 12px color-mix(in srgb, var(--sx-accent) 30%, transparent)',
  '--sx-e-nav': 'var(--sx-e-1)',
  '--sx-btn-solid': 'var(--sx-accent)',
  '--sx-banda-ink': 'var(--sx-ink)',
  '--sx-e-3': '0 24px 48px -16px rgba(0,0,0,.6), 0 6px 14px -6px rgba(0,0,0,.45)',
  '--sx-e-inset': 'inset 0 1px 0 rgba(255,255,255,.05)',
  '--sx-e-sunk': 'inset 2.5px 2.5px 6px rgba(0,0,0,.5), inset -2.5px -2.5px 6px rgba(255,255,255,.04)',
  '--sx-e-well': 'inset 2.5px 2.5px 6px rgba(0,0,0,.5), inset -2.5px -2.5px 6px rgba(255,255,255,.04)',
  '--sx-e-pill': 'inset 1.5px 1.5px 3px rgba(0,0,0,.4), inset -1.5px -1.5px 3px rgba(255,255,255,.04)',
  // RE-DECLARADOS, AUNQUE EL TEXTO SEA EL MISMO QUE EN TOKENS. Un `var()` dentro
  // de una custom property se resuelve donde se DECLARA: en `:root` estos dos ya
  // valen el sunk CLARO, y un subárbol `.sx-dark` (el marco de un teléfono en el
  // catálogo móvil, una sección oscura dentro de una página clara) los hereda ya
  // resueltos aunque re-ligue --sx-sunk. Es la misma razón por la que
  // --sx-surface, --sx-ink y compañía se repiten en este bloque. Visto en el
  // catálogo móvil: el buscador del teléfono Android oscuro salía claro.
  '--sx-e-field': 'var(--sx-e-sunk)',
  '--sx-field': 'var(--sx-sunk)',
  // Los alias de la variante, por la misma razón. Faltaban y un estado anidado,
  // la tira de cifras o la marca del Toast dentro de un `.sx-dark` se pintaban
  // con el pozo CLARO (lo encontró el pulido de strix-mobile-lib). Desde acá,
  // scripts/tokens.mjs se niega a generar si un alias de un token que cambia con
  // el tema no está re-declarado en este bloque.
  '--sx-glow-color': 'var(--sx-accent)',
  '--sx-toast-mark-e': 'var(--sx-e-pill)',
  '--sx-nest-bg': 'var(--sx-sunk)',
  '--sx-nest-e': 'var(--sx-e-sunk)',
  '--sx-strip-bg': 'var(--sx-sunk)',
  '--sx-strip-e': 'var(--sx-e-sunk)',
  '--sx-strip-cell-e': 'var(--sx-e-1)',

  // La otra mitad de `color-scheme: light` en TOKENS — ver el comentario ahí.
  // Es lo que oscurece los widgets nativos (checkbox, date picker, scrollbar)
  // cuando el tema es oscuro; sin esto quedan pintados con la carcasa clara.
  'color-scheme': 'dark'
};

const decls = (o) => Object.entries(o).map(([k, v]) => `  ${k}: ${v};`).join('\n');

/**
 * The tokens as a CSS block for a given selector.
 *
 * A Core module calls `hostTokens()` and drops the result into its root
 * component's own <style>, so the very first paint is already themed and the
 * module owes the document nothing. A SvelteKit app imports `tokens.css`
 * instead and never touches this.
 */
export const hostTokens = (selector = ':host') =>
  `${selector} {\n${decls(TOKENS)}\n}\n`;

export const hostTokensDark = (selector = ':host([data-sx-theme="dark"])') =>
  `${selector} {\n${decls(TOKENS_DARK)}\n}\n`;

/**
 * The three type registers, the focus rule and the screen-reader-only rule, as
 * a string, for the same reason `hostTokens` exists.
 *
 * Components in this library write `class="sx-cap"`, `class="sx-num"`,
 * `class="sx-id"` and `class="sx-sr"` on their own markup. In a document those
 * classes come from `base.css`. In a shadow root they come from NOWHERE unless
 * the module carries them, and the failure is silent and ugly: labels stop
 * being uppercase, figures stop lining up, and every visually-hidden name in a
 * Table paints itself on screen. So a Core inlines `hostTokens() + hostBase()`
 * in its root component's `<style>` and the classes are true in both shapes.
 *
 * The reset (`box-sizing`, `body`) is deliberately NOT here: a shadow root has
 * no body, and `*` inside one is the module's own business.
 */
export const hostBase = () => `
/* El mismo reset de controles que base.css. Un shadow root no hereda las
   reglas del documento, así que sin esta línea todo botón de la lib que no
   declara su fuente (Tabs, Segmented, FilterChips, Pagination, la ✕ de Dialog
   y Alert, Toast, Calendar…) caía a la del agente de usuario —Arial— adentro
   de un core, al lado de un host en Outfit. Selector de elemento a propósito:
   pierde contra cualquier clase de componente, así que sólo llena el hueco. */
button, input, select, textarea { font: inherit; color: inherit; }
/* Un contenedor propio del core (su «Contenedor», su «cola») declara que lo de
   adentro está anidado: un EmptyState o ErrorState ahí se hunde. */
.sx-nest {
  --sx-state-bg: var(--sx-nest-bg, var(--sx-surface));
  --sx-state-e: var(--sx-nest-e, var(--sx-e-1));
  --sx-state-r: var(--sx-nest-r, var(--sx-r-3));
}
.sx-cap {
  font-size: var(--sx-t-2xs);
  font-weight: var(--sx-w-semi);
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--sx-ink-3);
}
.sx-id { font-family: var(--sx-font-mono); font-size: .94em; letter-spacing: -.015em; }
.sx-num {
  font-variant-numeric: tabular-nums lining-nums slashed-zero;
  font-feature-settings: "tnum" 1, "lnum" 1, "zero" 1;
}
.sx-sr {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip-path: inset(50%); white-space: nowrap; border: 0;
}
:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: 2px; border-radius: var(--sx-r-1); }
:host([data-sx-theme="dark"]) :focus-visible { outline-color: var(--sx-n-0); }
/* La barra de scroll: nuestra, flotante, y sin cobrarle ancho al contenido.
   Misma regla que base.css.
   La versión anterior de esta regla usaba «scrollbar-width: thin» con el thumb
   transparente en reposo, y decía —en este mismo comentario— que »el gutter
   fino se reserva siempre, así que aparecer/desaparecer NO mueve el layout».
   Eso era cierto y era el problema: el gutter se reserva SIEMPRE, o sea que la
   barra le cobra una franja al contenido aunque nadie la mire. Medido sobre el
   Shell:

       scrollbar-width: thin          →  11 px reservados, todo el tiempo
       scrollbar-width: auto          →  15 px
       ::-webkit-scrollbar{width:0}   →  15 px (el layout lo decide la propiedad
                                         estándar; la de webkit sólo pinta)
       scrollbar-width: none          →   0 px

   «none» es el único valor que no cobra nada, así que la nativa se apaga en
   todos lados y la afordancia la pone la acción «scrollbar» (shell/scrollbar.js),
   que dibuja una flotante: aparece al entrar el cursor o al scrollear, se va
   sola, se puede arrastrar, y no ocupa una sola columna de layout. */
* { scrollbar-width: none; }
*::-webkit-scrollbar { width: 0; height: 0; }

.sx-sbar {
  position: fixed;
  width: 10px;
  z-index: var(--sx-z-sticky, 100);
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--sx-beat) var(--sx-ease);
}
.sx-sbar.on { opacity: 1; pointer-events: auto; }
/* Delicada a propósito: 6px de ancho y la tinta al 20%. Se nota lo justo para
   decir «esto sigue hacia abajo» y no compite con un solo dato de la pantalla. */
.sx-sbar-thumb {
  width: 6px;
  margin-inline: 2px;
  border-radius: var(--sx-r-pill);
  background: color-mix(in srgb, var(--sx-ink) 20%, transparent);
  transition: background var(--sx-beat) var(--sx-ease);
}
.sx-sbar:hover .sx-sbar-thumb { background: color-mix(in srgb, var(--sx-ink) 34%, transparent); }
.sx-sbar-thumb:active { background: color-mix(in srgb, var(--sx-ink) 48%, transparent); }

@media (prefers-reduced-motion: reduce) {
  .sx-sbar, .sx-sbar-thumb { transition: none; }
}

/* Entrada escalonada opcional — misma regla que base.css. Sólo retrasa la
   animación que el hijo ya trae (la entrada de Card); no anima por su cuenta. */
.sx-stagger > *:nth-child(2) { animation-delay: 40ms; }
.sx-stagger > *:nth-child(3) { animation-delay: 80ms; }
.sx-stagger > *:nth-child(4) { animation-delay: 120ms; }
.sx-stagger > *:nth-child(5) { animation-delay: 160ms; }
.sx-stagger > *:nth-child(n+6) { animation-delay: 200ms; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
`;

/** What `tokens.css` is generated from. Keeps the two shapes honest. */
export const stylesheet = () =>
  `${hostTokens(':root')}\n${hostTokensDark(':root[data-sx-theme="dark"], .sx-dark')}`;

// ── UNICIDAD: el shell ADOPTA el tono del core embebido (CONTRACT §6) ─────────
// La rampa de cromo (el tinte NEUTRO: grises + fondo) es lo que un shell le
// «adopta» a un core montado para que ambos compartan un solo lienzo y el
// módulo no se lea como una pegatina. El acento NO está acá: cada módulo guarda
// el suyo (regla de marca por módulo). Como el core define estos tokens en su
// `:host`, un shell los puede LEER desde afuera y espejarlos en su documento.

/** Los tokens de la rampa de cromo — lo único que se adopta para la unicidad. */
// VARIANTE COLORIDA: se suman --sx-surface y --sx-sunk. En main salían de la
// rampa (n-0, n-50), así que adoptar la rampa ya los traía; en la variante son
// hex propios (#F6F3FC, #E6E1F1) y quedaban afuera. Con un core SIN migrar
// (superficie blanca, pozo gris) el Shell adoptaba su fondo gris pero dejaba su
// barra y sus tarjetas en lila encima: dos familias en una pantalla. Ahora el
// Shell adopta el fondo, la superficie y el pozo del core, migrado o no.
export const RAMP_TOKENS = [
  '--sx-chrome-tint', '--sx-ground', '--sx-thead', '--sx-surface', '--sx-sunk',
  '--sx-n-50', '--sx-n-100', '--sx-n-150', '--sx-n-200', '--sx-n-300',
  '--sx-n-400', '--sx-n-500', '--sx-n-700', '--sx-n-800', '--sx-n-900'
];

/**
 * Hace que `target` (por defecto, el documento) adopte la atmósfera de
 * `sourceEl` — típicamente el `:host` de un core embebido: su rampa, su acento
 * y su elevación (PALETTE_TOKENS). Así el chrome del shell (rieles, barra,
 * tarjetas) y el core son una sola aplicación, no un módulo pegado encima.
 * Revertir con `releasePalette`. Ver CONTRACT §6.
 * @param {Element} sourceEl  el elemento cuyo tono se copia (el `:host` del core)
 * @param {HTMLElement} [target]  dónde aplicarlo (default: `document.documentElement`)
 */
// LA SHELL NO TIENE LUZ PROPIA (pedido del usuario, 2026-09-23). Con la
// arcilla por módulo (`clayHost`), adoptar sólo el lienzo no alcanza: la barra
// lateral seguía con la sombra violeta y el acento del Shell al lado de un
// Mantenimiento crema con sombra ocre — dos aplicaciones apiladas. Ahora la
// Shell adopta TODO lo que hace a la atmósfera del módulo: la rampa, el
// acento y la elevación (la luz y la sombra de la arcilla). Revierte la regla
// vieja «el acento NO se adopta» de CONTRACT §6: mientras hay un módulo
// montado, la pantalla es UNA sola aplicación, la del módulo.
//
// Los alias (`--sx-line: var(--sx-n-150)`, `--sx-halo`, `--sx-e-nav`,
// `--sx-e-field`, `--sx-field`, `--sx-e-primary`…) no hace falta copiarlos: se
// re-resuelven solos en `:root` en cuanto su token de base queda adoptado ahí.
// `--sx-line`, `--sx-ink` y `--sx-ink-2` sí: en oscuro son literales teñidos.
export const PALETTE_TOKENS = [
  ...RAMP_TOKENS,
  '--sx-line', '--sx-ink', '--sx-ink-2',
  '--sx-accent', '--sx-accent-ink', '--sx-accent-soft', '--sx-accent-pick', '--sx-accent-edge', '--sx-accent-well',
  '--sx-e-1', '--sx-e-2', '--sx-e-card', '--sx-e-chip', '--sx-e-3', '--sx-e-primary',
  '--sx-e-sunk', '--sx-e-well', '--sx-e-pill'
];

export function adoptPalette(sourceEl, target = document.documentElement) {
  if (!sourceEl || !target) return;
  const cs = getComputedStyle(sourceEl);
  for (const t of PALETTE_TOKENS) {
    const v = cs.getPropertyValue(t).trim();
    if (v) target.style.setProperty(t, v);
  }
}

/**
 * Revierte `adoptPalette`: quita los overrides y deja que el tema del shell
 * vuelva a mandar. Llamalo al desmontar el core / salir de la ruta del módulo.
 * @param {HTMLElement} [target]  el mismo `target` que recibió `adoptPalette`
 */
export function releasePalette(target = document.documentElement) {
  if (!target) return;
  for (const t of PALETTE_TOKENS) target.style.removeProperty(t);
}
