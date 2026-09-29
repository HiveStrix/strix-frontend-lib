<script>
  import { pickVariant } from '../variants.js';
  // PAGE HEADER — lo primero de una pantalla, y lo último que alguien se
  // acuerda de diseñar.
  //
  // POR QUÉ ES UN COMPONENTE Y NO UN <h1>
  //
  // Toda superficie de Strix abre igual: DÓNDE estás, QUÉ es cierto ahora
  // mismo, y QUÉ podés hacer al respecto —en ese orden—. Una pantalla que se
  // inventa su propia apertura cuesta medio segundo de reorientación en cada
  // visita, y esta gente entra cuarenta veces al día. Multiplicá.
  //
  // EL TÍTULO ES UNA ORACIÓN, NO UN SUSTANTIVO.
  //
  // «Flota» nombra una pestaña. «3 máquinas están vencidas» nombra una
  // situación, y la situación es lo que alguien vino a averiguar. Así que el
  // sustantivo va en `eyebrow` (para eso ES el eyebrow) y el título se queda
  // con la oración.
  //
  //   <PageHeader
  //     eyebrow="Flota"
  //     title="3 máquinas están vencidas."
  //     subtitle="BAT014 lleva 12 días vencida en «Cambio de aceite 250 h»."
  //     tone="critical">
  //     <Pill slot="meta" tone="critical" size="sm">12 planes vencidos</Pill>
  //     <Button slot="actions" variant="solid">Registrar servicio</Button>
  //   </PageHeader>
  //
  // ─────────────────────────────────────────────────────────────────────────
  // `variant`: SÓLO LAS DE ARCILLA.
  //
  // Hasta la v0.12 había ocho (line · section · plain · aire · soft · banda ·
  // hero-card · hero). Quedan las dos que la variante colorida moldeó —las que
  // se levantan del lienzo con el relieve de contenedor (`--sx-e-card`)—. Las
  // otras seis separaban con una raya, con un lavado plano o con una isla
  // oscura, que es justo lo que el DESIGN.md de la arcilla prohíbe, y se
  // borraron para que nadie construya encima de un estilo que ya no es el del
  // sistema. Un valor viejo (`line`, `section`, `hero`, …) cae SEGURO a `banda`.
  //
  // ÍNDICE (el número es un alias del nombre: `variant="banda"` === `variant="1"`):
  //   1 banda (default) · 2 hero-card
  //
  //   banda     El encabezado del DESTINO: una columna en el pastel del acento
  //             del módulo (`--sx-banda-tint`) con tinta oscura. Adentro, una
  //             sola acción primaria y, si hace falta, pills de resumen.
  //
  //   hero-card El del tablero: la misma pieza levantada, a DOS ZONAS —la
  //             narrativa a la izquierda, la CIFRA a la derecha (slot
  //             `figure`)— y un fragmento del título en acento (un `<em>` por el
  //             slot default). Adaptado de Sarion «Forge». Si nadie pasa
  //             `figure`, la grilla colapsa a una columna sin dejar un hueco.
  //
  // ABOUT `tone`
  //
  // Es el ÚNICO lugar de esta librería donde la tinta lleva significado por sí
  // sola —así que sólo es legal cuando el título ya dice la palabra—. «3
  // máquinas están vencidas» en tinta crítica es la regla aguantando; «Flota» en
  // crítica es la regla rota. En `hero-card` pinta el título y el punto del
  // eyebrow.
  //
  // EL TONO NO SE LLEVA PUESTO EL ACENTO. En `banda` el relleno se queda SIEMPRE
  // en el acento del producto; el tono, como mucho, cambia su profundidad (con
  // la arcilla, `--sx-banda-alarm` en 0, ni eso: lo dicen el título y un
  // `Alert`). En `banda` el título no toma la tinta del tono. El acento
  // dice de qué módulo es esta pantalla en toda ruta; un estado es algo que pasa
  // hoy, y lo pasajero no borra lo permanente. Para gritar está `Alert`.
  //
  // NO ES `TopBar`. Esto es de la PANTALLA —cambia en cada ruta—. `TopBar` es
  // de la APLICACIÓN (el nombre del producto, el tenant, la sesión) y no cambia
  // mientras alguien siga adentro. Un valor que se repite en toda ruta nunca
  // fue un dato de este componente.
  // ─────────────────────────────────────────────────────────────────────────

  /** La situación, en una oración. Requerido —un header sin título es un hueco. */
  export let title = '';
  /** Una línea de evidencia para el título. Opcional, nunca un segundo título. */
  export let subtitle = '';
  /** El sustantivo: qué pantalla es esta. En `hero-card` se rinde como tag. */
  export let eyebrow = '';
  /** neutral | attention | critical | positive | info — legal sólo si el título dice la palabra. */
  export let tone = 'neutral';
  /** 1 para el header propio de la página, 2 para un header de sección adentro. */
  export let level = 1;
  /** Se pega arriba del scroll. Útil en ledgers largos donde las acciones importan. */
  export let sticky = false;
  /** Esqueleto hasta que aterriza el primer payload. Evita que el layout salte. */
  export let loading = false;
  /**
   * banda | hero-card — ver arriba. `banda` es el default. Un valor viejo o
   * inválido (`line`/`section`/`plain`/`aire`/`soft`/`hero`) cae SEGURO a
   * `banda`: se eliminó el diseño, no se rompió el llamado.
   */
  export let variant = 'banda';

  // El orden ES la numeración (ver el ÍNDICE de arriba): 1 banda · 2 hero-card.
  // `pickVariant` (../variants.js) acepta el nombre o el número —son
  // intercambiables—; los nombres siguen siendo los canónicos.
  const VARIANTS = ['banda', 'hero-card'];

  // `$:` y no `const`: un reactive statement legacy sólo rastrea los nombres
  // escritos adentro, así que un helper que cerrara sobre `level` sería
  // invisible para el markup que lo lee.
  $: tag = level === 2 ? 'h2' : 'h1';
  $: hasMeta = !!$$slots.meta;
  $: hasActions = !!$$slots.actions;
  $: hasCrumbs = !!$$slots.crumbs;
  $: hasFigure = !!$$slots.figure;
  // Resuelve el alias numérico al nombre; un typo o valor viejo (`line`) falla
  // SEGURO al default `banda`, no invisible.
  $: v = pickVariant(variant, VARIANTS, 'banda');
  $: twoZones = v === 'hero-card';
</script>

<header
  class="hd {v} {tone}"
  class:sticky
  class:loading
  aria-busy={loading || undefined}
>
  {#if hasCrumbs}
    <div class="crumbs"><slot name="crumbs" /></div>
  {/if}

  {#if twoZones}
    <!-- A DOS ZONAS: narrativa a la izquierda (con las acciones ancladas al
         pie por `margin-top:auto`), la cifra a la derecha. Si nadie pasa
         `figure`, la grilla colapsa a una columna sola sin dejar un hueco. -->
    <div class="grid" class:one={!hasFigure}>
      <div class="say">
        {#if loading}
          <span class="sr" role="status">Cargando…</span>
          {#if eyebrow}<div class="sk sk-eyebrow" aria-hidden="true"></div>{/if}
          <div class="sk sk-title" aria-hidden="true"></div>
          {#if subtitle}<div class="sk sk-sub" aria-hidden="true"></div>{/if}
          <!-- La fila `meta` también se reserva: sin ella, la banda crecía ~40px
               al llegar los sellos y todo lo de abajo saltaba. -->
          {#if hasMeta}<div class="meta" aria-hidden="true"><div class="sk sk-meta"></div><div class="sk sk-meta short"></div></div>{/if}
        {:else}
          {#if eyebrow}
            <p class="tag"><span class="dot" aria-hidden="true"></span>{eyebrow}</p>
          {/if}
          <svelte:element this={tag} class="ttl">{title}<slot /></svelte:element>
          {#if subtitle}<p class="sub">{subtitle}</p>{/if}
          {#if hasMeta}<div class="meta"><slot name="meta" /></div>{/if}
          {#if hasActions}<div class="acts"><slot name="actions" /></div>{/if}
        {/if}
      </div>

      {#if hasFigure && !loading}
        <div class="figure"><slot name="figure" /></div>
      {/if}
    </div>
  {:else}
    <div class="row">
      <div class="say">
        {#if loading}
          <span class="sr" role="status">Cargando…</span>
          {#if eyebrow}<div class="sk sk-eyebrow" aria-hidden="true"></div>{/if}
          <div class="sk sk-title" aria-hidden="true"></div>
          {#if subtitle}<div class="sk sk-sub" aria-hidden="true"></div>{/if}
          <!-- La fila `meta` también se reserva: sin ella, la banda crecía ~40px
               al llegar los sellos y todo lo de abajo saltaba. -->
          {#if hasMeta}<div class="meta" aria-hidden="true"><div class="sk sk-meta"></div><div class="sk sk-meta short"></div></div>{/if}
        {:else}
          {#if eyebrow}<p class="sx-cap eyebrow">{eyebrow}</p>{/if}
          <!-- El slot default se APPENDEA al título, para el caso que `title`
               no cubre: un código o una cifra que hay que componer —«BAT014
               lleva <span class="sx-num">12</span> días vencida»— o el
               fragmento en acento del banner. -->
          <svelte:element this={tag} class="ttl">{title}<slot /></svelte:element>
          {#if subtitle}<p class="sub">{subtitle}</p>{/if}
          {#if hasMeta}<div class="meta"><slot name="meta" /></div>{/if}
        {/if}
      </div>

      {#if hasActions}
        <!-- Las acciones guardan su lugar mientras el título carga: un botón
             que aparece tarde es un botón que alguien ya pasó de largo. -->
        <div class="acts"><slot name="actions" /></div>
      {/if}
    </div>
  {/if}

  {#if $$slots.below}
    <!-- Donde va una fila de Tabs o FilterChips: todavía dentro del ritmo del
         header, todavía sobre la línea de flotación, nunca una segunda barra
         flotando sola. -->
    <div class="below"><slot name="below" /></div>
  {/if}
</header>

<style>
  /* Los registros que un Core re-declara para sí; nada acá depende de una
     clase de afuera salvo `.sx-cap`, que es uno de los tres. */
  .sr {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  .hd {
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-3);
    position: relative;
  }

  /* ═══ LAYOUT COMÚN ═════════════════════════════════════════════════════════ */
  .row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--sx-s-6);
    flex-wrap: wrap;
  }
  .say { min-width: 0; flex: 1 1 34ch; }

  .eyebrow { margin: 0 0 var(--sx-s-2); }

  .ttl {
    margin: 0;
    font-size: var(--sx-t-2xl);
    font-weight: var(--sx-w-bold);
    letter-spacing: -.03em;
    line-height: 1.12;
    /* Un titular más largo que esto deja de leerse y empieza a escanearse.
       `--sx-ph-measure` lo abre para lo que no es un titular sino un NOMBRE
       PROPIO (una razón social, un activo con su código): el core lo pone en
       el contenedor del encabezado, y lo demás no cambia. */
    max-width: var(--sx-ph-measure, 26ch);
    text-wrap: balance;
  }

  .sub {
    margin: var(--sx-s-2) 0 0;
    font-size: var(--sx-t-md);
    color: var(--sx-ink-2);
    line-height: 1.5;
    max-width: 58ch;
  }

  /* El tono pinta el título en `hero-card`. En `banda` el título toma siempre
     la tinta de la banda (ver `.hd.banda .ttl`): ahí el tono va al relleno, y
     con la arcilla (`--sx-banda-alarm` en 0) ni eso. */
  .attention .ttl { color: var(--sx-attention); }
  .critical  .ttl { color: var(--sx-critical); }
  .positive  .ttl { color: var(--sx-positive); }
  .info      .ttl { color: var(--sx-info); }

  .crumbs { min-width: 0; }
  .meta { display: flex; flex-wrap: wrap; gap: var(--sx-s-2); margin-top: var(--sx-s-3); }
  .below { min-width: 0; }

  /* Sólo layout. Cómo se ve un botón es de quien manda en los botones; un
     header que restyleara su slot estaría metiendo mano en otra familia. */
  .acts { display: flex; align-items: center; gap: var(--sx-s-2); flex-wrap: wrap; flex: none; }

  /* ═══ STICKY ═══════════════════════════════════════════════════════════════
     Para ledgers largos donde las acciones importan. Sube a --sx-z-sticky
     porque tiene que montar el contenido que pasa por debajo. Las dos variantes
     son piezas con piel —su propio fondo, radio y relieve—, así que pegada
     conserva su forma: no hace falta pintarle un fondo ni una raya. */
  .sticky {
    position: sticky;
    /* `--sx-sticky-top`: cuánto ocupa lo que ya está pegado arriba (la
       ModuleBar de un core). Sin eso el encabezado se deslizaba debajo de ella. */
    top: var(--sx-sticky-top, 0);
    z-index: var(--sx-z-sticky);
  }

  /* ═══ VARIANT: banda — el encabezado del destino ═══════════════════════════
     Un encabezado de RUTA teñido del acento: una columna, sin cifra y sin
     punto que late. Es para el principal de un MÓDULO (no un tablero a dos
     zonas). Todo el color sale de cuatro custom properties que cada tono
     reasigna (fill · ink · ink-soft · edge), así que la anatomía las lee sin
     repetir un color por regla. */
  .hd.banda {
    /* Perillas de la variante (tokens.js): --sx-banda-tint es cuánto acento
       lleva el relleno y --sx-banda-ink la tinta; sin ellas, el acento pleno
       con su tinta, como en main. `--banda-accent` guarda el acento de ACÁ
       para que `.acts` pueda volver a él sin un ciclo. */
    --banda-accent: var(--sx-accent);
    --banda-accent-ink: var(--sx-accent-ink);
    --banda-fill: color-mix(in srgb, var(--sx-accent) var(--sx-banda-tint, 100%), var(--sx-surface));
    --banda-ink: var(--sx-banda-ink, var(--sx-accent-ink));
    /* 85%, NO 76%. La bajada y el eyebrow de la banda son texto corrido, así
       que les toca el piso de 4.5:1 —y al 76% el tema oscuro medía 4.01 sobre
       el acento (el claro apenas pasaba, 4.56). La asimetría es real: en
       oscuro `--sx-accent-ink` es tinta OSCURA sobre un acento CLARO, y bajar
       su alfa lo acerca al relleno en vez de alejarlo. Al 85% da 5.02 oscuro
       y 5.18 claro, y sigue leyéndose como una voz más baja que el título. */
    --banda-ink-soft: color-mix(in srgb, var(--banda-ink) 85%, transparent);
    --banda-edge: transparent;
    background: var(--banda-fill);
    color: var(--banda-ink);
    border: 1px solid var(--banda-edge);
    box-shadow: var(--sx-e-card, var(--sx-e-1));
    padding: var(--sx-s-6);
    border-radius: var(--sx-r-3);
  }
  /* EL TONO YA NO SE LLEVA PUESTO EL ACENTO — cambia su PROFUNDIDAD.
   *
   * Antes cada tono reasignaba `--banda-fill` a la banda de su estado, así que
   * un inventario con una celda en negativo abría en ROJO y dejaba de leerse
   * como inventario. Eso invierte la jerarquía: el acento es la identidad del
   * módulo —te dice DÓNDE estás, en toda ruta— y un estado es algo que pasa
   * hoy. Lo pasajero no puede borrar lo permanente. Para gritar ya está
   * `Alert`, que es una pieza que se va cuando el problema se va; una banda no.
   *
   * Lo que sí varía es cuánto pesa: el relleno se mezcla hacia `--sx-ink`. Esa
   * es la única mezcla que funciona en los dos temas sin una regla por tema,
   * y no por casualidad: en claro `--sx-ink` es casi negro y hunde el acento,
   * en oscuro es casi blanco y lo levanta —en ambos casos lo aleja de
   * `--banda-ink`, así que el contraste del texto SUBE en vez de bajar.
   *
   * Sólo `attention` y `critical` mueven la aguja, porque sólo ellos piden
   * algo. `positive`/`info`/`neutral` se quedan en el acento pleno: una banda
   * que se tiñe cuando todo está bien enseña a ignorar el color.
   *
   * El estado no se queda mudo: el título ya dice la palabra («Una celda está
   * en negativo»), que es lo que la regla de la casa pide —el color decora un
   * reclamo que el contenido ya hace, nunca lo hace solo—. */
  /* `--sx-banda-alarm` (0|1) es cuánto de eso aplica. Sobre el acento pleno de
     main, oscurecer se lee como alarma; sobre el pastel de la variante (22 %),
     la tinta lo vuelve barro (Costeo con alertas: un oliva gris). La variante
     lo apaga: el reclamo ya lo hacen el título y el Alert de abajo. */
  .hd.banda.attention { --banda-fill: color-mix(in srgb, color-mix(in srgb, var(--sx-accent) var(--sx-banda-tint, 100%), var(--sx-surface)) calc(100% - 8% * var(--sx-banda-alarm, 1)), var(--sx-ink)); }
  .hd.banda.critical  { --banda-fill: color-mix(in srgb, color-mix(in srgb, var(--sx-accent) var(--sx-banda-tint, 100%), var(--sx-surface)) calc(100% - 18% * var(--sx-banda-alarm, 1)), var(--sx-ink)); }
  /* `.hd.banda .ttl` (0,2,1) le gana a `.critical .ttl` (0,2,0): el título de
     una banda toma SIEMPRE su `--banda-ink` (el tono ya viajó al relleno). */
  .hd.banda .ttl { color: var(--banda-ink); }
  /* EL BOTÓN DENTRO DE LA BANDA. `Button variant="solid"` se pinta con
     `--sx-accent`, y la banda ES el acento: azul sobre azul, la acción
     principal desaparecida. No hace falta una variante nueva de Button —
     alcanza con reasignar, SÓLO para las acciones, los dos tokens que Button
     ya lee. Es la misma mecánica con la que cada tono reasigna `--banda-*`
     acá arriba, y funciona porque un custom property se sustituye al calcular
     su valor: `.acts` hereda `--banda-fill/ink` YA resueltos a color, así que
     no hay ciclo. El sólido queda en la tinta de la banda con el relleno de
     la banda como texto —el negativo exacto del bloque que lo contiene. */
  /* Con `--sx-banda-remap` en 0 % (banda pastel, variante colorida) las
     acciones conservan el acento del producto: un botón de acento sobre un
     pastel se ve perfectamente. En 100 % (main) se invierten como siempre. */
  .hd.banda .acts {
    --sx-accent: color-mix(in srgb, var(--banda-ink) var(--sx-banda-remap, 100%), var(--banda-accent));
    --sx-accent-ink: color-mix(in srgb, var(--banda-fill) var(--sx-banda-remap, 100%), var(--banda-accent-ink));
  }
  /* `ghost` NO SE ARREGLA CON LOS TOKENS DE ACENTO, y por eso lleva regla
     propia: es la única variante que no pinta su propio fondo —es transparente
     y toma `--sx-ink-2`, que es la tinta del CAMPO, no la de la banda—, así
     que sobre el relleno de acento desaparecía. Y la salida no puede ser
     reasignar `--sx-ink` en `.acts`: `outline` sí pinta su fondo
     (`--sx-surface`) y usa esa misma tinta, de modo que moverla dejaría a
     `outline` con la tinta de la banda sobre superficie —el mismo bug,
     mudado de botón. Se apunta a `ghost` y a nadie más.

     `:global` porque el <button> lo dibuja Button, en su propio scope. */
  .hd.banda .acts :global(.sx-btn.ghost) { color: var(--banda-ink); }
  /* EL OUTLINE TEÑIDO, TAMBIÉN. Desde v0.9.0 `outline` se tiñe con
     --sx-accent (fondo Y tinta), y `.acts` re-liga --sx-accent a la tinta de la
     banda. Con un acento OSCURO —el morado por defecto— eso daba un lavado
     blanco con tinta blanca al 68 %: medido en el core de Mantenimiento, un
     «+ Equipo» rgb(184,183,187) sobre una píldora casi blanca, habilitado e
     ilegible. Con un acento claro (el ámbar de Mantenimiento) no se veía porque
     la tinta de la banda es oscura. Dentro de la banda el teñido se hace con la
     tinta de la banda, que es lo que la banda ya lee, en los dos casos. */
  /* Con la banda pastel (`--sx-banda-remap` en 0 %) el teñido de la banda no
     hace falta: el outline vuelve a su lavado de acento normal, que sobre un
     pastel se lee. Cada valor mezcla las dos recetas por la misma perilla. */
  .hd.banda .acts :global(.sx-btn.outline) {
    background: color-mix(in srgb,
      color-mix(in srgb, var(--banda-ink) 16%, transparent) var(--sx-banda-remap, 100%),
      color-mix(in srgb, var(--sx-accent) var(--sx-btn-tint, 28%), var(--sx-surface)));
    color: color-mix(in srgb, var(--banda-ink) var(--sx-banda-remap, 100%),
      color-mix(in srgb, var(--sx-accent) 68%, var(--sx-ink)));
    border-color: color-mix(in srgb,
      color-mix(in srgb, var(--banda-ink) 38%, transparent) var(--sx-banda-remap, 100%),
      color-mix(in srgb, var(--sx-accent) 34%, transparent));
  }
  .hd.banda .acts :global(.sx-btn.outline:not(:disabled):not(.locked):hover) {
    background: color-mix(in srgb,
      color-mix(in srgb, var(--banda-ink) 24%, transparent) var(--sx-banda-remap, 100%),
      color-mix(in srgb, var(--sx-accent) calc(var(--sx-btn-tint, 28%) + 8%), var(--sx-surface)));
    border-color: color-mix(in srgb,
      color-mix(in srgb, var(--banda-ink) 52%, transparent) var(--sx-banda-remap, 100%),
      color-mix(in srgb, var(--sx-accent) 44%, transparent));
  }
  .hd.banda .acts :global(.sx-btn.ghost:not(:disabled):not(.locked):hover) {
    background: color-mix(in srgb, var(--banda-ink) 16%, transparent);
    color: var(--banda-ink);
  }
  .hd.banda .eyebrow { color: var(--banda-ink-soft); }
  .hd.banda .sub { color: var(--banda-ink-soft); }

  /* ═══ ANATOMÍA A DOS ZONAS (hero-card) ═══════════════════════════════════ */
  .grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: var(--sx-s-8);
    align-items: stretch;
  }
  .grid.one { grid-template-columns: 1fr; }
  /* La narrativa es una columna: eyebrow-tag, título, bajada, y las acciones
     ancladas al PIE —como en el original— para que dos headers uno al lado del
     otro alineen sus botones aunque los textos midan distinto. */
  .grid .say { display: flex; flex-direction: column; gap: var(--sx-s-3); }
  .grid .acts { margin-top: auto; padding-top: var(--sx-s-5); }
  .grid .meta { margin-top: var(--sx-s-1); }
  .figure {
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--sx-s-3);
  }

  /* El eyebrow como CHIP con punto vivo (el gesto de Sarion «Prism»): una
     píldora tenue con punto que late. El relleno/borde se derivan de `--sx-ink`
     con color-mix, así que se adapta solo al tema. Sin hex. */
  .tag {
    margin: 0;
    display: inline-flex;
    align-items: center;
    gap: var(--sx-s-2);
    align-self: flex-start;
    padding: var(--sx-s-1) var(--sx-s-3);
    border-radius: var(--sx-r-pill);
    background: color-mix(in srgb, var(--sx-ink) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--sx-ink) 14%, transparent);
    font-family: var(--sx-font-mono);
    font-size: var(--sx-t-2xs);
    font-weight: var(--sx-w-semi);
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--sx-ink-2);
  }
  .tag .dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--sx-accent);
    animation: livePulse 1.6s var(--sx-ease) infinite;
  }
  .attention .tag .dot { background: var(--sx-attention); }
  .critical  .tag .dot { background: var(--sx-critical); }
  .positive  .tag .dot { background: var(--sx-positive); }
  .info      .tag .dot { background: var(--sx-info); }

  /* El título grande de las dos zonas, y el fragmento en acento que entra por
     el slot default —un `<em>` sin cursiva, sólo color—. Ese contraste (una
     palabra encendida dentro de una oración apagada) es la mitad del carácter
     del tablero. */
  .grid .ttl { max-width: 20ch; }
  /* El fragmento en acento, ahora como DEGRADADO (accent → accent aclarado
     hacia --sx-n-0), el mismo gesto que enciende «caída del 88%» en Prism. Todo
     por tokens: nada de un color crudo dentro del gradiente. */
  .hd.hero-card .ttl :global(em) {
    font-style: normal;
    font-weight: inherit;
    background: linear-gradient(
      90deg,
      var(--sx-accent) 0%,
      color-mix(in srgb, var(--sx-accent) 45%, var(--sx-n-0)) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  /* ═══ VARIANT: hero-card — el tablero, a dos zonas ═══════════════════════
     La pieza levantada de la arcilla con la anatomía de arriba. Usa
     --sx-ink/--sx-surface/--sx-line del tema, así que se adapta a claro y
     oscuro sola. Un divisor central entre la narrativa y la cifra (como el
     `border-right` del original). El padding lo ponen las columnas, no el
     header —por eso el header va a 0—. */
  .hd.hero-card {
    padding: 0;
    background: var(--sx-surface);
    border: 1px solid var(--sx-line);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-card, var(--sx-e-1));
    overflow: hidden;
  }
  .hd.hero-card .grid { gap: 0; }
  .hd.hero-card .say { padding: var(--sx-s-6); }
  .hd.hero-card .figure {
    padding: var(--sx-s-6);
    border-left: 1px solid var(--sx-line);
  }
  .hd.hero-card .grid.one .figure { border-left: 0; }
  .hd.hero-card .ttl {
    font-size: var(--sx-t-2xl);
    font-weight: var(--sx-w-semi);
    letter-spacing: -.03em;
    line-height: 1.1;
  }

  /* ═══ ESQUELETO ═══════════════════════════════════════════════════════════
     El esqueleto imita el ritmo del bloque real, así nada se mueve cuando llega
     el payload. El pulso hace un trabajo: dice «esto es un placeholder», cosa
     que una barra gris quieta no dice. */
  .sk {
    background: var(--sx-sunk);
    border-radius: var(--sx-r-1);
    animation: sk-pulse var(--sx-slow) var(--sx-ease) infinite alternate;
  }
  .sk-eyebrow { height: var(--sx-t-2xs); width: 9ch; margin-bottom: var(--sx-s-2); }
  .sk-title { height: var(--sx-t-2xl); width: min(22ch, 100%); }
  .sk-sub { height: var(--sx-t-md); width: min(44ch, 100%); margin-top: var(--sx-s-3); }
  /* Del alto de una Pill chica: la fila reservada mide lo que va a medir. */
  .sk-meta { height: 1.5rem; width: 7ch; border-radius: var(--sx-r-pill); }
  .sk-meta.short { width: 5ch; }

  @keyframes sk-pulse { from { opacity: 1; } to { opacity: .5; } }
  @keyframes livePulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }

  /* base.css mata esto global, pero un Core en un shadow root nunca ve base.css
     —así que la regla se repite donde tiene que ser cierta. */
  @media (prefers-reduced-motion: reduce) {
    .sk { animation: none; opacity: .75; }
    .tag .dot { animation: none; }
  }

  /* La columna de contenido, no la ventana: un módulo suele renderizar al lado
     del rail de 240px del Shell, así que el header se queda sin lugar bastante
     antes que el viewport. Debajo de esto las dos zonas se apilan y las
     acciones dejan de competir con el título. */
  @media (max-width: 720px) {
    .hd.hero-card .grid { grid-template-columns: 1fr; gap: 0; }
    .hd.hero-card .figure { border-left: 0; border-top: 1px solid var(--sx-line); }
  }
  @media (max-width: 560px) {
    .ttl { font-size: var(--sx-t-xl); }
    .sk-title { height: var(--sx-t-xl); }
    .acts { width: 100%; }
  }
</style>
