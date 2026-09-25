// LA COREOGRAFÍA DEL CATÁLOGO — cómo llega cada cosa a la pantalla.
//
// La regla que manda todo este archivo: las cosas no APARECEN, VIENEN. Un
// bloque que entra al viewport no salta de invisible a puesto; se acerca —
// un poco más chico, un poco desenfocado, un poco más lejos — y se asienta
// con una desaceleración exponencial. Nada rebota salvo lo chico (un número,
// una píldora), que es lo único que en el mundo físico también rebota.
//
// TRES PROMESAS
//
// 1. SIN JS, TODO SE VE. El estado oculto no existe en el CSS por defecto: lo
//    pone este archivo (`data-rv-wait`) sólo sobre lo que está DEBAJO del
//    pliegue y va a revelar. Si esto no corre, la página es la de siempre.
// 2. NO SE REPITE. Una vez revelado, se deja de observar. Scrollear arriba y
//    abajo no es una función de la página.
// 3. MOCIÓN REDUCIDA ES CERO MOCIÓN. Ni se oculta nada ni se anima nada.
//
// Las animaciones son de la Web Animations API y no clases CSS porque cada
// una termina y SE VA: al final no queda ningún `transform` ni `filter`
// colgado en un ancestro, que es exactamente lo que atraparía al `position:
// fixed` de un Sheet o de un Tooltip adentro de una tarjeta de muestra.

export const EASE_OUT = 'cubic-bezier(.16, 1, .3, 1)';
export const EASE_SPRING = 'cubic-bezier(.34, 1.56, .64, 1)';

export const reduced = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── El vocabulario ──────────────────────────────────────────────────────────
// No una sola entrada para todo — un catálogo donde cada sección hace el mismo
// fade-up se lee como una plantilla. Cada tipo de cosa tiene su material:
// el texto sube, los títulos salen de una máscara, las muestras se acercan,
// las columnas vienen de los lados, las barras crecen, lo chico brota.
const KINDS = {
  rise: {
    frames: [
      { opacity: 0, transform: 'translate3d(0, 18px, 0)', filter: 'blur(2px)' },
      { opacity: 1, transform: 'none', filter: 'blur(0)' }
    ],
    duration: 760
  },
  mask: {
    frames: [
      { opacity: 0, clipPath: 'inset(0 0 100% 0)', transform: 'translate3d(0, .45em, 0)' },
      { opacity: 1, clipPath: 'inset(0 0 -20% 0)', transform: 'none' }
    ],
    duration: 820
  },
  approach: {
    frames: [
      { opacity: 0, transform: 'translate3d(0, 40px, 0) scale(.93)', filter: 'blur(6px)' },
      { opacity: 1, transform: 'none', filter: 'blur(0)' }
    ],
    duration: 1000
  },
  left: {
    frames: [
      { opacity: 0, transform: 'translate3d(-56px, 0, 0) scale(.98)', filter: 'blur(4px)' },
      { opacity: 1, transform: 'none', filter: 'blur(0)' }
    ],
    duration: 900
  },
  right: {
    frames: [
      { opacity: 0, transform: 'translate3d(56px, 0, 0) scale(.98)', filter: 'blur(4px)' },
      { opacity: 1, transform: 'none', filter: 'blur(0)' }
    ],
    duration: 900
  },
  grow: {
    frames: [
      { transform: 'scaleX(0)', transformOrigin: 'left center' },
      { transform: 'scaleX(1)', transformOrigin: 'left center' }
    ],
    duration: 1200
  },
  pop: {
    frames: [
      { opacity: 0, transform: 'scale(.55)' },
      { opacity: 1, transform: 'none' }
    ],
    duration: 620,
    easing: EASE_SPRING
  }
};

// ── Las páginas de familia ──────────────────────────────────────────────────
// Las siete páginas comparten un esqueleto aunque no compartan nombres de
// clase: una cabecera, y un cuerpo con el índice a un lado y un <main> de
// secciones al otro. La coreografía se les asigna por ESTRUCTURA, así que
// ninguna página tuvo que aprender que existe. Gana la primera regla que
// coincide.
const PAGE = '#contenido > *';
const SEC = '.body main > section';
const AUTO = [
  [`${PAGE} > header h1`, 'mask'],
  [`${PAGE} > header .facts > li, ${PAGE} > header .rules > *, ${PAGE} > .rules > *`, 'approach'],
  [`${PAGE} > header > :not(.facts):not(.rules)`, 'rise'],
  ['.body > .toc li', 'left'],
  [`${SEC} > h2`, 'mask'],
  [`${SEC} > .two > :first-child`, 'left'],
  [`${SEC} > .two > :last-child`, 'right'],
  [`${SEC} > :is(.demo, .stage, .card, .code, .scroller, section)`, 'approach'],
  [`${SEC} > :not(.two)`, 'rise']
];
const AUTO_SEL = AUTO.map(([s]) => s).join(', ');

const STEP = 70; // ms entre hermanos que llegan en la misma tanda
const MAX_DELAY = 420; // una tanda larga no puede hacer esperar al último

function kindFor(el) {
  if (el.dataset.rv) return el.dataset.rv;
  for (const [sel, kind] of AUTO) if (el.matches(sel)) return kind;
  return 'rise';
}

function play(el, delay = 0) {
  const k = KINDS[el.dataset.rvKind] ?? KINDS.rise;
  const extra = Number(el.dataset.rvDelay || 0);
  el.removeAttribute('data-rv-wait');
  const anim = el.animate(k.frames, {
    duration: k.duration,
    delay: delay + extra,
    easing: k.easing ?? EASE_OUT,
    fill: 'backwards'
  });
  el.dataset.rvDone = '';
  return anim;
}

/**
 * Svelte action para el <main>: encuentra lo que se revela, oculta lo que está
 * debajo del pliegue, y lo trae cuando entra. Sigue funcionando al cambiar de
 * familia porque escucha las mutaciones del subárbol.
 */
export function choreograph(root) {
  if (reduced() || typeof IntersectionObserver !== 'function') return {};

  const io = new IntersectionObserver(
    (entries) => {
      const arriving = entries
        .filter((e) => e.isIntersecting)
        .map((e) => e.target)
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      arriving.forEach((el, i) => {
        io.unobserve(el);
        play(el, Math.min(i * STEP, MAX_DELAY));
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0 }
  );

  function scan() {
    const found = [
      ...root.querySelectorAll('[data-rv]'),
      ...root.querySelectorAll(AUTO_SEL)
    ];
    const vh = innerHeight;
    const now = [];
    for (const el of found) {
      if ('rvDone' in el.dataset || 'rvKind' in el.dataset) continue;
      // Un blanco adentro de otro blanco se mueve con su padre: dos entradas
      // anidadas son un temblor, no una coreografía. Salvo que el hijo lo haya
      // pedido con su propio `data-rv` (el número que brota DESPUÉS de que
      // llegó su tarjeta) — eso es un segundo tiempo, escrito a propósito.
      const outer = el.parentElement?.closest('[data-rv-kind]');
      if (outer && root.contains(outer) && !el.dataset.rv) continue;
      el.dataset.rvKind = kindFor(el);
      const r = el.getBoundingClientRect();
      if (r.bottom < 0) {
        // Ya pasó (un link profundo a mitad de página): se queda puesto.
        el.dataset.rvDone = '';
      } else if (r.top < vh * 0.92) {
        now.push(el);
      } else {
        el.setAttribute('data-rv-wait', '');
        io.observe(el);
      }
    }
    now.forEach((el, i) => play(el, Math.min(i * STEP, MAX_DELAY)));
  }

  let raf = 0;
  const spies = new Map();
  const tick = () => {
    scan();
    for (const [toc, off] of spies) if (!toc.isConnected) { off(); spies.delete(toc); }
    for (const toc of root.querySelectorAll('.toc')) if (!spies.has(toc)) spies.set(toc, scrollspy(toc));
  };
  const mo = new MutationObserver(() => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  });
  mo.observe(root, { childList: true, subtree: true });
  tick();

  return {
    destroy() {
      mo.disconnect();
      io.disconnect();
      cancelAnimationFrame(raf);
      for (const off of spies.values()) off();
    }
  };
}

/**
 * El índice de una página sabe dónde estás: la sección que estás leyendo se
 * marca en el índice, y la marca BAJA con vos a medida que scrolleás —
 * deslizándose de un renglón al siguiente, no saltando. La sección actual es
 * la última cuyo título ya pasó el primer tercio de la pantalla.
 */
function scrollspy(toc) {
  const list = toc.querySelector('ul') ?? toc;
  const links = [...list.querySelectorAll('a[href]')];
  const heads = links
    .map((a) => [a, document.getElementById(a.getAttribute('href').split('/').pop())])
    .filter(([, h]) => h);
  if (!heads.length) return () => {};
  const g = glide(list, { selector: 'a.spy-on' });

  let raf = 0;
  let on = null;
  const pick = () => {
    raf = 0;
    const line = innerHeight * 0.34;
    let next = heads[0][0];
    for (const [a, h] of heads) if (h.getBoundingClientRect().top < line) next = a;
    if (next === on) return;
    on?.classList.remove('spy-on');
    next.classList.add('spy-on');
    on = next;
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(pick); };
  addEventListener('scroll', onScroll, { passive: true });
  pick();
  return () => {
    removeEventListener('scroll', onScroll);
    cancelAnimationFrame(raf);
    g.destroy();
  };
}

/**
 * Un indicador que VIAJA entre opciones en vez de encenderse en una y apagarse
 * en otra. Se mide la opción elegida y se mueve un solo elemento hasta ella —
 * de un lado al otro, que es lo que le dice al ojo «esto reemplaza a aquello».
 *
 *   use:glide={{ selector: '.sw.on' }}              → sigue a la elegida
 *   use:glide={{ selector: '.link', hover: true }}  → sigue al puntero
 *
 * El primer posicionamiento no anima: un indicador que llega volando desde el
 * borde izquierdo al cargar la página es un defecto, no una entrada.
 */
export function glide(node, opts) {
  const ind = document.createElement('span');
  ind.className = `glider${opts.hover ? ' hover' : ''}`;
  ind.setAttribute('aria-hidden', 'true');
  node.prepend(ind);
  node.classList.add(opts.hover ? 'has-hover-glide' : 'has-glide');

  let placed = false;
  let target = null;

  function place(el, show = true) {
    if (!el) {
      ind.style.opacity = '0';
      return;
    }
    // Se suben los offsets hasta el contenedor y no se usa getBoundingClientRect:
    // un renglón que todavía está entrando (con su transform a medio camino)
    // mediría donde ESTÁ y no donde VA, y la marca quedaría torcida para siempre.
    let x = 0;
    let y = 0;
    for (let e = el; e && e !== node; e = e.offsetParent) {
      x += e.offsetLeft;
      y += e.offsetTop;
    }
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (!placed) ind.style.transition = 'none';
    ind.style.width = `${w}px`;
    ind.style.height = `${h}px`;
    ind.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    ind.style.opacity = show ? '1' : '0';
    if (!placed) {
      ind.getBoundingClientRect(); // fija el punto de partida antes de soltar la transición
      ind.style.transition = '';
      placed = true;
    }
  }

  const current = () => node.querySelector(opts.selector);
  const sync = () => place(opts.hover ? target : current(), !opts.hover || !!target);

  let mo, ro;
  const onOver = (e) => {
    const el = e.target.closest?.(opts.selector);
    if (!el || !node.contains(el)) return;
    // Del reposo, aparece EN el lugar — viajar desde la última posición fantasma
    // hace que el primer hover llegue de la nada.
    if (!target) placed = false;
    target = el;
    sync();
  };
  const onLeave = () => {
    target = null;
    sync();
  };

  if (opts.hover) {
    node.addEventListener('pointerover', onOver);
    node.addEventListener('pointerleave', onLeave);
  } else {
    mo = new MutationObserver(sync);
    mo.observe(node, { subtree: true, attributes: true, attributeFilter: ['class', 'aria-pressed', 'aria-current'] });
  }
  ro = new ResizeObserver(() => {
    // Un cambio de tamaño se acompaña sin viaje: la pastilla sigue a su opción.
    placed = false;
    sync();
  });
  ro.observe(node);
  // Las fuentes web cambian el ancho de cada etiqueta cuando terminan de cargar.
  document.fonts?.ready.then(() => { placed = false; sync(); });
  requestAnimationFrame(sync);

  return {
    update(next) {
      opts = next;
      sync();
    },
    destroy() {
      mo?.disconnect();
      ro?.disconnect();
      node.removeEventListener('pointerover', onOver);
      node.removeEventListener('pointerleave', onLeave);
      ind.remove();
    }
  };
}

/**
 * La luz que sigue al puntero sobre una tarjeta: escribe --mx/--my en el
 * elemento bajo el puntero y el CSS pinta un foco blanco ahí. Es la misma luz
 * de arriba-izquierda de la arcilla, sólo que ahora la sostenés vos.
 */
export function spotlight(node, selector) {
  const onMove = (e) => {
    const el = e.target.closest?.(selector);
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  node.addEventListener('pointermove', onMove, { passive: true });
  return { destroy: () => node.removeEventListener('pointermove', onMove) };
}

/**
 * Cambia el estado dentro de una View Transition cuando el navegador la tiene
 * y la moción no está reducida; si no, lo cambia y listo. `kind` se escribe en
 * <html> para que el CSS elija la coreografía (ruta o tema).
 */
export function transition(kind, update, vars = {}) {
  const html = document.documentElement;
  if (reduced() || typeof document.startViewTransition !== 'function') {
    return Promise.resolve(update());
  }
  html.dataset.vt = kind;
  for (const [k, v] of Object.entries(vars)) html.style.setProperty(k, v);
  const vt = document.startViewTransition(update);
  // Una transición que el navegador aborta (otra que la pisa, la pestaña que
  // se oculta) igual aplicó el cambio: no es un error de nadie.
  vt.ready.catch(() => {});
  vt.finished.catch(() => {}).finally(() => {
    if (html.dataset.vt === kind) delete html.dataset.vt;
  });
  return vt.updateCallbackDone;
}
