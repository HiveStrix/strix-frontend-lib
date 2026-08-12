<script>
  // THE SIGNATURE OF THE SYSTEM.
  //
  // Not because it is pretty — because it is the one component whose shape IS
  // the system's rule:
  //
  //     a tone  +  a mark  +  a word,  and never fewer than all three.
  //
  // Colour alone is a claim only some people can read. A word alone is slow to
  // scan. The mark is what keeps two states apart in a photocopy, in sunlight,
  // and for someone who cannot separate green from amber — so it is drawn to be
  // distinguishable by SHAPE at 9px: a tick, a triangle, a square, a ring, a bar.
  //
  // Every Strix product says "vencido" this way, so a person moving between
  // maintenance, billing and inventory is not learning a new vocabulary.
  //
  //   <Pill tone="critical">Vencido</Pill>
  //   <Pill tone="attention" size="sm">en 5 d</Pill>
  //   <Pill tone="positive" pressed on:click={…}>Al día</Pill>   ← a filter
  //
  // If you find yourself passing a colour, the component is being used to
  // decorate and something else is the right component.

  /** positive | attention | critical | info | neutral */
  export let tone = 'neutral';
  /** sm | md | lg */
  export let size = 'md';
  /** Solid fill for the one pill that is the answer, not a label. Use sparingly. */
  export let solid = false;
  /** Hide the mark. Only for a pill that carries no state — a plain count. */
  export let mark = true;
  /** Present ⇒ the pill is a filter button and reports its own pressed state. */
  export let pressed = undefined;

  // Shapes, not colours: the mark inherits `currentColor` so it can never
  // disagree with the tone it sits in. They come from `marks.js`, which is the
  // one place the alphabet is written down — Alert, Toast, Confirm and
  // ReviewPanel draw the same five.
  import { markOf } from './marks.js';

  $: glyph = markOf(tone);
  $: isButton = pressed !== undefined;
</script>

{#if isButton}
  <!-- `type="button"` and not the browser's default `submit`: a pill is a
       FILTER, and a filter chip inside a <form> that submits it on press is the
       kind of bug that only shows up in the one product that wrapped its
       toolbar in a form. FilterChips used to stamp this attribute on from the
       outside with an action; the attribute belongs here. -->
  <button type="button" class="pill {tone} {size}" class:solid aria-pressed={pressed} on:click>
    {#if mark}<svg class="mk" viewBox="0 0 12 12" aria-hidden="true">{@html glyph}</svg>{/if}
    <slot />
  </button>
{:else}
  <span class="pill {tone} {size}" class:solid>
    {#if mark}<svg class="mk" viewBox="0 0 12 12" aria-hidden="true">{@html glyph}</svg>{/if}
    <slot />
  </span>
{/if}

<style>
  .pill {
    display: inline-flex;
    align-items: center;
    gap: var(--sx-s-2);
    padding: 3px var(--sx-s-3);
    border-radius: var(--sx-r-pill);
    font-size: var(--sx-t-xs);
    font-weight: var(--sx-w-semi);
    line-height: 1.35;
    white-space: nowrap;
    /* A pill usually sits beside a figure: «en 5 d», «hace 20 d». */
    font-variant-numeric: tabular-nums lining-nums slashed-zero;
    background: var(--sx-neutral-band);
    color: var(--sx-neutral);
    /* Transparent, not absent: a border only on some tones makes the pills
       different heights and a row of them stops aligning. */
    border: 1px solid transparent;
  }

  .mk { flex: none; width: 9px; height: 9px; }

  .positive  { background: var(--sx-positive-band);  color: var(--sx-positive);  border-color: var(--sx-positive-edge); }
  .attention { background: var(--sx-attention-band); color: var(--sx-attention); border-color: var(--sx-attention-edge); }
  .critical  { background: var(--sx-critical-band);  color: var(--sx-critical);  border-color: var(--sx-critical-edge); }
  .info      { background: var(--sx-info-band);      color: var(--sx-info);      border-color: var(--sx-info-edge); }
  .neutral   { background: var(--sx-neutral-band);   color: var(--sx-neutral);   border-color: var(--sx-neutral-edge); }

  .solid { background: var(--sx-accent); color: var(--sx-accent-ink); border-color: transparent; }

  .sm { padding: 1px var(--sx-s-2); font-size: var(--sx-t-2xs); gap: var(--sx-s-1); }
  .sm .mk { width: 8px; height: 8px; }
  .lg { padding: var(--sx-s-2) var(--sx-s-4); font-size: var(--sx-t-sm); }
  .lg .mk { width: 10px; height: 10px; }

  button.pill {
    cursor: pointer;
    font-family: inherit;
    transition: transform var(--sx-fast) var(--sx-ease), box-shadow var(--sx-fast) var(--sx-ease);
  }
  button.pill:hover { transform: translateY(-1px); box-shadow: var(--sx-e-1); }
  button.pill:active { transform: none; }
  /* The pressed state is drawn with an inset ring in the tone's own ink, so a
     selected filter still reads as the state it names. */
  button.pill[aria-pressed='true'] { box-shadow: 0 0 0 1.5px currentColor inset; }

  @media (pointer: coarse) {
    button.pill { min-height: var(--sx-touch); padding-inline: var(--sx-s-4); }
  }
</style>
