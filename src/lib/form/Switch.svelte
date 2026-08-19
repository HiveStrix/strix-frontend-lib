<script context="module">
  let seq = 0;
</script>

<script>
  // SWITCH — a setting that takes effect the moment it is pressed.
  //
  // THE ONE RULE THAT SEPARATES IT FROM CHECKBOX: a switch has no Guardar. If
  // pressing it does not change the world by itself, it is a checkbox wearing a
  // switch, and somebody will flip it, leave, and be wrong about what the system
  // is doing. So this control carries a `busy` state — because «takes effect
  // immediately» means there is a request in flight, and a toggle that snaps
  // back three seconds later with no explanation is worse than one that waits.
  //
  // THE STATE IS NOT A COLOUR. The knob moves, and when it is on it carries a
  // tick; when it is off, a bar. Two shapes, two positions, and the accent fill
  // as the third signal. Turn on `words` where the stakes are high enough that
  // «Sí / No» in text is worth the space.
  //
  //   <Switch bind:checked={auto} label="Leer los documentos automáticamente"
  //           hint="Cada salida y devolución que entre se procesa sola." />
  //
  //   <Switch checked={ai} busy={saving} words
  //           label="Asistencia de IA para campos dudosos"
  //           hint="Se envían números, nunca nombres. Se puede apagar cuando quiera."
  //           on:change={save} />
  //
  // WHEN NOT TO USE IT: inside a form with a Guardar at the bottom — Checkbox.
  // For a destructive or irreversible setting — «marcar como inventario a granel»
  // is forever, and forever deserves a button and a sentence, not a flick. For
  // filtering a list — that is a Pill in pressed state, which lives beside the
  // list it filters.
  import { createEventDispatcher } from 'svelte';

  export let checked = false;
  export let label = '';
  export let hint = '';
  export let disabled = false;
  /** A request is in flight. The control waits instead of lying. */
  export let busy = false;
  /** Add «Sí / No» beside the track. Worth it when somebody has to be sure. */
  export let words = false;
  export let id = '';

  const dispatch = createEventDispatcher();
  const n = ++seq;

  $: sid = id || `sxsw${n}`;
  $: labelId = `${sid}-l`;
  $: hintId = `${sid}-h`;
  $: locked = disabled || busy;

  function toggle() {
    if (locked) return;
    checked = !checked;
    dispatch('change', checked);
  }
</script>

<div class="sw" class:disabled={locked}>
  <!-- El texto togglea igual que el control, como lo haría un <label for> —
       que acá no aplica porque el control es un <button role="switch">, no un
       input. El click es cortesía de puntero; el foco y el teclado siguen
       viviendo solo en el botón, así que no hay segundo tab stop. -->
  <!-- svelte-ignore a11y-no-static-element-interactions a11y-click-events-have-key-events -->
  <div class="say" on:click={toggle}>
    <span class="lb" id={labelId}>{label}<slot /></span>
    {#if hint}<span class="hint" id={hintId}>{hint}</span>{/if}
  </div>

  <div class="ctl">
    {#if words}
      <span class="word" class:on={checked} aria-hidden="true">{checked ? 'Sí' : 'No'}</span>
    {/if}
    <button
      type="button"
      id={sid}
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelId}
      aria-describedby={hint ? hintId : undefined}
      aria-busy={busy || undefined}
      disabled={locked}
      class="track"
      class:on={checked}
      on:click={toggle}
      on:focus
      on:blur
    >
      <span class="knob">
        {#if busy}
          <svg class="spin" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="18" stroke-dashoffset="6" /></svg>
        {:else if checked}
          <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6.2 4.8 9 10 3.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        {:else}
          <svg viewBox="0 0 12 12" aria-hidden="true"><rect x="3" y="5.2" width="6" height="1.6" rx=".8" fill="currentColor" /></svg>
        {/if}
      </span>
    </button>
  </div>
</div>

<style>
  .sw {
    display: flex; align-items: center; justify-content: space-between;
    gap: var(--sx-s-5); min-width: 0; padding: var(--sx-s-1) 0;
  }
  .say { display: flex; flex-direction: column; gap: 2px; min-width: 0; cursor: pointer; }
  .sw.disabled .say { cursor: not-allowed; }
  .lb { font-size: var(--sx-t-sm); color: var(--sx-ink); line-height: 1.45; }
  .hint { font-size: var(--sx-t-xs); color: var(--sx-ink-3); line-height: 1.5; max-width: 60ch; }
  .sw.disabled .lb { color: var(--sx-ink-3); }

  .ctl { display: flex; align-items: center; gap: var(--sx-s-2); flex: none; }
  .word {
    font-size: var(--sx-t-2xs); font-weight: var(--sx-w-semi);
    letter-spacing: .07em; text-transform: uppercase;
    color: var(--sx-ink-3); min-width: 2ch; text-align: right;
  }
  .word.on { color: var(--sx-ink); }

  .track {
    position: relative; flex: none;
    width: 40px; height: 23px; padding: 2px;
    border: 1px solid var(--sx-edge);
    border-radius: var(--sx-r-pill);
    background: var(--sx-sunk);
    cursor: pointer;
    transition: background var(--sx-beat) var(--sx-ease), border-color var(--sx-beat) var(--sx-ease);
  }
  .track:hover:not(:disabled) { border-color: var(--sx-ink-3); }
  .track.on { background: var(--sx-accent); border-color: var(--sx-accent); }
  .track:disabled { cursor: not-allowed; opacity: .55; }

  .knob {
    display: grid; place-items: center;
    width: 17px; height: 17px; border-radius: var(--sx-r-pill);
    /* Ink against sunk in the off state, accent-ink against accent in the on
       state: both pairs invert with the theme on their own, so the knob is
       high-contrast on a cheap monitor in both, and neither state is «the pale
       one». */
    background: var(--sx-ink-3);
    color: var(--sx-surface);
    box-shadow: var(--sx-e-1);
    /* The travel IS the message, so it is the one thing here that moves. Under
       `prefers-reduced-motion` the transition stops and the knob simply IS in
       the other place — which still reads, because the position and the glyph
       are both doing the work. */
    transform: translateX(0);
    transition: transform var(--sx-beat) var(--sx-ease), color var(--sx-fast) var(--sx-ease);
  }
  .track.on .knob { transform: translateX(17px); background: var(--sx-accent-ink); color: var(--sx-accent); }
  .knob svg { width: 11px; height: 11px; }
  .spin { animation: spin 800ms linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (pointer: coarse) {
    .sw { min-height: var(--sx-touch); }
    .track { width: 52px; height: 30px; }
    .knob { width: 24px; height: 24px; }
    .knob svg { width: 14px; height: 14px; }
    .track.on .knob { transform: translateX(22px); }
    .lb { font-size: var(--sx-t-md); }
  }
</style>
