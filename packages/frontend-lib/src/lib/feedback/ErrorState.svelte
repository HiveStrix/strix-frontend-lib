<script>
  // ERRORSTATE — the surface that could not be read, saying so in the two halves
  // an error is made of.
  //
  //   THE PROBLEM   what failed, in the reader's words, not the stack's.
  //   THE RECOVERY  what to do about it — and «Reintentar» alone is not a
  //                 recovery, it is a hope. If retrying is all there is, say why
  //                 it might work this time.
  //
  // The half that gets dropped is always the second one, and an error without it
  // is a shrug with a red icon on it.
  //
  //   <ErrorState
  //     title="No se pudo cargar la flota."
  //     recovery="Es una interrupción del servicio, no de tus datos. Reintentá; si sigue igual en unos minutos, avisale a soporte con el código de abajo."
  //     code="req_9f3ac21" busy={reloading} on:retry={load} />
  //
  // The support code is the one place a machine string is allowed on screen, and
  // it earns it: six months later «¿por qué el sistema creyó que esta máquina
  // corrió 340 horas?» has to have an exact answer, and this is the thread back
  // to it. It is behind a disclosure because the person reading the error does
  // not need it — the person they call does.
  //
  // WHEN NOT: for an empty result (EmptyState — a filter that matched nothing is
  // not a failure), for a field that was filled in wrong (that message belongs
  // beside the field), and for an action that failed while the surface around it
  // is still good — that is a critical Toast with «Reintentar», because throwing
  // away a screenful of context to report one failed save is its own bug.
  //
  // A FAILED REFRESH IS NOT AN EMPTY LIST. If stale rows are still on screen,
  // use `band` above them: replacing them with this card tells somebody that
  // data they were reading a second ago no longer exists.
  import { createEventDispatcher, onDestroy } from 'svelte';
  import Button from '../action/Button.svelte';

  /** The problem, as a whole sentence. */
  export let title = 'No se pudo cargar la información.';
  /** The recovery. Prose, and it must say what to DO. The slot also works. */
  export let recovery = '';
  /** Label of the retrying control. Empty ⇒ no retry (some failures do not). */
  export let retry = 'Reintentar';
  export let secondary = '';
  /** The retry is in flight. */
  export let busy = false;
  /** Correlation id, request id, ticket number — whatever support will ask for. */
  export let code = '';
  export let codeLabel = 'Código para soporte';
  /**
   * A BAND above data that is still on screen, instead of a card in its place.
   *
   * This was called `compact`, which is what `EmptyState` and `DataState` use to
   * mean «the same card, with less air». Three components, one word, two
   * meanings — and the bug it caused was visible: `DataState` forwarding its own
   * `compact` turned a table's error state into a stale-data band, which claims
   * there are still rows underneath when there are none.
   */
  export let band = false;
  /** The same card with less air. For a state inside a panel, not a landing page. */
  export let compact = false;
  export let heading = 'h2';
  /** Interrupt when this appears. Off for a documented example of one. */
  export let live = true;

  const dispatch = createEventDispatcher();

  let shown = false;
  let copied = false;
  let copyTimer;

  onDestroy(() => clearTimeout(copyTimer));

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      copied = true;
      clearTimeout(copyTimer);
      // Long enough to read, short enough that the control goes back to being
      // the control before somebody needs it again.
      copyTimer = setTimeout(() => (copied = false), 2400);
    } catch {
      // Clipboard blocked by policy or permission: the code is selectable text
      // and selecting it is the fallback, so say that instead of failing loudly.
      copied = false;
    }
  }
</script>

<div class="err" class:band class:compact role={live ? 'alert' : undefined}>
  <div class="mark" aria-hidden="true">
    <!-- The same triangle the tone vocabulary uses for «revisar», in critical
         ink: a shape that survives being photocopied, and a colour that never
         travels without the words beside it. -->
    <svg viewBox="0 0 24 24">
      <path d="M12 3.2 22.4 21H1.6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
      <path d="M12 9.6v5.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <circle cx="12" cy="18" r="1.15" fill="currentColor" />
    </svg>
  </div>

  <div class="body">
    <svelte:element this={heading} class="title">{title}</svelte:element>

    {#if recovery || $$slots.default}
      <div class="say">
        {#if recovery}<p>{recovery}</p>{/if}
        <slot />
      </div>
    {/if}

    {#if retry || secondary || $$slots.actions}
      <div class="acts">
        {#if $$slots.actions}
          <slot name="actions" />
        {:else}
          {#if retry}
            <!-- `busy`, not `disabled`: the browser blurs a control the moment
                 it is disabled, so a keyboard user who pressed Enter on
                 «Reintentar» would be dropped on <body> and have to tab back
                 from the top of a page that just failed to load. -->
            <Button variant="solid" size={band ? 'sm' : 'md'} busy={busy}
              on:click={() => dispatch('retry')}>{retry}</Button>
          {/if}
          {#if secondary}
            <Button variant="outline" size={band ? 'sm' : 'md'} disabled={busy}
              on:click={() => dispatch('secondary')}>{secondary}</Button>
          {/if}
        {/if}
      </div>
    {/if}

    {#if code}
      <div class="code">
        <button type="button" class="more" aria-expanded={shown} on:click={() => (shown = !shown)}>
          <svg class="chev" class:open={shown} viewBox="0 0 12 12" aria-hidden="true">
            <path d="M4 2.5 8 6l-4 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {codeLabel}
        </button>
        {#if shown}
          <div class="codeline">
            <code class="sx-id">{code}</code>
            <button type="button" class="copy" on:click={copy}>
              {copied ? 'Código copiado' : 'Copiar el código'}
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .err {
    display: flex;
    gap: var(--sx-s-4);
    background: var(--sx-surface);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-1);
    padding: var(--sx-s-10) var(--sx-s-6);
    text-align: left;
  }

  .mark { flex: none; color: var(--sx-critical); }
  .mark svg { width: var(--sx-s-8); height: var(--sx-s-8); }

  .body { flex: 1; min-width: 0; }

  .title {
    margin: 0;
    font-size: var(--sx-t-lg);
    font-weight: var(--sx-w-semi);
    letter-spacing: -.02em;
    line-height: 1.3;
    color: var(--sx-ink);
  }

  .say {
    margin-top: var(--sx-s-2);
    max-width: 62ch;
    font-size: var(--sx-t-sm);
    line-height: 1.55;
    color: var(--sx-ink-2);
  }
  .say :global(p) { margin: 0 0 var(--sx-s-2); }
  .say :global(p:last-child) { margin-bottom: 0; }

  .acts { display: flex; flex-wrap: wrap; gap: var(--sx-s-2); margin-top: var(--sx-s-5); }
  .acts:empty, .say:empty { display: none; }

  /* The local `.btn` / `.solid` / `.ghost` / `.sp` block is gone: it was a
     fourth copy of Button with a pill radius and its own spinner, and its
     `.ghost` was Button's `outline`. Button does this now. */

  .code { margin-top: var(--sx-s-5); }
  .more {
    display: inline-flex;
    align-items: center;
    gap: var(--sx-s-2);
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    font-size: var(--sx-t-xs);
    font-weight: var(--sx-w-medium);
    color: var(--sx-ink-3);
    cursor: pointer;
    border-radius: var(--sx-r-1);
  }
  .more:hover { color: var(--sx-ink-2); }
  .chev { width: .85em; height: .85em; transition: transform var(--sx-fast) var(--sx-ease); }
  .chev.open { transform: rotate(90deg); }

  .codeline {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--sx-s-3);
    margin-top: var(--sx-s-2);
    padding: var(--sx-s-2) var(--sx-s-3);
    background: var(--sx-sunk);
    border-radius: var(--sx-r-1);
    font-size: var(--sx-t-xs);
  }
  .codeline code { color: var(--sx-ink-2); user-select: all; }
  .copy {
    margin-left: auto;
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    font-size: var(--sx-t-xs);
    font-weight: var(--sx-w-semi);
    color: var(--sx-ink);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
    border-radius: var(--sx-r-1);
  }

  /* Menos aire, la misma tarjeta. */
  .compact { padding: var(--sx-s-6) var(--sx-s-5); }
  .compact .mark svg { width: var(--sx-s-6); height: var(--sx-s-6); }
  .compact .title { font-size: var(--sx-t-md); }

  /* Above data that is still good: a band, not a tombstone. */
  .band {
    align-items: flex-start;
    gap: var(--sx-s-3);
    padding: var(--sx-s-3) var(--sx-s-4);
    background: var(--sx-critical-band);
    border: 1px solid var(--sx-critical-edge);
    border-radius: var(--sx-r-2);
    box-shadow: none;
  }
  .band .mark svg { width: 1.2em; height: 1.2em; margin-top: .18em; }
  .band .title { font-size: var(--sx-t-sm); }
  .band .say { font-size: var(--sx-t-sm); margin-top: var(--sx-s-1); }
  .band .acts { margin-top: var(--sx-s-3); }
  /* The compact band asks Button for `size="sm"` in the markup instead of
     overriding its height from out here — reaching into another component's
     box is how two components stop agreeing about what «small» is. */

  @media (pointer: coarse) {
    .more, .copy { min-height: var(--sx-touch); display: inline-flex; align-items: center; }
  }

  @media (max-width: 560px) {
    .err { flex-direction: column; padding: var(--sx-s-8) var(--sx-s-4); gap: var(--sx-s-3); }
    .band { flex-direction: row; padding: var(--sx-s-3); }
    .acts { flex-direction: column; align-items: stretch; }
    .band .acts { flex-direction: row; }
  }

  @media (prefers-reduced-motion: reduce) {
    .chev { transition: none; }
  }
</style>
