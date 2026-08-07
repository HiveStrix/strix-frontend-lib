<script module>
  // Deterministic ids beat Math.random(): two sheets on a page must not collide,
  // and an id that changes on every render is an id that aria-labelledby loses.
  let uid = 0;
</script>

<script>
  // THE SIDE DRAWER. A second surface without leaving the first one.
  //
  // WHY A DRAWER AND NOT A MODAL BOX
  //
  // The work in these products is a list, and the thing you open from a list is
  // one of its rows. A centred dialog throws the list away and then asks you to
  // remember it; a drawer keeps it on screen, so «cuál de las veintidós era»
  // stays answerable while you are reading the one you opened. It also degrades
  // honestly: at 390px it simply becomes the screen.
  //
  //   <Sheet bind:open title="BAT001 · Batidora Guanacaste">
  //     …
  //     <svelte:fragment slot="footer">…</svelte:fragment>
  //   </Sheet>
  //
  // FOCUS IS BORROWED, NOT TAKEN. It goes to the panel on open, is trapped while
  // open, and is HANDED BACK to whatever opened it on close. That last part is
  // the one everybody skips, and it is the one that decides whether a keyboard
  // user can keep working: without it, closing a sheet drops focus on <body> and
  // costs them the whole way back down the list.
  //
  // ESCAPE IS STOPPED, NOT LET GO. Hosts in this ecosystem listen for Escape on
  // the window to close the section around them. If the sheet let the key
  // bubble, one press would close the sheet AND the screen behind it. One level
  // per press.
  //
  // IT DOES NOT PORTAL, AND THAT IS DELIBERATE. Moving the node to document.body
  // is the usual trick for escaping a clipped ancestor — and inside a Core it is
  // fatal: the node would leave the shadow root and lose every style and every
  // token with it. So the sheet renders where it is written, with
  // `position: fixed` and `--sx-z-overlay`. THE COST, stated plainly: an
  // ancestor with a `transform`, `filter` or `perspective` becomes the
  // containing block for `fixed`, and the sheet will be trapped inside it. Do
  // not put a Sheet inside a transformed card. Nothing else here can fix that.
  //
  // IT LEAVES AT ONCE. There is an enter animation and no exit one, because an
  // exit animation has to hold the node — and holding the node holds focus away
  // from the control that has to get it back.
  import { createEventDispatcher, onDestroy, tick } from 'svelte';
  import Glyph from './Glyph.svelte';

  /** bind:open. The sheet is a controlled thing; the parent owns whether it exists. */
  export let open = false;
  /** The dialog's accessible name. Without one, pass aria-label yourself — a
   *  dialog nobody can name is a dialog a screen-reader user is lost inside. */
  export let title = '';
  /** right | left. Right by default: the list is read left to right and the detail follows it. */
  export let side = 'right';
  /** sm | md | lg. Below its width the sheet is the whole screen. */
  export let size = 'md';
  /** Escape, the scrim and the × all close it. Turn off for a step that must be
   *  answered — and then give the footer a control that says what the answer is. */
  export let dismissible = true;

  const dispatch = createEventDispatcher();
  const id = `sx-sheet-${++uid}`;

  const FOCUSABLE =
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),' +
    'textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';

  let panel;
  let opener = null;
  let wasOpen = false;
  let prevOverflow = '';

  // document.activeElement stops at the shadow host, so the real focused node
  // inside a Core has to be walked to. Every product in this ecosystem is
  // eventually mounted in one.
  function deepActive(root = typeof document === 'undefined' ? null : document) {
    const el = root?.activeElement ?? null;
    return el?.shadowRoot ? deepActive(el.shadowRoot) : el;
  }

  const visible = (el) => el.getClientRects().length > 0;

  async function sync(next) {
    if (typeof document === 'undefined' || next === wasOpen) return;
    wasOpen = next;
    if (next) {
      opener = deepActive();
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      await tick();
      // The panel itself, not the first control: landing on the dialog is what
      // makes a screen reader read its name and its role before its contents.
      panel?.focus({ preventScroll: true });
    } else {
      document.body.style.overflow = prevOverflow;
      const back = opener;
      opener = null;
      back?.focus?.({ preventScroll: true });
    }
  }

  $: sync(open);

  onDestroy(() => {
    // A sheet destroyed while open would leave the page unscrollable forever.
    if (wasOpen && typeof document !== 'undefined') document.body.style.overflow = prevOverflow;
  });

  function close() {
    if (!open) return;
    open = false;
    dispatch('close');
  }

  // The scrim dismisses only on a real click ON THE SCRIM — mousedown AND click
  // must both land on it. A drag that starts inside a textarea in the drawer and
  // releases over the scrim is a person selecting text, and throwing away what
  // they typed for it is the rudest bug a drawer can have. Dialog got this
  // right and this file did not; they now do the same thing the same way.
  let downOnScrim = false;

  function scrimDown(e) {
    downOnScrim = e.target === e.currentTarget;
    // Pressing the scrim must not blur the panel: if it did, the next Escape
    // would go to <body> and `onKeydown` would never see it.
    if (downOnScrim) e.preventDefault();
  }

  function scrimClick(e) {
    if (downOnScrim && e.target === e.currentTarget && dismissible) close();
    downOnScrim = false;
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      if (!dismissible) return;
      e.preventDefault();
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== 'Tab' || !panel) return;

    const els = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(visible);
    if (!els.length) {
      // Nothing to tab to — keep the ring on the dialog rather than letting it
      // escape to the page behind, which is still there and still focusable.
      e.preventDefault();
      panel.focus({ preventScroll: true });
      return;
    }
    const first = els[0];
    const last = els[els.length - 1];
    const cur = deepActive();
    if (e.shiftKey && (cur === first || cur === panel)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && cur === last) {
      e.preventDefault();
      first.focus();
    }
  }
</script>

{#if open}
  <div class="sheet">
    <!-- A surface to click past, not a control: no role, no tab stop, no
         keyboard duty of its own — Escape on the panel is the keyboard way out
         and the × is the pointer one, which is why these ignores are honest. It
         used to be a <button aria-hidden="true">, which is a control the
         accessibility tree is told does not exist; the div says the same thing
         without the contradiction. -->
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="scrim" on:mousedown={scrimDown} on:click={scrimClick}></div>

    <div
      {...$$restProps}
      class="panel {side} {size}"
      bind:this={panel}
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? `${id}-t` : undefined}
      on:keydown={onKeydown}
    >
      <div class="head">
        <div class="titles">
          {#if title}<h2 class="t" id="{id}-t">{title}</h2>{/if}
          <slot name="head" />
        </div>
        {#if dismissible}
          <button type="button" class="x" on:click={close} aria-label="Cerrar">
            <Glyph name="close" size={16} />
          </button>
        {/if}
      </div>

      <div class="body"><slot /></div>

      {#if $$slots.footer}
        <div class="foot"><slot name="footer" /></div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .sheet {
    position: fixed;
    inset: 0;
    z-index: var(--sx-z-overlay);
    display: flex;
  }

  .scrim {
    position: absolute;
    inset: 0;
    cursor: pointer;
    /* `--sx-scrim`, the system's one veil, bound per theme. This used to mix
       `--sx-n-900` with transparent — and the neutral ramp does not re-bind in
       dark, so the drawer's «behind» was doing nothing at all on the dark theme
       and the list underneath stayed as bright as the drawer. */
    background: var(--sx-scrim);
    animation: sx-fade var(--sx-beat) var(--sx-ease);
  }

  .panel {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: var(--sx-surface);
    color: var(--sx-ink);
    box-shadow: var(--sx-e-3);
    /* Widths built from the spacing scale, because the system has no size scale
       and a drawer is not going to be the place that invents one. 320 / 400 / 560. */
    width: min(100%, calc(var(--sx-s-20) * 5));
    margin-left: auto;
    animation: sx-in-right var(--sx-beat) var(--sx-ease);
  }
  .sm { width: min(100%, calc(var(--sx-s-20) * 4)); }
  .lg { width: min(100%, calc(var(--sx-s-20) * 7)); }

  /* Only the two inner corners are rounded: the outer edge is the screen edge,
     and a radius there would show the scrim through a sliver that reads as a
     rendering fault. */
  .right { border-radius: var(--sx-r-3) 0 0 var(--sx-r-3); }
  .left {
    margin-left: 0;
    margin-right: auto;
    border-radius: 0 var(--sx-r-3) var(--sx-r-3) 0;
    animation-name: sx-in-left;
  }

  .panel:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: -4px; }

  /* Only the body scrolls, so the head and the footer are always there. In a
     sheet with forty fields the way out must not be forty fields up. */
  .head {
    flex: none;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--sx-s-3);
    padding: var(--sx-s-5);
    background: var(--sx-surface);
  }
  .titles { min-width: 0; }
  .t {
    margin: 0;
    font-size: var(--sx-t-lg);
    font-weight: var(--sx-w-semi);
    letter-spacing: -.02em;
    line-height: 1.25;
  }

  .x {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--sx-s-8);
    height: var(--sx-s-8);
    border: 0;
    border-radius: var(--sx-r-pill);
    background: var(--sx-sunk);
    color: var(--sx-ink-2);
    cursor: pointer;
    transition: background var(--sx-fast) var(--sx-ease), color var(--sx-fast) var(--sx-ease);
  }
  .x:hover { background: var(--sx-neutral-band); color: var(--sx-ink); }
  .x:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: 2px; }

  .body {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
    overscroll-behavior: contain;
    padding: 0 var(--sx-s-5) var(--sx-s-5);
  }

  .foot {
    flex: none;
    padding: var(--sx-s-4) var(--sx-s-5);
    background: var(--sx-sunk);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--sx-s-2);
    flex-wrap: wrap;
  }

  @keyframes sx-fade { from { opacity: 0; } }
  @keyframes sx-in-right { from { transform: translateX(4%); opacity: 0; } }
  @keyframes sx-in-left { from { transform: translateX(-4%); opacity: 0; } }

  /* base.css turns motion off for a document; a Core has no base.css, so the
     component turns its own off. The sheet still arrives — it just arrives. */
  @media (prefers-reduced-motion: reduce) {
    .scrim, .panel { animation: none; }
    .x { transition: none; }
  }

  @media (pointer: coarse) {
    .x { width: var(--sx-touch); height: var(--sx-touch); }
  }

  /* A drawer narrower than the screen on a phone leaves a 20px strip of scrim
     that is neither dismissible-by-aim nor useful. Take the screen. */
  @media (max-width: 560px) {
    .panel, .sm, .lg { width: 100%; border-radius: 0; }
  }
</style>
