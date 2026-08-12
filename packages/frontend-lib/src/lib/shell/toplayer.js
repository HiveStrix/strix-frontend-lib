// LA TOP LAYER — no un `z-index` más alto, una capa distinta.
//
// `z-index` sólo compite DENTRO del contexto de apilado donde vive: si un
// ancestro tiene `transform`, `filter` o `opacity`, ese contexto encierra al
// popup entero y ningún número lo saca. Y `overflow: hidden` en un ancestro
// recorta sin mirar el `z-index` del hijo. Los dos bugs que Menu, Tooltip y
// Combobox tenían documentados en su cabecera eran ESTE problema, no uno de
// prioridad — por eso subir `--sx-z-overlay` nunca los iba a arreglar.
//
// El atributo `popover` saca al elemento de su contexto de apilado por
// completo: lo pinta en la top layer, por encima de todo el documento, sin
// mover el nodo del lugar donde el marcado lo escribió. Por eso sobrevive
// dentro de un shadow root — la alternativa de siempre, portalear a
// `document.body`, es exactamente lo que un Core no puede hacer.
//
// SOPORTE, UNA SOLA VEZ. Chrome 114+, Safari 17+, Firefox 125+. Cuatro
// componentes preguntando por separado es cuatro lugares donde la pregunta
// puede quedar mal escrita — o peor, escrita de dos formas distintas que
// concuerdan hoy y divergen en el próximo cambio. Se pregunta acá una vez y
// los cuatro leen la misma constante.
//
// LA CONDICIÓN NO SE PARTE. En Menu, Tooltip y Combobox, `supportsPopover`
// decide DOS cosas que tienen que moverse juntas: si el atributo `popover` va
// en el marcado, y si la clase que cambia `position: absolute` por
// `position: fixed` se aplica. Un elemento con `position: fixed` que NO está
// de verdad en la top layer queda posicionado contra el ancestro
// equivocado — el mismo bug que se vino a arreglar, con otra cara. Un
// elemento en la top layer que se quedó con `position: absolute` no tiene
// contra qué ancestro medirse y aparece en la esquina. Las dos ramas leen la
// misma constante importada de acá, nunca una condición recalculada aparte,
// para que no puedan separarse con el tiempo.
export const supportsPopover =
  typeof HTMLElement !== 'undefined' &&
  typeof HTMLElement.prototype.showPopover === 'function';

// ENTRAR Y SALIR ES UN GESTO, NO EL ATRIBUTO. Tener `popover` en el marcado no
// muestra nada — la UA lo dibuja `display: none` hasta que se llama
// `showPopover()`, igual que un `<dialog>` no aparece por tener la etiqueta.
// Y llamar `showPopover()` en un elemento que ya está mostrándose —o
// `hidePopover()` en uno que no lo está— tira `InvalidStateError`, así que
// hace falta comprobar `:popover-open` antes de cada llamada.
//
// Esa guarda es idéntica en Menu, Tooltip y Combobox — los tres tienen un
// elemento que se abre y se cierra muchas veces sobre el mismo nodo (no uno
// que Svelte crea de nuevo en cada apertura), así que la comprobación de
// «¿ya está en el estado que quiero?» es exactamente la misma pregunta las
// tres veces. Vive acá una vez para que no queden tres copias a mano de la
// misma guarda, con el riesgo de que una se escriba distinto.
export function syncPopover(el, open) {
  if (!supportsPopover || !el) return;
  const isOpen = el.matches(':popover-open');
  if (open && !isOpen) el.showPopover();
  else if (!open && isOpen) el.hidePopover();
}
