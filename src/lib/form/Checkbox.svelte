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

  <span class="box" aria-hidden="true">
    {#if indeterminate}
      <svg viewBox="0 0 12 12"><rect x="2" y="5" width="8" height="2" rx="1" fill="currentColor" /></svg>
    {:else}
      <svg viewBox="0 0 12 12"><path d="M1.5 6.3 4.6 9.4 10.5 2.9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
    {/if}
  </span>

  <span class="say">
    <span class="lb">{label}<slot /></span>
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
    background: var(--sx-surface);
    box-shadow: var(--sx-e-1);
    color: transparent;
    transition: background var(--sx-fast) var(--sx-ease), border-color var(--sx-fast) var(--sx-ease),
                color var(--sx-fast) var(--sx-ease);
  }
  .box svg { width: 12px; height: 12px; }
  .cb:hover .box { border-color: var(--sx-ink-3); }

  input:checked + .box,
  input:indeterminate + .box {
    background: var(--sx-accent);
    border-color: var(--sx-accent);
    color: var(--sx-accent-ink);
  }

  /* The system's one focus rule, moved onto the paint because the input itself
     is a pixel in the corner. */
  input:focus-visible + .box { outline: 2px solid var(--sx-ink); outline-offset: 2px; }
  :global([data-sx-theme='dark']) input:focus-visible + .box,
  :global(.sx-dark) input:focus-visible + .box { outline-color: var(--sx-n-0); }

  .cb.invalid .box { border-color: var(--sx-critical); box-shadow: var(--sx-e-1), 0 0 0 1px var(--sx-critical); }

  .cb.disabled .box { background: var(--sx-sunk); border-color: var(--sx-line); box-shadow: none; }
  .cb.disabled input:checked + .box,
  .cb.disabled input:indeterminate + .box { background: var(--sx-ink-3); border-color: var(--sx-ink-3); }

  .say { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
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
</style>
