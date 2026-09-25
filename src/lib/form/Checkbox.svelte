<script context="module">
  let seq = 0;
</script>

<script>
  // CHECKBOX — a yes that is part of a bigger yes.
  //
  // It does not act. It sets a value that something else — Guardar, Registrar,
  // Generar la orden — will act on. That is the whole difference from Switch,
  // and getting it wrong is how somebody ticks a box, walks away, and finds out
  // a week later that nothing was saved.
  //
  // Its own label sits beside it, so it is NOT wrapped in a Field: a Field would
  // put the name above the box and then the box would name it again. When
  // several belong together, wrap the group in `<Field group>` and give the
  // container `role="group" aria-labelledby={labelId}`.
  //
  // THE MARK IS A SHAPE. A tick, and for the third state a bar — legible at 9px,
  // legible in a photocopy, legible to somebody who cannot tell the fill from
  // the ground. The accent is the second signal, never the only one.
  //
  //   <Checkbox bind:checked={billable} label="Cobrable al cliente"
  //             hint="Entra en la factura de la orden con el 13 % de IVA." />
  //
  //   <Checkbox checked={allOn} indeterminate={someOn}
  //             label="Todas las actividades" on:change={toggleAll} />
  //
  // WHEN NOT TO USE IT: for something that takes effect the moment it is pressed
  // — that is Switch. For one of several mutually exclusive answers — that is
  // Radio, or ChoiceCards when each answer needs a sentence. For a single
  // required consent that blocks a submit, a checkbox is right, but the error
  // belongs on the form's own message, not floating beside the box.
  import { createEventDispatcher } from 'svelte';

  export let checked = false;
  /** Neither on nor off: some of the things underneath are ticked. */
  export let indeterminate = false;
  export let label = '';
  /** true ⇒ la etiqueta nombra la casilla pero no se dibuja (una celda de tabla). */
  export let labelHidden = false;
  /** What ticking it will actually cause. One line, under the label. */
  export let hint = '';
  export let value = undefined;
  export let name = undefined;
  export let disabled = false;
  export let required = false;
  /** Colour is the second signal; the sentence under the group is the first. */
  export let invalid = false;
  export let id = '';

  const dispatch = createEventDispatcher();
  const n = ++seq;

  $: cid = id || `sxcx${n}`;
  $: hintId = `${cid}-h`;

  let el;
  // The third state exists only as a DOM property — there is no attribute for
  // it — so it has to be pushed onto the node every time it changes.
  $: if (el) el.indeterminate = indeterminate;

  function onChange(e) {
    checked = e.currentTarget.checked;
    dispatch('change', checked);
  }
</script>

<label class="cb" class:disabled class:invalid>
  <input
    bind:this={el}
    type="checkbox"
    id={cid}
    {name}
    {value}
    {disabled}
    {checked}
    required={required || undefined}
    aria-describedby={hint ? hintId : undefined}
    aria-invalid={invalid || undefined}
    on:change={onChange}
    on:focus
    on:blur
  />

  <!-- Both marks are always drawn and CSS decides which one shows, off the
       input's own `:checked` / `:indeterminate`. Swapping them with an {#if}
       would create each mark fresh, and a fresh element has no «before» to
       transition from — the tick could not draw itself. -->
  <span class="box" aria-hidden="true">
    <svg viewBox="0 0 12 12">
      <rect class="bar" x="2" y="5" width="8" height="2" rx="1" fill="currentColor" />
      <path class="tk" pathLength="1" d="M1.5 6.3 4.6 9.4 10.5 2.9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </span>

  <span class="say">
    <span class="lb" class:sr={labelHidden}>{label}<slot /></span>
    {#if hint}<span class="hint" id={hintId}>{hint}</span>{/if}
  </span>
</label>

<style>
  .cb {
    position: relative;
    display: flex; align-items: flex-start; gap: var(--sx-s-3);
    padding: var(--sx-s-1) 0; cursor: pointer; min-width: 0;
  }
  .cb.disabled { cursor: not-allowed; }

  /* The real control, kept where it is: it stays in the tab order, it answers to
     the space bar, it is what a screen reader reads, and it is what a form
     submits. Only its paint is replaced. */
  input {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  .box {
    position: relative; flex: none;
    display: grid; place-items: center;
    width: 19px; height: 19px; margin-top: 1px;
    border: 1px solid var(--sx-edge);
    border-radius: var(--sx-r-1);
    background: var(--sx-field);
    box-shadow: var(--sx-e-field);
    color: transparent;
    transition: background var(--sx-fast) var(--sx-ease), border-color var(--sx-fast) var(--sx-ease),
                color var(--sx-fast) var(--sx-ease),
                scale 420ms var(--sx-ease-spring, cubic-bezier(.34, 1.56, .64, 1));
  }
  .box svg { width: 12px; height: 12px; }
  .cb:hover .box { border-color: var(--sx-ink-3); }

  input:checked + .box,
  input:indeterminate + .box {
    background: var(--sx-accent);
    border-color: var(--sx-accent);
    color: var(--sx-accent-ink);
  }

  /* The press. Held, the box gives a little; let go, it springs back past its
     size and settles — that release IS the moment it ticks, so the pop lands
     with the mark. The row is the target, so the whole row presses the box. */
  .cb:not(.disabled):active .box,
  .cb:not(.disabled) input:active + .box {
    scale: .88;
    transition: background var(--sx-fast) var(--sx-ease), border-color var(--sx-fast) var(--sx-ease),
                color var(--sx-fast) var(--sx-ease),
                scale 110ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1));
  }

  /* The tick DRAWS itself, stroke first to last, the way a hand makes one.
     `pathLength="1"` makes the dash the whole mark whatever its real length;
     the rest offset (1.1) sits inside the gap so no round cap leaks a dot.
     Unticking retracts faster than ticking draws: leaving is quicker. */
  .tk {
    stroke-dasharray: 1 2;
    stroke-dashoffset: 1.1;
    transition: stroke-dashoffset 130ms var(--sx-ease-in, cubic-bezier(.5, 0, .75, 0));
  }
  input:checked:not(:indeterminate) + .box .tk {
    stroke-dashoffset: 0;
    /* The house ease, not the expo glide: the expo would lay the short leg
       down in a single frame, and the stroke has to be SEEN travelling. */
    transition: stroke-dashoffset 340ms var(--sx-ease) 40ms;
  }
  /* The third state grows out from its middle — «some», spreading. */
  .bar {
    transform-box: fill-box;
    transform-origin: center;
    transform: scaleX(0);
    transition: transform 140ms var(--sx-ease-in, cubic-bezier(.5, 0, .75, 0));
  }
  input:indeterminate + .box .bar {
    transform: scaleX(1);
    transition: transform 280ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1));
  }

  /* The system's one focus rule, moved onto the paint because the input itself
     is a pixel in the corner. */
  input:focus-visible + .box { outline: 2px solid var(--sx-ink); outline-offset: 2px; }
  :global([data-sx-theme='dark']) input:focus-visible + .box,
  :global(.sx-dark) input:focus-visible + .box { outline-color: var(--sx-n-0); }

  .cb.invalid .box { border-color: var(--sx-critical); box-shadow: var(--sx-e-field), 0 0 0 1px var(--sx-critical); }

  /* Mismo arreglo que Radio.svelte, con el mismo número detrás: --sx-line
     contra --sx-sunk mide 1.25:1 en claro y 1.11:1 en oscuro —un anillo que
     se funde con su propio relleno—, y esta fórmula era idéntica, char por
     char, a la de Radio antes de su arreglo, así que heredaba el mismo
     defecto sin que el barrido lo hubiera visto todavía acá (el catálogo no
     tiene una demo de checkbox deshabilitado-sin-marcar para mostrarlo).
     --sx-edge es el token que este sistema ya mide a 3:1 para el límite de
     un control; ver Radio.svelte para los números completos. */
  .cb.disabled .box { background: var(--sx-sunk); border-color: var(--sx-edge); box-shadow: none; }
  .cb.disabled input:checked + .box,
  .cb.disabled input:indeterminate + .box { background: var(--sx-ink-3); border-color: var(--sx-ink-3); }

  .say { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .sr {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }
  .lb { font-size: var(--sx-t-sm); color: var(--sx-ink); line-height: 1.45; }
  .cb.disabled .lb { color: var(--sx-ink-3); }
  .hint { font-size: var(--sx-t-xs); color: var(--sx-ink-3); line-height: 1.5; max-width: 60ch; }

  /* The target is the whole row, not the 19px square: a thumb in a yard does not
     hit a 19px square, and the label is already part of the control. */
  @media (pointer: coarse) {
    .cb { min-height: var(--sx-touch); align-items: center; padding: var(--sx-s-2) 0; }
    .box { width: 22px; height: 22px; margin-top: 0; }
    .box svg { width: 14px; height: 14px; }
    .lb { font-size: var(--sx-t-md); }
  }

  /* The marks are simply there or not; the box does not give under a press. */
  @media (prefers-reduced-motion: reduce) {
    .box, .tk, .bar,
    input:checked:not(:indeterminate) + .box .tk,
    input:indeterminate + .box .bar { transition: none; }
    .cb:not(.disabled):active .box,
    .cb:not(.disabled) input:active + .box { scale: none; transition: none; }
  }
</style>
