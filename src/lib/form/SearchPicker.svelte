<script context="module">
  let seq = 0;
</script>

<script>
  // SEARCHPICKER — buscar un registro relacionado cuando una línea no alcanza.
  //
  // Combobox resuelve «elegí uno de una lista» dentro del formulario: una fila
  // por opción, un nombre y una pista. Hay búsquedas que no entran ahí: agregar
  // un artículo a una línea de factura pide COMPARAR —código, nombre, tipo,
  // precio, existencia— antes de elegir, y eso es una tabla, no una lista. Este
  // componente es esa tabla en un diálogo, con la búsqueda arriba:
  //
  //   {#if buscando}
  //     <SearchPicker
  //       title="Agregar artículo"
  //       columns={[
  //         { key: 'codigo', label: 'Código', mono: true },
  //         { key: 'nombre', label: 'Nombre' },
  //         { key: 'tipo', label: 'Tipo' },
  //         { key: 'precio', label: 'Precio', align: 'right', value: (r) => fmt(r.precio) },
  //         { key: 'stock', label: 'Stock', align: 'right' }
  //       ]}
  //       loader={(q) => api.articulos({ q, limit: 50 })}
  //       createLabel="Crear artículo"
  //       on:pick={(e) => agregarLinea(e.detail)}
  //       on:create={(e) => crearArticulo(e.detail.query)}
  //       on:close={() => (buscando = false)} />
  //   {/if}
  //
  // SE MONTA, NO SE PRENDE — igual que Dialog, sobre el que está construido:
  // `{#if abierto}<SearchPicker …/>{/if}`. El foco vuelve solo a lo que lo
  // abrió (el 🔍 de la línea) porque eso lo hace Dialog al desmontarse.
  //
  // EL TECLADO NUNCA SALE DE LA BÚSQUEDA. El foco queda en el campo y las
  // flechas mueven la fila marcada (`aria-activedescendant` sobre una grilla,
  // el patrón combobox → grid); Enter elige la marcada —la primera, apenas
  // llegan resultados, así «escribir y Enter» agrega el primero—; Escape cierra
  // (lo hace Dialog). ENTER NUNCA ELIGE DE UNA LISTA VIEJA: si lo escrito
  // todavía no tiene su respuesta —el debounce no venció, o la pregunta está
  // en vuelo—, Enter adelanta la pregunta y elige la primera fila cuando ESA
  // respuesta llega (si no trae ninguna, no elige nada). Es el caso del lector
  // de códigos de barras: teclea el código entero y Enter en unos pocos
  // milisegundos, y antes se agregaba la primera fila de la búsqueda anterior.
  // El botón «Agregar» de cada fila es para el puntero y no
  // es una parada de Tab: cincuenta paradas entre la búsqueda y «Cerrar» no son
  // una forma de moverse.
  //
  // ENTRA EN EL DIÁLOGO. Las cifras, los códigos y el botón se quedan con su
  // ancho y el texto parte en renglones; cuando la caja se angosta se van
  // primero las columnas `optional` y al final el botón de la fila. Si ni así
  // entra —cinco columnas en un teléfono y ninguna marcada `optional`— la tabla
  // se desliza de costado dentro de su caja: marcá `optional` lo que ayuda
  // pero no decide (el tipo, la existencia) y no llega a eso.
  //
  // LA BÚSQUEDA ES DEL SERVIDOR. `loader: async (query) => filas[]` se llama con
  // '' al abrir (así hay filas de referencia apenas aparece) y con lo tecleado
  // tras `debounce` ms. Una respuesta vieja que llega tarde se descarta.
  //
  // CREAR IN SITU. Con `createLabel`, el pie ofrece «+ Crear «lo tecleado»» y
  // despacha `create` con `{ query }`. El padre crea el registro; esta
  // librería no tiene capa de datos.
  //
  // En un teléfono o una tablet es una hoja que sube desde abajo: eso lo pone
  // Dialog.
  import { createEventDispatcher, onMount, onDestroy, tick } from 'svelte';
  import Dialog from '../feedback/Dialog.svelte';
  import Button from '../action/Button.svelte';
  import Field from './Field.svelte';

  /** El nombre del diálogo. */
  export let title = 'Buscar';
  /** La bajada del diálogo: para qué línea, para qué documento. */
  export let note = '';
  export let placeholder = 'Buscar por código, nombre, SKU o descripción…';
  /** Nombre accesible del campo de búsqueda (no se dibuja). */
  export let searchLabel = 'Buscar';
  /**
   * Las columnas, como en Table: `{ key, label, align?, mono?, value?, optional? }`.
   * `align: 'right'` para cifras (tabulares); `mono` para códigos;
   * `value: (fila) => texto` para formatear (montos, fechas) una vez, acá;
   * `optional` la esconde cuando la tabla se angosta (una ventana chica, la
   * hoja del teléfono): son las primeras en irse, antes que el botón de la
   * fila. Las columnas de texto (ni `mono` ni `align: 'right'`) parten en
   * hasta dos renglones; las cifras y los códigos no se parten nunca.
   */
  export let columns = [];
  /** `async (query) => filas[]`. Se llama con '' al abrir. */
  export let loader = null;
  /** Milisegundos entre la última tecla y la pregunta al `loader`. */
  export let debounce = 200;
  /** Identidad estable de cada fila. */
  export let rowKey = (row, i) => row?.id ?? i;
  /** El botón de cada fila. */
  export let actionLabel = 'Agregar';
  /**
   * Presente ⇒ el pie ofrece crear lo tecleado. Un texto («Crear artículo»,
   * que se lee «Crear artículo «tuerca»») o `(q) => texto`.
   */
  export let createLabel = null;
  /** Lo que las filas SON, para el conteo: «12 artículos», nunca «12 filas». */
  export let noun = 'resultado';
  export let nounPlural = 'resultados';
  /** 'm' | 'f' — el género de `noun`: «Ningún artículo», «Ninguna cuenta». */
  export let gender = 'm';
  /** false ⇒ elegir no cierra: para agregar varias líneas seguidas. */
  export let closeOnPick = true;
  export let hintText = 'Click en una fila para seleccionar. ESC para cerrar.';
  export let hintTextTouch = 'Tocá una fila para seleccionarla.';
  export let closeLabel = 'Cerrar';
  export let loadingLabel = 'Buscando…';
  export let errorLabel = 'No se pudo buscar.';

  const dispatch = createEventDispatcher();
  const n = ++seq;
  const gridId = `sxsp${n}-grid`;

  let inputEl;
  let scroller;
  let query = '';
  let rows = [];
  let active = -1;
  let fetching = false;
  let failed = false;
  let reqSeq = 0;
  let timer = null;
  // `rowsFor`: la búsqueda que contestan las filas de ahora. `pendingFor`: la
  // que espera el debounce o está en vuelo. `pickWhen`: Enter llegó antes que
  // la respuesta; se elige cuando vuelva la de esa búsqueda.
  let rowsFor = null;
  let pendingFor = null;
  let pickWhen = null;
  let added = null;
  let addedTimer;

  const coarse =
    typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;

  function load(qs, now = false) {
    if (!loader) return;
    clearTimeout(timer);
    timer = null;
    pendingFor = qs;
    const run = () => {
      timer = null;
      const my = ++reqSeq;
      fetching = true;
      failed = false;
      Promise.resolve()
        .then(() => loader(qs))
        .then(
          (res) => {
            if (my !== reqSeq) return;
            rows = Array.isArray(res) ? res : [];
            rowsFor = qs;
            pendingFor = null;
            fetching = false;
            // La primera fila queda marcada: «escribir y Enter» agrega la que
            // encabeza la lista, que es casi siempre la que se buscaba.
            active = rows.length ? 0 : -1;
            if (scroller) scroller.scrollTop = 0;
            // Enter llegó antes que esta respuesta: ahora sí, la primera.
            if (pickWhen !== null && pickWhen === qs) {
              pickWhen = null;
              if (rows.length) pick(rows[0]);
            }
          },
          () => {
            if (my !== reqSeq) return;
            pendingFor = null;
            pickWhen = null;
            fetching = false;
            failed = true;
          }
        );
    };
    if (now || !(debounce > 0)) run();
    else timer = setTimeout(run, debounce);
  }

  onMount(() => load('', true));
  onDestroy(() => {
    clearTimeout(timer);
    clearTimeout(addedTimer);
    reqSeq++;
  });

  function onInput(e) {
    query = e.currentTarget.value;
    // Seguir escribiendo después de Enter es cambiar de idea: ese Enter ya no
    // elige nada.
    pickWhen = null;
    load(query);
  }

  function onEnter() {
    const typed = inputEl ? inputEl.value : query;
    if (loader && (pendingFor !== null || rowsFor !== typed)) {
      // Las filas de ahora no son las de lo escrito. Adelantar la pregunta (si
      // todavía esperaba el debounce, o si nunca se hizo) y elegir al volver.
      pickWhen = typed;
      if (timer !== null || pendingFor !== typed) load(typed, true);
      return;
    }
    if (active >= 0 && rows[active]) pick(rows[active]);
  }

  async function move(to) {
    if (!rows.length) return;
    active = Math.max(0, Math.min(rows.length - 1, to));
    await tick();
    scroller?.querySelector('[data-on="1"]')?.scrollIntoView({ block: 'nearest' });
  }

  function onKey(e) {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); move(active + 1); break;
      case 'ArrowUp': e.preventDefault(); move(active - 1); break;
      case 'PageDown': e.preventDefault(); move(active + 10); break;
      case 'PageUp': e.preventDefault(); move(active - 10); break;
      case 'Enter':
        e.preventDefault();
        onEnter();
        break;
      // Escape no se toca acá: sube hasta Dialog, que cierra y avisa `close`.
    }
  }

  function pick(row) {
    // Un Enter que esperaba su búsqueda queda anulado por cualquier elección
    // explícita: sin esto, con `closeOnPick={false}` un clic en «Agregar»
    // mientras la búsqueda sigue en vuelo sumaba además la primera fila.
    pickWhen = null;
    dispatch('pick', row);
    if (closeOnPick) {
      dispatch('close');
      return;
    }
    // Queda abierto para la siguiente: la fila dice que entró, y el foco vuelve
    // a la búsqueda para escribir la próxima.
    added = row;
    clearTimeout(addedTimer);
    addedTimer = setTimeout(() => (added = null), 1400);
    inputEl?.focus();
  }

  function create() {
    pickWhen = null;
    const text = query.trim();
    if (!text) return;
    dispatch('create', { query: text });
  }

  const cell = (row, col) => (typeof col.value === 'function' ? col.value(row) : row?.[col.key]);
  // Cifras y códigos se miden por su contenido y no se parten; el texto se
  // queda con el ancho que sobra y parte en renglones. Ver `.fit` en el estilo.
  const fits = (col) => !!col.mono || col.align === 'right';

  $: q = query.trim();
  $: createText = !createLabel || !q
    ? ''
    : typeof createLabel === 'function'
      ? createLabel(q)
      : `${createLabel} «${q}»`;
  $: activeId = active >= 0 && active < rows.length ? `${gridId}-r${active}` : undefined;
  $: status = fetching
    ? loadingLabel
    : failed
      ? errorLabel
      : rows.length === 0
        ? q
          ? `${gender === 'f' ? 'Ninguna' : 'Ningún'} ${noun} coincide con «${q}».`
          : `No hay ${nounPlural} para mostrar.`
        : `${rows.length} ${rows.length === 1 ? noun : nounPlural}`;
</script>

<Dialog {title} {note} size="lg" {closeLabel} on:close={() => dispatch('close')}>
  <div class="sp">
    <Field label={searchLabel} labelHidden let:id let:describedBy>
      <span class="lens" aria-hidden="true">
        <svg viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" stroke-width="1.7" /><path d="M10.6 10.6 14 14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" /></svg>
      </span>
      <input
        bind:this={inputEl}
        {id}
        type="text"
        value={query}
        {placeholder}
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        enterkeyhint="search"
        data-sx-autofocus
        role="combobox"
        aria-expanded="true"
        aria-haspopup="grid"
        aria-controls={gridId}
        aria-activedescendant={activeId}
        aria-describedby={describedBy}
        aria-busy={fetching || undefined}
        on:input={onInput}
        on:keydown={onKey}
      />
      {#if fetching}
        <svg class="spin" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="2" opacity=".25" />
          <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      {/if}
    </Field>

    <div class="status" class:bad={failed && !fetching}>
      <span role="status" aria-live="polite">{status}</span>
      {#if failed && !fetching}
        <button type="button" class="retry" on:click={() => { load(query, true); inputEl?.focus(); }}>Reintentar</button>
      {/if}
    </div>

    <div class="box" class:dim={fetching && rows.length > 0}>
      <div class="scroll" bind:this={scroller}>
        <!-- Pointer down is swallowed on the rows so the focus stays in the
             search box: a click picks, and the keyboard keeps working after. -->
        <table id={gridId} role="grid" aria-label={title}>
          <thead>
            <tr>
              {#each columns as col (col.key)}
                <th scope="col" class:right={col.align === 'right'} class:fit={fits(col)} class:opt={col.optional}>{col.label}</th>
              {/each}
              <th scope="col" class="act"><span class="sr">Acción</span></th>
            </tr>
          </thead>
          <tbody>
            {#each rows as row, i (rowKey(row, i))}
              <!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
              <tr
                id={`${gridId}-r${i}`}
                aria-selected={i === active}
                data-on={i === active ? '1' : '0'}
                class:on={i === active}
                on:mousedown|preventDefault
                on:mousemove={() => (active = i)}
                on:click={() => pick(row)}
              >
                {#each columns as col (col.key)}
                  <td role="gridcell" class:right={col.align === 'right'} class:mono={col.mono} class:fit={fits(col)} class:opt={col.optional}
                  >{#if fits(col)}{cell(row, col) ?? '—'}{:else}<span class="clip">{cell(row, col) ?? '—'}</span>{/if}</td>
                {/each}
                <td role="gridcell" class="act">
                  <button
                    type="button"
                    class="add"
                    class:done={added === row}
                    tabindex="-1"
                    on:click|stopPropagation={() => pick(row)}
                  >
                    {#if added === row}
                      <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1.5 6.5 4.5 9.5 10.5 2.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                      Agregado
                    {:else}
                      <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1.5v9M1.5 6h9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
                      {actionLabel}
                    {/if}
                  </button>
                </td>
              </tr>
            {:else}
              <tr class="empty">
                <td colspan={columns.length + 1}>
                  {fetching ? loadingLabel : status}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <svelte:fragment slot="foot">
    <p class="hint">{coarse ? hintTextTouch : hintText}</p>
    {#if createText}
      <Button variant="outline" on:click={create}>
        <svg slot="icon" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1.5v9M1.5 6h9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
        {createText}
      </Button>
    {/if}
    <Button variant="ghost" on:click={() => dispatch('close')}>{closeLabel}</Button>
  </svelte:fragment>
</Dialog>

<style>
  .sp { display: flex; flex-direction: column; gap: var(--sx-s-3); min-width: 0; }

  .lens { display: inline-flex; align-items: center; flex: none; color: var(--sx-ink-3); }
  .lens svg { width: 16px; height: 16px; }
  .spin { flex: none; align-self: center; width: 14px; height: 14px; color: var(--sx-ink-3); animation: sx-sp-spin 900ms linear infinite; }
  @keyframes sx-sp-spin { to { transform: rotate(360deg); } }

  .status {
    display: flex; align-items: baseline; gap: var(--sx-s-2); min-height: 1.5em;
    font-size: var(--sx-t-2xs); font-weight: var(--sx-w-semi);
    letter-spacing: .07em; text-transform: uppercase; color: var(--sx-ink-3);
    font-variant-numeric: tabular-nums lining-nums;
  }
  .status.bad { color: var(--sx-critical); text-transform: none; letter-spacing: 0; font-size: var(--sx-t-sm); font-weight: var(--sx-w-normal); }
  .retry {
    background: none; border: 0; padding: 0; margin: 0; cursor: pointer;
    font: inherit; font-weight: var(--sx-w-semi); color: var(--sx-ink);
    text-decoration: underline; text-underline-offset: 3px;
  }

  /* La tabla, con el mismo cuerpo que Table: levantada, radio 28 → r-3, la
     cabecera pegada arriba y las filas separadas por la raya de ambiente. */
  .box {
    /* El contenedor contra el que la tabla decide qué columnas entran (ver el
       final del estilo): el ancho que importa es el de la caja dentro del
       diálogo, no el de la ventana — un diálogo `lg` en una pantalla ancha y
       la hoja de un teléfono se angostan por razones distintas. */
    container: sxsp / inline-size;
    border-radius: var(--sx-r-3);
    background: var(--sx-surface);
    box-shadow: var(--sx-e-card, var(--sx-e-1));
    overflow: hidden;
    min-width: 0;
    transition: opacity 160ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1));
  }
  /* Mientras llega una respuesta nueva las filas viejas se quedan —no
     parpadea a vacío en cada tecla— pero se apagan un poco: no son todavía
     las de lo que está escrito. */
  .box.dim { opacity: .6; }
  .scroll { max-height: min(52vh, 440px); overflow: auto; overscroll-behavior: contain; }

  table { width: 100%; border-collapse: separate; border-spacing: 0; }
  thead th {
    position: sticky; top: 0; z-index: 1;
    background: var(--sx-thead);
    text-align: left; white-space: nowrap;
    padding: var(--sx-s-3) var(--sx-s-4);
    font-size: var(--sx-t-2xs); font-weight: var(--sx-w-semi);
    letter-spacing: .07em; text-transform: uppercase; color: var(--sx-ink-3);
    box-shadow: 0 1px 0 var(--sx-line);
  }
  th.right, td.right { text-align: right; }
  /* LA TABLA ENTRA EN LA CAJA, SIEMPRE. `width: 1%` en una tabla automática
     es «lo justo para el contenido»: los códigos, las cifras y el botón se
     quedan con su ancho natural sin partir, y todo lo que sobra se reparte
     entre las columnas de texto, que son las únicas que pueden ceder. Antes
     todas las celdas iban en un solo renglón y el ancho de la tabla era la
     suma de sus textos más largos: con un «Tipo» o una existencia con unidad
     un poco largos pasaba el ancho del diálogo y la última columna quedaba
     cortada en el borde derecho. */
  th.fit, td.fit, th.act, td.act { width: 1%; white-space: nowrap; }
  th.act, td.act { text-align: right; }

  tbody td {
    padding: var(--sx-s-2) var(--sx-s-4);
    height: var(--sx-s-12);
    font-size: var(--sx-t-sm); color: var(--sx-ink-2);
    line-height: 1.35;
    box-shadow: inset 0 -1px 0 var(--sx-line);
    transition: background-color 160ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1));
  }
  tbody tr:last-child td { box-shadow: none; }
  /* Hasta dos renglones y los puntos suspensivos: el nombre entero de un
     artículo es para leerlo, pero una fila de cinco renglones rompe la
     lectura de la columna. `break-word` y no `anywhere`: parte una palabra
     sólo si no entra sola, sin achicar el mínimo de la columna a una letra. */
  .clip {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    overflow-wrap: break-word;
  }
  td.right {
    font-family: var(--sx-num-font, inherit);
    font-variant-numeric: tabular-nums lining-nums slashed-zero;
    font-weight: var(--sx-w-medium); color: var(--sx-ink);
  }
  td.mono {
    font-family: var(--sx-font-mono);
    font-variant-numeric: tabular-nums lining-nums slashed-zero;
    font-size: var(--sx-t-xs); color: var(--sx-ink); letter-spacing: -.01em;
  }
  tbody tr:not(.empty) { cursor: pointer; }
  /* Una sola marca, la del teclado, y el puntero alimenta la misma. */
  tbody tr.on td { background: var(--sx-accent-soft); color: var(--sx-ink); }

  tr.empty td {
    height: auto; padding: var(--sx-s-6) var(--sx-s-4);
    text-align: center; white-space: normal; color: var(--sx-ink-2);
  }

  .add {
    display: inline-flex; align-items: center; gap: var(--sx-s-1);
    padding: var(--sx-s-1) var(--sx-s-3);
    border: 0; border-radius: var(--sx-r-pill);
    background: var(--sx-accent-soft); color: var(--sx-ink);
    font: inherit; font-size: var(--sx-t-xs); font-weight: var(--sx-w-semi);
    cursor: pointer; white-space: nowrap;
    box-shadow: var(--sx-e-chip, none);
    transition: background var(--sx-fast) var(--sx-ease), color var(--sx-fast) var(--sx-ease),
                scale 380ms var(--sx-ease-spring, cubic-bezier(.34, 1.56, .64, 1));
  }
  .add svg { width: 11px; height: 11px; color: var(--sx-accent); }
  tr.on .add { background: var(--sx-accent-pick); }
  .add:active { scale: .92; }
  .add.done { background: var(--sx-positive-band); color: var(--sx-positive); }
  .add.done svg { color: currentColor; }

  .hint { margin: 0 auto 0 0; align-self: center; font-size: var(--sx-t-xs); color: var(--sx-ink-3); }

  .sr {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  @media (pointer: coarse) {
    tbody td { height: var(--sx-touch); }
    .add { min-height: var(--sx-touch); }
  }
  /* CUANDO LA CAJA SE ANGOSTA, POR ESCALONES y medidos sobre la caja (el
     `container` de `.box`), no sobre la ventana:
       · primero se aprieta el aire entre columnas;
       · después se van las `optional` — el dato que ayuda pero no decide;
       · por último la columna del botón: en la hoja del teléfono la fila
         ENTERA es el botón, y el pie lo dice («Tocá una fila…»). Con el
         puntero también: el clic en la fila elige igual que «Agregar». */
  @container sxsp (max-width: 44rem) {
    thead th, tbody td { padding-inline: var(--sx-s-3); }
  }
  @container sxsp (max-width: 36rem) {
    th.opt, td.opt { display: none; }
  }
  @container sxsp (max-width: 28rem) {
    thead th, tbody td { padding-inline: var(--sx-s-2); }
    thead th:first-child, tbody td:first-child { padding-left: var(--sx-s-3); }
    thead th:nth-last-child(2), tbody td:nth-last-child(2) { padding-right: var(--sx-s-3); }
    th.act, td.act { display: none; }
  }
  @media (max-width: 560px) {
    .hint { flex-basis: 100%; }
  }

  @media (prefers-reduced-motion: reduce) {
    .spin { animation: none; }
    .box, tbody td, .add { transition: none; }
    .add:active { scale: none; }
  }
</style>
