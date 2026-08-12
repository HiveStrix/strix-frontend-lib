<script context="module">
  const LONG = new Intl.DateTimeFormat('es-CR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const LONG_TIME = new Intl.DateTimeFormat('es-CR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });

  /**
   * `new Date('2026-08-05')` is parsed as UTC and lands on the 4th for anyone
   * west of Greenwich — which is all of Costa Rica, every day of the year. The
   * parts are read by hand so a date entered here is the date that shows.
   */
  function toLocal(v) {
    const s = String(v ?? '');
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
    if (!m) return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  /**
   * Today, as this field spells it. Exported because the OBVIOUS way to write it
   * is wrong: `new Date().toISOString().slice(0, 10)` is the UTC day, and Costa
   * Rica is six hours behind UTC — so from 6pm every evening it hands back
   * tomorrow. A `max={today()}` built that way lets a technician file a service
   * for a day that has not happened.
   */
  export function today(d = new Date()) {
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }
</script>

<script>
  // DATEINPUT — a day, and what that day means.
  //
  // The native `<input type="date">`, on purpose. On the tablet where a
  // technician records the day he finished a job it opens the platform's own
  // calendar; every hand-built date picker in this ecosystem would have to
  // reimplement that, badly, and be worse in Spanish. What the native control
  // does NOT do is tell anybody what they just chose, and «03/08/26» is where
  // three-day errors come from. So this echoes the date back in words, and — the
  // part that actually earns its keep in maintenance — how far away it is.
  //
  //   «martes 5 de agosto de 2026 · en 12 días»
  //   «viernes 18 de julio de 2026 · hace 18 días»
  //
  // That second half is why a técnico notices he typed 2025 instead of 2026
  // before the plan recalculates against a date thirteen months in the past.
  //
  //   <DateInput label="Fecha del servicio" bind:value={done} relative
  //              max={today}
  //              error={future ? 'Esa fecha todavía no llega.' : ''}
  //              fix="Un servicio se registra cuando ya se hizo. Si está programado, dejalo como plan." />
  //
  // WHEN NOT TO USE IT: for a period — «cada 180 días» is a NumberInput with a
  // unit, not a date. For a date the system knows better than the person (the
  // next due date of a plan), show it as text; a field invites an edit that has
  // no meaning. For a month or a year alone, use Select: a day picker that
  // ignores its day is a lie about what it collects.
  import Field from './Field.svelte';

  /** «2026-08-05», or «2026-08-05T14:30» when `time`. Exactly what the input holds. */
  export let value = '';
  /** Ask for the hour too. Same control, `datetime-local`. */
  export let time = false;
  export let min = undefined;
  export let max = undefined;
  /** Add «en 12 días» / «hace 18 días» to the echo. */
  export let relative = false;

  export let label = '';
  export let hint = '';
  export let error = '';
  export let fix = '';
  export let warning = '';
  export let required = false;
  export let optional = false;
  export let disabled = false;
  export let readonly = false;
  export let name = undefined;
  export let id = '';
  export let origin = '';
  export let originValue = '';
  export let changed = false;

  let el;
  export const focus = () => el?.focus();

  // `$:` and not `const`: `time` is a prop, and a plain helper closing over it
  // would never be re-read by the statement below.
  $: fmt = (d) => (time ? LONG_TIME : LONG).format(d);

  $: parsed = toLocal(value);

  $: days = (() => {
    if (!parsed || !relative) return null;
    return Math.round((midnight(parsed) - midnight(new Date())) / 86400000);
  })();

  $: near = days === null
    ? ''
    : days === 0 ? 'hoy'
    : days === 1 ? 'mañana'
    : days === -1 ? 'ayer'
    : days > 0 ? `en ${days} días`
    : `hace ${-days} días`;

  $: echo = parsed ? `${fmt(parsed)}${near ? ` · ${near}` : ''}` : '';

  function onInput(e) {
    value = e.currentTarget.value;
  }

  // showPicker() needs a user gesture, which a click is. Where it does not
  // exist the button still does something useful instead of nothing.
  function openPicker() {
    if (disabled || readonly) return;
    try {
      el?.showPicker?.();
    } catch {
      el?.focus();
    }
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
  {#if time}
    <input
      bind:this={el} type="datetime-local" id={fid} {name} {disabled} {readonly} {min} {max}
      {value} class="dt sx-num"
      required={required || undefined}
      aria-describedby={[describedBy, echo ? `${fid}-e` : ''].filter(Boolean).join(' ') || undefined}
      aria-invalid={invalid || undefined}
      on:input={onInput} on:input on:change on:focus on:blur
    />
  {:else}
    <input
      bind:this={el} type="date" id={fid} {name} {disabled} {readonly} {min} {max}
      {value} class="dt sx-num"
      required={required || undefined}
      aria-describedby={[describedBy, echo ? `${fid}-e` : ''].filter(Boolean).join(' ') || undefined}
      aria-invalid={invalid || undefined}
      on:input={onInput} on:input on:change on:focus on:blur
    />
  {/if}

  <button
    type="button" class="cal" on:click={openPicker} disabled={disabled || readonly}
    aria-label={`Abrir el calendario de ${label || 'la fecha'}`}
  >
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="1.6" y="3" width="12.8" height="11.4" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.5" />
      <path d="M1.6 6.6h12.8M5 1.6v2.6M11 1.6v2.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
  </button>

  <!-- `let:` on the slotted element, not on <Field>: a named slot only sees the
       props handed to it, and the ones on the component belong to the default. -->
  <span slot="meta" let:id={fid} class="echo" class:show={!!echo}>
    {#if echo}<span id={`${fid}-e`} class="sx-num">{echo}</span>{/if}
  </span>

  <slot name="action" slot="action" />
</Field>

<style>
  .dt { font-variant-numeric: tabular-nums lining-nums slashed-zero; cursor: text; }
  .dt:disabled { cursor: not-allowed; }
  /* The platform's own icon is replaced, not hidden: ours is a real button with
     a real label, so it can be reached by keyboard and named out loud, which the
     native indicator cannot. */
  .dt::-webkit-calendar-picker-indicator { display: none; }
  .dt::-webkit-inner-spin-button, .dt::-webkit-clear-button { display: none; }

  .cal {
    display: inline-flex; align-items: center; justify-content: center; flex: none;
    align-self: center; width: var(--sx-s-6); height: var(--sx-s-6);
    padding: 0; border: 0; border-radius: var(--sx-r-pill);
    background: none; color: var(--sx-ink-3); cursor: pointer;
    transition: background var(--sx-fast) var(--sx-ease), color var(--sx-fast) var(--sx-ease);
  }
  /* Mismo botón redondo (--sx-r-pill) que el resto de la familia de iconos
     de campo: se ilumina bajo el cursor, no se hunde. */
  .cal:hover:not(:disabled) { background: var(--sx-accent-soft); color: var(--sx-ink); }
  .cal:disabled { cursor: not-allowed; opacity: .5; }
  .cal svg { width: 15px; height: 15px; }

  /* Nothing chosen ⇒ no echo and no space held for one: an empty line under
     every date field in a form is a form that looks half-filled. */
  .echo { display: inline-flex; font-size: var(--sx-t-xs); color: var(--sx-ink-3); }
  .echo.show { margin-top: var(--sx-s-2); }

  @media (pointer: coarse) {
    .cal { width: var(--sx-touch); height: var(--sx-touch); margin-right: calc(var(--sx-s-2) * -1); }
  }
</style>
