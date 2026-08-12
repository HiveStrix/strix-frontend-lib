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
//
// EL SÉPTIMO CASO, Y POR QUÉ NINGUNA DE LAS DOS CLASES DE ARRIBA LO ATRAPA.
// `evalContract` mide un FRENTE contra un FONDO (¿se lee?). `evalDistinct`
// mide dos ROLES del propio sistema entre sí (¿se distinguen las piezas que
// ya vienen adentro?). Ninguna de las dos toca el color que ni siquiera es
// del sistema: el acento, que la primera regla del README llama «un hueco
// que cada producto llena». Un producto lo llenó con un amarillo, corrió
// `pnpm contrast` — que sólo conoce `TOKENS`, nunca el acento de otro — y
// pasó en las cuatro combinaciones. En pantalla, la fila que ese producto
// selecciona con su amarillo y la banda de `attention` («por vencer») se
// leían como el mismo color. La razón de contraste no lo iba a atrapar
// nunca: las dos superficies son claras, ninguna es texto, WCAG no tiene
// nada que decir sobre si dos colores CLAROS se parecen entre sí. Lo que
// hace falta ahí no es contraste — es distancia perceptual entre dos
// colores que no comparten ni luz ni oscuridad, y eso es ΔE2000, más abajo.
// `evalAccent()`, junto con `ACCENT_MIN` un poco más adelante, es la
// comprobación que cierra este hueco: toma CUALQUIER acento — no sólo el
// morado por defecto — y lo mide contra los cinco tonos del sistema antes de
// que un producto entero se entere mirando la pantalla en vez de corriendo
// un script.
//
// EL SEXTO CASO, Y POR QUÉ ES UN EJE DISTINTO. Las dos secciones de arriba
// cerraron dos huecos del mismo tipo de medición: un FRENTE contra un FONDO
// (texto sobre superficie, borde sobre estado). Hay un eje que ese tipo de
// medición no toca nunca: dos piezas que SIGNIFICAN cosas distintas —la
// cabecera y el hover de su propio control, el estado pasajero y el
// persistente, los dos registros de texto secundario— pueden resolver al
// MISMO color sin que ninguna comprobación de legibilidad lo note, porque las
// dos siguen siendo legibles contra lo que tienen detrás. Legible no es lo
// mismo que distinguible: dos colores que pasan el piso de 4.5 contra su
// fondo pueden estar a 1.00 el uno del otro. `evalDistinct()`, más abajo,
// mide exactamente eso — dos tokens, resueltos, comparados ENTRE SÍ, nunca
// contra un fondo— y es la razón por la que el archivo se llama «contraste» y
// no «legibilidad»: hasta ahora medía sólo la mitad de lo que promete.
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

// ── sRGB → Lab → ΔE2000, a mano, sin dependencias ─────────────────────────
//
// La razón de contraste de arriba (`ratio`) resuelve una sola pregunta: ¿el
// más claro de dos colores se despega lo bastante del más oscuro para que se
// pueda leer? Eso es TODO lo que WCAG mide, y es la pregunta equivocada para
// el acento: dos rosas pálidos, o dos amarillos pálidos, pueden tener una
// razón de contraste altísima cada uno contra su fondo blanco y aun así ser,
// el uno junto al otro, el MISMO color a la vista. Contraste es claro contra
// oscuro. Esto es distinto: dos colores que no son ni más claros ni más
// oscuros el uno que el otro, y que igual pueden fundirse.
//
// ΔE2000 (CIEDE2000) es la métrica que la industria del color usa para esa
// pregunta — «¿qué tan lejos se ven estos dos colores?», no «¿cuál es más
// oscuro?». No hay atajo: hace falta pasar por Lab, el espacio donde una
// distancia euclídea (ajustada, abajo) se corresponde con lo que un ojo
// humano percibe, cosa que sRGB o hex nunca prometieron. `< 1` es
// imperceptible incluso para un ojo entrenado; 2-10 es el rango donde este
// arnés trabaja — separado pero parecido; arriba de 10, inconfundible.
//
// `lum()`, arriba, ya linealiza sRGB para WCAG — pero con el umbral de la
// propia WCAG (0.03928), que es una aproximación histórica y no el 0.04045
// del estándar sRGB/CIE que este camino sí necesita. Los dos caminos existen
// separados a propósito: comparten la forma (gamma-to-linear) pero no la
// constante, y fundirlos en una sola función habría sido la misma trampa que
// ya cerró este archivo una vez — copiar el NOMBRE de una idea sin copiar el
// VALOR exacto que la hace correcta.
const linearize = (c) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

/** sRGB [r,g,b] (0-255) → CIE Lab (D65), pasando por XYZ. La matriz sRGB→XYZ
 *  y el blanco de referencia D65 son constantes publicadas, no elegidas acá. */
export function rgbToLab([r, g, b]) {
  const R = linearize(r), G = linearize(g), B = linearize(b);
  const X = 0.4124564 * R + 0.3575761 * G + 0.1804375 * B;
  const Y = 0.2126729 * R + 0.7151522 * G + 0.0721750 * B;
  const Z = 0.0193339 * R + 0.1191920 * G + 0.9503041 * B;
  const Xn = 0.95047, Yn = 1, Zn = 1.08883;
  const f = (t) => (t > (6 / 29) ** 3 ? Math.cbrt(t) : t / (3 * (6 / 29) ** 2) + 4 / 29);
  const fx = f(X / Xn), fy = f(Y / Yn), fz = f(Z / Zn);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/**
 * CIEDE2000. La fórmula publicada tiene fama merecida de ser fácil de
 * escribir mal — el propio paper de Sharma, Wu y Dalal (2005) existe porque
 * suficientes implementaciones la escribían distinto y daban números
 * distintos. Esta pasa el juego de pares de referencia de ese paper (L, a, b
 * de a pares, incluidos los casos de borde a croma casi cero y a bisagra de
 * matiz 0°/360° que son los que rompen una implementación descuidada) más
 * tres controles analíticos — dos colores idénticos dan 0, la fórmula es
 * simétrica, una diferencia de luminosidad pura sobre gris se reduce a
 * |ΔL|/Sl — antes de haber tocado un token real.
 */
export function deltaE2000([L1, a1, b1], [L2, a2, b2]) {
  const rad = (d) => (d * Math.PI) / 180;
  const deg = (r) => (r * 180) / Math.PI;

  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2);
  const Cbar7 = ((C1 + C2) / 2) ** 7;
  const G = 0.5 * (1 - Math.sqrt(Cbar7 / (Cbar7 + 25 ** 7)));

  const a1p = a1 * (1 + G), a2p = a2 * (1 + G);
  const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);

  const hp = (a, b) => {
    if (a === 0 && b === 0) return 0;
    const h = deg(Math.atan2(b, a));
    return h < 0 ? h + 360 : h;
  };
  const h1p = hp(a1p, b1), h2p = hp(a2p, b2);

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp;
  if (C1p * C2p === 0) dhp = 0;
  else if (Math.abs(h2p - h1p) <= 180) dhp = h2p - h1p;
  else dhp = h2p - h1p > 180 ? h2p - h1p - 360 : h2p - h1p + 360;
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dhp / 2));

  const Lbarp = (L1 + L2) / 2;
  const Cbarp = (C1p + C2p) / 2;

  let hbarp;
  if (C1p * C2p === 0) hbarp = h1p + h2p;
  else if (Math.abs(h1p - h2p) <= 180) hbarp = (h1p + h2p) / 2;
  else hbarp = (h1p + h2p) < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2;

  const T =
    1 -
    0.17 * Math.cos(rad(hbarp - 30)) +
    0.24 * Math.cos(rad(2 * hbarp)) +
    0.32 * Math.cos(rad(3 * hbarp + 6)) -
    0.2 * Math.cos(rad(4 * hbarp - 63));

  const dTheta = 30 * Math.exp(-(((hbarp - 275) / 25) ** 2));
  const Cbarp7 = Cbarp ** 7;
  const Rc = 2 * Math.sqrt(Cbarp7 / (Cbarp7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lbarp - 50) ** 2) / Math.sqrt(20 + (Lbarp - 50) ** 2);
  const Sc = 1 + 0.045 * Cbarp;
  const Sh = 1 + 0.015 * Cbarp * T;
  const Rt = -Math.sin(rad(2 * dTheta)) * Rc;

  const termL = dLp / Sl, termC = dCp / Sc, termH = dHp / Sh;
  return Math.sqrt(termL * termL + termC * termC + termH * termH + Rt * termC * termH);
}

/** Distancia perceptual entre dos colores sRGB [r,g,b] (0-255) ya resueltos. */
export const deltaE = (rgbA, rgbB) => deltaE2000(rgbToLab(rgbA), rgbToLab(rgbB));

/**
 * Casi toda entrada de CHECKS/DISTINCT nombra un token de sistema, pero un
 * valor específico de un solo componente (el "resta" de StackedBar) no
 * necesita un token nuevo para una sola línea de CSS. Si `key` no es una
 * clave del diccionario, se trata como el valor crudo que ya es.
 */
const lookup = (key, tokens) => (key in tokens ? tokens[key] : key);

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
  // EL PAR QUE FALTABA, Y YA EXISTÍA. `Table.svelte` pinta `td.num` con
  // --sx-ink (tinta PRINCIPAL, no -2 ni -3) y una fila seleccionada con
  // --sx-accent-pick de fondo (`tbody tr.on td`) — así que --sx-ink YA se
  // dibuja sobre accent-soft (hover/focus-within) y accent-pick (selección)
  // en cualquier tabla con una columna numérica, desde antes de esta tarea.
  // Sólo -2 y -3 estaban en el contrato; la tinta principal, la que MÁS se
  // usa, no. `Calendar.svelte` repite el mismo par (el día elegido es
  // --sx-accent-pick con texto --sx-ink) y fue lo que lo hizo visible — pero
  // el defecto es de Table, no del calendario nuevo. Medido: 7.60:1 en el
  // peor caso (oscuro, cromo gris, contra accent-pick), muy por encima del
  // piso de 4.5.
  ['--sx-ink', '--sx-accent-soft', 4.5, 'texto principal sobre un estado'],
  ['--sx-ink', '--sx-accent-pick', 4.5, 'texto principal sobre una fila elegida'],
  // StackedBar.svelte, .rest: el segmento que dice cuánto falta es un dato, no
  // ambiente, y se pinta sobre el fondo REAL de .track (--sx-sunk) — no contra
  // --sx-surface, que no es lo que hay detrás de la barra. Antes de este arnés
  // .rest usaba --sx-line (ambiente, sin piso) y resolvía a 1.15:1; es el
  // cuarto caso de un token usado para un trabajo que no es el suyo.
  //
  // YA NO ES `--sx-edge` A SECAS. Lo fue, y por eso pasaba esta fila y
  // fallaba la de DISTINGUIBILIDAD más abajo: .s-d (el último paso real de la
  // rampa) usa el mismo --sx-edge, así que las dos muestras de la leyenda
  // resolvían al mismo color — 1.000:1 en las cuatro combinaciones, el
  // defecto que dio origen a la clase 2. El valor de abajo no es un token de
  // sistema (es específico de esta única línea de CSS), así que no vive en
  // TOKENS — `evalContract`/`evalDistinct` resuelven cualquier `fg`/`bg` que
  // no sea una clave del diccionario como el valor crudo que es. Ver el
  // comentario junto a `.rest` en StackedBar.svelte para los dos números.
  [
    'color-mix(in srgb, var(--sx-edge) 90%, var(--sx-sunk))',
    '--sx-sunk',
    3.0,
    'segmento "resta" de StackedBar sobre el fondo del track'
  ],
  ['--sx-ink',    '--sx-surface', 4.5, 'texto principal'],
  ['--sx-ink-2',  '--sx-surface', 4.5, 'texto secundario'],
  ['--sx-ink-3',  '--sx-surface', 4.5, 'texto terciario'],
  ['--sx-accent-ink', '--sx-accent', 4.5, 'tinta sobre el acento'],
  ...TONES.map((t) => [`--sx-${t}`, `--sx-${t}-band`, 4.5, `tono ${t} sobre su banda`])
];
// EL CANTO DE CARD Y PANEL DEJÓ DE SER UNA RAYA — es la sombra de la tarjeta,
// teñida (`--card-glow`, en `Card.svelte`), leyendo la misma ley que
// `--sx-halo`: luz, no contorno. Hasta acá vivía un CHECK duro que medía
// `--sx-{tono}` contra `--sx-surface` a 3:1 (1.4.11), porque el canto viejo se
// dibujaba con la tinta PLENA del tono como un borde sólido — un color de
// verdad, el único de la tarjeta, que tenía que identificar por sí solo. Ese
// borde sólido ya no existe: `--card-glow` es la tinta del tono mezclada a un
// porcentaje bajo contra transparente y usada como color de una SOMBRA, no
// como un relleno — el mismo tipo de valor que `--sx-halo`, que nunca estuvo
// en este contrato por la misma razón (una sombra difusa no tiene un borde
// nítido contra el que medir 1.4.11; identifica en conjunto, no sola, y por
// eso el comentario de `tone` en Card.svelte insiste en que viaje con un Pill
// o una palabra). Medir `--sx-{tono}` a color plena contra la superficie
// seguiría dando 5.8:1–8.1:1 —los tokens de tono no se tocaron— pero sería
// medir un color que ya no se dibuja así en pantalla, no una comprobación
// real. Se retira del contrato duro por eso, no por descuido.
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
    const b = resolve(lookup(bg, tokens), tokens, ground);
    const r = ratio(resolve(lookup(fg, tokens), tokens, b), b);
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

// ── clase 2: DISTINGUIBILIDAD ───────────────────────────────────────────
// Los ocho pares de abajo son los que un defecto real ya rompió: dos roles
// que un componente pinta uno al lado del otro (o uno encima del otro, en
// duración) y que tienen que leerse como DOS cosas. Ninguno se mide contra un
// fondo — se miden entre sí.
const DISTINCT = [
  ['--sx-thead', '--sx-accent-soft', 'cabecera contra el hover de su control'],
  ['--sx-thead', '--sx-surface', 'la banda contra la tarjeta'],
  ['--sx-accent-soft', '--sx-accent-pick', 'pasajero contra persistente'],
  ['--sx-accent-soft', '--sx-surface', 'el hover contra el reposo'],
  ['--sx-accent-pick', '--sx-surface', 'la selección contra el reposo'],
  ['--sx-ink-2', '--sx-ink-3', 'los dos registros de texto secundario'],
  ['--sx-line', '--sx-edge', 'ambiente contra límite de control'],
  ['--sx-sunk', '--sx-surface', 'el control contra su tarjeta'],
  // GUARDA DE REGRESIÓN, no uno de los ocho pares originales del pliego: es
  // el defecto (c) en persona. `.s-d` (el último paso real de la rampa de
  // StackedBar) y `.rest` (lo que falta) resolvían los dos a `--sx-edge` —
  // 1.000:1, la leyenda con dos muestras idénticas y dos nombres distintos.
  // El arreglo vive en `.rest` (StackedBar.svelte) y en el CHECK de
  // legibilidad de arriba; esta fila es lo que evita que alguien retinte uno
  // de los dos por separado y los vuelva a juntar sin que nada avise.
  [
    'color-mix(in srgb, var(--sx-edge) 90%, var(--sx-sunk))',
    '--sx-edge',
    '"resta" de StackedBar contra su propio último paso (.s-d)'
  ]
];

// EL UMBRAL. WCAG no cubre este eje —no hay un piso que copiar— así que sale
// de medir los ocho pares del pliego en las cuatro combinaciones (la novena
// entrada de arriba es la guarda de regresión de StackedBar, no parte de esa
// medición) y mirar dónde cae lo que ya se sabe roto. Los cuatro colapsos
// genuinos (--sx-thead contra --sx-accent-soft en oscuro, las dos perillas;
// --sx-ink-2 contra --sx-ink-3 en oscuro, las dos perillas) miden 1.0002,
// 1.0023, 1.0035 y 1.0437 — ninguno
// pasa de 1.044. La separación más sutil que SÍ es real —--sx-thead contra
// --sx-surface, claro, cromo gris— mide 1.060. 1.05 cae en ese hueco, con
// margen para los dos lados. El 1.10 que sugería el pliego original habría
// marcado como rotos varios pares que no lo son —la banda de cabecera y el
// escalón hundido contra su tarjeta, en claro— y que tokens.js ya documenta
// como una sutileza deliberada (el tinte al 6 %), no un descuido. Si un valor
// nuevo empuja algo por debajo de 1.05, léase así: por debajo de este piso,
// en una pantalla sucia o para un ojo con baja sensibilidad al contraste, dos
// piezas que significan cosas distintas se leen como la misma pieza.
const DISTINCT_MIN = 1.05;

/**
 * Corre la clase 2 (DISTINCT) contra un juego de tokens ya apilado. Misma
 * forma de salida que `evalContract`, para que el llamador pueda tratar las
 * dos clases de forma uniforme.
 */
function evalDistinct(tokens) {
  const fails = [];
  const ground = resolve(tokens['--sx-ground'], tokens);
  for (const [a, b, checkLabel] of DISTINCT) {
    const ca = resolve(lookup(a, tokens), tokens, ground);
    const cb = resolve(lookup(b, tokens), tokens, ground);
    const r = ratio(ca, cb);
    if (r < DISTINCT_MIN) fails.push({ fg: a, bg: b, r, min: DISTINCT_MIN, checkLabel });
  }
  return fails;
}

// ── clase 3: EL ACENTO ──────────────────────────────────────────────────
//
// CHECKS y DISTINCT miden lo que YA es del sistema — cinco tonos, una rampa
// neutra, un acento. Esta clase mide el único de esos cuatro colores que el
// sistema no elige: el acento que cada producto liga. La primera regla del
// README dice que el acento «es un hueco que cada producto llena», y hasta
// hoy nada comprobaba que ese hueco se pudiera llenar sin chocar con los
// cinco tonos que sí son del sistema — se descubría mirando la pantalla,
// después de construir el módulo entero.
//
// QUÉ SE COMPARA, Y POR QUÉ ESAS DOS COSAS. Un acento se dibuja en dos
// registros: PLENO (un botón, el anillo de foco) y como LAVADO pálido — el
// mismo `color-mix(…, #FFFFFF)` que ya usan `--sx-accent-soft`/`-pick` en
// `tokens.js`, reutilizado acá tal cual en vez de reinventado, resolviendo
// las mismas fórmulas contra un `--sx-accent` de prueba. El primero se mide
// contra el tono PLENO; el segundo, contra la BANDA del tono — la pieza que
// de verdad comparte registro con un lavado: los dos son fondos pálidos, y
// es ahí, no en el pleno, donde un producto real chocó.
//
// SOLO CONTRA EL CLARO, A PROPÓSITO. `--sx-accent-soft`/`-pick`/`-edge` se
// mezclan contra `#FFFFFF` FIJO — la receta que «Ligar el acento», en el
// README, documenta como la de Nácar — y no contra `--sx-surface` ni contra
// ningún token que se reamarre en oscuro. Un producto con tema oscuro tiene
// que declarar su propio bloque bajo `[data-sx-theme="dark"]`; sin ese
// bloque no hay nada que medir, y con él, los valores son del producto, no
// de esta librería. Medir «oscuro» acá sería inventar datos que no existen
// en ningún lado.
const ACCENT_PALE = ['--sx-accent-soft', '--sx-accent-pick'];

/**
 * Un juego de acentos representativos, no sólo el morado por defecto —el
 * pliego que motivó esta clase lo pide en esos términos, y con razón: un
 * arnés que sólo corre contra el acento que ya se sabe que pasa no prueba
 * nada. `morado` es el `--sx-accent` real de `tokens.js`, así que si alguna
 * vez cambia, esta lista lo sigue en vez de quedarse con un hex viejo.
 * `amarillo` no es una de las cinco familias que pidió el pliego (morado,
 * naranja, verde, rojo, azul) — se agregó aparte porque es la familia que de
 * verdad rompió en un producto real, y sin ella el caso de calibración de
 * `ACCENT_MIN`, más abajo, sería una cifra sin un colapso conocido detrás.
 */
const ACCENTS = [
  ['morado (el --sx-accent por defecto)', TOKENS['--sx-accent']],
  ['naranja', '#C2410C'],
  ['amarillo', '#F7B500'],
  ['verde', '#15803D'],
  ['rojo', '#DC2626'],
  ['azul', '#2563EB']
];

/**
 * Corre la clase 3 contra un acento (hex) y un juego de tokens ya apilado.
 * Devuelve `{ fails, info }`.
 *
 * `fails` es SOLO `--sx-accent-pick` (el lavado persistente, 18 %) contra la
 * banda de cada tono — el registro exacto del choque real que motivó esta
 * clase («la fila seleccionada» contra la banda de `attention`), y el único
 * de los tres registros que `ACCENT_MIN` calibra (ver el comentario junto a
 * esa constante: el pleno tiene su propio hueco pero los mismos pares lo
 * cruzan igual, y `--sx-accent-soft` da falsos positivos incluso contra el
 * morado por defecto). La forma de cada entrada es la misma que
 * `evalContract`/`evalDistinct` ya usan, para que el llamador las trate
 * igual.
 *
 * `info` trae los TRES registros —pleno, hover, selección— para los cinco
 * tonos, pasen o no: `pnpm contrast` los imprime siempre, pero sólo
 * `selección` puede sumar a `malas`.
 */
function evalAccent(accentHex, tokens = TOKENS) {
  const accentTokens = { ...tokens, '--sx-accent': accentHex };
  const accentRgb = hex(accentHex);
  const fails = [];
  const info = [];
  for (const tone of TONES) {
    const toneRgb = resolve(tokens[`--sx-${tone}`], tokens);
    const bandRgb = resolve(tokens[`--sx-${tone}-band`], tokens);

    const dPlain = deltaE(accentRgb, toneRgb);
    info.push({ tone, registro: 'pleno', d: dPlain });

    for (const paleKey of ACCENT_PALE) {
      const paleRgb = resolve(accentTokens[paleKey], accentTokens);
      const d = deltaE(paleRgb, bandRgb);
      const registro = paleKey === '--sx-accent-soft' ? 'hover' : 'selección';
      info.push({ tone, registro, d });
      if (registro === 'selección' && d < ACCENT_MIN) {
        fails.push({
          fg: '--sx-accent-pick',
          bg: `--sx-${tone}-band`,
          r: d,
          min: ACCENT_MIN,
          checkLabel: `acento (selección) contra la banda de ${tone}`
        });
      }
    }
  }
  return { fails, info };
}

// EL UMBRAL. Igual que `DISTINCT_MIN`: se mide el caso que se sabe malo y el
// caso que se sabe bueno, con la MISMA fórmula, y el corte va en el hueco
// entre los dos — no en una cifra redonda elegida de antemano.
//
// EL CASO MALO. `--sx-accent-pick` (el lavado persistente — una fila
// elegida) contra `--sx-{tono}-band` (el fondo de un Pill de ese tono), para
// los seis acentos de arriba contra los cinco tonos: treinta pares. Los
// cuatro que colapsan de verdad —el mismo hueco de matiz cada vez— son
// rojo/critical (ΔE 3.13), naranja/critical (3.40), verde/positive (3.52) y
// amarillo/attention (4.68). Los cuatro son la misma historia: un acento y
// un tono que vienen de la MISMA familia de color leen, en su lavado
// pálido, como el mismo color — verde de acento y verde de «al día», rojo de
// acento y rojo de «vencido», ámbar de acento y ámbar de «por vencer». Nada
// de esto es folklore de un solo producto: los cuatro salen de medir, no de
// adivinar cuál familia iba a chocar.
//
// EL CASO BUENO. El siguiente valor de esos treinta pares, ya sin relación
// de familia, es morado/info (ΔE 5.95) — el `--sx-accent` por defecto de
// esta misma librería contra el tono `info`. 5.3 cae en el hueco entre 4.68
// y 5.95, con margen para los dos lados, siguiendo el mismo criterio que
// fijó `DISTINCT_MIN` más arriba.
//
// POR QUÉ SÓLO `--sx-accent-pick` ESTÁ EN EL UMBRAL, Y NO `-soft`. Se midió
// también `--sx-accent-soft` (10 %, el lavado PASAJERO — hover) contra las
// mismas bandas, y el resultado es un hallazgo real, no un descuido: el
// morado por defecto de esta librería da ΔE 2.23 contra `neutral` y 2.26
// contra `info` — MÁS bajo que los cuatro colapsos de arriba. Al 10 % contra
// blanco fijo, casi cualquier acento queda tan pálido que se acerca a casi
// cualquier banda, tenga o no relación de familia; a 18 % (`-pick`) hay
// croma suficiente para que la familia de color vuelva a importar, que es
// exactamente lo que separa el hueco de 4.68 a 5.95 de arriba. Meter `-soft`
// en el mismo umbral habría hecho fallar al morado por defecto de ESTA
// librería contra SUS PROPIOS tonos — el equivalente exacto de bajar el
// umbral hasta que el caso malo pase, sólo que en la dirección contraria:
// forzar el caso bueno a fallar en vez de mentir sobre el malo. Por eso
// `-soft` queda en `info` (se mide, se imprime, se documenta en el README)
// y fuera de `fails`: la matriz de esta librería tiene que seguir en verde,
// pero eso no es licencia para esconder el número.
//
// POR QUÉ EL PLENO USA EL MISMO UMBRAL QUE EL LAVADO. El acento pleno contra
// el tono pleno tiene su propio hueco —verde/positive (8.15), rojo/critical
// (8.32) y naranja/critical (9.80) contra morado/info (13.99), el siguiente
// caso sin relación de familia— y separado habría hecho falta un segundo
// número. No hizo falta: los mismos tres pares que colapsan en pleno YA
// colapsan en lavado (son la misma familia de color mirada dos veces), así
// que un único `ACCENT_MIN` alcanza para las dos comparaciones sin perder
// ningún caso real. `amarillo/attention` es la excepción que confirma esto:
// en pleno da 32.31 (pasa con margen), y sólo el lavado —el registro donde
// el producto real lo encontró— lo atrapa. Un acento pleno puede pasar y su
// lavado igual fallar; por eso las dos comparaciones corren siempre juntas.
const ACCENT_MIN = 5.3;

// CHECKS × DISTINCT × {claro, oscuro} × {las perillas de arriba}: la matriz
// completa, no listas sueltas. Cada combinación corre las DOS clases —
// legibilidad (¿se lee?) y distinguibilidad (¿se distinguen?)— porque un
// token puede pasar una y fallar la otra, y las dos tienen que estar en verde
// a la vez para que la combinación cuente como buena. Demasiadas filas para
// leer una por una, así que la salida es un resumen por combinación —cuántas
// pasan, cuántas fallan, de cada clase— y el detalle completo sólo de lo que
// falla. Si nadie puede leer la salida, nadie la va a correr.
let malas = 0;
const resumen = [];
const detalle = [];
for (const [temaNombre, apilar] of THEMES) {
  for (const [tint, tintLabel] of CHROME_KNOBS) {
    const label = `${temaNombre} · ${tintLabel}`;
    const tokens = apilar(tint);
    const legibilidad = evalContract(tokens).map((f) => ({ ...f, clase: 'legibilidad' }));
    const distinguibilidad = evalDistinct(tokens).map((f) => ({ ...f, clase: 'distinguibilidad' }));
    const fails = [...legibilidad, ...distinguibilidad];
    malas += fails.length;
    resumen.push({
      label,
      totalLeg: CHECKS.length,
      failLeg: legibilidad.length,
      totalDist: DISTINCT.length,
      failDist: distinguibilidad.length,
      fails
    });
    if (fails.length) detalle.push({ label, fails });
  }
}

console.log('\n── MATRIZ DE CONTRASTE — legibilidad + distinguibilidad × 2 temas × 2 perillas ──');
console.log('combinación'.padEnd(26) + 'legibilidad     distinguibilidad');
console.log(''.padEnd(26) + 'pasan  fallan   pasan  fallan');
console.log('-'.repeat(62));
for (const s of resumen) {
  const okLeg = s.totalLeg - s.failLeg;
  const okDist = s.totalDist - s.failDist;
  console.log(
    `${s.label.padEnd(26)} ${String(okLeg).padStart(5)}  ${String(s.failLeg).padStart(6)}   ${String(okDist).padStart(5)}  ${String(s.failDist).padStart(6)}`
  );
}
console.log('-'.repeat(62));

if (detalle.length) {
  console.log('\n── detalle de lo que falla ──────────────────────────────────');
  for (const d of detalle) {
    console.log(`\n${d.label}`);
    console.log('token                    contra/sobre        real     piso   \n' + '-'.repeat(70));
    for (const f of d.fails) {
      if (f.bg) {
        const verbo = f.clase === 'distinguibilidad' ? 'NO SE DISTINGUEN' : 'FALLA';
        console.log(
          `${f.fg.padEnd(24)} ${f.bg.padEnd(19)} ${f.r.toFixed(3).padStart(6)}  ${f.min.toFixed(2).padStart(5)}  ${verbo} — ${f.checkLabel}`
        );
      } else {
        console.log(`${f.fg.padEnd(24)} ${f.checkLabel}`);
      }
    }
  }
}
console.log(malas ? `\n${malas} comprobacion(es) fallando en la matriz` : '\nla matriz entera pasa: 4 combinaciones, 0 fallas (legibilidad y distinguibilidad)');

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

// ── clase 3, corrida — EL ACENTO CONTRA LOS CINCO TONOS ────────────────────
//
// Sólo el PRIMER acento de `ACCENTS` — el `--sx-accent` real de esta
// librería, `TOKENS['--sx-accent']` — suma a `malas`. Es el único acento que
// esta librería de verdad envía sin que ningún producto lo toque, así que es
// el único cuyo choque con un tono sería un defecto DE ESTA LIBRERÍA. Los
// otros cinco son la demostración que pidió el pliego —un juego de acentos
// representativos, no sólo el default— y corren la MISMA comprobación con
// el MISMO `ACCENT_MIN`, pero corren INFORMATIVOS a propósito: cuál acento
// elige un producto no lo decide este repo, y si naranja choca con
// `critical` la respuesta no es prohibir naranja — es lo que dice el README,
// en la sección nueva junto a *Ligar el acento*. Que el arnés de ESTA
// librería siga en verde no es esconder esos cuatro choques: es la frontera
// correcta entre «esta librería tiene un defecto» y «este producto tiene que
// elegir otro acento, o vivir con el choque a sabiendas».
console.log('\n── EL ACENTO CONTRA LOS CINCO TONOS — ΔE2000, tema claro ──────────────');
console.log(`piso: ACCENT_MIN = ${ACCENT_MIN}, sólo sobre la columna «selección» (ver arriba por qué)`);
console.log('«*» = colisiona (ΔE < piso) · pleno y hover se informan pero nunca rompen el build\n');
console.log('acento'.padEnd(34) + 'tono'.padEnd(11) + 'pleno'.padStart(7) + '    hover'.padStart(10) + '  selección'.padStart(13));
console.log('-'.repeat(78));
for (const [name, accentHex] of ACCENTS) {
  const { fails, info } = evalAccent(accentHex, TOKENS);
  if (name === ACCENTS[0][0]) malas += fails.length;
  const at = (tone, registro) => info.find((i) => i.tone === tone && i.registro === registro).d;
  const mark = (registro, d) => (registro === 'selección' && d < ACCENT_MIN ? '*' : ' ');
  for (const tone of TONES) {
    const pleno = at(tone, 'pleno');
    const hover = at(tone, 'hover');
    const seleccion = at(tone, 'selección');
    console.log(
      `${name.padEnd(34)}${tone.padEnd(11)}${pleno.toFixed(2).padStart(6)}${mark('pleno', pleno)} ` +
      `${hover.toFixed(2).padStart(8)}${mark('hover', hover)} ${seleccion.toFixed(2).padStart(10)}${mark('selección', seleccion)}`
    );
  }
  console.log('-'.repeat(78));
}
console.log(
  malas
    ? `\n${malas} comprobacion(es) fallando (incluye el acento por defecto, si aplica)`
    : '\nel acento por defecto pasa contra los cinco tonos; ver arriba qué familias representativas chocan'
);
process.exit(malas ? 1 : 0);
