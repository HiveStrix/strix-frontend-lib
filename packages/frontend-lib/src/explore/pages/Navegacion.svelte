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
  import { FAMILIES, LOCATIONS, ASSETS, KPIS, PLANS, markOf } from '../demo.js';

  export let directions = [];

  // Contenido real. BAT-014 es la batidora vencida de demo.js: es la que abre
  // las migas y la que obliga a que el rastro termine en un estado, no en un
  // título limpio.
  //
  // LAS TRES SEÑALES DICEN LO MISMO. Pestaña, ítem de lateral y raíz de las
  // migas arrancan las tres en «Flota». Antes la pestaña y la lateral decían
  // «Equipos» mientras el rastro decía «Flota › Batidoras › BAT-014», así que
  // el indicador de activo no se podía verificar: no había manera de saber si
  // marcaba bien porque no había nada con qué contrastarlo. Ahora se lee la
  // misma ubicación desde tres sitios y en tres materiales distintos, que es
  // exactamente lo que esta página tiene que dejar comparar.
  const BAT = ASSETS.find((a) => a.code === 'BAT-014');
  const OVER = KPIS.find((k) => k.tone === 'critical');

  // LA COTA DE LA RUTA (solo X). El rastro no termina en un título limpio:
  // termina en una máquina, y una máquina en Cota es una lectura corriendo
  // hacia un tope. Los cuatro datos salen de demo.js y ninguno se escribe a
  // mano acá: la lectura la trae ASSETS (312 h), el tope y el vencimiento los
  // trae PLANS (cada 250 h, venció hace 12 d) y el recorrido es el pct del
  // propio equipo, para que el riel de BAT-014 sea el mismo en las veinte
  // direcciones y en las siete familias.
  //
  // No hay una sola resta en pantalla, y es a propósito: el sobrepaso lo dice
  // el riel, que llega al 150 % justamente para eso. Restar acá obligaría a
  // elegir entre 312 menos 250 y el 118 % que declara demo.js, que no dan lo
  // mismo, y la pantalla terminaría discutiendo consigo misma.
  const BAT_PLAN = PLANS.find((p) => p.asset === BAT.code);
  const COTA_FIG = BAT.metric.replace(/[^\d\s]/g, '').trim();
  const COTA_UNIT = BAT.metric.replace(/[\d\s]/g, '');
  const COTA_TOPE = BAT_PLAN.every.replace(/[^\d\s]/g, '').trim();

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
                placeholder="Buscar equipo o código"
                bind:value={q[d.id]} />
            </div>

            <button class="bar-do d-btn d-btn--primary" type="button">Nuevo equipo</button>
          </header>

          <!-- Pestañas -->
          <div class="row row--tabs d-rail">
            <span class="d-cap rail-cap cap-mute">Secciones</span>
            <nav class="tabs" aria-label="Secciones del módulo">
              {#each TABS as t}
                <button
                  class="tab"
                  type="button"
                  class:on={(tab[d.id] ?? 'Flota') === t.name}
                  aria-current={(tab[d.id] ?? 'Flota') === t.name ? 'page' : undefined}
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
                            class:on={(sec[d.id] ?? 'Flota') === it.name}
                            aria-current={(sec[d.id] ?? 'Flota') === it.name ? 'page' : undefined}
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
                <span class="d-cap rail-cap cap-mute">Ruta</span>
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

                <!-- LA COTA, y solo en X. Va dentro del {#if} y no oculta con
                     CSS, para que las otras diecinueve rendericen exactamente
                     el mismo árbol que ayer: una pieza escondida sigue estando
                     en el DOM, en el árbol de accesibilidad y en la cuenta de
                     alto de la fila. Cota es la única dirección que tiene una
                     primitiva para esto y es la única que la muestra. -->
                {#if d.id === 'X'}
                  <div class="cota-here">
                    <p class="cota-plan">{BAT.plan}</p>
                    <div class="d-cota" data-tone={BAT.tone} style="--cota:{BAT.pct}">
                      <div class="d-cota-fig"><b>{COTA_FIG}</b> <span>{COTA_UNIT}</span></div>
                      <div class="d-cota-rail"><i class="d-cota-fill"></i><i class="d-cota-tick"></i></div>
                      <div class="d-cota-note">tope {COTA_TOPE} {COTA_UNIT} · {BAT_PLAN.when}</div>
                    </div>
                  </div>
                {/if}
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
                <span class="d-cap rail-cap cap-mute" id="cf-{d.id}">Familias</span>
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
                <span class="d-cap rail-cap cap-mute">Página</span>
                <nav class="pager" aria-label="Paginación de equipos">
                  <p class="pager-n d-num">
                    {(pg[d.id] ?? 1) * PER - PER + 1} a {Math.min((pg[d.id] ?? 1) * PER, TOTAL)} de {TOTAL} equipos
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

  /* ── Barra de módulo ──────────────────────────────────────────────────
     UNA SOLA LÍNEA, y nunca más de 80px de alto. Antes envolvía: a 560px de
     celda caían el buscador y el botón a un segundo renglón y la barra se
     comía 120px de la pantalla que el técnico necesita para la lista. Con
     nowrap la barra deja de crecer y lo que sobra se retira por prioridad,
     que es una decisión de producto y por eso está escrita:

       1. el nombre del usuario   (lo sabe quien está sentado ahí)
       2. la flota y su tamaño    (vuelve a decirlo la pestaña Equipos)
       3. nada más

     Lo que NUNCA se va es la píldora de vencidos: es el único dato de la
     barra que cambia solo y que obliga a actuar. Y el orden visual es el de
     una barra de módulo de verdad (identidad, estado, búsqueda, acción,
     cuenta) resuelto con `order` para no reescribir el marcado, que es de
     donde cuelgan las veinte direcciones.
     ─────────────────────────────────────────────────────────────────────── */
  .bar {
    display: flex; align-items: center; flex-wrap: nowrap; gap: var(--d-p2);
    padding: var(--d-p1) var(--d-p3);
    border-bottom: var(--d-bw) solid var(--d-line);
    min-width: 0;
  }
  .bar-id { display: flex; flex-direction: column; min-width: 0; flex: 0 1 auto; }
  .bar-mod {
    font-size: var(--d-t-md); font-weight: var(--d-w-semi);
    letter-spacing: -.01em; overflow-wrap: anywhere;
  }
  .bar-sub { display: none; white-space: nowrap; }
  .bar-flag { flex: none; }
  .bar-find { order: 1; display: flex; align-items: center; gap: var(--d-p1); flex: 1 1 110px; min-width: 0; }
  .find { appearance: none; -webkit-appearance: none; }
  .bar-do { order: 2; flex: none; }

  .user {
    order: 3;
    display: inline-flex; align-items: center; gap: var(--d-p1);
    flex: none; padding: var(--d-p1);
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
  .user-t { display: none; flex-direction: column; line-height: 1.15; text-align: left; }
  .user-t b { font-size: var(--d-t-xs); font-weight: var(--d-w-semi); }
  .user-t small { font-size: var(--d-t-2xs); color: var(--d-ink-3); }

  /* La escalera de retirada. Se mide sobre .nav con @container y no con
     @media: lo que decide si algo cabe es el ancho de ESTA celda, no el de la
     ventana, y en esta página hay hasta tres celdas por fila. */
  @container navmod (min-width: 620px) { .bar-sub { display: block; } }
  @container navmod (min-width: 780px) { .user-t { display: flex; } }

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
     LAS FINALISTAS · RECORTE DE VERSALITAS

     Esta celda llevaba NUEVE: el subtítulo de la barra, cinco etiquetas de
     raíl (Secciones, Ruta, Agrupar por, Familias, Página) y las tres
     cabeceras de la lateral. Sobraban ocho, y sobraban por la misma razón:
     unas pestañas se leen como pestañas, un rastro de migas se lee como un
     rastro, y «1 a 24 de 88 equipos» ya dice que eso de abajo es la
     paginación. Poner una versalita encima de cada una no informa: iguala el
     ritmo de toda la columna y obliga a leer para encontrar.

     La única que se queda es «Agrupar por», porque Familia / Categoría /
     Ubicación sin etiqueta puede ser un filtro o una agrupación, y la
     diferencia cambia lo que el técnico cree que está viendo. Una cada siete
     secciones.

     No se borran del marcado, se ocultan a la vista, por tres motivos: G las
     usa como raíl y esa columna ES su silueta entera, P las alinea a la
     derecha, y dos de ellas son el aria-labelledby de su botonera. Ocultas
     con la técnica de .d-sr siguen nombrando el grupo para quien navega con
     lector. Y se ocultan solo en las finalistas, que son las que se deciden.

     Las tres cabeceras de la lateral se quedan a la vista y dejan de ser
     versalitas: son encabezados, no epígrafes. En caja normal se leen de un
     golpe, que es lo único que se les pide.
     ====================================================================== */
  :global([data-d='A']) .cap-mute,
  :global([data-d='B']) .cap-mute,
  :global([data-d='C']) .cap-mute,
  :global([data-d='I']) .cap-mute,
  :global([data-d='M']) .cap-mute,
  :global([data-d='O']) .cap-mute,
  :global([data-d='T']) .cap-mute,
  :global([data-d='W']) .cap-mute {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap;
  }
  /* El subtítulo de la barra es un DATO, qué flota y de qué tamaño, no un
     epígrafe. Caja normal, cifras tabulares, tinta secundaria. */
  :global([data-d='A']) .bar-sub,
  :global([data-d='B']) .bar-sub,
  :global([data-d='C']) .bar-sub,
  :global([data-d='I']) .bar-sub,
  :global([data-d='M']) .bar-sub,
  :global([data-d='O']) .bar-sub,
  :global([data-d='T']) .bar-sub,
  :global([data-d='W']) .bar-sub {
    font-size: var(--d-t-xs); font-weight: var(--d-w);
    letter-spacing: 0; text-transform: none;
    color: var(--d-ink-3);
    font-variant-numeric: var(--d-num);
  }
  :global([data-d='A']) .side-cap,
  :global([data-d='B']) .side-cap,
  :global([data-d='C']) .side-cap,
  :global([data-d='I']) .side-cap,
  :global([data-d='M']) .side-cap,
  :global([data-d='O']) .side-cap,
  :global([data-d='T']) .side-cap,
  :global([data-d='W']) .side-cap {
    font-size: var(--d-t-xs); font-weight: var(--d-w-semi);
    letter-spacing: 0; text-transform: none;
    color: var(--d-ink-2);
  }
  /* El nombre del módulo no parte en dos: si no cabe, se corta con puntos.
     Va solo en los siete porque G y P dan al identificador una columna de
     148px donde partir es lo correcto, y ahí un corte con puntos dejaría
     «Mantenimiento d…» como único título de la pantalla. */
  :global([data-d='A']) .bar-mod,
  :global([data-d='B']) .bar-mod,
  :global([data-d='C']) .bar-mod,
  :global([data-d='I']) .bar-mod,
  :global([data-d='M']) .bar-mod,
  :global([data-d='O']) .bar-mod,
  :global([data-d='T']) .bar-mod,
  :global([data-d='W']) .bar-mod {
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* ======================================================================
     UBICACIÓN Y SELECCIÓN SON DOS COSAS.

     La celda tiene ocho piezas que pueden estar «activas»: pestaña, ítem de
     lateral, miga final, tres segmentos, seis fichas y cuatro páginas. Hasta
     ahora las siete direcciones pintaban las ocho con el MISMO gesto, así que
     la pantalla contestaba ocho veces a preguntas distintas con la misma
     palabra y ninguna de las ocho contestaba «dónde estoy».

     De acá en adelante, en los siete finalistas:

       UBICACIÓN  pestaña · ítem de lateral · miga final
                  el gesto fuerte de la dirección. Son tres piezas que dicen
                  lo mismo desde tres sitios, y por eso pueden gritar.
       SELECCIÓN  ficha de filtro · segmento · página
                  el mismo material, un grado más abajo. Son elecciones del
                  usuario, no su posición en el módulo.

     Es la misma distinción que ya existe en el contenido: la ruta termina en
     BAT-014 y las fichas terminan en Batidoras. Ahora también se ve.
     ====================================================================== */

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
  /* BLOQUEO DE FORMA. A es 7 y 11px, y lo activo venía en pastillas de 999.
     Era la única corrida de esa escala en toda la celda: el módulo se leía
     como dos sistemas superpuestos, tarjetas y píldoras. Ahora hay una sola
     escala y los 999 quedan para .d-pill, que es semántica y se repite igual
     en las veinte direcciones. */
  :global([data-d='A']) .tab { border-radius: var(--d-r); }
  :global([data-d='A']) .ava { border-radius: var(--d-r); }
  /* UBICACIÓN: se pinta de tinta. */
  :global([data-d='A']) .tab.on,
  :global([data-d='A']) .side-item.on,
  :global([data-d='A']) .crumb-now {
    background: var(--d-accent); color: var(--d-accent-ink);
    border-color: var(--d-accent-edge); border-radius: var(--d-r);
    box-shadow: var(--d-shadow-lg);
  }
  :global([data-d='A']) .tab.on .tab-n,
  :global([data-d='A']) .side-item.on .side-n { color: var(--d-accent-ink); opacity: .72; }
  /* SELECCIÓN: no se pinta, se levanta, y lleva el filo de tinta abajo. Es la
     elevación de A haciendo el trabajo que en otras direcciones hace el
     color, así que sigue siendo la misma dirección diciendo otra cosa. */
  :global([data-d='A']) .chip.on,
  :global([data-d='A']) .pg.on {
    background: var(--d-surface); color: var(--d-ink);
    border-color: var(--d-edge); font-weight: var(--d-w-semi);
    box-shadow: var(--d-shadow-lg), inset 0 -2px 0 var(--d-accent);
  }
  /* El segmentado es un carril hundido con un pulgar que flota encima. */
  :global([data-d='A']) .seg {
    gap: 0; padding: var(--d-p1);
    background: var(--d-sunk); border-radius: var(--d-r);
  }
  :global([data-d='A']) .seg-b { border-color: transparent; background: transparent; box-shadow: none; border-radius: var(--d-r); }
  :global([data-d='A']) .seg-b.on {
    background: var(--d-surface); color: var(--d-ink);
    box-shadow: var(--d-shadow-lg), inset 0 -2px 0 var(--d-accent);
    font-weight: var(--d-w-semi);
  }
  :global([data-d='A']) .chip-n {
    padding-inline: var(--d-p1); border-radius: var(--d-r);
    background: var(--d-sunk);
  }
  :global([data-d='A']) .chip.on .chip-n { color: var(--d-ink-2); background: var(--d-sunk); }
  :global([data-d='A']) .pg-group { gap: var(--d-p1); }
  /* La única moción de A: la tarjeta que se levanta tarda lo que tarda una
     sombra en crecer. Sin esto el cambio de página parpadea. */
  :global([data-d='A']) .tab,
  :global([data-d='A']) .side-item,
  :global([data-d='A']) .chip,
  :global([data-d='A']) .seg-b,
  :global([data-d='A']) .pg { transition: box-shadow 120ms ease, background 120ms ease; }

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
  /* La marca de esquina: la misma que lleva .d-panel en esta dirección, y en
     B es la firma de UBICACIÓN. Las tres piezas que dicen dónde estás la
     llevan; ninguna selección la lleva. Se reconoce sin leer. */
  :global([data-d='B']) .tab.on::after,
  :global([data-d='B']) .crumb-now::after,
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
    padding-inline: var(--d-p2) calc(var(--d-p2) + 3px);
    border: var(--d-bw) solid var(--d-edge); background: var(--d-surface);
  }
  :global([data-d='B']) .crumb + .crumb::before { content: '·'; }

  /* DENSIDAD DE CABINA. B declara fila de 30px y venía respirando como A: la
     celda entraba en 620px de alto para mostrar siete controles. Con el
     interlineado de la dirección entra en poco más de 400, que es la
     diferencia entre ver la lista debajo o no verla. */
  :global([data-d='B']) .row { padding: var(--d-p1) var(--d-p2); }
  :global([data-d='B']) .side { padding: var(--d-p1); }
  :global([data-d='B']) .tab,
  :global([data-d='B']) .side-item { min-height: var(--d-row-h); }
  :global([data-d='B']) .side-item { padding-block: 0; }
  :global([data-d='B']) .side-sec + .side-sec { margin-top: var(--d-p1); }
  :global([data-d='B']) .side-cap {
    display: flex; align-items: center; gap: var(--d-p2);
    padding: var(--d-p1) var(--d-p1) 3px;
  }
  /* El encabezado de sección de un plano no lleva versalitas: lleva una regla
     que sale de la última letra y muere en el marco. */
  :global([data-d='B']) .side-cap::after {
    content: ''; flex: 1; height: 1px; background: var(--d-line);
  }
  /* Las cifras en monoespaciada y en columna: un conteo que se mueve de sitio
     entre filas hay que leerlo; alineado a la derecha en el mismo ancho, se
     compara de un vistazo. Es lo que separa un tablero de una lista. */
  :global([data-d='B']) .tab-n,
  :global([data-d='B']) .side-n,
  :global([data-d='B']) .chip-n,
  :global([data-d='B']) .pager-n,
  :global([data-d='B']) .pg { font-family: var(--d-mono); }
  :global([data-d='B']) .side-n { min-width: 3ch; text-align: right; }
  :global([data-d='B']) .chip-n { min-width: 4ch; justify-content: center; }
  :global([data-d='B']) .pg { min-width: 27px; }
  :global([data-d='B']) .bar-sub { font-family: var(--d-mono); }

  /* ======================================================================
     C · MARCA — la cabecera llena de teal ES el módulo. Lo activo se
     identifica por llevar puesta esa misma cabecera.
     ====================================================================== */
  :global([data-d='C']) .bar {
    background: var(--d-brand); color: var(--d-brand-ink);
    border-bottom: 0; padding: var(--d-p1) var(--d-p3);
  }
  :global([data-d='C']) .bar-sub { color: var(--d-brand-ink); opacity: .8; }
  :global([data-d='C']) .user { color: var(--d-brand-ink); }
  :global([data-d='C']) .user small { color: var(--d-brand-ink); opacity: .7; }
  :global([data-d='C']) .user:hover { background: var(--d-brand-deep); }
  :global([data-d='C']) .ava { background: var(--d-brand-ink); color: var(--d-brand); }
  :global([data-d='C']) .find {
    background: var(--d-brand-deep); color: var(--d-brand-ink);
    border-color: var(--d-brand-deep);
  }
  /* El texto de pista sobre el teal profundo estaba en .62 y caía a 3,9:1.
     A .78 el mismo blanco da 6,4:1 y sigue leyéndose como pista, no como
     valor escrito. Es la falla de contraste que ya apareció tres veces. */
  :global([data-d='C']) .find::placeholder { color: var(--d-brand-ink); opacity: .78; }
  :global([data-d='C']) .bar-do {
    background: var(--d-surface); color: var(--d-brand); border-color: var(--d-surface);
  }
  :global([data-d='C']) .row--tabs {
    padding-bottom: 0;
    border-bottom: 3px solid var(--d-brand);
  }
  /* UBICACIÓN: se pone la cabecera de marca encima. Es la tesis de C llevada
     a la navegación tal cual: un bloque se identifica por llevar el color. */
  :global([data-d='C']) .tab.on,
  :global([data-d='C']) .side-item.on,
  :global([data-d='C']) .crumb-now {
    background: var(--d-brand); color: var(--d-brand-ink);
    border-color: var(--d-brand);
  }
  /* Solo la pestaña se ancla a la regla de marca de abajo; una ficha suelta
     con las esquinas de abajo a escuadra es una pestaña que perdió su borde. */
  :global([data-d='C']) .tab.on { border-radius: var(--d-r) var(--d-r) 0 0; }
  :global([data-d='C']) .side-item.on,
  :global([data-d='C']) .crumb-now { border-radius: var(--d-r); }
  /* SELECCIÓN: el color se dibuja, no se rellena. Once rellenos de marca por
     celda dejan de identificar nada: el color deja de ser estructura y pasa a
     ser fondo. El contorno dice lo mismo y devuelve el relleno a lo que de
     verdad es una cabecera: la barra, las tres de la lateral y la pestaña. */
  :global([data-d='C']) .chip.on,
  :global([data-d='C']) .seg-b.on,
  :global([data-d='C']) .pg.on {
    background: var(--d-surface); color: var(--d-brand);
    border-color: var(--d-brand); font-weight: var(--d-w-semi);
    box-shadow: inset 0 0 0 1px var(--d-brand);
  }
  :global([data-d='C']) .tab.on .tab-n,
  :global([data-d='C']) .side-item.on .side-n { color: var(--d-brand-ink); opacity: .75; }
  :global([data-d='C']) .chip.on .chip-n { color: var(--d-brand); }
  /* Bloqueo de forma: C es 4 y 10px. El avatar era un círculo de 999. */
  :global([data-d='C']) .ava { border-radius: var(--d-r); }
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
  /* El texto a 16px necesita más columna: el aire cuesta ancho. */
  /* Pastillas sueltas y muy separadas: en E una botonera no es una botonera. */

  /* ======================================================================
     F · TERMINAL — pantalla de texto. Prompt en la barra, árbol ASCII en la
     lateral, densidad máxima. Activo = texto invertido con «».
     ====================================================================== */
  /* El árbol: la lateral es un ls -R, no una lista de botones. */

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
  /* La regla doble bajo la fila de pestañas: el tic de la ficha rayada. */

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
  :global([data-d='I']) .user { border-radius: var(--d-r); }
  :global([data-d='I']) .user:hover { background: var(--d-sunk); }
  :global([data-d='I']) .ava { border-radius: var(--d-r); box-shadow: var(--d-shadow); }

  /* BLOQUEO DE FORMA. I declara 18–26px y las piezas venían en pastillas de
     999: una lámina de 24px llena de estadios es la maqueta de un reloj, no
     la de un ERP, y a 30 fichas de filtro las puntas redondas se comen el
     ancho que necesitan las palabras. Todo lo que se toca va al radio chico
     de la escala; la lámina se queda con el grande. */
  :global([data-d='I']) .tab,
  :global([data-d='I']) .side-item,
  :global([data-d='I']) .chip,
  :global([data-d='I']) .seg-b,
  :global([data-d='I']) .pg,
  :global([data-d='I']) .crumb-b { border-radius: var(--d-r); }
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

  /* UBICACIÓN: el vidrio se ESPESA. No cambia de color, que es lo que hace la
     selección, sino de densidad, y se le enciende el filo especular. */
  :global([data-d='I']) .tab.on,
  :global([data-d='I']) .side-item.on {
    background: var(--d-surface);
    color: var(--d-ink);
    font-weight: var(--d-w-semi);
    box-shadow: var(--d-shadow);
  }
  /* SELECCIÓN: el mismo vidrio TEÑIDO del acento. Espesor y tinte son dos
     señales del mismo material, que es lo que permite usarlas para dos cosas
     distintas sin que la lámina parezca de dos direcciones. */
  :global([data-d='I']) .chip.on,
  :global([data-d='I']) .seg-b.on,
  :global([data-d='I']) .pg.on {
    background: var(--d-accent-soft);
    color: var(--d-accent);
    border-color: var(--d-accent-edge);
    font-weight: var(--d-w-semi);
    box-shadow: none;
  }
  :global([data-d='I']) .tab.on .tab-n,
  :global([data-d='I']) .side-item.on .side-n { color: var(--d-ink-2); }
  :global([data-d='I']) .chip.on .chip-n { color: var(--d-accent); }
  :global([data-d='I']) .chip-n {
    padding-inline: var(--d-p1);
    border-radius: var(--d-r);
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
  /* El barrido del panel cubre el 38 % de arriba, que acá es exactamente
     donde viven las pestañas. Se manda detrás de todo: el esmalte lo cargan
     las piezas, una por una, y ninguna queda leyéndose bajo un velo blanco. */

  /* Teclas de esmalte, muy separadas: cada una es una placa entera. */
  /* El realce mojado es una banda corta arriba: si ocupa el tercio de la
     tecla le lava el texto y se pierde el contraste. */

  /* Hundida y apagada: sombra interior, sin realce, y el esmalte del acento
     en el fondo del pozo para que el estado no dependa solo del color. */

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
     algo que se derramó y no como un relleno con las esquinas borrosas.
     UBICACIÓN: la mancha entera, dos lóbulos, se sale por los cuatro lados. */
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
  /* SELECCIÓN: la misma tinta, pero POSADA. Un solo lóbulo bajo, del alto de
     una línea de subrayado, que no rodea la palabra sino que la apoya. En una
     dirección sin contenedores el único grado disponible es cuánto se derrama
     el color, así que ese es el grado que se usa. */
  :global([data-d='M']) .chip.on::before,
  :global([data-d='M']) .seg-b.on::before,
  :global([data-d='M']) .pg.on::before {
    inset: auto calc(-1 * var(--d-p1)) calc(-1 * var(--d-p1)) calc(-1 * var(--d-p1));
    height: var(--d-p2);
    background: radial-gradient(74% 100% at 46% 100%,
      var(--d-accent-soft) 0%, transparent 74%);
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
  /* Las tres cabeceras de la lateral son lo único que TITULA en esta columna,
     así que van en la serif, que es la familia con la que M titula. La regla
     de las dos familias se sostiene: serif lo que nombra, sans lo que se
     opera, y no entra una tercera por una pieza suelta. */
  :global([data-d='M']) .side-cap {
    font-family: var(--d-display);
    font-size: var(--d-t-sm); font-weight: 400;
    color: var(--d-ink);
  }
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
  /* Una botonera acá es UNA pieza de vidrio segmentado, no tres botones.
     Bloqueo de forma: O es 12 y 22px, así que la pieza va al radio grande de
     su escala y no a un estadio de 999. */
  :global([data-d='O']) .seg,
  :global([data-d='O']) .pg-group {
    gap: 0; overflow: hidden;
    background: var(--d-sunk);
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r);
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
  :global([data-d='O']) .chip { border-radius: var(--d-r); background: var(--d-sunk); border-color: var(--d-line); }
  :global([data-d='O']) .ava { border-radius: var(--d-r); }
  :global([data-d='O']) .tabs, :global([data-d='O']) .chips { gap: var(--d-p1); }

  /* UBICACIÓN: el vidrio se tiñe de marca POR DENTRO y le crece el filo de
     marca abajo. Las dos capas juntas, tinte y filo. */
  :global([data-d='O']) .tab.on,
  :global([data-d='O']) .side-item.on,
  :global([data-d='O']) .crumb-now {
    background: linear-gradient(180deg, var(--d-accent-soft), transparent), var(--d-surface);
    color: var(--d-brand-ink);
    font-weight: var(--d-w-semi);
    box-shadow: var(--d-shadow), inset 0 -2px 0 var(--d-brand);
  }
  /* SELECCIÓN: solo el filo, sin tinte. El vidrio se aclara al blanco de la
     lámina y el color de marca se queda en una línea. */
  :global([data-d='O']) .chip.on,
  :global([data-d='O']) .seg-b.on,
  :global([data-d='O']) .pg.on {
    background: var(--d-surface);
    color: var(--d-brand-ink);
    font-weight: var(--d-w-semi);
    box-shadow: inset 0 -2px 0 var(--d-brand);
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

  /* ======================================================================
     T · HALO CLARO. La regla de K, del lado del día.

     Nada tiene borde ni relleno: una pieza existe porque IRRADIA. Lo que
     cambia respecto de K es de qué lado está la luz, y eso tiene una
     consecuencia geométrica, no solo de paleta. K flota en negro y su
     resplandor sale en todas direcciones. Acá la pieza está APOYADA sobre
     papel, así que el halo va hacia abajo, con desplazamiento, como la luz
     de color que un objeto encendido derrama sobre la mesa. Un halo centrado
     sobre blanco no se lee como luz: se lee como una sombra sucia.

     Y contra S, que es la otra clara con sombra teñida: en S la tarjeta es
     una tarjeta y el color de abajo es un dato añadido. Acá el anillo de 1px
     del propio tono ES el contorno. Si le sacás el anillo a T no queda una
     tarjeta sin color, no queda nada.

     El módulo es UNA lámina, no cuatro tarjetas: en una dirección sin bordes,
     cuatro planos flotando a distinto nivel obligan a decidir cuál está
     encima, que es una pregunta que nadie hizo. Las costuras de adentro son
     luz que se apaga en las puntas.

     Activo, en dos grados del mismo gesto:
       UBICACIÓN  anillo del propio tono + halo proyectado hacia abajo
       SELECCIÓN  anillo de acento, sin halo
     Lo que brilla es dónde estás; lo que solo tiene aro es lo que elegiste.
     No hace falta leer una etiqueta para separarlos.

     LOS RADIOS DE RESPLANDOR salen de la escala de espaciado (--d-p1 a
     --d-p4). T no tiene un token de radio de halo y la alternativa era
     escribir «0 9px 24px -13px» a mano en quince reglas.
     ====================================================================== */
  :global([data-d='T']) .shell { box-shadow: var(--d-shadow-lg); }
  :global([data-d='T']) .bar,
  :global([data-d='T']) .row,
  :global([data-d='T']) .side { border: 0; position: relative; }
  /* La costura: una línea que nace y muere en transparente. Es lo único que
     separa dos zonas de la lámina, y no llega a ser un borde en ningún punto. */
  :global([data-d='T']) .bar::after,
  :global([data-d='T']) .row::after {
    content: ''; position: absolute; inset: auto 0 0 0; height: 1px;
    background: linear-gradient(90deg, transparent,
      color-mix(in srgb, var(--d-ink) 14%, transparent), transparent);
    pointer-events: none;
  }
  :global([data-d='T']) .row:last-child::after { content: none; }
  /* La fila de migas trae el estado de la ruta entera: su costura se enciende
     del tono. Es la misma regla del anillo bajada al nivel de la lámina, y es
     lo que hace que «este camino termina en algo vencido» se vea antes de
     leer BAT-014. */
  :global([data-d='T']) .row--crumbs::after {
    background: linear-gradient(90deg, transparent, var(--tone-fg), transparent);
  }
  :global([data-d='T']) .side::after {
    content: ''; position: absolute; inset: auto 0 0 0; height: 1px;
    background: linear-gradient(90deg, transparent,
      color-mix(in srgb, var(--d-ink) 14%, transparent), transparent);
    pointer-events: none;
  }
  @container navmod (min-width: 400px) {
    :global([data-d='T']) .side::after {
      inset: 0 0 0 auto; width: 1px; height: auto;
      background: linear-gradient(180deg, transparent,
        color-mix(in srgb, var(--d-ink) 14%, transparent), transparent);
    }
  }
  :global([data-d='T']) .main { gap: var(--d-p1); padding-block: var(--d-p1); }
  :global([data-d='T']) .row { padding: var(--d-p1) var(--d-p3); }

  /* La identidad tampoco se rellena: aro y resplandor, y las iniciales en el
     acento, que sobre papel da 5,3:1. */
  :global([data-d='T']) .ava {
    background: transparent;
    color: var(--d-accent);
    border-radius: var(--d-r);
    box-shadow:
      0 0 0 1px var(--d-accent-edge),
      0 var(--d-p1) var(--d-p3) calc(-1 * var(--d-p2)) var(--d-accent);
  }
  :global([data-d='T']) .user:hover {
    background: transparent;
    box-shadow: 0 0 0 1px var(--d-neu-edge);
  }

  /* Bloqueo de forma: 12px en todo lo que se toca, 22 en la lámina. Ni un
     estadio; el halo de un rectángulo redondeado se lee como luz, el de un
     estadio se lee como un botón de teléfono. */
  :global([data-d='T']) .tab,
  :global([data-d='T']) .side-item,
  :global([data-d='T']) .chip,
  :global([data-d='T']) .seg-b,
  :global([data-d='T']) .pg,
  :global([data-d='T']) .crumb-b { border-radius: var(--d-r); }
  :global([data-d='T']) .tabs,
  :global([data-d='T']) .seg,
  :global([data-d='T']) .chips,
  :global([data-d='T']) .pg-group { gap: var(--d-p1); }
  /* En reposo, un aro de tinta al 9 %: apagado, pero presente. Es lo que
     permite que encender sea un cambio de intensidad y no una aparición. */
  :global([data-d='T']) .chip,
  :global([data-d='T']) .seg-b,
  :global([data-d='T']) .pg {
    background: transparent; border-color: transparent;
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--d-ink) 9%, transparent);
  }
  :global([data-d='T']) .tab:hover,
  :global([data-d='T']) .side-item:hover,
  :global([data-d='T']) .chip:hover,
  :global([data-d='T']) .seg-b:hover,
  :global([data-d='T']) .pg:hover,
  :global([data-d='T']) .crumb-b:hover {
    background: transparent; color: var(--d-ink);
    box-shadow: 0 0 0 1px var(--d-neu-edge);
  }
  /* La moción hace un trabajo: el halo CRECE. Sin transición, encender y
     apagar es un parpadeo y la luz deja de parecer luz. */
  :global([data-d='T']) .tab,
  :global([data-d='T']) .side-item,
  :global([data-d='T']) .chip,
  :global([data-d='T']) .seg-b,
  :global([data-d='T']) .pg {
    transition: box-shadow 140ms ease, color 140ms ease;
  }

  /* UBICACIÓN: anillo del tono + halo hacia abajo. La miga final es la única
     que lleva tono propio, así que enciende en rojo y las otras dos en
     acento: la misma pieza, el color que le corresponde. */
  :global([data-d='T']) .tab.on,
  :global([data-d='T']) .side-item.on,
  :global([data-d='T']) .crumb-now {
    background: transparent;
    color: var(--tone-fg, var(--d-accent));
    font-weight: var(--d-w-semi);
    box-shadow:
      0 0 0 1px var(--tone-edge, var(--d-accent-edge)),
      0 var(--d-p1) var(--d-p4) calc(-1 * var(--d-p2)) var(--tone-fg, var(--d-accent));
  }
  :global([data-d='T']) .tab.on .tab-n,
  :global([data-d='T']) .side-item.on .side-n { color: inherit; opacity: .78; }
  :global([data-d='T']) .crumb-now { padding-inline: var(--d-p2); }
  /* SELECCIÓN: el mismo anillo, en acento pleno y sin halo. Contra el aro
     apagado del reposo el salto es de tinta al 9 % a color entero. */
  :global([data-d='T']) .chip.on,
  :global([data-d='T']) .seg-b.on,
  :global([data-d='T']) .pg.on {
    background: transparent;
    color: var(--d-accent);
    font-weight: var(--d-w-semi);
    box-shadow: 0 0 0 1px var(--d-accent);
  }
  :global([data-d='T']) .chip.on .chip-n { color: var(--d-accent); opacity: .78; }
  :global([data-d='T']) .pager-n { color: var(--d-ink-3); }

  /* ======================================================================
     W · CRISTAL TEMPLADO. Vidrio donde sirve, opaco donde estorba, halo
     solo donde urge, traído a una barra de navegación.

     EL VIDRIO SE QUEDA EN LA LÁMINA. La barra, las filas y la lateral no
     pintan fondo propio: una sola superficie de vidrio, la de .shell, y
     todo lo demás vive dentro. Es la trampa que I anota y que acá se
     resuelve no cayendo en ella; si cada zona trajera su propio desenfoque
     se estaría desenfocando un campo ya desenfocado y el módulo entero se
     volvería lechoso. Los cortes internos siguen siendo luz, que es lo que
     ya hace --d-line en W: blanco al 70 %, no una línea oscura.

     NADA FLOTA EN ESTA FAMILIA. No hay menú de cuenta, ni desplegable de
     familia, ni globo de ayuda: el botón de cuenta es un botón y las fichas
     son botones. La red de seguridad de directions.css pinta con
     --d-overlay cualquier clase que se llame menu, drop, pop, overlay,
     sheet, dialog o tip, y ninguna clase de esta página contiene esas
     cadenas: se revisaron las sesenta y tres, una por una, y ni el
     .pg-group ni el .pager-n ni el .crumb-row la disparan. El día que la
     barra crezca un menú de cuenta lo agarra la red y sale sólido sin que
     nadie se acuerde de usar el token correcto.

     EL RESPLANDOR NO MARCA UBICACIÓN, Y ESA ES LA DECISIÓN DE ESTA CELDA.
     Hay ocho piezas que pueden estar activas: una pestaña, un ítem de
     lateral, la miga final, tres segmentos, seis fichas y cuatro páginas.
     Si lo activo brillara, brillarían ocho cosas a la vez y ninguna
     urgiría, que es exactamente lo que la dirección prohíbe. Lo activo se
     resuelve con las dos herramientas que W sí tiene, densidad y filo:

       UBICACIÓN  pestaña, ítem de lateral, miga final
                  el vidrio CUAJA. La pieza pasa de translúcida a sólida y
                  gana un filo de 2px en su canto de avance: abajo en la
                  tira de pestañas, a la izquierda en la columna y en la
                  miga. Densidad, que es el gesto de I, llevada al tope.
       SELECCIÓN  ficha, segmento, página
                  el mismo vidrio TEÑIDO de acento, con anillo entero y sin
                  filo. Sigue siendo translúcido: no cuajó.

     Ninguna de las ocho se levanta. Lo único que se despega de la lámina en
     W son los controles opacos que ya trae directions.css, y una pestaña
     activa que además flotara sería una novena capa en una pantalla que
     tiene tres.

     EL HALO. La ruta termina en un equipo vencido, así que el estado es de
     la fila entera y no solo de la última miga: la fila de migas lleva el
     filo del tono, la misma pieza de 3px que la dirección le pone a una
     fila crítica, y no lleva el resplandor que la acompaña ahí. Un filo
     recorre un canto; un resplandor a lo largo de 900px de fila se derrama
     sobre las vecinas y deja de señalar. El halo de esta celda vive en las
     dos píldoras de tono crítico, que es donde directions.css lo puso y
     donde se puede leer la palabra al lado de la luz: la barra dice
     8 vencidos y la ruta dice Vencido. Dos luces, un solo mensaje.
     ====================================================================== */
  /* La lámina, entera y quieta, con la sombra larga de la escala. Sin ella
     el vidrio no tiene de qué despegarse y el desenfoque no se lee. */
  :global([data-d='W']) .shell { box-shadow: var(--d-shadow-lg); }
  /* Bloqueo de forma: 12px en todo lo que se toca, 22 en la lámina. El
     avatar venía en 999 y era la única corrida de esa escala fuera de
     .d-pill, que es semántica y se repite igual en las veinte. */
  :global([data-d='W']) .ava { border-radius: var(--d-r); }

  /* UBICACIÓN. De translúcido a sólido, sin levantarse.
     FALTA UN TOKEN: W tiene --d-surface (vidrio) y --d-overlay (lo que
     flota, y por eso es sólido), y no tiene un vidrio cuajado para una
     pieza que se queda pegada a la lámina. Se toma prestado --d-overlay,
     que es el único blanco opaco de la dirección, y queda anotado: haría
     falta un --d-surface-solid para no cargarle a --d-overlay un segundo
     significado. */
  :global([data-d='W']) .tab.on,
  :global([data-d='W']) .side-item.on,
  :global([data-d='W']) .crumb-now { background: var(--d-overlay); }
  /* El filo va inset, no fuera: así sobrevive al recorte del carril de
     pestañas cuando abajo de 470px se vuelve deslizable. */
  :global([data-d='W']) .tab.on { box-shadow: inset 0 -2px 0 var(--d-accent); }
  :global([data-d='W']) .side-item.on { box-shadow: inset 2px 0 0 var(--d-accent);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }
  /* La miga final es la única pieza de la celda con tono propio, así que su
     filo es el del estado y no el del acento: el mismo gesto, el color que
     le toca. #931C14 sobre blanco da 8,7:1. */
  :global([data-d='W']) .crumb-now {
    padding-inline: var(--d-p2);
    color: var(--tone-fg);
    box-shadow: inset 2px 0 0 var(--tone-fg);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }

  /* SELECCIÓN. Vidrio teñido y anillo entero. Contra la pieza cuajada de
     ubicación el salto es de material antes que de color: una es sólida y
     tiene un canto grueso, la otra deja pasar el fondo y está rodeada. El
     anillo va en acento pleno y no en --d-accent-edge, que al 32 % no
     llegaba a ser una señal: el estado no puede depender del tinte solo. */
  :global([data-d='W']) .chip.on,
  :global([data-d='W']) .seg-b.on,
  :global([data-d='W']) .pg.on {
    background: var(--d-accent-soft);
    color: var(--d-accent);
    border-color: var(--d-accent);
    font-weight: var(--d-w-semi);
  }
  :global([data-d='W']) .pager-n { color: var(--d-ink-2); }

  /* El estado de la ruta, al canto de la fila. */
  :global([data-d='W']) .row--crumbs { box-shadow: inset 3px 0 0 var(--tone-fg);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }

  /* La moción dura lo que dura la de un botón de W en directions.css, y con
     la misma curva. Es el tiempo del cuajado: sin él, cambiar de pestaña es
     un salto de blanco. El apagado NO se hereda del bloque de reducción de
     moción que cierra este archivo, que pesa (0,2,0) contra los (0,3,0) de
     acá, así que se repone abajo con el mismo peso. */
  :global([data-d='W']) .tab,
  :global([data-d='W']) .side-item,
  :global([data-d='W']) .chip,
  :global([data-d='W']) .seg-b,
  :global([data-d='W']) .pg {
    transition:
      background 120ms var(--d-ease, cubic-bezier(.2, .8, .2, 1)),
      box-shadow 120ms ease,
      color 120ms ease;
  }
  @media (prefers-reduced-motion: reduce) {
    :global([data-d='W']) .tab,
    :global([data-d='W']) .side-item,
    :global([data-d='W']) .chip,
    :global([data-d='W']) .seg-b,
    :global([data-d='W']) .pg { transition: none; }
  }

  /* ======================================================================
     W ANGOSTO. El hueco que nadie probó, porque el navegador sin cabeza de
     macOS no baja de 500px de ancho.

     La cuenta a 380px de ventana: la rejilla deja una sola celda, la celda
     descuenta 24px de margen a cada lado, 1px de marco y 20px de aire, y la
     lámina descuenta 1px de canto y 17px de aire. Al contenido de la barra
     le quedan 254px. Adentro tienen que entrar el nombre del módulo, la
     píldora de vencidos, el buscador, Nuevo equipo y la cuenta. La píldora
     ronda los 99px y el botón los 122: no entran ni esos dos con el nombre
     al lado. Así que la retirada está escrita, por pasos y por prioridad.
     ====================================================================== */

  @container navmod (max-width: 469px) {
    /* Primero se va la cuenta. El nombre ya se había ido a los 780px y lo
       que quedaba era un disco con dos iniciales: quien está sentado ahí
       sabe quién es. Se va del todo, no se esconde, así que tampoco queda
       en el árbol de accesibilidad prometiendo algo que no está. */
    :global([data-d='W']) .user { display: none; }

    /* Después, la tira de pestañas deja de envolver y pasa a deslizarse.
       Cinco pestañas repartidas en tres renglones dejan de ser una tira:
       una tira es de una línea, esa es toda su silueta, y tres renglones de
       pestañas son un menú mal dibujado. Deslizándose conserva la forma y
       no esconde nada, porque la activa arranca a la vista y el navegador
       trae a la vista la que recibe el foco. Los 5px de aire son para que
       el anillo de foco no se coma el recorte, y se descuentan con el
       margen para no mover la fila. */
    :global([data-d='W']) .tabs {
      flex-wrap: nowrap;
      overflow-x: auto;
      overscroll-behavior-inline: contain;
      scroll-snap-type: x proximity;
      scrollbar-width: thin;
      padding-block: 5px;
      margin-block: -5px;
    }
    :global([data-d='W']) .tab { scroll-snap-align: start; }
  }

  /* Las fichas de familia NO se deslizan, y las páginas tampoco. Una tira de
     pestañas es una dimensión con orden, primera, segunda, tercera, y por
     eso se recorre. Seis familias son un conjunto sin orden, y esconder la
     mitad de un conjunto detrás de un gesto es esconder la mitad de las
     opciones. Envuelven, que es lo que un conjunto hace. */

  /* EL UMBRAL ESTABA 340px DEMASIADO ABAJO, Y MEDIDO SE VE.

     La línea única se rendía a los 379px de contenedor. Pero la cuenta de
     arriba solo vale a 380px de ventana; el ancho al que la línea deja de
     entrar de verdad es otro. Medido con el viewport fijado por CDP y la
     rejilla de comparación forzada a una columna, el nombre del módulo
     —178px— recibe esto:

       contenedor 332px (rejilla)   116/178  65 %
       contenedor 432px (línea)      58/178  33 %   ← peor que a 380px
       contenedor 512px (línea)      72/178  40 %
       contenedor 652px (línea)     158/178  89 %
       contenedor 720px (línea)     178/178 100 %

     Entre 380 y 719 la barra volvía a una sola línea que NO entra, y como
     .bar-id es el único hijo con flex-shrink, absorbía el faltante entero:
     a 480px de ventana la barra decía «Mante…» y el buscador quedaba como
     una caja vacía de 36px sin sitio ni para el texto de ayuda. La píldora
     de estado y «Nuevo equipo» conservaban su ancho completo, así que lo
     primero que se sacrificaba era el nombre de la pantalla.

     El umbral pasa a 719px, que es donde la línea única entra medida y no
     calculada. Y la cuenta se va con ella: la escalera de retirada ya decía
     que es lo primero que sobra, y en dos renglones no tiene celda propia
     —sin esto, la rejilla se la inventaba en un tercer renglón. */
  @container navmod (max-width: 719px) {
    /* Acá se rinde la línea única, y se rinde de una manera escrita. La
       barra pasa a dos renglones exactos, puestos con rejilla y no dejados
       a que envuelvan solos: identidad y estado arriba, buscador y acción
       abajo. Envolviendo por su cuenta se partía en tres y se comía 120px
       de alto, que es la razón por la que la línea única existe. Puesta a
       mano cuesta 90 y no se mueve más. El orden de tabulador no cambia:
       la rejilla coloca, el marcado sigue mandando en el foco. */
    :global([data-d='W']) .bar {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: var(--d-p1) var(--d-p2);
    }
    :global([data-d='W']) .bar-id { grid-area: 1 / 1; }
    :global([data-d='W']) .bar-flag { grid-area: 1 / 2; justify-self: end; }
    :global([data-d='W']) .bar-find { grid-area: 2 / 1; }
    :global([data-d='W']) .bar-do { grid-area: 2 / 2; }
    :global([data-d='W']) .user { display: none; }
  }

  /* Abajo de 400px la lateral se apila encima del contenido, que es lo que
     ya hace la base. Se queda apilada y vertical: una lista de navegación
     es vertical, y la alternativa de un cajón que se abre por encima es
     justo la capa flotante que esta familia no tiene. El costo está
     aceptado y es real: ocho ítems de 44px por delante de las migas. */

  /* A 560px de ventana la dirección apaga el desenfoque y sube la lámina a
     blanco al 92 %: el vidrio deja de cuajar porque casi no queda vidrio, y
     el filo se queda solo. Entonces engorda, por el mismo motivo por el que
     engorda el filo crítico en directions.css, y con los mismos números. */
  @media (max-width: 560px) {
    :global([data-d='W']) .tab.on { box-shadow: inset 0 -3px 0 var(--d-accent); }
    :global([data-d='W']) .side-item.on { box-shadow: inset 3px 0 0 var(--d-accent);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }
    :global([data-d='W']) .crumb-now { box-shadow: inset 3px 0 0 var(--tone-fg);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }
    :global([data-d='W']) .row--crumbs { box-shadow: inset 5px 0 0 var(--tone-fg);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }
  }

  /* Objetivos táctiles. El tamaño de un dedo no depende del ancho de la
     celda sino del aparato, así que esto va por tipo de puntero y no por
     contenedor. directions.css ya sube los .d-btn de W a --d-touch; lo que
     falta son las tres piezas que esta página escribe a mano y que se
     quedaban en 36px. */
  @media (pointer: coarse) {
    :global([data-d='W']) .crumb-b,
    :global([data-d='W']) .find,
    :global([data-d='W']) .user { min-height: var(--d-touch); }
  }

  @media (prefers-reduced-motion: reduce) {
    .tab, .side-item, .chip, .seg-b, .pg { transition: none; }
  }

  /* ══ W · OBJETIVOS TÁCTILES, POR PUNTERO Y NO POR ANCHO ══════════════════
     El tamaño de un dedo es un hecho del aparato, no del ancho de la ventana.
     directions.css sube los .d-btn de W a --d-touch dentro de
     @media (max-width: 560px), así que una tableta de 768px —que se toca con
     el pulgar igual que un teléfono— se quedaba con los controles de ratón.
     Medido con puntero grueso emulado por CDP a 768px, esta página tenía
     16 objetivos por debajo de 44px. Va por (pointer: coarse) porque ese es
     el hecho que importa; el ancho ya tiene sus propias reglas y hacen otra
     cosa. Con ratón no cambia un pixel. */
  @media (pointer: coarse) {
    :global([data-d='W']) .d-btn,
    :global([data-d='W']) .d-input { min-height: var(--d-touch); }
    /* Segmentos, fichas de familia y paginación son .d-btn--sm: 27px de alto
       con ratón está bien, con pulgar no. Los números de página además caían
       en 32px de ancho. */
    :global([data-d='W']) .pg { min-width: var(--d-touch); }
  }

  /* ══════════════════════════════════════════════════════════════════════
     X · COTA. Papel mate y tinta, y una sola cifra medida en la pantalla.

     ESTA PÁGINA NO ESCRIBE UN SOLO COLOR. Fondos, reglas, tipografía,
     botones, fichas, migas, avatar y el bloque de ubicación salen de los
     siete grises de la dirección: --d-ink, --d-ink-2, --d-ink-3, --d-line,
     --d-edge, --d-sunk y --d-surface. Lo único en color son tres piezas y
     las tres son estado: la píldora de la barra (8 vencidos), la píldora de
     la ruta (Vencido) y la cota de BAT-014, que se pone roja porque pasó su
     tope. Como no compiten contra nada, se encuentran antes de leer.

     EL INDICADOR DE ACTIVO, QUE ES DONDE SE JUEGA ESTA FAMILIA. No puede ser
     color, porque el color ya está ocupado. Sale de tres pesos del mismo
     material, y la escalera se lee sin leer:

       REPOSO      caja dibujada con una línea de --d-ink-3.
       SELECCIÓN   ficha de filtro, segmento, página. LA LÍNEA SE ENDURECE:
                   pasa a tinta y se dobla con un aro interior de 1px. Misma
                   caja, otro peso de lápiz. Es una elección del usuario.
       UBICACIÓN   pestaña, ítem de lateral, miga final. TINTA LLENA: bloque
                   macizo con el texto en papel. Es el único gesto de la
                   pantalla que invierte, y las tres piezas que dicen dónde
                   estás lo comparten, así que la respuesta a «dónde estoy»
                   se ve igual desde tres sitios.

     Y DOS MATERIALES QUE NO SE MEZCLAN: la navegación es texto sobre papel
     (pestañas y lateral no tienen caja), los controles son cajas dibujadas
     (fichas, segmentos, páginas, campo). No es decoración: un sitio al que
     se va y una cosa que se aprieta no son lo mismo y no deberían verse
     igual.

     EL ÚNICO CHOQUE, ANOTADO. El primario de X es negro por definición de la
     dirección («un primario negro es un primario de verdad»), así que
     «Nuevo equipo» y una pestaña activa comparten relleno. Se separan por lo
     demás: el primario tiene borde, canto de 4px, el pelo de sombra de X y
     un verbo; los bloques de ubicación son planos, sin sombra y dicen
     sustantivos. Y el avatar, que también venía relleno de tinta, acá pasa a
     caja dibujada para no gastar un tercer negro en algo que no es ni acción
     ni ubicación.

     FALTA UN TOKEN, y es de contraste: --d-edge (#C4C7C5) da 1,7:1 contra el
     papel y no llega al 3:1 que pide un borde que ES la única señal de que
     algo es un control. Mientras no exista un --d-edge-aa (algo por el
     #949896), esta página dibuja sus cajas con --d-ink-3, que da 5,7:1.
     ══════════════════════════════════════════════════════════════════════ */

  /* ── La hoja y el peso de sus reglas ───────────────────────────────────
     Una sola hoja dividida por reglas de 1px, con dos pesos, y el peso
     significa algo: --d-edge cierra la cabecera y la tira de secciones, que
     es la parte fija del módulo; --d-line divide lo que cambia adentro. Es
     la jerarquía de una boleta impresa, no un adorno. */
  :global([data-d='X']) .bar { border-bottom-color: var(--d-edge); }
  :global([data-d='X']) .bar-mod {
    font-weight: var(--d-w-semi);
    letter-spacing: -.012em;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  /* El subtítulo es un dato, no un epígrafe: caja normal, cifras tabulares. */
  :global([data-d='X']) .bar-sub {
    font-weight: var(--d-w);
    color: var(--d-ink-3);
    font-variant-numeric: var(--d-num);
  }
  /* Bloqueo de forma: X tiene una sola escala de canto, 4 y 6. El avatar
     venía en 999 y relleno de tinta; acá es una caja dibujada con las
     iniciales en tinta, que además libera el relleno para la ubicación. */
  :global([data-d='X']) .ava {
    border-radius: var(--d-r);
    background: transparent;
    color: var(--d-ink);
    border: var(--d-bw) solid var(--d-ink-3);
  }
  :global([data-d='X']) .user:hover { background: var(--d-sunk); }

  /* La tira de secciones se apoya en la regla pesada, como la pestaña de un
     libro de actas: por eso el carril pierde el aire de abajo y la pestaña
     activa lleva las dos esquinas de abajo a escuadra. */
  :global([data-d='X']) .row--tabs {
    padding-bottom: 0;
    border-bottom-color: var(--d-edge);
  }
  :global([data-d='X']) .tab { border-radius: var(--d-r) var(--d-r) 0 0; }

  /* ── UBICACIÓN · tinta llena ───────────────────────────────────────────
     La miga final lleva data-tone crítico y aun así se rellena de tinta y no
     de rojo: lo que esa pieza contesta es «estás en BAT-014», no «BAT-014
     está vencido». El estado de la máquina lo dicen la píldora de al lado y
     la cota de abajo, que es donde el rojo hace un trabajo que ninguna otra
     cosa hace. */
  :global([data-d='X']) .tab.on,
  :global([data-d='X']) .side-item.on,
  :global([data-d='X']) .crumb-now {
    background: var(--d-ink);
    color: var(--d-ink-on);
    font-weight: var(--d-w-semi);
    box-shadow: none;
  }
  :global([data-d='X']) .crumb-now {
    padding-inline: var(--d-p2);
    border-radius: var(--d-r);
  }
  :global([data-d='X']) .tab.on .tab-n,
  :global([data-d='X']) .side-item.on .side-n {
    color: var(--d-ink-on);
    opacity: .75;
  }

  /* ── SELECCIÓN · el filo se endurece ───────────────────────────────────
     Sin relleno y sin sombra: en Cota una ficha de filtro es una casilla
     dibujada en un formulario, no una tecla. El aro interior de 1px sube la
     línea a dos sin mover un pixel de la caja, que es lo que pasaría
     engordando el borde. */
  :global([data-d='X']) .chip,
  :global([data-d='X']) .seg-b,
  :global([data-d='X']) .pg,
  :global([data-d='X']) .find {
    border-color: var(--d-ink-3);
    box-shadow: none;
  }
  :global([data-d='X']) .chip.on,
  :global([data-d='X']) .seg-b.on,
  :global([data-d='X']) .pg.on {
    background: var(--d-surface);
    color: var(--d-ink);
    border-color: var(--d-ink);
    box-shadow: inset 0 0 0 var(--d-bw) var(--d-ink);
    font-weight: var(--d-w-semi);
  }
  :global([data-d='X']) .chip.on:hover,
  :global([data-d='X']) .seg-b.on:hover,
  :global([data-d='X']) .pg.on:hover { background: var(--d-sunk); }

  /* ── Las cifras, que en esta dirección son la mitad del contenido ──────
     Tabulares siempre, y en columna donde hay más de una. Los conteos de la
     lateral y de las fichas se alinean a la derecha con ancho fijo, así que
     14, 22 y 9 se comparan de un vistazo en vez de leerse uno por uno: es
     la diferencia entre una lista y una hoja de inventario.

     LOS CONTEOS DE LAS FICHAS SON SOBRE LA FLOTA COMPLETA, no sobre lo
     filtrado: 14 + 22 + 9 + 18 + 12 + 13 = 88, que es el total que dice la
     paginación. Por eso elegir Batidoras no los mueve. */
  /* PALABRAS PARTIDAS, MEDIDO EN LA CELDA ANGOSTA. La base parte por donde
     sea (overflow-wrap: anywhere) y con la lateral en 155px eso dejaba
     «Planes de mantenimient / o». Se arregla por los dos lados: la columna de
     conteos baja a 2ch, que es lo que de verdad ocupa el número más grande de
     la lateral (88), y le devuelve 7px al texto; y si aun así una palabra no
     entra, se parte con guion en vez de a machetazos. El documento declara
     lang="es", así que la separación es la del idioma. */
  :global([data-d='X']) .side-t,
  :global([data-d='X']) .chip-t {
    overflow-wrap: break-word;
    -webkit-hyphens: auto;
    hyphens: auto;
  }
  :global([data-d='X']) .side-n { min-width: 2ch; text-align: right; }
  :global([data-d='X']) .chip-n {
    min-width: 2ch; text-align: right;
    color: var(--d-ink-3);
  }
  :global([data-d='X']) .chip.on .chip-n { color: var(--d-ink-2); }
  /* Las teclas de página son cuadradas y del mismo ancho: una numeración que
     cambia de tamaño entre el 9 y el 10 se lee dos veces. */
  :global([data-d='X']) .pg { min-width: calc(var(--d-p4) + var(--d-p1)); }
  :global([data-d='X']) .pager-n { color: var(--d-ink-2); }

  /* UNA COLUMNA DE NAVEGACIÓN NO ES UN PORCENTAJE. La base le da el 36 % del
     módulo y en una celda de 1000px eso son 385px, con «Flota» pegado a la
     izquierda y su 88 a cuarenta caracteres de distancia: el ojo hace el
     viaje una vez por fila. Una columna de etiquetas mide lo que mide su
     etiqueta más larga, así que acá se congela en 30ch, que es «Planes de
     mantenimiento» más su conteo y sus aires. Debajo de 603px de contenedor
     el 36 % es lo más chico de los dos y manda el porcentaje, así que en
     angosto no cambia nada.
     FALTA UN TOKEN: no hay un ancho de columna de navegación. --d-rail son
     148px y es otra cosa (el canal de etiquetas de G y P), y ahí «Planes de
     mantenimiento» no entra. */
  @container navmod (min-width: 400px) {
    :global([data-d='X']) .body {
      grid-template-columns: minmax(0, min(36%, 30ch)) minmax(0, 1fr);
    }
  }

  /* Cabecera de grupo de la lateral: encabezado, no epígrafe. Caja normal
     (X ya trae --d-label-case: none) sobre una regla que cierra la columna,
     como la cabecera de una columna de un parte de bodega. */
  :global([data-d='X']) .side-cap {
    font-size: var(--d-t-xs);
    font-weight: var(--d-w-semi);
    letter-spacing: 0;
    color: var(--d-ink-2);
    padding: 0 var(--d-p1) var(--d-p1);
    border-bottom: var(--d-bw) solid var(--d-line);
    margin-bottom: var(--d-p1);
  }

  /* ── Epígrafes: uno, en siete secciones ────────────────────────────────
     La celda trae nueve etiquetas de sección y en X sobran ocho por el mismo
     motivo que en las otras finalistas: unas pestañas se leen como pestañas y
     un rastro se lee como un rastro. Queda «Agrupar por», porque Familia /
     Categoría / Ubicación sin etiqueta puede ser un filtro o una agrupación y
     la diferencia cambia lo que el técnico cree estar viendo. Las tres de la
     lateral no cuentan: son encabezados de grupo de navegación, no epígrafes,
     y el subtítulo de la barra es un dato.
     Ninguna es una versalita, porque X trae --d-label-case: none y el ritmo
     de mayúsculas pequeñas repetido bloque a bloque es justo lo que delata
     una pantalla generada.
     Se ocultan a la vista y no del marcado: la de las fichas es el
     aria-labelledby de su grupo, y G y P las usan como raíl. */
  :global([data-d='X']) .cap-mute {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap;
  }

  /* ── LA COTA DE LA RUTA ────────────────────────────────────────────────
     Va acá y en ningún otro sitio de la página, porque acá y en ningún otro
     sitio hay una medida contra un tope. El rastro termina en BAT-014, y una
     máquina en Cota es una lectura corriendo hacia su plan: 312 h con la
     marca de las 250 h atrás. La fila ya trae data-tone crítico por esa
     misma razón, así que la firma del sistema y el estado de la ruta son el
     mismo hecho dicho una vez.

     DÓNDE NO VA, QUE ES LA MITAD DE LA REGLA:
       · Paginación. «1 a 24 de 88» es una posición en un conjunto, no una
         medida contra un tope: la marca caería en el final y no se podría
         cruzar nunca. Eso ya no es una cota, es una barra de progreso, y una
         barra de progreso decorativa es ruido.
       · Conteos de familia, de pestañas y de lateral. Son cuentas de
         registros, no cantidades medidas. 22 hornos no van hacia ningún
         tope.
     La regla dice que ninguna cifra MEDIDA aparece sola. Un conteo no es una
     medida, y confundirlos llenaría la pantalla de rieles falsos.

     La primitiva se usa tal cual sale de directions.css, sin retocarle
     cuerpo, canto ni color: es la firma del sistema y tiene que verse igual
     acá que en la tabla de equipos. Esta página solo la coloca. */
  :global([data-d='X']) .cota-here {
    margin-top: var(--d-p2);
    max-width: min(100%, 34ch);
  }
  :global([data-d='X']) .cota-plan {
    margin: 0 0 var(--d-p1);
    font-size: var(--d-t-xs);
    font-weight: var(--d-w-med);
    color: var(--d-ink-2);
  }

  /* ══ X · ANGOSTO, DECLARADO Y NO SUPUESTO ═══════════════════════════════
     LA BARRA ES UNA LÍNEA SIEMPRE, y son 51px: 36 de control más 7 de aire
     arriba y abajo más la regla. Con puntero grueso los controles suben a 44
     y la barra queda en 59. Nunca llega a los 80, y nunca se parte en dos:
     una barra que envuelve se come 120px de la pantalla que el técnico
     necesita para la lista, así que lo que no entra se RETIRA, por prioridad
     y por pasos medidos.

     LA CUENTA A 380px DE VENTANA. La rejilla deja una sola columna, la celda
     descuenta 24px de margen a cada lado (332), el marco del escenario 1px y
     su aire 20px a cada lado (290), y la hoja 1px de canto (288) y 15px de
     aire a cada lado. A la barra le quedan 258px de contenido. Adentro
     tienen que entrar el nombre del módulo (165), la píldora de vencidos
     (96), el buscador (110 para ser un buscador), «Nuevo equipo» (114), la
     cuenta (40) y cuatro separaciones de 11. Son 569 contra 258.

     EL ORDEN DE RETIRADA, escrito como decisión de producto:
       1 · la cuenta, bajo 600px de celda. Quien tiene el teléfono en la mano
           sabe quién es. Se va con display:none, así que tampoco queda en el
           árbol de accesibilidad prometiendo algo que no está.
       2 · «Nuevo equipo», bajo 500px. Dar de alta una máquina es una tarea
           de escritorio; entre eso y el buscador, el patio necesita el
           buscador. Vuelve entero a partir de 500.
       3 · el nombre del módulo, bajo 370px, que es el ancho al que su
           columna caería por debajo de 110px y quedaría en «Mante…». Un
           título truncado a tres sílabas no orienta a nadie, y abajo la tira
           de secciones y el rastro dicen los dos «Flota».
     Lo que NUNCA se retira es la píldora de vencidos, que es el único dato
     de la barra que cambia solo y obliga a actuar, y el buscador, que a
     380px se queda con 151px y es la manera de llegar a la máquina que se
     tiene enfrente.

     QUÉ SE VERIFICÓ CON LOS OJOS Y QUÉ CON LA CUENTA, para que el que venga
     detrás no crea que está todo mirado. Chrome sin cabeza en macOS no abre
     una ventana de menos de unos 500px, así que los pasos de 600, 500 y 470
     se vieron renderizados (celda de 415 y de 430: barra en una línea, sin
     cuenta y sin «Nuevo equipo», pestañas en dos renglones apoyadas en su
     propio aire). El paso de 370 y el apilado de la lateral por debajo de
     400 están calculados, no fotografiados. Si algún día hay un navegador
     que baje de ahí, ese es el primer sitio para mirar.
     ══════════════════════════════════════════════════════════════════════ */
  @container navmod (max-width: 599px) {
    :global([data-d='X']) .user { display: none; }
  }
  @container navmod (max-width: 499px) {
    :global([data-d='X']) .bar-do { display: none; }
  }
  @container navmod (max-width: 369px) {
    :global([data-d='X']) .bar-id { display: none; }
    :global([data-d='X']) .bar-find { flex: 1 1 auto; }
  }

  /* LAS PESTAÑAS ENVUELVEN, NO SE DESLIZAN. Las cinco suman 442px y a 380px
     de ventana tienen 258, así que caen en dos renglones y la fila pasa de
     49px a 94. Se paga y se dice por qué: un conjunto de cinco secciones que
     se desliza esconde tres, y esconder secciones a alguien que está
     buscando una sección es el peor negocio de la pantalla. Cuando envuelven
     dejan de apoyarse en la regla pesada, así que el carril recupera su aire
     de abajo y la pestaña activa recupera sus cuatro cantos: un bloque de
     tinta flotando a media altura sobre una regla se lee como un error. */
  @container navmod (max-width: 469px) {
    :global([data-d='X']) .row--tabs { padding-bottom: var(--d-p2); }
    :global([data-d='X']) .tab { border-radius: var(--d-r); }
  }

  /* Bajo 400px la lateral se apila sobre el contenido, que es lo que ya hace
     la base, y se queda vertical. El costo está aceptado y es real: ocho
     ítems por delante del rastro y de la cota. La alternativa sería un cajón
     que se abre por encima, y eso son marcado y estado compartidos con otras
     diecinueve direcciones, no una decisión de esta página. La cota, que es
     lo que el técnico vino a ver, entra completa en 258px: cifra de 25px,
     riel a todo el ancho y la nota en una línea. */

  /* Objetivos táctiles. El tamaño de un dedo es del aparato y no del ancho,
     así que va por puntero. directions.css ya sube .d-btn y .d-input de X a
     --d-touch; lo que falta son las tres piezas que esta página dibuja a
     mano, que se quedaban en 38px, y el ancho de las teclas de página. */
  @media (pointer: coarse) {
    :global([data-d='X']) .tab,
    :global([data-d='X']) .side-item,
    :global([data-d='X']) .crumb-b,
    :global([data-d='X']) .user { min-height: var(--d-touch); }
    :global([data-d='X']) .pg { min-width: var(--d-touch); }
  }

  /* Piso de artesanía. En colores forzados el relleno de tinta desaparece,
     así que la ubicación pasa a la pareja del sistema para «esto es lo
     seleccionado» y la selección se queda con su línea doble, ahora dibujada
     con un aro interior que el modo sí respeta. */
  @media (forced-colors: active) {
    :global([data-d='X']) .tab.on,
    :global([data-d='X']) .side-item.on,
    :global([data-d='X']) .crumb-now {
      background: Highlight;
      color: HighlightText;
    }
    :global([data-d='X']) .tab.on .tab-n,
    :global([data-d='X']) .side-item.on .side-n {
      color: HighlightText;
      opacity: 1;
    }
    :global([data-d='X']) .chip.on,
    :global([data-d='X']) .seg-b.on,
    :global([data-d='X']) .pg.on {
      outline: 2px solid CanvasText;
      outline-offset: -3px;
    }
  }
</style>
