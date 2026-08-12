<script>
  // PAGE HEADER — the first thing on a screen, and the last thing anybody
  // remembers to design.
  //
  // WHY IT IS A COMPONENT AND NOT JUST AN <h1>
  //
  // Every Strix surface opens the same way: WHERE you are, WHAT is true right
  // now, and WHAT you can do about it — in that order. A screen that invents
  // its own opening costs half a second of re-orientation on every visit, and
  // the people who use this software visit forty times a day. Multiply.
  //
  // THE TITLE IS A SENTENCE, NOT A NOUN.
  //
  // «Flota» names a tab. «3 máquinas están vencidas» names a situation, and the
  // situation is what somebody came to find out. So: the noun goes in `eyebrow`
  // (that is what the eyebrow is FOR), and the title gets the sentence.
  //
  //   <PageHeader
  //     eyebrow="Flota"
  //     title="3 máquinas están vencidas."
  //     subtitle="BAT014 lleva 12 días vencida en «Cambio de aceite»."
  //     tone="critical">
  //     <Breadcrumb slot="crumbs" items={ruta} />
  //     <Pill slot="meta" tone="critical">12 planes vencidos</Pill>
  //     <button slot="actions" class="…">Registrar servicio</button>
  //   </PageHeader>
  //
  // ABOUT `tone`
  //
  // It colours the title, and it is the ONE place in this library where ink
  // carries meaning by itself — so it is legal only when the title already says
  // the word. «3 máquinas están vencidas» in critical ink is the rule holding.
  // «Flota» in critical ink is the rule broken: somebody who cannot separate red
  // from grey learns nothing, and everyone else learns that the colour is noise.
  //
  // WHAT IT DELIBERATELY DOES NOT DO
  //
  // It does not own the figures (cumplimiento, MTTR, costo). Those are a data
  // component's job and they go through `meta`, so a header never becomes the
  // place where a fourth kind of layout gets invented.
  //
  // ─────────────────────────────────────────────────────────────────────────
  // `variant`: LA MISMA LEY QUE `Card`, DICHA DESDE UN ENCABEZADO.
  //
  // Una superficie se separa de su fondo de tres maneras —luz, línea o
  // tono— y el marco completo, con el argumento entero, vive en la cabecera
  // de `Card` (`src/lib/shell/Card.svelte`). Acá la misma terna, el mismo
  // default, la misma regla: `halo` no se toca.
  //
  //   halo   (default — NO SE TOCA) — la luz que ya cae con `--sx-halo`.
  //
  //   sarion — la línea. Adaptada de un ERP real, de donde salió el pedido
  //   de dar esta salida: un encabezado de sección compacto, con
  //   `border-bottom` en vez de halo. El problema que la origina: adentro
  //   del contenido, donde no hay barra, el halo solo no alcanza y las
  //   secciones se leen como una sola — «todo parece una sola sección», en
  //   palabras de quien lo pidió. El gesto real de `sarion` no es la regla:
  //   es la tipografía — el título en negativo (`-.015em`) contra el
  //   subtítulo monoespaciado en positivo (`.04em`), el mismo contraste que
  //   ya usa este sistema entre `.sx-id` (negativo, para un identificador
  //   mono) y `.sx-cap`/`ChoiceCards` (positivo, para una etiqueta). `sarion`
  //   NO agrega su propio padding horizontal — eso sigue siendo trabajo del
  //   padre, como siempre en este componente — sólo cierra su propio ritmo
  //   vertical antes de la línea.
  //
  //   banda  — el tono, igual que `--sx-thead` ya hace en `Panel`. Máxima
  //   contención: relleno propio, radio propio, sin halo. SE APOYA EN UNA
  //   TARJETA — nunca directo sobre el campo, igual que el `.head` de
  //   `Panel`. Medido, no supuesto: `--sx-thead` contra `--sx-surface` da
  //   1.09; contra `--sx-ground` da 1.03–1.05 en claro, bajo el piso de
  //   distinguibilidad de este repo (1.05). Es la misma restricción que el
  //   README ya documenta para `--sx-thead` — «no hay un valor de una sola
  //   línea que sea seguro en los dos temas»— y `banda` la hereda en vez de
  //   inventar un token nuevo sólo para esquivarla.
  // ─────────────────────────────────────────────────────────────────────────

  /** The situation, in a sentence. Required — a header with no title is a gap. */
  export let title = '';
  /** One line of evidence for the title. Optional, never a second title. */
  export let subtitle = '';
  /** The noun: which screen this is. Rendered in the caption register. */
  export let eyebrow = '';
  /** neutral | attention | critical — legal only if the title says the word. */
  export let tone = 'neutral';
  /** 1 for the page's own header, 2 for a section header inside it. */
  export let level = 1;
  /** Rides the top of the scroll. Use on long ledgers where the actions matter. */
  export let sticky = false;
  /** Skeleton until the first payload lands. Keeps the layout from jumping. */
  export let loading = false;
  /**
   * halo | sarion | banda — HOW this header leaves its background: light,
   * line or tone. `halo` is the default and is the law, not just what
   * happens when nobody writes anything. See «`variant`» above.
   */
  export let variant = 'halo';

  const VARIANTS = new Set(['halo', 'sarion', 'banda']);

  // `$:` and not `const`: a legacy reactive statement tracks only the names
  // written inside it, so a helper closing over `level` would be invisible to
  // the markup that reads it and the tag would never change.
  $: tag = level === 2 ? 'h2' : 'h1';
  $: hasMeta = !!$$slots.meta;
  $: hasActions = !!$$slots.actions;
  $: hasCrumbs = !!$$slots.crumbs;
  // A typo in `variant` fails SAFE (the law) not invisible.
  $: v = VARIANTS.has(variant) ? variant : 'halo';
</script>

<header
  class="hd {tone}"
  class:sticky
  class:loading
  class:sarion={v === 'sarion'}
  class:banda={v === 'banda'}
  aria-busy={loading || undefined}
>
  {#if hasCrumbs}
    <div class="crumbs"><slot name="crumbs" /></div>
  {/if}

  <div class="row">
    <div class="say">
      {#if loading}
        <!-- The skeleton mirrors the real block's rhythm, so nothing moves when
             the payload lands. The pulse is doing a job: it says «this is a
             placeholder», which a static grey bar does not. -->
        <span class="sr" role="status">Cargando…</span>
        {#if eyebrow}<div class="sk sk-eyebrow" aria-hidden="true"></div>{/if}
        <div class="sk sk-title" aria-hidden="true"></div>
        {#if subtitle}<div class="sk sk-sub" aria-hidden="true"></div>{/if}
      {:else}
        {#if eyebrow}<p class="sx-cap eyebrow">{eyebrow}</p>{/if}
        <!-- The default slot appends to the title, for the one case `title`
             cannot cover: a code or a figure that has to be typeset — «BAT014
             lleva <span class="sx-num">12</span> días vencida». -->
        <svelte:element this={tag} class="ttl">{title}<slot /></svelte:element>
        {#if subtitle}<p class="sub">{subtitle}</p>{/if}
      {/if}

      {#if hasMeta && !loading}
        <div class="meta"><slot name="meta" /></div>
      {/if}
    </div>

    {#if hasActions}
      <!-- The actions keep their place while the title loads: a button that
           appears late is a button somebody has already clicked past. -->
      <div class="acts"><slot name="actions" /></div>
    {/if}
  </div>

  {#if $$slots.below}
    <!-- Where a Tabs or a FilterChips row belongs: still inside the header's
         rhythm, still above the fold, never a second bar floating on its own. -->
    <div class="below"><slot name="below" /></div>
  {/if}
</header>

<style>
  /* The registers a Core re-declares for itself; nothing here relies on a class
     that lives outside this file except `.sx-cap`, which is one of the three. */
  .sr {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  .hd {
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-3);
    /* LA FIRMA. La barra no se separa con una línea: se separa con la luz que
       deja caer. La geometría está calibrada al límite de lo visible sobre
       claro — bajarla más no la hace discreta, la hace invisible. La discreción
       se gradúa por --sx-halo y sólo por ahí.
       El z-index NO es opcional: sin él el fondo del hermano siguiente se pinta
       después en el orden natural y se come la luz justo donde tiene que caer. */
    box-shadow: 0 12px 28px -18px var(--sx-halo);
    position: relative;
    z-index: var(--sx-z-sticky);
  }

  .sticky {
    position: sticky;
    top: 0;
    z-index: var(--sx-z-sticky);
    background: var(--sx-ground);
    /* No declara box-shadow propio a propósito: .hd ya deja caer el halo, y
       pegada es cuando más tiene que notarse que hay contenido pasando por
       debajo. Redeclararlo acá con --sx-e-1 lo pisaba en silencio — la firma
       de la dirección desaparecía justo cuando la barra se quedaba pegada.
       Pero un producto puede ligar --sx-halo a transparent (la perilla que el
       README documenta) y entonces la barra pegada se queda sin raya, sin
       sombra y sin halo. border-bottom es otra propiedad — convive con el
       box-shadow de .hd sin pisarlo — y da un límite que no depende del halo. */
    border-bottom: 1px solid var(--sx-line);
    padding-block: var(--sx-s-3);
    margin-inline: calc(var(--sx-s-4) * -1);
    padding-inline: var(--sx-s-4);
    border-radius: var(--sx-r-1);
  }

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
    /* A headline past this stops being read and starts being scanned. */
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

  .attention .ttl { color: var(--sx-attention); }
  .critical .ttl { color: var(--sx-critical); }

  /* ═══ VARIANT: sarion — la línea ══════════════════════════════════════════
     `.hd.sarion`, no una redeclaración de `.hd`: la especificidad tiene que
     ganarle al halo de arriba sin depender de en qué orden queda el bloque.
     Ningún padding horizontal — eso lo sigue dando el padre, como en `halo` —
     sólo el ritmo vertical antes de la línea. `--sx-line` y no `--sx-edge`
     porque el README ya describe el trabajo exacto de `--sx-line`: «cierra
     una cabecera, divide una fila» — es literalmente este caso, no un
     préstamo forzado. */
  .hd.sarion {
    box-shadow: none;
    border-bottom: 1px solid var(--sx-line);
    padding-bottom: var(--sx-s-4);
  }
  /* 15px es --sx-t-md EXACTO; 700 es --sx-w-bold EXACTO. El tracking
     (-.015em) no es un rgba: es una proporción, y coincide con la que ya usa
     `.sx-id` en base.css para el mismo motivo — texto compacto y en negrita
     se cierra un poco — así que no es un número sacado de contexto, es uno
     que este sistema ya conocía. `max-width: none` porque el clamp de 26ch
     de arriba está pensado para el título GRANDE (33px); a este tamaño la
     referencia correcta es `Panel .t`, que tampoco clampea. */
  .sarion .ttl {
    font-size: var(--sx-t-md);
    font-weight: var(--sx-w-bold);
    letter-spacing: -.015em;
    line-height: 1.3;
    max-width: none;
  }
  /* El gesto real de la variante. Mono, chico, tracking POSITIVO — lo
     opuesto del título — que es exactamente el contraste que le da carácter.
     11px es --sx-t-2xs EXACTO. .04em ya es un valor del sistema (el badge de
     `ChoiceCards`, `Divider label`), no uno inventado para esta variante. */
  .sarion .sub {
    margin-top: var(--sx-s-1);
    font-family: var(--sx-font-mono);
    font-size: var(--sx-t-2xs);
    letter-spacing: .04em;
    line-height: 1.4;
    color: var(--sx-ink-3);
  }

  /* ═══ VARIANT: banda — el tono ════════════════════════════════════════════
     El mismo `--sx-thead` que ya pinta el `.head` de Panel — no un color
     nuevo — y por eso hereda la misma restricción: medido contra
     `--sx-surface` da 1.09 (con margen); contra `--sx-ground` da 1.03–1.05 en
     claro, bajo el piso de este repo. SE APOYA EN UNA TARJETA, nunca directo
     sobre el campo — ver la cabecera de este archivo y el catálogo, donde se
     demuestra adentro de una Card, igual que Panel. */
  .hd.banda {
    background: var(--sx-thead);
    box-shadow: none;
    padding: var(--sx-s-5) var(--sx-s-6) var(--sx-s-4);
    border-radius: var(--sx-r-2);
  }

  .crumbs { min-width: 0; }
  .meta { display: flex; flex-wrap: wrap; gap: var(--sx-s-2); margin-top: var(--sx-s-3); }
  .below { min-width: 0; }

  /* Layout only. What a button looks like belongs to whoever owns buttons; a
     header that restyled its slot would be reaching into another family. */
  .acts { display: flex; align-items: center; gap: var(--sx-s-2); flex-wrap: wrap; flex: none; }

  .sk {
    background: var(--sx-sunk);
    border-radius: var(--sx-r-1);
    animation: sk-pulse var(--sx-slow) var(--sx-ease) infinite alternate;
  }
  .sk-eyebrow { height: var(--sx-t-2xs); width: 9ch; margin-bottom: var(--sx-s-2); }
  .sk-title { height: var(--sx-t-2xl); width: min(22ch, 100%); }
  .sk-sub { height: var(--sx-t-md); width: min(44ch, 100%); margin-top: var(--sx-s-3); }

  @keyframes sk-pulse { from { opacity: 1; } to { opacity: .5; } }

  /* base.css kills this globally, but a Core module in a shadow root never sees
     base.css — so the rule is repeated where it has to be true. */
  @media (prefers-reduced-motion: reduce) {
    .sk { animation: none; opacity: .75; }
  }

  /* The content column, not the window: a module usually renders beside the
     Shell's 240px rail, so the header runs out of room well before the viewport
     does. Below this the actions stop competing with the title and take a line
     of their own. */
  @media (max-width: 640px) {
    .ttl { font-size: var(--sx-t-xl); }
    .sk-title { height: var(--sx-t-xl); }
    .acts { width: 100%; }
  }
</style>
