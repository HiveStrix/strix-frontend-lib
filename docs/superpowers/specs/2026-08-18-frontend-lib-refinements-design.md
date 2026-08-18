# Ajustes a `@strix/frontend-lib` — rieles, encabezados, InfoDot y el contrato

Fecha: 2026-08-18 · Estado: aprobado, en implementación

Este documento recoge un pedido concreto sobre el sistema de diseño: los
rieles se cortan en seco, los encabezados rozan el borde, la variante de
color se ve casi blanca, falta una afición `?`/ⓘ de ayuda, y falta un
**contrato** que premie la linealidad y los márgenes para quien implemente la
librería. Lo que sigue es cómo se resuelve cada uno **sin contradecir las
leyes del sistema** (cromo acromático · el color nunca viaja solo · tres
registros tipográficos · reusar lo que existe) y, donde una decisión vieja
deja de ser cierta, reescribiendo su justificación en vez de dejarla podrir.

## Decisiones ya tomadas (con quien pidió el cambio)

1. **Rieles** — carril flotante, redondeado, que **llega al fondo** y conserva
   **márgenes** iguales. Estilo Apple, no un panel a ras.
2. **Encabezado** — **gutter garantizado**: el texto nunca roza el borde. Prop
   `bleed` para desactivarlo cuando el padre ya tiene padding.
3. **`banda`** — relleno de **acento** sólido por defecto + **tonos
   semánticos**; versión grande y completa.
4. **Ayuda** — punto **ⓘ** que revela su guía al pasar el mouse **y** al
   tocar/clic; distinto del `?` global de `ShortcutOverlay`.

---

## 1 · Rieles: flotantes, de altura completa, con márgenes

**Causa raíz.** `SideRail` es `flex: none` **sin altura** → mide lo que miden
sus ítems y, al lado de una columna de contenido más alta, flota y se corta en
el aire. `Sidebar` es `height: 100%` pero **marco a ras** (línea, sin radio,
sin márgenes).

**Cambio.** Ambos pasan a **tarjeta flotante** (radio `--sx-r-3`, sombra
`--sx-e-1`) que **se estira a la altura de su columna** (`align-self: stretch`
dentro de una fila con altura real), con `overflow-y: auto` para listas largas
y el pie (`Contraer`/toggle) fijado abajo con `margin-top: auto` — que
`SideRail` ya escribe, sólo que no tenía altura contra la cual empujar. Ese
único arreglo termina el «corta en seco abajo».

**Tensión que se resuelve a conciencia.** Hoy `Sidebar` es *marco* (línea) y
`SideRail` *contenido* (luz) **a propósito**, para que dos rieles no se lean
como «un corredor». El pedido es que **ambos** floten estilo Apple. Se unifican
a tarjeta flotante y se los mantiene distintos por lo que el sistema **ya**
usa para distinguirlos: `Sidebar` arranca colapsado a 64px (sólo íconos) y
`SideRail` mide 240px con encabezados de sección. Ese contraste de ancho +
contenido basta. Se **reescribe** la justificación «marco vs contenido /
línea vs luz» en las cabeceras de los dos archivos (la cultura de este repo es
actualizar el porqué, no dejarlo desactualizado).

**Márgenes.** Siguen siendo trabajo del layout del shell — pero se documenta un
patrón de shell (en el catálogo y el CONTRACT) que **garantiza** el gutter
alrededor del carril, y los componentes dejan de pelearse con él.

Archivos: `nav/Sidebar.svelte`, `nav/SideRail.svelte`, demo en
`catalog/pages/Estructura.svelte`.

## 2 · PageHeader: gutter garantizado + `bleed`

**Causa raíz.** `halo` y `sarion` no agregan padding horizontal — «es trabajo
del padre». Sin un padre con padding, el título/eyebrow/subtítulo tocan el
borde.

**Cambio.** `.hd` gana padding propio (horizontal **y** vertical) en `halo` y
`sarion` con un token de la escala (`--sx-s-5`/`--sx-s-6`), de modo que el
texto respire por los cuatro lados. `banda` ya se auto-rellena. Se agrega
`bleed` (boolean) para **desactivar** el gutter cuando el encabezado va dentro
de una `Card` que ya tiene su propio padding (evita padding doble). Se
actualiza la nota documentada del archivo para registrar la garantía nueva y
el porqué.

Archivos: `nav/PageHeader.svelte`.

## 3 · `banda`: acento sólido + tonos semánticos (encabezado grande)

**Causa raíz.** `banda` usa `--sx-thead` (~6% del tinte sobre blanco): tan
tenue que no se lee como «con color».

**Cambio.**
- **Default:** relleno **acento** sólido (`--sx-accent`), título en
  `--sx-accent-ink`, eyebrow/subtítulo en tinta-sobre-acento translúcida,
  padding generoso y tipografía grande — una tarjeta de encabezado realmente
  con color.
- **`tone`:** critical/attention/positive/info se dibujan con la **banda** de
  ese tono (`--sx-*-band` + `--sx-*-edge`) y su tinta oscura para el título —
  con color **y** legible.
- **Grande y completa:** soporta toda la anatomía (crumbs · eyebrow · título ·
  subtítulo · meta · actions · below) a escala hero.

**No es `Hero`.** `Hero` es el bloque de tablero a **dos columnas** (titular +
cifras al lado, su propio campo). `banda` es una **variante de encabezado de
ruta** a una columna. Distintos; se cruza la referencia en los comentarios.

Archivos: `nav/PageHeader.svelte`.

## 4 · InfoDot: la ayuda `?`/ⓘ (hover + tap)

**Contexto.** El set `Glyph` **no** trae `?`/`i`, y el `?` ya está reservado
para el `ShortcutOverlay` global. Así que la afición de ayuda por-elemento
necesita identidad propia: **ⓘ** por defecto.

**Cambio.** Nuevo `shell/InfoDot.svelte`: un control circular chico que
**envuelve el `Tooltip` existente** (hereda `aria-describedby`, top-layer,
Escape, moción reducida — no se reinventa nada, ley de «reusar lo que existe»).
Revela al **hover (mouse)** y al **tap/clic (touch + clic)**, inmediato al
foco. Marca `mark="info"` (default) | `"help"`. Se exporta desde `shell`
(familia «la reparación», junto a Tooltip).

**Integración con formularios.** `Field` ya tiene un `hint` que se dibuja como
párrafo inline — justo la prosa que el pedido quiere **reducir**. Se agrega
`hintDot` (boolean): con `hint` presente, colapsa la ayuda en una ⓘ junto a la
etiqueta y suprime el párrafo, manteniendo el `aria-describedby` del control
intacto (el texto del hint sigue disponible para el cableado accesible).

Archivos: nuevo `shell/InfoDot.svelte`, `shell/index.js`, `form/Field.svelte`;
opcional `shell/Glyph.svelte` (glifos `info`/`help`). Demo en
`catalog/pages/Superficies.svelte` (junto a Tooltip) y `Formularios.svelte`.

## 5 · TopBar: que el estado diseñado sea la primera impresión

**Causa raíz.** `TopBar` está bien **cuando se lo alimenta** (el demo completo
con búsqueda + sesión se ve bien); el demo del shell lo pasa pelado
(`product` + `nav`, sin slots) y por eso se lee «sin diseño».

**Cambio.** Un respiro vertical chico para que la identidad no pegue contra el
borde superior, y alimentar el demo del shell con slots reales de búsqueda +
sesión. Bajo riesgo.

Archivos: `nav/TopBar.svelte`, `catalog/pages/Estructura.svelte`.

## 6 · Linealidad

**Interpretación.** Filas y grillas se leen **alineadas**, nunca desparejas: un
rótulo con más texto **arrastra a sus vecinos a la línea**, no se sale él de la
línea. Cifras/tiles de una grilla comparten **altura**; una fila comparte
**línea base**.

**Cambio.** Se codifica como regla del CONTRACT y se corrigen las violaciones
actuales asegurando que los tiles/tarjetas de una grilla **se estiren a igual
altura** (`align-items: stretch`) y que las filas usen `align="baseline"` donde
corresponde (Row ya lo soporta). No se agrega componente nuevo salvo pedido
explícito.

Archivos: donde haya grillas de tiles (`metric/*`, tarjetas del catálogo),
CONTRACT.

## 7 · CONTRACT.md (normativo, para quien implementa)

Nuevo `CONTRACT.md`, enlazado desde el README, que **extiende** las leyes del
sistema:

1. **Márgenes garantizados.** Ningún texto ni control roza el borde de su
   contenedor. El cromo se auto-rellena o el shell garantiza el gutter.
   *Excepciones: overlays / dropdowns / pop-outs* (Tooltip, Menu, Sheet,
   Dialog, la burbuja del InfoDot).
2. **Sin desborde.** El texto trunca con elipsis o envuelve dentro de su caja;
   nunca se derrama (mismas excepciones).
3. **Linealidad.** Línea base compartida en filas; igual altura en grillas.
4. **Premiar lo escueto.** Rótulos escuetos; la explicación va en un
   InfoDot/Tooltip, no en prosa inline. El cromo queda gris; sólo el
   significado lleva color.
5. **Rieles desprendidos** llegan al fondo y conservan márgenes.

---

## Validación

No hay runner de tests unitarios en el repo; esta es obra visual. La
validación es el **catálogo en vivo** (light + dark, anchos angosto/ancho) más
`npm run contrast` para no romper el piso de contraste del sistema. Cada
workstream se verifica en el catálogo antes de darlo por hecho
(verification-before-completion).

## Alcance explícitamente fuera

- No se rehace el Shell de Hivestrix (vive fuera de esta librería).
- No se introduce un set de íconos nuevo (sólo, si hace falta, `info`/`help`).
- No se toca el motor de tokens ni el tema oscuro salvo los tonos que `banda`
  ya consume.
