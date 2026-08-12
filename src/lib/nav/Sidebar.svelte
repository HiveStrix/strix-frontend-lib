<script>
  // SIDEBAR — the first level of navigation: which MODULE am I in.
  //
  // WHY THIS FILE IS DATED TODAY AND NOT WHEN THE REST OF `nav` WAS BUILT
  //
  // `SideRail.svelte` has said, since it was written, that it is the SECOND
  // level — «the Hivestrix Shell already owns the first one, its own 240px
  // sidebar». That was a real division of labour once: the Shell would carry
  // its own chrome, this library would carry what lived inside a module. Then
  // the ecosystem decided on ONE identity instead of a Shell-shaped one and a
  // library-shaped one, and the Shell's chrome was never rebuilt on top of
  // this system — so the first level of navigation stopped existing anywhere
  // a person could point at. Not broken: absent. `SideRail`'s own header has
  // been updated to say so; this file is what fills the hole it named.
  //
  //   <Sidebar bind:value={modulo} label="Módulos" items={[
  //     { key: 'mantenimiento', label: 'Mantenimiento', icon: ICONS.wrench },
  //     { key: 'facturacion',   label: 'Facturación',   icon: ICONS.file, count: 3 },
  //     { key: 'inventario',    label: 'Inventario',    icon: ICONS.box }
  //   ]} on:select={(e) => go(e.detail.key)} />
  //
  // NOT A REPLACEMENT FOR SIDERAIL — THE LEVEL ABOVE IT
  //
  // `Sidebar` answers «¿en qué módulo estoy?»; `SideRail`, beside it, answers
  // «¿en qué sección del módulo estoy?». A tenant with three active modules
  // and a module with five sections needs BOTH on screen at once, and they
  // have to read as two different kinds of thing or the screen reads as one
  // long, confusing corridor of two rails.
  //
  // HOW THE TWO STAY OUT OF EACH OTHER'S WAY
  //
  // Three separate decisions, not one clever trick:
  //
  //   1. DIFFERENT LAW OF SEPARATION. Card and PageHeader already wrote the
  //      rule: a surface leaves its background by light, by line or by tone —
  //      never by all three at once, or a screen has three ideas of what a
  //      surface is. `SideRail` is CONTENT — it floats within the padded
  //      column, so it separates the way content does, with light (`--sx-e-1`,
  //      a card). `Sidebar` is FRAME — it is flush against the actual edge of
  //      the screen, the same kind of object `TopBar` is, so it separates the
  //      way frame does, with a line (`border-inline-end`, no shadow, no
  //      radius on the edge that touches the glass). Even in a screenshot with
  //      no words in it, a floating card and a flush panel do not read as the
  //      same idea.
  //   2. COLLAPSED BY DEFAULT. A 240px rail beside another 240px rail is 480px
  //      before a single row of content — the exact corridor `SideRail`'s own
  //      header warns a SECOND full-height sidebar would build, one level up.
  //      `Sidebar` defaults to the icon-only width (`--sx-s-16`, 64px, the
  //      same figure `SideRail` collapses to) precisely so the common case —
  //      both levels on screen together — never has to fight for the column.
  //      `collapsible` still opens it to the full 240px when a tenant has
  //      enough modules that the icons alone stop being enough.
  //   3. THE SAME ITEM GRAMMAR, ON PURPOSE. The row with an icon, a count that
  //      stays a figure when collapsed, and a two-step active state
  //      (`--sx-accent-soft` passing, `--sx-accent-pick` persisting) is
  //      `SideRail`'s own solved pattern, copied rather than reinvented — see
  //      its header for why the ladder exists and why a coloured edge on top
  //      of it was tried once and removed (`fcf3236`, and once more inside
  //      this same effort). Two levels that speak two different grammars would
  //      teach two vocabularies for «this is where you are»; two levels that
  //      speak the same one read as ONE system with two floors, which is what
  //      they are.
  //
  // ACTIVE IS A THIRD SIGNAL BEYOND COLOUR, SAME AS SIDERAIL — twice over. The
  // house rule («the active section is never said with colour alone») has to
  // hold at BOTH nested levels or the inner one quietly breaks it. Here the
  // fill (`accent-pick`) is joined by a bolder icon stroke — a SHAPE change
  // that survives the collapsed, icon-only state this component defaults to,
  // which `font-weight` alone (SideRail's own third signal) cannot do once the
  // label is clipped — plus `aria-current`, always.
  //
  // COLLAPSING CLIPS THE LABEL, NEVER REMOVES IT — identical reasoning to
  // SideRail: the label IS the accessible name in both states, so there is
  // nothing to keep in sync with a hand-written `aria-label`.
  import { createEventDispatcher } from 'svelte';

  /** [{ key, label, icon?, count?, disabled?, href? }] or { kind:'section', label } */
  export let items = [];
  /** The selected module's key. Bindable. */
  export let value = '';
  /** Names the landmark. Two navs on a page must not both be «Navegación». */
  export let label = 'Módulos';
  /** Icons only. Defaults ON — see «COLLAPSED BY DEFAULT» above. */
  export let collapsed = true;
  /** Render the expand/collapse toggle. */
  export let collapsible = true;
  /** 'page' when picking a module changes route; 'true' when it swaps a view. */
  export let current = 'page';

  const dispatch = createEventDispatcher();

  // `$:` so `value` lands in every statement's dependency list — a plain
  // `const` would stick on whatever was selected at mount, the exact bug
  // SideRail's own header warns this ecosystem has shipped three times.
  $: isOn = (it) => it.key != null && it.key === value;

  function pick(it, e) {
    if (it.disabled) { e.preventDefault(); return; }
    if (it.href) return;
    e.preventDefault();
    value = it.key;
    dispatch('select', { key: it.key, item: it });
  }

  const initial = (s) => (s ?? '').trim().charAt(0).toUpperCase();

  // Same reasoning as SideRail's own `activate`: the compiler cannot see
  // which tag `<svelte:element>` resolves to, so it asks for an explicit
  // role — but the only two possible tags, <a href> and <button>, already
  // carry the right one, so the listener moves instead of the semantics.
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

<nav class="side" class:tuck={collapsed} aria-label={label}>
  {#if $$slots.header}
    <div class="head"><slot name="header" /></div>
  {/if}

  <ul>
    {#each items as it, i (it.key ?? `s-${i}`)}
      {#if it.kind === 'section'}
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
  .side {
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-2);
    /* Expanded, the same 240px SideRail uses — the two levels sharing one
       figure is what lets a person read them as one system. */
    width: calc(var(--sx-s-20) * 3);
    height: 100%;
    flex: none;
    padding: var(--sx-s-3);
    /* FRAME, NOT CONTENT — see «HOW THE TWO STAY OUT OF EACH OTHER'S WAY» in
       the header. No radius, no shadow: a line on the one edge that borders
       the content column is the whole separation, the same mechanism
       PageHeader's `sarion` variant uses for the identical reason. */
    background: var(--sx-surface);
    border-inline-end: 1px solid var(--sx-line);
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

  .it:hover:not(.dis) { background: var(--sx-accent-soft); color: var(--sx-ink); }

  /* Elegido: relleno persistente (accent-pick, ya medido en el arnés) + tinta
     plena + semibold + aria-current — el mismo escalón de dos pasos que
     SideRail, sin cantos: ese arreglo ya se hizo una vez en esta misma
     tarea (ver SideRail.svelte) y no hacía falta reinventarlo mal dos veces
     en el mismo commit. La CUARTA señal, la que SideRail no necesita porque
     no vive colapsado por defecto: el trazo del ícono se engrosa (2.3 en vez
     de 1.7), una diferencia de FORMA que sigue viéndose cuando la etiqueta
     está recortada. */
  .it.on {
    background: var(--sx-accent-pick);
    color: var(--sx-ink);
    font-weight: var(--sx-w-semi);
  }
  .it.on .ic svg { stroke-width: 2.3; }

  .it.dis { opacity: .45; cursor: not-allowed; }

  .ic { display: flex; align-items: center; justify-content: center; flex: none; width: 20px; height: 20px; }
  .ic svg { width: 20px; height: 20px; transition: stroke-width var(--sx-fast) var(--sx-ease); }
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

  /* THE COLLAPSE — identical mechanism to SideRail's, and it has to be: a
     person moving between the two levels should not learn a second way a
     label can hide. */
  .tuck .it { justify-content: center; padding-inline: 0; position: relative; }
  .tuck .lb {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip-path: inset(50%); white-space: nowrap; border: 0;
  }
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

  .it:focus-visible, .tog:focus-visible {
    outline: 2px solid var(--sx-ink);
    outline-offset: -2px;
    border-radius: var(--sx-r-2);
  }

  @media (pointer: coarse) {
    .it, .tog { min-height: var(--sx-touch); }
  }

  @media (prefers-reduced-motion: reduce) {
    .side, .it, .tog, .tog svg, .ic svg { transition: none; }
  }

  /* COLLAPSES FOR REAL, NOT JUST BY DEFAULT. `collapsed` is a starting point a
     product can override — a tenant that expands it deliberately should not
     have a 240px column reappear the moment a tablet is turned sideways. So
     the icon-only geometry is forced here, unconditionally, past the point
     where a full rail stops being furniture and starts being the screen:
     every declaration below repeats `.tuck`'s, not `.tuck` itself, because
     `collapsed` may well be `false` here and the class along with it. */
  @media (max-width: 640px) {
    .side { width: var(--sx-s-16); }
    .it { justify-content: center; padding-inline: 0; position: relative; }
    .lb {
      position: absolute; width: 1px; height: 1px;
      padding: 0; margin: -1px; overflow: hidden;
      clip-path: inset(50%); white-space: nowrap; border: 0;
    }
    .n {
      position: absolute;
      inset-block-start: var(--sx-s-1);
      inset-inline-end: var(--sx-s-2);
      padding: 0 var(--sx-s-1);
      line-height: 1.4;
    }
    .sect { padding-inline: 0; text-align: center; overflow: hidden; }
  }
</style>
