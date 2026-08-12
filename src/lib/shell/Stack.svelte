<script>
  // GAP, AND NOTHING ELSE.
  //
  // The one-off margin is how a design system rots. `margin-bottom: 14px` under
  // a heading in one screen, 12 in the next, 16 in the third because somebody
  // eyeballed it on a laptop — and six months later there is no vertical rhythm,
  // only forty opinions. Stack owns the vertical gap so that no other component
  // ever has to have one, and so that the answer to "how far apart" is always a
  // step on the same 16 rhythm every other measurement in the system uses.
  //
  // It has no padding, no background, no border and no radius, on purpose. A box
  // is Card. A recessed band is Well. Stack is air, and air is worth a component
  // because the alternative is that every screen invents its own.
  //
  //   <Stack gap={4}>…</Stack>
  //   <Stack gap={2} as="ul">…</Stack>          ← still a list to a screen reader
  //   <Stack gap={6} align="center">…</Stack>
  //
  // `gap` is a STEP (1 2 3 4 5 6 8 10 12 16 20), not a pixel count. Anything
  // else collapses to 0 rather than quietly inventing a value the system does
  // not have — a wrong gap you can see beats a wrong gap that looks plausible.

  /** A step on the spacing scale, or 0 for none. */
  export let gap = 4;
  /** stretch | start | center | end — cross-axis, i.e. horizontal here. */
  export let align = 'stretch';
  /** A TAG NAME, not a component: 'div', 'ul', 'ol', 'section', 'fieldset'… */
  export let as = 'div';

  // The scale, as a guard. Duplicated in the two or three components that need
  // it rather than shared from a module, because a Core carries its own copy of
  // everything or it does not work inside a shadow root.
  const STEPS = new Set([1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20]);
  const step = (n) => (STEPS.has(Number(n)) ? `var(--sx-s-${n})` : '0px');

  $: css = `--stack-gap:${step(gap)}`;
</script>

<svelte:element this={as} {...$$restProps} class="stack a-{align}" style={css}>
  <slot />
</svelte:element>

<style>
  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--stack-gap);
    /* A Stack is very often the body of a Card that owns its own scroll, and a
       flex child that will not shrink below its content is what breaks that. */
    min-width: 0;
    min-height: 0;
    /* `as="ul"` has to stop looking like a bulleted list the moment it is used
       for layout; the role stays, the discs go. */
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .a-stretch { align-items: stretch; }
  .a-start   { align-items: flex-start; }
  .a-center  { align-items: center; }
  .a-end     { align-items: flex-end; }
</style>
