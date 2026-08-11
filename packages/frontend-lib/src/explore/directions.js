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
    id: 'C',
    finalista: true,
    name: 'Marca',
    tagline: 'Un color de marca sostiene la estructura.',
    silhouette: 'Bloques con cabecera llena de color. El contenedor se anuncia por su cabecera, no por su borde.',
    form: 'Cabecera sólida en color de marca con texto claro, cuerpo blanco. Radio 4–10px. El color es estructura: identifica el bloque, no lo decora.',
    swappable: 'El color de marca se cambia en un token. Aquí va teal profundo por defecto.'
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
    id: 'M',
    finalista: true,
    name: 'Bruma',
    tagline: 'El color se derrama en vez de encajonarse.',
    silhouette: 'Sin contenedores. Manchas de color desenfocadas que se posan detrás del contenido y se desvanecen sin filo.',
    form: 'Ningún panel tiene relleno ni borde. El estado es una mancha radial difuminada que se derrama por detrás. Titulares en serif, texto en sans: es la única dirección con dos familias tipográficas.'
  },
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
    id: 'T',
    name: 'Halo claro',
    tagline: 'La luz define las cosas sobre papel.',
    silhouette: 'Formas sin un solo borde sobre blanco tibio, cada una con un anillo de color y un resplandor propio.',
    form: 'Nada tiene borde ni relleno sólido: un elemento existe porque irradia. Sobre papel el resplandor es un halo de color proyectado hacia afuera más un anillo de 1px del mismo tono. El acento es un color saturado que brilla por sí mismo.',
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
    silhouette: 'Planos translúcidos que flotan a distintas alturas, sin un solo borde. Lo que urge sobresale del margen y respira luz.',
    form: 'NI UN BORDE en toda la dirección: el vidrio real no tiene un trazo de 1px, tiene un reflejo especular arriba y una refracción oscura abajo. La profundidad reemplaza a la línea, y hay tres alturas que significan algo: base, plano levantado y flotante. Lo que urge no se subraya, sobresale del margen y respira luz. Encima, tres correcciones y una regla de reserva. Nada que FLOTE es translúcido: menús, desplegables, diálogos y globos van sólidos, porque un menú translúcido deja que el texto de abajo se cruce con el de arriba y ninguno de los dos se lee. Las filas de tabla vuelven a ser planas, con banda opaca y sin anillo ni margen, porque una tabla de objetos flotantes es engorrosa de leer. Las fichas de filtro son las de Cristal, que ya funcionaban. Y el halo queda reservado a lo crítico: si todo brilla, nada urge.',
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
  },
  {
    id: 'Y',
    name: 'Prisma pastel',
    tagline: 'Prisma, pero la marca es morada y la escala de estados es pastel.',
    silhouette: 'Las mismas tarjetas de vidrio flotando sobre el campo teñido, con la cabecera en degradado lavanda a rosa.',
    form: 'Prisma entero sin tocar el material: sombra real, vidrio sobre el campo, marca dentro del vidrio. Lo que cambia es la paleta. El morado no compite con ninguna de las cuatro señales de estado —verde, ámbar, rojo, azul—, y eso es lo que permite bajar las cuatro a pastel sin que ninguna se confunda con el cromo. Las bandas pierden saturación, las tintas no: en vidrio la banda ya se aclara sola contra el campo, así que aclarar además el texto dejaría la fila sin contraste por ningún lado.',
    mezcla: 'O + pastel',
    hermana: 'Z',
    finalista: true
  },
  {
    id: 'Z',
    name: 'Prisma pastel liso',
    tagline: 'La misma marca, para cuando no hay campo detrás.',
    silhouette: 'Tarjetas opacas sobre un liso lavanda pálido. Ni una superficie deja pasar el fondo.',
    form: 'Misma paleta exacta que su hermana, material distinto. El vidrio depende de que haya algo que desenfocar, y en producto el fondo lo pone el cliente: muchas veces es un liso. Sin campo detrás el backdrop-filter no desenfoca nada, así que se cae entero y la elevación vuelve a la sombra —teñida de morado, porque una sombra neutra bajo una cabecera lavanda parece suciedad—. Al perder el vidrio las bandas de estado pasan a opacas: una banda translúcida sobre una superficie ya opaca se apila cuando hay una píldora sobre una fila teñida, y el contraste termina dependiendo de cuántas capas haya debajo.',
    hermana: 'Y',
    finalista: true
  },
  {
    id: 'AA',
    name: 'Prisma vivo',
    tagline: 'El morado con fuerza, y la cifra medida contra su total.',
    silhouette: 'Vidrio sobre un campo lavanda. Bajo cada KPI corre un riel que dice qué parte del total es esa cifra, y la celda vencida es la única teñida.',
    form: 'Y bajó la saturación de todo a la vez —marca y estados— y quedó correcto pero apagado: una pantalla con ocho equipos vencidos se lee igual de tranquila que una sin ninguno. Acá el morado sube un 65 % y las cuatro señales suben con él, porque si el cromo se fortalece solo termina gritando más que el estado. El KPI gana la escala que le faltaba: «8» y «62» se dibujan al mismo cuerpo, así que pesan igual en la mirada aunque una sea ocho veces la otra, y el riel hace la división que si no hay que hacer contra el 88 del titular. El tinte de celda queda reservado a lo vencido: si las cuatro se tiñen, ninguna urge.',
    mezcla: 'Y con la saturación subida',
    hermana: 'Y',
    finalista: true
  },
  {
    id: 'AB',
    name: 'Prisma faro',
    tagline: 'El KPI es lo único que emite luz, y brilla en proporción a lo que urge.',
    silhouette: 'Prisma sin tocar —vidrio, sombra, cabecera teñida— con una tira de cifras encendidas debajo. Cada celda irradia en su tono, y la que no tiene dato está apagada.',
    form: 'AA marca lo urgente tiñendo la celda vencida: teñida o no teñida, dos estados. La flota no es binaria —hay algo vencido, algo por vencer y algo que sólo hay que mirar de reojo— y una escala de dos posiciones obliga a leer las cifras para saber cuál es cuál. Acá la señal es la luz, que sí tiene grados: lo vencido quema, lo que está por vencer arde despacio, lo que va al día apenas tibia, y lo que no tiene dato no brilla. La tira se lee de una pasada por dónde está encendida. El tinte de celda de AA se va, porque el tinte y el resplandor dicen lo mismo y el que dice menos es el tinte. No es otra dirección de halo: en Halo claro, Cristal halo y Cristal templado el resplandor es el idioma de la página entera; acá emite UNA familia de elementos y el resto es Prisma. Es la diferencia entre una pantalla que brilla y una pantalla con un tablero encendido.',
    mezcla: 'AA + luz graduada',
    hermana: 'AA',
    finalista: true
  },
  {
    id: 'AC',
    name: 'Prisma sobrio',
    tagline: 'La forma de Prisma sobre blanco: el cromo entero se queda sin color.',
    silhouette: 'Tarjetas blancas de esquina blanda sobre blanco, separadas sólo por una línea fina y una sombra. Ni un degradado, ni una etiqueta morada, ni un fondo teñido. Lo único saturado en toda la pantalla es el botón primario.',
    form: 'Z tiene la forma correcta y el color en seis sitios a la vez: el fondo, la cabecera en degradado, TODAS las etiquetas, las líneas, los bordes y la sombra. Seis usos distintos del morado significan que el morado no dice nada — es decoración repartida. Acá el color se retira de TODO el cromo —fondo incluido— y queda en dos sitios: el acento y el estado. El fondo blanco es la decisión que más cuesta y la que más devuelve: una tarjeta blanca sobre un campo teñido se lee sola por diferencia de tono, y sobre blanco pasa a depender de dos cosas, la línea y la sombra, que por eso van más marcadas que en Z. A cambio, la marca deja de estar en el 100 % de los píxeles. La cabecera pierde el degradado lavanda→rosa y se aplana a un tono neutro; las etiquetas bajan de morado a tinta terciaria; la línea y el borde pasan a gris con una traza de marca para que no ensucien sobre el campo teñido; la tinta pierde el sesgo violeta. Lo que NO se toca es la forma: mismo radio de 12 y 22, misma sombra real, mismas superficies opacas, mismos pasteles de estado. La ganancia es el acento: en Z el botón primario compite con una cabecera teñida y seis etiquetas de su propio color, y acá es lo único saturado de la página. Un acento que no compite con nada es un acento que no hay que explicar.',
    mezcla: 'Z con el cromo podado',
    hermana: 'Z',
    finalista: true
  },
  {
    id: 'AD',
    name: 'Nácar',
    tagline: 'Todo blanco, y lo que separa una pieza de otra es luz, no línea.',
    silhouette: 'Blanco sobre blanco de punta a punta. La barra superior no tiene raya: deja caer un resplandor corto. Las tarjetas flotan por sombra. Lo único saturado es el botón primario y las bandas de estado.',
    form: 'Plantilla nueva, no una variante. Toma tres cosas de tres sitios y las reescribe juntas. De Prisma, la FORMA: radio de 12 y 22, superficies opacas, sombra real, pasteles de estado. De Cristal, la TABLA: la escalera de densidad de tres escalones —cabecera sólida porque es lo que no se mueve, fila bajo el cursor tenue, fila en reposo transparente—, que es lo único que mantiene legible una tabla de ocho columnas. De Halo claro, la BARRA: no se separa con una línea sino con la luz que deja caer, y acá va a un tercio de la fuerza de T, que sobre blanco es lo que hace la diferencia entre una barra que flota y una barra que gotea. El resto es la ley de la librería: el cromo no lleva color. Etiquetas en tinta, líneas en gris con una traza de marca para que no se lean verdosas al lado del acento, fondo blanco liso. El acento y el estado son el único color de la pantalla, y por eso los dos se ven sin explicarse.',
    mezcla: 'forma de Prisma + tabla de Cristal + barra de Halo claro',
    finalista: true
  }
];

export const byId = Object.fromEntries(DIRECTIONS.map((d) => [d.id, d]));
