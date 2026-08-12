<script context="module">
  // Costa Rica groups with a narrow no-break space and separates decimals with a
  // comma — «₡1 250 000,50». Nobody can type that space, and hard-coding the
  // pair is how a library ends up wrong in the one country it was built for. So
  // the separators are READ OFF the platform's own es-CR formatter, once.
  const PARTS = new Intl.NumberFormat('es-CR').formatToParts(11111.1);
  const GROUP = PARTS.find((p) => p.type === 'group')?.value ?? '.';
  const DECIMAL = PARTS.find((p) => p.type === 'decimal')?.value ?? ',';

  /** What goes on the wire: plain digits, a dot, an optional sign. Never grouped. */
  function canonical(text) {
    let s = String(text ?? '')
      .replace(/\s/g, '')            // the group space, and anything pasted with it
      .split(GROUP).join('')
      .split(DECIMAL).join('.')
      .replace(/[^0-9.\-]/g, '');
    // One sign, at the front; one dot, the first one.
    const neg = s.startsWith('-');
    s = s.replace(/-/g, '');
    const i = s.indexOf('.');
    if (i !== -1) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, '');
    return (neg ? '-' : '') + s;
  }
</script>

<script>
  // NUMBERINPUT — a figure, with the thing it is a figure OF.
  //
  // A number in operational software is never bare. It is 12 400 KILÓMETROS, or
  // 180 DÍAS, or ₡1 250 000. The unit is not decoration: «cambiar cada 250» is
  // the question that gets a machine serviced eight months late.
  //
  // WHAT IT IS CAREFUL ABOUT, IN ORDER OF HOW MUCH IT HAS COST SOMEBODY:
  //
  //   • MONEY IS A STRING. `value` is always canonical text — «1250000.5» — and
  //     that is what goes on the wire, because money is NUMERIC on the other end
  //     and a float is a rounding error waiting for an invoice. The grouped form
  //     is only ever what the box SHOWS.
  //   • THE BOX REFORMATS ON BLUR, NEVER WHILE TYPING. Regrouping under the
  //     caret jumps it, and a person entering ₡1 250 000 on a tablet has to
  //     start over. While the field has focus it holds exactly what was typed.
  //   • THE FIGURES ARE TABULAR. Two totals in a column that do not line up are
  //     two totals nobody compares.
  //   • THE STEPPERS ARE NOT IN THE TAB ORDER. They are `aria-hidden` pointer
  //     targets; the keyboard path is ↑ ↓ (and Re Pág / Av Pág for ten) on the
  //     field itself, which is what a spinbutton is supposed to answer to.
  //
  //   <NumberInput label="Lectura del odómetro" bind:value={km} unit="km"
  //                stepper step={100} min="0"
  //                hint="La que marca ahora mismo, no la del último servicio." />
  //
  //   <NumberInput label="Costo de repuestos" bind:value={rep} currency
  //                warning={over ? 'Supera el presupuesto del plan.' : ''}
  //                fix="Podés registrarlo igual; queda anotado en la orden." />
  //
  // WHEN NOT TO USE IT: for a folio, a cédula, a plate or a phone. Those are
  // identifiers that happen to be digits — they are never added up, they keep
  // leading zeros, and they belong in `<Input mono />`. For a percentage that is
  // really a choice of three (0 %, 13 %, exento), use Select.
  import Field from './Field.svelte';
  import { createEventDispatcher } from 'svelte';

  /** Canonical text: «1250000.5». Not a number — see the note above. */
  export let value = '';
  /** What the figure is of: «km», «h», «días», «un». Shown, and announced. */
  export let unit = '';
  /** Colones: a ₡ in front, two decimals, es-CR grouping on blur. */
  export let currency = false;
  /** Fixed decimals in the displayed form. `null` ⇒ show what there is. */
  export let decimals = null;
  export let min = null;
  export let max = null;
  export let step = 1;
  /** Pointer targets for ± step. The keyboard already has ↑ ↓ without them. */
  export let stepper = false;
  /** Right-align when the field sits in a column of other figures. */
  export let align = 'left';

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

  const dispatch = createEventDispatcher();

  let el;
  let focused = false;
  let shown = '';
  export const focus = () => el?.focus();

  // `$:`, not `const`. A legacy reactive statement tracks only the names written
  // inside it, so a plain helper closing over `currency` and `decimals` would be
  // invisible to the statement below — the box would keep formatting with
  // whatever the first render happened to see.
  $: places = decimals !== null ? decimals : currency ? 2 : null;
  $: grouped = (v) => {
    const s = canonical(v);
    if (s === '' || s === '-' || s === '.') return s;
    const n = Number(s);
    if (!Number.isFinite(n)) return s;
    return new Intl.NumberFormat('es-CR', {
      minimumFractionDigits: places ?? 0,
      maximumFractionDigits: places ?? 20
    }).format(n);
  };

  // Only ever runs while the field is NOT being typed into, so it cannot fight
  // the caret. Blurring flips `focused` and that is what triggers the reformat.
  $: if (!focused) shown = grouped(value);

  function onInput(e) {
    shown = e.currentTarget.value;
    value = canonical(shown);
  }

  function onFocus(e) {
    focused = true;
    // The canonical form is what is editable: nobody can type the group space,
    // and leaving it in means backspacing through characters that do not exist.
    shown = value;
    dispatch('focus', e);
  }

  function onBlur(e) {
    focused = false;
    shown = grouped(value);
    dispatch('blur', e);
  }

  $: numeric = (() => {
    const n = Number(value);
    return value === '' || !Number.isFinite(n) ? null : n;
  })();

  function bump(dir, mult = 1) {
    if (disabled || readonly) return;
    const s = Number(step) || 1;
    let n = (numeric ?? 0) + dir * s * mult;
    if (min !== null && min !== '' && n < Number(min)) n = Number(min);
    if (max !== null && max !== '' && n > Number(max)) n = Number(max);
    // Kill the float tail that 0.1 + 0.2 leaves behind.
    const dp = places ?? (String(s).split('.')[1]?.length ?? 0);
    value = dp ? n.toFixed(dp) : String(n);
    shown = focused ? value : grouped(value);
    dispatch('change', value);
  }

  function onKey(e) {
    if (!stepper || disabled || readonly) return;
    if (e.key === 'ArrowUp') { e.preventDefault(); bump(1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); bump(-1); }
    else if (e.key === 'PageUp') { e.preventDefault(); bump(1, 10); }
    else if (e.key === 'PageDown') { e.preventDefault(); bump(-1, 10); }
  }

  $: unitText = currency ? 'colones' : unit;
  $: fieldId = id || undefined;
  $: atMin = min !== null && min !== '' && numeric !== null && numeric <= Number(min);
  $: atMax = max !== null && max !== '' && numeric !== null && numeric >= Number(max);
</script>

<Field
  {label} {hint} {error} {fix} {warning} {required} {optional} {disabled} {readonly}
  id={fieldId} {origin} {originValue} {changed}
  on:revert
  let:id={fid}
  let:describedBy
  let:invalid
>
  {#if currency}
    <span class="affix cur" aria-hidden="true">₡</span>
  {/if}

  <input
    bind:this={el}
    type="text"
    inputmode={places ? 'decimal' : 'numeric'}
    id={fid}
    {name}
    {placeholder}
    {disabled}
    {readonly}
    value={shown}
    class="num sx-num"
    class:right={align === 'right'}
    autocomplete="off"
    required={required || undefined}
    role={stepper ? 'spinbutton' : undefined}
    aria-valuenow={stepper && numeric !== null ? numeric : undefined}
    aria-valuemin={stepper && min !== null && min !== '' ? Number(min) : undefined}
    aria-valuemax={stepper && max !== null && max !== '' ? Number(max) : undefined}
    aria-valuetext={stepper && numeric !== null && unitText ? `${grouped(value)} ${unitText}` : undefined}
    aria-describedby={[describedBy, unitText ? `${fid}-u` : ''].filter(Boolean).join(' ') || undefined}
    aria-invalid={invalid || undefined}
    on:input={onInput}
    on:input
    on:focus={onFocus}
    on:blur={onBlur}
    on:keydown={onKey}
    on:keydown
  />

  {#if unit && !currency}<span class="affix unit" aria-hidden="true">{unit}</span>{/if}
  {#if unitText}<span class="sr" id={`${fid}-u`}>{unitText}</span>{/if}

  {#if stepper}
    <!-- Pointer-only on purpose: ↑ ↓ already do this from the field, so adding
         the buttons to the tab order would put two extra stops between every
         pair of fields in a form that is mostly numbers. -->
    <span class="steps" aria-hidden="true">
      <button type="button" tabindex="-1" title={`Sumar ${step}${unit ? ` ${unit}` : ''}`}
        disabled={disabled || readonly || atMax} on:click={() => bump(1)}>
        <svg viewBox="0 0 12 12"><path d="M2.5 7.5 6 4l3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
      <button type="button" tabindex="-1" title={`Restar ${step}${unit ? ` ${unit}` : ''}`}
        disabled={disabled || readonly || atMin} on:click={() => bump(-1)}>
        <svg viewBox="0 0 12 12"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
    </span>
  {/if}

  <slot name="trail" />
  <slot name="action" slot="action" />
</Field>

<style>
  .num { font-variant-numeric: tabular-nums lining-nums slashed-zero; }
  .num.right { text-align: right; }

  .affix {
    display: inline-flex; align-items: center; flex: none; align-self: center;
    color: var(--sx-ink-3); white-space: nowrap;
  }
  /* The sign is part of the figure, so it keeps the figure's size and its
     tabular metrics — ₡ hanging one size smaller reads as a footnote. */
  .cur { font-size: var(--sx-t-md); font-variant-numeric: tabular-nums; }
  .unit { font-size: var(--sx-t-xs); }

  .steps {
    display: flex; flex-direction: column; flex: none; align-self: center;
    margin: calc(var(--sx-s-1) * -1) calc(var(--sx-s-2) * -1) calc(var(--sx-s-1) * -1) 0;
  }
  .steps button {
    display: flex; align-items: center; justify-content: center;
    width: var(--sx-s-6); height: var(--sx-s-4);
    padding: 0; border: 0; background: none; cursor: pointer;
    color: var(--sx-ink-3); border-radius: var(--sx-r-1);
    transition: background var(--sx-fast) var(--sx-ease), color var(--sx-fast) var(--sx-ease);
  }
  .steps button:hover:not(:disabled) { background: var(--sx-accent-soft); color: var(--sx-ink); }
  .steps button:disabled { opacity: .35; cursor: not-allowed; }
  .steps svg { width: 12px; height: 12px; }

  .sr {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  @media (pointer: coarse) {
    .cur { font-size: 16px; }
    /* Two 22px halves of a 44px control: the pair is the touch target, and a
       thumb that misses up still lands on down rather than on nothing. */
    .steps button { width: var(--sx-touch); height: calc(var(--sx-touch) / 2); }
    .steps { margin-right: calc(var(--sx-s-3) * -1); }
  }
</style>
