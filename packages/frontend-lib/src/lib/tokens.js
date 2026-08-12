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
  // RETINTADOS con la traza de --sx-chrome-tint, igual que toda la rampa del
  // claro — antes eran hex sueltos de la dirección anterior, sin el 8% que el
  // resto del sistema lleva, y por eso el oscuro se leía de otra familia que
  // el claro. `--sx-edge` sobre `--sx-sunk` sigue en el contrato duro
  // (piso 3.0) y aguanta de sobra: 5.68 morado / 5.35 gris.
  '--sx-sunk': 'color-mix(in srgb, var(--sx-chrome-tint) 8%, #1B1F22)',
  '--sx-line': 'color-mix(in srgb, var(--sx-chrome-tint) 8%, #2C3134)',
  // FIJADO A HEX, y no a un peldaño de la rampa, por la misma razón que
  // --sx-ink-3 más abajo: un borde tiene DOS LADOS y los tres fondos posibles
  // debajo suyo (superficie, hover, selección) mandan el peor caso. Medido
  // contra la matriz completa (2 temas × 2 perillas del cromo), el peor caso
  // es siempre --sx-accent-pick con la perilla en gris:
  //     contra --sx-surface:      5.10 morado / 4.78 gris  (piso 3.0)
  //     contra --sx-ground:       5.91 morado / 5.63 gris  (piso 3.0)
  //     contra --sx-accent-soft:  4.24 morado / 3.97 gris  (piso 3.0)
  //     contra --sx-accent-pick:  3.47 morado / 3.26 gris  (piso 3.0) — el que manda
  // El valor viejo, #3A3F43, daba 1.33 contra superficie: un borde casi
  // invisible sobre su propio fondo, que es la clase de defecto que este
  // arnés existe para atrapar y que nada atrapaba porque nada lo medía en
  // este tema.
  '--sx-edge': '#9C9AA1',
  // RETINTADO con la traza de --sx-chrome-tint al 4% — la misma idea que
  // --sx-n-50 en el claro (el peldaño más claro de la rampa lleva la traza
  // más liviana). Sigue dando 11.6:1 / 11.1:1 (morado/gris) contra
  // --sx-surface, muy por encima del piso de 4.5: había margen de sobra para
  // ganar coherencia sin arriesgar nada del contrato.
  '--sx-ink': 'color-mix(in srgb, var(--sx-chrome-tint) 4%, #EDEFF0)',
  // RETINTADO con la traza de --sx-chrome-tint al 6%. Es el que menos margen
  // tenía de los cinco hex fríos —está en el contrato duro contra tres
  // fondos, no sólo contra la superficie— así que se verificó el peor caso
  // antes de tocarlo: contra --sx-accent-pick con la perilla en gris queda en
  // 4.84 (piso 4.5, con 0.34 de margen). El resto sobra: 7.08/7.28 contra
  // superficie, 5.88/6.04 contra --sx-accent-soft (gris/morado).
  '--sx-ink-2': 'color-mix(in srgb, var(--sx-chrome-tint) 6%, #BCC1C4)',
  // SUBIÓ DE #8E9498 A #BEBDC1. El valor viejo pasaba sobre --sx-surface
  // (4.62) pero fallaba sobre los dos estados que --sx-accent-pick y
  // --sx-accent-soft producen una vez que esos dos dejan de heredar del claro
  // (ver abajo): 4.29 sobre hover, 2.99 sobre selección — el defecto que trajo
  // la tarea anterior.
  //
  // Verificado de nuevo contra la matriz completa (2 temas × 2 perillas): el
  // peor caso sigue siendo --sx-accent-pick, y sigue pasando con margen —
  // 5.17 morado / 4.86 gris (piso 4.5) — porque --sx-accent-soft y
  // --sx-accent-pick ya no aclaran mezclando blanco, mezclan el acento nuevo
  // (ver ahí), que es menos luminoso: el fondo quedó más oscuro, no más
  // claro, así que --sx-ink-3 no tuvo que subir de nuevo. Contra
  // --sx-accent-soft: 6.31 morado / 5.90 gris. Contra --sx-surface: 7.59
  // morado / 7.11 gris.
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
  // LA FIRMA, en oscuro. Sigue resolviendo `var(--sx-accent)`, así que cuando
  // el acento se movió de casi-blanco a lavanda (ver --sx-accent abajo) este
  // token heredó el cambio sin tocarse — es justo el punto de que sea una
  // perilla y no un hex propio.
  //
  // 18% sigue siendo la cifra elegida a mano, no medida por el arnés — este
  // token no está en el contrato duro ni en el informativo porque no es una
  // relación de texto ni de borde, es una sombra translúcida y su intensidad
  // es un juicio de diseño. El argumento de fondo no cambia con el acento
  // nuevo: #D1C6EC sigue siendo mucho más claro que la superficie oscura que
  // tiene detrás (10.18:1 contra tinta oscura, ver --sx-accent), así que la
  // relación de contraste sigue invertida y a favor del halo. Sigue sin
  // confirmarse mirando la pantalla — ver el reporte.
  '--sx-halo': 'color-mix(in srgb, var(--sx-accent) 18%, transparent)',
  // EL ACENTO YA NO ES CASI-BLANCO. Antes valía #EDEFF0, heredado de una
  // dirección donde el cromo era acromático y el acento hacía de tinta. Nácar
  // dice lo contrario: «el acento y el estado son el único color de la
  // pantalla», y con el acento casi-blanco el oscuro de Nácar no tenía color
  // de marca en NINGÚN píxel — el botón primario era un rectángulo blanco, el
  // foco era blanco, los enlaces eran blancos.
  //
  // En oscuro el acento tiene que seguir siendo CLARO (va sobre tinta oscura,
  // y --sx-accent-ink de abajo lo asume) pero llevando la marca: es el morado
  // de Nácar (#6541BE, el mismo hex que --sx-accent del claro) aclarado con
  // blanco. Se midió a tres mezclas — tinta oscura (`var(--sx-n-900)`)
  // encima, con la perilla del cromo en su default morado:
  //     62% blanco → #C4B7E6 → 8.81:1
  //     70% blanco → #D1C6EC → 10.18:1  ← elegido (9.70:1 con la perilla en gris)
  //     78% blanco → #DDD5F1 → 11.63:1
  // 70% deja marca reconocible — no se lava a blanco — y de sobra sobre el
  // piso de 4.5 para la tinta que se dibuja encima, en las dos perillas.
  '--sx-accent': '#D1C6EC',
  '--sx-accent-ink': 'var(--sx-n-900)',
  // LA TRAMPA CENTRAL DE ESTE TEMA, Y POR QUÉ YA NO APLICA. Hasta acá,
  // --sx-accent-soft y --sx-accent-pick ACLARABAN LA SUPERFICIE MEZCLANDO
  // BLANCO, no el acento — el comentario original lo justificaba así: «el
  // acento en oscuro YA es casi blanco, así que mezclarlo daría casi lo mismo
  // que mezclar blanco puro». Esa premisa se cae con el punto de arriba: el
  // acento ya no es casi blanco, es un lavanda con marca reconocible, así que
  // mezclar uno u otro deja de ser lo mismo. Seguir mezclando blanco sería
  // repetir, en oscuro, el mismo defecto que el CLARO de Nácar ya corrigió
  // para estos dos tokens («`--sx-accent-soft`, `--sx-accent-pick` y
  // `--sx-accent-edge` derivan del acento» en el README): un estado
  // interactivo pintado con un gris fijo se lee como una superficie más
  // sucia, no como una pieza que responde a LA marca.
  //
  // Se pasan a derivar de --sx-accent, igual que el claro — la única
  // diferencia es contra qué se mezclan: el claro mezcla contra blanco (su
  // superficie es blanca); el oscuro mezcla contra --sx-surface (la suya).
  // Mismos porcentajes que ya tenía —8% hover, 16% selección—, porque lo que
  // cambió no fue la proporción, fue CONTRA QUÉ se mezclaban:
  //     --sx-accent-soft → #393645 morado / #3C3B42 gris
  //     --sx-accent-pick → #464254 morado / #494751 gris
  // Contra la matriz completa (2 temas × 2 perillas) el peor caso sigue
  // siendo --sx-edge sobre --sx-accent-pick con la perilla en gris: 3.26:1
  // (piso 3.0, antes 2.87). --sx-ink-3 en el mismo fondo: 4.86:1 (piso 4.5,
  // antes 4.27). Con este cambio NINGUNO de --sx-edge, --sx-ink-2 e
  // --sx-ink-3 tuvo que moverse: el lavanda (#D1C6EC) es menos luminoso que
  // el blanco puro que mezclaban antes, así que el fondo resultante queda MÁS
  // oscuro a igual porcentaje y deja más margen, no menos. Es la razón por la
  // que esta tarea no tocó esos tres valores — la que resolvió el hueco fue
  // esta derivación, no otra vuelta de oscurecer texto.
  '--sx-accent-soft': 'color-mix(in srgb, var(--sx-accent) 8%, var(--sx-surface))',
  // Mismo cambio que --sx-accent-soft arriba, y el mismo motivo. Antes de
  // esta tarea este token ni siquiera existía en oscuro — heredaba el
  // `--sx-accent-pick` del CLARO, un lavanda pensado para oscurecer blanco,
  // cayendo sobre una superficie que ya era oscura; la fila seleccionada se
  // pintaba con ese lavanda y la tinta oscura encima caía a 2.99 contra un
  // piso de 4.5. Ese defecto es el que dio origen a esta tarea y ya está
  // cerrado por la derivación de arriba: ver los números ahí.
  '--sx-accent-pick': 'color-mix(in srgb, var(--sx-accent) 16%, var(--sx-surface))',
  // RETINTADO con la traza de --sx-chrome-tint al 8%, igual que el resto de
  // los hex fríos de este bloque. No está en el contrato duro ni en el
  // informativo —se usa sólo como filo de insignia ya seleccionada
  // (ChoiceCards.svelte) y como raya divisoria (SplitButton.svelte), ninguno
  // de los dos es lo que identifica el componente— así que no hay piso que
  // verificar; el retinte es coherencia de familia, no una comprobación.
  '--sx-accent-edge': 'color-mix(in srgb, var(--sx-chrome-tint) 8%, #3A3F43)',
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
