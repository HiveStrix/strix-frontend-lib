// The tokens, a second time, as a string.
//
// WHY THIS EXISTS AND IS NOT A DUPLICATE
//
// Strix ships two kinds of frontend and they consume tokens differently:
//
//   • A SvelteKit app (the Shell, Sarion) loads `tokens.css` into the document.
//     Custom properties inherit down normally and everything just works.
//
//   • A Core module is a Svelte custom element rendering in an OPEN SHADOW ROOT
//     under a strict CSP. Custom properties DO inherit across the shadow
//     boundary, so a module mounted inside the Shell picks the document's
//     tokens up for free — but a module must also work when nothing above it
//     defined them, and it cannot @import a stylesheet the CSP forbids. So it
//     needs to carry its own copy on `:host`.
//
// Keeping the copy here, generated from one source of truth, is the difference
// between "two places to change a colour" and "one place, two shapes". The CSS
// file is written from THIS object at build time — never edit tokens.css by
// hand; edit `TOKENS` and run `npm run tokens`.

/** The light theme: role tokens, tones, and the scales. */
export const TOKENS = {
  // LA PERILLA DEL CROMO. Es un COLOR y no un porcentaje, a propósito: ligarla a
  // un neutro devuelve grises puros, así que un core que no quiera la traza
  // violeta cambia UNA propiedad y no once. Su valor por defecto es el morado de
  // Nácar.
  '--sx-chrome-tint': '#6541BE',

  // La rampa: neutros con una traza de la perilla. No es "gris teñido de marca"
  // — la traza es del 4 al 8 %, que afina sin leerse como color. Un gris puro al
  // lado de un acento morado se lee verdoso; eso es lo que corrige.
  '--sx-n-0': '#FFFFFF',
  '--sx-n-50': 'color-mix(in srgb, var(--sx-chrome-tint) 4%, #FAFAFB)',
  '--sx-n-100': 'color-mix(in srgb, var(--sx-chrome-tint) 5%, #F4F4F6)',
  '--sx-n-150': 'color-mix(in srgb, var(--sx-chrome-tint) 6%, #EDEDF0)',
  '--sx-n-200': 'color-mix(in srgb, var(--sx-chrome-tint) 8%, #DDDDE2)',
  '--sx-n-300': 'color-mix(in srgb, var(--sx-chrome-tint) 8%, #BBBBC2)',
  // n-400 es donde aterriza --sx-edge, el borde de un control.
  //
  // SU BASE SE OSCURECIÓ DE #8E8E93 A #828287, y la razón es que un borde tiene
  // dos lados. El valor viejo daba 3.47:1 contra blanco y cumplía — pero un
  // control en hover, o un checkbox dentro de una fila seleccionada, tiene su
  // borde rodeado de --sx-accent-soft por los dos lados, y ahí caía a 2.71.
  // Contra blanco cumplía y contra sí mismo no. Con la perilla del cromo en un
  // neutro el margen era todavía más chico, así que la base tiene que aguantar
  // las dos configuraciones:
  //     contra blanco:            4.03 morado / 3.77 gris
  //     contra --sx-accent-soft:  3.46 morado / 3.24 gris
  // NO puede salir de la escala de tercios del resto del cromo: para llegar a
  // 3:1 mezclando marca haría falta un 64 %, que es un borde morado franco y no
  // mobiliario.
  //
  // SEGUNDA VEZ QUE SE OSCURECE, y por el mismo motivo: apareció un estado nuevo
  // debajo suyo. Con --sx-accent-pick (18 %) como fondo, la base #828287 daba
  // 3.05 morado / 2.86 gris. #7A7A7F da 3.38 / 3.16, y contra blanco sube de
  // 4.03 a 4.47.
  '--sx-n-400': 'color-mix(in srgb, var(--sx-chrome-tint) 8%, #7A7A7F)',
  // n-500 es --sx-neutral, que se dibuja SOBRE n-100. Su base da 4.95:1 con la
  // traza y 4.69:1 sin ella. En la dirección A daba 4.16 y estaba por debajo
  // de AA sin que nadie lo hubiera medido.
  //
  // También se oscurece por --sx-accent-pick: sobre ese relleno, la base #66666C
  // daba 4.42 morado / 4.12 gris, por debajo de AA. #5E5E64 da 4.94 / 4.60.
  '--sx-n-500': 'color-mix(in srgb, var(--sx-chrome-tint) 8%, #5E5E64)',
  '--sx-n-700': 'color-mix(in srgb, var(--sx-chrome-tint) 8%, #414146)',
  '--sx-n-800': 'color-mix(in srgb, var(--sx-chrome-tint) 8%, #27272B)',
  '--sx-n-900': 'color-mix(in srgb, var(--sx-chrome-tint) 7%, #1B1B1E)',

  // Los roles: qué es cada cosa, no de qué color es. Un producto que necesita
  // mover UNA cosa pisa el rol; uno que necesita mover todo lo que dependa de un
  // peldaño pisa la primitiva.
  //
  // El fondo es BLANCO, no un peldaño de la rampa. Es la silueta de Nácar: la
  // tarjeta no se lee por diferencia de tono contra el campo sino por la sombra
  // que deja. Es la desviación deliberada respecto de Prisma pastel.
  '--sx-ground': 'var(--sx-n-0)',
  '--sx-surface': 'var(--sx-n-0)',
  '--sx-sunk': 'var(--sx-n-50)',
  // --sx-line separa filas y cierra cabeceras: es AMBIENTE y puede ser tenue.
  '--sx-line': 'var(--sx-n-150)',
  // --sx-edge es el límite de un CONTROL: dice dónde se puede escribir. Eso es
  // información, no decoración, y por eso salta cuatro peldaños respecto de
  // --sx-line en vez de acompañarlo. Los dos compartían token en la dirección A
  // y por eso el borde de un input daba 1.52:1.
  '--sx-edge': 'var(--sx-n-400)',
  '--sx-ink': 'var(--sx-n-900)',
  '--sx-ink-2': 'var(--sx-n-700)',
  '--sx-ink-3': 'var(--sx-n-500)',
  '--sx-ink-on': 'var(--sx-n-0)',
  // EL ENCABEZADO. Token propio y no --sx-sunk, porque --sx-sunk también pinta
  // los controles de formulario: cambiarle el color al encabezado movía también
  // los inputs. Mueve cabecera de tabla, cabecera de panel y pie de panel.
  //
  // ESTUVO EN BLANCO PURO Y ERA UN DEFECTO. La dirección pide un tinte al 6 %
  // (explore, [data-d='AD']); en blanco, tres piezas dejaron de existir: el pie
  // del panel quedaba blanco sobre una tarjeta blanca, la declaración de .head
  // era un no-op, y la cabecera de tabla no se separaba de sus filas.
  '--sx-thead': 'color-mix(in srgb, var(--sx-chrome-tint) 6%, #FFFFFF)',
  // LA FIRMA de Nácar: la luz que deja caer la barra superior en vez de una
  // raya. Ligarlo a `transparent` la apaga sin tocar ninguna regla.
  //
  // SUBIÓ DE 55 A 70 % después de mirarlo en pantalla. El 55 % venía de partir a
  // la mitad el valor de la dirección de origen (T · Halo claro, que lo pinta a
  // opacidad plena), y sobre blanco quedaba por debajo del umbral en que se
  // percibe: un resplandor sobre papel se apaga mucho más rápido que sobre un
  // fondo teñido. La geometría NO se toca — está calibrada al límite de lo
  // visible y bajarla no la hace discreta, la hace invisible. Lo que gradúa la
  // discreción es este porcentaje y sólo éste.
  '--sx-halo': 'color-mix(in srgb, var(--sx-accent) 70%, transparent)',

  // EL HUECO DEL ACENTO. Un producto lo llena ligando estas cuatro propiedades
  // en su raíz; es el único color que un producto elige.
  //
  // POR QUÉ EL DEFECTO YA NO ES CASI-NEGRO. Antes lo era, con el argumento de
  // que un acento sin ligar debía dar un primario usable. El argumento se cae en
  // Nácar por una razón mecánica: --sx-chrome-tint ya vale este mismo morado, así
  // que el mobiliario entero sale con su traza. Un acento casi-negro contra un
  // cromo violeta no es neutral: es una dirección desafinada de fábrica.
  '--sx-accent': '#6541BE',
  // Blanco sobre este morado da 6.88:1 — por encima de 4.5 con margen.
  '--sx-accent-ink': '#FFFFFF',
  // SIGUEN AL ACENTO. Eran dos peldaños fijos de la rampa, o sea grises: un
  // estado interactivo pintado con ellos se lee como una superficie más sucia,
  // no como una pieza que responde.
  //
  // EL 10 % ESTÁ MEDIDO Y NO ELEGIDO, y bajó desde 16 % por una razón que sólo
  // se ve mirando lo que va ENCIMA. A 16 % este token hacía dos trabajos —el
  // hover y el «seleccionado»— y para que el hover despegara tenía que gritar,
  // con lo cual se comía el contraste de lo que se dibujaba encima:
  //     --sx-edge  sobre accent-soft:  2.71  (piso 3.0)
  //     --sx-ink-3 sobre accent-soft:  4.57, y 4.25 con la perilla en gris
  // Al pasar «seleccionado» a su propio relleno, --sx-accent-pick (ver abajo),
  // este token se queda sólo con el hover y el focus, que son pasajeros y no
  // necesitan gritar. A 10 % (con las bases de n-400/n-500 ya oscurecidas por
  // --sx-accent-pick, ver ahí):
  //     --sx-edge  sobre accent-soft:  3.84 morado / 3.59 gris
  //     --sx-ink-3 sobre accent-soft:  5.61 morado / 5.22 gris
  '--sx-accent-soft': 'color-mix(in srgb, var(--sx-accent) 10%, #FFFFFF)',
  // EL RELLENO DE SELECCIÓN. Existe separado de --sx-accent-soft porque son dos
  // estados distintos y compartir token los volvía indistinguibles: seleccionar
  // una fila y pasar el puntero por la de al lado las dejaba iguales.
  //
  // POR QUÉ 18 %. Tiene que despegarse del hover (10 %) y aguantar lo que se
  // dibuja ENCIMA. Medido contra las dos configuraciones de --sx-chrome-tint:
  //     --sx-edge  encima:  3.38 morado / 3.16 gris   (piso 3.0)
  //     --sx-ink-3 encima:  4.94 morado / 4.60 gris   (piso 4.5)
  // A 20 % la tinta terciaria cae a 4.45 con la perilla en gris. 18 % es el
  // último escalón que aguanta las dos.
  '--sx-accent-pick': 'color-mix(in srgb, var(--sx-accent) 18%, #FFFFFF)',
  '--sx-accent-edge': 'color-mix(in srgb, var(--sx-accent) 28%, #FFFFFF)',

  // Semantic tones. Fixed across every product: "vencido" must look identical
  // in maintenance, billing and inventory or the vocabulary stops being one.
  '--sx-positive': '#2E6B3E',
  '--sx-positive-band': '#E4EFE2',
  '--sx-positive-edge': '#C3D8C4',
  '--sx-attention': '#8A5A00',
  '--sx-attention-band': '#FBEEDA',
  '--sx-attention-edge': '#E8D4A6',
  '--sx-critical': '#B3261E',
  '--sx-critical-band': '#FBE0DC',
  '--sx-critical-edge': '#EFC2BC',
  // Muted indigo, deliberately not blue: blue chrome is what every ERP already
  // looks like, and this is the one convention the system declines.
  '--sx-info': '#4A4E7A',
  '--sx-info-band': '#E7E7F2',
  '--sx-info-edge': '#C9CADD',
  // FIJADO A HEX, como los otros cuatro. Apuntaba a la rampa (n-500/n-100/n-200),
  // así que su color cambiaba con el cromo de cada dirección: «ninguno» se veía
  // distinto entre dos productos, que es exactamente lo que la ley prohíbe. Estos
  // son los valores que resolvía con el cromo de Nácar, congelados.
  '--sx-neutral': '#666373',
  '--sx-neutral-band': '#EDEBF3',
  '--sx-neutral-edge': '#D3D1DF',

  // Depth comes from light, not outlines. Sobre un fondo blanco la sombra es lo
  // único que levanta una pieza, así que lleva dos capas: una corta que da el
  // asiento y una larga que da el aire. El tinte NO es gris — una sombra gris
  // bajo una familia lavanda parece suciedad — pero lleva un tercio del violeta
  // de Prisma pastel, no el violeta entero.
  '--sx-e-1': '0 1px 2px rgba(30,28,44,.05), 0 8px 24px -10px rgba(30,28,44,.18)',
  '--sx-e-2': '0 2px 6px -2px rgba(30,28,44,.07), 0 16px 40px -14px rgba(30,28,44,.22)',
  '--sx-e-3': '0 2px 6px -2px rgba(30,28,44,.07), 0 24px 56px -18px rgba(30,28,44,.28)',
  '--sx-e-inset': 'inset 0 1px 0 rgba(255,255,255,.9)',

  // La forma de Prisma: 12 y 22. Nada cuadrado, y nada casi-cuadrado.
  '--sx-r-1': '8px',
  '--sx-r-2': '12px',
  '--sx-r-3': '22px',
  '--sx-r-pill': '999px',

  // Major third off 15 — the smallest size that survives a dirty screen at
  // arm's length.
  '--sx-t-2xs': '11px',
  '--sx-t-xs': '12.5px',
  '--sx-t-sm': '13.5px',
  '--sx-t-md': '15px',
  '--sx-t-lg': '19px',
  '--sx-t-xl': '25px',
  '--sx-t-2xl': '33px',
  '--sx-t-3xl': '46px',
  '--sx-w-normal': '400',
  '--sx-w-medium': '550',
  '--sx-w-semi': '620',
  '--sx-w-bold': '700',

  // A system stack by constraint: @font-face inside a shadow root is ignored by
  // Chrome and Safari, so an embedded face would silently not load in exactly
  // the surfaces this library exists to serve. Personality comes from
  // treatment — weight contrast, negative tracking, tabular figures.
  '--sx-font':
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI Variable Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  '--sx-font-mono':
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Roboto Mono", monospace',

  // Quarters of a 16 rhythm. Every gap in the system is one of these.
  '--sx-s-1': '4px', '--sx-s-2': '8px', '--sx-s-3': '12px', '--sx-s-4': '16px',
  '--sx-s-5': '20px', '--sx-s-6': '24px', '--sx-s-8': '32px', '--sx-s-10': '40px',
  '--sx-s-12': '48px', '--sx-s-16': '64px', '--sx-s-20': '80px',

  // Motion earns its place by doing a job. Never ambience.
  '--sx-ease': 'cubic-bezier(.2, .8, .2, 1)',
  '--sx-fast': '120ms',
  '--sx-beat': '220ms',
  '--sx-slow': '380ms',

  // The veil behind anything that took the screen. It is a ROLE and not a mix
  // of the neutral ramp, because the ramp does NOT re-bind in dark: mixing
  // `--sx-n-900` over an `--sx-n-900` ground is exactly nothing, at any
  // percentage, and three components had independently discovered that and
  // patched around it three different ways.
  '--sx-scrim': 'rgba(26, 24, 34, .46)',

  '--sx-touch': '44px',
  '--sx-z-sticky': '40',
  '--sx-z-overlay': '900',
  '--sx-z-toast': '1100'
};

/** Dark is a re-binding of the roles, never a second stylesheet. */
export const TOKENS_DARK = {
  '--sx-ground': 'var(--sx-n-900)',
  '--sx-surface': 'var(--sx-n-800)',
  '--sx-sunk': '#1B1F22',
  '--sx-line': '#2C3134',
  // FIJADO A HEX, y no a un peldaño de la rampa, por la misma razón que
  // --sx-ink-3 más abajo: un borde tiene DOS LADOS y los tres fondos posibles
  // debajo suyo (superficie, hover, selección) mandan el peor caso.
  //     contra --sx-surface:      5.10  (piso 3.0)
  //     contra --sx-ground:       5.91  (piso 3.0)
  //     contra --sx-accent-soft:  3.98  (piso 3.0)
  //     contra --sx-accent-pick:  3.05  (piso 3.0) — el que manda
  // El valor viejo, #3A3F43, daba 1.33 contra superficie: un borde casi
  // invisible sobre su propio fondo, que es la clase de defecto que este
  // arnés existe para atrapar y que nada atrapaba porque nada lo medía en
  // este tema.
  '--sx-edge': '#9C9AA1',
  '--sx-ink': '#EDEFF0',
  '--sx-ink-2': '#BCC1C4',
  // SUBIÓ DE #8E9498 A #BEBDC1. El valor viejo pasaba sobre --sx-surface
  // (4.62) pero fallaba sobre los dos estados que --sx-accent-pick y
  // --sx-accent-soft producen una vez que esos dos dejan de heredar del claro
  // (ver abajo): 4.29 sobre hover, 2.99 sobre selección — el defecto que trajo
  // esta tarea. Con #BEBDC1: 7.59 / 5.92 / 4.54, este último al límite porque
  // --sx-accent-pick es el fondo más claro de los tres y el que menos margen
  // deja.
  //
  // Y ES UN HEX FIJO A PROPÓSITO, no un `var(--sx-n-400)`: n-400 es el peldaño
  // que --sx-edge (el claro) usa, y ya se movió dos veces en este trabajo por
  // razones que no tienen nada que ver con el oscuro — la próxima vez que se
  // mueva por el claro, el oscuro no puede quedar colgando de ese ajuste.
  '--sx-ink-3': '#BEBDC1',
  '--sx-ink-on': 'var(--sx-n-900)',
  // EL ENCABEZADO. Mismo rol que en claro — separar cabecera de tabla, pie de
  // panel — pero la dirección se invierte: en claro el thead es la superficie
  // con un tinte del 6%; en oscuro, oscurecer la superficie la hunde, y una
  // cabecera más oscura que su propia tarjeta se lee como un agujero recortado
  // en la tarjeta, no como una banda posada sobre ella. Aclararla un 6% con
  // blanco hace el mismo trabajo que el tinte del claro —una banda apenas
  // distinta— pero en la dirección que en oscuro SÍ se ve como una banda:
  // #393643 sobre #2C2937, 1.09:1 entre sí (no es texto, es ambiente; no está
  // en el contrato duro por la misma razón que en claro).
  //
  // Se deriva de --sx-surface en vez de fijarse a hex porque no hay ningún
  // peldaño de otro tema tirando de él — es una banda nueva, no algo heredado
  // de la dirección vieja — así que puede seguir a la superficie si el gris de
  // base se recalibra.
  '--sx-thead': 'color-mix(in srgb, #FFFFFF 6%, var(--sx-surface))',
  // LA FIRMA, en oscuro. En claro el halo es el acento al 70% porque un
  // resplandor morado sobre PAPEL se apaga rápido y necesita casi opacidad
  // plena para notarse. En oscuro el acento es #EDEFF0 —casi blanco— y el
  // fondo es oscuro: la relación de contraste ya está invertida y a favor del
  // halo, así que la misma fuerza que en claro apenas se insinúa acá sería un
  // foco de luz cayendo sobre la barra.
  //
  // 18% ES LA CIFRA QUE SE ELIGIÓ, no medida por el arnés —este token no está
  // en el contrato duro ni en el informativo, porque no es una relación de
  // texto ni de borde: es una sombra translúcida, y su intensidad es un juicio
  // de diseño, no un número que un piso WCAG resuelva—. Se razonó así: el
  // salto de --sx-accent-soft (8% de blanco) a --sx-accent-pick (16%) ya
  // define cuánto “aclarado” se nota como estado interactivo en esta
  // superficie; 18% cae apenas sobre ese techo, que para una sombra DECORATIVA
  // (no un fondo sólido, con blur 28px y spread -18px difuminándola más
  // todavía) debería leerse como una insinuación y no como una superficie
  // encendida. Nadie lo confirmó todavía mirando la pantalla — ver el reporte.
  '--sx-halo': 'color-mix(in srgb, var(--sx-accent) 18%, transparent)',
  '--sx-accent': '#EDEFF0',
  '--sx-accent-ink': 'var(--sx-n-900)',
  // LA TRAMPA CENTRAL DE ESTE TEMA. En claro, --sx-accent-soft y
  // --sx-accent-pick OSCURECEN el blanco mezclando el acento adentro: son
  // fondos de estado que se separan de la superficie volviéndose más oscuros.
  // En oscuro la superficie YA es oscura — oscurecerla más la funde con el
  // fondo y el estado desaparece. El mismo nombre de token, el trabajo
  // opuesto: acá ACLARAN la superficie mezclando blanco, no el acento.
  //
  // Por qué blanco y no --sx-accent: el acento en oscuro YA es casi blanco
  // (#EDEFF0), así que mezclarlo daría casi lo mismo que mezclar blanco puro,
  // pero decirlo con blanco es lo que describe el movimiento real —«aclarado»,
  // no «teñido de marca»— y no ata el estado a lo que un producto decida hacer
  // con su acento en oscuro.
  //
  // 8% para hover, 16% para selección — la misma proporción 1:2 que separa
  // --sx-accent-soft (10%) de --sx-accent-pick (18%) en claro, adaptada a que
  // acá el rango disponible antes de que el borde o la tinta empiecen a fallar
  // es más angosto. Sobre la superficie oscura de Nácar (#2C2937):
  //     --sx-accent-soft → #3D3A47   --sx-edge encima: 3.98 · --sx-ink-3: 5.92
  //     --sx-accent-pick → #4E4B57   --sx-edge encima: 3.05 · --sx-ink-3: 4.54
  // Los dos al límite de abajo, no de arriba: subir el porcentaje aclara de
  // más y --sx-ink-3 es el primero en caer por debajo de 4.5.
  '--sx-accent-soft': 'color-mix(in srgb, #FFFFFF 8%, var(--sx-surface))',
  // ANTES DE ESTA TAREA, ESTE TOKEN NO EXISTÍA EN OSCURO Y HEREDABA EL DE
  // CLARO: un lavanda pensado para OSCURECER blanco, cayendo sobre una
  // superficie que ya era oscura. La fila seleccionada se pintaba con ese
  // lavanda y encima la tinta oscura —pensada para leerse sobre gris oscuro,
  // no sobre lavanda claro— caía a 2.99 contra un piso de 4.5. Es el defecto
  // que dio origen a esta tarea.
  '--sx-accent-pick': 'color-mix(in srgb, #FFFFFF 16%, var(--sx-surface))',
  '--sx-accent-edge': '#3A3F43',
  // The bands invert to low-chroma fills: a pale band with dark text does not
  // survive being dropped onto a dark ground.
  '--sx-positive': '#8FCB9B', '--sx-positive-band': '#1D2C21', '--sx-positive-edge': '#2E4436',
  '--sx-attention': '#E7BE72', '--sx-attention-band': '#2E2415', '--sx-attention-edge': '#48381E',
  '--sx-critical': '#F0A79E', '--sx-critical-band': '#331B18', '--sx-critical-edge': '#4D2823',
  '--sx-info': '#ACADD6', '--sx-info-band': '#1F2033', '--sx-info-edge': '#33344F',
  // APUNTABA A var(--sx-n-400) — el mismo peldaño de la rampa que --sx-edge
  // (el claro) usa y que ya se movió dos veces por razones ajenas al oscuro.
  // Colgado de ahí daba 3.37 contra --sx-neutral-band, por debajo del piso de
  // 4.5, y encima quedaba a merced del próximo ajuste del claro. Se liga a
  // --sx-ink-3 en vez de fijarse a un hex propio: son el mismo trabajo —una
  // tinta gris clara, legible sobre superficies oscuras, que no puede depender
  // de un peldaño ajeno— y «ninguno» hereda directamente la garantía ya
  // verificada de --sx-ink-3 en lugar de duplicar el mismo número dos veces.
  // Da 8.06 contra --sx-neutral-band (piso 4.5).
  '--sx-neutral': 'var(--sx-ink-3)', '--sx-neutral-band': '#23272A', '--sx-neutral-edge': '#3A3F43',
  // Heavier in dark, and pure black rather than the ramp: on a near-black ground
  // the only thing that still reads as «behind» is more absence of light.
  '--sx-scrim': 'rgba(0, 0, 0, .62)',
  '--sx-e-1': '0 1px 2px rgba(0,0,0,.4)',
  '--sx-e-2': '0 6px 16px -4px rgba(0,0,0,.5), 0 2px 6px -2px rgba(0,0,0,.4)',
  '--sx-e-3': '0 24px 48px -16px rgba(0,0,0,.6), 0 6px 14px -6px rgba(0,0,0,.45)',
  '--sx-e-inset': 'inset 0 1px 0 rgba(255,255,255,.05)'
};

const decls = (o) => Object.entries(o).map(([k, v]) => `  ${k}: ${v};`).join('\n');

/**
 * The tokens as a CSS block for a given selector.
 *
 * A Core module calls `hostTokens()` and drops the result into its root
 * component's own <style>, so the very first paint is already themed and the
 * module owes the document nothing. A SvelteKit app imports `tokens.css`
 * instead and never touches this.
 */
export const hostTokens = (selector = ':host') =>
  `${selector} {\n${decls(TOKENS)}\n}\n`;

export const hostTokensDark = (selector = ':host([data-sx-theme="dark"])') =>
  `${selector} {\n${decls(TOKENS_DARK)}\n}\n`;

/**
 * The three type registers, the focus rule and the screen-reader-only rule, as
 * a string, for the same reason `hostTokens` exists.
 *
 * Components in this library write `class="sx-cap"`, `class="sx-num"`,
 * `class="sx-id"` and `class="sx-sr"` on their own markup. In a document those
 * classes come from `base.css`. In a shadow root they come from NOWHERE unless
 * the module carries them, and the failure is silent and ugly: labels stop
 * being uppercase, figures stop lining up, and every visually-hidden name in a
 * Table paints itself on screen. So a Core inlines `hostTokens() + hostBase()`
 * in its root component's `<style>` and the classes are true in both shapes.
 *
 * The reset (`box-sizing`, `body`) is deliberately NOT here: a shadow root has
 * no body, and `*` inside one is the module's own business.
 */
export const hostBase = () => `
.sx-cap {
  font-size: var(--sx-t-2xs);
  font-weight: var(--sx-w-semi);
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--sx-ink-3);
}
.sx-id { font-family: var(--sx-font-mono); font-size: .94em; letter-spacing: -.015em; }
.sx-num {
  font-variant-numeric: tabular-nums lining-nums slashed-zero;
  font-feature-settings: "tnum" 1, "lnum" 1, "zero" 1;
}
.sx-sr {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip-path: inset(50%); white-space: nowrap; border: 0;
}
:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: 2px; border-radius: var(--sx-r-1); }
:host([data-sx-theme="dark"]) :focus-visible { outline-color: var(--sx-n-0); }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
`;

/** What `tokens.css` is generated from. Keeps the two shapes honest. */
export const stylesheet = () =>
  `${hostTokens(':root')}\n${hostTokensDark(':root[data-sx-theme="dark"], .sx-dark')}`;
