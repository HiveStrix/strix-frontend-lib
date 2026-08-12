<script>
  // THE SURFACE. One object, lifted off the ground.
  //
  // Everything a Strix screen shows sits on something, and this is the something:
  // a fill, a radius, and an elevation. No border. The system's second rule is
  // that depth comes from light — `--sx-e-1/2/3` have a real offset and a soft
  // blur because that is what a lifted thing does to light, whereas a 1px
  // rectangle is a drawing of a box rather than a box. The practical payoff is
  // that a screen with thirty cards still reads as thirty objects instead of as
  // a wireframe, and that the same component works on the dark theme without a
  // second stylesheet: the shadows re-bind, the outlines would not have.
  //
  //   <Card>…</Card>
  //   <Card pad={6} elevation={2}>…</Card>
  //   <Card interactive selected on:click={…}>…</Card>   ← a real <button>
  //   <Card href="/m/maintenance/BAT001">…</Card>        ← a real <a>
  //   <Card tone="critical"><Pill tone="critical">Vencido</Pill>…</Card>
  //
  // `tone` IS THE CARD'S OWN SHADOW, TINTED — NOT A RIM, NOT A FILL. Nine
  // components already accept `tone`; Card and Panel did not, which was an
  // asymmetry, not a decision — you could say "this well is critical" and not
  // "this card is critical". The first version of this said it with a THIN CAP
  // along the top edge, three solid pixels of the tone's own ink — and it was
  // wrong. A coloured stripe along the top of a card is the single most
  // repeated pattern in every admin panel and every template ever sold; it says
  // nothing about THIS system. Nácar's own law is the way out, because it
  // already solved the identical problem for `PageHeader`: nothing separates
  // with a line if it can separate with light — see `--sx-halo` and `.hd`
  // there. A card carries state the same way a header carries its own weight:
  // the shadow it already casts (`--sx-e-1/2/3`) picks up the tone's colour
  // instead of staying neutral ink. Up close it barely registers; a whole grid
  // of cards reads which ones are "hot" without reading a word.
  //
  // KEPT DELIBERATELY FAINT. A saturated glow around a card is worse than the
  // stripe it replaces — it stops reading as "this system" and starts reading
  // as noise. `--card-glow` mixes the tone at a low, conservative percentage,
  // lower still under the dark theme: a tinted light reads sooner against a
  // dark surface than against a light one, the same asymmetry `--sx-halo`
  // already carries (70% light / 18% dark) for the same reason.
  //
  // AND COLOUR NEVER TRAVELS ALONE — that rule does not stop at Pill. A card
  // whose shadow is tinted with nothing inside it that names the state is a
  // colour loose in the room: put a `Pill` or a sentence with the word in it
  // inside the card. `tone` decorates a claim the content already makes; it
  // does not make the claim by itself.
  //
  // ELEVATION IS ALTITUDE, NOT IMPORTANCE. e-1 is the page's own furniture —
  // rows, tiles, panels. e-2 is something that came forward: a menu, a hover, a
  // card being dragged. e-3 is something that took the screen: a dialog, a
  // Sheet. A tile at e-3 does not read as important, it reads as broken, because
  // the eye reads it as floating a centimetre above the monitor.
  //
  // IT IS A FLEX COLUMN, deliberately. Its children stack, a Stack inside it
  // fills it, and — the reason it matters — a Card whose parent gives it a
  // height can hand that height to a child that scrolls. That is what Panel's
  // `scroll` is built on.
  //
  // `class` is not part of the API. A scoped class from the calling component
  // would not reach in here anyway (different scope, and in a Core a different
  // shadow root), so compose with props and slots instead of reaching in.
  //
  // ─────────────────────────────────────────────────────────────────────────
  // EL MARCO: TRES MANERAS DE CERRAR UNA SUPERFICIE — y por qué importa más
  // que las tres variantes que lo usan.
  //
  // Una superficie sólo se distingue de su fondo de tres maneras: por luz,
  // por línea o por tono. Nácar eligió la luz como ley — la sombra de arriba
  // ES esa elección, y `--sx-halo` en `PageHeader` es la misma elección
  // dicha con otra sintaxis. `variant` no la contradice: expone las otras
  // dos, que siempre estuvieron disponibles y nunca tuvieron nombre.
  //
  //   raised (default — NO SE TOCA) — la luz. Lo de siempre: `--sx-e-1/2/3`.
  //
  //   crest — la línea, dibujada donde no estorba. Adaptada de un ERP real
  //   — de ahí salió el pedido de abrir esta salida — y RECOMPUESTA con
  //   tokens de Nácar, no copiada: las tres capas ya existían, sueltas.
  //     · `--card-crest-line`         el filo de arriba (token PROPIO — ver
  //                                    por qué más abajo)
  //     · `0 0 0 1px var(--sx-edge)`   el anillo, EN LA SOMBRA — no en
  //                                    `border`: no ocupa layout, no pelea
  //                                    con el radio. `ChoiceCards.svelte` usa
  //                                    `border` para su propio anillo y paga
  //                                    ese costo; acá no hace falta pagarlo.
  //     · `--sx-e-1/2/3`               la sombra de siempre, según `elevation`
  //   LA PRIMERA VERSIÓN USABA `--sx-e-inset` — el reflejo blanco que ya
  //   tenían Button y Toast — y ERA UN DEFECTO, la novena repetición del
  //   mismo error de este repo: un valor copiado de otro sistema no
  //   significa lo mismo donde se pega. En Sarion las tarjetas viven sobre
  //   un fondo oscuro y un reflejo blanco AHÍ lee. Acá `--sx-surface` en
  //   claro es `#FFFFFF` — blanco al 90% sobre blanco mide 1.000:1, ni un
  //   defecto sutil: no hay línea, literalmente. Nadie lo vio en pantalla
  //   hasta que una persona miró la variante; `pnpm contrast` no lo atrapaba
  //   porque el par no estaba medido — ver `DISTINCT` en
  //   `scripts/contrast.mjs`, ahora sí lo está.
  //   UN REFLEJO BLANCO NECESITA ALGO OSCURO DEBAJO. Por eso NO se tocó
  //   `--sx-e-inset` — lo usan `Button.svelte` y `Toast.svelte` sobre
  //   superficies donde el reflejo SÍ trabaja (el acento pleno, una sombra
  //   `e-3` fuerte) y retocarlo ahí para arreglar acá habría repetido el
  //   mismo error una vez más, sólo que en la dirección contraria. `crest`
  //   tiene su propio token, `--card-crest-line`, definido como
  //   `color-mix(in srgb, var(--sx-ink) 6%, var(--sx-surface))` — un 6% de
  //   la TINTA sobre la SUPERFICIE, no un rgba fijo. Es opaco (no depende de
  //   qué haya detrás) y no necesita un bloque `[data-sx-theme="dark"]`
  //   aparte: `--sx-ink` y `--sx-surface` ya se reamarran solos por tema, así
  //   que UNA fórmula sirve para las dos. En claro, `--sx-ink` es casi
  //   negro: el filo sale apenas más oscuro que la superficie — un canto
  //   iluminado desde arriba, leído sobre papel, no un reflejo. En oscuro,
  //   `--sx-ink` es casi blanco: la MISMA fórmula da, sola, el reflejo claro
  //   que antes había que escribir a mano. Medido: 1.12–1.18 en las cuatro
  //   combinaciones de tema y perilla, todas por encima del piso de 1.05 —
  //   ver el par nuevo en `DISTINCT`.
  //
  //   filled — el tono. Sin sombra, o con la mínima: el relleno hace el
  //   trabajo que antes hacía la luz, así que una grilla de muchas tarjetas
  //   no acumula sombra como ruido. El relleno NO es `--sx-sunk` a secas:
  //   medido contra `--sx-ground` (donde vive una Card suelta) da 1.042 en
  //   oscuro con el acento por defecto — bajo el piso de distinguibilidad de
  //   este repo (1.05, ver `DISTINCT_MIN` en `scripts/contrast.mjs`).
  //   `--card-fill`, más abajo, le suma un 8% de `--sx-edge`: separa a
  //   1.15–1.20 en las cuatro combinaciones de tema y perilla, sin tocar un
  //   solo token del sistema. Medido, no supuesto.
  //
  // POR QUÉ EL MARCO IMPORTA MÁS QUE LAS VARIANTES: sin él, `crest` y
  // `filled` son dos opciones que alguien elige por gusto, y a los seis
  // meses hay tres mecanismos mezclados en la misma pantalla sin que nadie
  // pueda explicar por qué — peor que tener uno solo. Con el marco, elegir
  // `crest` es decir «acá separo con línea, a propósito», no «me gustó más».
  //
  // POR QUÉ LA SALIDA EXISTE, Y POR QUÉ EL DEFAULT NO SE MUEVE: «al final es
  // una lib — no pasa nada por dar más herramientas al diseñador», y con
  // razón: que dos módulos se sientan distintos usando los mismos tokens no
  // es decoración, es lo que separa una librería que da herramientas de una
  // que impone una respuesta. `raised` sigue siendo la ley — es lo que se
  // dibuja si nadie escribe nada. `variant` es una perilla explícita, la
  // misma clase de salida que el README ya documenta para `--sx-thead` o
  // `--sx-chrome-tint`: un nivel más alto que tocar un token, uno más bajo
  // que reescribir el componente.
  //
  // El mismo mapa, con los mismos tres nombres de mecanismo, se repite en
  // `PageHeader` (`halo` / `sarion` / `banda`) — no es coincidencia: es el
  // mismo marco, aplicado a otro objeto. Ver la cabecera de ese archivo.
  // ─────────────────────────────────────────────────────────────────────────

  /** A step on the spacing scale for the inner padding. 0 ⇒ flush. */
  export let pad = 5;
  /** 1 | 2 | 3 — altitude, per the note above. 0 ⇒ flat, for a card inside a card. */
  export let elevation = 1;
  /** 1 | 2 | 3 — the radius scale. Nothing below r-1; nothing is square. */
  export let radius = 3;
  /** A destination ⇒ the whole card is a link. */
  export let href = '';
  /** No destination but something happens ⇒ the whole card is a button. */
  export let interactive = false;
  /** Only meaningful on an interactive card. */
  export let disabled = false;
  /** Drawn as an accent ring, and said out loud with aria-pressed / aria-current. */
  export let selected = false;
  /**
   * '' | positive | attention | critical | info | neutral. Tints the card's own
   * shadow — never a rim, never a fill. See the note above: it has to ride
   * alongside a Pill or a sentence that names the state, never alone.
   */
  export let tone = '';
  /**
   * raised | crest | filled — HOW this surface leaves its background: light,
   * line or tone. `raised` is the default and is not the same as writing
   * nothing wrong; it is the law. See «EL MARCO» above before reaching for
   * the other two.
   */
  export let variant = 'raised';

  const STEPS = new Set([1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20]);
  const step = (n) => (STEPS.has(Number(n)) ? `var(--sx-s-${n})` : '0px');
  const TONES = new Set(['positive', 'attention', 'critical', 'info', 'neutral']);
  const VARIANTS = new Set(['raised', 'crest', 'filled']);

  // A disabled link is not a thing: an <a> with no href is not focusable and an
  // <a> with one still navigates. So a card that is both a destination and
  // unavailable becomes a disabled button — inert, focusable-by-nothing, honest.
  $: kind = href && !disabled ? 'a' : interactive || href ? 'button' : 'div';
  $: live = kind !== 'div' && !disabled;
  $: t = TONES.has(tone) ? tone : '';
  // An unrecognised value falls back to `raised` rather than to nothing: a
  // typo in `variant` has to fail SAFE (the law) not fail INVISIBLE (a card
  // with no shape at all).
  $: v = VARIANTS.has(variant) ? variant : 'raised';
  // `--card-tone` carries the tone colour as a variable rather than a class per
  // tone, because `--card-glow` (below) has to mix it in once for all five
  // tones plus "none". Undefined resolves through the `transparent` fallback in
  // the rule itself, so an untoned card pays for nothing — its glow layer is
  // fully transparent and costs nothing visible.
  $: css = `--card-pad:${step(pad)}` + (t ? `;--card-tone:var(--sx-${t})` : '');
</script>

<svelte:element
  this={kind}
  {...$$restProps}
  class="card e{elevation} r{radius}"
  class:live
  class:selected
  class:off={disabled}
  class:crest={v === 'crest'}
  class:filled={v === 'filled'}
  style={css}
  href={kind === 'a' ? href : undefined}
  type={kind === 'button' ? 'button' : undefined}
  disabled={kind === 'button' && disabled ? true : undefined}
  aria-pressed={kind === 'button' && !disabled && selected ? 'true' : undefined}
  aria-current={kind === 'a' && selected ? 'true' : undefined}
  on:click
  on:keydown
>
  <slot />
</svelte:element>

<style>
  .card {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    padding: var(--card-pad);
    background: var(--sx-surface);
    color: var(--sx-ink);
    text-align: left;
    /* The <a> and <button> forms have to arrive at the same place as the <div>:
       no underline, no user-agent border, the family and size inherited. */
    font: inherit;
    text-decoration: none;
    border: 0;
    position: relative;
    /* THE GLOW. A low, conservative mix of the tone into transparent — an
       untoned card resolves `--card-tone` through its `transparent` fallback,
       so this costs nothing when `tone` is not set. Lower under the dark theme
       below: coloured light reads sooner against a dark surface than a light
       one (same reason `--sx-halo` is 70% on light and 18% on dark). Start
       faint and raise the percentage later if it turns out to under-read — it
       is one number, not a rewrite. */
    --card-glow: color-mix(in srgb, var(--card-tone, transparent) 22%, transparent);
    /* THE CREST EDGE — `crest` only, costs nothing otherwise. A token OF ITS
       OWN, not a re-bind of `--sx-e-inset` (Button/Toast keep that one
       untouched, see the note at the top of this file for why). Built
       entirely from `--sx-ink` and `--sx-surface`, which already re-bind
       under `[data-sx-theme="dark"]`, so one formula covers both themes:
       dark ink on a light surface reads as a hairline shadow, light ink on
       a dark surface reads as the reflection the mechanism was named for.
       Measured: 1.12–1.18 across theme × chrome-tint. See `pnpm contrast`. */
    --card-crest-line: color-mix(in srgb, var(--sx-ink) 6%, var(--sx-surface));
    /* THE FILL FOR `filled` ONLY — costs nothing when the variant is not
       `filled` since nothing reads it otherwise. `--sx-sunk` alone measured
       1.042 against `--sx-ground` in dark (below this repo's 1.05 floor);
       +8% of `--sx-edge` clears every theme × chrome-tint combination with
       margin (1.15–1.20) without touching a system token. No dark override
       needed here, unlike `--card-glow` above: this formula is built ENTIRELY
       from role tokens that already re-bind themselves under
       `[data-sx-theme="dark"]`, so the same one-line declaration resolves
       correctly in both themes on its own. See `pnpm contrast`. */
    --card-fill: color-mix(in srgb, var(--sx-edge) 8%, var(--sx-sunk));
  }

  :global([data-sx-theme='dark']) .card,
  :global(.sx-dark) .card {
    --card-glow: color-mix(in srgb, var(--card-tone, transparent) 12%, transparent);
  }

  /* Same offset and blur `PageHeader` already uses for `--sx-halo` — the same
     law, applied to a card instead of a bar: light falling, not a line. It
     rides as an EXTRA layer alongside the card's own elevation shadow rather
     than replacing it, so an untoned card (glow = transparent) still gets
     exactly the shadow it always had, unchanged. */
  .e0 { box-shadow: none; }
  .e1 { box-shadow: var(--sx-e-1), 0 12px 28px -18px var(--card-glow); }
  .e2 { box-shadow: var(--sx-e-2), 0 12px 28px -18px var(--card-glow); }
  .e3 { box-shadow: var(--sx-e-3), 0 12px 28px -18px var(--card-glow); }

  .r1 { border-radius: var(--sx-r-1); }
  .r2 { border-radius: var(--sx-r-2); }
  .r3 { border-radius: var(--sx-r-3); }

  /* Selection is an accent ring drawn INSIDE the box, so a selected card keeps
     the exact footprint of an unselected one and a grid of them does not shift
     by two pixels when you pick one. `inset` also means it survives on top of a
     dark surface, where an outer ring would be lost in the shadow. */
  .selected { box-shadow: 0 0 0 2px var(--sx-accent) inset, var(--sx-e-1), 0 12px 28px -18px var(--card-glow); }
  .selected.e2 { box-shadow: 0 0 0 2px var(--sx-accent) inset, var(--sx-e-2), 0 12px 28px -18px var(--card-glow); }
  .selected.e3 { box-shadow: 0 0 0 2px var(--sx-accent) inset, var(--sx-e-3), 0 12px 28px -18px var(--card-glow); }

  .live {
    cursor: pointer;
    transition:
      transform var(--sx-fast) var(--sx-ease),
      box-shadow var(--sx-fast) var(--sx-ease);
  }
  /* One step of altitude on hover and a single pixel of lift: enough to say
     "this responds", not enough to move the row under the reader's eye. */
  .live:hover { transform: translateY(-1px); box-shadow: var(--sx-e-2), 0 12px 28px -18px var(--card-glow); }
  .live.selected:hover { box-shadow: 0 0 0 2px var(--sx-accent) inset, var(--sx-e-2), 0 12px 28px -18px var(--card-glow); }
  .live:active { transform: none; box-shadow: var(--sx-e-1), 0 12px 28px -18px var(--card-glow); }

  .off { opacity: .5; cursor: not-allowed; }

  /* ═══ VARIANT: crest — la línea ═══════════════════════════════════════════
     Combined-class selectors (`.crest.e1`, not a redeclared `.e1`) on purpose:
     specificity wins outright over the plain `.eN`/`.selected` rules above
     regardless of source order, so this block can live anywhere in the file
     without silently depending on being written after them. Same three-layer
     order everywhere — reflejo, anillo, sombra — plus the tone glow riding
     last, exactly like `raised`. The ring survives at `.e0` (a crest card can
     be flat and still show its line; that is the whole point of choosing a
     line over light) where `raised` shows nothing at `.e0` — altitude is not
     what identifies a crest card, the ring is. */
  .crest.e0 { box-shadow: inset 0 1px 0 var(--card-crest-line), 0 0 0 1px var(--sx-edge); }
  .crest.e1 {
    box-shadow: inset 0 1px 0 var(--card-crest-line), 0 0 0 1px var(--sx-edge), var(--sx-e-1), 0 12px 28px -18px var(--card-glow);
  }
  .crest.e2 {
    box-shadow: inset 0 1px 0 var(--card-crest-line), 0 0 0 1px var(--sx-edge), var(--sx-e-2), 0 12px 28px -18px var(--card-glow);
  }
  .crest.e3 {
    box-shadow: inset 0 1px 0 var(--card-crest-line), 0 0 0 1px var(--sx-edge), var(--sx-e-3), 0 12px 28px -18px var(--card-glow);
  }
  .crest.selected {
    box-shadow:
      0 0 0 2px var(--sx-accent) inset, inset 0 1px 0 var(--card-crest-line), 0 0 0 1px var(--sx-edge),
      var(--sx-e-1), 0 12px 28px -18px var(--card-glow);
  }
  .crest.selected.e2 {
    box-shadow:
      0 0 0 2px var(--sx-accent) inset, inset 0 1px 0 var(--card-crest-line), 0 0 0 1px var(--sx-edge),
      var(--sx-e-2), 0 12px 28px -18px var(--card-glow);
  }
  .crest.selected.e3 {
    box-shadow:
      0 0 0 2px var(--sx-accent) inset, inset 0 1px 0 var(--card-crest-line), 0 0 0 1px var(--sx-edge),
      var(--sx-e-3), 0 12px 28px -18px var(--card-glow);
  }
  .crest.live:hover {
    box-shadow: inset 0 1px 0 var(--card-crest-line), 0 0 0 1px var(--sx-edge), var(--sx-e-2), 0 12px 28px -18px var(--card-glow);
  }
  .crest.live.selected:hover {
    box-shadow:
      0 0 0 2px var(--sx-accent) inset, inset 0 1px 0 var(--card-crest-line), 0 0 0 1px var(--sx-edge),
      var(--sx-e-2), 0 12px 28px -18px var(--card-glow);
  }
  .crest.live:active {
    box-shadow: inset 0 1px 0 var(--card-crest-line), 0 0 0 1px var(--sx-edge), var(--sx-e-1), 0 12px 28px -18px var(--card-glow);
  }

  /* ═══ VARIANT: filled — el tono ═══════════════════════════════════════════
     The resting shadow (the altitude layer) drops at e1 — the common case, a
     grid of many of these — because the fill already does the identifying;
     stacking a real shadow on top of it is the noise this variant exists to
     avoid. e2/e3 keep their real shadow untouched (no override below): those
     mean "came forward" / "took the screen", a fact that does not stop being
     true just because this card is also filled. Same source-order dependency
     as `raised` itself between the plain elevation rule and `.selected`
     (equal specificity; `.selected` still has to come after `.eN`, exactly
     like the base rules above) — `.selected.e2`/`.selected.e3` exist for the
     same reason the base ones do: to stop depending on that tie at all. */
  .filled { background: var(--card-fill); }
  .filled.e1 { box-shadow: 0 12px 28px -18px var(--card-glow); }
  .filled.selected { box-shadow: 0 0 0 2px var(--sx-accent) inset, 0 12px 28px -18px var(--card-glow); }
  .filled.selected.e2 {
    box-shadow: 0 0 0 2px var(--sx-accent) inset, var(--sx-e-2), 0 12px 28px -18px var(--card-glow);
  }
  .filled.selected.e3 {
    box-shadow: 0 0 0 2px var(--sx-accent) inset, var(--sx-e-3), 0 12px 28px -18px var(--card-glow);
  }
  .filled.live:hover { box-shadow: var(--sx-e-1), 0 12px 28px -18px var(--card-glow); }
  .filled.live.selected:hover {
    box-shadow: 0 0 0 2px var(--sx-accent) inset, var(--sx-e-1), 0 12px 28px -18px var(--card-glow);
  }
  .filled.live:active { box-shadow: 0 12px 28px -18px var(--card-glow); }

  /* base.css owns the focus ring for a document; a Core has no base.css, so the
     component states it again. Offset outward so the ring never sits on top of
     the content, and the radius follows the card's own. */
  .card:focus-visible {
    outline: 2px solid var(--sx-ink);
    outline-offset: 2px;
  }

  /* Motion does a job or it does not exist. */
  @media (prefers-reduced-motion: reduce) {
    .live { transition: none; }
    .live:hover { transform: none; }
  }
</style>
