<script>
  // WHEN THE RECORDS ARE NOT PEERS.
  //
  // A table says: these fields are comparable, read them down the column. That
  // is a strong claim, and it is often false. A work order has a folio, a
  // machine, a technician's note in prose, a date and a total — the note is
  // three lines and the total is eight characters, and forcing them into
  // columns of equal ceremony makes the note unreadable and the total invisible.
  //
  // A DataList makes a different claim: each record is one object with a NAME, a
  // few supporting facts, and at most one figure that matters. It reads as a
  // sentence per row instead of a grid, which is also what survives a phone
  // without a fallback layout — the shape is already the narrow shape.
  //
  //   <DataList
  //     label="Órdenes de trabajo"
  //     items={orders} itemKey={(o) => o.id}
  //     href={(o) => `/ordenes/${o.id}`}
  //     title={(o) => o.title}
  //     code={(o) => o.code}
  //     meta={(o) => [o.assetCode, fmtDate(o.date), o.technician]}
  //     value={(o) => fmtMoney(o.total)}
  //     total={all.length} query={q}
  //     on:clear={reset}>
  //     <svelte:fragment slot="tag" let:item><Pill tone={item.tone}>{item.word}</Pill></svelte:fragment>
  //     <svelte:fragment slot="detail" let:item>…</svelte:fragment>
  //   </DataList>
  //
  // The four states are the same four a <Table> has, and they are the same
  // component, so «no encontré nada» reads identically wherever a person meets
  // it in the ecosystem.
  //
  // WHEN NOT TO USE IT
  //   • The whole point is comparing a column of figures. Use <Table>: a list
  //     puts every total on a different left edge and the comparison is gone.
  //   • Selection and bulk actions. A list has no header row to hang a
  //     select-all on, and bolting one above it is a table with extra steps.
  //   • More than about six facts per record. That is a detail sheet, and a
  //     list of detail sheets is a page nobody scrolls to the end of.

  import { createEventDispatcher } from 'svelte';
  import DataState from './DataState.svelte';
  import DataSkeleton from './DataSkeleton.svelte';

  const dispatch = createEventDispatcher();

  export let items = [];
  export let itemKey = (item, i) => item?.id ?? i;

  /** The list's accessible name. A bare <ul> of forty rows announces nothing. */
  export let label = '';

  /** (item) => the record's name. The heading of its row. */
  export let title = (item) => item?.title ?? item?.name ?? '';
  /** (item) => its stamped identifier: OT-0042, BAT001, CL445926. */
  export let code = null;
  /** (item) => an array of short supporting facts, already formatted. */
  export let meta = null;
  /** (item) => the one figure that matters. Right, tabular, heavier. */
  export let value = null;
  /** (item) => a line of prose under the title. Never tabular — it is a sentence. */
  export let note = null;

  /** (item) => href. Present ⇒ the whole row is a link. */
  export let href = null;
  /** true ⇒ the row is a stretched <button> dispatching `open` instead. */
  export let open = false;

  /** A per-item detail panel behind a disclosure. */
  export let expandable = false;
  export let expanded = [];

  export let dense = false;

  export let loading = false;
  export let skeletonRows = 5;
  export let error = '';
  export let errorFix = '';

  export let total = null;
  export let query = '';
  export let filtered = null;
  export let noun = 'registro';
  export let nounPlural = 'registros';
  /** 'm' | 'f' — the noun's gender. «Ningún registro» but «Ninguna entrada». */
  export let gender = 'm';
  export let emptyTitle = '';
  export let emptyBody = '';

  const uid = `sxl-${Math.random().toString(36).slice(2, 8)}`;

  // `$:` and not `const`, for the same reason it is `$:` in Table: a legacy
  // reactive statement tracks only the names written inside it, so a helper
  // closing over the `title`/`meta` props would never make the list recompute
  // when a caller swapped them.
  $: titleOf = (item) => title(item);
  $: codeOf = (item) => (code ? code(item) : '');
  $: metaOf = (item) => (meta ? (meta(item) ?? []).filter((m) => m != null && m !== '') : []);
  $: valueOf = (item) => (value ? value(item) : null);
  $: noteOf = (item) => (note ? note(item) : '');

  $: isFiltered = filtered ?? (!!query || (total != null && total > items.length));
  $: showState = !loading && !error && items.length === 0;
  // Only over items that exist: with none, the filtered state already says how
  // many there are, in a whole sentence.
  $: showing = !loading && !error && items.length > 0 && total != null && total !== items.length;
  $: hasTag = !!$$slots.tag;
  $: hasActions = !!$$slots.actions;

  function toggle(key) {
    expanded = expanded.includes(key) ? expanded.filter((k) => k !== key) : [...expanded, key];
    dispatch('expand', expanded);
  }
</script>

<div class="wrap" class:dense aria-busy={loading || null}>
  <p class="sx-sr" role="status">{loading ? `Cargando ${nounPlural}…` : ''}</p>

  {#if showing}
    <p class="showing sx-num">
      Mostrando {items.length} de {total} {total === 1 ? noun : nounPlural}.
    </p>
  {/if}

  {#if loading}
    <ul class="list" aria-hidden="true">
      {#each Array.from({ length: skeletonRows }) as _, i}
        <li class="row sk">
          <div class="main">
            <DataSkeleton w={i % 2 ? '18ch' : '24ch'} h="var(--sx-s-4)" />
            <DataSkeleton w="32ch" />
          </div>
          <div class="side"><DataSkeleton w="9ch" h="var(--sx-s-4)" /></div>
        </li>
      {/each}
    </ul>

  {:else if error}
    <DataState kind="error" title={error} body={errorFix} {noun} {nounPlural} {gender} on:retry />

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

  {:else}
    <ul class="list" aria-label={label || null}>
      {#each items as item, i (itemKey(item, i))}
        {@const key = itemKey(item, i)}
        {@const isOpen = expanded.includes(key)}
        {@const facts = metaOf(item)}
        {@const val = valueOf(item)}
        <li class="row">
          <div class="line">
            <div class="main">
              <p class="head">
                {#if href}
                  <a href={href(item)} class="stretch" on:click={(e) => dispatch('open', { item, event: e })}>
                    {titleOf(item)}
                  </a>
                {:else if open}
                  <button type="button" class="stretch" on:click={(e) => dispatch('open', { item, event: e })}>
                    {titleOf(item)}
                  </button>
                {:else}
                  <span class="plain">{titleOf(item)}</span>
                {/if}
                {#if codeOf(item)}<span class="code sx-id">{codeOf(item)}</span>{/if}
              </p>

              {#if noteOf(item)}<p class="note">{noteOf(item)}</p>{/if}

              {#if facts.length}
                <!-- Middots, not columns: these facts are context, and dressing
                     them as a grid would promise a comparison that is not on
                     offer. Tabular figures all the same — «12 h» over «7 h»
                     still has to line up when two rows are read together. -->
                <p class="meta sx-num">
                  {#each facts as f, n}
                    {#if n > 0}<span class="dot" aria-hidden="true">·</span>{/if}<span>{f}</span>
                  {/each}
                </p>
              {/if}
            </div>

            <div class="side">
              {#if hasTag}<div class="tag raise"><slot name="tag" {item} /></div>{/if}
              {#if val != null && val !== ''}<p class="val sx-num">{val}</p>{/if}
              {#if hasActions}<div class="acts raise"><slot name="actions" {item} /></div>{/if}
            </div>
          </div>

          {#if expandable}
            <button
              type="button"
              class="more raise"
              aria-expanded={isOpen}
              aria-controls="{uid}-d-{i}"
              on:click={() => toggle(key)}
            >
              <svg viewBox="0 0 12 12" aria-hidden="true" class:down={isOpen}>
                <path d="M4 2.5 8 6l-4 3.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {isOpen ? 'Ocultar el detalle' : 'Ver el detalle'}
              <span class="sx-sr">de {titleOf(item)}</span>
            </button>
            {#if isOpen}
              <div class="detail" id="{uid}-d-{i}">
                <slot name="detail" {item} />
              </div>
            {/if}
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  /* base.css does not cross a shadow boundary; the rule travels with the
     component that depends on it. */
  .sx-sr {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  /* A container query, not a media query: the list is usually rendering beside
     the Shell's 240px sidebar, so the window's width is never the number that
     decides anything. It asks its own box. */
  .wrap {
    container-type: inline-size;
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-3);
    min-width: 0;
  }

  .showing { margin: 0; font-size: var(--sx-t-sm); color: var(--sx-ink-3); }

  .list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--sx-s-2); }

  .row {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-2);
    padding: var(--sx-s-4);
    background: var(--sx-surface);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-1);
    transition: box-shadow var(--sx-fast) var(--sx-ease), transform var(--sx-fast) var(--sx-ease);
  }
  .dense .row { padding: var(--sx-s-3) var(--sx-s-4); }
  .row:hover { box-shadow: var(--sx-e-2); }
  .row:focus-within { box-shadow: var(--sx-e-2); }
  .row.sk:hover { box-shadow: var(--sx-e-1); }

  .line { display: flex; align-items: flex-start; gap: var(--sx-s-4); }

  .main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--sx-s-1); }
  .side {
    flex: none;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--sx-s-2);
  }

  .head {
    margin: 0;
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: var(--sx-s-2);
    font-size: var(--sx-t-md);
    font-weight: var(--sx-w-semi);
    letter-spacing: -.01em;
    color: var(--sx-ink);
    line-height: 1.3;
  }

  .stretch, .plain {
    background: none;
    border: 0;
    padding: 0;
    font: inherit;
    color: inherit;
    text-align: left;
    text-decoration: none;
  }
  .stretch { cursor: pointer; border-radius: var(--sx-r-1); }
  /* The whole card is the target; the anchor keeps the name, the href and the
     context menu. Anything that must stay clickable is raised above it. */
  .stretch::after { content: ''; position: absolute; inset: 0; }
  .stretch:hover { text-decoration: underline; text-underline-offset: 3px; }
  .stretch:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: 3px; }

  .code { font-size: var(--sx-t-xs); color: var(--sx-ink-3); font-weight: var(--sx-w-medium); }

  /* Prose, so deliberately NOT tabular: a running sentence in tabular figures
     reads as a stutter. That is the other half of rule three. */
  .note {
    margin: 0;
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-2);
    line-height: 1.5;
    max-width: 70ch;
  }

  .meta {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--sx-s-2);
    font-size: var(--sx-t-xs);
    color: var(--sx-ink-3);
  }
  .dot { color: var(--sx-edge); }

  .val {
    margin: 0;
    font-size: var(--sx-t-md);
    font-weight: var(--sx-w-semi);
    letter-spacing: -.01em;
    color: var(--sx-ink);
    white-space: nowrap;
  }

  .raise { position: relative; z-index: 1; }
  .acts { display: flex; align-items: center; gap: var(--sx-s-1); }

  .more {
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
  .more:hover { color: var(--sx-ink); background: var(--sx-sunk); }
  .more:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: 1px; }
  .more svg { width: 12px; height: 12px; transition: transform var(--sx-fast) var(--sx-ease); }
  .more svg.down { transform: rotate(90deg); }

  .detail {
    padding: var(--sx-s-3);
    border-radius: var(--sx-r-1);
    background: var(--sx-sunk);
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-2);
  }

  /* Narrow: the figure stops sitting beside the name and takes its own line,
     where it still has room to be read. */
  @container (max-width: 480px) {
    .line { flex-direction: column; gap: var(--sx-s-2); }
    .side { flex-direction: row; align-items: center; align-self: stretch; justify-content: space-between; width: 100%; }
  }

  @media (pointer: coarse) {
    .stretch { display: inline-flex; align-items: center; min-height: var(--sx-touch); }
    .more { min-height: var(--sx-touch); }
  }

  @media (prefers-reduced-motion: reduce) {
    .row, .more svg { transition: none; }
  }
</style>
