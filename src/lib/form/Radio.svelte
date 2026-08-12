<script context="module">
  let seq = 0;
</script>

<script>
  // RADIO — one of a few, where the few are worth seeing at once.
  //
  // The argument for a radio over a Select is not taste, it is arithmetic: a
  // select hides every option but one behind a click, so it costs a click to
  // COMPARE. Under about five options that somebody has to weigh — preventiva /
  // correctiva, kilómetros / horas / ciclos — the comparison is the decision, so
  // the options stay on the screen.
  //
  // IT IS A REAL `<input type="radio">`. That is what buys the arrow-key
  // behaviour, the single tab stop for the whole group, the announcement of
  // «2 de 4», and the form submit. Every hand-rolled version of this in the wild
  // is a worse version of what the browser already ships.
  //
  //   <Field group label="¿Cómo se mide el intervalo?" let:labelId let:describedBy>
  //     <div role="radiogroup" aria-labelledby={labelId} aria-describedby={describedBy}>
  //       <Radio bind:group={by} value="cal"  name="by" label="Por calendario" />
  //       <Radio bind:group={by} value="km"   name="by" label="Por kilómetros" />
  //       <Radio bind:group={by} value="both" name="by" label="Lo que ocurra primero"
  //              hint="Es lo normal en flota: el camión que no rueda igual envejece." />
  //     </div>
  //   </Field>
  //
  // `name` is not optional in practice. It is what makes the browser treat the
  // buttons as one group, and without it the arrow keys wander into the next
  // group on the page.
  //
  // WHEN NOT TO USE IT: over about six options — that is Select, or Combobox.
  // When each option needs a sentence of explanation and a badge to be chosen
  // honestly — that is ChoiceCards, which is this control with room to argue.
  // And never for an on/off: a group of one radio cannot be un-chosen.
  import { createEventDispatcher } from 'svelte';

  /** The group's current value. Two-way: `bind:group`. */
  export let group = undefined;
  export let value = undefined;
  /** Shared by every radio in the group. Without it they are not a group. */
  export let name = undefined;
  export let label = '';
  export let hint = '';
  export let disabled = false;
  /**
   * Draws the ring. Deliberately NOT `aria-invalid` on the input: a single radio
   * cannot be invalid — the GROUP is, and the group's Field is what says so and
   * what carries the recovery.
   */
  export let invalid = false;
  export let id = '';

  const dispatch = createEventDispatcher();
  const n = ++seq;

  $: rid = id || `sxrd${n}`;
  $: hintId = `${rid}-h`;
  $: checked = group === value;

  function onChange() {
    group = value;
    dispatch('change', value);
  }
</script>

<label class="rd" class:disabled class:invalid>
  <input
    type="radio"
    id={rid}
    {name}
    {value}
    {disabled}
    {checked}
    aria-describedby={hint ? hintId : undefined}
    on:change={onChange}
    on:focus
    on:blur
  />

  <span class="dot" aria-hidden="true"></span>

  <span class="say">
    <span class="lb">{label}<slot /></span>
    {#if hint}<span class="hint" id={hintId}>{hint}</span>{/if}
  </span>
</label>

<style>
  .rd {
    position: relative;
    display: flex; align-items: flex-start; gap: var(--sx-s-3);
    padding: var(--sx-s-1) 0; cursor: pointer; min-width: 0;
  }
  .rd.disabled { cursor: not-allowed; }

  input {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  /* Round, and the checkbox is square: the two shapes say «one of these» and
     «any of these» before a single label has been read. */
  .dot {
    position: relative; flex: none;
    width: 19px; height: 19px; margin-top: 1px;
    border: 1px solid var(--sx-edge);
    border-radius: var(--sx-r-pill);
    background: var(--sx-surface);
    box-shadow: var(--sx-e-1);
    transition: border-color var(--sx-fast) var(--sx-ease), box-shadow var(--sx-fast) var(--sx-ease);
  }
  .dot::after {
    content: ''; position: absolute; inset: 4px;
    border-radius: var(--sx-r-pill);
    background: var(--sx-accent);
    transform: scale(0);
    transition: transform var(--sx-fast) var(--sx-ease);
  }
  .rd:hover .dot { border-color: var(--sx-ink-3); }
  input:checked + .dot { border-color: var(--sx-accent); }
  input:checked + .dot::after { transform: scale(1); }

  input:focus-visible + .dot { outline: 2px solid var(--sx-ink); outline-offset: 2px; }
  :global([data-sx-theme='dark']) input:focus-visible + .dot,
  :global(.sx-dark) input:focus-visible + .dot { outline-color: var(--sx-n-0); }

  .rd.invalid .dot { border-color: var(--sx-critical); box-shadow: var(--sx-e-1), 0 0 0 1px var(--sx-critical); }

  .rd.disabled .dot { background: var(--sx-sunk); border-color: var(--sx-line); box-shadow: none; }
  .rd.disabled input:checked + .dot::after { background: var(--sx-ink-3); }

  .say { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .lb { font-size: var(--sx-t-sm); color: var(--sx-ink); line-height: 1.45; }
  .rd.disabled .lb { color: var(--sx-ink-3); }
  .hint { font-size: var(--sx-t-xs); color: var(--sx-ink-3); line-height: 1.5; max-width: 60ch; }

  @media (pointer: coarse) {
    .rd { min-height: var(--sx-touch); align-items: center; padding: var(--sx-s-2) 0; }
    .dot { width: 22px; height: 22px; margin-top: 0; }
    .dot::after { inset: 5px; }
    .lb { font-size: var(--sx-t-md); }
  }
</style>
