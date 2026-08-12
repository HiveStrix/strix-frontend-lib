<script>
  // CALENDAR — a month, and a place to stand in it.
  //
  // `DateInput` solved the day a técnico types. This solves the day somebody has
  // to PICK, and it did not exist before this: every product that needed a real
  // month grid was going to write its own, and a hand-rolled calendar is one of
  // the easiest widgets to get wrong in exactly the way nobody notices until a
  // keyboard user files a ticket.
  //
  //   <Calendar bind:value={done} label="Fecha del servicio" />
  //   <Calendar bind:value={desde} min={today()} />
  //   <Calendar bind:value={plan} disabled />
  //
  // IT IS A GRID, SO THE ARIA PATTERN IS GRID'S — read from the spec
  // (https://www.w3.org/WAI/ARIA/apg/patterns/grid/), not improvised. A month is
  // rows of seven, which is what a grid pattern IS for, and the WAI-ARIA date
  // picker example is the reference this follows: `role="grid"` on the table,
  // `role="gridcell"` on the `<td>` itself — not a `<button>` nested inside it,
  // because a day has no interactive content of its own and the cell IS the
  // widget. One cell holds `tabindex="0"` at a time (roving tabindex); every
  // other cell holds `-1`. Arrow keys move the roving cell; Enter/Space or a
  // click SELECT it. Moving is not selecting — those are two different acts in
  // a date picker, unlike in `ChoiceCards`' radiogroup, where they are the same
  // one.
  //
  // A DISABLED DAY STAYS IN THE TAB ORDER. It would be simpler to skip it while
  // walking with the arrows — `ChoiceCards` does exactly that — but a month
  // where every day before `min` disappeared from under the arrow key would
  // leave a keyboard user with no way to even perceive that the 1st through the
  // 4th exist and are just unavailable. `aria-disabled` says so instead of
  // hiding it, which is what the APG reference implementation does too.
  //
  // FOUR STATES STACK ON ONE DAY — outside the month, today, chosen, disabled —
  // and colour is not allowed to be the only thing that tells them apart (the
  // system's second rule, at its densest: `Pill.svelte`). Outside-the-month
  // drops to tertiary ink AND normal weight. Today gets a small dot UNDER the
  // figure, never a filled circle ON it — a fill is what "chosen" means here,
  // and two different states sharing one shape stop being two states. Chosen is
  // `--sx-accent-pick`, the exact token a selected Table row already fills with
  // — same persistent-state token, same reason: reusing it is what makes this
  // grid feel like the rest of the system instead of a widget bolted onto it.
  // Disabled drops opacity and answers no click or key at all.
  //
  // NO DRAWN GRID. The classic calendar mistake is a table with rules — 42
  // bordered rectangles competing with the numbers inside them. Nácar's law
  // covers this exactly: nothing is separated with a line if it can be
  // separated with air, so the seven-across, N-down alignment here is spacing,
  // never a border.
  //
  // Reuses `parseLocalDate` and `today()` from DateInput — the timezone
  // correction (`new Date('2026-08-05')` lands on the 4th west of Greenwich)
  // gets solved once, not once per date-shaped component.
  import { createEventDispatcher, tick } from 'svelte';
  import { parseLocalDate, today } from './DateInput.svelte';
  import IconButton from '../action/IconButton.svelte';
  import Glyph from '../shell/Glyph.svelte';

  /** 'YYYY-MM-DD', or '' for nothing chosen yet. Bindable. */
  export let value = '';
  /** 'YYYY-MM-DD'. A day before this is disabled, same convention as DateInput. */
  export let min = undefined;
  export let max = undefined;
  /** The whole grid, inert. */
  export let disabled = false;
  /** Read before the month/year heading, for a calendar that is not self-evident on the page. */
  export let label = '';
  /**
   * 'YYYY-MM-DD'. Which month opens when nothing is chosen yet — a service
   * history you want centred on the equipment's install month, say. Only reads
   * on mount (uncontrolled, like an HTML `defaultValue`): after that, Prev/Next
   * and the keyboard own the view. Ignored once `value` is set.
   */
  export let viewDate = '';

  const dispatch = createEventDispatcher();

  const WD_LONG = new Intl.DateTimeFormat('es-CR', { weekday: 'long' });
  const WD_SHORT = new Intl.DateTimeFormat('es-CR', { weekday: 'short' });
  const MONTH_YEAR = new Intl.DateTimeFormat('es-CR', { month: 'long', year: 'numeric' });
  const DAY_LONG = new Intl.DateTimeFormat('es-CR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  function addMonths(d, n) {
    const day = d.getDate();
    const t = new Date(d.getFullYear(), d.getMonth() + n, 1);
    const last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
    t.setDate(Math.min(day, last));
    return t;
  }
  // Monday = 0 … Sunday = 6, because the week starts Monday here (es-CR).
  const mondayIndex = (d) => (d.getDay() + 6) % 7;

  // A fixed reference Monday, just to ask Intl what it calls each weekday —
  // this has nothing to do with the calendar's own dates.
  const REF_MONDAY = new Date(2024, 0, 1);
  const weekdayHeaders = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(REF_MONDAY, i);
    return { short: WD_SHORT.format(d).replace(/\.$/, ''), long: WD_LONG.format(d) };
  });

  // `focusIso` is the one source of truth for where the roving cell sits AND
  // which month is on screen — the displayed month is DERIVED from it below,
  // rather than tracked separately, so an arrow key that crosses into another
  // month can never leave the view pointed at the wrong one.
  let focusIso = value || viewDate || today();
  let lastValue = value;
  // An external rebind of `value` (not one this component made) recentres the
  // view. Guarded by `lastValue` so selecting a day here — which sets both
  // `value` and `focusIso` together — does not bounce right back.
  $: if (value !== lastValue) {
    lastValue = value;
    if (value) focusIso = value;
  }

  $: todayIso = today();
  $: focusDate = parseLocalDate(focusIso) ?? new Date();
  $: viewYear = focusDate.getFullYear();
  $: viewMonth = focusDate.getMonth();
  $: monthStart = new Date(viewYear, viewMonth, 1);
  $: monthYearLabel = cap1(MONTH_YEAR.format(monthStart));
  $: gridStart = addDays(monthStart, -mondayIndex(monthStart));
  $: monthEnd = new Date(viewYear, viewMonth + 1, 0);
  $: gridEnd = addDays(monthEnd, 6 - mondayIndex(monthEnd));

  $: weeks = (() => {
    const out = [];
    let cur = gridStart;
    while (cur <= gridEnd) {
      const row = [];
      for (let i = 0; i < 7; i++) {
        const iso = today(cur);
        row.push({
          date: cur,
          iso,
          inMonth: cur.getMonth() === viewMonth,
          isToday: iso === todayIso,
          isSelected: !!value && iso === value,
          isDisabled: disabled || (!!min && iso < min) || (!!max && iso > max)
        });
        cur = addDays(cur, 1);
      }
      out.push(row);
    }
    return out;
  })();

  function dayLabel(d) {
    let s = DAY_LONG.format(d.date);
    if (d.isToday) s += ', hoy';
    if (d.isSelected) s += ', elegido';
    if (d.isDisabled) s += ', no disponible';
    return s;
  }

  const cellRefs = {};
  async function focusCell(iso) {
    await tick();
    cellRefs[iso]?.focus();
  }

  function activate(d) {
    if (d.isDisabled) return;
    value = d.iso;
    lastValue = d.iso;
    focusIso = d.iso;
    dispatch('change', { value: d.iso });
  }

  function move(days) {
    if (disabled) return;
    const nd = addDays(parseLocalDate(focusIso) ?? new Date(), days);
    focusIso = today(nd);
    focusCell(focusIso);
  }
  function moveMonths(n) {
    if (disabled) return;
    const nd = addMonths(parseLocalDate(focusIso) ?? new Date(), n);
    focusIso = today(nd);
    focusCell(focusIso);
  }
  function moveToWeekEdge(targetIdx) {
    if (disabled) return;
    const d = parseLocalDate(focusIso) ?? new Date();
    const nd = addDays(d, targetIdx - mondayIndex(d));
    focusIso = today(nd);
    focusCell(focusIso);
  }
  // The header's Prev/Next buttons keep DOM focus on themselves — someone
  // browsing months with the mouse should not get yanked into the grid — so the
  // month change is announced through `aria-live` on the heading instead.
  function panMonths(n) {
    if (disabled) return;
    const nd = addMonths(parseLocalDate(focusIso) ?? new Date(), n);
    focusIso = today(nd);
  }

  function onKeydown(e, d) {
    switch (e.key) {
      case 'ArrowRight': e.preventDefault(); move(1); break;
      case 'ArrowLeft': e.preventDefault(); move(-1); break;
      case 'ArrowDown': e.preventDefault(); move(7); break;
      case 'ArrowUp': e.preventDefault(); move(-7); break;
      case 'Home': e.preventDefault(); moveToWeekEdge(0); break;
      case 'End': e.preventDefault(); moveToWeekEdge(6); break;
      case 'PageUp': e.preventDefault(); moveMonths(-1); break;
      case 'PageDown': e.preventDefault(); moveMonths(1); break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        activate(d);
        break;
    }
  }
</script>

<div class="cal" class:off={disabled}>
  <div class="head">
    <p class="mth sx-num" aria-live="polite">{monthYearLabel}</p>
    <div class="nav">
      <IconButton label="Mes anterior" size="sm" {disabled} on:click={() => panMonths(-1)}>
        <Glyph name="chevronLeft" size={16} />
      </IconButton>
      <IconButton label="Mes siguiente" size="sm" {disabled} on:click={() => panMonths(1)}>
        <Glyph name="chevronRight" size={16} />
      </IconButton>
    </div>
  </div>

  <table class="grid" role="grid" aria-label={label ? `${label}, ${monthYearLabel}` : monthYearLabel}>
    <thead>
      <tr>
        {#each weekdayHeaders as w (w.long)}
          <th scope="col" role="columnheader" aria-label={w.long}>
            <span class="wd sx-cap" aria-hidden="true">{w.short}</span>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each weeks as week, wi (wi)}
        <tr>
          {#each week as d (d.iso)}
            <td
              role="gridcell"
              class="day sx-num"
              class:out={!d.inMonth}
              class:today={d.isToday}
              class:picked={d.isSelected}
              class:off={d.isDisabled}
              tabindex={!disabled && d.iso === focusIso ? 0 : -1}
              aria-selected={d.isSelected}
              aria-current={d.isToday ? 'date' : undefined}
              aria-disabled={d.isDisabled || undefined}
              aria-label={dayLabel(d)}
              bind:this={cellRefs[d.iso]}
              on:click={() => activate(d)}
              on:keydown={(e) => onKeydown(e, d)}
            >{d.date.getDate()}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .cal { display: flex; flex-direction: column; gap: var(--sx-s-4); max-width: 320px; }
  .off { opacity: .6; }

  .head { display: flex; align-items: center; justify-content: space-between; gap: var(--sx-s-3); }
  .mth {
    margin: 0;
    font-size: var(--sx-t-md);
    font-weight: var(--sx-w-semi);
    letter-spacing: -.01em;
    color: var(--sx-ink);
    /* .sx-num keeps the year lining up if this heading is ever compared beside
       another one; harmless single-word cost the rest of the time. */
  }
  .nav { display: flex; align-items: center; gap: var(--sx-s-1); }

  .grid { border-collapse: collapse; width: 100%; table-layout: fixed; }
  thead th { padding: 0 0 var(--sx-s-2); font-weight: var(--sx-w-normal); }
  .wd { display: block; text-align: center; }

  /* THE AIR IS THE GRID. No rule, no cell background of its own — the padding
     on every <td> is the only thing separating one day from the next. */
  tbody td { padding: 2px; }

  .day {
    position: relative;
    height: var(--sx-s-8);
    text-align: center;
    vertical-align: middle;
    border-radius: var(--sx-r-1);
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-medium);
    color: var(--sx-ink);
    cursor: pointer;
    transition: background var(--sx-fast) var(--sx-ease), color var(--sx-fast) var(--sx-ease);
  }
  .day:hover { background: var(--sx-accent-soft); }
  /* Inset, not outline: an inset ring is clipped by the cell's own r-1 corner
     and can never bleed into the 2px of air the next cell owns — the same
     reasoning Card.selected uses for its own ring. */
  .day:focus-visible {
    background: var(--sx-accent-soft);
    box-shadow: inset 0 0 0 2px var(--sx-ink);
    outline: none;
  }
  :global([data-sx-theme='dark']) .day:focus-visible,
  :global(.sx-dark) .day:focus-visible { box-shadow: inset 0 0 0 2px var(--sx-n-0); }

  /* OUTSIDE THE MONTH — tertiary ink AND normal weight, not a second grey box:
     painting a different background here redraws the cell instead of just
     answering "is this day mine to look at". */
  .day.out { color: var(--sx-ink-3); font-weight: var(--sx-w-normal); }

  /* TODAY — a mark, not a surface. A dot under the figure, never a filled ring
     around it: a filled shape is what CHOSEN means below, and if today reused
     it there would be no way to tell "today" from "today, also chosen" from
     "chosen, a different day" at a glance. */
  .day.today { font-weight: var(--sx-w-semi); }
  .day.today::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 4px;
    transform: translateX(-50%);
    width: var(--sx-s-1);
    height: var(--sx-s-1);
    border-radius: var(--sx-r-pill);
    background: var(--sx-accent);
  }

  /* CHOSEN — the exact fill Table already uses for a selected row
     (--sx-accent-pick, persistent) rather than the hover token
     (--sx-accent-soft, passing) — same distinction, same tokens, so this grid
     reads as the same system and not a separate widget. Declared AFTER .out so
     a chosen day that is also outside the month still reads as chosen. */
  .day.picked {
    background: var(--sx-accent-pick);
    color: var(--sx-ink);
    font-weight: var(--sx-w-semi);
  }
  /* The dot has to survive sitting on the pick fill too — --sx-accent on
     --sx-accent-pick is the same hue on itself, which is legible but not
     DISTINCT, so the mark switches to ink here rather than adding a colour
     the direction does not have a token for. */
  .day.picked.today::after { background: var(--sx-ink); }

  /* DISABLED — opacity and nothing else answers a click or a key; the cell
     stays in the grid and in the tab sequence (see the header comment for
     why), so `pointer-events: none` only removes the MOUSE affordance. */
  .day.off {
    opacity: .45;
    cursor: not-allowed;
    pointer-events: none;
  }

  @media (pointer: coarse) {
    .day { height: var(--sx-touch); }
  }
</style>
