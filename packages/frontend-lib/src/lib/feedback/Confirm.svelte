<script>
  // CONFIRM — the destructive question, asked the only way it is worth asking.
  //
  // «¿Estás seguro?» is not a question. It asks somebody who already decided to
  // decide again, with no new information, so the honest answer is always yes
  // and the dialog becomes a key you press twice. Then one day it guards
  // something that mattered and it is pressed twice anyway.
  //
  // So this component cannot render that sentence. Its API is:
  //
  //   THE ACTION, named as a verb phrase   → the title AND the button, same words
  //   WHAT IS LOST, listed and counted     → before the question, never after
  //   WHAT SURVIVES, when something does   → the reassurance is half the answer
  //   WHETHER IT COMES BACK                → the last line before the button
  //
  //   <Confirm
  //     action="Eliminar el plan"
  //     subject="Cambio de aceite 250 h · BAT001"
  //     loses={[{ n: 3, text: 'servicios ya registrados quedan sin plan' },
  //             { n: 1, text: 'proyección de vencimiento deja de calcularse' }]}
  //     keeps={['El historial de servicios de BAT001 no se toca']}
  //     on:confirm={remove} on:cancel={() => (asking = null)} />
  //
  // Notice there is no «escribí el código para confirmar». That pattern buys
  // its safety from a technician with wet gloves standing next to a running
  // mixer, and this system does not sell him that. Naming the loss is the
  // safety; typing is a toll.
  //
  // WHEN NOT: for anything reversible. If the action can be undone, do it
  // immediately and put «Deshacer» in a Toast — that is faster for the ninety
  // per cent who meant it and just as safe for the ten who did not. A Confirm
  // in front of an undoable action is a tax on the people who were right.
  //
  // The destructive button is never focused on open: focus lands on the panel so
  // the loss is read first, and the first tab stop is Cancelar.
  import { createEventDispatcher } from 'svelte';
  import Dialog from './Dialog.svelte';
  import Button from '../action/Button.svelte';
  import { markOf } from '../marks.js';

  /** The verb phrase. Titles the dialog and labels the button — same words. */
  export let action;
  /** What it acts on: a code, a name, a date range. Shown as the subject line. */
  export let subject = '';
  /** What disappears. `'texto'` or `{ n: 3, text: 'servicios quedan sin plan' }`. */
  export let loses = [];
  /** What does not. Say it when it is true; silence reads as «everything goes». */
  export let keeps = [];
  /** critical (destroys) | attention (disrupts, e.g. cancels an open order) */
  export let tone = 'critical';
  /** True only if the action really can be undone from the interface. */
  export let reversible = false;
  export let cancelLabel = 'Cancelar';
  /** The write is in flight: both buttons freeze, Escape and the scrim stop. */
  export let busy = false;
  /** Announced while busy. «Eliminando el plan…» — the same verb, in progress. */
  export let busyNote = '';

  const dispatch = createEventDispatcher();

  $: rows = (loses ?? []).map((l) => (typeof l === 'string' ? { text: l } : l));
  // The figures only line up as a column when there are figures to line up.
  $: counted = rows.some((r) => r.n !== undefined && r.n !== null);
  $: glyph = markOf(tone);

  // `danger` is Button's own word for the moment of irreversibility, and this
  // dialog IS that moment. An `attention` Confirm disrupts rather than destroys
  // — an open order being cancelled — so it takes the plain primary and lets the
  // losses list carry the tone, which is where the amber already is.
  $: commitVariant = tone === 'critical' ? 'danger' : 'solid';
</script>

<Dialog
  title={action}
  note={subject}
  size="sm"
  dismissible={!busy}
  on:close={() => dispatch('cancel')}
>
  <div class="say">
    <slot />

    {#if rows.length}
      <p class="lede">{reversible ? 'Esto cambia:' : 'Esto se pierde:'}</p>
      <ul class="loses {tone}" class:counted>
        {#each rows as r, i (i)}
          <li>
            <svg class="mk" viewBox="0 0 12 12" aria-hidden="true">{@html glyph}</svg>
            {#if counted}<b class="n sx-num">{r.n ?? ''}</b>{/if}
            <span>{r.text}</span>
          </li>
        {/each}
      </ul>
    {/if}

    {#if keeps.length}
      <ul class="keeps">
        {#each keeps as k, i (i)}
          <li>
            <svg class="mk" viewBox="0 0 12 12" aria-hidden="true">{@html markOf('positive')}</svg>
            <span>{k}</span>
          </li>
        {/each}
      </ul>
    {/if}

    <p class="back" class:final={!reversible}>
      {reversible ? 'Esto se puede revertir después.' : 'Esto no se puede deshacer.'}
    </p>
  </div>

  <svelte:fragment slot="foot">
    {#if busy && busyNote}
      <p class="busy-note" role="status">{busyNote}</p>
    {/if}
    <!-- The way OUT is first, and it is the first tab stop: the destructive
         button is never what focus lands on. `busy` and not `disabled` on the
         commit — a control the browser blurs mid-write drops a keyboard user on
         <body>, which is the whole argument in Button's own header. -->
    <Button variant="outline" disabled={busy} on:click={() => dispatch('cancel')}>
      {cancelLabel}
    </Button>
    <Button variant={commitVariant} busy={busy} on:click={() => dispatch('confirm')}>
      {action}
    </Button>
  </svelte:fragment>
</Dialog>

<style>
  .say { font-size: var(--sx-t-sm); line-height: 1.55; color: var(--sx-ink-2); }
  .say :global(p) { margin: 0 0 var(--sx-s-3); }

  .lede {
    margin: 0 0 var(--sx-s-2);
    font-weight: var(--sx-w-semi);
    color: var(--sx-ink);
  }

  ul { list-style: none; margin: 0; padding: 0; }
  li {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: baseline;
    gap: var(--sx-s-2);
    padding: var(--sx-s-1) 0;
  }
  /* With counts, the figures get their own right-aligned column so three losses
     read as a tally instead of three sentences that happen to start with a
     number. */
  .counted li { grid-template-columns: auto auto 1fr; }
  .n { font-weight: var(--sx-w-bold); color: var(--sx-ink); justify-self: end; }

  .mk { width: .72em; height: .72em; flex: none; align-self: center; }
  .loses.critical .mk { color: var(--sx-critical); }
  .loses.attention .mk { color: var(--sx-attention); }
  .keeps { margin-top: var(--sx-s-3); }
  .keeps .mk { color: var(--sx-positive); }

  .back {
    margin: var(--sx-s-4) 0 0;
    font-size: var(--sx-t-xs);
    color: var(--sx-ink-3);
  }
  .back.final { color: var(--sx-ink-2); font-weight: var(--sx-w-medium); }

  .busy-note {
    margin: 0;
    margin-right: auto;
    align-self: center;
    font-size: var(--sx-t-xs);
    color: var(--sx-ink-3);
  }

  /* THE FORTY LINES THAT USED TO BE HERE were a second Button: its own radius
     (pill, not r-2), its own spinner, its own disabled treatment, and a
     `.ghost` that meant what Button calls `outline`. The comment above them
     said «the controls family is a sibling and this family does not reach into
     it», and that is exactly the rule that turns a library into seven
     directories. A library composes across its own folders — that is what
     `src/lib/index.js` is the public surface FOR. They are gone; `Button` does
     this job, once, for everybody. */
</style>
