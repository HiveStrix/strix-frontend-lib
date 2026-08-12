<script>
  // A CARD THAT SAYS WHAT IT IS.
  //
  // The commonest object in every Strix product is not a card, it is a card with
  // a heading on it and two controls in the corner: «Servicios · Exportar CSV»,
  // «Repuestos · Agregar», «Lecturas · Actualizar». Written by hand that is a
  // flex row, a heading whose level somebody guessed, and a bottom padding that
  // is 20px here and 24px there. Written once it is a heading level you pass on
  // purpose, one gap, and a footer band that looks the same in every module in
  // the ecosystem.
  //
  //   <Panel title="Servicios" sub="Los últimos 12 meses" icon="clipboard">
  //     <svelte:fragment slot="actions">…</svelte:fragment>
  //     …
  //     <svelte:fragment slot="footer">…</svelte:fragment>
  //   </Panel>
  //
  //   <Panel title="Libro de servicios" flush scroll>…una tabla…</Panel>
  //
  // THE HEADING LEVEL IS A PROP AND HAS NO DEFAULT WORTH TRUSTING. A panel does
  // not know how deep in the document it sits, and an <h2> nested under another
  // <h2> is exactly the kind of lie that makes a screen reader's outline
  // useless. Pass `level`. The catalogue below every heading in this page does.
  //
  // `tone` FORWARDS TO THE CARD UNDERNEATH — same gesture, same rule: it tints
  // the card's own shadow in the tone's colour, and it needs a Pill or a
  // sentence inside the panel that names the state, never the colour on its
  // own. It never fights Panel's own opaque `.head` the way a rim once did,
  // because a shadow is drawn OUTSIDE the card's box, never behind its
  // children — see `--card-glow` in Card.svelte.
  //
  // FLUSH is for content that owns the edge: a table, a list of rows, a chart.
  // The head keeps its padding, the body loses its horizontal one, and the
  // bottom corners are clipped so the last row follows the card's radius instead
  // of poking a square corner out of a rounded one.
  //
  // SCROLL gives the body its own scroll instead of growing the page. It needs a
  // height from OUTSIDE — put the Panel in a grid row or a flex parent with a
  // definite height. A Panel told to scroll inside an unbounded parent simply
  // grows, which is the right failure: nothing is hidden.
  import Card from './Card.svelte';
  import Glyph from './Glyph.svelte';

  /** The heading. A Panel without one is a Card — use that instead. */
  export let title = '';
  /** One line under the title: what this panel is counting, or over what period. */
  export let sub = '';
  /** 2 | 3 | 4 | 5 | 6 — the real depth of this heading in the page. */
  export let level = 2;
  /** A name from Glyph, beside the title. Decoration only; the title carries the meaning. */
  export let icon = '';
  /** '' | positive | attention | critical | info | neutral. Forwarded to Card — see the note above. */
  export let tone = '';
  /** A step on the spacing scale, applied to head, body and footer alike. */
  export let pad = 5;
  /** 1 | 2 | 3 — see Card. A panel is page furniture: e-1 unless it came forward. */
  export let elevation = 1;
  /** 1 | 2 | 3 — the radius scale. */
  export let radius = 3;
  /** The body runs to the edges. For tables, row lists and charts. */
  export let flush = false;
  /** The body owns its own scroll. Needs a bounded height from its parent. */
  export let scroll = false;

  const STEPS = new Set([1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20]);
  const step = (n) => (STEPS.has(Number(n)) ? `var(--sx-s-${n})` : '0px');
  const RADII = { 1: 'var(--sx-r-1)', 2: 'var(--sx-r-2)', 3: 'var(--sx-r-3)' };

  $: tag = `h${Math.min(6, Math.max(1, Number(level) || 2))}`;
  // The footer band and the flush body both have to round exactly like the card
  // they sit in, and the card's radius is a prop — so it travels down as a
  // variable rather than as three near-miss guesses.
  $: css = `--panel-pad:${step(pad)};--panel-r:${RADII[radius] ?? RADII[3]}`;
</script>

<Card pad={0} {elevation} {radius} {tone} {...$$restProps}>
  <div class="panel" style={css}>
    {#if title || $$slots.actions}
      <div class="head">
        <div class="titles">
          <div class="tline">
            {#if icon}<span class="ic"><Glyph name={icon} size={16} /></span>{/if}
            {#if title}<svelte:element this={tag} class="t">{title}</svelte:element>{/if}
          </div>
          {#if sub}<p class="s">{sub}</p>{/if}
        </div>
        {#if $$slots.actions}
          <div class="acts"><slot name="actions" /></div>
        {/if}
      </div>
    {/if}

    <div class="body" class:flush class:scroll><slot /></div>

    {#if $$slots.footer}
      <div class="foot"><slot name="footer" /></div>
    {/if}
  </div>
</Card>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
    flex: 1 1 auto;
  }

  .head {
    background: var(--sx-thead);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--sx-s-4);
    flex-wrap: wrap;
    padding: var(--panel-pad) var(--panel-pad) 0;
    flex: none;
    /* Card no tiene overflow:hidden, así que una banda sin radio pinta esquinas
       cuadradas encima de las redondeadas de la tarjeta en cuanto --sx-thead
       deja de ser blanco puro (o la perilla se pone en --sx-sunk). El pie ya
       hace este mismo redondeo abajo; esto es lo mismo arriba. */
    border-radius: var(--panel-r) var(--panel-r) 0 0;
  }
  .titles { min-width: 0; }
  .tline { display: flex; align-items: center; gap: var(--sx-s-2); min-width: 0; }
  .ic { display: flex; color: var(--sx-ink-3); }

  /* The heading is styled by class, never by tag, precisely because the tag is a
     prop: an <h4> and an <h2> here are the same object at different depths and
     must not be different sizes. */
  .t {
    margin: 0;
    font-size: var(--sx-t-lg);
    font-weight: var(--sx-w-semi);
    letter-spacing: -.02em;
    line-height: 1.25;
    color: var(--sx-ink);
    min-width: 0;
  }
  .s {
    margin: var(--sx-s-1) 0 0;
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-3);
    line-height: 1.45;
    /* Prose, so no tabular figures: «Los últimos 12 meses» reads as a sentence,
       and tabular digits inside a sentence read as a stutter. */
  }
  .acts { display: flex; align-items: center; gap: var(--sx-s-2); flex-wrap: wrap; }

  .body {
    padding: var(--panel-pad);
    min-height: 0;
    min-width: 0;
    flex: 1 1 auto;
  }
  .body.flush { padding-inline: 0; }
  /* Flush and last ⇒ the content reaches the card's own bottom corners, so it
     gets clipped to them. Only then: clipping a body that is not at the edge
     would silently cut a Tooltip or a menu that was allowed to escape. */
  .body.flush:last-child {
    padding-bottom: 0;
    border-radius: 0 0 var(--panel-r) var(--panel-r);
  }
  /* `auto` already clips to the radius, and it is what `scroll` came for — so
     the clip is only stated for the body that is not scrolling. */
  .body.flush:last-child:not(.scroll) { overflow: hidden; }
  .body.scroll {
    overflow: auto;
    overscroll-behavior: contain;
  }

  /* The footer is a tinted band — --sx-thead, the same token the header uses —
     because a footer is a place where the panel has ended and something else —
     a total, two buttons, a timestamp — is being said about it. Not the same
     recess Well draws: Well is --sx-sunk, and that token also paints form
     controls, so it can't be reused here without dragging inputs along. */
  .foot {
    flex: none;
    padding: var(--sx-s-3) var(--panel-pad);
    background: var(--sx-thead);
    border-radius: 0 0 var(--panel-r) var(--panel-r);
    color: var(--sx-ink-2);
    font-size: var(--sx-t-sm);
  }

  /* Inside the shell's content column a panel head is often title + three
     controls; below this the two halves each take a line rather than squeezing
     the title to four characters. */
  @media (max-width: 520px) {
    .head { flex-direction: column; align-items: stretch; gap: var(--sx-s-3); }
    .acts { justify-content: flex-start; }
  }
</style>
