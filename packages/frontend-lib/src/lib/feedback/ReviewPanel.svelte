<script>
  // REVIEWPANEL — nothing is written until a person says so, and before they say
  // so they see exactly what would be written.
  //
  // WHY THIS IS IN THE LIBRARY AND NOT IN ONE MODULE: it is the mechanism that
  // makes automated ingestion safe to offer at all. A parser reads a stack of
  // dispatch documents; a model fills the gaps; a price list arrives as a
  // spreadsheet; an integration proposes four hundred rows. Every one of those
  // is the same shape — a batch of PROPOSALS, each with its own verdict, none of
  // them written — and the shape has to be built once, correctly, or the fourth
  // module to need it will build the version that writes first and asks after.
  //
  // THE CONTRACT THIS SURFACE ASSUMES, and it is worth writing down because the
  // component cannot enforce it alone: the preview and the commit are the SAME
  // request with a flag flipped, and the commit re-sends the exact payload that
  // produced the verdicts on screen. Anything else and what a person approved
  // and what the server writes are two different things that merely look alike.
  //
  //   <ReviewPanel
  //     title="Lo que se entendió"
  //     items={preview.files} state={writing ? 'working' : done ? 'done' : 'review'}
  //     noun={['documento', 'documentos']}
  //     on:commit={confirmWrite} on:cancel={backToFiles} />
  //
  // WHAT AN ITEM LOOKS LIKE — every field but `id` and `verdict` optional:
  //
  //   { id: 'f3', kind: 'Salida', code: 'SAL-118432', title: 'salida-118432.pdf',
  //     meta: ['1.2 MB', '12 líneas'], verdict: 'write',
  //     message: 'BAT007 suma 96 h y 4 días fuera.',
  //     fix: '…', lines: [{ id, label, text, verdict, message }],
  //     footnote: { label: '6 campos quedaron inciertos', text: '…' } }
  //
  // FIVE VERDICTS, and the vocabulary is fixed on purpose so that a person who
  // learns it importing documents already knows it importing a price list:
  //
  //   write      it will be written                positive
  //   question   it needs an answer first          attention
  //   block      it will not be written, and why   critical
  //   duplicate  it was already here               neutral
  //   skip       correctly not written             neutral  ← A SUCCESS.
  //
  // That last one is the subtlety that gets missed: twenty shoring posts on a
  // dispatch document are correctly not a machine. Colouring that amber teaches
  // people to ignore amber. `skip` is neutral and always will be.
  //
  // Items that need attention float to the top: five rows where one asks for
  // something have to read as «one asks for something» without hunting.
  //
  // THE COMMIT SITS AT THE BOTTOM, after the evidence, which is the one place a
  // preview-before-commit surface is allowed to put it. The verdict sentence at
  // the top says how many, so nobody has to scroll to find out whether it is
  // worth scrolling.
  //
  // WHEN NOT: for a single object a person is editing — that is a form and its
  // own save button. For an action with no per-item outcome, a Confirm is
  // smaller and clearer. And never as a receipt: once it is written, the record
  // belongs in the module's own ledger, not in a panel that disappears.
  import { createEventDispatcher } from 'svelte';
  import Pill from '../Pill.svelte';
  import Button from '../action/Button.svelte';
  import { markOf } from '../marks.js';

  /** [{ id, verdict, … }] — see the shape above. */
  export let items = [];
  /** review | working | done */
  export let state = 'review';
  /** Heads the panel. Optional: the screen around it often has the heading. */
  export let title = '';
  /** The subject line under the title. */
  export let note = '';
  /** [singular, plural] of what is being reviewed. */
  export let noun = ['documento', 'documentos'];
  /**
   * The product's verb, in the five shapes the sentences need. Partial: whatever
   * is not given keeps the default.
   *   { infinitive:'aplicar', commit:'Aplicar', doing:'Aplicando…',
   *     done:'aplicado', donePlural:'aplicados' }
   */
  export let verb = {};
  /** Let a person drop an item from the batch before committing. */
  export let selectable = false;
  export let cancelLabel = 'Volver';
  export let doneLabel = 'Listo';
  export let heading = 'h2';

  const dispatch = createEventDispatcher();

  $: V = {
    infinitive: 'registrar',
    commit: 'Registrar',
    doing: 'Registrando…',
    done: 'registrado',
    donePlural: 'registrados',
    ...verb
  };

  // What floats to the top. `duplicate` and `skip` share the floor because both
  // are outcomes nobody has to do anything about.
  const RANK = { block: 0, question: 1, write: 2, duplicate: 3, skip: 3 };

  const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
  // `$:` and not `const`: this closes over the `noun` PROP, and `commitLabel`
  // below calls it. As a const, `noun` was not in `commitLabel`'s dependency
  // list, so a panel whose noun changed («documento» → «línea de precio») kept
  // committing «Registrar 4 documentos». The exact trap this file's own comment
  // warns about, three declarations further down.
  $: the = (n) => (n === 1 ? noun[0] : noun[1]);

  let excluded = new Set();

  // An id that is no longer in the batch is no longer a decision. Pruning is
  // hygiene, not the whole answer: `id` has to identify the PROPOSAL, not its
  // position, or a second preview whose rows are called f1…f5 again inherits
  // somebody's exclusions from the first. When the ids cannot be made stable,
  // wrap the panel in `{#key previewId}` and let it start clean.
  $: if (excluded.size) {
    const live = new Set(items.map((it) => it.id));
    const kept = [...excluded].filter((id) => live.has(id));
    if (kept.length !== excluded.size) excluded = new Set(kept);
  }

  function toggle(id) {
    const next = new Set(excluded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    excluded = next;
    dispatch('toggle', { id, included: !next.has(id) });
  }

  // Every one of these is `$:` and not `const`: a legacy reactive statement
  // tracks only the names written inside it, so a plain helper closing over
  // `state` or `excluded` would be invisible to the markup that calls it and the
  // words would keep saying «se va a registrar» after the write had finished.
  // `top` because only an ITEM can be excluded: a line's id lives in its own
  // namespace, and without the flag a line that happened to be called `f3`
  // would inherit the exclusion of the item called `f3`.
  $: isOut = (it, top) => top && selectable && it.verdict === 'write' && excluded.has(it.id);

  $: wordOf = (it, top = false) => {
    if (isOut(it, top)) return { word: 'Se deja por fuera', tone: 'neutral' };
    const done = state === 'done';
    switch (it.verdict) {
      case 'write':
        return { word: it.word ?? (done ? cap(V.done) : `Se va a ${V.infinitive}`), tone: 'positive' };
      case 'block':
        return { word: it.word ?? (done ? `No quedó ${V.done}` : `No se va a ${V.infinitive}`), tone: 'critical' };
      case 'question':
        return { word: it.word ?? (done ? 'Quedó pendiente' : 'Falta contestar'), tone: 'attention' };
      case 'duplicate':
        return { word: it.word ?? 'Ya estaba', tone: 'neutral' };
      case 'skip':
        return { word: it.word ?? (done ? 'Omitido' : 'Se omite'), tone: 'neutral' };
      default:
        return { word: it.word ?? 'Sin verdicto', tone: 'neutral' };
    }
  };

  $: sorted = items
    .map((it, i) => ({ it, i }))
    .sort((a, b) => (RANK[a.it.verdict] ?? 4) - (RANK[b.it.verdict] ?? 4) || a.i - b.i)
    .map(({ it }) => it);

  $: writable = items.filter((it) => it.verdict === 'write');
  $: included = writable.filter((it) => !excluded.has(it.id));
  $: needsEye = items.filter((it) => (RANK[it.verdict] ?? 4) <= 1);
  $: dups = items.filter((it) => it.verdict === 'duplicate');
  $: skips = items.filter((it) => it.verdict === 'skip');
  $: dropped = selectable ? writable.length - included.length : 0;

  $: summary = (() => {
    const n = items.length;
    if (!n) return null;
    const k = included.length;

    let head;
    if (state === 'done') {
      head = k === 0
        ? `No quedó nada ${V.done}.`
        : k === 1
          ? `Quedó ${V.done} 1 ${noun[0]}.`
          : `Quedaron ${V.donePlural} ${k} ${noun[1]}.`;
    } else if (dups.length === n) {
      head = n === 1 ? 'Esto ya estaba.' : 'Todo esto ya estaba.';
    } else if (k === 0) {
      head = `Nada que ${V.infinitive} todavía.`;
    } else if (k === n) {
      head = n === 1
        ? `Se va a ${V.infinitive} 1 ${noun[0]}.`
        : `Se van a ${V.infinitive} ${n} ${noun[1]}.`;
    } else {
      head = k === 1
        ? `Se va a ${V.infinitive} 1 de ${n} ${noun[1]}.`
        : `Se van a ${V.infinitive} ${k} de ${n} ${noun[1]}.`;
    }

    // Whole sentence per branch: gluing a plural tail onto a singular count is
    // exactly the sentence that has to read cleanly.
    const bits = [];
    if (needsEye.length === 1) bits.push(`1 ${noun[0]} necesita atención y está de primero en la lista.`);
    else if (needsEye.length > 1) bits.push(`${needsEye.length} necesitan atención y están de primero en la lista.`);
    if (dups.length && dups.length !== n)
      bits.push(dups.length === 1
        ? '1 ya estaba y no se vuelve a escribir.'
        : `${dups.length} ya estaban y no se vuelven a escribir.`);
    if (skips.length)
      bits.push(skips.length === 1 ? '1 se omite a propósito.' : `${skips.length} se omiten a propósito.`);
    if (dropped) bits.push(dropped === 1 ? 'Dejaste 1 por fuera.' : `Dejaste ${dropped} por fuera.`);

    // Critical ink goes on the headline only when the headline itself is the bad
    // news: something will not be written, or — once it is over — nothing was.
    // A question that still lets the batch through is reported in the second
    // line and floated to the top of the list; that is enough. Painting a
    // sentence that reads «quedaron registrados 2 documentos» red is how a red
    // that means «stop» stops meaning anything.
    const urgent = state === 'done' ? k === 0 : items.some((it) => it.verdict === 'block');
    return { head, sub: bits.join(' '), urgent };
  })();

  $: commitLabel = included.length
    ? `${V.commit} ${included.length} ${the(included.length)}`
    : `Nada que ${V.infinitive}`;

  let open = {};
  const disclose = (k) => (open = { ...open, [k]: !open[k] });
</script>

<section class="rp">
  {#if title || note}
    <header class="top">
      {#if title}<svelte:element this={heading} class="title">{title}</svelte:element>{/if}
      {#if note}<p class="note">{note}</p>{/if}
    </header>
  {/if}

  {#if !items.length}
    <p class="nothing">
      <slot name="empty">No hay nada que revisar todavía.</slot>
    </p>
  {:else}
    <!-- The verdict, as one sentence somebody can act on. It is a live region:
         when a preview lands, this is the thing that has changed. -->
    <div class="verdict" role="status">
      <p class="head" class:urgent={summary.urgent}>{summary.head}</p>
      {#if summary.sub}<p class="sub">{summary.sub}</p>{/if}
      {#if state === 'review'}
        <p class="pledge">
          Todavía no se ha escrito nada. Esto es exactamente lo que se va a
          {V.infinitive} si confirmás.
        </p>
      {/if}
    </div>

    <ul class="items">
      {#each sorted as it (it.id)}
        {@const w = wordOf(it, true)}
        {@const eye = (RANK[it.verdict] ?? 4) <= 1}
        {@const out = isOut(it, true)}
        <li class="item {w.tone}" class:flag={eye} class:out>
          <div class="ihead">
            {#if selectable && it.verdict === 'write' && state === 'review'}
              <label class="pick">
                <input type="checkbox" checked={!excluded.has(it.id)} on:change={() => toggle(it.id)} />
                <span class="sx-sr">Incluir {it.code || it.title || the(1)}</span>
              </label>
            {/if}

            <div class="who">
              <p class="what">
                {#if it.kind}<span class="sx-cap kind">{it.kind}</span>{/if}
                {#if it.code}<b class="sx-id code">{it.code}</b>{/if}
                {#if it.title}<span class="name">{it.title}</span>{/if}
              </p>
              {#if (it.meta ?? []).length}
                <p class="meta sx-num">
                  {#each it.meta as m, i (i)}<span>{m}</span>{/each}
                </p>
              {/if}
            </div>

            <span class="stamp"><Pill tone={w.tone} size="sm">{w.word}</Pill></span>
          </div>

          {#if it.message}<p class="msg">{it.message}</p>{/if}

          {#if (it.lines ?? []).length}
            <ul class="lines">
              {#each it.lines as l, i (l.id ?? i)}
                {@const lw = wordOf(l)}
                <li class="line">
                  {#if l.label}<span class="sx-cap lno">{l.label}</span>{/if}
                  <div class="ltext">
                    <span class="sx-num">{l.text}</span>
                    {#if l.message}<span class="lmsg">{l.message}</span>{/if}
                  </div>
                  {#if l.verdict}<Pill tone={lw.tone} size="sm">{lw.word}</Pill>{/if}
                </li>
              {/each}
            </ul>
          {/if}

          {#if it.fix}
            <p class="fix">
              <svg class="mk" viewBox="0 0 12 12" aria-hidden="true">{@html markOf(w.tone)}</svg>
              <span>{it.fix}</span>
            </p>
          {/if}

          {#if it.footnote}
            <div class="foot">
              <button type="button" class="more" aria-expanded={!!open[it.id]} on:click={() => disclose(it.id)}>
                <svg class="chev" class:open={open[it.id]} viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M4 2.5 8 6l-4 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                {it.footnote.label}
              </button>
              {#if open[it.id]}<p class="fnote">{it.footnote.text}</p>{/if}
            </div>
          {/if}
        </li>
      {/each}
    </ul>

    <div class="acts">
      <slot name="foot">
        {#if state === 'done'}
          <Button variant="outline" on:click={() => dispatch('done')}>{doneLabel}</Button>
        {:else}
          <Button variant="outline" disabled={state === 'working'} on:click={() => dispatch('cancel')}>
            {cancelLabel}
          </Button>
          <!-- Busy keeps the width and keeps the focus; `reason` is what makes
               a blocked commit explain itself instead of being a dead grey
               rectangle at the bottom of a panel somebody just read. -->
          <Button
            variant="solid"
            busy={state === 'working'}
            disabled={state !== 'working' && !included.length}
            reason={!included.length ? `No hay nada seleccionado que ${V.infinitive}.` : ''}
            on:click={() => dispatch('commit', { ids: included.map((it) => it.id), items: included })}
          >
            {state === 'working' ? V.doing : commitLabel}
          </Button>
        {/if}
      </slot>
    </div>
  {/if}
</section>

<style>
  .rp { display: flex; flex-direction: column; gap: var(--sx-s-4); min-width: 0; }

  .title {
    margin: 0;
    font-size: var(--sx-t-lg);
    font-weight: var(--sx-w-semi);
    letter-spacing: -.02em;
  }
  .note { margin: var(--sx-s-1) 0 0; font-size: var(--sx-t-sm); color: var(--sx-ink-3); }

  .nothing {
    margin: 0;
    padding: var(--sx-s-8);
    text-align: center;
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-3);
    background: var(--sx-surface);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-1);
  }

  .verdict {
    background: var(--sx-surface);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-2);
    padding: var(--sx-s-5);
  }
  .head {
    margin: 0;
    font-size: var(--sx-t-xl);
    font-weight: var(--sx-w-semi);
    letter-spacing: -.025em;
    line-height: 1.2;
    max-width: 26ch;
  }
  .head.urgent { color: var(--sx-critical); }
  .sub { margin: var(--sx-s-2) 0 0; font-size: var(--sx-t-sm); color: var(--sx-ink-2); max-width: 60ch; }
  /* The promise, in the smallest register on the panel, because it should be
     reassuring rather than loud — and it disappears the moment it stops being
     true. */
  .pledge {
    margin: var(--sx-s-3) 0 0;
    font-size: var(--sx-t-xs);
    color: var(--sx-ink-3);
    max-width: 60ch;
  }

  .items { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--sx-s-2); }

  .item {
    background: var(--sx-surface);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-1);
    padding: var(--sx-s-4);
  }
  /* The tone bar is an inset fill, not a border: borders in this system are for
     control outlines and focus. */
  .item.flag.critical  { box-shadow: var(--sx-e-1), inset 3px 0 0 var(--sx-critical); }
  .item.flag.attention { box-shadow: var(--sx-e-1), inset 3px 0 0 var(--sx-attention); }
  .item.out { opacity: .62; }

  .ihead { display: flex; align-items: flex-start; gap: var(--sx-s-3); }
  .who { flex: 1; min-width: 0; }
  .what {
    margin: 0;
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: var(--sx-s-2);
    font-size: var(--sx-t-sm);
  }
  .kind { flex: none; }
  .code { font-weight: var(--sx-w-bold); color: var(--sx-ink); }
  .name { color: var(--sx-ink-2); min-width: 0; overflow-wrap: anywhere; }
  .meta {
    margin: var(--sx-s-1) 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--sx-s-3);
    font-size: var(--sx-t-xs);
    color: var(--sx-ink-3);
  }
  .stamp { flex: none; }

  .pick { display: flex; align-items: center; justify-content: center; flex: none; padding-top: 2px; }
  .pick input {
    width: var(--sx-s-4);
    height: var(--sx-s-4);
    margin: 0;
    cursor: pointer;
    accent-color: var(--sx-accent);
  }

  .msg { margin: var(--sx-s-2) 0 0; font-size: var(--sx-t-sm); color: var(--sx-ink-2); }

  .lines {
    list-style: none;
    margin: var(--sx-s-3) 0 0;
    padding: var(--sx-s-2) 0 0;
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-2);
    box-shadow: inset 0 1px 0 var(--sx-line);
  }
  .line {
    display: flex;
    align-items: baseline;
    gap: var(--sx-s-3);
    font-size: var(--sx-t-xs);
  }
  .lno { flex: none; }
  .ltext { flex: 1; min-width: 0; display: flex; flex-wrap: wrap; gap: var(--sx-s-2); color: var(--sx-ink-2); }
  .lmsg { color: var(--sx-ink-3); }

  .fix {
    display: flex;
    align-items: flex-start;
    gap: var(--sx-s-2);
    margin: var(--sx-s-3) 0 0;
    padding: var(--sx-s-3);
    background: var(--sx-sunk);
    border-radius: var(--sx-r-1);
    font-size: var(--sx-t-xs);
    line-height: 1.5;
    color: var(--sx-ink-2);
  }
  .fix .mk { flex: none; width: .85em; height: .85em; margin-top: .3em; }
  .critical .fix .mk  { color: var(--sx-critical); }
  .attention .fix .mk { color: var(--sx-attention); }

  .foot { margin-top: var(--sx-s-2); }
  .more {
    display: inline-flex;
    align-items: center;
    gap: var(--sx-s-2);
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    font-size: var(--sx-t-xs);
    color: var(--sx-ink-3);
    cursor: pointer;
    border-radius: var(--sx-r-1);
  }
  .more:hover { color: var(--sx-ink-2); }
  .chev { width: .85em; height: .85em; transition: transform var(--sx-fast) var(--sx-ease); }
  .chev.open { transform: rotate(90deg); }
  .fnote { margin: var(--sx-s-2) 0 0; font-size: var(--sx-t-xs); color: var(--sx-ink-3); line-height: 1.5; max-width: 62ch; }

  .acts { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: var(--sx-s-2); }

  /* The fifth copy of Button lived here. Deleted. */

  @media (pointer: coarse) {
    .more { min-height: var(--sx-touch); }
    /* The checkbox is the control that decides whether a row gets written, so
       on a tablet it gets a real target instead of a 16px square. */
    .pick { min-width: var(--sx-touch); min-height: var(--sx-touch); margin: calc(var(--sx-s-2) * -1) 0; }
    .pick input { width: var(--sx-s-5); height: var(--sx-s-5); }
  }

  @media (max-width: 560px) {
    .verdict { padding: var(--sx-s-4); }
    .head { font-size: var(--sx-t-lg); }
    /* The verdict pill drops to its own line rather than squeezing the code
       into two characters per line. */
    .ihead { flex-wrap: wrap; }
    .stamp { margin-left: auto; }
    /* Reversed so the commit is on top, where the thumb is — and `stretch`
       rather than reaching into Button and setting its width. */
    .acts { flex-direction: column-reverse; align-items: stretch; }
  }

  @media (prefers-reduced-motion: reduce) {
    .chev { transition: none; }
  }
</style>
