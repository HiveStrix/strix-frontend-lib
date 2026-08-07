<script>
  // STACK, TURNED. Same argument, horizontal axis.
  //
  // A row is where layouts actually break, so it defaults to what survives:
  // `wrap` is ON. A Strix module usually renders next to a 240px shell sidebar,
  // and a row of four controls that fits at 1440 has 380px to live in on a
  // tablet in portrait. A row that cannot wrap does not degrade — it overflows,
  // and horizontal scroll on a page body is the one thing that makes an
  // interface feel broken rather than tight. Turn it off deliberately, for a
  // pair that must stay on one line (a figure and its unit), never by default.
  //
  //   <Row gap={2}>…</Row>
  //   <Row gap={3} justify="between">…</Row>       ← title left, actions right
  //   <Row gap={1} wrap={false} align="baseline">  ← «1 240» «h»
  //
  // Children that must be allowed to shrink need `min-width: 0` on themselves —
  // that is theirs to declare, not the row's, because the row cannot know which
  // one is the label and which one is the truncatable name.

  /** A step on the spacing scale, or 0 for none. */
  export let gap = 3;
  /** center | start | end | baseline | stretch — cross-axis, i.e. vertical here. */
  export let align = 'center';
  /** start | center | end | between — main axis. */
  export let justify = 'start';
  /** Wrapping is the default. Say so out loud when you turn it off. */
  export let wrap = true;
  /** Sits in a line of text rather than owning its own line. */
  export let inline = false;
  /** A TAG NAME, not a component: 'div', 'ul', 'nav', 'header'… */
  export let as = 'div';

  const STEPS = new Set([1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20]);
  const step = (n) => (STEPS.has(Number(n)) ? `var(--sx-s-${n})` : '0px');

  $: css = `--row-gap:${step(gap)}`;
</script>

<svelte:element
  this={as}
  {...$$restProps}
  class="row a-{align} j-{justify}"
  class:nowrap={!wrap}
  class:inline
  style={css}
>
  <slot />
</svelte:element>

<style>
  .row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--row-gap);
    align-items: center;
    min-width: 0;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .inline { display: inline-flex; vertical-align: middle; }
  .nowrap { flex-wrap: nowrap; }

  .a-center   { align-items: center; }
  .a-start    { align-items: flex-start; }
  .a-end      { align-items: flex-end; }
  .a-baseline { align-items: baseline; }
  .a-stretch  { align-items: stretch; }

  .j-start   { justify-content: flex-start; }
  .j-center  { justify-content: center; }
  .j-end     { justify-content: flex-end; }
  .j-between { justify-content: space-between; }
</style>
