<script>
  // THE RECESSED BAND. The opposite move to Card.
  //
  // A Card comes towards you. A Well goes away: it is the part of a surface that
  // is BELOW the surface — the summary strip under a form, the note the system
  // is making about what you just did, the totals under a table, the empty state
  // inside a panel. Because it is a fill and not an outline, it survives the
  // dark theme and it survives being printed, and because it recedes, it does
  // not compete with the Card it lives in for the same object's attention.
  //
  //   <Well>…</Well>
  //   <Well tone="attention"><Glyph name="alert" />Falta la lectura de julio.</Well>
  //   <Well pad={6} radius={3}>…</Well>
  //
  // ── THE ONE RULE THAT MATTERS HERE ───────────────────────────────────────
  // A toned Well is a colour, and colour never travels alone. The tone is the
  // CONTAINER, so the word has to be inside it: someone who cannot separate the
  // amber band from the green one must lose nothing at all. That means the
  // content of a toned Well always names its own state — «Vencido», «Falta»,
  // «Listo» — and usually carries a Glyph too. A band that says only
  // «₡1.240.000» in amber says nothing to a third of the people reading it, and
  // nothing at all in a photocopy.
  //
  // If what you have is a state on a ROW rather than a band around a paragraph,
  // that is Pill, not Well.

  /** A step on the spacing scale. */
  export let pad = 4;
  /** 1 | 2 | 3 — the radius scale. A well inside a card usually wants r-2. */
  export let radius = 2;
  /** '' | positive | attention | critical | info | neutral — and see the rule above. */
  export let tone = '';
  /** A TAG NAME, not a component: 'div', 'aside', 'li', 'footer'… */
  export let as = 'div';

  const STEPS = new Set([1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20]);
  const step = (n) => (STEPS.has(Number(n)) ? `var(--sx-s-${n})` : '0px');
  const TONES = new Set(['positive', 'attention', 'critical', 'info', 'neutral']);

  $: t = TONES.has(tone) ? tone : 'plain';
  $: css = `--well-pad:${step(pad)}`;
</script>

<svelte:element this={as} {...$$restProps} class="well {t} r{radius}" style={css}>
  <slot />
</svelte:element>

<style>
  .well {
    display: block;
    padding: var(--well-pad);
    min-width: 0;
    background: var(--sx-sunk);
    color: var(--sx-ink-2);
    font-size: var(--sx-t-sm);
    line-height: 1.5;
    /* Transparent rather than absent, exactly as in Pill: without it a toned
       well and a plain one are one pixel different in height and a column of
       them stops aligning. */
    border: 1px solid transparent;
  }

  .r1 { border-radius: var(--sx-r-1); }
  .r2 { border-radius: var(--sx-r-2); }
  .r3 { border-radius: var(--sx-r-3); }

  /* The band, its edge and its ink move together, and all three re-bind on the
     dark theme — a pale band with dark text does not survive a dark ground. */
  .positive  { background: var(--sx-positive-band);  border-color: var(--sx-positive-edge);  color: var(--sx-positive); }
  .attention { background: var(--sx-attention-band); border-color: var(--sx-attention-edge); color: var(--sx-attention); }
  .critical  { background: var(--sx-critical-band);  border-color: var(--sx-critical-edge);  color: var(--sx-critical); }
  .info      { background: var(--sx-info-band);      border-color: var(--sx-info-edge);      color: var(--sx-info); }
  .neutral   { background: var(--sx-neutral-band);   border-color: var(--sx-neutral-edge);   color: var(--sx-neutral); }
</style>
