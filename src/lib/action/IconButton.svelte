<script>
  // ICONBUTTON — Button with the accessible name made mandatory.
  //
  // It exists for one reason: the defect it makes impossible is the single most
  // common accessibility failure in operational software. A toolbar of six
  // wordless squares that a screen reader announces as "botón, botón, botón" is
  // not a hard bug to understand, it is a hard bug to REMEMBER, and an API you
  // cannot use wrong beats a rule in a document every time.
  //
  //   <IconButton label="Editar el equipo" on:click={edit}>{@html pencil}</IconButton>
  //   <IconButton label="Cerrar" variant="ghost" pill on:click={close}>…</IconButton>
  //
  // The default slot IS the icon — usually an <svg> with `stroke="currentColor"`,
  // so it can never disagree with the variant it sits in.
  //
  // WHEN NOT TO USE IT
  //
  // When the icon is not already known by everyone who will see it. A pencil, a
  // trash can, an X and a chevron are vocabulary; a wrench inside a gear is a
  // rebus. Outside a toolbar or a table row — where the column header and the
  // row give the icon its context — write the word. Screen space is cheaper than
  // a technician guessing on a dirty tablet.
  //
  // The label is what the button DOES, not what it draws: «Eliminar el repuesto»,
  // never «Basurero». It is the accessible name and the tooltip at once, so the
  // mouse user and the screen-reader user are told the same thing.
  import Button from './Button.svelte';

  /** REQUIRED. What the button does, in words. */
  export let label = '';
  /** solid | outline | ghost | danger */
  export let variant = 'ghost';
  /** sm | md | lg */
  export let size = 'md';
  export let type = 'button';
  export let href = '';
  export let disabled = false;
  export let reason = '';
  export let busy = false;
  /** Round instead of soft-cornered. The dismiss on a floating panel. */
  export let pill = false;
  /** The DOM node, for a parent that must give focus back to it. */
  export let node = null;

  // Not a silent failure: a wordless control with no name is a defect, and the
  // console is the only place left to say so before it ships. Once per instance
  // — `warned` is deliberately not named inside the reactive statement, so the
  // statement does not depend on it and cannot re-run itself.
  let warned = false;
  function warnOnce() {
    if (warned) return;
    warned = true;
    console.warn('[strix] IconButton sin `label`: un botón sin palabras necesita un nombre accesible.');
  }
  $: if (!label) warnOnce();
</script>

<Button
  {...$$restProps}
  bind:node
  {variant}
  {size}
  {type}
  {href}
  {disabled}
  {reason}
  {busy}
  {pill}
  {label}
  iconOnly
  on:click
  on:keydown
  on:focus
  on:blur
  on:pointerdown
>
  <svelte:fragment slot="icon"><slot /></svelte:fragment>
</Button>
