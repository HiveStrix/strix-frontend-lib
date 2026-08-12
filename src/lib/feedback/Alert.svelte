<script context="module">
  // THE TONE MARKS. They used to be declared here a second time, character for
  // character, with a comment in each copy admitting the other one existed.
  // They now live in `src/lib/marks.js` beside Pill's, which is the whole point:
  // somebody who learned that the triangle means «revisar» on a 20px pill must
  // not be taught a second alphabet when the same state is said at banner size.
  //
  // Imported and then re-exported (rather than `export … from`) because the
  // instance script below has to be able to READ them: a bare re-export creates
  // no local binding.
  import { MARKS, markOf } from '../marks.js';
  export { MARKS, markOf };
</script>

<script>
  // ALERT — a condition the surface itself has to state, in place.
  //
  // The band sits IN the flow, above the thing it is about, and it stays there
  // as long as the condition does. That is the difference from a Toast: a toast
  // reports something that already finished and then leaves; an alert reports
  // something that is still true and cannot leave until it stops being true.
  //
  //   <Alert tone="attention" title="Este equipo no registra lecturas">
  //     Sin lecturas la proyección es adivinanza: BAT001 lleva 47 días sin una.
  //     <button slot="actions" …>Registrar lectura</button>
  //   </Alert>
  //
  // WHEN NOT: for the result of a button somebody just pressed — that is a
  // Toast. For a whole surface that has nothing in it — EmptyState. For a whole
  // surface that failed to load — ErrorState. An alert that explains the empty
  // list instead of the list explaining itself is a band nobody reads.
  //
  // Colour never travels alone: the tone always arrives with a mark AND a word.
  // Remove the mark only for a tone="neutral" note, which is not a claim about
  // state at all.
  import { createEventDispatcher } from 'svelte';

  /** positive | attention | critical | info | neutral */
  export let tone = 'info';
  /** The condition, as a sentence fragment. The slot carries the detail. */
  export let title = '';
  /** Show the ✕. Only for an alert a person is allowed to stop seeing. */
  export let dismissible = false;
  export let mark = true;
  /**
   * Announce this alert when it appears. Off for a static note that was already
   * on the page at load, and for a gallery of alerts — five banners rendered at
   * once are documentation, not five interruptions.
   */
  export let live = true;

  const dispatch = createEventDispatcher();

  $: glyph = markOf(tone);
  // Only «critical» interrupts. An amber band that barges into whatever is
  // being read teaches people to turn the screen reader off.
  $: role = !live ? undefined : tone === 'critical' ? 'alert' : 'status';
</script>

<div class="alert {tone}" {role}>
  {#if mark}
    <svg class="mk" viewBox="0 0 12 12" aria-hidden="true">{@html glyph}</svg>
  {/if}

  <div class="body">
    {#if title}<p class="title">{title}</p>{/if}
    <div class="text"><slot /></div>
    {#if $$slots.actions}
      <div class="acts"><slot name="actions" /></div>
    {/if}
  </div>

  {#if dismissible}
    <button
      type="button"
      class="x"
      on:click={() => dispatch('dismiss')}
      aria-label={title ? `Descartar: ${title}` : 'Descartar el aviso'}
    >
      <svg viewBox="0 0 12 12" aria-hidden="true">
        <path d="M3 3l6 6M9 3l-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    </button>
  {/if}
</div>

<style>
  .alert {
    display: flex;
    align-items: flex-start;
    gap: var(--sx-s-3);
    padding: var(--sx-s-3) var(--sx-s-4);
    border-radius: var(--sx-r-2);
    /* Band + tone edge is the Pill's own construction, not a hairline surface:
       the fill is what carries the tone and the edge only keeps it from
       dissolving into a light ground. */
    border: 1px solid transparent;
    font-size: var(--sx-t-sm);
    line-height: 1.5;
    color: var(--sx-ink);
  }

  .mk { flex: none; width: 1.05em; height: 1.05em; margin-top: .28em; }

  .body { flex: 1; min-width: 0; }
  .title {
    margin: 0;
    font-weight: var(--sx-w-semi);
    letter-spacing: -.005em;
  }
  /* The text is prose, so it gets no tabular figures — that treatment is for
     numbers being compared, and on a sentence it reads as a stutter. */
  .text { color: var(--sx-ink-2); }
  .text:not(:first-child) { margin-top: var(--sx-s-1); }
  /* The slot's content belongs to the consumer, so the only thing this file
     says about it is that stacked paragraphs breathe. */
  .text :global(p) { margin: var(--sx-s-2) 0 0; }
  .text :global(p:first-child) { margin-top: 0; }

  .acts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sx-s-2);
    margin-top: var(--sx-s-3);
  }

  .x {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.7em;
    height: 1.7em;
    padding: 0;
    background: none;
    border: none;
    border-radius: var(--sx-r-1);
    color: var(--sx-ink-3);
    cursor: pointer;
    transition: background var(--sx-fast) var(--sx-ease), color var(--sx-fast) var(--sx-ease);
  }
  .x svg { width: .85em; height: .85em; }
  .x:hover { color: var(--sx-ink); background: color-mix(in srgb, currentColor 12%, transparent); }

  .positive  { background: var(--sx-positive-band);  border-color: var(--sx-positive-edge); }
  .attention { background: var(--sx-attention-band); border-color: var(--sx-attention-edge); }
  .critical  { background: var(--sx-critical-band);  border-color: var(--sx-critical-edge); }
  .info      { background: var(--sx-info-band);      border-color: var(--sx-info-edge); }
  .neutral   { background: var(--sx-neutral-band);   border-color: var(--sx-neutral-edge); }

  .positive .mk  { color: var(--sx-positive); }
  .attention .mk { color: var(--sx-attention); }
  .critical .mk  { color: var(--sx-critical); }
  .info .mk      { color: var(--sx-info); }
  .neutral .mk   { color: var(--sx-neutral); }

  @media (pointer: coarse) {
    .alert { padding: var(--sx-s-4); }
    /* The ✕ is the smallest thing on the band and the one most often pressed
       with a thumb, so it is the one that has to grow. */
    .x { width: var(--sx-touch); height: var(--sx-touch); margin: calc(var(--sx-s-2) * -1); }
    .x svg { width: 1em; height: 1em; }
  }
</style>
