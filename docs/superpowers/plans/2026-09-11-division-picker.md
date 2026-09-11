# DivisionPicker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un solo `DivisionPicker` en `@strix/frontend-lib`, consumido por inventory, expenses y clients, con las copias locales borradas.

**Architecture:** Componente **presentacional** de la familia `form` (recibe `divisions`, no hace `fetch`) construido sobre `Select` y `Combobox`, más un helper puro `divisionOptions()` que produce el etiquetado. `value` es `string` y `''` es «nada elegido»; cada core traduce ese `''` al significado de su backend en el borde del API.

**Tech Stack:** Svelte 4 syntax sobre Svelte 5 (como todo `src/lib`), Vite 6, pnpm 10. Sin runner de tests: la verificación es el catálogo + `pnpm build`, que es el patrón de este repo (62 componentes, cero tests).

**Spec:** `docs/superpowers/specs/2026-09-11-division-picker-design.md`

## Global Constraints

- **Sintaxis Svelte 4** en `src/lib` (`export let`, `$:`, `createEventDispatcher`). NO runas.
- **`value` es `string`.** `''` = nada elegido. Nunca se emite `number`.
- **Cero `fetch` en `src/lib`.** El componente no carga nada.
- **Se importa desde el índice**, nunca desde una ruta interna: `@strix/frontend-lib` o `@strix/frontend-lib/form`.
- **Rama de la lib:** `feat/division-picker`, desde `cb777fc`.
- **`git add` por archivo, nunca `git add -A`** — hay otra sesión trabajando en estos árboles.
- **No taggear, no pushear, no mergear.** La entrega termina en ramas.
- **Builds de Node desde `/private/tmp`**, nunca desde `~/Documents` (iCloud cuelga vite).

---

### Task 1: El helper `divisionOptions`

**Files:**
- Create: `src/lib/form/divisionOptions.js`
- Modify: `src/lib/form/index.js`

**Interfaces:**
- Consumes: nada.
- Produces: `divisionOptions(nodes, { includeInactive = false, allLabel = '', indent = true }) -> [{ value: string, label: string, hint: string }]`. Task 2 lo usa.

- [ ] **Step 1: Escribir el helper**

`src/lib/form/divisionOptions.js`:

```js
// Las opciones de un árbol de divisiones, como las espera Select/Combobox.
//
// Sale del método `options()` que vivía en el store de strix-expenses. Se
// exporta aparte del componente para que una pantalla que arme su propia lista
// obtenga EXACTAMENTE las mismas etiquetas — que es de lo que se trata que
// haya un solo picker.

/**
 * La profundidad sale del `path` («general/centroamerica/cr»), que ya viene
 * calculado del core dueño del árbol. Recorrer `parent_id` acá sería
 * reimplementar lo que el path resuelve.
 */
function depthOf(node) {
  return String(node.path ?? '').split('/').length - 1;
}

/**
 * @param nodes  [{ id, name, path, active }]
 * @param includeInactive  Los inactivos quedan FUERA al escribir (no aceptan
 *   registros nuevos) y DENTRO al filtrar: una sucursal cerrada sigue teniendo
 *   historia que mirar.
 * @param allLabel  El texto de la opción que no filtra nada. Si se pasa, va
 *   primero con value `''`.
 * @param indent  Sangra la etiqueta por profundidad, que es como se lee un
 *   árbol en una lista plana. Se apaga para el Combobox: su resaltado de
 *   coincidencia calcula el índice sobre la etiqueta plegada —que viene
 *   recortada— y lo aplica sobre la original, así que los espacios de sangría
 *   le corren el resaltado dos caracteres por nivel.
 */
export function divisionOptions(nodes, { includeInactive = false, allLabel = '', indent = true } = {}) {
  const opts = (nodes ?? [])
    .filter((n) => n && n.id != null)
    .filter((n) => includeInactive || n.active !== false)
    .slice()
    .sort((a, b) => String(a.path ?? '').localeCompare(String(b.path ?? '')))
    .map((n) => ({
      value: String(n.id),
      label:
        (indent ? '  '.repeat(depthOf(n)) : '') +
        String(n.name ?? n.path ?? '') +
        (n.active === false ? ' (inactiva)' : ''),
      // El path completo viaja como pista: el Combobox lo busca además del
      // label, así que «centroamerica» encuentra a su sucursal.
      hint: String(n.path ?? '')
    }));

  return allLabel ? [{ value: '', label: allLabel, hint: '' }, ...opts] : opts;
}
```

- [ ] **Step 2: Verificar el comportamiento**

No hay runner en este repo; el helper es JS puro, así que se comprueba con node directo.

Run:

```bash
node --input-type=module -e "
import { divisionOptions } from './src/lib/form/divisionOptions.js';
const nodes = [
  { id: 3, name: 'CR', path: 'general/centroamerica/cr', active: true },
  { id: 1, name: 'General', path: 'general', active: true },
  { id: 2, name: 'Centroamérica', path: 'general/centroamerica', active: true },
  { id: 4, name: 'Vieja', path: 'general/vieja', active: false }
];
const a = divisionOptions(nodes);
console.assert(a.map((o) => o.value).join(',') === '1,2,3', 'orden por path + inactiva fuera: ' + JSON.stringify(a.map((o) => o.value)));
console.assert(a[2].label === '    CR', 'sangría por profundidad: ' + JSON.stringify(a[2].label));
console.assert(a[2].hint === 'general/centroamerica/cr', 'el path viaja como hint');
const b = divisionOptions(nodes, { includeInactive: true });
console.assert(b.length === 4 && b[3].label.endsWith('(inactiva)'), 'inactiva incluida y marcada: ' + JSON.stringify(b[3].label));
const c = divisionOptions(nodes, { allLabel: 'Todas' });
console.assert(c[0].value === '' && c[0].label === 'Todas', 'allLabel primero con value vacío');
const d = divisionOptions(nodes, { indent: false });
console.assert(d[2].label === 'CR', 'sin sangría: ' + JSON.stringify(d[2].label));
console.assert(divisionOptions(null).length === 0, 'nodes nulo no explota');
console.log('divisionOptions OK');
"
```

Expected: `divisionOptions OK` sin ninguna línea `Assertion failed`.

- [ ] **Step 3: Exportarlo desde la familia**

En `src/lib/form/index.js`, al final del archivo:

```js
// El árbol organizacional del tenant, en un control. Presentacional: recibe
// los nodos, no los busca — esta librería no tiene capa de datos. El helper va
// al lado porque una pantalla que arme su propia lista tiene que poder obtener
// las mismas etiquetas.
export { default as DivisionPicker } from './DivisionPicker.svelte';
export { divisionOptions } from './divisionOptions.js';
```

NOTA: el `export` de `DivisionPicker.svelte` apunta a un archivo que crea la Task 2. Se escriben juntos acá para no tocar el índice dos veces; el build recién tiene que pasar al final de la Task 2.

- [ ] **Step 4: Commit**

```bash
git add src/lib/form/divisionOptions.js src/lib/form/index.js
git commit -m "feat(form): divisionOptions, el etiquetado del árbol en un solo lugar

Sale del método options() del store de strix-expenses. Se exporta aparte del
componente para que una pantalla que arme su propia lista obtenga las mismas
etiquetas.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: El componente `DivisionPicker`

**Files:**
- Create: `src/lib/form/DivisionPicker.svelte`
- Modify: `src/lib/index.js`
- Modify: `src/catalog/pages/Formularios.svelte`

**Interfaces:**
- Consumes: `divisionOptions()` de la Task 1.
- Produces: `<DivisionPicker divisions value label hint hintDot placeholder allLabel includeInactive disabled dense required optional error on:change />` donde `on:change` lleva `event.detail` = el string del value. Las Tasks 3–5 lo consumen.

- [ ] **Step 1: Escribir el componente**

`src/lib/form/DivisionPicker.svelte`:

```svelte
<script>
  // DIVISION PICKER — el nodo del árbol organizacional, en un solo control.
  //
  // EL FILTRO ES POR SUBÁRBOL, no por igualdad: elegir una región incluye sus
  // sucursales. Eso lo resuelve el core; acá sólo se manda el id.
  //
  // NO HACE FETCH. Recibe `divisions` y ya. Esta librería no tiene capa de
  // datos en ninguna parte, y una ruta de backend más una convención de cookie
  // no son vocabulario de un sistema de diseño — además el catálogo no tiene
  // servidor. Cada core conserva su propio cargador del árbol.
  //
  // `value` ES UN STRING y `''` es «nada elegido». Qué significa ese vacío lo
  // decide el backend de cada core —«todas» al filtrar, «raíz» en una bodega,
  // «sin clasificar» en una compra— y por eso se traduce en el borde del API,
  // no acá.
  import { createEventDispatcher } from 'svelte';
  import Select from './Select.svelte';
  import Combobox from './Combobox.svelte';
  import { divisionOptions } from './divisionOptions.js';

  /** El árbol del tenant: [{ id, name, path, active }]. */
  export let divisions = [];
  export let value = '';

  export let label = 'División';
  export let hint = '';
  /** Sólo llega al Select: el Combobox no tiene `hintDot`. */
  export let hintDot = false;
  export let placeholder = 'Elegir…';
  /**
   * Cuando se usa como filtro: el texto de la opción que no filtra nada.
   * SUSTITUYE al placeholder — dos opciones vacías en la misma lista, una
   * deshabilitada, es una lista de la que no se puede volver atrás.
   */
  export let allLabel = '';
  export let includeInactive = false;
  export let disabled = false;
  export let dense = false;
  export let required = false;
  export let optional = false;
  export let error = '';

  const dispatch = createEventDispatcher();

  /** Sobre una docena, la lista deja de ser algo que se recorre con la vista.
   *  Es el umbral que documenta la cabecera del propio Select. */
  const COMBOBOX_THRESHOLD = 12;

  $: nodes = divisions ?? [];

  // UNA RAÍZ SOLA NO ES UNA DECISIÓN. Un tenant sin árbol configurado no tiene
  // nada que elegir, y un desplegable de una sola opción es ruido en cada
  // formulario: sin al menos dos nodos, esto no se dibuja.
  $: visible = nodes.length > 1;

  $: pool = nodes.filter((n) => n && n.id != null && (includeInactive || n.active !== false));
  $: asCombobox = pool.length + (allLabel ? 1 : 0) > COMBOBOX_THRESHOLD;
  $: options = divisionOptions(nodes, { includeInactive, allLabel, indent: !asCombobox });

  $: current = String(value ?? '');

  // Un value que la lista no resuelve es una referencia colgada. Decirlo es lo
  // único que avisa que el registro apunta a una división que no se puede
  // mostrar; desaparecer en silencio la esconde.
  $: orphan = current !== '' && !options.some((o) => o.value === current);

  function pick(next) {
    value = next ?? '';
    dispatch('change', value);
  }
</script>

{#if visible}
  {#if asCombobox}
    <Combobox
      {label} {hint} {options} {disabled} {dense} {required} {optional} {error}
      value={current}
      noun="división"
      nounPlural="divisiones"
      placeholder="Buscar…"
      on:change={(e) => pick(e.detail?.value ?? '')}
    />
  {:else}
    <Select
      {label} {hint} {hintDot} {options} {disabled} {dense} {required} {optional} {error}
      value={current}
      placeholder={allLabel ? '' : placeholder}
      on:change={(e) => pick(e.currentTarget.value)}
    />
  {/if}
{:else if orphan}
  <p class="dp-orphan">División #{current} — el árbol no está disponible.</p>
{/if}

<style>
  .dp-orphan {
    margin: 0;
    font-size: var(--sx-t-xs);
    color: var(--sx-ink-3);
  }
</style>
```

- [ ] **Step 2: Exportarlo desde el índice raíz**

En `src/lib/index.js`, en el bloque `form`, la lista pasa a ser:

```js
export {
  Field, Input, NumberInput, Textarea, Select, Combobox,
  Checkbox, Radio, Switch, DateInput, FileDrop, ChoiceCards, today,
  Calendar, DateRange, DatePicker, parseLocalDate,
  DivisionPicker, divisionOptions
} from './form/index.js';
```

- [ ] **Step 3: Agregar la sección al catálogo**

En `src/catalog/pages/Formularios.svelte`:

(a) el import de la familia pasa a incluirlo:

```js
  import {
    Field, Input, NumberInput, Textarea, Select, Combobox,
    Checkbox, Radio, Switch, DateInput, FileDrop, ChoiceCards, today,
    Calendar, DateRange, DatePicker, DivisionPicker
  } from '../../lib/form/index.js';
```

(b) en `TOC`, después de `{ id: 'combobox', label: 'Combobox' },`:

```js
    { id: 'divisionpicker', label: 'DivisionPicker' },
```

(c) los datos de demostración, junto a las demás constantes del `<script>`:

```js
  // Tres árboles: el que no existe, el que alguien configuró, y el que ya no
  // entra en un select.
  const ARBOL_TRIVIAL = [{ id: 1, name: 'General', path: 'general', active: true }];
  const ARBOL = [
    { id: 1, name: 'General', path: 'general', active: true },
    { id: 2, name: 'Centroamérica', path: 'general/centroamerica', active: true },
    { id: 3, name: 'Costa Rica', path: 'general/centroamerica/cr', active: true },
    { id: 4, name: 'Panamá', path: 'general/centroamerica/pa', active: true },
    { id: 5, name: 'Guanacaste', path: 'general/centroamerica/cr/gte', active: false }
  ];
  const ARBOL_LARGO = Array.from({ length: 16 }, (_, i) => ({
    id: i + 1,
    name: `Sucursal ${String(i + 1).padStart(2, '0')}`,
    path: `general/s${String(i + 1).padStart(2, '0')}`,
    active: true
  }));
  let divFiltro = '';
  let divForm = '';
  let divLargo = '';
```

(d) la sección, inmediatamente después de que cierre `</section>` la de `combobox`:

```svelte
      <!-- ═══ DIVISIONPICKER ═══════════════════════════════════════════════ -->
      <section id="divisionpicker">
        <h2>DivisionPicker</h2>
        <p class="why">
          El nodo del árbol organizacional del tenant. Tres módulos lo resolvían por su cuenta y de
          tres formas distintas; esto es el acuerdo. <b>No busca el árbol</b>: se lo pasás en
          <span class="sx-id">divisions</span>, porque esta librería no tiene capa de datos y el
          catálogo no tiene servidor.
        </p>
        <p class="why">
          <b>Una raíz sola no es una decisión.</b> Con menos de dos nodos no se dibuja nada: un
          tenant que no configuró el árbol no tiene qué elegir, y un desplegable de una sola opción
          es ruido en cada formulario. Sobre una docena de opciones cambia solo a Combobox.
        </p>

        <div class="two">
          <div class="when yes">
            <h3 class="sx-cap">Usalo</h3>
            <ul>
              <li>Como filtro de una lista: pasale <span class="sx-id">allLabel</span> y <span class="sx-id">includeInactive</span> — una sucursal cerrada sigue teniendo historia que mirar.</li>
              <li>Como campo de un formulario: sin <span class="sx-id">allLabel</span>, y sin inactivas, que no aceptan registros nuevos.</li>
            </ul>
          </div>
          <div class="when no">
            <h3 class="sx-cap">No lo usés</h3>
            <ul>
              <li>Para administrar el árbol. Eso vive en el módulo Divisiones; acá sólo se elige un nodo.</li>
              <li>Esperando que cargue solo. El árbol lo trae el core, y el <span class="sx-id">value</span> vacío lo traduce el core a lo que signifique en su backend.</li>
            </ul>
          </div>
        </div>

        <div class="demo grid2">
          <DivisionPicker divisions={ARBOL} bind:value={divFiltro} allLabel="Todas" includeInactive hint="De filtro: la opción que no filtra reemplaza al marcador, y las inactivas entran." />
          <DivisionPicker divisions={ARBOL} bind:value={divForm} hint="De formulario: sin «todas» y sin inactivas." />
          <DivisionPicker divisions={ARBOL_LARGO} bind:value={divLargo} allLabel="Todas" hint="Diecisiete opciones: cambia solo a Combobox." />
          <DivisionPicker divisions={ARBOL_TRIVIAL} value="" hint="Una raíz sola: no se dibuja nada. Este hueco es el comportamiento." />
          <DivisionPicker divisions={[]} value="7" hint="Sin árbol pero con un valor puesto: lo dice en vez de desaparecer." />
          <DivisionPicker divisions={ARBOL} value="" disabled hint="Desactivado." />
        </div>

        <div class="code">
          <pre><code>{C.divisionpicker}</code></pre>
          <button class="copy" on:click={() => copy(C.divisionpicker, 'divisionpicker')}>
            {copied === 'divisionpicker' ? 'Copiado' : failed === 'divisionpicker' ? 'No se pudo — usá Ctrl+C' : 'Copiar'}
          </button>
        </div>
      </section>
```

(e) en el objeto `C` (donde están `C.select` y `C.combobox`), agregar:

```js
    divisionpicker: `<DivisionPicker
  divisions={arbol}
  bind:value={divisionId}
  allLabel="Todas"
  includeInactive
/>

<!-- '' es «nada elegido». Qué significa lo traduce el core: -->
<!--   filtro   → se omite del query -->
<!--   bodega   → Number(v) || ROOT_DIVISION_ID -->
<!--   compra   → Number(v) || undefined -->`,
```

- [ ] **Step 4: Construir y mirarlo**

Run:

```bash
cd /Users/santimain/Documents/Hivestrix/AAClusterOFICIALES/strix-frontend-lib && pnpm build
```

Expected: build sin errores.

Después, `pnpm dev` y abrir `http://localhost:5180/#/formularios`, sección DivisionPicker. Comprobar las seis demos:
1. filtro — arranca en «Todas», lista con Guanacaste marcada `(inactiva)`, sangrada por nivel;
2. formulario — marcador «Elegir…», SIN Guanacaste;
3. largo — es un Combobox, teclear `sucursal 1` filtra y el resaltado cae sobre las letras correctas;
4. raíz sola — **no se dibuja nada**;
5. sin árbol con value `7` — dice «División #7 — el árbol no está disponible»;
6. desactivado — gris, no abre.

- [ ] **Step 5: Commit**

```bash
git add src/lib/form/DivisionPicker.svelte src/lib/index.js src/catalog/pages/Formularios.svelte
git commit -m "feat(form): DivisionPicker, un solo selector de división

Tres módulos resolvían la misma pregunta de tres formas. El acuerdo: value es
string y '' es «nada elegido»; se oculta salvo que haya más de un nodo, porque
una raíz sola no es una decisión; sobre una docena cambia a Combobox. No hace
fetch — el árbol lo trae el core.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Migrar `strix-inventory`

**Files:**
- Delete: `strix-inventory/ui/src/lib/ui/DivisionPicker.svelte`
- Modify: `strix-inventory/ui/src/screens/ItemsScreen.svelte:12,37`
- Modify: `strix-inventory/ui/src/screens/UnitsScreen.svelte:20,35`
- Modify: `strix-inventory/ui/src/screens/MovementsScreen.svelte:26,45`
- Modify: `strix-inventory/ui/src/screens/StockScreen.svelte:24,40`
- Modify: `strix-inventory/ui/src/screens/LocationsScreen.svelte:17,28`
- Modify: `strix-inventory/ui/src/screens/WarehousesScreen.svelte:17,27,80,105`

**Interfaces:**
- Consumes: `DivisionPicker` de la Task 2.
- Produces: nada para tareas posteriores.

- [ ] **Step 1: Rama**

```bash
cd /Users/santimain/Documents/Hivestrix/AAClusterOFICIALES/strix-inventory && git switch -c feat/division-picker-lib
```

- [ ] **Step 2: Cambiar los seis imports**

En cada una de las seis pantallas, la línea `import DivisionPicker from '../lib/ui/DivisionPicker.svelte';` se borra, y `DivisionPicker` se agrega a la lista que ya se importa de `@strix/frontend-lib/form`. Si la pantalla no importa todavía de `/form`, se agrega la línea:

```js
  import { DivisionPicker } from '@strix/frontend-lib/form';
```

- [ ] **Step 3: Cambiar los seis estados a string**

Los seis inicializadores pasan de `0` a `''`:

```js
  let divisionId = $state('');      // ItemsScreen:37, UnitsScreen:35
  let filterDivision = $state('');  // MovementsScreen:45, StockScreen:40, WarehousesScreen:27, LocationsScreen:28
```

NO se tocan las comprobaciones por truthiness (`!!filterDivision` en `StockScreen:114`, `WarehousesScreen:216`, `ItemsScreen:137`): `''` es falsy igual que `0`. Tampoco el armado del query: `lib/api.js:104` ya descarta `''` y `0` por igual.

- [ ] **Step 4: Arreglar los dos bordes del formulario de bodega**

`WarehousesScreen.svelte:80`, dentro de `openEdit`, el campo pasa a string para que el picker lo reconozca:

```js
      divisionId: String(w.divisionId ?? ''),
```

`WarehousesScreen.svelte:105`, dentro de `submit`, vuelve a número al salir:

```js
        divisionId: Number(form.divisionId) || ROOT_DIVISION_ID,
```

`emptyForm()` (`:38`) pasa de `divisionId: ROOT_DIVISION_ID` a:

```js
      divisionId: '',
```

`allLabel="Raíz (general)"` (`:266`) se queda como está: ahora es literalmente correcto — el vacío es la raíz, y `:105` lo traduce.

- [ ] **Step 5: Borrar la copia local**

```bash
cd /Users/santimain/Documents/Hivestrix/AAClusterOFICIALES/strix-inventory && git rm ui/src/lib/ui/DivisionPicker.svelte
```

- [ ] **Step 6: Verificar que no queda ninguna referencia**

Run:

```bash
cd /Users/santimain/Documents/Hivestrix/AAClusterOFICIALES/strix-inventory && grep -rn "lib/ui/DivisionPicker\|\$state(0)" ui/src/screens/ | grep -i division
```

Expected: sin salida.

- [ ] **Step 7: Commit**

```bash
git add ui/src/screens/ItemsScreen.svelte ui/src/screens/UnitsScreen.svelte ui/src/screens/MovementsScreen.svelte ui/src/screens/StockScreen.svelte ui/src/screens/LocationsScreen.svelte ui/src/screens/WarehousesScreen.svelte ui/src/lib/ui/DivisionPicker.svelte
git commit -m "refactor(ui): el DivisionPicker sale de la lib

El value pasa a string: '' es «nada elegido», y como es falsy igual que 0 las
comprobaciones del filtro no cambian. El form de bodega traduce en sus dos
bordes.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Migrar `strix-expenses`

**Files:**
- Delete: `strix-expenses/ui/src/components/DivisionPicker.svelte`
- Modify: `strix-expenses/ui/src/lib/divisions.svelte.js`
- Modify: `strix-expenses/ui/src/views/Purchases.svelte:5,138-143`
- Modify: `strix-expenses/ui/src/views/Counts.svelte:5,93-98,115`
- Modify: `strix-expenses/ui/src/views/NewPurchase.svelte:5,501-504`

**Interfaces:**
- Consumes: `DivisionPicker` de la Task 2.
- Produces: nada para tareas posteriores.

- [ ] **Step 1: Rama**

```bash
cd /Users/santimain/Documents/Hivestrix/AAClusterOFICIALES/strix-expenses && git switch -c feat/division-picker-lib
```

- [ ] **Step 2: Adelgazar el store**

En `ui/src/lib/divisions.svelte.js` se borran `get available()`, `options()` y la función `depthOf` — el picker es dueño ahora de la regla de «más de un nodo» y el helper de la lib del etiquetado. Quedan `nodes`, `loaded`, `load()` y `nameOf()`. La clase completa queda:

```js
class Divisions {
	nodes = $state([]);
	loaded = $state(false);
	#loading = null;

	/** Trae el árbol la primera vez que alguien lo necesita. */
	load() {
		if (this.loaded || this.#loading) return this.#loading;
		this.#loading = divisionsTree().then((tree) => {
			this.nodes = tree?.divisions ?? [];
			this.loaded = true;
			this.#loading = null;
		});
		return this.#loading;
	}

	/** El nombre de una división, para mostrarla sin volver a pedir el árbol. */
	nameOf(id) {
		const found = this.nodes.find((n) => String(n.id) === String(id));
		return found?.name ?? '';
	}
}
```

- [ ] **Step 3: `Purchases.svelte`**

El import de la línea 5 pasa a:

```js
	import { DivisionPicker } from '@strix/frontend-lib/form';
	import { divisions } from '../lib/divisions.svelte.js';
```

En el `<script>`, el árbol ahora lo pide la vista, porque el picker ya no se autocarga:

```js
	$effect(() => {
		divisions.load();
	});
```

Y el uso (línea 138) pasa a:

```svelte
			<DivisionPicker
				divisions={divisions.nodes}
				value={division}
				allLabel="Todas"
				includeInactive
				on:change={(e) => route.setParam('division', e.detail)}
			/>
```

- [ ] **Step 4: `Counts.svelte`**

La línea 5 pasa a `import { DivisionPicker } from '@strix/frontend-lib/form';` (la 6, la del store, ya existe y se queda). Se agrega en el `<script>`:

```js
	$effect(() => {
		divisions.load();
	});
```

El uso de la línea 93:

```svelte
		<DivisionPicker
			divisions={divisions.nodes}
			value={division}
			allLabel="Todas"
			includeInactive
			on:change={(e) => route.setParam('division', e.detail)}
		/>
```

Y el de la línea 115:

```svelte
		<DivisionPicker divisions={divisions.nodes} bind:value={divisionId} hint="Dónde se está contando." />
```

- [ ] **Step 5: `NewPurchase.svelte`**

La línea 5 pasa a:

```js
	import { DivisionPicker } from '@strix/frontend-lib/form';
	import { divisions } from '../lib/divisions.svelte.js';
```

Se agrega en el `<script>`:

```js
	$effect(() => {
		divisions.load();
	});
```

El uso (línea 501):

```svelte
			<DivisionPicker
				divisions={divisions.nodes}
				bind:value={divisionId}
				hint="Dónde se registra el gasto. Sin elegir, queda sin clasificar."
			/>
```

`NewPurchase.svelte:347` (`Number(divisionId) || undefined`) NO se toca: ya traduce el vacío.

- [ ] **Step 6: Borrar la copia local**

```bash
cd /Users/santimain/Documents/Hivestrix/AAClusterOFICIALES/strix-expenses && git rm ui/src/components/DivisionPicker.svelte
```

- [ ] **Step 7: Verificar que no queda ninguna referencia**

Run:

```bash
cd /Users/santimain/Documents/Hivestrix/AAClusterOFICIALES/strix-expenses && grep -rn "components/DivisionPicker\|divisions.options(\|divisions.available" ui/src/
```

Expected: sin salida.

- [ ] **Step 8: Commit**

```bash
git add ui/src/lib/divisions.svelte.js ui/src/views/Purchases.svelte ui/src/views/Counts.svelte ui/src/views/NewPurchase.svelte ui/src/components/DivisionPicker.svelte
git commit -m "refactor(ui): el DivisionPicker sale de la lib

El store pierde options() y available(): el etiquetado lo hace el helper de la
lib y la regla de «más de un nodo» es del componente. Como el picker ya no se
autocarga, cada vista pide el árbol.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Migrar `strix-clients`

**Files:**
- Modify: `strix-clients/ui/src/screens/ClientsList.svelte:21,192,218-226,261,480-485`
- Modify: `strix-clients/ui/src/screens/ClientDetail.svelte:103,163,171-179,230`
- Modify: `strix-clients/ui/src/screens/tabs/GeneralTab.svelte:41-46`

**Interfaces:**
- Consumes: `DivisionPicker` de la Task 2.
- Produces: nada para tareas posteriores.

NOTA: acá no hay componente que borrar. Lo que se borra es el armado de opciones duplicado y los dos `<Select>` inline. `ui/src/lib/divisions.js` (el cargador del árbol) se queda.

- [ ] **Step 1: Rama**

```bash
cd /Users/santimain/Documents/Hivestrix/AAClusterOFICIALES/strix-clients && git switch -c feat/division-picker-lib
```

- [ ] **Step 2: `ClientsList.svelte`**

`DivisionPicker` se agrega al import de `/form` de la línea 21:

```js
  import { Field, Input, Textarea, NumberInput, Select, DivisionPicker } from '@strix/frontend-lib/form';
```

El bloque de las líneas 218-226 —el `divisionOptions` con su `$effect`— se reemplaza por los nodos crudos:

```js
  // El árbol organizacional del tenant. Vacío = el módulo Divisiones no está
  // activo acá; el cliente se crea igual, bajo la raíz. El picker se esconde
  // solo cuando no hay nada que elegir.
  let divisionNodes = $state([]);
  $effect(() => {
    fetchDivisionTree(api.base).then((nodes) => {
      divisionNodes = nodes;
    });
  });
```

En `emptyForm()` (línea 192), `divisionId: ROOT_DIVISION_ID` pasa a:

```js
      divisionId: '',
```

El `<Select>` de la línea 480 pasa a:

```svelte
          <DivisionPicker
            divisions={divisionNodes}
            bind:value={newForm.divisionId}
            hint="Unidad organizativa a la que pertenece el expediente"
          />
```

`ClientsList.svelte:261` arma el payload con el formulario entero, así que la traducción va ahí:

```js
    const payload = sanitizeObject({
      ...newForm,
      divisionId: Number(newForm.divisionId) || ROOT_DIVISION_ID
    });
```

- [ ] **Step 3: `ClientDetail.svelte`**

Igual que arriba: el bloque 171-179 se reemplaza por

```js
  // El árbol organizacional del tenant. Vacío = el módulo Divisiones no está
  // activo acá; el expediente se guarda igual, bajo la raíz.
  let divisionNodes = $state([]);
  $effect(() => {
    fetchDivisionTree(api.base).then((nodes) => {
      divisionNodes = nodes;
    });
  });
```

En `emptyForm()` (línea 103), `divisionId: ROOT_DIVISION_ID` pasa a `divisionId: ''`.

La línea 163 —que existía porque protojson serializa int64 como string y el `<select>` nunca casaba— ahora tiene que producir un string, que es justo lo que el picker espera:

```js
    // protojson serializa int64 como string y el picker trabaja en strings:
    // normalizamos a string para que el campo case con su opción.
    next.divisionId = String(data.divisionId ?? '');
```

`divisionNodes` se pasa a `GeneralTab` donde hoy se pasa `divisionOptions` (renombrar el atributo en el marcado de `GeneralTab`).

En `buildClientPayload()`, la línea 230 traduce al salir:

```js
      divisionId: Number(form.divisionId) || ROOT_DIVISION_ID,
```

- [ ] **Step 4: `GeneralTab.svelte`**

La prop `divisionOptions` pasa a llamarse `divisionNodes` en el `$props()` del componente, y el `<Select>` de la línea 41 pasa a:

```svelte
        <DivisionPicker
          divisions={divisionNodes}
          bind:value={form.divisionId}
          hint="Unidad organizativa a la que pertenece el expediente"
        />
```

con `DivisionPicker` agregado al import de `@strix/frontend-lib/form` del archivo.

- [ ] **Step 5: Verificar que no queda ninguna referencia**

Run:

```bash
cd /Users/santimain/Documents/Hivestrix/AAClusterOFICIALES/strix-clients && grep -rn "divisionOptions" ui/src/
```

Expected: sin salida.

- [ ] **Step 6: Commit**

```bash
git add ui/src/screens/ClientsList.svelte ui/src/screens/ClientDetail.svelte ui/src/screens/tabs/GeneralTab.svelte
git commit -m "refactor(ui): el DivisionPicker sale de la lib

Se va el armado de opciones duplicado en dos pantallas y los dos Select
inline. Los formularios ganan el esconderse-si-no-hay-nada-que-elegir que
nunca tuvieron; el '' se traduce a la raíz al guardar.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Dejar la entrega montada

**Files:**
- Modify: `strix-inventory/ui/package.json`
- Modify: `strix-expenses/ui/package.json`
- Modify: `strix-clients/ui/package.json`

**Interfaces:**
- Consumes: las ramas de las Tasks 2–5.
- Produces: tres ramas de consumidor esperando un tag que todavía no existe.

- [ ] **Step 1: Subir el pin en los tres**

En cada uno de los tres `ui/package.json`, la dependencia pasa de

```json
    "@strix/frontend-lib": "github:HiveStrix/strix-frontend-lib#v0.9.0",
```

a

```json
    "@strix/frontend-lib": "github:HiveStrix/strix-frontend-lib#v0.10.0",
```

Las otras cuatro UIs del clúster NO se tocan: la entrega es aditiva y sus pines son independientes.

- [ ] **Step 2: Commit en cada repo**

```bash
git add ui/package.json
git commit -m "chore(deps): frontend-lib v0.10.0 por el DivisionPicker

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [ ] **Step 3: PARAR y entregar los comandos**

El build de los consumidores **no puede correr todavía**: `v0.10.0` no existe. Ese es el estado correcto en el que termina esta entrega.

Lo que queda es del usuario, acción por acción:

```bash
# 1 · en strix-frontend-lib, una vez revisada la rama
git switch main && git merge --no-ff feat/division-picker
git tag -a v0.10.0 -m "DivisionPicker" && git push origin main --tags

# 2 · recién entonces, en cada consumidor, DESDE /private/tmp (iCloud cuelga vite)
npm ci && npm run build
```

**Advertencia que va con el tag:** `feat/division-picker` sale de `cb777fc`, así que un `v0.10.0` cortado de ahí **también lleva el `ImportPreview` de la otra sesión**.

---

## Self-Review

**Cobertura del spec:** §4 el componente → Task 2. §4.1 los tres comportamientos → Task 2 Step 1 + verificados en Step 4. §4.2 sin `ROOT_DIVISION_ID` → Task 2 (`orphan` no compara contra la raíz). §5 el helper → Task 1. §6 las cuatro traducciones → Tasks 3 (dos), 4 (ya existía), 5 (dos). §7 los tres consumidores → Tasks 3, 4, 5. §8 la entrega → Task 6. §9 verificación → Task 1 Step 2, Task 2 Step 4, Task 6 Step 3.

**Sin placeholders:** cada paso lleva el código real. Los tres bloques de `import` repiten la lista completa en vez de decir «igual que la Task N».

**Consistencia de tipos:** `divisionOptions(nodes, { includeInactive, allLabel, indent })` se define en la Task 1 y se usa con esa firma exacta en la Task 2. `value` es `string` en las Tasks 2–5. El evento es `on:change` con `event.detail` = string en las Tasks 2 y 4 (`e.detail`, no `e.detail.value`).

**Los dos sitios de payload de clients quedaron fijados** (`ClientsList.svelte:261`, `ClientDetail.svelte:230`): ningún paso del plan exige buscar a mano dónde traducir el `''`.
