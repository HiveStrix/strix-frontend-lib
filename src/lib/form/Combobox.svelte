<script context="module">
  // The listbox, the status line and every option need ids that hang off the
  // field's own root, so this mints the root instead of borrowing Field's.
  let seq = 0;

  // Spanish is written with tildes and typed without them. «Alajuela» has to be
  // found by «alajuela», «Muñoz» by «munoz», «Batidora eléctrica» by «electrica».
  // Folding once here is the difference between a search box that works in this
  // country and one that does not.
  const fold = (s) =>
    String(s ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

  /** Split a label around the match so it can be marked without `@html`. */
  function mark(label, q) {
    if (!q) return [label, '', ''];
    const i = fold(label).indexOf(q);
    if (i === -1) return [label, '', ''];
    return [label.slice(0, i), label.slice(i, i + q.length), label.slice(i + q.length)];
  }
</script>

<script>
  // COMBOBOX — a list too long to look at, made findable by typing.
  //
  // The yard has 22 batidoras, the catalogue has 45 activities, the parts list
  // has hundreds of rows. A `<select>` over that is a wall; a plain text box over
  // it invents «heredia», «Heredia» and «HEREDIA» inside a week. This is the
  // control in between: type a few characters, see what matched, pick one.
  //
  // WHAT IT PROMISES, AND WHY EACH PROMISE IS THERE:
  //
  //   • IT SAYS HOW MANY MATCHED — on screen and out loud. A list that silently
  //     shortens as you type is a list you stop trusting. «12 equipos» above the
  //     options, and the same sentence in a polite live region, is the whole
  //     reason somebody types a fourth character instead of scrolling.
  //   • IT NEVER INVENTS. Unless `allowFree`, leaving the box with text that is
  //     not an option puts back the option that IS selected. Half-typed rubbish
  //     never becomes a value.
  //   • ESCAPE IS ONE LEVEL PER PRESS, and it is stopped from bubbling. A
  //     combobox inside a dialog inside the Shell must not close all three, and
  //     this is exactly the bug that has shipped in this ecosystem before.
  //   • IT OPENS UPWARDS when there is no room below, because a module renders
  //     inside a Shell and the bottom of the viewport is not where the developer
  //     thought it was.
  //
  //   <Combobox label="Equipo" bind:value={assetId} options={assets}
  //             noun="equipo" nounPlural="equipos"
  //             placeholder="Código o nombre…"
  //             hint="Los activos aparecen de primero." />
  //
  //   options = [{ value, label, hint?, meta? }]
  //
  // WHEN NOT TO USE IT: under about a dozen options — Select opens the platform
  // picker and costs no typing. For a value that does not exist yet, this is the
  // wrong shape entirely: a combobox that quietly accepts anything is a text box
  // wearing a costume, so pair it with a real «crear» action instead of
  // `allowFree`. And never as a filter over a table that is already on screen —
  // that is a search field, and the table itself is the result list.
  //
  // DÓNDE VIVE LA LISTA. Donde existe `popover` (Chrome 114+, Safari 17+,
  // Firefox 125+), `.pop` lleva `popover="manual"` y abre en la TOP LAYER, así
  // que un ancestro con `overflow: hidden` no la recorta. Ahí deja de usarse
  // el atributo `hidden` para ocultarla —mezclar `hidden` con `popover` puede
  // dar comportamientos ambiguos entre navegadores— y en su lugar abrir y
  // cerrar es enteramente cosa de `showPopover()`/`hidePopover()`, atados a
  // `open`. La posición deja de ser `left: 0; right: 0` contra `.wrap`
  // (`position: absolute`) y pasa a `position: fixed` con el ancho y el borde
  // izquierdo de `.wrap` medidos por `place()` y escritos a mano, recalculados
  // en cada `scroll` y `resize` mientras la lista está abierta. Donde
  // `popover` no existe, `.pop` cae en exactamente lo de siempre.
  import { createEventDispatcher, tick, onDestroy } from 'svelte';
  import Field from './Field.svelte';
  import { supportsPopover, syncPopover } from '../shell/toplayer.js';

  /** The selected option's value. '' ⇒ nothing chosen. */
  export let value = '';
  /** [{ value, label, hint?, meta?, disabled? }] */
  export let options = [];
  /** What the rows ARE, so the count reads «12 equipos», never «12 resultados». */
  export let noun = 'resultado';
  export let nounPlural = 'resultados';
  export let placeholder = 'Buscar…';
  /** Accept text that is not an option. Read the note above before turning it on. */
  export let allowFree = false;
  /** Options are being fetched. Says so instead of showing an empty list. */
  export let loading = false;
  export let loadingLabel = 'Buscando…';
  /** Rows drawn at once. The count above the list always tells the whole truth. */
  export let maxVisible = 50;

  export let label = '';
  export let hint = '';
  export let error = '';
  export let fix = '';
  export let warning = '';
  export let required = false;
  export let optional = false;
  export let disabled = false;
  export let name = undefined;
  export let id = '';
  export let origin = '';
  export let originValue = '';
  export let changed = false;

  const dispatch = createEventDispatcher();
  const n = ++seq;

  $: fid = id || `sxcb${n}`;

  let inputEl;
  let listEl;
  let wrapEl;
  let popEl;
  let query = '';
  let open = false;
  let active = -1;
  let dropUp = false;
  let touched = false; // has the person typed since the box was opened?

  export const focus = () => inputEl?.focus();

  $: items = (options ?? []).map((o) =>
    o !== null && typeof o === 'object' ? o : { value: o, label: String(o) }
  );
  $: selected = items.find((o) => o.value === value) ?? null;

  // The box shows the chosen label until somebody starts typing over it.
  $: if (!touched) query = selected ? selected.label : allowFree ? (value ?? '') : '';

  // `$:` and not `const`: these close over `query`, `items` and `maxVisible`, and
  // a plain helper would be invisible to the statements that call it — the
  // classic legacy trap, and the reason three lists in this ecosystem kept
  // showing the previous keystroke's results.
  $: q = touched ? fold(query) : '';
  $: hits = q
    ? items.filter((o) => fold(o.label).includes(q) || fold(o.value).includes(q) || fold(o.hint).includes(q))
    : items;
  $: shown = hits.slice(0, maxVisible);

  $: countWord = hits.length === 1 ? noun : nounPlural;
  $: countLine = loading
    ? loadingLabel
    : hits.length === 0
      ? q
        ? `Ningún ${noun} coincide con «${query}».`
        : `No hay ${nounPlural} para elegir.`
      : `${hits.length} ${countWord}${hits.length > shown.length ? ` · se muestran ${shown.length}` : ''}`;

  // Only while the list is open: a live region that describes a closed list is
  // a live region that talks over the rest of the form.
  $: announce = open ? countLine : '';

  $: activeId = open && active >= 0 && active < shown.length ? `${fid}-o${active}` : undefined;

  async function openList(moveTo = null) {
    if (disabled || open) {
      if (moveTo !== null) move(moveTo);
      return;
    }
    open = true;
    active = moveTo !== null ? clamp(moveTo) : shown.findIndex((o) => o.value === value);
    await tick();
    place();
    scrollActive();
  }

  function close({ restore = true } = {}) {
    if (!open) return;
    open = false;
    active = -1;
    if (restore && !allowFree) touched = false; // puts the chosen label back
  }

  // El volteo arriba/abajo no cambió: sigue siendo una estimación de 320px, no
  // el alto real de la lista, porque esta función corre ANTES de que el
  // conteo de resultados (y por lo tanto el alto) esté resuelto. Lo nuevo es
  // que, con `popover`, acá también se escriben las coordenadas — el ancho y
  // el borde izquierdo de `.wrap`, en píxeles de viewport — porque `.pop` deja
  // de estar posicionada contra `.wrap` para vivir en la top layer.
  function place() {
    if (!wrapEl || typeof window === 'undefined') return;
    const r = wrapEl.getBoundingClientRect();
    const want = 320;
    // `document.documentElement.clientHeight`, no `window.innerHeight`:
    // `getBoundingClientRect()` (arriba, en `r`) excluye las barras de scroll
    // clásicas, pero `innerHeight` las incluye — mezclar los dos deja un
    // offset de ~15px en cualquier sistema con barras clásicas. `clientHeight`
    // sí las excluye, igual que `getBoundingClientRect()`.
    const vh = document.documentElement.clientHeight;
    dropUp = r.bottom + want > vh && r.top > vh - r.bottom;
    if (!supportsPopover || !popEl) return;
    popEl.style.setProperty('--sx-pop-x', `${r.left}px`);
    popEl.style.setProperty('--sx-pop-w', `${r.width}px`);
    popEl.style.setProperty('--sx-pop-y', `${dropUp ? vh - r.top : r.bottom}px`);
  }

  // Entrar y salir de la top layer es cosa aparte de `place()`: `close()` no
  // vuelve a medir nada, así que si `syncPopover` viviera adentro de
  // `place()` nunca se llamaría `hidePopover()` al cerrar. Atado directo a
  // `open`, la misma pregunta que Menu y Sheet resuelven cada uno a su modo.
  $: syncPopover(popEl, open);

  // `fixed` no sigue al campo solo: si la página —o un contenedor con scroll
  // propio— se mueve mientras la lista está abierta, se despega. Un
  // `<svelte:window>` sólo puede haber uno por componente y el de abajo ya lo
  // usa `resize`, así que este va a mano, atado a `open` igual que los
  // listeners de Menu — y por la misma razón: uno en captura que sigue vivo
  // después de cerrar corre en cada scroll de toda la aplicación.
  function onScroll() { if (open) place(); }

  $: if (typeof document !== 'undefined' && supportsPopover) {
    document.removeEventListener('scroll', onScroll, true);
    if (open) document.addEventListener('scroll', onScroll, { capture: true, passive: true });
  }

  onDestroy(() => {
    if (typeof document !== 'undefined') document.removeEventListener('scroll', onScroll, true);
  });

  const clamp = (i) => (shown.length === 0 ? -1 : (i + shown.length) % shown.length);

  function move(i) {
    active = clamp(i);
    scrollActive();
  }

  async function scrollActive() {
    await tick();
    listEl?.querySelector('[data-on="1"]')?.scrollIntoView({ block: 'nearest' });
  }

  function choose(o) {
    if (!o || o.disabled) return;
    value = o.value;
    touched = false;
    query = o.label;
    open = false;
    active = -1;
    dispatch('change', o);
    inputEl?.focus();
  }

  function clear() {
    value = '';
    query = '';
    touched = true;
    dispatch('change', null);
    inputEl?.focus();
    openList();
  }

  function onInput(e) {
    touched = true;
    query = e.currentTarget.value;
    active = -1;
    if (!open) openList();
    else place();
    if (allowFree) value = query;
    dispatch('search', query);
  }

  function onKey(e) {
    if (disabled) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        open ? move(active + 1) : openList(0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        open ? move(active - 1) : openList(shown.length - 1);
        break;
      case 'Home':
        if (open) { e.preventDefault(); move(0); }
        break;
      case 'End':
        if (open) { e.preventDefault(); move(shown.length - 1); }
        break;
      case 'Enter':
        if (open && active >= 0) { e.preventDefault(); choose(shown[active]); }
        break;
      case 'Tab':
        close();
        break;
      case 'Escape':
        // One level per press, and never past this component: a Combobox inside
        // a dialog inside the Shell must not close all three at once.
        if (open) { e.stopPropagation(); close(); }
        else if (query) { e.stopPropagation(); clear(); }
        break;
    }
  }

  function onFocusOut(e) {
    if (wrapEl && e.relatedTarget && wrapEl.contains(e.relatedTarget)) return;
    close();
    dispatch('blur', e);
  }

  $: hasValue = allowFree ? !!query : !!selected;
</script>

<svelte:window on:resize={() => open && place()} />

<Field
  {label} {hint} {error} {fix} {warning} {required} {optional} {disabled}
  id={fid} {origin} {originValue} {changed}
  frame={false}
  on:revert
  let:describedBy
  let:invalid
>
  <div class="wrap" bind:this={wrapEl} on:focusout={onFocusOut}>
    <div class="frame" class:invalid class:disabled>
      <span class="lead" aria-hidden="true">
        <svg viewBox="0 0 14 14"><circle cx="6" cy="6" r="4.2" fill="none" stroke="currentColor" stroke-width="1.7" /><path d="M9.2 9.2 12.4 12.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" /></svg>
      </span>

      <input
        bind:this={inputEl}
        type="text"
        id={fid}
        {name}
        {placeholder}
        {disabled}
        bind:value={query}
        role="combobox"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        aria-expanded={open}
        aria-controls={`${fid}-list`}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        aria-busy={loading || undefined}
        required={required || undefined}
        on:input={onInput}
        on:keydown={onKey}
        on:focus
        on:click={() => openList()}
      />

      {#if hasValue && !disabled}
        <button type="button" class="icon" on:click={clear} aria-label={`Limpiar ${label || 'la búsqueda'}`}>
          <svg viewBox="0 0 14 14"><path d="M3 3l8 8M11 3l-8 8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
        </button>
      {/if}

      <button
        type="button"
        class="icon chev"
        class:up={open}
        tabindex="-1"
        aria-hidden="true"
        title={open ? 'Cerrar la lista' : 'Abrir la lista'}
        {disabled}
        on:click={() => (open ? close() : (inputEl?.focus(), openList()))}
      >
        <svg viewBox="0 0 12 12"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
    </div>

    <div
      class="pop"
      class:up={dropUp}
      class:fx={supportsPopover}
      hidden={supportsPopover ? false : !open}
      popover={supportsPopover ? 'manual' : undefined}
      bind:this={popEl}
    >
      <p class="count" class:none={!loading && hits.length === 0}>{countLine}</p>
      <!-- Pointer down is swallowed so focus never leaves the input: without it
           the field blurs, the list closes, and the click lands on nothing. -->
      <ul
        class="list"
        bind:this={listEl}
        id={`${fid}-list`}
        role="listbox"
        aria-label={label || 'Resultados'}
        on:pointerdown|preventDefault
      >
        {#each shown as o, i (o.value)}
          {@const cut = mark(o.label, q)}
          <!-- The keyboard never lands on an option: it stays on the input and
               `aria-activedescendant` moves, which is the pattern this control
               is. Key handlers here would be handlers on something no key can
               reach. -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <li
            id={`${fid}-o${i}`}
            role="option"
            aria-selected={o.value === value}
            aria-disabled={o.disabled || undefined}
            data-on={i === active ? '1' : '0'}
            class:on={i === active}
            class:sel={o.value === value}
            class:off={o.disabled}
            on:click={() => choose(o)}
            on:mousemove={() => (active = i)}
          >
            <span class="opt">
              <span class="lb">{cut[0]}<b>{cut[1]}</b>{cut[2]}</span>
              {#if o.hint}<span class="oh">{o.hint}</span>{/if}
            </span>
            {#if o.meta}<span class="om">{o.meta}</span>{/if}
            {#if o.value === value}
              <svg class="tick" viewBox="0 0 12 12" aria-hidden="true"><path d="M1 6.5 4.5 10 11 2.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            {/if}
          </li>
        {/each}
      </ul>
    </div>

    <span class="sr" role="status">{announce}</span>
  </div>

  <slot name="action" slot="action" />
</Field>

<style>
  .wrap { position: relative; display: block; }

  /* The same box Field draws, redeclared here because the popup has to be
     positioned against it and a component cannot reach into another one's
     scoped styles. The duplication is the price of surviving a shadow root. */
  .frame {
    display: flex; align-items: stretch; gap: var(--sx-s-2);
    min-height: var(--sx-s-10);
    padding: var(--sx-s-2) var(--sx-s-3);
    background: var(--sx-surface);
    border: 1px solid var(--sx-edge);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-1);
    transition: border-color var(--sx-fast) var(--sx-ease), box-shadow var(--sx-fast) var(--sx-ease);
  }
  .frame:hover:not(.disabled) { border-color: var(--sx-ink-3); }
  .frame:focus-within { border-color: var(--sx-ink); outline: 2px solid var(--sx-ink); outline-offset: 2px; }
  :global([data-sx-theme='dark']) .frame:focus-within,
  :global(.sx-dark) .frame:focus-within { outline-color: var(--sx-n-0); border-color: var(--sx-n-0); }
  .frame.invalid { border-color: var(--sx-critical); box-shadow: var(--sx-e-1), 0 0 0 1px var(--sx-critical); }
  /* Mismo arreglo que Field.svelte/Radio.svelte: --sx-line contra --sx-sunk
     mide 1.11:1 en oscuro — --sx-edge es el token de este sistema ya medido
     a 3:1 para el límite de un control. Ver Radio.svelte para los números
     completos. */
  .frame.disabled { background: var(--sx-sunk); border-color: var(--sx-edge); box-shadow: none; }

  input {
    flex: 1 1 auto; min-width: 0; width: 100%;
    margin: 0; padding: 0; border: 0; background: none; outline: none;
    font: inherit; font-size: var(--sx-t-md); line-height: 1.45; color: inherit;
  }
  input::placeholder { color: var(--sx-ink-3); opacity: 1; }
  input:disabled { cursor: not-allowed; color: var(--sx-ink-3); -webkit-text-fill-color: var(--sx-ink-3); opacity: 1; }

  .lead { display: inline-flex; align-items: center; flex: none; color: var(--sx-ink-3); }
  .lead svg { width: 15px; height: 15px; }

  .icon {
    display: inline-flex; align-items: center; justify-content: center; flex: none;
    align-self: center; width: var(--sx-s-6); height: var(--sx-s-6);
    padding: 0; border: 0; border-radius: var(--sx-r-pill);
    background: none; color: var(--sx-ink-3); cursor: pointer;
    transition: background var(--sx-fast) var(--sx-ease), color var(--sx-fast) var(--sx-ease),
                transform var(--sx-fast) var(--sx-ease);
  }
  /* Mismo botón redondo (--sx-r-pill) que el de limpiar de Input/SearchField:
     se ilumina bajo el cursor, no se hunde. */
  .icon:hover:not(:disabled) { background: var(--sx-accent-soft); color: var(--sx-ink); }
  .icon:disabled { cursor: not-allowed; opacity: .5; }
  .icon svg { width: 14px; height: 14px; }
  .chev.up { transform: rotate(180deg); }

  /* ── The list ────────────────────────────────────────────────────────────
     Elevation, not an outline: it is a surface floating over the form, and the
     shadow is what says so on both themes. */
  .pop {
    position: absolute; left: 0; right: 0; top: calc(100% + var(--sx-s-2));
    z-index: var(--sx-z-overlay);
    background: var(--sx-surface);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-3);
    overflow: hidden;
    /* Cuatro declaraciones que acá no cambian nada y en `.fx` evitan que la
       hoja de estilos de `popover` (`margin: auto; border: solid; padding:
       .25em; color: CanvasText; height: fit-content`, activa apenas el
       atributo está escrito) meta un anillo de aire adentro del borde
       redondeado, un filo de ~3px, o una caja que no llena su alto por
       contenido. `width` no está acá porque cada camino la resuelve distinto
       — `left: 0; right: 0` estira en el de respaldo, `--sx-pop-w` la fija en
       `.fx` — y ponerla en las dos a la vez sería escribir la misma cosa dos
       veces para que la segunda gane. */
    margin: 0;
    border: 0;
    padding: 0;
    color: inherit;
    height: auto;
  }
  .pop.up { top: auto; bottom: calc(100% + var(--sx-s-2)); }
  .pop[hidden] { display: none; }
  :global([data-sx-theme='dark']) .pop,
  :global(.sx-dark) .pop { color-scheme: dark; }

  /* Con `popover`, `.wrap` deja de ser el ancestro contra el que `left: 0;
     right: 0` significan algo — `.pop` vive en la top layer. `.fx` cambia a
     `fixed`, con `right: auto` (si no, el `inset: 0` de la hoja de estilos de
     `popover` deja `right: 0` peleando contra el `left`/`width` de acá) y
     `left`/`width` fijados por `place()` en `--sx-pop-x`/`--sx-pop-w`. El
     margen de separación sigue siendo el mismo `var(--sx-s-2)` de siempre,
     ahora del lado de `margin` en vez de sumado dentro del `calc()` de `top`
     — igual que en Menu.
     `--sx-pop-y` YA trae la dirección resuelta desde `place()` — es
     `r.bottom` bajando, o `document.documentElement.clientHeight - r.top`
     subiendo — así que acá se usa tal cual, sin volver a restarla de nada:
     hacerlo de nuevo deshace la cuenta que JS ya hizo y deja la lista mal
     colocada cuando abre para arriba. */
  .pop.fx {
    position: fixed;
    left: var(--sx-pop-x, 0px);
    right: auto;
    width: var(--sx-pop-w, auto);
    top: calc(var(--sx-pop-y, 0px) + var(--sx-s-2));
    bottom: auto;
  }
  .pop.fx.up {
    top: auto;
    bottom: calc(var(--sx-pop-y, 0px) + var(--sx-s-2));
  }

  .count {
    margin: 0; padding: var(--sx-s-2) var(--sx-s-3);
    font-size: var(--sx-t-2xs); font-weight: var(--sx-w-semi);
    letter-spacing: .07em; text-transform: uppercase; color: var(--sx-ink-3);
    font-variant-numeric: tabular-nums lining-nums slashed-zero;
    /* Not a target: it is the only strip of the popup that is not an option,
       and a click landing on it would blur the field and close the list. */
    pointer-events: none;
  }
  /* Nothing found is a sentence, not a shout: it names what was searched for so
     the next keystroke is an informed one. */
  .count.none { text-transform: none; letter-spacing: 0; font-size: var(--sx-t-sm); font-weight: var(--sx-w-normal); color: var(--sx-ink-2); line-height: 1.5; }

  .list {
    list-style: none; margin: 0; padding: 0 var(--sx-s-1) var(--sx-s-1);
    max-height: min(46vh, calc(var(--sx-s-20) * 4)); overflow: auto;
    overscroll-behavior: contain;
  }
  .list li {
    display: flex; align-items: center; gap: var(--sx-s-3);
    padding: var(--sx-s-2) var(--sx-s-3);
    border-radius: var(--sx-r-1); cursor: pointer;
    font-size: var(--sx-t-sm); color: var(--sx-ink-2);
  }
  /* One highlight, driven by the keyboard, and the pointer feeds the same one.
     Two highlights — a hover and an active — is how somebody presses Enter and
     gets the row they were not looking at. */
  .list li.on { background: var(--sx-accent-soft); color: var(--sx-ink); }
  .list li.sel { color: var(--sx-ink); font-weight: var(--sx-w-medium); }
  .list li.off { color: var(--sx-ink-3); cursor: not-allowed; }

  .opt { display: flex; flex-direction: column; min-width: 0; flex: 1 1 auto; }
  .lb { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .lb b { font-weight: var(--sx-w-bold); color: var(--sx-ink); }
  .oh { font-size: var(--sx-t-xs); color: var(--sx-ink-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .om {
    flex: none; font-size: var(--sx-t-xs); color: var(--sx-ink-3);
    font-variant-numeric: tabular-nums lining-nums slashed-zero;
  }
  .tick { flex: none; width: 12px; height: 12px; color: var(--sx-accent); }

  .sr {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  @media (pointer: coarse) {
    .frame { min-height: var(--sx-touch); }
    input { font-size: 16px; }
    .icon { width: var(--sx-touch); height: var(--sx-touch); }
    .list li { min-height: var(--sx-touch); }
  }
</style>
