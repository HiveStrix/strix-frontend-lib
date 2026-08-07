<script>
  // INPUT — one line of text.
  //
  // The plainest thing in the family, and the one that carries the most weight:
  // a yard types a machine code, a plate, a folio, a person's name into this all
  // day. So it does three things a bare `<input>` does not:
  //
  //   • It hands the identifier register to identifiers. `mono` puts BAT001 and
  //     CL445926 in `.sx-id`, where they are read character by character, and a
  //     0 stops being an O. Never turn it on for a name or a note.
  //   • It has a LOADING state, because «¿este código ya existe?» is a question
  //     with a server on the other end, and a field that looks idle while the
  //     answer is in flight is how two BAT004 get created.
  //   • It never invents its own chrome: the box, the ring, the error and the
  //     provenance line all belong to Field, so an Input in a form lines up with
  //     a Select and a DateInput without anybody arranging it.
  //
  //   <Input label="Código" bind:value={code} mono required
  //          hint="Como está pintado en la máquina."
  //          error={taken ? `Ese código ya lo tiene ${taken.name}.` : ''}
  //          fix="Probá con el siguiente número libre: BAT023." />
  //
  //   <Input label="Buscar" type="search" bind:value={q} clearable
  //          placeholder="Código, placa o folio…">
  //     <svg slot="lead" …/>
  //   </Input>
  //
  // WHEN NOT TO USE IT: for a figure — NumberInput knows about units, colones
  // and grouping. For a date — DateInput gives the platform's picker, which is
  // the only date entry that works with a thumb. For one of a known list —
  // Select under a dozen, Combobox over it. A free-text box where a list belongs
  // is how a fleet ends up with «Heredia», «heredia» and «HEREDIA».
  import Field from './Field.svelte';
  import { createEventDispatcher } from 'svelte';

  export let value = '';
  /** text | search | email | tel | url | password */
  export let type = 'text';
  export let label = '';
  export let hint = '';
  export let error = '';
  export let fix = '';
  export let warning = '';
  export let required = false;
  export let optional = false;
  export let disabled = false;
  export let readonly = false;
  export let placeholder = '';
  export let name = undefined;
  export let autocomplete = undefined;
  export let inputmode = undefined;
  export let maxlength = undefined;
  export let spellcheck = undefined;
  /** The identifier register: codes, plates, cédulas. Never prose, never names. */
  export let mono = false;
  /** A question with a server on the other end is still a question. */
  export let loading = false;
  export let loadingLabel = 'Verificando…';
  /** A control that clears itself. Worth it on a search, noise on a name. */
  export let clearable = false;
  export let id = '';
  export let origin = '';
  export let originValue = '';
  export let changed = false;

  const dispatch = createEventDispatcher();

  let el;
  export const focus = () => el?.focus();

  // `type` cannot be dynamic under `bind:value`, and the type of a text box is
  // exactly the thing a caller sets — so the binding is written out by hand.
  // The prop is still two-way for the parent: assigning to it is what `bind:`
  // listens to.
  function onInput(e) {
    value = e.currentTarget.value;
  }

  function clear() {
    value = '';
    dispatch('clear');
    el?.focus();
  }

  $: showClear = clearable && !!value && !disabled && !readonly;
</script>

<Field
  {label} {hint} {error} {fix} {warning} {required} {optional} {disabled} {readonly}
  {id} {origin} {originValue} {changed}
  on:revert
  let:id={fid}
  let:describedBy
  let:invalid
>
  <slot name="lead" />

  <input
    bind:this={el}
    {type}
    id={fid}
    {name}
    {value}
    {placeholder}
    {disabled}
    {readonly}
    {autocomplete}
    {inputmode}
    {maxlength}
    {spellcheck}
    class:mono
    class:sx-id={mono}
    required={required || undefined}
    aria-describedby={describedBy}
    aria-invalid={invalid || undefined}
    aria-busy={loading || undefined}
    on:input={onInput}
    on:input
    on:change
    on:focus
    on:blur
    on:keydown
  />

  {#if loading}
    <!-- The spinner is killed by `prefers-reduced-motion`, so the word is what
         actually carries the state and the spinner is the decoration. -->
    <span class="busy">
      <svg class="spin" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="26" stroke-dashoffset="9" />
      </svg>
      {loadingLabel}
    </span>
  {/if}

  {#if showClear}
    <button type="button" class="icon" on:click={clear} aria-label={`Limpiar ${label || 'el campo'}`}>
      <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
    </button>
  {/if}

  <slot name="trail" />

  <slot name="action" slot="action" />
</Field>

<style>
  /* `.sx-id` brings the mono family and the tighter tracking; the figures still
     have to be told to line up, because an identifier is compared to another
     identifier one character at a time. */
  input.mono { font-variant-numeric: tabular-nums lining-nums slashed-zero; }

  .busy {
    display: inline-flex; align-items: center; gap: var(--sx-s-2); flex: none;
    align-self: center; font-size: var(--sx-t-xs); color: var(--sx-ink-3); white-space: nowrap;
  }
  .spin { width: 13px; height: 13px; animation: spin 800ms linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .icon {
    display: inline-flex; align-items: center; justify-content: center; flex: none;
    align-self: center; width: var(--sx-s-6); height: var(--sx-s-6);
    padding: 0; border: 0; border-radius: var(--sx-r-pill);
    background: none; color: var(--sx-ink-3); cursor: pointer;
    transition: background var(--sx-fast) var(--sx-ease), color var(--sx-fast) var(--sx-ease);
  }
  .icon:hover { background: var(--sx-sunk); color: var(--sx-ink); }
  .icon svg { width: 14px; height: 14px; }

  @media (pointer: coarse) {
    .icon { width: var(--sx-touch); height: var(--sx-touch); margin-right: calc(var(--sx-s-2) * -1); }
  }
</style>
