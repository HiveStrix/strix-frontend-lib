# Strix · frontend-lib

El sistema de diseño de Strix: un juego de tokens y 58 componentes Svelte para todos los
frontends del ecosistema Hivestrix — la Shell, los módulos Core que se dibujan dentro de un
shadow root, y cualquier app de SvelteKit que venga después.

Un solo vocabulario, para que alguien que pasa de mantenimiento a facturación no tenga que
aprenderlo otra vez.

```bash
npm install          # dependencias
npm run dev          # el catálogo, en caliente
npm run build        # compila el catálogo a dist/
npm run preview      # sirve dist/ en http://localhost:5180
npm run tokens       # regenera src/lib/tokens.css desde src/lib/tokens.js
```

**Para verlo:**

```bash
npm run build && npx vite preview --port 5180
```

y abrí <http://localhost:5180>. El tema y la marca son enlazables:
`http://localhost:5180/?theme=dark&brand=opra#/tablas`.

---

## Las tres reglas

No son principios; son restricciones que los componentes ya hacen cumplir. Cada una se puede
verificar en el catálogo sin leer una línea de código.

### 1 · El cromo es acromático

El fondo, las líneas y la profundidad son neutros. El único color que aparece es **vocabulario**:
cinco tonos —`positive`, `attention`, `critical`, `info`, `neutral`— que significan lo mismo en
todos los productos. «Vencido» tiene que verse igual en mantenimiento, en facturación y en
inventario o el vocabulario deja de ser uno.

El acento **no es un tono**: es un hueco que cada producto llena. Ver *Ligar el acento*.

Corolario que vale escribir aparte: **la profundidad viene de la luz, no de los contornos.**
`--sx-e-1/2/3` tienen desplazamiento real y desenfoque suave porque eso es lo que hace una cosa
levantada con la luz. Un borde de 1 px es el *dibujo* de una caja. Los bordes existen para tres
cosas y nada más: el contorno de un control (`Field`), el anillo de foco, y `Divider`.

### 2 · El color nunca viaja solo

Un tono llega siempre con su **marca** y su **palabra**. Las cinco marcas viven en
`src/lib/marks.js` y están dibujadas para distinguirse **por forma a 9 px**: un visto, un
triángulo, un cuadrado, un anillo, una barra.

Quitale el color a cualquier pantalla del catálogo y no se pierde un solo dato. Esa es la prueba.

### 3 · Las cifras que se comparan se alinean

Tabulares, a la derecha, con cero cortado, en columna (`.sx-num`). Dos totales que no se alinean
son dos totales que nadie compara.

Y al revés, que es la mitad que se olvida: **la prosa nunca lleva tabulares.** Una frase corrida
en cifras tabulares se lee como un tartamudeo. Por eso la nota en prosa de un `DataList` es
deliberadamente *no* tabular.

---

## Consumir la librería

### Desde una app de SvelteKit

Los tokens son custom properties en `:root` y heredan hacia abajo. Se importan **una vez**, en la
raíz:

```js
// src/routes/+layout.svelte  ·  o src/app.html
import '@strix/frontend-lib/tokens.css';
import '@strix/frontend-lib/base.css';
```

`tokens.css` trae las variables y el re-amarre del tema oscuro. `base.css` trae el reset, los tres
registros tipográficos (`.sx-cap`, `.sx-id`, `.sx-num`), la regla de foco y `.sx-sr`.

```svelte
<script>
  import { Button, Table, Pill } from '@strix/frontend-lib';
  // o, para no arrastrar la tabla en un módulo que solo necesita tres campos:
  import { Field, Input, Select } from '@strix/frontend-lib/form';
</script>
```

El tema oscuro es un atributo, no una segunda hoja de estilos:

```js
document.documentElement.dataset.sxTheme = 'dark';   // o .classList.add('sx-dark')
```

### Desde un módulo Core, en un shadow root

Un Core es un custom element de Svelte que se dibuja en un **open shadow root** bajo un **CSP
estricto**, y ahí las dos maneras normales de traer CSS no sirven:

- una hoja de estilos **enlazada no cruza la frontera del shadow root** — el `<link>` del
  documento no llega adentro;
- el `@import` que sí lo haría **está prohibido por el CSP**.

Las custom properties *sí* heredan a través de la frontera, así que un módulo montado dentro de la
Shell hereda los tokens del documento gratis. Pero un módulo también tiene que funcionar cuando
nada arriba los definió. Entonces lleva su propia copia, **en línea**, en el `<style>` de su
componente raíz:

```svelte
<!-- Root.svelte del módulo Core -->
<svelte:options customElement={{ tag: 'strix-mantenimiento', shadow: 'open' }} />

<script>
  import { hostTokens, hostBase } from '@strix/frontend-lib';
  import { PageHeader, Table } from '@strix/frontend-lib';
</script>

<style>
  {@html hostTokens() + hostBase()}
</style>

<PageHeader title="3 máquinas están vencidas." tone="critical" />
<Table … />
```

- **`hostTokens(selector = ':host')`** — todas las variables, en el selector que le pases.
- **`hostTokensDark(selector = ':host([data-sx-theme="dark"])')`** — el re-amarre oscuro.
- **`hostBase()`** — los tres registros tipográficos, `.sx-sr`, la regla de foco y
  `prefers-reduced-motion`. **Hace falta.** Los componentes de esta librería escriben
  `class="sx-cap"`, `class="sx-num"`, `class="sx-id"` y `class="sx-sr"` en su propio markup; en un
  documento esas clases vienen de `base.css`, y en un shadow root no vienen de ningún lado. La
  falla es silenciosa y fea: las etiquetas dejan de ser versalitas, las cifras dejan de alinearse,
  y cada nombre oculto de una `Table` se pinta en pantalla.

`tokens.css` se genera desde `tokens.js` con `npm run tokens`. **Nunca edites `tokens.css` a
mano** — las dos formas salen de un solo origen justamente para que no puedan divergir.

#### Lo que no funciona adentro de un shadow root, y por qué

| No funciona | Por qué | Qué hace la librería |
|---|---|---|
| `@font-face` | Chrome y Safari lo ignoran adentro de un shadow root | La tipografía es una pila del sistema. La personalidad sale del tratamiento: contraste de peso, tracking negativo, cifras tabulares |
| `document.activeElement` | Desde afuera de un shadow tree siempre reporta el host | `Dialog`, `Sheet` y `Menu` bajan por `getRootNode().activeElement` |
| `contains(e.target)` en un evento de documento | Todo evento se re-apunta al host: da `true` para la página entera | `Menu` y `SearchField` usan `composedPath()` |
| Portalear a `document.body` | El nodo sale del shadow root y pierde estilos y tokens | `Sheet` y `Menu` **no** portalean. El costo está documentado en cada archivo |
| `::backdrop` | No hereda de `:host` | `ShortcutOverlay` lleva un color de reserva |

---

## Ligar el acento

Ningún componente de esta librería nombra jamás un color de marca. Piden cuatro variables, y eso
es todo lo que un producto liga — **una vez, en su raíz**:

```css
:root {                                   /* o :host, en un Core */
  --sx-accent:      #A33F26;
  --sx-accent-ink:  #FFFFFF;              /* la tinta que sobrevive ENCIMA del acento */
  --sx-accent-soft: color-mix(in srgb, #A33F26 12%, var(--sx-surface));
  --sx-accent-edge: color-mix(in srgb, #A33F26 34%, var(--sx-surface));
}
```

`soft` y `edge` se mezclan **con la superficie** en vez de darse como colores fijos: así una sola
ligadura es correcta en los dos temas —un tinte en claro, una sombra en oscuro— sin escribir el
bloque dos veces.

**Sin ligar nada**, el acento resuelve a `--sx-n-900` (la tinta más profunda de la rampa neutra),
que es un primario usable de verdad y no un hueco vacío esperando configuración. Un producto que
no tiene marca todavía no tiene que hacer nada.

El interruptor de la portada del catálogo hace exactamente esto y nada más: escribe cuatro
propiedades en `<html>`. Todo lo demás —botones, filas seleccionadas, switches, barras de
progreso, el anillo de una Card— lo sigue solo.

---

## El mapa

```
src/lib/
├── tokens.js          las variables como datos + hostTokens() / hostBase()
├── tokens.css         GENERADO desde tokens.js — no editar
├── base.css           reset, los tres registros, foco, .sx-sr
├── marks.js           las cinco marcas de tono. Una sola vez, para todo el sistema
├── index.js           la superficie pública: todo se importa desde acá
├── Pill.svelte        LA FIRMA — tono + marca + palabra. No pertenece a una familia:
│                      es el vocabulario que las familias hablan
│
├── shell/     (10)  Card · Panel · Well · Stack · Row · Divider · Toolbar · Sheet ·
│                    Tooltip · Glyph          → catálogo: «Superficies»
├── action/    (5)   Button · ButtonGroup · IconButton · Menu · SplitButton
│                                             → «Acciones»
├── form/      (13)  Field · Input · NumberInput · Textarea · Select · Combobox ·
│                    Checkbox · Radio · Switch · DateInput · FileDrop · ChoiceCards ·
│                    today()                  → «Formularios»
├── nav/       (9)   PageHeader · Breadcrumb · Tabs · Segmented · FilterChips ·
│                    SearchField · Pagination · SideRail · ShortcutOverlay
│                                             → «Estructura»
├── data/      (4)   Table · DataList · DataState · DataSkeleton     → «Tablas»
├── feedback/  (9)   Dialog · Confirm · Toast · Alert · EmptyState · ErrorState ·
│                    Skeleton · Progress · ReviewPanel               → «Retroalimentación»
└── metric/    (5)   Stat · StatStrip · Bar · StackedBar · Sparkline · format.js
                                              → «Métricas»

src/catalog/
├── App.svelte         el shell: navegación, tema, acento
└── pages/             una página por familia
```

**La cabecera de cada `index.js` es la documentación de verdad.** Dice para qué existe la familia,
dónde está la frontera entre sus miembros y cuándo *no* usar cada uno. Leelas antes de elegir un
componente; son más cortas que este README y contestan mejor.

### El vocabulario de props

Estas palabras significan lo mismo en toda la librería. Si encontrás una que no, es un bug.

| Prop | Significa | Valores |
|---|---|---|
| `tone` | Qué estado semántico es | `positive` · `attention` · `critical` · `info` · `neutral` (o `none`, donde no reclamar estado es una opción) |
| `variant` | Cuánto peso visual tiene una acción | `solid` (uno por vista) · `outline` (el de siempre) · `ghost` · `danger` |
| `size` | Un paso de la misma escala | `sm` · `md` · `lg` |
| `label` | El nombre accesible de un control o grupo | — |
| `compact` | El mismo objeto, con menos aire | booleano |
| `loading` / `busy` | Hay una petición en vuelo. **Nunca** `disabled` | booleano |
| `error` + `fix` | El problema **y** la salida. Dos props, nunca una | — |
| `noun` / `nounPlural` / `gender` | Para que el componente escriba en español correcto | `'m'` · `'f'` |

---

## Lo que esta librería NO trae, a propósito

- **Ningún router, ningún store, ningún cliente de datos.** Esto son componentes. El estado, las
  rutas y las peticiones son del producto.
- **Ninguna paleta de categorías.** Las series son acromáticas (cuatro pasos de la rampa de
  tinta). Una paleta de categorías es la vía más rápida a seis productos que cada uno entiende
  algo distinto por «azul».
- **Ningún `@font-face`.** Ver la tabla del shadow root.
- **Ningún dark mode automático por `prefers-color-scheme`.** El tema es una decisión del producto
  y de la Shell; la librería solo ofrece el amarre.
- **Ningún formateo de moneda ni de fecha en los componentes de datos.** Una tabla que sabe
  formatear colones es una tabla que no sirve para un inventario en dólares. Formateá en la
  columna. (`metric/format.js` existe porque *dentro* de la familia de cifras hace falta que las
  cinco piezas impriman igual.)
- **Ningún grid editable** (`role="grid"`, tabindex móvil, foco por celda). `Table` es
  deliberadamente un documento, no una app.

---

## Lo que falta, y se sabe

Esto no es una lista de deseos: es lo que un desarrollador se va a encontrar.

### Componentes que otros componentes prometen y que no existen

- **`Threshold`.** `Bar` y `Stat` se refieren a él en sus cabeceras —«una cifra que cruzó una
  línea es trabajo de Threshold»— y no existe. Hoy la forma honesta de decir «pasó el límite» es
  un `Bar` con `tone` y `toneWord`.
- **`Timeline`.** Los ejemplos de `Tabs` la usan. No está.
- **Un gráfico con ejes.** `Sparkline` no puede contestar «¿cuánto en marzo?» *por diseño*. Esa
  pregunta necesita un gráfico con marcas, y ese vive en su propia pantalla.

### Deuda de estructura

- **`src/lib/format.js` no existe.** `metric/format.js` dice en su propia cabecera que debería ser
  compartido. Sigue viviendo en `metric/` y se re-exporta desde la raíz; mover el archivo es un
  cambio de una línea que todavía no se hizo.
- **`DataState` y `EmptyState`/`ErrorState` se superponen.** Ya no en el *dibujo* —`DataState`
  ahora delega en los otros dos, así que hay una sola tarjeta vacía y una sola tarjeta de error en
  todo el sistema— pero sí en la API. `DataState` es el que una `Table` o un `DataList` renderiza
  por vos y su trabajo real es **escribir la oración en español** (artículo, género, cita del
  filtro, total). `EmptyState`/`ErrorState` son los que ponés a mano cuando la oración la escribís
  vos, que para una página entera casi siempre deberías.
- **Cada componente re-declara `.sx-sr` y su regla de foco.** Es correcto (`base.css` no cruza la
  frontera del shadow root) pero está copiado, y la mitad lo llama `.sr` y la otra mitad `.sx-sr`.
  `hostBase()` es la respuesta correcta y todavía no se cobró la deuda de borrar las copias.
- **No hay escala de tamaños ni de anchos.** `Sheet` y `Dialog` construyen sus anchos con
  múltiplos de `--sx-s-20` y con `ch`. Es deliberado —un cajón no va a ser el lugar donde se
  invente una escala— pero significa que dos componentes deciden anchos de dos maneras.
- **Los tamaños de ícono no están en una escala.** Van de 9 a 22 px según el componente. `Glyph`
  ya tiene su propia respuesta (dibujado a 16, peso de trazo constante); el resto son SVG en línea
  que cada archivo dimensiona a ojo.

### Deuda de catálogo

- **Las páginas no tienen todas la misma profundidad.** «Acciones», «Formularios», «Tablas» y
  «Retroalimentación» documentan cada estado de cada componente. «Superficies», «Estructura» y
  «Métricas» —que no existían— documentan cada componente en su forma principal y en el estado que
  lo rompe, y cada una cierra con una sección que dice qué le falta.
- **«Acciones» usa un gutter de página distinto** al de las otras seis (`.pg` en vez de `.page`).
  Se ve al pasar de una a otra.
- **Nada está probado automáticamente.** No hay tests. La verificación de este repo es mirar las
  siete páginas en los dos temas a 1200 y a 390 px, que es exactamente lo que hay que rehacer
  después de tocar algo.

### Sin resolver

- **No hay un `Toast` global.** El componente es la *región* y hay que montarlo una vez en la raíz
  del producto y alimentarle la lista. No hay un store que lo haga; eso es del producto.
- **`Menu` y `Sheet` no portalean**, así que un ancestro con `overflow: hidden` recorta el menú y
  un ancestro con `transform` atrapa el cajón. Está documentado en cada archivo y no hay arreglo
  posible sin romper el shadow root.
- **`ShortcutOverlay` usa `::backdrop`**, que no hereda de `:host`. Adentro de un Core hay que
  ligar `--sx-scrim` también en `:root`, o se queda con el color de reserva.
