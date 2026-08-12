<script>
  // A LENGTH THAT SAYS WHAT IT IS A LENGTH OF.
  //
  // The reason bars mislead is almost never the drawing — it is the missing
  // scale. Two bars, one twice the other, mean nothing until the reader knows
  // whether the axis starts at zero and where it stops. So `max` is not
  // optional here, and the bound is PRINTED under the track, every time. A bar
  // in this library cannot be drawn without stating what it is a fraction of.
  //
  //   <Bar label="Bodega Opra" value={1_840_000} max={4_200_000} unit="₡" />
  //   <Bar label="Horas del mes" value={186} max={200} unit="h"
  //        tone="attention" toneWord="Cerca del tope" />
  //   <Bar label="Consumo proyectado" value={220} max={200} unit="h" estimate
  //        note="Al ritmo de los últimos 30 días." />
  //
  // COMPARING A LIST: give every Bar in the list the SAME `max`. That is the
  // whole point — a list of bars each scaled to its own value is a list of
  // full bars, which is a decorative border with numbers on it.
  //
  // THE ESTIMATE MARK is the family's: the fill is hatched with the surface
  // colour, the same broken register as Stat's dashed rule and Sparkline's
  // dashed trace, and the word «estimado» rides on the value.
  //
  // OVER THE BOUND is a real reading, not an error. The fill runs to the end,
  // a notch marks that it did not stop there, and the scale line says so in
  // words — clamping silently is how a bar tells its first lie.
  //
  // WHEN NOT TO USE IT: for progress toward a limit somebody must not cross —
  // that is Threshold, which draws the limit as a line and says how much is
  // left. And for parts of a whole: that is StackedBar, and four separate Bars
  // summing to 100 % is a pie chart wearing a disguise.
  import { fmtNum, isBlank, numOf } from './format.js';

  /** The row's name. A bar without one is a decoration. */
  export let label = '';
  /** number | string. Nullish ⇒ «no data yet», never a zero-length bar. */
  export let value = undefined;
  /** The bound the length is a fraction of. Required — see the note above. */
  export let max = undefined;
  /** 'h', 'km', '₡'. Printed with the value and with the scale. */
  export let unit = '';
  /** Money reads «₡1 840 000». */
  export let unitBefore = false;
  /** positive | attention | critical | info | none. */
  export let tone = 'none';
  /** The word the tone travels with. A coloured bar with no word is a colour. */
  export let toneWord = '';
  /** This length is a projection, not a measurement. */
  export let estimate = false;
  /** Replaces the printed scale when «0 — max» is not how the bound reads. */
  export let scale = '';
  /** A quiet line under the track: why it is an estimate, what it excludes. */
  export let note = '';
  /** Hide the printed value, when the row beside it already carries the figure. */
  export let showValue = true;
  /** The record has not arrived yet. */
  export let loading = false;
  /** What went wrong AND how to recover. */
  export let error = '';
  /** The sentence that replaces the bar when there is nothing to draw. */
  export let empty = 'Sin datos todavía';
  /** sm | md */
  export let size = 'md';
  /** Pin the decimals on the value and on the scale. */
  export let decimals = undefined;

  // `$:` and not `const`: these close over `decimals` and `unit`, and a legacy
  // reactive statement only tracks names written inside it.
  $: show = (v) => fmtNum(v, decimals);
  $: withUnit = (v) => (unitBefore ? `${unit}${show(v)}` : `${show(v)}${unit ? ` ${unit}` : ''}`);

  $: v = numOf(value);
  $: m = numOf(max);
  $: usable = !loading && !error && v !== null && m !== null && m > 0;
  $: over = usable && v > m;
  // Negative readings are clamped at the floor: a bar cannot be shorter than
  // nothing, and the printed value still says what was actually read.
  $: pct = usable ? Math.max(0, Math.min(1, v / m)) * 100 : 0;

  $: scaleLine = scale
    || (m === null ? '' : over ? `supera ${withUnit(m)}` : `0 — ${withUnit(m)}`);

  // The read-out a screen reader gets instead of a rectangle. `aria-valuetext`
  // is the whole point: «1 840 000 de 4 200 000 ₡» is a reading, «1840000» is a
  // number nobody can place.
  $: valueText = usable
    ? `${withUnit(v)} de ${withUnit(m)}${over ? ', supera el máximo' : ''}${estimate ? ', estimado' : ''}`
    : '';
</script>

<div class="bar {size}" class:est={estimate} aria-busy={loading || undefined}>
  <div class="head">
    {#if label}<span class="sx-cap lbl">{label}</span>{/if}
    {#if showValue}
      <span class="val sx-num" class:off={!usable}>
        {#if loading}
          <span class="bone sm-bone" aria-hidden="true"></span>
        {:else if usable}
          {withUnit(v)}{#if estimate}<i class="est-word">estimado</i>{/if}
        {:else}
          —
        {/if}
      </span>
    {/if}
  </div>

  {#if loading}
    <span class="track" aria-hidden="true"><span class="bone"></span></span>
  {:else if usable}
    <div
      class="track"
      role="meter"
      aria-label={label || 'Medida'}
      aria-valuenow={Math.min(v, m)}
      aria-valuemin={0}
      aria-valuemax={m}
      aria-valuetext={valueText}
    >
      <span class="fill t-{tone}" style="width: {pct}%"></span>
      {#if over}
        <!-- The bar reached the end and did not stop there. The notch is a
             shape, so it survives the colour being unavailable. -->
        <svg class="over" viewBox="0 0 8 12" aria-hidden="true">
          <path d="M1 1 6.5 6 1 11" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      {/if}
    </div>
  {:else}
    <span class="track empty-track" aria-hidden="true"></span>
  {/if}

  <p class="foot">
    {#if error}
      <span class="bad">
        <svg class="mk" viewBox="0 0 12 12" aria-hidden="true">
          <rect x="2" y="2" width="8" height="8" rx="1.5" fill="currentColor" />
        </svg>
        <span>{error}</span>
      </span>
    {:else if loading}
      <span class="sc">Cargando…</span>
    {:else if !usable}
      <span class="sc">{m === null && v !== null ? 'Sin máximo definido: la barra no puede decir de cuánto.' : empty}</span>
    {:else}
      <span class="sc" class:overs={over}>{scaleLine}</span>
      {#if toneWord && tone !== 'none'}<span class="word t-{tone}">{toneWord}</span>{/if}
    {/if}
    {#if note && !error}<span class="sc note">{note}</span>{/if}
  </p>
</div>

<style>
  .bar { display: flex; flex-direction: column; gap: var(--sx-s-2); min-width: 0; }

  .head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--sx-s-3);
    min-width: 0;
  }
  .lbl { min-width: 0; overflow-wrap: anywhere; }
  .val {
    display: inline-flex;
    align-items: baseline;
    gap: var(--sx-s-2);
    flex: none;
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-semi);
    letter-spacing: -.01em;
    color: var(--sx-ink);
    white-space: nowrap;
  }
  .sm .val { font-size: var(--sx-t-xs); }
  .val.off { color: var(--sx-ink-3); font-weight: var(--sx-w-medium); }

  .est-word {
    font-style: italic;
    font-size: var(--sx-t-2xs);
    font-weight: var(--sx-w-medium);
    letter-spacing: 0;
    color: var(--sx-ink-3);
  }

  /* Sunk, never outlined: the track is a groove the fill sits in, and a 1px
     rectangle would read as a control the person can type into. */
  .track {
    position: relative;
    display: block;
    height: var(--sx-s-3);
    border-radius: var(--sx-r-1);
    background: var(--sx-sunk);
    overflow: hidden;
  }
  .sm .track { height: var(--sx-s-2); border-radius: var(--sx-r-1); }

  .fill {
    display: block;
    height: 100%;
    border-radius: var(--sx-r-1);
    background: var(--sx-ink);
    transition: width var(--sx-beat) var(--sx-ease);
  }
  .fill.t-positive  { background: var(--sx-positive); }
  .fill.t-attention { background: var(--sx-attention); }
  .fill.t-critical  { background: var(--sx-critical); }
  .fill.t-info      { background: var(--sx-info); }

  /* THE ESTIMATE MARK. The same broken register as Stat's dashed rule: the fill
     is cut with stripes of the surface it sits on, so it reads as «drawn, not
     measured» before a single word is read. The stripe geometry is a pattern,
     not a size — there is no token for it, and there should not be. */
  .est .fill {
    background-image: repeating-linear-gradient(
      -45deg,
      transparent 0 5px,
      var(--sx-surface) 5px 7px
    );
  }

  .over {
    position: absolute;
    right: 2px;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 9px;
    color: var(--sx-surface);
  }

  /* Nothing to draw is not a bar of length zero — a zero-length bar is a real
     reading. The groove is left empty and the sentence under it says why. */
  .empty-track { background: var(--sx-sunk); opacity: .6; }

  .foot {
    margin: 0;
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: var(--sx-s-2) var(--sx-s-3);
    font-size: var(--sx-t-2xs);
    line-height: 1.45;
    color: var(--sx-ink-3);
  }
  .sc { font-variant-numeric: tabular-nums lining-nums slashed-zero; }
  .sc.overs { color: var(--sx-ink-2); font-weight: var(--sx-w-medium); }
  .note { max-width: 46ch; font-variant-numeric: normal; }
  .word {
    font-weight: var(--sx-w-semi);
    letter-spacing: .02em;
  }
  .word.t-positive  { color: var(--sx-positive); }
  .word.t-attention { color: var(--sx-attention); }
  .word.t-critical  { color: var(--sx-critical); }
  .word.t-info      { color: var(--sx-info); }

  .bad {
    display: inline-flex;
    align-items: flex-start;
    gap: var(--sx-s-2);
    color: var(--sx-critical);
    max-width: 52ch;
  }
  .mk { flex: none; width: 9px; height: 9px; margin-top: .28em; }

  .bone {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: var(--sx-r-1);
    background: linear-gradient(90deg, var(--sx-sunk), var(--sx-line), var(--sx-sunk));
    background-size: 220% 100%;
    animation: sx-bone 1.4s var(--sx-ease) infinite;
  }
  .sm-bone { width: 5ch; height: .8em; }
  @keyframes sx-bone {
    from { background-position: 120% 0; }
    to   { background-position: -120% 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .bone { animation: none; background: var(--sx-sunk); }
    .fill { transition: none; }
  }
</style>
