---
name: Strix — variante colorida (super clay)
description: El sistema de diseño de Strix en su dirección soft-UI de arcilla, la línea de los mockups de Stitch. Rama design/variante-colorida.
colors:
  canvas: "#EFEBF8"
  surface: "#F6F3FC"
  sunk: "#E6E1F1"
  highlight: "#FFFFFF"
  ink: "#201E29"
  ink-2: "#514E60"
  ink-3: "#5F5C6B"
  accent: "#6541BE"
  hue-violet: "#6541BE"
  hue-aqua: "#1FA6B8"
  hue-coral: "#EE6079"
  hue-amber: "#E39A2E"
  hue-sage: "#4CA777"
  hue-indigo: "#5566D6"
  positive: "#276A47"
  positive-band: "#DDF0E4"
  attention: "#8A5A00"
  attention-band: "#FCEBD0"
  critical: "#B02840"
  critical-band: "#FCDDE3"
  info: "#434A93"
  info-band: "#E2E8F7"
typography:
  display:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "33px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 620
    lineHeight: 1.3
  body:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  data:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "13.5px"
    fontWeight: 500
rounded:
  mark: "8px"
  control: "16px"
  button: "14px"
  well: "12px"
  container: "28px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
components:
  container:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.container}"
    padding: "24px"
  tray:
    backgroundColor: "{colors.sunk}"
    rounded: "{rounded.control}"
    padding: "12px"
  field:
    backgroundColor: "{colors.sunk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "40px"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.button}"
    height: "40px"
  icon-well:
    rounded: "{rounded.well}"
    size: "36px"
---

<!-- impeccable:design-schema 1 -->

# Diseño — variante colorida, super clay

Las reglas que hacen que un módulo nuevo, o uno que se migra, se vea de la misma
familia que el Shell y los otros módulos sin que nadie lo tenga que adivinar. Los
valores normativos son los tokens de `src/lib/tokens.js`: este archivo explica
cómo usarlos. Si un valor de acá y uno de `tokens.js` no coinciden, manda
`tokens.js`, y este archivo está desactualizado.

## Overview

**Arcilla sobre lila.** Cada pieza de la pantalla es un objeto blando con volumen:
se levanta del lienzo con una luz blanca arriba a la izquierda y una sombra violeta
abajo a la derecha, o se hunde en él con lo inverso. La jerarquía es táctil antes
que tipográfica: se sabe qué es contenedor, qué se toca y dónde se escribe por
cómo está moldeado.

Salió de una exploración en Google Stitch que el usuario eligió y afinó en tres
vueltas. El orden de esas vueltas importa, porque cada una corrigió una lectura
equivocada:

1. «Más color»: la rampa deja de ser gris, lleva traza morada, y el lienzo es lila.
2. «Como en Stitch»: la luz blanca va **afuera**. Una arcilla sólo con sombras
   internas no se parece a los mockups.
3. «Le falta profundidad»: la profundidad no está en una sombra grande. **Cada
   pieza tiene la suya**, en dos direcciones, sobre un pozo hondo (`#E6E1F1`).
4. «Super clay», con el encabezado de color: a cada nivel levantado se le suma un
   filo de luz y un volumen **adentro**. Esa es la arcilla.

El registro sigue siendo de trabajo (modo Operate): es blando, pero no es un
juguete. La escaneabilidad y el estado mandan sobre la expresión.

## Colors

- **Lienzo** `#EFEBF8` (el del Tablero; cada módulo el suyo, ver abajo): el fondo
  de toda pantalla. Tiene color porque la luz blanca de afuera sólo existe sobre
  un fondo que no es blanco.
- **Superficie** `#F6F3FC`: lo que se levanta (contenedores, controles, fichas).
- **Pozo** `#E6E1F1`: lo que se hunde (campos, bandejas, rieles, contadores, pozos
  de ícono). Tiene que ser hondo: con un pozo claro, todo lo hundido se aplana.
- **Tinta** `#201E29` / `#514E60` / `#5F5C6B`: principal, secundaria y terciaria.
  Nunca negro puro.

**El color llega en dosis, y cada dosis tiene un trabajo:**

| Dosis | Dónde | Trabajo |
|---|---|---|
| Acento del módulo, pleno | el botón primario (uno por vista) | la acción |
| Acento del módulo, al 22 % | el encabezado `PageHeader variant="banda"` | en qué módulo estás |
| Matiz de categoría (`--sx-hue-*`) | `IconWell` | qué **cosa** es (un módulo, una cola, una familia) |
| Tono semántico (tinta + banda) | `Pill`, hundida | en qué **estado** está, siempre con su palabra |

Un matiz no dice un estado y un tono no identifica una cosa. Para decir «vencido»
va una `Pill` de tono `critical` con su palabra, no un pozo coral.

**La arcilla de cada módulo.** El lila es el del Tablero. Cada módulo lleva la
misma arcilla girada al tono de su acento y MUY diluida (`clayHost`): el fondo
guarda el 36 % de la saturación del lila y la sombra el 50 %, así que es un
soplo del tono —Mantenimiento apenas tibio, Clientes apenas rosado—, nunca una
pantalla de color. Misma luz por rol, así que el volumen y el contraste son los
mismos en todos.
El Shell no tiene luz propia: adopta la del módulo montado, acento incluido.

**Matiz por módulo** (el pozo del módulo en la barra lateral y en sus widgets):
Tablero `violet` · Mantenimiento `amber` · Inventario `indigo` · Clientes `coral` ·
Facturación `aqua` · Costeo `sage` · Gastos y compras `amber` · Bandeja de entrada `aqua` ·
Divisiones `indigo`. Hay más módulos que matices: se repiten, pero nunca dos vecinos
en la barra lateral.

## Typography

**Outfit** para la interfaz y **JetBrains Mono** para todo dato que se compara:
códigos (`BAT014`, `OT-1042`), cantidades, montos, fechas en tabla, conteos. La
lib nombra las dos familias pero no las carga, porque un `@font-face` dentro de un
shadow root se ignora. Las carga el anfitrión (el Shell, la app), y sin ellas todo
cae al stack de sistema sin romperse.

La escala es la de siempre (`11 · 12.5 · 13.5 · 15 · 19 · 25 · 33 · 46`), con el
cuerpo en 15. La jerarquía sale del peso (400 / 550 / 620 / 700) y del volumen de
la pieza que contiene el texto, no de tamaños gritados.

## Layout

- **Nada suelto sobre el lienzo.** Todo grupo de contenido vive en una pieza: un
  contenedor, una bandeja o una ficha. Texto y listas apoyados directo en el
  lienzo se leen como «texto plano de fondo», que es el defecto que dio origen a
  esta regla (la vista Pendientes de Mantenimiento). La única excepción es el
  aire entre bloques.
- **Una columna centrada.** El contenido de un módulo va en una columna de
  **1200 px de contenido** (`max-width: calc(1200px + 2 * var(--sx-s-6))` con el
  relleno lateral de `--sx-s-6`), centrada en el área del core. Es la misma en
  todos los módulos: con anchos distintos, el contenido salta de lugar al pasar
  de uno a otro dentro del Shell. El orden de arriba abajo es:
  1. el encabezado (`PageHeader variant="banda"`);
  2. la barra de herramientas, levantada;
  3. los bloques.
- **El ritmo:** `24px` entre bloques, `16–24px` de padding adentro de un
  contenedor, `12px` entre fichas de una bandeja, `8px` entre controles de un
  grupo. Siempre más aire arriba de un título que abajo.
- **La bandeja** es el patrón para toda lista de trabajo (pendientes, órdenes,
  lecturas, devoluciones). Tiene tres niveles:

  ```
  contenedor (levantado)                 ← --sx-e-card, radio 28
    cabecera: IconWell · título · contador hundido · pista
    bandeja (hundida)                    ← --sx-sunk + --sx-e-sunk, radio 16
      ficha (levantada)                  ← --sx-surface + --sx-e-1, radio 16
        pill de estado (hundida) · código (mono) · descripción · acciones
      ficha …
  ```

  Las fichas salen de un hueco, no están apiladas sobre una tarjeta. Por eso no
  es «una tarjeta dentro de otra», que la lib no hace nunca.

- **Datos comparables en tabla.** Van en `Table` adentro de su contenedor, y nunca
  en fichas. La bandeja es para cosas que se trabajan de a una; la tabla, para
  cosas que se comparan.

## Elevation & Depth

Dos direcciones y cuatro alturas. Los valores están en `tokens.js`.

**Levantado:** una luz clara teñida de la propia superficie, al 55 %, afuera arriba-izquierda (el blanco pleno encandilaba y sobresalía del fondo), sombra del tono afuera
abajo-derecha, y, en super clay, un filo de luz y un volumen violeta adentro.

| Token | Para qué |
|---|---|
| `--sx-e-card` | contenedores: tarjeta, `Panel`, `Sidebar`, `Table`, encabezado |
| `--sx-e-1` | controles y fichas: botón, ítem activo de navegación, ficha de bandeja |
| `--sx-e-2` | ese control un escalón más arriba (hover, tooltip) |
| `--sx-e-chip` | lo más chico: filtro en reposo, número de página, avatar |
| `--sx-e-primary` | el botón primario: luz blanca + sombra del color del acento |

**Hundido:** sombra adentro arriba-izquierda, luz adentro abajo-derecha.

| Token | Para qué |
|---|---|
| `--sx-e-sunk` | campos, bandejas, rieles (`Switch`, `Segmented`, barras) |
| `--sx-e-well` | el hueco de un `IconWell` |
| `--sx-e-pill` | lo chico que se hunde: `Pill` de estado, filtro elegido, contador |

**Lo que flota** (`--sx-e-3`: menús, hojas, toasts, popups) no lleva la luz
blanca: se apoya sobre contenido o sobre el velo, y ahí un halo blanco se lee como
un brillo sucio.

**Una pieza apretada se hunde.** Un botón en `:active` y un filtro elegido pasan
de levantado a hundido. Eso es lo que hace una tecla física.

## Shapes

Nada tiene aristas: marca 8, control y campo 16, botón 14, pozo 12, contenedor 28,
píldora 999. El checkbox se queda en 8 para seguir leyéndose cuadrado al lado del
radio redondo: «cualquiera» contra «uno».

## Components

- **`PageHeader variant="banda"`:** el encabezado del destino, en el pastel del
  acento del módulo con tinta oscura. Adentro va una sola acción primaria (el
  sólido conserva el acento) y, si hace falta, pills de resumen.
- **`IconWell`:** el pozo de ícono. Va en la cabecera de un contenedor, en la
  navegación (`hue` por ítem) y en `Panel` (`hue`). El fondo es el matiz al 16 %
  sobre el pozo y el ícono el matiz al 66 % contra la tinta, medido a 3:1.
- **`Pill`:** hundida y sin filo. Estado = tono + palabra, siempre.
- **`Button`:** radio 14. Hay un primario por vista, que es el sólido de acento;
  el resto va `outline` (teñido) o `ghost`.
- **Campos** (`Field`, `Combobox`, `DatePicker`, `SearchField`, `Checkbox`,
  `Radio`): tallados con `--sx-field` / `--sx-e-field`. El borde de 1 px se queda,
  porque es el límite que el contrato mide a 3:1.

- **Estados** (`EmptyState`, `ErrorState`, y el `DataState` de `Table`): suelto
  en la página, una tarjeta levantada. Adentro de un contenedor se **hunde**
  (pozo, radio 16). `Table`, `Card` y `Panel` lo hacen solos; el contenedor
  propio de un core lleva la clase `sx-nest`. Sus botones van `outline`: el
  primario de la vista es el de la banda.
- **`Toast`:** sin filo de color. La marca del tono va en un pozo de su banda.
- **Campos sin rótulo a la vista** (una celda de una tabla de líneas): la prop
  `labelHidden` conserva el `<label>` como nombre accesible y no lo dibuja.
- **`Menu` de fila:** `variant="ghost" compact`, con el nombre accesible de la
  fila. El motivo de un ítem apagado se dibuja debajo de su etiqueta.

Cada perilla de la variante tiene en el componente un fallback que reproduce el
look de `main`: `--sx-btn-*`, `--sx-banda-*`, `--sx-pill-line`, `--sx-nav-pick`,
`--sx-pg-raise`, `--sx-e-card`, `--sx-e-chip`, `--sx-e-pill`, `--sx-e-primary`,
`--sx-e-nav`, `--sx-e-well`, `--sx-tone-bar`, `--sx-toast-mark*`, `--sx-nest-*` y
`--sx-num-font`. Dos más son de layout y las pone el consumidor:
`--sx-ph-measure` (el tope del título de `PageHeader` para un nombre propio largo)
y `--sx-sticky-top` (lo que ya está pegado arriba de un `PageHeader sticky`).

## Do's and Don'ts

**Sí**

- Poner todo contenido en una pieza, y elegir la pieza por lo que hace:
  contenedor, bandeja, ficha o campo.
- Usar la bandeja para listas de trabajo y `Table` para comparar.
- Poner un `IconWell` con el matiz de la cosa en la cabecera de cada contenedor.
- Correr `node scripts/contrast.mjs` después de tocar un color. Todo fondo nuevo
  para texto entra al contrato con su par.

**No**

- Texto o listas sueltos sobre el lienzo.
- Líneas finas como única separación. La separación la hace el volumen.
- Un matiz para decir un estado, o un color sin su palabra.
- Luz blanca en lo que flota.
- Más de un primario por vista.
- Un `border-left` de color en fichas o avisos.

### Checklist para migrar un módulo

1. `package.json`: `"@strix/frontend-lib": "github:HiveStrix/strix-frontend-lib#design/variante-colorida"`,
   y `npm install` fuera de iCloud. Verificar la versión en disco: el lock
   miente «up to date».
2. Tema del módulo: su **acento** (claro y oscuro) y su **arcilla**,
   `clayHost(acento)` después de `hostTokens() + hostTokensDark()`. Nada de
   rampas a mano (`--sx-thead`, `--sx-ground`, `chromeRamp(...)` sueltos): la
   arcilla del módulo es la receta del lila girada a su tono, y el Shell la
   adopta entera junto con el acento (CONTRACT §6).
3. Encabezado: `PageHeader variant="banda"`.
4. Barrer la vista buscando contenido suelto sobre el lienzo y ponerle su pieza:
   contenedor, bandeja o ficha.
5. `IconWell` con el matiz del módulo o de la cosa en cada cabecera de contenedor.
6. Estados en `Pill`, con su palabra.
7. Correr los tests del módulo y mirar la vista en el Shell, en claro y oscuro.
