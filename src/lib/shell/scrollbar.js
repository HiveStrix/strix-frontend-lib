/**
 * SCROLLBAR — la barra que no le cobra una columna al contenido.
 *
 * POR QUÉ ESTO NO ES CSS
 *
 * La regla anterior era `scrollbar-width: thin` más un pulgar de `::-webkit-`
 * transparente en reposo. Se veía bien y estaba mal por una razón que sólo
 * aparece al medirla: en Blink, declarar `scrollbar-width` convierte la barra
 * en CLÁSICA, y una barra clásica ocupa layout SIEMPRE —esté visible o no—.
 * Medido sobre el Shell:
 *
 *     scrollbar-width: thin   →  11 px reservados, todo el tiempo
 *     scrollbar-width: auto   →  15 px
 *     ::-webkit-scrollbar{width:0} → 15 px (el layout lo decide la propiedad
 *                                    estándar; la de webkit sólo pinta)
 *     scrollbar-width: none   →   0 px
 *
 * O sea: la única manera de no robarle ancho al contenido es apagar la nativa.
 * Y apagarla a secas deja una región que scrollea sin decirlo nunca. De ahí
 * esta acción: apaga la del sistema y dibuja una propia, flotante.
 *
 * DECISIONES
 *
 * `position: fixed`, no `absolute`. Un absolute dentro del contenedor que
 * scrollea se va con el contenido; un sticky depende de que el padre no sea un
 * flex/grid que lo rompa. Fijo contra el viewport y recalculado desde
 * `getBoundingClientRect()` no depende de la caja de nadie, así que la acción
 * sirve en cualquier contenedor sin pedirle que sea `position: relative`.
 *
 * SE CUELGA DEL ROOT NODE, no de `document.body`. Adentro de un core la lib
 * vive en un shadow root: un `<div>` colgado del body quedaría fuera del
 * alcance de sus estilos y saldría sin pintar. `getRootNode()` devuelve el
 * shadow root cuando lo hay y el documento cuando no.
 *
 * APARECE Y SE VA. Visible mientras el cursor está sobre la región o mientras
 * se está scrolleando; se desvanece sola un rato después de que el scroll para.
 * Se puede arrastrar: una barra que no se agarra es media barra.
 *
 *   <div class="lista" use:scrollbar>…</div>
 *   <div use:scrollbar={{ hideAfter: 1200 }}>…</div>
 */

const MIN_THUMB = 28;
const HIDE_AFTER = 900;

export function scrollbar(node, options = {}) {
  let { hideAfter = HIDE_AFTER } = options;

  // La marca que el CSS de la librería usa para apagar la barra del sistema
  // (base.css / hostBase). Va como atributo y no como clase para no chocar con
  // las clases que el consumidor ya tenga en ese nodo.
  node.setAttribute('data-sx-scroll', '');

  const root = node.getRootNode();
  const host = root instanceof ShadowRoot ? root : document.body;

  const rail = document.createElement('div');
  rail.className = 'sx-sbar';
  rail.setAttribute('aria-hidden', 'true');
  const thumb = document.createElement('div');
  thumb.className = 'sx-sbar-thumb';
  rail.appendChild(thumb);
  host.appendChild(rail);

  let raf = 0;
  let hideTimer = 0;
  let hovering = false;
  let dragging = false;

  const show = (sticky) => {
    rail.classList.add('on');
    clearTimeout(hideTimer);
    if (!sticky) hideTimer = setTimeout(() => rail.classList.remove('on'), hideAfter);
  };

  function measure() {
    raf = 0;
    const { scrollHeight, clientHeight, scrollTop } = node;
    // Sin desborde no hay barra: se esconde en vez de dibujar un pulgar que
    // ocupa el riel entero y no significa nada.
    if (scrollHeight - clientHeight < 2) {
      rail.style.display = 'none';
      return;
    }
    rail.style.display = '';

    const r = node.getBoundingClientRect();
    rail.style.top = `${r.top}px`;
    rail.style.left = `${r.right - 10}px`;
    rail.style.height = `${r.height}px`;

    const ratio = clientHeight / scrollHeight;
    const h = Math.max(MIN_THUMB, Math.round(r.height * ratio));
    const max = r.height - h;
    const y = max <= 0 ? 0 : Math.round((scrollTop / (scrollHeight - clientHeight)) * max);
    thumb.style.height = `${h}px`;
    thumb.style.transform = `translateY(${y}px)`;
  }

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(measure);
  };

  const onScroll = () => { schedule(); show(hovering || dragging); };
  const onEnter = () => { hovering = true; schedule(); show(true); };
  const onLeave = () => { hovering = false; if (!dragging) show(false); };

  // El arrastre mueve el contenido en la proporción inversa a la que el pulgar
  // se movió dentro del riel.
  let startY = 0;
  let startTop = 0;
  function onDown(e) {
    dragging = true;
    startY = e.clientY;
    startTop = node.scrollTop;
    thumb.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  }
  function onMove(e) {
    if (!dragging) return;
    const r = node.getBoundingClientRect();
    const h = thumb.getBoundingClientRect().height;
    const max = r.height - h;
    if (max <= 0) return;
    node.scrollTop = startTop + ((e.clientY - startY) / max) * (node.scrollHeight - node.clientHeight);
  }
  function onUp(e) {
    dragging = false;
    thumb.releasePointerCapture?.(e.pointerId);
    if (!hovering) show(false);
  }

  node.addEventListener('scroll', onScroll, { passive: true });
  node.addEventListener('pointerenter', onEnter);
  node.addEventListener('pointerleave', onLeave);
  thumb.addEventListener('pointerdown', onDown);
  thumb.addEventListener('pointermove', onMove);
  thumb.addEventListener('pointerup', onUp);
  thumb.addEventListener('pointercancel', onUp);
  // La caja se mueve cuando la ventana scrollea o cambia de tamaño, y `fixed`
  // no se entera solo. `capture` porque el scroll de un ancestro no burbujea.
  window.addEventListener('scroll', schedule, { passive: true, capture: true });
  window.addEventListener('resize', schedule, { passive: true });

  const ro = new ResizeObserver(schedule);
  ro.observe(node);
  // El contenido puede crecer sin que el contenedor cambie de tamaño.
  const mo = new MutationObserver(schedule);
  mo.observe(node, { childList: true, subtree: true, characterData: true });

  schedule();

  return {
    update(next = {}) {
      hideAfter = next.hideAfter ?? HIDE_AFTER;
    },
    destroy() {
      cancelAnimationFrame(raf);
      clearTimeout(hideTimer);
      ro.disconnect();
      mo.disconnect();
      node.removeEventListener('scroll', onScroll);
      node.removeEventListener('pointerenter', onEnter);
      node.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', schedule, { capture: true });
      window.removeEventListener('resize', schedule);
      node.removeAttribute('data-sx-scroll');
      rail.remove();
    }
  };
}
