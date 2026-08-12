<script>
  // EMPTYSTATE — the surface with nothing in it, which is the surface a person
  // meets FIRST and judges the product by.
  //
  // Two emptinesses, and confusing them is the commonest bug in this ecosystem:
  //
  //   kind="empty"    Nothing has ever been here. This is an invitation, and it
  //                   has to name the one action that ends it — not «no hay
  //                   datos», which is a fact about the database, not a door.
  //   kind="filtered" Things exist; this filter found none of them. This is a
  //                   correction, and its only job is to give the filter back.
  //                   Telling somebody with 22 machines that they have no
  //                   machines because they typed BAT9 is a small betrayal.
  //
  //   <EmptyState title="Todavía no hay planes."
  //               action="Configurar familias" secondary="Registrar equipo"
  //               on:action={…} on:secondary={…}>
  //     El programa se arma solo: definí una familia, dale una plantilla, y cada
  //     máquina de esa familia hereda su plan.
  //   </EmptyState>
  //
  //   <EmptyState kind="filtered" inline
  //               title={`Ningún servicio coincide con «${q}».`}
  //               action="Limpiar la búsqueda" on:action={clear} />
  //
  // `inline` is the one-line shape for inside a list. `compact` is the same
  // card with less air — the same word, meaning the same thing, as in
  // `ErrorState` and `DataState`.
  //
  // WHEN NOT: when the list is empty because the READ FAILED — that is an
  // ErrorState, and an outage dressed as an invitation is the calmest sentence
  // on the screen at the exact moment somebody has to look. And when the data is
  // still coming: that is a Skeleton. An empty state that flashes for 200 ms
  // before the rows arrive teaches people that the product is broken.
  import { createEventDispatcher } from 'svelte';
  import Button from '../action/Button.svelte';

  /**
   * empty | filtered — «empty» means nothing has ever been here.
   *
   * It was `first` in this file and `empty` in `data/DataState`, for the same
   * situation, in the same library. One word. `first` still works and means
   * `empty`, because breaking a name is worse than having had two.
   */
  export let kind = 'empty';
  /** The whole sentence, ending in a period. It is a statement, not a heading. */
  export let title;
  /** Label of the one action that ends the emptiness. */
  export let action = '';
  /** The second-best action. Only when there genuinely is one. */
  export let secondary = '';
  /**
   * One LINE inside a list, instead of a card. Right for a filtered result
   * inside a panel that already has a heading.
   *
   * This was called `compact`, which is the same word `ErrorState` and
   * `DataState` use to mean «the same card, with less air». Three components,
   * one word, two meanings — so the shape that is genuinely a different SHAPE
   * got a different word.
   */
  export let inline = false;
  /** The same card with less air. For a state inside a panel, not a landing page. */
  export let compact = false;
  /** The heading level this sits under. A card in a page is usually h2. */
  export let heading = 'h2';

  const dispatch = createEventDispatcher();

  // `$:` and not `const`: `kind` is a prop, and the markup below reads this.
  $: filtered = kind === 'filtered';
</script>

{#if inline}
  <p class="line">
    <span>{title}</span>
    {#if $$slots.actions}
      <slot name="actions" />
    {:else if action}
      <button type="button" class="link" on:click={() => dispatch('action')}>{action}</button>
    {/if}
  </p>
{:else}
  <div class="card" class:filtered class:compact>
    <div class="art" aria-hidden="true">
      <slot name="art">
        {#if filtered}
          <!-- A lens: this is a question about what was asked for. -->
          <svg viewBox="0 0 48 48">
            <circle cx="21" cy="21" r="12" fill="none" stroke="currentColor" stroke-width="2.4" />
            <path d="M30 30l9 9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
          </svg>
        {:else}
          <!-- An open tray: this is a place waiting to be filled. -->
          <svg viewBox="0 0 48 48">
            <path d="M8 18h32v18a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" />
            <path d="M8 18l5-10h22l5 10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" />
            <path d="M8 26h9l2 4h10l2-4h9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" />
          </svg>
        {/if}
      </slot>
    </div>

    <svelte:element this={heading} class="title">{title}</svelte:element>

    {#if $$slots.default}
      <div class="say"><slot /></div>
    {/if}

    {#if $$slots.actions || action || secondary}
      <div class="acts">
        {#if $$slots.actions}
          <slot name="actions" />
        {:else}
          {#if action}
            <Button variant="solid" on:click={() => dispatch('action')}>{action}</Button>
          {/if}
          {#if secondary}
            <Button variant="outline" on:click={() => dispatch('secondary')}>{secondary}</Button>
          {/if}
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .card {
    background: var(--sx-surface);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-1);
    padding: var(--sx-s-12) var(--sx-s-6);
    text-align: center;
  }

  .art { display: flex; justify-content: center; color: var(--sx-ink-3); }
  .art svg { width: var(--sx-s-12); height: var(--sx-s-12); opacity: .55; }
  /* The filtered case is a correction, not an occasion: it gets a smaller mark
     and less air, because somebody is mid-task and wants their list back. */
  .filtered { padding: var(--sx-s-8) var(--sx-s-6); }
  .filtered .art svg { width: var(--sx-s-10); height: var(--sx-s-10); }

  /* Less air, same card. A state rendered INSIDE a panel that already has a
     heading must not read like a landing page for the panel. */
  .compact { padding: var(--sx-s-8) var(--sx-s-5); }
  .compact .art svg { width: var(--sx-s-10); height: var(--sx-s-10); }
  .compact .title { font-size: var(--sx-t-md); margin-top: var(--sx-s-3); }
  .compact .acts { margin-top: var(--sx-s-4); }

  .title {
    margin: var(--sx-s-4) 0 0;
    font-size: var(--sx-t-lg);
    font-weight: var(--sx-w-semi);
    letter-spacing: -.02em;
    line-height: 1.3;
    color: var(--sx-ink);
  }

  .say {
    margin: var(--sx-s-3) auto 0;
    max-width: 54ch;
    font-size: var(--sx-t-sm);
    line-height: 1.55;
    color: var(--sx-ink-2);
  }
  .say :global(p) { margin: 0 0 var(--sx-s-2); }
  .say :global(p:last-child) { margin-bottom: 0; }

  .acts {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--sx-s-2);
    margin-top: var(--sx-s-6);
  }
  /* A forwarded-but-empty slot must cost nothing. `DataState` always passes an
     actions fragment and it is empty for the plain empty state. */
  .acts:empty, .say:empty { display: none; }

  /* A third copy of Button used to live here. Deleted; the real one composes. */

  /* The filtered-inline shape: one line, and the control that undoes the filter
     is part of the sentence rather than a button somewhere else. */
  .line {
    margin: 0;
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-2);
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--sx-s-2);
  }
  .link {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    font-weight: var(--sx-w-semi);
    color: var(--sx-ink);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
    border-radius: var(--sx-r-1);
  }

  @media (pointer: coarse) {
    /* The inline link is a 14px strip of text on a tablet, so the target grows
       around it without moving the baseline of the sentence it sits in.
       Button already handles its own coarse-pointer height. */
    .link { position: relative; }
    .link::after { content: ''; position: absolute; inset: -12px -8px; }
  }

  @media (max-width: 560px) {
    .card { padding: var(--sx-s-8) var(--sx-s-4); }
    /* `stretch` rather than reaching in and setting the buttons' width: the
       column stretches its children, which is a layout decision this file is
       allowed to make about its own box. */
    .acts { flex-direction: column; align-items: stretch; }
  }
</style>
