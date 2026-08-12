<script>
  // THE FIGURE.
  //
  // A bare number is not information. «7» becomes information only once three
  // other things sit beside it: what it counts, what it is measured in, and what
  // it is being compared against. Stat is the shape that keeps those together so
  // a screen full of numbers can be scanned instead of deciphered.
  //
  // TWO STATES ARE THE WHOLE REASON THIS IS NOT A <span>:
  //
  //   NO DATA YET IS NOT ZERO. «0 servicios» is a claim about the business;
  //   «— · sin lecturas todavía» is a claim about the record. Printing the first
  //   when the second is true is how a dashboard starts lying, so a nullish
  //   value never renders as a digit and always carries the sentence that says
  //   what would fill it.
  //
  //   AN ESTIMATE IS NOT A MEASUREMENT. A projection built on a declared duty
  //   cycle and a figure counted off invoices must not wear the same type. Every
  //   estimate in this family carries THE SAME TWO MARKS: a dashed rule under
  //   the figure — the same dash the Sparkline projects with — and the word
  //   «estimado». A shape and a word, never a colour on its own.
  //
  //   <Stat label="Cumplimiento" value={94} unit="%"
  //         delta={6} deltaUnit="pp" since="vs. semestre anterior" better="up" />
  //   <Stat label="Equipos activos" value={8} outOf={9} />
  //   <Stat label="Costo del trimestre" value="₡4 820 000" estimate
  //         note="Al ritmo de los últimos 90 días." />
  //   <Stat label="Sin cerrar" value={7} clickable
  //         actionLabel="Ver los 7 servicios sin cerrar" on:click={showOpen} />
  //
  // A DELTA NEVER GOES CRITICAL. A trend moving the wrong way is «attention» at
  // worst — a figure that has actually crossed a line is Threshold's job, and a
  // strip with three red arrows in it teaches people to stop looking. Which
  // direction is the wrong one is not knowable from here (spend rising is bad,
  // compliance rising is good), so `better` has to be declared and an undeclared
  // delta stays achromatic on purpose.
  //
  // WHEN NOT TO USE IT: for a value nobody compares — a phone number, an address,
  // a description. Those are text, and tabular figures on running prose read as
  // a stutter. And never for a state: «Vencido» is a Pill, not a Stat with one
  // word in it.
  import { fmtNum, isBlank, numOf } from './format.js';

  /** The printed word on the instrument. Always name the thing counted. */
  export let label = '';
  /** number | string. Nullish or '' ⇒ the «no data yet» state, never a zero. */
  export let value = undefined;
  /** '%', 'h', 'km', '₡'. Sits smaller beside the figure and never wraps off it. */
  export let unit = '';
  /** Money reads «₡4 820 000», so its unit goes in front. */
  export let unitBefore = false;
  /** The denominator of a ratio: `value={8} outOf={9}` ⇒ «8 de 9». */
  export let outOf = undefined;
  /** sm | md | lg */
  export let size = 'md';
  /** Change against a prior period. Sign carries direction; magnitude is printed. */
  export let delta = undefined;
  /** 'pp', '%', 'h'. A delta in percentage POINTS is not a delta in percent. */
  export let deltaUnit = '';
  /** «vs. semestre anterior». A delta without its period is unreadable — say it. */
  export let since = '';
  /** up | down | none — which direction earns a tone. Undeclared stays achromatic. */
  export let better = 'none';
  /** positive | attention | critical | info | none. Only when the LABEL names the state. */
  export let tone = 'none';
  /** This figure is a projection, not a measurement. Draws the dash and the word. */
  export let estimate = false;
  /** A quiet line under the figure: why it is an estimate, what would fill it. */
  export let note = '';
  /** The record has not arrived yet. Shows a bone, not a zero. */
  export let loading = false;
  /** What went wrong AND how to recover. Both, or it is half a message. */
  export let error = '';
  /** The sentence that replaces the figure when there is no data. Invite the action. */
  export let empty = 'Sin datos todavía';
  /** The figure IS the door: renders as a link. */
  export let href = undefined;
  /** The figure IS the door: renders as a button and forwards `click`. */
  export let clickable = false;
  /** The accessible name of that door. «7» is a terrible link name. */
  export let actionLabel = '';
  /** Pin the decimals. Left alone, a figure keeps at most one. */
  export let decimals = undefined;
  /** Fixed decimals for the delta, when it needs different precision. */
  export let deltaDecimals = undefined;

  // Shapes before colours: a triangle, an inverted triangle and a bar stay apart
  // at 9px, in a photocopy, and for someone who cannot separate green from amber.
  const ARROWS = {
    up:   '<path d="M6 1.4 11.4 10.6H.6z" fill="currentColor"/>',
    down: '<path d="M6 10.6.6 1.4h10.8z" fill="currentColor"/>',
    flat: '<rect x="1" y="5" width="10" height="2" rx="1" fill="currentColor"/>'
  };
  const SAID = { up: 'subió', down: 'bajó', flat: 'sin cambio' };

  // `$:` and not `const`: a legacy reactive statement tracks only the names
  // written inside it, so a plain helper closing over `decimals` would be
  // invisible to the statements that call it and the figure would keep the
  // precision it was first rendered with.
  $: show = (v, d) => fmtNum(v, d ?? decimals);

  $: blank = isBlank(value);
  $: hasFigure = !loading && !error && !blank;

  $: dNum = loading || error ? null : numOf(delta);
  $: dir = dNum === null ? null : dNum > 0 ? 'up' : dNum < 0 ? 'down' : 'flat';
  // The bad direction stops at «attention». See the note at the top.
  $: dTone =
    dir === null || dir === 'flat' || better === 'none'
      ? 'none'
      : (better === 'up') === (dir === 'up')
        ? 'positive'
        : 'attention';

  // A link named «7» is a link nobody can follow out of a list of links. The
  // fallback is built from what is on screen, so it is always true.
  $: aria = actionLabel || [label, show(value), unit].filter(Boolean).join(' ');
  $: interactive = !!href || clickable;
</script>

{#snippet figure()}
  <!-- The figure is a flex row, so the whitespace between these is collapsed
       away and the `gap` is the only spacing there is. -->
  {#if unitBefore && unit}<i class="unit pre">{unit}</i>{/if}
  <span class="v">{show(value)}</span>
  {#if !unitBefore && unit}<i class="unit">{unit}</i>{/if}
  {#if !isBlank(outOf)}<i class="unit">de {show(outOf)}</i>{/if}
  {#if estimate}<i class="est">estimado</i>{/if}
{/snippet}

<div class="stat {size}" class:est={estimate} aria-busy={loading || undefined}>
  {#if label}<span class="sx-cap lbl">{label}</span>{/if}

  {#if loading}
    <p class="fig bone-line" aria-hidden="true"><span class="bone"></span></p>
    <span class="sr">Cargando {label || 'la cifra'}…</span>
  {:else if !hasFigure}
    <p class="fig sx-num off">—</p>
  {:else if href}
    <a class="fig sx-num jump t-{tone}" {href} aria-label={aria}>{@render figure()}</a>
  {:else if clickable}
    <button class="fig sx-num jump t-{tone}" type="button" aria-label={aria} on:click>
      {@render figure()}
    </button>
  {:else}
    <p class="fig sx-num t-{tone}">{@render figure()}</p>
  {/if}

  {#if error}
    <p class="line bad">
      <svg class="mk" viewBox="0 0 12 12" aria-hidden="true">
        <rect x="2" y="2" width="8" height="8" rx="1.5" fill="currentColor" />
      </svg>
      <span>{error}</span>
    </p>
  {:else if blank && !loading}
    <p class="line off">{empty}</p>
  {:else if dir}
    <p class="line delta d-{dTone}">
      <svg class="mk" viewBox="0 0 12 12" aria-hidden="true">{@html ARROWS[dir]}</svg>
      <span class="sr">{SAID[dir]}</span>
      <b class="sx-num">{show(Math.abs(dNum), deltaDecimals)}{#if deltaUnit}&nbsp;{deltaUnit}{/if}</b>
      {#if since}<span class="since">{since}</span>{/if}
    </p>
  {/if}

  {#if note && !error}<p class="line off note">{note}</p>{/if}
</div>

<style>
  /* The screen-reader-only rule is re-declared here rather than borrowed from
     base.css: a Core module in a shadow root re-declares the three type
     registers and nothing else, so a component that needs `.sx-sr` and does not
     carry it would go silent in exactly the surfaces this library exists for. */
  .sr {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  .stat { display: flex; flex-direction: column; gap: var(--sx-s-1); min-width: 0; }
  .lbl { line-height: 1.4; }

  .fig {
    margin: 0;
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: var(--sx-s-2);
    font-size: var(--sx-t-xl);
    font-weight: var(--sx-w-semi);
    /* Large figures need the tracking pulled in or they read as spaced-out
       digits rather than one quantity. */
    letter-spacing: -.03em;
    line-height: 1.1;
    color: var(--sx-ink);
  }
  .sm .fig { font-size: var(--sx-t-lg); }
  .lg .fig { font-size: var(--sx-t-2xl); }

  .v { min-width: 0; }

  /* The unit is read once and then ignored; the figure is read every time. */
  .unit {
    font-style: normal;
    font-size: var(--sx-t-xs);
    font-weight: var(--sx-w-medium);
    letter-spacing: 0;
    color: var(--sx-ink-3);
    white-space: nowrap;
  }
  .unit.pre { margin-right: calc(var(--sx-s-2) * -1 + var(--sx-s-1)); }

  /* ── The estimate mark ──────────────────────────────────────────────────
     One dash and one word, identical across the whole family. The rule is the
     same broken line the Sparkline projects with, so «this was not measured»
     looks the same whether it is a number or a trace. */
  .est .fig {
    align-self: flex-start;
    padding-bottom: var(--sx-s-1);
    border-bottom: 2px dashed var(--sx-edge);
  }
  i.est {
    font-style: italic;
    font-size: var(--sx-t-2xs);
    font-weight: var(--sx-w-medium);
    letter-spacing: 0;
    color: var(--sx-ink-3);
    white-space: nowrap;
  }

  .off { color: var(--sx-ink-3); }

  .t-positive  { color: var(--sx-positive); }
  .t-attention { color: var(--sx-attention); }
  .t-critical  { color: var(--sx-critical); }
  .t-info      { color: var(--sx-info); }

  /* ── The figure as a control ────────────────────────────────────────────
     It looks exactly like the figures beside it until it is hovered, because a
     number somebody can walk into should not shout about it — and because a
     strip where one cell is styled as a button stops reading as one instrument. */
  .jump {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    font-weight: inherit;
    letter-spacing: inherit;
    color: inherit;
    font-variant-numeric: inherit;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
  }
  .jump:hover .v { text-decoration: underline; text-underline-offset: 4px; }
  /* Carried rather than inherited from base.css, for the shadow-root reason
     above. `--sx-ink` flips with the theme, so one rule serves both. */
  .jump:focus-visible {
    outline: 2px solid var(--sx-ink);
    outline-offset: 2px;
    border-radius: var(--sx-r-1);
  }

  .line {
    margin: 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--sx-s-2);
    font-size: var(--sx-t-xs);
    line-height: 1.45;
    color: var(--sx-ink-3);
  }
  .line b { font-weight: var(--sx-w-semi); }
  .mk { flex: none; width: 9px; height: 9px; }
  .since { color: var(--sx-ink-3); font-weight: var(--sx-w-normal); }
  .note { max-width: 46ch; }

  .delta { color: var(--sx-ink-2); }
  .d-positive  { color: var(--sx-positive); }
  .d-positive .since { color: var(--sx-ink-3); }
  .d-attention { color: var(--sx-attention); }
  .d-attention .since { color: var(--sx-ink-3); }

  .bad { color: var(--sx-critical); align-items: flex-start; }
  .bad .mk { margin-top: .3em; }
  .bad span { max-width: 46ch; }

  /* ── Loading ────────────────────────────────────────────────────────────
     A bone the size of the figure it replaces, so the strip does not jump when
     the data lands. The sweep says «still coming» and nothing else; under
     reduced motion it simply stops and the bone stays. */
  .bone-line { min-height: 1.1em; }
  .bone {
    display: block;
    width: 3.5ch;
    height: .8em;
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

  /* A figure poked with a thumb needs a thumb-sized door. The target grows
     around the number instead of growing the number, so the cell keeps its
     baseline with the ones beside it. */
  @media (pointer: coarse) {
    .jump { position: relative; }
    .jump::after { content: ''; position: absolute; inset: -12px -10px; min-height: var(--sx-touch); }
  }
</style>
