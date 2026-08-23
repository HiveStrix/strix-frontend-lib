<script>
  // TABS — one screen, several bodies of content, one at a time.
  //
  // TABS OR SEGMENTED? The whole difference, and it is not cosmetic:
  //
  //   TABS change WHAT you are looking at. Each tab owns a panel that could
  //   have been its own page — «Línea de tiempo» vs «Servicios» are different
  //   records with different columns. There is a panel to own, so there is an
  //   `aria-controls` that points at something true, a roving tabindex, and
  //   arrow keys. Tabs deserve a URL.
  //
  //   SEGMENTED changes HOW you are looking at the same thing — the horizon,
  //   the unit, the density. Nothing is swapped, so there is no panel to own,
  //   no aria-controls to point at, and `role="tab"` would be promising a
  //   pattern that is not there. Use Segmented.
  //
  // The test: if you can imagine deep-linking to it, it is a tab. If you would
  // never send somebody a link to it, it is a segment.
  //
  // TWO TO SIX. One tab is a heading. Seven is a menu wearing a tab bar, and on
  // a 390px column it becomes a horizontal scroll nobody discovers — that is
  // when the answer is a SideRail or a list page.
  //
  //   <Tabs items={[
  //     { key: 'linea', label: 'Línea de tiempo' },
  //     { key: 'servicios', label: 'Servicios', count: orders.length },
  //     { key: 'costos', label: 'Costos' }
  //   ]} bind:value label="Registro">
  //     {#if value === 'linea'}<Timeline … />{/if}
  //     {#if value === 'servicios'}<Ledger … />{/if}
  //   </Tabs>
  //
  // A GROUP TAB — a tab that owns a dropdown instead of a panel. When a rail
  // runs out of width, two related destinations that are consulted often but not
  // daily can share one slot: an item with its own `items` renders as a tab with
  // a caret that opens a menu of its children. Selecting a child fires `change`
  // with the child's key, exactly like a leaf tab; the group tab shows selected
  // whenever `value` is one of its children. It is one tab-stop in the roving
  // order (← → reach it, ↓/Enter open it), and the menu escapes the rail's own
  // horizontal scroll through the top layer, so it is never clipped.
  //
  //   { key: 'catalogo', label: 'Catálogo', items: [
  //       { key: 'equipos',  label: 'Equipos',  count: assets.length },
  //       { key: 'familias', label: 'Familias', count: families.length }
  //   ] }
  //
  // Reach for it only when a real slot shortage forces the merge: a menu costs a
  // click before its contents are even legible, so a destination that earns its
  // own tab keeps it. It is the pressure valve for «two to six», not a way to
  // fold six tabs into two dropdowns.
  //
  // THE PANEL IS PART OF THE COMPONENT, on purpose. A tablist whose
  // `aria-controls` points at an id somebody forgot to render is the single
  // most common broken tab implementation, and it is invisible until a screen
  // reader hits it. So: put the panel in the default slot and the wiring cannot
  // be wrong. Leave the slot empty — for the rare bar that only drives a route
  // — and the component emits NO aria-controls at all, because an aria
  // attribute that lies is worse than none.
  //
  // ACTIVATION IS AUTOMATIC: arrowing to a tab selects it. That is the right
  // default when panels are already-loaded client state. If a tab costs a
  // network round trip, pass `manual` and the arrow keys move focus only, with
  // Enter or Space to commit — otherwise arrowing across five tabs fires five
  // requests. A group tab never auto-activates: arrowing onto it only focuses
  // it, because there is no one child that «arriving» should pick.
  import { createEventDispatcher, tick, onDestroy, flushSync } from 'svelte';
  import { supportsPopover, syncPopover } from '../shell/toplayer.js';

  /** [{ key, label, count?, disabled?, items? }]. An item with `items` is a
      group tab: a dropdown of leaf items `[{ key, label, count?, disabled? }]`. */
  export let items = [];
  /** The selected key. Bindable. Always a LEAF key — a normal tab or a child of
      a group, never a group's own key. */
  export let value = undefined;
  /** aria-label for the tablist. Required in spirit: «Registro», «Ficha». */
  export let label = '';
  /** Arrow keys move focus without selecting. For panels that cost a request. */
  export let manual = false;
  /** Id root for the aria wiring. Pass one from an SSR app so the markup the
      server sends and the markup the client builds agree; otherwise a random
      one is fine, because two Tabs on a page must never share ids. */
  export let id = '';

  const dispatch = createEventDispatcher();

  const uid = id || `sx-tabs-${Math.random().toString(36).slice(2, 9)}`;
  const CHEV = 'M5 9.5 12 16.5 19 9.5';

  const isGroup = (t) => Array.isArray(t?.items) && t.items.length > 0;

  let btns = {};       // top-level key → the real button, so focus never goes through a selector
  let focusKey = null; // where the arrow keys are, when roving

  $: enabled = items.filter((t) => !t.disabled);

  // The keys `value` may legally hold: every leaf. A group contributes its
  // children, never its own key — so the fallback below can never seat `value`
  // on a group, which owns no panel and no single child to show.
  $: leaves = items.flatMap((t) =>
    isGroup(t) ? t.items.filter((s) => !s.disabled).map((s) => s.key) : t.disabled ? [] : [t.key]
  );
  // If the bound value names a leaf that is gone (a filter removed it, the user
  // lost a permission), fall back rather than render a tablist with nothing
  // selected — a tablist with no selected tab has no keyboard entry point.
  $: if (items.length && !leaves.includes(value)) value = leaves[0];

  // Which TOP-LEVEL item is current: a leaf whose key is `value`, or the group
  // that owns it. The underline, the roving home and the panel's label all read
  // this, so a group shows selected exactly when one of its children is.
  $: activeTop = items.find((t) => (isGroup(t) ? t.items.some((s) => s.key === value) : t.key === value));
  $: activeTopKey = activeTop?.key ?? enabled[0]?.key;

  $: hasPanel = !!$$slots.default;
  // `$:` so `focusKey` and `activeTopKey` are in the dependency list of everything
  // that calls it. As a plain `const` the roving tabindex froze on the first tab.
  $: isTabStop = (t) => (focusKey ?? activeTopKey) === t.key;

  const tabId = (k) => `${uid}-t-${k}`;

  function ownerOf(leafKey) {
    return items.find((t) => (isGroup(t) ? t.items.some((s) => s.key === leafKey) : t.key === leafKey));
  }

  function select(key) {
    // The roving home follows the selection to the top-level item that owns it,
    // so ← → resume from the tab that is lit, group or leaf.
    focusKey = ownerOf(key)?.key ?? key;
    if (key === value) return;
    value = key;
    dispatch('change', { key });
  }

  async function focusTop(key) {
    focusKey = key;
    await tick(); // the roving tabindex has to land before the focus does
    const el = btns[key];
    el?.focus();
    // `block: 'nearest'` because the tablist is what scrolls sideways; without
    // it, arrowing to the last tab yanks the whole page down to meet it.
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function moveTop(nextKey) {
    const t = items.find((i) => i.key === nextKey);
    // Auto-activate only leaf tabs; a group takes focus and waits to be opened,
    // because «arriving» at a dropdown has no one child to commit to.
    if (!manual && t && !isGroup(t)) select(nextKey);
    else focusKey = nextKey;
    focusTop(nextKey);
  }

  function onTabKeydown(e, t) {
    const keys = enabled.map((x) => x.key);
    if (!keys.length) return;
    const at = Math.max(0, keys.indexOf(focusKey ?? activeTopKey));

    if (e.key === 'ArrowRight') { e.preventDefault(); moveTop(keys[(at + 1) % keys.length]); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); moveTop(keys[(at - 1 + keys.length) % keys.length]); }
    else if (e.key === 'Home') { e.preventDefault(); moveTop(keys[0]); }
    else if (e.key === 'End') { e.preventDefault(); moveTop(keys[keys.length - 1]); }
    else if (isGroup(t) && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault(); openGroup(t, false);
    }
    else if (isGroup(t) && e.key === 'ArrowUp') { e.preventDefault(); openGroup(t, true); }
    else if (!isGroup(t) && manual && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(t.key); }
  }

  // ── The group dropdown ───────────────────────────────────────────────────
  // One group open at a time. The panel lives in the top layer so the rail's
  // own `overflow-x` cannot clip it — the same reason Menu and Combobox do.
  let openKey = null;   // which group is open
  let panel = null;
  let openTrigger = null; // the open group's tab, for place() and focus-back
  let subNodes = [];
  let subActive = -1;
  let up = false;

  $: openItem = openKey ? items.find((t) => t.key === openKey) : null;
  $: subItems = openItem?.items ?? [];

  const focusableSub = (i) => !!subItems[i] && !subItems[i].disabled;
  function setSub(i) { subActive = i; subNodes[i]?.focus?.(); }
  function stepSub(from, delta) {
    const n = subItems.length;
    for (let k = 0; k < n; k++) {
      const i = ((from + delta * (k + 1)) % n + n) % n;
      if (focusableSub(i)) return setSub(i);
    }
  }
  function edgeSub(fromEnd) {
    const n = subItems.length;
    for (let k = 0; k < n; k++) {
      const i = fromEnd ? n - 1 - k : k;
      if (focusableSub(i)) return setSub(i);
    }
  }

  async function openGroup(t, fromEnd) {
    if (openKey === t.key) return;
    openKey = t.key;
    openTrigger = btns[t.key];
    subActive = -1;
    await tick();
    place();
    edgeSub(fromEnd);
  }

  function closeGroup(giveFocusBack = true) {
    if (!openKey) return;
    // Leave the top layer in the same synchronous step as everything else hide
    // does, before Svelte unmounts the node the `{#if}` is about to drop.
    syncPopover(panel, false);
    const trg = openTrigger;
    openKey = null;
    subActive = -1;
    openTrigger = null;
    if (giveFocusBack && trg?.isConnected) trg.focus();
  }

  // `openKey` can also change from an external write; keep the popover state in
  // step. `panel` is still null the instant `openKey` flips, so wait a tick.
  async function syncExternalOpen(k) { await tick(); syncPopover(panel, !!k); }
  $: syncExternalOpen(openKey);

  // Below or above? `syncPopover` runs BEFORE reading offsetHeight: an unopened
  // popover is `display: none` and measures zero, which would always decide that
  // below fits. The trigger width goes into `--sx-tabmenu-tw` first for the same
  // reason — the min-width depends on it and width changes the height being read.
  function place() {
    if (!panel || !openTrigger) return;
    const t = openTrigger.getBoundingClientRect();
    if (supportsPopover) panel.style.setProperty('--sx-tabmenu-tw', `${t.width}px`);
    syncPopover(panel, true);
    const h = panel.offsetHeight;
    const vh = document.documentElement.clientHeight;
    const below = vh - t.bottom;
    up = below < h + 8 && t.top > below;
    if (!supportsPopover) return;
    // With `fixed`, both edges are viewport pixels; the group menu always
    // aligns to the trigger's start.
    panel.style.left = `${t.left}px`;
    if (up) { panel.style.bottom = `${vh - t.top}px`; panel.style.top = 'auto'; }
    else { panel.style.top = `${t.bottom}px`; panel.style.bottom = 'auto'; }
  }

  function chooseSub(s, i) {
    if (s.disabled) { setSub(i); return; }
    select(s.key);
    closeGroup(true);
  }

  function onPanelKey(e) {
    const k = e.key;
    if (k === 'Escape') { e.preventDefault(); e.stopPropagation(); closeGroup(true); return; }
    // Tab means Tab: close, then continue. `flushSync` is load-bearing — without
    // it the panel is still in the DOM when the browser computes where Tab goes,
    // so focus lands inside the vanishing menu and then drops on <body>.
    if (k === 'Tab') { closeGroup(true); flushSync(); return; }
    if (k === 'ArrowDown') { e.preventDefault(); stepSub(subActive, 1); return; }
    if (k === 'ArrowUp') { e.preventDefault(); stepSub(subActive, -1); return; }
    if (k === 'Home') { e.preventDefault(); edgeSub(false); return; }
    if (k === 'End') { e.preventDefault(); edgeSub(true); return; }
  }

  // Outside = not on the composed path. Inside a shadow root `e.target` at
  // document level is always the host, so `contains()` lies; the trigger and the
  // top-layer panel are separate nodes, so both are checked.
  function onOutside(e) {
    if (!openKey) return;
    const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
    if (path.includes(panel) || path.includes(openTrigger)) return;
    const here = panel?.getRootNode?.()?.activeElement ?? null;
    closeGroup(!!(here && panel?.contains(here)));
  }
  function onResize() { if (openKey) place(); }
  function onScroll() { if (openKey) place(); }

  $: if (typeof document !== 'undefined') {
    document.removeEventListener('pointerdown', onOutside, true);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('scroll', onScroll, true);
    if (openKey) {
      document.addEventListener('pointerdown', onOutside, true);
      window.addEventListener('resize', onResize);
      // In capture: `scroll` does not bubble, so only the way down from document
      // hears an inner container scroll. Passive because it never preventDefaults.
      if (supportsPopover) document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    }
  }

  onDestroy(() => {
    if (typeof document === 'undefined') return;
    document.removeEventListener('pointerdown', onOutside, true);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('scroll', onScroll, true);
  });
</script>

<div class="tabs">
  <div class="list" role="tablist" aria-label={label || undefined}>
    {#each items as t (t.key)}
      <!-- The arrow keys are bound on the TAB, not on the tablist: the listener
           belongs on the thing that has focus, and a keydown handler on a
           non-interactive container is a lint rule you end up silencing. -->
      <button
        type="button"
        role="tab"
        id={tabId(t.key)}
        class="tab"
        class:on={t.key === activeTopKey}
        class:group={isGroup(t)}
        aria-selected={t.key === activeTopKey}
        aria-controls={isGroup(t)
          ? (openKey === t.key ? `${uid}-m` : undefined)
          : (hasPanel ? `${uid}-p` : undefined)}
        aria-haspopup={isGroup(t) ? 'menu' : undefined}
        aria-expanded={isGroup(t) ? (openKey === t.key ? 'true' : 'false') : undefined}
        tabindex={isTabStop(t) ? 0 : -1}
        disabled={t.disabled || undefined}
        bind:this={btns[t.key]}
        on:keydown={(e) => onTabKeydown(e, t)}
        on:click={() => (isGroup(t) ? (openKey === t.key ? closeGroup(true) : openGroup(t, false)) : select(t.key))}
      >
        <span class="lb">{t.label}</span>
        {#if isGroup(t)}
          <svg class="cv" class:open={openKey === t.key} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true"><path d={CHEV} /></svg>
        {:else if t.count != null}
          <!-- The figure sits beside another figure in the next tab, so it is
               tabular: «7» and «11» have to line up or the eye cannot compare
               them at a glance. -->
          <span class="c sx-num">{t.count}</span>
        {/if}
      </button>
    {/each}
  </div>

  {#if openKey}
    <div
      class="menu"
      class:up
      class:fx={supportsPopover}
      popover={supportsPopover ? 'manual' : undefined}
      id="{uid}-m"
      role="menu"
      aria-label={openItem?.label}
      tabindex="-1"
      bind:this={panel}
      on:keydown={onPanelKey}
    >
      {#each subItems as s, i (s.key)}
        <button
          class="item"
          class:off={s.disabled}
          bind:this={subNodes[i]}
          type="button"
          role="menuitem"
          tabindex={i === subActive ? 0 : -1}
          aria-disabled={s.disabled ? 'true' : undefined}
          on:click={() => chooseSub(s, i)}
        >
          <span class="ml">{s.label}</span>
          {#if s.count != null}<span class="mc sx-num">{s.count}</span>{/if}
        </button>
      {/each}
    </div>
  {/if}

  {#if hasPanel}
    <!-- Focusable on purpose. A panel that is only a table of text has nothing
         to tab to, and without a tab stop a keyboard user arrives at the tab,
         presses Tab, and lands past the very thing the tab just revealed. -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="panel" id="{uid}-p" role="tabpanel" tabindex="0"
      aria-labelledby={activeTopKey != null ? tabId(activeTopKey) : undefined}>
      <slot {value} />
    </div>
  {/if}
</div>

<style>
  .tabs { display: flex; flex-direction: column; min-width: 0; }

  .list {
    display: flex;
    align-items: stretch;
    gap: var(--sx-s-1);
    min-width: 0;
    /* The rail the tabs sit on. Not a surface border — a divider that tells the
       unselected tabs where their edge is. */
    box-shadow: inset 0 -1px 0 var(--sx-line);
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: thin;
    scroll-padding-inline: var(--sx-s-4);
  }
  .list::-webkit-scrollbar { height: var(--sx-s-1); }
  .list::-webkit-scrollbar-thumb { background: var(--sx-edge); border-radius: var(--sx-r-pill); }

  .tab {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--sx-s-2);
    flex: none;
    padding: var(--sx-s-3) var(--sx-s-3);
    background: none;
    border: 0;
    border-radius: var(--sx-r-1) var(--sx-r-1) 0 0;
    color: var(--sx-ink-3);
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-semi);
    line-height: 1.2;
    white-space: nowrap;
    cursor: pointer;
    transition: color var(--sx-fast) var(--sx-ease), background var(--sx-fast) var(--sx-ease);
  }

  /* Igual que una fila de tabla: la pestaña bajo el cursor se ilumina con el
     acento, no se hunde en un gris. */
  .tab:hover:not(:disabled) { color: var(--sx-ink); background: var(--sx-accent-soft); }

  .tab.on { color: var(--sx-ink); }

  /* The selected mark is a bar in the accent, drawn OVER the rail. It is the
     only place a tab uses colour, and it never travels alone: the selected tab
     is also the only one in full ink and the only one carrying aria-selected. */
  .tab.on::after {
    content: '';
    position: absolute;
    inset-inline: var(--sx-s-2);
    bottom: 0;
    height: 2px;
    border-radius: var(--sx-r-pill);
    background: var(--sx-accent);
  }

  .tab:disabled {
    color: var(--sx-ink-3);
    opacity: .45;
    cursor: not-allowed;
  }

  /* The caret of a group tab. Turns when its menu is open, so «this one has more
     under it» and «it is open right now» read at a glance. */
  .cv {
    width: 14px;
    height: 14px;
    margin-inline-start: calc(-1 * var(--sx-s-1));
    color: var(--sx-ink-3);
    transition: transform var(--sx-fast) var(--sx-ease);
  }
  .cv.open { transform: rotate(180deg); }
  .tab.on .cv { color: var(--sx-ink-2); }

  .c {
    font-size: var(--sx-t-2xs);
    font-weight: var(--sx-w-medium);
    color: var(--sx-ink-3);
    background: var(--sx-sunk);
    padding: 1px var(--sx-s-2);
    border-radius: var(--sx-r-pill);
  }
  .tab.on .c { color: var(--sx-ink-2); background: var(--sx-neutral-band); }

  /* Repeated in-component because a Core in a shadow root never sees base.css.
     Inset, because an outline offset outwards on a tab is clipped by the
     tablist's own overflow. */
  .tab:focus-visible {
    outline: 2px solid var(--sx-ink);
    outline-offset: -2px;
    border-radius: var(--sx-r-1);
  }

  /* ── The group menu ─────────────────────────────────────────────────────── */
  /* Same top-layer machinery as Menu: `position: absolute` as the floor, `.fx`
     lifts it to `fixed` in the top layer when `popover` is supported. The six
     neutralising declarations undo the UA `[popover]` sheet (border, margin:auto,
     fit-content) so the box `place()` positions is the box that was styled. */
  .menu {
    position: absolute;
    top: calc(100% + var(--sx-s-1));
    left: 0;
    z-index: var(--sx-z-overlay);
    min-width: max(100%, 12ch);
    max-width: min(86vw, 32ch);
    padding: var(--sx-s-1);
    background: var(--sx-surface);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-3);
    max-height: min(60vh, 26rem);
    overflow-y: auto;
    overscroll-behavior: contain;
    margin: 0;
    border: 0;
    color: inherit;
    width: auto;
    height: auto;
    overflow-x: visible;
  }
  .menu.up { top: auto; bottom: calc(100% + var(--sx-s-1)); }
  .menu.fx {
    position: fixed;
    right: auto;
    bottom: auto;
    margin-top: var(--sx-s-1);
    min-width: max(var(--sx-tabmenu-tw, 0px), 12ch);
  }
  .menu.fx.up { margin-top: 0; margin-bottom: var(--sx-s-1); }

  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--sx-s-4);
    width: 100%;
    padding: var(--sx-s-2) var(--sx-s-3);
    background: transparent;
    border: 0;
    border-radius: var(--sx-r-1);
    color: var(--sx-ink);
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-medium);
    line-height: 1.2;
    text-align: start;
    white-space: nowrap;
    cursor: pointer;
    transition: background var(--sx-fast) var(--sx-ease);
  }
  .item:hover, .item:focus { background: var(--sx-accent-soft); outline: none; }
  .item:focus-visible {
    outline: 2px solid var(--sx-ink);
    outline-offset: -2px;
    border-radius: var(--sx-r-1);
  }
  .item.off { color: var(--sx-ink-3); cursor: not-allowed; }
  .item.off:hover { background: transparent; }

  .mc {
    font-size: var(--sx-t-2xs);
    font-weight: var(--sx-w-medium);
    color: var(--sx-ink-3);
    background: var(--sx-sunk);
    padding: 1px var(--sx-s-2);
    border-radius: var(--sx-r-pill);
  }

  .panel { padding-top: var(--sx-s-4); min-width: 0; }
  .panel:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: 2px; border-radius: var(--sx-r-1); }

  @media (pointer: coarse) {
    .tab { min-height: var(--sx-touch); padding-inline: var(--sx-s-4); }
    .item { min-height: var(--sx-touch); font-size: var(--sx-t-md); }
    .menu { min-width: max(100%, 26ch); }
    .menu.fx { min-width: max(var(--sx-tabmenu-tw, 0px), 26ch); }
  }

  @media (prefers-reduced-motion: reduce) {
    .tab, .cv, .item { transition: none; }
  }
</style>
