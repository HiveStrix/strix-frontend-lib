<script>
  // The chooser.
  //
  // Its job is to disappear. Eight directions are already a lot to hold in the
  // head, so the harness stays achromatic grey and offers exactly three moves:
  // pick an element family, hide directions you've ruled out, and switch
  // between seeing all of them at once or one of them large.
  import { DIRECTIONS } from './directions.js';
  import Acciones from './pages/Acciones.svelte';
  import Formularios from './pages/Formularios.svelte';
  import Tablas from './pages/Tablas.svelte';
  import Paneles from './pages/Paneles.svelte';
  import Estados from './pages/Estados.svelte';
  import Navegacion from './pages/Navegacion.svelte';
  import Datos from './pages/Datos.svelte';
  import Pantalla from './pages/Pantalla.svelte';

  const PAGES = [
    { id: 'acciones', name: 'Acciones', note: 'Botones, grupos, barras de herramientas', c: Acciones },
    { id: 'formularios', name: 'Formularios', note: 'Campos, selección, validación', c: Formularios },
    { id: 'tablas', name: 'Tablas y listas', note: 'Filas densas, orden, selección, vacío', c: Tablas },
    { id: 'paneles', name: 'Paneles y KPIs', note: 'Contenedores, cifras, secciones', c: Paneles },
    { id: 'estados', name: 'Estados y diálogos', note: 'Alertas, confirmación, carga, error', c: Estados },
    { id: 'navegacion', name: 'Navegación', note: 'Barras, pestañas, filtros, migas', c: Navegacion },
    { id: 'datos', name: 'Datos y tiempo', note: 'Progreso, umbrales, línea de tiempo', c: Datos },
    { id: 'pantalla', name: 'Pantalla completa', note: 'La flota, armada de principio a fin', c: Pantalla }
  ];

  let page = PAGES[0];
  // Ruling a direction out is the actual work here, so it is one click and it
  // persists across pages — you compare the survivors, not the full eight, once
  // you've made up your mind about a couple of them.
  let live = new Set(DIRECTIONS.map((d) => d.id));
  let solo = null;

  const toggle = (id) => {
    live.has(id) ? live.delete(id) : live.add(id);
    if (live.size === 0) live = new Set(DIRECTIONS.map((d) => d.id));
    live = live;
  };

  $: shown = solo ? DIRECTIONS.filter((d) => d.id === solo) : DIRECTIONS.filter((d) => live.has(d.id));
</script>

<div class="wrap">
  <header class="top">
    <div class="brand">
      <strong>Strix · ocho direcciones</strong>
      <span>Mismo contenido, ocho formas. Elegí una y el sistema se reconstruye sobre ella.</span>
    </div>
    <nav class="pages" aria-label="Familias de elementos">
      {#each PAGES as p}
        <button class:on={p.id === page.id} on:click={() => (page = p)} title={p.note}>{p.name}</button>
      {/each}
    </nav>
  </header>

  <div class="filter">
    <span class="lbl">Direcciones</span>
    {#each DIRECTIONS as d}
      <button
        class="chip"
        class:off={!live.has(d.id) && !solo}
        class:solo={solo === d.id}
        aria-pressed={solo ? solo === d.id : live.has(d.id)}
        on:click={() => toggle(d.id)}
        on:dblclick={() => (solo = solo === d.id ? null : d.id)}
        title={d.silhouette}
      ><b>{d.id}</b> {d.name}</button>
    {/each}
    <span class="tip">clic para descartar · doble clic para verla sola</span>
    {#if solo}<button class="clear" on:click={() => (solo = null)}>Ver todas</button>{/if}
  </div>

  <main>
    <div class="head">
      <h1>{page.name}</h1>
      <p>{page.note}</p>
    </div>
    <svelte:component this={page.c} directions={shown} />
  </main>
</div>

<style>
  :global(body) { margin: 0; background: #fafafa; color: #14181a; }
  .wrap {
    font: 15px/1.5 ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    min-height: 100vh;
  }
  .top {
    position: sticky; top: 0; z-index: 40;
    display: flex; align-items: center; justify-content: space-between;
    gap: 20px; flex-wrap: wrap;
    padding: 12px 24px;
    background: #ffffffee; backdrop-filter: blur(8px);
    border-bottom: 1px solid #e5e7e8;
  }
  .brand { display: flex; flex-direction: column; }
  .brand strong { font-size: 14px; font-weight: 620; letter-spacing: -.01em; }
  .brand span { font-size: 12px; color: #71777c; }
  .pages { display: flex; gap: 2px; flex-wrap: wrap; }
  .pages button {
    font: inherit; font-size: 13px;
    padding: 6px 11px; border: 0; border-radius: 5px;
    background: transparent; color: #40454a; cursor: pointer;
  }
  .pages button:hover { background: #f0f1f2; }
  .pages button.on { background: #14181a; color: #fff; }

  .filter {
    display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
    padding: 10px 24px;
    border-bottom: 1px solid #e5e7e8;
    background: #fff;
    position: sticky; top: 61px; z-index: 39;
  }
  .lbl { font: 600 10px/1 ui-sans-serif, system-ui; letter-spacing: .09em; text-transform: uppercase; color: #8b9094; margin-right: 4px; }
  .chip {
    font: inherit; font-size: 12px;
    padding: 4px 9px; border: 1px solid #dfe1e3; border-radius: 999px;
    background: #fff; color: #24282b; cursor: pointer;
  }
  .chip b { font-family: ui-monospace, Menlo, monospace; font-size: 10.5px; margin-right: 3px; color: #71777c; }
  .chip:hover { border-color: #b2b6b9; }
  .chip.off { opacity: .38; text-decoration: line-through; }
  .chip.solo { background: #14181a; color: #fff; border-color: #14181a; }
  .chip.solo b { color: #b2b6b9; }
  .tip { font-size: 11px; color: #a3a8ac; margin-left: 4px; }
  .clear { font: inherit; font-size: 12px; padding: 4px 9px; border: 0; border-radius: 999px; background: #eaeced; cursor: pointer; }

  main { padding: 26px 24px 80px; max-width: 1680px; margin: 0 auto; }
  .head { margin-bottom: 20px; }
  h1 { margin: 0; font-size: 24px; font-weight: 620; letter-spacing: -.02em; }
  .head p { margin: 2px 0 0; font-size: 13.5px; color: #71777c; }

  @media (prefers-color-scheme: dark) {
    :global(body) { background: #101314; color: #edeff0; }
    .top { background: #14181aee; border-bottom-color: #2c3134; }
    .brand span, .head p { color: #8e9498; }
    .pages button { color: #bcc1c4; }
    .pages button:hover { background: #22282a; }
    .pages button.on { background: #edeff0; color: #14181a; }
    .filter { background: #14181a; border-bottom-color: #2c3134; }
    .chip { background: #1b2022; border-color: #2c3134; color: #edeff0; }
    .chip.solo { background: #edeff0; color: #14181a; }
    .clear { background: #22282a; color: #edeff0; }
  }
</style>
