<script context="module">
  // The listbox, the status line and every option need ids that hang off the
  // field's own root, so this mints the root instead of borrowing Field's.
  let seq = 0;

  // ¿El foco llegó porque la persona navegó con Tab? Un foco programático —el
  // Dialog que enfoca su primer campo al abrirse, un `focus()` del producto—
  // no tiene que desplegar la lista sola: eso tapa el formulario apenas abre.
  // El foco por puntero no necesita esto: el `click` que le sigue abre la lista.
  let lastTabAt = -Infinity;
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') lastTabAt = performance.now();
    }, true);
  }
  const focusByTab = () => performance.now() - lastTabAt < 500;

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
  //   • IT SUGGESTS BEFORE YOU TYPE (v0.12). Con el foco la lista ya se abre con
  //     las primeras `maxVisible` opciones, y se va achicando letra a letra: el
  //     que busca «casa» ve artículos de referencia al entrar al campo, y al
  //     tipear C-A-S la lista se reduce. Es el pedido del producto, textual,
  //     para todo campo que busca un relacionado. `openOnFocus={false}` lo apaga.
  //   • IT CAN ASK THE SERVER (v0.12). `loader: async (query) => options[]`
  //     reemplaza a `options` como fuente de la lista: se llama con '' al abrir
  //     (así hay sugerencias de una) y con lo tecleado después de `debounce` ms.
  //     Una respuesta vieja que llega tarde se descarta —gana siempre la última
  //     pregunta—, y mientras vuela el renglón de arriba dice «Buscando…». Con
  //     `loader` el filtro local se apaga (el servidor ya filtró); `filter` lo
  //     fuerza. `options` sigue sirviendo para resolver la etiqueta del valor
  //     ya elegido cuando el servidor todavía no lo devolvió.
  //   • IT CAN CREATE IN PLACE (v0.12). Con `creatable`, cuando lo tecleado no
  //     coincide exacto con ninguna opción, la lista termina en «+ Crear «…»»
  //     —alcanzable con ↓ y Enter como cualquier fila—. Elegirla despacha
  //     `create` con `{ query, select }`: el padre crea el registro y o bien
  //     llama `select({ value, label })`, o bien pone `value` y suma la opción.
  //     La librería no crea nada: no tiene capa de datos.
  //
  //   <Combobox label="Equipo" bind:value={assetId} options={assets}
  //             noun="equipo" nounPlural="equipos"
  //             placeholder="Código o nombre…"
  //             hint="Los activos aparecen de primero." />
  //
  //   options = [{ value, label, hint?, meta? }]
  //
  //   <Combobox label="Proveedor" bind:value={proveedorId}
  //             loader={(q) => api.proveedores({ q, limit: 20 })}
  //             creatable on:create={async (e) => {
  //               const p = await api.crearProveedor(e.detail.query);
  //               e.detail.select({ value: p.id, label: p.nombre });
  //             }} />
  //
  // WHEN NOT TO USE IT: under about a dozen options — Select costs no typing.
  // For a value that does not exist yet, `allowFree` is the wrong shape: a
  // combobox that quietly accepts anything is a text box wearing a costume.
  // `creatable` is the right one — the new record is created on purpose, with a
  // row that says so. And never as a filter over a table that is already on screen —
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
  import { backOut } from 'svelte/easing';
  import Field from './Field.svelte';
  import { supportsPopover, syncPopover } from '../shell/toplayer.js';

  /** The selected option's value. '' ⇒ nothing chosen. */
  export let value = '';
  /** [{ value, label, hint?, meta?, disabled? }] */
  export let options = [];
  /** What the rows ARE, so the count reads «12 equipos», never «12 resultados». */
  export let noun = 'resultado';
  export let nounPlural = 'resultados';
  /** 'm' | 'f' — el género de `noun`: «Ningún equipo», pero «Ninguna categoría». */
  export let gender = 'm';
  export let placeholder = 'Buscar…';
  /** Accept text that is not an option. Read the note above before turning it on. */
  export let allowFree = false;
  /** Options are being fetched. Says so instead of showing an empty list. */
  export let loading = false;
  export let loadingLabel = 'Buscando…';
  /** Rows drawn at once. The count above the list always tells the whole truth. */
  export let maxVisible = 50;
  /** Abrir la lista con sugerencias apenas el campo recibe el foco. */
  export let openOnFocus = true;
  /** Al enfocar un campo que ya tiene un valor elegido, selecciona su texto:
   *  lo que se escriba reemplaza la etiqueta en vez de pegarse detrás
   *  («Costa Ricapana»). `selectOnFocus={false}` lo apaga. */
  export let selectOnFocus = true;
  /** La lupa de la izquierda. Apagala donde el campo es angosto (un prefijo
   *  telefónico) y la lupa no dice nada. */
  export let searchIcon = true;
  /** El botón ✕ que limpia el valor. Apagalo donde vaciar no tiene sentido. */
  export let clearable = true;
  /**
   * `async (query) => options[]`. Presente ⇒ la lista la trae el servidor: se
   * llama con '' al abrir y con lo tecleado tras `debounce` ms; una respuesta
   * que llega después de una más nueva se descarta.
   */
  export let loader = null;
  /** Milisegundos de espera entre la última tecla y la pregunta al `loader`. */
  export let debounce = 200;
  /** Filtrar localmente. Por defecto sí, salvo con `loader` (el servidor ya filtró). */
  export let filter = undefined;
  /** Ofrecer «+ Crear «…»» cuando lo tecleado no coincide con ninguna opción. */
  export let creatable = false;
  /** El texto de esa fila. */
  export let createLabel = (q) => `Crear «${q}»`;
  /** Lo que dice el renglón de arriba si el `loader` falla. */
  export let loadErrorLabel = 'No se pudo buscar. Seguí escribiendo para reintentar.';

  export let label = '';

  /** Nombre accesible sin rótulo a la vista (ver Field). */

  export let labelHidden = false;
  export let hint = '';
  /** Colapsa `hint` en un ⓘ junto a la etiqueta (tooltip) en vez de un párrafo
   *  bajo el campo — así los campos de una misma fila quedan a igual altura y
   *  alinean. Se reenvía tal cual a `Field`. */
  export let hintDot = false;
  export let error = '';
  export let fix = '';
  export let warning = '';
  export let required = false;
  export let optional = false;
  export let disabled = false;
  export let dense = false;
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

  const norm = (list) =>
    (Array.isArray(list) ? list : []).map((o) =>
      o !== null && typeof o === 'object' ? o : { value: o, label: String(o) }
    );

  // ── La fuente de la lista: `options`, o lo que devolvió el `loader` ─────
  let loaded = [];
  let fetching = false;
  let loadError = '';
  let reqSeq = 0;
  let debounceTimer;
  // A QUÉ PREGUNTA CONTESTA LA LISTA. `pendingFor`: lo que se va a preguntar o
  // ya se preguntó y no volvió (incluye la espera del debounce, cuando
  // `fetching` todavía es false). `loadedFor`: lo que contestan las opciones
  // de ahora. Sin esto la fila «Crear» se ofrecía mirando la lista de la
  // pregunta ANTERIOR —durante el debounce— y dejaba crear un duplicado de un
  // registro que la búsqueda nueva iba a traer.
  let pendingFor = null;
  let loadedFor = null;
  // La última opción elegida, guardada entera: con `loader` la lista cambia en
  // cada pregunta y el valor elegido puede no estar en la respuesta de ahora,
  // pero su etiqueta tiene que seguir en el campo.
  let picked = null;

  $: optionItems = norm(options);
  $: items = loader ? norm(loaded) : optionItems;
  $: selected =
    items.find((o) => o.value === value) ??
    optionItems.find((o) => o.value === value) ??
    (picked && picked.value === value ? picked : null);

  function load(qs, now = false) {
    if (!loader) return;
    clearTimeout(debounceTimer);
    pendingFor = qs;
    const run = () => {
      // Cada pregunta lleva su número; sólo la última escribe. Sin esto, «ca»
      // que tarda 400ms pisa a «casa» que tardó 90, y la lista muestra
      // resultados de algo que ya no está escrito.
      const my = ++reqSeq;
      fetching = true;
      loadError = '';
      Promise.resolve()
        .then(() => loader(qs))
        .then(
          (res) => {
            if (my !== reqSeq) return;
            loaded = Array.isArray(res) ? res : [];
            loadedFor = qs;
            pendingFor = null;
            fetching = false;
            if (open) tick().then(place);
          },
          () => {
            if (my !== reqSeq) return;
            loaded = [];
            // Sin respuesta no se sabe si ya existe: no se ofrece crear.
            loadedFor = null;
            pendingFor = null;
            fetching = false;
            loadError = loadErrorLabel;
          }
        );
    };
    if (now || !(debounce > 0)) run();
    else debounceTimer = setTimeout(run, debounce);
  }
  onDestroy(() => {
    clearTimeout(debounceTimer);
    reqSeq++; // lo que esté en vuelo ya no tiene a quién escribirle
  });

  // Un valor que cambia desde afuera (el padre lo puso, o `create` terminó y
  // eligió el registro nuevo) devuelve el campo a mostrar la etiqueta elegida.
  // Con `allowFree` no: ahí el valor ES lo tecleado y cambia en cada tecla.
  let lastValue = value;
  $: if (value !== lastValue) {
    lastValue = value;
    if (!allowFree) touched = false;
  }

  // The box shows the chosen label until somebody starts typing over it.
  $: if (!touched) query = selected ? selected.label : allowFree ? (value ?? '') : '';

  // `$:` and not `const`: these close over `query`, `items` and `maxVisible`, and
  // a plain helper would be invisible to the statements that call it — the
  // classic legacy trap, and the reason three lists in this ecosystem kept
  // showing the previous keystroke's results.
  $: q = touched ? fold(query) : '';
  $: doFilter = filter ?? !loader;
  $: hits = q && doFilter
    ? items.filter((o) => fold(o.label).includes(q) || fold(o.value).includes(q) || fold(o.hint).includes(q))
    : items;
  $: shown = hits.slice(0, maxVisible);

  // La fila de crear: sólo con algo tecleado que no sea, plegado, EXACTAMENTE
  // una opción que ya existe — «Casa» con «casa» en la lista es elegirla, no
  // crear un duplicado. Con `loader`, sólo contra la respuesta a ESTO que está
  // escrito: mientras hay una pregunta pendiente —en vuelo o todavía en el
  // debounce— no se ofrece, porque la respuesta que viene puede traer justo
  // ese registro.
  $: exact = !!q && items.some((o) => fold(o.label) === q);
  $: fresh = !loader || (pendingFor === null && loadedFor !== null && fold(loadedFor) === q);
  $: showCreate = creatable && touched && !!q && !exact && fresh;
  // Las filas que el teclado recorre: las opciones y, al final, la de crear.
  $: navCount = shown.length + (showCreate ? 1 : 0);
  $: busy = loading || fetching;

  $: countWord = hits.length === 1 ? noun : nounPlural;
  $: countLine = busy
    ? loadingLabel
    : loadError
      ? loadError
      : hits.length === 0
      ? q
        ? `${gender === 'f' ? 'Ninguna' : 'Ningún'} ${noun} coincide con «${query}».`
        : `No hay ${nounPlural} para elegir.`
      : `${hits.length} ${countWord}${hits.length > shown.length ? ` · se muestran ${shown.length}` : ''}`;

  // Only while the list is open: a live region that describes a closed list is
  // a live region that talks over the rest of the form.
  $: announce = open ? countLine : '';

  $: activeId =
    open && active >= 0 && active < shown.length
      ? `${fid}-o${active}`
      : open && showCreate && active === shown.length
        ? `${fid}-create`
        : undefined;

  async function openList(moveTo = null) {
    if (disabled || open) {
      if (moveTo !== null) move(moveTo);
      return;
    }
    open = true;
    // Con `loader`, abrir ES preguntar: con '' si todavía no se tecleó nada,
    // así las sugerencias aparecen al entrar al campo y no a la primera letra.
    if (loader) load(touched ? query : '', true);
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
    // Nunca más angosta que 14rem: en una celda chica de tabla la lista del
    // ancho del campo partía cada opción en dos renglones. Si así se sale por
    // la derecha, se corre hacia la izquierda sin pasar del borde.
    const vw = document.documentElement.clientWidth;
    const w = Math.min(Math.max(r.width, 224), vw - 16);
    const x = Math.max(8, Math.min(r.left, vw - 8 - w));
    popEl.style.setProperty('--sx-pop-x', `${x}px`);
    popEl.style.setProperty('--sx-pop-w', `${w}px`);
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

  // Clic afuera, la misma red que Select. Hoy el `focusout` de `.wrap`
  // alcanza —el input siempre tiene el foco cuando la lista está abierta, y
  // un clic afuera lo saca en todos los navegadores—, pero si algún día la
  // lista abre sin foco (un navegador que no enfoca, un `openList()` desde
  // afuera) no queda flotando en la top layer. `composedPath()` por el
  // shadow root de los Cores (ver Select).
  function onDocPointer(e) {
    if (!open) return;
    const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
    const hit = (node) => !!node && (path.length ? path.includes(node) : node.contains(e.target));
    if (hit(wrapEl) || hit(popEl)) return;
    close();
  }
  $: if (typeof document !== 'undefined') {
    document.removeEventListener('pointerdown', onDocPointer, true);
    if (open) document.addEventListener('pointerdown', onDocPointer, true);
  }
  onDestroy(() => {
    if (typeof document !== 'undefined') document.removeEventListener('pointerdown', onDocPointer, true);
  });

  const clamp = (i) => (navCount === 0 ? -1 : (i + navCount) % navCount);

  function move(i) {
    active = clamp(i);
    scrollActive();
  }

  async function scrollActive() {
    await tick();
    listEl?.querySelector('[data-on="1"]')?.scrollIntoView({ block: 'nearest' });
  }

  // Devolver el foco al campo después de elegir no tiene que volver a abrir la
  // lista (`openOnFocus`): esa vuelta es de la librería, no de la persona.
  let quiet = false;
  function refocus() {
    quiet = true;
    inputEl?.focus();
    quiet = false;
  }

  function choose(o) {
    if (!o || o.disabled) return;
    picked = o;
    value = o.value;
    lastValue = value;
    touched = false;
    query = o.label;
    open = false;
    active = -1;
    dispatch('change', o);
    refocus();
  }

  // «+ Crear «…»». La librería no crea nada: le pasa al padre lo tecleado y
  // una forma de elegir el registro nuevo en cuanto exista.
  function create() {
    const text = query.trim();
    if (!text) return;
    open = false;
    active = -1;
    dispatch('create', {
      query: text,
      select: (o) => {
        if (o === null || o === undefined) return;
        choose(typeof o === 'object' ? o : { value: o, label: String(o) });
      }
    });
  }

  function onFocus() {
    if (openOnFocus && !quiet && focusByTab()) openList();
    // En el cuadro siguiente: un foco por clic coloca el cursor en el mouseup,
    // después de este evento, y deshace una selección hecha acá.
    if (selectOnFocus && hasValue) {
      requestAnimationFrame(() => {
        // `getRootNode()`: dentro del shadow root de un core, `document.activeElement`
        // es el host, nunca este input.
        if (inputEl && inputEl.getRootNode().activeElement === inputEl && inputEl.value) inputEl.select();
      });
    }
  }

  function clear() {
    value = '';
    query = '';
    touched = true;
    picked = null;
    dispatch('change', null);
    refocus();
    if (open) load('', true);
    else openList();
  }

  function onInput(e) {
    touched = true;
    query = e.currentTarget.value;
    active = -1;
    if (!open) openList();
    else {
      place();
      load(query);
    }
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
        open ? move(active - 1) : openList(navCount - 1);
        break;
      case 'Home':
        if (open) { e.preventDefault(); move(0); }
        break;
      case 'End':
        if (open) { e.preventDefault(); move(navCount - 1); }
        break;
      case 'Enter':
        if (open && showCreate && active === shown.length) { e.preventDefault(); create(); }
        else if (open && active >= 0) { e.preventDefault(); choose(shown[active]); }
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

  // The × swells in and fades out instead of blinking (same as Input's).
  // Script transitions do not hear the stylesheet's reduced-motion block.
  const still = () =>
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function popIn() {
    if (still()) return { duration: 0 };
    return { duration: 260, easing: backOut, css: (t) => `opacity: ${Math.min(1, t * 1.5)}; transform: scale(${0.5 + 0.5 * t})` };
  }
  function fadeOut() {
    if (still()) return { duration: 0 };
    return { duration: 110, css: (t) => `opacity: ${t}; transform: scale(${0.7 + 0.3 * t})` };
  }
</script>

<svelte:window on:resize={() => open && place()} />

<Field
  {label} {labelHidden} {hint} {hintDot} {error} {fix} {warning} {required} {optional} {disabled} {dense}
  id={fid} {origin} {originValue} {changed}
  frame={false}
  on:revert
  let:describedBy
  let:invalid
>
  <div class="wrap" bind:this={wrapEl} on:focusout={onFocusOut}>
    <div class="frame" class:invalid class:disabled class:dense>
      {#if searchIcon}
        <span class="lead" aria-hidden="true">
          <svg viewBox="0 0 14 14"><circle cx="6" cy="6" r="4.2" fill="none" stroke="currentColor" stroke-width="1.7" /><path d="M9.2 9.2 12.4 12.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" /></svg>
        </span>
      {/if}

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
        aria-busy={busy || undefined}
        required={required || undefined}
        on:input={onInput}
        on:keydown={onKey}
        on:focus={onFocus}
        on:focus
        on:click={() => openList()}
      />

      {#if clearable && hasValue && !disabled}
        <button type="button" class="icon" in:popIn out:fadeOut on:click={clear} aria-label={`Limpiar ${label || 'la búsqueda'}`}>
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
      <p class="count" class:none={!busy && (hits.length === 0 || !!loadError)}>{countLine}</p>
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
        {#if showCreate}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <li
            id={`${fid}-create`}
            role="option"
            aria-selected="false"
            class="create"
            data-on={active === shown.length ? '1' : '0'}
            class:on={active === shown.length}
            on:click={create}
            on:mousemove={() => (active = shown.length)}
          >
            <svg class="plus" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1.5v9M1.5 6h9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
            <span class="lb">{createLabel(query.trim())}</span>
          </li>
        {/if}
      </ul>
      {#if $$slots.foot}
        <!-- Lo que el producto quiera al pie de la lista: un «Ver todos», una
             búsqueda avanzada. Recibe lo tecleado. -->
        <div class="pfoot"><slot name="foot" {query} /></div>
      {/if}
    </div>

    <span class="sr" role="status">{announce}</span>
  </div>

  <slot name="action" slot="action" />
</Field>

<style>
  .wrap { position: relative; display: block; }

  /* The same box Field draws, redeclared here because the popup has to be
     positioned against it and a component cannot reach into another one's
     scoped styles. The duplication is the price of surviving a shadow root.
     COPIA LITERAL de la caja de Field.svelte (v0.12: filo suave, halo del
     acento al foco) — ver ahí el porqué de cada línea. Si se toca una, se
     tocan las tres (Field, Combobox, DatePicker). */
  .frame {
    box-sizing: border-box;
    display: flex; align-items: stretch; gap: var(--sx-s-2);
    min-height: var(--sx-s-10);
    padding: var(--sx-s-2) var(--sx-s-3);
    background: var(--sx-field);
    border: 1px solid var(--sx-field-edge, var(--sx-edge));
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-field), 0 0 0 0 transparent, 0 0 0 0 transparent;
    outline: none;
    transition: border-color 200ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1)),
                box-shadow 240ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1)),
                background 200ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1));
  }
  .frame:hover:not(.disabled) { border-color: var(--sx-edge); }
  .frame:focus-within {
    border-color: var(--sx-focus, var(--sx-ink));
    box-shadow: var(--sx-e-field),
                0 0 0 1px var(--sx-focus, var(--sx-ink)),
                0 0 0 4px var(--sx-focus-halo, transparent);
  }
  .frame.invalid {
    border-color: var(--sx-critical);
    box-shadow: var(--sx-e-field), 0 0 0 1px var(--sx-critical), 0 0 0 0 transparent;
  }
  .frame.invalid:focus-within {
    box-shadow: var(--sx-e-field),
                0 0 0 1px var(--sx-critical),
                0 0 0 4px color-mix(in srgb, var(--sx-critical) 20%, transparent);
  }
  .frame.disabled { background: var(--sx-sunk); border-color: var(--sx-edge); box-shadow: none; }
  @media (forced-colors: active) {
    .frame:focus-within { outline: 2px solid Highlight; outline-offset: 2px; }
  }

  /* El peldaño COMPACTO. El Combobox dibuja su propio marco (frame={false} en
     Field, porque el popup se ancla contra él), así que la regla dense de
     Field.svelte no lo alcanza: hay que repetir aquí el mismo salto s-10 -> s-8.
     Sin esto un Combobox denso medía ~40px y desalineaba cualquier fila que lo
     pusiera junto a un Input/Select/NumberInput denso (~32px). */
  .frame.dense { min-height: var(--sx-s-8); padding: var(--sx-s-1) var(--sx-s-2); }
  .frame.dense input { font-size: var(--sx-t-sm); line-height: 1.35; }
  /* El botón de acción (limpiar/desplegar) mide --sx-s-6 (24px): dentro de un
     marco denso de 32px empujaría la altura a 34 y la fila volvería a
     desalinearse. En denso baja a --sx-s-5 (20px) — en puntero grueso el @media
     de abajo lo devuelve a --sx-touch, así que el objetivo táctil no se toca. */
  .frame.dense .icon { width: var(--sx-s-5); height: var(--sx-s-5); }

  input {
    flex: 1 1 auto; min-width: 0; width: 100%;
    margin: 0; padding: 0; border: 0; background: none; outline: none;
    font: inherit; font-size: var(--sx-t-md); line-height: 1.45; color: inherit;
  }
  input::placeholder { color: var(--sx-ink-placeholder, var(--sx-ink-3)); opacity: 1; }
  input:disabled { cursor: not-allowed; color: var(--sx-ink-3); -webkit-text-fill-color: var(--sx-ink-3); opacity: 1; }

  .lead { display: inline-flex; align-items: center; flex: none; color: var(--sx-ink-3); }
  .lead svg { width: 15px; height: 15px; }

  .icon {
    display: inline-flex; align-items: center; justify-content: center; flex: none;
    align-self: center; width: var(--sx-s-6); height: var(--sx-s-6);
    padding: 0; border: 0; border-radius: var(--sx-r-pill);
    background: none; color: var(--sx-ink-3); cursor: pointer;
    /* The chevron's turn glides and eases into place — a direction changing,
       not a glyph being swapped. The press rides `scale`, apart from it. */
    transition: background var(--sx-fast) var(--sx-ease), color var(--sx-fast) var(--sx-ease),
                transform 300ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1)),
                scale 380ms var(--sx-ease-spring, cubic-bezier(.34, 1.56, .64, 1));
  }
  /* Mismo botón redondo (--sx-r-pill) que el de limpiar de Input/SearchField:
     se ilumina bajo el cursor, no se hunde. */
  .icon:hover:not(:disabled) { background: var(--sx-accent-soft); color: var(--sx-ink); }
  .icon:disabled { cursor: not-allowed; opacity: .5; }
  .icon svg { width: 14px; height: 14px; }
  .chev.up { transform: rotate(180deg); }
  .icon:active:not(:disabled) {
    scale: .86;
    transition: background var(--sx-fast) var(--sx-ease), color var(--sx-fast) var(--sx-ease),
                transform 300ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1)),
                scale 90ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1));
  }

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
    /* THE LIST COMES TO THE FIELD. It unfolds from the edge it hangs off — a
       touch smaller, a few pixels back toward the box, transparent — and
       settles. A keyframe, not a transition: both ways of hiding this list
       (`hidden` and a closed `popover`) are `display: none`, and a keyframe
       restarts every time an element comes back from that, while a
       transition has no «before» to start from. No `display` is declared
       here — it would beat the popover sheet's `display: none`. */
    transform-origin: top center;
    animation: sx-cb-in 220ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1));
  }
  .pop.up { top: auto; bottom: calc(100% + var(--sx-s-2)); }
  .pop.up { transform-origin: bottom center; animation-name: sx-cb-in-up; }
  @keyframes sx-cb-in { from { opacity: 0; transform: translateY(-4px) scale(.96); } }
  @keyframes sx-cb-in-up { from { opacity: 0; transform: translateY(4px) scale(.96); } }
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
  /* Leaving, quicker than arriving. Only where the engine can keep a closing
     popover IN THE TOP LAYER until the fade ends (`overlay`, allow-discrete):
     an engine that could hold `display` but not `overlay` would drop the list
     out of the top layer mid-fade, into whatever transformed ancestor it sits
     in — the very bug `popover` was brought in to fix. Elsewhere the list
     closes in one frame, as it always did. It stops taking clicks the instant
     it starts to go. */
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
    /* The highlight follows the arrow keys with a short fade rather than a
       blink — short, because the keyboard can outrun anything longer. */
    transition: background-color 120ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1)),
                color 120ms var(--sx-ease-out, cubic-bezier(.16, 1, .3, 1));
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

  /* La fila de crear: la última, separada por una raya de ambiente y en la
     tinta principal, con su «+» — una acción, no una opción más. */
  .list li.create {
    margin-top: var(--sx-s-1);
    color: var(--sx-ink); font-weight: var(--sx-w-medium);
    box-shadow: 0 -1px 0 var(--sx-line);
    border-radius: 0 0 var(--sx-r-1) var(--sx-r-1);
  }
  .list li.create:first-child { margin-top: 0; box-shadow: none; border-radius: var(--sx-r-1); }
  .list li.create.on { border-radius: var(--sx-r-1); box-shadow: none; }
  .plus {
    flex: none; width: 12px; height: 12px; color: var(--sx-accent);
    padding: 4px; box-sizing: content-box;
    border-radius: var(--sx-r-pill); background: var(--sx-accent-soft);
  }
  .pfoot {
    padding: var(--sx-s-2) var(--sx-s-3);
    background: var(--sx-sunk);
    font-size: var(--sx-t-sm);
  }

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

  /* The list is simply there, then simply gone; the chevron still turns (a
     state, not a flourish) but does not travel. */
  @media (prefers-reduced-motion: reduce) {
    .frame, .icon, .icon:active:not(:disabled), .list li, .pop.fx { transition: none; }
    .pop, .pop.up { animation: none; }
    .icon:active:not(:disabled) { scale: none; }
  }
</style>
