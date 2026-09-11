# DivisionPicker — un solo selector de división para el ecosistema

**Fecha:** 2026-09-11 · **Repo:** `strix-frontend-lib` · **Rama:** `feat/division-picker`
**Base:** `cb777fc` (rama `feat/import-preview`) — decidido en brainstorming.
**Estado:** propuesto — pendiente de revisión antes del plan de implementación.

---

## 1. Contexto y problema

Tres UIs de módulo resuelven **la misma pregunta** —«¿bajo qué nodo del árbol organizacional
va esto?»— y las tres la resuelven distinto. El componente reutilizable de la lib se viene
anunciando en los comentarios de cada copia desde hace meses.

Lo que hay hoy:

| | `strix-inventory` | `strix-expenses` | `strix-clients` |
|---|---|---|---|
| forma | componente (86 líneas, `<select>` propio con tokens `--sx-*`) | componente (65 líneas, envuelve `Select`/`Combobox` de la lib) | **no hay componente** — `divisionOptions` + `<Select>` inline, duplicado en dos pantallas |
| tipo de `value` | `number` | `string` | `number` |
| «nada elegido» | `0` | `''` | `ROOT_DIVISION_ID` (1) |
| …y significa | «Todas» (filtro) **o** «Raíz» (form de bodega) | «Todas» **o** «sin clasificar» | raíz, siempre |
| se oculta cuando | `nodes.length === 0` | `nodes.length <= 1` | nunca — cae a `[{1,'General'}]` |
| inactivos | se muestran `disabled` | prop `includeInactive` | se filtran fuera |
| listas largas | `<select>` nativo siempre | cambia a `Combobox` sobre 12 | `<select>` nativo |
| de dónde sale el árbol | prop `divisions` | se lo carga solo (singleton) | `$effect` por pantalla |

El costo no es la duplicación de líneas: es que **un mismo gesto se comporta distinto según el
módulo**, que es exactamente lo que esta librería existe para impedir.

**Aclaración sobre el punto de partida:** la premisa de «tres copias del componente» no es
exacta. `strix-clients` no tiene componente — tiene el *fetcher* (`lib/divisions.js`) y el armado
de opciones abierto en código en `ClientsList.svelte:218` y `ClientDetail.svelte:171`, que
alimenta dos `<Select>` inline (`ClientsList.svelte:480`, `tabs/GeneralTab.svelte:41`).

## 2. Objetivos / No-objetivos

**Objetivos**

1. **Un** `DivisionPicker` en la familia `form` de la lib, exportado por `src/lib/index.js` y por
   `src/lib/form/index.js`.
2. Un contrato de props que cubra los dos modos reales —**filtrar** y **clasificar**— sin que el
   componente tenga que elegir por el backend qué significa «vacío».
3. Los tres consumidores importando de la lib, con las copias locales borradas.

**No-objetivos**

- El componente **no** hace `fetch`. Hoy `grep -rn "fetch(" src/lib` da **cero** resultados: la
  librería no tiene capa de datos en ninguna parte, y una ruta de backend más una convención de
  cookie no son vocabulario de un sistema de diseño. Además rompería el catálogo, que no tiene
  servidor. Cada core conserva su `divisions.js`.
- No se unifican los *fetchers* de los cores en esta entrega.
- No se toca la administración del árbol — eso vive en el módulo Divisiones.

## 3. Decisiones (tomadas en brainstorming)

1. **Presentacional + helper compartido.** El componente recibe `divisions`; además se exporta
   `divisionOptions()` para que el etiquetado (orden, sangría, `(inactiva)`) deje de reescribirse.
2. **Strings en todos lados.** `value` es `string`; `''` es «nada elegido».
3. **Se oculta salvo que haya más de un nodo.** La regla de expenses: una raíz sola no es una
   decisión, y un desplegable de una sola opción es ruido en cada formulario.
4. **Rama desde HEAD** (`feat/import-preview`), no desde el tag.

## 4. El componente

`src/lib/form/DivisionPicker.svelte`. Familia **form**: es un control con `Field` debajo, así que
alinea con sus vecinos sin que nadie lo acomode (cláusula 3 del contrato). Sintaxis Svelte 4,
como el resto de la lib.

```
divisions = []          [{ id, name, path, active }] — el árbol, lo trae el consumidor
value = ''              string; '' = nada elegido. bindable
label = 'División'
hint = '' / hintDot     se reenvían a Field (cláusula 4: la explicación va en un punto)
placeholder = 'Elegir…' el estado sin elegir, como palabra
allLabel = ''           si se pasa, la opción «que no filtra» REEMPLAZA al placeholder
includeInactive = false
disabled / dense / required / optional / error
on:change               detail = el string del value
```

`allLabel` reemplaza al placeholder en vez de sumarse: dos opciones vacías en la misma lista, una
deshabilitada, es una lista de la que no se puede volver atrás (razonamiento heredado de expenses).

### 4.1 Tres comportamientos propios

- **Se oculta salvo `divisions.length > 1`.**
- **Cambia `Select` → `Combobox` sobre 12 opciones.** Es lo que ya hace expenses y lo que
  prescribe la cabecera del propio `Select` de la lib («over about a dozen options … that is
  Combobox»). La etiqueta de cada opción es el `name` sangrado por profundidad; el `path` completo
  viaja como `hint`, que `Combobox` **sí** busca (`Combobox.svelte:137` filtra por `label`, `value`
  y `hint`). Así el árbol se lee como árbol en el select y sigue siendo encontrable tecleando en el
  combobox. El componente normaliza las dos formas de evento distintas en una sola.
- **Conserva la nota de huérfano de inventory.** Si está oculto pero `value` trae un id no vacío
  sin opción que lo resuelva, muestra *«División #N — el árbol no está disponible»* en lugar de
  desaparecer callado. Es lo único que avisa que un registro apunta a una división que el árbol no
  puede resolver.

### 4.2 Por qué no necesita `ROOT_DIVISION_ID`

La nota se dispara por «hay value y no hay opción para él», no por comparar contra la raíz. Así la
librería no se lleva adentro una constante que es del backend. Cada core conserva la suya para sus
propios defaults.

## 5. El helper

`divisionOptions(nodes, { includeInactive = false, allLabel = '' })`, JS plano, exportado desde
`form/index.js`. Ordena por `path`, sangra por profundidad contando segmentos del `path`, agrega
`(inactiva)`, y antepone la opción «todas» si corresponde. Es el método `options()` del store de
expenses, sacado de su clase. El picker lo usa por dentro; se exporta para que una pantalla que
arme su propia lista obtenga las mismas etiquetas.

La profundidad sale del `path` («general/centroamerica/cr»), que ya viene calculado del core dueño
del árbol. Recorrer `parent_id` sería reimplementar lo que el `path` resuelve.

## 6. `''` arriba, el significado de cada backend en el borde

El string vacío es el «nada elegido» de la UI; cada core lo traduce al salir. **Tres de las cuatro
traducciones ya existen:**

| | traduce `''` a | estado |
|---|---|---|
| filtros de inventory | se omite del query | **ya funciona** — `api.js:104` descarta `''` y `0` por igual |
| form de bodega (inventory) | `Number(form.divisionId) \|\| ROOT_DIVISION_ID` | un cambio de una palabra en `WarehousesScreen.svelte:105` |
| expenses | `Number(divisionId) \|\| undefined` | **ya funciona** — `NewPurchase.svelte:347` |
| clients | `Number(form.divisionId) \|\| ROOT_DIVISION_ID` | nuevo, 2 sitios |

Como el vacío es `''` y no `'0'`, las cuatro comprobaciones por truthiness de inventory
(`!!filterDivision` en `StockScreen:114`, `WarehousesScreen:216`, `ItemsScreen:137`, y
`form.divisionId || ROOT_DIVISION_ID`) **siguen funcionando sin tocarse**: `''` es falsy igual que
`0`. El riesgo de `'0'`-es-truthy no llega a existir.

## 7. Migración de los consumidores

**`strix-inventory`** — borrar `src/lib/ui/DivisionPicker.svelte`; 6 imports; seis `$state(0)` →
`$state('')`; en el form de bodega, `String(...)` al cargar (`WarehousesScreen:80`) y `Number(...)`
al guardar (`:105`). `allLabel="Raíz (general)"` (`:266`) sigue igual. `lib/divisions.js` se queda.

**`strix-expenses`** — borrar `src/components/DivisionPicker.svelte`; 4 sitios de uso
(`Purchases:138`, `Counts:93`, `Counts:115`, `NewPurchase:501`) pasan `divisions={divisions.nodes}`
y cargan el árbol ellos (`divisions.load()`), porque el picker ya no se autocarga. Los dos sitios
con `onchange={(v) => …}` pasan a `on:change={(e) => …}`. `divisions.svelte.js` pierde `options()`,
`available` y `depthOf`; conserva `load()`, `nodes` y `nameOf()`.

**`strix-clients`** — no hay componente que borrar: se reemplaza el `divisionOptions` duplicado
(state + `$effect`) y los dos `<Select>` inline. `lib/divisions.js` se queda. Estos formularios
**ganan** el ocultarse-si-es-trivial que nunca tuvieron.

## 8. Entrega

Aditiva: sólo se suma un export. La rama sale de `cb777fc`.

**Consecuencia a decir una vez:** un tag `v0.10.0` cortado desde esta rama **también lleva el
`ImportPreview` de la otra sesión**. Está bien si van juntos, pero el tag no es sólo de este
trabajo.

Alcance de esta entrega: rama de la lib + entrada en el catálogo (`Formularios.svelte`), tres ramas
de consumidor con la migración y el `package.json` apuntando a `#v0.10.0`, y **parar ahí**. Los
consumidores no instalan hasta que el tag exista, así que sus ramas quedan montadas esperándolo.
Sólo esos tres suben de versión; las otras cuatro UIs se quedan en `v0.9.0`.

El tag, el push y los merges **los decide el usuario**, por acción y por conversación.

**Sesiones concurrentes:** estos árboles cambian solos mientras se trabaja. Se hace `git add` por
archivo, nunca `git add -A`.

## 9. Verificación

- `pnpm build` en la lib (catálogo compila con el componente nuevo).
- El catálogo en `Formularios.svelte` muestra los dos modos (filtrar / clasificar), el caso de un
  solo nodo (no se dibuja nada) y el caso de más de 12 (aparece el Combobox).
- En cada consumidor, `npm ci && npm run build` **desde `/private/tmp`** — en `~/Documents` el
  build de vite no termina por iCloud.
- Repaso manual de los sitios de truthiness listados en §6, que es donde un cambio de tipo se
  rompe callado.
