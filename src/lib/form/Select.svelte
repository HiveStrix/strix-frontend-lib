<script context="module">
  // Ids for the listbox and its options hang off the field's own root, so the
  // root is minted here instead of borrowed from Field.
  let seq = 0;

  // Typeahead matches the way people type: without tildes. «electrica» finds
  // «Batidora eléctrica», the same fold Combobox uses.
  const fold = (s) =>
    String(s ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
</script>

<script>
  // SELECT — a short, closed list, drawn by the system.
  //
  // HASTA LA v0.11 ERA EL <select> NATIVO, a propósito: en la tablet abría la
  // rueda de la plataforma y nadie tenía que reimplementar el tipeo anticipado
  // ni el Escape. El costo se vio en el escritorio, que es donde se trabaja
  // la mayor parte del día: el menú lo dibuja el sistema operativo —en macOS se
  // abre ENCIMA del campo, centrado en la opción elegida; en Windows es una
  // caja gris con otra tipografía— y en una interfaz de arcilla ese menú era
  // la única pieza de la pantalla que no era de la familia. El producto lo
  // pidió en esas palabras: «crear los dropdown apropiados, no dejarlo al
  // default de Mac o Windows… para todo el sistema».
  //
  // DESDE LA v0.12 LA LISTA ES NUESTRA: un botón con la caja de Field y un
  // `listbox` que flota en la TOP LAYER (`shell/toplayer.js`, el mismo
  // mecanismo de Combobox y DatePicker), así que un ancestro con
  // `overflow: hidden` no la recorta. Baja y sólo sube cuando no entra abajo.
  // Lo que el nativo regalaba se hizo a mano y está enumerado para que nadie
  // lo pierda en un cambio:
  //
  //   • Teclado del patrón «select-only combobox» (WAI-ARIA APG): ↓ ↑ Enter y
  //     Espacio abren; con la lista abierta ↓ ↑ mueven, Inicio y Fin van a las
  //     puntas, RePág y AvPág saltan de a diez, Enter y Espacio eligen, Tab y
  //     Escape cierran sin elegir (Escape se detiene acá: un Select dentro de
  //     un Dialog no cierra los dos). Alt+↑ elige y cierra.
  //   • Tipeo anticipado: escribir «ca» salta a la primera opción que empieza
  //     así, sin tildes; repetir la misma letra recorre las que empiezan con ella.
  //   • El foco nunca sale del botón: se mueve `aria-activedescendant`.
  //   • Los grupos (`group`) son `role="group"` con su nombre; las opciones
  //     apagadas se saltan con el teclado y no se eligen con el puntero.
  //   • El marcador de posición sigue siendo una puerta de una sola vía: se ve
  //     en el campo mientras `value === ''`, pero no es una opción de la lista.
  //   • `name` sigue llegando a un <form> nativo, por un <input type="hidden">.
  //   • `on:change` sigue siendo un evento del DOM con `currentTarget.value`
  //     (la cadena, como la daba el <select>) y además trae `detail` con el
  //     valor tal cual, sin pasarlo a cadena. Un consumidor viejo que leía
  //     `e.currentTarget.value` —DivisionPicker, sin ir más lejos— no cambia.
  //
  // Lo que se pierde: en un teléfono ya no abre la rueda de la plataforma. Un
  // formulario de campo que la prefiera pide `native` y recibe el <select> de
  // siempre, con el mismo marco.
  //
  //   <Select label="Familia" bind:value={familyId} options={families}
  //           placeholder="Elegí una familia"
  //           hint="Decide qué actividades y qué plantillas le aplican." />
  //
  //   options = [{ value, label, hint?, disabled?, group? }]  ·  or plain strings
  //
  // WHEN NOT TO USE IT: over about a dozen options — a list of 300 machines is a
  // list nobody can find anything in, and that is Combobox. Under about five
  // options that a person has to WEIGH against each other, a select hides the
  // comparison behind a click: use Radio, or ChoiceCards if the choice deserves
  // a sentence each. And never for something that is really a yes/no — that is
  // a Checkbox or a Switch.
  import { createEventDispatcher, tick, onDestroy } from 'svelte';
  import Field from './Field.svelte';
  import { supportsPopover, syncPopover } from '../shell/toplayer.js';

  export let value = '';
  /** [{ value, label, hint?, disabled?, group? }] or ['A', 'B'] */
  export let options = [];
  /** The unchosen state, as a word. Shown while `value === ''`; never an option. */
  export let placeholder = '';

  export let label = '';

  /** Nombre accesible sin rótulo a la vista (ver Field). */
  export let labelHidden = false;
  export let hint = '';
  /** Colapsa `hint` en un ⓘ junto a la etiqueta (tooltip) en vez de un párrafo
   *  bajo el campo — así los campos de una fila alinean. Se reenvía a `Field`. */
  export let hintDot = false;
  export let error = '';
  export let fix = '';
  export let warning = '';
  export let required = false;
  export let optional = false;
  export let disabled = false;
  export let dense = false;
  /** Llega a un <form> nativo por un <input type="hidden">. */
  export let name = undefined;
  export let id = '';
  export let origin = '';
  export let originValue = '';
  export let changed = false;
  /**
   * true ⇒ el <select> de la plataforma, como hasta la v0.11: en un teléfono
   * abre la rueda del sistema. Mismo marco, mismos eventos. Para un formulario
   * que se llena con el pulgar y quiere esa rueda a propósito.
   */
  export let native = false;

  const dispatch = createEventDispatcher();
  const n = ++seq;
  $: fid = id || `sxsel${n}`;

  let el;
  let hiddenEl;
  let popEl;
  let listEl;
  let open = false;
  let active = -1;
  let dropUp = false;

  export const focus = () => el?.focus();

  $: items = (options ?? []).map((o) =>
    o !== null && typeof o === 'object' ? o : { value: o, label: String(o) }
  );

  // Grouped only when somebody asked for groups: a group with one child per
  // group is worse than no groups at all.
  $: grouped = items.some((o) => o.group);
  $: groups = (() => {
    if (!grouped) return [];
    const m = new Map();
    for (const o of items) {
      const g = o.group || '';
      if (!m.has(g)) m.set(g, []);
      m.get(g).push(o);
    }
    return [...m];
  })();

  // The keyboard walks the list in the order it is DRAWN, which with groups is
  // group by group — not the order `options` arrived in. Each row carries its
  // position in that walk.
  $: flat = (grouped ? groups.flatMap(([, list]) => list) : items).map((o, i) => ({ ...o, i }));
  $: sections = grouped
    ? (() => {
        let k = 0;
        return groups.map(([g, list]) => [g, list.map(() => flat[k++])]);
      })()
    : [];

  $: current = value ?? '';
  $: selected = flat.find((o) => o.value === current) ?? null;
  $: empty = !selected;
  $: shown = selected ? selected.label : placeholder;
  $: activeId = open && active >= 0 && active < flat.length ? `${fid}-o${active}` : undefined;

  const enabled = (i) => i >= 0 && i < flat.length && !flat[i].disabled;

  /** The next enabled row from `from` going `dir`, or `from` if there is none.
   *  No wrapping, like the platform's own list. */
  function step(from, dir, by = 1) {
    let i = from;
    let found = from;
    for (let k = 0; k < by; k++) {
      let j = i + dir;
      while (j >= 0 && j < flat.length && flat[j].disabled) j += dir;
      if (j < 0 || j >= flat.length) break;
      i = j;
      found = j;
    }
    return enabled(found) ? found : firstEnabled(dir > 0 ? 1 : -1);
  }
  function firstEnabled(dir = 1) {
    if (dir > 0) { for (let i = 0; i < flat.length; i++) if (!flat[i].disabled) return i; }
    else { for (let i = flat.length - 1; i >= 0; i--) if (!flat[i].disabled) return i; }
    return -1;
  }

  async function openList(at = null) {
    if (disabled || native) return;
    if (!open) {
      open = true;
      active = at ?? (selected && !selected.disabled ? selected.i : firstEnabled());
      await tick();
      place();
    } else if (at !== null) {
      active = at;
    }
    scrollActive();
  }

  function close() {
    if (!open) return;
    open = false;
    active = -1;
  }

  async function scrollActive() {
    await tick();
    listEl?.querySelector('[data-on="1"]')?.scrollIntoView({ block: 'nearest' });
  }

  function choose(o) {
    if (!o || o.disabled) return;
    close();
    const same = o.value === current;
    value = o.value;
    if (same) return;
    // The change goes out as a DOM event from the hidden input, so
    // `e.currentTarget.value` still reads what the <select> used to give (a
    // string) — and `detail` carries the value as it is.
    if (hiddenEl) {
      hiddenEl.value = String(o.value ?? '');
      hiddenEl.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: o.value }));
    }
  }

  // ── Tipeo anticipado ────────────────────────────────────────────────────
  let typed = '';
  let typedTimer;
  function typeahead(ch) {
    clearTimeout(typedTimer);
    typedTimer = setTimeout(() => (typed = ''), 600);
    typed += fold(ch);
    // «aaa» is «cycle through the a's», not «find a word that starts with aaa».
    const cycling = typed.length > 1 && [...typed].every((c) => c === typed[0]);
    const needle = cycling ? typed[0] : typed;
    const from = open ? active : selected ? selected.i : -1;
    const start = cycling || typed.length === 1 ? from + 1 : Math.max(from, 0);
    for (let k = 0; k < flat.length; k++) {
      const i = (start + k) % flat.length;
      if (!flat[i].disabled && fold(flat[i].label).trimStart().startsWith(needle)) {
        openList(i);
        return;
      }
    }
  }
  onDestroy(() => clearTimeout(typedTimer));

  function onKey(e) {
    if (disabled) return;
    const k = e.key;
    if (!open) {
      if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'Enter' || k === ' ') {
        // preventDefault on keydown also keeps the button from turning the same
        // key into a click — which would toggle the list straight back shut.
        e.preventDefault();
        openList();
      } else if (k === 'Home') { e.preventDefault(); openList(firstEnabled(1)); }
      else if (k === 'End') { e.preventDefault(); openList(firstEnabled(-1)); }
      else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); typeahead(k); }
      return;
    }
    switch (k) {
      case 'ArrowDown': e.preventDefault(); active = step(active, 1); scrollActive(); break;
      case 'ArrowUp':
        e.preventDefault();
        if (e.altKey) { choose(flat[active]); break; }
        active = step(active, -1); scrollActive();
        break;
      case 'PageDown': e.preventDefault(); active = step(active, 1, 10); scrollActive(); break;
      case 'PageUp': e.preventDefault(); active = step(active, -1, 10); scrollActive(); break;
      case 'Home': e.preventDefault(); active = firstEnabled(1); scrollActive(); break;
      case 'End': e.preventDefault(); active = firstEnabled(-1); scrollActive(); break;
      case 'Enter': e.preventDefault(); choose(flat[active]); break;
      case ' ':
        e.preventDefault();
        // A space in the middle of a typed word is part of the word.
        if (typed) typeahead(' ');
        else choose(flat[active]);
        break;
      case 'Escape':
        // One level per press, and never past this component.
        e.preventDefault();
        e.stopPropagation();
        close();
        break;
      case 'Tab':
        close();
        break;
      default:
        if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); typeahead(k); }
    }
  }

  // ── Dónde vive la lista (el mismo contrato que Combobox) ────────────────
  // La lista se ancla a la caja que dibuja Field — el padre del botón —, así
  // que se mide ésa y no el botón. Con `popover` las coordenadas se escriben a
  // mano (`position: fixed` en la top layer); sin él, `.pop` cuelga de la caja
  // con `position: absolute`, porque la caja de Field ya es `relative`.
  function place() {
    const box = el?.parentElement;
    if (!box || typeof window === 'undefined') return;
    const r = box.getBoundingClientRect();
    const vh = document.documentElement.clientHeight;
    // El alto REAL de la lista —ya está dibujada cuando esto corre—, con el
    // tope de su propio max-height.
    const want = Math.min(popEl?.scrollHeight || 320, 320) + 8;
    dropUp = r.bottom + want > vh && r.top > vh - r.bottom;
    if (!supportsPopover || !popEl) return;
    popEl.style.setProperty('--sx-pop-x', `${r.left}px`);
    popEl.style.setProperty('--sx-pop-w', `${r.width}px`);
    popEl.style.setProperty('--sx-pop-y', `${dropUp ? vh - r.top : r.bottom}px`);
  }

  $: syncPopover(popEl, open && !native);

  function onScroll() { if (open) place(); }
  $: if (typeof document !== 'undefined' && supportsPopover) {
    document.removeEventListener('scroll', onScroll, true);
    if (open) document.addEventListener('scroll', onScroll, { capture: true, passive: true });
  }
  onDestroy(() => {
    if (typeof document !== 'undefined') document.removeEventListener('scroll', onScroll, true);
  });

  // An option list that lost its active row (options changed under it) goes
  // back to a row that exists.
  $: if (open && active >= flat.length) active = firstEnabled();
</script>

<svelte:window on:resize={() => open && place()} />

<Field
  {label} {labelHidden} {hint} {hintDot} {error} {fix} {warning} {required} {optional} {disabled} {dense}
  id={fid} {origin} {originValue} {changed}
  on:revert
  let:id={boxId}
  let:labelId
  let:describedBy
  let:invalid
>
  {#if native}
    <select
      bind:this={el}
      id={boxId}
      {name}
      {disabled}
      bind:value
      class="native"
      class:empty={value === '' || value === null || value === undefined}
      required={required || undefined}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      on:change
      on:focus
      on:blur
    >
      {#if placeholder}
        <option value="" disabled>{placeholder}</option>
      {/if}
      {#if grouped}
        {#each groups as [gname, list] (gname)}
          <optgroup label={gname || 'Otros'}>
            {#each list as o (o.value)}
              <option value={o.value} disabled={o.disabled}>{o.label}</option>
            {/each}
          </optgroup>
        {/each}
      {:else}
        {#each items as o (o.value)}
          <option value={o.value} disabled={o.disabled}>{o.label}</option>
        {/each}
      {/if}
    </select>

    <span class="chev" aria-hidden="true">
      <svg viewBox="0 0 12 12"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </span>
  {:else}
    <!-- A <button> and not a focusable <div>: the <label for> of Field still
         names it and still reaches it with a click, and `disabled` is the real
         attribute. The role is the APG's select-only combobox. -->
    <button
      bind:this={el}
      type="button"
      id={boxId}
      class="trig"
      class:dense
      class:empty
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={`${fid}-list`}
      aria-activedescendant={activeId}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      aria-required={required || undefined}
      {disabled}
      on:click={() => (open ? close() : openList())}
      on:keydown={onKey}
      on:blur={close}
      on:focus
      on:blur
    >
      <span class="val">{shown || ' '}</span>
      <span class="chev" class:up={open} aria-hidden="true">
        <svg viewBox="0 0 12 12"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </span>
    </button>

    <!-- The value, for a native <form>, and the node the change event is
         dispatched from (see `choose`). -->
    <input type="hidden" bind:this={hiddenEl} {name} value={current === null ? '' : String(current)} on:change />

    <div
      class="pop"
      class:up={dropUp}
      class:fx={supportsPopover}
      hidden={supportsPopover ? false : !open}
      popover={supportsPopover ? 'manual' : undefined}
      bind:this={popEl}
    >
      <!-- Pointer down is swallowed so focus never leaves the button: without
           it the button blurs, the list closes, and the click lands on nothing. -->
      <div
        class="list"
        bind:this={listEl}
        id={`${fid}-list`}
        role="listbox"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : placeholder || 'Opciones'}
        tabindex="-1"
        on:pointerdown|preventDefault
        on:mousedown|preventDefault
      >
        {#if flat.length === 0}
          <p class="none">No hay opciones para elegir.</p>
        {:else if grouped}
          {#each sections as [gname, list], gi (gname)}
            <div class="grp" role="group" aria-labelledby={`${fid}-g${gi}`}>
              <p class="gh" id={`${fid}-g${gi}`}>{gname || 'Otros'}</p>
              {#each list as o (o.i)}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <div
                  id={`${fid}-o${o.i}`}
                  role="option"
                  class="opt"
                  aria-selected={o.value === current}
                  aria-disabled={o.disabled || undefined}
                  data-on={o.i === active ? '1' : '0'}
                  class:on={o.i === active}
                  class:sel={o.value === current}
                  class:off={o.disabled}
                  on:click={() => choose(o)}
                  on:mousemove={() => { if (!o.disabled) active = o.i; }}
                >
                  <span class="txt">
                    <span class="lb">{o.label}</span>
                    {#if o.hint}<span class="oh">{o.hint}</span>{/if}
                  </span>
                  {#if o.value === current}
                    <svg class="tick" viewBox="0 0 12 12" aria-hidden="true"><path d="M1 6.5 4.5 10 11 2.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                  {/if}
                </div>
              {/each}
            </div>
          {/each}
        {:else}
          {#each flat as o (o.i)}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
              id={`${fid}-o${o.i}`}
              role="option"
              class="opt"
              aria-selected={o.value === current}
              aria-disabled={o.disabled || undefined}
              data-on={o.i === active ? '1' : '0'}
              class:on={o.i === active}
              class:sel={o.value === current}
              class:off={o.disabled}
              on:click={() => choose(o)}
              on:mousemove={() => { if (!o.disabled) active = o.i; }}
            >
              <span class="txt">
                <span class="lb">{o.label}</span>
                {#if o.hint}<span class="oh">{o.hint}</span>{/if}
              </span>
              {#if o.value === current}
                <svg class="tick" viewBox="0 0 12 12" aria-hidden="true"><path d="M1 6.5 4.5 10 11 2.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
              {/if}
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {/if}

  <slot name="action" slot="action" />
</Field>

<style>
  /* ── El disparador ───────────────────────────────────────────────────────
     La caja la dibuja Field (foco, error, apagado incluidos); el botón la
     llena entera —el margen negativo se come el relleno de la caja— para que
     cualquier punto de la caja abra la lista, no sólo el texto. */
  .trig {
    flex: 1 1 auto; min-width: 0;
    display: flex; align-items: center; gap: var(--sx-s-2);
    margin: calc(var(--sx-s-2) * -1) calc(var(--sx-s-3) * -1);
    padding: var(--sx-s-2) var(--sx-s-3);
    border: 0; border-radius: inherit; background: none; outline: none;
    font: inherit; font-size: var(--sx-t-md); line-height: 1.45; color: inherit;
    text-align: left; cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .trig.dense {
    margin: calc(var(--sx-s-1) * -1) calc(var(--sx-s-2) * -1);
    padding: var(--sx-s-1) var(--sx-s-2);
    font-size: var(--sx-t-sm); line-height: 1.35;
  }
  .trig:disabled { cursor: not-allowed; color: var(--sx-ink-3); }
  .val { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  /* Nothing chosen yet reads like a placeholder, the same way an empty text box
     does — with the placeholder's own ink, fainter than a chosen value. It is
     not an error and must not look like one. */
  .trig.empty .val { color: var(--sx-ink-placeholder, var(--sx-ink-3)); }

  .chev {
    display: inline-flex; align-items: center; flex: none; align-self: center;
    color: var(--sx-ink-3); pointer-events: none;
    transition: color 180ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1)),
                transform 300ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1)),
                translate 220ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1));
  }
  .chev svg { width: 13px; height: 13px; }
  /* The chevron turns with the list now that the list is ours and reports its
     own «open»: a direction changing, not a glyph being swapped. */
  .chev.up { transform: rotate(180deg); color: var(--sx-ink-2); }
  .trig:focus .chev { color: var(--sx-ink-2); }
  @media (hover: hover) {
    .trig:hover:not(:disabled) .chev { color: var(--sx-ink-2); translate: 0 1.5px; }
    .trig:hover:not(:disabled) .chev.up { translate: 0 -1.5px; }
  }

  /* ── native ───────────────────────────────────────────────────────────── */
  select.native {
    appearance: none; -webkit-appearance: none;
    cursor: pointer; text-overflow: ellipsis;
  }
  select.native:disabled { cursor: not-allowed; }
  select.native.empty { color: var(--sx-ink-placeholder, var(--sx-ink-3)); }
  select.native:focus + .chev { color: var(--sx-ink-2); }

  /* ── La lista ────────────────────────────────────────────────────────────
     La misma superficie flotante que la de Combobox: elevación, no contorno. */
  .pop {
    position: absolute; left: 0; right: 0; top: calc(100% + var(--sx-s-2));
    z-index: var(--sx-z-overlay);
    background: var(--sx-surface);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-3);
    overflow: hidden;
    /* Lo que la hoja de estilos de `popover` mete apenas el atributo está
       escrito (ver Combobox para el detalle). */
    margin: 0; border: 0; padding: 0; color: inherit; height: auto;
    text-align: left;
    font-size: var(--sx-t-sm); font-weight: var(--sx-w-normal); line-height: 1.45;
    transform-origin: top center;
    animation: sx-sel-in 220ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1));
  }
  .pop.up { top: auto; bottom: calc(100% + var(--sx-s-2)); transform-origin: bottom center; animation-name: sx-sel-in-up; }
  @keyframes sx-sel-in { from { opacity: 0; transform: translateY(-4px) scale(.96); } }
  @keyframes sx-sel-in-up { from { opacity: 0; transform: translateY(4px) scale(.96); } }
  .pop[hidden] { display: none; }
  :global([data-sx-theme='dark']) .pop,
  :global(.sx-dark) .pop { color-scheme: dark; }

  .pop.fx {
    position: fixed;
    left: var(--sx-pop-x, 0px);
    right: auto;
    width: var(--sx-pop-w, auto);
    top: calc(var(--sx-pop-y, 0px) + var(--sx-s-2));
    bottom: auto;
  }
  .pop.fx.up { top: auto; bottom: calc(var(--sx-pop-y, 0px) + var(--sx-s-2)); }
  @supports (overlay: auto) {
    .pop.fx {
      transition:
        opacity 120ms var(--sx-ease-in, cubic-bezier(.5, 0, .75, 0)),
        transform 120ms var(--sx-ease-in, cubic-bezier(.5, 0, .75, 0)),
        overlay 120ms allow-discrete,
        display 120ms allow-discrete;
    }
    .pop.fx:not(:popover-open) { opacity: 0; transform: translateY(-4px) scale(.97); pointer-events: none; }
    .pop.fx.up:not(:popover-open) { transform: translateY(4px) scale(.97); }
  }

  .list {
    margin: 0; padding: var(--sx-s-1);
    max-height: min(46vh, 320px); overflow: auto;
    overscroll-behavior: contain;
    outline: none;
  }
  .grp + .grp { margin-top: var(--sx-s-1); }
  .gh {
    margin: 0; padding: var(--sx-s-2) var(--sx-s-3) var(--sx-s-1);
    font-size: var(--sx-t-2xs); font-weight: var(--sx-w-semi);
    letter-spacing: .07em; text-transform: uppercase; color: var(--sx-ink-3);
  }
  .none { margin: 0; padding: var(--sx-s-2) var(--sx-s-3); color: var(--sx-ink-2); }

  .opt {
    display: flex; align-items: center; gap: var(--sx-s-3);
    padding: var(--sx-s-2) var(--sx-s-3);
    border-radius: var(--sx-r-1); cursor: pointer;
    color: var(--sx-ink-2);
    transition: background-color 120ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1)),
                color 120ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1));
  }
  /* One highlight, driven by the keyboard, and the pointer feeds the same one
     (see Combobox for why two highlights is a bug). */
  .opt.on { background: var(--sx-accent-soft); color: var(--sx-ink); }
  .opt.sel { color: var(--sx-ink); font-weight: var(--sx-w-medium); }
  .opt.off { color: var(--sx-ink-3); cursor: not-allowed; }
  .txt { display: flex; flex-direction: column; min-width: 0; flex: 1 1 auto; }
  .oh { font-size: var(--sx-t-xs); color: var(--sx-ink-3); font-weight: var(--sx-w-normal); }
  .tick { flex: none; width: 12px; height: 12px; color: var(--sx-accent); }

  @media (pointer: coarse) {
    .trig { font-size: 16px; }
    .opt { min-height: var(--sx-touch); }
  }

  @media (prefers-reduced-motion: reduce) {
    .chev, .opt, .pop.fx { transition: none; }
    .pop, .pop.up { animation: none; }
    .trig:hover:not(:disabled) .chev { translate: none; }
  }
</style>
