<script>
  // THE SURFACE. One object, lifted off the ground.
  //
  // Everything a Strix screen shows sits on something, and this is the something:
  // a fill, a radius, and an elevation. No border. The system's second rule is
  // that depth comes from light — `--sx-e-1/2/3` have a real offset and a soft
  // blur because that is what a lifted thing does to light, whereas a 1px
  // rectangle is a drawing of a box rather than a box. The practical payoff is
  // that a screen with thirty cards still reads as thirty objects instead of as
  // a wireframe, and that the same component works on the dark theme without a
  // second stylesheet: the shadows re-bind, the outlines would not have.
  //
  //   <Card>…</Card>
  //   <Card pad={6} elevation={2}>…</Card>
  //   <Card interactive selected on:click={…}>…</Card>   ← a real <button>
  //   <Card href="/m/maintenance/BAT001">…</Card>        ← a real <a>
  //   <Card tone="critical"><Pill tone="critical">Vencido</Pill>…</Card>
  //
  // `tone` IS A RIM, NOT A FILL. Nine components already accept `tone`; Card and
  // Panel did not, which was an asymmetry, not a decision — you could say "this
  // well is critical" and not "this card is critical". But a Card is a big
  // surface, and tinting the whole thing turns the tone into background
  // decoration that competes with whatever is written on top of it (that is
  // exactly what Well does instead, at band size, where the fill IS the point).
  // So here the tone is said with a THIN CAP along the top edge — three pixels
  // of the tone's own ink colour, not its band, because a rim this narrow needs
  // the strong version to still read at 3:1 against the surface (measured,
  // `pnpm contrast`: 5.8:1 to 8.1:1 across every tone, both themes).
  //
  // AND COLOUR NEVER TRAVELS ALONE — that rule does not stop at Pill. A card
  // with a coloured cap and nothing inside it that names the state is a colour
  // loose in the room: put a `Pill` or a sentence with the word in it inside the
  // card. `tone` decorates a claim the content already makes; it does not make
  // the claim by itself.
  //
  // ELEVATION IS ALTITUDE, NOT IMPORTANCE. e-1 is the page's own furniture —
  // rows, tiles, panels. e-2 is something that came forward: a menu, a hover, a
  // card being dragged. e-3 is something that took the screen: a dialog, a
  // Sheet. A tile at e-3 does not read as important, it reads as broken, because
  // the eye reads it as floating a centimetre above the monitor.
  //
  // IT IS A FLEX COLUMN, deliberately. Its children stack, a Stack inside it
  // fills it, and — the reason it matters — a Card whose parent gives it a
  // height can hand that height to a child that scrolls. That is what Panel's
  // `scroll` is built on.
  //
  // `class` is not part of the API. A scoped class from the calling component
  // would not reach in here anyway (different scope, and in a Core a different
  // shadow root), so compose with props and slots instead of reaching in.

  /** A step on the spacing scale for the inner padding. 0 ⇒ flush. */
  export let pad = 5;
  /** 1 | 2 | 3 — altitude, per the note above. 0 ⇒ flat, for a card inside a card. */
  export let elevation = 1;
  /** 1 | 2 | 3 — the radius scale. Nothing below r-1; nothing is square. */
  export let radius = 3;
  /** A destination ⇒ the whole card is a link. */
  export let href = '';
  /** No destination but something happens ⇒ the whole card is a button. */
  export let interactive = false;
  /** Only meaningful on an interactive card. */
  export let disabled = false;
  /** Drawn as an accent ring, and said out loud with aria-pressed / aria-current. */
  export let selected = false;
  /**
   * '' | positive | attention | critical | info | neutral. A rim along the top
   * edge, in the tone's own ink — never a fill. See the note above: it has to
   * ride alongside a Pill or a sentence that names the state, never alone.
   */
  export let tone = '';

  const STEPS = new Set([1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20]);
  const step = (n) => (STEPS.has(Number(n)) ? `var(--sx-s-${n})` : '0px');
  const TONES = new Set(['positive', 'attention', 'critical', 'info', 'neutral']);

  // A disabled link is not a thing: an <a> with no href is not focusable and an
  // <a> with one still navigates. So a card that is both a destination and
  // unavailable becomes a disabled button — inert, focusable-by-nothing, honest.
  $: kind = href && !disabled ? 'a' : interactive || href ? 'button' : 'div';
  $: live = kind !== 'div' && !disabled;
  $: t = TONES.has(tone) ? tone : '';
  // `--card-tone` carries the rim colour as a variable rather than a class per
  // tone, because the rim is drawn on a `::before` overlay (see below) and one
  // rule has to serve all five tones plus "none". Undefined resolves through
  // the `transparent` fallback in the rule itself, so an untoned card pays for
  // nothing.
  $: css = `--card-pad:${step(pad)}` + (t ? `;--card-tone:var(--sx-${t})` : '');
</script>

<svelte:element
  this={kind}
  {...$$restProps}
  class="card e{elevation} r{radius}"
  class:live
  class:selected
  class:off={disabled}
  style={css}
  href={kind === 'a' ? href : undefined}
  type={kind === 'button' ? 'button' : undefined}
  disabled={kind === 'button' && disabled ? true : undefined}
  aria-pressed={kind === 'button' && !disabled && selected ? 'true' : undefined}
  aria-current={kind === 'a' && selected ? 'true' : undefined}
  on:click
  on:keydown
>
  <slot />
</svelte:element>

<style>
  .card {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    padding: var(--card-pad);
    background: var(--sx-surface);
    color: var(--sx-ink);
    text-align: left;
    /* The <a> and <button> forms have to arrive at the same place as the <div>:
       no underline, no user-agent border, the family and size inherited. */
    font: inherit;
    text-decoration: none;
    border: 0;
    position: relative;
  }

  /* THE RIM. A full-size overlay, not a sliver: a 3px sliver would need its own
     border-radius, and a radius that big clamps to half its own 3px height —
     1.5px — while the card's real corner (up to r-3, 22px) curves in far more
     than that near the top, so the sliver's square corners would poke out past
     the card's own rounded silhouette. Sizing the overlay to the FULL card and
     drawing the rim as an INSET shadow inside it sidesteps that: box-shadow
     clips to the element's own border-radius, and `inherit` copies the card's
     real radius onto an element the same size as the card, so the clip is
     exact. `position: absolute` puts it in the "positioned, z-index:auto"
     paint layer, which paints AFTER normal in-flow children — the one property
     that makes this survive Panel's own opaque header sitting on top of it.
     Transparent when no tone is set, so an untoned card pays nothing. */
  .card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: inset 0 3px 0 0 var(--card-tone, transparent);
    pointer-events: none;
  }

  .e0 { box-shadow: none; }
  .e1 { box-shadow: var(--sx-e-1); }
  .e2 { box-shadow: var(--sx-e-2); }
  .e3 { box-shadow: var(--sx-e-3); }

  .r1 { border-radius: var(--sx-r-1); }
  .r2 { border-radius: var(--sx-r-2); }
  .r3 { border-radius: var(--sx-r-3); }

  /* Selection is an accent ring drawn INSIDE the box, so a selected card keeps
     the exact footprint of an unselected one and a grid of them does not shift
     by two pixels when you pick one. `inset` also means it survives on top of a
     dark surface, where an outer ring would be lost in the shadow. */
  .selected { box-shadow: 0 0 0 2px var(--sx-accent) inset, var(--sx-e-1); }
  .selected.e2 { box-shadow: 0 0 0 2px var(--sx-accent) inset, var(--sx-e-2); }
  .selected.e3 { box-shadow: 0 0 0 2px var(--sx-accent) inset, var(--sx-e-3); }

  .live {
    cursor: pointer;
    transition:
      transform var(--sx-fast) var(--sx-ease),
      box-shadow var(--sx-fast) var(--sx-ease);
  }
  /* One step of altitude on hover and a single pixel of lift: enough to say
     "this responds", not enough to move the row under the reader's eye. */
  .live:hover { transform: translateY(-1px); box-shadow: var(--sx-e-2); }
  .live.selected:hover { box-shadow: 0 0 0 2px var(--sx-accent) inset, var(--sx-e-2); }
  .live:active { transform: none; box-shadow: var(--sx-e-1); }

  .off { opacity: .5; cursor: not-allowed; }

  /* base.css owns the focus ring for a document; a Core has no base.css, so the
     component states it again. Offset outward so the ring never sits on top of
     the content, and the radius follows the card's own. */
  .card:focus-visible {
    outline: 2px solid var(--sx-ink);
    outline-offset: 2px;
  }

  /* Motion does a job or it does not exist. */
  @media (prefers-reduced-motion: reduce) {
    .live { transition: none; }
    .live:hover { transform: none; }
  }
</style>
