<script>
  // ONE INSTRUMENT, NOT A ROW OF CARDS.
  //
  // Five figures about the same fleet belong to the same reading, and five
  // shadowed cards say the opposite: each gets its own edge, its own elevation
  // and its own claim on the eye, so the person ends up comparing boxes instead
  // of numbers. The strip is a SINGLE surface with a SINGLE shadow, divided by
  // hairlines — the face of a meter, where the divisions cost less than the
  // frame because there is only one frame.
  //
  //   <StatStrip label="Estado de la flota">
  //     <Stat label="Cumplimiento" value={94} unit="%" delta={6} deltaUnit="pp"
  //           since="vs. semestre anterior" better="up" />
  //     <Stat label="Equipos activos" value={8} outOf={9} />
  //     <Stat label="Sin cerrar" value={7} clickable on:click={showOpen}
  //           actionLabel="Ver los 7 servicios sin cerrar" />
  //     <Stat label="Costo 12 meses" value="₡4 820 000" />
  //   </StatStrip>
  //
  // HOW THE DIVISIONS ARE DRAWN: the grid's own gap is one pixel and its
  // background is `--sx-line`; every cell paints `--sx-surface` over it. That is
  // why the rules stay correct when the strip wraps to two rows on a tablet —
  // there is no «last cell in the row» to special-case, which is precisely where
  // a border-based strip breaks.
  //
  // WHEN NOT TO USE IT: when the figures are not about the same subject. Two
  // instruments side by side is honest; one instrument mixing money owed and
  // disk usage is not. And never past about six cells — beyond that it is a
  // table, and a table has headers, sorting and a scroll.
  //
  // WHAT GOES IN IT: anything with one root element. Stat is the usual answer,
  // but a cell holding a Stat with a Sparkline under it is still one reading, so
  // the slot is deliberately not typed to Stat.

  /** Names the instrument for a screen reader. Without it the group is silent. */
  export let label = '';
  /** Narrower cells — a strip of six short counts rather than four money figures. */
  export let dense = false;
</script>

<div
  class="strip"
  class:dense
  role={label ? 'group' : undefined}
  aria-label={label || undefined}
>
  <slot />
</div>

<style>
  .strip {
    /* Two of the largest step in the spacing scale: the narrowest a figure with
       a label and a delta under it stays readable, and narrow enough that a
       390px content column still fits two of them. */
    --sx-cell: calc(var(--sx-s-20) * 2);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--sx-cell), 1fr));
    gap: 1px;
    background: var(--sx-line);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-1);
    /* Clips the cells to the strip's corners. Every cell's padding below is
       well clear of the focus ring's 4px reach, so nothing focusable is cut. */
    overflow: hidden;
  }
  .dense { --sx-cell: calc(var(--sx-s-20) + var(--sx-s-10)); }

  /* Whatever the caller slotted in. Scoped styles do not cross into slot
     content, so this is deliberately `:global` and deliberately DIRECT children
     only: the strip owns the cell, the component inside owns everything in it. */
  .strip > :global(*) {
    background: var(--sx-surface);
    padding: var(--sx-s-4);
    min-width: 0;
  }

  @media (pointer: coarse) {
    .strip > :global(*) { padding: var(--sx-s-4) var(--sx-s-4) var(--sx-s-5); }
  }

  /* A phone, or the Shell's sidebar plus a small laptop: two cells is the
     honest maximum, because three at 110px turn every figure into two lines. */
  @media (max-width: 420px) {
    .strip { --sx-cell: calc(var(--sx-s-20) + var(--sx-s-12)); }
    .strip > :global(*) { padding: var(--sx-s-3); }
  }
</style>
