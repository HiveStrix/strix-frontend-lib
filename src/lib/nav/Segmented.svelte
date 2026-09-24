<script>
  // SEGMENTED — the same content, seen another way.
  //
  // WHEN IT IS RIGHT, AND WHEN TABS ARE
  //
  //   Use SEGMENTED when the choice changes HOW the same thing is drawn: the
  //   horizon of a timeline (30 días / 3 meses / 6 meses / 1 año), the unit of a
  //   counter (km / horas), the density of a table. Nothing is swapped, so
  //   there is no panel, no `aria-controls` that could point at anything, and
  //   no roving focus. `role="tab"` here would advertise a pattern that is not
  //   implemented — which is exactly the kind of aria that is worse than none.
  //
  //   Use TABS when the choice changes WHAT you are looking at: different
  //   records, different columns, something you could deep-link to.
  //
  // So this is a group of toggle buttons and it says so: `role="group"` with a
  // name, and `aria-pressed` on each button. `aria-pressed` says precisely what
  // the fill says, which is the whole test for whether an aria attribute is
  // true. Every button is a normal tab stop — there is no roving tabindex,
  // because there is no composite widget here to rove inside.
  //
  //   <Segmented label="Horizonte" bind:value items={[
  //     { key: 30,  label: '30 días' },
  //     { key: 90,  label: '3 meses' },
  //     { key: 180, label: '6 meses' },
  //     { key: 365, label: '1 año' }
  //   ]} on:change={(e) => redraw(e.detail.key)} />
  //
  // TWO TO FOUR OPTIONS, all of them short and all of them visible at once —
  // that is the promise of the shape. Five long labels on a 390px column is a
  // select, not a segmented control, and it is honest to use one.
  //
  // THE OPTIONS MUST BE MUTUALLY EXCLUSIVE AND EXHAUSTIVE. There is no «none»
  // state: pressing the pressed segment does nothing, because a view has to be
  // drawn some way. If «ninguno» is a real answer you want, that is FilterChips.
  import { createEventDispatcher, onMount, tick } from 'svelte';

  /** [{ key, label, hint? }] — key may be any primitive; it is compared with ===. */
  export let items = [];
  /** The pressed key. Bindable. */
  export let value = undefined;
  /** The name of the group. A control with no name is a control nobody can ask for. */
  export let label = '';
  /** sm for a dense toolbar, md for a bar of its own. */
  export let size = 'md';
  /** Fill the width and share it equally. For a 390px column, usually yes. */
  export let full = false;
  /** The whole group is unavailable — while its data is loading, typically. */
  export let disabled = false;

  const dispatch = createEventDispatcher();

  // A statement, not a `const`: `value` has to appear in the dependency list of
  // everything that reads this, or the fill stops following the state.
  $: isOn = (k) => k === value;

  function pick(k) {
    if (disabled || k === value) return;
    value = k;
    dispatch('change', { key: k });
  }

  // ── The thumb ────────────────────────────────────────────────────────────
  // ONE raised pill that TRAVELS to the new option, instead of one segment
  // going dark while another lights up: the eye follows it from one side to
  // the other and reads «this replaces that». It is measured off the pressed
  // button with offsets, not getBoundingClientRect — offsets are where the
  // button IS in the layout, unbent by any transform an ancestor is animating.
  //
  // Only a new choice travels. The first placement is drawn in place (the
  // thumb is created already there — a fresh element has nothing to glide
  // from), and a resize, a web font landing or a changed label re-seat it
  // without travel, so dragging a window never leaves it trailing behind.
  // Until it has measured once — or if it cannot (hidden, zero width) — the
  // pressed segment paints its own fill, exactly as before.
  let track;
  let thumb = null;
  let travel = false;
  let ro = null;
  const watched = new Set();

  function place(glide) {
    const on = track?.querySelector('[aria-pressed="true"]');
    if (!on || !on.offsetWidth) { thumb = null; return; }
    const next = { x: on.offsetLeft, w: on.offsetWidth, h: on.offsetHeight };
    if (thumb && next.x === thumb.x && next.w === thumb.w && next.h === thumb.h) return;
    travel = glide && !!thumb;
    thumb = next;
    watch();
  }

  // Every segment is watched, not just the pressed one: a neighbour whose label
  // grows pushes the pressed one sideways without changing its size. A node is
  // observed once — observing it again re-fires the observer, which would
  // place, which would observe: a loop.
  function watch() {
    if (!ro || !track) return;
    for (const el of watched) if (!el.isConnected) { ro.unobserve(el); watched.delete(el); }
    for (const el of track.querySelectorAll('.sg')) {
      if (!watched.has(el)) { ro.observe(el); watched.add(el); }
    }
  }

  // The choice (or the list) changed: glide, once the DOM has the new pressed.
  $: if (track) follow(value, items);
  async function follow() {
    await tick();
    place(true);
  }

  onMount(() => {
    if (typeof ResizeObserver === 'function') {
      ro = new ResizeObserver(() => place(false));
      ro.observe(track);
      watch();
    }
    document.fonts?.ready.then(() => place(false));
    return () => ro?.disconnect();
  });
</script>

<div
  class="seg {size}"
  class:full
  class:off={disabled}
  class:glide={!!thumb}
  role="group"
  aria-label={label || undefined}
  bind:this={track}
>
  {#if thumb}
    <span
      class="thumb"
      class:travel
      aria-hidden="true"
      style:width="{thumb.w}px"
      style:height="{thumb.h}px"
      style:transform="translate({thumb.x}px, -50%)"
    ></span>
  {/if}
  {#each items as it (it.key)}
    <button
      type="button"
      class="sg"
      class:on={isOn(it.key)}
      aria-pressed={isOn(it.key)}
      disabled={disabled || undefined}
      title={it.hint || undefined}
      on:click={() => pick(it.key)}
    >{it.label}</button>
  {/each}
</div>

<style>
  /* A sunk track with one raised segment: the pressed option looks like the
     surface the content is on, the rest look like the hole it sits in. That is
     the whole visual argument, and it reads at a glance in both themes without
     a single colour. */
  .seg {
    /* The thumb is placed against the track, and scrolls with it. */
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--sx-s-1);
    padding: 3px;
    /* LA MISMA ALTURA QUE UN CAMPO, PORQUE COMPARTE FILA CON ELLOS.
       `Segmented` no es un `Field` y no tiene su `dense`, pero su `size` dice
       lo mismo con otras palabras: `sm` para una fila apretada, `md` para una
       barra propia. Sin altura propia resolvía la suya por el contenido —30px
       en `sm` contra los 32 de un campo denso, 3 controles a 3 alturas en la
       misma fila— y eso es exactamente lo que hace que un formulario se lea
       desordenado. `min-height`, no `height`: una etiqueta que envuelve en un
       idioma largo puede necesitar más. */
    min-height: var(--sx-s-10);
    background: var(--sx-sunk);
    box-shadow: var(--sx-e-sunk);
    border-radius: var(--sx-r-pill);
    max-width: 100%;
    /* Long labels on a narrow column scroll rather than wrap: a segmented
       control that wraps to two lines has stopped being one control. */
    overflow-x: auto;
    scrollbar-width: none;
    /* FOUND ON THE REAL CATALOGUE, 390px: four options («30 días · 3 meses ·
       6 meses · 1 año») do not fit, `scrollbar-width: none` hides the one
       native hint that there is more, and the track just cuts «1 año» to
       «1 añ» at the box edge — a word that looks broken, not a control that
       scrolls. The mask fades the last ~14px to transparent instead of a hard
       edge, so a clipped label reads as «more, scroll for it» the way a
       feathered edge always has, rather than as a missing letter. Left ~14px
       too, for the symmetric case once scrolled. Always on, not only past
       overflow — a control that already fits loses only its own rounded
       corner's last couple of pixels, which the pill shape already curves
       away; nothing legible is lost. */
    -webkit-mask-image: linear-gradient(to right, transparent, #000 14px, #000 calc(100% - 14px), transparent);
    mask-image: linear-gradient(to right, transparent, #000 14px, #000 calc(100% - 14px), transparent);
  }
  .seg::-webkit-scrollbar { display: none; }

  .full { display: flex; width: 100%; }
  .full .sg { flex: 1 1 0; }

  .sg {
    /* Above the thumb, which is drawn under every label. */
    position: relative;
    z-index: 1;
    flex: none;
    padding: var(--sx-s-2) var(--sx-s-4);
    border: 0;
    border-radius: var(--sx-r-pill);
    background: none;
    color: var(--sx-ink-3);
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-semi);
    line-height: 1.25;
    white-space: nowrap;
    cursor: pointer;
    /* The label inks in on the thumb's own clock, so the word lights as the
       pill reaches it rather than before it has left the last one. */
    transition: background var(--sx-fast) var(--sx-ease),
                color 280ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1)),
                scale 380ms var(--sx-ease-spring, cubic-bezier(.34, 1.56, .64, 1));
  }

  .sg:hover:not(:disabled):not(.on) { color: var(--sx-ink); }
  /* A press gives under the finger and springs back. */
  .sg:active:not(:disabled) {
    scale: .95;
    transition: background var(--sx-fast) var(--sx-ease),
                color 280ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1)),
                scale 90ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1));
  }

  .sg.on {
    background: var(--sx-surface);
    color: var(--sx-ink);
    box-shadow: var(--sx-e-1);
  }
  /* The thumb carries the raised fill, so the pressed segment stops drawing
     its own — one pill, never two. */
  .glide .sg.on { background: none; box-shadow: none; }

  /* Centred by the same rule that centres the segments (align-items), not by
     a measured top: offsets are whole pixels and the track is not. */
  .thumb {
    position: absolute;
    top: 50%;
    left: 0;
    border-radius: var(--sx-r-pill);
    background: var(--sx-surface);
    box-shadow: var(--sx-e-1);
    pointer-events: none;
  }
  /* The trip glides; the SIZE springs. A spring on the trip overshoots by a
     tenth of the distance — 17px on a 170px crossing — and this track clips
     (the scroll box and the feathered edges above), so the pill would bury
     itself in the wall at either end. On the width the overshoot is a tenth
     of the difference between two labels: a small elastic give as the pill
     settles onto its word, which is where the life is. */
  .thumb.travel {
    transition:
      transform 460ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1)),
      width 460ms var(--sx-ease-spring, cubic-bezier(.34, 1.56, .64, 1)),
      height 460ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1));
  }

  .seg.sm { min-height: var(--sx-s-8); }
  .sm .sg { padding: var(--sx-s-1) var(--sx-s-3); font-size: var(--sx-t-xs); }

  .off { opacity: .5; }
  .sg:disabled { cursor: not-allowed; }

  /* Repeated here because a Core in a shadow root never loads base.css. Inset,
     so the ring is not clipped by the track's own overflow. */
  .sg:focus-visible {
    outline: 2px solid var(--sx-ink);
    outline-offset: -3px;
    border-radius: var(--sx-r-pill);
  }

  @media (pointer: coarse) {
    .sg { min-height: var(--sx-touch); padding-inline: var(--sx-s-5); }
  }

  @media (prefers-reduced-motion: reduce) {
    .sg { transition: none; }
    /* The thumb jumps to the new option: same place, no journey. */
    .sg:active:not(:disabled) { scale: none; transition: none; }
    .thumb.travel { transition: none; }
  }
</style>
