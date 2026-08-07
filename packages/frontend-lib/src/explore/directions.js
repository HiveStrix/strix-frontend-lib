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
    finalista: true,
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
    finalista: true,
    name: 'Instrumento',
    tagline: 'Un plano técnico. Todo contenido por líneas.',
    silhouette: 'Marcos rectos de 1px con marcas de esquina. Los elementos comparten borde en vez de separarse.',
    form: 'Radio 0. Sombra nunca. Densidad alta, fila de 30px. Las etiquetas van fuera del marco, en versalitas. Un botonera es un marco continuo, no tres botones sueltos.'
  },
  {
    id: 'C',
    finalista: true,
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
    id: 'G',
    name: 'Banda',
    tagline: 'Sin tarjetas. Estratos de borde a borde.',
    silhouette: 'Franjas horizontales a sangre completa, separadas por un pelo de línea y un cambio de tono. Un raíl fijo de etiquetas a la izquierda.',
    form: 'Ninguna caja. La estructura la dan el raíl de etiquetas de 148px y una franja de color de 3px en el canto izquierdo que lleva el estado. Radio 0. Sombra nunca.'
  },
  {
    id: 'I',
    finalista: true,
    name: 'Cristal',
    tagline: 'Vidrio líquido sobre un campo de color.',
    silhouette: 'Paneles translúcidos que dejan pasar el fondo teñido, con un filo especular arriba. Nada opaco.',
    form: 'backdrop-filter de verdad: el fondo es un campo de manchas de color y los paneles lo desenfocan. Radio 18–26px. El borde es luz, no línea: 1px blanco al 65 % más un realce interior arriba.'
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
    finalista: true,
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
    finalista: true,
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
  },
  {
    id: 'T',
    name: 'Halo claro',
    tagline: 'Halo, pero de día. La luz define las cosas sobre papel.',
    silhouette: 'Formas sin un solo borde sobre blanco tibio, cada una con un anillo de color y un resplandor propio.',
    form: 'La regla de Halo se conserva entera: nada tiene borde ni relleno sólido, un elemento existe porque irradia. Lo que cambia es de qué lado está la luz. Sobre papel, el resplandor es un halo de color proyectado hacia afuera más un anillo de 1px del mismo tono. El acento es un color saturado que brilla por sí mismo.',
    hermana: 'K',
    finalista: true
  },
  {
    id: 'U',
    name: 'Cristal halo',
    tagline: 'Vidrio, pero el estado es luz y no una banda.',
    silhouette: 'Paneles translúcidos sobre un campo de color, y lo que urge no se rellena: irradia.',
    form: 'Toma el material de Cristal y la regla de Halo. Ninguna banda de tono en toda la dirección — el estado es un anillo de 1px en su color más un resplandor hacia afuera. Además de ser otra cosa, arregla el defecto de Cristal: una banda translúcida sobre una fila ya teñida se pintaba dos y tres veces y el contraste dependía de cuántas capas hubiera debajo. La luz no se apila.',
    mezcla: 'I + T',
    finalista: true
  },
  {
    id: 'V',
    name: 'Cristal macizo',
    tagline: 'Todo es vidrio. Lo único sólido es lo que se puede tocar.',
    silhouette: 'Superficies translúcidas por todas partes, y encima objetos opacos y compactos: los controles.',
    form: 'Misma página de vidrio, pero la capa interactiva es maciza. Botones y campos son sólidos, sin desenfoque y sin transparencia, con su propia sombra de contacto. La consecuencia es que la opacidad pasa a ser la señal de affordance: se sabe qué se puede tocar por lo que NO deja pasar el fondo. Lo transparente es página; lo opaco es control.',
    mezcla: 'I + affordance material',
    finalista: true
  },
  {
    id: 'W',
    name: 'Cristal templado',
    tagline: 'Vidrio donde sirve. Opaco donde estorba. Halo solo donde urge.',
    silhouette: 'Paneles translúcidos sobre un campo de color, tablas planas y tranquilas, y una sola fila que irradia: la vencida.',
    form: 'Cristal con tres correcciones y una regla de reserva. Nada que FLOTE es translúcido: menús, desplegables, diálogos y globos van sólidos, porque un menú translúcido deja que el texto de abajo se cruce con el de arriba y ninguno de los dos se lee. Las filas de tabla vuelven a ser planas, con banda opaca y sin anillo ni margen, porque una tabla de objetos flotantes es engorrosa de leer. Las fichas de filtro son las de Cristal, que ya funcionaban. Y el halo queda reservado a lo crítico: si todo brilla, nada urge.',
    mezcla: 'I corregido',
    finalista: true
  },
  {
    id: 'X',
    name: 'Cota',
    tagline: 'El color es solo estado. La estructura es la medida.',
    silhouette: 'Papel mate y tinta. Ni un degradado, ni un vidrio, ni una sombra difusa. Bajo cada cifra medida corre un riel con la marca de su tope.',
    form: 'Cota es la marca de nivel en un dibujo técnico: el punto contra el que se mide todo. Dos reglas la sostienen. Primera, el color está RESERVADO al estado — el cromo es acromático de punta a punta, así que cada píxel de color en pantalla significa algo y el ojo lo busca. Segunda, ninguna cifra medida aparece sola: va sobre un riel con la marca de su tope, así que «312 h» se lee contra las 250 h del plan sin que nadie tenga que restar. El acento por defecto es tinta, no un color: es una ranura que cada producto llena.',
    definitivo: true,
    finalista: true
  }
];

export const byId = Object.fromEntries(DIRECTIONS.map((d) => [d.id, d]));
