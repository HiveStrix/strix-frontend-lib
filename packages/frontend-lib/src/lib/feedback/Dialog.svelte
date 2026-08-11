<script context="module">
  let uid = 0;

  // Scroll lock, counted. Two dialogs can be open at once (a Confirm on top of
  // a form), and the second one closing must not hand the page back its scroll
  // while the first is still up.
  let locks = 0;
  let restoreOverflow = '';

  function lock() {
    if (typeof document === 'undefined') return;
    if (locks++ === 0) {
      restoreOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
  }
  function unlock() {
    if (typeof document === 'undefined') return;
    if (--locks <= 0) {
      locks = 0;
      document.body.style.overflow = restoreOverflow;
    }
  }
</script>

<script>
  // DIALOG — the only thing in a Strix surface that genuinely floats, and
  // therefore the only thing that gets `--sx-e-3`.
  //
  // It claims `aria-modal="true"`, so it owes four behaviours, and a dialog that
  // owes them and does not pay is worse than no dialog at all:
  //
  //   1. FOCUS STAYS INSIDE while it is open, and GOES BACK to whatever opened
  //      it on close. The opener is captured at init — before this component's
  //      own DOM exists and can steal it — by walking down through shadow roots,
  //      because from outside a shadow tree `document.activeElement` only ever
  //      reports the host element.
  //   2. ESCAPE BELONGS TO IT. Stopped, not just handled: the Shell has its own
  //      Escape chain and letting the key through unwinds two levels at once.
  //   3. THE SCRIM DISMISSES ONLY ON A REAL CLICK ON THE SCRIM — mousedown AND
  //      click must both land on it. A drag that starts inside a textarea and
  //      releases over the scrim is a person selecting text, and throwing away
  //      what they typed for it is the rudest bug a dialog can have.
  //   4. IT IS MOUNTED, NOT TOGGLED. `{#if open}<Dialog …/>{/if}` — the focus
  //      return hangs off destroy, and a hidden-but-mounted dialog keeps stale
  //      form state that the next opening then shows.
  //
  //   {#if editing}
  //     <Dialog title="Registrar lectura" note="BAT001 · horómetro" on:close={() => (editing = false)}>
  //       <input data-sx-autofocus … />
  //       <svelte:fragment slot="foot"> … </svelte:fragment>
  //     </Dialog>
  //   {/if}
  //
  // WHEN NOT: for anything a person needs to compare against what is behind it —
  // a dialog is a wall. For a destructive question, use Confirm, which is this
  // component with the argument already made. For a message that needs no
  // answer, a Toast; a dialog that only says «listo» is a door you have to close
  // to leave a room you did not want to enter.
  //
  // On a coarse pointer it becomes a bottom sheet: full width, reachable with
  // the thumb that is already holding the tablet, with the scrim still visible
  // above it so the surface underneath is not lost.
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  /** Names the dialog for the eye and for the accessibility tree. Required. */
  export let title;
  /** The subject line: which machine, which order. Becomes the description. */
  export let note = '';
  /** sm | md | lg — measured in `ch`, because a dialog holds prose and controls. */
  export let size = 'md';
  /**
   * False while a write is in flight: no ✕, no Escape, no scrim dismiss. The
   * key is still swallowed, so it never reaches whatever is listening behind.
   */
  export let dismissible = true;
  export let closeLabel = 'Cerrar';

  const dispatch = createEventDispatcher();
  const n = ++uid;
  const titleId = `sx-dlg-t-${n}`;
  const noteId = `sx-dlg-n-${n}`;

  let panel;

  const opener = (() => {
    let el = typeof document === 'undefined' ? null : document.activeElement;
    while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
    return el;
  })();

  const FOCUSABLE =
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),' +
    'textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

  // getClientRects() rather than offsetParent: an element inside a
  // `position: fixed` ancestor has no offsetParent and is perfectly focusable.
  const tabbables = () =>
    [...(panel?.querySelectorAll(FOCUSABLE) ?? [])].filter((el) => el.getClientRects().length);

  onMount(() => {
    lock();
    // A form dialog wants its first field; a dialog that only states something
    // wants the panel, so a screen reader reads the title and the note before
    // it reads a button. `[data-sx-autofocus]` is how a consumer overrides both.
    const first =
      panel?.querySelector('[data-sx-autofocus]') ??
      panel?.querySelector('input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])') ??
      panel;
    first?.focus?.();
  });

  onDestroy(() => {
    unlock();
    // Guarded: a save can re-render the surface behind, and the button that
    // opened this may not exist any more.
    if (opener?.isConnected) opener.focus?.();
  });

  function close() {
    if (dismissible) dispatch('close');
  }

  function onKey(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    const els = tabbables();
    if (!els.length) {
      // Nothing to tab to: keep the focus on the panel rather than letting it
      // walk out into the page behind.
      e.preventDefault();
      panel?.focus();
      return;
    }
    // Through the root node: inside a shadow tree, `document.activeElement` is
    // the host, and every comparison below would be false.
    const active = panel?.getRootNode?.()?.activeElement;
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey && (active === first || !els.includes(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  let downOnScrim = false;

  function scrimDown(e) {
    downOnScrim = e.target === e.currentTarget;
    // Pressing the scrim must not blur the dialog: if it did, the next Escape
    // would be delivered to <body> and this handler would never see it.
    if (downOnScrim) e.preventDefault();
  }

  function scrimClick(e) {
    if (downOnScrim && e.target === e.currentTarget) close();
    downOnScrim = false;
  }
</script>

<!-- The scrim is a surface to click past, not a control: it has no role, no tab
     stop, and no keyboard duty of its own — Escape on the panel is the keyboard
     way out, which is why these two ignores are honest. -->
<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="scrim" on:mousedown={scrimDown} on:click={scrimClick}>
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="panel {size}"
    bind:this={panel}
    role="dialog"
    aria-modal="true"
    aria-labelledby={titleId}
    aria-describedby={note ? noteId : undefined}
    tabindex="-1"
    on:keydown={onKey}
  >
    <header>
      <div class="say">
        <h2 id={titleId}>{title}</h2>
        {#if note}<p id={noteId} class="note">{note}</p>{/if}
      </div>
      {#if dismissible}
        <button type="button" class="x" on:click={close} aria-label={closeLabel} title={closeLabel}>
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3 3l6 6M9 3l-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      {/if}
    </header>

    <div class="body"><slot /></div>

    {#if $$slots.foot}
      <footer><slot name="foot" /></footer>
    {/if}
  </div>
</div>

<style>
  .scrim {
    position: fixed;
    inset: 0;
    z-index: var(--sx-z-overlay);
    /* `--sx-scrim` is a ROLE token, bound per theme. It exists because this
       file used to mix `--sx-n-900` with transparent — and the neutral ramp
       does NOT re-bind in dark, so on a near-black ground that mix was exactly
       nothing at any percentage, and the veil was carried entirely by a
       backdrop-filter that Firefox did not have. Three components had each
       patched around this differently; now there is one answer. */
    background: var(--sx-scrim);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: var(--sx-s-12) var(--sx-s-4) var(--sx-s-4);
    animation: scrim-in var(--sx-fast) var(--sx-ease);
  }

  .panel {
    display: flex;
    flex-direction: column;
    /* Percentage of the scrim's content box, which is the viewport minus its
       padding — so no vh unit is needed and iOS's moving toolbar cannot make
       the footer fall off the bottom. */
    max-height: 100%;
    background: var(--sx-surface);
    color: var(--sx-ink);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-3);
    animation: panel-in var(--sx-beat) var(--sx-ease);
  }
  /* Widths in `ch`: a dialog is prose plus controls, and the measure is what
     decides how wide it should be. */
  .sm { width: min(42ch, 100%); }
  .md { width: min(58ch, 100%); }
  .lg { width: min(86ch, 100%); }

  .panel:focus { outline: none; }
  .panel:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: 2px; }

  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--sx-s-4);
    padding: var(--sx-s-5) var(--sx-s-5) var(--sx-s-3);
  }
  h2 {
    margin: 0;
    font-size: var(--sx-t-lg);
    font-weight: var(--sx-w-semi);
    letter-spacing: -.02em;
    line-height: 1.25;
  }
  .note {
    margin: var(--sx-s-1) 0 0;
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-3);
  }

  .x {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.9em;
    height: 1.9em;
    padding: 0;
    background: none;
    border: none;
    border-radius: var(--sx-r-1);
    color: var(--sx-ink-3);
    cursor: pointer;
    transition: background var(--sx-fast) var(--sx-ease), color var(--sx-fast) var(--sx-ease);
  }
  .x svg { width: .8em; height: .8em; }
  /* El botón de cerrar se ilumina bajo el cursor; --sx-sunk lo hundía. */
  .x:hover { background: var(--sx-accent-soft); color: var(--sx-ink); }

  .body {
    padding: 0 var(--sx-s-5) var(--sx-s-5);
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  footer {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: var(--sx-s-2);
    padding: var(--sx-s-4) var(--sx-s-5);
    background: var(--sx-sunk);
    border-radius: 0 0 var(--sx-r-3) var(--sx-r-3);
  }

  @keyframes scrim-in { from { opacity: 0; } }
  @keyframes panel-in { from { opacity: 0; transform: translateY(var(--sx-s-2)); } }

  /* A tablet in landscape is 1024px wide and is still poked with a thumb, so
     this is keyed to the pointer as much as to the width. The sheet rises from
     the bottom, where the hand already is, and leaves the scrim visible above
     it so the surface underneath is not lost. Nothing goes square: the two top
     corners keep `--sx-r-3`. */
  @media (max-width: 560px), (pointer: coarse) {
    .scrim { padding: var(--sx-s-10) 0 0; align-items: flex-end; }
    .panel, .sm, .md, .lg {
      width: 100%;
      max-height: 100%;
      border-radius: var(--sx-r-3) var(--sx-r-3) 0 0;
      animation-name: sheet-in;
    }
    .x { width: var(--sx-touch); height: var(--sx-touch); margin: calc(var(--sx-s-2) * -1); }
    .x svg { width: 1em; height: 1em; }
    footer { border-radius: 0; padding-bottom: max(var(--sx-s-4), env(safe-area-inset-bottom)); }
  }
  @keyframes sheet-in { from { transform: translateY(var(--sx-s-6)); } }

  @media (prefers-reduced-motion: reduce) {
    .scrim, .panel { animation: none; }
  }
</style>
