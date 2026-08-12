<script>
  // THE TABLE.
  //
  // A table is the only component in the system whose job is COMPARISON. Not
  // "showing records" — comparison. Everything below follows from that one
  // sentence, and anything that does not serve it was left out:
  //
  //   • Figures sit in a column so the eye can run down them, right-aligned and
  //     tabular, because ₡1.480.000 above ₡98.500 only means something when the
  //     digits line up. That is rule three of the system and it is not optional.
  //   • The head stays put. A person reading row 40 of a ledger has forgotten
  //     what column four was; if they have to scroll up to find out, the table
  //     stopped being a comparison and became forty little records.
  //   • The table owns its own scroll instead of growing the page, so the
  //     controls above it do not end up a screen and a half from the row being
  //     read. Sideways the scroll is made VISIBLE — a shadow appears on an edge
  //     only while there is still something past it — because a column that is
  //     silently off screen is a column nobody knows to look for.
  //   • Under ~620px of CONTAINER width there is no comparison left to make: six
  //     columns in 390px is six columns of two-character fragments. So each row
  //     becomes a card, label beside value, and the table stops pretending.
  //
  // WIDTH IS MEASURED, NOT ASSUMED. A Strix module usually renders beside the
  // Shell's 240px sidebar, so the window is never the number that matters. The
  // component observes its own box and switches on that.
  //
  // THE ROW IS A LINK, AND THE ACTIONS DO NOT STEAL ITS CLICK.
  // The primary cell holds a real <a> (or a real <button>) whose ::after is
  // stretched over the whole <tr>. That gives a full-row hit area with real link
  // semantics — middle-click, ⌘-click, "copy link address", a sane tab order and
  // an accessible name that is the row's own identifier. The lead cells and the
  // actions cell are raised above it, so a button inside them is a button and
  // never a second way to open the row. No click handler on the <tr>, so there
  // is no propagation to stop and nothing to get wrong later.
  //
  //   <Table
  //     caption="Servicios"
  //     {columns} rows={visible} total={all.length} query={q}
  //     href={(o) => `/servicios/${o.id}`}
  //     bind:sort bind:selected selectable expandable
  //     loading={busy} error={err}
  //     on:retry={load} on:clear={reset}>
  //     <svelte:fragment slot="cell" let:row let:col let:value>
  //       {#if col.key === 'estado'}<Pill tone={row.tone}>{row.word}</Pill>
  //       {:else}{value}{/if}
  //     </svelte:fragment>
  //     <svelte:fragment slot="actions" let:row>
  //       <button on:click={() => print(row)}>Imprimir</button>
  //     </svelte:fragment>
  //     <svelte:fragment slot="expand" let:row>…</svelte:fragment>
  //   </Table>
  //
  // WHEN NOT TO USE A TABLE
  //   • Fewer than three columns. Two columns is a definition list, and a table
  //     around it is scaffolding nobody asked for.
  //   • The fields are of unequal weight — a title, a long note, one figure.
  //     Columns force them to be peers and they are not: use <DataList>.
  //   • The person edits cells and moves around with the arrow keys. That is a
  //     grid (role="grid", roving tabindex, cell focus) and it is a different,
  //     heavier component. This one is deliberately a document, not an app.
  //   • Thousands of rows on a cheap tablet. This renders what you give it;
  //     page or window it upstream first.

  import { createEventDispatcher, onMount } from 'svelte';
  import DataState from './DataState.svelte';
  import DataSkeleton from './DataSkeleton.svelte';

  const dispatch = createEventDispatcher();

  /**
   * The columns, in order. Everything except `key` and `label` is optional:
   *
   *   key        unique; also the default accessor, so `row[key]`
   *   label      the header word. Sentence case, a noun.
   *   value      (row) => what is printed. Format money and dates HERE, once.
   *   sortValue  (row) => what is compared, when that is not what is printed
   *              («hace 3 d» sorts by the date, not by the string)
   *   numeric    right-aligned and tabular. For quantities and money, never
   *              for a phone number or a plate — those are identifiers.
   *   id         the stamped-identifier register: mono, read character by
   *              character. BAT001, OT-0042, CL445926.
   *   sortable   the header becomes a button and reports a true aria-sort
   *   order      'text' | 'number' | 'date' — only changes how the sort control
   *              describes itself out loud. Defaults from `numeric`.
   *   primary    this column carries the row link and titles the card.
   *              Defaults to the first column.
   *   min        what the column actually needs, e.g. '18ch'. Declaring it is
   *              what makes the horizontal scroll honest instead of letting
   *              every cell wrap onto three lines and pretend it fits.
   *   w          a fixed width for the <col>, when a column should not flex
   *   optional   first to be dropped when the container gets narrow
   *   showAt     the container width (px) at which an optional column returns
   *   wrap       let this cell wrap. Default is one line with an ellipsis.
   *   interactive  this cell contains its own controls, so raise it above the
   *              row link. Use sparingly — the actions slot is the right place.
   *   cardHide   do not repeat this column inside the card (the primary column
   *              is already the card's title)
   */
  export let columns = [];
  export let rows = [];

  /** Stable identity per row. Selection, expansion and keyed each all use it. */
  export let rowKey = (row, i) => row?.id ?? i;

  /**
   * The table's accessible name. REQUIRED — a screen reader landing on an
   * unnamed table announces "table with 7 columns" and nothing else. It is
   * rendered as a real <caption>, hidden unless `showCaption`.
   */
  export let caption = '';
  export let showCaption = false;

  /** { key, dir: 'asc' | 'desc' } — use `bind:sort` to own it. */
  export let sort = null;
  /** false ⇒ the table only REPORTS the sort; the server or the parent does it. */
  export let autoSort = true;

  export let selectable = false;
  /** Array of row keys. `bind:selected`. */
  export let selected = [];
  /** (row) => false | true | 'reason' — a row that cannot be selected, and why. */
  export let rowDisabled = null;

  /** (row) => href. Present ⇒ the row is a link. */
  export let href = null;
  /** true ⇒ the row is a stretched <button> that dispatches `open` instead. */
  export let open = false;
  /** (row) => the accessible name of that control. Defaults to the primary cell. */
  export let rowLabel = null;

  /** Presence of a per-row detail panel, opened by a disclosure in the row. */
  export let expandable = false;
  /** Array of open row keys. `bind:expanded`. */
  export let expanded = [];

  export let dense = false;
  /** Bound scroll. Any CSS length; '' lets the table grow with the page. */
  export let maxHeight = 'min(68vh, 820px)';

  export let loading = false;
  export let skeletonRows = 6;
  /** The problem, in a sentence. Truthy ⇒ the error state replaces the table. */
  export let error = '';
  /** The recovery. The error state says both or it is half an answer. */
  export let errorFix = '';

  /** How many rows exist with the filters off. Passing it is what lets the
      component tell «no hay nada» apart from «tu filtro no encontró nada». */
  export let total = null;
  /** The search text, quoted back in the filtered-to-nothing state. */
  export let query = '';
  /** Force the filtered reading (other filters are on but the search box is empty). */
  export let filtered = null;
  /** Words for the default state copy, in the product's own vocabulary. */
  export let noun = 'fila';
  export let nounPlural = 'filas';
  /** 'm' | 'f' — the noun's gender. «Ningún servicio» but «Ninguna orden».
      Change `noun` and you almost always have to change this with it. */
  export let gender = 'f';
  export let emptyTitle = '';
  export let emptyBody = '';

  /** The card-per-row fallback. Switch it off and the table just scrolls. */
  export let cards = true;
  export let cardsBelow = 620;

  let host;
  let scroller;
  let width = 0;
  let overflows = false;

  const uid = `sxt-${Math.random().toString(36).slice(2, 8)}`;

  // The box, not the window. A module beside a 240px sidebar has ~150px less to
  // work with than `innerWidth` claims, and a table that believes the window is
  // a table that overflows in production and never in the catalogue.
  onMount(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(host);
    if (scroller) ro.observe(scroller);
    measure();
    return () => ro.disconnect();
  });

  function measure() {
    width = host?.clientWidth ?? 0;
    overflows = !!scroller &&
      (scroller.scrollWidth - scroller.clientWidth > 1 || scroller.scrollHeight - scroller.clientHeight > 1);
  }

  // Zero means "not measured yet": render the table, not the cards, so the
  // first frame of a desktop never flashes a stack of phone cards.
  $: narrow = cards && width > 0 && width < cardsBelow;
  // Re-measure after anything that changes how wide the table wants to be.
  $: rows, columns, dense, maxHeight, queueMeasure();
  function queueMeasure() {
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(measure);
  }

  // ── Columns ──────────────────────────────────────────────────────────────
  // Dropped in JS rather than hidden in CSS, because the expanded row's colspan
  // has to agree with how many cells are actually there. A `display:none` column
  // and a colspan computed from the full list is a broken table that only looks
  // right.
  $: visible = columns.filter((c) => !c.optional || width === 0 || width >= (c.showAt ?? 780));
  $: primary = columns.find((c) => c.primary) ?? columns[0] ?? null;
  $: hasActions = !!$$slots.actions;
  $: span = visible.length + (selectable ? 1 : 0) + (expandable ? 1 : 0) + (hasActions ? 1 : 0);

  // What the columns actually need. Without it the browser squeezes the folio
  // and the money onto two lines each and the scrollbar never appears.
  $: minW = (() => {
    const parts = [
      selectable ? 'var(--sx-s-10)' : null,
      expandable ? 'var(--sx-s-10)' : null,
      ...visible.map((c) => c.min ?? (c.numeric ? '10ch' : '13ch')),
      hasActions ? 'var(--sx-s-16)' : null
    ].filter(Boolean);
    return parts.length ? `calc(${parts.join(' + ')})` : 'auto';
  })();

  // `$:` and not `const`. A legacy reactive statement tracks only the names
  // written inside it, so a plain `const cellOf = …` closing over `columns`
  // would be invisible to `sorted` and to the card list: they would never
  // recompute when a column's accessor changed. Declaring the helper reactively
  // is what puts its dependencies into theirs. This is the trap that has
  // already shipped three bugs in this ecosystem.
  $: cellOf = (row, col) => (col?.value ? col.value(row) : col ? row?.[col.key] : '');
  $: sortKeyOf = (row, col) => (col.sortValue ? col.sortValue(row) : row?.[col.key]);
  $: keyOf = (row, i) => rowKey(row, i);
  $: titleOf = (row) => (primary ? cellOf(row, primary) : '');
  $: labelOf = (row) => (rowLabel ? rowLabel(row) : String(titleOf(row) ?? ''));
  $: disabledOf = (row) => (rowDisabled ? rowDisabled(row) : false);

  // ── Sorting ──────────────────────────────────────────────────────────────
  // Blanks go last in BOTH directions and never invert with the arrow. «Sin
  // fecha» is not the earliest date and a machine with no reading is not the one
  // that has run least — putting them at the top of an ascending sort is how a
  // planner ends up working the wrong three rows.
  function compare(a, b, col) {
    const av = sortKeyOf(a, col);
    const bv = sortKeyOf(b, col);
    const ae = av == null || av === '';
    const be = bv == null || bv === '';
    if (ae || be) return ae && be ? 0 : ae ? Infinity : -Infinity; // sentinel: handled below
    if (typeof av === 'number' && typeof bv === 'number') return av - bv;
    if (av instanceof Date && bv instanceof Date) return av.getTime() - bv.getTime();
    if (typeof av === 'boolean' && typeof bv === 'boolean') return (av ? 1 : 0) - (bv ? 1 : 0);
    // 'es' with numeric collation: BAT2 before BAT10, and «Ñ» and «á» land where
    // a Costa Rican reader expects them and not where ASCII would put them.
    return String(av).localeCompare(String(bv), 'es', { numeric: true, sensitivity: 'base' });
  }

  $: sorted = (() => {
    if (!autoSort || !sort?.key) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const dir = sort.dir === 'desc' ? -1 : 1;
    // Array#sort has been stable since ES2019, so a second sort on another
    // column keeps the first one as the tie-break for free.
    return rows.slice().sort((a, b) => {
      const r = compare(a, b, col);
      if (r === Infinity) return 1;    // a is blank → last, whichever way the arrow points
      if (r === -Infinity) return -1;  // b is blank → last
      return dir * r;
    });
  })();

  function toggleSort(col) {
    if (!col.sortable) return;
    const dir = sort?.key === col.key && sort.dir === 'asc' ? 'desc' : 'asc';
    sort = { key: col.key, dir };
    dispatch('sort', sort);
  }

  $: ariaSort = (col) =>
    !col.sortable ? null : sort?.key === col.key ? (sort.dir === 'desc' ? 'descending' : 'ascending') : 'none';

  // Said out loud in the column's own units, so «de mayor a menor» never lands
  // on a list of names and «de la A a la Z» never lands on colones.
  $: orderWords = (col) => {
    const kind = col.order ?? (col.numeric ? 'number' : 'text');
    if (kind === 'number') return ['de menor a mayor', 'de mayor a menor'];
    if (kind === 'date') return ['de la más antigua a la más reciente', 'de la más reciente a la más antigua'];
    return ['de la A a la Z', 'de la Z a la A'];
  };
  $: sortHint = (col) => {
    const [up, down] = orderWords(col);
    if (sort?.key !== col.key) return `sin ordenar; activar para ordenar ${up}`;
    return sort.dir === 'asc' ? `ordenado ${up}; activar para invertir` : `ordenado ${down}; activar para invertir`;
  };

  // ── Selection ────────────────────────────────────────────────────────────
  $: selectableKeys = sorted.map((r, i) => (disabledOf(r) ? null : keyOf(r, i))).filter((k) => k != null);
  $: allOn = selectableKeys.length > 0 && selectableKeys.every((k) => selected.includes(k));
  $: someOn = !allOn && selectableKeys.some((k) => selected.includes(k));

  let anchorIndex = -1;

  function setSelected(next) {
    selected = next;
    dispatch('select', selected);
  }

  function toggleAll() {
    // The promise the header checkbox can actually keep: it selects the rows
    // that are HERE, after the filters. Claiming the other three hundred would
    // be a lie the next bulk action makes expensive.
    if (allOn) setSelected(selected.filter((k) => !selectableKeys.includes(k)));
    else setSelected([...new Set([...selected, ...selectableKeys])]);
  }

  function toggleRow(row, i, ev) {
    const key = keyOf(row, i);
    const on = !selected.includes(key);
    // Shift-click extends from the last row touched. In a ledger of two hundred
    // services, closing out a week is one click and one shift-click.
    if (ev?.shiftKey && anchorIndex >= 0) {
      const [lo, hi] = anchorIndex < i ? [anchorIndex, i] : [i, anchorIndex];
      const range = sorted.slice(lo, hi + 1).map((r, n) => (disabledOf(r) ? null : keyOf(r, lo + n)))
        .filter((k) => k != null);
      setSelected(on
        ? [...new Set([...selected, ...range])]
        : selected.filter((k) => !range.includes(k)));
    } else {
      setSelected(on ? [...selected, key] : selected.filter((k) => k !== key));
    }
    anchorIndex = i;
  }

  // ── Expansion ────────────────────────────────────────────────────────────
  function toggleExpand(key) {
    expanded = expanded.includes(key) ? expanded.filter((k) => k !== key) : [...expanded, key];
    dispatch('expand', expanded);
  }

  // ── Which of the four states is true ─────────────────────────────────────
  $: isFiltered = filtered ?? (!!query || (total != null && total > rows.length));
  $: showState = !loading && !error && rows.length === 0;
  // Only over rows that exist. With none, the filtered state already says «hay
  // 340 en total» in a whole sentence, and «Mostrando 0 de 340» above it is the
  // same fact twice in worse words.
  $: showing = !loading && !error && rows.length > 0 && total != null && total !== rows.length;

  // One sentence, once, for anyone who cannot see the arrow move. Polite: it
  // waits for a gap rather than interrupting.
  $: live = loading
    ? `Cargando ${nounPlural}…`
    : error
      ? ''
      : sort?.key
        ? (() => {
            const col = columns.find((c) => c.key === sort.key);
            if (!col) return '';
            const [up, down] = orderWords(col);
            return `${rows.length} ${rows.length === 1 ? noun : nounPlural}, ${gender === 'f' ? 'ordenadas' : 'ordenados'} por ${col.label}, ${sort.dir === 'desc' ? down : up}.`;
          })()
        : '';

  function onOpen(row, ev) {
    dispatch('open', { row, event: ev });
  }

  /**
   * `indeterminate` exists only as a DOM property — there is no HTML attribute
   * for it — so it is the one piece of a table's selection state that cannot be
   * written in the markup. An action is the smallest honest way to set it.
   */
  function mixed(node, on) {
    node.indeterminate = !!on;
    return { update: (next) => (node.indeterminate = !!next) };
  }
</script>

<div class="wrap" class:dense bind:this={host}>
  <p class="sx-sr" role="status">{live}</p>

  {#if showing}
    <p class="showing sx-num">
      Mostrando {rows.length} de {total} {total === 1 ? noun : nounPlural}.
    </p>
  {/if}

  {#if loading}
    <!-- The skeleton keeps the table's shape so nothing jumps when the rows
         land. It is aria-hidden as a whole; the sentence above already said it. -->
    <div class="box" aria-busy="true">
      <div class="scroll" aria-hidden="true">
        <table style="min-width:{minW}">
          <caption class="sx-sr">{caption}</caption>
          <thead>
            <tr>
              {#if selectable}<th class="lead"><span class="sx-sr">Seleccionar</span></th>{/if}
              {#if expandable}<th class="lead"><span class="sx-sr">Detalle</span></th>{/if}
              {#each visible as col (col.key)}
                <th class:right={col.numeric}><span class="sx-cap">{col.label}</span></th>
              {/each}
              {#if hasActions}<th class="right"><span class="sx-sr">Acciones</span></th>{/if}
            </tr>
          </thead>
          <tbody>
            {#each Array.from({ length: skeletonRows }) as _, i}
              <tr>
                {#if selectable}<td class="lead"><DataSkeleton w="16px" h="16px" /></td>{/if}
                {#if expandable}<td class="lead"><DataSkeleton w="16px" h="16px" /></td>{/if}
                {#each visible as col (col.key)}
                  <td class:right={col.numeric}>
                    <span class="skcell" class:r={col.numeric}>
                      <DataSkeleton w={col.numeric ? '7ch' : i % 3 === 0 ? '11ch' : '15ch'} />
                    </span>
                  </td>
                {/each}
                {#if hasActions}<td class="right"><span class="skcell r"><DataSkeleton w="6ch" /></span></td>{/if}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

  {:else if error}
    <DataState
      kind="error"
      title={error}
      body={errorFix}
      {noun}
      {nounPlural}
      {gender}
      on:retry
    />

  {:else if showState}
    <slot name="empty" filtered={isFiltered}>
      <DataState
        kind={isFiltered ? 'filtered' : 'empty'}
        title={isFiltered ? '' : emptyTitle}
        body={isFiltered ? '' : emptyBody}
        {noun}
        {nounPlural}
        {gender}
        {query}
        {total}
        filters={isFiltered && !query}
        on:clear
      >
        <slot name="empty-action" />
      </DataState>
    </slot>

  {:else if narrow}
    <!-- ── The card fallback ────────────────────────────────────────────────
         Not a squeezed table: a different object. The primary column becomes
         the title, everything else becomes label-beside-value, and the numbers
         stay tabular so two cards can still be compared by scrolling. -->
    {#if selectable || columns.some((c) => c.sortable)}
      <div class="cbar">
        {#if selectable}
          <label class="chk">
            <input
              type="checkbox"
              checked={allOn}
              use:mixed={someOn}
              disabled={!selectableKeys.length}
              on:change={toggleAll}
            />
            <span class="chkw">
              {selected.length
                ? `${selected.length} ${gender === 'f' ? 'seleccionadas' : 'seleccionados'}`
                : `Seleccionar ${gender === 'f' ? 'todas' : 'todos'}`}
            </span>
          </label>
        {/if}
        {#if columns.some((c) => c.sortable)}
          <label class="csort">
            <span class="sx-cap">Ordenar por</span>
            <!-- «Sin ordenar» es una opción de verdad y no un hueco: sin ella el
                 select arranca en blanco cuando todavía no hay orden, o peor,
                 muestra una columna por la que nadie ordenó. -->
            <select
              value={sort?.key ?? ''}
              on:change={(e) => {
                const col = columns.find((c) => c.key === e.currentTarget.value);
                sort = col ? { key: col.key, dir: sort?.key === col.key ? sort.dir : 'asc' } : null;
                dispatch('sort', sort);
              }}
            >
              <option value="">Sin ordenar</option>
              {#each columns.filter((c) => c.sortable) as col (col.key)}
                <option value={col.key}>{col.label}</option>
              {/each}
            </select>
          </label>
          <button
            type="button"
            class="cdir"
            disabled={!sort?.key}
            on:click={() => { sort = { key: sort.key, dir: sort.dir === 'asc' ? 'desc' : 'asc' }; dispatch('sort', sort); }}
          >
            <svg viewBox="0 0 12 12" aria-hidden="true" class:down={sort?.dir === 'desc'}>
              <path d="M6 10V2M2.5 5.5 6 2l3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="sx-sr">
              {sort?.key
                ? `Invertir el orden; ahora ${orderWords(columns.find((c) => c.key === sort.key) ?? {})[sort.dir === 'desc' ? 1 : 0]}`
                : 'Invertir el orden'}
            </span>
            <span aria-hidden="true">{!sort?.key ? '—' : sort.dir === 'desc' ? 'Desc.' : 'Asc.'}</span>
          </button>
        {/if}
      </div>
    {/if}

    <ul class="cards" aria-label={caption || null}>
      {#each sorted as row, i (keyOf(row, i))}
        {@const key = keyOf(row, i)}
        {@const off = disabledOf(row)}
        {@const isOpen = expanded.includes(key)}
        <li class="card" class:on={selected.includes(key)}>
          <div class="chead">
            {#if selectable}
              <label class="chk raise">
                <input
                  type="checkbox"
                  checked={selected.includes(key)}
                  disabled={!!off}
                  title={typeof off === 'string' ? off : null}
                  on:click={(e) => toggleRow(row, i, e)}
                />
                <span class="sx-sr">Seleccionar {labelOf(row)}{typeof off === 'string' ? ` — ${off}` : ''}</span>
              </label>
            {/if}
            <h3 class="ctitle">
              {#if href}
                <a href={href(row)} class="stretch" on:click={(e) => onOpen(row, e)}>
                  <span class:sx-id={primary?.id}>{titleOf(row)}</span>
                </a>
              {:else if open}
                <button type="button" class="stretch" on:click={(e) => onOpen(row, e)}>
                  <span class:sx-id={primary?.id}>{titleOf(row)}</span>
                </button>
              {:else}
                <span class:sx-id={primary?.id}>{titleOf(row)}</span>
              {/if}
            </h3>
          </div>

          <dl class="cfields">
            {#each columns.filter((c) => c !== primary && !c.cardHide) as col (col.key)}
              {@const value = cellOf(row, col)}
              <div class="cf" class:full={col.wrap}>
                <dt class="sx-cap">{col.label}</dt>
                <dd class:sx-num={col.numeric} class:sx-id={col.id} class:raise={col.interactive}>
                  <slot name="cell" {row} {col} {value}>{value ?? '—'}</slot>
                </dd>
              </div>
            {/each}
          </dl>

          {#if expandable}
            <button
              type="button"
              class="cmore raise"
              aria-expanded={isOpen}
              aria-controls="{uid}-d-{i}"
              on:click={() => toggleExpand(key)}
            >
              <svg viewBox="0 0 12 12" aria-hidden="true" class:down={isOpen}>
                <path d="M4 2.5 8 6l-4 3.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {isOpen ? 'Ocultar el detalle' : 'Ver el detalle'}
              <span class="sx-sr">de {labelOf(row)}</span>
            </button>
            {#if isOpen}
              <div class="cdetail" id="{uid}-d-{i}">
                <slot name="expand" {row} />
              </div>
            {/if}
          {/if}

          {#if hasActions}
            <div class="cacts raise">
              <slot name="actions" {row} disabled={!!off} />
            </div>
          {/if}
        </li>
      {/each}
    </ul>

  {:else}
    <!-- ── The table ────────────────────────────────────────────────────── -->
    <div class="box">
      <!-- A scroll box a keyboard cannot reach is a set of columns a keyboard
           user cannot see. When — and only when — there is really something off
           the edge, this becomes a named region that Tab can land on and the
           arrow keys can move; that is the WAI pattern for a scrolling table and
           the reason the lint below is waived rather than obeyed. It stops being
           a tab stop the moment everything fits. -->
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <div
        class="scroll"
        bind:this={scroller}
        style={maxHeight ? `max-height:${maxHeight}` : ''}
        role={overflows && caption ? 'region' : null}
        aria-label={overflows && caption ? caption : null}
        tabindex={overflows ? 0 : null}
      >
        <table style="min-width:{minW}">
          <caption class={showCaption ? 'cap' : 'sx-sr'}>{caption}</caption>
          <colgroup>
            {#if selectable}<col class="w-lead">{/if}
            {#if expandable}<col class="w-lead">{/if}
            {#each visible as col (col.key)}<col style={col.w ? `width:${col.w}` : null}>{/each}
            {#if hasActions}<col class="w-act">{/if}
          </colgroup>
          <thead>
            <tr>
              {#if selectable}
                <th class="lead" scope="col">
                  <label class="chk">
                    <!-- `indeterminate` is a DOM property with no HTML
                         attribute, so it is set through an action rather than
                         written in the markup. A header checkbox that shows a
                         tick while three of forty rows are selected is a lie
                         the next bulk action makes expensive. -->
                    <input
                      type="checkbox"
                      checked={allOn}
                      use:mixed={someOn}
                      disabled={!selectableKeys.length}
                      on:change={toggleAll}
                    />
                    <span class="sx-sr">
                      {allOn ? 'Quitar la selección de' : 'Seleccionar'}
                      {gender === 'f' ? 'las' : 'los'}
                      {selectableKeys.length}
                      {selectableKeys.length === 1 ? noun : nounPlural} que están a la vista
                    </span>
                  </label>
                </th>
              {/if}
              {#if expandable}<th class="lead" scope="col"><span class="sx-sr">Detalle</span></th>{/if}

              {#each visible as col (col.key)}
                <th
                  scope="col"
                  class:right={col.numeric}
                  aria-sort={ariaSort(col)}
                >
                  {#if col.sortable}
                    <button type="button" class="sortbtn" on:click={() => toggleSort(col)}>
                      <span class="sx-cap">{col.label}</span>
                      <svg
                        viewBox="0 0 12 12"
                        aria-hidden="true"
                        class="arw"
                        class:on={sort?.key === col.key}
                        class:down={sort?.key === col.key && sort.dir === 'desc'}
                      >
                        <path d="M6 10V2M2.5 5.5 6 2l3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <span class="sx-sr">, {sortHint(col)}</span>
                    </button>
                  {:else}
                    <span class="sx-cap">{col.label}</span>
                  {/if}
                </th>
              {/each}

              {#if hasActions}
                <th class="right" scope="col"><span class="sx-sr">Acciones</span></th>
              {/if}
            </tr>
          </thead>

          <tbody>
            {#each sorted as row, i (keyOf(row, i))}
              {@const key = keyOf(row, i)}
              {@const off = disabledOf(row)}
              {@const isOpen = expanded.includes(key)}
              <tr class="row" class:on={selected.includes(key)} class:opened={isOpen}>
                {#if selectable}
                  <td class="lead raise">
                    <label class="chk">
                      <input
                        type="checkbox"
                        checked={selected.includes(key)}
                        disabled={!!off}
                        title={typeof off === 'string' ? off : null}
                        on:click={(e) => toggleRow(row, i, e)}
                      />
                      <span class="sx-sr">Seleccionar {labelOf(row)}{typeof off === 'string' ? ` — ${off}` : ''}</span>
                    </label>
                  </td>
                {/if}

                {#if expandable}
                  <td class="lead raise">
                    <button
                      type="button"
                      class="disc"
                      aria-expanded={isOpen}
                      aria-controls="{uid}-d-{i}"
                      on:click={() => toggleExpand(key)}
                    >
                      <svg viewBox="0 0 12 12" aria-hidden="true" class:down={isOpen}>
                        <path d="M4 2.5 8 6l-4 3.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <span class="sx-sr">
                        {isOpen ? 'Ocultar' : 'Ver'} el detalle de {labelOf(row)}
                      </span>
                    </button>
                  </td>
                {/if}

                {#each visible as col (col.key)}
                  {@const value = cellOf(row, col)}
                  <td
                    class:right={col.numeric}
                    class:num={col.numeric}
                    class:wrap={col.wrap}
                    class:pri={col === primary && (href || open)}
                    class:raise={col.interactive}
                    class:sx-id={col.id}
                  >
                    {#if col === primary && href}
                      <a href={href(row)} class="stretch" on:click={(e) => onOpen(row, e)}>
                        <span class="txt"><slot name="cell" {row} {col} {value}>{value ?? '—'}</slot></span>
                      </a>
                    {:else if col === primary && open}
                      <button type="button" class="stretch" on:click={(e) => onOpen(row, e)}>
                        <span class="txt"><slot name="cell" {row} {col} {value}>{value ?? '—'}</slot></span>
                      </button>
                    {:else}
                      <slot name="cell" {row} {col} {value}>{value ?? '—'}</slot>
                    {/if}
                  </td>
                {/each}

                {#if hasActions}
                  <td class="acts raise">
                    <div class="actbox">
                      <slot name="actions" {row} disabled={!!off} />
                    </div>
                  </td>
                {/if}
              </tr>

              {#if expandable && isOpen}
                <tr class="detrow">
                  <td colspan={span}>
                    <div class="detbox" id="{uid}-d-{i}">
                      <slot name="expand" {row} />
                    </div>
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>

<style>
  /* base.css defines this, and base.css does not cross a shadow boundary — so
     every component that hides a label from the eye and not from the reader
     carries the rule itself. Without it a Core would paint every one of the
     table's hidden names on screen. */
  .sx-sr {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  .wrap { display: flex; flex-direction: column; gap: var(--sx-s-3); min-width: 0; }

  .showing {
    margin: 0;
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-3);
  }

  /* Depth, never a hairline box. The two covers ride WITH the content (`local`)
     and uncover a shadow that stays put (`scroll`), so an edge darkens only
     while there is still a column past it. */
  .box {
    border-radius: var(--sx-r-3);
    background: var(--sx-surface);
    box-shadow: var(--sx-e-1);
    overflow: hidden;
    min-width: 0;
  }

  /* The shadow is mixed from --sx-n-900, the one neutral that does NOT rebind in
     dark — a shadow is the absence of light in both themes, so mixing from
     --sx-ink would turn it into a white glow the moment the theme flips. */
  .scroll {
    --sx-scroll-shade: color-mix(in srgb, var(--sx-n-900) 16%, transparent);
    overflow: auto;
    overscroll-behavior: contain;
    /* Longhands, not the shorthand, on purpose: an unresolvable colour makes a
       declaration invalid at computed-value time, and with the shorthand that
       would take the surface colour down with the gradients and leave a
       transparent table. Written this way the decoration can fail alone. */
    background-color: var(--sx-surface);
    background-image:
      linear-gradient(to right, var(--sx-surface) 40%, transparent),
      linear-gradient(to left, var(--sx-surface) 40%, transparent),
      radial-gradient(farthest-side at 0 50%, var(--sx-scroll-shade), transparent),
      radial-gradient(farthest-side at 100% 50%, var(--sx-scroll-shade), transparent);
    background-position: 0 0, 100% 0, 0 0, 100% 0;
    background-size: var(--sx-s-10) 100%, var(--sx-s-10) 100%, var(--sx-s-3) 100%, var(--sx-s-3) 100%;
    background-repeat: no-repeat;
    /* The covers ride WITH the content, the shades stay put — so an edge only
       darkens while there is still a column past it. */
    background-attachment: local, local, scroll, scroll;
  }
  .scroll:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: -2px; }

  /* `separate`, not `collapse`: a collapsed border does not travel with a
     sticky <th> — it stays behind and the pinned head loses its rule the moment
     you scroll. All the lines here are box-shadows for the same reason, and it
     also keeps `position: relative` on a <tr> well-defined. */
  table { width: 100%; border-collapse: separate; border-spacing: 0; }

  caption.cap {
    caption-side: top;
    text-align: left;
    padding: var(--sx-s-4) var(--sx-s-4) 0;
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-semi);
    color: var(--sx-ink-2);
  }

  col.w-lead { width: var(--sx-s-10); }
  col.w-act { width: var(--sx-s-16); }

  /* The head is pinned to the scroll box, not to the page: the person reading
     row 40 has forgotten what column four was. */
  thead th {
    position: sticky;
    top: 0;
    z-index: var(--sx-z-sticky);
    background: var(--sx-thead);
    text-align: left;
    padding: var(--sx-s-3) var(--sx-s-4);
    white-space: nowrap;
    vertical-align: bottom;
    box-shadow: 0 1px 0 var(--sx-line);
  }
  th.right, td.right { text-align: right; }

  .sortbtn {
    display: inline-flex;
    align-items: center;
    gap: var(--sx-s-1);
    background: none;
    border: 0;
    padding: var(--sx-s-1) var(--sx-s-2);
    margin: calc(var(--sx-s-1) * -1) calc(var(--sx-s-2) * -1);
    border-radius: var(--sx-r-1);
    cursor: pointer;
    color: inherit;
    transition: background var(--sx-fast) var(--sx-ease);
  }
  th.right .sortbtn { flex-direction: row-reverse; }
  .sortbtn:hover { background: var(--sx-accent-soft); }
  .sortbtn:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: 1px; }

  /* The sort mark is a SHAPE that moves, never a colour that changes: the
     unsorted state is a faint arrow, the sorted one is solid ink and points the
     way the rows go. Someone who cannot see the tint still sees the direction. */
  .arw {
    width: 11px;
    height: 11px;
    flex: none;
    opacity: .28;
    transition: transform var(--sx-fast) var(--sx-ease), opacity var(--sx-fast) var(--sx-ease);
  }
  .sortbtn:hover .arw { opacity: .6; }
  .arw.on { opacity: 1; color: var(--sx-ink); }
  .arw.down { transform: rotate(180deg); }

  tbody td {
    padding: var(--sx-s-3) var(--sx-s-4);
    height: var(--sx-s-12);
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-2);
    vertical-align: middle;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    box-shadow: inset 0 -1px 0 var(--sx-line);
  }
  /* The one cell that must NOT clip: the row link's overlay lives inside it,
     and an ancestor with `overflow: hidden` would cut the hit area down to the
     first column. The truncation moves inward, onto .txt. */
  tbody td.pri { overflow: visible; }
  .dense tbody td { height: var(--sx-s-10); padding-block: var(--sx-s-2); }
  td.wrap { white-space: normal; }
  /* Rule three of the system, declared locally rather than left to the .sx-num
     register: a shadow root may not have base.css, and figures lining up under
     figures is not allowed to be the optional part. */
  td.num {
    font-variant-numeric: tabular-nums lining-nums slashed-zero;
    font-feature-settings: "tnum" 1, "lnum" 1, "zero" 1;
    font-weight: var(--sx-w-medium);
    color: var(--sx-ink);
  }
  tbody tr:last-child td { box-shadow: none; }

  /* `position: relative` on the row is what lets the primary cell's link stretch
     across it. The lead and action cells are raised out of its way. */
  tbody tr.row { position: relative; transition: background var(--sx-fast) var(--sx-ease); }
  /* EL ESCALÓN DEL CURSOR. Iba a --sx-sunk, y ahí está la trampa de todo este
     rebind: en una dirección de vidrio --sx-sunk es blanco translúcido y ACLARA
     la fila; en una opaca es un gris y la misma regla la OSCURECE. Con Nácar
     eso daba una fila gris donde tiene que haber una fila que se ilumina.
     Sobre blanco no se puede aclarar, así que el escalón se hace con el acento,
     que es un tinte apenas insinuado y no es gris. */
  tbody tr.row:hover { background: var(--sx-accent-soft); }
  tbody tr.row:focus-within { background: var(--sx-accent-soft); }
  tbody tr.opened td { box-shadow: none; }
  /* SELECCIONADO ES UN RELLENO, el highlight de siempre. Se intentó con un
     anillo para separarlo del hover, y un anillo alrededor de una fila de tabla
     no se lee como highlight: se lee como un marco. La separación con el hover
     la hace el token: --sx-accent-soft (10 %) para el puntero, que es pasajero,
     y --sx-accent-pick (18 %) para la selección, que persiste. */
  tbody tr.on td { background: var(--sx-accent-pick); }

  td.lead { padding-inline: var(--sx-s-3); }
  .raise { position: relative; z-index: 1; }

  .stretch {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    vertical-align: middle;
    background: none;
    border: 0;
    padding: 0;
    font: inherit;
    text-align: inherit;
    color: var(--sx-ink);
    font-weight: var(--sx-w-semi);
    text-decoration: none;
    cursor: pointer;
    border-radius: var(--sx-r-1);
  }
  /* The whole row is the target, drawn from the primary cell so the link keeps
     its real name, its real href and its real context menu. */
  .stretch::after { content: ''; position: absolute; inset: 0; }
  .stretch:hover { text-decoration: underline; text-underline-offset: 3px; }
  .stretch:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: 2px; }
  .txt { display: block; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .disc {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--sx-s-8);
    height: var(--sx-s-8);
    border: 0;
    border-radius: var(--sx-r-1);
    background: none;
    color: var(--sx-ink-3);
    cursor: pointer;
    transition: background var(--sx-fast) var(--sx-ease), color var(--sx-fast) var(--sx-ease);
  }
  .disc:hover { background: var(--sx-accent-soft); color: var(--sx-ink); }
  .disc:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: 1px; }
  .disc svg, .cmore svg, .cdir svg { width: 12px; height: 12px; transition: transform var(--sx-fast) var(--sx-ease); }
  .disc svg.down, .cmore svg.down { transform: rotate(90deg); }
  .cdir svg.down { transform: rotate(180deg); }

  td.acts { padding-inline: var(--sx-s-3); }
  .actbox { display: flex; align-items: center; justify-content: flex-end; gap: var(--sx-s-1); }

  .detrow td { padding: 0 0 var(--sx-s-4); height: auto; white-space: normal; }
  .detbox {
    padding: var(--sx-s-4);
    margin-inline: var(--sx-s-4);
    border-radius: var(--sx-r-2);
    background: var(--sx-sunk);
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-2);
  }

  /* ── Checkboxes ──────────────────────────────────────────────────────── */
  .chk { display: inline-flex; align-items: center; gap: var(--sx-s-2); cursor: pointer; }
  .chk input {
    width: 16px;
    height: 16px;
    margin: 0;
    flex: none;
    accent-color: var(--sx-accent);
    cursor: pointer;
  }
  .chk input:disabled { cursor: not-allowed; opacity: .45; }
  .chk input:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: 2px; }
  .chkw { font-size: var(--sx-t-sm); font-weight: var(--sx-w-medium); color: var(--sx-ink-2); }

  .skcell { display: block; }
  .skcell.r { display: flex; justify-content: flex-end; }

  /* ── Cards ───────────────────────────────────────────────────────────── */
  .cbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--sx-s-3);
  }
  .csort { display: inline-flex; align-items: center; gap: var(--sx-s-2); }
  .csort select, .cdir {
    font: inherit;
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-semi);
    color: var(--sx-ink);
    background: var(--sx-surface);
    border: 1px solid var(--sx-edge);
    border-radius: var(--sx-r-pill);
    padding: var(--sx-s-2) var(--sx-s-3);
    min-height: var(--sx-s-10);
    cursor: pointer;
  }
  .cdir { display: inline-flex; align-items: center; gap: var(--sx-s-1); }
  .cdir:disabled { opacity: .45; cursor: not-allowed; }
  .csort select:focus-visible, .cdir:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: 2px; }

  .cards { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--sx-s-3); }
  .card {
    position: relative;
    background: var(--sx-surface);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-1);
    padding: var(--sx-s-4);
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-3);
  }
  .card.on { background: var(--sx-accent-pick); box-shadow: var(--sx-e-1), 0 0 0 2px var(--sx-accent) inset; }
  .chead { display: flex; align-items: flex-start; gap: var(--sx-s-3); }
  .ctitle {
    margin: 0;
    flex: 1;
    min-width: 0;
    font-size: var(--sx-t-md);
    font-weight: var(--sx-w-semi);
    letter-spacing: -.01em;
    color: var(--sx-ink);
  }

  /* Label beside value, not a squeezed table: the eye reads a card down the
     left and lands on the figure on the right, which is the same movement the
     table's own numeric column asks for. */
  .cfields { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: var(--sx-s-2) var(--sx-s-4); }
  .cf { display: contents; }
  .cf dt { align-self: baseline; }
  .cf dd {
    margin: 0;
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-2);
    text-align: right;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  /* A field that was allowed to wrap in the table gets the full width here and
     its label above it — a note does not belong in a right-aligned column. */
  .cf.full dt { grid-column: 1 / -1; }
  .cf.full dd { grid-column: 1 / -1; text-align: left; }

  .cmore {
    display: inline-flex;
    align-items: center;
    gap: var(--sx-s-2);
    align-self: flex-start;
    background: none;
    border: 0;
    padding: var(--sx-s-1) var(--sx-s-2);
    margin-inline: calc(var(--sx-s-2) * -1);
    border-radius: var(--sx-r-1);
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-semi);
    color: var(--sx-ink-2);
    cursor: pointer;
  }
  /* Mismo escalón que la fila y que .disc: --sx-sunk aquí salía gris sucio en
     vez de iluminarse. Ver el comentario de la línea 917. */
  .cmore:hover { color: var(--sx-ink); background: var(--sx-accent-soft); }
  .cmore:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: 1px; }

  .cdetail {
    padding: var(--sx-s-3);
    border-radius: var(--sx-r-1);
    background: var(--sx-sunk);
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-2);
  }
  .cacts { display: flex; flex-wrap: wrap; gap: var(--sx-s-2); }

  /* A tablet in landscape is 1024px wide and is still poked with a thumb, so the
     targets key on the pointer and never on the width. */
  @media (pointer: coarse) {
    tbody td { height: var(--sx-s-16); }
    .dense tbody td { height: var(--sx-s-12); }
    .chk input { width: 22px; height: 22px; }
    .chk { min-height: var(--sx-touch); min-width: var(--sx-touch); justify-content: center; }
    .disc { width: var(--sx-touch); height: var(--sx-touch); }
    .sortbtn { min-height: var(--sx-touch); }
    .stretch { display: inline-flex; align-items: center; min-height: var(--sx-touch); }
    .cmore { min-height: var(--sx-touch); }
    /* Below 16px iOS zooms the whole module when the select takes focus. */
    .csort select, .cdir { min-height: var(--sx-touch); font-size: 16px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .sortbtn, .arw, .disc, .disc svg, .cmore svg, .cdir svg, tbody tr.row { transition: none; }
  }
</style>
