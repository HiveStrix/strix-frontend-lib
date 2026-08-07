<script>
  // PAGINATION — where you are in a set that does not fit.
  //
  // THE SENTENCE IS THE COMPONENT. «Mostrando 21–40 de 312 servicios» is the
  // part somebody actually reads; the buttons are how they act on it. A pager
  // that shows «‹ 1 2 3 ›» and no totals has hidden the only fact that matters —
  // how much is left — and every operator learns to distrust it.
  //
  //   <Pagination
  //     bind:page {total} pageSize={40}
  //     noun="servicios" nounOne="servicio"
  //     on:change={(e) => load(e.detail.page)} />
  //
  // WHEN NOT TO PAGINATE AT ALL
  //
  //   · Under ~200 rows that the client already holds. Scrolling is faster than
  //     clicking and it keeps Ctrl+F working, which is what people really use.
  //   · A feed people read forwards. That is «cargar más», not page 7 of 340.
  //   · Anything somebody has to COMPARE across the break. Splitting a ledger
  //     that gets totalled is how a total ends up wrong.
  //
  // Pagination is right when the set is genuinely large, the server is doing the
  // slicing, and a person needs to be able to say «I am two thirds of the way
  // through» — which is the one thing infinite scroll can never tell them.
  //
  // NUMBERS ARE TABULAR EVERYWHERE HERE. A pager is nothing but figures beside
  // figures, and «1 111» has to be the same width as «8 888» or the row jitters
  // as you page through it.
  //
  // FOCUS, AFTER A PAGE CHANGE: this component keeps focus on the control you
  // pressed, which is right for «siguiente» — you will press it again. If your
  // list is long, move focus to the list's own heading in your `change`
  // handler, or a keyboard user lands at the bottom of a page they have not
  // seen the top of.
  import { createEventDispatcher } from 'svelte';

  /** 1-based. Bindable. */
  export let page = 1;
  export let pageSize = 25;
  /** The size of the whole set, not of the page. */
  export let total = 0;
  /** How many page numbers to show either side of the current one. */
  export let siblings = 1;
  /** «servicios», «equipos», «facturas». Plural. */
  export let noun = 'resultados';
  /** The singular, for the one-row case. Falls back to `noun`. */
  export let nounOne = '';
  /** Offer a page-size select: [25, 50, 100]. [] hides it. */
  export let sizes = [];
  /** Only «anterior / siguiente» plus «Página 3 de 16». Also automatic ≤560px. */
  export let compact = false;
  /** A page is in flight. Everything freezes rather than queueing clicks. */
  export let loading = false;

  const dispatch = createEventDispatcher();

  $: pages = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));
  // A page number that outlived its data (rows were deleted, a filter narrowed
  // the set) must snap back, or the surface shows an empty page 9 of 4.
  $: if (page > pages) page = pages;
  $: if (page < 1) page = 1;

  $: from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  $: to = Math.min(page * pageSize, total);
  $: word = total === 1 ? (nounOne || noun) : noun;

  // The window of numbers, with the ends always pinned: page 1 and the last
  // page are the two somebody jumps to by name. `null` is where the gap goes.
  // Written as a reactive statement so `page`, `pages` and `siblings` are all in
  // its dependency list — as a `const` helper it would draw the first window
  // forever.
  $: window_ = (() => {
    const span = siblings * 2 + 5; // ends + current + siblings + two gaps
    if (pages <= span) return Array.from({ length: pages }, (_, i) => i + 1);
    const lo = Math.max(2, page - siblings);
    const hi = Math.min(pages - 1, page + siblings);
    const out = [1];
    if (lo > 2) out.push(null);
    for (let p = lo; p <= hi; p++) out.push(p);
    if (hi < pages - 1) out.push(null);
    out.push(pages);
    return out;
  })();

  function go(p) {
    const next = Math.min(pages, Math.max(1, p));
    if (next === page || loading) return;
    page = next;
    dispatch('change', { page: next, pageSize });
  }

  function resize(e) {
    const next = Number(e.currentTarget.value);
    if (!next || next === pageSize) return;
    // The first row of the current page is the row somebody is looking at, so
    // the new page is the one that still contains it — not page 1, which throws
    // away where they were.
    const anchor = (page - 1) * pageSize;
    pageSize = next;
    page = Math.floor(anchor / next) + 1;
    dispatch('change', { page, pageSize });
  }
</script>

{#if total > 0}
  <div class="pg" class:busy={loading} class:tight={compact}>
    <p class="count sx-num" aria-live="polite">
      {#if pages === 1}
        {total} {word}
      {:else}
        Mostrando {from}–{to} de {total} {word}
      {/if}
    </p>

    {#if pages > 1}
      <nav class="ctrls" aria-label="Paginación">
        <button class="nav" type="button" disabled={page === 1 || loading} on:click={() => go(page - 1)}>
          <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M7.4 2.4 3.8 6l3.6 3.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" /></svg>
          <span class="nw">Anterior</span>
        </button>

        <span class="where sx-num" aria-hidden="true">Página {page} de {pages}</span>

        <ol class="nums">
          {#each window_ as p, i (p === null ? `gap-${i}` : p)}
            <li>
              {#if p === null}
                <span class="gap" aria-hidden="true">···</span>
              {:else}
                <button
                  class="num sx-num"
                  class:on={p === page}
                  type="button"
                  disabled={loading || undefined}
                  aria-current={p === page ? 'page' : undefined}
                  aria-label="Página {p}{p === page ? ', actual' : ''}"
                  on:click={() => go(p)}
                >{p}</button>
              {/if}
            </li>
          {/each}
        </ol>

        <button class="nav" type="button" disabled={page === pages || loading} on:click={() => go(page + 1)}>
          <span class="nw">Siguiente</span>
          <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4.6 2.4 8.2 6l-3.6 3.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
      </nav>
    {/if}

    {#if sizes.length}
      <label class="size">
        <span class="sx-cap">Por página</span>
        <select value={pageSize} disabled={loading} on:change={resize}>
          {#each sizes as s (s)}<option value={s}>{s}</option>{/each}
        </select>
      </label>
    {/if}
  </div>
{/if}

<style>
  .pg {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--sx-s-3) var(--sx-s-4);
    min-width: 0;
  }

  .count {
    margin: 0;
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-3);
    flex: 1 1 auto;
  }

  .ctrls { display: flex; align-items: center; gap: var(--sx-s-1); flex: none; }

  .nums { display: flex; align-items: center; gap: var(--sx-s-1); list-style: none; margin: 0; padding: 0; }
  .nums li { display: flex; }

  .nav, .num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--sx-s-1);
    min-width: var(--sx-s-8);
    height: var(--sx-s-8);
    padding-inline: var(--sx-s-2);
    border: 0;
    border-radius: var(--sx-r-1);
    background: none;
    color: var(--sx-ink-2);
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-medium);
    cursor: pointer;
    transition: background var(--sx-fast) var(--sx-ease), color var(--sx-fast) var(--sx-ease);
  }
  .nav { padding-inline: var(--sx-s-3); }
  .nav svg { width: 12px; height: 12px; flex: none; }

  .nav:hover:not(:disabled), .num:hover:not(:disabled):not(.on) {
    background: var(--sx-sunk);
    color: var(--sx-ink);
  }

  /* Where you are is a filled chip, not a coloured number: it has to survive
     being the only thing somebody glances at. */
  .num.on {
    background: var(--sx-accent);
    color: var(--sx-accent-ink);
    font-weight: var(--sx-w-semi);
    cursor: default;
  }

  .nav:disabled { color: var(--sx-ink-3); opacity: .45; cursor: not-allowed; }
  .num:disabled { cursor: progress; }

  .gap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--sx-s-6);
    height: var(--sx-s-8);
    color: var(--sx-ink-3);
    font-size: var(--sx-t-sm);
    letter-spacing: .1em;
  }

  /* «Página 3 de 16» only exists in the compact shape; the numbered list says
     the same thing when it is on screen. */
  .where { display: none; font-size: var(--sx-t-sm); color: var(--sx-ink-2); font-weight: var(--sx-w-medium); padding-inline: var(--sx-s-2); }

  .size { display: inline-flex; align-items: center; gap: var(--sx-s-2); flex: none; }
  .size select {
    height: var(--sx-s-8);
    padding-inline: var(--sx-s-3);
    border: 1px solid var(--sx-edge);
    border-radius: var(--sx-r-1);
    background: var(--sx-surface);
    color: var(--sx-ink);
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-medium);
    cursor: pointer;
  }

  .busy { opacity: .6; }

  /* Repeated in-component: base.css does not cross a shadow boundary. */
  .nav:focus-visible, .num:focus-visible, .size select:focus-visible {
    outline: 2px solid var(--sx-ink);
    outline-offset: 2px;
    border-radius: var(--sx-r-1);
  }

  @media (pointer: coarse) {
    .nav, .num, .size select { min-height: var(--sx-touch); height: var(--sx-touch); min-width: var(--sx-touch); }
    .size select { font-size: 16px; }
    .gap { height: var(--sx-touch); }
  }

  /* Below this the numbered list stops fitting beside the sentence, and a pager
     that wraps onto three lines is a pager people scroll past. Prev/next plus
     «Página 3 de 16» carries the same information in one line. `.tight` is the
     same shape asked for by hand, for a narrow column inside a wide window —
     which is the usual case in a Shell. */
  .tight .nums, .tight .nw { display: none; }
  .tight .where { display: inline-flex; }

  @media (max-width: 560px) {
    .nums, .nw { display: none; }
    .where { display: inline-flex; }
    .pg { justify-content: flex-start; }
    .count { flex: 1 0 100%; }
  }
</style>
