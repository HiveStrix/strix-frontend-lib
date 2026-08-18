<script context="module">
  // Ids have to be unique across every Field on the page and stable across a
  // re-render, and a Core module cannot assume it owns the document's id
  // namespace. A module-scoped counter with a private prefix is the smallest
  // thing that is true in both shapes.
  let seq = 0;
</script>

<script>
  // FIELD — the frame around every answer a person gives.
  //
  // WHY IT EXISTS: a control is the small part. What decides whether a form can
  // be filled at 6am in a yard is everything around it — what it is called, what
  // it will accept, what went wrong, how to fix it, and where the value came
  // from if the person did not type it. Written per control that is thirteen
  // slightly different answers; written once it is one.
  //
  // FOUR THINGS THIS OWNS, AND NOTHING ELSE OWNS:
  //
  //   1. THE WIRING. It mints the id, hands it to the control, and points the
  //      label, the hint and the messages at it. Nobody downstream writes an
  //      `aria-describedby` by hand, so nobody downstream gets it wrong.
  //
  //   2. THE BOX. Background, radius, elevation, hover, focus ring, invalid ring,
  //      disabled and readonly are drawn HERE, around the slot. A control only
  //      contributes its naked element and its affixes, which is why the colones
  //      sign, the units, the counter and the chevron all sit on the same line
  //      without any of them knowing about the others.
  //
  //   3. THE MESSAGE. An error names the PROBLEM and the RECOVERY — two props,
  //      not one string, because a single `error` prop is how «Fecha inválida»
  //      ships. It renders in a live region that already exists when the message
  //      appears, so a screen reader hears it instead of finding it later.
  //
  //   4. THE PROVENANCE. `origin` is the pattern Strix keeps rediscovering: a
  //      value that arrived from a plantilla, a familia, the last document, the
  //      tenant's defaults. It is not a hint and not an error; it is the answer
  //      to «¿por qué dice 180 días si yo no escribí eso?» and to «¿qué pierdo si
  //      lo cambio?». See the note above `origin` below.
  //
  //   <Field label="Código" required hint="Como aparece en la placa." let:id let:describedBy let:invalid>
  //     <input {id} aria-describedby={describedBy} aria-invalid={invalid} />
  //   </Field>
  //
  //   <Field group label="¿Cómo se le da seguimiento?" let:labelId let:describedBy>
  //     <div role="radiogroup" aria-labelledby={labelId} aria-describedby={describedBy}>…</div>
  //   </Field>
  //
  // WHEN NOT TO USE IT: for a control that is its own label — a Switch in a
  // settings row, a Checkbox with its text beside it. Those carry their own
  // label and a Field around them would name the same thing twice.
  //
  // POR QUÉ ESTE ARCHIVO IMPORTA DE `shell`. `Field` no importaba de otra
  // familia; `hintDot` agrega la primera arista, hacia `shell/InfoDot.svelte`.
  // Es deliberada y de la misma clase que las que `nav` ya documenta: InfoDot
  // (como Tooltip) es una «reparación» compartida, la pieza que premia una
  // etiqueta escueta guardando su explicación en un ⓘ en vez de un párrafo.
  // Un formulario es precisamente donde vive la prosa que este sistema quiere
  // achicar, así que la ayuda del campo pudiendo ser un punto es exactamente
  // lo que corresponde reusar acá, no reimplementar.
  import { createEventDispatcher } from 'svelte';
  import InfoDot from '../shell/InfoDot.svelte';

  /** The name of the answer. Sentence case, no colon — the box is the colon. */
  export let label = '';
  /** What the field will accept, said BEFORE it is filled. Never the error. */
  export let hint = '';
  /** Colapsa `hint` en un ⓘ junto a la etiqueta, en vez de un párrafo bajo
   *  ella — premia una etiqueta escueta sin perder la ayuda. Sólo aplica si
   *  hay `label`; sin etiqueta a la que pegarse, `hint` cae al párrafo de
   *  siempre y esta prop no hace nada. */
  export let hintDot = false;
  /** The problem, in the person's words. «El código ya lo tiene BAT004.» */
  export let error = '';
  /** The recovery, in the same breath. Without this an error is half the help. */
  export let fix = '';
  /** Advisory: worth reading, does not block. Loses to `error` when both exist. */
  export let warning = '';
  /** Mark the minority. If almost everything is required, mark `optional` instead. */
  export let required = false;
  export let optional = false;
  export let disabled = false;
  export let readonly = false;
  /** false ⇒ no box. For a control that draws its own surface: cards, a dropzone. */
  export let frame = true;
  /**
   * true ⇒ the label stops being a `<label for>` and becomes a NAME: a plain
   * span with an id. A radiogroup and a checkbox group are labelled by
   * `aria-labelledby`, never by `for`, because there is no single control to
   * point at. Wire it with the `labelId` slot prop.
   */
  export let group = false;
  /** Force an id when something outside has to point at the control. */
  export let id = '';

  /**
   * Where the value came from, if the person did not type it: «la plantilla
   * "Batidoras eléctricas"», «la última salida». Shown as a quiet line under the
   * box. Set `changed` when the person overrides it and the line flips: it says
   * the value is now local, and offers the way back — naming what it would go
   * back TO, because «restablecer» without the old value is a dare, not an offer.
   */
  export let origin = '';
  export let originValue = '';
  export let changed = false;

  const dispatch = createEventDispatcher();
  const n = ++seq;

  $: fid = id || `sxf${n}`;
  $: labelId = `${fid}-l`;
  $: hintId = `${fid}-h`;
  $: msgId = `${fid}-m`;
  $: originId = `${fid}-o`;

  $: invalid = !!error;
  $: message = error || warning;
  // `hintDot` sólo se activa con una etiqueta a la que pegar el punto; sin
  // ella, la ayuda vuelve al párrafo inline (y a `aria-describedby`). Cuando el
  // punto SÍ se muestra, la explicación la carga el InfoDot —su propio tooltip
  // la pone como descripción de su botón—, así que el párrafo no se dibuja y no
  // hay `hintId` al que apuntar: el input queda escueto y la ayuda vive a un
  // gesto, en el ⓘ de al lado, que es el objetivo de la prop.
  $: showHintDot = !!(hint && hintDot && label);
  $: showInlineHint = !!(hint && !showHintDot);
  // undefined, never '': an empty aria-describedby points at nothing and some
  // screen readers read the field name twice trying.
  $: describedBy =
    [showInlineHint && hintId, message && msgId, origin && originId].filter(Boolean).join(' ') || undefined;
</script>

<div class="field" class:disabled class:no-frame={!frame}>
  {#if label}
    <div class="head">
      <span class="lblwrap">
        <svelte:element
          this={group ? 'span' : 'label'}
          class="lbl sx-cap"
          class:tap={!group}
          id={labelId}
          for={group ? undefined : fid}
        >
          {label}
          {#if required}<span class="req" aria-hidden="true">*</span><span class="sr">, obligatorio</span>{/if}
          {#if optional && !required}<span class="opt">opcional</span>{/if}
        </svelte:element>
        <!-- El punto va FUERA del <label>, como hermano: un control interactivo
             dentro de un <label> hereda su clic (tocar el punto activaría el
             campo). Junto a la etiqueta, no adentro. -->
        {#if showHintDot}<InfoDot text={hint} label={`Más información: ${label}`} />{/if}
      </span>
      {#if $$slots.action}<span class="act"><slot name="action" /></span>{/if}
    </div>
  {/if}

  {#if showInlineHint}<p class="hint" id={hintId}>{hint}</p>{/if}

  <!-- `id` is the COMPUTED one, never the raw prop: a caller that passed nothing
       must still get a real id, and every consumer writes `let:id`. -->
  {#if frame}
    <div class="frame" class:invalid class:disabled class:readonly>
      <slot id={fid} {labelId} {describedBy} {invalid} />
    </div>
  {:else}
    <slot id={fid} {labelId} {describedBy} {invalid} />
  {/if}

  <div class="foot">
    <!-- Always in the DOM, empty most of the time: a live region that appears
         at the same moment as its text is a live region nobody hears. -->
    <div class="msgs" id={msgId} aria-live="polite">
      {#if error}
        <p class="msg bad">
          <svg class="mk" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="2" width="8" height="8" rx="1.5" fill="currentColor" /></svg>
          <span class="txt"><b class="prob">{error}</b>{#if fix}{' '}{fix}{/if}</span>
        </p>
      {:else if warning}
        <p class="msg warn">
          <svg class="mk" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 .8 11.6 10.8H.4z" fill="currentColor" /></svg>
          <span class="txt"><b class="prob">{warning}</b>{#if fix}{' '}{fix}{/if}</span>
        </p>
      {/if}
    </div>
    <!-- The same props reach the meta slot: a counter and a date echo both need
         an id of their own to be pointed at, and a named slot only sees what is
         handed to IT. -->
    {#if $$slots.meta}<div class="meta"><slot name="meta" id={fid} {describedBy} {invalid} /></div>{/if}
  </div>

  {#if origin}
    <p class="origin" class:changed id={originId}>
      {#if changed}
        <svg class="mk" viewBox="0 0 12 12" aria-hidden="true"><path d="M8.6 1.2 10.8 3.4 4.4 9.8 1.4 10.6 2.2 7.6z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /></svg>
        <span class="txt">Cambiado solo aquí.</span>
        <button type="button" class="revert" on:click={() => dispatch('revert')}>
          Volver a {originValue || 'lo heredado'}
        </button>
      {:else}
        <svg class="mk" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2.2h3.2a2.6 2.6 0 0 1 2.6 2.6V10M5.4 7.6 7.8 10l2.4-2.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
        <span class="txt">Heredado de {origin}.</span>
      {/if}
    </p>
  {/if}
</div>

<style>
  /* No `gap` anywhere in here on purpose: an empty live region would still cost
     a row of space on every field on the screen. Each part carries its own
     margin, so the parts that are not there cost nothing. */
  .field { position: relative; display: block; min-width: 0; }

  .head {
    display: flex; align-items: baseline; justify-content: space-between;
    gap: var(--sx-s-3); margin-bottom: var(--sx-s-2);
  }

  /* The caption register, one shade darker than a caption. A label on a chart is
     read once; a label on a field is read while somebody is deciding what to
     type into it, and ink-3 at 11px is not enough contrast for that job. */
  /* Etiqueta + su punto de ayuda, agrupados a la izquierda del `.head` para
     que `justify-content: space-between` empuje sólo el slot de acción a la
     derecha. El punto se centra con la mayúscula de la etiqueta. */
  .lblwrap { display: inline-flex; align-items: center; gap: var(--sx-s-2); min-width: 0; }
  .lbl { display: inline-flex; align-items: baseline; gap: var(--sx-s-1); color: var(--sx-ink-2); min-width: 0; }
  .tap { cursor: pointer; }
  .field.disabled .lbl { color: var(--sx-ink-3); }

  /* A shape, not only a colour: the asterisk survives a monochrome screen. */
  .req { color: var(--sx-critical); font-weight: var(--sx-w-bold); }
  .opt {
    text-transform: none; letter-spacing: 0;
    font-weight: var(--sx-w-normal); color: var(--sx-ink-3);
  }
  .act { display: inline-flex; align-items: center; gap: var(--sx-s-2); flex: none; }

  .hint {
    margin: 0 0 var(--sx-s-2); font-size: var(--sx-t-xs);
    color: var(--sx-ink-3); line-height: 1.55; max-width: 64ch;
  }

  /* ── The box ─────────────────────────────────────────────────────────────
     A control outline is the one place a border is the right tool: it is what
     says «type here», and elevation alone cannot say that. Depth still does the
     rest of the work. */
  .frame {
    position: relative;
    display: flex; align-items: stretch; gap: var(--sx-s-2);
    min-height: var(--sx-s-10);
    padding: var(--sx-s-2) var(--sx-s-3);
    background: var(--sx-surface);
    border: 1px solid var(--sx-edge);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-1);
    color: var(--sx-ink);
    transition: border-color var(--sx-fast) var(--sx-ease),
                box-shadow var(--sx-fast) var(--sx-ease),
                background var(--sx-fast) var(--sx-ease);
  }
  .frame:hover:not(.disabled):not(.readonly) { border-color: var(--sx-ink-3); }

  /* focus-WITHIN, not focus-visible: a text box that was clicked into still has
     to show where the caret went. The ring is the system's one focus rule, drawn
     on the box rather than on the naked input inside it. */
  .frame:focus-within {
    border-color: var(--sx-ink);
    outline: 2px solid var(--sx-ink);
    outline-offset: 2px;
  }
  :global([data-sx-theme='dark']) .frame:focus-within,
  :global(.sx-dark) .frame:focus-within { outline-color: var(--sx-n-0); border-color: var(--sx-n-0); }

  /* The ring is the second signal; the word underneath is the first. */
  .frame.invalid { border-color: var(--sx-critical); box-shadow: var(--sx-e-1), 0 0 0 1px var(--sx-critical); }
  /* --sx-line contra --sx-sunk mide 1.25:1 en claro y 1.11:1 en oscuro —
     visible acá sólo porque el marco es grande; el mismo par, en un radio o
     checkbox de 16px, medía igual de mal y se leía como una mancha, no como
     un control (ver Radio.svelte, arreglado con el mismo cambio, para los
     números completos). --sx-edge es el token que este sistema ya mide a
     3:1 para el límite de un control — más robusto acá también, no sólo
     donde ya se había roto. */
  .frame.disabled { background: var(--sx-sunk); border-color: var(--sx-edge); box-shadow: none; color: var(--sx-ink-3); }
  .frame.readonly { background: var(--sx-sunk); box-shadow: none; }

  /* The native form controls the slot drops in here. Scoped to this component,
     so it works inside a shadow root where a global reset would not. */
  .frame :global(input),
  .frame :global(select),
  .frame :global(textarea) {
    flex: 1 1 auto; min-width: 0; width: 100%;
    margin: 0; padding: 0; border: 0; background: none; outline: none;
    font: inherit; font-size: var(--sx-t-md); line-height: 1.45; color: inherit;
  }
  .frame :global(input)::placeholder,
  .frame :global(textarea)::placeholder { color: var(--sx-ink-3); opacity: 1; }
  /* iOS greys a disabled control on its own and ignores `color`; without the
     fill-color the text drops below any contrast the theme promised. */
  .frame :global(input):disabled,
  .frame :global(select):disabled,
  .frame :global(textarea):disabled {
    cursor: not-allowed; color: var(--sx-ink-3);
    -webkit-text-fill-color: var(--sx-ink-3); opacity: 1;
  }
  /* Chrome and Firefox draw the date picker, the select popup and the
     scrollbars from `color-scheme`, not from our tokens. Until the token set
     ships a `--sx-scheme`, this is the honest approximation — and it only
     reaches the document DOM, never a shadow root. */
  :global([data-sx-theme='dark']) .frame,
  :global(.sx-dark) .frame { color-scheme: dark; }

  /* ── What it says afterwards ────────────────────────────────────────────── */
  .foot { display: flex; align-items: baseline; justify-content: space-between; gap: var(--sx-s-3); flex-wrap: wrap; }
  .msgs { flex: 1 1 16ch; min-width: 0; }
  /* No margin of its own: a slot that is forwarded but empty must cost nothing,
     so whatever is dropped in here carries its own spacing. */
  .meta { flex: none; }

  .msg {
    display: flex; align-items: flex-start; gap: var(--sx-s-2);
    margin: var(--sx-s-2) 0 0; font-size: var(--sx-t-xs);
    line-height: 1.5; max-width: 64ch;
  }
  .msg .mk { flex: none; width: 10px; height: 10px; margin-top: var(--sx-s-1); }
  .txt { color: var(--sx-ink-2); min-width: 0; }
  .prob { font-weight: var(--sx-w-semi); }
  .bad .mk, .bad .prob { color: var(--sx-critical); }
  .warn .mk, .warn .prob { color: var(--sx-attention); }

  /* ── Where the value came from ──────────────────────────────────────────── */
  .origin {
    display: flex; align-items: flex-start; flex-wrap: wrap;
    gap: var(--sx-s-1) var(--sx-s-2); margin: var(--sx-s-2) 0 0;
    font-size: var(--sx-t-xs); line-height: 1.5; color: var(--sx-ink-3);
  }
  .origin .mk { flex: none; width: 11px; height: 11px; margin-top: 3px; }
  .origin .txt { color: inherit; }
  /* Inheriting is the calm default, so it is neutral. Diverging from the
     plantilla is a real state somebody may have to explain later, so it is the
     one informational tone the system has — with its own glyph and its own word,
     never the colour alone. */
  .origin.changed { color: var(--sx-info); }

  .revert {
    position: relative;
    background: none; border: 0; padding: 0; margin: 0; cursor: pointer;
    font: inherit; font-size: var(--sx-t-xs); font-weight: var(--sx-w-semi);
    color: var(--sx-ink); text-decoration: underline; text-underline-offset: 3px;
  }
  .revert:hover { color: var(--sx-accent); }

  .sr {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  /* A tablet in landscape is 1024px wide and is still poked with a thumb, so
     this keys on the pointer and never on the width. 16px is not a design size —
     it is the threshold below which iOS zooms the whole page on focus, which in
     a Core module means zooming the Shell around it. */
  @media (pointer: coarse) {
    .frame { min-height: var(--sx-touch); }
    .frame :global(input),
    .frame :global(select),
    .frame :global(textarea) { font-size: 16px; }
    .revert::after { content: ''; position: absolute; inset: -12px -8px; }
  }
</style>
