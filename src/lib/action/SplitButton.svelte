<script>
  // SPLITBUTTON — one action, said out loud, plus its variations behind a seam.
  //
  // THE RULE THAT MAKES IT LEGITIMATE: everything in the menu must be a VARIANT
  // OF THE SAME ACT as the button beside it. «Exportar CSV» with «Exportar PDF»
  // and «Exportar solo lo filtrado» underneath — yes, they are three ways to do
  // one thing. «Guardar» with «Eliminar» underneath — no. Welding two buttons
  // together is a claim that pressing the wrong half is a small mistake, and the
  // day somebody's thumb lands 4mm off, that claim has to still be true.
  //
  //   <SplitButton variant="solid" label="Exportar CSV"
  //     items={[
  //       { id: 'pdf',  label: 'Exportar PDF' },
  //       { id: 'view', label: 'Exportar solo lo filtrado', hint: '18' }
  //     ]}
  //     on:click={csv} on:select={(e) => run(e.detail.id)} />
  //
  // The two halves are one `role="group"` with one name, so a screen reader
  // announces «Exportar, grupo» and then the two controls inside it, instead of
  // «botón, botón» with no relationship between them.
  //
  // WHEN NOT TO USE IT
  //
  // When the default is not obviously the commonest choice. A split button
  // spends the main half on a guess; if the guess is wrong more than
  // occasionally, people learn to open the menu every time and you have shipped
  // a menu with a decoy attached to it. Use a plain Menu, or two Buttons.
  //
  // Also not for a destination. Splitting a link is a promise the browser does
  // not keep — middle click, open in new tab, and the copy-link menu item all
  // belong to the <a>, not to the half beside it.
  import Button from './Button.svelte';
  import Menu from './Menu.svelte';

  /** The primary action's words. Also the default slot's fallback. */
  export let label = '';
  /** The variations. Same shape as Menu's items. */
  export let items = [];
  /** solid | outline | ghost | danger */
  export let variant = 'solid';
  /** sm | md | lg */
  export let size = 'md';
  export let type = 'button';
  export let disabled = false;
  export let reason = '';
  export let busy = false;
  /** Names the pair for a screen reader. Defaults to the primary's own words. */
  export let groupLabel = '';
  /** The chevron half's accessible name. It must say WHAT MORE, not «más». */
  export let menuLabel = '';
  /** start | end — which edge the panel lines up with. */
  export let align = 'end';
  /** Bindable: whether the variations are showing. */
  export let open = false;

  const CHEV = '<path d="M5 9.5 12 16.5 19 9.5"/>';

  $: gname = groupLabel || label;
  // «Más opciones» alone is a name that tells a blind user nothing about which
  // of the four buttons on this toolbar they just landed on.
  $: mname = menuLabel || (label ? `Más opciones de ${label.toLocaleLowerCase('es')}` : 'Más opciones');
</script>

<div class="split {variant} {size}" role="group" aria-label={gname}>
  <span class="lead">
    <!-- Forwarded conditionally rather than always: a slot that is declared but
         empty still counts as filled, and Button would then spend a gap on
         nothing before the label. The branch asks the question once, here, where
         the answer is actually known. -->
    {#if $$slots.icon}
      <Button {variant} {size} {type} {disabled} {reason} {busy} on:click>
        <svelte:fragment slot="icon"><slot name="icon" /></svelte:fragment>
        <slot>{label}</slot>
      </Button>
    {:else}
      <Button {variant} {size} {type} {disabled} {reason} {busy} on:click>
        <slot>{label}</slot>
      </Button>
    {/if}
  </span>
  <span class="tail">
    <Menu
      {items}
      {variant}
      {size}
      {align}
      compact
      icon={CHEV}
      label={mname}
      disabled={disabled || busy}
      reason={reason}
      empty={`No hay otras formas de ${label ? label.toLocaleLowerCase('es') : 'hacerlo'}.`}
      bind:open
      on:select
    />
  </span>
</div>

<style>
  .split { display: inline-flex; max-width: 100%; }
  .lead { min-width: 0; }
  .lead, .tail { display: inline-flex; }

  /* The two halves come from child components, so their corners are reached with
     `:global(.sx-btn)` — the class Button puts on its own root. Menu's ITEMS are
     plain buttons without it, so the panel is never caught by these rules. */
  .lead :global(.sx-btn) {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }
  .tail :global(.sx-btn) {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }

  /* The seam. On the outlined and ghost pairs the two 1px edges collapse into
     the shared one; on the filled pairs there is no edge to share, so a hairline
     is drawn — inset top and bottom so it reads as a seam in a single object
     rather than a gap between two. */
  .split.outline .tail,
  .split.ghost .tail { margin-inline-start: -1px; }

  .split.solid .tail,
  .split.danger .tail { position: relative; }
  .split.solid .tail::before,
  .split.danger .tail::before {
    content: '';
    position: absolute;
    inset-block: var(--sx-s-2);
    inset-inline-start: 0;
    width: 1px;
    z-index: 1;
    pointer-events: none;
  }
  .split.solid .tail::before { background: var(--sx-accent-edge); }
  .split.danger .tail::before { background: var(--sx-critical-edge); }

  /* The focused half is raised so its ring is not clipped by the other's edge.
     The chevron half is already 44px wide under `(pointer: coarse)` — Button
     squares every icon-only control at the touch size — so a thumb cannot land
     on «Exportar» when it meant the menu. */
  .lead :global(.sx-btn:focus-visible),
  .tail :global(.sx-btn:focus-visible) { z-index: 2; }
</style>
