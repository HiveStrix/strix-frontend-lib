<script>
  // DATERANGE — two dates, and the rule that ties them.
  //
  // Two `DateInput`s side by side are not a range: a range is two dates PLUS the
  // fact that the second cannot be before the first, and that fact has to be
  // said the moment it stops being true. The system does not guess when that
  // happens — it says so, on the field that is actually wrong, in the same
  // `error` + `fix` shape every other form control in this library already
  // uses: two props, because "qué está mal" and "cómo se arregla" are two
  // different sentences.
  //
  //   <DateRange bind:start={desde} bind:end={hasta} label="Período" />
  //   <DateRange bind:start={desde} bind:end={hasta} min={today()} required />
  //
  // WHAT THIS DOES NOT REWRITE. The timezone-safe parsing, the native picker,
  // the "en 12 días" echo — all of that is `DateInput`, unchanged, mounted
  // twice. This component's entire job is the one rule between the two fields;
  // everything else is delegated on purpose.
  //
  // WHEN NOT TO USE IT: for two dates that are not a span of the same thing —
  // "fecha de compra" and "fecha de garantía vencida" are two unrelated facts,
  // not a range, and wiring them through this component would invent a
  // constraint ("la garantía no puede vencer antes de comprarse") that happens
  // to be true but is not what this component is FOR.
  import Row from '../shell/Row.svelte';
  import DateInput, { parseLocalDate } from './DateInput.svelte';

  /** 'YYYY-MM-DD'. Bindable. */
  export let start = '';
  /** 'YYYY-MM-DD'. Bindable. */
  export let end = '';
  export let startLabel = 'Desde';
  export let endLabel = 'Hasta';
  /** Shared bounds — same convention as DateInput, applied to both fields. */
  export let min = undefined;
  export let max = undefined;
  export let required = false;
  export let disabled = false;
  /** Add «en 12 días» / «hace 18 días» under BOTH echoes. */
  export let relative = false;
  /** A validation the caller owns — «el rango no puede pasar de 90 días». Loses to the built-in rule below when both are true at once, because that one is never wrong to show. */
  export let error = '';
  export let fix = '';

  $: startDate = parseLocalDate(start);
  $: endDate = parseLocalDate(end);
  // Same-day is a valid range of one day — only END BEFORE START is the defect.
  $: rangeInvalid = !!startDate && !!endDate && endDate < startDate;

  const DAY_ES = new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'long' });
  $: startEcho = startDate ? DAY_ES.format(startDate) : '';
  $: rangeError = rangeInvalid ? 'La fecha de fin no puede ser anterior a la de inicio.' : '';
  $: rangeFix = rangeInvalid ? `Elegí una fecha igual o posterior al ${startEcho}.` : '';

  $: endError = rangeError || error;
  $: endFix = rangeInvalid ? rangeFix : fix;
</script>

<Row gap={4} align="start">
  <div class="half">
    <DateInput
      bind:value={start}
      label={startLabel}
      {min} {max} {required} {disabled} {relative}
      on:change on:focus on:blur
    />
  </div>
  <div class="half">
    <DateInput
      bind:value={end}
      label={endLabel}
      {min} {max} {required} {disabled} {relative}
      error={endError}
      fix={endFix}
      on:change on:focus on:blur
    />
  </div>
</Row>

<style>
  /* Each field shares the row evenly and wraps to its own full-width line
     below 460px-ish — Row already wraps by default, this just gives it
     something sized to wrap FROM. */
  .half { flex: 1 1 220px; min-width: 0; }
</style>
