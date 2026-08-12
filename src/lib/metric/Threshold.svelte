<script>
  // A LINE SOMEBODY MUST NOT CROSS.
  //
  // This is not a general-purpose bar with a colour that changes at a
  // breakpoint — that already exists (`<Bar tone="critical" toneWord="…">`,
  // the second Panel in the catalogue's Bar section) and it is not enough.
  // `Bar.svelte` names the exact gap this fills, in its own header: «para el
  // avance hacia un límite que alguien no debe cruzar — eso es Threshold, que
  // dibuja el límite como una línea y dice cuánto falta.» `Stat.svelte` names
  // the other half: «una cifra que de verdad cruzó una línea es trabajo de
  // Threshold» — a delta never turns critical, because a TREND is not a
  // CROSSING, and this component is where a crossing gets to be one.
  //
  //   <Threshold label="Horómetro de BAT014" value={312} limit={250} unit="h" />
  //   <!-- «límite 250 h · superado por 62 h», tono crítico, marca, «Vencido» -->
  //
  //   <Threshold label="Presupuesto del trimestre" value={3_400_000}
  //              limit={4_200_000} unit="₡" unitBefore overWord="Sobrepasado" />
  //
  // THREE THINGS A COLOUR-CHANGING BAR CANNOT DO, WHICH IS THE WHOLE REASON
  // THIS IS A SEPARATE COMPONENT AND NOT A `Bar` PRESET:
  //
  //   1. THE LIMIT IS A LINE, drawn at its own position on the track — not a
  //      fill that happens to turn red past some point nobody can see. A mark
  //      you compare the fill against, not a colour that changes when passed.
  //   2. IT SAYS THE DISTANCE, in the data's own unit. «312 h» beside «250 h
  //      del plan» still makes somebody subtract; the footer does the
  //      subtraction and prints «faltan 12 h» or «superado por 62 h» so
  //      nobody has to.
  //   3. CROSSING IS A STATE, and this system already has the grammar for a
  //      state — tone + mark + word, `marks.js`'s own law, the one Pill
  //      exists to hold up. `Bar`'s `toneWord` is colour plus a word; it has
  //      never carried the shape, because `Bar` does not know if the tone it
  //      was handed means anything in particular. `Threshold` always knows:
  //      crossed means crossed, so the mark rides along for real.
  //
  // API AND FORM DELIBERATELY MIRROR `Bar` — same head, same track, same
  // foot, same loading/error/empty/estimate states, same `size`, same
  // `decimals`. `limit` stands where `max` stands in `Bar`, required for the
  // identical reason `max` is required there: a line with nothing to be a
  // fraction of is not a line, it is a guess. Read `Bar.svelte` end to end
  // before changing this file — they have to keep reading as siblings, not as
  // two components that happen to draw a rectangle.
  //
  // ─────────────────────────────────────────────────────────────────────────
  // THE CASE THAT BREAKS, AND WHY THE SCALE IS THE LIMIT'S, NOT THE VALUE'S.
  //
  // A reading can clear the limit by a little or by a lot, and the naive
  // fixes both fail for a stated reason:
  //
  //   SCALE TO THE VALUE (`domain = value`) and the limit line slides left
  //   every time the value grows — at 3× the limit the line sits at 33 % and
  //   at 10× it is pinned against the label, unreadable. The one thing a
  //   THRESHOLD cannot do is move.
  //
  //   SCALE TO THE LIMIT ALONE (`domain = limit`) and a value past it pushes
  //   the fill past 100 % — «se sale», the container overflows or the fill
  //   silently clamps with nothing marking that it did, which is Bar's own
  //   definition of a bar's first lie (see «OVER THE BOUND» in Bar.svelte).
  //
  // The fix keeps the scale anchored to the limit — because the limit is the
  // fact that does not change, and it is the value that misbehaves — but
  // gives it a fixed band of HEADROOM past the line: `domain = limit × (1 +
  // overRoom)`, `overRoom` defaulting to .25. Two consequences fall out of
  // that one formula:
  //
  //   THE LINE NEVER MOVES. `limit / domain` is `1 / (1 + overRoom)`, a
  //   constant that does not depend on `value` at all — at .25 that is 80 %,
  //   always, whether the reading is under, barely over, or absent. The
  //   thing that must stay put, stays put.
  //
  //   A NORMAL OVERAGE (up to 25 % past the limit) still gets a real,
  //   proportional read past the line — the worked example above, 312 h
  //   against 250 h, is 24.8 % over and lands one pixel short of the clamp on
  //   purpose, so the catalogue's own example is the edge of the band, not a
  //   safe case chosen to avoid it. PAST THE BAND, the fill clamps at 100 %
  //   and carries Bar's own overflow notch — the exact mark and the exact
  //   reasoning, borrowed rather than reinvented, because a threshold that
  //   invented its OWN way of saying «and then some more» would be teaching a
  //   second alphabet for the same fact Bar already teaches. The footer's
  //   number is what carries an overage the drawing physically cannot: a
  //   value 40× the limit and a value 4× the limit clamp to the identical
  //   pixel, and «superado por…» is what tells them apart.
  import { fmtNum, isBlank, numOf } from './format.js';
  import { MARKS } from '../marks.js';

  /** The row's name. */
  export let label = '';
  /** number | string. Nullish ⇒ «no data yet», never a zero-length bar. */
  export let value = undefined;
  /** The line. Required — a threshold with nothing to cross is not one. */
  export let limit = undefined;
  /** 'h', 'km', '₡'. Printed with the value and with the footer. */
  export let unit = '';
  /** Money reads «₡1 840 000». */
  export let unitBefore = false;
  /** This reading is a projection, not a measurement. */
  export let estimate = false;
  /** A quiet line under the track: why it is an estimate, what it excludes. */
  export let note = '';
  /** Hide the printed value, when the row beside it already carries the figure. */
  export let showValue = true;
  /** The record has not arrived yet. */
  export let loading = false;
  /** What went wrong AND how to recover. */
  export let error = '';
  /** The sentence that replaces the track when there is nothing to draw. */
  export let empty = 'Sin datos todavía';
  /** sm | md */
  export let size = 'md';
  /** Pin the decimals on the value and on the footer. */
  export let decimals = undefined;
  /**
   * Fraction of `limit` kept as headroom past the line before the fill
   * clamps and hands off to the overflow notch. See the note above — the
   * default (.25) is not a round number picked for looks, it is the band the
   * worked example in this file's header was chosen to sit just inside of.
   */
  export let overRoom = 0.25;
  /** Replaces the printed footer line when «límite … · …» is not how it reads. */
  export let scale = '';
  /** The word the crossed state travels with. Never fewer than tone + mark + word. */
  export let overWord = 'Supera el límite';

  // `$:` and not `const`: these close over `decimals` and `unit`, and a
  // legacy reactive statement only tracks names written inside it — the same
  // trap Bar's own header documents for itself.
  $: show = (v) => fmtNum(v, decimals);
  $: withUnit = (v) => (unitBefore ? `${unit}${show(v)}` : `${show(v)}${unit ? ` ${unit}` : ''}`);

  $: v = numOf(value);
  $: lim = numOf(limit);
  $: usable = !loading && !error && v !== null && lim !== null && lim > 0;
  $: over = usable && v > lim;
  $: delta = usable ? Math.abs(v - lim) : null;

  // The domain the TRACK is scaled to — not `lim`, `lim`'s own headroom band.
  // See «THE CASE THAT BREAKS» above.
  $: domain = usable ? lim * (1 + overRoom) : 0;
  // Negative readings clamp at the floor, same as Bar: a fill cannot be
  // shorter than nothing, and the printed value still says what was read.
  $: pct = usable ? Math.max(0, Math.min(1, v / domain)) * 100 : 0;
  // Constant — does not depend on `v`. The line's whole job is to not move.
  $: linePct = usable ? (1 / (1 + overRoom)) * 100 : 0;
  // Past the headroom band: the fill has clamped at 100 % and the notch
  // marks that it did not stop there, exactly like Bar's own «over».
  $: clampedOver = usable && v > domain;

  $: scaleLine = scale
    || (usable
      ? over
        ? `límite ${withUnit(lim)} · superado por ${withUnit(delta)}`
        : `límite ${withUnit(lim)} · faltan ${withUnit(delta)}`
      : '');

  // The read-out a screen reader gets instead of a rectangle — Bar's own
  // reasoning for `aria-valuetext`, word for word: «312 de 250 h, supera el
  // límite por 62 h» is a reading, «312» is a number nobody can place.
  $: valueText = usable
    ? `${withUnit(v)}${
        over
          ? `, supera el límite de ${withUnit(lim)} por ${withUnit(delta)}`
          : `, faltan ${withUnit(delta)} para el límite de ${withUnit(lim)}`
      }${estimate ? ', estimado' : ''}`
    : '';
</script>

<div class="thr {size}" class:est={estimate} aria-busy={loading || undefined}>
  <div class="head">
    {#if label}<span class="sx-cap lbl">{label}</span>{/if}
    {#if showValue}
      <span class="val sx-num" class:off={!usable} class:t-critical={over}>
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
      aria-valuenow={Math.min(v, domain)}
      aria-valuemin={0}
      aria-valuemax={domain}
      aria-valuetext={valueText}
    >
      <span class="fill" class:t-critical={over} style="width: {pct}%"></span>
      <!-- The line. Its position is `linePct`, a constant — see the header
           note on why it never moves. A halo of --sx-surface on both sides
           means it reads whether it sits over the fill or the empty track,
           the same trick Button's focus ring uses against its own fill. -->
      <span class="mark" style="left: {linePct}%" aria-hidden="true"></span>
      {#if clampedOver}
        <!-- Bar's own notch, unchanged: the fill reached the end and did not
             stop there. Borrowed, not reinvented — see the header note. -->
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
      <span class="sc">{lim === null && v !== null ? 'Sin límite definido: no hay línea que dibujar.' : empty}</span>
    {:else}
      <span class="sc" class:overs={over}>{scaleLine}</span>
      {#if over}
        <!-- Tono + marca + palabra, nunca menos de las tres — la ley de
             Pill, aplicada acá porque cruzar la línea ES el estado que este
             componente existe para nombrar. -->
        <span class="flag">
          <svg class="mk" viewBox="0 0 12 12" aria-hidden="true">{@html MARKS.critical}</svg>
          <span>{overWord}</span>
        </span>
      {/if}
    {/if}
    {#if note && !error}<span class="sc note">{note}</span>{/if}
  </p>
</div>

<style>
  .thr { display: flex; flex-direction: column; gap: var(--sx-s-2); min-width: 0; }

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
  .val.t-critical { color: var(--sx-critical); }

  .est-word {
    font-style: italic;
    font-size: var(--sx-t-2xs);
    font-weight: var(--sx-w-medium);
    letter-spacing: 0;
    color: var(--sx-ink-3);
  }

  /* Sunk, never outlined — the same reasoning as Bar's own `.track`: a 1px
     rectangle reads as a control somebody can type into. */
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
    transition: width var(--sx-beat) var(--sx-ease), background-color var(--sx-fast) var(--sx-ease);
  }
  .fill.t-critical { background: var(--sx-critical); }

  /* THE ESTIMATE MARK — Bar's own stripe, the same broken register as Stat's
     dashed rule and Sparkline's dashed trace. No token for the geometry,
     same as Bar: it is a pattern, not a size. */
  .est .fill {
    background-image: repeating-linear-gradient(
      -45deg,
      transparent 0 5px,
      var(--sx-surface) 5px 7px
    );
  }

  /* THE LINE. `overflow: hidden` on `.track` clips it to the same rounded
     box the fill lives in, so it never draws a hairline outside the shape it
     is supposed to be marking. 2px wide plus a 1px halo of --sx-surface on
     both sides — the halo is what keeps it legible whether it lands on the
     fill (ink or critical) or on the bare --sx-sunk track, the same
     surface-coloured-band trick Button's own focus ring uses against a
     near-black fill. Never `border`: a border occupies layout inside a flex
     row that does not have a slot for it; `box-shadow` does not. */
  .mark {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--sx-ink);
    box-shadow: 0 0 0 1px var(--sx-surface);
    transform: translateX(-50%);
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
  .sc.overs { color: var(--sx-critical); font-weight: var(--sx-w-medium); }
  .note { max-width: 46ch; font-variant-numeric: normal; }

  /* The crossed-state flag: Pill's own vocabulary (tone + mark + word),
     inlined rather than imported — Bar does the same for its `.word`, and
     the metric family stays free of a cross-family import for one small
     tag. Solid critical, not a wash: this is the one moment in the whole
     family where colour is allowed to carry real weight on its own, because
     it never travels alone here — the shape and the word ride with it. */
  .flag {
    display: inline-flex;
    align-items: center;
    gap: var(--sx-s-1);
    padding: 1px var(--sx-s-2);
    border-radius: var(--sx-r-pill);
    background: var(--sx-critical-band);
    color: var(--sx-critical);
    border: 1px solid var(--sx-critical-edge);
    font-weight: var(--sx-w-semi);
    font-variant-numeric: normal;
  }
  .flag .mk { flex: none; width: 8px; height: 8px; }

  .bad {
    display: inline-flex;
    align-items: flex-start;
    gap: var(--sx-s-2);
    color: var(--sx-critical);
    max-width: 52ch;
  }
  .bad .mk { flex: none; width: 9px; height: 9px; margin-top: .28em; }

  /* El brillo que barre era casi invisible en oscuro (~1.11-1.25:1, --sx-line
     contra --sx-sunk) — mismo defecto y mismo arreglo que Stat.svelte, ver ese
     archivo para los números completos. */
  .bone {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: var(--sx-r-1);
    background: linear-gradient(90deg, var(--sx-sunk), var(--sx-edge), var(--sx-sunk));
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
