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
  //   G franja de canto · H pestaña levantada
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
    <Direction id={d.id} flush={d.id === 'F' || d.id === 'G'}>
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
              <!-- Migas de pan -->
              <div class="row row--crumbs d-rail">
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
</style>
