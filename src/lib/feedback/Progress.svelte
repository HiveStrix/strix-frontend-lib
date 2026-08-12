<script>
  // PROGRESS — a wait with a shape.
  //
  // Determinate whenever the number is knowable, and in this system it usually
  // is: eleven documents to read, four hundred rows to write, six files to
  // upload. «11 de 34» tells somebody whether to wait or go do something else,
  // which is the only decision a progress bar exists to support. A percentage
  // alone rarely does — 60 % of what?
  //
  //   <Progress label="Leyendo documentos" value={11} max={34} valueText="11 de 34" />
  //   <Progress label="Registrando" indeterminate hint="No cierres esta pestaña." />
  //   <Progress label="Espacio del plan" value={92} tone="attention" valueText="92 % usado" />
  //
  // The figure is tabular, because it changes in place and a proportional «1»
  // makes the whole line twitch on every tick.
  //
  // WHEN NOT: for a wait under a second — the bar appears and vanishes and reads
  // as a flicker. For a wait whose length is unknown AND short, the button's own
  // busy state is enough. And never two bars at once: a screen with three
  // progress bars is a screen that has not decided what it is doing.
  //
  // Indeterminate under reduced motion is handled explicitly: the global reset
  // would freeze the travelling stripe somewhere arbitrary, so instead it
  // becomes a steady half-lit track and the words carry the meaning — which is
  // the rule anyway, colour and motion never travel alone.

  /** 0…max. Null or undefined ⇒ indeterminate. */
  export let value = null;
  export let max = 100;
  /** Names the wait. Required for the accessibility tree; also drawn. */
  export let label = '';
  /** What a person reads: «11 de 34», «92 % usado». Also the aria value text. */
  export let valueText = '';
  /** A second line: what not to do while this runs, or what happens next. */
  export let hint = '';
  /**
   * none | positive | attention | critical | info — the system's one tone
   * vocabulary, the same five words Pill, Well, Alert, Stat and Bar use.
   *
   * `none` is the default and it is NOT «no colour»: it is the accent, which is
   * a slot a product binds, not a tone that claims a state. This component
   * shipped with `tone="accent"`, a sixth word that meant «the default» in
   * exactly one file — so a developer who had learned `tone` everywhere else
   * had to learn it again here. `accent` still works and means `none`.
   */
  export let tone = 'none';
  /** sm ⇒ the bar alone, for a row or a card corner. */
  export let size = 'md';
  /** Force the indeterminate shape even when a value exists (rare). */
  export let indeterminate = false;

  // Anything outside the four real tones — 'none', 'neutral', the legacy
  // 'accent', a typo — falls back to the accent fill rather than to no fill.
  const TONES = new Set(['positive', 'attention', 'critical', 'info']);
  $: t = TONES.has(tone) ? tone : 'plain';

  $: unknown = indeterminate || value === null || value === undefined;
  $: pct = unknown ? 0 : Math.max(0, Math.min(100, (Number(value) / (Number(max) || 1)) * 100));
  // A bar reading exactly 0 % looks like a bar that is broken rather than one
  // that has not started, so the fill keeps a sliver until it grows past it.
  $: shown = unknown ? 100 : Math.max(pct, pct > 0 ? 2 : 1.2);
  $: text = valueText || (unknown ? '' : `${Math.round(pct)} %`);
</script>

<div class="wrap {size}">
  {#if size !== 'sm' && (label || text)}
    <div class="head">
      {#if label}<span class="label">{label}</span>{/if}
      {#if text}<span class="value sx-num">{text}</span>{/if}
    </div>
  {/if}

  <div
    class="track"
    role="progressbar"
    aria-label={label || 'Progreso'}
    aria-valuemin="0"
    aria-valuemax={unknown ? undefined : Number(max)}
    aria-valuenow={unknown ? undefined : Number(value)}
    aria-valuetext={unknown ? undefined : text || undefined}
  >
    <span class="fill {t}" class:unknown style="width:{shown}%"></span>
  </div>

  {#if size !== 'sm' && hint}
    <p class="hint">{hint}</p>
  {/if}
</div>

<style>
  .wrap { display: flex; flex-direction: column; gap: var(--sx-s-2); min-width: 0; }

  .head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--sx-s-4);
    font-size: var(--sx-t-sm);
  }
  .label { color: var(--sx-ink); font-weight: var(--sx-w-medium); min-width: 0; }
  .value { color: var(--sx-ink-2); flex: none; font-weight: var(--sx-w-semi); }

  .track {
    position: relative;
    height: var(--sx-s-2);
    background: var(--sx-sunk);
    border-radius: var(--sx-r-pill);
    overflow: hidden;
  }
  .sm .track { height: var(--sx-s-1); }

  .fill {
    display: block;
    height: 100%;
    border-radius: var(--sx-r-pill);
    background: var(--sx-accent);
    transition: width var(--sx-slow) var(--sx-ease);
  }
  .positive  { background: var(--sx-positive); }
  .attention { background: var(--sx-attention); }
  .critical  { background: var(--sx-critical); }
  .info      { background: var(--sx-info); }

  /* Indeterminate: the fill spans the track and a lighter block travels across
     it. Travelling, not pulsing — a pulse is ambience, and this has a job. */
  .fill.unknown {
    background: var(--sx-sunk);
    background-image: linear-gradient(
      90deg,
      transparent 0%,
      var(--sx-accent) 35%,
      var(--sx-accent) 65%,
      transparent 100%
    );
    background-size: 45% 100%;
    background-repeat: no-repeat;
    transition: none;
    animation: run 1200ms var(--sx-ease) infinite;
  }
  .fill.unknown.positive  { background-image: linear-gradient(90deg, transparent, var(--sx-positive) 35%, var(--sx-positive) 65%, transparent); }
  .fill.unknown.attention { background-image: linear-gradient(90deg, transparent, var(--sx-attention) 35%, var(--sx-attention) 65%, transparent); }
  .fill.unknown.critical  { background-image: linear-gradient(90deg, transparent, var(--sx-critical) 35%, var(--sx-critical) 65%, transparent); }
  .fill.unknown.info      { background-image: linear-gradient(90deg, transparent, var(--sx-info) 35%, var(--sx-info) 65%, transparent); }

  @keyframes run {
    from { background-position: -50% 0; }
    to   { background-position: 150% 0; }
  }

  .hint { margin: 0; font-size: var(--sx-t-xs); color: var(--sx-ink-3); }

  @media (prefers-reduced-motion: reduce) {
    .fill { transition: none; }
    .fill.unknown {
      animation: none;
      background-image: none;
      background-color: var(--sx-accent);
      opacity: .45;
    }
    .fill.unknown.positive  { background-color: var(--sx-positive); }
    .fill.unknown.attention { background-color: var(--sx-attention); }
    .fill.unknown.critical  { background-color: var(--sx-critical); }
    .fill.unknown.info      { background-color: var(--sx-info); }
  }
</style>
