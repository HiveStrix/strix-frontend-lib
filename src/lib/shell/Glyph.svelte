<script module>
  // THE SYSTEM'S OWN HAND.
  //
  // WHY DRAW THEM INSTEAD OF INSTALLING A SET
  //
  // Two hard reasons and one soft one.
  //
  //   • A Core module runs under a strict CSP inside a shadow root: no CDN, no
  //     icon font, no sprite fetched from anywhere. Whatever ships has to be in
  //     the bundle already, so the only question is whose lines they are.
  //   • Borrowed sets are drawn on a 24 grid and then scaled down. At 16px that
  //     is a 24px drawing at 67 %: the strokes fall off the pixel grid, the
  //     joins mush, and the set that looked crisp in the README looks smeared on
  //     the ₡90 000 monitor in the yard office. These are drawn AT 16, which is
  //     the size they are used at.
  //   • And the soft one: a system whose type, spacing and depth were argued for
  //     and whose icons came from npm has a seam in it, and you can see the seam.
  //
  // WHAT IS IN IT AND WHY NOTHING ELSE
  //
  // Exactly what these products point at: a search, a refresh, a settings, a
  // plus, a close, four chevrons, a check, an alert, and then the nouns of the
  // work — box, truck, clock, gauge, wrench, clipboard, file, layers — plus the
  // four verbs that act on a row: trash, edit, download, filter. Twenty-four,
  // with `menu` — the twenty-fourth, argued for below.
  //
  //   <Glyph name="wrench" />                        ← beside a word
  //   <button aria-label="Actualizar"><Glyph name="refresh" /></button>
  //   <Glyph name="alert" label="Atención" />        ← carries meaning alone
  //
  // THE MARK IS NOT THE MESSAGE. A glyph never states a state by itself — that
  // is Pill's job, and Pill's whole argument is tone + mark + word. Here the
  // default is `aria-hidden`, because the overwhelmingly common case is an icon
  // sitting next to text that already says it. Pass `label` only when the glyph
  // really is the only thing saying something, and then it must be true.
  //
  // `menu`, THE ARGUMENT. Sidebar's phone drawer (`nav/Sidebar.svelte`) needs a
  // trigger in `TopBar`, and that trigger is a wordless button in a bar that is
  // already tight at 390px — exactly the case this file's own header says a
  // glyph is for. Three lines is not a rebus the way a wrench-inside-a-gear
  // would be; it is closer to `search` or `close` than to a novel pictogram —
  // the one navigation icon that reads before a person has learned this
  // system at all. Drawing it inline inside `TopBar.svelte` instead would have
  // repeated exactly the mistake this component exists to prevent — see this
  // file's own «WHY DRAW THEM INSTEAD OF INSTALLING A SET» above.

  /** Every name in the set, in the order the catalogue shows them. */
  export const GLYPHS = [
    'search', 'filter', 'refresh', 'settings', 'plus', 'close', 'check', 'alert',
    'chevronUp', 'chevronRight', 'chevronDown', 'chevronLeft',
    'box', 'truck', 'clock', 'gauge', 'wrench', 'clipboard', 'file', 'layers',
    'edit', 'trash', 'download', 'menu'
  ];

  // Drawn on a 16 × 16 grid with a ~1.4 margin, stroke centred, round caps and
  // joins. One path per glyph: every subpath shares the same stroke, so nothing
  // in the set can drift into a different weight from the rest of it.
  //
  // EL VIEWBOX VIAJA CON LOS PATHS. `GLYPH_VIEWBOX`, un poco más abajo, es la
  // grilla contra la que estos números están dibujados — 16, no 24. Dos
  // consumidores (`nav/Sidebar.svelte`, `nav/SideRail.svelte`) dibujan su
  // propio `<svg>` en vez de montar este componente, porque reciben un `d`
  // crudo en `items` y no un nombre de la lista de arriba; los dos escribían
  // `viewBox="0 0 24 24"` a mano —una grilla que nunca fue la de este
  // archivo— y el resultado era un ícono dibujado en el 67% superior-
  // izquierdo de su caja: chico, y corrido hacia una esquina, no centrado.
  // Los dos ahora importan `GLYPH_VIEWBOX` de acá en vez de repetir el
  // número: si esta grilla cambiara alguna vez, cambia en un solo lugar en
  // vez de en tres.
  export const GLYPH_VIEWBOX = '0 0 16 16';

  const PATHS = {
    search: 'M11.5 7a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0M10.3 10.3 13.6 13.6',
    filter: 'M1.7 2.4h12.6L9.5 8.6v5.3l-3-1.6V8.6Z',
    refresh: 'M13.6 8a5.6 5.6 0 1 1-1.62-3.98M13.7 2.6v3.8h-3.8',
    settings:
      'M11.7 8a3.7 3.7 0 1 1-7.4 0 3.7 3.7 0 0 1 7.4 0M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0' +
      'M11.7 8h1.9M9.85 11.2l.95 1.65M6.15 11.2l-.95 1.65M4.3 8H2.4M6.15 4.8 5.2 3.15M9.85 4.8l.95-1.65',
    plus: 'M8 3.2v9.6M3.2 8h9.6',
    close: 'M3.8 3.8 12.2 12.2M12.2 3.8 3.8 12.2',
    check: 'M2.8 8.4 6.3 11.9 13.2 4.4',
    alert: 'M8 2.9 14.2 13.5H1.8ZM8 6.7v3.1M8 11.9h.01',
    chevronUp: 'M3.3 9.8 8 5.1l4.7 4.7',
    chevronRight: 'M6.2 3.3 10.9 8l-4.7 4.7',
    chevronDown: 'M3.3 6.2 8 10.9l4.7-4.7',
    chevronLeft: 'M9.8 3.3 5.1 8l4.7 4.7',
    box: 'M2.2 4.7 8 8l5.8-3.3M8 14.6V8M13.8 4.7v6.6L8 14.6 2.2 11.3V4.7L8 1.4Z',
    truck:
      'M1.2 11.5V4.3a.8.8 0 0 1 .8-.8h6a.8.8 0 0 1 .8.8v7.2M8.8 6.3h2.6l2.8 2.9v2.3' +
      'M1.2 11.5h1.7M5.9 11.5h4.1M13 11.5h1.2' +
      'M5.9 12.1a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M13 12.1a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0',
    clock: 'M13.8 8a5.8 5.8 0 1 1-11.6 0 5.8 5.8 0 0 1 11.6 0M8 4.6V8.2l2.4 1.5',
    gauge: 'M1.8 10.5a6.2 6.2 0 0 1 12.4 0M8.8 9.6 11.3 6.4M9.2 10.5a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0',
    wrench:
      'M9.5 4.1a.67.67 0 0 0 0 .93l1.07 1.07a.67.67 0 0 0 .93 0l2.51-2.51a4 4 0 0 1-5.29 5.29' +
      'l-4.61 4.61a1.41 1.41 0 0 1-2-2l4.61-4.61a4 4 0 0 1 5.29-5.29l-2.51 2.51Z',
    clipboard:
      'M6.1 1.3h3.8a.6.6 0 0 1 .6.6v1.1a.6.6 0 0 1-.6.6H6.1a.6.6 0 0 1-.6-.6V1.9a.6.6 0 0 1 .6-.6Z' +
      'M5.5 2.7H4a1 1 0 0 0-1 1v9.7a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V3.7a1 1 0 0 0-1-1h-1.5' +
      'M6 7.6h4M6 10.4h2.6',
    file: 'M9.3 1.3H4a.7.7 0 0 0-.7.7v12a.7.7 0 0 0 .7.7h8a.7.7 0 0 0 .7-.7V4.7L9.3 1.3ZM9.3 1.3v3.4h3.4',
    layers: 'M8 1.5 14.2 4.6 8 7.7 1.8 4.6ZM1.8 8 8 11.1 14.2 8M1.8 11.4 8 14.5 14.2 11.4',
    edit:
      'M7.3 2.7H2.7a.7.7 0 0 0-.7.7v10a.7.7 0 0 0 .7.7h10a.7.7 0 0 0 .7-.7V8.7' +
      'M12.3 1.7a1.3 1.3 0 0 1 1.9 1.9L8 9.8l-2.7.7.7-2.7 6.3-6.1Z',
    trash:
      'M2.5 4h11M6.2 4V2.6a.8.8 0 0 1 .8-.8h2a.8.8 0 0 1 .8.8V4' +
      'M12.3 4l-.6 9.6a.9.9 0 0 1-.9.8H5.2a.9.9 0 0 1-.9-.8L3.7 4M6.6 6.9v4.6M9.4 6.9v4.6',
    download: 'M13.7 10.4v2.3a.9.9 0 0 1-.9.9H3.2a.9.9 0 0 1-.9-.9v-2.3M4.9 7.2 8 10.3l3.1-3.1M8 10.3V2.3',
    menu: 'M2.5 4.5h11M2.5 8h11M2.5 11.5h11'
  };

  export { PATHS as GLYPH_PATHS };
</script>

<script>
  /** A name from GLYPHS. An unknown name draws nothing — a wrong icon is worse. */
  export let name = 'check';
  /** The set is drawn at 16. It holds from about 13 to 22; past that it is a diagram. */
  export let size = 16;
  /** Stroke weight in device pixels — held constant, see below. */
  export let stroke = 1.5;
  /**
   * Only when the glyph is the ONLY thing saying this. Empty ⇒ aria-hidden,
   * which is right whenever a word sits beside it.
   */
  export let label = '';

  $: d = PATHS[name] ?? '';
  $: mute = !label;
  // The weight is held at ~1.5 device px instead of scaling with the box: at 20
  // an icon whose strokes grew to 1.9 out-shouts the 15px text it labels, and at
  // 13 one that shrank to 1.2 disappears against it. A set drawn at one size
  // keeps one weight; that is what makes twenty-three drawings look like one hand.
  $: sw = (Number(stroke) * 16) / (Number(size) || 16);
</script>

{#if d}
  <svg
    class="g"
    width={size}
    height={size}
    viewBox={GLYPH_VIEWBOX}
    fill="none"
    stroke="currentColor"
    stroke-width={sw}
    stroke-linecap="round"
    stroke-linejoin="round"
    role={mute ? undefined : 'img'}
    aria-hidden={mute ? 'true' : undefined}
    aria-label={mute ? undefined : label}
  >
    <path d={d} />
  </svg>
{/if}

<style>
  /* `flex: none` because the commonest home for a glyph is a flex row next to a
     label that is allowed to shrink — and a squashed icon reads as a bug, not as
     a tight layout. */
  .g { display: block; flex: none; }
</style>
