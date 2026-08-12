# Strix · frontend-lib

El sistema de diseño de Strix: un juego de tokens y 54 componentes Svelte para todos los
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

Los cinco tonos son hex fijo, sin excepción — ninguno deriva de la rampa neutra ni del acento. Es
a propósito: si uno solo dependiera del cromo, ese tono cambiaría de color entre dos productos con
acentos distintos, y «ninguno» dejaría de significar lo mismo en los dos. (`--sx-neutral` fue la
excepción hasta esta reconstrucción: apuntaba a `--sx-n-500`, así que su color se movía con el
cromo de cada dirección.)

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

## La dirección: Nácar

Las tres reglas de arriba son restricciones; Nácar es la silueta concreta que las lleva a un
mobiliario. Se eligió comparando dieciséis direcciones sobre el mismo contenido —el registro queda
en `explore.html`, ver *Estado* en el README raíz— y esto documenta en qué tokens vive, de dónde
sale cada pieza, y qué perillas mueve un producto sin salir del sistema.

### La ley

> Nada se separa con una línea si puede separarse con luz o con tipografía. El color queda
> reservado a dos cosas: el acento y el estado.

Un borde de 1 px sigue existiendo para las tres cosas que la regla 1 ya nombra —el contorno de un
control, el anillo de foco, `Divider`— y para nada más. Todo lo que en otra librería sería una
línea, acá es una sombra o un cambio de peso tipográfico.

### De dónde viene cada parte

Nácar no es una variante: es una plantilla nueva armada con tres piezas de tres direcciones
distintas.

- **La forma es de Prisma**: radio 12 y 22, superficies opacas, sombra real con desplazamiento,
  los pasteles de estado resueltos contra blanco.
- **La tabla es de Prisma pastel (`Z`)**: copiada por valor, los 59 tokens de `[data-d='Z']`
  acotados a `.tbl` en `explore/pages/Tablas.svelte`. Es la escalera de densidad de tres escalones
  que hace legible una tabla de ocho columnas, y no se podía tomar de Cristal — su superficie es
  `rgba(255,255,255,.56)` y esa escalera depende de un campo detrás que Nácar, sobre blanco, no
  tiene.
- **La barra es de Halo claro (`T`)**: no se separa con una línea sino con la luz que deja caer. La
  geometría de T no se toca; lo que cambia es la opacidad.

Fuera de la tabla, Nácar es Z con el cromo dividido por tres, más un fondo blanco.

### Las tres capas

```
CAPA 1 · primitivas    la rampa de neutros, con su traza violeta
                        --sx-n-0 … --sx-n-900
                             ↓
CAPA 2 · roles          qué es cada cosa, no de qué color es
                        --sx-ground --sx-surface --sx-sunk --sx-line
                        --sx-edge --sx-ink --sx-ink-2 --sx-ink-3 --sx-ink-on
                             ↓
CAPA 3 · perillas       lo que retunea la dirección sin tocar valores
                        --sx-chrome-tint  --sx-halo  --sx-thead  --sx-accent
```

Los roles apuntan a las primitivas (`--sx-line: var(--sx-n-150)`); las perillas retunean sin que
nadie tenga que ir a buscar un valor. Un producto elige el nivel más alto que le resuelve el
problema:

1. **Nácar tal cual** — no se escribe nada. Es el default.
2. **Afinarlo** — se mueve una perilla:
   ```css
   --sx-accent: #B45309;
   --sx-chrome-tint: #8E8E93;   /* grises neutros en vez de la traza violeta */
   --sx-halo: transparent;      /* sin la firma de luz en la barra */
   --sx-thead: var(--sx-sunk);  /* encabezados con relleno */
   ```
3. **Necesidad puntual** — se pisa un rol o una primitiva:
   ```css
   --sx-line: #E0E0E0;
   --sx-n-150: #E0E0E0;
   ```

Los tres niveles son custom properties: funcionan igual en el Shell (luz DOM) y dentro de un Core
(shadow root abierto).

### Las tres perillas

- **`--sx-chrome-tint`.** Es un color, no un porcentaje: el que se mezcla en cada peldaño de la
  rampa neutra (`color-mix(in srgb, var(--sx-chrome-tint) 4%, #FAFAFB)` en el más claro, hasta un
  8 % en los intermedios). Por default vale el mismo morado que `--sx-accent`, `#6541BE`. Un core
  que no quiera la traza violeta liga esta única propiedad a un gris y las once primitivas se
  destiñen de una vez, no una por una.
- **`--sx-thead`.** El fondo de encabezado, de tabla y de panel a la vez. Está separado de
  `--sx-sunk` a propósito: `--sx-sunk` también pinta los controles de formulario, así que si
  compartieran token, cambiarle el color al encabezado le cambiaba el color a los inputs de paso.
- **`--sx-halo`.** La firma de la dirección: la luz que la barra superior deja caer en vez de una
  raya (`box-shadow: 0 12px 28px -18px var(--sx-halo)` en `PageHeader`). Deriva del acento al 70 %
  contra transparente — subió desde 55 % al mirarlo en pantalla: sobre papel un resplandor se apaga
  mucho más rápido que sobre un fondo teñido, y a 55 % quedaba por debajo del umbral en que se
  percibe; ligarlo a `transparent` la apaga sin tocar ninguna regla.

### El acento ya no es casi negro

Antes, sin ligar nada, `--sx-accent` resolvía a `--sx-n-900` — casi negro —, con el argumento de
que un acento sin marca debía ser igual un primario usable. Ese argumento se cae en Nácar por una
razón mecánica: `--sx-chrome-tint` ya vale el morado de la dirección, así que el mobiliario entero
sale con esa traza, y un acento casi negro contra un cromo violeta es una dirección desafinada de
fábrica. El default pasa a ser `#6541BE`, el mismo morado. Sigue siendo un hueco —un producto lo
llena ligando cuatro propiedades, ver *Ligar el acento*— pero hoy, sin ligar nada, ese hueco no
desentona con lo que lo rodea.

### `--sx-accent-soft`, `--sx-accent-pick` y `--sx-accent-edge` derivan del acento

Antes `--sx-accent-soft` y `--sx-accent-edge` eran dos peldaños fijos de la rampa de grises
(`--sx-n-100` y `--sx-n-200`). Hoy los tres se mezclan con el acento, contra blanco:

```css
--sx-accent-soft: color-mix(in srgb, var(--sx-accent) 10%, #FFFFFF);
--sx-accent-pick: color-mix(in srgb, var(--sx-accent) 18%, #FFFFFF);
--sx-accent-edge: color-mix(in srgb, var(--sx-accent) 28%, #FFFFFF);
```

El cambio de `--sx-accent-soft`/`-edge` existe porque el anterior fue el defecto más caro de toda
esta reconstrucción: una parte grande de la librería se había movido para que un estado interactivo
se iluminara en vez de ensuciarse, apuntando a `--sx-accent-soft` en cada control con hover o
selección (`grep -rl "var(--sx-accent-soft)" src/lib` da el número de hoy) — y como ese token era
un gris fijo de la rampa, el arreglo no llegaba a hacer efecto. La regla que hay que llevarse: **un estado
interactivo se pinta con `--sx-accent-soft`, nunca con `--sx-sunk`.** `--sx-sunk` es el fondo en
reposo de un control; usarlo para un estado da una superficie más sucia, no una que responde.

**La distinción que separa `--sx-accent-soft` de `--sx-accent-pick` es PASAJERO contra
PERSISTENTE, no «cualquier estado interactivo».** `--sx-accent-soft` es lo que dura mientras el
puntero está encima o el foco está puesto — hover, focus. `--sx-accent-pick` es lo que queda
cuando el usuario ya eligió algo — una fila seleccionada en `Table`, un ítem activo en `SideRail`.
Es el error que más fácil se repite en este sistema, y ya se cometió dos veces: primero los dos
estados compartieron `--sx-accent-soft` y una fila elegida se volvía indistinguible de la fila de
al lado bajo el cursor; el arreglo de esa ronda separó «seleccionado» a un anillo de acento pleno
en vez de a un segundo relleno, y un anillo alrededor de una fila de tabla no se lee como
highlight — se lee como un marco. La salida son dos rellenos, uno por cada duración de estado.

Por qué 10 % y 18 %, en los dos casos por la misma razón: cada uno tiene que despegarse del otro Y
aguantar lo que se dibuja ENCIMA. `--sx-accent-soft` a 16 % — cuando todavía hacía los dos
trabajos — le daba a `--sx-edge` 2.71:1, por debajo del piso de 3.0; a 10 %, sólo con el hover y el
focus, `--sx-edge` sobre `--sx-accent-soft` da hoy **3.84:1** con el morado por defecto y **3.59:1**
con la perilla en un neutro. `--sx-accent-pick` a 20 % hace caer `--sx-ink-3` a 4.45:1, por debajo
de AA con la perilla en un neutro; a 18 % — el último escalón que aguanta las dos configuraciones —
`--sx-edge` sobre `--sx-accent-pick` da **3.38:1** morado / **3.16:1** gris, y `--sx-ink-3` da
**4.94:1** morado / **4.60:1** gris. `npm run contrast` mide las dos superficies para los tres
tokens que se dibujan encima (`--sx-edge`, `--sx-ink-2`, `--sx-ink-3`).

### `--sx-line` y `--sx-edge` hacen dos trabajos distintos

Éste es el error que este trabajo corrigió, y el que más fácil se vuelve a cometer: separar filas
y delimitar un control no son el mismo trabajo, aunque compartieran token en la dirección anterior.

- **`--sx-line`** separa — cierra una cabecera, divide una fila de la siguiente. Es *ambiente*:
  puede ser tan tenue como haga falta, no hay requisito de contraste para una separación
  decorativa.
- **`--sx-edge`** delimita — es el borde de un `Field`, de un `Input`, de cualquier control. Dice
  dónde se puede escribir. Eso es información, no decoración, y por eso tiene que dar **al menos
  3:1** contra la superficie sobre la que se dibuja (WCAG 1.4.11).

Compartir token fue el defecto: en A, donde `--sx-edge` colgaba del mismo peldaño que `--sx-line`,
el borde de un input daba **1.52:1**. En Nácar `--sx-edge` salta a su propio peldaño de la rampa
(`--sx-n-400`) en vez de acompañar a `--sx-line`, y hoy da **4.47:1** contra blanco con la perilla
en el morado por defecto (**4.18:1** con la perilla en un neutro).

Un borde tiene dos lados, y el segundo casi se escapa: un control en hover tiene su borde rodeado
de `--sx-accent-soft` por los dos lados, no de blanco; un checkbox dentro de una fila *seleccionada*
tiene el suyo rodeado de `--sx-accent-pick`, que es más fuerte todavía. `--sx-n-400` está calibrado
para aguantar las dos — **3.84:1** morado / **3.59:1** gris contra `--sx-accent-soft`, **3.38:1**
morado / **3.16:1** gris contra `--sx-accent-pick` — y `npm run contrast` mide las tres superficies,
no sólo la de reposo.

La lección general, no sólo de este par: **una regla que dice `var(--sx-algo)` no dibuja un color,
dibuja lo que ese token valga donde se lee.** Es el mismo error que costó cuatro intentos en la
fase de exploración — ahí una regla copiada de Cristal (`background: var(--d-sunk)`) aclaraba una
fila en una dirección donde `sunk` era blanco translúcido, y oscurecía la misma fila en una
dirección donde `sunk` era un gris opaco. Verificar quiere decir resolver el valor final y comparar
números, no mirar el nombre de la variable y confiar en que suene razonable.

### La verificación

`npm run contrast` es parte de la verificación, no un extra: resuelve cada token a color real y
mide el contraste, en vez de confiar en que el nombre de la variable sea razonable. Corre el
contrato duro (`--sx-edge` contra superficie, fondo, `--sx-accent-soft` Y `--sx-accent-pick` —un
borde tiene dos lados, y dos estados distintos rodeándolo—, `--sx-ink`/`-2`/`-3` contra superficie
y `--sx-ink-2`/`-3` contra `--sx-accent-soft` Y `--sx-accent-pick` —el texto que se dibuja encima
de un estado pasajero o de uno persistente—, la tinta sobre el acento, cada tono sobre su banda) y
además informa —sin romper el build— el filo de cada tono, `--sx-thead` contra la tarjeta,
`--sx-accent-edge` y el acento pleno que sostiene el anillo de selección en `Card` y
`ChoiceCards`. El filo de tono y
`--sx-accent-edge` quedan fuera del contrato duro a propósito: WCAG 1.4.11 pide 3:1 para el límite
que hace falta para **identificar** un componente, y ni el filo de una insignia ya seleccionada ni
un hover de fila identifican nada por sí solos — eso lo hacen la banda, la marca y la palabra
(`Pill.svelte`), no el filo. El argumento completo vive en `scripts/contrast.mjs`.

El mismo contrato corre **dos veces**: una contra `TOKENS` y otra contra `{...TOKENS, ...TOKENS_DARK}`
—que es exactamente cómo se apila `[data-sx-theme="dark"]` sobre `:root` en el navegador—, y el
proceso sale 1 si cualquiera de las dos tablas falla. No siempre fue así: el arnés corrió sólo
contra el claro durante buena parte de este trabajo, y el oscuro se armó —tres tokens nuevos
incluidos— sin que nada lo midiera. El resultado fue silencioso y concreto: una fila seleccionada
en oscuro se pintaba con el lavanda del ESTADO CLARO, heredado sin ligar, y encima le caía tinta
pensada para leerse sobre gris oscuro — 2.99 donde el piso es 4.5. Se veía razonable en pantalla y
fallaba el contrato; nadie lo vio porque nada lo medía en ese tema. Un tema que no se mide es un
tema que se ve bien y falla.

Sumale las siete páginas del catálogo a 1200 y 390 px, en los dos temas: `npm run contrast` prueba
que un color exista con el contraste que promete; no prueba que la pieza se vea bien. Las dos
verificaciones son necesarias y ninguna reemplaza a la otra.

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
  --sx-accent-soft: color-mix(in srgb, #A33F26 10%, #FFFFFF);
  --sx-accent-edge: color-mix(in srgb, #A33F26 28%, #FFFFFF);
}
```

`soft` y `edge` se mezclan **contra `#FFFFFF` fijo**, el mismo criterio que usa `tokens.js` para el
acento sin ligar de la librería: es la receta de Nácar, una dirección de luz sobre blanco, no una
fórmula que se re-liga sola en oscuro. Un producto con tema oscuro tiene que declarar su propio
bloque de estas cuatro variables bajo `[data-sx-theme="dark"]` — ver *Deuda de Nácar*.

Hay un quinto derivado que casi nunca hace falta tocar: `--sx-accent-pick`, el relleno de
selección persistente (18 % contra blanco). Se deriva de `--sx-accent` con la misma fórmula que
`soft` y `edge`, así que **una fila seleccionada ya toma el color de marca sin que el producto
declare nada** — ver el interruptor del catálogo más abajo. Sólo hace falta declararlo si el
producto quiere un ratio distinto del 18 % por defecto, igual que con `soft` y `edge`.

**Sin ligar nada**, el acento resuelve a `#6541BE`, el morado de Nácar — no a `--sx-n-900` como
en la dirección anterior. La razón es mecánica, no estética: `--sx-chrome-tint` ya vale ese mismo
morado, así que el mobiliario entero sale con su traza, y un acento casi negro contra un cromo
violeta es una dirección desafinada de fábrica. Sigue siendo un hueco vacío que un producto llena
ligando las cuatro propiedades de arriba; lo que cambió es que hoy, sin ligar nada, ese hueco no
desentona con lo que lo rodea. Un producto que no tiene marca todavía no tiene que hacer nada.

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

### Deuda de Nácar

- **El modo oscuro de Nácar pasa el contrato, pero no está diseñado.** `npm run contrast` corre
  ahora contra los dos temas y los dos dan verde: `--sx-thead`, `--sx-halo` y `--sx-accent-pick` —
  los tres tokens que el oscuro no ligaba y heredaba del claro sin que nada lo midiera— tienen
  valor propio; `--sx-edge` subió a `#9C9AA1` e `--sx-ink-3` a `#BEBDC1`, fijos a hex y no a un
  peldaño de la rampa, para aguantar los tres fondos posibles bajo un borde o un texto (superficie,
  hover, selección — el más exigente manda); `--sx-neutral` dejó de colgar de `var(--sx-n-400)` —el
  mismo peldaño que usa `--sx-edge` del claro y que ya se movió dos veces por razones ajenas al
  oscuro— y pasó a `var(--sx-ink-3)`. Pero **llevado al mínimo verificable no es lo mismo que
  diseñado**: `TOKENS_DARK` sigue siendo, en su mayoría, el oscuro de la dirección anterior. Sus
  grises de base (`--sx-sunk: #1B1F22`, `--sx-line: #2C3134`, `--sx-ink: #EDEFF0`,
  `--sx-ink-2: #BCC1C4`, `--sx-accent-edge: #3A3F43`) son hex escritos a mano, sin la traza de
  `--sx-chrome-tint` que el claro de Nácar sí lleva en toda su rampa — pasan el contrato porque el
  contrato mide contraste, no temperatura de color, y nadie los tocó porque re-teñir el tema entero
  es una decisión de diseño que esta tarea no pidió. `--sx-accent` en oscuro sigue siendo casi
  blanco (`#EDEFF0`, heredado de la dirección A) en vez de una variación del morado de Nácar, que es
  la pieza más grande de esa herencia y la que más notaría un ojo mirando la pantalla.
  Adicionalmente, **`--sx-edge` e `--sx-ink-3` en oscuro sólo se verificaron contra el
  `--sx-chrome-tint` por defecto** (`#6541BE`): con la perilla en gris (`#8E8E93`, el ejemplo que
  documenta esta misma página) `--sx-surface` se corre lo suficiente como para que
  `--sx-accent-pick` se aclare de más, y el trío que mide contra ese fondo cae por debajo del piso
  (`--sx-edge` 2.87, `--sx-ink-3` 4.27, `--sx-ink-2` 4.39 — piso 3.0 / 4.5 / 4.5). El claro tiene
  este mismo riesgo resuelto a mano, con los dos escenarios anotados en los comentarios de
  `tokens.js` («X morado / Y gris»); el oscuro todavía no. Y **nadie miró el resultado en
  pantalla**: pasar el contrato dice que un color existe con el contraste que promete, no que la
  cabecera, el halo o la fila seleccionada se vean bien — esa verificación, como con el claro, es
  humana y sigue pendiente.
- **El bloque `.tbl` de Nácar está generado, no vinculado.** `explore/pages/Tablas.svelte` copia
  los 59 tokens de `[data-d='Z']` por valor y los acota a `[data-d='AD'] .tbl`. Si `Z` cambia, este
  bloque queda desactualizado y nada lo avisa.
- **Los filos de tono (`--sx-positive-edge` y compañía) dan ~1.5:1**, y junto con
  `--sx-accent-edge` (1.56:1) quedan fuera del contrato duro a propósito. El argumento —WCAG
  1.4.11 pide 3:1 para el límite que hace falta para *identificar* un componente, y ni el filo de
  una insignia ya seleccionada identifica nada por sí solo, eso lo hacen la banda, la marca y la
  palabra— está escrito en `scripts/contrast.mjs` y se informa en `npm run contrast` sin romper el
  build. `--sx-accent-soft` y `--sx-accent-pick` ya no son uno de estos: `--sx-edge` y
  `--sx-ink-2`/`-3` medidos SOBRE los dos —un borde y un texto tienen que aguantar el fondo del
  estado en el que se dibujan, sea pasajero o persistente, no sólo la superficie en reposo— sí
  están en el contrato duro.
- **`--sx-n-100` y `--sx-n-200` quedaron sin ningún consumidor**, desde que `--sx-neutral` se fijó
  a hex y `--sx-accent-soft`/`-edge` pasaron a derivar del acento en vez de usarlos. Es higiene, no
  un defecto: la rampa se mantiene completa a propósito, para que un producto que la necesite
  entera la tenga.
- **La verificación visual de las siete páginas, a 1200 y 390 px, todavía no la hizo una persona.**
  Es la única parte del criterio de terminado que ningún script cubre — `npm run contrast` prueba
  que un color exista con el contraste que promete, no que la tabla, el panel o el formulario se
  vean bien.

### Resuelto

- **`Menu`, `Sheet`, `Tooltip` y `Combobox` ya no dependen de que su ancestro se porte bien.**
  Esta sección decía que un ancestro con `overflow: hidden` recorta el menú, uno con `transform`
  atrapa el cajón, y que no había arreglo sin romper el shadow root. Sí había arreglo, y no era
  subir un `z-index`: un `z-index` sólo compite DENTRO de su propio contexto de apilado, así que
  ninguno de los dos casos se le movía un pelo. El arreglo es otra capa. El atributo `popover`
  (Chrome 114+, Safari 17+, Firefox 125+) pone al elemento en la **top layer**, por encima de todo
  el documento y fuera de cualquier contexto de apilado o recorte, sin mover el nodo del lugar
  donde el marcado lo escribió — así que sigue funcionando dentro de un shadow root. Portalear a
  `document.body` seguía sin ser una opción, y con esto dejó de hacer falta.
- **Los cuatro usan `popover="manual"`, nunca `auto`.** `auto` trae su propio cierre por Escape,
  clic afuera y descarte automático al abrirse otro popover — y los cuatro componentes ya tenían
  las tres cosas, con su propio manejo de foco y de `aria-expanded`, escrito con el cuidado de
  `composedPath()` en shadow root que la versión del navegador no conoce. Con `auto` cada cierre
  hubiera corrido dos veces, una por el navegador y otra por el componente, sin que el orden entre
  las dos esté garantizado. `manual` da la top layer y nada más, que es lo único que hacía falta.
- **La consecuencia real fue la posición, no el atributo.** Un elemento en la top layer deja de
  estar posicionado contra su ancestro: `Menu`, `Tooltip` y `Combobox` medían con
  `position: absolute` contra un contenedor `relative`, y eso dejó de valer. Los tres pasaron a
  `position: fixed` con coordenadas calculadas a mano desde `getBoundingClientRect()` del
  disparador, recalculadas ante `scroll` —en captura, para oír también el de un contenedor
  interno con su propio scroll— y `resize` mientras están abiertos, con los listeners dados de
  baja al cerrar. `Sheet` no necesitó nada de esto: ya era `position: fixed; inset: 0`, y sólo le
  hacía falta el atributo para escapar de un ancestro transformado.
- **Dónde `popover` no existe, los cuatro caen en exactamente lo que hacían antes** — recortados
  por `overflow: hidden`, atrapados por `transform` — nunca en un estado a medias donde el
  atributo esté puesto pero la posición no lo acompañe, o al revés: `position: fixed` sin que el
  elemento esté de verdad en la top layer deja el popup pegado en la esquina del viewport, que es
  el mismo bug con otra cara. Los dos caminos leen la misma constante de soporte,
  `shell/toplayer.js`, detectada una sola vez con
  `typeof HTMLElement.prototype.showPopover === 'function'`.

### Sin resolver

- **No hay un `Toast` global.** El componente es la *región* y hay que montarlo una vez en la raíz
  del producto y alimentarle la lista. No hay un store que lo haga; eso es del producto.
- **`ShortcutOverlay` usa `::backdrop`**, que no hereda de `:host`. Adentro de un Core hay que
  ligar `--sx-scrim` también en `:root`, o se queda con el color de reserva.
