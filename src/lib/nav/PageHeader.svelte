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
  //     variant="hero"
  //     eyebrow="Atención requerida"
  //     title="Mayo cierra con "
  //     subtitle="La cartera vencida acumula ₡81.4M. Cuatro clientes concentran el 41%."
  //     tone="critical">
  //     <!-- el fragmento en acento entra por el slot default y se pinta solo -->
  //     <em>caída del 88%</em> en ingresos cobrados.
  //     <FigureBlock slot="figure" … />
  //     <Button slot="actions" variant="solid">Abrir cobranza</Button>
  //   </PageHeader>
  //
  // ─────────────────────────────────────────────────────────────────────────
  // `variant`: UNA ESCALERA DE INTENSIDAD, DE UN BANNER A UNA RAYA.
  //
  // El set viejo (halo · sarion · banda) se rehízo: halo y banda salieron; la
  // tipografía compacta de sarion vuelve como `section`. En su lugar, seis
  // formas ordenadas de más a menos ruido, replicando el encabezado de
  // un ERP real (Sarion) en el extremo intenso y bajando de ahí a lo discreto.
  // El CONTRATO no cambió: mismas props, mismos slots, mismos ~40 usos en
  // producción siguen andando. Lo que se eliminó fue el DISEÑO, no la
  // implementación.
  //
  // ÍNDICE (para pedir una por número al implementar — el número es un alias
  // del nombre: `variant="line"` === `variant="1"`). El orden va de lo discreto
  // (el default, la raya) a lo intenso: el banner `hero` es la ÚLTIMA opción, la
  // que se saca de la galera sólo cuando la pantalla lo amerita.
  //   1 line (default) · 2 section · 3 plain · 4 aire · 5 soft · 6 banda · 7 hero-card · 8 hero
  //
  //   hero      ▓▓▓  El banner. Isla oscura a sangre —gradiente de la escala
  //                  neutra, tinta clara, un fragmento del título en acento— a
  //                  dos zonas: la narrativa a la izquierda, la CIFRA a la
  //                  derecha (slot `figure`). Adaptado de Sarion «Prism». Es el
  //                  único bloque de la pantalla que se permite volverse oscuro
  //                  y quedarse con toda la luz. Todo lo ranurado adentro
  //                  (Button, Pill) cae en modo oscuro solo, porque la isla
  //                  re-mapea los tokens de tinta/superficie —no toca las
  //                  reglas de esas familias, cambia el AMBIENTE que leen.
  //
  //   hero-card ▓▓▓  El mismo esqueleto a dos zonas, pero como TARJETA nativa
  //                  del tema: borde, divisor central, y se adapta a claro y
  //                  oscuro sola (usa --sx-ink/--sx-line, no una isla). La
  //                  derecha suele llevar un desglose. Adaptado de Sarion
  //                  «Forge». Menos foco que `hero`, misma anatomía.
  //
  //   soft      ▓    El bloque tranquilo. Una sola columna sobre un relleno
  //                  tenue (`--sx-accent-soft`, o la banda del `tone` cuando el
  //                  estado urge). Para cerrar una sección con color sin
  //                  encender un banner.
  //
  //   banda     ▓▓   El principal de un MÓDULO, teñido de acento pleno. Una
  //                  columna, sin cifra ni isla oscura —más bajo que `hero`,
  //                  pero con todo el color. Recuperada de v0.8.2.
  //
  //   line      ·|·  EL DEFAULT. El título grande de la página, separado del
  //                  contenido por una RAYA inferior en vez de una luz. Reemplaza
  //                  al viejo `halo`: la separación ahora no depende de una
  //                  sombra que un producto podía apagar. Universal y discreto.
  //
  //   section   ·|·  La cabecera de sección compacta: título apretado en
  //                  negativo, subtítulo monoespaciado en positivo, una línea.
  //                  Para un encabezado DENTRO del contenido (level 2/3) — la
  //                  misma tipografía que Panel replica en su `headVariant`.
  //
  //   plain     ·    Sólo texto. Ni raya ni tarjeta ni sombra —el encabezado
  //                  para cuando ya vive DENTRO de un marco (una Card) y otra
  //                  línea sería doble marco.
  //
  //   aire      ·    Como `plain` —ni raya ni piel— pero el eyebrow toma el
  //                  acento de marca y el bloque respira un punto más. La marca
  //                  la lleva el COLOR del eyebrow, no una línea ni una sombra:
  //                  un header aireado y propio sin encender un banner. Nace en
  //                  strix-maintenance (sus vistas de catálogo).
  //
  // ABOUT `tone`
  //
  // Pinta el título, y es el ÚNICO lugar de esta librería donde la tinta lleva
  // significado por sí sola —así que sólo es legal cuando el título ya dice la
  // palabra—. «3 máquinas están vencidas» en tinta crítica es la regla
  // aguantando; «Flota» en crítica es la regla rota. En `soft` el tono también
  // tiñe el relleno (su banda medida); en `hero` los tonos usan sus inks
  // claras para sobrevivir al fondo oscuro.
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
  /** El sustantivo: qué pantalla es esta. En `hero`/`hero-card` se rinde como tag. */
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
   * hero | hero-card | banda | soft | aire | section | line | plain — la escalera
   * de intensidad de arriba. `line` es el default y es la ley, no lo que pasa
   * cuando nadie escribe nada. Un valor viejo o inválido (`halo`/`sarion`/`banda`)
   * cae SEGURO a `line`: se eliminó el diseño, no se rompió el llamado.
   */
  export let variant = 'line';
  /**
   * GUTTER GARANTIZADO. Las variantes de texto (`line`/`plain`/`soft`) ponen
   * padding propio por los cuatro lados para que nada roce el borde de un
   * contenedor sin relleno. `bleed` lo apaga —la salida para un header que ya
   * vive dentro de una Card que rellena, donde el padding propio sería doble—.
   * No afecta a `hero`/`hero-card`: su relleno es parte de su piel.
   */
  export let bleed = false;

  // El orden ES la numeración (ver el ÍNDICE de arriba): 1 line (default) ·
  // 2 section · 3 plain · 4 aire · 5 soft · 6 banda · 7 hero-card · 8 hero. De lo
  // discreto a lo intenso, con el banner `hero` como ÚLTIMA opción. `pickVariant`
  // (../variants.js) acepta el nombre o el número —son intercambiables—; los
  // nombres siguen siendo los canónicos, el número es una comodidad.
  const VARIANTS = ['line', 'section', 'plain', 'aire', 'soft', 'banda', 'hero-card', 'hero'];

  // `$:` y no `const`: un reactive statement legacy sólo rastrea los nombres
  // escritos adentro, así que un helper que cerrara sobre `level` sería
  // invisible para el markup que lo lee.
  $: tag = level === 2 ? 'h2' : 'h1';
  $: hasMeta = !!$$slots.meta;
  $: hasActions = !!$$slots.actions;
  $: hasCrumbs = !!$$slots.crumbs;
  $: hasFigure = !!$$slots.figure;
  // Resuelve el alias numérico al nombre; un typo o valor viejo (`halo`) falla
  // SEGURO (la ley) al default `line`, no invisible.
  $: v = pickVariant(variant, VARIANTS, 'line');
  // Las dos variantes con esqueleto a dos zonas comparten markup.
  $: isHero = v === 'hero' || v === 'hero-card';
</script>

<header
  class="hd {v} {tone}"
  class:sticky
  class:loading
  class:bleed
  aria-busy={loading || undefined}
>
  {#if hasCrumbs}
    <div class="crumbs"><slot name="crumbs" /></div>
  {/if}

  {#if isHero}
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
    /* EL GUTTER GARANTIZADO, para las variantes de texto. Padding propio por
       los cuatro lados para que el texto nunca roce el borde. `hero`/`hero-card`
       lo pisan con su propia piel; `bleed` lo apaga. */
    padding: var(--sx-s-4) var(--sx-s-5);
    position: relative;
  }

  /* Salida del gutter: un header dentro de un padre que ya rellena no quiere
     padding HORIZONTAL doble. Sólo se apaga el gutter lateral —el vertical se
     conserva SIEMPRE— para que el título alinee a sangre con el cuerpo sin que
     la raya inferior quede pegada al subtítulo ni el bloque pierda su aire
     arriba/abajo. No toca a `hero`/`hero-card` —su relleno es su piel. */
  .hd.bleed:not(.hero):not(.hero-card):not(.banda) { padding-left: 0; padding-right: 0; }

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
    /* Un titular más largo que esto deja de leerse y empieza a escanearse. */
    max-width: 26ch;
    text-wrap: balance;
  }

  .sub {
    margin: var(--sx-s-2) 0 0;
    font-size: var(--sx-t-md);
    color: var(--sx-ink-2);
    line-height: 1.5;
    max-width: 58ch;
  }

  /* El tono pinta el título —y sólo el título— en las variantes de texto. */
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
     Pensado para el default `line` en ledgers largos. Sube a --sx-z-sticky
     porque ahí sí tiene que montar el contenido que pasa por debajo, y se
     apoya en un borde que no depende del halo (un producto puede apagar la luz,
     no la raya). */
  .sticky {
    position: sticky;
    top: 0;
    z-index: var(--sx-z-sticky);
    background: var(--sx-ground);
    border-bottom: 1px solid var(--sx-line);
    padding-block: var(--sx-s-3);
    margin-inline: calc(var(--sx-s-4) * -1);
    padding-inline: var(--sx-s-4);
    border-radius: var(--sx-r-1);
  }

  /* ═══ VARIANT: line — el default, una raya ════════════════════════════════
     `.hd.line`, no una redeclaración de `.hd`: la especificidad tiene que
     ganarle sin depender del orden del bloque. Reemplaza al viejo `halo`: el
     título grande de la página, separado por `--sx-line` («cierra una
     cabecera, divide una fila» —justo este caso). Ningún padding horizontal
     extra: el gutter de `.hd` alcanza. */
  .hd.line {
    border-bottom: 1px solid var(--sx-line);
  }

  /* ═══ VARIANT: plain — sólo texto ═════════════════════════════════════════
     Ni raya ni piel. Para un header que ya vive dentro de un marco. Nada que
     declarar más allá de heredar la base: existe para NO poner una segunda
     línea donde ya hay una tarjeta. */

  /* ═══ VARIANT: section — la cabecera de sección compacta ══════════════════
     La tipografía que Panel calibró para su `headVariant`, ahora también como
     variante propia: título apretado en negativo (-.015em, el mismo tracking
     que `.sx-id` para texto compacto y en negrita) contra un subtítulo
     monoespaciado en positivo (+.04em) —ese contraste es su carácter— y una
     línea en vez de banda. Para un encabezado DENTRO del contenido (level 2/3),
     donde el título grande de `line` (33px) pesaría de más. */
  .hd.section {
    border-bottom: 1px solid var(--sx-line);
    padding-bottom: var(--sx-s-4);
  }
  .section .ttl {
    font-size: var(--sx-t-md);
    font-weight: var(--sx-w-bold);
    letter-spacing: -.015em;
    line-height: 1.3;
    max-width: none;
  }
  .section .sub {
    margin-top: var(--sx-s-1);
    font-family: var(--sx-font-mono);
    font-size: var(--sx-t-2xs);
    letter-spacing: .04em;
    line-height: 1.4;
    color: var(--sx-ink-3);
  }

  /* ═══ VARIANT: soft — el bloque tranquilo ═════════════════════════════════
     Una columna sobre un relleno tenue. Por defecto el acento al 10%; con
     `tone`, la banda medida de ese estado (el mismo par banda/tinta que ya usan
     Pill y Panel), así que «con color» no cuesta legibilidad. */
  .hd.soft {
    background: var(--sx-accent-soft);
    border-radius: var(--sx-r-2);
    padding: var(--sx-s-5) var(--sx-s-6);
  }
  .hd.soft.attention { background: var(--sx-attention-band); }
  .hd.soft.critical  { background: var(--sx-critical-band); }
  .hd.soft.positive  { background: var(--sx-positive-band); }
  .hd.soft.info      { background: var(--sx-info-band); }
  .hd.soft.bleed { margin-inline: calc(var(--sx-s-6) * -1); }

  /* ═══ VARIANT: aire — texto limpio con eyebrow de acento ═══════════════════
     Como `plain` (ni raya ni piel) pero el eyebrow toma el acento de marca y el
     bloque respira un peldaño más (gap y márgenes propios). La marca la lleva el
     COLOR del eyebrow —no una línea ni una sombra—, para un header aireado y
     propio sin encender un banner. El `tone` sigue pintando el título como en el
     resto de las variantes de texto; el eyebrow se queda en acento a propósito. */
  .hd.aire { gap: var(--sx-s-4); }
  .aire .eyebrow { color: var(--sx-accent); margin-bottom: var(--sx-s-3); }
  .aire .sub { margin-top: var(--sx-s-3); }

  /* ═══ VARIANT: banda — el principal con color de verdad ════════════════════
     Un encabezado de RUTA teñido de acento pleno: el bloque que puede
     permitirse todo el color —como `hero`— pero a UNA columna y más bajo. Es
     para el principal de un MÓDULO (no un tablero a dos zonas): sin cifra, sin
     isla oscura, sin punto que late. Todo el color sale de cuatro custom
     properties que cada tono reasigna (fill · ink · ink-soft · edge), así que
     la anatomía las lee sin repetir un color por regla. Default (neutro):
     relleno de ACENTO, tinta `--sx-accent-ink`. Recuperada de v0.8.2 —era el
     principal de strix-maintenance, y volvió a serlo. */
  .hd.banda {
    --banda-fill: var(--sx-accent);
    --banda-ink: var(--sx-accent-ink);
    /* 85%, NO 76%. La bajada y el eyebrow de la banda son texto corrido, así
       que les toca el piso de 4.5:1 —y al 76% el tema oscuro medía 4.01 sobre
       el acento (el claro apenas pasaba, 4.56). La asimetría es real: en
       oscuro `--sx-accent-ink` es tinta OSCURA sobre un acento CLARO, y bajar
       su alfa lo acerca al relleno en vez de alejarlo. Al 85% da 5.02 oscuro
       y 5.18 claro, y sigue leyéndose como una voz más baja que el título. */
    --banda-ink-soft: color-mix(in srgb, var(--sx-accent-ink) 85%, transparent);
    --banda-edge: transparent;
    background: var(--banda-fill);
    color: var(--banda-ink);
    border: 1px solid var(--banda-edge);
    box-shadow: var(--sx-e-1);
    padding: var(--sx-s-6);
    border-radius: var(--sx-r-3);
  }
  .hd.banda.positive  { --banda-fill: var(--sx-positive-band);  --banda-ink: var(--sx-positive);  --banda-ink-soft: var(--sx-ink-2); --banda-edge: var(--sx-positive-edge); }
  .hd.banda.attention { --banda-fill: var(--sx-attention-band); --banda-ink: var(--sx-attention); --banda-ink-soft: var(--sx-ink-2); --banda-edge: var(--sx-attention-edge); }
  .hd.banda.critical  { --banda-fill: var(--sx-critical-band);  --banda-ink: var(--sx-critical);  --banda-ink-soft: var(--sx-ink-2); --banda-edge: var(--sx-critical-edge); }
  .hd.banda.info      { --banda-fill: var(--sx-info-band);      --banda-ink: var(--sx-info);      --banda-ink-soft: var(--sx-ink-2); --banda-edge: var(--sx-info-edge); }
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
  .hd.banda .acts {
    --sx-accent: var(--banda-ink);
    --sx-accent-ink: var(--banda-fill);
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
  .hd.banda .acts :global(.sx-btn.ghost:not(:disabled):not(.locked):hover) {
    background: color-mix(in srgb, var(--banda-ink) 16%, transparent);
    color: var(--banda-ink);
  }
  .hd.banda .eyebrow { color: var(--banda-ink-soft); }
  .hd.banda .sub { color: var(--banda-ink-soft); }

  /* ═══ ANATOMÍA A DOS ZONAS (hero · hero-card) ═════════════════════════════ */
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
     con color-mix, así que adapta solo: sobre la isla oscura del `hero` la tinta
     es casi blanca (chip claro translúcido), sobre la tarjeta clara del
     `hero-card` la tinta es oscura (chip oscuro translúcido). Sin hex. */
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
     del banner. */
  .grid .ttl { max-width: 20ch; }
  /* El fragmento en acento, ahora como DEGRADADO (accent → accent aclarado
     hacia --sx-n-0), el mismo gesto que enciende «caída del 88%» en Prism. Todo
     por tokens: nada de un color crudo dentro del gradiente. */
  .hd.hero .ttl :global(em),
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

  /* ═══ VARIANT: hero — el banner, isla oscura a sangre ═════════════════════
     Re-mapea los tokens de tinta/superficie a valores oscuros ESTABLES (la
     escala --sx-n-* no cambia entre temas) para volverse una isla oscura sin
     importar el tema de la app —y para que TODO lo ranurado adentro (Button,
     Pill, Breadcrumb) caiga en modo oscuro solo, leyendo esos tokens—. El
     header no toca las reglas de esas familias: cambia el AMBIENTE que leen.
     El acento se queda vivo (no la versión lavada del tema oscuro) para que el
     `<em>` y la primaria enciendan. */
  .hd.hero {
    --sx-surface: var(--sx-n-800);
    --sx-sunk: var(--sx-n-900);
    --sx-line: color-mix(in srgb, var(--sx-n-0) 12%, transparent);
    --sx-edge: color-mix(in srgb, var(--sx-n-0) 24%, transparent);
    --sx-ink: color-mix(in srgb, var(--sx-n-0) 96%, var(--sx-accent));
    --sx-ink-2: color-mix(in srgb, var(--sx-n-0) 74%, transparent);
    --sx-ink-3: color-mix(in srgb, var(--sx-n-0) 56%, transparent);
    /* El tono, por defecto: tinta casi blanca para el título, acento vivo para
       el punto. Los tonos semánticos los ACLARA el bloque de reglas de abajo
       —nunca un hex: se mezcla el propio token hacia --sx-n-0, que es lo que lo
       vuelve legible sobre el fondo oscuro sin clavar un color fuera del tema. */
    --hero-tone-ink: var(--sx-ink);
    --hero-tone-dot: var(--sx-accent);

    color: var(--sx-ink);
    background: linear-gradient(135deg, var(--sx-n-900) 0%, var(--sx-n-800) 100%);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-2);
    padding: var(--sx-s-8);
  }
  .hd.hero .ttl {
    font-size: var(--sx-t-3xl);
    font-weight: var(--sx-w-semi);
    letter-spacing: -.035em;
    line-height: 1.05;
    color: var(--hero-tone-ink);
  }
  .hd.hero .sub { color: var(--sx-ink-3); max-width: 52ch; }
  /* El tono sobre la isla oscura, SIN hardcodear: se aclara el token semántico
     mezclándolo hacia --sx-n-0. El título y el punto leen la misma variable, así
     que el color viaja a los dos lugares sin repetir un valor por regla. La
     especificidad (`.hd.hero .ttl` = 0,2,1) le gana al `.critical .ttl` genérico
     de arriba, así que el tono del banner no se pisa con el tono de campo claro. */
  .hd.hero.attention { --hero-tone-ink: color-mix(in srgb, var(--sx-attention) 62%, var(--sx-n-0)); --hero-tone-dot: var(--hero-tone-ink); }
  .hd.hero.critical  { --hero-tone-ink: color-mix(in srgb, var(--sx-critical) 62%, var(--sx-n-0));  --hero-tone-dot: var(--hero-tone-ink); }
  .hd.hero.positive  { --hero-tone-ink: color-mix(in srgb, var(--sx-positive) 62%, var(--sx-n-0));  --hero-tone-dot: var(--hero-tone-ink); }
  .hd.hero.info      { --hero-tone-ink: color-mix(in srgb, var(--sx-info) 62%, var(--sx-n-0));      --hero-tone-dot: var(--hero-tone-ink); }
  .hd.hero .tag .dot { background: var(--hero-tone-dot); }
  /* La cifra se centra vertical para pesar como contrapeso del título. */
  .hd.hero .figure { justify-content: center; }

  /* ═══ VARIANT: hero-card — la misma anatomía, tarjeta nativa del tema ══════
     Nada de isla: usa --sx-ink/--sx-surface/--sx-line del tema, así que se
     adapta a claro y oscuro sola. Borde, radio, y un divisor central entre la
     narrativa y la cifra (como el `border-right` del original). El padding lo
     ponen las columnas, no el header —por eso el header va a 0—. */
  .hd.hero-card {
    padding: 0;
    background: var(--sx-surface);
    border: 1px solid var(--sx-line);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-1);
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
    .grid, .hd.hero-card .grid { grid-template-columns: 1fr; gap: 0; }
    .hd.hero-card .figure { border-left: 0; border-top: 1px solid var(--sx-line); }
    .hd.hero .figure { margin-top: var(--sx-s-5); }
  }
  @media (max-width: 560px) {
    .ttl, .hd.hero .ttl { font-size: var(--sx-t-xl); }
    .sk-title { height: var(--sx-t-xl); }
    .acts { width: 100%; }
    .hd.hero { padding: var(--sx-s-6); }
  }
</style>
