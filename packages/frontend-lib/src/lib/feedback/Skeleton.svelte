<script>
  // SKELETON — the shape of what is coming, held open while it comes.
  //
  // Its job is NOT to entertain: it is to reserve the exact space the real
  // content will take, so that when the rows land nothing jumps. A skeleton that
  // does not match what replaces it is worse than a spinner, because it promises
  // a layout and then breaks it under the reader's eyes.
  //
  //   <Skeleton variant="text" lines={3} />
  //   <Skeleton variant="block" height="var(--sx-s-16)" />
  //   <div class="row"><Skeleton variant="circle" /><Skeleton variant="text" lines={2} /></div>
  //
  // ONE announcement per loading REGION, not one per shape. Compose several
  // skeletons and let only the outermost carry `label`; five «cargando» in a
  // live region is five interruptions for one wait.
  //
  // WHEN NOT: under about 300 ms — a skeleton that flashes reads as a glitch, so
  // hold the previous state instead. Over about ten seconds, or for anything
  // whose length is knowable, use Progress: a skeleton says «soon» and after ten
  // seconds that has become a lie. And never for an action a person just took —
  // that is the button's own busy state, right where they are looking.
  //
  // Reduced motion is handled explicitly rather than left to the global reset:
  // killing the sweep with `animation-duration: .01ms` would leave a bright
  // stripe frozen mid-shape, which reads as a rendering error.

  /** text | block | circle */
  export let variant = 'text';
  /** Only for `text`: how many lines. The last one is short, like real prose. */
  export let lines = 3;
  /** Any CSS length. Defaults are token-derived; pass `%` to match a column. */
  export let width = '';
  export let height = '';
  export let radius = '';
  /**
   * Announced once for the region. Set it on the OUTERMOST skeleton only, and
   * name what is loading: «Cargando la flota» is worth hearing, «Cargando» is
   * not.
   */
  export let label = '';

  $: rows = variant === 'text' ? Math.max(1, lines) : 1;
  $: style = [
    width ? `width:${width}` : '',
    height ? `height:${height}` : '',
    radius ? `border-radius:${radius}` : ''
  ].filter(Boolean).join(';');
</script>

<div class="sk {variant}" role={label ? 'status' : undefined} aria-busy={label ? 'true' : undefined}>
  {#if label}<span class="sx-sr">{label}</span>{/if}
  {#each Array(rows) as _, i (i)}
    <span class="bar" style={style} aria-hidden="true"></span>
  {/each}
</div>

<style>
  .sk { display: flex; flex-direction: column; gap: var(--sx-s-2); }

  .bar {
    display: block;
    background: var(--sx-sunk);
    /* The sweep is mixed from the surface's own ink so it works on both themes
       without a second colour: 7 % of the text colour is a highlight on a light
       sunk fill and on a dark one alike. */
    background-image: linear-gradient(
      90deg,
      transparent 0%,
      color-mix(in srgb, var(--sx-ink) 7%, transparent) 45%,
      transparent 90%
    );
    background-size: 240% 100%;
    background-repeat: no-repeat;
    animation: sweep 1400ms var(--sx-ease) infinite;
  }

  .text .bar {
    height: var(--sx-s-3);
    border-radius: var(--sx-r-1);
  }
  /* Prose does not end flush. A last line at full width is the tell that makes
     a text skeleton look like three grey bars instead of a paragraph. */
  .text .bar:last-child:not(:only-child) { width: 62%; }

  .block .bar {
    height: var(--sx-s-16);
    border-radius: var(--sx-r-2);
  }

  .circle { flex-direction: row; }
  .circle .bar {
    width: var(--sx-s-10);
    height: var(--sx-s-10);
    border-radius: var(--sx-r-pill);
    flex: none;
  }

  @keyframes sweep {
    from { background-position: 140% 0; }
    to   { background-position: -40% 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .bar { animation: none; background-image: none; }
  }
</style>
