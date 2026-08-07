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
    form: 'Fondo manila, ficha blanca. La pestaña ES la cabecera: nada de barra de título dentro. Radio 2px en la ficha, 4px arriba en la pestaña. Regla doble bajo el encabezado.'  },
  {
    id: 'I',
    name: 'Cristal',
    tagline: 'Vidrio líquido sobre un campo de color.',
    silhouette: 'Paneles translúcidos que dejan pasar el fondo teñido, con un filo especular arriba. Nada opaco.',
    form: 'backdrop-filter de verdad: el fondo es un campo de manchas de color y los paneles lo desenfocan. Radio 18–26px. El borde es luz, no línea: 1px blanco al 65 % más un realce interior arriba.'
  },
  {
    id: 'J',
    name: 'Laca',
    tagline: 'Esmalte brillante. Superficies que reflejan.',
    silhouette: 'Placas gruesas y muy redondeadas con un barrido de brillo en el tercio superior y sombra profunda debajo.',
    form: 'Cada superficie es un degradado vertical, no un color plano. Realce blanco duro en el borde de arriba, sombra larga y difusa abajo. Radio 14–22px, fila de 46px. Al presionar, el brillo se apaga y la placa se hunde.'
  },
  {
    id: 'K',
    name: 'Halo',
    tagline: 'Las cosas se definen por la luz que emiten.',
    silhouette: 'Formas luminosas sobre negro, sin un solo borde. El estado es el color del resplandor.',
    form: 'Cero bordes y cero rellenos sólidos. Un elemento existe porque irradia: anillo tenue de 1px en su propio tono más un resplandor difuso hacia afuera. El texto lleva bloom apenas perceptible.',
    dark: true
  },
  {
    id: 'L',
    name: 'Guijarro',
    tagline: 'Formas de piedra de río. Ninguna esquina igual a otra.',
    silhouette: 'Cantos rodados: cada contenedor tiene sus cuatro radios distintos y ninguna corrida recta.',
    form: 'border-radius con cuatro valores diferentes, nunca uno. Sin bordes. Sombra direccional doble —una cálida abajo a la derecha, una luz fría arriba a la izquierda— como un objeto sobre una mesa. Fila de 52px, padding amplio.'
  },
  {
    id: 'M',
    name: 'Bruma',
    tagline: 'El color se derrama en vez de encajonarse.',
    silhouette: 'Sin contenedores. Manchas de color desenfocadas que se posan detrás del contenido y se desvanecen sin filo.',
    form: 'Ningún panel tiene relleno ni borde. El estado es una mancha radial difuminada que se derrama por detrás. Titulares en serif, texto en sans: es la única dirección con dos familias tipográficas.'
  },
  {
    id: 'N',
    name: 'Cinta',
    tagline: 'Carriles continuos que se montan uno sobre otro.',
    silhouette: 'Cintas horizontales de extremos redondos que se solapan y se apilan, con degradado a lo largo del carril.',
    form: 'El contenedor no es una caja: es un carril de 999px de radio en las puntas, con degradado longitudinal y brillo arriba. Los carriles se montan unos milímetros entre sí, así que hay orden de apilado y sombra de contacto.'  },
  {
    id: 'O',
    name: 'Prisma',
    tagline: 'Elevación + Marca + Cristal. El color de marca vive DENTRO del vidrio.',
    silhouette: 'Tarjetas de vidrio que flotan de verdad, con la cabecera teñida del color de marca y un filo especular arriba.',
    form: 'La mezcla de las tres que más aguantan uso: la sombra real de Elevación levanta la tarjeta, el vidrio de Cristal deja pasar el campo teñido, y el color de Marca es una capa translúcida en la cabecera en vez de una barra opaca. Se cambia de marca en un token y el vidrio se tiñe entero.',
    mezcla: 'A + C + I'
  },
  {
    id: 'P',
    name: 'Espina',
    tagline: 'Marca + Banda. El color de marca es la estructura, no un adorno.',
    silhouette: 'Una columna de marca que baja por la izquierda y de la que cuelgan franjas a sangre. Ninguna caja.',
    form: 'El raíl de etiquetas de Banda pasa a estar relleno del color de marca, y las franjas se enganchan a él. El estado no se pinta de fondo: muerde la espina con una muesca de su tono. Radio 0, sombra nunca.',
    mezcla: 'C + G'
  },
  {
    id: 'Q',
    name: 'Charol',
    tagline: 'Peso + Laca. Bloques macizos con superficie mojada.',
    silhouette: 'Formas duras de borde negro grueso, pero con el brillo húmedo del charol encima.',
    form: 'La masa de Peso —borde 2px, sombra sólida desplazada— con el esmalte de Laca: cada superficie es un degradado con realce blanco duro arriba. La contradicción es el punto: se ve pesado y a la vez recién pintado.',
    mezcla: 'D + J'
  },
  {
    id: 'R',
    name: 'Vitrina',
    tagline: 'Terminal + Cristal. Densidad de consola, material de vidrio.',
    silhouette: 'Paneles translúcidos oscuros, monoespaciados y muy densos, sobre un campo con luz de color detrás.',
    form: 'La rejilla de 26px y la monoespaciada de Terminal, pero las superficies son vidrio sobre un fondo con manchas frías. Es la dirección más densa de las diecinueve y aun así no se siente apretada, porque el fondo respira a través.',
    mezcla: 'F + I',
    dark: true
  },
  {
    id: 'S',
    name: 'Umbra',
    tagline: 'Elevación + Bruma. La sombra lleva el estado.',
    silhouette: 'Tarjetas blancas y limpias cuya sombra está teñida del color del estado. El color no toca el contenido.',
    form: 'La tarjeta es blanca, sin banda ni borde de color: lo que informa es la luz de abajo. Un equipo vencido proyecta rojo, uno al día proyecta verde. Es la manera más silenciosa de que el color cargue información sin ensuciar la lectura.',
    mezcla: 'A + M'
  }
];

export const byId = Object.fromEntries(DIRECTIONS.map((d) => [d.id, d]));
