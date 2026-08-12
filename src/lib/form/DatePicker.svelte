<script>
  // DATEPICKER — a day, typed first, picked when typing is not the point.
  //
  // `DateInput` opens the platform's own calendar, which is exactly right on a
  // tablet — nothing this library writes beats the native wheel under a thumb.
  // But on desktop that native calendar is a different drawing in every
  // browser, foreign to this direction, and genuinely poor in Firefox. This is
  // the alternative for that seat: a text field in this system's own surface,
  // with `Calendar` — built, measured, keyboard-navigable — as the picker.
  //
  //   <DatePicker label="Fecha de nacimiento" bind:value={nacimiento} />
  //   <DatePicker label="Fecha del servicio" bind:value={fecha} max={hoy} />
  //
  // COMPOSITION, NOT INVENTION. Three pieces already existed and this wires
  // them together: `Field` for the label/hint/error frame, `Calendar` for the
  // grid, and `shell/toplayer.js` for the top-layer popover — the exact
  // mechanism `Combobox` already uses for its own list, copied here rather
  // than re-solved, including WHY `Combobox` draws its own `.frame` instead of
  // letting `Field` draw one: the popup has to sit next to the box and be
  // positioned against it, and a component cannot reach into another one's
  // scoped styles to grab the node `Field` renders internally. `place()`
  // measures that box with `getBoundingClientRect()` and writes
  // `position: fixed` coordinates by hand, recalculated on every `scroll` and
  // `resize` while open; `supportsPopover`/`syncPopover` decide together
  // whether the panel gets `popover="manual"` and `position: fixed`, because
  // the two have to move as one pair — see `toplayer.js` for why.
  // `parseLocalDate` is `DateInput`'s own timezone-safe parsing, imported
  // rather than rewritten: `new Date('2026-08-05')` lands on the 4th west of
  // Greenwich, which is all of Costa Rica, and that bug gets solved once, not
  // once per date-shaped field.
  //
  // TYPING IS THE MAIN ROAD, THE CALENDAR IS THE HELP. This is the failure
  // mode that sinks most home-built date pickers: they take away the one thing
  // the native control was actually good at, typing a date by hand. Somebody
  // entering a birth date is not going to click Anterior forty times — so the
  // text field never waits for the calendar. It is a real `<input type="text">`
  // that reads and writes on its own; the button only offers the grid for
  // whoever would rather browse than type. Opening it is a deliberate click, on
  // the button — never a side effect of focusing or typing in the field, which
  // would put a calendar in front of somebody who is mid-keystroke.
  //
  // THE TYPED FORMAT IS DD/MM/AAAA, es-CR's own short date — the format
  // `Intl.DateTimeFormat('es-CR')` already gives every other date-shaped
  // component in this family (`DateInput`'s prose echo, `Calendar`'s month
  // heading). `value` stays 'YYYY-MM-DD', the same wire format `DateInput` and
  // `Calendar` already use, so the three compose freely.
  //
  // WHEN TO USE WHICH: on a form a técnico fills from a phone or a tablet,
  // `DateInput` — the platform's own calendar is the best one available there.
  // On a desktop screen, or wherever the date is far from today (a birth date,
  // an install date years back) and scrolling a native wheel through decades is
  // its own kind of bad, `DatePicker`. Neither replaces the other.
  import { tick, onDestroy } from 'svelte';
  import Field from './Field.svelte';
  import Calendar from './Calendar.svelte';
  // `Calendar.svelte` no reexporta nada de su propio módulo — importa
  // `parseLocalDate` de `DateInput.svelte` en su script de instancia, así que
  // reusarla acá significa importarla de la misma fuente, no de `Calendar`.
  import { parseLocalDate } from './DateInput.svelte';
  import { supportsPopover, syncPopover } from '../shell/toplayer.js';

  /** 'YYYY-MM-DD', or '' for nothing chosen. Bindable. */
  export let value = '';
  /** 'YYYY-MM-DD'. Same convention as DateInput/Calendar. */
  export let min = undefined;
  export let max = undefined;

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

  const DATE_FMT = new Intl.DateTimeFormat('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const fmt = (d) => DATE_FMT.format(d);
  const TYPED_RE = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/;

  /**
   * «05/08/2026» → «2026-08-05». Puro reordenamiento de dígitos, sin `Date()`
   * de por medio — la corrección de zona horaria sigue viviendo entera en
   * `parseLocalDate`, acá sólo se reordena texto antes de dársela. La
   * comprobación de desborde (31/02) hace falta porque un `<input type=date>`
   * nativo nunca deja escribir esa combinación y acá, texto libre, sí se puede.
   */
  function parseTyped(s) {
    const m = TYPED_RE.exec(s);
    if (!m) return null;
    const [, dd, mm, yyyy] = m;
    const iso = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    const d = parseLocalDate(iso);
    if (!d || d.getFullYear() !== +yyyy || d.getMonth() !== +mm - 1 || d.getDate() !== +dd) return null;
    return iso;
  }

  let el;
  let wrapEl;
  let popEl;
  let text = '';
  let touched = false; // la persona está escribiendo, todavía no se confirmó
  let open = false;
  let dropUp = false;
  let parseError = '';

  export const focus = () => el?.focus();

  // El campo muestra el valor confirmado hasta que la persona empieza a
  // escribir encima — el mismo patrón que `Combobox` usa con `query`.
  $: if (!touched) {
    const d = value ? parseLocalDate(value) : null;
    text = d ? fmt(d) : '';
  }

  function commit() {
    if (!touched) return;
    const trimmed = text.trim();
    if (trimmed === '') {
      parseError = '';
      touched = false;
      if (value !== '') value = '';
      return;
    }
    const iso = parseTyped(trimmed);
    if (!iso) {
      parseError = 'Escribí la fecha como DD/MM/AAAA.';
      return; // se queda editando: tocar el valor confirmado borraría el error
    }
    parseError = '';
    touched = false;
    value = iso;
  }

  function onInput(e) {
    touched = true;
    text = e.currentTarget.value;
  }

  function onKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
  }

  // Volteo arriba/abajo con una estimación fija, igual que Combobox: corre
  // ANTES de que el panel mida su propio alto real.
  function place() {
    if (!wrapEl || typeof window === 'undefined') return;
    const r = wrapEl.getBoundingClientRect();
    const want = 380;
    const vh = document.documentElement.clientHeight;
    dropUp = r.bottom + want > vh && r.top > vh - r.bottom;
    if (!supportsPopover || !popEl) return;
    popEl.style.setProperty('--sx-pop-x', `${r.left}px`);
    popEl.style.setProperty('--sx-pop-y', `${dropUp ? vh - r.top : r.bottom}px`);
  }

  async function openCal() {
    if (disabled || readonly || open) return;
    open = true;
    await tick();
    place();
    // El teclado tiene que bastar para todo: sin esto el foco se queda en el
    // botón que abrió el panel y las flechas no mueven nada. La celda con
    // `tabindex="0"` es la que Calendar ya marca como la que recibe el foco.
    popEl?.querySelector('[tabindex="0"]')?.focus();
  }

  function closeCal({ refocus = false } = {}) {
    if (!open) return;
    open = false;
    if (refocus) el?.focus();
  }

  $: syncPopover(popEl, open);

  function onScroll() { if (open) place(); }
  $: if (typeof document !== 'undefined' && supportsPopover) {
    document.removeEventListener('scroll', onScroll, true);
    if (open) document.addEventListener('scroll', onScroll, { capture: true, passive: true });
  }
  onDestroy(() => {
    if (typeof document !== 'undefined') document.removeEventListener('scroll', onScroll, true);
  });

  // La fecha elegida vuelve al campo y el foco vuelve al campo — nunca se
  // queda en la grilla, que está a punto de desaparecer.
  function onCalendarChange(e) {
    value = e.detail.value;
    touched = false;
    parseError = '';
    closeCal({ refocus: true });
  }

  function onPopKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeCal({ refocus: true }); }
  }

  // Un click fuera del campo Y del panel cierra y confirma lo que hubiera
  // escrito — el mismo `focusout` con `relatedTarget` que usa Combobox.
  function onFocusOut(e) {
    if (wrapEl && e.relatedTarget && wrapEl.contains(e.relatedTarget)) return;
    commit();
    closeCal();
  }

  $: shownError = parseError || error;
  $: shownFix = parseError ? 'Por ejemplo: 05/08/2026.' : fix;
</script>

<Field
  {label} {hint} {required} {optional} {disabled} {readonly}
  {id} {origin} {originValue} {changed}
  error={shownError} fix={shownFix} {warning}
  frame={false}
  on:revert
  let:id={fid}
  let:describedBy
  let:invalid
>
  <div class="wrap" bind:this={wrapEl} on:focusout={onFocusOut}>
    <div class="frame" class:invalid class:disabled class:readonly>
      <input
        bind:this={el}
        type="text"
        id={fid}
        {name}
        {disabled}
        {readonly}
        value={text}
        class="dt sx-num"
        placeholder="DD/MM/AAAA"
        autocomplete="off"
        inputmode="numeric"
        required={required || undefined}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        on:input={onInput}
        on:keydown={onKey}
        on:blur={commit}
        on:focus
      />

      <button
        type="button"
        class="cal"
        disabled={disabled || readonly}
        aria-label={`Abrir el calendario de ${label || 'la fecha'}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        on:click={() => (open ? closeCal({ refocus: true }) : openCal())}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <rect x="1.6" y="3" width="12.8" height="11.4" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.5" />
          <path d="M1.6 6.6h12.8M5 1.6v2.6M11 1.6v2.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <div
      class="pop"
      class:up={dropUp}
      class:fx={supportsPopover}
      hidden={supportsPopover ? false : !open}
      popover={supportsPopover ? 'manual' : undefined}
      role="dialog"
      tabindex="-1"
      aria-label={`Calendario · ${label || 'fecha'}`}
      bind:this={popEl}
      on:keydown={onPopKey}
    >
      {#if open}
        <Calendar {value} {min} {max} {disabled} {label} on:change={onCalendarChange} />
      {/if}
    </div>
  </div>

  <slot name="action" slot="action" />
</Field>

<style>
  .wrap { position: relative; display: block; }

  /* La misma caja que dibuja Field, redeclarada acá por la misma razón que en
     Combobox: el panel tiene que posicionarse contra ella y un componente no
     puede alcanzar el nodo que otro dibuja adentro de su propio scope. */
  .frame {
    display: flex; align-items: stretch; gap: var(--sx-s-2);
    min-height: var(--sx-s-10);
    padding: var(--sx-s-2) var(--sx-s-3);
    background: var(--sx-surface);
    border: 1px solid var(--sx-edge);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-1);
    transition: border-color var(--sx-fast) var(--sx-ease), box-shadow var(--sx-fast) var(--sx-ease);
  }
  .frame:hover:not(.disabled):not(.readonly) { border-color: var(--sx-ink-3); }
  .frame:focus-within { border-color: var(--sx-ink); outline: 2px solid var(--sx-ink); outline-offset: 2px; }
  :global([data-sx-theme='dark']) .frame:focus-within,
  :global(.sx-dark) .frame:focus-within { outline-color: var(--sx-n-0); border-color: var(--sx-n-0); }
  .frame.invalid { border-color: var(--sx-critical); box-shadow: var(--sx-e-1), 0 0 0 1px var(--sx-critical); }
  .frame.disabled { background: var(--sx-sunk); border-color: var(--sx-line); box-shadow: none; }
  .frame.readonly { background: var(--sx-sunk); box-shadow: none; }

  .dt {
    flex: 1 1 auto; min-width: 0; width: 100%;
    margin: 0; padding: 0; border: 0; background: none; outline: none;
    font: inherit; font-size: var(--sx-t-md); line-height: 1.45; color: inherit;
    font-variant-numeric: tabular-nums lining-nums slashed-zero; cursor: text;
  }
  .dt::placeholder { color: var(--sx-ink-3); opacity: 1; }
  .dt:disabled { cursor: not-allowed; color: var(--sx-ink-3); -webkit-text-fill-color: var(--sx-ink-3); opacity: 1; }

  .cal {
    display: inline-flex; align-items: center; justify-content: center; flex: none;
    align-self: center; width: var(--sx-s-6); height: var(--sx-s-6);
    padding: 0; border: 0; border-radius: var(--sx-r-pill);
    background: none; color: var(--sx-ink-3); cursor: pointer;
    transition: background var(--sx-fast) var(--sx-ease), color var(--sx-fast) var(--sx-ease);
  }
  /* El mismo botón redondo de la familia de iconos de campo (DateInput,
     Combobox): se ilumina bajo el cursor, no se hunde. Deliberadamente NO es
     el `IconButton` compartido — ese trae su propio anillo de foco, y
     `.frame` de acá arriba ya dibuja el único anillo que este campo necesita
     en `:focus-within`; dos anillos anidados (uno en todo el campo, uno de
     32px alrededor del botón) es justo la colisión que `IconButton` no está
     pensado para evitar en este lugar. */
  .cal:hover:not(:disabled) { background: var(--sx-accent-soft); color: var(--sx-ink); }
  .cal:disabled { cursor: not-allowed; opacity: .5; }
  .cal svg { width: 15px; height: 15px; }

  /* ── El panel ────────────────────────────────────────────────────────────
     Contenido, no estirado al ancho del campo: a diferencia de la lista de
     Combobox (que tiene sentido que ocupe el mismo ancho que filtra), un
     calendario tiene su propio tamaño intrínseco y estirarlo a un campo
     angosto lo aplastaría. */
  .pop {
    position: absolute; left: 0; top: calc(100% + var(--sx-s-2));
    z-index: var(--sx-z-overlay);
    background: var(--sx-surface);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-3);
    padding: var(--sx-s-3);
    margin: 0;
    border: 0;
    color: inherit;
  }
  .pop.up { top: auto; bottom: calc(100% + var(--sx-s-2)); }
  .pop[hidden] { display: none; }
  :global([data-sx-theme='dark']) .pop,
  :global(.sx-dark) .pop { color-scheme: dark; }

  /* Con `popover`, `.wrap` deja de ser el ancestro contra el que `left: 0`
     significa algo — `.pop` vive en la top layer. `.fx` pasa a `fixed`, con
     las coordenadas que `place()` escribió en `--sx-pop-x`/`--sx-pop-y` — ya
     traen la dirección resuelta (`r.bottom` bajando, o
     `clientHeight - r.top` subiendo), así que acá se usan tal cual. */
  .pop.fx {
    position: fixed;
    left: var(--sx-pop-x, 0px);
    top: calc(var(--sx-pop-y, 0px) + var(--sx-s-2));
    bottom: auto;
  }
  .pop.fx.up {
    top: auto;
    bottom: calc(var(--sx-pop-y, 0px) + var(--sx-s-2));
  }

  @media (pointer: coarse) {
    .frame { min-height: var(--sx-touch); }
    .dt { font-size: 16px; }
    .cal { width: var(--sx-touch); height: var(--sx-touch); margin-right: calc(var(--sx-s-2) * -1); }
  }
</style>
