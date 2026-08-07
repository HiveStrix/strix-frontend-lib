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
  // requests.
  import { createEventDispatcher, tick } from 'svelte';

  /** [{ key, label, count?, disabled? }] */
  export let items = [];
  /** The selected key. Bindable. */
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

  let btns = {};       // key → the real button, so focus never goes through a selector
  let focusKey = null; // where the arrow keys are, when `manual`

  $: enabled = items.filter((t) => !t.disabled);
  // If the bound value names a tab that is gone (a filter removed it, the user
  // lost a permission), fall back rather than render a tablist with nothing
  // selected — a tablist with no selected tab has no keyboard entry point.
  $: if (items.length && !items.some((t) => t.key === value && !t.disabled)) {
    value = enabled[0]?.key;
  }
  $: hasPanel = !!$$slots.default;
  // `$:` so `value` and `focusKey` are in the dependency list of everything that
  // calls it. As a plain `const` the roving tabindex froze on the first tab.
  $: isTabStop = (t) => (manual ? (focusKey ?? value) === t.key : value === t.key);

  const tabId = (k) => `${uid}-t-${k}`;

  function select(key) {
    if (key === value) return;
    value = key;
    focusKey = key;
    dispatch('change', { key });
  }

  async function focusTab(key) {
    focusKey = key;
    await tick(); // the roving tabindex has to land before the focus does
    const el = btns[key];
    el?.focus();
    // `block: 'nearest'` because the tablist is what scrolls sideways; without
    // it, arrowing to the last tab yanks the whole page down to meet it.
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function onKeydown(e) {
    const keys = enabled.map((t) => t.key);
    if (!keys.length) return;
    const at = Math.max(0, keys.indexOf(manual ? (focusKey ?? value) : value));
    let next = null;

    if (e.key === 'ArrowRight') next = keys[(at + 1) % keys.length];
    else if (e.key === 'ArrowLeft') next = keys[(at - 1 + keys.length) % keys.length];
    else if (e.key === 'Home') next = keys[0];
    else if (e.key === 'End') next = keys[keys.length - 1];
    else if (manual && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      select(focusKey ?? value);
      return;
    } else return;

    e.preventDefault();
    if (!manual) select(next);
    focusTab(next);
  }
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
        class:on={t.key === value}
        aria-selected={t.key === value}
        aria-controls={hasPanel ? `${uid}-p` : undefined}
        tabindex={isTabStop(t) ? 0 : -1}
        disabled={t.disabled || undefined}
        bind:this={btns[t.key]}
        on:keydown={onKeydown}
        on:click={() => select(t.key)}
      >
        <span class="lb">{t.label}</span>
        {#if t.count != null}
          <!-- The figure sits beside another figure in the next tab, so it is
               tabular: «7» and «11» have to line up or the eye cannot compare
               them at a glance. -->
          <span class="c sx-num">{t.count}</span>
        {/if}
      </button>
    {/each}
  </div>

  {#if hasPanel}
    <!-- Focusable on purpose. A panel that is only a table of text has nothing
         to tab to, and without a tab stop a keyboard user arrives at the tab,
         presses Tab, and lands past the very thing the tab just revealed. -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="panel" id="{uid}-p" role="tabpanel" tabindex="0"
      aria-labelledby={value != null ? tabId(value) : undefined}>
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

  .tab:hover:not(:disabled) { color: var(--sx-ink); background: var(--sx-sunk); }

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

  .panel { padding-top: var(--sx-s-4); min-width: 0; }
  .panel:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: 2px; border-radius: var(--sx-r-1); }

  @media (pointer: coarse) {
    .tab { min-height: var(--sx-touch); padding-inline: var(--sx-s-4); }
  }

  @media (prefers-reduced-motion: reduce) {
    .tab { transition: none; }
  }
</style>
