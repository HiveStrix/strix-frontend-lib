<script>
  // TABLAS Y LISTAS · la familia más dura de las ocho.
  //
  // Una tabla es donde una dirección se rompe o se sostiene: 4 filas, 8 columnas,
  // nombres largos de verdad ("Compactadora Wacker DPU-6555"), un estado que no
  // puede depender del color, y acciones que aparecen al pasar el cursor pero que
  // el teclado nunca pierde. Se muestran tres especímenes por dirección: la tabla
  // con su cabecera ordenada y su pie paginado, la misma información sin tabla, y
  // el estado vacío dentro del mismo contenedor.
  import { ASSETS, COPY, markOf } from '../demo.js';
  import Grid from '../Grid.svelte';
  import Direction from '../Direction.svelte';

  export let directions = [];

  // Estado compartido por las ocho celdas: ordenar en una ordena en todas, que es
  // exactamente lo que hace falta para compararlas.
  let sortKey = 'tone';
  let sortDir = 'asc';
  let page = 1;
  let picked = new Set(['BAT-014']);

  // Nada de "const helper = …" leído desde un $:. Todo lo que depende de estado
  // reactivo se escribe entero dentro de la sentencia reactiva.
  $: sorted = ASSETS.slice().sort((x, y) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const rank = (t) =>
      t === 'critical' ? 0 : t === 'attention' ? 1 : t === 'neutral' ? 2 : t === 'info' ? 3 : 4;
    if (sortKey === 'tone') {
      return dir * ((rank(x.tone) - rank(y.tone)) || x.code.localeCompare(y.code, 'es'));
    }
    return dir * String(x[sortKey]).localeCompare(String(y[sortKey]), 'es', { numeric: true });
  });
  $: pageCount = Math.max(1, Math.ceil(sorted.length / 4));
  $: pageList = Array.from({ length: Math.max(1, Math.ceil(sorted.length / 4)) }, (_, i) => i + 1);
  $: rows = sorted.slice((page - 1) * 4, (page - 1) * 4 + 4);
  $: from = rows.length ? (page - 1) * 4 + 1 : 0;
  $: to = (page - 1) * 4 + rows.length;
  $: allOn = rows.length > 0 && rows.every((r) => picked.has(r.code));
  $: someOn = rows.some((r) => picked.has(r.code)) && !(rows.length > 0 && rows.every((r) => picked.has(r.code)));
  $: pickedCount = ASSETS.filter((a) => picked.has(a.code)).length;

  function sortBy(k) {
    if (sortKey === k) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    else {
      sortKey = k;
      sortDir = 'asc';
    }
    page = 1;
  }
  function togglePick(code) {
    if (picked.has(code)) picked.delete(code);
    else picked.add(code);
    picked = picked;
  }
  function toggleAll() {
    const off = rows.every((r) => picked.has(r.code));
    rows.forEach((r) => (off ? picked.delete(r.code) : picked.add(r.code)));
    picked = picked;
  }
  function go(n) {
    page = Math.min(pageCount, Math.max(1, n));
  }
</script>

<!-- Una tabla real de seis columnas más selección y acciones no cabe en media
     pantalla sin recortarse, y una tabla recortada no se puede juzgar. Una
     dirección por fila, a todo el ancho: la comparación se hace bajando. -->
<Grid min="820px">
  {#each directions as d (d.id)}
    <!-- G y P son las dos direcciones sin caja: sus franjas van a sangre, así
         que la celda no las mete adentro de un marco con aire. -->
    <Direction id={d.id} flush={d.id === 'G' || d.id === 'P'}>
      <div class="stack">
        <!-- ────────── 1 · LA TABLA ────────── -->
        <section class="spec">
          <h4 class="speclabel">Tabla de equipos</h4>

          <div class="d-panel tablepanel">
            <div class="d-panel-head">
              <h5 class="d-panel-title">Equipos</h5>
              <span class="headnote"><span class="hnum figs">88</span> en la flota</span>
            </div>

            <div class="tblwrap">
              <table class="tbl">
                <caption class="d-sr">
                  Equipos de la flota, ordenados por {sortKey === 'tone'
                    ? 'estado'
                    : sortKey === 'code'
                      ? 'código'
                      : sortKey === 'name'
                        ? 'equipo'
                        : sortKey === 'family'
                          ? 'familia'
                          : 'ubicación'}
                  {sortDir === 'asc' ? 'de forma ascendente' : 'de forma descendente'}. Página {page} de {pageCount}.
                </caption>
                <thead>
                  <tr>
                    <th class="c-sel" scope="col">
                      <input
                        class="pick"
                        type="checkbox"
                        id="all-{d.id}"
                        checked={allOn}
                        indeterminate={someOn}
                        aria-checked={allOn ? 'true' : someOn ? 'mixed' : 'false'}
                        on:change={toggleAll} />
                      <label class="d-sr" for="all-{d.id}">Seleccionar los {rows.length} equipos de esta página</label>
                    </th>

                    <th
                      class="c-code"
                      scope="col"
                      aria-sort={sortKey === 'code' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                      <button class="sortbtn hcap" type="button" on:click={() => sortBy('code')}>
                        Código<span class="sortmark" class:live={sortKey === 'code'} data-dir={sortDir} aria-hidden="true"></span>
                      </button>
                    </th>

                    <th
                      class="c-name"
                      scope="col"
                      aria-sort={sortKey === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                      <button class="sortbtn hcap" type="button" on:click={() => sortBy('name')}>
                        Equipo<span class="sortmark" class:live={sortKey === 'name'} data-dir={sortDir} aria-hidden="true"></span>
                      </button>
                    </th>

                    <th
                      class="c-fam"
                      scope="col"
                      aria-sort={sortKey === 'family' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                      <button class="sortbtn hcap" type="button" on:click={() => sortBy('family')}>
                        Familia<span class="sortmark" class:live={sortKey === 'family'} data-dir={sortDir} aria-hidden="true"></span>
                      </button>
                    </th>

                    <th
                      class="c-loc"
                      scope="col"
                      aria-sort={sortKey === 'location' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                      <button class="sortbtn hcap" type="button" on:click={() => sortBy('location')}>
                        Ubicación<span class="sortmark" class:live={sortKey === 'location'} data-dir={sortDir} aria-hidden="true"></span>
                      </button>
                    </th>

                    <th class="c-read" scope="col"><span class="hcap">Última lectura</span></th>

                    <th
                      class="c-state"
                      scope="col"
                      aria-sort={sortKey === 'tone' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                      <button class="sortbtn hcap" type="button" on:click={() => sortBy('tone')}>
                        Estado<span class="sortmark" class:live={sortKey === 'tone'} data-dir={sortDir} aria-hidden="true"></span>
                      </button>
                    </th>

                    <th class="c-act" scope="col"><span class="d-sr">Acciones</span></th>
                  </tr>
                </thead>

                <tbody>
                  {#each rows as a, i (a.code)}
                    <tr
                      class="trow"
                      data-tone={a.tone}
                      class:on={picked.has(a.code)}
                      class:is-hover={i === 2}
                      class:alert={a.tone === 'critical'}>
                      <td class="c-sel">
                        <input
                          class="pick"
                          type="checkbox"
                          id="pick-{d.id}-{a.code}"
                          checked={picked.has(a.code)}
                          on:change={() => togglePick(a.code)} />
                        <label class="d-sr" for="pick-{d.id}-{a.code}">Seleccionar {a.code} · {a.name}</label>
                      </td>

                      <td class="c-code">
                        <span class="cursor" aria-hidden="true"></span><span class="d-id d-num">{a.code}</span>
                      </td>

                      <td class="c-name">
                        <span class="nm">{a.name}</span>
                        <span class="sub">{a.family} · {a.location} · {a.reading}</span>
                      </td>

                      <td class="c-fam">{a.family}</td>
                      <td class="c-loc">{a.location}</td>
                      <td class="c-read figs">{a.reading}</td>

                      <!-- «Vencido» no dice cuánto. En las filas que urgen el
                           retraso viaja pegado a la píldora: es el dato que
                           decide si el técnico va hoy o el lunes, y hasta ahora
                           había que abrir el equipo para verlo. -->
                      <td class="c-state">
                        <span class="d-pill">
                          <svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf(a.tone)}</svg>
                          {a.state}
                        </span>
                        {#if a.tone === 'critical'}<span class="due figs">{a.due}</span>{/if}
                      </td>

                      <td class="c-act">
                        <span class="acts d-btn-group">
                          <button class="d-btn d-btn--sm d-btn--ghost" type="button" aria-label="Registrar lectura de {a.code}">Lectura</button>
                          <button class="d-btn d-btn--sm d-btn--ghost" type="button" aria-label="Ver el plan de {a.code}: {a.plan}">Plan</button>
                        </span>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>

            <div class="d-panel-foot foot">
              <p class="fcount">
                <span class="figs">{from} a {to}</span> de <span class="figs">{sorted.length}</span> equipos
                · <span class="figs">{pickedCount}</span> seleccionado{pickedCount === 1 ? '' : 's'}
              </p>
              <nav class="pager" aria-label="Páginas de equipos · dirección {d.name}">
                <button class="d-btn d-btn--sm" type="button" disabled={page === 1} on:click={() => go(page - 1)}>Anterior</button>
                {#each pageList as n}
                  <button
                    class="d-btn d-btn--sm pnum"
                    class:d-btn--primary={n === page}
                    type="button"
                    aria-current={n === page ? 'page' : undefined}
                    aria-label="Página {n} de {pageCount}"
                    on:click={() => go(n)}>{n}</button>
                {/each}
                <button class="d-btn d-btn--sm" type="button" disabled={page === pageCount} on:click={() => go(page + 1)}>Siguiente</button>
              </nav>
            </div>
          </div>

          <p class="note">
            Fila 1: vencida y seleccionada a la vez, y el estado se sigue leyendo por debajo de la selección. Fila 3:
            cursor encima, fijo para poder verlo. Las acciones aparecen al pasar el cursor y nunca salen del orden del
            tabulador.
          </p>
        </section>

        <!-- ────────── 2 · LA MISMA INFORMACIÓN SIN TABLA ────────── -->
        <section class="spec">
          <h4 class="speclabel">La misma información sin tabla</h4>

          <div class="d-panel clistpanel">
            <div class="d-panel-head">
              <h5 class="d-panel-title">Lista compacta</h5>
              <span class="headnote"><span class="hnum figs">6</span> equipos</span>
            </div>
            <ul class="clist">
              {#each sorted as a (a.code)}
                <li class="citem d-rail" data-tone={a.tone} class:on={picked.has(a.code)} class:alert={a.tone === 'critical'}>
                  <span class="cicode d-id figs">{a.code}</span>
                  <div class="cibody">
                    <span class="cinm">{a.name}</span>
                    <span class="cimeta">{a.family} · {a.location}</span>
                    <span class="ciread figs">{a.reading}</span>
                    <span class="d-pill">
                      <svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf(a.tone)}</svg>
                      {a.state}
                    </span>
                    {#if a.tone === 'critical'}<span class="due figs">{a.due}</span>{/if}
                    <span class="ciact d-btn-group">
                      <button class="d-btn d-btn--sm d-btn--ghost" type="button" aria-label="Registrar lectura de {a.code}">Lectura</button>
                    </span>
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        </section>

        <!-- ────────── 3 · EL MISMO CONTENEDOR, VACÍO ────────── -->
        <section class="spec">
          <h4 class="speclabel">Estado vacío</h4>

          <div class="d-panel emptypanel">
            <div class="d-panel-head">
              <h5 class="d-panel-title">Equipos</h5>
              <span class="headnote">ninguno cargado</span>
            </div>
            <div class="d-panel-body empty">
              <p class="etitle">{COPY.emptyTitle}</p>
              <p class="ebody">{COPY.emptyBody}</p>
              <span class="eacts d-btn-group">
                <button class="d-btn d-btn--primary" type="button">Agregar equipo</button>
                <button class="d-btn" type="button">Subir salida en PDF</button>
              </span>
            </div>
            <div class="d-panel-foot foot">
              <p class="fcount"><span class="figs">0</span> de <span class="figs">0</span> equipos</p>
              <nav class="pager" aria-label="Páginas del listado vacío · dirección {d.name}">
                <button class="d-btn d-btn--sm" type="button" disabled>Anterior</button>
                <button class="d-btn d-btn--sm" type="button" disabled>Siguiente</button>
              </nav>
            </div>
          </div>
        </section>
      </div>
    </Direction>
  {/each}
</Grid>

<style>
  /* ==========================================================================
     BASE — escrita sólo contra los tokens --d-*. Ningún color, radio, sombra ni
     densidad se decide aquí: se leen de la dirección activa.
     ========================================================================== */
  .stack {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--d-gap);
    min-width: 0;
  }
  .spec {
    container-type: inline-size;
    container-name: spec;
    min-width: 0;
  }
  /* El nombre de cada espécimen es un ENCABEZADO, no una versalita. Era el peor
     error de jerarquía de la página: tres rótulos chiquitos, grises y en caja
     alta anunciando las tres piezas que hay que mirar. Un encabezado en tinta se
     ve de lejos y no le pide nada al lector. */
  .speclabel {
    margin: 0 0 var(--d-p1);
    font-size: var(--d-t-md);
    font-weight: var(--d-w-semi);
    letter-spacing: -.012em;
    color: var(--d-ink);
  }
  .note {
    margin: var(--d-p1) 0 0;
    font-size: var(--d-t-xs);
    line-height: 1.45;
    color: var(--d-ink-3);
  }
  /* La nota de cabecera es un conteo, no un rótulo: manda la cifra y la palabra
     la acompaña. */
  .headnote { white-space: nowrap; font-size: var(--d-t-xs); color: var(--d-ink-3); }
  .hnum { font-weight: var(--d-w-semi); color: var(--d-ink-2); }
  /* Cifras. Numeración tabular en las diecinueve; la monoespaciada la agregan
     sólo las direcciones que la ganan por densidad, mucho más abajo. */
  .figs { font-variant-numeric: var(--d-num); }

  /* ── Tabla ─────────────────────────────────────────────────────────────── */
  .tblwrap { overflow-x: auto; overscroll-behavior-x: contain; }
  .tbl {
    width: 100%;
    min-width: 620px;
    border-collapse: separate;
    border-spacing: 0;
    font-size: var(--d-t-sm);
    font-weight: var(--d-w);
  }
  .tbl th, .tbl td {
    text-align: left;
    white-space: nowrap;
    padding: 0 var(--d-p2);
    height: var(--d-row-h);
    vertical-align: middle;
  }
  .tbl thead th {
    height: auto;
    padding-block: var(--d-p1);
    background: var(--d-sunk);
    border-bottom: max(var(--d-bw), 1px) solid var(--d-line);
  }
  .tbl tbody td { border-bottom: max(var(--d-bw), 1px) solid var(--d-line); color: var(--d-ink-2); }
  .tbl tbody tr:last-child td { border-bottom: 0; }
  .tbl tbody td.c-code, .tbl tbody td.c-name { color: var(--d-ink); }
  .c-sel { width: 1%; position: relative; }
  .c-code { width: 1%; }
  .c-name { min-width: 200px; font-weight: var(--d-w-med); }
  .c-act { width: 1%; text-align: right; }
  .nm { display: block; }
  .sub { display: none; white-space: normal; font-size: var(--d-t-2xs); color: var(--d-ink-3); font-weight: var(--d-w); }
  .cursor::before { content: ''; }
  .mk { flex: none; width: 9px; height: 9px; }
  /* El retraso, sólo donde hay retraso. Toma el color del tono de la fila, pero
     lo que lo hace legible es que es un número: no hay que interpretar nada. */
  .due {
    margin-left: var(--d-p1);
    font-size: var(--d-t-xs);
    font-weight: var(--d-w-semi);
    font-variant-numeric: var(--d-num);
    color: var(--tone-fg);
  }

  /* Cabecera: la misma tipografía de etiqueta que usa la dirección. */
  .hcap {
    font-family: inherit;
    font-size: var(--d-label-size);
    font-weight: var(--d-label-weight);
    letter-spacing: var(--d-label-track);
    text-transform: var(--d-label-case);
    color: var(--d-label-color);
    line-height: 1.4;
  }
  .sortbtn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0;
    margin: 0;
    background: none;
    border: 0;
    cursor: pointer;
    white-space: nowrap;
  }
  .sortbtn:hover { color: var(--d-ink); }
  .sortmark { visibility: hidden; color: currentColor; }
  .sortmark::before { content: '↑'; }
  .sortmark[data-dir='desc']::before { content: '↓'; }
  .sortbtn:hover .sortmark { visibility: visible; opacity: .45; }
  .sortmark.live { visibility: visible; opacity: 1; }

  /* Selección: casilla real, dibujada con los tokens de la dirección. */
  .pick {
    --pick: 15px;
    position: relative;
    appearance: none;
    -webkit-appearance: none;
    display: inline-block;
    vertical-align: middle;
    width: var(--pick);
    height: var(--pick);
    margin: 0;
    flex: none;
    background: var(--d-surface);
    color: var(--d-accent-ink);
    border: max(var(--d-bw), 1px) solid var(--d-edge);
    border-radius: min(var(--d-r), 4px);
    cursor: pointer;
  }
  .pick:checked, .pick:indeterminate { background: var(--d-accent); border-color: var(--d-accent-edge); }
  .pick:checked::after {
    content: '';
    position: absolute;
    left: 50%; top: 45%;
    width: 4px; height: 8px;
    border: solid currentColor;
    border-width: 0 2px 2px 0;
    transform: translate(-50%, -50%) rotate(42deg);
  }
  .pick:indeterminate::after {
    content: '';
    position: absolute;
    left: 50%; top: 50%;
    width: 7px; height: 2px;
    background: currentColor;
    transform: translate(-50%, -50%);
  }
  /* Área de clic del alto de la fila, sin invadir la de arriba ni la de abajo. */
  .pick::before {
    content: '';
    position: absolute;
    left: -10px; right: -10px; top: 50%;
    height: var(--d-row-h);
    transform: translateY(-50%);
  }

  /* Estados de fila. Orden: atención → cursor encima → seleccionada. */
  .tbl tbody tr.alert td { background: var(--tone-band); }
  .tbl tbody tr:hover td, .tbl tbody tr.is-hover td { background: var(--d-sunk); }
  .tbl tbody tr.on td { background: var(--d-accent-soft); }
  .tbl tbody tr.on td.c-sel { box-shadow: inset 3px 0 0 var(--d-accent); }
  .tbl tbody tr.on td.c-code { font-weight: var(--d-w-semi); }

  /* Acciones por fila: invisibles en reposo, presentes siempre para el teclado. */
  .acts { opacity: 0; transition: opacity 120ms ease; }
  .tbl tbody tr:hover .acts,
  .tbl tbody tr.is-hover .acts,
  .tbl tbody tr:focus-within .acts,
  .tbl tbody tr.on .acts { opacity: 1; }
  @media (hover: none) { .acts { opacity: 1; } }

  /* ── Pie: conteo + paginación ──────────────────────────────────────────── */
  .foot {
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--d-p2);
  }
  .fcount { margin: 0; min-width: 0; font-size: var(--d-t-xs); color: var(--d-ink-2); }
  .pager { display: flex; align-items: center; gap: var(--d-p1); flex-wrap: wrap; }
  .pnum { padding-inline: var(--d-p2); }

  /* ── Lista compacta ────────────────────────────────────────────────────── */
  .clist { list-style: none; margin: 0; padding: 0; display: grid; gap: 0; }
  .citem {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 3px;
    align-items: start;
    padding: var(--d-p2) var(--d-p3);
    min-width: 0;
  }
  /* El código es lo primero que busca un técnico con la máquina enfrente. Estaba
     en versalitas grises, o sea: escondido. Ahora es tinta llena, tabular y en
     la mono de --d-id, que es donde un identificador se lee sin dudar. */
  .cicode {
    display: block;
    font-size: var(--d-t-xs);
    font-weight: var(--d-w-semi);
    color: var(--d-ink);
  }
  .cibody { display: flex; flex-wrap: wrap; align-items: center; gap: 4px var(--d-p2); min-width: 0; }
  /* El nombre se lleva su renglón entero; el resto de los campos y la acción
     comparten el siguiente, con la acción empujada al canto derecho. */
  .cinm { flex-basis: 100%; font-size: var(--d-t-sm); font-weight: var(--d-w-semi); color: var(--d-ink); }
  .cimeta { font-size: var(--d-t-xs); color: var(--d-ink-3); }
  .ciread { font-size: var(--d-t-xs); color: var(--d-ink-2); }
  .ciact { margin-left: auto; }
  .citem.alert { background: var(--tone-band); }
  .citem.on { background: var(--d-accent-soft); }

  /* ── Estado vacío ──────────────────────────────────────────────────────── */
  .empty { display: flex; flex-direction: column; align-items: flex-start; gap: var(--d-p2); }
  .etitle { margin: 0; font-size: var(--d-t-lg); font-weight: var(--d-w-semi); color: var(--d-ink); letter-spacing: -.01em; }
  .ebody { margin: 0; font-size: var(--d-t-sm); color: var(--d-ink-2); line-height: 1.5; max-width: 46ch; }
  .eacts { flex-wrap: wrap; }

  /* ==========================================================================
     VARIACIONES POR DIRECCIÓN.
     El atributo [data-d] vive en Direction.svelte, otro componente, así que cada
     una tiene que envolverse en :global(...) o no coincide con nada.
     ========================================================================== */

  /* ── A · ELEVACIÓN — la tabla flota; la lista se disuelve en tarjetas ──── */
  :global([data-d='A']) .tablepanel,
  :global([data-d='A']) .emptypanel { box-shadow: var(--d-shadow-lg); overflow: hidden; }
  :global([data-d='A']) .clistpanel { background: transparent; border-color: transparent; box-shadow: none; }
  :global([data-d='A']) .clistpanel .d-panel-head { border-bottom: 0; padding-inline: 0; }
  :global([data-d='A']) .clist { gap: var(--d-p1); padding-bottom: var(--d-p1); }
  :global([data-d='A']) .citem {
    background: var(--d-surface);
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r);
    box-shadow: var(--d-shadow);
    transition: box-shadow 140ms ease;
  }
  /* El salto de 1px al pasar el cursor se fue. En una lista de seis renglones que
     alguien recorre buscando un código, mover la fila bajo el ojo cuesta más
     lectura de la que devuelve; la sombra sola dice lo mismo y no desalinea
     nada. La moción se queda donde hace trabajo: en las acciones que aparecen. */
  :global([data-d='A']) .citem:hover { box-shadow: var(--d-shadow-lg); }
  /* La cabecera de la tabla no se va con el scroll horizontal ni con el vertical
     de la página: en Elevación la losa es una sola pieza y su cabecera es parte
     de la losa. */
  :global([data-d='A']) .tbl thead th { box-shadow: inset 0 -1px 0 var(--d-edge); border-bottom-color: transparent; }
  :global([data-d='A']) .tbl thead th[aria-sort]:not([aria-sort='none']) { box-shadow: inset 0 -2px 0 var(--d-ink); }
  :global([data-d='A']) .tbl thead th[aria-sort]:not([aria-sort='none']) .hcap { color: var(--d-ink); }
  :global([data-d='A']) .empty { padding-block: var(--d-p3); }

  /* ── B · INSTRUMENTO — las celdas COMPARTEN borde, fila de 30px ────────── */
  :global([data-d='B']) .tbl { border-collapse: collapse; }
  :global([data-d='B']) .tbl th,
  :global([data-d='B']) .tbl td { border: var(--d-bw) solid var(--d-line); padding: 0 var(--d-p2); }
  :global([data-d='B']) .tbl tbody tr:last-child td { border-bottom: var(--d-bw) solid var(--d-line); }
  :global([data-d='B']) .tbl thead th { border-color: var(--d-edge); }
  :global([data-d='B']) .tbl thead th[aria-sort]:not([aria-sort='none']) { background: var(--d-edge); }
  :global([data-d='B']) .tbl thead th[aria-sort]:not([aria-sort='none']) .hcap { color: var(--d-ink-on); }
  :global([data-d='B']) .tbl tbody tr.on td.c-sel { box-shadow: inset 2px 0 0 var(--d-edge); }
  :global([data-d='B']) .pick { --pick: 12px; }
  :global([data-d='B']) .sortmark::before { content: '▴'; }
  :global([data-d='B']) .sortmark[data-dir='desc']::before { content: '▾'; }
  /* La fila vencida no se marca sólo con un fondo de color: se DIBUJA con más
     peso de línea. En un plano técnico el grosor del trazo es el idioma, y una
     fila trazada en tinta contra hairlines grises se ve con los ojos entornados
     y sin distinguir un solo color. */
  :global([data-d='B']) .tbl tbody tr.alert td { border-color: var(--d-edge); }
  :global([data-d='B']) .tbl tbody tr.alert td.c-code { font-weight: var(--d-w-semi); }
  /* Una botonera es un marco continuo, no tres botones sueltos: la regla ya la
     cumplía .d-btn-group y el paginador se había quedado afuera. */
  :global([data-d='B']) .pager { gap: 0; }
  :global([data-d='B']) .pager > .d-btn + .d-btn { margin-left: calc(-1 * max(var(--d-bw), 1px)); }
  :global([data-d='B']) .foot { padding-block: var(--d-p1); }
  /* El contenedor de tarjeta sobra. La lista tenía DOS marcos, el del panel con
     sus marcas de esquina y el suyo propio: en densidad de cabina eso es chrome
     que no informa. Queda un solo marco y la etiqueta pasa a estar fuera de él,
     que es la regla declarada de esta dirección. */
  :global([data-d='B']) .d-panel.clistpanel { border: 0; box-shadow: none; }
  :global([data-d='B']) .d-panel.clistpanel::before,
  :global([data-d='B']) .d-panel.clistpanel::after { content: none; }
  :global([data-d='B']) .clistpanel .d-panel-head { border-bottom: 0; padding: 0 0 var(--d-p1); }
  :global([data-d='B']) .clist { border: var(--d-bw) solid var(--d-edge); }
  :global([data-d='B']) ul.clist > li.citem {
    grid-template-columns: 84px minmax(0, 1fr);
    gap: 0 var(--d-p2);
    align-items: center;
    min-height: var(--d-row-h);
    padding: 0 var(--d-p2);
    border-bottom: var(--d-bw) solid var(--d-line);
  }
  :global([data-d='B']) ul.clist > li.citem:last-child { border-bottom: 0; }
  /* Un renglón por equipo, sin plegado: es una rejilla, no una pila de fichas. */
  :global([data-d='B']) .cibody { flex-wrap: nowrap; overflow: hidden; }
  :global([data-d='B']) .cinm { flex-basis: auto; }
  :global([data-d='B']) .empty { padding-block: var(--d-p3); }

  /* ── C · MARCA — la cabecera de la tabla es la del bloque, en color ────── */
  :global([data-d='C']) .tablepanel,
  :global([data-d='C']) .clistpanel,
  :global([data-d='C']) .emptypanel { overflow: hidden; }
  :global([data-d='C']) .tbl thead th { background: var(--d-brand-deep); border-bottom: 0; }
  :global([data-d='C']) .hcap { color: var(--d-brand-ink); }
  :global([data-d='C']) .sortbtn:hover { color: var(--d-brand-ink); text-decoration: underline; }
  :global([data-d='C']) .tbl thead th[aria-sort]:not([aria-sort='none']) { box-shadow: inset 0 -3px 0 var(--d-brand-ink); }
  :global([data-d='C']) .tbl tbody tr.on td.c-sel { box-shadow: inset 3px 0 0 var(--d-brand); }
  :global([data-d='C']) ul.clist > li.citem { border-bottom: var(--d-bw) solid var(--d-line); }
  :global([data-d='C']) ul.clist > li.citem:last-child { border-bottom: 0; }
  :global([data-d='C']) .cicode { color: var(--d-brand); }
  /* La cabecera del bloque es teal lleno: todo lo que viva encima va en tinta de
     marca o desaparece. Es la trampa que ya se cobró tres veces este proyecto. */
  :global([data-d='C']) .d-panel-head .headnote,
  :global([data-d='C']) .d-panel-head .hnum { color: var(--d-brand-ink); }
  /* El color es estructura: la barra del bloque y la de columnas son UN macizo
     de marca en dos tonos, y lo único que lo interrumpe es la columna ordenada.
     Sin esta línea las dos barras se leían como dos bloques apilados. */
  :global([data-d='C']) .tablepanel .d-panel-head { box-shadow: inset 0 -1px 0 var(--d-brand-deep); }
  :global([data-d='C']) .tbl tbody tr.alert td.c-code { font-weight: var(--d-w-semi); }
  :global([data-d='C']) .empty { padding-block: var(--d-p3); }

  /* ── D · PESO — cabecera tinta, tipografía 800, el bloque cae en su sombra */
  :global([data-d='D']) .tbl thead th { background: var(--d-ink); border-bottom: var(--d-bw) solid var(--d-ink); }
  :global([data-d='D']) .hcap { color: var(--d-ink-on); }
  /* La columna ordenada se recorta en negativo sobre la barra tinta: masa, no color. */
  :global([data-d='D']) .tbl thead th[aria-sort]:not([aria-sort='none']) { background: var(--d-surface); }
  :global([data-d='D']) .tbl thead th[aria-sort]:not([aria-sort='none']) .hcap { color: var(--d-ink); }
  :global([data-d='D']) .tbl tbody td { border-bottom: 1px solid var(--d-ink); color: var(--d-ink); }
  :global([data-d='D']) .tbl tbody tr.on td.c-sel { box-shadow: inset 6px 0 0 var(--d-ink); }
  :global([data-d='D']) .tbl tbody td.c-code { text-transform: uppercase; font-weight: var(--d-w-bold); }
  :global([data-d='D']) .pick { --pick: 17px; border-width: var(--d-bw); }
  :global([data-d='D']) .sortmark::before { content: '▲'; }
  :global([data-d='D']) .sortmark[data-dir='desc']::before { content: '▼'; }
  :global([data-d='D']) .clistpanel { background: transparent; border: 0; box-shadow: none; }
  :global([data-d='D']) .clistpanel .d-panel-head { border-bottom: var(--d-bw) solid var(--d-ink); padding-inline: 0; }
  :global([data-d='D']) .clist { gap: var(--d-gap); padding: var(--d-p2) 6px var(--d-p2) 0; }
  :global([data-d='D']) ul.clist > li.citem {
    background: var(--d-surface);
    border: var(--d-bw) solid var(--d-ink);
    box-shadow: var(--d-shadow);
    transition: transform 100ms ease, box-shadow 100ms ease;
  }
  :global([data-d='D']) ul.clist > li.citem:active { transform: translate(4px, 4px); box-shadow: none; }
  :global([data-d='D']) .cicode,
  :global([data-d='D']) .etitle { text-transform: uppercase; font-weight: var(--d-w-bold); letter-spacing: .02em; }

  /* ── E · AIRE — filas de 56px, cero líneas duras, selección en pastilla ── */

  /* ── F · TERMINAL — rejilla de caracteres de 24px, cursor y bloques ────── */

  /* ── G · BANDA — sin caja: franjas a sangre con canto de color y raíl ──── */
  :global([data-d='G']) .stack { gap: 0; }
  :global([data-d='G']) .speclabel { margin: 0; padding: var(--d-p3) var(--d-p3) var(--d-p1); }
  :global([data-d='G']) .note { padding: var(--d-p1) var(--d-p3) var(--d-p3); margin: 0; }
  :global([data-d='G']) .tablepanel,
  :global([data-d='G']) .clistpanel,
  :global([data-d='G']) .emptypanel { border-left: 0; border-right: 0; }
  :global([data-d='G']) .tbl { min-width: 600px; }
  :global([data-d='G']) .tbl thead th { border-bottom: var(--d-bw) solid var(--d-line); }
  :global([data-d='G']) .tbl thead th.c-sel { border-left: 3px solid transparent; }
  :global([data-d='G']) .tbl tbody td.c-sel { border-left: 3px solid var(--tone-fg); }
  :global([data-d='G']) .tbl tbody tr.alert td { background: transparent; }
  :global([data-d='G']) .tbl tbody tr.on td.c-sel { box-shadow: none; }
  :global([data-d='G']) .tbl tbody tr:last-child td { border-bottom: var(--d-bw) solid var(--d-line); }
  :global([data-d='G']) ul.clist > li.citem {
    grid-template-columns: var(--d-rail) minmax(0, 1fr);
    gap: 0 var(--d-p3);
    align-items: baseline;
    padding: var(--d-p1) var(--d-p3) var(--d-p1) 0;
    border-bottom: var(--d-bw) solid var(--d-line);
    border-left: 3px solid var(--tone-fg);
  }
  :global([data-d='G']) ul.clist > li.citem.alert { background: transparent; }
  :global([data-d='G']) .cicode { text-align: right; }
  :global([data-d='G']) .empty { padding: var(--d-p3) var(--d-p3) var(--d-p4); }

  /* ── H · FICHA — pestaña arriba, regla doble, renglones de fichero ─────── */

  /* ==========================================================================
     LAS ONCE NUEVAS · I–S.

     Mismo contrato que arriba: cada valor sale de los tokens --d-*, y cada
     selector se envuelve en :global(...) porque [data-d] vive en
     Direction.svelte y el alcance de Svelte no cruza esa frontera.

     Donde una dirección pide un valor que su bloque de tokens no declara, queda
     escrito como HALLAZGO en lugar de parcheado en silencio.
     ========================================================================== */

  /* ── I · CRISTAL — una sola capa de vidrio por pieza ───────────────────────
     El panel ya desenfoca el campo de manchas. Nada de acá adentro vuelve a
     desenfocar: lo que va dentro del vidrio se anida con TRANSPARENCIA, que es
     la única forma de que la segunda capa no lo enturbie. */
  :global([data-d='I']) .tablepanel,
  :global([data-d='I']) .emptypanel { overflow: hidden; box-shadow: var(--d-shadow-lg); }
  /* LA ESCALERA DE DENSIDAD, que estaba rota. Cabecera y fila con el cursor
     encima pintaban las dos --d-sunk: eran indistinguibles, y en una tabla de
     ocho columnas eso es el peor lugar donde perder el norte. Ahora hay tres
     escalones honestos de vidrio: fila en reposo transparente (se ve el campo a
     través), cursor encima --d-sunk, y cabecera --d-surface, el vidrio más
     espeso porque es la pieza que no se mueve. */
  :global([data-d='I']) .tbl thead th {
    background: var(--d-surface);
    border-bottom: 1px solid var(--d-edge);
    box-shadow: inset 0 1px 0 var(--d-line);   /* el filo especular, no una línea */
  }
  /* La columna ordenada no cambia de espesor —eso rompería la escalera— sino que
     enciende un canto de acento y se lleva la etiqueta al mismo color. */
  :global([data-d='I']) .tbl thead th[aria-sort]:not([aria-sort='none']) {
    box-shadow: inset 0 1px 0 var(--d-line), inset 0 -2px 0 var(--d-accent);
  }
  :global([data-d='I']) .tbl thead th[aria-sort]:not([aria-sort='none']) .hcap { color: var(--d-accent); }
  :global([data-d='I']) .tbl tbody td { border-bottom-color: var(--d-edge); }
  /* Una fila destacada no es otro vidrio: es el mismo vidrio más denso. */
  :global([data-d='I']) .tbl tbody tr:hover td,
  :global([data-d='I']) .tbl tbody tr.is-hover td { background: var(--d-sunk); }
  :global([data-d='I']) .tbl tbody tr.on td { background: var(--d-surface); }
  :global([data-d='I']) .pick {
    background: var(--d-sunk);
    border-color: var(--d-line);
    box-shadow: inset 0 1px 0 var(--d-line);
  }
  /* Y hay que reponer el relleno de marcado. `.pick:checked` (línea 408) y esta
     regla de dirección pesan lo mismo una vez que Svelte les cuelga la clase de
     ámbito, así que gana la última — la de la dirección. Sin esto la marca
     blanca queda sobre vidrio blanco y la casilla marcada se ve igual que la
     vacía. Es la misma trampa del primario, en otra primitiva: J, E y O ya la
     reponen; I, K y L no lo hacían. */
  :global([data-d='I']) .pick:checked,
  :global([data-d='I']) .pick:indeterminate {
    background: var(--d-accent);
    border-color: var(--d-accent-edge);
  }
  /* La lista invierte la jerarquía: el panel se disuelve y cada ítem pasa a ser
     LA pieza de vidrio. Vidrio dentro de vidrio se enturbia; vidrio al lado de
     vidrio, no. */
  :global([data-d='I']) .d-panel.clistpanel {
    background: transparent; border-color: transparent; box-shadow: none;
    backdrop-filter: none; -webkit-backdrop-filter: none;
  }
  :global([data-d='I']) .clistpanel .d-panel-head { border-bottom: 0; padding-inline: 0; }
  :global([data-d='I']) .clist { gap: var(--d-p1); padding-bottom: var(--d-p1); }
  :global([data-d='I']) ul.clist > li.citem {
    background: var(--d-surface);
    border: 1px solid var(--d-line);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    /* HALLAZGO: I no declara un token de desenfoque (--d-blur). Los 18px que
       siguen repiten a mano el valor de [data-d='I'] .d-panel en
       directions.css, y si allá cambia, acá queda desfasado. */
    backdrop-filter: blur(18px) saturate(1.5);
    -webkit-backdrop-filter: blur(18px) saturate(1.5);
  }
  :global([data-d='I']) ul.clist > li.citem.alert { background: var(--tone-band); }
  :global([data-d='I']) ul.clist > li.citem.on { box-shadow: var(--d-shadow-lg); }
  :global([data-d='I']) .empty { padding-block: var(--d-p3); }
  /* HALLAZGO, y esta duele: en directions.css [data-d='I'] .d-btn pinta el
     fondo de vidrio con más peso que .d-btn--primary, que sólo redefine el
     borde. El botón primario queda entonces blanco con tinta blanca —la página
     actual del paginador y «Agregar equipo» son ilegibles—. Se repara acá para
     esta página; el arreglo de fondo es una regla .d-btn--primary en el bloque
     de I. Es la misma trampa en M, y sólo en esas dos de las once. */
  :global([data-d='I']) .d-btn--primary { background: var(--d-accent); color: var(--d-accent-ink); }

  /* ── J · LACA — ninguna superficie es color plano ──────────────────────────
     Todo lo que se pinta acá se pinta con los rellenos en degradado de la
     dirección (--d-*-fill) o con degradados armados entre dos tokens. El
     barrido de brillo del panel ya lo pone directions.css: no se duplica. */
  /* La columna ordenada NO se invierte a tinta clara: el barrido de brillo del
     panel cae justo encima de la cabecera y un blanco sobre laca roja bajo ese
     velo se cae de AA. Se marca con un canto de esmalte y la etiqueta en el
     color de acento, que bajo el mismo velo gana contraste en vez de perderlo. */
  /* Seleccionada = placa hundida: se le apaga el realce y el degradado baja de
     tono. Es el mismo gesto que el :active del botón, sin gastar color. */
  /* La lista: placas gruesas, cada una con su propio barrido. El barrido va por
     DEBAJO del texto (z-index negativo dentro de un contexto propio), así que
     no le come contraste a nada ni le tapa el clic al botón de la fila. */

  /* ── K · HALO — cero bordes; la fila que urge irradia ──────────────────────
     El estado no es un relleno ni una línea: es el color del resplandor. Una
     fila vencida se ve desde el otro lado del cuarto sin leer una palabra.
     HALLAZGO: K no expone un token de resplandor (--d-glow-*), así que los
     radios de difusión se escriben a mano igual que en directions.css; el
     COLOR siempre sale de --tone-fg / --tone-edge / --d-accent. */
  :global([data-d='K']) .tbl { border-spacing: 0 var(--d-p1); }
  :global([data-d='K']) .tbl th,
  :global([data-d='K']) .tbl td { border: 0; }
  :global([data-d='K']) .tbl thead th { background: transparent; padding-bottom: var(--d-p2); }
  :global([data-d='K']) .tbl thead th[aria-sort]:not([aria-sort='none']) .hcap {
    color: var(--d-accent);
    text-shadow: 0 0 14px var(--d-accent-edge);   /* bloom, no bloque de color */
  }
  :global([data-d='K']) .tbl tbody td { background: var(--d-surface); }
  :global([data-d='K']) .tbl tbody td.c-sel { border-radius: var(--d-r) 0 0 var(--d-r); }
  :global([data-d='K']) .tbl tbody td.c-act { border-radius: 0 var(--d-r) var(--d-r) 0; }
  :global([data-d='K']) .tbl tbody tr[data-tone] { box-shadow: 0 0 0 1px var(--tone-edge), 0 8px 30px -10px var(--tone-fg); }
  :global([data-d='K']) .tbl tbody tr.alert { box-shadow: 0 0 0 1px var(--tone-edge), 0 12px 42px -6px var(--tone-fg); }
  :global([data-d='K']) .tbl tbody tr.alert td { background: var(--d-surface); }
  /* El cursor encima aclara la superficie; el resplandor sigue siendo del
     estado. Así hover y estado no se pisan. */
  :global([data-d='K']) .tbl tbody tr:hover td,
  :global([data-d='K']) .tbl tbody tr.is-hover td { background: var(--d-accent-soft); }
  :global([data-d='K']) .tbl tbody tr.on { box-shadow: 0 0 0 1px var(--d-accent-edge), 0 14px 46px -12px var(--d-accent); }
  :global([data-d='K']) .tbl tbody tr.on td { background: var(--d-accent-soft); }
  :global([data-d='K']) .tbl tbody tr.on td.c-sel { box-shadow: inset 3px 0 0 var(--d-accent); }
  :global([data-d='K']) .tblwrap { padding: var(--d-p1) var(--d-p1) var(--d-p3); }
  /* Sin borde visible la casilla desaparece: --d-edge es transparent en K, así
     que el anillo lo pone el tono neutro, que sí está declarado. */
  :global([data-d='K']) .pick {
    background: var(--d-sunk);
    border-color: var(--d-neu-edge);
  }
  /* El resplandor solo no alcanza: sin relleno la marca es tinta oscura sobre
     --d-sunk, que en K también es casi negro. Se rellena de acento y la marca
     pasa a ser --d-accent-ink (#04140F) sobre menta: se lee, y el halo sigue
     siendo lo que dice «marcada» desde lejos. */
  :global([data-d='K']) .pick:checked,
  :global([data-d='K']) .pick:indeterminate {
    background: var(--d-accent);
    border-color: var(--d-accent-edge);
    box-shadow: 0 0 16px -4px var(--d-accent);
  }
  :global([data-d='K']) .clistpanel { background: transparent; box-shadow: none; }
  :global([data-d='K']) .clistpanel .d-panel-head { padding-inline: 0; }
  :global([data-d='K']) .clist { gap: var(--d-p2); padding-bottom: var(--d-p2); }
  :global([data-d='K']) ul.clist > li.citem {
    background: var(--d-surface);
    border-radius: var(--d-r-lg);
    box-shadow: 0 0 0 1px var(--tone-edge), 0 8px 30px -18px var(--tone-fg);
  }
  :global([data-d='K']) ul.clist > li.citem.alert {
    background: var(--d-surface);
    box-shadow: 0 0 0 1px var(--tone-edge), 0 16px 50px -12px var(--tone-fg);
  }
  :global([data-d='K']) ul.clist > li.citem.on {
    background: var(--d-surface);
    box-shadow: 0 0 0 1px var(--d-accent-edge), 0 16px 50px -14px var(--d-accent);
  }
  :global([data-d='K']) .empty { padding-block: var(--d-p3); }
  :global([data-d='K']) .etitle { text-shadow: 0 0 26px var(--d-accent-soft); }

  /* ── L · GUIJARRO — cada fila es un canto rodado ───────────────────────────
     Ninguna corrida recta: las filas son piedras separadas por aire y ninguna
     repite las puntas de la de al lado.
     HALLAZGO: L declara --d-r y --d-r-lg con los cuatro radios juntos, pero no
     expone esquinas sueltas ni un juego alterno (--d-r-2). Para que una piedra
     termine distinto de su vecina hay que escribir esquina por esquina; queda
     anotado, y son las únicas medidas escritas a mano de esta dirección. */
  :global([data-d='L']) .tbl { border-spacing: 0 var(--d-p1); }
  :global([data-d='L']) .tbl th,
  :global([data-d='L']) .tbl td { border: 0; }
  :global([data-d='L']) .tbl thead th { background: transparent; padding-bottom: var(--d-p2); }
  :global([data-d='L']) .tbl thead th[aria-sort]:not([aria-sort='none']) .hcap {
    background: var(--d-accent-soft);
    color: var(--d-ink);
    padding: 2px var(--d-p1);
    border-radius: var(--d-r);        /* los cuatro radios del token, enteros */
  }
  :global([data-d='L']) .tbl tbody td { background: var(--d-surface); }
  :global([data-d='L']) .tbl tbody tr { box-shadow: var(--d-shadow); }
  :global([data-d='L']) .tbl tbody tr:hover,
  :global([data-d='L']) .tbl tbody tr.is-hover { box-shadow: var(--d-shadow-lg); }
  :global([data-d='L']) .tbl tbody td.c-sel { border-radius: 22px 0 0 16px; }
  :global([data-d='L']) .tbl tbody td.c-act { border-radius: 0 14px 24px 0; }
  :global([data-d='L']) .tbl tbody tr:nth-child(2n) td.c-sel { border-radius: 14px 0 0 26px; }
  :global([data-d='L']) .tbl tbody tr:nth-child(2n) td.c-act { border-radius: 0 26px 12px 0; }
  :global([data-d='L']) .tblwrap { padding: var(--d-p1) var(--d-p1) var(--d-p3); }
  :global([data-d='L']) .pick {
    background: var(--d-sunk);
    border-color: var(--d-ink-3);
    border-radius: 7px 4px 6px 5px;
  }
  /* Misma reposición que en I: sin ella la marca blanca cae sobre --d-sunk
     crema y la casilla marcada no se distingue de la vacía. */
  :global([data-d='L']) .pick:checked,
  :global([data-d='L']) .pick:indeterminate {
    background: var(--d-accent);
    border-color: var(--d-accent);
  }
  :global([data-d='L']) .clistpanel { background: transparent; box-shadow: none; }
  :global([data-d='L']) .clistpanel .d-panel-head { padding-inline: 0; }
  :global([data-d='L']) .clist { gap: var(--d-p2); padding-bottom: var(--d-p2); }
  :global([data-d='L']) ul.clist > li.citem {
    background: var(--d-surface);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='L']) ul.clist > li.citem:nth-child(2n) { border-radius: var(--d-r); }
  :global([data-d='L']) ul.clist > li.citem:nth-child(3n) { border-radius: 40px 24px 34px 26px; }
  :global([data-d='L']) ul.clist > li.citem.on { box-shadow: var(--d-shadow-lg); }
  :global([data-d='L']) .empty { padding-block: var(--d-p3); }

  /* ── M · BRUMA — no hay líneas, hay derrames ───────────────────────────────
     Cero contenedores y cero reglas horizontales: lo que separa una fila de la
     siguiente es que el color se derrama por detrás y se desvanece sin filo.
     Los titulares —el nombre del equipo incluido— van en la serif de --d-display. */
  /* Lo que separa una fila de la siguiente es PAPEL, no una regla. Con las filas
     pegadas los derrames se tocaban y la tabla volvía a leerse como un campo
     rayado; con un renglón de aire entre medio cada mancha se posa sola. */
  :global([data-d='M']) .tbl { border-spacing: 0 var(--d-p1); }
  :global([data-d='M']) .tbl th,
  :global([data-d='M']) .tbl td { border: 0; }
  :global([data-d='M']) .tbl thead th { background: transparent; padding-bottom: var(--d-p2); }
  :global([data-d='M']) .tbl thead th[aria-sort]:not([aria-sort='none']) .hcap { color: var(--d-accent); }
  /* Los titulares de la página también son serif. Antes eran versalitas, así que
     la tesis tipográfica de esta dirección no llegaba a sus propios encabezados:
     se veía sólo en el nombre del equipo. */
  :global([data-d='M']) .speclabel {
    font-family: var(--d-display);
    font-size: var(--d-t-lg);
    font-weight: 400;
    letter-spacing: -.01em;
  }
  /* El derrame va en la fila, no en la celda: una celda corta el degradado en
     su propio ancho y vuelve a leerse como una casilla. Y va en radial, no en
     lineal: un degradado recto de borde a borde sigue siendo una banda: lo que
     esta dirección quiere es una mancha que entra por el canto y se desvanece
     en las dos direcciones. */
  :global([data-d='M']) .tbl tbody tr[data-tone] { background: radial-gradient(90% 150% at 1% 50%, var(--tone-band) 0%, transparent 72%); }
  /* La que urge no se tiñe MÁS: se derrama MÁS LEJOS. Subir el alfa habría
     tirado el texto secundario por debajo de AA sobre la propia mancha; la misma
     tinta llegando al otro extremo de la fila dice «esta» sin costar contraste. */
  :global([data-d='M']) .tbl tbody tr.alert { background: radial-gradient(125% 195% at 0% 50%, var(--tone-band) 0%, transparent 90%); }
  :global([data-d='M']) .tbl tbody tr.alert td,
  :global([data-d='M']) .tbl tbody tr.on td { background: transparent; }
  :global([data-d='M']) .tbl tbody tr:hover,
  :global([data-d='M']) .tbl tbody tr.is-hover { background: radial-gradient(120% 170% at 1% 50%, var(--tone-band) 0%, transparent 82%); }
  :global([data-d='M']) .tbl tbody tr:hover td,
  :global([data-d='M']) .tbl tbody tr.is-hover td { background: transparent; }
  /* Un canto duro de 3px en la única dirección que no tiene ni un filo era una
     contradicción. La selección también es un derrame, y entra por el lado
     contrario: el estado viene de la izquierda, la selección de la derecha, y
     una fila vencida y marcada a la vez muestra las dos sin taparse. */
  :global([data-d='M']) .tbl tbody tr.on {
    background: radial-gradient(70% 150% at 100% 50%, var(--d-accent-soft) 0%, transparent 80%);
  }
  :global([data-d='M']) .tbl tbody tr.alert.on {
    background:
      radial-gradient(70% 150% at 100% 50%, var(--d-accent-soft) 0%, transparent 80%),
      radial-gradient(125% 195% at 0% 50%, var(--tone-band) 0%, transparent 90%);
  }
  :global([data-d='M']) .tbl tbody tr.on td.c-sel { box-shadow: none; }
  :global([data-d='M']) .nm { font-family: var(--d-display); font-size: var(--d-t-md); font-weight: 400; }
  :global([data-d='M']) .pick { border-color: var(--d-ink-3); }
  :global([data-d='M']) .clistpanel .d-panel-head { padding-inline: 0; }
  :global([data-d='M']) .clist { gap: var(--d-p2); }
  /* Cada ítem tiene su propia mancha desenfocada detrás, del tono que le toca.
     Misma técnica que el panel de M en directions.css: z-index negativo para
     que la mancha quede sobre el papel y bajo el texto. */
  :global([data-d='M']) ul.clist > li.citem {
    position: relative;
    isolation: isolate;
    border-bottom: 0;
    padding: var(--d-p2) 0;
  }
  /* El token correcto es --tone-wash, no --tone-band. directions.css los separó
     justamente para esto: la banda es para color plano, el wash está calibrado
     para sobrevivir a 22px de desenfoque. Con la banda, la mancha de la lista se
     disolvía hasta no decir nada y el estado se perdía. */
  :global([data-d='M']) ul.clist > li.citem::before {
    content: '';
    position: absolute; inset: -14px -24px;
    background:
      radial-gradient(58% 76% at 14% 30%, var(--tone-wash) 0%, transparent 70%),
      radial-gradient(44% 60% at 78% 84%, var(--tone-wash) 0%, transparent 66%);
    filter: blur(22px);
    pointer-events: none;
    z-index: -1;
  }
  :global([data-d='M']) ul.clist > li.citem.alert,
  :global([data-d='M']) ul.clist > li.citem.on { background: transparent; }
  /* Seleccionado: una tercera mancha, de acento, entrando por la derecha. Misma
     gramática que en la tabla. */
  :global([data-d='M']) ul.clist > li.citem.on::before {
    background:
      radial-gradient(58% 76% at 14% 30%, var(--tone-wash) 0%, transparent 70%),
      radial-gradient(44% 60% at 78% 84%, var(--tone-wash) 0%, transparent 66%),
      radial-gradient(50% 90% at 100% 50%, var(--d-accent-soft) 0%, transparent 74%);
  }
  :global([data-d='M']) .cinm { font-family: var(--d-display); font-size: var(--d-t-lg); font-weight: 400; letter-spacing: -.01em; }
  :global([data-d='M']) .etitle { font-family: var(--d-display); font-size: var(--d-t-xl); font-weight: 400; }
  :global([data-d='M']) .empty { padding-block: var(--d-p3) var(--d-p4); }
  /* La misma trampa que en I: [data-d='M'] .d-btn rellena con --d-sunk por
     encima de .d-btn--primary, y el primario queda papel sobre papel. */
  :global([data-d='M']) .d-btn--primary { background: var(--d-accent); color: var(--d-accent-ink); }

  /* ── N · CINTA — cada fila es su propio carril, con contacto ───────────────
     Puntas redondas de verdad, degradado a lo largo del carril, y orden de
     apilado: el carril de arriba tapa al de abajo y le deja encima su sombra
     de contacto. En la tabla los carriles se tocan; en la lista se montan. */
  :global([data-d='N']) .tbl { border-spacing: 0; }
  :global([data-d='N']) .tbl th,
  :global([data-d='N']) .tbl td { border: 0; }
  /* HALLAZGO: --d-surface-fill y --d-sunk-fill de N son degradados a 100deg
     pensados para un carril de una sola pieza. Dentro de una <table> cada celda
     reinicia el degradado y el carril sale aserrado, que es lo contrario de lo
     que la dirección promete. Acá el degradado se lleva al extremo de entrada
     —la celda de selección, que es donde arranca el carril— y el cuerpo queda
     en el color plano, así la cinta se lee de una sola pieza. Un token
     --d-surface-flat/--d-sunk-flat no hace falta: los colores planos ya están. */
  :global([data-d='N']) .tbl thead th { background: var(--d-sunk); }
  :global([data-d='N']) .tbl thead th.c-sel {
    background: var(--d-sunk-fill);
    border-radius: var(--d-r-pill) 0 0 var(--d-r-pill);
  }
  :global([data-d='N']) .tbl thead th.c-act { border-radius: 0 var(--d-r-pill) var(--d-r-pill) 0; }
  :global([data-d='N']) .tbl thead th[aria-sort]:not([aria-sort='none']) .hcap { color: var(--d-accent); }
  :global([data-d='N']) .tbl tbody tr { position: relative; box-shadow: var(--d-shadow); }
  :global([data-d='N']) .tbl tbody tr:nth-child(1) { z-index: 4; }
  :global([data-d='N']) .tbl tbody tr:nth-child(2) { z-index: 3; }
  :global([data-d='N']) .tbl tbody tr:nth-child(3) { z-index: 2; }
  :global([data-d='N']) .tbl tbody tr:nth-child(4) { z-index: 1; }
  :global([data-d='N']) .tbl tbody td { background: var(--d-surface); }
  :global([data-d='N']) .tbl tbody td.c-sel {
    background: var(--d-surface-fill);
    border-radius: var(--d-r-pill) 0 0 var(--d-r-pill);
    padding-left: var(--d-p3);
  }
  :global([data-d='N']) .tbl tbody td.c-act { border-radius: 0 var(--d-r-pill) var(--d-r-pill) 0; padding-right: var(--d-p3); }
  /* El tono entra por la punta del carril y se derrama hacia adentro. */
  :global([data-d='N']) .tbl tbody tr.alert td.c-sel { background: linear-gradient(100deg, var(--tone-band) 0%, var(--d-surface) 88%); }
  :global([data-d='N']) .tbl tbody tr:hover td,
  :global([data-d='N']) .tbl tbody tr.is-hover td { background: var(--d-sunk); }
  /* El carril seleccionado se monta encima de todos y levanta más sombra. */
  :global([data-d='N']) .tbl tbody tr.on { z-index: 5; box-shadow: var(--d-shadow-lg); }
  :global([data-d='N']) .tbl tbody tr.on td { background: var(--d-surface); }
  :global([data-d='N']) .tbl tbody tr.on td.c-sel {
    background: linear-gradient(100deg, var(--d-accent-soft) 0%, var(--d-surface) 88%);
    box-shadow: inset 5px 0 0 var(--d-accent);
  }
  /* Aire a los costados: sin él las puntas redondas del carril se cortan contra
     el canto del panel y la cinta vuelve a parecer una fila cuadrada. */
  :global([data-d='N']) .tblwrap { padding: 0 var(--d-p2) var(--d-p2); }
  :global([data-d='N']) .pick { border-radius: var(--d-r-pill); }
  :global([data-d='N']) .d-panel.clistpanel { background: transparent; border-color: transparent; box-shadow: none; }
  :global([data-d='N']) .clistpanel .d-panel-head { background: transparent; padding-inline: 0; }
  :global([data-d='N']) .clist { gap: 0; padding-bottom: var(--d-p3); }
  :global([data-d='N']) ul.clist > li.citem {
    position: relative;
    background: var(--d-surface-fill);
    border-radius: var(--d-r-pill);
    box-shadow: var(--d-shadow);
    padding: var(--d-p2) var(--d-p4);
  }
  /* Se montan unos milímetros: eso es lo que obliga a que haya orden. */
  :global([data-d='N']) ul.clist > li.citem + li.citem { margin-top: calc(-1 * var(--d-p1)); }
  :global([data-d='N']) ul.clist > li.citem:nth-child(1) { z-index: 6; }
  :global([data-d='N']) ul.clist > li.citem:nth-child(2) { z-index: 5; }
  :global([data-d='N']) ul.clist > li.citem:nth-child(3) { z-index: 4; }
  :global([data-d='N']) ul.clist > li.citem:nth-child(4) { z-index: 3; }
  :global([data-d='N']) ul.clist > li.citem:nth-child(5) { z-index: 2; }
  :global([data-d='N']) ul.clist > li.citem:nth-child(6) { z-index: 1; }
  :global([data-d='N']) ul.clist > li.citem.alert { background: linear-gradient(100deg, var(--tone-band) 0%, var(--d-surface) 62%); }
  :global([data-d='N']) ul.clist > li.citem.on { z-index: 7; box-shadow: var(--d-shadow-lg); background: linear-gradient(100deg, var(--d-accent-soft) 0%, var(--d-surface) 70%); }
  :global([data-d='N']) .empty { padding-block: var(--d-p3); }

  /* ── O · PRISMA — vidrio con la marca teñida adentro ───────────────────────
     La cabecera de la tabla es el mismo vidrio con la marca disuelta, no una
     barra opaca: el panel se sigue leyendo como UNA pieza que flota. Y una
     botonera acá es vidrio segmentado, no tres botones sueltos. */
  :global([data-d='O']) .tablepanel,
  :global([data-d='O']) .emptypanel { overflow: hidden; box-shadow: var(--d-shadow-lg); }
  :global([data-d='O']) .tbl thead th {
    background: var(--d-accent-soft);
    border-bottom: 1px solid var(--d-accent-edge);
    box-shadow: inset 0 1px 0 var(--d-line);
  }
  :global([data-d='O']) .hcap { color: var(--d-brand); }
  :global([data-d='O']) .tbl thead th[aria-sort]:not([aria-sort='none']) { background: var(--d-accent-edge); }
  :global([data-d='O']) .tbl thead th[aria-sort]:not([aria-sort='none']) .hcap { color: var(--d-brand-ink); }
  :global([data-d='O']) .tbl tbody td { border-bottom-color: var(--d-edge); }
  :global([data-d='O']) .tbl tbody tr:hover td,
  :global([data-d='O']) .tbl tbody tr.is-hover td { background: var(--d-sunk); }
  /* La marca vive DENTRO del vidrio, y la selección es el sitio donde eso hace
     trabajo de verdad: la fila marcada es el mismo vidrio teñido de marca, no un
     vidrio más blanco. Antes se pintaba --d-surface y quedaba igual que la
     cabecera. */
  :global([data-d='O']) .tbl tbody tr.on td { background: var(--d-accent-soft); }
  :global([data-d='O']) .tbl tbody tr.on td.c-sel { box-shadow: inset 3px 0 0 var(--d-brand); }
  :global([data-d='O']) .pick { background: var(--d-sunk); border-color: var(--d-line); }
  :global([data-d='O']) .pick:checked,
  :global([data-d='O']) .pick:indeterminate { background: var(--d-brand); border-color: var(--d-brand); }
  /* Vidrio segmentado: la botonera es una sola pieza y los botones son tramos
     con un filo de luz entre medio. */
  :global([data-d='O']) .acts,
  :global([data-d='O']) .pager {
    gap: 0;
    background: var(--d-surface);
    border: 1px solid var(--d-line);
    border-radius: var(--d-r);
    box-shadow: var(--d-shadow);
    overflow: hidden;
  }
  :global([data-d='O']) .acts .d-btn,
  :global([data-d='O']) .pager .d-btn {
    background: transparent; border: 0; border-radius: 0; box-shadow: none;
    backdrop-filter: none; -webkit-backdrop-filter: none;
  }
  :global([data-d='O']) .acts .d-btn + .d-btn,
  :global([data-d='O']) .pager .d-btn + .d-btn { border-left: 1px solid var(--d-line); }
  /* La página actual es un tramo teñido del mismo vidrio, con un canto de marca
     abajo: dentro de una pieza segmentada, un relleno sólido rompería la pieza. */
  :global([data-d='O']) .pager .d-btn--primary {
    background: var(--d-accent-soft);
    color: var(--d-brand-ink);
    font-weight: var(--d-w-bold);
    box-shadow: inset 0 -2px 0 var(--d-brand);
  }
  /* El canto de color se lo llevaban las seis filas, incluidas las que están al
     día: seis barras que no distinguen nada son papel pintado, no información.
     Queda sólo donde hay algo que decir, y así el canto de marca de la fila
     seleccionada vuelve a significar algo. */
  :global([data-d='O']) ul.clist > li.citem { border-bottom: 1px solid var(--d-edge); }
  :global([data-d='O']) ul.clist > li.citem:last-child { border-bottom: 0; }
  :global([data-d='O']) ul.clist > li.citem.alert { background: var(--tone-band); box-shadow: inset 3px 0 0 var(--tone-fg); }
  :global([data-d='O']) ul.clist > li.citem.on { box-shadow: inset 3px 0 0 var(--d-brand); }
  :global([data-d='O']) .empty { padding-block: var(--d-p3); }

  /* ── P · ESPINA — la columna de marca, y cada fila la muerde ───────────────
     La espina no la puede llevar el panel cuando adentro hay una <table>: la
     muesca de cada fila caería fuera del table y no se alinearía nunca. Acá la
     levantan la cabecera, la columna de selección y el pie, y sale una columna
     de marca continua que cada fila muerde en su propio tramo.
     HALLAZGO: P no expone el ancho de la espina como token (--d-spine); los 6px
     repiten el valor de [data-d='P'] .d-panel::before en directions.css. */
  :global([data-d='P']) .stack { gap: 0; }
  :global([data-d='P']) .speclabel { margin: 0; padding: var(--d-p3) var(--d-p3) var(--d-p1); }
  :global([data-d='P']) .note { margin: 0; padding: var(--d-p1) var(--d-p3) var(--d-p3); }
  :global([data-d='P']) .d-panel.tablepanel,
  :global([data-d='P']) .d-panel.clistpanel { padding-left: 0; }
  :global([data-d='P']) .d-panel.tablepanel::before,
  :global([data-d='P']) .d-panel.clistpanel::before { display: none; }
  :global([data-d='P']) .tablepanel .d-panel-head,
  :global([data-d='P']) .tablepanel .foot,
  :global([data-d='P']) .clistpanel .d-panel-head {
    background-image: linear-gradient(var(--d-brand), var(--d-brand));
    background-size: 6px 100%;
    background-repeat: no-repeat;
    padding-left: calc(var(--d-p3) + 6px);
  }
  :global([data-d='P']) .tbl thead th.c-sel {
    background-image: linear-gradient(var(--d-brand), var(--d-brand));
    background-size: 6px 100%;
    background-repeat: no-repeat;
    padding-left: calc(var(--d-p2) + 6px);
  }
  /* La muesca: la espina sigue siendo marca arriba y abajo, y en el tramo del
     medio la muerde el tono de la fila. */
  :global([data-d='P']) .tbl tbody td.c-sel {
    background-image: linear-gradient(180deg, var(--d-brand) 0 26%, var(--tone-fg) 26% 74%, var(--d-brand) 74%);
    background-size: 6px 100%;
    background-repeat: no-repeat;
    padding-left: calc(var(--d-p2) + 6px);
  }
  :global([data-d='P']) .tbl tbody tr.alert td { background-color: transparent; }
  :global([data-d='P']) .tbl tbody tr:hover td,
  :global([data-d='P']) .tbl tbody tr.is-hover td { background-color: var(--d-sunk); }
  :global([data-d='P']) .tbl tbody tr.on td { background-color: var(--d-accent-soft); }
  :global([data-d='P']) .tbl tbody tr.on td.c-sel { box-shadow: none; }
  :global([data-d='P']) .tbl thead th { border-bottom: 1px solid var(--d-edge); }
  :global([data-d='P']) .tbl tbody tr:last-child td { border-bottom: 1px solid var(--d-line); }
  :global([data-d='P']) ul.clist > li.citem {
    background-image: linear-gradient(180deg, var(--d-brand) 0 26%, var(--tone-fg) 26% 74%, var(--d-brand) 74%);
    background-size: 6px 100%;
    background-repeat: no-repeat;
    border-bottom: 1px solid var(--d-line);
    padding-left: calc(var(--d-p3) + 6px);
  }
  :global([data-d='P']) ul.clist > li.citem.alert { background-color: transparent; }
  :global([data-d='P']) ul.clist > li.citem.on { background-color: var(--d-accent-soft); }
  :global([data-d='P']) .cinm { font-weight: var(--d-w-semi); }
  :global([data-d='P']) .empty { padding: var(--d-p3) var(--d-p3) var(--d-p4); }

  /* ── Q · CHAROL — masa dura, superficie mojada ─────────────────────────────
     Borde de 2px negro y sombra sólida desplazada de Peso, con el esmalte de
     Laca encima: ninguna superficie plana y un realce húmedo arriba. */
  :global([data-d='Q']) .tbl thead th {
    background: var(--d-sunk-fill);
    border-bottom: var(--d-bw) solid var(--d-ink);
  }
  /* La columna ordenada se marca con masa, no invirtiendo la tinta: el barrido
     húmedo del panel cae sobre la cabecera y aclararía cualquier fondo oscuro
     hasta dejar el texto claro por debajo de AA. Un canto negro de 4px aguanta
     el velo y es más de esta dirección que un bloque de color. */
  :global([data-d='Q']) .tbl thead th[aria-sort]:not([aria-sort='none']) {
    box-shadow: inset 0 -4px 0 var(--d-ink), inset 0 1px 0 var(--d-surface);
  }
  :global([data-d='Q']) .sortmark::before { content: '▲'; }
  :global([data-d='Q']) .sortmark[data-dir='desc']::before { content: '▼'; }
  :global([data-d='Q']) .tbl tbody td {
    background: var(--d-surface-fill);
    border-bottom: 1px solid var(--d-ink);
    color: var(--d-ink);
  }
  :global([data-d='Q']) .tbl tbody tr.alert td { background: linear-gradient(180deg, var(--tone-band), var(--d-surface)); }
  :global([data-d='Q']) .tbl tbody tr:hover td,
  :global([data-d='Q']) .tbl tbody tr.is-hover td { background: var(--d-sunk-fill); }
  /* La fila seleccionada es una placa de laca clara con un canto macizo. La
     tentación era invertirla a rojo lleno, pero el barrido del panel le pasa
     por encima y una tinta clara ahí abajo no llega a AA: la selección la carga
     la masa del canto, que el velo no puede lavar. */
  :global([data-d='Q']) .tbl tbody tr.on td { background: linear-gradient(180deg, var(--d-accent-soft), var(--d-surface)); }
  :global([data-d='Q']) .tbl tbody tr.on td.c-sel { box-shadow: inset 5px 0 0 var(--d-ink); }
  :global([data-d='Q']) .pick { border-width: var(--d-bw); box-shadow: inset 0 1px 0 var(--d-surface); }
  /* La lista: bloques macizos, cada uno con su sombra sólida y su brillo. */
  :global([data-d='Q']) .d-panel.clistpanel { background: transparent; border: 0; box-shadow: none; }
  :global([data-d='Q']) .d-panel.clistpanel::after { content: none; }
  :global([data-d='Q']) .clistpanel .d-panel-head { border-bottom: var(--d-bw) solid var(--d-ink); padding-inline: 0; }
  :global([data-d='Q']) .clist { gap: var(--d-gap); padding: var(--d-p2) 6px var(--d-p2) 0; }
  :global([data-d='Q']) ul.clist > li.citem {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    background: var(--d-surface-fill);
    border: var(--d-bw) solid var(--d-ink);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='Q']) ul.clist > li.citem::after {
    content: '';
    position: absolute; inset: 0 0 auto 0; height: 34%;
    background: linear-gradient(180deg, var(--d-surface), transparent);
    opacity: .85;
    pointer-events: none;
    z-index: -1;
  }
  :global([data-d='Q']) ul.clist > li.citem.alert { background: linear-gradient(180deg, var(--tone-band), var(--d-surface)); }
  :global([data-d='Q']) ul.clist > li.citem.on {
    background: linear-gradient(180deg, var(--d-accent-soft), var(--d-surface));
    box-shadow: var(--d-shadow-lg);
  }
  :global([data-d='Q']) .cicode,
  :global([data-d='Q']) .etitle { text-transform: uppercase; font-weight: var(--d-w-bold); }
  :global([data-d='Q']) .empty { padding-block: var(--d-p3); }

  /* ── R · VITRINA — 26px monoespaciados sobre vidrio oscuro ─────────────────
     La más densa de las diecinueve. Lo que la separa de Terminal no es el color
     sino el material: el campo con luz respira a través, y las columnas quedan
     separadas por parteluces de luz en vez de por aire. */
  :global([data-d='R']) .tbl { min-width: 560px; }
  :global([data-d='R']) .tbl th,
  :global([data-d='R']) .tbl td { padding: 0 var(--d-p2); height: var(--d-row-h); }
  :global([data-d='R']) .tbl th + th,
  :global([data-d='R']) .tbl td + td { border-left: 1px solid var(--d-line); }
  :global([data-d='R']) .tbl thead th { background: var(--d-sunk); border-bottom: 1px solid var(--d-edge); }
  :global([data-d='R']) .hcap { color: var(--d-accent); }
  :global([data-d='R']) .tbl thead th[aria-sort]:not([aria-sort='none']) .hcap {
    background: var(--d-accent); color: var(--d-accent-ink); padding-inline: var(--d-p1);
  }
  :global([data-d='R']) .sortmark::before { content: '^'; }
  :global([data-d='R']) .sortmark[data-dir='desc']::before { content: 'v'; }
  :global([data-d='R']) .tbl tbody td { border-bottom-color: var(--d-line); }
  :global([data-d='R']) .tbl tbody tr.alert td { background: var(--tone-band); }
  :global([data-d='R']) .tbl tbody tr.alert td.c-sel { box-shadow: inset 2px 0 0 var(--tone-fg); }
  :global([data-d='R']) .tbl tbody tr:hover td,
  :global([data-d='R']) .tbl tbody tr.is-hover td { background: var(--d-surface); }
  :global([data-d='R']) .tbl tbody tr.on td { background: var(--d-accent-soft); }
  :global([data-d='R']) .tbl tbody tr.on td.c-sel { box-shadow: inset 2px 0 0 var(--d-accent); }
  :global([data-d='R']) .cursor::before { content: '\00a0\00a0'; }
  :global([data-d='R']) .tbl tbody tr.on .cursor::before { content: '> '; color: var(--d-accent); }
  :global([data-d='R']) .pick { --pick: 11px; }
  :global([data-d='R']) .clist { background: var(--d-sunk); }
  :global([data-d='R']) ul.clist > li.citem {
    gap: 0 var(--d-p2);
    align-items: center;
    min-height: var(--d-row-h);
    padding: 0 var(--d-p2);
    border-bottom: 1px solid var(--d-line);
  }
  :global([data-d='R']) ul.clist > li.citem:last-child { border-bottom: 0; }
  :global([data-d='R']) .cibody { flex-wrap: nowrap; overflow: hidden; }
  :global([data-d='R']) .cinm { flex-basis: auto; }
  :global([data-d='R']) ul.clist > li.citem.alert { background: var(--tone-band); box-shadow: inset 2px 0 0 var(--tone-fg); }
  :global([data-d='R']) ul.clist > li.citem.on { background: var(--d-accent-soft); box-shadow: inset 2px 0 0 var(--d-accent); }
  :global([data-d='R']) .etitle { font-size: var(--d-t-lg); text-transform: uppercase; letter-spacing: .08em; color: var(--d-accent); }
  :global([data-d='R']) .empty { padding-block: var(--d-p2); }

  /* ── S · UMBRA — la fila se queda blanca y lo que informa es la sombra ─────
     La firma de S vivía sólo en .d-panel y .d-row, así que en esta página —que
     es todo marcado propio: <tr>, <li>, el panel vacío— no llegaba a ninguna
     parte. Acá la reciben las filas de la tabla y los ítems de la lista: el
     contenido nunca se tiñe, la luz de abajo sí. */
  :global([data-d='S']) .tbl { border-spacing: 0 var(--d-p2); }
  :global([data-d='S']) .tbl th,
  :global([data-d='S']) .tbl td { border: 0; }
  :global([data-d='S']) .tbl thead th { background: transparent; padding-bottom: var(--d-p1); }
  :global([data-d='S']) .tbl thead th[aria-sort]:not([aria-sort='none']) .hcap { color: var(--d-ink); }
  :global([data-d='S']) .tbl tbody td { background: var(--d-surface); }
  :global([data-d='S']) .tbl tbody td.c-sel { border-radius: var(--d-r) 0 0 var(--d-r); }
  :global([data-d='S']) .tbl tbody td.c-act { border-radius: 0 var(--d-r) var(--d-r) 0; }
  /* Vencido proyecta rojo, al día proyecta verde, y el texto se lee sobre
     blanco puro en los dos casos. */
  :global([data-d='S']) .tbl tbody tr[data-tone] { box-shadow: 0 9px 26px -14px var(--tone-fg), var(--d-shadow); }
  :global([data-d='S']) .tbl tbody tr.alert { box-shadow: 0 12px 32px -12px var(--tone-fg), var(--d-shadow); }
  :global([data-d='S']) .tbl tbody tr.alert td { background: var(--d-surface); }
  :global([data-d='S']) .tbl tbody tr:hover td,
  :global([data-d='S']) .tbl tbody tr.is-hover td { background: var(--d-sunk); }
  :global([data-d='S']) .tbl tbody tr.on td { background: var(--d-surface); }
  :global([data-d='S']) .tbl tbody tr.on td.c-sel { box-shadow: inset 3px 0 0 var(--d-accent); }
  :global([data-d='S']) .tblwrap { padding: var(--d-p1) var(--d-p2) var(--d-p3); }
  /* La pastilla pierde su banda: sobre una tarjeta que se quedó blanca, el
     color vive en la palabra y en la marca, no en un relleno. */
  :global([data-d='S']) .d-pill { background: transparent; padding-inline: 0; }
  :global([data-d='S']) .pick { border-color: var(--d-ink-3); }
  :global([data-d='S']) .clistpanel { background: transparent; box-shadow: none; }
  :global([data-d='S']) .clistpanel .d-panel-head { border-bottom: 0; padding-inline: 0; }
  :global([data-d='S']) .clist { gap: var(--d-p2); padding-bottom: var(--d-p3); }
  :global([data-d='S']) ul.clist > li.citem {
    background: var(--d-surface);
    border-radius: var(--d-r-lg);
    box-shadow: 0 9px 26px -14px var(--tone-fg), var(--d-shadow);
  }
  :global([data-d='S']) ul.clist > li.citem.alert {
    background: var(--d-surface);
    box-shadow: 0 14px 36px -12px var(--tone-fg), var(--d-shadow);
  }
  :global([data-d='S']) ul.clist > li.citem.on { background: var(--d-surface); box-shadow: 0 14px 36px -12px var(--tone-fg), var(--d-shadow-lg); }
  :global([data-d='S']) .empty { padding-block: var(--d-p3); }

  /* ── T · HALO CLARO — ni una línea; la fila que urge irradia ───────────────
     La regla de Halo entera, del lado del día: nada tiene borde y nada tiene
     relleno de estado. Una fila existe porque irradia, y lo que la separa de la
     de abajo es aire. Esto es lo que la distingue de Umbra, que es la otra
     finalista con sombra teñida: allá la tarjeta es una tarjeta neutra y la
     sombra es un dato añadido; acá el anillo de 1px en el propio tono ES el
     contorno, no hay otro.

     Y es lo que la hace difícil en una tabla: sin líneas de rejilla, ocho
     columnas se pierden. La respuesta no es reponer líneas, es que cada fila sea
     un cuerpo suelto con su propio anillo, y que la cabecera no sea una barra
     sino una fila de etiquetas flotando sobre el papel.

     HALLAZGO: T no expone el halo como token (--d-glow / --d-ring). Los radios
     de difusión se escriben a mano, igual que ya pasa en directions.css; el
     COLOR sale siempre de --tone-fg, --tone-edge y --d-accent. */
  :global([data-d='T']) .tbl { border-spacing: 0 var(--d-p1); }
  :global([data-d='T']) .tbl th,
  :global([data-d='T']) .tbl td { border: 0; }
  :global([data-d='T']) .tbl thead th { background: transparent; padding-bottom: var(--d-p2); }
  /* La columna ordenada no se rellena ni se invierte: se enciende. Anillo de
     acento más halo corto, y la etiqueta en el propio acento, que sobre este
     papel da 5.2:1. Invertirla a tinta clara habría sido el único bloque sólido
     de toda la dirección. */
  :global([data-d='T']) .tbl thead th[aria-sort]:not([aria-sort='none']) .hcap {
    color: var(--d-accent);
    padding: 3px var(--d-p1);
    border-radius: var(--d-r);
    box-shadow: 0 0 0 1px var(--d-accent-edge), 0 4px 14px -6px var(--d-accent);
  }
  :global([data-d='T']) .tbl tbody td { background: var(--d-surface); }
  :global([data-d='T']) .tbl tbody td.c-sel { border-radius: var(--d-r) 0 0 var(--d-r); }
  :global([data-d='T']) .tbl tbody td.c-act { border-radius: 0 var(--d-r) var(--d-r) 0; }
  /* Toda fila irradia en su tono; la que urge irradia el doble y sube el anillo
     de --tone-edge a --tone-fg, así que a diez metros hay una sola fila
     encendida en la pantalla. El campo sigue siendo papel blanco: el texto de
     un vencido se lee exactamente igual que el de uno al día. */
  :global([data-d='T']) .tbl tbody tr[data-tone] {
    box-shadow: 0 0 0 1px var(--tone-edge), 0 8px 26px -12px var(--tone-fg);
  }
  :global([data-d='T']) .tbl tbody tr.alert {
    box-shadow: 0 0 0 1px var(--tone-fg), 0 14px 40px -10px var(--tone-fg);
  }
  :global([data-d='T']) .tbl tbody tr.alert td { background: var(--d-surface); }
  :global([data-d='T']) .tbl tbody tr:hover td,
  :global([data-d='T']) .tbl tbody tr.is-hover td { background: var(--d-sunk); }
  /* Seleccionada: el anillo de estado se queda donde está y por FUERA aparece un
     segundo halo, de acento. Dos luces concéntricas, una por cada cosa que hay
     que saber. La fila 1, vencida y marcada, muestra las dos. */
  :global([data-d='T']) .tbl tbody tr.on {
    box-shadow: 0 0 0 1px var(--tone-fg), 0 0 0 4px var(--d-accent-soft),
                0 14px 40px -12px var(--tone-fg);
  }
  :global([data-d='T']) .tbl tbody tr.on td { background: var(--d-surface); }
  :global([data-d='T']) .tbl tbody tr.on td.c-sel { box-shadow: inset 3px 0 0 var(--d-accent); }
  /* Los halos necesitan margen o el panel los recorta y quedan como bandas. */
  :global([data-d='T']) .tblwrap { padding: var(--d-p1) var(--d-p2) var(--d-p3); }
  /* --d-edge es transparent en toda la dirección, así que la casilla se
     evaporaba. El anillo lo pone el tono neutro; marcada, se rellena de acento y
     la marca pasa a --d-accent-ink sobre él, 5.2:1. Misma reposición que ya
     hubo que hacer en I, K y L. */
  :global([data-d='T']) .pick {
    background: var(--d-surface);
    border-color: transparent;
    box-shadow: inset 0 0 0 1px var(--d-neu-edge);
  }
  :global([data-d='T']) .pick:checked,
  :global([data-d='T']) .pick:indeterminate {
    background: var(--d-accent);
    border-color: transparent;
    box-shadow: inset 0 0 0 1px var(--d-accent), 0 0 12px -3px var(--d-accent);
  }
  /* La lista: el panel se apaga y cada ítem pasa a ser el cuerpo que irradia.
     Halo dentro de halo se vuelve niebla; halos al lado de halos, no. */
  :global([data-d='T']) .d-panel.clistpanel { background: transparent; box-shadow: none; }
  :global([data-d='T']) .clistpanel .d-panel-head { border-bottom: 0; padding-inline: 0; }
  :global([data-d='T']) .clist { gap: var(--d-p2); padding-bottom: var(--d-p2); }
  :global([data-d='T']) ul.clist > li.citem {
    background: var(--d-surface);
    border-radius: var(--d-r-lg);
    box-shadow: 0 0 0 1px var(--tone-edge), 0 8px 26px -16px var(--tone-fg);
  }
  :global([data-d='T']) ul.clist > li.citem.alert {
    background: var(--d-surface);
    box-shadow: 0 0 0 1px var(--tone-fg), 0 16px 44px -14px var(--tone-fg);
  }
  :global([data-d='T']) ul.clist > li.citem.on {
    background: var(--d-surface);
    box-shadow: 0 0 0 1px var(--tone-fg), 0 0 0 4px var(--d-accent-soft),
                0 16px 44px -14px var(--tone-fg);
  }
  :global([data-d='T']) .empty { padding-block: var(--d-p3); }

  /* ==========================================================================
     RESPONSIVE — la celda manda, no la ventana. Familia, ubicación y lectura se
     pliegan bajo el nombre del equipo; la lista compacta es la salida real.
     ========================================================================== */
  @container spec (max-width: 720px) {
    .tbl,
    :global([data-d='G']) .tbl { min-width: 0; }
    .c-fam, .c-loc, .c-read { display: none; }
    .sub { display: block; }
    .c-name { min-width: 130px; white-space: normal; }
    .nm { white-space: normal; }
    :global([data-d='G']) ul.clist > li.citem { grid-template-columns: minmax(0, 1fr); padding-left: var(--d-p3); }
    :global([data-d='G']) .cicode { text-align: left; }
    :global([data-d='B']) ul.clist > li.citem{ grid-template-columns: minmax(0, 1fr); }
  }
  @container spec (max-width: 420px) {
    .foot { flex-direction: column; align-items: flex-start; }
    .pager { width: 100%; }
    .acts { flex-wrap: wrap; }
  }
  @media (max-width: 420px) {
    .tbl { min-width: 0; }
    .c-fam, .c-loc, .c-read { display: none; }
    .sub { display: block; }
  }

  /* ── Lo que las once nuevas agregan al plegado ─────────────────────────────
     Todo lo que se ensancha aparece POR ANCHO DISPONIBLE, nunca por defecto: es
     la lección del raíl de 152px que hubo que retirar de P por aplicarse a
     ciegas dentro de tarjetas angostas. */
  @container spec (min-width: 560px) {
    /* El raíl de etiquetas de P vuelve, y sólo acá: con 560px de celda, 152px
       de columna dejan más de 380px para el contenido. */
    :global([data-d='P']) ul.clist > li.citem {
      grid-template-columns: var(--d-rail) minmax(0, 1fr);
      gap: 0 var(--d-p3);
      align-items: baseline;
      padding-block: var(--d-p1);
    }
    :global([data-d='P']) .cicode { text-align: right; }
    /* R es la más densa: su lista compacta también se vuelve rejilla de 26px. */
    :global([data-d='R']) ul.clist > li.citem { grid-template-columns: 84px minmax(0, 1fr); }
  }
  @container spec (max-width: 720px) {
    :global([data-d='R']) .tbl { min-width: 0; }
    /* Sin ancho, el carril de N y la piedra de L pierden el aire de los
       costados antes que la legibilidad del texto. */
    :global([data-d='N']) ul.clist > li.citem { padding-inline: var(--d-p3); }
    :global([data-d='L']) .tblwrap,
    :global([data-d='K']) .tblwrap,
    :global([data-d='S']) .tblwrap,
    :global([data-d='T']) .tblwrap { padding-inline: 0; }
    /* En celda angosta B pliega su lista a un renglón por campo, como el resto:
       una rejilla de dos columnas dentro de 300px deja un carácter por línea. */
    :global([data-d='B']) .cibody { flex-wrap: wrap; overflow: visible; }
    :global([data-d='B']) .cinm { flex-basis: 100%; }
  }

  /* ── Estado de fila en las direcciones que no lo repusieron ──────────────
     La regla genérica `.citem.alert` pesa menos que la base de cada dirección
     (`ul.clist > li.citem`), así que moría en silencio: la fila vencida y la
     seleccionada se veían exactas a una normal. Estas reponen al mismo peso
     que la base. No es un retoque estético — sin esto, la lista compacta no
     comunica estado en siete de las diecinueve. */
  :global([data-d='A']) ul.clist > li.citem.alert,
  :global([data-d='B']) ul.clist > li.citem.alert,
  :global([data-d='C']) ul.clist > li.citem.alert,
  :global([data-d='D']) ul.clist > li.citem.alert{ background: var(--tone-band); }
  :global([data-d='A']) ul.clist > li.citem.on,
  :global([data-d='B']) ul.clist > li.citem.on,
  :global([data-d='C']) ul.clist > li.citem.on,
  :global([data-d='D']) ul.clist > li.citem.on{ background: var(--d-accent-soft); }
  /* A no usa el patrón `ul.clist >` en su base, así que necesita además su
     propio par al mismo peso. */
  :global([data-d='A']) ul.clist > li.citem.alert { background: var(--tone-band); }

  /* ==========================================================================
     EL ESTADO NO SE PIERDE POR DEBAJO DE LA SELECCIÓN.

     La fila 1 está vencida Y seleccionada, que es el caso normal: uno marca
     justamente lo que va a atender. Hasta acá ganaba la selección, repintaba el
     campo con el acento y el equipo más urgente de la pantalla dejaba de verse
     urgente en el momento exacto en que alguien lo tocaba.

     La regla es de jerarquía, no de estética: el estado es DATO y la selección
     es INTERACCIÓN. El dato se queda con el campo de la fila; la interacción se
     va al canto, a la casilla marcada y al peso del código. Las tres señales de
     selección siguen ahí y ninguna necesita el fondo.

     M y T no aparecen acá porque ya lo resuelven adentro de su propio bloque,
     cada una con su material: M con dos derrames que entran por lados opuestos,
     T con dos halos concéntricos. Las doce no finalistas quedan como estaban.
     ========================================================================== */
  :global([data-d='A']) .tbl tbody tr.alert.on td,
  :global([data-d='B']) .tbl tbody tr.alert.on td,
  :global([data-d='C']) .tbl tbody tr.alert.on td,
  :global([data-d='I']) .tbl tbody tr.alert.on td,
  :global([data-d='O']) .tbl tbody tr.alert.on td { background: var(--tone-band); }
  :global([data-d='A']) .tbl tbody tr.alert.on td.c-sel,
  :global([data-d='B']) .tbl tbody tr.alert.on td.c-sel,
  :global([data-d='C']) .tbl tbody tr.alert.on td.c-sel,
  :global([data-d='I']) .tbl tbody tr.alert.on td.c-sel,
  :global([data-d='O']) .tbl tbody tr.alert.on td.c-sel { box-shadow: inset 3px 0 0 var(--d-accent); }
  :global([data-d='A']) ul.clist > li.citem.alert.on,
  :global([data-d='B']) ul.clist > li.citem.alert.on,
  :global([data-d='C']) ul.clist > li.citem.alert.on,
  :global([data-d='I']) ul.clist > li.citem.alert.on { background: var(--tone-band); }

  /* ── Cifras en monoespaciada tabular ────────────────────────────────────
     Densidad de cabina: lecturas, conteos y retrasos en una columna que alinea
     dígito con dígito. Va en las seis finalistas que la ganan por densidad o
     por precisión. Bruma queda afuera a propósito: es la única dirección que
     declara exactamente dos familias tipográficas, y una tercera en cada
     lectura le rompería la tesis. (El código de equipo sí es mono en las
     diecinueve, porque un identificador es mono en todas partes: eso ya lo
     resuelve .d-id.) */
  :global([data-d='A']) .figs,
  :global([data-d='B']) .figs,
  :global([data-d='C']) .figs,
  :global([data-d='I']) .figs,
  :global([data-d='O']) .figs,
  :global([data-d='T']) .figs {
    font-family: var(--d-mono);
    font-size: .94em;
    letter-spacing: -.015em;
  }
</style>
