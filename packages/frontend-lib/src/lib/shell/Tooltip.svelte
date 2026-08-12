<script module>
  let uid = 0;
</script>

<script>
  // THE LABEL FOR THE CONTROL THAT COULD NOT KEEP ITS WORD.
  //
  // WHAT IT IS FOR, WHICH IS NARROWER THAN IT LOOKS
  //
  // A tooltip is a repair, not a feature. Every one of them is an admission that
  // something on screen is not saying what it is: an icon-only button in a dense
  // toolbar, a column head abbreviated to fit, a figure whose unit did not fit
  // beside it. Those are real and this component serves them well.
  //
  // What it must NEVER hold is anything a person has to read to do the job —
  // because on a tablet there is no hover, in a screen reader it arrives as an
  // afterthought if at all, and on a slow machine it arrives late. If the
  // sentence matters, it goes on the screen. That is what Well is for.
  //
  //   <Tooltip text="Exportar el libro filtrado a CSV">
  //     <button aria-label="Exportar CSV"><Glyph name="download" /></button>
  //   </Tooltip>
  //
  // HOW IT REACHES THE CONTROL IT DESCRIBES. The trigger is yours, not ours: you
  // pass a real <button> or <a> in the slot, and on mount the tip's id is put on
  // the first focusable node inside as `aria-describedby`. Doing it imperatively
  // looks like a trick and is the only honest option — an attribute cannot be
  // written onto slot content from out here, and the alternative (a wrapper that
  // takes the tabindex) would put a second, meaningless tab stop in front of
  // every control in the app. If there is no focusable node in the slot, no
  // description is attached and the tip is decoration: fix the slot, do not ship
  // a tooltip on a <span>.
  //
  // TOUCH. Hover does not exist there, so the tip is bound to FOCUS as well, and
  // a tap focuses a button. Pointer-driven showing is gated to `pointerType ===
  // 'mouse'` so a touch does not flash it open and shut on the way past.
  //
  // ESCAPE closes the tip and stops there — one level per press, so the sheet
  // behind it stays open.
  //
  // DÓNDE SE DIBUJA. Donde existe `popover` (Chrome 114+, Safari 17+, Firefox
  // 125+), `.tip` lleva `popover="manual"` y entra a la TOP LAYER, así que ni
  // un ancestro con `transform` la atrapa ni uno con `overflow: hidden` la
  // recorta. Pero el `.tip` NUNCA deja de estar montado — a diferencia de
  // Menu o Combobox, este nodo tiene que seguir en el DOM aunque no se vea,
  // porque `aria-describedby` lo referencia todo el tiempo (ver más arriba) y
  // la descripción accesible se computa igual esté visible o no. Por eso
  // `.tip` sobreescribe el `display: none` que la hoja de estilos de
  // `popover` le pondría cuando no está abierto, y sigue mostrándose y
  // ocultándose exactamente como antes, con `visibility`/`opacity` — `popover`
  // sólo decide si el nodo está en la top layer, no si se ve. La posición dejó
  // de ser relativa a `.wrap` (`position: absolute` contra un ancestro
  // posicionado) y pasó a coordenadas de viewport en `position: fixed`,
  // recalculadas en cada `scroll` y `resize` mientras el tip está mostrándose.
  // El `transform: translate…(-50%)` que centra cada colocación no cambió: es
  // relativo a la caja propia del `.tip`, no a su ancestro, así que seguía
  // sirviendo igual bajo `fixed`. Donde `popover` no existe, nada de esto
  // corre y el tip cae en el `position: absolute` de siempre.
  import { onMount } from 'svelte';
  import { supportsPopover, syncPopover } from './toplayer.js';

  /** The repair. One short line; a tooltip is not a paragraph. */
  export let text = '';
  /** top | bottom | left | right — where it goes relative to the trigger. */
  export let placement = 'top';
  /** Milliseconds before it appears on hover. Focus is always immediate. */
  export let delay = 140;

  const id = `sx-tip-${++uid}`;
  const FOCUSABLE =
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),' +
    'textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';

  let host;
  let tipEl;
  let shown = false;
  let timer = 0;

  // Everything binds to the CONTROL, not to the wrapper. Two reasons, and the
  // second is the real one: a hover region that is a layout span rather than the
  // button itself eventually disagrees with the button by a pixel — and a
  // wrapper carrying interaction handlers is a static element pretending to be
  // interactive, which is precisely the thing the a11y rules are right about.
  // If the slot holds nothing focusable, NOTHING is bound: no description, no
  // hover, no tip. That is the component refusing to paper over a control a
  // keyboard cannot reach.
  onMount(() => {
    const target = host?.querySelector(FOCUSABLE);
    if (!target || !text) return;
    const enter = (e) => onPointer(e);
    const leave = () => hide();
    const gotFocus = () => show(true);
    target.setAttribute('aria-describedby', id);
    target.addEventListener('pointerenter', enter);
    target.addEventListener('pointerleave', leave);
    target.addEventListener('focus', gotFocus);
    target.addEventListener('blur', leave);
    target.addEventListener('keydown', onKeydown);
    return () => {
      clearTimeout(timer);
      target.removeAttribute('aria-describedby');
      target.removeEventListener('pointerenter', enter);
      target.removeEventListener('pointerleave', leave);
      target.removeEventListener('focus', gotFocus);
      target.removeEventListener('blur', leave);
      target.removeEventListener('keydown', onKeydown);
      // Por si el componente se desmonta con el tip todavía mostrándose: la
      // reactividad de abajo no llega a correr una limpieza final propia.
      document.removeEventListener('scroll', onReposition, true);
      window.removeEventListener('resize', onReposition);
      // Idem para un cierre en pleno fade: sin esto, el `setTimeout`/listener
      // pendiente de `scheduleExit()` sobreviviría al componente.
      cancelPendingExit();
    };
  });

  function show(now = false) {
    if (!text) return;
    clearTimeout(timer);
    if (now || !delay) shown = true;
    else timer = setTimeout(() => (shown = true), delay);
  }

  function hide() {
    clearTimeout(timer);
    shown = false;
  }

  function onPointer(e) {
    // A touch fires pointerenter on press and pointerleave on release; letting
    // that through means every tap on the control blinks a tooltip at it.
    if (e.pointerType === 'mouse') show();
  }

  function onKeydown(e) {
    if (e.key !== 'Escape' || !shown) return;
    e.stopPropagation();
    hide();
  }

  $: place = ['top', 'bottom', 'left', 'right'].includes(placement) ? placement : 'top';

  // Escribe las dos custom properties que `.tip.fx` lee: `--sx-tip-a`, el
  // borde del que se separa (arriba/abajo/izquierda/derecha del disparador,
  // según `place`), y `--sx-tip-c`, el punto sobre el que centra —el
  // `transform: translate…(-50%)` hace el resto, igual que antes. `host` es
  // el `.wrap`, no el control de adentro: es exactamente la caja contra la
  // que el `position: absolute` de siempre medía sus porcentajes, así que
  // medirla con `getBoundingClientRect()` es el reemplazo fiel.
  //
  // `--sx-tip-touch-*` se escriben siempre, aunque `place` no sea `left` ni
  // `right`: son el mismo cálculo que el caso `bottom`, y están ahí para
  // cuando el `@media (pointer: coarse)` decide usarlas en vez de las de
  // arriba — barato de escribir siempre, más simple que decidir en JS si el
  // puntero es `coarse`.
  function layout() {
    if (!supportsPopover || !host || typeof window === 'undefined') return;
    const h = host.getBoundingClientRect();
    const cx = h.left + h.width / 2;
    if (place === 'left' || place === 'right') {
      tipEl?.style.setProperty('--sx-tip-a', `${place === 'left' ? h.left : h.right}px`);
      tipEl?.style.setProperty('--sx-tip-c', `${h.top + h.height / 2}px`);
    } else {
      tipEl?.style.setProperty('--sx-tip-a', `${place === 'top' ? h.top : h.bottom}px`);
      tipEl?.style.setProperty('--sx-tip-c', `${cx}px`);
    }
    tipEl?.style.setProperty('--sx-tip-touch-a', `${h.bottom}px`);
    tipEl?.style.setProperty('--sx-tip-touch-c', `${cx}px`);
    // `document.documentElement.clientWidth`/`clientHeight`, no `100vw`/`100vh`:
    // `getBoundingClientRect()` (`h`, arriba) excluye las barras de scroll
    // clásicas, pero los viewport units las incluyen — mezclarlos deja un
    // offset de ~15px en cualquier sistema con barras clásicas. Se escriben
    // siempre, aunque `place` no sea `top`/`left`, mismo criterio que
    // `--sx-tip-touch-*`: más barato que decidir en JS cuál hace falta.
    tipEl?.style.setProperty('--sx-tip-vw', `${document.documentElement.clientWidth}px`);
    tipEl?.style.setProperty('--sx-tip-vh', `${document.documentElement.clientHeight}px`);
  }

  // `fixed` no sigue al disparador solo: si la página —o un contenedor con su
  // propio scroll— se mueve mientras el tip está mostrándose, se despega.
  function onReposition() { if (shown) layout(); }

  $: if (typeof document !== 'undefined' && supportsPopover) {
    document.removeEventListener('scroll', onReposition, true);
    window.removeEventListener('resize', onReposition);
    // `place` entra en la condición sólo para volverse dependencia de este
    // bloque — siempre es una de las cuatro direcciones, nunca falsy, así
    // que no cambia qué rama corre. Sin esto, cambiar `placement` con el tip
    // ya abierto actualiza la clase (`.top`/`.bottom`/`.left`/`.right`) pero
    // `layout()` no vuelve a correr: las custom properties se quedan con las
    // coordenadas del eje anterior, y una Y se lee como X.
    if (shown && place) {
      layout();
      // En captura: `scroll` no burbujea, así que sólo un listener en el
      // camino de bajada desde `document` oye el de un contenedor interno.
      // `passive: true` porque nunca se cancela.
      document.addEventListener('scroll', onReposition, { capture: true, passive: true });
      window.addEventListener('resize', onReposition, { passive: true });
    }
  }

  // Tener el atributo `popover` no muestra nada — la UA lo dibuja `display:
  // none` hasta `showPopover()`. `shown` ya decide la parte visual
  // (`visibility`/`opacity`, ver el `<style>`); esto decide la top layer, la
  // misma pregunta que `ShortcutOverlay` resuelve con `dlg.showModal()`/`close()`.
  //
  // AL CERRAR, LA SALIDA ESPERA EL FIN DEL FADE. `.tip` transiciona `opacity`
  // y `visibility` durante `--sx-fast` (120ms) — mientras esa transición
  // corre el tooltip SIGUE siendo visible, con la opacidad animando. Salir de
  // la top layer en ese instante (como hacía esto antes) deja al `position:
  // fixed` sin top layer durante esos ~120ms, la ventana exacta en la que
  // puede volver a anclarse contra un ancestro con `transform` o quedar
  // recortado por uno con `overflow: hidden` — el bug que esta migración vino
  // a arreglar, reabierto en el frame de cierre. `entrar` sigue siendo
  // inmediato (no hay nada que esperar para APARECER); sólo `hidePopover()`
  // se pospone a `transitionend` de `opacity`.
  //
  // `transitionend` no llega si la transición nunca corrió — moción reducida
  // la desactiva, ver el `@media` de abajo — así que el respaldo por tiempo
  // lee `getComputedStyle(...).transitionDuration`, que YA refleja esa media
  // query, en vez de asumir el valor de `--sx-fast`: si la duración
  // computada es 0, el respaldo cierra casi enseguida, igual que el cierre
  // inmediato de antes. Si el tip vuelve a mostrarse antes de que el cierre
  // pendiente llegue a correr, `cancelPendingExit()` lo descarta —
  // `syncPopover` es idempotente, así que un cierre que nunca llegó a
  // ejecutarse no deja nada que deshacer.
  let cancelExit = null;

  function cancelPendingExit() {
    if (cancelExit) {
      cancelExit();
      cancelExit = null;
    }
  }

  function scheduleExit() {
    cancelPendingExit();
    const el = tipEl;
    if (!el) return;
    const ms = Math.max(0, parseFloat(getComputedStyle(el).transitionDuration || '0') * 1000);
    const onEnd = (e) => {
      if (e.target === el && e.propertyName === 'opacity') finish();
    };
    // +40ms de margen: si `transitionend` no llega (pestaña sin foco,
    // transición interrumpida), el respaldo igual saca al tip de la top
    // layer en vez de dejarlo colgado ahí de forma indefinida.
    const timer = setTimeout(finish, ms + 40);
    function finish() {
      el.removeEventListener('transitionend', onEnd);
      clearTimeout(timer);
      cancelExit = null;
      syncPopover(el, false);
    }
    el.addEventListener('transitionend', onEnd);
    cancelExit = () => {
      el.removeEventListener('transitionend', onEnd);
      clearTimeout(timer);
    };
  }

  $: if (typeof document !== 'undefined' && supportsPopover) {
    if (shown) {
      cancelPendingExit();
      syncPopover(tipEl, true);
    } else {
      scheduleExit();
    }
  }
</script>

<span class="wrap" bind:this={host}>
  <slot />
  {#if text}
    <!-- Never aria-hidden, even while invisible: the accessible-description
         computation walks a directly referenced node whether it is showing or
         not, which is exactly how a keyboard user gets the word without ever
         seeing the box. Marking it hidden would take the description away. -->
    <span
      class="tip {place}"
      class:shown
      class:fx={supportsPopover}
      popover={supportsPopover ? 'manual' : undefined}
      id={id}
      role="tooltip"
      bind:this={tipEl}
    >{text}</span>
  {/if}
</span>

<style>
  .wrap {
    position: relative;
    display: inline-flex;
    /* The wrapper must not become a second box around the control: no padding,
       no background, and it takes the trigger's own alignment. */
    vertical-align: middle;
    max-width: 100%;
  }

  .tip {
    position: absolute;
    z-index: var(--sx-z-toast);
    width: max-content;
    /* A measure, not a pixel width: a tooltip that runs past ~34 characters is
       a paragraph, and a paragraph does not belong in a tooltip. */
    max-width: 34ch;
    padding: var(--sx-s-2) var(--sx-s-3);
    border-radius: var(--sx-r-1);
    background: var(--sx-ink);
    color: var(--sx-surface);
    font-size: var(--sx-t-xs);
    font-weight: var(--sx-w-medium);
    line-height: 1.4;
    text-align: left;
    box-shadow: var(--sx-e-2);
    /* Hidden by visibility rather than by display, so the transition has
       something to run on and so nothing inside it is ever in the tab order. */
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
    transition:
      opacity var(--sx-fast) var(--sx-ease),
      visibility var(--sx-fast) var(--sx-ease);
    /* Estos seis pisan la hoja de estilos de `popover` (`margin: auto; border:
       solid; overflow: auto; height: fit-content; inset: 0`), activa apenas
       el atributo está escrito — abierto o no. La más importante es `display:
       block`: sin ella, un `.tip` sin abrir sería `display: none` por esa
       misma hoja — concretamente `[popover]:not(:popover-open):not(dialog[open])
       { display: none; }`, sin `:where()` — y este nodo tiene que seguir
       existiendo para quien lo lea por `aria-describedby` aunque nadie lo
       esté viendo (ver la cabecera del archivo). Gana por ORIGEN de la
       cascada, no por especificidad: esa regla es de la hoja del
       user-agent, la prioridad más baja, así que una clase de autor cualquiera
       la pisa sin competir en especificidad contra ella — no hace falta un
       selector «fuerte» para esto, y sería un error escribir uno pensando
       que sí hace falta. Nada de esto cambia nada en el camino sin
       `popover`: son los valores que un `<span>` ya tenía. */
    display: block;
    inset: auto;
    margin: 0;
    border: 0;
    overflow: visible;
    height: auto;
  }
  .shown { visibility: visible; opacity: 1; }

  .top    { bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: var(--sx-s-2); }
  .bottom { top: 100%;    left: 50%; transform: translateX(-50%); margin-top: var(--sx-s-2); }
  .left   { right: 100%;  top: 50%;  transform: translateY(-50%); margin-right: var(--sx-s-2); }
  .right  { left: 100%;   top: 50%;  transform: translateY(-50%); margin-left: var(--sx-s-2); }

  /* Con `popover`, `.wrap` deja de ser el ancestro contra el que `top: 50%` o
     `left: 100%` significan algo — el tip vive en la top layer. `.fx` cambia
     a `fixed` y cada colocación fija sólo el borde del que se separa y el
     punto sobre el que centra, en coordenadas de viewport que `layout()`
     calcula; el margen (`var(--sx-s-2)`, arriba) y el `transform` de centrado
     no cambian: el margen sigue sumando la separación al borde fijado, y el
     `transform` es relativo a la caja propia del tip, no a `.wrap`. */
  .tip.fx { position: fixed; }
  /* `var(--sx-tip-vh, 100vh)`/`var(--sx-tip-vw, 100vw)`, no `100vh`/`100vw` a
     secas: `--sx-tip-a` viene de `getBoundingClientRect()`, que excluye las
     barras de scroll clásicas, y los viewport units las incluyen — restar
     uno del otro deja un offset de ~15px en cualquier sistema con barras
     clásicas. `layout()` escribe `--sx-tip-vh`/`--sx-tip-vw` con
     `document.documentElement.clientHeight`/`clientWidth`, que sí las
     excluye; el `100vh`/`100vw` dentro de `var()` es sólo el respaldo antes
     de la primera medición. */
  .tip.fx.top    { bottom: calc(var(--sx-tip-vh, 100vh) - var(--sx-tip-a, 0px)); left: var(--sx-tip-c, 0px); }
  .tip.fx.bottom { top: var(--sx-tip-a, 0px); left: var(--sx-tip-c, 0px); }
  .tip.fx.left   { right: calc(var(--sx-tip-vw, 100vw) - var(--sx-tip-a, 0px)); top: var(--sx-tip-c, 0px); }
  .tip.fx.right  { left: var(--sx-tip-a, 0px); top: var(--sx-tip-c, 0px); }

  @media (prefers-reduced-motion: reduce) {
    .tip { transition: none; }
  }

  /* On a touch screen the tip only ever arrives through focus, so it must not
     sit under the thumb that just put it there. `left`/`right` at 390px would
     also be half off the screen; both fall back to below the control. */
  @media (pointer: coarse) {
    .left, .right {
      right: auto;
      left: 50%;
      top: 100%;
      transform: translateX(-50%);
      margin: var(--sx-s-2) 0 0;
    }
    /* Mismo selector completo que `.tip.fx.left`/`.tip.fx.right` de más
       arriba (misma especificidad, 0,3,0): si acá se escribiera sólo
       `.fx.left, .fx.right` (0,2,0), la regla de más arriba seguiría ganando
       aun con el pointer en `coarse`, porque la especificidad decide antes
       que la media query — no hay «más tarde en el archivo» que le gane a
       «más específico». Empatando la especificidad, gana el orden: esta
       regla está después. `layout()` deja `--sx-tip-touch-*` siempre listas
       con el mismo cálculo que usa `.fx.bottom`, para no repetir esta media
       query en JS. */
    .tip.fx.left, .tip.fx.right {
      right: auto;
      bottom: auto;
      top: var(--sx-tip-touch-a, 0px);
      left: var(--sx-tip-touch-c, 0px);
      margin: var(--sx-s-2) 0 0;
    }
  }
</style>
