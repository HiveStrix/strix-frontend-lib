<script>
  // THE ONE LINE THE SYSTEM ALLOWS.
  //
  // Strix draws surfaces with light, not outlines: a box gets a fill and an
  // elevation, never a hairline border, because a screen full of 1px rectangles
  // is a spreadsheet pretending to be an application. A rule is the exception,
  // and it earns the exception by being about SEQUENCE rather than about
  // containment — "this group ended, another begins" inside one surface. If you
  // want a border around something, you want a Card or a Well, not a Divider.
  //
  //   <Divider />
  //   <Divider label="Repuestos" />       ← a break that names what comes next
  //   <Divider vertical />                ← between two controls in a Row
  //   <Divider strong />                  ← the one break in a long panel
  //
  // It carries NO margin. Spacing between things is Stack's and Row's job, and a
  // component with an opinion about its own margin is the beginning of the
  // fourteen-pixel problem those two exist to end.
  //
  // A11Y: an unlabelled rule is a real <hr>, which is announced as a separator
  // and needs no help. A labelled one keeps role="separator" and takes its name
  // from `label`; the visible word is hidden from assistive tech so the break is
  // announced once rather than twice.

  /** A word that names the group starting below. Empty ⇒ a plain rule. */
  export let label = '';
  /** Vertical, for use inside a Row. Takes the height of the row. */
  export let vertical = false;
  /** --sx-edge instead of --sx-line: the one break that has to be seen from across the panel. */
  export let strong = false;
</script>

{#if label && !vertical}
  <div class="lab" role="separator" aria-label={label} class:strong>
    <span class="rule" aria-hidden="true"></span>
    <span class="word" aria-hidden="true">{label}</span>
    <span class="rule" aria-hidden="true"></span>
  </div>
{:else if vertical}
  <hr class="v" class:strong aria-orientation="vertical" />
{:else}
  <hr class="h" class:strong />
{/if}

<style>
  hr {
    border: 0;
    margin: 0;
    flex: none;
    background: var(--sx-line);
  }
  .h { height: 1px; width: 100%; }
  /* Stretches to the row's height, with a floor so it still exists between two
     short controls. `align-self` rather than `height: 100%` because a flex row's
     children have no percentage height to resolve against. */
  .v { width: 1px; align-self: stretch; min-height: var(--sx-s-4); }
  .strong { background: var(--sx-edge); }

  .lab {
    display: flex;
    align-items: center;
    gap: var(--sx-s-3);
    width: 100%;
  }
  .lab .rule {
    height: 1px;
    background: var(--sx-line);
    flex: 1 1 0;
    min-width: var(--sx-s-4);
  }
  .lab.strong .rule { background: var(--sx-edge); }
  /* The label register, declared here rather than borrowed from base.css: a Core
     renders in a shadow root and a global class does not cross that boundary. */
  .lab .word {
    flex: none;
    font-size: var(--sx-t-2xs);
    font-weight: var(--sx-w-semi);
    letter-spacing: .07em;
    text-transform: uppercase;
    color: var(--sx-ink-3);
    white-space: nowrap;
  }
</style>
