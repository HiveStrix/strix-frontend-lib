<script>
  // SIDE RAIL — the sections of a module, always visible, never in the way.
  //
  // WHAT IT IS FOR, AND WHAT IT IS NOT
  //
  // This is the SECOND level of navigation. For a long time this header said
  // the first one belonged to the Hivestrix Shell — its own 240px sidebar,
  // built outside this system. That was the plan back when the Shell was
  // going to carry its own chrome; the ecosystem later settled on ONE
  // identity instead, the Shell's chrome was never rebuilt to match, and the
  // claim sat here describing a component that did not exist anywhere. It
  // does now: `Sidebar.svelte`, right beside this file, is the first level —
  // which module a tenant is in — and the two are meant to stand side by
  // side without reading as the same idea twice; see Sidebar's own header for
  // how. A module that draws a second full-height sidebar with NOTHING above
  // it has still built a corridor, so a rail belongs to a module with
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
  //   import { GLYPH_PATHS } from '@strix/frontend-lib';
  //
  //   <SideRail bind:value label="Secciones" collapsible bind:collapsed items={[
  //     { kind: 'section', label: 'Operación' },
  //     { key: 'flota',      label: 'Flota',       icon: GLYPH_PATHS.truck },
  //     { key: 'documentos', label: 'Documentos',  icon: GLYPH_PATHS.file, count: 7 },
  //     { kind: 'section', label: 'Configuración' },
  //     { key: 'catalogos',  label: 'Catálogos',   icon: GLYPH_PATHS.box }
  //   ]} on:select={(e) => go(e.detail.key)} />
  //
  //   `icon` es un path SVG crudo en la grilla 16×16 de Glyph.svelte; los del
  //   sistema viven en GLYPH_PATHS (no existe ningún export `ICONS`).
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
  // ICONS: pass `icon` as an SVG path `d`, and it has to be drawn against
  // whatever `GLYPH_VIEWBOX` (Glyph.svelte) says — today 16×16, `GLYPH_PATHS`'
  // own grid. This family does not ship an icon set — that belongs to
  // whoever owns iconography — and a rail without icons still works:
  // collapsed, an item falls back to its own first letter. THIS FILE USED TO
  // SAY «a 24×24 grid» and hardcode `viewBox="0 0 24 24"` below, from before
  // `Glyph` existed. `GLYPH_PATHS.wrench` and friends are 16-grid paths, so
  // every icon this catalogue ever fed it (`Estructura.svelte`) landed
  // small and shoved into the top-left corner of its own box — drawn, just
  // not where anyone would see it drawn right. Fixed at the root: this file
  // imports the SAME `GLYPH_VIEWBOX` `Glyph.svelte` uses instead of
  // repeating a number that was never this file's to own.
  import { createEventDispatcher } from 'svelte';
  import { GLYPH_VIEWBOX } from '../shell/Glyph.svelte';

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
                <svg viewBox={GLYPH_VIEWBOX}><path d={it.icon} fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" /></svg>
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
    /* 240px — the same figure Sidebar expands to, so the two levels read as
       one system with two floors instead of two different ideas. */
    width: calc(var(--sx-s-20) * 3);
    flex: none;
    /* LLEGA AL FONDO, NO SE CORTA EN EL AIRE. Un carril desprendido que mide
       sólo lo que miden sus ítems flota más corto que la columna de contenido
       de al lado y se lee inacabado. Con `align-self: stretch` (el default de
       una fila `align-items: stretch`) se estira a la altura de su columna;
       `max-height: 100%` + `min-height: 0` dejan que, si un shell de altura
       fija es más bajo que la lista, el desborde caiga DENTRO del carril (ver
       `ul`, más abajo) en vez de empujar la fila. Donde el contenedor no fija
       altura, la fila mide lo del hijo más alto y el carril nunca queda más
       corto que su propio contenido: no se recorta ningún ítem. */
    align-self: stretch;
    max-height: 100%;
    min-height: 0;
    padding: var(--sx-s-3);
    background: var(--sx-surface);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-1);
    transition: width var(--sx-beat) var(--sx-ease);
  }

  .tuck { width: var(--sx-s-16); }

  /* La lista toma el alto que sobra y, sólo si un shell la aprieta, hace su
     propio scroll — así el pie/toggle quedan fijos abajo cuando el carril se
     estira, y una lista larga se desliza DENTRO del carril en vez de estirar
     la pantalla. `min-height: 0` es lo que habilita ese scroll en un hijo flex. */
  ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; flex: 1 1 auto; min-height: 0; overflow-y: auto; }

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

  /* Bajo el cursor el ítem se ilumina con el acento, no se hunde en gris —
     con --sx-accent-soft (10 %), el relleno pasajero. Seleccionado (ver más
     abajo) usa un relleno propio, más fuerte, porque persiste. */
  .it:hover:not(.dis) { background: var(--sx-accent-soft); color: var(--sx-ink); }

  /* Elegido es --sx-accent-pick (18 %, persistente) más tinta plena, más
     semibold, más aria-current. Tres señales sin contar el color, que es la
     regla de la casa.
     LLEVÓ UN CANTO DE ACENTO Y SE QUITÓ. Era `inset 2px 0 0` sobre un elemento
     con esquina redondeada, y una sombra interior sigue la curva: el canto no
     se dibujaba como una barra sino como un PARÉNTESIS. Este repo ya lo había
     arreglado una vez en otra dirección (fcf3236) y se reintrodujo acá sin
     mirarlo en pantalla.
     Además era vestigial: existía de cuando hover y elegido compartían relleno
     y hacía falta una segunda señal. La escalera de dos niveles —soft para lo
     pasajero, pick para lo persistente— resolvió eso bien, y el arnés mide que
     los dos se distingan. El canto no agregaba nada y rompía la forma. */
  .it.on {
    background: var(--sx-accent-pick);
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
