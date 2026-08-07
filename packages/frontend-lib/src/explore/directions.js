// EIGHT DIRECTIONS, TO CHOOSE ONE.
//
// This file is the spine of the exploration. Every catalogue page renders its
// element family through all eight, with the same real content, so the only
// variable on screen is the direction itself.
//
// THE RULE THAT MAKES THESE DIRECTIONS AND NOT THEMES
//
// A theme changes colours. A direction changes SILHOUETTE — what a container
// is, where its edge comes from, how dense it sits, what shape you'd recognise
// from across the room with the text blurred out. If two entries here would
// look the same in a squint test, one of them is not pulling its weight.
//
// So each direction below names its silhouette first and its palette last.

export const DIRECTIONS = [
  {
    id: 'A',
    name: 'Elevación',
    tagline: 'Tarjetas que flotan sobre el fondo.',
    silhouette: 'Rectángulos redondeados separados por aire. La sombra contiene, el borde apenas existe.',
    form: 'Radio 7–11px. Sombra corta y real, con desplazamiento. Densidad cómoda. Las secciones se separan por espacio, no por líneas.',
    // The direction the 55-component library already speaks. Included so the
    // decision is against a real incumbent and not against an empty page.
    incumbent: true
  },
  {
    id: 'B',
    name: 'Instrumento',
    tagline: 'Un plano técnico. Todo contenido por líneas.',
    silhouette: 'Marcos rectos de 1px con marcas de esquina. Los elementos comparten borde en vez de separarse.',
    form: 'Radio 0. Sombra nunca. Densidad alta, fila de 30px. Las etiquetas van fuera del marco, en versalitas. Un botonera es un marco continuo, no tres botones sueltos.'
  },
  {
    id: 'C',
    name: 'Marca',
    tagline: 'Un color de marca sostiene la estructura.',
    silhouette: 'Bloques con cabecera llena de color. El contenedor se anuncia por su cabecera, no por su borde.',
    form: 'Cabecera sólida en color de marca con texto claro, cuerpo blanco. Radio 4–10px. El color es estructura: identifica el bloque, no lo decora.',
    swappable: 'El color de marca se cambia en un token. Aquí va teal profundo por defecto.'
  },
  {
    id: 'D',
    name: 'Peso',
    tagline: 'La forma viene de la masa.',
    silhouette: 'Bloques de borde grueso negro con sombra sólida desplazada. Nada redondeado, nada difuso.',
    form: 'Borde 2px tinta. Radio 0. Sombra dura 4px sin desenfoque — al presionar, el bloque se mueve hacia ella. Tipografía pesada: etiquetas 800 en caja alta.'
  },
  {
    id: 'E',
    name: 'Aire',
    tagline: 'Sin bordes. Solo espacio.',
    silhouette: 'Pastillas grandes y suaves que casi se disuelven en el fondo. Ningún borde en toda la pantalla.',
    form: 'Radio 20–28px. Cero bordes. Sombra muy difusa y baja. Padding generoso, fila de 56px, cuerpo a 16px. Las etiquetas en caja normal, sin versalitas.'
  },
  {
    id: 'F',
    name: 'Terminal',
    tagline: 'Rejilla monoespaciada, fondo oscuro.',
    silhouette: 'Una pantalla de texto. Todo alineado a la cuadrícula del carácter, densidad máxima.',
    form: 'Monoespaciada en todo. Radio 0, fila de 24px, texto 12–13px. Los estados son bloques de color detrás del texto. La cabecera de un panel es una regla de guiones.',
    dark: true
  },
  {
    id: 'G',
    name: 'Banda',
    tagline: 'Sin tarjetas. Estratos de borde a borde.',
    silhouette: 'Franjas horizontales a sangre completa, separadas por un pelo de línea y un cambio de tono. Un raíl fijo de etiquetas a la izquierda.',
    form: 'Ninguna caja. La estructura la dan el raíl de etiquetas de 148px y una franja de color de 3px en el canto izquierdo que lleva el estado. Radio 0. Sombra nunca.'
  },
  {
    id: 'H',
    name: 'Ficha',
    tagline: 'Fichas de archivo, con pestaña y canto apilado.',
    silhouette: 'Tarjetas con una pestaña sobresaliendo arriba que lleva el título, y un canto doble abajo que sugiere más fichas detrás.',
    form: 'Fondo manila, ficha blanca. La pestaña ES la cabecera: nada de barra de título dentro. Radio 2px en la ficha, 4px arriba en la pestaña. Regla doble bajo el encabezado.'
  }
];

export const byId = Object.fromEntries(DIRECTIONS.map((d) => [d.id, d]));
