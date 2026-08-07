<script module>
  let uid = 0;
</script>

<script>
  // THE LABEL FOR THE CONTROL THAT COULD NOT KEEP ITS WORD.
  //
  // WHAT IT IS FOR, WHICH IS NARROWER THAN IT LOOKS
  //
  // A tooltip is a repair, not a feature. Every one of them is an admission that
  // something on screen is not saying what it is: an icon-only button in a dense
  // toolbar, a column head abbreviated to fit, a figure whose unit did not fit
  // beside it. Those are real and this component serves them well.
  //
  // What it must NEVER hold is anything a person has to read to do the job —
  // because on a tablet there is no hover, in a screen reader it arrives as an
  // afterthought if at all, and on a slow machine it arrives late. If the
  // sentence matters, it goes on the screen. That is what Well is for.
  //
  //   <Tooltip text="Exportar el libro filtrado a CSV">
  //     <button aria-label="Exportar CSV"><Glyph name="download" /></button>
  //   </Tooltip>
  //
  // HOW IT REACHES THE CONTROL IT DESCRIBES. The trigger is yours, not ours: you
  // pass a real <button> or <a> in the slot, and on mount the tip's id is put on
  // the first focusable node inside as `aria-describedby`. Doing it imperatively
  // looks like a trick and is the only honest option — an attribute cannot be
  // written onto slot content from out here, and the alternative (a wrapper that
  // takes the tabindex) would put a second, meaningless tab stop in front of
  // every control in the app. If there is no focusable node in the slot, no
  // description is attached and the tip is decoration: fix the slot, do not ship
  // a tooltip on a <span>.
  //
  // TOUCH. Hover does not exist there, so the tip is bound to FOCUS as well, and
  // a tap focuses a button. Pointer-driven showing is gated to `pointerType ===
  // 'mouse'` so a touch does not flash it open and shut on the way past.
  //
  // ESCAPE closes the tip and stops there — one level per press, so the sheet
  // behind it stays open.
  import { onMount } from 'svelte';

  /** The repair. One short line; a tooltip is not a paragraph. */
  export let text = '';
  /** top | bottom | left | right — where it goes relative to the trigger. */
  export let placement = 'top';
  /** Milliseconds before it appears on hover. Focus is always immediate. */
  export let delay = 140;

  const id = `sx-tip-${++uid}`;
  const FOCUSABLE =
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),' +
    'textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';

  let host;
  let shown = false;
  let timer = 0;

  // Everything binds to the CONTROL, not to the wrapper. Two reasons, and the
  // second is the real one: a hover region that is a layout span rather than the
  // button itself eventually disagrees with the button by a pixel — and a
  // wrapper carrying interaction handlers is a static element pretending to be
  // interactive, which is precisely the thing the a11y rules are right about.
  // If the slot holds nothing focusable, NOTHING is bound: no description, no
  // hover, no tip. That is the component refusing to paper over a control a
  // keyboard cannot reach.
  onMount(() => {
    const target = host?.querySelector(FOCUSABLE);
    if (!target || !text) return;
    const enter = (e) => onPointer(e);
    const leave = () => hide();
    const gotFocus = () => show(true);
    target.setAttribute('aria-describedby', id);
    target.addEventListener('pointerenter', enter);
    target.addEventListener('pointerleave', leave);
    target.addEventListener('focus', gotFocus);
    target.addEventListener('blur', leave);
    target.addEventListener('keydown', onKeydown);
    return () => {
      clearTimeout(timer);
      target.removeAttribute('aria-describedby');
      target.removeEventListener('pointerenter', enter);
      target.removeEventListener('pointerleave', leave);
      target.removeEventListener('focus', gotFocus);
      target.removeEventListener('blur', leave);
      target.removeEventListener('keydown', onKeydown);
    };
  });

  function show(now = false) {
    if (!text) return;
    clearTimeout(timer);
    if (now || !delay) shown = true;
    else timer = setTimeout(() => (shown = true), delay);
  }

  function hide() {
    clearTimeout(timer);
    shown = false;
  }

  function onPointer(e) {
    // A touch fires pointerenter on press and pointerleave on release; letting
    // that through means every tap on the control blinks a tooltip at it.
    if (e.pointerType === 'mouse') show();
  }

  function onKeydown(e) {
    if (e.key !== 'Escape' || !shown) return;
    e.stopPropagation();
    hide();
  }

  $: place = ['top', 'bottom', 'left', 'right'].includes(placement) ? placement : 'top';
</script>

<span class="wrap" bind:this={host}>
  <slot />
  {#if text}
    <!-- Never aria-hidden, even while invisible: the accessible-description
         computation walks a directly referenced node whether it is showing or
         not, which is exactly how a keyboard user gets the word without ever
         seeing the box. Marking it hidden would take the description away. -->
    <span class="tip {place}" id={id} role="tooltip" class:shown>{text}</span>
  {/if}
</span>

<style>
  .wrap {
    position: relative;
    display: inline-flex;
    /* The wrapper must not become a second box around the control: no padding,
       no background, and it takes the trigger's own alignment. */
    vertical-align: middle;
    max-width: 100%;
  }

  .tip {
    position: absolute;
    z-index: var(--sx-z-toast);
    width: max-content;
    /* A measure, not a pixel width: a tooltip that runs past ~34 characters is
       a paragraph, and a paragraph does not belong in a tooltip. */
    max-width: 34ch;
    padding: var(--sx-s-2) var(--sx-s-3);
    border-radius: var(--sx-r-1);
    background: var(--sx-ink);
    color: var(--sx-surface);
    font-size: var(--sx-t-xs);
    font-weight: var(--sx-w-medium);
    line-height: 1.4;
    text-align: left;
    box-shadow: var(--sx-e-2);
    /* Hidden by visibility rather than by display, so the transition has
       something to run on and so nothing inside it is ever in the tab order. */
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
    transition:
      opacity var(--sx-fast) var(--sx-ease),
      visibility var(--sx-fast) var(--sx-ease);
  }
  .shown { visibility: visible; opacity: 1; }

  .top    { bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: var(--sx-s-2); }
  .bottom { top: 100%;    left: 50%; transform: translateX(-50%); margin-top: var(--sx-s-2); }
  .left   { right: 100%;  top: 50%;  transform: translateY(-50%); margin-right: var(--sx-s-2); }
  .right  { left: 100%;   top: 50%;  transform: translateY(-50%); margin-left: var(--sx-s-2); }

  @media (prefers-reduced-motion: reduce) {
    .tip { transition: none; }
  }

  /* On a touch screen the tip only ever arrives through focus, so it must not
     sit under the thumb that just put it there. `left`/`right` at 390px would
     also be half off the screen; both fall back to below the control. */
  @media (pointer: coarse) {
    .left, .right {
      right: auto;
      left: 50%;
      top: 100%;
      transform: translateX(-50%);
      margin: var(--sx-s-2) 0 0;
    }
  }
</style>
