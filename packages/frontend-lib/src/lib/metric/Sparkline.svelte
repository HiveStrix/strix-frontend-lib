<script>
  // THE SHAPE OF A SERIES, AT THE SIZE OF A WORD.
  //
  // A sparkline answers one question — «¿venía subiendo?» — and refuses every
  // other one. No axes, no grid, no tooltip, no zero line: it is a piece of
  // typography that happens to be drawn, and it lives beside the figure it
  // explains, never on its own.
  //
  //   <Sparkline label="Costo mensual" unit="₡" values={[380, 412, 405, 468, 502, 540]} />
  //   <Sparkline label="Horas por semana" unit="h"
  //              values={[38, 41, 39, 44]} projected={[46, 48]}
  //              caption="12 semanas" />
  //
  // NO AREA FILL, ON PURPOSE. A filled sparkline reads as «this much of that»,
  // which is only true when the baseline is zero — and a sparkline's baseline is
  // the series' own minimum, because six values between 380 and 540 flattened
  // against zero say nothing at all. The line carries the shape; the fill would
  // carry a magnitude the drawing does not have.
  //
  // THE PROJECTION IS DRAWN AS A PROMISE, NOT A READING. Observed values are a
  // solid line in ink. Anything in `projected` continues from the last real
  // point in a dashed, lighter stroke and the caption says «estimado» — the same
  // two marks Stat puts under a projected figure. A projection that wore the
  // same line as a measurement is the one failure this family cannot afford.
  //
  // WHEN NOT TO USE IT: when the reader has to get a value off it. A sparkline
  // has no axis, so «¿cuánto en marzo?» is unanswerable by design — that is a
  // chart with ticks, and it belongs on its own screen. Also never for a series
  // with holes in it: this draws a dense series, so a missing month would
  // silently close the gap and change the slope. Drop the sparkline and show
  // the table.
  import { fmtNum, numOf } from './format.js';

  /** What the series is. Required — it is the only accessible name available. */
  export let label = '';
  /** Observed values, oldest → newest. Dense: no nulls in the middle. */
  export let values = [];
  /** Values that continue the series but were not measured. Drawn dashed. */
  export let projected = [];
  /** '₡', 'h', 'km' — read out in the accessible description, not drawn. */
  export let unit = '';
  /** sm | md | lg */
  export let size = 'md';
  /** «12 semanas», «del 1.º de enero». Printed under the trace. */
  export let caption = '';
  /** positive | attention | critical | info | none. Only with a word beside it. */
  export let tone = 'none';
  /** The dot on the newest measurement — where «hoy» is on the line. */
  export let showLast = true;
  /** The record has not arrived yet. */
  export let loading = false;
  /** What went wrong AND how to recover. */
  export let error = '';
  /** The sentence that replaces the trace when there is nothing to draw. */
  export let empty = 'Sin datos todavía';
  /** Decimals for the accessible read-out. */
  export let decimals = undefined;

  // Geometry, in SVG user units. These mirror `--sx-s-6 / -8 / -10`; the token
  // cannot be read from script, and a viewBox needs a number, so the scale is
  // restated here rather than invented.
  const HEIGHT = { sm: 24, md: 32, lg: 40 };
  // Room for the endpoint dot and half a stroke, so nothing is clipped.
  const PAD = 4;

  let w = 0;

  $: h = HEIGHT[size] ?? HEIGHT.md;
  $: obs = (values ?? []).map(numOf).filter((v) => v !== null);
  $: proj = (projected ?? []).map(numOf).filter((v) => v !== null);
  $: all = [...obs, ...proj];
  $: nothing = all.length === 0;

  // `$:` and not `const`: these close over `decimals`, and a legacy reactive
  // statement only tracks the names written inside it — a plain helper would be
  // invisible to every statement that calls it.
  $: show = (v) => fmtNum(v, decimals);

  // One derivation for the whole drawing: two scales, two paths and the point
  // where «hoy» sits. Recomputed when the box or the series changes and never
  // otherwise.
  $: geo = (() => {
    if (!w || nothing) return null;
    const iw = Math.max(1, w - PAD * 2);
    const ih = Math.max(1, h - PAD * 2);
    let lo = Math.min(...all);
    let hi = Math.max(...all);
    // A flat series is a real answer — «no se movió» — so it is drawn down the
    // middle rather than collapsed onto an edge.
    if (hi === lo) { hi = lo + 1; lo -= 1; }
    const n = all.length;
    const X = (i) => PAD + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
    const Y = (v) => PAD + ih - ((v - lo) / (hi - lo)) * ih;
    const at = (i) => `${X(i).toFixed(2)} ${Y(all[i]).toFixed(2)}`;

    const observed = obs.length > 1
      ? obs.map((_, i) => `${i ? 'L' : 'M'}${at(i)}`).join(' ')
      : '';
    // The projection starts ON the last measurement, so the two strokes meet
    // instead of leaving a gap where the change of register happens.
    const from = obs.length ? obs.length - 1 : 0;
    const forward = proj.length
      ? proj.map((_, k) => `${k ? 'L' : 'M'}${at(obs.length + k)}`).join(' ')
      : '';
    const projPath = !proj.length
      ? ''
      : obs.length
        ? `M${at(from)} ${forward.replace(/^M/, 'L')}`
        : forward;

    return {
      observed,
      projected: projPath,
      last: obs.length ? { x: X(obs.length - 1), y: Y(obs[obs.length - 1]) } : null,
      single: obs.length === 1
    };
  })();

  // The description a screen reader gets. Every clause is checked against what
  // is actually drawn: an aria-label that overstates the data is worse than one
  // that is missing.
  $: trend = (() => {
    if (obs.length < 2) return '';
    const a = obs[0];
    const b = obs[obs.length - 1];
    if (b > a) return 'la tendencia sube';
    if (b < a) return 'la tendencia baja';
    return 'se mantiene';
  })();

  $: described = (() => {
    const what = label || 'Serie';
    if (loading) return `${what}: cargando.`;
    if (error) return `${what}: no se pudo leer.`;
    if (nothing) return `${what}: ${empty.toLowerCase()}.`;
    const u = unit ? ` ${unit}` : '';
    const head = obs.length > 1
      ? `${what}: ${obs.length} lecturas, de ${show(obs[0])}${u} a ${show(obs[obs.length - 1])}${u}, ${trend}`
      : obs.length === 1
        ? `${what}: una sola lectura, ${show(obs[0])}${u}`
        : `${what}: sin lecturas`;
    const tail = proj.length
      ? `. Sigue una proyección estimada de ${proj.length} ${proj.length === 1 ? 'punto' : 'puntos'}, hasta ${show(proj[proj.length - 1])}${u}.`
      : '.';
    return head + tail;
  })();
</script>

<div class="spark {size}" aria-busy={loading || undefined}>
  <div class="box t-{tone}" bind:clientWidth={w}>
    {#if loading}
      <span class="bone" aria-hidden="true"></span>
    {:else if error || nothing}
      <span class="flat" aria-hidden="true"></span>
    {:else if geo}
      <svg width={w} height={h} viewBox="0 0 {w} {h}" role="img" aria-label={described}>
        {#if geo.projected}
          <!-- Dashed and lighter: a promise, drawn so it can never be mistaken
               for the solid line it continues. -->
          <path
            d={geo.projected}
            fill="none"
            stroke="var(--sx-ink-3)"
            stroke-width="1.5"
            stroke-dasharray="4 4"
            stroke-linecap="round"
          />
        {/if}
        {#if geo.observed}
          <path
            d={geo.observed}
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
        {/if}
        {#if (showLast || geo.single) && geo.last}
          <circle
            cx={geo.last.x}
            cy={geo.last.y}
            r="2.6"
            fill="var(--sx-surface)"
            stroke="currentColor"
            stroke-width="1.6"
          />
        {/if}
      </svg>
    {/if}
  </div>

  {#if error}
    <p class="say bad">
      <svg class="mk" viewBox="0 0 12 12" aria-hidden="true">
        <rect x="2" y="2" width="8" height="8" rx="1.5" fill="currentColor" />
      </svg>
      <span>{error}</span>
    </p>
  {:else if nothing && !loading}
    <p class="say">{empty}</p>
  {:else if geo?.single}
    <p class="say">Una sola lectura: la línea aparece con la segunda, y con ella la pendiente.</p>
  {:else if caption || proj.length}
    <p class="say">
      {#if caption}<span>{caption}</span>{/if}
      {#if proj.length}<i class="est">estimado desde la última lectura</i>{/if}
    </p>
  {/if}
</div>

<style>
  .spark { display: flex; flex-direction: column; gap: var(--sx-s-1); min-width: 0; }

  /* The three heights are the spacing scale, so the trace keeps the same rhythm
     as everything stacked beside it. `HEIGHT` in the script is these same three
     numbers — a viewBox needs a number and a custom property cannot supply one,
     so the scale is restated there rather than invented. */
  .box {
    position: relative;
    width: 100%;
    min-width: 0;
    color: var(--sx-ink);
    display: flex;
    align-items: center;
    height: var(--sx-s-8);
  }
  .sm .box { height: var(--sx-s-6); }
  .md .box { height: var(--sx-s-8); }
  .lg .box { height: var(--sx-s-10); }
  .box svg { display: block; width: 100%; overflow: visible; }

  .t-positive  { color: var(--sx-positive); }
  .t-attention { color: var(--sx-attention); }
  .t-critical  { color: var(--sx-critical); }
  .t-info      { color: var(--sx-info); }

  /* No data is not a flat line at zero — it is no line. A dotted rule holds the
     space so the row does not jump when the readings arrive, and it cannot be
     read as «the series did not move», which a solid rule would be. */
  .flat {
    display: block;
    width: 100%;
    border-top: 2px dotted var(--sx-edge);
  }

  .bone {
    display: block;
    width: 100%;
    height: 40%;
    border-radius: var(--sx-r-1);
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
  .est { font-style: italic; }
  .bad { color: var(--sx-critical); align-items: flex-start; }
  .bad .mk { margin-top: .28em; }
  .mk { flex: none; width: 9px; height: 9px; }
</style>
