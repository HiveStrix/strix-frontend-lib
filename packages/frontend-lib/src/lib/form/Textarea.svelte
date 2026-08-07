<script>
  // TEXTAREA — the note a technician writes with one hand.
  //
  // «Se cambió el retén del cilindro. La manguera de retorno está reseca, hay
  // que pedirla.» That paragraph is the only record of why a machine cost what
  // it cost, so this box is generous by default and stays out of the way.
  //
  // THE COUNTER APPEARS ONLY WHEN IT STARTS TO MATTER. A «0 / 500» sitting under
  // an empty box teaches nobody anything and asks to be looked at four hundred
  // times for nothing. It shows up in the last stretch — the greater of twenty
  // characters or 15 % of the budget — turns critical when the budget is spent,
  // and announces itself at three round numbers instead of on every keystroke,
  // because a live region that fires per character is a live region a screen
  // reader user turns off.
  //
  // THE LIMIT IS SOFT BY DEFAULT, AND THAT IS THE ARGUMENT. `maxlength` on the
  // element silently eats the tail of a paste — somebody pastes the whole
  // failure report, sees it land, and only the first 500 characters were kept.
  // A soft limit lets the text arrive, says the field is over, and leaves the
  // form to refuse the submit with a sentence. Pass `hard` when the column
  // really cannot take it.
  //
  // IT GROWS WITHOUT MEASURING ANYTHING. The box is a one-cell grid holding the
  // textarea and an invisible copy of its own text; the copy is what has a
  // natural height, and the textarea is stretched onto it. No scrollHeight, no
  // reflow per keystroke, and nothing to keep in sync.
  //
  // The version that measured cost an afternoon and is worth writing down:
  // setting `el.style.height` by hand from a reactive statement fights Svelte's
  // own bookkeeping of inline styles, and the write schedules the flush that
  // re-runs the statement that does the write. It pins a core until the tab is
  // closed. If you ever need a layout measurement in this library, take it in an
  // event handler — never in a `$:`.
  //
  //   <Textarea label="Qué se hizo" bind:value={notes} limit={500}
  //             hint="Lo que otro técnico necesitaría saber dentro de seis meses."
  //             rows={5} />
  //
  // WHEN NOT TO USE IT: for anything that will later be filtered, counted or
  // compared. A failure mode goes in a Select against `FCM-01…07`, not in prose
  // that says «se quemó» in nine spellings. Free text is where information goes
  // to stop being data.
  import Field from './Field.svelte';

  export let value = '';
  /** The floor, in lines. The box never starts smaller than this. */
  export let rows = 4;
  /** The budget. Shown late, never enforced unless `hard`. 0 ⇒ no budget. */
  export let limit = 0;
  /** true ⇒ a real `maxlength`. Reserve it for a column that truly cannot take more. */
  export let hard = false;
  /** Grow with the text up to `maxRows`, then scroll. */
  export let autogrow = true;
  export let maxRows = 14;

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
  export let id = '';
  export let origin = '';
  export let originValue = '';
  export let changed = false;

  let el;
  export const focus = () => el?.focus();

  $: len = (value ?? '').length;
  $: remaining = limit ? limit - len : null;
  $: over = remaining !== null && remaining < 0;
  // The last stretch, never the whole way. Twenty characters is about a line of
  // typing; on a long budget 15 % is the more useful warning.
  $: showCount = limit > 0 && remaining <= Math.max(20, Math.round(limit * 0.15));

  // Three round announcements instead of five hundred. An empty string clears
  // the region without saying anything, which is the point.
  $: srCount = !limit
    ? ''
    : over
      ? `Te pasaste del máximo por ${-remaining}.`
      : remaining === 0
        ? 'Llegaste al máximo.'
        : remaining === 10 || remaining === 20
          ? `Quedan ${remaining} caracteres.`
          : '';

  function onInput(e) {
    value = e.currentTarget.value;
  }
</script>

<Field
  {label} {hint} {error} {fix} {warning} {required} {optional} {disabled} {readonly}
  {id} {origin} {originValue} {changed}
  on:revert
  let:id={fid}
  let:describedBy
  let:invalid
>
  <!-- The invisible twin lives on this element's ::after. `pre-wrap` is what
       makes the attribute's own newlines break, which is why no script has to
       count lines. -->
  <div
    class="grow"
    class:auto={autogrow}
    data-value={value ?? ''}
    style:--max-rows={autogrow ? String(maxRows) : null}
  >
    <textarea
      bind:this={el}
      id={fid}
      {name}
      {rows}
      {placeholder}
      {disabled}
      {readonly}
      {value}
      maxlength={hard && limit ? limit : undefined}
      required={required || undefined}
      aria-describedby={[describedBy, showCount ? `${fid}-c` : ''].filter(Boolean).join(' ') || undefined}
      aria-invalid={invalid || over || undefined}
      on:input={onInput}
      on:input
      on:change
      on:focus
      on:blur
      on:keydown
    ></textarea>
  </div>

  <!-- `let:` on the slotted element, not on <Field>: a named slot only sees the
       props handed to it, and the ones on the component belong to the default. -->
  <span slot="meta" let:id={fid} class="count" class:show={showCount}>
    {#if showCount}
      <span id={`${fid}-c`} class="fig sx-num" class:over aria-hidden="true">
        {over ? `${-remaining} de más` : `quedan ${remaining}`}
      </span>
    {/if}
    <span class="sr" role="status">{srCount}</span>
  </span>

  <slot name="action" slot="action" />
</Field>

<style>
  /* The typography is declared HERE and inherited by both the textarea and its
     twin, so the two can never disagree about how tall a line is — which is the
     only way this technique can go wrong. */
  .grow {
    flex: 1 1 auto; min-width: 0;
    display: grid;
    font-size: var(--sx-t-md);
    line-height: 1.45;
  }

  .grow textarea {
    grid-area: 1 / 1 / 2 / 2;
    font: inherit; font-size: inherit; line-height: inherit;
    resize: vertical;
  }
  .grow.auto textarea { resize: none; overflow: hidden; }

  /* The twin. Hidden rather than transparent: `visibility: hidden` keeps it out
     of the accessibility tree, so the note is not read out twice. */
  .grow.auto::after {
    content: attr(data-value) ' ';
    grid-area: 1 / 1 / 2 / 2;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    visibility: hidden;
    pointer-events: none;
  }

  /* Past the ceiling the box stops growing and scrolls. The cap is on the
     container because the twin is what has the height. */
  .grow.auto {
    max-height: calc(var(--max-rows, 14) * 1.45em);
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  /* No height of its own until it has something to say, so a field with the
     counter still asleep is exactly as tall as one without a budget at all. */
  .count { display: inline-flex; font-size: var(--sx-t-xs); color: var(--sx-ink-3); white-space: nowrap; }
  .count.show { margin-top: var(--sx-s-2); }
  /* The tone never travels alone: «quedan 12» becomes «7 de más», so the number
     and the word change together and neither depends on seeing red. */
  .fig.over { color: var(--sx-critical); font-weight: var(--sx-w-semi); }

  .sr {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  @media (pointer: coarse) {
    .grow { font-size: 16px; }
  }
</style>
