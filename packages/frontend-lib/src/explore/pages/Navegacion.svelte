<script>
  // NAVEGACIÓN — cómo se mueve alguien por el módulo de mantenimiento.
  //
  // Una sola familia de elementos (barra de módulo, pestañas, segmentado,
  // fichas de filtro, migas, barra lateral, paginación) atravesando las ocho
  // direcciones. Lo que se compara aquí es UNA decisión repetida siete veces:
  // cómo se ve "esto es lo que estás mirando ahora mismo".
  //
  //   A pastilla rellena · B marco que comparte borde · C cabecera de marca
  //   D bloque negro invertido · E fondo suave sin borde · F texto invertido
  //   G franja de canto · H pestaña levantada · I vidrio más denso
  //   J placa hundida y apagada · K anillo que enciende · L guijarro hundido
  //   M mancha derramada · N cinta levantada · O vidrio teñido de marca
  //   P muesca que muerde la espina · Q bloque que salta sobre su sombra
  //   R texto invertido en vidrio · S la sombra teñida de abajo
  //
  // Todo el CSS por dirección cruza la frontera de componente con
  // :global([data-d='X']) .clase — el atributo vive en Direction.svelte.
  import Grid from '../Grid.svelte';
  import Direction from '../Direction.svelte';
  import { FAMILIES, LOCATIONS, ASSETS, KPIS, markOf } from '../demo.js';

  export let directions = [];

  // Contenido real. BAT-014 es la batidora vencida de demo.js: es la que abre
  // las migas y la que obliga a que el rastro termine en un estado, no en un
  // título limpio.
  const BAT = ASSETS.find((a) => a.code === 'BAT-014');
  const OVER = KPIS.find((k) => k.tone === 'critical');

  // Conteos de familia. Suman 88, que es la flota que describen los KPIs
  // (62 al día = 71 %), y Batidoras trae los 14 equipos que menciona COPY.
  const FAM_N = {
    Batidoras: 14,
    Hornos: 22,
    Flota: 9,
    Mezcladoras: 18,
    Compactación: 12,
    Generadores: 13
  };
  const TOTAL = FAMILIES.reduce((s, f) => s + FAM_N[f], 0);

  const TABS = [
    { name: 'Flota' },
    { name: 'Equipos', n: TOTAL },
    { name: 'Familias', n: FAMILIES.length },
    { name: 'Documentos', n: 24 },
    { name: 'Ajustes' }
  ];

  const GROUPS = ['Familia', 'Categoría', 'Ubicación'];

  const SIDE = [
    {
      cap: 'Mantenimiento',
      items: [
        { name: 'Flota', n: TOTAL },
        { name: 'Planes de mantenimiento', n: 31 },
        { name: 'Lecturas y horómetros', n: 12 }
      ]
    },
    {
      cap: 'Catálogo',
      items: [
        { name: 'Equipos', n: TOTAL },
        { name: 'Familias', n: FAMILIES.length },
        { name: 'Ubicaciones', n: LOCATIONS.length }
      ]
    },
    {
      cap: 'Documentos',
      items: [
        { name: 'Salidas y devoluciones', n: 8 },
        { name: 'Órdenes de trabajo', n: 3 }
      ]
    }
  ];

  const PER = 24;
  const PAGES = Array.from({ length: Math.ceil(TOTAL / PER) }, (_, i) => i + 1);

  // Estado por dirección: la lista se acorta cuando el usuario descarta, así
  // que se indexa por id y se lee con ?? valor-por-defecto DENTRO del marcado.
  // Nada de $: derivado de un const — una sentencia reactiva solo rastrea los
  // nombres escritos dentro de ella.
  let tab = {};
  let grp = {};
  let fam = {};
  let sec = {};
  let pg = {};
  let q = {};
</script>

<Grid min="560px">
  {#each directions as d (d.id)}
    <!-- Sin margen solo donde el espécimen es a sangre de verdad. P es Banda con
         espina, así que va flush como G. Las de vidrio (I, O, R) NO: si el panel
         tapa el campo entero no queda nada sin desenfocar contra qué leerlo, y
         el vidrio se ve como plástico gris. -->
    <Direction id={d.id} flush={d.id === 'F' || d.id === 'G' || d.id === 'P'}>
      <div class="nav">
        <div class="shell d-panel">
          <!-- Barra superior de módulo -->
          <header class="bar">
            <div class="bar-id">
              <span class="bar-mod">Mantenimiento de equipo</span>
              <span class="bar-sub d-cap">Flota · {TOTAL} equipos</span>
            </div>

            <span class="bar-flag d-pill" data-tone={OVER.tone}>
              <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf(OVER.tone)}</svg>
              {OVER.value} {OVER.label.toLowerCase()}
            </span>

            <button class="user" type="button">
              <span class="ava" aria-hidden="true">SA</span>
              <span class="user-t">
                <b>S. Alfaro</b>
                <small>{LOCATIONS[0]}</small>
              </span>
            </button>

            <div class="bar-find">
              <label class="d-sr" for="nq-{d.id}">Buscar equipo</label>
              <input
                class="d-input find"
                id="nq-{d.id}"
                type="search"
                placeholder="Buscar equipo, código o placa"
                bind:value={q[d.id]} />
            </div>

            <button class="bar-do d-btn d-btn--primary" type="button">Nuevo equipo</button>
          </header>

          <!-- Pestañas -->
          <div class="row row--tabs d-rail">
            <span class="d-cap rail-cap">Secciones</span>
            <nav class="tabs" aria-label="Secciones del módulo">
              {#each TABS as t}
                <button
                  class="tab"
                  type="button"
                  class:on={(tab[d.id] ?? 'Equipos') === t.name}
                  aria-current={(tab[d.id] ?? 'Equipos') === t.name ? 'page' : undefined}
                  on:click={() => (tab[d.id] = t.name)}>
                  <span class="tab-t">{t.name}</span>
                  {#if t.n}<span class="tab-n d-num">{t.n}</span>{/if}
                </button>
              {/each}
            </nav>
          </div>

          <div class="body">
            <!-- Barra lateral compacta -->
            <aside class="side">
              <nav aria-label="Navegación de mantenimiento">
                {#each SIDE as s}
                  <div class="side-sec d-rail">
                    <h4 class="d-cap side-cap">{s.cap}</h4>
                    <ul class="side-list">
                      {#each s.items as it}
                        <li>
                          <button
                            class="side-item"
                            type="button"
                            class:on={(sec[d.id] ?? 'Equipos') === it.name}
                            aria-current={(sec[d.id] ?? 'Equipos') === it.name ? 'page' : undefined}
                            on:click={() => (sec[d.id] = it.name)}>
                            <span class="side-t">{it.name}</span>
                            <span class="side-n d-num">{it.n}</span>
                          </button>
                        </li>
                      {/each}
                    </ul>
                  </div>
                {/each}
              </nav>
            </aside>

            <div class="main">
              <!-- Migas de pan. La fila lleva data-tone porque el rastro TERMINA
                   en un equipo vencido: el estado es de la ruta entera, no solo
                   de la última miga. Sirve a las diecinueve —cada portadora de
                   tono lo resuelve a su manera: mancha en M, resplandor en K,
                   muesca en P, sombra teñida en S— y no cambia nada en A–H,
                   donde ninguna regla lee --tone-* a esta altura. -->
              <div class="row row--crumbs d-rail" data-tone={BAT.tone}>
                <span class="d-cap rail-cap">Ruta</span>
                <div class="crumb-row">
                  <nav aria-label="Ruta de navegación">
                    <ol class="crumb-l">
                      <li class="crumb">
                        <button class="crumb-b" type="button">Flota</button>
                      </li>
                      <li class="crumb">
                        <button class="crumb-b" type="button">{BAT.family}</button>
                      </li>
                      <li class="crumb">
                        <span class="crumb-b crumb-now d-id" data-tone={BAT.tone} aria-current="page"
                          >{BAT.code}</span>
                      </li>
                    </ol>
                  </nav>
                  <span class="crumb-flag d-pill" data-tone={BAT.tone}>
                    <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf(BAT.tone)}</svg>
                    {BAT.state}
                  </span>
                </div>
              </div>

              <!-- Control segmentado -->
              <div class="row row--seg d-rail">
                <span class="d-cap rail-cap" id="cg-{d.id}">Agrupar por</span>
                <div class="seg d-btn-group" role="group" aria-labelledby="cg-{d.id}">
                  {#each GROUPS as g}
                    <button
                      class="seg-b d-btn d-btn--sm"
                      type="button"
                      class:on={(grp[d.id] ?? 'Familia') === g}
                      aria-pressed={(grp[d.id] ?? 'Familia') === g}
                      on:click={() => (grp[d.id] = g)}>{g}</button>
                  {/each}
                </div>
              </div>

              <!-- Fichas de filtro con conteo -->
              <div class="row row--chips d-rail">
                <span class="d-cap rail-cap" id="cf-{d.id}">Familias</span>
                <div class="chips" role="group" aria-labelledby="cf-{d.id}">
                  {#each FAMILIES as f}
                    <button
                      class="chip d-btn d-btn--sm"
                      type="button"
                      class:on={(fam[d.id] ?? 'Batidoras') === f}
                      aria-pressed={(fam[d.id] ?? 'Batidoras') === f}
                      on:click={() => (fam[d.id] = f)}>
                      <span class="chip-t">{f}</span>
                      <span class="chip-n d-num">{FAM_N[f]}</span>
                    </button>
                  {/each}
                </div>
              </div>

              <!-- Paginación -->
              <div class="row row--pager d-rail">
                <span class="d-cap rail-cap">Página</span>
                <nav class="pager" aria-label="Paginación de equipos">
                  <p class="pager-n d-num">
                    {(pg[d.id] ?? 1) * PER - PER + 1}–{Math.min((pg[d.id] ?? 1) * PER, TOTAL)} de {TOTAL} equipos
                  </p>
                  <div class="pg-group d-btn-group">
                    <button
                      class="pg pg-arrow d-btn d-btn--sm"
                      type="button"
                      disabled={(pg[d.id] ?? 1) === 1}
                      on:click={() => (pg[d.id] = Math.max(1, (pg[d.id] ?? 1) - 1))}>
                      <span aria-hidden="true">‹</span><span class="d-sr">Página anterior</span>
                    </button>
                    {#each PAGES as n}
                      <button
                        class="pg d-btn d-btn--sm d-num"
                        type="button"
                        class:on={(pg[d.id] ?? 1) === n}
                        aria-current={(pg[d.id] ?? 1) === n ? 'page' : undefined}
                        on:click={() => (pg[d.id] = n)}>{n}</button>
                    {/each}
                    <button
                      class="pg pg-arrow d-btn d-btn--sm"
                      type="button"
                      disabled={(pg[d.id] ?? 1) === PAGES.length}
                      on:click={() => (pg[d.id] = Math.min(PAGES.length, (pg[d.id] ?? 1) + 1))}>
                      <span aria-hidden="true">›</span><span class="d-sr">Página siguiente</span>
                    </button>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Direction>
  {/each}
</Grid>

<style>
  /* ======================================================================
     BASE — escrita solo contra tokens --d-*. Ni un color, radio, sombra o
     borde literal: en E los bordes desaparecen solos porque --d-bw es 0 y
     --d-line es transparent.
     ====================================================================== */

  .nav { container-type: inline-size; container-name: navmod; }
  .shell { display: flex; flex-direction: column; min-width: 0; }

  /* ── Barra de módulo ─────────────────────────────────────────────────── */
  .bar {
    display: flex; align-items: center; flex-wrap: wrap; gap: var(--d-p2);
    padding: var(--d-p2) var(--d-p3);
    border-bottom: var(--d-bw) solid var(--d-line);
  }
  .bar-id { display: flex; flex-direction: column; min-width: 0; }
  .bar-mod {
    font-size: var(--d-t-md); font-weight: var(--d-w-semi);
    letter-spacing: -.01em; overflow-wrap: anywhere;
  }
  .bar-sub { display: block; }
  .bar-flag { flex: none; }
  .bar-find { order: 2; display: flex; align-items: center; gap: var(--d-p1); flex: 1 1 170px; min-width: 0; }
  .find { appearance: none; -webkit-appearance: none; }
  .bar-do { order: 2; flex: none; }

  .user {
    display: inline-flex; align-items: center; gap: var(--d-p1);
    margin-left: auto; padding: var(--d-p1);
    font: inherit; color: var(--d-ink); background: transparent;
    border: 0; border-radius: var(--d-r); cursor: pointer;
  }
  .user:hover { background: var(--d-sunk); }
  .ava {
    display: grid; place-items: center; flex: none;
    width: calc(var(--d-p3) + var(--d-p2)); height: calc(var(--d-p3) + var(--d-p2));
    font-size: var(--d-t-2xs); font-weight: var(--d-w-bold);
    background: var(--d-accent); color: var(--d-accent-ink);
    border-radius: var(--d-r-pill);
  }
  .user-t { display: flex; flex-direction: column; line-height: 1.15; text-align: left; }
  .user-t b { font-size: var(--d-t-xs); font-weight: var(--d-w-semi); }
  .user-t small { font-size: var(--d-t-2xs); color: var(--d-ink-3); }

  /* ── Filas / raíl ────────────────────────────────────────────────────── */
  .row {
    padding: var(--d-p2) var(--d-p3);
    border-bottom: var(--d-bw) solid var(--d-line);
    min-width: 0;
  }
  .row:last-child { border-bottom: 0; }
  .rail-cap { display: block; }

  /* ── Pestañas ────────────────────────────────────────────────────────── */
  .tabs { display: flex; align-items: center; flex-wrap: wrap; gap: var(--d-p1); min-width: 0; }
  .tab {
    position: relative;
    display: inline-flex; align-items: center; gap: var(--d-p1);
    min-height: var(--d-row-h); padding: 0 var(--d-p2);
    font: inherit; font-size: var(--d-t-sm); font-weight: var(--d-w-med);
    color: var(--d-ink-2); background: transparent;
    border: 0; border-radius: var(--d-r);
    cursor: pointer; white-space: nowrap;
  }
  .tab:hover { background: var(--d-sunk); }
  .tab-n { font-size: var(--d-t-2xs); color: var(--d-ink-3); font-variant-numeric: var(--d-num); }
  .tab.on { color: var(--d-ink); font-weight: var(--d-w-semi); }

  /* ── Cuerpo: lateral + contenido ─────────────────────────────────────── */
  .body { display: grid; grid-template-columns: minmax(0, 1fr); }
  .side { min-width: 0; padding: var(--d-p2); border-bottom: var(--d-bw) solid var(--d-line); }
  .main { display: flex; flex-direction: column; min-width: 0; }

  @container navmod (min-width: 400px) {
    .body { grid-template-columns: minmax(0, 36%) minmax(0, 1fr); }
    .side { border-bottom: 0; border-inline-end: var(--d-bw) solid var(--d-line); }
  }

  .side-sec + .side-sec { margin-top: var(--d-p2); }
  .side-cap { display: block; padding-inline: var(--d-p1); }
  .side-list { list-style: none; margin: 0; padding: 0; min-width: 0; }
  .side-item {
    position: relative;
    display: flex; align-items: center; justify-content: space-between; gap: var(--d-p1);
    width: 100%; min-height: var(--d-row-h);
    padding: var(--d-p1) var(--d-p2);
    font: inherit; font-size: var(--d-t-xs); font-weight: var(--d-w);
    color: var(--d-ink-2); background: transparent; text-align: left;
    border: 0; border-radius: var(--d-r); cursor: pointer;
  }
  .side-item:hover { background: var(--d-sunk); }
  .side-t { min-width: 0; overflow-wrap: anywhere; }
  .side-n { flex: none; font-size: var(--d-t-2xs); color: var(--d-ink-3); }
  .side-item.on { color: var(--d-ink); font-weight: var(--d-w-semi); }

  /* ── Migas ───────────────────────────────────────────────────────────── */
  .crumb-row { display: flex; align-items: center; flex-wrap: wrap; gap: var(--d-p1) var(--d-p2); min-width: 0; }
  .crumb-l { display: flex; align-items: center; flex-wrap: wrap; list-style: none; margin: 0; padding: 0; }
  .crumb { display: inline-flex; align-items: center; min-width: 0; }
  .crumb + .crumb::before {
    content: '›'; color: var(--d-ink-3);
    padding-inline: var(--d-p1); font-size: var(--d-t-sm);
  }
  .crumb-b {
    position: relative;
    font: inherit; font-size: var(--d-t-sm); color: var(--d-ink-3);
    background: transparent; border: 0; border-radius: var(--d-r);
    padding: var(--d-p1) var(--d-p1); cursor: pointer; white-space: nowrap;
  }
  .crumb-b:hover { background: var(--d-sunk); color: var(--d-ink); }
  .crumb-now { color: var(--d-ink); font-weight: var(--d-w-semi); cursor: default; }
  .crumb-now:hover { background: transparent; }
  .crumb-flag { flex: none; }

  /* ── Segmentado, fichas, paginación ──────────────────────────────────── */
  .seg, .pg-group { flex-wrap: wrap; max-width: 100%; min-width: 0; }
  .seg-b, .pg, .chip { position: relative; }

  .chips { display: flex; flex-wrap: wrap; gap: var(--d-p1); min-width: 0; }
  .chip { gap: var(--d-p1); }
  .chip-t { overflow-wrap: anywhere; }
  .chip-n { font-size: var(--d-t-2xs); color: var(--d-ink-3); font-variant-numeric: var(--d-num); }
  .chip.on .chip-n { color: inherit; }

  .pager { display: flex; align-items: center; flex-wrap: wrap; gap: var(--d-p1) var(--d-p2); min-width: 0; }
  .pager-n { margin: 0; font-size: var(--d-t-xs); color: var(--d-ink-3); }
  .pg-group { margin-left: auto; }
  .pg-arrow { font-size: var(--d-t-md); line-height: 1; }

  /* ======================================================================
     A · ELEVACIÓN — nada comparte borde. Cada bloque es una tarjeta que
     flota, separada por aire. Activo = pastilla rellena.
     ====================================================================== */
  :global([data-d='A']) .shell {
    display: flex; gap: var(--d-gap);
    background: transparent; border: 0; box-shadow: none;
  }
  :global([data-d='A']) .bar,
  :global([data-d='A']) .row--tabs,
  :global([data-d='A']) .side,
  :global([data-d='A']) .main {
    background: var(--d-surface);
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    padding: var(--d-p2) var(--d-p3);
  }
  :global([data-d='A']) .body { gap: var(--d-gap); }
  :global([data-d='A']) .side { border-inline-end: var(--d-bw) solid var(--d-line); }
  :global([data-d='A']) .main { padding: var(--d-p2); gap: var(--d-p2); }
  :global([data-d='A']) .row--crumbs,
  :global([data-d='A']) .row--seg,
  :global([data-d='A']) .row--chips,
  :global([data-d='A']) .row--pager { border-bottom: 0; padding: var(--d-p1) var(--d-p2); }
  :global([data-d='A']) .tab { border-radius: var(--d-r-pill); }
  :global([data-d='A']) .tab.on,
  :global([data-d='A']) .side-item.on,
  :global([data-d='A']) .chip.on,
  :global([data-d='A']) .pg.on,
  :global([data-d='A']) .crumb-now {
    background: var(--d-accent); color: var(--d-accent-ink);
    border-color: var(--d-accent-edge); border-radius: var(--d-r-pill);
    box-shadow: var(--d-shadow-lg);
  }
  :global([data-d='A']) .tab.on .tab-n,
  :global([data-d='A']) .side-item.on .side-n { color: var(--d-accent-ink); opacity: .72; }
  /* El segmentado es un carril hundido con un pulgar que flota encima. */
  :global([data-d='A']) .seg {
    gap: 0; padding: var(--d-p1);
    background: var(--d-sunk); border-radius: var(--d-r-pill);
  }
  :global([data-d='A']) .seg-b { border-color: transparent; background: transparent; box-shadow: none; border-radius: var(--d-r-pill); }
  :global([data-d='A']) .seg-b.on {
    background: var(--d-surface); color: var(--d-ink);
    box-shadow: var(--d-shadow-lg); font-weight: var(--d-w-semi);
  }
  :global([data-d='A']) .chip-n {
    padding-inline: var(--d-p1); border-radius: var(--d-r-pill);
    background: var(--d-sunk);
  }
  :global([data-d='A']) .chip.on .chip-n {
    color: var(--d-accent-ink);
    background: transparent;
    background: color-mix(in srgb, var(--d-accent-ink) 22%, transparent);
  }
  :global([data-d='A']) .pg-group { gap: var(--d-p1); }

  /* ======================================================================
     B · INSTRUMENTO — un solo marco continuo. Nada se separa: todo comparte
     borde y se divide por líneas de 1px. Activo = marco que come el borde
     compartido, con marca de esquina.
     ====================================================================== */
  :global([data-d='B']) .bar { padding: 0; border-bottom-color: var(--d-edge); }
  :global([data-d='B']) .bar-id,
  :global([data-d='B']) .bar-find,
  :global([data-d='B']) .user { padding: var(--d-p1) var(--d-p2); }
  :global([data-d='B']) .bar-flag { margin-inline: var(--d-p2); }
  :global([data-d='B']) .bar-find,
  :global([data-d='B']) .bar-do,
  :global([data-d='B']) .user { border-inline-start: var(--d-bw) solid var(--d-line); }
  :global([data-d='B']) .bar-do { border-radius: 0; box-shadow: none; }
  :global([data-d='B']) .ava { border-radius: 0; }
  :global([data-d='B']) .row--tabs { padding-bottom: 0; border-bottom-color: var(--d-edge); }
  :global([data-d='B']) .tabs { gap: 0; }
  :global([data-d='B']) .tab {
    border: var(--d-bw) solid transparent;
    margin-inline-start: calc(-1 * var(--d-bw));
  }
  :global([data-d='B']) .tab.on {
    background: var(--d-surface);
    border-color: var(--d-edge);
    border-bottom-color: var(--d-surface);
    margin-bottom: calc(-1 * var(--d-bw));
    z-index: 1;
  }
  /* La marca de esquina: la misma que lleva .d-panel en esta dirección. */
  :global([data-d='B']) .tab.on::after,
  :global([data-d='B']) .side-item.on::after {
    content: ''; position: absolute; top: 2px; right: 2px;
    width: 5px; height: 5px;
    border-top: 1px solid var(--d-edge); border-right: 1px solid var(--d-edge);
  }
  :global([data-d='B']) .side-item.on {
    background: var(--d-surface);
    border: var(--d-bw) solid var(--d-edge);
    border-inline-end-color: var(--d-surface);
    margin-inline-end: calc(-1 * var(--d-bw));
    z-index: 1;
  }
  :global([data-d='B']) .side { border-inline-end-color: var(--d-edge); }
  :global([data-d='B']) .seg, :global([data-d='B']) .pg-group { gap: 0; }
  :global([data-d='B']) .seg-b.on, :global([data-d='B']) .pg.on {
    background: var(--d-accent-soft); border-color: var(--d-edge);
    font-weight: var(--d-w-semi); z-index: 1;
  }
  /* Ficha de filtro: etiqueta y conteo en dos celdas divididas por 1px. */
  :global([data-d='B']) .chips { gap: 0; }
  :global([data-d='B']) .chip {
    align-items: stretch; gap: 0; padding: 0 0 0 var(--d-p2);
    border-color: var(--d-line);
    margin-inline-start: calc(-1 * var(--d-bw));
  }
  :global([data-d='B']) .chip-t { display: flex; align-items: center; padding-inline-end: var(--d-p2); }
  :global([data-d='B']) .chip-n {
    display: flex; align-items: center; padding-inline: var(--d-p2);
    border-inline-start: var(--d-bw) solid var(--d-line);
  }
  :global([data-d='B']) .chip.on {
    background: var(--d-accent-soft); border-color: var(--d-edge); z-index: 1;
  }
  :global([data-d='B']) .chip.on .chip-n { border-inline-start-color: var(--d-edge); }
  :global([data-d='B']) .crumb-now {
    padding-inline: var(--d-p2);
    border: var(--d-bw) solid var(--d-edge); background: var(--d-accent-soft);
  }
  :global([data-d='B']) .crumb + .crumb::before { content: '·'; }

  /* ======================================================================
     C · MARCA — la cabecera llena de teal ES el módulo. Lo activo se
     identifica por llevar puesta esa misma cabecera.
     ====================================================================== */
  :global([data-d='C']) .bar {
    background: var(--d-brand); color: var(--d-brand-ink);
    border-bottom: 0; padding: var(--d-p2) var(--d-p3);
  }
  :global([data-d='C']) .bar-sub { color: var(--d-brand-ink); opacity: .78; }
  :global([data-d='C']) .user { color: var(--d-brand-ink); }
  :global([data-d='C']) .user small { color: var(--d-brand-ink); opacity: .7; }
  :global([data-d='C']) .user:hover { background: var(--d-brand-deep); }
  :global([data-d='C']) .ava { background: var(--d-brand-ink); color: var(--d-brand); }
  :global([data-d='C']) .find {
    background: var(--d-brand-deep); color: var(--d-brand-ink);
    border-color: var(--d-brand-deep);
  }
  :global([data-d='C']) .find::placeholder { color: var(--d-brand-ink); opacity: .62; }
  :global([data-d='C']) .bar-do {
    background: var(--d-surface); color: var(--d-brand); border-color: var(--d-surface);
  }
  :global([data-d='C']) .row--tabs {
    padding-bottom: 0;
    border-bottom: 3px solid var(--d-brand);
  }
  :global([data-d='C']) .tab.on,
  :global([data-d='C']) .side-item.on,
  :global([data-d='C']) .chip.on,
  :global([data-d='C']) .seg-b.on,
  :global([data-d='C']) .pg.on,
  :global([data-d='C']) .crumb-now {
    background: var(--d-brand); color: var(--d-brand-ink);
    border-color: var(--d-brand);
    border-radius: var(--d-r) var(--d-r) 0 0;
  }
  :global([data-d='C']) .tab.on .tab-n,
  :global([data-d='C']) .side-item.on .side-n { color: var(--d-brand-ink); opacity: .75; }
  /* Cada sección de la lateral se anuncia por su propia cabecera de marca. */
  :global([data-d='C']) .side-cap {
    background: var(--d-brand); color: var(--d-brand-ink);
    padding: var(--d-p1) var(--d-p2);
    border-radius: var(--d-r) var(--d-r) 0 0;
    margin-bottom: var(--d-p1);
  }
  :global([data-d='C']) .crumb-now { padding-inline: var(--d-p2); }

  /* ======================================================================
     D · PESO — 2px de tinta y sombra sólida. Activo = bloque negro
     invertido; al presionar, el bloque se mueve hacia su sombra.
     ====================================================================== */
  :global([data-d='D']) .bar { border-bottom-color: var(--d-ink); }
  :global([data-d='D']) .bar-mod { font-size: var(--d-t-lg); font-weight: var(--d-w-bold); text-transform: uppercase; }
  :global([data-d='D']) .ava { border-radius: 0; border: var(--d-bw) solid var(--d-ink); }
  :global([data-d='D']) .row { border-bottom-color: var(--d-ink); }
  :global([data-d='D']) .row--tabs { border-bottom-width: var(--d-bw); }
  :global([data-d='D']) .tabs { gap: 0; box-shadow: var(--d-shadow); width: fit-content; max-width: 100%; }
  :global([data-d='D']) .tab {
    border: var(--d-bw) solid var(--d-ink);
    margin-inline-start: calc(-1 * var(--d-bw));
    text-transform: uppercase; font-weight: var(--d-w-bold);
    letter-spacing: .02em; background: var(--d-surface);
  }
  :global([data-d='D']) .tab.on,
  :global([data-d='D']) .side-item.on,
  :global([data-d='D']) .chip.on,
  :global([data-d='D']) .seg-b.on,
  :global([data-d='D']) .pg.on,
  :global([data-d='D']) .crumb-now {
    background: var(--d-ink); color: var(--d-ink-on); border-color: var(--d-ink);
  }
  :global([data-d='D']) .tab.on .tab-n,
  :global([data-d='D']) .side-item.on .side-n,
  :global([data-d='D']) .chip.on .chip-n { color: var(--d-ink-on); }
  :global([data-d='D']) .side { border-inline-end-color: var(--d-ink); }
  :global([data-d='D']) .side-item { text-transform: uppercase; font-weight: var(--d-w-semi); font-size: var(--d-t-xs); }
  :global([data-d='D']) .side-item.on { box-shadow: var(--d-shadow); }
  :global([data-d='D']) .side-item.on:active,
  :global([data-d='D']) .tab:active {
    transform: translate(var(--d-bw), var(--d-bw));
    box-shadow: var(--d-bw) var(--d-bw) 0 var(--d-ink);
  }
  :global([data-d='D']) .chip { box-shadow: var(--d-shadow); }
  :global([data-d='D']) .chip-n {
    border-inline-start: var(--d-bw) solid currentColor;
    padding-inline-start: var(--d-p1); font-weight: var(--d-w-bold);
  }
  :global([data-d='D']) .chips { gap: var(--d-p2); }
  :global([data-d='D']) .crumb + .crumb::before { content: '▸'; color: var(--d-ink); }
  :global([data-d='D']) .crumb-b { text-transform: uppercase; font-weight: var(--d-w-bold); font-size: var(--d-t-xs); }
  :global([data-d='D']) .crumb-now { padding-inline: var(--d-p2); box-shadow: var(--d-shadow); }
  :global([data-d='D']) .pager-n { font-weight: var(--d-w-semi); color: var(--d-ink); text-transform: uppercase; }

  /* ======================================================================
     E · AIRE — ni un borde. Radios grandes, aire enorme, el segmentado se
     rompe en pastillas sueltas. Activo = fondo suave, sin línea ninguna.
     ====================================================================== */
  :global([data-d='E']) .bar { padding: var(--d-p4) var(--d-p4) var(--d-p3); gap: var(--d-p3); }
  :global([data-d='E']) .bar-mod { font-size: var(--d-t-lg); }
  :global([data-d='E']) .row { padding: var(--d-p2) var(--d-p4); }
  :global([data-d='E']) .side { padding: var(--d-p2); }
  :global([data-d='E']) .body { gap: var(--d-p3); }
  :global([data-d='E']) .side-item { font-size: var(--d-t-sm); }
  /* El texto a 16px necesita más columna: el aire cuesta ancho. */
  @container navmod (min-width: 400px) {
    :global([data-d='E']) .body { grid-template-columns: minmax(0, 38%) minmax(0, 1fr); }
  }
  :global([data-d='E']) .d-rail { gap: var(--d-p1); }
  :global([data-d='E']) .tabs { gap: var(--d-p2); }
  :global([data-d='E']) .tab { border-radius: var(--d-r-pill); padding: 0 var(--d-p3); }
  :global([data-d='E']) .tab.on,
  :global([data-d='E']) .side-item.on,
  :global([data-d='E']) .chip.on,
  :global([data-d='E']) .seg-b.on,
  :global([data-d='E']) .pg.on,
  :global([data-d='E']) .crumb-now {
    background: var(--d-accent-soft); color: var(--d-ink);
    border: 0; border-radius: var(--d-r-pill);
  }
  :global([data-d='E']) .tab.on::before {
    content: ''; width: 6px; height: 6px; border-radius: var(--d-r-pill);
    background: var(--d-ink); flex: none;
  }
  /* Pastillas sueltas y muy separadas: en E una botonera no es una botonera. */
  :global([data-d='E']) .seg { gap: var(--d-p2); }
  :global([data-d='E']) .chips { gap: var(--d-p2); }
  :global([data-d='E']) .side-item { border-radius: var(--d-r-lg); padding: var(--d-p1) var(--d-p3); }
  :global([data-d='E']) .crumb-now { padding-inline: var(--d-p3); }
  :global([data-d='E']) .crumb + .crumb::before { padding-inline: var(--d-p2); }
  :global([data-d='E']) .pg-group { gap: var(--d-p1); }
  :global([data-d='E']) .pg { border-radius: var(--d-r-pill); padding-inline: var(--d-p1); }

  /* ======================================================================
     F · TERMINAL — pantalla de texto. Prompt en la barra, árbol ASCII en la
     lateral, densidad máxima. Activo = texto invertido con «».
     ====================================================================== */
  :global([data-d='F']) .bar { padding: var(--d-p1) var(--d-p2); background: var(--d-sunk); gap: var(--d-p2); }
  :global([data-d='F']) .bar-mod::before { content: 'strix:'; color: var(--d-ink-3); }
  :global([data-d='F']) .bar-sub::before { content: '~/'; color: var(--d-accent); }
  :global([data-d='F']) .bar-find::before { content: '$'; color: var(--d-accent); font-weight: var(--d-w-bold); }
  :global([data-d='F']) .bar-find::after { content: '▌'; color: var(--d-accent); }
  :global([data-d='F']) .ava {
    display: inline-flex; background: transparent; color: var(--d-accent);
    width: auto; height: auto;
  }
  :global([data-d='F']) .ava::before { content: '['; color: var(--d-ink-3); }
  :global([data-d='F']) .ava::after { content: ']'; color: var(--d-ink-3); }
  :global([data-d='F']) .row { padding: var(--d-p1) var(--d-p2); }
  :global([data-d='F']) .side { padding: var(--d-p1) var(--d-p2); }
  :global([data-d='F']) .tabs { gap: 0; }
  :global([data-d='F']) .tab { padding: 0 var(--d-p1); text-transform: lowercase; }
  :global([data-d='F']) .tab-n::before { content: ':'; color: var(--d-ink-3); }
  :global([data-d='F']) .tab.on,
  :global([data-d='F']) .side-item.on,
  :global([data-d='F']) .chip.on,
  :global([data-d='F']) .seg-b.on,
  :global([data-d='F']) .pg.on,
  :global([data-d='F']) .crumb-now {
    background: var(--d-accent); color: var(--d-accent-ink); border-color: var(--d-accent);
  }
  :global([data-d='F']) .tab.on .tab-n,
  :global([data-d='F']) .tab.on .tab-n::before,
  :global([data-d='F']) .side-item.on .side-n,
  :global([data-d='F']) .chip.on .chip-n { color: var(--d-accent-ink); }
  :global([data-d='F']) .tab.on::before { content: '»'; color: var(--d-accent-ink); }
  /* El árbol: la lateral es un ls -R, no una lista de botones. */
  :global([data-d='F']) .side-item { padding: 0 var(--d-p1); border-radius: 0; justify-content: flex-start; }
  :global([data-d='F']) .side-n { margin-inline-start: auto; }
  :global([data-d='F']) .side-item::before { content: '├─'; color: var(--d-ink-3); margin-inline-end: var(--d-p1); }
  :global([data-d='F']) .side-list li:last-child .side-item::before { content: '└─'; }
  :global([data-d='F']) .side-item.on::before { color: var(--d-accent-ink); }
  :global([data-d='F']) .side-cap::before { content: '~/'; color: var(--d-accent); }
  :global([data-d='F']) .chip-n::before { content: ':'; color: var(--d-ink-3); }
  :global([data-d='F']) .chip.on .chip-n::before { color: var(--d-accent-ink); }
  :global([data-d='F']) .chips { gap: var(--d-p1) var(--d-p2); }
  :global([data-d='F']) .crumb + .crumb::before { content: '/'; padding-inline: 0; color: var(--d-ink-3); }
  :global([data-d='F']) .crumb-b { padding-inline: 2px; }
  :global([data-d='F']) .crumb-now { padding-inline: var(--d-p1); }

  /* ======================================================================
     G · BANDA — ninguna caja. Estratos a sangre, raíl de etiquetas a la
     izquierda, y lo activo se marca con la franja de 3px en el canto.
     ====================================================================== */
  :global([data-d='G']) .bar { background: var(--d-sunk); border-bottom-color: var(--d-line); }
  :global([data-d='G']) .bar-id { width: var(--d-rail); flex: none; align-items: flex-end; text-align: right; }
  :global([data-d='G']) .body { grid-template-columns: minmax(0, 1fr); }
  :global([data-d='G']) .side { border-inline-end: 0; border-bottom: var(--d-bw) solid var(--d-line); padding-inline: var(--d-p3); }
  :global([data-d='G']) .side-sec + .side-sec { margin-top: 0; border-top: var(--d-bw) solid var(--d-line); }
  :global([data-d='G']) .side-item,
  :global([data-d='G']) .tab,
  :global([data-d='G']) .chip,
  :global([data-d='G']) .pg,
  :global([data-d='G']) .seg-b {
    border: 0; background: transparent; box-shadow: none; border-radius: 0;
  }
  :global([data-d='G']) .side-item { padding-inline: var(--d-p3) var(--d-p1); }
  :global([data-d='G']) .tab { padding-inline: var(--d-p3) var(--d-p2); }
  :global([data-d='G']) .chip { padding-inline: var(--d-p3) var(--d-p2); }
  :global([data-d='G']) .seg-b { padding-inline: var(--d-p3) var(--d-p2); }
  :global([data-d='G']) .crumb-now { padding-inline: var(--d-p3) var(--d-p1); }
  :global([data-d='G']) .tab.on::before,
  :global([data-d='G']) .side-item.on::before,
  :global([data-d='G']) .chip.on::before,
  :global([data-d='G']) .seg-b.on::before,
  :global([data-d='G']) .pg.on::before,
  :global([data-d='G']) .crumb-now::before {
    content: ''; position: absolute; inset: 0 auto 0 0; width: 3px;
    background: var(--tone-fg, var(--d-ink));
  }
  :global([data-d='G']) .pg.on { padding-inline-start: var(--d-p3); }
  :global([data-d='G']) .seg, :global([data-d='G']) .pg-group, :global([data-d='G']) .chips { gap: 0; }
  :global([data-d='G']) .tabs { gap: 0; }
  :global([data-d='G']) .pg-arrow { border-bottom: 2px solid var(--d-edge); }
  @media (max-width: 720px) {
    :global([data-d='G']) .bar-id { width: auto; align-items: flex-start; text-align: left; }
  }

  /* ======================================================================
     H · FICHA — el nombre del módulo sale por arriba como pestaña, y lo
     activo es la pestaña levantada sobre la regla.
     ====================================================================== */
  :global([data-d='H']) .bar-id {
    position: absolute; top: calc(-1 * var(--d-p4) - 5px); left: calc(-1 * var(--d-bw));
    flex-direction: row; align-items: baseline; gap: var(--d-p1);
    max-width: calc(100% + 2px); white-space: nowrap; overflow: hidden;
    padding: 5px var(--d-p3) 6px;
    background: var(--d-sunk);
    border: var(--d-bw) solid var(--d-edge); border-bottom: 0;
    border-radius: var(--d-r-lg) var(--d-r-lg) 0 0;
  }
  :global([data-d='H']) .bar-mod { font-size: var(--d-t-sm); }
  :global([data-d='H']) .bar-sub { font-size: var(--d-t-2xs); }
  :global([data-d='H']) .bar { background: var(--d-sunk); border-bottom-color: var(--d-edge); }
  :global([data-d='H']) .ava { border-radius: var(--d-r); background: var(--d-accent); }
  /* La regla doble bajo la fila de pestañas: el tic de la ficha rayada. */
  :global([data-d='H']) .row--tabs {
    padding-bottom: 0; border-bottom: var(--d-bw) solid var(--d-edge);
    box-shadow: 0 3px 0 -1px var(--d-line);
  }
  :global([data-d='H']) .tabs { gap: 0; align-items: flex-end; }
  :global([data-d='H']) .tab {
    background: var(--d-sunk);
    border: var(--d-bw) solid var(--d-edge); border-bottom: 0;
    border-radius: var(--d-r-lg) var(--d-r-lg) 0 0;
    margin-inline-start: calc(-1 * var(--d-bw));
    min-height: calc(var(--d-row-h) - var(--d-p1));
  }
  :global([data-d='H']) .tab.on,
  :global([data-d='H']) .side-item.on,
  :global([data-d='H']) .chip.on,
  :global([data-d='H']) .seg-b.on,
  :global([data-d='H']) .pg.on,
  :global([data-d='H']) .crumb-now {
    background: var(--d-surface);
    border: var(--d-bw) solid var(--d-edge);
    border-top: 3px solid var(--d-accent);
    box-shadow: 0 -1px 0 var(--d-surface);
  }
  :global([data-d='H']) .tab.on {
    min-height: var(--d-row-h); border-bottom: 0;
    margin-bottom: calc(-1 * var(--d-bw)); z-index: 1;
  }
  :global([data-d='H']) .side-item.on {
    margin-inline-start: calc(-1 * var(--d-p2));
    border-radius: 0 var(--d-r) var(--d-r) 0;
  }
  :global([data-d='H']) .side-cap {
    border-bottom: var(--d-bw) solid var(--d-edge);
    box-shadow: 0 3px 0 -1px var(--d-line);
    padding-bottom: var(--d-p1); margin-bottom: var(--d-p2);
  }
  :global([data-d='H']) .chips { gap: var(--d-p1) var(--d-p2); }
  :global([data-d='H']) .chip { box-shadow: 0 1px 0 var(--d-edge); }
  :global([data-d='H']) .crumb-now { padding-inline: var(--d-p2); }
  :global([data-d='H']) .side { border-inline-end-color: var(--d-edge); }

  /* ======================================================================
     I · CRISTAL — UNA sola lámina. Todo el módulo vive dentro del mismo
     vidrio y las divisiones internas son filos de luz, no líneas oscuras.
     Activo = el vidrio se ESPESA. No cambia de color: cambia de densidad,
     y se le enciende el reflejo especular de arriba.

     La trampa de esta dirección es el anidado. La lámina exterior ya
     desenfoca el campo de manchas; si además cada ficha de filtro trae su
     propio backdrop-filter —que es lo que hace .d-btn aquí— se desenfoca un
     fondo YA desenfocado y el panel entero se vuelve lechoso. Adentro se
     anida con transparencia, nunca con más blur.
     FALTA UN TOKEN: nada distingue «vidrio exterior» de «vidrio anidado»
     (harían falta un --d-glass y un --d-glass-nested), así que la regla se
     escribe a mano en cada página que meta vidrio dentro de vidrio.
     ====================================================================== */
  :global([data-d='I']) .shell { overflow: hidden; box-shadow: var(--d-shadow-lg); }
  :global([data-d='I']) .bar-do,
  :global([data-d='I']) .chip,
  :global([data-d='I']) .seg-b,
  :global([data-d='I']) .pg,
  :global([data-d='I']) .bar-flag,
  :global([data-d='I']) .crumb-flag {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  /* Los cortes internos son luz: --d-line es blanco al 68 %, no una línea. */
  :global([data-d='I']) .bar,
  :global([data-d='I']) .row { border-bottom-color: var(--d-line); }
  :global([data-d='I']) .bar-mod { font-weight: var(--d-w-semi); }
  :global([data-d='I']) .user { border-radius: var(--d-r-pill); }
  :global([data-d='I']) .user:hover { background: var(--d-sunk); }
  :global([data-d='I']) .ava { box-shadow: var(--d-shadow); }

  /* Todo lo que se toca es una pastilla de vidrio; nada es un rectángulo. */
  :global([data-d='I']) .tab,
  :global([data-d='I']) .side-item,
  :global([data-d='I']) .chip,
  :global([data-d='I']) .seg-b,
  :global([data-d='I']) .pg,
  :global([data-d='I']) .crumb-b { border-radius: var(--d-r-pill); }
  :global([data-d='I']) .chip,
  :global([data-d='I']) .seg-b,
  :global([data-d='I']) .pg {
    background: var(--d-sunk); border-color: var(--d-line); box-shadow: none;
  }
  :global([data-d='I']) .tab:hover,
  :global([data-d='I']) .side-item:hover,
  :global([data-d='I']) .crumb-b:hover { background: var(--d-sunk); }
  /* Botonera de tres piezas sueltas: el vidrio segmentado es de O, no de I. */
  :global([data-d='I']) .tabs,
  :global([data-d='I']) .seg,
  :global([data-d='I']) .chips,
  :global([data-d='I']) .pg-group { gap: var(--d-p1); }

  :global([data-d='I']) .tab.on,
  :global([data-d='I']) .side-item.on,
  :global([data-d='I']) .chip.on,
  :global([data-d='I']) .seg-b.on,
  :global([data-d='I']) .pg.on {
    background: var(--d-surface);
    color: var(--d-ink);
    font-weight: var(--d-w-semi);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='I']) .chip.on,
  :global([data-d='I']) .seg-b.on,
  :global([data-d='I']) .pg.on { border-color: var(--d-line); }
  :global([data-d='I']) .tab.on .tab-n,
  :global([data-d='I']) .side-item.on .side-n,
  :global([data-d='I']) .chip.on .chip-n { color: var(--d-ink-2); }
  :global([data-d='I']) .chip-n {
    padding-inline: var(--d-p1);
    border-radius: var(--d-r-pill);
    background: color-mix(in srgb, var(--d-ink) 7%, transparent);
  }
  /* La única pieza teñida: la miga actual lleva su tono DENTRO del vidrio. */
  :global([data-d='I']) .crumb-now {
    padding-inline: var(--d-p2);
    color: var(--tone-fg);
    background: var(--tone-band);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='I']) .crumb + .crumb::before { color: var(--d-ink-3); }
  :global([data-d='I']) .pager-n { color: var(--d-ink-2); }
  /* HALLAZGO de contraste, el mismo que ya está escrito en Acciones, Tablas y
     Formularios: en directions.css `[data-d='I'] .d-btn` pesa (0,2,0) y
     `.d-btn--primary` pesa (0,1,0), así que el vidrio blanco le gana el fondo
     al primario y queda tinta blanca sobre blanco — 1.07:1, invisible. El
     arreglo de raíz va en directions.css; mientras tanto esta página lo repone. */
  :global([data-d='I']) .d-btn--primary {
    background: var(--d-accent);
    color: var(--d-accent-ink);
  }

  /* ======================================================================
     J · LACA — ninguna superficie es color plano: todas son degradado
     vertical con realce duro arriba. Activo = la placa se HUNDE y se le
     APAGA el brillo, con el esmalte del acento asomando en el fondo del
     pozo. Es el gesto físico que ya describe .d-btn:active, subido al nivel
     de estado permanente: lo activo es lo que quedó apretado.

     El barrido vive en el tercio superior, con pointer-events:none, y los
     hijos se levantan a z-index 1 para que el brillo no les pase por encima
     del texto — un ::after posicionado pinta DESPUÉS del contenido en flujo,
     así que sin esto la barra se lee a través de un velo blanco.
     FALTA UN TOKEN: J no tiene sombra interior de «hundido» (.d-btn:active
     la escribe a mano en directions.css); acá se arma con --d-line, que es
     la tinta al 10 %, para no meter un rgba propio.
     ====================================================================== */
  :global([data-d='J']) .shell { overflow: hidden; }
  :global([data-d='J']) .bar {
    position: relative; z-index: 1;
    background: var(--d-sunk-fill);
    border-bottom-color: var(--d-line);
  }
  :global([data-d='J']) .bar::after {
    content: ''; position: absolute; inset: 0 0 auto 0; height: 38%;
    background: linear-gradient(180deg,
      color-mix(in srgb, var(--d-surface) 62%, transparent), transparent);
    pointer-events: none; z-index: 0;
  }
  :global([data-d='J']) .bar-id,
  :global([data-d='J']) .bar-flag,
  :global([data-d='J']) .user,
  :global([data-d='J']) .bar-find,
  :global([data-d='J']) .bar-do { position: relative; z-index: 1; }
  /* El barrido del panel cubre el 38 % de arriba, que acá es exactamente
     donde viven las pestañas. Se manda detrás de todo: el esmalte lo cargan
     las piezas, una por una, y ninguna queda leyéndose bajo un velo blanco. */
  :global([data-d='J']) .row--tabs,
  :global([data-d='J']) .body { position: relative; z-index: 1; }
  :global([data-d='J']) .ava {
    background: var(--d-accent-fill);
    box-shadow: var(--d-shadow);
  }

  /* Teclas de esmalte, muy separadas: cada una es una placa entera. */
  :global([data-d='J']) .tabs,
  :global([data-d='J']) .seg,
  :global([data-d='J']) .chips,
  :global([data-d='J']) .pg-group { gap: var(--d-p1); }
  :global([data-d='J']) .tab,
  :global([data-d='J']) .side-item {
    background: var(--d-surface-fill);
    border-radius: var(--d-r);
    box-shadow: var(--d-shadow);
    overflow: hidden;
  }
  :global([data-d='J']) .side-item { margin-bottom: var(--d-p1); }
  /* El realce mojado es una banda corta arriba: si ocupa el tercio de la
     tecla le lava el texto y se pierde el contraste. */
  :global([data-d='J']) .tab::after,
  :global([data-d='J']) .side-item::after {
    content: ''; position: absolute; inset: 0 0 auto 0; height: var(--d-p1);
    background: linear-gradient(180deg,
      color-mix(in srgb, var(--d-surface) 78%, transparent), transparent);
    pointer-events: none;
  }
  :global([data-d='J']) .tab:hover,
  :global([data-d='J']) .side-item:hover { background: var(--d-surface); }

  /* Hundida y apagada: sombra interior, sin realce, y el esmalte del acento
     en el fondo del pozo para que el estado no dependa solo del color. */
  :global([data-d='J']) .tab.on,
  :global([data-d='J']) .side-item.on,
  :global([data-d='J']) .chip.on,
  :global([data-d='J']) .seg-b.on,
  :global([data-d='J']) .pg.on,
  :global([data-d='J']) .crumb-now {
    background: var(--d-sunk-fill);
    color: var(--d-ink);
    font-weight: var(--d-w-semi);
    border-color: var(--d-edge);
    box-shadow:
      inset 0 var(--d-p1) var(--d-p2) calc(-1 * var(--d-p1)) var(--d-edge),
      inset 0 -3px 0 var(--d-accent);
  }
  :global([data-d='J']) .tab.on::after,
  :global([data-d='J']) .side-item.on::after { content: none; }
  :global([data-d='J']) .tab.on .tab-n,
  :global([data-d='J']) .side-item.on .side-n,
  :global([data-d='J']) .chip.on .chip-n { color: var(--d-ink-2); }
  :global([data-d='J']) .tab:active,
  :global([data-d='J']) .side-item:active { transform: translateY(1px); }
  :global([data-d='J']) .crumb-now {
    padding-inline: var(--d-p2);
    border-radius: var(--d-r);
  }
  :global([data-d='J']) .crumb-b { border-radius: var(--d-r); }
  :global([data-d='J']) .chip-n,
  :global([data-d='J']) .tab-n { font-weight: var(--d-w-med); }
  :global([data-d='J']) .row { border-bottom-color: var(--d-line); }

  /* ======================================================================
     K · HALO — cero bordes en toda la celda. Nada se separa con una línea:
     las costuras son gradientes de luz que se apagan en las puntas, y el
     resto lo hace el aire. Activo = ENCIENDE: anillo de 1px de su propio
     tono, resplandor hacia afuera y un filamento a la izquierda.

     Los radios de resplandor salen de la escala de espaciado (--d-p3/--d-p4)
     porque K no tiene un token de radio de halo: la alternativa era escribir
     «0 0 24px -6px» a mano en veinte reglas.
     ====================================================================== */
  :global([data-d='K']) .bar,
  :global([data-d='K']) .row,
  :global([data-d='K']) .side { border: 0; position: relative; }
  :global([data-d='K']) .bar::after,
  :global([data-d='K']) .row--tabs::after {
    content: ''; position: absolute; inset: auto 0 0 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--d-accent-edge), transparent);
    pointer-events: none;
  }
  :global([data-d='K']) .body { gap: var(--d-gap); }
  :global([data-d='K']) .main { gap: var(--d-p1); }
  :global([data-d='K']) .bar-mod { text-shadow: 0 0 var(--d-p3) var(--d-accent-soft); }
  :global([data-d='K']) .ava {
    background: var(--d-accent-soft);
    color: var(--d-accent);
    box-shadow:
      0 0 0 1px var(--d-accent-edge),
      0 0 var(--d-p4) calc(-1 * var(--d-p2)) var(--d-accent);
  }
  :global([data-d='K']) .user:hover {
    background: transparent;
    box-shadow: 0 0 var(--d-p4) calc(-1 * var(--d-p2)) var(--d-accent);
  }

  :global([data-d='K']) .tabs,
  :global([data-d='K']) .seg,
  :global([data-d='K']) .chips,
  :global([data-d='K']) .pg-group { gap: var(--d-p2); }
  :global([data-d='K']) .tab,
  :global([data-d='K']) .side-item { border-radius: var(--d-r-pill); }
  :global([data-d='K']) .chip,
  :global([data-d='K']) .seg-b,
  :global([data-d='K']) .pg { border-radius: var(--d-r-pill); border-color: transparent; }
  :global([data-d='K']) .tab:hover,
  :global([data-d='K']) .side-item:hover,
  :global([data-d='K']) .crumb-b:hover {
    background: transparent;
    color: var(--d-ink);
    box-shadow: 0 0 0 1px var(--d-neu-edge);
  }

  /* Encendido. El anillo es la forma; el resplandor es el color del estado. */
  :global([data-d='K']) .tab.on,
  :global([data-d='K']) .side-item.on,
  :global([data-d='K']) .chip.on,
  :global([data-d='K']) .seg-b.on,
  :global([data-d='K']) .pg.on,
  :global([data-d='K']) .crumb-now {
    background: transparent;
    color: var(--tone-fg, var(--d-accent));
    font-weight: var(--d-w-semi);
    text-shadow: 0 0 var(--d-p3) var(--tone-band, var(--d-accent-soft));
    box-shadow:
      0 0 0 1px var(--tone-edge, var(--d-accent-edge)),
      0 0 var(--d-p4) calc(-1 * var(--d-p1)) var(--tone-fg, var(--d-accent));
  }
  :global([data-d='K']) .tab.on .tab-n,
  :global([data-d='K']) .side-item.on .side-n,
  :global([data-d='K']) .chip.on .chip-n { color: inherit; opacity: .8; }
  /* El filamento: no es una franja de canto como en G, es una fuente de luz
     corta que ilumina el borde de la pieza. */
  :global([data-d='K']) .side-item.on::before,
  :global([data-d='K']) .tab.on::before {
    content: ''; position: absolute; inset-inline-start: 0;
    top: 25%; bottom: 25%; width: 2px;
    border-radius: var(--d-r-pill);
    background: var(--tone-fg, var(--d-accent));
    box-shadow: 0 0 var(--d-p3) var(--tone-fg, var(--d-accent));
  }
  :global([data-d='K']) .side-item.on,
  :global([data-d='K']) .tab.on { padding-inline-start: var(--d-p3); }
  :global([data-d='K']) .crumb-now { padding-inline: var(--d-p2); }
  :global([data-d='K']) .crumb + .crumb::before { color: var(--d-neu); }
  :global([data-d='K']) .pager-n { color: var(--d-ink-3); }

  /* ======================================================================
     L · GUIJARRO — cuatro radios distintos por pieza, y distintos entre
     vecinos: si toda la fila comparte los mismos cuatro, vuelven a ser
     tarjetas. Los tres juegos salen de combinar --d-r y --d-r-lg como radios
     elípticos (a / b), que es la única manera de sacar formas nuevas de los
     tokens sin inventar valores.
     Activo = el guijarro se HUNDE en la mesa: la sombra doble se da vuelta.

     FALTA UN TOKEN: L no tiene sombra interior (la de .d-btn:active está
     escrita a mano en directions.css). Acá se arma con color-mix sobre
     --d-ink-3 y --d-surface, que son los dos extremos de la iluminación
     direccional que L ya declara.
     ====================================================================== */
  :global([data-d='L']) .shell { border-radius: var(--d-r-lg); }
  :global([data-d='L']) .bar,
  :global([data-d='L']) .row,
  :global([data-d='L']) .side { border: 0; }
  :global([data-d='L']) .side {
    margin: var(--d-p2);
    padding: var(--d-p2);
    background: var(--d-sunk);
    border-radius: var(--d-r-lg) / var(--d-r);
  }
  :global([data-d='L']) .bar-mod { font-size: var(--d-t-lg); font-weight: var(--d-w-semi); }
  :global([data-d='L']) .ava { border-radius: var(--d-r-lg) / var(--d-r); }
  :global([data-d='L']) .user { border-radius: var(--d-r) / var(--d-r-lg); }

  /* Ni una corrida recta: cada vecino trae su propio canto. */
  :global([data-d='L']) .tabs,
  :global([data-d='L']) .seg,
  :global([data-d='L']) .chips,
  :global([data-d='L']) .pg-group { gap: var(--d-p1); }
  :global([data-d='L']) .tab:nth-child(3n+1),
  :global([data-d='L']) .chip:nth-child(3n+1),
  :global([data-d='L']) .pg:nth-child(3n+1),
  :global([data-d='L']) .seg-b:nth-child(3n+1),
  :global([data-d='L']) .side-list li:nth-child(3n+1) .side-item { border-radius: var(--d-r); }
  :global([data-d='L']) .tab:nth-child(3n+2),
  :global([data-d='L']) .chip:nth-child(3n+2),
  :global([data-d='L']) .pg:nth-child(3n+2),
  :global([data-d='L']) .seg-b:nth-child(3n+2),
  :global([data-d='L']) .side-list li:nth-child(3n+2) .side-item { border-radius: var(--d-r-lg) / var(--d-r); }
  :global([data-d='L']) .tab:nth-child(3n+3),
  :global([data-d='L']) .chip:nth-child(3n+3),
  :global([data-d='L']) .pg:nth-child(3n+3),
  :global([data-d='L']) .seg-b:nth-child(3n+3),
  :global([data-d='L']) .side-list li:nth-child(3n+3) .side-item { border-radius: var(--d-r) / var(--d-r-lg); }
  :global([data-d='L']) .tab,
  :global([data-d='L']) .side-item {
    background: var(--d-surface);
    box-shadow: var(--d-shadow);
    margin-bottom: var(--d-p1);
  }
  :global([data-d='L']) .chip,
  :global([data-d='L']) .pg,
  :global([data-d='L']) .seg-b { border: 0; box-shadow: var(--d-shadow); }
  :global([data-d='L']) .tab:hover,
  :global([data-d='L']) .side-item:hover { background: var(--d-surface); box-shadow: var(--d-shadow-lg); }

  /* Hundido: la luz fría pasa abajo a la derecha y la sombra cálida arriba a
     la izquierda. El objeto dejó de estar sobre la mesa y está METIDO en ella. */
  :global([data-d='L']) .tab.on,
  :global([data-d='L']) .side-item.on,
  :global([data-d='L']) .chip.on,
  :global([data-d='L']) .seg-b.on,
  :global([data-d='L']) .pg.on,
  :global([data-d='L']) .crumb-now {
    background: var(--d-accent-soft);
    color: var(--d-ink);
    font-weight: var(--d-w-semi);
    box-shadow:
      inset var(--d-p1) var(--d-p1) var(--d-p2) calc(-1 * var(--d-p1))
        color-mix(in srgb, var(--d-ink-3) 55%, transparent),
      inset calc(-1 * var(--d-p1)) calc(-1 * var(--d-p1)) var(--d-p2) calc(-1 * var(--d-p1))
        var(--d-surface);
  }
  :global([data-d='L']) .tab.on .tab-n,
  :global([data-d='L']) .side-item.on .side-n,
  :global([data-d='L']) .chip.on .chip-n { color: var(--d-ink-2); }
  :global([data-d='L']) .crumb-now {
    padding-inline: var(--d-p2);
    border-radius: var(--d-r-lg) / var(--d-r);
  }
  :global([data-d='L']) .crumb-b { border-radius: var(--d-r) / var(--d-r-lg); }
  :global([data-d='L']) .crumb + .crumb::before { content: '·'; }
  :global([data-d='L']) .pager-n { color: var(--d-ink-2); }

  /* ======================================================================
     M · BRUMA — no hay contenedores. Ni una caja, ni un relleno, ni un
     borde: lo que agrupa es una mancha desenfocada que se derrama por
     detrás. Activo = la mancha se posa bajo la palabra y se sale de ella
     por los cuatro lados.

     El titular va en serif con --d-display. Y la miga actual, que trae
     .d-id (monoespaciada), se pasa a la serif: M declara DOS familias y una
     tercera por una sola pieza rompería la regla que la define.
     ====================================================================== */
  :global([data-d='M']) .shell { gap: var(--d-gap); }
  :global([data-d='M']) .bar,
  :global([data-d='M']) .row,
  :global([data-d='M']) .side { border: 0; padding-inline: 0; }
  :global([data-d='M']) .body { gap: var(--d-gap); }
  :global([data-d='M']) .side { padding-block: 0; }
  :global([data-d='M']) .bar-mod {
    font-family: var(--d-display);
    font-size: var(--d-t-xl); font-weight: 400; letter-spacing: -.01em;
  }
  :global([data-d='M']) .user { background: transparent; }
  :global([data-d='M']) .user:hover { background: transparent; text-decoration: underline; text-underline-offset: 4px; }
  :global([data-d='M']) .ava {
    background: var(--d-accent-soft);
    color: var(--d-accent);
    box-shadow: 0 0 var(--d-p3) var(--d-p1) var(--d-accent-soft);
  }

  /* Nada de fondos sólidos: ni en reposo, ni en hover, ni activo. */
  :global([data-d='M']) .tab,
  :global([data-d='M']) .side-item,
  :global([data-d='M']) .chip,
  :global([data-d='M']) .seg-b,
  :global([data-d='M']) .pg,
  :global([data-d='M']) .crumb-b {
    background: transparent; border: 0; box-shadow: none;
  }
  :global([data-d='M']) .tab:hover,
  :global([data-d='M']) .side-item:hover,
  :global([data-d='M']) .chip:hover,
  :global([data-d='M']) .seg-b:hover,
  :global([data-d='M']) .pg:hover,
  :global([data-d='M']) .crumb-b:hover {
    background: transparent; color: var(--d-ink);
    text-decoration: underline; text-underline-offset: 4px;
  }
  :global([data-d='M']) .tabs,
  :global([data-d='M']) .seg,
  :global([data-d='M']) .chips { gap: var(--d-p1) var(--d-p3); }
  :global([data-d='M']) .pg-group { gap: var(--d-p1); }

  /* La mancha. Descentrada y más grande que la pieza, para que se lea como
     algo que se derramó y no como un relleno con las esquinas borrosas. */
  :global([data-d='M']) .tab.on,
  :global([data-d='M']) .side-item.on,
  :global([data-d='M']) .chip.on,
  :global([data-d='M']) .seg-b.on,
  :global([data-d='M']) .pg.on,
  :global([data-d='M']) .crumb-now {
    color: var(--d-ink); font-weight: var(--d-w-semi); background: transparent;
  }
  :global([data-d='M']) .tab.on::before,
  :global([data-d='M']) .side-item.on::before,
  :global([data-d='M']) .chip.on::before,
  :global([data-d='M']) .seg-b.on::before,
  :global([data-d='M']) .pg.on::before,
  :global([data-d='M']) .crumb-now::before {
    content: ''; position: absolute;
    inset: calc(-1 * var(--d-p1)) calc(-1 * var(--d-p2));
    background:
      radial-gradient(64% 72% at 34% 40%, var(--tone-band, var(--d-accent-soft)) 0%, transparent 72%),
      radial-gradient(48% 56% at 78% 74%, var(--tone-band, var(--d-neu-band)) 0%, transparent 70%);
    filter: blur(var(--d-p1));
    pointer-events: none;
    z-index: -1;
  }
  :global([data-d='M']) .crumb-now {
    font-family: var(--d-display);
    letter-spacing: 0;
    padding-inline: var(--d-p2);
  }
  :global([data-d='M']) .crumb + .crumb::before { content: '·'; }
  :global([data-d='M']) .side-n,
  :global([data-d='M']) .tab-n,
  :global([data-d='M']) .chip-n { color: var(--d-ink-3); }
  :global([data-d='M']) .pager-n { color: var(--d-ink-2); }
  /* Misma trampa que en I: `[data-d='M'] .d-btn { background: var(--d-sunk) }`
     tapa a `.d-btn--primary`, y el primario queda papel sobre papel — 1.07:1. */
  :global([data-d='M']) .d-btn--primary {
    background: var(--d-accent);
    color: var(--d-accent-ink);
  }

  /* ======================================================================
     N · CINTA — no hay caja: hay carriles. Cada zona es una cinta de puntas
     redondas que se monta unos milímetros sobre la de abajo, con sombra de
     contacto y orden de apilado. Activo = la cinta se LEVANTA: sube de
     capa, engorda y se lleva el degradado del acento.
     ====================================================================== */
  :global([data-d='N']) .shell {
    background: transparent; border: 0; box-shadow: none; gap: 0;
  }
  :global([data-d='N']) .bar,
  :global([data-d='N']) .row,
  :global([data-d='N']) .side {
    position: relative; border: 0;
    background: var(--d-surface-fill);
    box-shadow: var(--d-shadow);
    padding-inline: var(--d-p3);
  }
  :global([data-d='N']) .bar,
  :global([data-d='N']) .side { border-radius: var(--d-r-lg); }
  :global([data-d='N']) .row { border-radius: var(--d-r-pill); }
  /* El montaje: cada carril se come el canto del anterior. */
  :global([data-d='N']) .row--tabs,
  :global([data-d='N']) .body,
  :global([data-d='N']) .row--seg,
  :global([data-d='N']) .row--chips,
  :global([data-d='N']) .row--pager { margin-top: calc(-1 * var(--d-p1)); }
  :global([data-d='N']) .row--tabs { z-index: 1; }
  :global([data-d='N']) .body { position: relative; z-index: 2; }
  :global([data-d='N']) .main { background: transparent; gap: 0; z-index: 3; }
  :global([data-d='N']) .row--crumbs { z-index: 1; }
  :global([data-d='N']) .row--seg { z-index: 2; }
  :global([data-d='N']) .row--chips { z-index: 3; }
  :global([data-d='N']) .row--pager { z-index: 4; }
  :global([data-d='N']) .row--crumbs { background: linear-gradient(100deg, var(--tone-band) 0%, var(--d-surface) 62%); }
  @container navmod (min-width: 400px) {
    :global([data-d='N']) .main { margin-inline-start: calc(-1 * var(--d-p2)); }
  }
  :global([data-d='N']) .ava { background: var(--d-accent-fill); }

  /* Las piezas también son cintas, y se solapan de a poco entre ellas. */
  :global([data-d='N']) .tabs,
  :global([data-d='N']) .seg,
  :global([data-d='N']) .chips,
  :global([data-d='N']) .pg-group { gap: 0; }
  :global([data-d='N']) .tab,
  :global([data-d='N']) .chip,
  :global([data-d='N']) .seg-b,
  :global([data-d='N']) .pg,
  :global([data-d='N']) .crumb-b,
  :global([data-d='N']) .side-item {
    border-radius: var(--d-r-pill);
    background: var(--d-surface-fill);
    border-color: var(--d-line);
    box-shadow: var(--d-shadow);
    padding-inline: var(--d-p3);
  }
  :global([data-d='N']) .tab,
  :global([data-d='N']) .chip,
  :global([data-d='N']) .seg-b,
  :global([data-d='N']) .pg { margin-inline-start: calc(-1 * var(--d-p2)); }
  :global([data-d='N']) .side-item { margin-top: calc(-1 * var(--d-p1)); }
  :global([data-d='N']) .tab:hover,
  :global([data-d='N']) .side-item:hover { background: var(--d-surface); z-index: 5; }

  :global([data-d='N']) .tab.on,
  :global([data-d='N']) .side-item.on,
  :global([data-d='N']) .chip.on,
  :global([data-d='N']) .seg-b.on,
  :global([data-d='N']) .pg.on,
  :global([data-d='N']) .crumb-now {
    background: var(--d-accent-fill);
    color: var(--d-accent-ink);
    border-color: var(--d-accent-edge);
    font-weight: var(--d-w-semi);
    box-shadow: var(--d-shadow-lg);
    z-index: 6;
  }
  /* Levantada de verdad: la cinta activa es más gruesa que sus vecinas. */
  :global([data-d='N']) .tab.on,
  :global([data-d='N']) .side-item.on { min-height: calc(var(--d-row-h) + var(--d-p1)); }
  :global([data-d='N']) .tab.on .tab-n,
  :global([data-d='N']) .side-item.on .side-n,
  :global([data-d='N']) .chip.on .chip-n { color: var(--d-accent-ink); opacity: .78; }
  :global([data-d='N']) .crumb-now { padding-inline: var(--d-p3); }
  /* Las migas también se montan: no hay chevrón, hay solape. */
  :global([data-d='N']) .crumb + .crumb { margin-inline-start: calc(-1 * var(--d-p2)); }
  :global([data-d='N']) .crumb + .crumb::before { content: none; }
  :global([data-d='N']) .pager-n { color: var(--d-ink-2); }

  /* ======================================================================
     O · PRISMA — el mismo vidrio que I, pero partido en piezas que FLOTAN
     (eso lo pone Elevación) y teñidas de marca por dentro (eso lo pone
     Marca). Donde I es una lámina única con pastillas adentro, O son tres
     cristales separados por aire sobre el campo teñido.
     Activo = vidrio más denso CON la tinta de marca dentro y un filo de
     marca por debajo, no una pastilla de color opaca encima.

     La lámina exterior se apaga: si .shell conserva su backdrop-filter, los
     cristales de adentro desenfocan un fondo ya desenfocado. Acá el vidrio
     está en las piezas, no en el envoltorio.
     ====================================================================== */
  :global([data-d='O']) .shell {
    display: flex; gap: var(--d-gap);
    background: transparent; border: 0; box-shadow: none;
    backdrop-filter: none; -webkit-backdrop-filter: none;
  }
  :global([data-d='O']) .bar,
  :global([data-d='O']) .row--tabs,
  :global([data-d='O']) .side,
  :global([data-d='O']) .main {
    background: var(--d-surface);
    border: var(--d-bw) solid var(--d-line);
    box-shadow: var(--d-shadow);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
  }
  /* Los dos cristales que flotan de verdad son los del cuerpo; la cabecera y
     las pestañas son una sola pieza y comparten la sombra corta, si no el
     canto entre las dos se lee como una grieta oscura. */
  :global([data-d='O']) .side,
  :global([data-d='O']) .main { box-shadow: var(--d-shadow-lg); }
  /* La marca vive DENTRO del vidrio de la cabecera, no encima de él. */
  :global([data-d='O']) .bar {
    background:
      linear-gradient(180deg, var(--d-accent-soft), transparent),
      var(--d-surface);
    border-radius: var(--d-r-lg) var(--d-r-lg) 0 0;
    border-bottom: 0;
    color: var(--d-brand-ink);
  }
  :global([data-d='O']) .bar-mod { color: var(--d-brand-ink); font-weight: var(--d-w-semi); }
  :global([data-d='O']) .row--tabs {
    margin-top: calc(-1 * var(--d-gap));
    border-top: var(--d-bw) solid var(--d-accent-edge);
    border-radius: 0 0 var(--d-r-lg) var(--d-r-lg);
    padding-bottom: var(--d-p2);
  }
  :global([data-d='O']) .body { gap: var(--d-gap); }
  :global([data-d='O']) .side,
  :global([data-d='O']) .main {
    border-radius: var(--d-r-lg);
    padding: var(--d-p2);
  }
  :global([data-d='O']) .side { border-inline-end: var(--d-bw) solid var(--d-line); }
  :global([data-d='O']) .row { border-bottom: 0; padding: var(--d-p1) var(--d-p2); }
  :global([data-d='O']) .ava { box-shadow: var(--d-shadow); }

  /* Nada de vidrio dentro de vidrio: las piezas chicas van con transparencia. */
  :global([data-d='O']) .bar-do,
  :global([data-d='O']) .chip,
  :global([data-d='O']) .seg-b,
  :global([data-d='O']) .pg,
  :global([data-d='O']) .bar-flag,
  :global([data-d='O']) .crumb-flag {
    backdrop-filter: none; -webkit-backdrop-filter: none;
  }
  /* Una botonera acá es UNA pieza de vidrio segmentado, no tres botones. */
  :global([data-d='O']) .seg,
  :global([data-d='O']) .pg-group {
    gap: 0; overflow: hidden;
    background: var(--d-sunk);
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r-pill);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='O']) .seg-b,
  :global([data-d='O']) .pg {
    background: transparent; border: 0; box-shadow: none; border-radius: 0;
  }
  :global([data-d='O']) .seg-b + .seg-b,
  :global([data-d='O']) .pg + .pg { border-inline-start: var(--d-bw) solid var(--d-line); }
  :global([data-d='O']) .tab,
  :global([data-d='O']) .side-item { border-radius: var(--d-r); }
  :global([data-d='O']) .chip { border-radius: var(--d-r-pill); background: var(--d-sunk); border-color: var(--d-line); }
  :global([data-d='O']) .tabs, :global([data-d='O']) .chips { gap: var(--d-p1); }

  :global([data-d='O']) .tab.on,
  :global([data-d='O']) .side-item.on,
  :global([data-d='O']) .chip.on,
  :global([data-d='O']) .seg-b.on,
  :global([data-d='O']) .pg.on,
  :global([data-d='O']) .crumb-now {
    background: linear-gradient(180deg, var(--d-accent-soft), transparent), var(--d-surface);
    color: var(--d-brand-ink);
    font-weight: var(--d-w-semi);
    box-shadow: var(--d-shadow), inset 0 -2px 0 var(--d-brand);
  }
  :global([data-d='O']) .tab.on .tab-n,
  :global([data-d='O']) .side-item.on .side-n,
  :global([data-d='O']) .chip.on .chip-n { color: var(--d-brand-ink); opacity: .72; }
  :global([data-d='O']) .crumb-now { padding-inline: var(--d-p2); border-radius: var(--d-r); }
  :global([data-d='O']) .rail-cap, :global([data-d='O']) .side-cap { color: var(--d-brand); }
  :global([data-d='O']) .pager-n { color: var(--d-ink-2); }

  /* ======================================================================
     P · ESPINA — una columna de marca a la izquierda de la que cuelga todo,
     y ninguna caja. Activo = una MUESCA que muerde la espina: el diente sale
     del elemento y va a topar contra la columna.

     EL RAÍL VUELVE. Se retiró de directions.css porque 152px aplicados a
     ciegas destrozan una tarjeta de 200px. Acá vuelve con dos condiciones:
     el cuerpo pasa a una sola columna (P es Banda: franjas a sangre, no un
     lateral y un contenido), y el raíl solo aparece por encima de 620px de
     contenedor, medido con @container sobre .nav — no con @media, porque lo
     que importa es el ancho de ESTA celda, no el de la ventana.
     FALTAN DOS TOKENS. Uno: P no hereda --d-brand-deep de C, así que un hover
     sobre superficie de marca no tiene a qué agarrarse; se resuelve con
     --d-accent-soft, que es la marca aclarada. Dos: el ancho de la espina son
     6px escritos a mano en directions.css y no hay --d-spine, así que el
     diente tiene que repetir ese 6 para que las dos piezas se toquen. Si la
     espina cambia de grosor, esta página se descuelga en silencio.
     ====================================================================== */
  :global([data-d='P']) .body { grid-template-columns: minmax(0, 1fr); }
  :global([data-d='P']) .side {
    border-inline-end: 0;
    border-bottom: var(--d-bw) solid var(--d-line);
    padding: var(--d-p2) 0;
  }
  :global([data-d='P']) .bar { background: var(--d-sunk); border-bottom-color: var(--d-line); }
  :global([data-d='P']) .bar-mod { color: var(--d-brand); font-weight: var(--d-w-semi); }
  :global([data-d='P']) .ava { border-radius: 0; }
  :global([data-d='P']) .user { border-radius: 0; }
  :global([data-d='P']) .user:hover { background: var(--d-accent-soft); }

  @container navmod (min-width: 620px) {
    :global([data-d='P']) .d-rail {
      grid-template-columns: var(--d-rail) minmax(0, 1fr);
      gap: 0 var(--d-p3);
      align-items: baseline;
    }
    :global([data-d='P']) .rail-cap,
    :global([data-d='P']) .side-cap { text-align: right; }
    :global([data-d='P']) .bar-id { width: var(--d-rail); flex: none; }
  }

  /* Ninguna pieza es una caja: todas son franjas del mismo estrato. */
  :global([data-d='P']) .tabs,
  :global([data-d='P']) .seg,
  :global([data-d='P']) .chips,
  :global([data-d='P']) .pg-group { gap: 0; }
  :global([data-d='P']) .tab,
  :global([data-d='P']) .side-item,
  :global([data-d='P']) .chip,
  :global([data-d='P']) .seg-b,
  :global([data-d='P']) .pg,
  :global([data-d='P']) .crumb-b {
    border: 0; border-radius: 0; background: transparent; box-shadow: none;
    padding-inline: var(--d-p3) var(--d-p2);
  }
  :global([data-d='P']) .side-list li { border-top: var(--d-bw) solid var(--d-line); }
  :global([data-d='P']) .side-item { width: 100%; }
  :global([data-d='P']) .tab:hover,
  :global([data-d='P']) .side-item:hover,
  :global([data-d='P']) .chip:hover,
  :global([data-d='P']) .seg-b:hover,
  :global([data-d='P']) .pg:hover { background: var(--d-accent-soft); }

  /* La muesca: un diente del ancho de la espina que sale por la izquierda y
     la muerde. En la miga actual el diente se pinta del tono del estado,
     que es como P dice «vencido» sin manchar el fondo. */
  :global([data-d='P']) .tab.on,
  :global([data-d='P']) .side-item.on,
  :global([data-d='P']) .chip.on,
  :global([data-d='P']) .seg-b.on,
  :global([data-d='P']) .pg.on,
  :global([data-d='P']) .crumb-now {
    background: var(--d-accent-soft);
    color: var(--d-brand);
    font-weight: var(--d-w-semi);
    padding-inline-start: var(--d-p3);
  }
  :global([data-d='P']) .tab.on::before,
  :global([data-d='P']) .side-item.on::before,
  :global([data-d='P']) .chip.on::before,
  :global([data-d='P']) .seg-b.on::before,
  :global([data-d='P']) .pg.on::before,
  :global([data-d='P']) .crumb-now::before {
    content: ''; position: absolute; inset: 0 auto 0 0; width: 6px;
    background: var(--tone-fg, var(--d-brand));
  }
  :global([data-d='P']) .tab.on .tab-n,
  :global([data-d='P']) .side-item.on .side-n,
  :global([data-d='P']) .chip.on .chip-n { color: var(--d-brand); }
  :global([data-d='P']) .crumb-now { padding-inline: var(--d-p3) var(--d-p2); color: var(--tone-fg); }
  :global([data-d='P']) .crumb + .crumb::before { content: '/'; color: var(--d-ink-3); }
  :global([data-d='P']) .pager-n { color: var(--d-ink-2); }

  /* ======================================================================
     Q · CHAROL — masa dura con superficie mojada: 2px de tinta, sombra
     sólida desplazada y el brillo encima. Activo = el bloque SALTA hacia
     arriba y a la izquierda, alejándose de su sombra —que se hace más
     larga— y se pinta con el esmalte del acento.

     Es la inversión exacta de D, que se hunde HACIA su sombra al presionar:
     acá lo activo es lo que está más lejos del papel. Y el barrido húmedo se
     recorta a una banda corta arriba, no al tercio: sobre el rojo del
     acento, un velo blanco al 62 % en el medio de la tecla dejaría el texto
     blanco sin contraste.
     ====================================================================== */
  :global([data-d='Q']) .bar {
    position: relative; z-index: 1;
    background: var(--d-sunk-fill);
    border-bottom: var(--d-bw) solid var(--d-ink);
  }
  :global([data-d='Q']) .bar::after {
    content: ''; position: absolute; inset: 0 0 auto 0; height: 34%;
    background: linear-gradient(180deg,
      color-mix(in srgb, var(--d-surface) 62%, transparent), transparent);
    pointer-events: none; z-index: 0;
  }
  :global([data-d='Q']) .bar-id,
  :global([data-d='Q']) .bar-flag,
  :global([data-d='Q']) .user,
  :global([data-d='Q']) .bar-find,
  :global([data-d='Q']) .bar-do { position: relative; z-index: 1; }
  :global([data-d='Q']) .row--tabs,
  :global([data-d='Q']) .body { position: relative; z-index: 1; }
  :global([data-d='Q']) .bar-mod { text-transform: uppercase; font-weight: var(--d-w-bold); font-size: var(--d-t-lg); }
  :global([data-d='Q']) .row { border-bottom-color: var(--d-ink); }
  :global([data-d='Q']) .side { border-inline-end-color: var(--d-ink); border-bottom-color: var(--d-ink); }
  :global([data-d='Q']) .ava {
    border-radius: var(--d-r);
    border: var(--d-bw) solid var(--d-ink);
    background: var(--d-accent-fill);
  }
  :global([data-d='Q']) .user { border: var(--d-bw) solid transparent; }
  :global([data-d='Q']) .user:hover { border-color: var(--d-ink); background: transparent; }

  /* Teclas de masa: comparten canto, como en Peso, pero mojadas. */
  :global([data-d='Q']) .tabs,
  :global([data-d='Q']) .seg,
  :global([data-d='Q']) .pg-group { gap: 0; }
  :global([data-d='Q']) .chips { gap: var(--d-p2); }
  :global([data-d='Q']) .tab,
  :global([data-d='Q']) .side-item {
    overflow: hidden;
    background: var(--d-surface-fill);
    border: var(--d-bw) solid var(--d-ink);
    border-radius: var(--d-r);
    text-transform: uppercase;
    font-weight: var(--d-w-semi);
  }
  :global([data-d='Q']) .tab { margin-inline-start: calc(-1 * var(--d-bw)); }
  :global([data-d='Q']) .side-item { margin-bottom: calc(-1 * var(--d-bw)); font-size: var(--d-t-xs); }
  :global([data-d='Q']) .chip,
  :global([data-d='Q']) .seg-b,
  :global([data-d='Q']) .pg { overflow: hidden; }
  :global([data-d='Q']) .seg-b,
  :global([data-d='Q']) .pg { margin-inline-start: calc(-1 * var(--d-bw)); }
  /* El charol: una banda corta arriba, dentro del borde duro. */
  :global([data-d='Q']) .tab::after,
  :global([data-d='Q']) .side-item::after,
  :global([data-d='Q']) .chip::after,
  :global([data-d='Q']) .seg-b::after,
  :global([data-d='Q']) .pg::after {
    content: ''; position: absolute; inset: 0 0 auto 0; height: var(--d-p1);
    background: linear-gradient(180deg,
      color-mix(in srgb, var(--d-surface) 70%, transparent), transparent);
    pointer-events: none;
  }

  :global([data-d='Q']) .tab.on,
  :global([data-d='Q']) .side-item.on,
  :global([data-d='Q']) .chip.on,
  :global([data-d='Q']) .seg-b.on,
  :global([data-d='Q']) .pg.on,
  :global([data-d='Q']) .crumb-now {
    background: var(--d-accent-fill);
    color: var(--d-accent-ink);
    border: var(--d-bw) solid var(--d-ink);
    font-weight: var(--d-w-bold);
    box-shadow: var(--d-shadow-lg);
    transform: translate(calc(-1 * var(--d-bw)), calc(-1 * var(--d-bw)));
    z-index: 1;
  }
  :global([data-d='Q']) .tab.on .tab-n,
  :global([data-d='Q']) .side-item.on .side-n,
  :global([data-d='Q']) .chip.on .chip-n { color: var(--d-accent-ink); }
  :global([data-d='Q']) .tab:active,
  :global([data-d='Q']) .side-item:active {
    transform: translate(var(--d-bw), var(--d-bw));
    box-shadow: var(--d-bw) var(--d-bw) 0 var(--d-ink);
  }
  :global([data-d='Q']) .crumb-now {
    padding-inline: var(--d-p2); overflow: hidden;
    border-radius: var(--d-r); text-transform: uppercase;
  }
  :global([data-d='Q']) .crumb-b { text-transform: uppercase; font-weight: var(--d-w-semi); font-size: var(--d-t-xs); }
  :global([data-d='Q']) .crumb + .crumb::before { content: '▸'; color: var(--d-ink); }
  :global([data-d='Q']) .pager-n { color: var(--d-ink); text-transform: uppercase; font-weight: var(--d-w-semi); }

  /* ======================================================================
     R · VITRINA — densidad de consola (fila de 26px, monoespaciada) sobre
     vidrio oscuro. Es la más densa de las diecinueve. Activo = texto
     INVERTIDO: bloque de acento sólido detrás de la palabra.

     Lo que la aparta de F, que es su otra mitad: F es un flujo de texto con
     árbol ASCII, R es una VITRINA — celdas de vidrio separadas por filos de
     luz vertical, sin un solo carácter de decoración. Y como en I, las
     piezas de adentro apagan su backdrop-filter: el vidrio es la caja, no
     cada botón.
     ====================================================================== */
  :global([data-d='R']) .bar-do,
  :global([data-d='R']) .chip,
  :global([data-d='R']) .seg-b,
  :global([data-d='R']) .pg {
    backdrop-filter: none; -webkit-backdrop-filter: none;
  }
  :global([data-d='R']) .bar { padding: var(--d-p1) var(--d-p2); gap: 0; }
  :global([data-d='R']) .bar-id { padding-inline-end: var(--d-p2); }
  :global([data-d='R']) .bar-mod { font-size: var(--d-t-sm); text-transform: uppercase; letter-spacing: .06em; }
  :global([data-d='R']) .bar-flag { margin-inline: var(--d-p2); }
  :global([data-d='R']) .bar-find,
  :global([data-d='R']) .user {
    border-inline-start: var(--d-bw) solid var(--d-line);
    padding-inline-start: var(--d-p2);
  }
  :global([data-d='R']) .ava { border-radius: var(--d-r); }
  :global([data-d='R']) .row { padding: var(--d-p1) var(--d-p2); }
  :global([data-d='R']) .side { padding: var(--d-p1); }
  @container navmod (min-width: 400px) {
    :global([data-d='R']) .body { grid-template-columns: minmax(0, 30%) minmax(0, 1fr); }
  }

  /* Celdas de vidrio: filos de luz verticales en vez de espacio. */
  :global([data-d='R']) .tabs,
  :global([data-d='R']) .seg,
  :global([data-d='R']) .chips,
  :global([data-d='R']) .pg-group { gap: 0; }
  :global([data-d='R']) .tab,
  :global([data-d='R']) .chip,
  :global([data-d='R']) .seg-b,
  :global([data-d='R']) .pg {
    min-height: var(--d-row-h);
    padding-inline: var(--d-p2);
    font-size: var(--d-t-xs);
    border-radius: 0;
    background: var(--d-sunk);
    border: 0;
    box-shadow: none;
  }
  :global([data-d='R']) .tab + .tab,
  :global([data-d='R']) .chip + .chip,
  :global([data-d='R']) .seg-b + .seg-b,
  :global([data-d='R']) .pg + .pg { border-inline-start: var(--d-bw) solid var(--d-line); }
  :global([data-d='R']) .side-item {
    min-height: var(--d-row-h);
    padding: 0 var(--d-p1);
    font-size: var(--d-t-xs);
    border-radius: 0;
    border-bottom: var(--d-bw) solid var(--d-line);
  }
  :global([data-d='R']) .side-list li:last-child .side-item { border-bottom: 0; }
  :global([data-d='R']) .side-cap { padding-block: var(--d-p1); border-bottom: var(--d-bw) solid var(--d-edge); }
  :global([data-d='R']) .tab:hover,
  :global([data-d='R']) .side-item:hover,
  :global([data-d='R']) .crumb-b:hover { background: var(--d-surface); }

  :global([data-d='R']) .tab.on,
  :global([data-d='R']) .side-item.on,
  :global([data-d='R']) .chip.on,
  :global([data-d='R']) .seg-b.on,
  :global([data-d='R']) .pg.on,
  :global([data-d='R']) .crumb-now {
    background: var(--d-accent);
    color: var(--d-accent-ink);
    font-weight: var(--d-w-semi);
  }
  :global([data-d='R']) .tab.on .tab-n,
  :global([data-d='R']) .side-item.on .side-n,
  :global([data-d='R']) .chip.on .chip-n { color: var(--d-accent-ink); }
  :global([data-d='R']) .crumb-now { padding-inline: var(--d-p1); border-radius: 0; }
  :global([data-d='R']) .crumb-b { padding-inline: var(--d-p1); border-radius: 0; }
  :global([data-d='R']) .crumb + .crumb::before { content: '/'; padding-inline: 0; }
  :global([data-d='R']) .pager-n { font-size: var(--d-t-2xs); }

  /* ======================================================================
     S · UMBRA — la superficie se queda BLANCA y lo que informa es la luz
     teñida de abajo. Activo = la pieza se despega del papel y proyecta;
     lo inactivo está plano contra él.

     Hasta hoy la firma la llevaban solo .d-panel y .d-row. El marcado propio
     de esta página —barra, pestañas, fichas de filtro, migas, paginación— no
     la tenía: se veía como Elevación con más aire. Acá cada superficie de la
     página entra al mismo contrato, y la fila de migas, que ES la que trae
     estado, proyecta rojo sin que una sola letra se manche.
     FALTA UN TOKEN: la geometría de la sombra teñida no está tokenizada
     (--d-shadow no lleva el tono), así que se arma con la escala de
     espaciado para que siga siendo la misma luz en toda la dirección.
     ====================================================================== */
  :global([data-d='S']) .shell {
    display: flex; gap: var(--d-gap);
    background: transparent; border: 0; box-shadow: none;
  }
  :global([data-d='S']) .bar,
  :global([data-d='S']) .row--tabs,
  :global([data-d='S']) .side,
  :global([data-d='S']) .main {
    background: var(--d-surface);
    border: 0;
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    padding: var(--d-p2) var(--d-p3);
  }
  :global([data-d='S']) .body { gap: var(--d-gap); }
  :global([data-d='S']) .main { padding: var(--d-p1); gap: var(--d-p1); }
  :global([data-d='S']) .side { border-inline-end: 0; }
  :global([data-d='S']) .row { border-bottom: 0; border-radius: var(--d-r); padding: var(--d-p1) var(--d-p2); }
  :global([data-d='S']) .ava { box-shadow: var(--d-shadow); }
  :global([data-d='S']) .user { border-radius: var(--d-r-pill); }

  /* LA FIRMA, extendida al marcado de la página: la fila de migas lleva el
     estado de la ruta y lo dice con la sombra, no con una banda de color. */
  :global([data-d='S']) .row--crumbs {
    background: var(--d-surface);
    box-shadow:
      0 var(--d-p1) var(--d-p4) calc(-1 * var(--d-p2)) var(--tone-fg),
      0 2px var(--d-p1) calc(-1 * var(--d-p1)) color-mix(in srgb, var(--d-ink) 22%, transparent);
  }
  :global([data-d='S']) .crumb-now {
    padding-inline: var(--d-p2);
    background: var(--d-surface);
    color: var(--d-ink);
    box-shadow: 0 var(--d-p1) var(--d-p3) calc(-1 * var(--d-p1)) var(--tone-fg);
  }

  /* Lo activo se levanta; lo inactivo está plano. Ni un relleno de color. */
  :global([data-d='S']) .tab,
  :global([data-d='S']) .side-item { border-radius: var(--d-r); }
  :global([data-d='S']) .chip,
  :global([data-d='S']) .seg-b,
  :global([data-d='S']) .pg { border-color: transparent; box-shadow: none; background: var(--d-sunk); }
  :global([data-d='S']) .tab:hover,
  :global([data-d='S']) .side-item:hover {
    background: var(--d-surface);
    box-shadow: 0 2px var(--d-p2) calc(-1 * var(--d-p1)) var(--d-ink-3);
  }
  :global([data-d='S']) .tabs,
  :global([data-d='S']) .seg,
  :global([data-d='S']) .chips,
  :global([data-d='S']) .pg-group { gap: var(--d-p1); }
  :global([data-d='S']) .tab.on,
  :global([data-d='S']) .side-item.on,
  :global([data-d='S']) .chip.on,
  :global([data-d='S']) .seg-b.on,
  :global([data-d='S']) .pg.on {
    background: var(--d-surface);
    color: var(--d-ink);
    font-weight: var(--d-w-semi);
    box-shadow: 0 var(--d-p1) var(--d-p4) calc(-1 * var(--d-p2)) var(--d-ink-2);
  }
  :global([data-d='S']) .tab.on .tab-n,
  :global([data-d='S']) .side-item.on .side-n,
  :global([data-d='S']) .chip.on .chip-n { color: var(--d-ink-2); }
  :global([data-d='S']) .crumb + .crumb::before { color: var(--d-ink-3); }
  :global([data-d='S']) .pager-n { color: var(--d-ink-2); }
</style>
