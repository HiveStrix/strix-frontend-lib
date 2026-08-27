<script>
  // APPSHELL — el layout de una app del ecosistema, en UNA regla.
  //
  // LA REGLA (y por qué existe este archivo): la `Sidebar` es dueña de TODA la
  // altura del viewport a la izquierda; la `TopBar` vive en la COLUMNA DE
  // CONTENIDO, a su derecha, y NUNCA cruza por encima de la Sidebar. Solo el
  // contenido scrollea — el shell ocupa exactamente el alto de la ventana
  // (`100dvh`) y no crece con la página.
  //
  // El defecto que esto ataja: poner la `TopBar` full-width arriba de todo deja
  // a la Sidebar arrancando DEBAJO de la barra — la barra "se sobrepasa" sobre
  // la columna de navegación, la Sidebar pierde el espacio vertical de arriba, y
  // el módulo deja de estar en sintonía con el resto del ecosistema (donde la
  // Sidebar llega hasta el borde superior). La `Sidebar` ya viene lista para
  // esto (`align-self: stretch` + `flex: none`): sólo necesita el contenedor
  // correcto, y ese contenedor es este.
  //
  //   <AppShell>
  //     <Sidebar slot="sidebar" bind:value items={…} />
  //     <TopBar  slot="topbar"  product="Strix" tenant="Opra">…</TopBar>
  //     <!-- el contenido de la página va en el slot por defecto -->
  //   </AppShell>
  //
  // Los tres son opcionales: sin `sidebar` es una app de una sola columna con
  // barra; sin `topbar`, la Sidebar más el contenido (como un core montado que
  // trae su propia `ModuleBar` adentro).
</script>

<div class="appshell">
  <slot name="sidebar" />
  <div class="main">
    {#if $$slots.topbar}<div class="bar"><slot name="topbar" /></div>{/if}
    <div class="scroll"><slot /></div>
  </div>
</div>

<style>
  /* El shell ocupa el alto de la ventana y NO scrollea él mismo: scrollea el
     contenido. `min-height: 0` en toda la cadena de flex para que el hijo que
     scrollea pueda encogerse por debajo de su contenido (sin esto, un flex item
     no baja de su alto intrínseco y el overflow se escapa al documento). */
  .appshell {
    display: flex;
    height: 100dvh;
    min-height: 0;
    overflow: hidden;
    background: var(--sx-ground);
    color: var(--sx-ink);
  }

  /* La Sidebar (slot directo) es un flex item con su propio ancho (`flex: none`)
     y `align-self: stretch`, así que se estira sola a la altura de esta fila. No
     se envuelve en nada: envolverla rompería ese estiramiento. */

  /* La columna derecha: la barra fija arriba, el contenido scrolleando debajo. */
  .main {
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .bar { flex: none; }
  .scroll {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
    overscroll-behavior: contain;
  }
</style>
