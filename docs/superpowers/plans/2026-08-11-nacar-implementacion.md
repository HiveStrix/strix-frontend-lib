# Nácar — plan de implementación

> **Para agentes:** SUB-SKILL REQUERIDA: usá `superpowers:subagent-driven-development` (recomendada) o `superpowers:executing-plans` para ejecutar tarea por tarea. Los pasos usan casillas (`- [ ]`).

**Objetivo:** llevar `@strix/frontend-lib` de la dirección A · Elevación a **AD · Nácar**, con un arnés que mida contraste en vez de confiar en la vista.

**Arquitectura:** rebind de `tokens.js` a tres capas (primitivas → roles → perillas), más cinco toques de silueta en cuatro componentes. Los 55 componentes no se reescriben: usan 1866 tokens y un solo literal.

**Stack:** Svelte 5, Vite 6, Node ≥ 18. Sin dependencias nuevas. Sin framework de test — el arnés es un script de Node sin dependencias.

**Spec:** `docs/superpowers/specs/2026-08-11-nacar-sistema-diseno.md`

## Restricciones globales

- **Sólo modo claro.** `TOKENS_DARK` no se toca y no se declara compatible con Nácar.
- **No se toca ningún consumidor.** Ni `strix-shell`, ni `strix-auth`, ni `strix-maintenance`.
- **No se publica ni se distribuye.** El paquete sigue consumiéndose por npm workspace.
- **No se salda la deuda del README de la lib** (mover `format.js`, desduplicar `.sx-sr`, unificar `DataState`). Va después, por separado.
- **Los cinco tonos semánticos no cambian de valor.** Son vocabulario compartido.
- **Nunca editar `src/lib/tokens.css` a mano.** Se genera con `npm run tokens` desde `tokens.js`.
- **Umbrales:** 3.0:1 para el límite de un control (WCAG 1.4.11), 4.5:1 para texto normal (WCAG 1.4.3).
- **Verificación visual:** las siete páginas del catálogo, en claro, a **1200** y **390 px**.
- Comandos desde `packages/frontend-lib`. El catálogo se levanta con `npm run dev` (puerto **5180**).

---

## Estructura de archivos

| Archivo | Responsabilidad | Tarea |
|---|---|---|
| `scripts/contrast.mjs` | **Nuevo.** Resuelve tokens a color real y mide contraste. | 1 |
| `package.json` | **Modificar.** Agregar `npm run contrast`. | 1 |
| `src/lib/tokens.js` | **Modificar.** Las tres capas, rebindeadas a Nácar. | 2 |
| `src/lib/tokens.css` | **Regenerar.** Nunca a mano. | 2 |
| `src/lib/data/Table.svelte` | **Modificar.** Fila bajo cursor + cabecera. | 3 |
| `src/lib/shell/Panel.svelte` | **Modificar.** Cabecera y pie leen `--sx-thead`. | 3 |
| `src/lib/nav/PageHeader.svelte` | **Modificar.** El halo. | 3 |
| `README.md` (de la lib) | **Modificar.** La dirección, las perillas, el contrato. | 5 |

---

## Tarea 1 · El arnés de contraste

Va primero porque **falla contra el estado actual**, y esos fallos son la definición de terminado de la Tarea 2.

**Archivos:**
- Crear: `packages/frontend-lib/scripts/contrast.mjs`
- Modificar: `packages/frontend-lib/package.json`

**Interfaces:**
- Consume: `TOKENS` de `src/lib/tokens.js`.
- Produce: `npm run contrast` — sale 0 si el contrato pasa, 1 si no. `resolve(value, bg)` → `[r,g,b]` y `ratio(a, b)` → número, exportados para reuso.

- [ ] **Paso 1 · Escribir el arnés**

Crear `packages/frontend-lib/scripts/contrast.mjs`:

```js
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
// Los filos de tono (--sx-positive-edge y compania) NO estan en el contrato, y
// vale escribir por que: 1.4.11 pide 3:1 para el limite que hace falta para
// IDENTIFICAR un componente. Una pildora no se identifica por su filo — se
// identifica por su banda, su marca y su palabra, que es la regla que sostiene
// Pill.svelte. El filo es refuerzo. Se informan aparte para que no pasen
// inadvertidos, pero no rompen el build.
const INFO = TONES.map((t) => [`--sx-${t}-edge`, '--sx-surface', `filo del tono ${t}`]);

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
```

- [ ] **Paso 2 · Correrlo y confirmar que FALLA**

```bash
cd packages/frontend-lib && node scripts/contrast.mjs; echo "exit: $?"
```

Esperado — **exit 1**, con exactamente estos tres fallos:

```
--sx-edge   --sx-surface   1.52  3.0  FALLA — borde de control sobre superficie
--sx-edge   --sx-ground    1.40  3.0  FALLA — borde de control sobre el fondo
--sx-neutral --sx-neutral-band  4.16  4.5  FALLA — tono neutral sobre su banda
```

Los tres son **defectos preexistentes de la dirección A**, no algo que rompa este trabajo. El de `--sx-neutral` nadie lo había medido.

Si el número no coincide, parar: alguien tocó `tokens.js` desde que se escribió el plan.

- [ ] **Paso 3 · Agregar el script a package.json**

En `packages/frontend-lib/package.json`, dentro de `"scripts"`, después de `"tokens"`:

```json
    "contrast": "node scripts/contrast.mjs"
```

- [ ] **Paso 4 · Verificar que corre por npm**

```bash
cd packages/frontend-lib && npm run contrast; echo "exit: $?"
```

Esperado: la misma salida, **exit 1**.

- [ ] **Paso 5 · Commit**

```bash
git add packages/frontend-lib/scripts/contrast.mjs packages/frontend-lib/package.json
git commit -m "Un arnés que resuelve los tokens y mide contraste, y que hoy falla tres veces

Mirar tokens.js no detecta que --sx-edge da 1.52:1: un token no es un color,
es una referencia que se resuelve contra otros. El arnés resuelve y mide.

Los tres fallos son preexistentes de la dirección A, que es la que la librería
envía hoy. El de --sx-neutral sobre su banda (4.16 contra 4.5) no lo había
medido nadie."
```

---

## Tarea 2 · Rebind de tokens a Nácar

**Archivos:**
- Modificar: `packages/frontend-lib/src/lib/tokens.js`
- Regenerar: `packages/frontend-lib/src/lib/tokens.css`

**Interfaces:**
- Consume: `npm run contrast` de la Tarea 1.
- Produce: tres tokens nuevos que la Tarea 3 usa por nombre — **`--sx-chrome-tint`**, **`--sx-thead`**, **`--sx-halo`**.

**Los valores están verificados.** Pasan el contrato con la traza violeta, con la perilla en un neutro, y con un acento naranja.

- [ ] **Paso 1 · La rampa de primitivas**

En `src/lib/tokens.js`, reemplazar el bloque de neutros (líneas 24–35) por:

```js
  // LA PERILLA DEL CROMO. Es un COLOR y no un porcentaje, a propósito: ligarla a
  // un neutro devuelve grises puros, así que un core que no quiera la traza
  // violeta cambia UNA propiedad y no once. Su valor por defecto es el morado de
  // Nácar.
  '--sx-chrome-tint': '#6541BE',

  // La rampa: neutros con una traza de la perilla. No es "gris teñido de marca"
  // — la traza es del 4 al 8 %, que afina sin leerse como color. Un gris puro al
  // lado de un acento morado se lee verdoso; eso es lo que corrige.
  '--sx-n-0': '#FFFFFF',
  '--sx-n-50': 'color-mix(in srgb, var(--sx-chrome-tint) 4%, #FAFAFB)',
  '--sx-n-100': 'color-mix(in srgb, var(--sx-chrome-tint) 5%, #F4F4F6)',
  '--sx-n-150': 'color-mix(in srgb, var(--sx-chrome-tint) 6%, #EDEDF0)',
  '--sx-n-200': 'color-mix(in srgb, var(--sx-chrome-tint) 8%, #DDDDE2)',
  '--sx-n-300': 'color-mix(in srgb, var(--sx-chrome-tint) 8%, #BBBBC2)',
  // n-400 es donde aterriza --sx-edge, el borde de un control. Su base está
  // elegida para dar 3.47:1 contra blanco con la traza y 3.22:1 sin ella: los
  // dos por encima del 3:1 de WCAG 1.4.11. NO puede salir de la escala de
  // tercios del resto del cromo — para llegar a 3:1 mezclando marca haría falta
  // un 64 %, que es un borde morado franco y no mobiliario.
  '--sx-n-400': 'color-mix(in srgb, var(--sx-chrome-tint) 8%, #8E8E93)',
  // n-500 es --sx-neutral, que se dibuja SOBRE n-100. Su base da 4.95:1 con la
  // traza y 4.69:1 sin ella. En la dirección A daba 4.16 y estaba por debajo
  // de AA sin que nadie lo hubiera medido.
  '--sx-n-500': 'color-mix(in srgb, var(--sx-chrome-tint) 8%, #66666C)',
  '--sx-n-700': 'color-mix(in srgb, var(--sx-chrome-tint) 8%, #414146)',
  '--sx-n-800': 'color-mix(in srgb, var(--sx-chrome-tint) 8%, #27272B)',
  '--sx-n-900': 'color-mix(in srgb, var(--sx-chrome-tint) 7%, #1B1B1E)',
```

- [ ] **Paso 2 · Los roles**

Reemplazar el bloque de superficies y tinta (líneas 37–46 del original) por:

```js
  // Los roles: qué es cada cosa, no de qué color es. Un producto que necesita
  // mover UNA cosa pisa el rol; uno que necesita mover todo lo que dependa de un
  // peldaño pisa la primitiva.
  //
  // El fondo es BLANCO, no un peldaño de la rampa. Es la silueta de Nácar: la
  // tarjeta no se lee por diferencia de tono contra el campo sino por la sombra
  // que deja. Es la desviación deliberada respecto de Prisma pastel.
  '--sx-ground': 'var(--sx-n-0)',
  '--sx-surface': 'var(--sx-n-0)',
  '--sx-sunk': 'var(--sx-n-50)',
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
  // los inputs. Mueve cabecera de tabla y de panel a la vez.
  '--sx-thead': 'var(--sx-n-0)',
  // LA FIRMA de Nácar: la luz que deja caer la barra superior en vez de una
  // raya. Ligarlo a `transparent` la apaga sin tocar ninguna regla.
  '--sx-halo': 'color-mix(in srgb, var(--sx-accent) 55%, transparent)',
```

- [ ] **Paso 3 · Las sombras**

Reemplazar el bloque `--sx-e-*` (líneas 75–80 del original) por:

```js
  // Depth comes from light, not outlines. Sobre un fondo blanco la sombra es lo
  // único que levanta una pieza, así que lleva dos capas: una corta que da el
  // asiento y una larga que da el aire. El tinte NO es gris — una sombra gris
  // bajo una familia lavanda parece suciedad — pero lleva un tercio del violeta
  // de Prisma pastel, no el violeta entero.
  '--sx-e-1': '0 1px 2px rgba(30,28,44,.05), 0 8px 24px -10px rgba(30,28,44,.18)',
  '--sx-e-2': '0 2px 6px -2px rgba(30,28,44,.07), 0 16px 40px -14px rgba(30,28,44,.22)',
  '--sx-e-3': '0 2px 6px -2px rgba(30,28,44,.07), 0 24px 56px -18px rgba(30,28,44,.28)',
  '--sx-e-inset': 'inset 0 1px 0 rgba(255,255,255,.9)',
```

- [ ] **Paso 4 · Los radios**

Reemplazar el bloque `--sx-r-*` (líneas 82–86 del original) por:

```js
  // La forma de Prisma: 12 y 22. Nada cuadrado, y nada casi-cuadrado.
  '--sx-r-1': '8px',
  '--sx-r-2': '12px',
  '--sx-r-3': '22px',
  '--sx-r-pill': '999px',
```

- [ ] **Paso 5 · El scrim**

Reemplazar la línea de `--sx-scrim` por:

```js
  '--sx-scrim': 'rgba(26, 24, 34, .46)',
```

- [ ] **Paso 6 · Correr el arnés y confirmar que PASA**

```bash
cd packages/frontend-lib && npm run contrast; echo "exit: $?"
```

Esperado — **exit 0**, `todo el contrato pasa`, con `--sx-edge` en **3.47** y `--sx-neutral` en **4.95**.

- [ ] **Paso 7 · Probar la perilla en las tres configuraciones**

La perilla tiene que ser real, no una promesa. Correr las tres y confirmar **exit 0** en las tres:

```bash
cd packages/frontend-lib
for t in '#6541BE' '#8E8E93' '#B45309'; do
  sed -i.bak "s/'--sx-chrome-tint': '[^']*'/'--sx-chrome-tint': '$t'/" src/lib/tokens.js
  printf '%-10s ' "$t"; node scripts/contrast.mjs | tail -1
done
sed -i.bak "s/'--sx-chrome-tint': '[^']*'/'--sx-chrome-tint': '#6541BE'/" src/lib/tokens.js
rm -f src/lib/tokens.js.bak
node scripts/contrast.mjs | tail -1
```

Esperado: `todo el contrato pasa` **cuatro veces** (violeta, neutro, naranja, y de vuelta al default).

- [ ] **Paso 8 · Regenerar tokens.css**

```bash
cd packages/frontend-lib && npm run tokens
```

Esperado: `tokens.css regenerado`.

- [ ] **Paso 9 · Verificar que las dos formas coinciden**

`tokens.css` y `hostTokens()` salen del mismo objeto; si divergen, un Core en shadow root se ve distinto del Shell y nadie avisa.

```bash
cd packages/frontend-lib && node -e "
import('./src/lib/tokens.js').then(async (m) => {
  const css = await import('node:fs').then((f) => f.readFileSync('src/lib/tokens.css', 'utf8'));
  const faltan = Object.keys(m.TOKENS).filter((k) => !css.includes(k + ':'));
  console.log(faltan.length ? 'FALTAN en tokens.css: ' + faltan.join(', ') : 'las dos formas coinciden — ' + Object.keys(m.TOKENS).length + ' tokens');
  process.exit(faltan.length ? 1 : 0);
})"
```

Esperado: `las dos formas coinciden`, **exit 0**.

- [ ] **Paso 10 · Commit**

```bash
git add packages/frontend-lib/src/lib/tokens.js packages/frontend-lib/src/lib/tokens.css
git commit -m "Nácar en los tokens: tres capas, y el borde de control deja de mentir

La rampa pasa a ser neutros con una traza de --sx-chrome-tint, que es un COLOR
y no un porcentaje: un core que no quiera la traza violeta liga esa perilla a un
neutro y cambia una propiedad, no once. Verificado con la traza, sin ella y con
un acento naranja: el contrato pasa en las tres.

Lo que se arregla y no era de esta dirección: --sx-line y --sx-edge hacían dos
trabajos distintos con un solo token. Una separa filas y puede ser tenue; la
otra es el límite de un control y dice dónde se puede escribir, que es
información. Compartiendo token, el borde de un input daba 1.52:1 contra el 3:1
que pide WCAG 1.4.11. Ahora --sx-edge salta cuatro peldaños y da 3.47:1.

Y --sx-neutral sobre su banda pasa de 4.16 a 4.95. Estaba por debajo de AA en
la dirección que la librería envía hoy."
```

---

## Tarea 3 · Los cinco toques de silueta

Un rebind mueve los colores pero no la silueta. Estos cinco son los que Nácar necesita y los tokens no arrastran.

**Archivos:**
- Modificar: `src/lib/data/Table.svelte` (líneas 842, 869, 917, 918, 961)
- Modificar: `src/lib/shell/Panel.svelte` (líneas 101, 161)
- Modificar: `src/lib/nav/PageHeader.svelte`

**Interfaces:**
- Consume: `--sx-thead` y `--sx-halo` de la Tarea 2.

- [ ] **Paso 1 · La fila bajo el cursor — el bug que ya costó cuatro intentos**

En `src/lib/data/Table.svelte`, reemplazar las líneas 917–918:

```css
  tbody tr.row:hover { background: var(--sx-sunk); }
  tbody tr.row:focus-within { background: var(--sx-sunk); }
```

por:

```css
  /* EL ESCALÓN DEL CURSOR. Iba a --sx-sunk, y ahí está la trampa de todo este
     rebind: en una dirección de vidrio --sx-sunk es blanco translúcido y ACLARA
     la fila; en una opaca es un gris y la misma regla la OSCURECE. Con Nácar
     eso daba una fila gris donde tiene que haber una fila que se ilumina.
     Sobre blanco no se puede aclarar, así que el escalón se hace con el acento,
     que es un tinte apenas insinuado y no es gris. */
  tbody tr.row:hover { background: var(--sx-accent-soft); }
  tbody tr.row:focus-within { background: var(--sx-accent-soft); }
```

- [ ] **Paso 2 · El mismo patrón en los otros dos sitios**

Línea 869 — `.sortbtn:hover { background: var(--sx-sunk); }` → `var(--sx-accent-soft)`.
Línea 961 — `.disc:hover { background: var(--sx-sunk); color: var(--sx-ink); }` → `var(--sx-accent-soft)`.

- [ ] **Paso 3 · La cabecera de tabla lee la perilla**

En la línea 846 (dentro de `thead th`), cambiar:

```css
    background: var(--sx-surface);
```

por:

```css
    background: var(--sx-thead);
```

El resto de la regla ya es correcto: `box-shadow: 0 1px 0 var(--sx-line)` es la escalera de Cristal y no se toca.

- [ ] **Paso 4 · Cabecera y pie de Panel**

En `src/lib/shell/Panel.svelte`, en `.head` (línea 101) agregar como primera declaración:

```css
    background: var(--sx-thead);
```

Y en `.foot` (línea 164) cambiar `background: var(--sx-sunk);` por:

```css
    background: var(--sx-thead);
```

Con esto un encabezado de panel y uno de tabla no pueden quedar de dos colores por descuido, que es el error concreto que se cometió durante la exploración.

- [ ] **Paso 5 · El halo en PageHeader**

En `src/lib/nav/PageHeader.svelte`, en el bloque `<style>`, agregar a la regla del elemento raíz (la que hoy define su `padding` y su borde inferior):

```css
    /* LA FIRMA. La barra no se separa con una línea: se separa con la luz que
       deja caer. La geometría está calibrada al límite de lo visible sobre
       claro — bajarla más no la hace discreta, la hace invisible. La discreción
       se gradúa por --sx-halo y sólo por ahí.
       El z-index NO es opcional: sin él el fondo del hermano siguiente se pinta
       después en el orden natural y se come la luz justo donde tiene que caer. */
    border-bottom: 0;
    box-shadow: 0 12px 28px -18px var(--sx-halo);
    position: relative;
    z-index: var(--sx-z-sticky);
```

Si la regla existente trae `border-bottom: 1px solid var(--sx-line)`, quitarla — la reemplaza el halo.

- [ ] **Paso 6 · El único color literal de la librería**

En `src/lib/nav/ShortcutOverlay.svelte:207` está el único literal de los 55
componentes, y es la **reserva** de un token:

```css
    background: var(--sx-scrim, rgba(20, 24, 26, .62));
```

Existe porque `::backdrop` no hereda de `:host`, así que el token puede no
llegar — es el único caso del sistema donde una reserva se ve de verdad. Ese
valor es el scrim de la dirección A y hay que rebindearlo:

```css
    background: var(--sx-scrim, rgba(26, 24, 34, .62));
```

- [ ] **Paso 7 · Levantar el catálogo y mirar los cinco**

```bash
cd packages/frontend-lib && npm run dev
```

Abrir y confirmar, uno por uno:

| Página | Qué mirar |
|---|---|
| `http://localhost:5180/#/tablas` | La fila bajo el cursor es un tinte de acento, **no gris**. El encabezado es blanco con su línea. |
| `http://localhost:5180/#/superficies` | La cabecera y el pie de Panel son del **mismo** color. |
| `http://localhost:5180/#/estructura` | `PageHeader` no tiene raya: deja caer luz. |

- [ ] **Paso 8 · Commit**

```bash
git add packages/frontend-lib/src/lib/data/Table.svelte \
        packages/frontend-lib/src/lib/shell/Panel.svelte \
        packages/frontend-lib/src/lib/nav/PageHeader.svelte
git commit -m "Los cinco toques que un rebind de tokens no arrastra

La fila bajo el cursor es el que importa: iba a --sx-sunk, que en una dirección
de vidrio ACLARA y en una opaca OSCURECE. Misma regla, resultado opuesto — es
la trampa que costó cuatro intentos en la exploración. Sobre blanco no se puede
aclarar, así que el escalón lo hace el acento.

Cabecera de panel y de tabla pasan a leer el mismo token, que es lo que impide
que queden de dos colores por descuido.

Y PageHeader gana el halo, con su z-index: sin él el hermano siguiente se pinta
después y se come la luz."
```

---

## Tarea 4 · Barrido del catálogo

Los cinco toques son los que se anticiparon. Esta tarea encuentra los que no.

**Archivos:** los que el barrido señale.

- [ ] **Paso 1 · Las siete páginas a 1200 px**

Con `npm run dev` corriendo, recorrer las siete y anotar cada defecto con **página, componente y qué está mal**:

`#/superficies` · `#/estructura` · `#/acciones` · `#/formularios` · `#/tablas` · `#/retroalimentación` · `#/métricas`

Lo que hay que buscar, que es lo que este rebind rompe de forma característica:

- **Cualquier superficie gris donde debería haber blanco o un tinte de acento.** Es el síntoma de un `--sx-sunk` usado como estado y no como fondo de control.
- **Un borde que desapareció.** Un componente que leía `--sx-line` para el límite de un control ahora es invisible: tiene que leer `--sx-edge`.
- **Un borde que se volvió pesado.** El inverso: algo que separa ambiente y ahora lee `--sx-edge`.
- **Una esquina que no encaja.** Los radios cambiaron (7/11/16 → 8/12/22); un componente anidado puede haber quedado con la esquina interior más grande que la exterior.

- [ ] **Paso 2 · Las mismas siete a 390 px**

Estrechar el navegador a 390 px y repetir. Las tablas con columnas `optional` y los diálogos son donde más aparece.

- [ ] **Paso 3 · Los estados feos**

En cada página, buscar los controles que el catálogo ya expone en estado vacío, cargando, con error, deshabilitado con razón, y con texto tres veces más largo. Un deshabilitado que quedó indistinguible de un activo es el fallo típico de un rebind.

- [ ] **Paso 4 · Arreglar, de a uno**

Por cada defecto: el arreglo va en el componente, no en el token, salvo que el mismo defecto aparezca en tres sitios — ahí el token es el que está mal.

**Antes de escribir cada arreglo, resolver el valor del token de origen y el de destino y compararlos.** No «se ve parecido». Es el procedimiento que la sección 7 del spec deja obligatorio.

- [ ] **Paso 5 · Volver a correr el arnés**

```bash
cd packages/frontend-lib && npm run contrast
```

Esperado: **exit 0**. Si un arreglo tocó un token, esto lo atrapa.

- [ ] **Paso 6 · Commit**

```bash
git add packages/frontend-lib/src
git commit -m "Lo que el barrido del catálogo encontró

<una línea por defecto: qué se veía mal, en qué componente, y por qué>"
```

---

## Tarea 5 · Documentación

**Archivos:**
- Modificar: `packages/frontend-lib/README.md`
- Modificar: `README.md` (raíz)

- [ ] **Paso 1 · El README de la librería**

Agregar, después de las tres reglas existentes, una sección **«La dirección: Nácar»** que diga:

- La ley: *nada se separa con una línea si puede separarse con luz o con tipografía; el color queda reservado al acento y al estado.*
- De dónde viene cada parte: forma de Prisma, tabla de Prisma pastel, barra de Halo claro.
- Las tres capas y los tres niveles de override, con los ejemplos de código del spec §3.
- Las tres perillas —`--sx-chrome-tint`, `--sx-thead`, `--sx-halo`— con qué mueve cada una.
- Que **`--sx-line` y `--sx-edge` hacen dos trabajos distintos**: ambiente y límite de control. Es el error que este trabajo corrigió y el que más fácil se vuelve a cometer.
- Que `npm run contrast` es parte de la verificación, no un extra.

- [ ] **Paso 2 · Actualizar el estado en el README raíz**

En la sección «Estado», reemplazar *«La dirección visual no está decidida»* por la dirección elegida, y anotar que `explore` queda como registro de las dieciséis.

- [ ] **Paso 3 · Anotar la deuda**

En la sección de deuda del README de la lib, agregar:

- El modo **oscuro de Nácar no existe**. `TOKENS_DARK` sigue siendo el oscuro de A y no es compatible. Hay que **diseñarlo**, no derivarlo.
- El bloque `.tbl` de Nácar en `explore/pages/Tablas.svelte` está **generado** de `[data-d='Z']` y no se entera si Z cambia.
- Los **filos de tono** (`--sx-positive-edge` y compañía) dan ~1.5:1 y están fuera del contrato a propósito, con el argumento escrito en `scripts/contrast.mjs`.

- [ ] **Paso 4 · Commit**

```bash
git add packages/frontend-lib/README.md README.md
git commit -m "La dirección queda escrita: Nácar, sus tres perillas, y la deuda que deja

Lo que más vale de esta documentación es la distinción entre --sx-line y
--sx-edge: dos trabajos distintos que compartían token durante toda la vida de
la librería. Queda escrito para que el siguiente rebind no lo repita."
```

---

## Definición de terminado

- [ ] `npm run contrast` sale **0**.
- [ ] `npm run tokens` regenerado y las dos formas coinciden.
- [ ] `npm run build` compila la librería y los ejemplos sin error.
- [ ] Las siete páginas del catálogo, en claro, a 1200 y a 390 px, sin superficie gris donde va blanco o acento.
- [ ] La perilla `--sx-chrome-tint` verificada en las tres configuraciones.
- [ ] `TOKENS_DARK` sin tocar, y su incompatibilidad escrita.
