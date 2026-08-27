<script>
  // MODULE BAR — la barra propia de un core embebido, como TARJETA REDONDEADA
  // DESACOPLADA en vez de una franja pegada de borde a borde.
  //
  // Es al core lo que `Sidebar` es al shell: una tarjeta que FLOTA sobre el
  // mismo lienzo, con esquinas redondeadas y un margen que la separa del
  // contenido. Así el módulo se lee como parte del mismo sistema —el shell y el
  // core como un solo objeto— y no como una pegatina superpuesta. Ver
  // CONTRACT §5 (carriles desprendidos) y §6 (el shell adopta el tono del core).
  //
  // QUIÉN PONE EL AIRE. El de arriba y los lados lo da el marco del shell
  // alrededor del outlet del módulo (`/m/`, la cláusula 1); el de abajo, esta
  // barra con su `margin-bottom`. La barra NO se dibuja un margen lateral: como
  // el `Sidebar`, confía en el gutter del host.
  //
  // El contenido (pestañas, búsqueda, acciones) entra por el slot default; esta
  // pieza sólo aporta el marco flotante y el pegado al hacer scroll.

  /** Se pega arriba del scroll. Casi siempre sí; apagalo para una barra que
   *  se va con el contenido. */
  export let sticky = true;
  /** Etiqueta accesible de la barra (landmark). */
  export let label = '';
</script>

<header class="mbar" class:sticky aria-label={label || undefined}>
  <slot />
</header>

<style>
  .mbar {
    background: var(--sx-surface);
    color: var(--sx-ink);
    border-radius: var(--sx-r-2);
    /* La firma del carril desprendido: una tarjeta que flota, no una raya. */
    box-shadow: var(--sx-e-1);
    padding: var(--sx-s-3) var(--sx-s-8);
    /* El único aire que pone la barra: el que la separa del contenido, igual
       que el `Sidebar` se separa de él. El resto lo da el marco del shell. */
    margin-bottom: var(--sx-s-4);
  }

  /* Pegada, sube al z del cromo pegajoso para montar el contenido que pasa por
     debajo. El radio se conserva: sigue siendo una tarjeta, ahora anclada. */
  .mbar.sticky {
    position: sticky;
    top: 0;
    z-index: var(--sx-z-sticky);
  }

  @media (max-width: 560px) {
    .mbar { padding: var(--sx-s-3) var(--sx-s-4); }
  }
</style>
