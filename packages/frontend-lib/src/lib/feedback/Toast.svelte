<script>
  // TOAST — what happened, after it happened, without taking the screen.
  //
  // This component is the REGION, not one message: it is mounted once, at the
  // root of a product, and fed the list. That is deliberate. A toast that owns
  // its own fixed container stacks on top of the next one, and the aria-live
  // element has to exist BEFORE the message arrives or screen readers announce
  // nothing — which is exactly the bug that makes a toast a lie for the person
  // who most needs it.
  //
  //   <script>
  //     let toasts = [];
  //     let seq = 0;
  //     const push = (t) => (toasts = [...toasts, { id: ++seq, ...t }]);
  //     const drop = (id) => (toasts = toasts.filter((t) => t.id !== id));
  //   <\/script>
  //   <Toast {toasts} on:dismiss={(e) => drop(e.detail.id)}
  //          on:action={(e) => { undo(); drop(e.detail.id); }} />
  //
  //   push({ text: 'Lectura registrada: BAT001, 1 248 h.' })
  //   push({ tone: 'critical', text: 'No se guardó la orden OT-0042.', action: 'Reintentar' })
  //
  // THREE RULES ABOUT TIME, and they are the whole design:
  //   · a plain toast leaves by itself (`duration`, 6 s);
  //   · one carrying an action stays longer — «Deshacer» that vanishes in six
  //     seconds is a promise the interface does not keep;
  //   · a critical one never leaves by itself. A failure that disappears while
  //     somebody was looking away is a failure that did not happen, as far as
  //     the record is concerned.
  // Hovering or tabbing into the stack pauses every clock in it, because
  // reading is exactly the thing the timer must not interrupt.
  //
  // WHEN NOT: for anything the person must act on before continuing — that is an
  // Alert in the flow or a Dialog. For a validation error — it belongs beside
  // the field, not in the corner. For anything that must be readable later: a
  // toast is not a log. And never for a message longer than one sentence.
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { markOf } from '../marks.js';

  /** [{ id, text, tone?, action?, duration? }] — id must be stable and unique. */
  export let toasts = [];
  /** Milliseconds a plain toast lives. A toast with an action gets double. */
  export let duration = 6000;
  /** Names the region in the accessibility tree. */
  export let label = 'Avisos';
  export let dismissLabel = 'Descartar';

  const dispatch = createEventDispatcher();

  // id → { timer, endsAt, left }
  const clocks = new Map();
  let paused = false;

  // `$:` and not `const`. This closes over the `duration` PROP, and a legacy
  // reactive statement tracks only the names written inside it — as a plain
  // const, `syncClocks(toasts, paused)` never had `duration` in its dependency
  // list, so a product that changed its default toast life mid-session kept the
  // old one until the next message arrived. The same trap the rest of the
  // library documents, found in the library itself.
  $: lifeOf = (t) => {
    if (t.duration !== undefined) return t.duration;
    if (t.tone === 'critical') return 0;   // never by itself
    return t.action ? duration * 2 : duration;
  };

  function start(t, ms) {
    const timer = setTimeout(() => {
      clocks.delete(t.id);
      dispatch('dismiss', { id: t.id, toast: t });
    }, ms);
    clocks.set(t.id, { timer, endsAt: Date.now() + ms, left: ms });
  }

  // Declared with `$:` and given every name it depends on — including `lifeOf`,
  // which is itself reactive, so `duration` reaches this statement too.
  $: syncClocks(toasts, paused, lifeOf);

  function syncClocks(list, isPaused, life) {
    const live = new Set(list.map((t) => t.id));
    for (const [id, c] of clocks) {
      if (!live.has(id)) {
        clearTimeout(c.timer);
        clocks.delete(id);
      }
    }
    for (const t of list) {
      const ms = life(t);
      if (!ms) continue;
      const c = clocks.get(t.id);
      if (isPaused) {
        if (c?.timer) {
          clearTimeout(c.timer);
          clocks.set(t.id, { timer: null, endsAt: 0, left: Math.max(0, c.endsAt - Date.now()) });
        } else if (!c) {
          clocks.set(t.id, { timer: null, endsAt: 0, left: ms });
        }
      } else if (!c) {
        start(t, ms);
      } else if (!c.timer) {
        start(t, c.left);
      }
    }
  }

  onDestroy(() => {
    for (const c of clocks.values()) clearTimeout(c.timer);
    clocks.clear();
  });

  const glyphOf = (t) => markOf(t.tone);
  // Two live regions, because politeness cannot be mixed inside one: a failure
  // interrupts, a confirmation waits its turn. Both are in the DOM from the
  // start, empty, which is what makes the announcement work at all.
  $: loud = toasts.filter((t) => t.tone === 'critical');
  $: calm = toasts.filter((t) => t.tone !== 'critical');
</script>

<div class="stack" role="region" aria-label={label}>
  {#each [{ list: loud, live: 'assertive' }, { list: calm, live: 'polite' }] as lane (lane.live)}
    <ul class="lane" aria-live={lane.live} aria-relevant="additions">
      {#each lane.list as t (t.id)}
        <!-- The clock pauses on the toast itself, not on the stack: the stack is
             `pointer-events: none` so it never eats a click meant for the
             surface underneath, and an element that is not a hit target cannot
             be relied on to hear the pointer arrive. -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <li
          class="toast {t.tone ?? 'neutral'}"
          on:pointerenter={() => (paused = true)}
          on:pointerleave={() => (paused = false)}
          on:focusin={() => (paused = true)}
          on:focusout={() => (paused = false)}
        >
          <svg class="mk" viewBox="0 0 12 12" aria-hidden="true">{@html glyphOf(t)}</svg>
          <p class="text">{t.text}</p>
          {#if t.action}
            <button type="button" class="act" on:click={() => dispatch('action', { id: t.id, toast: t })}>
              {t.action}
            </button>
          {/if}
          <button
            type="button"
            class="x"
            on:click={() => dispatch('dismiss', { id: t.id, toast: t })}
            aria-label={`${dismissLabel}: ${t.text}`}
            title={dismissLabel}
          >
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M3 3l6 6M9 3l-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </li>
      {/each}
    </ul>
  {/each}
</div>

<style>
  .stack {
    position: fixed;
    z-index: var(--sx-z-toast);
    right: var(--sx-s-4);
    bottom: max(var(--sx-s-4), env(safe-area-inset-bottom));
    left: auto;
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-2);
    /* The region is only as wide as its toasts; anything else would swallow the
       clicks of the surface it floats over. */
    width: min(46ch, calc(100vw - var(--sx-s-8)));
    pointer-events: none;
  }
  .lane { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--sx-s-2); }

  .toast {
    pointer-events: auto;
    display: flex;
    align-items: flex-start;
    gap: var(--sx-s-3);
    padding: var(--sx-s-3) var(--sx-s-3) var(--sx-s-3) var(--sx-s-4);
    background: var(--sx-surface);
    color: var(--sx-ink);
    border-radius: var(--sx-r-2);
    /* It floats, so it carries the floating elevation — plus the inset
       highlight, which is what keeps a white card from dissolving into a white
       ground on a cheap monitor. The tone is a bar in the fill, not a border. */
    box-shadow: var(--sx-e-3), var(--sx-e-inset);
    font-size: var(--sx-t-sm);
    line-height: 1.45;
    animation: toast-in var(--sx-beat) var(--sx-ease);
  }
  .positive  { box-shadow: var(--sx-e-3), var(--sx-e-inset), inset 3px 0 0 var(--sx-positive); }
  .attention { box-shadow: var(--sx-e-3), var(--sx-e-inset), inset 3px 0 0 var(--sx-attention); }
  .critical  { box-shadow: var(--sx-e-3), var(--sx-e-inset), inset 3px 0 0 var(--sx-critical); }
  .info      { box-shadow: var(--sx-e-3), var(--sx-e-inset), inset 3px 0 0 var(--sx-info); }

  .mk { flex: none; width: 1em; height: 1em; margin-top: .25em; color: var(--sx-ink-3); }
  .positive .mk  { color: var(--sx-positive); }
  .attention .mk { color: var(--sx-attention); }
  .critical .mk  { color: var(--sx-critical); }
  .info .mk      { color: var(--sx-info); }

  .text { margin: 0; flex: 1; min-width: 0; }

  .act {
    flex: none;
    align-self: center;
    padding: var(--sx-s-1) var(--sx-s-3);
    background: var(--sx-sunk);
    color: var(--sx-ink);
    border: none;
    border-radius: var(--sx-r-pill);
    font-size: var(--sx-t-xs);
    font-weight: var(--sx-w-semi);
    cursor: pointer;
    transition: background var(--sx-fast) var(--sx-ease);
  }
  .act:hover { background: var(--sx-neutral-band); }

  .x {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.7em;
    height: 1.7em;
    padding: 0;
    background: none;
    border: none;
    border-radius: var(--sx-r-1);
    color: var(--sx-ink-3);
    cursor: pointer;
    transition: background var(--sx-fast) var(--sx-ease), color var(--sx-fast) var(--sx-ease);
  }
  .x svg { width: .8em; height: .8em; }
  .x:hover { background: var(--sx-sunk); color: var(--sx-ink); }

  @keyframes toast-in { from { opacity: 0; transform: translateY(var(--sx-s-2)); } }

  /* On a phone the stack spans the column, because a 46ch card floating in the
     corner of a 390px screen is a card with four words per line. */
  @media (max-width: 560px), (pointer: coarse) {
    .stack { left: var(--sx-s-3); right: var(--sx-s-3); width: auto; }
    .act, .x { min-height: var(--sx-touch); min-width: var(--sx-touch); }
    .act { padding-inline: var(--sx-s-4); font-size: var(--sx-t-sm); }
  }

  @media (prefers-reduced-motion: reduce) {
    .toast { animation: none; }
  }
</style>
