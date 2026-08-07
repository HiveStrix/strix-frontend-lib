<script>
  // THE THREE SENTENCES A DATA SURFACE OWES A PERSON WHEN IT HAS NO ROWS.
  //
  // A table with nothing in it is not one state, it is three, and collapsing
  // them is the single most common defect in operational software:
  //
  //   empty     — nothing has ever been created. The right answer is an
  //               invitation to the specific action that creates the first one.
  //   filtered  — things exist; THIS view found none of them. The right answer
  //               is the filter that did it and the control that undoes it.
  //               Saying «no hay servicios» here is a lie that sends somebody
  //               to look for a bug in the data.
  //   error     — we do not know whether there is anything, because the read
  //               failed. This is the dangerous one: an error rendered as an
  //               empty list turns a broken screen into the calmest thing on
  //               the monitor at the exact moment somebody has to look.
  //
  // So the component takes `kind` and will not let you write one sentence for
  // three situations. Every branch names the problem AND the recovery.
  //
  //   <DataState kind="empty" noun="equipo" nounPlural="equipos"
  //              title="Todavía no hay equipos."
  //              body="Registrá la primera máquina y su plan se arma solo.">
  //     <button>Registrar equipo</button>
  //   </DataState>
  //
  //   <DataState kind="filtered" noun="servicio" query={q} total={all.length}
  //              on:clear={reset} />
  //
  //   <DataState kind="error" title={err} on:retry={load} />
  //
  // WHEN NOT TO USE IT: for a form that failed to save, or for anything the
  // person just did. This is the state of a LIST. A failed action belongs next
  // to the control that failed, not in the middle of a card.
  //
  // ── WHAT THIS COMPONENT IS, AFTER THE UNIFYING PASS ──────────────────────
  //
  // It used to draw its own card, its own mark, its own headline and its own
  // button — which meant the library had TWO empty cards and TWO error cards
  // that looked different for the same situation, depending only on whether the
  // rows happened to be inside a <Table> or on a page. A person meeting «no
  // encontré nada» in two Strix screens saw two designs.
  //
  // So the drawing is gone. What is left is the part that was never duplicated
  // and is the actual value here: WRITING THE SENTENCE. Spanish will not let a
  // component produce copy without knowing the noun and its gender — «Ningún
  // servicio» but «Ninguna orden», «los repuestos» but «las lecturas» — and
  // that is what `noun` / `nounPlural` / `gender` / `query` / `total` are for.
  //
  //   DataState   generates the words, then hands them to
  //   EmptyState / ErrorState   which own the look.
  //
  // Use DataState when a Table or a DataList is deciding for you. Use
  // EmptyState / ErrorState directly when you are writing the sentence
  // yourself — which for a whole page you almost always should be.

  import { createEventDispatcher } from 'svelte';
  import EmptyState from '../feedback/EmptyState.svelte';
  import ErrorState from '../feedback/ErrorState.svelte';
  import Button from '../action/Button.svelte';

  const dispatch = createEventDispatcher();

  /** empty | filtered | error */
  export let kind = 'empty';
  /** The headline. Overrides the default sentence — usually you should. */
  export let title = '';
  /** The recovery, or the invitation. One or two lines, never a paragraph. */
  export let body = '';
  /** What is being counted, so the default copy is in the product's own words. */
  export let noun = 'resultado';
  export let nounPlural = 'resultados';
  /**
   * 'm' | 'f' — the noun's gender. Spanish will not let a component write copy
   * without it: «Ningún servicio» but «Ninguna orden», «los repuestos» but «las
   * lecturas». Change `noun` and you almost always have to set this too.
   */
  export let gender = 'm';
  /** The search text that produced nothing, quoted back so it is checkable. */
  export let query = '';
  /** How many exist when the filters are off. Makes «de N» true. */
  export let total = null;
  /** Present ⇒ other filters beyond the search box are on. Changes the wording. */
  export let filters = false;
  export let retryLabel = 'Reintentar';
  export let clearLabel = '';
  /**
   * Inside a card, or under a table, the state should not be a landing page.
   * The same word means the same thing in `EmptyState` and in `ErrorState`:
   * the same object, with less air.
   */
  export let compact = false;
  /**
   * Announce it when it appears. Off for a catalogue that renders three of
   * these at once — three simultaneous `role="alert"`s is three interruptions
   * for a page nobody is even acting on.
   */
  export let live = true;

  // The marks this file used to draw — a tray, a funnel, a square — are gone
  // with the card that held them. EmptyState draws the tray and the lens;
  // ErrorState draws the triangle. One set of shapes, one place.

  $: fem = gender === 'f';

  $: head =
    title ||
    (kind === 'error'
      ? `No se pudieron cargar ${fem ? 'las' : 'los'} ${nounPlural}.`
      : kind === 'filtered'
        ? query
          ? `${fem ? 'Ninguna' : 'Ningún'} ${noun} coincide con «${query}».`
          : `${fem ? 'Ninguna' : 'Ningún'} ${noun} pasa los filtros.`
        : `Todavía no hay ${nounPlural}.`);

  $: sub =
    body ||
    (kind === 'error'
      ? 'Puede ser la conexión o el servidor. Volvé a intentarlo; si sigue igual, avisá a soporte con la hora exacta.'
      : kind === 'filtered'
        ? total != null && total > 0
          ? `Hay ${total} ${total === 1 ? noun : nounPlural} en total.`
          : ''
        : '');

  // The header comment shows this used with the maintenance vocabulary; the two
  // Spanish articles above are the only place the component has an opinion about
  // the language, and `gender` is what keeps that opinion correct.

  // The control names its own action, and the confirmation would reuse the same
  // word. «Ver todos» when a search is still on would be a promise it breaks.
  $: clearWord =
    clearLabel || (query && filters ? 'Quitar ambos filtros' : query ? 'Limpiar la búsqueda' : 'Quitar los filtros');
</script>

{#if kind === 'error'}
  <!-- `retry=""` turns ErrorState's own button off so the actions slot can hold
       the retry AND whatever the surface passed, instead of one or the other. -->
  <ErrorState title={head} recovery={sub} retry="" {compact} {live} heading="p" on:retry>
    <svelte:fragment slot="actions">
      <Button variant="solid" size={compact ? 'sm' : 'md'} on:click={() => dispatch('retry')}>
        {retryLabel}
      </Button>
      <slot />
    </svelte:fragment>
  </ErrorState>
{:else}
  <EmptyState kind={kind === 'filtered' ? 'filtered' : 'empty'} title={head} {compact} heading="p">
    {#if sub}{sub}{/if}
    <svelte:fragment slot="actions">
      {#if kind === 'filtered'}
        <Button variant="solid" on:click={() => dispatch('clear')}>{clearWord}</Button>
      {/if}
      <slot />
    </svelte:fragment>
  </EmptyState>
{/if}

<style>
  /* THIS BLOCK USED TO BE 100 LINES: a card, a mark, a headline, a sub, an
     actions row and a `.go` button that was the fifth hand-rolled copy of
     Button in this library. All of it drew, from scratch, the same two objects
     `EmptyState` and `ErrorState` already draw — so a person meeting «no
     encontré nada» inside a Table and on a page saw two different designs for
     one situation.

     Nothing is left because nothing needs to be. This component's job is the
     Spanish sentence, and a component whose job is words does not own a
     stylesheet. */
</style>
