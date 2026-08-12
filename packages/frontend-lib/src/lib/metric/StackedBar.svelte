<script>
  // PARTS OF ONE WHOLE, WITH THE PARTS NAMED.
  //
  // The legend is not an accessory to this component; it is half of it. A
  // stacked bar without its legend is four grey rectangles, and a stacked bar
  // whose legend gives only the names is a quiz. So every entry carries its
  // word, its figure and its share, and the bar above is the picture of the
  // list below — which is why the list is always rendered and cannot be
  // switched off.
  //
  //   <StackedBar label="Costo del trimestre" unit="₡"
  //     segments={[
  //       { label: 'Repuestos', value: 1_840_000 },
  //       { label: 'Mano de obra', value: 980_000 },
  //       { label: 'Servicio en sitio', value: 320_000 }
  //     ]} />
  //
  //   <StackedBar label="Planes de la flota" segments={[
  //     { label: 'Al día',     value: 17, tone: 'positive'  },
  //     { label: 'Por vencer', value: 4,  tone: 'attention' },
  //     { label: 'Vencidos',   value: 2,  tone: 'critical'  }
  //   ]} />
  //
  // THE SERIES RAMP IS ACHROMATIC. Four steps of the ink ramp — `--sx-ink`,
  // `--sx-ink-2`, `--sx-ink-3`, `--sx-edge` — because chrome in this system is
  // neutrals plus elevation, and a category palette is the fastest way to end up
  // with six products that each mean something different by «blue». The steps
  // are role tokens, so the ramp inverts correctly in the dark theme instead of
  // disappearing into the ground.
  //
  // A SEGMENT MAY DECLARE A `tone` INSTEAD, and it should whenever the segments
  // ARE states: «al día / por vencer / vencido» is the system's own vocabulary
  // and must look the same here as it does on a Pill. Mixing tones and ramp
  // steps in one bar is allowed and reads fine — the tone wins for that segment.
  //
  // FOUR SEGMENTS IS THE CEILING. Anything past the fourth is folded into
  // «Otros» with its own count, because a fifth grey is a grey nobody can name
  // and the honest answer at that point is a table.
  //
  // AN ESTIMATED SEGMENT is hatched, exactly like Bar's estimated fill, and its
  // legend entry carries the word «estimado». A quarter that is half invoiced
  // and half projected must not read as one measured quarter.
  //
  // WHEN NOT TO USE IT: to compare two wholes. Two stacked bars side by side ask
  // the reader to compare middles that do not share a baseline, and nobody can
  // do that — use one Bar per category with a shared `max`. And never for parts
  // that overlap: the bar claims they sum to the total, so if a machine can be
  // in two of the segments at once the picture is wrong before it is drawn.
  import { fmtNum, numOf } from './format.js';

  /** What the whole is. Also the accessible name of the drawing. */
  export let label = '';
  /** [{ label, value, tone?, estimate? }] — order is kept; it is the reading order. */
  export let segments = [];
  /** 'h', '₡'. Printed with every figure in the legend. */
  export let unit = '';
  /** Money reads «₡1 840 000». */
  export let unitBefore = false;
  /**
   * The whole, when the segments do not add up to it — «3 de 22 equipos».
   * Left alone, the whole IS the sum and the bar always fills its track.
   */
  export let total = undefined;
  /** The word for the remainder when `total` exceeds the sum. */
  export let restLabel = 'Sin clasificar';
  /** Print the share beside each figure. Off when the figures are the point. */
  export let showShare = true;
  /** The record has not arrived yet. */
  export let loading = false;
  /** What went wrong AND how to recover. */
  export let error = '';
  /** The sentence that replaces the bar when there is nothing in it. */
  export let empty = 'Sin datos todavía';
  /** Pin the decimals across every figure in the legend. */
  export let decimals = undefined;
  /** sm | md */
  export let size = 'md';

  const RAMP = ['a', 'b', 'c', 'd'];
  const MAX_STEPS = 4;

  // `$:` and not `const`: both close over props, and a legacy reactive statement
  // tracks only the names written inside it.
  $: show = (v) => fmtNum(v, decimals);
  $: withUnit = (v) => (unitBefore ? `${unit}${show(v)}` : `${show(v)}${unit ? ` ${unit}` : ''}`);

  $: clean = (segments ?? [])
    .map((s) => ({ ...s, n: numOf(s?.value) ?? 0 }))
    .filter((s) => s.n > 0);

  // Past the fourth step the ramp runs out of greys a person can tell apart, so
  // the tail is folded up and SAID to be folded up rather than silently dropped.
  $: shown = (() => {
    if (clean.length <= MAX_STEPS) return clean;
    const keep = clean.slice(0, MAX_STEPS - 1);
    const rest = clean.slice(MAX_STEPS - 1);
    return [
      ...keep,
      {
        label: `Otros (${rest.length})`,
        n: rest.reduce((a, s) => a + s.n, 0),
        estimate: rest.some((s) => s.estimate)
      }
    ];
  })();

  $: sum = shown.reduce((a, s) => a + s.n, 0);
  $: declared = numOf(total);
  // A declared total larger than the sum leaves a remainder, and the remainder
  // is part of the reading: «17 de 22» is only honest if the other 5 are drawn.
  $: whole = declared !== null && declared > sum ? declared : sum;
  $: rest = whole - sum;

  $: usable = !loading && !error && sum > 0;

  // Every segment, ready to draw: its width, its ramp step or its tone, and the
  // share the legend prints beside its figure.
  $: parts = usable
    ? shown.map((s, i) => ({
        label: s.label ?? '',
        n: s.n,
        pct: (s.n / whole) * 100,
        tone: s.tone && s.tone !== 'none' ? s.tone : '',
        step: RAMP[i % RAMP.length],
        estimate: !!s.estimate
      }))
    : [];

</script>

<div class="stack {size}" aria-busy={loading || undefined}>
  {#if label}
    <div class="head">
      <span class="sx-cap lbl">{label}</span>
      {#if usable}<span class="tot sx-num">{withUnit(whole)}</span>{/if}
    </div>
  {/if}

  {#if loading}
    <span class="track" aria-hidden="true"><span class="bone"></span></span>
  {:else if usable}
    <!-- The picture is hidden from assistive tech and the legend is not. The
         alternative — a `role="img"` whose label recites the whole composition —
         makes a screen reader read every figure twice, once as a sentence and
         once as the list right under it. The list is the data; the bar is the
         list, drawn. -->
    <div class="track" aria-hidden="true">
      {#each parts as p, i (p.label + i)}
        <span
          class="seg s-{p.step} {p.tone ? `t-${p.tone}` : ''}"
          class:est={p.estimate}
          style="width: {p.pct}%"
        ></span>
      {/each}
      {#if rest > 0}<span class="seg rest" style="width: {(rest / whole) * 100}%"></span>{/if}
    </div>
  {:else}
    <span class="track empty-track" aria-hidden="true"></span>
  {/if}

  {#if error}
    <p class="say bad">
      <svg class="mk" viewBox="0 0 12 12" aria-hidden="true">
        <rect x="2" y="2" width="8" height="8" rx="1.5" fill="currentColor" />
      </svg>
      <span>{error}</span>
    </p>
  {:else if !usable && !loading}
    <p class="say">{empty}</p>
  {:else if usable}
    <!-- The legend IS the component: the word, the figure and the share, in the
         same order as the bar above. Never optional. -->
    <ul class="legend" aria-label={label ? `Composición de ${label}` : 'Composición'}>
      {#each parts as p, i (p.label + i)}
        <li>
          <span class="sw s-{p.step} {p.tone ? `t-${p.tone}` : ''}" class:est={p.estimate}
            aria-hidden="true"></span>
          <span class="name">{p.label}</span>
          <span class="fig sx-num">{withUnit(p.n)}</span>
          {#if showShare}<span class="sh sx-num">{Math.round(p.pct)} %</span>{/if}
          {#if p.estimate}<i class="est-word">estimado</i>{/if}
        </li>
      {/each}
      {#if rest > 0}
        <li>
          <span class="sw rest" aria-hidden="true"></span>
          <span class="name">{restLabel}</span>
          <span class="fig sx-num">{withUnit(rest)}</span>
          {#if showShare}<span class="sh sx-num">{Math.round((rest / whole) * 100)} %</span>{/if}
        </li>
      {/if}
    </ul>
  {/if}
</div>

<style>
  .stack { display: flex; flex-direction: column; gap: var(--sx-s-2); min-width: 0; }

  .head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--sx-s-3);
    min-width: 0;
  }
  .lbl { min-width: 0; overflow-wrap: anywhere; }
  .tot {
    flex: none;
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-semi);
    letter-spacing: -.01em;
    white-space: nowrap;
  }

  .track {
    display: flex;
    width: 100%;
    height: var(--sx-s-3);
    border-radius: var(--sx-r-1);
    background: var(--sx-sunk);
    overflow: hidden;
  }
  .sm .track { height: var(--sx-s-2); }

  .seg {
    display: block;
    height: 100%;
    /* Two adjacent steps of one grey ramp can land close on a dirty screen, so
       a cut of the surface colour separates them by shape as well as by value.
       The last one has nothing to its right, so it keeps its full width. */
    box-shadow: -1px 0 0 var(--sx-surface) inset;
    min-width: 2px;
  }
  .seg:last-child { box-shadow: none; }

  /* The achromatic series ramp, built from role tokens so it inverts with the
     theme instead of vanishing into the ground. */
  .s-a { background: var(--sx-ink); }
  .s-b { background: var(--sx-ink-2); }
  .s-c { background: var(--sx-ink-3); }
  .s-d { background: var(--sx-edge); }

  /* When the segments ARE states, they use the system's own vocabulary. */
  .t-positive  { background: var(--sx-positive); }
  .t-attention { background: var(--sx-attention); }
  .t-critical  { background: var(--sx-critical); }
  .t-info      { background: var(--sx-info); }
  .t-neutral   { background: var(--sx-neutral); }

  /* --sx-line es ambiente: separa filas, cierra cabeceras, y no lleva piso de
     contraste porque una hairline decorativa no lo necesita. Este segmento no
     es una hairline: pinta cuánto falta, que es un dato, y WCAG 1.4.11 le pide
     3:1 contra el fondo real del track (--sx-sunk). --sx-edge es el token del
     límite que SÍ tiene que verse — el mismo que ya pinta el último escalón de
     la rampa acromática arriba (.s-d) — y resuelve a 4.04:1 en claro y 5.97:1
     en oscuro contra --sx-sunk, contra el 1.15:1 / 1.26:1 que dejaba --sx-line. */
  .rest { background: var(--sx-edge); }

  /* The family's estimate mark, on a fill instead of on a figure. */
  .est {
    background-image: repeating-linear-gradient(
      -45deg,
      transparent 0 5px,
      var(--sx-surface) 5px 7px
    );
  }

  .empty-track { opacity: .6; }

  .legend {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-1);
  }
  .legend li {
    display: flex;
    align-items: baseline;
    gap: var(--sx-s-2);
    font-size: var(--sx-t-xs);
    line-height: 1.5;
    color: var(--sx-ink-2);
    min-width: 0;
  }
  /* A slice of the bar, not a dot: the swatch echoes the track's own radius so
     the eye matches it to the segment above without being told to. */
  .sw {
    flex: none;
    width: 14px;
    height: 8px;
    border-radius: var(--sx-r-1);
    align-self: center;
  }
  .name { flex: 1 1 auto; min-width: 0; overflow-wrap: anywhere; }
  .fig {
    flex: none;
    font-weight: var(--sx-w-semi);
    color: var(--sx-ink);
    white-space: nowrap;
  }
  .sh { flex: none; color: var(--sx-ink-3); min-width: 4ch; text-align: right; }
  .est-word {
    flex: none;
    font-style: italic;
    font-size: var(--sx-t-2xs);
    color: var(--sx-ink-3);
  }

  .say {
    margin: 0;
    display: flex;
    align-items: center;
    gap: var(--sx-s-2);
    font-size: var(--sx-t-xs);
    line-height: 1.45;
    color: var(--sx-ink-3);
    max-width: 52ch;
  }
  .bad { color: var(--sx-critical); align-items: flex-start; }
  .mk { flex: none; width: 9px; height: 9px; margin-top: .28em; }

  .bone {
    display: block;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, var(--sx-sunk), var(--sx-line), var(--sx-sunk));
    background-size: 220% 100%;
    animation: sx-bone 1.4s var(--sx-ease) infinite;
  }
  @keyframes sx-bone {
    from { background-position: 120% 0; }
    to   { background-position: -120% 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .bone { animation: none; background: var(--sx-sunk); }
  }
</style>
