<script>
  // THE BAR ABOVE THE WORK.
  //
  // Every list screen in every Strix product has the same two-sided strip over
  // it: what you are looking at on the left, what you can do about it on the
  // right. Hand-written, it is the same eight lines of flex every time, and the
  // eight lines disagree between screens about the gap, about whether it wraps,
  // and about what happens when the content scrolls under it.
  //
  //   <Toolbar>
  //     <Pill …/> <Pill …/>
  //     <svelte:fragment slot="end">…botones…</svelte:fragment>
  //   </Toolbar>
  //
  //   <Toolbar sticky over="surface" aria-label="Filtros del libro">…</Toolbar>
  //
  // IT IS NOT role="toolbar", ON PURPOSE. That role promises roving focus: one
  // tab stop for the whole bar and arrow keys between the controls inside it. We
  // do not implement that, so claiming it would teach a keyboard user a
  // navigation model that is not there — and an aria attribute that lies is
  // worse than none. What this is, is a labelled group of controls, so pass
  // `aria-label` and it becomes exactly that.
  //
  // STICKY CARRIES ITS OWN BACKGROUND, because a transparent bar over scrolling
  // rows is unreadable within one line of scroll. `over` says what it is stuck
  // ON — the page ground, a card's surface, or a recessed band — because the bar
  // has no way to find that out and guessing wrong is very visible.

  /** A step on the spacing scale, between the items. */
  export let gap = 3;
  /** The bar stays put while the content under it scrolls. */
  export let sticky = false;
  /** ground | surface | sunk — what the bar is stuck on. Only read when sticky. */
  export let over = 'ground';
  /** center | start | end | baseline */
  export let align = 'center';
  /** Wrapping is the default, and turning it off in a bar of controls is nearly always wrong. */
  export let wrap = true;
  /** A TAG NAME: 'div', 'header', 'nav', 'section'… */
  export let as = 'div';

  const STEPS = new Set([1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20]);
  const step = (n) => (STEPS.has(Number(n)) ? `var(--sx-s-${n})` : '0px');
  const OVER = new Set(['ground', 'surface', 'sunk']);

  $: on = OVER.has(over) ? over : 'ground';
  $: css = `--bar-gap:${step(gap)}`;
</script>

<svelte:element
  this={as}
  {...$$restProps}
  class="bar a-{align} on-{on}"
  class:sticky
  class:nowrap={!wrap}
  style={css}
>
  <div class="side start"><slot /></div>
  {#if $$slots.end}
    <div class="side end"><slot name="end" /></div>
  {/if}
</svelte:element>

<style>
  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--bar-gap);
    flex-wrap: wrap;
    min-width: 0;
  }
  .nowrap { flex-wrap: nowrap; }

  .a-center   { align-items: center; }
  .a-start    { align-items: flex-start; }
  .a-end      { align-items: flex-end; }
  .a-baseline { align-items: baseline; }

  .side {
    display: flex;
    align-items: inherit;
    gap: var(--bar-gap);
    flex-wrap: wrap;
    min-width: 0;
  }
  /* The left side is what you are looking at, so it takes the slack; the right
     side is what you can do, and buttons do not stretch. */
  .start { flex: 1 1 auto; }
  .end { flex: 0 0 auto; justify-content: flex-end; }

  .sticky {
    position: sticky;
    top: 0;
    z-index: var(--sx-z-sticky);
    padding-block: var(--sx-s-3);
    /* A drop shadow rather than a rule: the bar is above the rows, and above is
       drawn with light everywhere else in this system. It is always on, because
       nothing here can know whether the container has been scrolled yet — and a
       bar that is only separated once you have already lost the first row is
       worse than one that is always separated. */
    box-shadow: var(--sx-e-1);
  }
  .on-ground.sticky  { background: var(--sx-ground); }
  .on-surface.sticky { background: var(--sx-surface); }
  .on-sunk.sticky    { background: var(--sx-sunk); }

  /* At the width of the shell's content column on a phone the two sides stop
     being two sides: side by side they each get 45 % of 390px and every control
     in them wraps to two lines. Stacked, each gets the whole width. */
  @media (max-width: 480px) {
    .bar { flex-direction: column; align-items: stretch; }
    .side { justify-content: flex-start; }
  }
</style>
