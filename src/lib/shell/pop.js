// POP — cómo entra y cómo se va todo lo que cuelga de un disparador.
//
// LO QUE ESTO ARREGLA. Menu y el desplegable de Tabs ya tenían un keyframe de
// entrada: 220ms con la curva exponencial de `--sx-ease-out`. Medido en el
// catálogo, esa curva deja la opacidad en 0.6 a los 30ms y en 0.92 a los 80ms
// —el ojo la lee como «apareció», no como «vino»—, y la salida no existía: el
// panel vivía en un `{#if}` y se iba en el mismo cuadro en que se pedía
// cerrar. Una cosa que llega animada y se va de golpe se siente rota justo en
// el momento en que la persona ya decidió algo.
//
// POR QUÉ UNA TRANSICIÓN DE SVELTE Y NO UN KEYFRAME. La entrada se podía
// arreglar en CSS; la salida no. Un nodo dentro de un `{#if}` deja de existir
// cuando la condición cae, y no hay CSS que anime algo que ya no está. Select
// y Combobox resuelven su salida con `transition-behavior: allow-discrete`
// porque su lista NUNCA se desmonta —sólo cambia de `:popover-open`—; Menu y
// Tabs sí se desmontan, y lo que retiene un nodo vivo hasta que termina de
// irse es exactamente un `out:` de Svelte. Usarlo en las dos direcciones deja
// la llegada y la salida escritas en un solo lugar.
//
// LO QUE SVELTE YA HACE POR NOSOTROS, Y POR QUÉ IMPORTA. Mientras corre un
// `out:`, Svelte pone `inert` en el nodo y lo saca al terminar; si el panel
// se vuelve a pedir a mitad de la salida, el mismo nodo vuelve a entrar desde
// donde estaba. `inert` es lo que hace segura la salida: un panel que se está
// yendo no recibe clics ni foco, así que el Tab de Menu —que necesita que el
// panel YA no esté en el orden de tabulación— no aterriza en un ítem que se
// desvanece.
//
// LA DURACIÓN SALE DEL TOKEN. `--sx-dur-pop-in` y `--sx-dur-pop-out` se leen
// del nodo al empezar cada transición, así que un anfitrión (o un Core en un
// shadow root, vía `hostTokens()`) que los cambia mueve esta transición y los
// keyframes de Select y Combobox a la vez. Si el token no llega, valen las
// constantes de abajo, que son las mismas cifras que `tokens.js`.
//
// MOCIÓN REDUCIDA: SÓLO OPACIDAD. La regla global de `base.css` acorta
// animaciones y transiciones CSS, pero Svelte anima con la Web Animations API,
// que esa regla no alcanza — por eso la pregunta se hace acá. No se apaga del
// todo: un fundido corto no mueve nada en pantalla y sigue diciendo «esto se
// abrió», que un salto seco no dice.
//
// USO EN UNA APP PROPIA — la campana de avisos, un popover a mano:
//
//   import { pop } from '@strix/frontend-lib/shell';
//   {#if abierto}
//     <div class="pop" in:pop={{ up }} out:pop={{ up }}>…</div>
//   {/if}
//
// `up` dice que el panel abrió HACIA ARRIBA del disparador (entra bajando
// hacia él en vez de subiendo). Puede ser un booleano o una función: Menu y
// Tabs deciden `up` midiendo DESPUÉS de montar, y la transición lee la
// función recién cuando arma los cuadros, que es después de esa medición.
// `origin` es opcional: el `transform-origin` del panel, para que crezca
// desde la esquina que toca el disparador. Si no se pasa, se respeta el que
// el CSS del componente ya haya escrito.

/** Las mismas cifras que `--sx-dur-pop-in` / `--sx-dur-pop-out` en tokens.js. */
export const POP_IN_MS = 160;
export const POP_OUT_MS = 110;

const reduced = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function ms(node, name, fallback) {
  if (typeof getComputedStyle !== 'function') return fallback;
  const raw = getComputedStyle(node).getPropertyValue(name).trim();
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return fallback;
  return raw.endsWith('ms') ? n : raw.endsWith('s') ? n * 1000 : n;
}

// Las dos curvas del sistema, en JS. Svelte muestrea `css(t)` cuadro a
// cuadro, así que la curva tiene que ser una función y no un `cubic-bezier()`.
// La transición corre LINEAL (`t` es tiempo, no progreso curvado) y cada
// propiedad aplica su propia curva adentro de `css`: el viaje y la escala
// desaceleran al llegar (cúbica) y aceleran al irse, como `--sx-ease-in`; la
// opacidad va casi lineal. Darle a la opacidad la misma curva que al viaje
// fue el error de antes: con una desaceleración fuerte llega a 0.98 en el
// primer tercio y el ojo ya no ve un fundido.
const easeOut = (t) => 1 - (1 - t) ** 3;
const easeIn = (t) => t * t * t;

/**
 * Transición de Svelte para paneles que cuelgan de un disparador.
 * @param {Element} node
 * @param {{ up?: boolean | (() => boolean), origin?: string, distance?: number }} [params]
 * @param {{ direction?: 'in' | 'out' | 'both' }} [opts]
 */
export function pop(node, params = {}, opts = {}) {
  const leaving = opts.direction === 'out';
  const duration = leaving
    ? ms(node, '--sx-dur-pop-out', POP_OUT_MS)
    : ms(node, '--sx-dur-pop-in', POP_IN_MS);

  if (reduced()) {
    return { duration, css: (t) => `opacity: ${t}` };
  }

  const { up = false, origin, distance = 6 } = params;
  const isUp = () => (typeof up === 'function' ? !!up() : !!up);

  return {
    duration,
    css: (t) => {
      // `t` va de 0 a 1 al entrar y de 1 a 0 al salir, siempre lineal en el
      // tiempo. `k` es cuánto del camino está recorrido, con la curva que
      // corresponde a la dirección.
      const k = leaving ? 1 - easeIn(1 - t) : easeOut(t);
      // Hacia el disparador: un panel que cuelga abajo llega desde arriba
      // (y negativo), uno que abrió hacia arriba llega desde abajo.
      const dy = (isUp() ? 1 : -1) * distance * (1 - k);
      const s = 0.96 + 0.04 * k;
      // Al llegar, la opacidad se completa al 60% del tiempo: el contenido
      // ya se lee mientras el panel termina de asentarse. Al irse, pareja
      // con el tiempo.
      const o = leaving ? t : Math.min(1, t / 0.6);
      return (
        `opacity: ${o.toFixed(3)}; transform: translateY(${dy.toFixed(2)}px) scale(${s.toFixed(4)});` +
        (origin ? ` transform-origin: ${origin};` : '')
      );
    }
  };
}
