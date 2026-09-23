<script>
  // EL POZO DE ÍCONO — la dosis chica de color de la dirección de Stitch.
  //
  // Un ícono dentro de un cuadrado redondeado, apenas tallado en su tarjeta y
  // teñido con un matiz de la paleta de categoría (--sx-hue-*). Identifica una
  // COSA —un módulo, una familia, un tipo de registro—, no un estado: para un
  // estado está Pill, con su tono y su palabra, porque el color nunca viaja solo.
  //
  //   <IconWell name="wrench" hue="amber" />            ← una familia
  //   <IconWell path={G.box} hue="aqua" size="sm" />    ← un `d` ya resuelto
  //   <IconWell name="alert" hue="coral" label="Pendiente de revisión" />
  //
  // POR QUÉ 16 % Y 66 %. El fondo es el matiz al 16 % sobre la superficie; el
  // ícono, el matiz al 66 % contra --sx-ink. El 66 % está medido: un ícono puede
  // cargar significado, así que pide 3:1 contra su pozo (WCAG 1.4.11), y el más
  // claro de la paleta —ámbar— daba 3.19 al 72 % y 3.59 al 66 %. Los siete pares
  // (seis matices y el acento) viven en `scripts/contrast.mjs`, en los dos temas:
  // si alguien mueve un porcentaje acá, tiene que moverlo allá.
  import { GLYPH_PATHS, GLYPH_VIEWBOX } from './Glyph.svelte';

  /** Un nombre de Glyph. Se ignora si viene `path`. */
  export let name = 'box';
  /** Un `d` ya resuelto (p. ej. `GLYPH_PATHS.box`), para quien ya lo tiene. */
  export let path = '';
  /** violet | aqua | coral | amber | sage | indigo | accent (el del producto). */
  export let hue = 'accent';
  /** sm 28 · md 36 · lg 44 — el ícono va a 16, 18 y 22. */
  export let size = 'md';
  /** Sólo si el pozo es lo ÚNICO que dice esto. Vacío ⇒ decorativo. */
  export let label = '';

  const HUES = ['violet', 'aqua', 'coral', 'amber', 'sage', 'indigo', 'accent'];
  const ICON = { sm: 16, md: 18, lg: 22 };

  $: h = HUES.includes(hue) ? hue : 'accent';
  $: s = ICON[size] ? size : 'md';
  $: d = path || GLYPH_PATHS[name] || '';
  // El mismo trazo en píxeles de pantalla que Glyph (1.5 a 16 px).
  $: sw = (1.5 * 16) / ICON[s];
</script>

<span
  class="well {s} {h}"
  role={label ? 'img' : undefined}
  aria-label={label || undefined}
  aria-hidden={label ? undefined : 'true'}
>
  {#if d}
    <svg viewBox={GLYPH_VIEWBOX} width={ICON[s]} height={ICON[s]} fill="none" stroke="currentColor"
      stroke-width={sw} stroke-linecap="round" stroke-linejoin="round" focusable="false">
      <path {d} />
    </svg>
  {/if}
</span>

<style>
  .well {
    --w-hue: var(--sx-accent);
    display: inline-grid;
    place-items: center;
    flex: none;
    background: color-mix(in srgb, var(--w-hue) 16%, var(--sx-surface));
    color: color-mix(in srgb, var(--w-hue) 66%, var(--sx-ink));
    box-shadow: var(--sx-e-well, none);
  }
  .sm { width: 28px; height: 28px; border-radius: 9px; }
  .md { width: 36px; height: 36px; border-radius: 12px; }
  .lg { width: 44px; height: 44px; border-radius: 14px; }
  svg { display: block; }

  .violet { --w-hue: var(--sx-hue-violet); }
  .aqua   { --w-hue: var(--sx-hue-aqua); }
  .coral  { --w-hue: var(--sx-hue-coral); }
  .amber  { --w-hue: var(--sx-hue-amber); }
  .sage   { --w-hue: var(--sx-hue-sage); }
  .indigo { --w-hue: var(--sx-hue-indigo); }
</style>
