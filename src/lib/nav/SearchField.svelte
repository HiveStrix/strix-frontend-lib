<script>
  // SEARCH FIELD — the fastest way through a thousand rows.
  //
  // WHY IT IS NOT JUST AN <input>
  //
  // Three things a plain input gets wrong every time, and they are the three
  // things that decide whether people actually use search:
  //
  //   1. THE HOTKEY. A yard supervisor filtering a ledger reaches for the
  //      keyboard, not the mouse. `/` focuses the field from anywhere on the
  //      screen — and the field SAYS SO, in a <kbd>, in the field, where you
  //      look. A shortcut nobody can discover is a shortcut nobody has.
  //   2. ESCAPE. First Escape clears the query, second gives focus back to the
  //      page. Somebody who typed a wrong filter must not have to hunt for the
  //      little ×.
  //   3. THE RESULT COUNT, ANNOUNCED. Sighted users see the list shrink. A
  //      screen-reader user hears nothing at all unless a polite live region
  //      says «41 resultados». That is `resultCount`, and it is why this field
  //      knows how many rows it found.
  //
  //   <SearchField
  //     bind:value={q}
  //     label="Buscar equipos"
  //     placeholder="Código, nombre o placa…"
  //     resultCount={rows.length}
  //     on:input={(e) => debounce(e.detail.value)} />
  //
  // WHAT IT DOES NOT DO
  //
  //   · It does not debounce. How long to wait is a property of the query
  //     behind it — 0 for a local array, 250ms for a round trip — and a
  //     component that guessed would be wrong on one of them.
  //   · It does not filter. It reports the string; the surface owns the match.
  //   · It is not a combobox. No suggestions, no listbox, no `aria-expanded`.
  //     If you need a dropdown of matches, that is a different control with a
  //     different keyboard contract, and pretending otherwise breaks both.
  //
  // ON TOUCH the <kbd> hint is not rendered: there is no `/` to press on a
  // tablet, and a hint you cannot act on is furniture. The input goes to 16px,
  // because below that iOS zooms the whole page on focus and the operator has
  // to pinch back out one-handed while holding a machine part in the other.
  import { createEventDispatcher, onMount } from 'svelte';

  /** The query. Bindable. */
  export let value = '';
  /** The accessible name. Shown only if `showLabel`; always present for AT. */
  export let label = 'Buscar';
  /** Say what can be searched — «Código, nombre o placa…» beats «Buscar…». */
  export let placeholder = 'Buscar…';
  /** Render the label above the field. For a form; a toolbar rarely wants it. */
  export let showLabel = false;
  /** The global key that focuses this field. '' turns it off. */
  export let hotkey = '/';
  /** A query is in flight. Shows the word «Buscando», not just a spinner. */
  export let busy = false;
  /** The search itself failed. Name the problem AND the way out. */
  export let error = '';
  /** How many rows the current query found. Announced politely. null = silent. */
  export let resultCount = null;
  /** The noun being counted, so the announcement is a sentence. */
  export let noun = 'resultados';
  export let disabled = false;

  const dispatch = createEventDispatcher();

  const uid = `sx-search-${Math.random().toString(36).slice(2, 9)}`;

  let input;
  let focused = false;

  $: hasValue = value !== '' && value != null;
  // The hint would sit on top of the text, so it goes away as soon as there is
  // any — including while typing, not only once the field is blurred.
  $: showHint = !!hotkey && !hasValue && !focused && !disabled;
  $: describedBy = [error ? `${uid}-err` : null].filter(Boolean).join(' ') || undefined;

  function onInput(e) {
    value = e.currentTarget.value;
    dispatch('input', { value });
  }

  function clear() {
    if (!hasValue) return;
    value = '';
    dispatch('input', { value });
    dispatch('clear');
    input?.focus();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      // Two presses, two different jobs: undo the query, then leave the field.
      if (hasValue) { e.stopPropagation(); clear(); }
      else input?.blur();
    } else if (e.key === 'Enter') {
      dispatch('submit', { value });
    }
  }

  // The global hotkey. Two guards, and both of them matter:
  //
  // CON DOS INSTANCIAS EN PANTALLA — el buscador global de un TopBar y el de
  // la toolbar de una página, que es exactamente el par que la doc de TopBar
  // sugiere — las dos oyen la misma tecla y gana la ÚLTIMA montada (su focus()
  // corre después). Eso suele ser la más local, que es defendible, pero es un
  // accidente del orden de montaje, no una decisión: el producto decide
  // pasándole `hotkey=""` a la que no deba ganar, y ese es el contrato.
  //   · not while somebody is typing somewhere else — otherwise `/` disappears
  //     out of every note field on the page;
  //   · not while a modal dialog is open — the field is behind the scrim, and
  //     focusing something the user cannot see is worse than doing nothing.
  //     `composedPath` is what makes that test work inside a shadow root too.
  function onWindowKey(e) {
    if (!hotkey || disabled || e.key !== hotkey) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const path = e.composedPath?.() ?? [];
    for (const n of path) {
      const tag = n?.tagName;
      if (!tag) continue;
      if (tag === 'DIALOG') return;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (n.isContentEditable) return;
    }
    e.preventDefault();
    input?.focus();
    input?.select();
  }

  onMount(() => {
    // Focus lands here, not on the window: a Core module must not be able to
    // steal a keystroke from the Shell around it after it unmounts.
    window.addEventListener('keydown', onWindowKey);
    return () => window.removeEventListener('keydown', onWindowKey);
  });
</script>

<div class="sf" class:off={disabled} class:bad={!!error}>
  <label class="lb" class:sr={!showLabel} for="{uid}-i">{label}</label>

  <div class="box" class:focused>
    <svg class="ic" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" stroke-width="1.7" />
      <path d="M10.6 10.6 14 14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
    </svg>

    <input
      id="{uid}-i"
      bind:this={input}
      class="in"
      type="search"
      autocomplete="off"
      spellcheck="false"
      enterkeyhint="search"
      {placeholder}
      {disabled}
      value={value ?? ''}
      aria-keyshortcuts={hotkey || undefined}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={describedBy}
      on:input={onInput}
      on:keydown={onKeydown}
      on:focus={() => (focused = true)}
      on:blur={() => (focused = false)}
    />

    {#if busy}
      <!-- The word rides with the spinner. A spinner alone is a shape that
           could equally mean «loading», «saving» or «stuck». -->
      <span class="busy" aria-hidden="true">
        <svg class="sp" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="2" opacity=".25" />
          <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <span class="bw">Buscando</span>
      </span>
    {/if}

    <!-- Clearable WHILE searching, on purpose: the moment you notice the query
         is wrong is usually the moment it is still in flight. -->
    {#if hasValue}
      <button class="x" type="button" on:click={clear} title="Limpiar la búsqueda (Esc)">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        <span class="sr">Limpiar la búsqueda</span>
      </button>
    {:else if showHint}
      <!-- Aria-hidden because the input already carries `aria-keyshortcuts`,
           which is how a screen reader is told the same thing properly. -->
      <kbd class="kb" aria-hidden="true">{hotkey}</kbd>
    {/if}
  </div>

  {#if error}
    <p class="err" id="{uid}-err" role="alert">
      <svg viewBox="0 0 12 12" class="em" aria-hidden="true"><rect x="2" y="2" width="8" height="8" rx="1.5" fill="currentColor" /></svg>
      <span>{error}</span>
    </p>
  {/if}

  <!-- The count sighted users read off the list, said out loud once the typing
       settles. `polite`, so it never interrupts a letter being typed. -->
  {#if resultCount != null && !error}
    <span class="sr" role="status" aria-live="polite">
      {resultCount === 0
        ? `Sin ${noun} para «${value}»`
        : `${resultCount} ${noun}`}
    </span>
  {/if}
</div>

<style>
  .sr {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  .sf { display: flex; flex-direction: column; gap: var(--sx-s-2); min-width: 0; }

  .lb {
    font-size: var(--sx-t-2xs);
    font-weight: var(--sx-w-semi);
    letter-spacing: .07em;
    text-transform: uppercase;
    color: var(--sx-ink-3);
  }

  /* A control outline, which is exactly what borders are for in this system.
     The field is sunk rather than raised: it is a hole you put text into. */
  .box {
    display: flex;
    align-items: center;
    gap: var(--sx-s-2);
    padding-inline: var(--sx-s-3);
    background: var(--sx-surface);
    border: 1px solid var(--sx-edge);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-1);
    min-width: 0;
    transition: border-color var(--sx-fast) var(--sx-ease), box-shadow var(--sx-fast) var(--sx-ease);
  }

  /* Drawn on the BOX, not the input, because the box is what looks like the
     control. Tracking plain `focus` rather than `:focus-visible` is not a
     shortcut: a text field matches :focus-visible on a mouse click too, so this
     is the same behaviour, written where the ring has to be painted. Repeated
     in-component because base.css does not cross a shadow boundary — and
     `--sx-ink` already re-binds in dark, so there is no second rule to write. */
  .box.focused {
    border-color: var(--sx-ink);
    box-shadow: 0 0 0 2px var(--sx-ink) inset;
  }

  .ic { flex: none; width: 16px; height: 16px; color: var(--sx-ink-3); }

  .in {
    flex: 1 1 auto;
    min-width: 0;
    padding-block: var(--sx-s-3);
    border: 0;
    background: none;
    font-size: var(--sx-t-sm);
    color: var(--sx-ink);
    outline: none;
    /* A placeholder is prose, not a value somebody typed, so it is the one
       string in this box a product does not get to shorten for the width it
       will render in. Found on the real catalogue at 390px: «Buscar equipos,
       órdenes, documentos…» inside a TopBar with no `.narrow` wrapper simply
       hard-clipped mid-word — no ellipsis, nothing to say more was cut. An
       `<input>` never adds one on its own; `text-overflow` reaches the
       placeholder the same as a typed value because both render in the same
       box. */
    text-overflow: ellipsis;
  }
  .in::placeholder { color: var(--sx-ink-3); }
  /* We draw our own clear button, and two of them side by side is a bug report. */
  .in::-webkit-search-cancel-button, .in::-webkit-search-decoration { appearance: none; }

  .kb {
    flex: none;
    font-family: var(--sx-font-mono);
    font-size: var(--sx-t-2xs);
    line-height: 1;
    color: var(--sx-ink-3);
    background: var(--sx-sunk);
    border-radius: var(--sx-r-1);
    padding: var(--sx-s-1) var(--sx-s-2);
  }

  .x {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--sx-s-6);
    height: var(--sx-s-6);
    padding: 0;
    border: 0;
    border-radius: var(--sx-r-pill);
    background: none;
    color: var(--sx-ink-3);
    cursor: pointer;
    transition: background var(--sx-fast) var(--sx-ease), color var(--sx-fast) var(--sx-ease);
  }
  /* El botón de limpiar se ilumina bajo el cursor; --sx-sunk lo hundía. */
  .x:hover { background: var(--sx-accent-soft); color: var(--sx-ink); }
  .x svg { width: 14px; height: 14px; }
  .x:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: 2px; }

  .busy { display: inline-flex; align-items: center; gap: var(--sx-s-2); flex: none; color: var(--sx-ink-3); }
  .sp { width: 14px; height: 14px; animation: sp 900ms linear infinite; }
  .bw { font-size: var(--sx-t-2xs); font-weight: var(--sx-w-medium); }
  @keyframes sp { to { transform: rotate(360deg); } }

  /* The tone never travels alone: the mark is Pill's own critical square and
     the message is a sentence that names the way out. */
  .err {
    display: flex;
    align-items: flex-start;
    gap: var(--sx-s-2);
    margin: 0;
    font-size: var(--sx-t-xs);
    line-height: 1.45;
    color: var(--sx-critical);
  }
  .em { width: 10px; height: 10px; flex: none; margin-top: 4px; }
  .bad .box { border-color: var(--sx-critical-edge); }

  .off { opacity: .55; }
  .off .box { background: var(--sx-sunk); box-shadow: none; }
  .in:disabled { cursor: not-allowed; }

  @media (pointer: coarse) {
    /* 16px is not a style choice: below it, iOS zooms the page on focus. */
    .in { font-size: 16px; padding-block: var(--sx-s-3); }
    .box { min-height: var(--sx-touch); }
    .x { width: var(--sx-touch); height: var(--sx-touch); }
    /* There is no `/` key to press on a tablet. */
    .kb { display: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .sp { animation: none; }
    .box { transition: none; }
  }
</style>
