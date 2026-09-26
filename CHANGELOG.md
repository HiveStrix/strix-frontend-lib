# Changelog

Las versiones se instalan por tag (`npm install …#v0.8.0`). Ver el README.
Los releases `v0.1.0`–`v0.7.2` están en los tags de git; este archivo arranca
en la 0.8.0.

## v0.11.0 — 2026-09-25

> Construida **sobre `v0.10.0`** (que ya trae el `hintDot` de `v0.9.2`). Es,
> byte por byte, el `src/lib` que el clúster ya corre fijado por el commit
> `04644f2` desde el despliegue de la variante del 2026-09-24: esta versión
> sólo le pone nombre, para que nadie dependa de una rama.

### Nuevo
- **La variante colorida — «arcilla».** Soft-UI sobre lila: cada pieza se
  levanta del lienzo con luz blanca arriba a la izquierda y sombra teñida abajo
  a la derecha, o se hunde con lo inverso. Relieve por pieza (`--sx-e-card`,
  `--sx-e-chip`, `--sx-e-well`, `--sx-e-pill`, `--sx-e-primary`), campos
  tallados (`--sx-field`, `--sx-e-field`) y pozo hondo. Las reglas de uso están
  en `DESIGN.md`.
- **`clayTokens(accent)` y `clayHost(accent, selector?, darkSelector?)`** — la
  arcilla de un módulo a partir de su acento: la receta del lila girada al tono
  del acento y muy diluida. Los lavados del acento (`soft`, `pick`, `edge`) y el
  nuevo **`--sx-accent-well`** se MIDEN contra esa arcilla en vez de salir de un
  porcentaje fijo, así un acento claro (el ámbar de Mantenimiento) no pierde el
  hover ni el filo.
- **`PALETTE_TOKENS`** — lo que `adoptPalette` copia ahora es la atmósfera
  entera del core: rampa, acento, superficie, pozo y elevación. La Shell no
  tiene luz propia; adopta la del módulo que está mostrando.
- **`IconWell`** (`shell`) — el pozo de ícono de color.
- **Glifos** `star`, `mail` y `chat`.
- **`Button`**: `solid` pasa a brillante (glossy), `outline` a teñido con la
  perilla `--sx-btn-tint`, y hay una quinta variante, **`frosted`** (vidrio).
  Los nombres y los números de las cuatro anteriores no se movieron.
- **`ErrorState`** acepta `retryVariant`.
- **La moción.** Tres tokens nuevos —`--sx-ease-out` (llegada),
  `--sx-ease-spring` (resorte, sólo para lo chico) y `--sx-ease-in` (salida)—
  y los componentes los usan: presión con resorte en los botones, perilla del
  `Switch` que se estira, visto del `Checkbox` que se dibuja, indicador que
  viaja en `Segmented` y `Tabs`, `Dialog`/`Sheet`/`Toast`/`Menu`/`Tooltip` que
  llegan, detalle de `Table` que se despliega, barras que crecen y líneas que
  se dibujan. Cada componente los pide con fallback, y cada uno apaga su moción
  con `prefers-reduced-motion` (base.css no cruza un shadow root).

### Ojo al migrar
- **Es un rediseño, no un parche.** Subir desde `v0.10.0` cambia cómo se ve
  todo; que compile no alcanza, pide una pasada a ojo por pantalla.
- **El acento SÍ se adopta** (CONTRACT §6, reescrito). Un core emite su arcilla
  con `clayHost(acento)` y no declara a mano ni la rampa ni los lavados del
  acento: los mide la receta.
- **Tests en jsdom:** las transiciones de Svelte 5 y la moción llaman a
  `element.animate`, que jsdom no tiene. Hay que stubbearlo en el setup de los
  tests (inbox lo hace en `ui/src/test/setup.ts`).
- **`Checkbox`** dibuja el visto y la barra de indeterminado siempre, en un
  solo `<svg>`, y el CSS elige cuál se ve. Un test que buscaba la AUSENCIA del
  trazo del visto tiene que mirar el estado (`aria-checked`) en su lugar.
- **`Button`** agrega la perilla `--sx-btn-press` (cuánto se achica al
  apretar); dentro de un `ButtonGroup` pegado vale `1`, porque una mitad soldada
  que se achica abre una rendija en la costura.

### Arreglado
- Los alias de la variante y `--sx-field`/`--sx-e-field` se re-declaran en el
  tema oscuro; antes quedaban con el valor claro.
- La pill del ítem activo de la barra lateral ya no se corta a la derecha.
- La acción de un `Alert` habla en su tono; `Stat` sólo calla el «Sin datos
  todavía» de fábrica cuando hay nota; `Toolbar` en columna ya no envuelve;
  el outline teñido de `PageHeader` se lee dentro de la banda con acento oscuro.
- Los hallazgos del pulido de los módulos (clients, divisions,
  inventory, billing, costing, inbox y el Shell).

## v0.10.0 — 2026-09-11

> Construida **sobre `v0.9.1`**: incorpora su arreglo de `dense` en `Combobox` y
> `DateInput`, y le suma lo de abajo.

### Nuevo
- **`DivisionPicker`** (`form`) — el nodo del árbol organizacional del tenant, en
  un control. Tres módulos (inventory, expenses, clients) lo resolvían por su
  cuenta y de tres formas distintas; esto es el acuerdo. Es **presentacional**:
  recibe los nodos en `divisions` y no busca nada, porque esta librería no tiene
  capa de datos y el catálogo no tiene servidor. **No se dibuja con menos de dos
  nodos** — una raíz sola no es una decisión, y un desplegable de una sola opción
  es ruido en cada formulario. Sobre una docena de opciones cambia solo a
  `Combobox`. Si está oculto pero le queda un `value` que la lista no resuelve, lo
  dice en vez de desaparecer callado.
- **`divisionOptions(nodes, { includeInactive, allLabel, indent })`** (`form`) —
  el etiquetado del árbol (orden por `path`, sangría por profundidad, `(inactiva)`,
  la opción «todas»), exportado aparte para que una pantalla que arme su propia
  lista obtenga exactamente las mismas etiquetas.

### Ojo al migrar
- **El `value` del `DivisionPicker` es un `string`, y `''` es «nada elegido».**
  Qué significa ese vacío lo decide el backend de cada core —«todas» al filtrar,
  «raíz» en una bodega, «sin clasificar» en una compra—, así que se traduce en el
  borde del API, no en el componente. Un core que venía guardando números tiene
  que pasar a `String(...)` al cargar el formulario y a `Number(...) || …` al
  guardar.

### Arreglado
- **La sangría del árbol necesitaba espacio duro.** El HTML colapsa el espacio en
  blanco inicial, así que un `<option>` sangrado con espacios normales se dibujaba
  pegado al margen igual que su padre: la sangría quedaba en el DOM y no en la
  pantalla. Medido en el navegador antes de tocarlo.

## v0.8.2 — 2026-08-20

> Construida **sobre `v0.8.0`**.

### Nuevo
- **`Tabs` gana los tab-desplegables.** Un ítem con su propio `items` se dibuja
  como una pestaña con caret que abre un menú de sus hijos — una válvula de
  presión para el «dos a seis» cuando el riel se queda sin ancho y dos destinos
  emparentados, consultados seguido pero no a diario, pueden compartir un lugar.
  Elegir un hijo dispara `change` con su `key`, igual que una pestaña hoja, y la
  pestaña-grupo se ve seleccionada cuando `value` es uno de sus hijos. Es un solo
  tab-stop en el orden roving (← → la alcanzan, ↓/Enter la abren), con foco,
  Escape, Tab y click-afuera correctos —medido por `composedPath` para el shadow
  root—, y el menú sale por la **top layer** (`shell/toplayer.js`) para que el
  scroll horizontal del propio riel no lo recorte. Los ítems sin `items` no
  cambian en nada; es aditivo.



> Construida **sobre `v0.7.2`**: incorpora sus arreglos (tokens con el cromo
> precomputado a hex, `Table`, `TopBar`) y le suma lo de abajo.

### Nuevo
- **`InfoDot`** (`shell`) — la ayuda `ⓘ`/`?` que envuelve al `Tooltip` existente;
  revela con hover, tap y foco. Premia rótulos escuetos guardando la explicación
  en un punto. Integrado en `Field` vía la prop **`hintDot`**.
- **`Schedule`** (`data`) — calendario de EVENTOS (distinto del `Calendar`
  selector-de-fecha). Tres vistas conmutadas con `Segmented`: **mes** (grilla),
  **semana** (siete columnas) y **agenda** (lista con cabeceras relativas
  Hoy/Mañana). Ancla `viewDate` bindable en dos direcciones, para atar un
  `DatePicker` externo y saltar a cualquier fecha.
- **`CONTRACT.md`** — contrato normativo para quien implementa la librería
  (márgenes garantizados, sin desborde, linealidad, premiar lo escueto, rieles
  al fondo), enlazado desde el README y extendiendo las tres reglas.
- **`PageHeader`** gana la prop **`bleed`** (desactiva el gutter propio) y la
  variante **`banda`** ahora acepta tonos semánticos.

### Cambiado
- **Rieles flotantes.** `Sidebar` y `SideRail` pasan de marco a ras a **tarjetas
  desprendidas que se estiran a la altura de su columna** (llegan al fondo) y
  conservan márgenes. Se unifican al mismo objeto flotante y se distinguen por
  ancho/contenido.
- **`PageHeader` auto-rellena.** `halo` y `sarion` traen su propio gutter por los
  cuatro lados: el texto ya no roza el borde.
- **`banda` con color de verdad.** Antes `--sx-thead` (casi blanca); ahora
  relleno de acento pleno por defecto + tonos semánticos, grande y completa.

### Arreglado
- `PageHeader` no-pegajoso ya no se monta sobre el cromo pegajoso al hacer
  scroll (era `z-index: var(--sx-z-sticky)`, baja a `1`).
- La 4ª señal del `Sidebar` colapsado (ícono activo con trazo más grueso) ahora
  sí se dibuja: la regla apunta al `path`, no al `svg` (crítica P1).
- Los chips del `Schedule` truncan de verdad con elipsis; antes se cortaban a
  media palabra (`text-overflow` en un contenedor flex; crítica P2).
- La agenda ya no afirma «Próximos» sobre días pasados: título neutro `Agenda`
  (prop `agendaTitle`) y marca «pasado» por día (crítica P3).

### Notas de migración (0.7.2 → 0.8.0)
- **Rieles:** un shell que suelte `Sidebar`/`SideRail` en un contenedor plano los
  verá flotar y no llegar al fondo. Dales una fila flex con
  `align-items: stretch`, una altura de la que estirarse, y un `padding`+`gap`
  parejos para el margen — ver la cláusula 5 del `CONTRACT.md` y el demo del
  catálogo (`Estructura → Sidebar`).
- **`PageHeader` dentro de una `Card` que ya rellena:** pasá **`bleed`** para no
  duplicar el margen.
- **`banda`** ahora es un bloque de color pleno; si venías usándola como una
  banda tenue, revisá el contraste con lo que la rodea (o usá `halo`/`sarion`).
