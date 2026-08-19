<script>
  // INFO DOT — la ayuda que premia a un elemento por decir poco.
  //
  // PARA QUÉ ES, Y POR QUÉ NO ES OTRO TOOLTIP
  //
  // Este sistema pide rótulos escuetos y castiga la prosa inline: un control con
  // media pantalla de texto al lado no se lee, se hojea. Pero a veces la
  // explicación importa —«¿por qué este costo dice 180?»— y esconderla del todo
  // tampoco sirve. El InfoDot es el trato: un marcador chico, `ⓘ` o `?`, que
  // NO cuesta una línea de texto y que, al pasar el mouse, al tocarlo o al
  // enfocarlo, suelta su guía. El rótulo queda limpio; la información queda a
  // un gesto.
  //
  //   Costo unitario <InfoDot text="Promedio ponderado de las últimas 12 compras." />
  //   <InfoDot mark="help" text="Se calcula al cerrar el período." />
  //
  // ES UN Tooltip CON DISPARADOR PROPIO, NO UN TOOLTIP NUEVO. La ley de la casa
  // es reusar lo que existe, y `Tooltip.svelte` ya resolvió lo difícil: la capa
  // superior (`popover`), el `aria-describedby` puesto sobre el nodo enfocable,
  // el Escape que cierra un nivel, la moción reducida, el reposicionamiento en
  // scroll. Reimplementar cualquiera de esas cosas acá sería mantener dos
  // copias de un problema que ya tiene una solución medida. Así que el InfoDot
  // sólo APORTA el disparador —un `<button>` redondo con la marca— y se lo pasa
  // a `Tooltip` en el slot. Tooltip encuentra ese botón (es el nodo enfocable),
  // le cuelga la descripción y ata hover/foco. El botón es `type="button"`: no
  // envía formularios ni navega; su único trabajo es existir para recibir el
  // foco y el hover.
  //
  // HOVER + TAP + FOCO, LOS TRES, SIN CÓDIGO EXTRA. Tooltip muestra al hover
  // sólo si el puntero es un mouse (un toque no lo hace parpadear) y muestra
  // SIEMPRE al foco. Un clic con mouse enfoca el botón → aparece. Un toque en
  // pantalla enfoca el botón → aparece. Un Tab del teclado lo enfoca → aparece.
  // «Hover o al tocarlo» sale de que el disparador sea un botón de verdad, no de
  // un manejador nuevo.
  //
  // NO ES EL `?` GLOBAL DE ShortcutOverlay. Ese `?` abre la hoja de atajos de
  // toda la pantalla, desde cualquier parte; éste explica UN elemento y vive
  // pegado a él. Por eso la marca por defecto es `ⓘ` (info), no `?`: dos
  // controles con el mismo signo enseñarían dos significados para el mismo
  // dibujo. `mark="help"` está para quien quiera el signo de pregunta a
  // propósito, sabiendo la diferencia.
  //
  // LA MARCA SE DIBUJA ACÁ, NO SALE DEL SET DE ÍCONOS. `Glyph` no trae `i` ni
  // `?` —y no es trabajo de esta pieza agregarlos al set—, así que el signo es
  // un carácter tipográfico centrado en el círculo, que escala con el `em` del
  // texto de al lado: junto a una etiqueta chica es chico, junto a un título es
  // más grande, sin una prop de tamaño que mantener sincronizada.
  import Tooltip from './Tooltip.svelte';

  /** La guía. Una línea corta — si es un párrafo, va en la pantalla (Well),
   *  no en un tooltip, igual que dice la cabecera de Tooltip. Requerida: un
   *  InfoDot sin texto es un botón que no dice nada. */
  export let text = '';
  /** info (ⓘ, default) | help (?). Ver «NO ES EL `?` GLOBAL» arriba. */
  export let mark = 'info';
  /** top | bottom | left | right — se lo pasa tal cual a Tooltip. */
  export let placement = 'top';
  /** El nombre accesible del botón. La guía es la DESCRIPCIÓN (via Tooltip);
   *  esto es el NOMBRE, corto, para que un lector de pantalla anuncie «Más
   *  información, botón» y después la descripción, sin leer lo mismo dos veces. */
  export let label = '';

  $: sign = mark === 'help' ? '?' : 'i';
  $: name = label || (mark === 'help' ? 'Ayuda' : 'Más información');
</script>

{#if text}
  <Tooltip {text} {placement}>
    <button class="dot" class:help={mark === 'help'} type="button" aria-label={name}>
      <span aria-hidden="true">{sign}</span>
    </button>
  </Tooltip>
{/if}

<style>
  .dot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    /* Escala con el texto de al lado, con un piso táctil por si queda solo. */
    width: 1.15em;
    height: 1.15em;
    min-width: 15px;
    min-height: 15px;
    flex: none;
    padding: 0;
    border: 1px solid var(--sx-edge);
    border-radius: var(--sx-r-pill);
    background: none;
    color: var(--sx-ink-3);
    /* La marca, centrada. Un poco más chica que su caja y en negrita para que
       un `i` o un `?` de 15px se lean como un signo y no como una mancha. */
    font-family: var(--sx-font);
    font-size: .72em;
    font-weight: var(--sx-w-bold);
    line-height: 1;
    font-style: normal;
    cursor: help;
    vertical-align: middle;
    transition: color var(--sx-fast) var(--sx-ease), border-color var(--sx-fast) var(--sx-ease);
  }
  /* El `i` centrado ópticamente pide un pelo de aire a la izquierda que el `?`
     no necesita. */
  .dot span { transform: translateY(-.02em); }
  .dot:not(.help) span { padding-inline-start: .04em; }

  .dot:hover { color: var(--sx-ink); border-color: var(--sx-ink-3); }

  .dot:focus-visible {
    outline: 2px solid var(--sx-ink);
    outline-offset: 2px;
  }
  :global([data-sx-theme='dark']) .dot:focus-visible,
  :global(.sx-dark) .dot:focus-visible { outline-color: var(--sx-n-0); }

  /* En pantalla táctil el dedo necesita blanco de sobra: se agranda el área de
     toque sin cambiar el tamaño visible del círculo, con un pseudo-elemento —
     el mismo recurso que usa `.revert` en Field.svelte. */
  @media (pointer: coarse) {
    .dot { position: relative; }
    .dot::after { content: ''; position: absolute; inset: -10px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .dot { transition: none; }
  }
</style>
