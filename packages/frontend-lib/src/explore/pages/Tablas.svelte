<script>
  // TABLAS Y LISTAS · la familia más dura de las ocho.
  //
  // Una tabla es donde una dirección se rompe o se sostiene: 4 filas, 8 columnas,
  // nombres largos de verdad ("Compactadora Wacker DPU-6555"), un estado que no
  // puede depender del color, y acciones que aparecen al pasar el cursor pero que
  // el teclado nunca pierde. Se muestran tres especímenes por dirección: la tabla
  // con su cabecera ordenada y su pie paginado, la misma información sin tabla, y
  // el estado vacío dentro del mismo contenedor.
  import { ASSETS, COPY, PLANS, markOf } from '../demo.js';
  import Grid from '../Grid.svelte';
  import Direction from '../Direction.svelte';

  export let directions = [];

  // ── LA COTA · el tope de cada cifra ──────────────────────────────────────
  // Una cota necesita DOS números y ASSETS trae uno solo, la lectura. El tope
  // vive en PLANS ("cada 250 h"), que es el mismo dato con el que se arma el
  // plan, así que se lee de ahí y no se escribe a mano en ninguna parte.
  //
  // El riel se dibuja con la razón entre las dos cifras que quedan escritas al
  // lado, no con el porcentaje declarado aparte en ASSETS.pct. En un sistema
  // que se llama Cota, un dibujo de medida que no coincide con su propio pie es
  // lo único que no se puede permitir: 312 sobre 250 son 125 y el riel tiene que
  // decir 125. Las demás direcciones siguen usando pct y no se tocan.
  function cifra(txt) {
    const digitos = String(txt).replace(/[^\d]/g, '');
    return digitos ? Number(digitos) : null;
  }
  function unidad(txt) {
    const m = String(txt).match(/[a-zA-Z]+$/);
    return m ? m[0] : '';
  }
  // Mismo separador de miles que el contenido: espacio, no coma.
  function miles(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  const TOPES = {};
  for (const p of PLANS) TOPES[p.asset] = p.every.replace(/^cada\s+/, '');

  const COTA = {};
  for (const a of ASSETS) {
    const leida = cifra(a.metric);
    const tope = TOPES[a.code] ? cifra(TOPES[a.code]) : null;
    // Sin lectura no hay cota. Un riel vacío con una marca es una promesa de
    // medida que nadie tomó, y eso miente más que no dibujar nada.
    if (leida === null || !tope) continue;
    const u = unidad(a.metric);
    const dif = Math.abs(leida - tope);
    COTA[a.code] = {
      n: miles(leida),
      u,
      tope: miles(tope) + ' ' + u,
      pct: Math.round((leida / tope) * 100),
      holgura: (leida > tope ? 'se pasó ' : 'faltan ') + miles(dif) + ' ' + u,
      fuente: a.source
    };
  }

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
                        <!-- El renglón de contexto se parte en dos para que una
                             dirección pueda quedarse con la mitad. El texto
                             renderizado es idéntico al de antes: el espacio que
                             abre el tramo va como expresión porque un espacio
                             suelto contra el borde de una etiqueta lo recorta el
                             compilador y las otras diecinueve perderían uno. -->
                        <span class="sub">{a.family} · {a.location}<span class="subread">{' '}· {a.reading}</span></span>
                      </td>

                      <td class="c-fam">{a.family}</td>
                      <td class="c-loc">{a.location}</td>

                      <!-- La lectura, en texto y en cota. Las diecinueve
                           direcciones muestran el texto y la cota va oculta;
                           Cota hace lo contrario, porque en ella una cifra
                           medida nunca aparece sola. -->
                      <td class="c-read figs">
                        <span class="readtxt" class:solo={!COTA[a.code]}>{a.reading}</span>
                        {#if COTA[a.code]}
                          {@const c = COTA[a.code]}
                          <span class="cota d-cota" data-tone={a.tone} style="--cota:{c.pct}">
                            <span class="d-cota-fig"><b>{c.n}</b> <span>{c.u}</span></span>
                            <span class="d-cota-rail" aria-hidden="true"><i class="d-cota-fill"></i><i class="d-cota-tick"></i></span>
                            <span class="d-cota-note">tope {c.tope}<span class="ct-slack">{' '}· {c.holgura}</span></span>
                          </span>
                        {/if}
                      </td>

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
                    <span class="ciread readtxt figs" class:solo={!COTA[a.code]}>{a.reading}</span>
                    <span class="d-pill">
                      <svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf(a.tone)}</svg>
                      {a.state}
                    </span>
                    {#if a.tone === 'critical'}<span class="due figs">{a.due}</span>{/if}
                    <span class="ciact d-btn-group">
                      <button class="d-btn d-btn--sm d-btn--ghost" type="button" aria-label="Registrar lectura de {a.code}">Lectura</button>
                    </span>
                    <!-- La misma cota, sin comprimir: acá hay renglón entero, así
                         que la cifra va grande y el pie dice el tope, cuánto falta
                         o cuánto se pasó, y de dónde salió el número. -->
                    {#if COTA[a.code]}
                      {@const c = COTA[a.code]}
                      <span class="cota citcota d-cota" data-tone={a.tone} style="--cota:{c.pct}">
                        <span class="d-cota-fig"><b>{c.n}</b> <span>{c.u}</span></span>
                        <span class="d-cota-rail" aria-hidden="true"><i class="d-cota-fill"></i><i class="d-cota-tick"></i></span>
                        <span class="d-cota-note">tope {c.tope} · {c.holgura} · {c.fuente}</span>
                      </span>
                    {/if}
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
  /* La cota está en el marcado de las veinte y apagada por defecto: es la firma
     de una sola dirección y encenderla en las otras diecinueve sería mudarlas.
     La enciende X, y sólo X, mucho más abajo. */
  .cota { display: none; }

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

  
  /* La fila vencida no se marca sólo con un fondo de color: se DIBUJA con más
     peso de línea. En un plano técnico el grosor del trazo es el idioma, y una
     fila trazada en tinta contra hairlines grises se ve con los ojos entornados
     y sin distinguir un solo color. */
  /* Una botonera es un marco continuo, no tres botones sueltos: la regla ya la
     cumplía .d-btn-group y el paginador se había quedado afuera. */
  /* El contenedor de tarjeta sobra. La lista tenía DOS marcos, el del panel con
     sus marcas de esquina y el suyo propio: en densidad de cabina eso es chrome
     que no informa. Queda un solo marco y la etiqueta pasa a estar fuera de él,
     que es la regla declarada de esta dirección. */
  /* Un renglón por equipo, sin plegado: es una rejilla, no una pila de fichas. */

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

  
  /* La columna ordenada se recorta en negativo sobre la barra tinta: masa, no color. */

  /* ── E · AIRE — filas de 56px, cero líneas duras, selección en pastilla ── */

  /* ── F · TERMINAL — rejilla de caracteres de 24px, cursor y bloques ────── */

  

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

  
  /* El cursor encima aclara la superficie; el resplandor sigue siendo del
     estado. Así hover y estado no se pisan. */
  /* Sin borde visible la casilla desaparece: --d-edge es transparent en K, así
     que el anillo lo pone el tono neutro, que sí está declarado. */
  /* El resplandor solo no alcanza: sin relleno la marca es tinta oscura sobre
     --d-sunk, que en K también es casi negro. Se rellena de acento y la marca
     pasa a ser --d-accent-ink (#04140F) sobre menta: se lee, y el halo sigue
     siendo lo que dice «marcada» desde lejos. */

  
  /* Misma reposición que en I: sin ella la marca blanca cae sobre --d-sunk
     crema y la casilla marcada no se distingue de la vacía. */

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

  
  /* HALLAZGO: --d-surface-fill y --d-sunk-fill de N son degradados a 100deg
     pensados para un carril de una sola pieza. Dentro de una <table> cada celda
     reinicia el degradado y el carril sale aserrado, que es lo contrario de lo
     que la dirección promete. Acá el degradado se lleva al extremo de entrada
     —la celda de selección, que es donde arranca el carril— y el cuerpo queda
     en el color plano, así la cinta se lee de una sola pieza. Un token
     --d-surface-flat/--d-sunk-flat no hace falta: los colores planos ya están. */
  /* El tono entra por la punta del carril y se derrama hacia adentro. */
  /* El carril seleccionado se monta encima de todos y levanta más sombra. */
  /* Aire a los costados: sin él las puntas redondas del carril se cortan contra
     el canto del panel y la cinta vuelve a parecer una fila cuadrada. */
  /* Se montan unos milímetros: eso es lo que obliga a que haya orden. */

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

  
  /* La muesca: la espina sigue siendo marca arriba y abajo, y en el tramo del
     medio la muerde el tono de la fila. */

  
  /* La columna ordenada se marca con masa, no invirtiendo la tinta: el barrido
     húmedo del panel cae sobre la cabecera y aclararía cualquier fondo oscuro
     hasta dejar el texto claro por debajo de AA. Un canto negro de 4px aguanta
     el velo y es más de esta dirección que un bloque de color. */
  /* La fila seleccionada es una placa de laca clara con un canto macizo. La
     tentación era invertirla a rojo lleno, pero el barrido del panel le pasa
     por encima y una tinta clara ahí abajo no llega a AA: la selección la carga
     la masa del canto, que el velo no puede lavar. */
  /* La lista: bloques macizos, cada uno con su sombra sólida y su brillo. */

  

  
  /* Vencido proyecta rojo, al día proyecta verde, y el texto se lee sobre
     blanco puro en los dos casos. */
  /* La pastilla pierde su banda: sobre una tarjeta que se quedó blanca, el
     color vive en la palabra y en la marca, no en un relleno. */

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

  /* ── W · CRISTAL TEMPLADO — el vidrio se queda en el panel ─────────────────
     W es Cristal corregido, y una tabla es donde la corrección se ve.

     Cristal disuelve el panel de la lista y convierte cada ítem en una lámina de
     vidrio con su propio desenfoque. W hace exactamente lo contrario: el panel
     es la única pieza que desenfoca, porque es la única que se queda quieta, y
     todo lo que vive adentro es plano. Filas y renglones son bandas opacas sin
     anillo, sin margen y sin resplandor.

     Y el halo, que en Cristal halo era el tratamiento de estado por defecto,
     queda en UNA cosa y es la más chica de la pantalla: la píldora de la fila
     vencida. Esa decisión resuelve dos reglas a la vez. En una fila plana el
     resplandor no se vería igual: las filas se tocan, la de abajo se pinta
     después y le tapa el halo a la de arriba. En la píldora hay aire alrededor,
     el halo se ve, y el que salta es el dato exacto que urge en vez de un
     rectángulo de 620px. Es además el valor que W ya declara para .d-pill en
     directions.css, sólo que apuntado al marcado que esta página sí produce.

     La regla 1 no tiene dónde aplicarse acá: en esta página nada flota. Ni
     menús, ni globos, ni diálogos. */

  /* El panel desenfoca, así que el panel recorta: sin esto el pie cuadrado y la
     última fila se salen de los 22px del canto y el vidrio deja de ser una
     pieza. Los tres paneles quedan a la MISMA altura de sombra a propósito: son
     tres especímenes de lo mismo y levantar uno diría algo que no es cierto. */
  :global([data-d='W']) .tablepanel,
  :global([data-d='W']) .clistpanel,
  :global([data-d='W']) .emptypanel { overflow: hidden; }

  /* LA ESCALERA DE DENSIDAD. Es la que Cristal tenía rota y W hereda: cabecera y
     fila bajo el cursor pintaban las dos --d-sunk y eran indistinguibles. Tres
     escalones honestos, los tres de vidrio: cabecera --d-surface, que es el
     vidrio más espeso porque es lo que no se mueve; cursor encima --d-sunk;
     fila en reposo transparente, que deja ver el campo. */
  :global([data-d='W']) .tbl thead th {
    background: var(--d-surface);
    border-bottom: 1px solid var(--d-edge);
    box-shadow: inset 0 1px 0 var(--d-line);   /* el filo especular, no una línea */
  }
  /* Las hairlines de la base son --d-line, que en W es blanco al 70 %. Blanco
     sobre vidrio blanco no separa nada, y con seis filas eso es la diferencia
     entre una tabla y una mancha. */
  :global([data-d='W']) .tbl tbody td { border-bottom-color: var(--d-edge); }
  /* La columna ordenada no cambia de espesor, que rompería la escalera: enciende
     un canto de acento y se lleva la etiqueta al mismo color. El acento sobre el
     vidrio de la cabecera da 6.9:1. */
  :global([data-d='W']) .tbl thead th[aria-sort]:not([aria-sort='none']) {
    box-shadow: inset 0 1px 0 var(--d-line), inset 0 -2px 0 var(--d-accent);
  }
  :global([data-d='W']) .tbl thead th[aria-sort]:not([aria-sort='none']) .hcap { color: var(--d-accent); }

  /* La banda de la fila vencida es OPACA, que es la razón por la que W declara
     sus tonos en hex lleno y no en rgba. Y no se le va al pasar el cursor: en la
     base ganaba el hover y la fila más urgente perdía su banda justo cuando
     alguien la estaba apuntando. El estado es dato; el cursor es un accidente. */
  :global([data-d='W']) .tbl tbody tr.alert:hover td,
  :global([data-d='W']) .tbl tbody tr.alert.is-hover td { background: var(--tone-band); }

  /* El estado entra por la izquierda y la selección por la derecha. La fila 1
     está vencida Y marcada, que es el caso normal porque uno marca justamente lo
     que va a atender: así muestra las dos cosas y ninguna tapa a la otra. Las
     otras tres señales de selección siguen donde estaban, en la casilla, en el
     peso del código y en el conteo del pie. */
  :global([data-d='W']) .tbl tbody tr.on td.c-sel { box-shadow: none; }
  :global([data-d='W']) .tbl tbody tr.on td.c-act { box-shadow: inset -3px 0 0 var(--d-accent); }
  :global([data-d='W']) .tbl tbody tr.alert.on td { background: var(--tone-band); }
  :global([data-d='W']) .tbl tbody tr.alert td.c-sel,
  :global([data-d='W']) .tbl tbody tr.alert.on td.c-sel { box-shadow: inset 3px 0 0 var(--d-crit);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }

  /* EL ÚNICO HALO DE LA PÁGINA, en tabla y en lista. Dos píldoras encendidas
     entre diez es una pantalla que dice algo; diez encendidas no dicen nada. */
  :global([data-d='W']) .tbl tbody tr.alert .d-pill,
  :global([data-d='W']) ul.clist > li.citem.alert .d-pill { box-shadow: 0 0 12px -5px var(--d-crit); }

  /* La casilla es un CONTROL, y en W los controles son opacos.
     HALLAZGO: el único token sólido que W declara es --d-overlay, y está
     reservado para lo que flota. Falta un token de superficie opaca que NO
     flota; directions.css lo esquiva escribiendo #FFFFFF a mano en .d-input.
     Acá se usa --d-overlay antes que un hex y queda anotado.
     El anillo va en --d-ink-3 y no en --d-edge: --d-edge es rgba(14,23,32,.16),
     que sobre vidrio claro da 1.5:1, y una casilla vacía a 1.5:1 no se ve. */
  :global([data-d='W']) .pick {
    background: var(--d-overlay);
    border-color: var(--d-ink-3);
  }
  /* Y hay que reponer el relleno de marcado. Esta regla y `.pick:checked` pesan
     lo mismo una vez que Svelte les cuelga la clase de ámbito, así que gana la
     última, que es la de la dirección. Sin esto la marca blanca cae sobre blanco
     y la casilla marcada se ve igual que la vacía. Misma trampa que ya hubo que
     reponer en I, K, L y T. */
  :global([data-d='W']) .pick:checked,
  :global([data-d='W']) .pick:indeterminate {
    background: var(--d-accent);
    border-color: var(--d-accent);
  }

  /* LA CORRECCIÓN QUE MÁS SE VE. En Cristal el panel de la lista se apaga y cada
     ítem pasa a ser una lámina de vidrio con su propio backdrop-filter: seis
     desenfoques apilados para seis renglones de texto. En W el vidrio se queda
     donde estaba, en el panel, y los seis renglones son renglones: banda opaca
     donde hay estado, una hairline entre medio y nada más. Seis láminas son seis
     objetos; seis renglones son una lista. */
  :global([data-d='W']) ul.clist > li.citem { border-bottom: 1px solid var(--d-edge); }
  :global([data-d='W']) ul.clist > li.citem:last-child { border-bottom: 0; }
  :global([data-d='W']) ul.clist > li.citem.alert {
    background: var(--tone-band);
    box-shadow: inset 3px 0 0 var(--d-crit);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }
  :global([data-d='W']) ul.clist > li.citem.on {
    background: var(--d-accent-soft);
    box-shadow: inset -3px 0 0 var(--d-accent);
  }
  :global([data-d='W']) ul.clist > li.citem.alert.on {
    background: var(--tone-band);
    box-shadow: inset 3px 0 0 var(--d-crit), inset -3px 0 0 var(--d-accent);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }
  :global([data-d='W']) .empty { padding-block: var(--d-p3); }
  /* NO se toca .d-btn en W. directions.css ya repara ahí el primario, y una
     regla de página sobre .d-btn pesaría más que esa reparación y devolvería el
     botón blanco con tinta blanca. El primario de W da 8.0:1 tal como está. */

  /* ══ X · COTA · un libro de bodega, no una pantalla de software ════════════

     Dos reglas gobiernan todo lo que sigue y las dos son duras.

     1 · EL COLOR ESTÁ RESERVADO AL ESTADO. Cabecera, reglas, casillas, riel,
         acento y botones van en acromático. La consecuencia es funcional y no
         estética: como no hay ningún otro color en pantalla, el ojo encuentra la
         fila vencida antes de leer una palabra.

     2 · NINGUNA CIFRA MEDIDA APARECE SOLA. La columna de lectura deja de ser
         texto y pasa a ser cota. «312 h» no significa nada; «312 h con la marca
         de 250 h atrás» significa que se pasó, y como el riel se dibuja hasta el
         150 % del tope, también se ve cuánto.

     DÓNDE NO VA LA COTA, que importa lo mismo. El conteo de la cabecera (88 en
     la flota), el rango del pie (1 a 4 de 6) y el estado vacío no se miden
     contra ningún tope: son cardinales, no lecturas. Una cota sin marca es una
     barra de progreso y una barra de progreso decorativa es ruido. Ahí quedan
     cifras tabulares y nada más.
     ═════════════════════════════════════════════════════════════════════════ */

  :global([data-d='X']) .cota { display: grid; }

  /* La lectura en texto se retira: su cifra ES la de la cota y ponerlas a diez
     píxeles una de otra sería decir dos veces lo mismo. Se queda sólo donde no
     hay cota que poner, que es el equipo que nunca se midió, y ahí baja a gris
     porque lo que informa es la ausencia. */
  :global([data-d='X']) .readtxt:not(.solo) { display: none; }
  :global([data-d='X']) .readtxt.solo { color: var(--d-ink-3); }
  /* Y no vuelve por la puerta de atrás: el renglón de contexto que aparece en
     celda angosta llevaba la lectura otra vez. */
  :global([data-d='X']) .subread { display: none; }

  /* EL RIEL SE DIBUJA EN TINTA. Teñirlo del tono de cada fila habría puesto
     verde, ámbar y rojo en las seis a la vez, y entonces el rojo de la que se
     pasó tendría con qué competir: exactamente lo que la regla 1 existe para
     impedir. El riel MIDE; el color aparece cuando la medida cruza la marca. */
  :global([data-d='X']) .d-cota-fill { background: var(--d-ink-2); }
  :global([data-d='X']) .d-cota[data-tone='critical'] .d-cota-fill { background: var(--d-crit); }

  /* LA COTA COMPRIMIDA, en la columna de lectura de la tabla.
     La fila mide 38 px, así que la cifra y el pie comparten renglón y el riel
     corre debajo de los dos a lo ancho de la columna entera. Que el riel sea una
     columna de tabla es lo que hace el truco: todas las filas miden con la misma
     regla, la marca del tope cae en el mismo píxel en las seis, y esa marca
     alineada verticalmente es una línea de cota de plano bajando por la pantalla.
     Se compara sin leer. */
  :global([data-d='X']) .c-read .d-cota {
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: var(--d-p2);
    row-gap: 3px;
    align-items: baseline;
  }
  /* Fila y columna EXPLÍCITAS en las tres piezas. Con la colocación automática,
     el riel ocupa las dos columnas del segundo renglón y empuja el pie a un
     tercero: la cota crece a 39 px y la fila de 38 px deja de ser de 38 px. */
  :global([data-d='X']) .c-read .d-cota-fig {
    grid-area: 1 / 1;
    font-size: var(--d-t-sm);
    letter-spacing: -.015em;
  }
  :global([data-d='X']) .c-read .d-cota-note {
    grid-area: 1 / 2;
    font-size: var(--d-t-2xs);
  }
  :global([data-d='X']) .c-read .d-cota-rail { grid-area: 2 / 1 / 3 / -1; align-self: center; }

  /* LA COTA ENTERA, en la lista. Acá hay renglón propio, así que la cifra sube a
     --d-t-xl con el tracking negativo que ya trae la primitiva: peso contra peso,
     que es de donde sale la personalidad cuando no hay fuente que elegir.
     La caja pide renglón entero y no se le pone tope de ancho: al recortarla, el
     navegador usa el ancho ya recortado para decidir el salto de línea y la cota
     se le sube al costado del botón de la fila. Se acota el RIEL, que es lo que
     de verdad sobra.
     HALLAZGO: X no expone un ancho de riel (--d-cota-w). Un riel de 900 px para
     una lectura de tres dígitos no mide mejor, mide peor, así que queda escrito
     en una medida relativa a la tipografía y no en un pixel suelto. */
  :global([data-d='X']) .citcota {
    flex-basis: 100%;
    margin-top: var(--d-p1);
  }
  :global([data-d='X']) .citcota .d-cota-rail { max-width: min(100%, 40ch); }
  /* La acción deja de irse al canto derecho. Con la cota ocupando su propio
     renglón, un botón anclado a 700 px del último dato con el que tiene algo que
     ver deja de leerse como parte del renglón y pasa a leerse como otra cosa. En
     un libro los asientos corren hacia la izquierda y lo que sigue viene después. */
  :global([data-d='X']) .ciact { margin-left: 0; }

  /* La cabecera es la regla gruesa del libro. La columna ordenada se marca con
     MASA y no con color: canto de tinta de 2 px y la etiqueta sube de --d-ink-3
     a tinta llena. Un bloque de acento acá sería el único color de la pantalla
     que no significa un estado. */
  :global([data-d='X']) .tbl thead th { border-bottom-color: var(--d-edge); }
  :global([data-d='X']) .tbl thead th[aria-sort]:not([aria-sort='none']) {
    box-shadow: inset 0 -2px 0 var(--d-ink);
  }
  :global([data-d='X']) .tbl thead th[aria-sort]:not([aria-sort='none']) .hcap {
    color: var(--d-ink);
    font-weight: var(--d-w-semi);
  }

  /* EL ESTADO ES UN FILO DE 3 px EN EL CANTO y no tiñe una sola letra. Rellenar
     la fila obliga a re-verificar contraste en cinco tonos y ensucia la lectura;
     el filo no toca nada y se ve igual de lejos. Sólo lo vencido lleva además
     una banda, y apenas: es el único estado que interrumpe una jornada. */
  :global([data-d='X']) .tbl tbody tr[data-tone] td.c-sel { box-shadow: inset 3px 0 0 var(--tone-fg); }

  /* Estado por la izquierda, selección por la derecha. La fila 1 está vencida Y
     marcada, que es el caso normal porque uno marca justo lo que va a atender:
     así se ven las dos y ninguna tapa a la otra. Las otras señales de selección
     siguen donde estaban: la casilla, el peso del código y el conteo del pie. */
  :global([data-d='X']) .tbl tbody tr.on td.c-sel { box-shadow: inset 3px 0 0 var(--tone-fg); }
  :global([data-d='X']) .tbl tbody tr.on td.c-act { box-shadow: inset -3px 0 0 var(--d-accent); }

  /* El cursor encima no le quita la banda a la fila vencida. El estado es DATO y
     el cursor es un accidente; en la base ganaba el cursor y la fila más urgente
     perdía su marca justo cuando alguien la estaba apuntando. */
  :global([data-d='X']) .tbl tbody tr.alert:hover td,
  :global([data-d='X']) .tbl tbody tr.alert.is-hover td,
  :global([data-d='X']) .tbl tbody tr.alert.on td { background: var(--tone-band); }

  /* La casilla vacía traía el anillo en --d-edge (#C4C7C5), que sobre el papel
     blanco de X da 1.7:1 y no llega al 3:1 que pide un control. Sube a --d-ink-3,
     6.0:1, y el relleno de marcada hay que reponerlo porque esta regla y la
     `.pick:checked` de la base pesan igual y gana la última. */
  :global([data-d='X']) .pick { border-color: var(--d-ink-3); }
  :global([data-d='X']) .pick:checked,
  :global([data-d='X']) .pick:indeterminate {
    background: var(--d-accent);
    border-color: var(--d-accent);
  }

  /* HALLAZGO, y no se repara acá a propósito: [data-d='X'] .d-btn deja el borde
     en --d-edge, 1.7:1 contra la superficie, por debajo del 3:1 de un control.
     Una regla de página sobre .d-btn pesaría (0,2,0) contra el (0,1,0) de
     .d-btn--primary y devolvería el primario blanco sobre blanco, que es la
     trampa que ya se cobró seis páginas en este proyecto. El arreglo va en el
     bloque de tokens de X, subiendo el borde del botón a --d-ink-3. */

  /* LA LISTA · el mismo libro sin columnas. Renglón reglado, filo de estado en el
     canto y la cota entera abajo. Se escriben los cuatro estados al mismo peso
     que la base de la dirección porque `ul.clist > li.citem` gana por
     especificidad a `.citem.alert`, que es como esta página perdió el estado en
     siete direcciones antes de que alguien lo notara. */
  :global([data-d='X']) ul.clist > li.citem {
    border-bottom: max(var(--d-bw), 1px) solid var(--d-line);
    box-shadow: inset 3px 0 0 var(--tone-fg);
    padding-left: calc(var(--d-p3) + 3px);
  }
  :global([data-d='X']) ul.clist > li.citem:last-child { border-bottom: 0; }
  :global([data-d='X']) ul.clist > li.citem.alert { background: var(--tone-band); }
  :global([data-d='X']) ul.clist > li.citem.on {
    background: var(--d-accent-soft);
    box-shadow: inset 3px 0 0 var(--tone-fg), inset -3px 0 0 var(--d-accent);
  }
  :global([data-d='X']) ul.clist > li.citem.alert.on {
    background: var(--tone-band);
    box-shadow: inset 3px 0 0 var(--tone-fg), inset -3px 0 0 var(--d-accent);
  }

  /* El estado vacío es la misma hoja con nada escrito. */
  :global([data-d='X']) .empty { padding-block: var(--d-p3) var(--d-p4); }
  :global([data-d='X']) .etitle { letter-spacing: -.015em; }

  /* ==========================================================================
     RESPONSIVE — la celda manda, no la ventana. Familia, ubicación y lectura se
     pliegan bajo el nombre del equipo; la lista compacta es la salida real.
     ========================================================================== */
  @container spec (max-width: 720px) {
    .tbl{ min-width: 0; }
    .c-fam, .c-loc, .c-read { display: none; }
    .sub { display: block; }
    .c-name { min-width: 130px; white-space: normal; }
    .nm { white-space: normal; }
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
    /* R es la más densa: su lista compacta también se vuelve rejilla de 26px. */
  }
  @container spec (max-width: 720px) {
    /* Sin ancho, el carril de N y la piedra de L pierden el aire de los
       costados antes que la legibilidad del texto. */
    :global([data-d='T']) .tblwrap { padding-inline: 0; }
    /* En celda angosta B pliega su lista a un renglón por campo, como el resto:
       una rejilla de dos columnas dentro de 300px deja un carácter por línea. */
  }

  /* ── Estado de fila en las direcciones que no lo repusieron ──────────────
     La regla genérica `.citem.alert` pesa menos que la base de cada dirección
     (`ul.clist > li.citem`), así que moría en silencio: la fila vencida y la
     seleccionada se veían exactas a una normal. Estas reponen al mismo peso
     que la base. No es un retoque estético — sin esto, la lista compacta no
     comunica estado en siete de las diecinueve. */
  :global([data-d='A']) ul.clist > li.citem.alert,
  :global([data-d='C']) ul.clist > li.citem.alert{ background: var(--tone-band); }
  :global([data-d='A']) ul.clist > li.citem.on,
  :global([data-d='C']) ul.clist > li.citem.on{ background: var(--d-accent-soft); }
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
  :global([data-d='C']) .tbl tbody tr.alert.on td,
  :global([data-d='I']) .tbl tbody tr.alert.on td,
  :global([data-d='O']) .tbl tbody tr.alert.on td { background: var(--tone-band); }
  :global([data-d='A']) .tbl tbody tr.alert.on td.c-sel,
  :global([data-d='C']) .tbl tbody tr.alert.on td.c-sel,
  :global([data-d='I']) .tbl tbody tr.alert.on td.c-sel,
  :global([data-d='O']) .tbl tbody tr.alert.on td.c-sel { box-shadow: inset 3px 0 0 var(--d-accent); }
  :global([data-d='A']) ul.clist > li.citem.alert.on,
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
  :global([data-d='C']) .figs,
  :global([data-d='I']) .figs,
  :global([data-d='O']) .figs,
  :global([data-d='T']) .figs {
    font-family: var(--d-mono);
    font-size: .94em;
    letter-spacing: -.015em;
  }

  /* ==========================================================================
     W · CRISTAL TEMPLADO · piso de artesanía y pantalla angosta.

     Separado del bloque de arriba por la misma razón que en directions.css, que
     también parte a W en dos: el material es una cosa y las condiciones en las
     que se usa son otra. Ninguna de estas reglas cambia la dirección. La
     sostienen cuando el aparato, la preferencia o el ancho la aprietan.
     ========================================================================== */

  /* CIFRAS EN MONOESPACIADA TABULAR. La lectura, el conteo y sobre todo el
     retraso son la columna que se compara de un vistazo, y comparar dígitos pide
     que los dígitos se alineen. «hace 12 d» es el dato que decide si el técnico
     va hoy o el lunes. Va en W por la misma razón que ya va en Cristal. */
  :global([data-d='W']) .figs {
    font-family: var(--d-mono);
    font-size: .94em;
    letter-spacing: -.015em;
  }

  /* Nombres largos de verdad. «Compactadora Wacker DPU-6555» en una columna de
     130px necesita permiso para partirse; sin él empuja la tabla entera y el
     scroll horizontal se va varios cientos de píxeles más lejos. */
  :global([data-d='W']) .nm,
  :global([data-d='W']) .cinm { overflow-wrap: break-word; }

  /* QUÉ HACE W A 380px, DECLARADO.

     La tabla NO se vuelve tarjetas. El espécimen 2 de esta misma página ya es la
     respuesta en tarjetas, y convertir la tabla en lo mismo dejaría dos
     especímenes idénticos y borraría justo la comparación que la página existe
     para hacer. La tabla sigue siendo una tabla y el ancho que le sobra se paga
     con SCROLL HORIZONTAL CONTENIDO dentro de .tblwrap, que ya trae
     overscroll-behavior-x: contain, así que el gesto no se escapa a la página.
     El panel recorta, .spec y .stack llevan min-width: 0, y el documento nunca
     desborda: lo que se mueve es la tabla, no la pantalla.

     El orden en que se caen las columnas:
       1º · celda ≤720px. Familia, ubicación y lectura. Son contexto, no
            identidad, y bajan enteras a .sub debajo del nombre, donde ya estaban
            escritas. Eso lo hace la base y W no lo cambia.
       2º · celda ≤420px. El retraso se despega de la píldora y baja a su propio
            renglón: la de estado es la única celda con dos datos y la que más
            ancho pide de las que quedan.
       3º · celda ≤420px. El aire lateral de las celdas baja de 12px a 8px. Con
            44px de alto la fila sigue siendo cómoda de tocar y la tabla pierde
            unos 48px de ancho, que es media pantalla de scroll menos.
     No se cae ninguna más. El código no se cae nunca: es lo primero que busca
     alguien con la máquina enfrente. Las acciones tampoco: esconder un control
     no es plegar, es quitar. */
  @container spec (max-width: 420px) {
    :global([data-d='W']) .c-state { white-space: normal; }
    :global([data-d='W']) .c-state .due { display: block; margin-left: 0; }
    :global([data-d='W']) .tbl th,
    :global([data-d='W']) .tbl td { padding-inline: var(--d-p1); }
    /* La base pliega las acciones a dos renglones. W no. Apilarlas lleva la fila
       de 44px a unos 96px, y con seis filas eso es el doble de scroll vertical a
       cambio de 50px de ancho que igual no alcanzan para que la tabla entre. W
       gasta scroll horizontal, que se recupera con el pulgar, antes que alto de
       fila, que es lo que hace escaneable una lista. */
    :global([data-d='W']) .acts { flex-wrap: nowrap; }
  }

  /* OBJETIVOS TÁCTILES. La casilla dibujada mide 15px y su área de clic la pone
     .pick::before, que quedaba en 35 × 44. Con dedo se lleva a 45 × 44. Sólo con
     puntero grueso: con un ratón, 45px de área invisible se comerían el clic de
     la celda de al lado sin ganar nada a cambio. */
  @media (pointer: coarse) {
    :global([data-d='W']) .pick::before { left: -15px; right: -15px; }
  }

  /* PANTALLA ANGOSTA, la parte física. directions.css engorda el filo crítico de
     3px a 5px por debajo de 560px, porque en un teléfono 3px al canto se pierden
     contra el marco, pero lo hace sobre .d-row y esta página no usa .d-row: usa
     <tr> y <li>. Sin esto la firma de W no llega a su propia tabla. Va por
     viewport y no por contenedor a propósito: el grosor mínimo de un filo es un
     hecho del aparato y de la mano, no del ancho de la celda. El plegado de
     columnas de arriba es al revés, y por eso va por contenedor. */
  @media (max-width: 560px) {
    :global([data-d='W']) .tbl tbody tr.alert td.c-sel,
    :global([data-d='W']) .tbl tbody tr.alert.on td.c-sel { box-shadow: inset 5px 0 0 var(--d-crit);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }
    :global([data-d='W']) .tbl tbody tr.on td.c-act { box-shadow: inset -5px 0 0 var(--d-accent); }
    :global([data-d='W']) ul.clist > li.citem.alert { box-shadow: inset 5px 0 0 var(--d-crit);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }
    :global([data-d='W']) ul.clist > li.citem.on { box-shadow: inset -5px 0 0 var(--d-accent); }
    :global([data-d='W']) ul.clist > li.citem.alert.on {
      box-shadow: inset 5px 0 0 var(--d-crit), inset -5px 0 0 var(--d-accent);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }
  }

  /* TRANSPARENCIA REDUCIDA Y CONTRASTE ALTO. Los dos ajustes de directions.css
     apagan el vidrio llevando --d-surface a blanco sólido, y ahí la escalera de
     densidad de la tabla se cae de golpe: la cabecera pintaba --d-surface, o sea
     el mismo blanco que el panel, y desaparecía. La escalera estaba hecha de
     transparencia; sin transparencia hay que rehacerla con lo que queda, que es
     un gris y un tinte. La cabecera baja a --d-sunk y el cursor pasa al acento,
     que sobre blanco es un azul apenas insinuado y no se confunde con el gris.
     La banda de la fila vencida no se toca: ahí el color ES el dato. */
  @media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
    :global([data-d='W']) .tbl thead th { background: var(--d-sunk); box-shadow: none; }
    :global([data-d='W']) .tbl thead th[aria-sort]:not([aria-sort='none']) { box-shadow: inset 0 -2px 0 var(--d-accent); }
    :global([data-d='W']) .tbl tbody tr:hover td,
    :global([data-d='W']) .tbl tbody tr.is-hover td { background: var(--d-accent-soft); }
    :global([data-d='W']) .tbl tbody tr.alert:hover td,
    :global([data-d='W']) .tbl tbody tr.alert.is-hover td { background: var(--tone-band); }
  }

  /* MOCIÓN. Lo único que se mueve en esta página es la aparición de las acciones
     de fila, que es respuesta a una acción y no ambiente. Con moción reducida
     aparecen igual, de golpe: se conserva la función y se tira el gesto. */
  @media (prefers-reduced-motion: reduce) {
    :global([data-d='W']) .acts { transition: none; }
  }

  /* ══ W · OBJETIVOS TÁCTILES, POR PUNTERO Y NO POR ANCHO ══════════════════
     El tamaño de un dedo es un hecho del aparato, no del ancho de la ventana.
     directions.css sube los .d-btn de W a --d-touch dentro de
     @media (max-width: 560px), así que una tableta de 768px —que se toca con
     el pulgar igual que un teléfono— se quedaba con los controles de ratón.
     Medido con puntero grueso emulado por CDP a 768px, esta página tenía
     30 objetivos por debajo de 44px. Va por (pointer: coarse) porque ese es
     el hecho que importa; el ancho ya tiene sus propias reglas y hacen otra
     cosa. Con ratón no cambia un pixel. */
  @media (pointer: coarse) {
    :global([data-d='W']) .d-btn { min-height: var(--d-touch); }
    /* El botón de ordenar es una cabecera de columna de 15px de alto: se le
       da caja completa sin mover la celda, con relleno vertical propio. */
    :global([data-d='W']) .sortbtn {
      min-height: var(--d-touch);
      padding-block: calc((var(--d-touch) - 1.2em) / 2);
      margin-block: calc((1.2em - var(--d-touch)) / 2);
    }
    /* La casilla NO va acá: .pick::before ya la lleva a 45 × 44 unas líneas
       más arriba, y tocarle top/bottom rompería el centrado por transform. */
    /* Paginación: los números caían en 32px de ancho. */
    :global([data-d='W']) .pager .d-btn { min-width: var(--d-touch); }
  }

  /* ══ X · COTA · pantalla angosta y piso de artesanía ═══════════════════════
     Separado del bloque de material por la misma razón que directions.css parte
     a W en dos: el material es una cosa y las condiciones en las que se usa son
     otra. Ninguna de estas reglas cambia la dirección; la sostienen cuando el
     aparato, la preferencia o el ancho la aprietan.

     QUÉ HACE X A 380 px, DECLARADO Y NO SUPUESTO.

     La tabla NO se vuelve tarjetas. El espécimen 2 de esta misma página ya es la
     respuesta en tarjetas, y convertir la tabla en lo mismo dejaría dos
     especímenes idénticos y borraría la comparación que la página existe para
     hacer. Sigue siendo una tabla y el ancho que le sobra se paga con scroll
     horizontal contenido dentro de .tblwrap, que ya trae
     overscroll-behavior-x: contain. El panel recorta, .spec y .stack llevan
     min-width: 0 y el documento no desborda nunca: lo que se mueve es la tabla,
     no la pantalla.

     El orden en que se caen las cosas:
       1º · celda ≤ 720 px. Familia y ubicación salen de la tabla y bajan enteras
            al renglón de contexto debajo del nombre, donde ya estaban escritas.
            Son contexto, no identidad. Eso lo hace la base.
       2º · celda ≤ 720 px. LA LECTURA NO CAE, y acá X se separa de las
            diecinueve. La base la esconde junto con las otras dos; en Cota la
            lectura contra su tope es la razón por la que la fila existe, y un
            técnico con la máquina enfrente y el teléfono en la mano abre esta
            pantalla para ver exactamente eso. Se repone.
       3º · celda ≤ 720 px. Como la lectura se queda, la copia de la lectura que
            la base mete en el renglón de contexto se apaga (.subread): nada se
            dice dos veces en 300 px.
       4º · celda ≤ 520 px. Del pie de la cota se cae la holgura («se pasó 62 h»)
            y queda el tope, que es contra qué se mide. Cuánto se pasó lo sigue
            diciendo el riel al cruzar la marca, que es para lo que se dibujó.
       5º · celda ≤ 420 px. El aire lateral de las celdas baja de 11 px a 7 px, el
            retraso se despega de la píldora y baja a su propio renglón, y las
            acciones se quedan en un renglón en vez de plegarse: apilarlas
            duplicaría el alto de la fila a cambio de un ancho que igual no
            alcanza, y el alto de fila es lo que hace escaneable una lista.
     No se cae ninguna más. El código no se cae nunca: es lo primero que busca
     alguien parado frente a la máquina. Las acciones tampoco, porque esconder un
     control no es plegar, es quitar.
     ═════════════════════════════════════════════════════════════════════════ */
  @container spec (max-width: 720px) {
    :global([data-d='X']) .c-read { display: table-cell; }
  }
  /* La base pliega dos veces, por contenedor y por viewport, con dos reglas
     distintas. La reposición tiene que contestarle a las dos. */
  @media (max-width: 420px) {
    :global([data-d='X']) .c-read { display: table-cell; }
  }
  @container spec (max-width: 520px) {
    :global([data-d='X']) .c-read .ct-slack { display: none; }
  }
  @container spec (max-width: 420px) {
    :global([data-d='X']) .tbl th,
    :global([data-d='X']) .tbl td { padding-inline: var(--d-p1); }
    :global([data-d='X']) .c-state { white-space: normal; }
    :global([data-d='X']) .c-state .due { display: block; margin-left: 0; }
    :global([data-d='X']) .acts { flex-wrap: nowrap; }
  }

  /* Nombres largos de verdad. «Compactadora Wacker DPU-6555» en una columna de
     130 px necesita permiso para partirse; sin él empuja la tabla entera y el
     scroll se va varios cientos de píxeles más lejos. */
  :global([data-d='X']) .nm,
  :global([data-d='X']) .cinm { overflow-wrap: break-word; }

  /* EL FILO, LA PARTE FÍSICA. directions.css engorda el filo crítico de 3 px a
     5 px en pantalla angosta, pero lo hace sobre .d-row y esta página no usa
     .d-row: usa <tr> y <li>. Sin esto la firma de X no llega a su propia tabla.
     Va por viewport y no por contenedor a propósito: el grosor mínimo de un filo
     es un hecho del aparato y de la mano, no del ancho de la celda. El plegado de
     columnas de arriba es al revés, y por eso va por contenedor. */
  @media (max-width: 560px) {
    :global([data-d='X']) .tbl tbody tr[data-tone] td.c-sel,
    :global([data-d='X']) .tbl tbody tr.on td.c-sel { box-shadow: inset 5px 0 0 var(--tone-fg); }
    :global([data-d='X']) .tbl tbody tr.on td.c-act { box-shadow: inset -5px 0 0 var(--d-accent); }
    :global([data-d='X']) ul.clist > li.citem {
      box-shadow: inset 5px 0 0 var(--tone-fg);
      padding-left: calc(var(--d-p3) + 5px);
    }
    :global([data-d='X']) ul.clist > li.citem.on,
    :global([data-d='X']) ul.clist > li.citem.alert.on {
      box-shadow: inset 5px 0 0 var(--tone-fg), inset -5px 0 0 var(--d-accent);
    }
  }

  /* OBJETIVOS TÁCTILES, POR PUNTERO Y NO POR ANCHO. El tamaño de un dedo es un
     hecho del aparato: una tableta de 768 px se toca con el pulgar igual que un
     teléfono. Los .d-btn ya los sube directions.css dentro del bloque de X; lo
     que faltaba era el botón de ordenar, que es una cabecera de 15 px de alto, y
     los números del paginador, que caían en 32 px de ancho. */
  @media (pointer: coarse) {
    :global([data-d='X']) .sortbtn {
      min-height: var(--d-touch);
      padding-block: calc((var(--d-touch) - 1.2em) / 2);
      margin-block: calc((1.2em - var(--d-touch)) / 2);
    }
    :global([data-d='X']) .pager .d-btn { min-width: var(--d-touch); }
    /* La casilla dibujada mide 15 px y su área de clic la pone .pick::before, que
       quedaba en 35 × 44. Con dedo se lleva a 45 × 44. Sólo con puntero grueso:
       con un ratón, 45 px de área invisible se comerían el clic de la celda de al
       lado sin ganar nada. */
    :global([data-d='X']) .pick::before { left: -15px; right: -15px; }
  }

  /* CONTRASTE FORZADO. El filo de estado es un box-shadow y el sistema los
     descarta, así que la fila vencida se quedaría sin marca de canto. La recupera
     un contorno, que es lo mismo que hace el bloque de X para .d-row. El riel y
     la marca del tope ya los repone directions.css. */
  @media (forced-colors: active) {
    :global([data-d='X']) .tbl tbody tr.alert { outline: 2px solid CanvasText; outline-offset: -2px; }
    :global([data-d='X']) ul.clist > li.citem.alert { outline: 2px solid CanvasText; outline-offset: -2px; }
  }

  /* MOCIÓN. Lo único que se mueve en X es la aparición de las acciones de fila,
     que es respuesta a una acción y no ambiente. Con moción reducida aparecen
     igual, de golpe: se conserva la función y se tira el gesto. */
  @media (prefers-reduced-motion: reduce) {
    :global([data-d='X']) .acts { transition: none; }
  }
</style>
