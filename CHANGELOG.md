# Changelog

Las versiones se instalan por tag (`npm install …#v0.8.0`). Ver el README.
Los releases `v0.1.0`–`v0.7.2` están en los tags de git; este archivo arranca
en la 0.8.0.

## Unreleased (v0.12.0)

- **Combobox**: la lista se abre sola al enfocar sólo cuando la persona llegó con Tab; un foco programático (el primer campo de un Dialog) ya no la despliega tapando el formulario. Con el puntero abre el clic, como antes.
- **Select y Combobox**: la lista mide al menos 14rem aunque el campo sea más angosto (celdas de tabla) y se corre hacia la izquierda si se sale del borde.
- **Select**: la lista se cierra con un clic afuera también en Safari y Firefox de Mac. Antes sólo cerraba con el `blur` del botón, y esos navegadores no enfocan un `<button>` con el clic: la lista quedaba flotando en la top layer y el teclado no llegaba a ella. Ahora, mientras está abierta, un `pointerdown` en captura sobre el documento cierra si cae fuera de la caja y de la lista (mirando `composedPath()`, así funciona dentro del shadow root de un Core), y el clic enfoca el disparador. **Combobox** suma la misma red, aunque ahí el `focusout` ya alcanzaba.
- **Select**: `required` vuelve a frenar el envío de un `<form>` nativo. El valor viajaba en un `<input type="hidden">`, que queda fuera de la validación, y el formulario se enviaba con el Select vacío. Ahora viaja en un `<input>` invisible pero validable (fuera del orden de Tab y del árbol de accesibilidad); si el navegador lo enfoca para quejarse, el foco pasa al disparador. El mensaje es `requiredMessage` (por defecto «Elegí una opción de la lista.»). Como el `<select>` nativo, un Select `disabled` ya no manda su `name` al formulario.

- **Combobox**: `selectOnFocus` (por defecto) selecciona el texto al enfocar un campo con valor, así lo que se escribe reemplaza la etiqueta en vez de pegarse detrás; `searchIcon={false}` y `clearable={false}` para campos angostos (p. ej. un prefijo telefónico) sin tocar clases internas.

> Construida sobre `v0.11.0`. Responde al reporte del producto sobre los
> formularios: campos «toscos» en una interfaz blanda, ejemplos que no se
> distinguen de un valor, menús del sistema operativo, y búsquedas de
> relacionados que no sugieren ni dejan crear.

### Nuevo
- **Tokens del campo.** `--sx-ink-placeholder` (la terciaria disuelta en el
  campo: ~2.5:1 en claro, ~2.8:1 en oscuro), `--sx-field-edge` (el filo suave,
  el borde al 40 % sobre el relleno), `--sx-focus` (el acento oscurecido con la
  tinta, 3:1 contra campo y tarjeta con los acentos reales de los módulos) y
  `--sx-focus-halo`. Los cuatro siguen a la arcilla de cada módulo y están
  re-declarados en el oscuro.
- **`scripts/contrast.mjs` suma `BANDS`**: pisos blandos, con techo, para lo que
  no es contenido. El placeholder tiene que leerse (≥ 2.2) y NO parecerse a lo
  tecleado (techo 3.6 contra el campo, y la tinta a ≥ 3.0 del ejemplo); el filo
  suave, ≥ 1.4. Y dos `CHECKS` duros nuevos: `--sx-focus` a 3:1 contra el campo y
  la tarjeta. `--sx-ink-3` sobre el campo sigue en 4.5 (la ayuda).
- **`SearchPicker`** (`form` y la raíz): buscar un registro relacionado cuando
  hay que comparar antes de elegir. Un `Dialog` `lg` con la búsqueda enfocada
  arriba y una tabla (`columns` como en `Table`: `{ key, label, align?, mono?,
  value?, optional? }`) con «Agregar» por fila. `loader: async (q) => filas[]`
  con '' al abrir, `debounce` y protección contra respuestas fuera de orden.
  Flechas mueven la fila marcada sin sacar el foco del campo, Enter elige (la
  primera queda marcada al llegar resultados), Escape cierra. `createLabel`
  habilita «+ Crear «q»» en el pie. `closeOnPick={false}` para agregar varias
  líneas seguidas. La tabla entra en el diálogo: cifras, códigos y el botón con
  su ancho, el texto en hasta dos renglones; cuando la caja se angosta (medida
  con una container query, no con la ventana) se van primero las columnas
  `optional` y al final la del botón. En el teléfono es una hoja.
- **`Combobox`**:
  - **sugiere al recibir el foco** (`openOnFocus`, por defecto `true`): las
    primeras `maxVisible` opciones, filtradas letra a letra;
  - **`loader`** `async (query) => options[]`: la lista la trae el servidor, con
    '' al abrir y lo tecleado tras `debounce` ms (200); gana siempre la última
    pregunta; «Buscando…» mientras vuela y `loadErrorLabel` si falla. Con
    `loader` el filtro local se apaga (`filter` lo fuerza);
  - **`creatable`** + `createLabel`: una fila «+ Crear «q»» al final cuando lo
    tecleado no coincide exacto con ninguna opción, alcanzable con el teclado.
    Despacha `create` con `{ query, select }`: el padre crea el registro y llama
    `select({ value, label })`, o pone `value` y suma la opción;
  - slot **`foot`** dentro de la lista (recibe `query`);
  - `gender` (`'m'` | `'f'`) para «Ninguna categoría coincide…».
- **`Select` dibuja su propia lista** (ver *Ojo al migrar*): un botón con la caja
  de Field y un listbox en la top layer, con el teclado del patrón select-only
  combobox (flechas, Inicio/Fin, RePág/AvPág, Enter/Espacio, Escape detenido,
  Tab, Alt+↑, tipeo anticipado sin tildes), grupos con nombre, opciones apagadas
  que se saltan, `hint` por opción y volteo hacia arriba si no entra. `native`
  devuelve el `<select>` de la plataforma.

### Cambiado
- **Campos más suaves** (`Field`, y sus copias en `Combobox`, `DatePicker`;
  también `SearchField`): el filo en reposo es `--sx-field-edge`; el borde a 3:1
  vuelve en hover, apagado y error. **El foco dejó de ser el anillo de tinta de
  2 px** y pasó a un filo `--sx-focus` de 2 px con un halo del acento de 3 px,
  todo en `box-shadow` (se abre, no se estampa). Un campo inválido con foco
  conserva su rojo y suma su halo. En colores forzados vuelve el contorno.
- **Todos los placeholders** (`Field`/`Input`/`Textarea`/`NumberInput`,
  `Combobox`, `DatePicker`, `SearchField`, `Select` sin elegir) usan
  `--sx-ink-placeholder`.
- `DivisionPicker` reenvía `hintDot` también al `Combobox`, y al `Select` le
  pasa las opciones sin la pista del path (la sangría ya la dice).

### Ojo al migrar
- **`Select` ya no es un `<select>`.** Misma API (`value`, `options`,
  `placeholder`, `name`, `focus()`, eventos `change`/`focus`/`blur`), y `change`
  sigue siendo un evento del DOM: `e.currentTarget.value` da la cadena, como
  antes, y `e.detail` trae el valor sin convertir. Lo que cambia:
  - un test que buscaba `select`/`option` en el DOM tiene que buscar
    `[role=combobox]` y `[role=option]` (o pasar `native`);
  - `required` ya no bloquea el envío de un `<form>` nativo (el valor viaja en un
    `<input type="hidden">`, que no valida): validá en el `submit`, como el
    resto de la librería;
  - en un teléfono ya no abre la rueda del sistema: `native` si se quiere.
- **`Combobox` abre con el foco.** Un Combobox que recibe el foco al montar (el
  primer campo de un `Dialog`) aparece con la lista abierta. `openOnFocus={false}`
  devuelve el comportamiento anterior.
- **Tests en jsdom:** `Select` usa `popover` si existe (`showPopover`), igual que
  Combobox: jsdom no lo tiene y cae en el camino de `hidden`, sin cambios.
- **El anillo de foco de los campos cambió de forma**: una captura de pantalla
  de referencia (visual regression) de un campo enfocado cambia.

### Arreglado
- **`Tooltip` (y todo `hintDot`/`InfoDot`) ya no tira `state_unsafe_mutation`**
  cuando el control que describe se desmonta enfocado — la fila de un `{#each}`
  que se vacía o se quita con el foco en su ⓘ. Chrome despacha `blur` en pleno
  flush de Svelte y el listener crudo cerraba el tip ahí adentro; ahora los
  listeners van con `on()` de `svelte/events`, que corre fuera del contexto
  reactivo. Los demás componentes con `blur`/`focusout` ya usaban `on:` del
  marcado y no tenían el problema. El rodeo del consumidor (quitar el foco
  antes de vaciar la tabla) deja de hacer falta.

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
