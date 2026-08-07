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
    <Direction id={d.id} flush={d.id === 'G'}>
      <div class="stack">
        <!-- ────────── 1 · LA TABLA ────────── -->
        <section class="spec">
          <p class="speclabel d-cap">Tabla de equipos</p>

          <div class="d-panel tablepanel">
            <div class="d-panel-head">
              <h3 class="d-panel-title">Equipos</h3>
              <span class="d-cap headnote">88 en la flota</span>
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
                      <td class="c-read d-num">{a.reading}</td>

                      <td class="c-state">
                        <span class="d-pill">
                          <svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf(a.tone)}</svg>
                          {a.state}
                        </span>
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
              <p class="fcount d-cap d-num">
                {from}–{to} de {sorted.length} equipos · {pickedCount} seleccionado{pickedCount === 1 ? '' : 's'}
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
            Fila 1 seleccionada · fila 2 vencida, la que pide atención · fila 3 con el cursor encima, fijo para poder
            verlo. Las acciones de fila aparecen al pasar el cursor y siempre están en el orden del tabulador.
          </p>
        </section>

        <!-- ────────── 2 · LA MISMA INFORMACIÓN SIN TABLA ────────── -->
        <section class="spec">
          <p class="speclabel d-cap">La misma información sin tabla</p>

          <div class="d-panel clistpanel">
            <div class="d-panel-head">
              <h3 class="d-panel-title">Lista compacta</h3>
              <span class="d-cap headnote">6 equipos</span>
            </div>
            <ul class="clist">
              {#each sorted as a (a.code)}
                <li class="citem d-rail" data-tone={a.tone} class:on={picked.has(a.code)} class:alert={a.tone === 'critical'}>
                  <span class="cicode d-cap d-id">{a.code}</span>
                  <div class="cibody">
                    <span class="cinm">{a.name}</span>
                    <span class="cimeta">{a.family} · {a.location}</span>
                    <span class="ciread d-num">{a.reading}</span>
                    <span class="d-pill">
                      <svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf(a.tone)}</svg>
                      {a.state}
                    </span>
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
          <p class="speclabel d-cap">Estado vacío</p>

          <div class="d-panel emptypanel">
            <div class="d-panel-head">
              <h3 class="d-panel-title">Equipos</h3>
              <span class="d-cap headnote">ninguno cargado</span>
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
              <p class="fcount d-cap d-num">0 de 0 equipos</p>
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
  .speclabel { margin: 0 0 var(--d-p1); }
  .note {
    margin: var(--d-p1) 0 0;
    font-size: var(--d-t-xs);
    line-height: 1.45;
    color: var(--d-ink-3);
  }
  .headnote { white-space: nowrap; }

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
  .fcount { margin: 0; min-width: 0; }
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
  .cicode { display: block; }
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
    transition: box-shadow 120ms ease, transform 120ms ease;
  }
  :global([data-d='A']) .citem:hover { box-shadow: var(--d-shadow-lg); transform: translateY(-1px); }
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
  /* La lista compacta también es un marco continuo con separadores internos. */
  :global([data-d='B']) .clist { border: var(--d-bw) solid var(--d-line); border-top: 0; }
  :global([data-d='B']) ul.clist > li.citem {
    grid-template-columns: 84px minmax(0, 1fr);
    gap: 0 var(--d-p2);
    align-items: center;
    padding: var(--d-p1) var(--d-p2);
    border-bottom: var(--d-bw) solid var(--d-line);
  }
  :global([data-d='B']) ul.clist > li.citem:last-child { border-bottom: 0; }
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
  /* La cabecera del bloque es teal lleno y .d-cap pinta en --d-brand: la nota
     de la derecha quedaba teal sobre teal, invisible. Va en tinta de marca. */
  :global([data-d='C']) .d-panel-head .d-cap { color: var(--d-brand-ink); }
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
  :global([data-d='E']) .tbl { border-spacing: 0 4px; min-width: 660px; }
  :global([data-d='E']) .tbl th,
  :global([data-d='E']) .tbl td { border: 0; padding: 0 var(--d-p2); }
  :global([data-d='E']) .tbl thead th { background: transparent; padding-bottom: var(--d-p1); }
  :global([data-d='E']) .tbl tbody td { border-bottom: 0; height: var(--d-row-h); }
  :global([data-d='E']) .tbl tbody td.c-sel { border-radius: var(--d-r) 0 0 var(--d-r); }
  :global([data-d='E']) .tbl tbody td.c-act { border-radius: 0 var(--d-r) var(--d-r) 0; }
  :global([data-d='E']) .tbl tbody tr.on td.c-sel { box-shadow: none; }
  :global([data-d='E']) .pick { --pick: 22px; border: 0; border-radius: var(--d-r-pill); background: var(--d-sunk); }
  :global([data-d='E']) .pick:checked, :global([data-d='E']) .pick:indeterminate { background: var(--d-accent); }
  :global([data-d='E']) .acts .d-btn { min-height: 34px; padding-inline: var(--d-p2); }
  :global([data-d='E']) .d-pill svg { width: 11px; height: 11px; }
  :global([data-d='E']) .clist { gap: var(--d-p2); padding-bottom: var(--d-p2); }
  :global([data-d='E']) ul.clist > li.citem { border-radius: var(--d-r-lg); padding: var(--d-p2) var(--d-p3); min-height: var(--d-row-h); align-content: center; }
  :global([data-d='E']) ul.clist > li.citem:hover { background: var(--d-sunk); }
  :global([data-d='E']) .empty { padding: var(--d-p2) 0 var(--d-p3); gap: var(--d-p3); }
  :global([data-d='E']) .etitle { font-size: var(--d-t-xl); }

  /* ── F · TERMINAL — rejilla de caracteres de 24px, cursor y bloques ────── */
  :global([data-d='F']) .tbl { min-width: 560px; }
  :global([data-d='F']) .tbl th,
  :global([data-d='F']) .tbl td { border: 0; padding: 0 var(--d-p2); height: var(--d-row-h); }
  :global([data-d='F']) .tbl thead th { background: transparent; border-bottom: var(--d-bw) solid var(--d-line); }
  :global([data-d='F']) .hcap { color: var(--d-accent); }
  :global([data-d='F']) .tbl thead th[aria-sort]:not([aria-sort='none']) .hcap {
    background: var(--d-accent); color: var(--d-accent-ink); padding-inline: 4px;
  }
  :global([data-d='F']) .tbl tbody td { border-bottom: 0; }
  :global([data-d='F']) .tbl tbody tr.on td.c-sel { box-shadow: none; }
  :global([data-d='F']) .cursor::before { content: '\00a0\00a0'; }
  :global([data-d='F']) .tbl tbody tr.on .cursor::before { content: '> '; color: var(--d-accent); }
  :global([data-d='F']) .d-pill { border: 0; padding: 0 var(--d-p2); }
  :global([data-d='F']) tr.alert .d-pill, :global([data-d='F']) li.alert .d-pill {
    background: var(--tone-fg); color: var(--d-ground);
  }
  :global([data-d='F']) .pick { --pick: 12px; }
  :global([data-d='F']) .sortmark::before { content: '^'; }
  :global([data-d='F']) .sortmark[data-dir='desc']::before { content: 'v'; }
  :global([data-d='F']) .clist { background: var(--d-sunk); }
  :global([data-d='F']) ul.clist > li.citem {
    grid-template-columns: 82px minmax(0, 1fr);
    gap: 0 var(--d-p2);
    align-items: center;
    min-height: var(--d-row-h);
    padding: 0 var(--d-p2);
  }
  :global([data-d='F']) .cibody { flex-wrap: nowrap; overflow: hidden; }
  :global([data-d='F']) .cinm { flex-basis: auto; }
  :global([data-d='F']) .etitle::before { content: '! '; color: var(--d-att); }
  :global([data-d='F']) .empty { padding-block: var(--d-p2); }

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
  :global([data-d='G']) li.citem.alert { background: transparent; }
  :global([data-d='G']) .cicode { text-align: right; }
  :global([data-d='G']) .empty { padding: var(--d-p3) var(--d-p3) var(--d-p4); }

  /* ── H · FICHA — pestaña arriba, regla doble, renglones de fichero ─────── */
  :global([data-d='H']) .headnote { display: none; }
  :global([data-d='H']) .tbl thead th { border-bottom: calc(var(--d-bw) * 4) double var(--d-edge); }
  :global([data-d='H']) .tbl tbody tr:nth-child(even) td { background: var(--d-sunk); }
  :global([data-d='H']) .tbl tbody tr:hover td,
  :global([data-d='H']) .tbl tbody tr.is-hover td { background: var(--d-neu-band); }
  :global([data-d='H']) .tbl tbody tr.on td { background: var(--d-accent-soft); }
  :global([data-d='H']) .tbl tbody tr.on td.c-sel { box-shadow: inset 3px 0 0 var(--d-accent); }
  :global([data-d='H']) ul.clist > li.citem {
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0 var(--d-p2);
    align-items: baseline;
    border-bottom: var(--d-bw) solid var(--d-line);
  }
  :global([data-d='H']) ul.clist > li.citem:last-child { border-bottom: 0; }
  :global([data-d='H']) .cicode {
    background: var(--d-sunk);
    border: var(--d-bw) solid var(--d-edge);
    border-radius: var(--d-r) var(--d-r) 0 0;
    padding: 1px var(--d-p1);
  }
  :global([data-d='H']) .empty { padding-block: var(--d-p2) var(--d-p3); }

  /* ==========================================================================
     RESPONSIVE — la celda manda, no la ventana. Familia, ubicación y lectura se
     pliegan bajo el nombre del equipo; la lista compacta es la salida real.
     ========================================================================== */
  @container spec (max-width: 720px) {
    .tbl,
    :global([data-d='E']) .tbl,
    :global([data-d='F']) .tbl,
    :global([data-d='G']) .tbl { min-width: 0; }
    .c-fam, .c-loc, .c-read { display: none; }
    .sub { display: block; }
    .c-name { min-width: 130px; white-space: normal; }
    .nm { white-space: normal; }
    :global([data-d='G']) ul.clist > li.citem { grid-template-columns: minmax(0, 1fr); padding-left: var(--d-p3); }
    :global([data-d='G']) .cicode { text-align: left; }
    :global([data-d='B']) ul.clist > li.citem,
    :global([data-d='F']) ul.clist > li.citem,
    :global([data-d='H']) ul.clist > li.citem { grid-template-columns: minmax(0, 1fr); }
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
</style>
