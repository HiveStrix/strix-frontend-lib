<script>
  // BUTTONGROUP — several actions that belong to one another, said once.
  //
  // Two shapes, and the difference is not decoration:
  //
  //   ROW (default) — actions that live together but are different things.
  //     A dialog footer. A toolbar. «Guardar» beside «Cancelar».
  //
  //   ATTACHED — actions that are the SAME KIND of thing with different
  //     objects: «CSV» «PDF» «Imprimir», three ways to take the same list out.
  //     Welding two buttons together is a claim that they are alternatives to
  //     each other. «Guardar» welded to «Eliminar» is that claim, and it is a
  //     lie that will eventually cost somebody a record.
  //
  //   <ButtonGroup label="Acciones del servicio">
  //     <Button variant="solid" on:click={save}>Guardar</Button>
  //     <Button variant="ghost" on:click={cancel}>Cancelar</Button>
  //   </ButtonGroup>
  //
  //   <ButtonGroup attached label="Exportar el libro">
  //     <Button on:click={csv}>CSV</Button>
  //     <Button on:click={pdf}>PDF</Button>
  //   </ButtonGroup>
  //
  // ABOUT `label`. `role="group"` is only applied when there is a name for it,
  // because a group nobody can name is a landmark that announces "grupo" and
  // says nothing. No label, no role — just a layout.
  //
  // ABOUT ORDER AND `stack`. Put the primary FIRST. In a row it reads first,
  // which is where the eye starts in Spanish; when `stack` folds the group into
  // a column on a phone, it is on top, which is where a thumb lands. Visual
  // order and tab order stay the same sentence in both — a footer that reverses
  // itself at 390px is a focus-order bug wearing a responsive costume.
  //
  // ATTACHED expects Buttons (or links) as DIRECT children. It reaches them with
  // `:global()` to make the seam, so wrapping one in a <div> breaks the corners.
  // A SplitButton draws its own seam and does not belong inside `attached`.
  //
  // AND IT DOES NOT WRAP. A welded control is one object; breaking it over two
  // lines makes it two objects with four wrong corners. When it runs out of room
  // the labels ellipsise instead of overflowing, which is a warning, not a
  // feature: past three or four short words this is the wrong control. Use a
  // Menu, or a plain row that is allowed to wrap.

  /** Names the group for a screen reader. Without it there is no role. */
  export let label = '';
  /** Weld the children into one control. Alternatives only. */
  export let attached = false;
  /** start | end | center | between */
  export let align = 'start';
  /** Fold into a full-width column on a narrow viewport. Row mode only. */
  export let stack = false;
  /** Let the row wrap when it runs out of column. */
  export let wrap = true;

  $: named = !!label;
</script>

<div
  class="grp {align}"
  class:attached
  class:stack={stack && !attached}
  class:nowrap={!wrap}
  role={named ? 'group' : undefined}
  aria-label={named ? label : undefined}
>
  <slot />
</div>

<style>
  .grp {
    display: flex;
    align-items: center;
    gap: var(--sx-s-2);
    flex-wrap: wrap;
    min-width: 0;
  }
  .nowrap { flex-wrap: nowrap; }

  .start   { justify-content: flex-start; }
  .end     { justify-content: flex-end; }
  .center  { justify-content: center; }
  .between { justify-content: space-between; }

  /* ── Attached ────────────────────────────────────────────────────────────
     The children come from the slot, so they carry the CONSUMER's scope and
     have to be reached with `:global()`. The selector is on the element rather
     than a class name, so it holds for a <Button>, a plain <button> and a link
     alike.

     `-1px` is the double border collapsing into the shared one, not a size: two
     adjacent 1px outlines read as a 2px rule and the seam looks like a mistake.
     The hovered or focused child is raised so its own ring is never cut in half
     by the neighbour's edge. */
  .attached {
    display: inline-flex;
    flex-wrap: nowrap;
    gap: 0;
    max-width: 100%;
  }
  .attached > :global(button),
  .attached > :global(a) {
    border-radius: 0;
    min-width: 0;
  }
  .attached > :global(button + button),
  .attached > :global(button + a),
  .attached > :global(a + button),
  .attached > :global(a + a) {
    margin-inline-start: -1px;
  }
  .attached > :global(button:first-child),
  .attached > :global(a:first-child) {
    border-start-start-radius: var(--sx-r-2);
    border-end-start-radius: var(--sx-r-2);
  }
  .attached > :global(button:last-child),
  .attached > :global(a:last-child) {
    border-start-end-radius: var(--sx-r-2);
    border-end-end-radius: var(--sx-r-2);
  }
  .attached > :global(button:hover),
  .attached > :global(a:hover),
  .attached > :global(button:focus-visible),
  .attached > :global(a:focus-visible) {
    z-index: 1;
  }

  /* ── Stacked ─────────────────────────────────────────────────────────────
     A dialog footer at 390px inside a Shell whose sidebar has already taken
     240px: two buttons side by side leave 8 characters each. Full width, in
     the order they were written. */
  .stack {
    flex-direction: column;
    align-items: stretch;
  }
  .stack > :global(button),
  .stack > :global(a) { width: 100%; }

  @media (min-width: 481px) {
    .stack { flex-direction: row; align-items: center; }
    .stack > :global(button),
    .stack > :global(a) { width: auto; }
  }
</style>
