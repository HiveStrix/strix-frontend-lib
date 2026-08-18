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
  // have to read as two clearly different rails — one narrow and icon-only,
  // one wide with labelled sections — or the screen reads as one long,
  // confusing corridor of two rails. (See point 1 below for how that
  // distinction survives now that both float.)
  //
  // HOW THE TWO STAY OUT OF EACH OTHER'S WAY
  //
  // Three separate decisions, not one clever trick:
  //
  //   1. DOS CARRILES FLOTANTES, DISTINTOS POR ANCHO Y CONTENIDO. Este archivo
  //      decía antes que los dos niveles se separaban por LEYES distintas —
  //      `SideRail` como contenido (luz, una tarjeta) y `Sidebar` como marco
  //      (una línea a ras del borde, sin radio ni sombra) — para que no se
  //      leyeran como «un corredor». El pedido que originó esta revisión pidió
  //      lo contrario: los DOS flotando, estilo Apple, tarjetas redondeadas
  //      con márgenes, llegando al fondo. Así que ahora los dos son el MISMO
  //      objeto flotante (radio grande, `--sx-e-1`), y lo que los mantiene sin
  //      leerse como un solo pasillo es lo que este sistema YA usaba de todos
  //      modos: `Sidebar` arranca colapsado a 64px de sólo íconos y `SideRail`
  //      mide 240px con encabezados de sección. Un carril de íconos angosto
  //      junto a uno ancho con etiquetas no se lee como el mismo control, aun
  //      sin una palabra en pantalla. El margen que los despega del borde y
  //      entre sí lo garantiza el layout del shell (ver el CONTRACT), no un
  //      borde que cada carril se dibuje encima.
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
  //
  // THE PHONE DRAWER, AND WHY IT IS NOT A SECOND ONE OF THOSE.
  //
  // 64px of icons is still a third of a 390px screen, and «collapsed» clips
  // the label — which is exactly what this whole system refuses to ship: an
  // icon with no word next to it. Below phone width `Sidebar` stops being a
  // column at all and becomes the CONTENT of `shell/Sheet.svelte`, the
  // drawer this library already has, already correct — trapped focus, an
  // owned Escape, focus handed back on close. Building a second drawer here
  // would leave the system with two things that open over a screen and
  // close on Escape, answering to two different pieces of code — the exact
  // defect this repo has spent all day correcting elsewhere. If Sheet were
  // missing something this needed, the fix would belong in Sheet; it was
  // not missing anything.
  //
  // WHERE THE BUTTON LIVES. `Sidebar` collapsed to a drawer draws NOTHING on
  // a phone screen — there is no icon rail left to hold a trigger. The
  // button that opens it has to live in `TopBar`, which is why `TopBar` grew
  // its own `nav` prop and `on:menu` (see that file). Two components, one
  // new piece of state: `open`, named to match Sheet's own prop because this
  // literally IS a Sheet underneath.
  //
  // ONE CONDITION, NOT TWO. `TopBar`'s button and this component's own
  // switch from column to drawer both have to agree on the SAME width, or
  // one of two broken screens exists somewhere in between: a button with no
  // drawer to open, or a drawer with no button to reach it. That is not a
  // hypothetical — it is the exact shape of bug `toplayer.js` already fixed
  // once for `popover` («LA CONDICIÓN NO SE PARTE», its own header), where
  // two components independently deciding the same thing was the defect,
  // not a detail. CSS cannot import a number, so the two `@media` rules
  // below and in `TopBar.svelte` both hardcode the same 560px by hand — but
  // it is not a new number invented for this: it is the one `Sheet`, `Toast`,
  // `Dialog`, `EmptyState`, `ErrorState`, `Pagination` and `ReviewPanel`
  // already use for «this is a phone». Reusing the system's own constant,
  // named `PHONE_BREAK` below so the two files can grep for each other, is
  // as close as two separate stylesheets get to reading one variable.
  //
  // CAN BE TURNED OFF. `drawer={false}` keeps `Sidebar` a fixed column
  // always — a product that never wants it to disappear (a kiosk, a tablet
  // permanently docked) says so with one prop, and `TopBar`'s `nav` simply
  // is not passed in that product, so no orphaned button exists either.
  //
  // CLOSES ON PICK. Selecting a module while the drawer is open and leaving
  // it open would cover the very screen the pick just opened — `pick()`
  // below sets `open = false` unconditionally; it is a no-op the rest of
  // the time, when there is no drawer to close.
  //
  // Importing `Sheet` is this file's first import from another family —
  // `nav/index.js`'s own header used to say «nothing here imports another
  // family» flatly; it now says why that changed, rather than going quietly
  // out of date. The item list itself (icon, label, count, aria-current,
  // the collapse geometry) is drawn once, by `SidebarItems.svelte` beside
  // this file — an internal piece, not exported — because Svelte 5 will not
  // let a component mix `<slot>` (this file's `header`/`footer`, part of the
  // public API) with `{#snippet}` in the same file, and this file needs to
  // draw that list TWICE: once in the fixed column, once inside the drawer.
  import { createEventDispatcher } from 'svelte';
  import Sheet from '../shell/Sheet.svelte';
  import SidebarItems from './SidebarItems.svelte';

  /** El mismo umbral de teléfono que ya usan Sheet/Toast/Dialog/EmptyState/
   *  ErrorState/Pagination/ReviewPanel — no uno nuevo. `TopBar.svelte` lo
   *  repite a mano en su propio `@media` (ver el comentario de arriba, «ONE
   *  CONDITION, NOT TWO», para por qué CSS no puede importar este número). */
  const PHONE_BREAK = 560;

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
  /** Below `PHONE_BREAK`, become a Sheet instead of a squeezed column. Off
   *  for a product that wants Sidebar fixed at every width — see the header. */
  export let drawer = true;
  /** The phone drawer's open state. Bindable, named like Sheet's own `open`
   *  because this content IS a Sheet below `PHONE_BREAK`. Wire it from
   *  wherever `TopBar`'s `on:menu` lives — see the header above. */
  export let open = false;

  const dispatch = createEventDispatcher();

  function pick(it, e) {
    if (it.disabled) { e.preventDefault(); return; }
    // Unconditional, not `if (open)`: cheaper to always write `false` than to
    // check first, and correct either way — see «CLOSES ON PICK» above.
    open = false;
    if (it.href) return;
    e.preventDefault();
    value = it.key;
    dispatch('select', { key: it.key, item: it });
  }
</script>

<!-- `data-phone-break` no hace nada por sí solo — CSS ya lo tiene grabado en
     el `@media` de abajo. Está en el marcado para que se pueda comprobar
     DESDE AFUERA (un script, una prueba) que este número y el que TopBar
     pone en su propio botón siguen siendo el mismo, sin tener que leer las
     dos hojas de estilo a ojo cada vez. -->
<nav class="side" class:tuck={collapsed} class:phoneable={drawer} aria-label={label} data-phone-break={PHONE_BREAK}>
  <SidebarItems {items} {value} {current} {collapsed} onPick={pick}>
    <svelte:fragment slot="header"><slot name="header" /></svelte:fragment>
    <svelte:fragment slot="footer"><slot name="footer" /></svelte:fragment>
  </SidebarItems>

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

{#if drawer}
  <Sheet side="left" bind:open title={label}>
    <div class="side phone">
      <SidebarItems {items} {value} {current} collapsed={false} phone onPick={pick}>
        <svelte:fragment slot="header"><slot name="header" /></svelte:fragment>
        <svelte:fragment slot="footer"><slot name="footer" /></svelte:fragment>
      </SidebarItems>
    </div>
  </Sheet>
{/if}

<style>
  .side {
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-2);
    /* Expanded, the same 240px SideRail uses — the two levels sharing one
       figure is what lets a person read them as one system. */
    width: calc(var(--sx-s-20) * 3);
    flex: none;
    /* CARRIL DESPRENDIDO, DE ALTURA COMPLETA — ver «DOS CARRILES FLOTANTES»
       en la cabecera. Se estira a la altura de su columna (`align-self:
       stretch`, el default de una fila `align-items: stretch`) para llegar al
       fondo, y `max-height: 100%` + `min-height: 0` mandan cualquier desborde
       a su propio scroll interno (la lista, en SidebarItems) en vez de
       estirar la pantalla. El margen que lo separa del borde y del carril
       vecino es trabajo del layout del shell, no de este componente: ver el
       CONTRACT. */
    align-self: stretch;
    max-height: 100%;
    min-height: 0;
    padding: var(--sx-s-3);
    /* TARJETA, COMO SIDERAIL. Antes era un marco a ras (una línea, sin radio)
       para diferenciarse del carril-contenido de al lado; el pedido unificó
       los dos al mismo objeto flotante y ahora se distinguen por lo que el
       sistema YA usaba de todos modos — este arranca colapsado a 64px de sólo
       íconos, SideRail mide 240px con encabezados de sección. Radio grande +
       la elevación de tarjeta (`--sx-e-1`), la misma que SideRail. */
    background: var(--sx-surface);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-1);
    transition: width var(--sx-beat) var(--sx-ease);
  }

  .tuck { width: var(--sx-s-16); }

  /* EL CAJÓN DE TELÉFONO no es un marco — es contenido DENTRO del panel de
     Sheet, que ya trae su propio padding y su propio fondo (ver `.body` en
     Sheet.svelte). Repetirlos acá encima sería padding doble y un fondo
     pintado sobre otro fondo. Ancho `100%` en vez del 240px fijo: el panel
     de Sheet ya decide cuánto mide, no esta clase. */
  .side.phone {
    width: 100%;
    height: auto;
    max-height: none;
    padding: 0;
    background: none;
    /* Adentro del Sheet no es una tarjeta: es contenido del panel, que ya
       trae su fondo, su radio y su elevación. Se resetean los tres. */
    border-radius: 0;
    box-shadow: none;
  }

  /* Oculto bajo PHONE_BREAK cuando `drawer` está prendido — la mitad de la
     condición única que describe el header de este archivo. La otra mitad
     vive en TopBar.svelte, sobre el mismo número. `display:none`, no
     `visibility`: saca la columna del orden de tabulación también, así que
     un Tab desde el buscador de arriba no puede aterrizar en un ítem que ni
     siquiera se ve. */
  @media (max-width: 560px) {
    .side.phoneable { display: none; }
  }

  /* `ul`/`.sect`/`.it`/`.ic`/`.ini`/`.lb`/`.n`/`.head`/`.foot` — todo lo que
     dibuja un ÍTEM, incluida la geometría de `.tuck` sobre ellos — vive en
     `SidebarItems.svelte` ahora, no acá. Lo que queda en este archivo es
     sólo el MARCO (`.side`, su ancho, su cajón de teléfono) y el interruptor
     de colapso, que sigue siendo de `Sidebar`, no de la lista. */

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

  .tog:focus-visible {
    outline: 2px solid var(--sx-ink);
    outline-offset: -2px;
    border-radius: var(--sx-r-2);
  }

  @media (pointer: coarse) {
    .tog { min-height: var(--sx-touch); }
  }

  @media (prefers-reduced-motion: reduce) {
    .side, .tog, .tog svg { transition: none; }
  }

  /* COLLAPSES FOR REAL, NOT JUST BY DEFAULT. `collapsed` is a starting point a
     product can override — a tenant that expands it deliberately should not
     have a 240px column reappear the moment a tablet is turned sideways. So
     the icon-only WIDTH is forced here, unconditionally, past the point
     where a full rail stops being furniture and starts being the screen —
     the matching forced geometry for the ITEMS inside it lives in
     `SidebarItems.svelte`'s own `@media`, guarded the same way.
     `:not(.phone)`: below 560px `.phoneable` is already `display:none` and
     this would be forcing icon-only width on a column nobody can see, but
     the range 561–640px still needs it, AND the phone drawer's OWN copy
     (`.side.phone`, inside Sheet) must never narrow — it is already the
     whole screen; there is no width left to save by narrowing it. */
  @media (max-width: 640px) {
    .side:not(.phone) { width: var(--sx-s-16); }
  }
</style>
