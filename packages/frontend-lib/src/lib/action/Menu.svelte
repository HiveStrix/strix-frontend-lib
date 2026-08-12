<script>
  // MENU — a real menu button, which is to say: a button that owns a list.
  //
  // «Real» is not a boast, it is a checklist, and a menu that fails any line of
  // it is a div pretending:
  //
  //   · the trigger says `aria-haspopup="menu"` and `aria-expanded`, truthfully;
  //   · opening moves focus INTO the list, so the keyboard is never stranded;
  //   · ↑ ↓ Inicio Fin move a single roving tab stop — the list is one stop in
  //     the page's tab order, not eleven;
  //   · typing letters jumps to an item, because a list of nine plans is faster
  //     read than arrowed;
  //   · Escape closes it and GIVES FOCUS BACK to the trigger. Every time. A
  //     dialog that keeps focus is a trap; one that drops it on <body> is worse,
  //     because the user has to tab from the top of the page to get home;
  //   · Tab closes it and continues, which is what Tab means;
  //   · a click anywhere else closes it — measured with `composedPath()`, not
  //     `contains()`. Inside a shadow root every document-level event is
  //     retargeted to the host, so `contains(e.target)` is TRUE for the whole
  //     page and the menu never closes. That bug has shipped in this ecosystem.
  //
  //   <Menu label="Más acciones" items={[
  //       { id: 'edit',  label: 'Editar el equipo' },
  //       { id: 'csv',   label: 'Exportar servicios', hint: '24' },
  //       { sep: true },
  //       { id: 'del',   label: 'Dar de baja', tone: 'critical',
  //         disabled: true, reason: 'Tiene un servicio sin cerrar' }
  //     ]} on:select={(e) => run(e.detail.id)} />
  //
  // WHEN NOT TO USE IT
  //
  // For the action people came to do. A menu costs a click before anything is
  // even legible, so the primary never lives in one. A menu is for the tail:
  // the four things a row can do that are not the one thing it is for.
  //
  // Never as a form control — that is a <select>, and a native select is a wheel
  // on a phone, searchable on a desktop and free. `role="menu"` promises
  // COMMANDS. If the list sets a value, this is the wrong component.
  //
  // AN EMPTY MENU IS NOT A MENU. With no items the trigger disables itself and
  // says why, rather than opening a blank box and making somebody wonder whether
  // it is loading.
  //
  // ONE LIMIT WORTH KNOWING. The panel is absolutely positioned inside the
  // trigger's own box, not portalled to the top of the document — so it travels
  // correctly with scroll, but an ancestor with `overflow: hidden` will clip it.
  // In a scrolling table, give the scroller `overflow: auto` and room.
  import { createEventDispatcher, tick, onDestroy, flushSync } from 'svelte';
  import Button from './Button.svelte';

  /**
   * The list. Each item:
   *   { id, label, icon?, hint?, tone?, disabled?, reason? }  ·  { sep: true }
   * `icon` is inner SVG markup on a 24×24 grid, stroked with `currentColor`
   * (the same contract Pill's marks use), so it can never disagree with its tone.
   */
  export let items = [];
  /** The trigger's accessible name AND its visible words, unless a slot says otherwise. */
  export let label = 'Más acciones';
  /** solid | outline | ghost | danger */
  export let variant = 'outline';
  /** sm | md | lg */
  export let size = 'md';
  /** start | end — which edge of the trigger the panel lines up with. */
  export let align = 'end';
  /** Icon-only trigger: the ⋯ at the end of a table row. */
  export let compact = false;
  /** Inner SVG markup for the trigger's glyph. Defaults to ⋯ when compact. */
  export let icon = '';
  export let disabled = false;
  export let reason = '';
  export let pill = false;
  /** What to say when there is nothing to offer. */
  export let empty = 'No hay acciones disponibles.';
  /** Bindable. */
  export let open = false;

  const dispatch = createEventDispatcher();
  const pid = 'sx-menu-' + Math.random().toString(36).slice(2, 9);

  // Same contract the items use: inner markup on a 24×24 grid, drawn by the one
  // wrapper below, so a caller's glyph and the built-in ones cannot disagree.
  const DOTS =
    '<circle cx="5" cy="12" r="1.7" fill="currentColor" stroke="none"/>' +
    '<circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/>' +
    '<circle cx="19" cy="12" r="1.7" fill="currentColor" stroke="none"/>';
  const CHEV = '<path d="M5 9.5 12 16.5 19 9.5"/>';

  let root = null;      // the wrapper — what "outside" is measured against
  let panel = null;
  let trigger = null;   // the DOM node, so focus has somewhere to go home to
  let nodes = [];       // item index → element. Separators leave holes.
  let active = -1;
  let up = false;       // the panel flipped above the trigger

  // `$:` and not `const`: a legacy reactive statement only tracks the names
  // written inside it, so a plain helper closing over `items` would be invisible
  // to every statement that calls it and the list would answer for the previous
  // props. This is the trap that has already cost this ecosystem three bugs.
  $: focusable = (i) => !!items[i] && !items[i].sep;

  $: none = !items.length;
  // Nothing to show ⇒ nothing to open. The reason travels with the refusal.
  $: blocked = disabled || none;
  $: why = disabled ? reason : none ? empty : '';
  $: if (blocked && open) open = false;
  $: glyph = icon || DOTS;

  function setActive(i) {
    active = i;
    nodes[i]?.focus?.();
  }

  function step(from, delta) {
    const n = items.length;
    for (let k = 0; k < n; k++) {
      const i = ((from + delta * (k + 1)) % n + n) % n;
      if (focusable(i)) return setActive(i);
    }
  }

  function edge(fromEnd) {
    const n = items.length;
    for (let k = 0; k < n; k++) {
      const i = fromEnd ? n - 1 - k : k;
      if (focusable(i)) return setActive(i);
    }
  }

  async function show(fromEnd = false) {
    if (blocked || open) return;
    open = true;
    await tick();
    place();
    edge(fromEnd);
  }

  function hide(giveFocusBack = true) {
    if (!open) return;
    open = false;
    active = -1;
    typed = '';
    // Guard: a select can re-render the surface and the trigger may be gone.
    if (giveFocusBack && trigger?.isConnected) trigger.focus();
  }

  // Below or above? Measured once per opening, and again if the window changes
  // size while it is open. A menu on the last row of a long table opens upward
  // or it opens into nothing.
  function place() {
    if (!panel || !trigger) return;
    const t = trigger.getBoundingClientRect();
    const h = panel.offsetHeight;
    const below = window.innerHeight - t.bottom;
    up = below < h + 8 && t.top > below;
  }

  function toggle() {
    if (open) hide(true);
    else show(false);
  }

  function onTriggerKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); show(false); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); show(true); }
    else if (e.key === 'Escape' && open) { e.preventDefault(); hide(true); }
  }

  // Typeahead. Spanish menus are full of «Exportar …» and «Editar …», so a
  // single letter is not enough; the buffer clears after a beat of silence.
  let typed = '';
  let typedAt = 0;
  function typeahead(ch) {
    const now = Date.now();
    typed = now - typedAt > 700 ? ch : typed + ch;
    typedAt = now;
    const n = items.length;
    for (let k = 1; k <= n; k++) {
      const i = ((active + k) % n + n) % n;
      if (!focusable(i)) continue;
      if ((items[i].label ?? '').toLocaleLowerCase('es').startsWith(typed)) return setActive(i);
    }
  }

  function onPanelKey(e) {
    const k = e.key;
    if (k === 'Escape') { e.preventDefault(); e.stopPropagation(); hide(true); return; }
    // Tab means Tab: close, then continue. `flushSync` is load-bearing — without
    // it the panel is still in the DOM when the browser computes where Tab goes,
    // so focus lands on the menu item BELOW the one it just left, and then the
    // panel unmounts under it and drops focus on <body>. Flushing first removes
    // the panel, leaves focus on the trigger, and lets the default Tab step to
    // whatever genuinely follows it.
    if (k === 'Tab') { hide(true); flushSync(); return; }
    if (k === 'ArrowDown') { e.preventDefault(); step(active, 1); return; }
    if (k === 'ArrowUp') { e.preventDefault(); step(active, -1); return; }
    if (k === 'Home') { e.preventDefault(); edge(false); return; }
    if (k === 'End') { e.preventDefault(); edge(true); return; }
    if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && k !== ' ') {
      e.preventDefault();
      typeahead(k.toLocaleLowerCase('es'));
    }
  }

  function choose(item, i) {
    if (item.disabled) {
      // Stay put and let the reason be read rather than closing on a dead press.
      setActive(i);
      return;
    }
    dispatch('select', { id: item.id, item });
    hide(true);
  }

  // Outside = not on the composed path. See the header: inside a shadow root
  // `e.target` at document level is always the host, so `contains()` lies.
  function onOutside(e) {
    if (!open || !root) return;
    const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
    if (path.includes(root) || root.contains(e.target)) return;
    // Hand focus back only if it is currently INSIDE the panel about to vanish —
    // otherwise the pointer already chose where it was going and stealing it back
    // would fight the user. This runs on pointerdown, before the browser moves
    // focus to whatever was clicked, so a click on something focusable still wins;
    // a click on plain text lands on the trigger instead of on <body>.
    // Read through the root node: from outside a shadow tree `document.activeElement`
    // only ever reports the host element.
    const here = panel?.getRootNode?.()?.activeElement ?? null;
    hide(!!(here && panel?.contains(here)));
  }

  function onResize() { if (open) place(); }

  $: if (typeof document !== 'undefined') {
    document.removeEventListener('pointerdown', onOutside, true);
    window.removeEventListener('resize', onResize);
    if (open) {
      document.addEventListener('pointerdown', onOutside, true);
      window.addEventListener('resize', onResize);
    }
  }

  onDestroy(() => {
    if (typeof document === 'undefined') return;
    document.removeEventListener('pointerdown', onOutside, true);
    window.removeEventListener('resize', onResize);
  });
</script>

<div class="sx-menu" bind:this={root}>
  <!-- Two triggers rather than one with holes in it: the ⋯ at the end of a table
       row and the named button in a toolbar are different controls that happen to
       own the same list, and pretending otherwise costs more than it saves. -->
  {#if compact}
    <Button
      bind:node={trigger}
      {variant}
      {size}
      {pill}
      disabled={blocked}
      reason={why}
      {label}
      iconOnly
      aria-haspopup="menu"
      aria-expanded={open ? 'true' : 'false'}
      aria-controls={open ? pid : undefined}
      on:click={toggle}
      on:keydown={onTriggerKey}
    >
      <svg slot="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{@html glyph}</svg>
    </Button>
  {:else}
    <Button
      bind:node={trigger}
      {variant}
      {size}
      {pill}
      disabled={blocked}
      reason={why}
      aria-haspopup="menu"
      aria-expanded={open ? 'true' : 'false'}
      aria-controls={open ? pid : undefined}
      on:click={toggle}
      on:keydown={onTriggerKey}
    >
      {#if icon}
        <svg class="lead" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{@html icon}</svg>
      {/if}
      <span class="tl"><slot>{label}</slot></span>
      <svg class="cv" class:on={open} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{@html CHEV}</svg>
    </Button>
  {/if}

  {#if open}
    <div
      class="panel {align}"
      class:up
      id={pid}
      role="menu"
      aria-label={label}
      tabindex="-1"
      bind:this={panel}
      on:keydown={onPanelKey}
    >
      {#each items as it, i (it.id ?? `i${i}`)}
        {#if it.sep}
          <div class="sep" role="separator"></div>
        {:else}
          <button
            class="item"
            class:critical={it.tone === 'critical'}
            class:off={it.disabled}
            bind:this={nodes[i]}
            type="button"
            role="menuitem"
            tabindex={i === active ? 0 : -1}
            aria-disabled={it.disabled ? 'true' : undefined}
            title={it.reason || undefined}
            on:click={() => choose(it, i)}
          >
            <span class="mk" aria-hidden="true">
              {#if it.icon}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
                stroke-linecap="round" stroke-linejoin="round">{@html it.icon}</svg>{/if}
            </span>
            <span class="lb">{it.label}</span>
            {#if it.hint}<span class="hint">{it.hint}</span>{/if}
          </button>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .sx-menu { position: relative; display: inline-flex; max-width: 100%; }

  .tl { overflow: hidden; text-overflow: ellipsis; }
  .lead { flex: none; width: 1.15em; height: 1.15em; }
  /* The chevron turns because the state it reports is a direction: closed points
     down at what is coming, open points up at where it came from. 120ms, and
     `aria-expanded` says the same thing to anyone who cannot see it turn. */
  .cv {
    flex: none; width: 1em; height: 1em; margin-inline-end: calc(var(--sx-s-1) * -1);
    transition: transform var(--sx-fast) var(--sx-ease);
  }
  .cv.on { transform: rotate(180deg); }

  /* ── The panel ───────────────────────────────────────────────────────────
     Depth, not an outline: it is genuinely floating, so it gets the system's
     heaviest elevation and no border. `ch` rather than a pixel width because the
     thing being sized is a line of text — the system has no width scale, and
     inventing one here would be a token by stealth. */
  .panel {
    position: absolute;
    top: calc(100% + var(--sx-s-1));
    z-index: var(--sx-z-overlay);
    min-width: max(100%, 22ch);
    max-width: min(86vw, 40ch);
    padding: var(--sx-s-1);
    background: var(--sx-surface);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-3);
    max-height: min(60vh, 26rem);
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .panel.start { inset-inline-start: 0; }
  .panel.end { inset-inline-end: 0; }
  .panel.up { top: auto; bottom: calc(100% + var(--sx-s-1)); }

  .item {
    display: flex;
    align-items: center;
    gap: var(--sx-s-3);
    width: 100%;
    padding: var(--sx-s-2) var(--sx-s-3);
    font-family: var(--sx-font);
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-medium);
    line-height: 1.35;
    text-align: start;
    color: var(--sx-ink);
    background: transparent;
    border: 0;
    border-radius: var(--sx-r-1);
    cursor: pointer;
    transition: background-color var(--sx-fast) var(--sx-ease);
  }
  /* `:focus` and not only `:focus-visible`: after a mouse opens the menu the
     roving focus is real and has to be visible, or the arrow keys move a
     highlight nobody can see. */
  /* Un ítem bajo el cursor o con foco se levanta, no se hunde: --sx-sunk daba
     un gris sucio sobre blanco. Esto es el reposo bajo puntero/roving focus;
     la selección por teclado se marca aparte, con el anillo de foco de
     --sx-ink en :focus-visible más abajo — --sx-accent-edge no se usa en este
     archivo. */
  .item:hover, .item:focus { background: var(--sx-accent-soft); outline: none; }
  .item:focus-visible {
    outline: 2px solid var(--sx-ink);
    outline-offset: -2px;
    border-radius: var(--sx-r-1);
  }

  .mk { display: flex; flex: none; width: 1em; height: 1em; color: var(--sx-ink-3); }
  .mk :global(svg) { width: 100%; height: 100%; }
  .lb { flex: 1; min-width: 0; }
  /* A hint is a count or a shortcut — a figure beside other figures. */
  .hint {
    flex: none;
    font-size: var(--sx-t-xs);
    color: var(--sx-ink-3);
    font-variant-numeric: tabular-nums lining-nums slashed-zero;
    font-feature-settings: "tnum" 1, "lnum" 1, "zero" 1;
  }

  /* The tone never travels alone: the item's own word is «Eliminar», «Dar de
     baja», «Anular» — the colour only agrees with what is already written. */
  .item.critical { color: var(--sx-critical); }
  .item.critical .mk { color: var(--sx-critical); }
  .item.critical:hover, .item.critical:focus { background: var(--sx-critical-band); }

  /* Still focusable, still explains itself: a disabled item you cannot reach is
     an item that never tells you what you are missing. */
  .item.off { color: var(--sx-ink-3); cursor: not-allowed; }
  .item.off:hover { background: transparent; }
  .item.off:focus { background: var(--sx-sunk); }

  .sep {
    height: 1px;
    margin: var(--sx-s-1) var(--sx-s-2);
    background: var(--sx-line);
  }

  @media (prefers-reduced-motion: reduce) {
    .cv, .item { transition: none; }
  }

  @media (pointer: coarse) {
    .item { min-height: var(--sx-touch); font-size: var(--sx-t-md); }
    .panel { min-width: max(100%, 26ch); }
  }
</style>
