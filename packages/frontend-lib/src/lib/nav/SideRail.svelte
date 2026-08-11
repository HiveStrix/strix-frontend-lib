<script>
  // SIDE RAIL — the sections of a module, always visible, never in the way.
  //
  // WHAT IT IS FOR, AND WHAT IT IS NOT
  //
  // This is the SECOND level of navigation. The Hivestrix Shell already owns the
  // first one — its own 240px sidebar, which is how somebody gets from
  // mantenimiento to facturación. A module that draws a second full-height
  // sidebar beside it has built a corridor. So a rail belongs to a module with
  // genuinely separate sections that people move between all day (Flota ·
  // Documentos · Catálogos · Indicadores), and it is the wrong control for:
  //
  //   · Two or three sections → Tabs. A rail costs a whole column of width to
  //     say what a tab bar says in a strip.
  //   · A wizard → those are steps, they are ordered, and you cannot jump to
  //     step 4. That is a different component with a different promise.
  //   · A page under ~700px of content column. There is no room, and the honest
  //     answer at that width is Tabs, not a rail squeezed to icons nobody reads.
  //
  //   <SideRail bind:value label="Secciones" collapsible bind:collapsed items={[
  //     { kind: 'section', label: 'Operación' },
  //     { key: 'flota',      label: 'Flota',       icon: ICONS.truck },
  //     { key: 'documentos', label: 'Documentos',  icon: ICONS.doc, count: 7 },
  //     { kind: 'section', label: 'Configuración' },
  //     { key: 'catalogos',  label: 'Catálogos',   icon: ICONS.box }
  //   ]} on:select={(e) => go(e.detail.key)} />
  //
  // THE COLLAPSED STATE, AND THE ONE DETAIL EVERYBODY GETS WRONG
  //
  // Collapsing hides the label VISUALLY — it does not remove it. If the label
  // were `display:none`, the button's accessible name would go with it and the
  // whole rail would read as a row of unnamed buttons to a screen reader; the
  // usual patch is an `aria-label`, which then has to be kept in sync with the
  // visible text forever. Here the label is always in the DOM and is simply
  // clipped, so the name is the text, in both states, with nothing to keep in
  // sync. The `title` gives the sighted mouse user the tooltip.
  //
  // A COUNT STAYS A FIGURE WHEN COLLAPSED. The tempting move is a coloured dot,
  // and a dot is colour travelling alone with no word and no number attached.
  // «7» is smaller than a label and says more.
  //
  // ICONS: pass `icon` as an SVG path `d` on a 24×24 grid. This family does not
  // ship an icon set — that belongs to whoever owns iconography — and a rail
  // without icons still works: collapsed, an item falls back to its own first
  // letter.
  import { createEventDispatcher } from 'svelte';

  /** [{ key, label, icon?, count?, disabled?, href? }] or { kind:'section', label } */
  export let items = [];
  /** The selected key. Bindable. */
  export let value = '';
  /** Names the landmark. Two navs on a page must not both be «Navegación». */
  export let label = 'Secciones';
  /** Icons only. The labels stay in the DOM — see above. */
  export let collapsed = false;
  /** Render the collapse toggle. The state still lives with the consumer. */
  export let collapsible = false;
  /** 'page' when the rail changes route; 'true' when it swaps a view in place. */
  export let current = 'page';

  const dispatch = createEventDispatcher();

  // `$:` so `value` lands in the dependency list of every statement that calls
  // it. As a `const` the selected item would stick on whatever was selected at
  // mount — the exact bug this ecosystem has shipped three times.
  $: isOn = (it) => it.key != null && it.key === value;

  function pick(it, e) {
    if (it.disabled) { e.preventDefault(); return; }
    if (it.href) return; // let the browser do what the browser is for
    e.preventDefault();
    value = it.key;
    dispatch('select', { key: it.key, item: it });
  }

  const initial = (s) => (s ?? '').trim().charAt(0).toUpperCase();

  // The click is attached from JS rather than as `on:click` on the
  // <svelte:element>. The compiler cannot see which tag the element resolves
  // to, so it assumes the worst and asks for an explicit ARIA role — but the
  // only two tags it can be, <a href> and <button>, already carry the right
  // role and already fire `click` from Enter (and Space, on the button). Adding
  // `role="button"` to a real <button> to quiet a linter is how aria stops
  // meaning anything, so the listener moves instead of the semantics.
  function activate(node, it) {
    let item = it;
    const onclick = (e) => pick(item, e);
    node.addEventListener('click', onclick);
    return {
      update: (next) => (item = next),
      destroy: () => node.removeEventListener('click', onclick)
    };
  }
</script>

<nav class="rail" class:tuck={collapsed} aria-label={label}>
  {#if $$slots.header}
    <div class="head"><slot name="header" /></div>
  {/if}

  <ul>
    {#each items as it, i (it.key ?? `s-${i}`)}
      {#if it.kind === 'section'}
        <!-- A heading, not a group role: the rail is one list and splitting it
             into nested groups would make a screen reader announce a level of
             structure that is only a visual pause. -->
        <li class="sect"><span class="sx-cap">{it.label}</span></li>
      {:else}
        <li>
          <svelte:element
            this={it.href ? 'a' : 'button'}
            class="it"
            class:on={isOn(it)}
            class:dis={it.disabled}
            href={it.href || undefined}
            type={it.href ? undefined : 'button'}
            tabindex={it.disabled ? -1 : 0}
            aria-current={isOn(it) ? current : undefined}
            aria-disabled={it.disabled ? 'true' : undefined}
            title={it.label}
            use:activate={it}
          >
            <span class="ic" aria-hidden="true">
              {#if it.icon}
                <svg viewBox="0 0 24 24"><path d={it.icon} fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" /></svg>
              {:else}
                <span class="ini">{initial(it.label)}</span>
              {/if}
            </span>

            <!-- Clipped, never removed: this text IS the accessible name. -->
            <span class="lb">{it.label}</span>

            {#if it.count != null}
              <span class="n sx-num">{it.count}</span>
            {/if}
          </svelte:element>
        </li>
      {/if}
    {/each}
  </ul>

  {#if $$slots.footer}
    <div class="foot"><slot name="footer" /></div>
  {/if}

  {#if collapsible}
    <button class="tog" type="button" aria-expanded={!collapsed}
      on:click={() => { collapsed = !collapsed; dispatch('toggle', { collapsed }); }}>
      <svg viewBox="0 0 12 12" aria-hidden="true" class:flip={collapsed}>
        <path d="M7.4 2.4 3.8 6l3.6 3.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span class="lb">{collapsed ? 'Expandir' : 'Contraer'}</span>
    </button>
  {/if}
</nav>

<style>
  .rail {
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-2);
    /* 240px — the same width the Shell's own sidebar uses, so a rail beside it
       reads as a second column and not as a different idea. */
    width: calc(var(--sx-s-20) * 3);
    flex: none;
    padding: var(--sx-s-3);
    background: var(--sx-surface);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-1);
    transition: width var(--sx-beat) var(--sx-ease);
  }

  .tuck { width: var(--sx-s-16); }

  ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }

  .sect { padding: var(--sx-s-3) var(--sx-s-3) var(--sx-s-1); }
  .tuck .sect { padding-inline: 0; text-align: center; overflow: hidden; }

  .it {
    display: flex;
    align-items: center;
    gap: var(--sx-s-3);
    width: 100%;
    min-height: var(--sx-s-10);
    padding: var(--sx-s-2) var(--sx-s-3);
    border: 0;
    border-radius: var(--sx-r-2);
    background: none;
    color: var(--sx-ink-2);
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-medium);
    text-align: start;
    text-decoration: none;
    cursor: pointer;
    transition: background var(--sx-fast) var(--sx-ease), color var(--sx-fast) var(--sx-ease);
  }

  /* El mismo tinte que .it.on usa para «seleccionado» (ver más abajo):
     bajo el cursor el ítem se ilumina con el acento, no se hunde en gris. */
  .it:hover:not(.dis) { background: var(--sx-accent-soft); color: var(--sx-ink); }

  /* Selected is a soft accent fill plus full ink plus aria-current. Three
     signals, none of which is only colour. */
  .it.on {
    background: var(--sx-accent-soft);
    color: var(--sx-ink);
    font-weight: var(--sx-w-semi);
  }

  .it.dis { opacity: .45; cursor: not-allowed; }

  .ic { display: flex; align-items: center; justify-content: center; flex: none; width: 20px; height: 20px; }
  .ic svg { width: 20px; height: 20px; }
  .ini {
    display: flex; align-items: center; justify-content: center;
    width: 20px; height: 20px;
    border-radius: var(--sx-r-1);
    background: var(--sx-sunk);
    font-size: var(--sx-t-2xs);
    font-weight: var(--sx-w-semi);
    line-height: 1;
  }

  .lb { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .n {
    flex: none;
    font-size: var(--sx-t-2xs);
    font-weight: var(--sx-w-semi);
    color: var(--sx-ink-3);
    background: var(--sx-sunk);
    border-radius: var(--sx-r-pill);
    padding: 1px var(--sx-s-2);
  }
  .it.on .n { color: var(--sx-ink-2); background: var(--sx-surface); }

  /* THE COLLAPSE. The label is clipped, not removed — the accessible name has
     to survive, and an aria-label that duplicates visible text is one more
     string to keep honest. */
  .tuck .it { justify-content: center; padding-inline: 0; position: relative; }
  .tuck .lb {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip-path: inset(50%); white-space: nowrap; border: 0;
  }
  /* A figure, never a dot: a dot is colour with nothing to read. */
  .tuck .n {
    position: absolute;
    inset-block-start: var(--sx-s-1);
    inset-inline-end: var(--sx-s-2);
    padding: 0 var(--sx-s-1);
    line-height: 1.4;
  }

  .head, .foot { padding: var(--sx-s-2) var(--sx-s-3); min-width: 0; }
  .foot { margin-top: auto; }

  .tog {
    display: flex;
    align-items: center;
    gap: var(--sx-s-2);
    justify-content: center;
    min-height: var(--sx-s-8);
    margin-top: var(--sx-s-1);
    border: 0;
    border-radius: var(--sx-r-2);
    background: var(--sx-sunk);
    color: var(--sx-ink-3);
    font-size: var(--sx-t-xs);
    font-weight: var(--sx-w-semi);
    cursor: pointer;
    transition: color var(--sx-fast) var(--sx-ease);
  }
  .tog:hover { color: var(--sx-ink); }
  .tog svg { width: 12px; height: 12px; transition: transform var(--sx-beat) var(--sx-ease); }
  .tog svg.flip { transform: rotate(180deg); }

  /* Repeated in-component: base.css does not cross a shadow boundary. */
  .it:focus-visible, .tog:focus-visible {
    outline: 2px solid var(--sx-ink);
    outline-offset: -2px;
    border-radius: var(--sx-r-2);
  }

  @media (pointer: coarse) {
    .it, .tog { min-height: var(--sx-touch); }
  }

  @media (prefers-reduced-motion: reduce) {
    .rail, .it, .tog, .tog svg { transition: none; }
  }
</style>
