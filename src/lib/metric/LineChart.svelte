<script>
  // A LINE, WITH ITS AXES.
  //
  // Sparkline is the shape of a series at the size of a word: no ticks, no grid,
  // nothing you can read a value off. LineChart is the chart for when that is
  // not enough — when the reader has to answer «¿cuánto en marzo?», not just
  // «¿venía subiendo?». It has axes, a printed y-scale and named x-ticks, so a
  // figure can be read off it. That is the whole line between the two: if nobody
  // reads a number off the drawing, it is a Sparkline and belongs beside a Stat.
  //
  //   <LineChart label="Ventas por mes" unit="₡"
  //              labels={['ene','feb','mar','abr']}
  //              values={[380000, 412000, 405000, 468000]} />
  //
  //   Two series share one frame and a legend that cannot be switched off — a
  //   line without a name in a two-line chart is unreadable:
  //   <LineChart label="Ingreso vs. costo" unit="₡"
  //              labels={['ene','feb','mar']}
  //              datasets={[
  //                { label: 'Ingreso', values: [380, 412, 405] },
  //                { label: 'Costo',   values: [210, 240, 235] }
  //              ]} />
  //
  // TWO RULES THIS FAMILY HOLDS, HELD HERE TOO:
  //
  //   NOTHING IS NOT ZERO. An empty series does not draw a flat line on the
  //   floor — that reads as «it was zero all year», a claim about the business.
  //   It draws nothing and prints the sentence that says what would fill it.
  //
  //   A SINGLE POINT IS NOT A LINE. One reading has no slope, so there is no
  //   line to draw; the chart says so and waits for the second reading rather
  //   than inventing a trend from one dot.
  //
  // NO TOOLTIP, ON PURPOSE (for now). The axes let a value be read to the tick;
  // an exact per-point read-out is a Table's job, shown beside the chart. When a
  // hover read-out lands it goes here, but the chart is legible without it.
  //
  // WHEN NOT TO USE IT: for a series with holes. Like Sparkline this draws a
  // dense line, so a missing month silently closes the gap and bends the slope —
  // show the Table. And for a single figure with a trend, that is a Stat with a
  // Sparkline beside it, not a full chart with four ticks and one point.
  import { fmtNum, numOf } from './format.js';

  /** What the whole chart is. The accessible name; also printed if no legend. */
  export let label = '';
  /** X-axis tick labels, oldest → newest. One per point. */
  export let labels = [];
  /** A single series, oldest → newest. Dense: no nulls in the middle. */
  export let values = [];
  /** Several series `[{ label, values }]`. Overrides `values` when non-empty. */
  export let datasets = [];
  /** '₡', 'h', '%'. Printed after every y-tick and read in the description. */
  export let unit = '';
  /** Unit sits in front of the y-tick (money: «₡4 820»). */
  export let unitBefore = false;
  /** sm | md | lg — the height of the plot. Width fills the container. */
  export let size = 'md';
  /** «12 meses», «del 1.º de enero». Printed under the plot. */
  export let caption = '';
  /** The record has not arrived yet. Shows a bone, not an empty frame. */
  export let loading = false;
  /** What went wrong AND how to recover. Both, or it is half a message. */
  export let error = '';
  /** The sentence that replaces the plot when there is nothing to draw. */
  export let empty = 'Sin datos todavía';
  /** Decimals for the y-tick read-out. Left null, ticks keep at most one. */
  export let decimals = undefined;

  // The line colours, in order. The first series is the accent — the tenant's
  // own colour, the one thing on the dashboard with an opinion — and the rest
  // are the semantic tones, spaced so no two adjacent lines share a hue family.
  const TONES = [
    'var(--sx-accent)',
    'var(--sx-info)',
    'var(--sx-positive)',
    'var(--sx-attention)',
    'var(--sx-critical)'
  ];

  // Plot height per size, in px. The width is measured from the box (1 SVG unit
  // = 1 px), so a tick label at 11px reads at 11px whatever the container does —
  // the same reason Sparkline binds its own width rather than scaling a viewBox.
  const HEIGHT = { sm: 132, md: 188, lg: 260 };
  // Room for the y-scale (left), x-ticks (bottom), and half a dot (top/right).
  const PAD = { top: 10, right: 12, bottom: 26, left: 46 };
  // At most this many x-labels are printed; denser series thin out evenly so
  // labels never collide into an unreadable smear.
  const MAX_XTICKS = 7;

  let w = 0;

  $: h = HEIGHT[size] ?? HEIGHT.md;

  // Normalise to a list of series, each a clean numeric array. `datasets` wins;
  // `values` is the one-series shorthand.
  $: series = (datasets?.length
    ? datasets.map((d) => ({ label: d?.label ?? '', values: (d?.values ?? []).map(numOf) }))
    : [{ label, values: (values ?? []).map(numOf) }]
  ).map((s) => ({ ...s, clean: s.values.filter((v) => v !== null) }));

  $: pool = series.flatMap((s) => s.clean);
  $: longest = Math.max(0, ...series.map((s) => s.values.length));
  // A line needs two points; with fewer than that in every series there is
  // nothing to draw (a single dot is handled as its own «one reading» state).
  $: drawable = series.filter((s) => s.clean.length >= 2);
  $: nothing = pool.length === 0;
  $: single = !nothing && drawable.length === 0;

  $: show = (v) => fmtNum(v, decimals);

  // A "nice" y-scale: round the domain outward to human numbers (1/2/2.5/5 ×10ⁿ)
  // so ticks read «0, 100, 200» not «0, 137, 274». Zero is included in the
  // domain when the data does not cross it, so a line's height is honest against
  // a real floor rather than a cropped one.
  $: scale = (() => {
    if (nothing) return null;
    let lo = Math.min(...pool);
    let hi = Math.max(...pool);
    if (lo > 0) lo = 0;
    if (hi < 0) hi = 0;
    if (hi === lo) hi = lo + 1;
    const span = hi - lo;
    const rawStep = span / 4;
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const step = [1, 2, 2.5, 5, 10].map((f) => f * mag).find((s) => s >= rawStep) ?? mag;
    const start = Math.floor(lo / step) * step;
    const end = Math.ceil(hi / step) * step;
    const ticks = [];
    for (let t = start; t <= end + step * 1e-6; t += step) {
      ticks.push(Number(t.toFixed(10)));
    }
    return { lo: start, hi: end, ticks };
  })();

  // The whole drawing, computed once per box/series change: the two axis maps,
  // one path per series, each series' endpoint dot, and the thinned x-ticks.
  $: geo = (() => {
    if (!w || nothing || !scale) return null;
    const iw = Math.max(1, w - PAD.left - PAD.right);
    const ih = Math.max(1, h - PAD.top - PAD.bottom);
    const n = Math.max(longest, 1);
    const X = (i) => PAD.left + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
    const Y = (v) => PAD.top + ih - ((v - scale.lo) / (scale.hi - scale.lo)) * ih;
    const zeroY = scale.lo <= 0 && scale.hi >= 0 ? Y(0) : null;

    const paths = series.map((s, si) => {
      // A hole (a null in the middle) breaks the line rather than leaping the
      // gap: a bridged null is a slope nobody measured.
      let d = '';
      let pen = false;
      s.values.forEach((v, i) => {
        if (v === null) { pen = false; return; }
        d += `${pen ? 'L' : 'M'}${X(i).toFixed(2)} ${Y(v).toFixed(2)} `;
        pen = true;
      });
      // The endpoint dot sits on the last real reading — where «hoy» is.
      let last = -1;
      for (let i = s.values.length - 1; i >= 0; i--) {
        if (s.values[i] !== null) { last = i; break; }
      }
      return {
        d: d.trim(),
        tone: TONES[si % TONES.length],
        drawable: s.clean.length >= 2,
        dot: last >= 0 ? { x: X(last), y: Y(s.values[last]) } : null
      };
    });

    const yTicks = scale.ticks.map((t) => ({ v: t, y: Y(t) }));

    // Thin the x-labels: keep the first, the last, and an even spread between,
    // never more than MAX_XTICKS. Fewer labels than that print in full.
    const total = labels?.length ?? 0;
    const xTicks = [];
    if (total) {
      const stride = Math.max(1, Math.ceil(total / MAX_XTICKS));
      for (let i = 0; i < total; i += stride) xTicks.push({ i, x: X(i), text: labels[i] });
      const lastIdx = total - 1;
      if (xTicks.length && xTicks[xTicks.length - 1].i !== lastIdx) {
        xTicks.push({ i: lastIdx, x: X(lastIdx), text: labels[lastIdx] });
      }
    }

    return { X, Y, zeroY, paths, yTicks, xTicks, base: PAD.top + ih };
  })();

  // The description a screen reader gets — checked against what is actually
  // drawn, per the family's rule that an overstated aria-label is worse than none.
  $: described = (() => {
    const what = label || 'Serie';
    if (loading) return `${what}: cargando.`;
    if (error) return `${what}: no se pudo leer.`;
    if (nothing) return `${what}: ${empty.toLowerCase()}.`;
    if (single) return `${what}: una sola lectura, aún sin línea.`;
    const u = unit ? ` ${unit}` : '';
    const parts = drawable.map((s) => {
      const a = s.clean[0];
      const b = s.clean[s.clean.length - 1];
      const dir = b > a ? 'sube' : b < a ? 'baja' : 'se mantiene';
      const name = s.label ? `${s.label}: ` : '';
      return `${name}de ${show(a)}${u} a ${show(b)}${u}, ${dir}`;
    });
    return `${what}. ${parts.join('. ')}.`;
  })();
</script>

<div class="lc {size}" aria-busy={loading || undefined}>
  <div class="box" bind:clientWidth={w} style="height: {h}px">
    {#if loading}
      <span class="bone" aria-hidden="true"></span>
    {:else if error || nothing || single}
      <!-- No plot: the frame would lie. The sentence below carries the state. -->
      <span class="flat" aria-hidden="true"></span>
    {:else if geo}
      <svg width={w} height={h} viewBox="0 0 {w} {h}" role="img" aria-label={described}>
        <!-- Y grid + scale. The zero line is solid (a real floor); the rest are
             dashed guides that must not compete with the data. -->
        {#each geo.yTicks as t}
          <line
            class="grid"
            class:zero={geo.zeroY !== null && Math.abs(t.y - geo.zeroY) < 0.5}
            x1={PAD.left}
            y1={t.y.toFixed(2)}
            x2={w - PAD.right}
            y2={t.y.toFixed(2)}
          />
          <text class="tk y" x={PAD.left - 8} y={t.y.toFixed(2)} dy="0.32em" text-anchor="end">
            {#if unitBefore && unit}{unit} {/if}{show(t.v)}{#if !unitBefore && unit} {unit}{/if}
          </text>
        {/each}

        <!-- X ticks, thinned so labels never collide. -->
        {#each geo.xTicks as t}
          <text class="tk x" x={t.x.toFixed(2)} y={geo.base + 16} text-anchor="middle">{t.text}</text>
        {/each}

        <!-- One path + one endpoint dot per series. -->
        {#each geo.paths as p}
          {#if p.drawable}
            <path
              d={p.d}
              fill="none"
              stroke={p.tone}
              stroke-width="2"
              stroke-linejoin="round"
              stroke-linecap="round"
            />
            {#if p.dot}
              <circle cx={p.dot.x.toFixed(2)} cy={p.dot.y.toFixed(2)} r="3.2" fill="var(--sx-surface)" stroke={p.tone} stroke-width="2" />
            {/if}
          {/if}
        {/each}
      </svg>
    {/if}
  </div>

  <!-- Legend: half the component when there is more than one line, and never
       switchable off — an unnamed line in a multi-line chart is unreadable. -->
  {#if !loading && !error && !nothing && !single && series.length > 1}
    <div class="legend">
      {#each geo?.paths ?? [] as p, i}
        <span class="key">
          <svg width="16" height="4" aria-hidden="true">
            <line x1="1" y1="2" x2="15" y2="2" stroke={p.tone} stroke-width="2.5" stroke-linecap="round" />
          </svg>
          <span>{series[i].label || `Serie ${i + 1}`}</span>
        </span>
      {/each}
    </div>
  {/if}

  {#if error}
    <p class="say bad">
      <svg class="mk" viewBox="0 0 12 12" aria-hidden="true">
        <rect x="2" y="2" width="8" height="8" rx="1.5" fill="currentColor" />
      </svg>
      <span>{error}</span>
    </p>
  {:else if nothing && !loading}
    <p class="say">{empty}</p>
  {:else if single}
    <p class="say">Una sola lectura: la línea aparece con la segunda, y con ella la pendiente.</p>
  {:else if caption}
    <p class="say">{caption}</p>
  {/if}
</div>

<style>
  /* The screen-reader-only rule is carried, not borrowed from base.css: a Core
     module in a shadow root re-declares only the type registers, so a component
     that needs it and does not carry it goes silent in exactly the embedded
     surfaces this library exists for (same note as Stat/Sparkline). */
  .lc { display: flex; flex-direction: column; gap: var(--sx-s-2); min-width: 0; }

  .box {
    position: relative;
    width: 100%;
    min-width: 0;
    display: flex;
    align-items: stretch;
  }
  .box svg { display: block; width: 100%; overflow: visible; }

  /* The grid is a guide, not data: it stays at --sx-line so it never competes
     with the accent line drawn over it. The zero rule is solid and a touch
     stronger — it is a real floor the data stands on. */
  .grid { stroke: var(--sx-line); stroke-width: 1; stroke-dasharray: 3 4; }
  .grid.zero { stroke: var(--sx-edge); stroke-dasharray: none; }

  .tk {
    font-family: var(--sx-font-mono);
    font-size: var(--sx-t-2xs);
    fill: var(--sx-ink-3);
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sx-s-2) var(--sx-s-4);
  }
  .key {
    display: inline-flex;
    align-items: center;
    gap: var(--sx-s-2);
    font-size: var(--sx-t-2xs);
    color: var(--sx-ink-2);
    min-width: 0;
  }
  .key svg { flex: none; }

  /* No data is not a flat line at zero — it is no line. A dotted rule holds the
     space so the card does not jump when the readings arrive, and it cannot be
     read as «the series sat at zero», which a solid baseline would be. Same
     device as Sparkline. */
  .flat {
    align-self: center;
    width: 100%;
    border-top: 2px dotted var(--sx-edge);
  }

  .bone {
    align-self: stretch;
    width: 100%;
    border-radius: var(--sx-r-1);
    background: linear-gradient(90deg, var(--sx-sunk), var(--sx-edge), var(--sx-sunk));
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

  .say {
    margin: 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--sx-s-2);
    font-size: var(--sx-t-2xs);
    line-height: 1.45;
    color: var(--sx-ink-3);
    max-width: 46ch;
  }
  .bad { color: var(--sx-critical); align-items: flex-start; }
  .bad .mk { margin-top: .28em; }
  .mk { flex: none; width: 9px; height: 9px; }
</style>
