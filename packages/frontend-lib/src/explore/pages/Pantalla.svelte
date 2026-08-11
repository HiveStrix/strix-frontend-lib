<script>
  // PANTALLA COMPLETA — la flota, armada de principio a fin, en las ocho.
  //
  // Es la prueba de fuego: una dirección puede ganar componente por componente
  // y desarmarse cuando se junta todo. Aquí cada celda lleva la pantalla entera
  // — barra de módulo, veredicto, KPIs, filtros, tabla, línea de tiempo y pie —
  // a 620px con scroll interno, para que se juzgue la jerarquía y no el detalle.
  import Grid from '../Grid.svelte';
  import Direction from '../Direction.svelte';
  import { DIRECTIONS } from '../directions.js';
  import { ASSETS, KPIS, PLANS, FAMILIES, COPY, markOf } from '../demo.js';

  export let directions = [];

  // 8 + 14 + 62 + 4 — la flota entera sale de los KPIs, no de un número inventado.
  const FLEET = KPIS.reduce((n, k) => n + k.value, 0);

  // ── COTA (X) · DE DÓNDE SALE UN TOPE ───────────────────────────────────
  // Ninguna cifra de acá abajo es nueva. PLANS ya publica el intervalo de cada
  // equipo («cada 250 h») y ASSETS ya publica su lectura («312 h»); el tope, el
  // sobrepaso y lo que falta son esas dos cadenas restadas. Si un equipo no
  // tiene plan o no tiene lectura, la función lo dice en palabras en vez de
  // devolver un cero, porque un cero dibujaría un riel vacío y un riel vacío
  // afirma que se midió.
  function planOf(code) {
    return PLANS.find((p) => p.asset === code);
  }
  function cifra(txt) {
    const n = String(txt ?? '').replace(/\D/g, '');
    return n === '' ? null : Number(n);
  }
  function unidad(txt) {
    const m = String(txt ?? '').match(/[a-z]+$/i);
    return m ? m[0] : '';
  }
  // Los miles se separan como ya lo hace demo.js en «1 840 h», pero con espacio
  // duro: con el espacio normal, «faltan 2 790 km» partía el número en dos
  // renglones y la columna mostraba «faltan 2» y debajo «790 km». Un millar
  // partido es un número distinto durante el medio segundo que tarda el ojo en
  // juntarlo, y esta columna se lee de reojo.
  const NBSP = ' ';
  function miles(n) {
    const s = String(n);
    let out = '';
    for (let i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 === 0) out += NBSP;
      out += s[i];
    }
    return out;
  }
  function cant(n, u) {
    if (n === null) return '';
    return u ? miles(n) + NBSP + u : miles(n);
  }
  function topeDe(code) {
    const p = planOf(code);
    return p ? cant(cifra(p.every), unidad(p.every)) : '';
  }
  // «tope 250 h · se pasó 62 h». Es la mitad de la cota que hace el trabajo:
  // sin la nota, el riel es una barra de progreso.
  function notaCota(a) {
    const p = planOf(a.code);
    if (!p) return '';
    const u = unidad(p.every);
    const tope = cifra(p.every);
    const leido = cifra(a.metric);
    const base = 'tope ' + cant(tope, u);
    if (tope === null || leido === null) return base + ' · nunca medido';
    const dif = leido - tope;
    if (dif > 0) return base + ' · se pasó ' + cant(dif, u);
    if (dif < 0) return base + ' · faltan ' + cant(-dif, u);
    return base + ' · justo en el tope';
  }
  // En la línea de tiempo la cifra medida es el porcentaje, así que la nota
  // tiene que decir contra qué. Absorbe lo que antes repetía .tlev.
  function notaPlan(p) {
    return 'tope ' + cant(cifra(p.every), unidad(p.every)) + ' · reloj de ' + p.clock;
  }

  // Estado por dirección: filtrar en una celda no debe mover las otras siete.
  let q = Object.fromEntries(DIRECTIONS.map((d) => [d.id, '']));
  let fam = Object.fromEntries(DIRECTIONS.map((d) => [d.id, 'Todas']));
  let tone = Object.fromEntries(DIRECTIONS.map((d) => [d.id, null]));
  let group = Object.fromEntries(DIRECTIONS.map((d) => [d.id, 'urgencia']));

  function clear(id) {
    q[id] = '';
    fam[id] = 'Todas';
    tone[id] = null;
  }

  $: view = Object.fromEntries(
    directions.map((d) => {
      const term = (q[d.id] || '').trim().toLowerCase();
      const f = fam[d.id];
      const t = tone[d.id];
      return [
        d.id,
        ASSETS.filter(
          (a) =>
            (f === 'Todas' || a.family === f) &&
            (!t || a.tone === t) &&
            (term === '' ||
              (a.code + ' ' + a.name + ' ' + a.family + ' ' + a.location + ' ' + a.plan)
                .toLowerCase()
                .includes(term))
        )
      ];
    })
  );

  $: grouped = Object.fromEntries(
    directions.map((d) => {
      const key = group[d.id];
      const rank = { critical: 3, attention: 2, neutral: 1, positive: 0 };
      const out = [];
      for (const a of view[d.id] || []) {
        const name =
          key === 'ubicacion'
            ? a.location
            : key === 'familia'
              ? a.family
              : a.tone === 'critical'
                ? 'Vencidos'
                : a.tone === 'attention'
                  ? 'Por vencer'
                  : a.tone === 'positive'
                    ? 'Al día'
                    : 'Sin lectura';
        let b = out.find((x) => x.name === name);
        if (!b) {
          b = { name, items: [], tone: a.tone };
          out.push(b);
        }
        if (rank[a.tone] > rank[b.tone]) b.tone = a.tone;
        b.items.push(a);
      }
      out.sort((x, y) => rank[y.tone] - rank[x.tone]);
      return [d.id, out];
    })
  );
</script>

<Grid min="640px">
  {#each directions as d (d.id)}
    <Direction id={d.id} flush>
      <div class="screen">
        <!-- BARRA DEL MÓDULO ------------------------------------------------->
        <header class="topbar">
          <div class="mod">
            <h2 class="title">Flota</h2>
          </div>
          <div class="search" role="search">
            <label class="d-sr" for={'q-' + d.id}>Buscar equipo, plan o ubicación</label>
            <input
              class="d-input"
              id={'q-' + d.id}
              type="search"
              placeholder="Buscar equipo, plan o ubicación"
              bind:value={q[d.id]}
            />
          </div>
          <button class="d-btn d-btn--primary act" type="button">Registrar lectura</button>
        </header>

        <div class="scroll">
          <!-- VEREDICTO: lo primero que se lee.
               Llevaba una versalita «Hoy» encima, y la frase ya dice hoy: el
               epígrafe sobraba. Queda la marca de severidad, que es el mismo
               vocabulario de las píldoras y no una etiqueta que haya que leer. -->
          <div class="verdict d-rail" data-tone="critical">
            <span class="vk">
              <svg class="mk" viewBox="0 0 12 12" aria-hidden="true">{@html markOf('critical')}</svg>
              <span class="d-sr">Crítico</span>
            </span>
            <p class="vt">{COPY.verdict}</p>
          </div>

          <!-- TIRA DE KPIS: además de contar, filtran ------------------------>
          <div class="kpis" role="group" aria-label="Resumen de la flota: filtrar por estado">
            {#each KPIS as k}
              <button
                type="button"
                class="kpi"
                data-tone={k.tone}
                aria-pressed={tone[d.id] === k.tone}
                on:click={() => (tone[d.id] = tone[d.id] === k.tone ? null : k.tone)}
              >
                <span class="kv d-num">{k.value}</span>
                <span class="kl">
                  <svg class="mk" viewBox="0 0 12 12" aria-hidden="true">{@html markOf(k.tone)}</svg>
                  {k.label}
                </span>
                <span class="kn">{k.note}</span>
              </button>
            {/each}
          </div>

          <!-- BARRA DE FILTROS ---------------------------------------------->
          <div class="filters d-rail">
            <label class="flab" for={'g-' + d.id}>Agrupar por</label>
            <div class="fbody">
              <select class="d-select gsel" id={'g-' + d.id} bind:value={group[d.id]}>
                <option value="urgencia">Urgencia</option>
                <option value="ubicacion">Ubicación</option>
                <option value="familia">Familia</option>
              </select>
              <div class="fams" role="group" aria-label="Filtrar por familia">
                <button
                  type="button"
                  class="fam"
                  aria-pressed={fam[d.id] === 'Todas'}
                  on:click={() => (fam[d.id] = 'Todas')}
                >Todas <span class="ct d-num">{ASSETS.length}</span></button>
                {#each FAMILIES as f}
                  <button
                    type="button"
                    class="fam"
                    aria-pressed={fam[d.id] === f}
                    on:click={() => (fam[d.id] = fam[d.id] === f ? 'Todas' : f)}
                  >{f} <span class="ct d-num">{ASSETS.filter((a) => a.family === f).length}</span></button>
                {/each}
              </div>
              {#if q[d.id] || fam[d.id] !== 'Todas' || tone[d.id]}
                <button class="d-btn d-btn--ghost d-btn--sm" type="button" on:click={() => clear(d.id)}>
                  Limpiar filtros
                </button>
              {/if}
            </div>
          </div>

          <!-- TABLA DE EQUIPOS ---------------------------------------------->
          <section class="sect d-panel list" aria-labelledby={'lt-' + d.id}>
            <div class="d-panel-head">
              <h3 class="d-panel-title" id={'lt-' + d.id}>Equipos</h3>
              <span class="cnt d-num">{view[d.id].length} de {ASSETS.length}</span>
            </div>

            <div class="lhead" aria-hidden="true">
              <span class="d-cap">Código</span>
              <span class="d-cap">Equipo</span>
              <span class="d-cap">Plan · próximo</span>
              <!-- X · la vertical del plan se rotula una vez, en su cabecera, y
                   cae exactamente sobre la marca de todos los rieles. Sin este
                   rótulo la raya se lee como una división de columnas, que es
                   justo lo que no es. -->
              <span class="d-cap ta-r">Lectura{#if d.id === 'X'}<i class="xtope">tope</i>{/if}</span>
              <span class="d-cap">Estado</span>
            </div>

            <div class="rows">
              {#each grouped[d.id] as g (g.name)}
                <!-- el encabezado de grupo lleva la marca semántica: a treinta
                     segundos se ve DÓNDE está lo vencido sin leer la palabra -->
                <div class="ghead" data-tone={g.tone}>
                  <span class="gn">
                    <svg class="mk" viewBox="0 0 12 12" aria-hidden="true">{@html markOf(g.tone)}</svg>
                    {g.name}
                  </span>
                  <span class="gc d-num">{g.items.length}</span>
                </div>
                {#each g.items as a (a.code)}
                  <div class="row d-row" data-tone={a.tone}>
                    <div class="c-code"><span class="d-id">{a.code}</span></div>
                    <div class="c-eq">
                      <span class="nm" title={a.name}>{a.name}</span>
                      <span class="sub" title={a.location + ' · ' + a.family}>{a.location} · {a.family}</span>
                    </div>
                    <div class="c-plan">
                      <span class="pl" title={a.plan}>{a.plan}</span>
                      <span class="sub" title={'próximo ' + a.due}>{a.due}</span>
                    </div>
                    <div class="c-metric">
                      <!-- X · COTA. Aquí es donde la regla 2 se aplica o no se
                           aplica: «312 h» con «118 %» debajo son dos cifras
                           sueltas que obligan a restar de memoria. La cota las
                           reemplaza por la lectura sobre su riel, con la marca
                           del tope donde cae el plan. Las otras diecinueve
                           direcciones caen al {:else} y no cambian un píxel. -->
                      {#if d.id === 'X'}
                        {#if a.pct}
                          <div
                            class="d-cota xcota"
                            data-tone={a.tone}
                            data-over={a.pct > 100 ? 'si' : null}
                            style="--cota:{a.pct}"
                          >
                            <div class="d-cota-fig">
                              <b>{miles(cifra(a.metric))}</b> <span>{unidad(a.metric)}</span>
                            </div>
                            <div class="d-cota-rail" aria-hidden="true">
                              <i class="d-cota-fill"></i><i class="d-cota-tick"></i>
                            </div>
                            <div class="d-cota-note">{notaCota(a)}</div>
                          </div>
                        {:else}
                          <!-- sin lectura no hay cota: un riel en cero afirma
                               que se midió y dio cero. El tope sigue existiendo
                               y se dice con palabras. -->
                          <div class="xsin">
                            <span class="xsin-t">sin lectura</span>
                            <span class="sub">tope {topeDe(a.code)}</span>
                          </div>
                        {/if}
                      {:else}
                        <span class="mv d-num">{a.metric}</span>
                        <span class="sub d-num">{a.pct ? a.pct + ' %' : 'sin dato'}</span>
                      {/if}
                    </div>
                    <div class="c-state">
                      <span class="d-pill">
                        <svg viewBox="0 0 12 12" aria-hidden="true">{@html markOf(a.tone)}</svg>
                        {a.state}
                      </span>
                    </div>
                  </div>
                {/each}
              {/each}

              {#if view[d.id].length === 0}
                <p class="empty">
                  Ningún equipo coincide con el filtro.
                  <button class="d-btn d-btn--sm" type="button" on:click={() => clear(d.id)}>Limpiar filtros</button>
                </p>
              {/if}
            </div>
          </section>

          <!-- LÍNEA DE TIEMPO ----------------------------------------------->
          <section class="sect d-panel tl" aria-labelledby={'tt-' + d.id}>
            <div class="d-panel-head">
              <h3 class="d-panel-title" id={'tt-' + d.id}>Próximos vencimientos</h3>
              <span class="cnt d-num">la marca es el 100 %</span>
            </div>
            <div class="tlb">
              {#each PLANS.filter((p) => view[d.id].some((a) => a.code === p.asset)).slice(0, 3) as p (p.asset)}
                <div class="tlr d-rail" data-tone={p.tone}>
                  <span class="d-id tlid">
                    {p.asset}
                    <span class="tlev">{p.every} · reloj de {p.clock}</span>
                  </span>
                  <div class="tlm">
                    <span class="tlt">{p.task}</span>
                    <span class="tlbar">
                      {#if d.id === 'X'}
                        <!-- X · el carril de la línea de tiempo YA era una cota
                             a mano: relleno más una marca de umbral, con una
                             escala propia (tope al 83 %) que no coincide con la
                             de la tabla. Dos vocabularios de riel en la misma
                             pantalla es la clase de incoherencia que se nota
                             sin poder nombrarla, así que acá va la primitiva. -->
                        {#if p.at}
                          <span
                            class="d-cota xcota xtl"
                            data-tone={p.tone}
                            data-over={p.at > 100 ? 'si' : null}
                            style="--cota:{p.at}"
                          >
                            <span class="d-cota-fig"><b>{p.at}</b> <span>%</span></span>
                            <span class="d-cota-rail" aria-hidden="true">
                              <i class="d-cota-fill"></i><i class="d-cota-tick"></i>
                            </span>
                            <span class="d-cota-note">{notaPlan(p)}</span>
                          </span>
                        {:else}
                          <span class="xsin"><span class="sub">sin lectura · tope {topeDe(p.asset)}</span></span>
                        {/if}
                      {:else if d.id === 'F'}
                        <span class="ascii" aria-hidden="true"
                          >[{'#'.repeat(Math.round(Math.min(p.at, 120) / 6))}{'·'.repeat(
                            20 - Math.round(Math.min(p.at, 120) / 6)
                          )}]</span
                        >
                      {:else}
                        <span class="track" aria-hidden="true">
                          <span class="fill" style="width:{Math.min(p.at, 120) / 1.2}%"></span>
                          <span class="thr"></span>
                        </span>
                      {/if}
                      <span class="pc d-num">{p.at} %</span>
                    </span>
                    <span class="d-pill tlw">
                      <svg viewBox="0 0 12 12" aria-hidden="true">{@html markOf(p.tone)}</svg>
                      {p.when}
                    </span>
                  </div>
                </div>
              {/each}
              {#if PLANS.filter((p) => view[d.id].some((a) => a.code === p.asset)).length === 0}
                <p class="empty">Sin planes para los equipos filtrados.</p>
              {/if}
            </div>
          </section>
        </div>

        <!-- PIE CON CONTEO --------------------------------------------------->
        <footer class="foot">
          <p class="fcount">
            <b class="d-num">{view[d.id].length}</b> de <span class="d-num">{ASSETS.length}</span> en pantalla
            · <span class="d-num">{FLEET}</span> en la flota
          </p>
          <p class="ftones">
            {#each KPIS as k}
              <span class="fc" data-tone={k.tone}>
                <svg class="mk" viewBox="0 0 12 12" aria-hidden="true">{@html markOf(k.tone)}</svg>
                <span class="d-num">{view[d.id].filter((a) => a.tone === k.tone).length}</span>
                {k.label.toLowerCase()}
              </span>
            {/each}
          </p>
        </footer>
      </div>
    </Direction>
  {/each}
</Grid>

<style>
  /* ======================================================================
     BASE — todo sale de los tokens --d-*. Cada dirección ya llega distinta
     por aquí; los bloques de abajo son los que llevan la SILUETA.
     ====================================================================== */
  .screen {
    display: flex;
    flex-direction: column;
    height: 620px;
    min-width: 0;
  }
  .scroll {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    display: flex;
    flex-direction: column;
    gap: var(--d-gap);
    padding: var(--d-p3);
  }
  /* nada dentro del scroll se comprime: un panel con overflow oculto (C) se
     dejaría encoger por el flex y se comería sus propias filas. */
  .scroll > * { flex: 0 0 auto; }

  /* ── barra del módulo ─────────────────────────────────────────────── */
  .topbar {
    flex: none;
    display: flex;
    align-items: center;
    gap: var(--d-p2);
    flex-wrap: wrap;
    padding: var(--d-p2) var(--d-p3);
    background: var(--d-surface);
    border-bottom: var(--d-bw) solid var(--d-line);
  }
  .mod { display: flex; flex-direction: column; min-width: 0; }
  .title {
    margin: 0;
    font-size: var(--d-t-lg);
    font-weight: var(--d-w-semi);
    letter-spacing: -.02em;
    line-height: 1.15;
  }
  .search { display: flex; align-items: center; gap: var(--d-p1); flex: 1 1 170px; min-width: 0; }
  .search .d-input { flex: 1 1 auto; min-width: 0; }
  .act { flex: none; }

  /* ── veredicto ────────────────────────────────────────────────────── */
  .verdict {
    padding: var(--d-p3);
    background: var(--tone-band);
    border: var(--d-bw) solid var(--tone-edge);
    border-radius: var(--d-r-lg);
  }
  .vt {
    margin: 0;
    font-size: var(--d-t-lg);
    font-weight: var(--d-w-med);
    line-height: 1.35;
    letter-spacing: -.01em;
    color: var(--d-ink);
  }
  .vk { display: flex; align-items: center; gap: .35em; }
  .mk { width: .82em; height: .82em; flex: none; vertical-align: -.04em; color: var(--tone-fg); }
  /* la marca del veredicto es la señal, no un adorno: se lee de lejos */
  .vk .mk { width: 1.15em; height: 1.15em; }

  /* ── tira de KPIs ─────────────────────────────────────────────────── */
  .kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--d-gap); }
  .kpi {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1px;
    min-width: 0;
    padding: var(--d-p2) var(--d-p3);
    font: inherit;
    text-align: left;
    color: var(--d-ink);
    background: var(--d-surface);
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r);
    box-shadow: var(--d-shadow);
    cursor: pointer;
    transition: background 120ms ease, box-shadow 120ms ease, transform 120ms ease;
  }
  .kv {
    font-size: var(--d-t-xl);
    font-weight: var(--d-w-bold);
    line-height: 1.05;
    letter-spacing: -.03em;
    color: var(--tone-fg);
  }
  .kl {
    display: flex;
    align-items: center;
    gap: .35em;
    font-size: var(--d-t-sm);
    font-weight: var(--d-w-med);
    white-space: nowrap;
  }
  /* la nota va en ink-2, no en ink-3: a 11px sobre la banda del estado pulsado
     el gris terciario caía a 4.4:1, justo por debajo de AA. */
  .kn { font-size: var(--d-t-2xs); color: var(--d-ink-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
  .kpi[aria-pressed='true'] { background: var(--tone-band); border-color: var(--tone-edge); }

  /* ── barra de filtros ─────────────────────────────────────────────── */
  .filters { padding: 0; }
  /* «Agrupar por» es la etiqueta de un campo, no un epígrafe: sale de las
     versalitas y se escribe como se escribe una etiqueta de formulario. */
  .flab {
    align-self: center;
    font-size: var(--d-t-xs);
    font-weight: var(--d-w-med);
    color: var(--d-ink-2);
  }
  .fbody { display: flex; align-items: center; gap: var(--d-p2); flex-wrap: wrap; min-width: 0; }
  .gsel { width: auto; min-width: 130px; }
  .fams { display: flex; align-items: center; gap: var(--d-p1); flex-wrap: wrap; min-width: 0; }
  .fam {
    display: inline-flex;
    align-items: baseline;
    gap: 5px;
    padding: 3px var(--d-p2);
    font: inherit;
    font-size: var(--d-t-xs);
    color: var(--d-ink-2);
    background: var(--d-surface);
    border: max(var(--d-bw), 1px) solid var(--d-line);
    border-radius: var(--d-r);
    cursor: pointer;
    white-space: nowrap;
  }
  .fam:hover { background: var(--d-sunk); }
  .fam[aria-pressed='true'] {
    color: var(--d-ink);
    font-weight: var(--d-w-semi);
    background: var(--d-accent-soft);
    border-color: var(--d-accent-edge);
  }
  .ct { font-size: var(--d-t-2xs); color: var(--d-ink-3); }
  .fam[aria-pressed='true'] .ct { color: inherit; }

  /* ── tabla ────────────────────────────────────────────────────────── */
  /* la nota de la derecha de una cabecera es un dato (un conteo, una escala),
     así que se escribe como dato y no en versalitas. */
  .cnt {
    white-space: nowrap;
    font-size: var(--d-t-xs);
    font-weight: var(--d-w-med);
    color: var(--d-ink-3);
  }
  .lhead, .row {
    display: grid;
    grid-template-columns: 74px minmax(0, 2fr) minmax(0, 1.3fr) 74px 104px;
    gap: var(--d-p2);
    align-items: center;
  }
  .lhead {
    padding: var(--d-p1) var(--d-p3);
    background: var(--d-sunk);
    border-bottom: var(--d-bw) solid var(--d-line);
  }
  .ta-r { text-align: right; }
  .ghead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--d-p2);
    padding: var(--d-p1) var(--d-p3);
    background: var(--d-sunk);
    border-bottom: var(--d-bw) solid var(--d-line);
    font-size: var(--d-label-size);
    font-weight: var(--d-label-weight);
    letter-spacing: var(--d-label-track);
    text-transform: var(--d-label-case);
    color: var(--d-ink-2);
  }
  .gn { display: inline-flex; align-items: center; gap: .45em; min-width: 0; }
  .gc { color: var(--d-ink-3); }
  .c-code, .c-eq, .c-plan, .c-metric { min-width: 0; }
  .c-metric { text-align: right; }
  .nm, .pl, .mv { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .nm { font-weight: var(--d-w-med); }
  .mv { font-weight: var(--d-w-med); }
  .sub {
    display: block;
    font-size: var(--d-t-xs);
    color: var(--d-ink-3);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .c-state { display: flex; justify-content: flex-start; min-width: 0; }
  .empty {
    display: flex;
    align-items: center;
    gap: var(--d-p2);
    flex-wrap: wrap;
    margin: 0;
    padding: var(--d-p3);
    font-size: var(--d-t-sm);
    color: var(--d-ink-3);
  }

  /* ── línea de tiempo ──────────────────────────────────────────────── */
  .tlb { padding: var(--d-p2) var(--d-p3) var(--d-p3); display: flex; flex-direction: column; gap: var(--d-p2); }
  /* el código del equipo es un identificador, no un epígrafe: monoespaciada y
     tinta legible, sin versalitas encima de algo que ya viene en caja alta. */
  .tlid {
    line-height: 1.3;
    font-size: var(--d-t-xs);
    font-weight: var(--d-w-semi);
    color: var(--d-ink-2);
  }
  .tlev {
    display: block;
    font-family: var(--d-font);
    font-size: var(--d-t-2xs);
    font-weight: var(--d-w);
    letter-spacing: 0;
    text-transform: none;
    color: var(--d-ink-3);
  }
  .tlm { display: flex; align-items: center; gap: var(--d-p2); flex-wrap: wrap; min-width: 0; }
  .tlt { flex: 1 1 160px; min-width: 0; font-size: var(--d-t-sm); font-weight: var(--d-w-med); }
  .tlbar { flex: 2 1 180px; min-width: 120px; display: flex; align-items: center; gap: var(--d-p2); }
  .track {
    position: relative;
    flex: 1 1 auto;
    min-width: 60px;
    height: 8px;
    background: var(--d-sunk);
    border-radius: var(--d-r-pill);
  }
  .fill { position: absolute; inset: 0 auto 0 0; background: var(--tone-fg); border-radius: inherit; }
  /* el 100 % marcado: sobresale del carril para que se lea aunque el relleno lo pase */
  .thr { position: absolute; top: -3px; bottom: -3px; left: 83.33%; width: 1px; background: var(--d-ink-2); }
  .pc { flex: none; width: 4.2em; text-align: right; font-size: var(--d-t-xs); font-weight: var(--d-w-semi); }
  .tlw { flex: none; }

  /* ── pie ──────────────────────────────────────────────────────────── */
  .foot {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--d-p2);
    flex-wrap: wrap;
    padding: var(--d-p2) var(--d-p3);
    background: var(--d-sunk);
    border-top: var(--d-bw) solid var(--d-line);
    font-size: var(--d-t-xs);
    color: var(--d-ink-2);
  }
  .fcount, .ftones { margin: 0; }
  .ftones { display: flex; align-items: center; gap: var(--d-p2); flex-wrap: wrap; }
  .fc { display: inline-flex; align-items: center; gap: .35em; white-space: nowrap; }

  /* ======================================================================
     POR DIRECCIÓN. [data-d] vive en Direction.svelte — otro componente —
     así que TODO lo de aquí abajo empieza por :global([data-d='X']).
     ====================================================================== */

  /* EL VEREDICTO, EN LAS QUE NO TIENEN RAÍL. Con la versalita «Hoy» fuera, la
     marca de severidad queda sola en la primera celda de .d-rail, o sea
     flotando encima de la frase. Donde no hay raíl de etiquetas —o sea en
     todas menos Banda y Espina— pasa a ser lo que es: una señal a la
     izquierda de la frase que califica. Banda y Espina la mantienen alineada
     a la derecha del raíl, que es su propia gramática. */
  :global([data-d='A']) .verdict,
  :global([data-d='C']) .verdict,
  :global([data-d='I']) .verdict,
  :global([data-d='M']) .verdict,
  :global([data-d='O']) .verdict,
  :global([data-d='T']) .verdict {
    display: flex; align-items: center; gap: var(--d-p3);
  }

  /* ── A · ELEVACIÓN — todo flota y se separa por aire, nunca por líneas ──
     La incumbente llegaba a esta ronda con un problema de jerarquía y no de
     material: todo flotaba a la misma altura, así que nada mandaba. Acá la
     ALTURA CODIFICA PRIORIDAD, que es lo único que puede hacer una sombra
     además de decorar: el veredicto y el listado están arriba del todo, la
     línea de tiempo baja un plano, y el aire entre grupos hace el resto. */
  :global([data-d='A']) .topbar { border-bottom: 0; box-shadow: var(--d-shadow-lg); position: relative; z-index: 2; }
  :global([data-d='A']) .sect { border-color: transparent; }
  :global([data-d='A']) .list { box-shadow: var(--d-shadow-lg); }
  :global([data-d='A']) .tl { box-shadow: var(--d-shadow); }
  :global([data-d='A']) .kpi:hover { transform: translateY(-1px); box-shadow: var(--d-shadow-lg); }
  :global([data-d='A']) .verdict { border-color: transparent; box-shadow: var(--d-shadow-lg); }
  :global([data-d='A']) .vt { font-size: var(--d-t-xl); letter-spacing: -.02em; }
  /* los grupos se separan por espacio, no por una barra. Y el nombre del grupo
     es un encabezado de verdad: en versalitas de 11px, «Vencidos» no ganaba a
     ninguna fila del listado y es lo primero que hay que ver. */
  :global([data-d='A']) .ghead {
    background: transparent; border-bottom: 0;
    padding-top: var(--d-p3); padding-bottom: 2px;
    font-size: var(--d-t-sm); font-weight: var(--d-w-semi);
    text-transform: none; letter-spacing: 0; color: var(--d-ink);
  }
  :global([data-d='A']) .gc { font-weight: var(--d-w-med); }
  :global([data-d='A']) .fam { border-radius: var(--d-r-pill); box-shadow: var(--d-shadow); }
  :global([data-d='A']) .foot { background: var(--d-surface); border-top-color: var(--d-line); }
  :global([data-d='A']) .search .d-input { box-shadow: var(--d-shadow); }
  /* los encabezados de columna no llevan banda: los sostiene una sola línea */
  :global([data-d='A']) .lhead { background: transparent; }
  /* los planes se separan por aire, nunca por reglas */
  :global([data-d='A']) .tlb { gap: var(--d-p3); }
  :global([data-d='A']) .kpi[aria-pressed='true'] { box-shadow: var(--d-shadow-lg); }
  /* hasta la barra flota sobre su carril */
  :global([data-d='A']) .fill { box-shadow: var(--d-shadow); }

  
  /* la pila entera se convierte en un solo marco continuo */
  /* marcas de esquina, como en .d-panel */
  /* el grupo es una división del plano: regla de canto arriba, marca a la
     izquierda y el conteo en la monoespaciada. Sin relleno: un plano técnico
     no se pinta de colores, se marca. */
  /* la etiqueta del filtro vuelve a versalitas SOLO acá: en Instrumento las
     etiquetas fuera del marco son la silueta declarada de la dirección. */
  /* fila de una sola línea: la densidad es el punto */
  /* la barra es una regla graduada, no una pastilla */

  /* ── C · MARCA — la pantalla la sostienen barras llenas de color ─────── */
  :global([data-d='C']) .topbar {
    background: var(--d-brand); color: var(--d-brand-ink); border-bottom: 0;
  }
  :global([data-d='C']) .topbar .act {
    background: var(--d-surface); color: var(--d-brand); border-color: var(--d-surface);
  }
  :global([data-d='C']) .topbar .act:hover { filter: none; background: var(--d-accent-soft); }
  :global([data-d='C']) .verdict {
    background: var(--d-surface); border-color: var(--d-line);
    border-left: 4px solid var(--tone-fg); border-radius: var(--d-r);
  }
  /* el KPI se identifica por su franja de cabecera, no por su borde */
  :global([data-d='C']) .kpi { border-top: 3px solid var(--tone-fg); border-radius: 0 0 var(--d-r) var(--d-r); }
  :global([data-d='C']) .kl { color: var(--d-ink-2); }
  /* EL REPARTO DEL COLOR, que es lo que decide si esta dirección aguanta un
     ERP entero: la marca identifica CONTENEDORES (barra de módulo, cabecera
     de bloque, pie) y el estado identifica ESTADOS. Antes el teal se gastaba
     también en el encabezado de columnas y en el de grupo, y con quince
     bloques por pantalla el color dejaba de señalar nada. Ahora el grupo se
     tiñe de su tono, que es el dato que un técnico necesita a distancia. */
  :global([data-d='C']) .lhead { background: var(--d-sunk); border-bottom-color: var(--d-line); }
  :global([data-d='C']) .ghead {
    background: var(--tone-band); color: var(--d-ink);
    border-bottom-color: var(--tone-edge);
    font-size: var(--d-t-sm); font-weight: var(--d-w-semi);
    text-transform: none; letter-spacing: 0;
  }
  /* la tinta del grupo es ink, no el tono: el neutro (#616E6B sobre su banda)
     se quedaba en 4.4:1. Quien lleva el color acá es la marca, no la palabra. */
  :global([data-d='C']) .gc { color: var(--d-ink-2); }
  :global([data-d='C']) .fam[aria-pressed='true'] {
    background: var(--d-brand); color: var(--d-brand-ink); border-color: var(--d-brand);
  }
  :global([data-d='C']) .fam { border-radius: var(--d-r-pill); }
  /* el pie cierra la pantalla con la misma barra de marca que la abre */
  :global([data-d='C']) .foot {
    background: var(--d-brand-deep); color: var(--d-brand-ink); border-top: 0;
  }
  :global([data-d='C']) .foot .mk { color: var(--d-brand-ink); opacity: .8; }
  :global([data-d='C']) .track { background: var(--d-accent-soft); }
  /* La cabecera del bloque es teal lleno: la nota de la derecha quedaría teal
     sobre teal. Va en tinta de marca. */
  :global([data-d='C']) .d-panel-head .cnt { color: var(--d-brand-ink); }
  :global([data-d='C']) .vt { font-weight: var(--d-w-med); }

  
  /* la barra es un bloque con borde, y el relleno es el pastel del tono */
  /* la pastilla en caja alta con borde de 2px pide su propia columna */

  /* ── E · AIRE — cero bordes en toda la celda; separa el espacio ──────── */
  /* la fila no lleva línea: la separa el aire, y el reposo es una pastilla */

  /* ── F · TERMINAL — una pantalla de texto, el color como bloque ──────── */
  /* la tira de KPIs es una rejilla de un pelo, no cuatro tarjetas */
  /* la regla de guiones de F es texto corrido: .gn vuelve a inline para que los
     dos pseudos y la marca sigan siendo una sola corrida y no tres cajas */
  /* columnas separadas por regla, como una tabla de terminal */
  /* la barra de progreso es una barra de caracteres, con marca de umbral */

  
  /* la barra del módulo también respeta el raíl */
  /* el estado va como franja de 3px en el canto izquierdo, nunca como fondo */
  /* franja de una sola línea: un estrato no se parte en dos */

  /* ── H · FICHA — pestaña arriba, canto apilado abajo, regla doble ────── */
  /* la regla doble bajo el encabezado de columnas — el tic de la ficha */
  /* relleno tramado: la barra de una ficha se raya, no se pinta */

  /* ======================================================================
     LAS ONCE NUEVAS — I … S.

     Dos reglas mandan de aquí abajo. La primera: [data-d] vive en
     Direction.svelte, otro componente, así que TODO empieza por
     :global([data-d='X']) — sin eso el selector no coincide con nada y no
     avisa. La segunda: ni un color a mano. Cuando una dirección pide una
     tinta que su bloque de tokens no publica —el barrido de la laca, el
     negro al 30 % de una sombra de contacto— se compone con color-mix a
     partir de un token suyo, y la ausencia queda anotada como hallazgo.
     ====================================================================== */

  /* ── I · CRISTAL — losas sueltas de vidrio sobre el campo de manchas ───
     ANIDADO, que es donde esta dirección se rompe: el desenfoque vive SOLO
     en la capa que toca el fondo —barra, veredicto, KPIs, pie—. Dentro de
     .sect, que ya es .d-panel y ya desenfoca, no hay un segundo
     backdrop-filter: ahí el material se hace con alfa. Vidrio sobre vidrio
     se enturbia y el contenido deja de leerse.
     HALLAZGO: el radio de desenfoque no está tokenizado. directions.css lo
     lleva escrito dentro de cada selector (18px en I, 20 en O, 16 en R), así
     que la página no tiene de dónde heredarlo y lo repite a mano para que la
     barra sea el mismo vidrio que el panel. Un --d-blur lo resolvería en un
     solo lugar. */
  :global([data-d='I']) .topbar {
    margin: var(--d-p3) var(--d-p3) 0;
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r-lg);
    background: var(--d-surface);
    backdrop-filter: blur(18px) saturate(1.5);
    -webkit-backdrop-filter: blur(18px) saturate(1.5);
    box-shadow: var(--d-shadow);
  }
  /* EL GROSOR DEL VIDRIO CODIFICA IMPORTANCIA. Era el otro riesgo de esta
     dirección, además del anidado: si todas las losas tienen el mismo alfa,
     la pantalla es una sola lámina lechosa y no hay jerarquía. El veredicto
     es la losa más gruesa y la que más levanta; los controles de filtro son
     la más fina. */
  :global([data-d='I']) .verdict {
    border-color: var(--d-line);
    backdrop-filter: blur(18px) saturate(1.5);
    -webkit-backdrop-filter: blur(18px) saturate(1.5);
    box-shadow: var(--d-shadow-lg);
  }
  :global([data-d='I']) .vt { font-size: var(--d-t-xl); letter-spacing: -.02em; }
  /* cada KPI es su propia losa: I separa, O —que comparte material— une */
  :global([data-d='I']) .kpi {
    border-radius: var(--d-r-lg);
    border-color: var(--d-line);
    padding: var(--d-p3);
    backdrop-filter: blur(18px) saturate(1.5);
    -webkit-backdrop-filter: blur(18px) saturate(1.5);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='I']) .kpi:hover { transform: translateY(-1px); box-shadow: var(--d-shadow-lg); }
  :global([data-d='I']) .kpi[aria-pressed='true'] { box-shadow: var(--d-shadow-lg); }
  :global([data-d='I']) .sect { box-shadow: var(--d-shadow-lg); }
  /* DENTRO del panel no se desenfoca nada más: solo alfa. Y la luz entra
     siempre por arriba, así que todo lo que es vidrio lleva su filo especular
     (--d-line es blanco al 68 %, o sea LUZ, no una línea de dibujo). Sin eso
     las capas interiores se leen como papel translúcido pegado. */
  :global([data-d='I']) .lhead {
    background: var(--d-sunk); border-bottom-color: var(--d-line);
    box-shadow: inset 0 1px 0 var(--d-line);
  }
  :global([data-d='I']) .ghead {
    background: var(--tone-band); border-bottom-color: var(--d-line); color: var(--d-ink);
    box-shadow: inset 0 1px 0 var(--d-line);
    font-size: var(--d-t-sm); font-weight: var(--d-w-semi);
    text-transform: none; letter-spacing: 0;
  }
  :global([data-d='I']) .gc { color: var(--d-ink-2); }
  :global([data-d='I']) .row:hover { background: var(--d-sunk); }
  /* la lámina más fina de la pantalla: un filtro no compite con un veredicto */
  :global([data-d='I']) .fam {
    border-radius: var(--d-r-pill); border-color: var(--d-line); background: var(--d-sunk);
  }
  :global([data-d='I']) .fam[aria-pressed='true'] {
    background: var(--d-surface); border-color: var(--d-accent-edge);
    box-shadow: inset 0 1px 0 var(--d-line);
  }
  :global([data-d='I']) .track {
    background: var(--d-sunk); box-shadow: inset 0 0 0 1px var(--d-line);
  }
  :global([data-d='I']) .fill { box-shadow: inset 0 1px 0 var(--d-line); }
  :global([data-d='I']) .thr { background: var(--d-ink-3); }
  /* la línea del plan vive DENTRO del panel: se hace con alfa, sin un
     segundo desenfoque encima del que ya trae .d-panel */
  :global([data-d='I']) .tlr {
    background: var(--d-sunk); border-radius: var(--d-r);
    padding: var(--d-p2) var(--d-p3);
    box-shadow: inset 0 1px 0 var(--d-line);
  }
  /* .d-pill trae backdrop-filter propio del primitivo, y dentro del panel eso
     ya es vidrio sobre vidrio sobre vidrio: se apaga, el alfa alcanza */
  :global([data-d='I']) .c-state .d-pill,
  :global([data-d='I']) .tlw { backdrop-filter: none; -webkit-backdrop-filter: none; }
  :global([data-d='I']) .foot {
    margin: 0 var(--d-p3) var(--d-p3);
    border: var(--d-bw) solid var(--d-line);
    border-top-color: var(--d-line);
    border-radius: var(--d-r-lg);
    background: var(--d-sunk);
    backdrop-filter: blur(18px) saturate(1.5);
    -webkit-backdrop-filter: blur(18px) saturate(1.5);
    box-shadow: var(--d-shadow);
  }
  /* HALLAZGO de contraste, el mismo que ya está escrito en Acciones, Tablas y
     Formularios: en directions.css `[data-d='I'] .d-btn` pesa (0,2,0) y
     `.d-btn--primary` pesa (0,1,0), así que el vidrio blanco le gana el fondo
     al primario y queda tinta blanca sobre blanco — 1.02:1. Acá se comía
     «Registrar lectura», la única acción primaria de la pantalla. */
  :global([data-d='I']) .d-btn--primary {
    background: var(--d-accent);
    color: var(--d-accent-ink);
  }

  /* ── J · LACA — ninguna superficie es un color plano ───────────────────
     El barrido se pinta como CAPA DE FONDO, no como pseudo-elemento: así no
     hay orden de pintado que discutir —queda debajo del texto por
     definición— ni clic que robar, que es lo que pasa cuando un ::after
     esmaltado se estira sobre un botón.
     HALLAZGO: J publica --d-surface-fill, --d-sunk-fill y --d-accent-fill,
     pero no un --d-gloss: el barrido existe solo dentro de .d-panel::after
     en directions.css y el marcado propio de una página no puede reusarlo.
     Se sintetiza acá una vez, a partir de --d-surface, y se reparte. */
  /* al presionar, el brillo se apaga y la placa se hunde */
  /* la pastilla marcada es la única superficie oscura de J: el barrido se
     cambia por el realce del canto para no aclarar el fondo justo debajo de
     una etiqueta blanca de 12px */
  /* el carril es un hueco húmedo y el relleno una placa con su propio brillo */

  
  /* pulsado: el anillo se enciende entero, no solo cambia el tono */
  /* el título del grupo no lleva banda: se enciende en su tono */
  /* cada plan es otra luz suelta, con el anillo del tono y nada de relleno */

  
  /* cada fila es su propio canto: sin líneas, y ninguna igual a la de al lado */
  /* el encabezado de grupo es una piedrita, no una franja de borde a borde */

  /* ── M · BRUMA — no hay contenedores; el color se derrama por detrás ───
     HALLAZGO DE PINTADO, el que hacía invisible a esta dirección: el
     derrame de directions.css es un ::before con z-index:-1, y un
     z-index negativo se pinta ANTES del fondo de cualquier bloque no
     posicionado que tenga encima — incluido el .stage de Direction.svelte,
     que es opaco. Ningún ancestro crea contexto de apilado, así que la
     mancha quedaba debajo del fondo. `isolation: isolate` en el elemento
     que la hospeda crea ese contexto y la mancha vuelve a verse, sin tocar
     directions.css. Va en todo lo que derrama, propio o heredado.
     El desenfoque de 26px se repite a mano porque no hay token: si la
     página usara otro, las manchas propias y las del primitivo se leerían
     como dos nieblas distintas. */
  :global([data-d='M']) .topbar { background: transparent; border-bottom: 0; padding-bottom: 0; }
  :global([data-d='M']) .title {
    font-family: var(--d-display); font-weight: 400;
    font-size: var(--d-t-2xl); letter-spacing: -.02em;
  }
  :global([data-d='M']) .verdict {
    position: relative; isolation: isolate;
    background: none; border: 0; border-radius: 0;
    padding: var(--d-p2) 0 var(--d-p3);
  }
  /* CORRECCIÓN DE TOKEN, y es la que hacía que esta pantalla no se pareciera a
     su propia dirección: directions.css publica DOS familias de tono para M
     porque son dos cosas distintas. --tone-band es para lo que NO se
     desenfoca (la píldora), y --tone-wash —bastante más saturado— es para el
     derrame, porque a 26px de blur el band se evapora. La página derramaba
     con band, así que sus manchas eran mucho más pálidas que las del
     primitivo y las dos nieblas se leían como dos materiales. */
  :global([data-d='M']) .verdict::before {
    content: ''; position: absolute; inset: -22px -30px; z-index: -1; pointer-events: none;
    background:
      radial-gradient(62% 70% at 16% 20%, var(--tone-wash) 0%, transparent 70%),
      radial-gradient(52% 58% at 86% 84%, var(--tone-wash) 0%, transparent 68%);
    filter: blur(26px);
  }
  /* el veredicto es el titular de la pantalla: serif, grande, sin caja */
  :global([data-d='M']) .vt {
    font-family: var(--d-display); font-weight: 400;
    font-size: var(--d-t-xl); line-height: 1.28; letter-spacing: -.015em;
  }
  /* los KPIs derraman con gradientes en el propio fondo: dentro de un
     <button> un pseudo con z-index negativo es terreno resbaladizo */
  :global([data-d='M']) .kpi {
    border: 0; box-shadow: none; border-radius: var(--d-r-lg);
    padding: var(--d-p2) var(--d-p3) var(--d-p3);
    background:
      radial-gradient(72% 130% at 18% 0%, var(--tone-band) 0%, transparent 72%),
      radial-gradient(62% 120% at 96% 100%, var(--tone-band) 0%, transparent 70%);
  }
  :global([data-d='M']) .kv { font-family: var(--d-display); font-weight: 400; letter-spacing: -.01em; }
  :global([data-d='M']) .kpi[aria-pressed='true'] {
    background:
      radial-gradient(78% 140% at 18% 0%, var(--tone-band) 0%, transparent 76%),
      radial-gradient(68% 130% at 96% 100%, var(--tone-band) 0%, transparent 74%);
    box-shadow: inset 0 -2px 0 var(--tone-fg);
  }
  :global([data-d='M']) .sect { isolation: isolate; }
  /* sin caja no hay borde interior que alinee: la rejilla se alinea sola. El
     único pelo de línea de todo el listado va bajo los rótulos de columna,
     porque las filas ya lo llevan y sin él la cabecera flotaba suelta. */
  :global([data-d='M']) .lhead {
    background: transparent; border-bottom: 0; padding-inline: 0;
    box-shadow: 0 1px 0 var(--d-line);
  }
  :global([data-d='M']) .row { padding-inline: 0; }
  /* el encabezado de grupo es serif de 22px: a .82em la marca le pesaba más
     que la palabra. Se baja a la altura de x de la serif y queda en su sitio. */
  :global([data-d='M']) .ghead .mk { width: .58em; height: .58em; }
  :global([data-d='M']) .ghead {
    position: relative; isolation: isolate;
    background: transparent; border-bottom: 0; padding-inline: 0;
    font-family: var(--d-display); font-size: var(--d-t-lg); font-weight: 400;
    text-transform: none; letter-spacing: 0; color: var(--d-ink);
  }
  /* la mancha del grupo se abre hacia la derecha y arrastra a las filas que
     cuelgan debajo: es lo único que agrupa en una dirección sin cajas, así que
     tiene que alcanzar más lejos que el propio encabezado. */
  :global([data-d='M']) .ghead::before {
    content: ''; position: absolute; inset: -16px -26px -22px; z-index: -1; pointer-events: none;
    background: radial-gradient(64% 130% at 12% 40%, var(--tone-wash) 0%, transparent 74%);
    filter: blur(24px);
  }
  :global([data-d='M']) .fam { border: 0; background: var(--d-sunk); border-radius: var(--d-r-pill); padding: 5px var(--d-p2); }
  :global([data-d='M']) .fam[aria-pressed='true'] { background: var(--d-accent-soft); }
  :global([data-d='M']) .tlb { padding-inline: 0; }
  :global([data-d='M']) .tlr { position: relative; isolation: isolate; padding-block: var(--d-p1); }
  :global([data-d='M']) .tlr::before {
    content: ''; position: absolute; inset: -10px -24px; z-index: -1; pointer-events: none;
    background: radial-gradient(52% 130% at 70% 50%, var(--tone-wash) 0%, transparent 74%);
    filter: blur(24px);
  }
  /* el carril no tiene filo: el relleno se desvanece hacia atrás */
  :global([data-d='M']) .track { height: 5px; background: var(--d-sunk); }
  :global([data-d='M']) .fill {
    background: linear-gradient(90deg, transparent 0%, var(--tone-fg) 60%);
    box-shadow: 0 0 14px 2px var(--tone-band);
  }
  :global([data-d='M']) .thr { background: var(--d-ink-3); }
  :global([data-d='M']) .foot { background: transparent; border-top: 0; }
  /* Misma trampa que en I: `[data-d='M'] .d-btn { background: var(--d-sunk) }`
     tapa a `.d-btn--primary`, y el primario queda papel sobre papel — 1.07:1. */
  :global([data-d='M']) .d-btn--primary {
    background: var(--d-accent);
    color: var(--d-accent-ink);
  }

  
  /* cuatro cintas que se montan de izquierda a derecha */
  /* la cinta de abajo queda encima, así que la sombra de contacto va hacia arriba */

  /* ── O · PRISMA — vidrio con la marca teñida ADENTRO ───────────────────
     La botonera es UNA pieza de vidrio segmentado, no tres botones sueltos:
     los KPIs y las familias comparten losa y se separan por una división de
     luz. Ahí está la diferencia de silueta con I, que usa el mismo material
     pero suelta cada pieza.
     ANIDADO: igual que en I, el desenfoque solo en la capa que toca el
     fondo. Dentro de .sect —que ya desenfoca— nada más que alfa. */
  :global([data-d='O']) .topbar {
    background: linear-gradient(180deg, var(--d-accent-soft) 0%, transparent 100%), var(--d-surface);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    border-bottom-color: var(--d-line);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='O']) .title { color: var(--d-brand-ink); }
  :global([data-d='O']) .verdict {
    border-color: var(--d-line);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    box-shadow: var(--d-shadow-lg);
  }
  /* UNA losa de vidrio dividida en cuatro */
  :global([data-d='O']) .kpis {
    gap: 0;
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r-lg);
    background: var(--d-surface);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    box-shadow: var(--d-shadow-lg);
    overflow: hidden;
  }
  :global([data-d='O']) .kpi {
    background: transparent; border: 0; border-radius: 0; box-shadow: none;
    border-left: var(--d-bw) solid var(--d-line);
    padding: var(--d-p2) var(--d-p3) var(--d-p3);
  }
  :global([data-d='O']) .kpi:first-child { border-left: 0; }
  :global([data-d='O']) .kpi:hover { background: var(--d-sunk); }
  :global([data-d='O']) .kpi[aria-pressed='true'] {
    background: var(--tone-band); box-shadow: inset 0 -3px 0 var(--tone-fg);
  }
  /* la botonera de familias, misma idea: vidrio segmentado */
  :global([data-d='O']) .fams {
    gap: 0;
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r-lg);
    background: var(--d-surface);
    backdrop-filter: blur(14px) saturate(1.4);
    -webkit-backdrop-filter: blur(14px) saturate(1.4);
    box-shadow: var(--d-shadow);
    overflow: hidden;
  }
  :global([data-d='O']) .fam {
    background: transparent; border: 0; border-radius: 0;
    border-left: var(--d-bw) solid var(--d-line);
    padding: 6px var(--d-p2);
  }
  :global([data-d='O']) .fam:first-child { border-left: 0; }
  /* la losa recorta a sus segmentos, así que el foco se dibuja hacia adentro
     o el anillo se pierde contra el canto del vidrio */
  :global([data-d='O']) .kpi:focus-visible,
  :global([data-d='O']) .fam:focus-visible { outline-offset: -2px; }
  :global([data-d='O']) .fam[aria-pressed='true'] {
    background: var(--d-accent-soft); color: var(--d-brand-ink);
    box-shadow: inset 0 -2px 0 var(--d-accent);
  }
  :global([data-d='O']) .sect { box-shadow: var(--d-shadow-lg); }
  :global([data-d='O']) .lhead {
    background: var(--d-sunk); border-bottom-color: var(--d-line);
    box-shadow: inset 0 1px 0 var(--d-line);
  }
  /* MISMO REPARTO QUE EN MARCA, y es la razón por la que esta mezcla se
     sostiene: el teal tiñe el CONTENEDOR (la barra, la cabecera del bloque, el
     pie) y el grupo se tiñe de su ESTADO. Cuando el grupo también era teal, la
     pantalla entera era del mismo color y el vidrio no informaba nada. */
  :global([data-d='O']) .ghead {
    background: var(--tone-band); color: var(--d-ink);
    border-bottom-color: var(--d-line);
    box-shadow: inset 0 1px 0 var(--d-line);
    font-size: var(--d-t-sm); font-weight: var(--d-w-semi);
    text-transform: none; letter-spacing: 0;
  }
  :global([data-d='O']) .gc { color: var(--d-ink-2); }
  :global([data-d='O']) .vt { font-size: var(--d-t-xl); letter-spacing: -.02em; }
  :global([data-d='O']) .row:hover { background: var(--d-sunk); }
  :global([data-d='O']) .track { background: var(--d-sunk); box-shadow: inset 0 0 0 1px var(--d-line); }
  :global([data-d='O']) .thr { background: var(--d-ink-3); }
  :global([data-d='O']) .foot {
    background: linear-gradient(180deg, transparent 0%, var(--d-accent-soft) 100%), var(--d-sunk);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    border-top-color: var(--d-line);
  }
  /* la cabecera del panel ya es vidrio teñido: la nota de la derecha se lleva a
     la tinta de marca para no quedar teal sobre teal */
  :global([data-d='O']) .d-panel-head .cnt { color: var(--d-brand-ink); }

  
  /* el estado no pinta el fondo: muerde la espina con una muesca de su tono */
  /* la franja de filtros es opaca y taparía la espina de .scroll: se la
     vuelve a pintar encima, del mismo ancho */
  /* el panel trae 6px de padding para dejarle sitio a su propia espina, y eso
     empujaba la muesca de cada fila a un segundo carril de 6 a 12px: dos
     columnas de marca donde tiene que haber una. Sin ese padding, la espina
     del panel y las muescas de filas y grupos caen en el mismo carril. */
  /* la rejilla del listado arranca donde termina la espina */
  /* mismo ajuste que en C: a .7 el conteo caía a 3.7:1 sobre --d-sunk. */

  
  /* La barra lleva tinta clara, así que NO lleva barrido: un blanco al 58 %
     sobre el tercio de arriba deja el texto en 3:1 justo donde vive. Lo
     mojado se lo da el propio degradado de --d-accent-fill —que ya no es un
     color plano— más el realce duro de 1px del canto. */
  /* crimson sobre crimson no se ve: la acción se invierte a placa clara */
  /* misma razón que en la barra: sobre crimson el barrido se cambia por el
     realce duro del canto, que no cruza ninguna palabra */

  
  /* el KPI se aplasta a dos líneas de consola */
  /* una fila, una línea: 26px y ni un pixel más */
  /* cebrado de vidrio: el renglón par deja pasar un poco menos de fondo */
  /* el carril es un medidor segmentado, no una pastilla */

  
  /* el número va en tinta: en esta dirección el color no toca el contenido */
  /* pulsado sin cambiar de color: anillo de tinta, que se ve en gris también */
  /* las filas ya traen la firma del primitivo: acá se les hace sitio */
  /* la línea del plan es marcado propio: sin esto, se quedaba sin firma */
  /* hasta la pastilla se queda limpia: el fondo pasa a blanco y el tono se va
     abajo, a la luz. La palabra y la marca siguen llevando el estado, así que
     no queda información colgando solo del color */

  /* ── T · HALO CLARO — nada se rellena: existe lo que irradia, sobre papel ─
     La regla de Halo entera, del lado claro de la luz. La prueba de que está
     bien traída no es que brille: es que en toda la celda no hay UNA sola
     superficie sólida. La barra de módulo, el listado, el pie, los KPIs y los
     filtros son contornos de luz sobre el papel tibio del fondo, y el anillo
     de 1px toma el color del estado de lo que rodea. Eso es lo que la separa
     de Umbra, que es una tarjeta blanca de toda la vida con la sombra teñida:
     acá no hay tarjeta.

     LO QUE SE ATA CORTO. Un halo por fila son seis resplandores apilados y el
     listado se convierte en una nube. Así que irradia el GRUPO, no la fila:
     el encabezado de grupo es una pastilla de luz del color de su estado y
     debajo cuelgan filas calladas. A treinta segundos se ven dos anillos rojos
     y uno ámbar, y ahí está la respuesta a qué máquina atender.

     HALLAZGO: T no publica ningún token de resplandor (ni radio, ni
     dispersión) ni un anillo neutro. Los desenfoques van a mano; el anillo
     neutro se compone con color-mix desde --d-ink, y el color, siempre de
     token. Un --d-glow y un --d-ring lo resolverían en un solo lugar. */
  :global([data-d='T']) .screen {
    /* fuerte, para lo que manda: veredicto y encabezado de grupo */
    --pg-halo: 0 0 0 1px var(--tone-edge), 0 14px 36px -16px var(--tone-fg);
    /* suave, para lo que acompaña: KPIs y líneas del plan */
    --pg-lit: 0 0 0 1px var(--tone-edge), 0 8px 22px -14px var(--tone-fg);
    --pg-ring: 0 0 0 1px color-mix(in srgb, var(--d-ink) 9%, transparent);
  }
  /* la barra no se separa con una línea: se separa con la luz que deja caer.
     Sobre papel un resplandor tiene que ser mucho más corto que sobre negro:
     con la dispersión de Halo (-34px) acá no se veía absolutamente nada. */
  /* ══ AD · NÁCAR · la barra se separa con luz, no con una raya ══════════════
     El gesto es el de T · Halo claro y la cita es suya: «la barra no se separa
     con una línea: se separa con la luz que deja caer». Lo que cambia es la
     fuerza. T lo escribe con var(--d-accent) directo —opacidad plena— y sobre
     una dirección blanca eso no se lee como una barra que flota: se lee como
     una barra que gotea. Acá el color sale de --d-halo, que es el acento al
     30 %, y la dispersión se acorta de -18px a -20px.

     Que la fuerza viva en un token y no en esta regla es el punto: subir o
     bajar la firma de la dirección entera es cambiar un porcentaje en
     directions.css, sin abrir esta página. */
  :global([data-d='AD']) .topbar {
    background: transparent;
    border-bottom: 0;
    /* GEOMETRÍA DE T, SIN TOCAR. Los cuatro números son los suyos; lo único que
       cambia es que el color sale de --d-halo, que es el acento a media fuerza,
       en vez del acento entero. */
    box-shadow: 0 12px 28px -18px var(--d-halo);
    /* Y la barra se levanta, que es lo que hace A con su propia sombra. Sin
       esto el fondo del hermano siguiente se pinta después en el orden natural
       y se come la luz que la barra deja caer sobre él — que es justo el sitio
       donde esta dirección espera verla. */
    position: relative;
    z-index: 2;
  }
  :global([data-d='AD']) .search .d-input { background: transparent; }

  :global([data-d='T']) .topbar {
    background: transparent; border-bottom: 0;
    box-shadow: 0 12px 28px -18px var(--d-accent);
  }
  :global([data-d='T']) .title { font-weight: var(--d-w-semi); }
  :global([data-d='T']) .search .d-input { background: transparent; }
  /* «Registrar lectura» es la ÚNICA superficie llena de toda la celda, y es a
     propósito: en una pantalla donde nada se rellena, lo único macizo es lo
     único que hay que tocar. Teal sobre blanco, 5.2:1. */
  :global([data-d='T']) .act { background: var(--d-accent); color: var(--d-accent-ink); }
  :global([data-d='T']) .verdict {
    background: transparent; border: 0;
    box-shadow: var(--pg-halo);
  }
  :global([data-d='T']) .vt { font-size: var(--d-t-xl); font-weight: var(--d-w); letter-spacing: -.02em; }
  /* cuatro luces, cada una del color de lo que cuenta */
  :global([data-d='T']) .kpi {
    background: transparent; border: 0; border-radius: var(--d-r-lg);
    padding: var(--d-p2) var(--d-p3) var(--d-p3);
    box-shadow: var(--pg-lit);
  }
  :global([data-d='T']) .kpi:hover {
    transform: translateY(-1px);
    box-shadow: 0 0 0 1px var(--tone-fg), 0 12px 32px -12px var(--tone-fg);
  }
  /* pulsado: el anillo se enciende entero. El relleno sigue siendo un velo del
     tono al 10 %, no una superficie: la tinta se lee sobre papel igual. */
  :global([data-d='T']) .kpi[aria-pressed='true'] {
    background: var(--tone-band);
    box-shadow: 0 0 0 2px var(--tone-fg), 0 16px 44px -12px var(--tone-fg);
  }
  :global([data-d='T']) .filters { padding-block: var(--d-p1); }
  :global([data-d='T']) .fam {
    background: transparent; border: 0; border-radius: var(--d-r-pill);
    padding: 5px var(--d-p2);
    box-shadow: var(--pg-ring);
  }
  :global([data-d='T']) .fam:hover {
    background: transparent;
    box-shadow: 0 0 0 1px var(--d-accent-edge), 0 5px 16px -8px var(--d-accent);
  }
  :global([data-d='T']) .fam[aria-pressed='true'] {
    background: var(--d-accent-soft); color: var(--d-ink);
    box-shadow: 0 0 0 1px var(--d-accent), 0 6px 18px -8px var(--d-accent);
  }
  /* el listado tampoco es una tarjeta: es un contorno. Sin fondo blanco, lo
     que se ve es el anillo y el resplandor, y el papel del fondo pasa entero
     por debajo de las filas. */
  :global([data-d='T']) .sect { background: transparent; box-shadow: var(--d-shadow-lg); }
  :global([data-d='T']) .lhead {
    background: transparent; border-bottom: 0;
    box-shadow: 0 1px 0 var(--d-neu-edge);
  }
  :global([data-d='T']) .ghead {
    width: fit-content; max-width: 100%;
    background: transparent; border-bottom: 0; border-radius: var(--d-r-pill);
    margin: var(--d-p2) var(--d-p3) var(--d-p1);
    padding: var(--d-p1) var(--d-p3);
    font-size: var(--d-t-sm); font-weight: var(--d-w-semi);
    text-transform: none; letter-spacing: 0; color: var(--d-ink);
    box-shadow: var(--pg-halo);
  }
  :global([data-d='T']) .gc { color: var(--d-ink-2); }
  /* la fila se calla. directions.css le da a toda .d-row con tono el anillo y
     el halo del primitivo, y con seis filas eso es una sopa: acá pesa
     (0,4,0) para ganarle sin depender del orden de las hojas de estilo. */
  :global([data-d='T']) .row[data-tone] {
    box-shadow: none; margin-bottom: 0; border-radius: 0;
  }
  :global([data-d='T']) .row:hover { background: var(--d-sunk); }
  :global([data-d='T']) .track {
    height: 8px; background: transparent;
    box-shadow: inset 0 0 0 1px var(--d-neu-edge);
  }
  :global([data-d='T']) .fill { box-shadow: 0 0 14px -3px var(--tone-fg); }
  :global([data-d='T']) .thr { background: var(--d-ink-3); }
  /* cada plan es otra luz suelta, y necesitan aire entre ellas o los halos se
     tocan y se vuelven una mancha */
  :global([data-d='T']) .tlb { gap: var(--d-p3); }
  :global([data-d='T']) .tlr {
    border-radius: var(--d-r); padding: var(--d-p2) var(--d-p3);
    box-shadow: var(--pg-lit);
  }
  :global([data-d='T']) .tlid { color: var(--d-accent); }
  :global([data-d='T']) .foot {
    background: transparent; border-top: 0;
    box-shadow: 0 -12px 28px -18px var(--d-accent);
  }

  /* ── W · CRISTAL TEMPLADO — vidrio donde sirve, opaco donde estorba ────
     Es Cristal corregido, y la corrección se ve entera acá porque esta
     pantalla es donde Cristal se rompe: nueve losas del mismo material
     apiladas (barra, veredicto, cuatro KPIs, dos paneles, pie). Nueve láminas
     iguales no son jerarquía, son una sola hoja lechosa.

     LA LEY DEL MATERIAL, en tres líneas y sin excepciones:

     · Vidrio (backdrop-filter) en TRES superficies y ninguna más: la barra de
       módulo, los dos paneles y el pie. Son las que se quedan quietas, las que
       nadie toca y las únicas con campo detrás que valga la pena desenfocar.
     · Opaco todo lo que se toca (KPIs, fichas, botones, campos) y todo lo que
       carga texto denso (filas, encabezados de grupo, planes). Ahí el vidrio
       estorba: el contraste pasaría a depender de cuántas capas hay debajo.
     · Nunca vidrio sobre vidrio. Dentro de un panel el material se hace con
       alfa sobre el vidrio que el panel ya trae, jamás con un segundo
       backdrop-filter. Ese es el defecto que hunde a Cristal en pantalla
       completa, y acá queda cerrado por regla, no por cuidado.

     Nada FLOTA en esta pantalla: no hay menú propio, ni desplegable propio, ni
     globo. El único desplegable es el select de «Agrupar por», que lo dibuja el
     sistema operativo y ya es sólido, y las únicas ayudas emergentes son
     atributos title. La red de seguridad de directions.css (--d-overlay por
     posición) no llega a activarse acá, y eso es lo correcto: la regla 1 se
     cumple porque no hay nada translúcido que pueda cruzarse con el texto de
     abajo, no porque se la haya parcheado.

     HALLAZGO 1: el radio de desenfoque sigue sin tokenizar. directions.css
     escribe 20px dentro de [data-d='W'] .d-panel, así que la barra y el pie lo
     repiten a mano para ser la misma lámina. Un --d-blur lo resolvería en un
     solo lugar y además dejaría bajarlo por consulta de medios sin tocar cada
     selector.
     HALLAZGO 2: W no publica un token de superficie OPACA de control. El botón
     lleva rgba(255,255,255,.82) escrito dentro de directions.css, así que el
     KPI, que tiene que ser el mismo material, lo recompone desde --d-overlay
     con color-mix en vez de repetir el hex. Un --d-control lo cerraría. */

  /* el ancho del canto rojo vive en una sola variable: la pantalla angosta lo
     engorda de una vez y no queda ni un filo desparejo */
  :global([data-d='W']) .screen { --pg-canto: 3px; }
  /* densidad. La pila entera se aprieta un escalón (16 a 12 entre bloques)
     porque en Cristal el veredicto y los KPIs se comían los 620px y la tabla
     empezaba justo debajo del corte: la pantalla contestaba «cuántos» y no
     «cuál». Con esto la primera fila vencida asoma, que además es la única
     manera honesta de decir que hay más abajo. */
  :global([data-d='W']) .scroll { gap: var(--d-p2); }

  /* la barra y el pie son la misma lámina, soldada al marco: no flotan, no
     llevan margen y no llevan radio. En Cristal flotaban con margen y sombra,
     que es exactamente lo que la regla 1 prohíbe para lo que flota. */
  :global([data-d='W']) .topbar {
    background: var(--d-surface);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    border-bottom-color: var(--d-overlay-edge);
    box-shadow: inset 0 1px 0 var(--d-line);
  }
  :global([data-d='W']) .foot {
    background: var(--d-surface);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    border-top-color: var(--d-overlay-edge);
    box-shadow: inset 0 1px 0 var(--d-line);
  }

  /* EL CANTO ROJO. Es el recurso estructural de esta pantalla y codifica una
     sola cosa: vencido. Aparece a la misma x en cada altura donde hay algo
     vencido (veredicto, KPI de vencidos, encabezado de grupo, filas, plan),
     porque veredicto, KPIs y paneles son hermanos de .scroll y comparten borde
     izquierdo. A los treinta segundos se lee una columna roja interrumpida y no
     hace falta leer una palabra.
     El resplandor va un paso más adentro y lo pone directions.css: solo las
     FILAS vencidas irradian, porque una fila es la máquina que hay que
     atender. El veredicto la nombra, el canto la ubica, el halo la señala. */
  /* tipografía fluida en la única frase larga de la pantalla: entre 320 y
     544px baja sola de 26 a 19px, sin un punto de quiebre que la deje partida
     justo antes. La escala vive en el bloque y no en la frase, así la marca de
     severidad, que mide 1.15em, baja con ella: una señal de 30px al lado de
     una frase de 19px sería un cartel, no una marca. Todo lo demás en esta
     pantalla es dato tabular y no se escala. */
  :global([data-d='W']) .verdict {
    display: flex; align-items: center; gap: var(--d-p3);
    font-size: clamp(var(--d-t-lg), 3.6vw + .4rem, var(--d-t-xl));
    box-shadow: var(--d-shadow);
  }
  :global([data-d='W']) .verdict[data-tone='critical'] {
    box-shadow: var(--d-shadow), inset var(--pg-canto) 0 0 var(--d-crit);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }
  :global([data-d='W']) .vk { font-size: 1em; }
  :global([data-d='W']) .vt {
    font-size: 1em;
    font-weight: var(--d-w-med);
    letter-spacing: -.02em;
  }

  /* los KPIs son CONTROLES, así que son opacos y no desenfocan: el mismo
     material que .d-btn en W. Cuatro cajas de vidrio con una cifra encima del
     campo de manchas es justo donde el número deja de leerse, y el desenfoque
     en algo que se pulsa se paga en repintados a cada cambio de estado. */
  :global([data-d='W']) .kpi {
    padding: var(--d-p2) var(--d-p3);
    background: color-mix(in srgb, var(--d-overlay) 82%, transparent);
    backdrop-filter: none; -webkit-backdrop-filter: none;
    border-color: var(--d-overlay-edge);
    box-shadow: var(--d-shadow);
  }
  /* el reposo cambia de MATERIAL, no de altura: acá no se levanta nada porque
     nada flota. La moción que queda es la que responde a un dedo. */
  :global([data-d='W']) .kpi:hover { background: var(--d-overlay); }
  :global([data-d='W']) .kpi:active { transform: translateY(1px); }
  /* el pulsado se escribe con (0,3,0) a propósito: la regla de arriba pesa lo
     mismo que .kpi[aria-pressed='true'] de la base y va después, así que sin
     esto le comería el estado y el filtro activo quedaría idéntico al
     inactivo. El subrayado de 3px es lo que evita que el estado sea solo
     color; el aria-pressed lo dice, y la aparición de «Limpiar filtros» lo
     confirma en palabras. */
  :global([data-d='W']) .kpi[aria-pressed='true'] {
    background: var(--tone-band);
    border-color: var(--tone-edge);
    box-shadow: var(--d-shadow), inset 0 -3px 0 var(--tone-fg);
  }
  :global([data-d='W']) .kpi[data-tone='critical'] {
    box-shadow: var(--d-shadow), inset var(--pg-canto) 0 0 var(--d-crit);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }
  :global([data-d='W']) .kpi[data-tone='critical'][aria-pressed='true'] {
    box-shadow: var(--d-shadow), inset var(--pg-canto) 0 0 var(--d-crit), inset 0 -3px 0 var(--d-crit);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }

  /* las fichas se quedan como en Cristal, que ya funcionaban: pastilla, canto
     de luz y el velo más fino de la pantalla. Cambian dos cosas y las dos son
     de uso: el reposo del ratón deja de ser el mismo --d-sunk que el descanso,
     que en Cristal no daba respuesta ninguna, y el marcado vuelve al acento de
     la base en lugar del blanco de Cristal, que apenas se distinguía. */
  :global([data-d='W']) .fam {
    border-radius: var(--d-r-pill);
    border-color: var(--d-line);
    background: var(--d-sunk);
  }
  :global([data-d='W']) .fam:hover { background: var(--d-surface); }
  :global([data-d='W']) .fam[aria-pressed='true'] {
    background: var(--d-accent-soft);
    border-color: var(--d-accent-edge);
    box-shadow: inset 0 1px 0 var(--d-line);
  }
  /* «Limpiar filtros» es la salida del estado filtrado y en W quedaba sin
     fondo, sin borde y sin sombra sobre el campo de color: un enlace disfrazado
     de botón. Se le devuelve el canto de control SIN tocar .d-btn, que en W es
     justo la regla que le roba el relleno al primario. */
  :global([data-d='W']) .filters .d-btn--ghost {
    background: color-mix(in srgb, var(--d-overlay) 70%, transparent);
    border-color: var(--d-overlay-edge);
  }
  :global([data-d='W']) .filters .d-btn--ghost:hover { background: var(--d-overlay); }

  /* ── la tabla: vidrio afuera, opaco adentro ───────────────────────────
     La altura separa los dos bloques. El listado es donde se decide, el
     calendario es contexto, y eso es lo único que puede decir una sombra. */
  :global([data-d='W']) .list { box-shadow: var(--d-shadow-lg); }
  /* el encabezado de columna es un peldaño de alfa sobre el vidrio del panel,
     nunca un segundo desenfoque. Su regla de abajo es una LÍNEA de tinta
     (--d-edge) y no un filo de luz: en una tabla la estructura es el dato. */
  :global([data-d='W']) .lhead { border-bottom-color: var(--d-edge); }
  /* el encabezado de grupo comparte banda con sus filas, porque en W la fila
     lleva la banda opaca del tono y un encabezado de otro color partiría el
     estrato en dos. Lo que lo separa es la tinta del tono, el cuerpo y el peso,
     más una sola regla en --tone-edge debajo. Sin borde arriba: el cambio de
     banda entre estratos ya es el corte, y una raya más sería una raya doble
     contra el borde inferior de la última fila del grupo anterior. */
  :global([data-d='W']) .ghead {
    background: var(--tone-band);
    color: var(--tone-fg);
    border-bottom-color: var(--tone-edge);
    font-size: var(--d-t-sm);
    font-weight: var(--d-w-semi);
    text-transform: none;
    letter-spacing: 0;
  }
  :global([data-d='W']) .gc { color: var(--d-ink-2); }
  :global([data-d='W']) .ghead[data-tone='critical'] {
    box-shadow: inset var(--pg-canto) 0 0 var(--d-crit);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }
  /* la fila no lleva estado de reposo del ratón: no es un objeto que se pueda
     pulsar, y en Cristal ese gris además le borraba la banda del tono. Todo lo
     que hace la fila en W ya está en directions.css: banda opaca, sin anillo,
     sin margen, y resplandor solo si está vencida.
     Lo que sí falta es el canto del panel. .d-panel no recorta, y no puede
     recortar porque eso mataría justo el halo de la fila vencida, que es un
     resplandor hacia afuera. Así que la última fila redondea sus dos esquinas
     o su banda opaca asoma cuadrada por el radio de 22px del vidrio. */
  :global([data-d='W']) .rows > .row:last-child {
    border-bottom-left-radius: calc(var(--d-r-lg) - var(--d-bw));
    border-bottom-right-radius: calc(var(--d-r-lg) - var(--d-bw));
  }
  /* la pastilla de estado sobre una fila ya teñida: con la misma banda que la
     fila deja de tener forma y queda un anillo suelto. Sube un peldaño de luz,
     conserva su filo y su tinta del tono, y vuelve a leerse como una pieza. */
  :global([data-d='W']) .c-state .d-pill,
  :global([data-d='W']) .tlw { background: var(--d-surface); }

  /* ── la línea de tiempo ───────────────────────────────────────────────
     Cada plan es una banda opaca del tono dentro del panel de vidrio: mismo
     material que una fila, y por la misma razón. */
  :global([data-d='W']) .tlr {
    background: var(--tone-band);
    border: var(--d-bw) solid var(--tone-edge);
    border-radius: var(--d-r);
    padding: var(--d-p2) var(--d-p3);
  }
  :global([data-d='W']) .tlr[data-tone='critical'] {
    box-shadow: inset var(--pg-canto) 0 0 var(--d-crit);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }
  :global([data-d='W']) .track {
    background: var(--d-sunk);
    box-shadow: inset 0 0 0 1px var(--d-edge);
  }
  /* el umbral del 100 % tiene que leerse sobre el carril vacío Y sobre el
     relleno, que a 118 % lo tapa entero: tinta llena con un filo de luz
     alrededor, que es el mismo recurso con el que W separa el vidrio del
     campo. Sin el filo, la marca desaparece dentro del rojo. */
  :global([data-d='W']) .thr {
    background: var(--d-ink);
    box-shadow: 0 0 0 1px var(--d-line);
  }

  /* accesibilidad del material. Quien pide menos transparencia suele pedirla
     porque el texto sobre fondos vivos le cuesta, así que el campo desaparece
     y la dirección deja de ser de vidrio antes que dejar de ser usable.
     directions.css ya lo hace con .d-panel y .d-btn; la barra, el pie y los
     KPIs son de esta página y por lo tanto son deuda de esta página. */
  @media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
    :global([data-d='W']) .topbar,
    :global([data-d='W']) .foot {
      backdrop-filter: none; -webkit-backdrop-filter: none;
    }
    :global([data-d='W']) .kpi:not([aria-pressed='true']),
    :global([data-d='W']) .filters .d-btn--ghost { background: var(--d-overlay); }
  }
  @media (prefers-reduced-motion: reduce) {
    :global([data-d='W']) .kpi { transition: none; }
    :global([data-d='W']) .kpi:active { transform: none; }
  }

  /* ======================================================================
     RESPONSIVE — hasta 380px. La fila deja de ser tabla y pasa a ser ficha
     de dos columnas: lo que identifica a la izquierda, el estado a la derecha.
     ====================================================================== */
  @media (max-width: 760px) {
    .lhead { display: none; }
    .row {
      grid-template-columns: minmax(0, 1fr) auto;
      row-gap: 2px;
      padding-block: var(--d-p1);
      align-items: start;
    }
    .c-code { grid-area: 1 / 1; }
    .c-state { grid-area: 1 / 2; justify-content: flex-end; }
    .c-eq { grid-area: 2 / 1; }
    .c-metric { grid-area: 2 / 2; }
    .c-plan { grid-area: 3 / 1 / 4 / 3; }
    /* a este ancho el raíl de 148px no deja nada para el contenido */
    /* el marco de la barra de filtros se apila: la etiqueta pasa arriba */
  }
  @media (max-width: 560px) {
    .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    /* la rejilla de dos columnas necesita otro juego de divisiones */
    .search { flex: 1 1 100%; order: 3; }
    .act { margin-left: auto; }
    .tlt { flex: 1 1 100%; }
  }

  /* ── Las once nuevas, en angosto. Se recoge siempre lo mismo: raíles
     fijos, rejillas de columnas y solapamientos horizontales, que son las
     tres cosas que necesitan ancho para no volverse un carácter por línea.
     El material —vidrio, esmalte, luz, piedra— no se toca: no depende del
     ancho y es lo que identifica a cada dirección. ────────────────────── */
  @media (max-width: 760px) {
    /* P — el raíl de 152px se guarda de nuevo: bajo este ancho es
       exactamente la trampa por la que se había retirado. La espina se
       queda, porque no depende del ancho. */
    /* R — la fila de consola se rinde y pasa a ficha, como todas */
  }
  @media (max-width: 560px) {
    /* O — la losa segmentada pasa a dos por dos: las divisiones de luz
       cambian de sitio o quedan cortando por la mitad de una fila */
    :global([data-d='O']) .kpi:nth-child(odd) { border-left: 0; }
    :global([data-d='O']) .kpi:nth-child(n + 3) { border-top: var(--d-bw) solid var(--d-line); }
    /* N — dos carriles por fila: el que abre cada fila no se monta con
       nada a su izquierda, y el solapamiento pasa a ser vertical */
    /* I — con la barra y el pie flotando, el aire de los lados se recorta */
    :global([data-d='I']) .topbar { margin: var(--d-p2) var(--d-p2) 0; }
    :global([data-d='I']) .foot { margin: 0 var(--d-p2) var(--d-p2); }
  }

  /* ======================================================================
     W · CRISTAL TEMPLADO, EN ANGOSTO — declarado de principio a fin.

     Es el hueco real de esta pantalla: nadie la miró abajo de 500px porque
     Chrome sin cabeza en macOS no baja de un ancho mínimo, así que el tramo
     donde un técnico la va a abrir de verdad pasó todas las rondas sin
     mirarse. Acá va escrito qué se apila, qué columna se cae primero y qué se
     vuelve desplazamiento.

     LO QUE SE APILA
       ≤760px  La fila deja de ser fila de tabla y pasa a ficha de tres
               renglones: código y estado arriba, equipo y lectura en medio,
               plan abajo a lo ancho. Lo hace la base para las veinte
               direcciones; en W importa el doble porque la banda del tono deja
               de ser una franja de 44px y pasa a ser el fondo de la ficha
               entera, y el canto rojo pasa a correr por todo el lado izquierdo
               de la ficha vencida. Sigue siendo lo primero que se ve.
               Además se deja envolver la cabecera de panel: «Próximos
               vencimientos» y «la marca es el 100 %» no entran juntos y .cnt va
               en nowrap.
       ≤560px  La barra de módulo se apila en dos renglones y la acción
               primaria toma el ancho completo. Los KPIs pasan a dos por fila
               (base). Las fichas de familia se envuelven en tres renglones de
               44px.
       ≤420px  Los KPIs conservan las dos columnas pero la cifra baja un
               escalón y las etiquetas dejan de ir en una sola línea.

     QUÉ COLUMNA SE CAE PRIMERO
       Ninguna se cae: a ≤760px la rejilla de cinco columnas se reordena en
       tres renglones y las cinco celdas siguen presentes. Es deliberado. En un
       ERP de mantenimiento las cinco son la respuesta a «qué máquina atender»:
       código, equipo, plan, lectura y estado. Esconder la lectura o el plan
       en un teléfono es esconder justo el dato que se va a consultar parado
       frente a la máquina. Lo que se cae es el encabezado de columna, que a
       una sola ficha por renglón ya no rotula nada, y esa pérdida la cubren
       las etiquetas implícitas de cada celda.

     QUÉ SE VUELVE DESPLAZAMIENTO HORIZONTAL
       Nada, y es una decisión, no una omisión. La tabla se reordena en vez de
       desplazarse porque una tabla de cinco columnas en 320px es una tabla que
       se lee con las dos manos. Lo que sí hay que impedir es el desplazamiento
       ACCIDENTAL: .scroll declara overflow-y, o sea que su overflow-x calculado
       es auto, así que cualquier cosa que sobresalga deja de verse y empieza a
       moverse de lado. Los dos culpables reales están anotados abajo, uno por
       uno, y los dos se resuelven dejando envolver el texto en vez de
       recortarlo.
     ====================================================================== */
  @media (max-width: 760px) {
    /* CULPABLE 1 de desplazamiento lateral: .cnt va en nowrap y con el título
       al lado no entra en el ancho del panel. Empuja .d-panel y, por el
       overflow-y de .scroll, la pantalla entera se mueve de lado. Envuelve. */
    :global([data-d='W']) .d-panel-head { flex-wrap: wrap; row-gap: 2px; }
    :global([data-d='W']) .d-panel-title { min-width: 0; }
    :global([data-d='W']) .cnt { white-space: normal; }
    /* la ficha respira: con tres renglones dentro, 8px de aire arriba y abajo
       dejaban el texto pegado al canto de su propia banda */
    :global([data-d='W']) .row { padding-block: var(--d-p2); row-gap: 3px; }
    /* LA FILA DEJA DE RECORTAR Y EMPIEZA A ENVOLVER. En rejilla de cinco
       columnas el recorte con puntos suspensivos es correcto: la columna de al
       lado da el contexto y el ancho está garantizado. En ficha de dos, la
       columna del equipo baja a 104px en un teléfono de 320 y «Batidora Imer
       Syntesi 250» se convierte en «Batidora Ime…». Ese texto es la respuesta
       a la única pregunta que se le hace a esta pantalla, así que envuelve.
       La lectura (.mv) se queda recortando: son cuatro caracteres y va
       alineada a la derecha, donde envolver la desalinearía de su porcentaje. */
    :global([data-d='W']) .nm,
    :global([data-d='W']) .pl,
    :global([data-d='W']) .sub {
      white-space: normal;
      overflow: visible;
      text-overflow: clip;
    }
  }
  @media (max-width: 560px) {
    /* el desenfoque se apaga. A este ancho la barra y el pie ocupan la pantalla
       entera y no queda campo alrededor que desenfocar: el efecto se paga en
       repintados y no se ve. directions.css ya lo apaga en .d-panel; la barra y
       el pie son de esta página. La lámina se queda, lo que se va es el filtro. */
    :global([data-d='W']) .topbar,
    :global([data-d='W']) .foot {
      backdrop-filter: none; -webkit-backdrop-filter: none;
      background: color-mix(in srgb, var(--d-overlay) 92%, transparent);
    }
    /* orden visual = orden del tabulador. La base mueve el buscador con
       order:3 y deja el foco saltando del segundo renglón al primero. Acá la
       barra pasa a rejilla de dos columnas y cada cosa cae donde el DOM la
       puso: Flota y buscador en el primer renglón, la acción primaria a lo
       ancho en el segundo, que es donde cae el pulgar. */
    :global([data-d='W']) .topbar {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
    }
    :global([data-d='W']) .search { order: 0; }
    :global([data-d='W']) .act {
      grid-column: 1 / -1;
      width: 100%;
      margin-left: 0;
      min-height: var(--d-touch);
    }
    /* objetivos táctiles. La base deja la ficha de familia en 24px y el
       selector y el campo en 36px, o sea por debajo de los 44 en los tres
       controles que más se usan en esta pantalla. */
    :global([data-d='W']) .fam {
      min-height: var(--d-touch);
      align-items: center;
      scroll-snap-align: start;
    }
    :global([data-d='W']) .gsel,
    :global([data-d='W']) .search .d-input { min-height: var(--d-touch); }
    /* LO ÚNICO QUE SE VUELVE DESPLAZAMIENTO HORIZONTAL EN TODA LA PANTALLA, y
       está contenido dentro de su propia caja: nunca mueve la página.
       Con los objetivos a 44px, siete familias envueltas costaban unos 360px
       de alto, o sea más de la mitad de la ventana, para una barra de filtro
       que casi nunca se usa. En una tira que se arrastra cuestan 52 y la tabla
       recupera lo demás. La ficha «Todas» va primera y siempre visible, así
       que el estado de reposo se ve sin arrastrar nada, y el ajuste por
       posición deja cada ficha entera al soltar.
       El relleno vertical no es decorativo: overflow-x: auto obliga al eje
       vertical a calcularse como auto, y sin esos 4px el anillo de foco de una
       ficha quedaría recortado por su propio contenedor. */
    :global([data-d='W']) .fams {
      flex: 1 1 100%;
      min-width: 0;
      flex-wrap: nowrap;
      overflow-x: auto;
      overscroll-behavior-inline: contain;
      scroll-snap-type: inline proximity;
      padding-block: 4px;
      scrollbar-width: thin;
    }
    /* el canto rojo engorda entero. directions.css ya lleva la fila vencida de
       3 a 5px porque contra el marco de un teléfono 3px se pierden; si el
       veredicto, el KPI, el encabezado y el plan se quedan en 3, la columna
       roja queda dentada justo donde más se la mira. */
    :global([data-d='W']) .screen { --pg-canto: 5px; }
  }
  @media (max-width: 420px) {
    /* CULPABLE 2 de desplazamiento lateral: a 320px cada KPI mide unos 111px y
       le quedan 77 de contenido. «Por vencer» en una sola línea mide 86 y se
       salía de su casilla, que no recorta.
       El KPI apilado además costaba 130px de alto por casilla y entre el
       veredicto y los cuatro KPIs no quedaba un solo píxel de tabla dentro de
       los 620: la pantalla contestaba «cuántos» y nunca «cuál», que es lo
       único que se le pregunta parado frente a la máquina. Acá la cifra y la
       etiqueta comparten renglón y la nota baja al segundo. Ni un dato se
       esconde, y se recuperan unos 160px, o sea el encabezado del grupo
       vencido más sus dos filas. */
    :global([data-d='W']) .kpi {
      flex-direction: row;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 0 var(--d-p1);
      padding: var(--d-p2);
    }
    :global([data-d='W']) .kv { font-size: var(--d-t-lg); }
    :global([data-d='W']) .kl {
      flex: 1 1 auto;
      min-width: 0;
      white-space: normal;
      font-size: var(--d-t-xs);
    }
    :global([data-d='W']) .kn {
      flex: 1 1 100%;
      white-space: normal;
      text-overflow: clip;
    }
    /* el veredicto cede relleno, no cuerpo: la frase es lo que se lee primero
       y bajarla de 19px sería cambiar la respuesta por el envase */
    :global([data-d='W']) .verdict { padding: var(--d-p2); gap: var(--d-p2); }
  }

  /* ══ W · OBJETIVOS TÁCTILES, POR PUNTERO Y NO POR ANCHO ══════════════════
     El tamaño de un dedo es un hecho del aparato, no del ancho de la ventana.
     directions.css sube los .d-btn de W a --d-touch dentro de
     @media (max-width: 560px), así que una tableta de 768px —que se toca con
     el pulgar igual que un teléfono— se quedaba con los controles de ratón.
     Medido con puntero grueso emulado por CDP a 768px, esta página tenía
     10 objetivos por debajo de 44px. Va por (pointer: coarse) porque ese es
     el hecho que importa; el ancho ya tiene sus propias reglas y hacen otra
     cosa. Con ratón no cambia un pixel. */
  @media (pointer: coarse) {
    :global([data-d='W']) .d-btn,
    :global([data-d='W']) .d-input,
    :global([data-d='W']) .gsel,
    :global([data-d='W']) .d-select { min-height: var(--d-touch); }
    /* Las fichas de familia son botones propios de esta pantalla y no
       heredan de .d-btn. */
    :global([data-d='W']) .fam { min-height: var(--d-touch); }
  }

  /* ══════════════════════════════════════════════════════════════════════
     X · COTA — LA PANTALLA ENTERA

     La pregunta que se le hace a esta pantalla es una sola y se contesta de
     pie, con la máquina enfrente: ¿cuál atiendo? Todo lo de aquí abajo existe
     para que la respuesta salga antes de leer una palabra.

     LA REGLA 1, APLICADA A LA LETRA. En todo este bloque no hay un color que
     no venga de --tone-*. Barra, paneles, fichas, botones, rieles en reposo,
     marca del tope, encabezados y pie salen de --d-ink*, --d-line, --d-edge,
     --d-sunk y --d-surface, que son grises de esmalte sin temperatura. El
     acento de X es tinta, así que el botón primario es negro y no un color: se
     ve que es el primario por su masa, no por su tono.
     Y hay una vuelta de tuerca más, en el riel: el relleno también es gris
     mientras no haya pasado el tope. Un riel corto no tiene ningún estado que
     reportar. Gasta color el que se pasó, y solo él.

     Consecuencia medible: entrecerrando los ojos hasta que el texto sea
     ilegible quedan visibles cuatro cosas y las cuatro son estado. La banda
     rosa del veredicto arriba, las cuatro cifras de los KPIs, la banda rosa del
     grupo «Vencidos» con sus dos filas, y dos barras rojas cruzando la vertical
     de la columna de lecturas. Nada más tiene color en la celda.

     LA REGLA 2, Y DÓNDE SE APLICA. La cota va en los dos únicos sitios donde
     hay una medida contra un tope: la columna de lectura de la tabla (312 h
     contra las 250 h del plan) y el carril de la línea de tiempo (el porcentaje
     contra el 100 %). NO va en los KPIs: «8 vencidos» es un conteo y no tiene
     tope publicado; ponerle uno exigiría inventar una meta, y una cota sin
     marca de tope es una barra de progreso decorativa.

     LO QUE APORTA ESTA PÁGINA SOBRE LA PRIMITIVA: la columna de lecturas está
     normalizada. Cada riel mide contra el tope de SU máquina —250 h, 2 000 h,
     90 d, 10 000 km— así que el 100 % cae siempre en el mismo punto del carril
     y las marcas de todas las filas se apilan en una sola vertical. Esa
     vertical es el plan, dibujado una vez y para toda la flota: lo que la cruza
     está pasado. Es la única raya que esta pantalla añade y no es adorno, es la
     cota del dibujo.

     NO SE REDEFINE .d-btn. directions.css ya le da a X su canto y su sombra de
     un píxel, y una regla `.d-btn` escrita desde esta página pesaría lo mismo
     que `[data-d='X'] .d-btn--primary` de allá y llegaría después: «Registrar
     lectura» quedaría tinta blanca sobre relleno blanco, 1.02:1, sin un error
     en consola. Lo único que se toca del botón es el tamaño táctil, y por
     puntero.
     ══════════════════════════════════════════════════════════════════════ */

  /* ── barra del módulo ─────────────────────────────────────────────────
     La personalidad no puede salir de la fuente: @font-face dentro de un
     shadow root lo ignoran Chrome y Safari, así que es la pila del sistema en
     las veinte. Sale del tratamiento: 25px en 700 con -.032em de tracking
     contra los 13.5px en 400 de todo lo demás. El salto de peso es el que
     manda, no el de tamaño. */
  :global([data-d='X']) .topbar {
    background: var(--d-surface);
    border-bottom-color: var(--d-line);
  }
  :global([data-d='X']) .title {
    font-size: var(--d-t-xl);
    font-weight: var(--d-w-bold);
    letter-spacing: -.032em;
  }

  /* ── veredicto ────────────────────────────────────────────────────────
     Es la frase que se lee primero y se queda en 18px. Subirla a 25px la
     partía en tres renglones y empujaba la primera fila vencida fuera de los
     620px: la pantalla contestaba «cuántos» y nunca «cuál». Lo que sube es el
     peso, que no cuesta alto.
     El canto de 3px en --tone-fg es la misma gramática que directions.css le
     da a .d-row en X, así que el veredicto y las filas hablan igual. */
  :global([data-d='X']) .verdict {
    display: flex;
    align-items: center;
    gap: var(--d-p3);
    background: var(--tone-band);
    border: var(--d-bw) solid var(--tone-edge);
    border-left: 3px solid var(--tone-fg);
    border-radius: var(--d-r);
  }
  :global([data-d='X']) .vt {
    font-size: var(--d-t-lg);
    font-weight: var(--d-w-semi);
    letter-spacing: -.015em;
  }

  /* ── tira de KPIs ─────────────────────────────────────────────────────
     Cuatro conteos, sin riel: no hay tope contra el que medirlos. La cifra es
     lo único con color y va en 34px/700 con -.04em; la etiqueta baja a 13.5px
     en 520. Ese salto es toda la jerarquía que hace falta. */
  :global([data-d='X']) .kpi {
    border-radius: var(--d-r);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='X']) .kv {
    font-size: var(--d-t-2xl);
    letter-spacing: -.04em;
  }
  /* la moción hace UN trabajo: confirmar el dedo. Es el mismo hundimiento de
     un píxel que directions.css le da a .d-btn en X, para que un control se
     comporte igual en toda la pantalla. */
  :global([data-d='X']) .kpi:active { transform: translateY(1px); }
  /* (0,3,0) a propósito: la regla de arriba pesa lo mismo que
     `.kpi[aria-pressed='true']` de la base y va después, así que sin esto el
     filtro activo quedaría idéntico al inactivo.
     El marcado NO se pinta del tono: en Cota el color es del dato, y cuál
     filtro está puesto es cromo. Se hunde el papel y se le pone anillo de
     tinta, que además sobrevive en escala de grises. La cifra sigue llevando
     su tono, el aria-pressed lo dice y «Limpiar filtros» lo confirma en
     palabras: el estado nunca cuelga solo del color. */
  :global([data-d='X']) .kpi[aria-pressed='true'] {
    background: var(--d-sunk);
    border-color: var(--d-ink);
    box-shadow: inset 0 0 0 1px var(--d-ink);
  }

  /* ── barra de filtros ─────────────────────────────────────────────────
     La ficha marcada se llena de tinta. --d-accent-soft con canto de tinta ya
     funcionaba, pero de lejos una ficha gris clara entre seis grises claras no
     se encuentra, y encontrar el filtro puesto es la mitad de salir de él.
     Blanco sobre #16181A: 16.9:1. */
  :global([data-d='X']) .flab { color: var(--d-ink-2); }
  :global([data-d='X']) .fam { border-color: var(--d-edge); }
  :global([data-d='X']) .fam[aria-pressed='true'] {
    background: var(--d-accent);
    color: var(--d-accent-ink);
    border-color: var(--d-accent);
  }
  :global([data-d='X']) .fam[aria-pressed='true'] .ct { color: inherit; }

  /* ── tabla ────────────────────────────────────────────────────────────
     La columna de lectura pasa de 74 a 152px porque ahí ya no hay una cifra:
     hay una cifra, un riel y su tope. El gap baja a 7px para pagarlo sin
     estrechar el nombre del equipo, que es la otra respuesta de la fila. */
  :global([data-d='X']) .sect { border-radius: var(--d-r); }
  :global([data-d='X']) .cnt { color: var(--d-ink-2); }
  :global([data-d='X']) .lhead,
  :global([data-d='X']) .row {
    grid-template-columns: 66px minmax(0, 1.9fr) minmax(0, 1.1fr) 162px 96px;
    gap: var(--d-p1);
  }
  :global([data-d='X']) .lhead {
    background: var(--d-sunk);
    border-bottom-color: var(--d-edge);
  }
  /* la lectura deja de ir a la derecha: el riel arranca donde arranca la cifra */
  :global([data-d='X']) .lhead .ta-r { position: relative; text-align: left; }
  :global([data-d='X']) .xtope {
    position: absolute;
    left: calc(66.67% + 4px);
    top: 0;
    font-style: normal;
    color: var(--d-ink-2);
  }

  /* el encabezado de grupo repite la gramática de la fila: canto de 3px del
     tono, y banda solo para lo vencido, que es el único estado que interrumpe.
     Sin versalitas: --d-label-case ya viene en none y las versalitas sobre
     cada bloque son el ritmo que delata una plantilla. */
  :global([data-d='X']) .ghead {
    position: relative;
    background: var(--d-sunk);
    border-top: var(--d-bw) solid var(--d-line);
    border-bottom-color: var(--d-line);
    padding-left: calc(var(--d-p3) + 3px);
    font-size: var(--d-t-sm);
    font-weight: var(--d-w-semi);
    letter-spacing: -.01em;
    color: var(--d-ink);
  }
  :global([data-d='X']) .ghead::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 3px;
    background: var(--tone-fg);
  }
  :global([data-d='X']) .ghead[data-tone='critical'] { background: var(--d-crit-band); }
  /* el primero cuelga del encabezado de columnas, que ya trae su regla: dos
     rayas pegadas se leen como un error de impresión */
  :global([data-d='X']) .rows > .ghead:first-child { border-top: 0; }
  :global([data-d='X']) .gc { color: var(--d-ink-2); }

  /* la pastilla de estado deja de ser una cápsula y pasa a ser un sello: en
     una pantalla donde todo canto es de 4px, 999px es la única forma blanda y
     se lee como de otra familia. */
  :global([data-d='X']) .c-state .d-pill,
  :global([data-d='X']) .tlw { border-radius: var(--d-r); }

  /* ── LA COLUMNA DE LECTURAS, QUE ES LA FIRMA ─────────────────────────
     La vertical del plan. Se dibuja en --d-line, o sea el gris de una línea de
     construcción, y encima de ella cae la marca de cada riel en tinta llena.
     La marca sobresale 4px por arriba y por abajo (directions.css), así que se
     ve incluso cuando el relleno la tapa: a 118 % el rojo pasa por encima del
     tramo del riel y la marca sigue asomando contra el papel. */
  /* la celda se estira a la altura de la fila y centra su contenido por dentro.
     Con la altura automática, la fila «sin lectura» es tres píxeles más baja
     que sus vecinas y la vertical del plan queda dentada justo donde se la
     mira de corrido. */
  :global([data-d='X']) .c-metric {
    position: relative;
    /* isolation crea el contexto de apilado que necesita el z-index negativo de
       la raya. Sin él, la raya se pintaba ENCIMA de la nota y «faltan 160 h» se
       leía «falta1 160 h»; y con z-index negativo sin contexto se hundiría por
       debajo del fondo de la fila y desaparecería. Es la misma trampa de
       pintado que ya está anotada en el bloque de Bruma. */
    isolation: isolate;
    align-self: stretch;
    display: grid;
    align-content: center;
    text-align: left;
  }
  :global([data-d='X']) .c-metric::after {
    content: '';
    position: absolute;
    z-index: -1;
    top: 0;
    bottom: 0;
    left: 66.67%;
    width: 1.5px;
    background: var(--d-line);
    pointer-events: none;
  }
  :global([data-d='X']) .xcota { gap: 2px; }
  /* 25px por cota son 150px de cifras en una tabla de seis filas: la lectura
     pasaría a pesar más que el nombre del equipo. 18px con -.03em y la unidad
     a .6em conservan el contraste de peso sin robarle la fila a nadie. */
  :global([data-d='X']) .xcota .d-cota-fig {
    font-size: var(--d-t-lg);
    letter-spacing: -.03em;
  }
  /* <b> heredaría «bolder» sobre 620, que el navegador resuelve a 900 y la
     pila del sistema devuelve como quiera. Se fija en 700. */
  :global([data-d='X']) .xcota .d-cota-fig b { font-weight: var(--d-w-bold); }
  /* la nota lleva el tope, que es la mitad del dato: sube de --d-ink-3 a
     --d-ink-2 porque a 11px sobre la banda de lo vencido el gris terciario
     cae a 4.9:1, justo en el filo de AA. En --d-ink-2 son 8.7:1. */
  :global([data-d='X']) .xcota .d-cota-note {
    font-size: var(--d-t-2xs);
    color: var(--d-ink-2);
  }
  /* EL RELLENO ES GRIS HASTA QUE PASA EL TOPE. Es la regla 1 llevada hasta el
     final: un riel que no llegó a su marca no reporta ningún estado, así que
     no gasta color. Y el ojo no tiene que comparar longitudes: busca lo rojo.
     --d-ink-3 sobre el carril da 4.7:1, muy por encima del 3:1 que pide un
     objeto gráfico. */
  :global([data-d='X']) .xcota .d-cota-fill { background: var(--d-ink-3); }
  :global([data-d='X']) .xcota[data-over] .d-cota-fill { background: var(--tone-fg); }

  /* sin lectura: ni riel ni cifra. Un riel en cero afirmaría que se midió. */
  :global([data-d='X']) .xsin { display: grid; gap: 2px; min-width: 0; }
  :global([data-d='X']) .xsin-t {
    font-size: var(--d-t-sm);
    font-weight: var(--d-w-med);
    color: var(--d-ink-3);
  }

  /* ── línea de tiempo ──────────────────────────────────────────────────
     .tlm pasa de flex a rejilla con la columna del estado fija en 132px. Con
     flex, el ancho del carril dependía del largo de «venció hace 12 d» contra
     «en 47 d» y las marcas de los tres planes caían a x distintas: tres cotas
     que no se pueden comparar entre sí no son cotas.
     .tlev se apaga porque su contenido («cada 250 h · reloj de uso») pasó a la
     nota de la cota, que es donde explica qué significa la marca. */
  :global([data-d='X']) .tlb {
    padding: var(--d-p2) var(--d-p3) var(--d-p3);
    gap: var(--d-p2);
  }
  :global([data-d='X']) .tlr {
    background: var(--d-sunk);
    border: var(--d-bw) solid var(--d-line);
    border-left: 3px solid var(--tone-fg);
    border-radius: var(--d-r);
    padding: var(--d-p2) var(--d-p3);
  }
  :global([data-d='X']) .tlr[data-tone='critical'] {
    background: var(--d-crit-band);
    border-color: var(--d-crit-edge);
    border-left-color: var(--d-crit);
  }
  :global([data-d='X']) .tlid {
    color: var(--d-ink);
    font-weight: var(--d-w-semi);
  }
  :global([data-d='X']) .tlev { display: none; }
  :global([data-d='X']) .tlm {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr) 132px;
    align-items: center;
    gap: var(--d-p2);
  }
  :global([data-d='X']) .tlbar { display: block; min-width: 0; }
  /* el porcentaje ya es la cifra de la cota: repetirlo al lado del riel es
     decir dos veces lo mismo y robarle ancho al riel */
  :global([data-d='X']) .pc { display: none; }
  :global([data-d='X']) .tlw { justify-self: start; }
  :global([data-d='X']) .xtl .d-cota-fig { font-size: var(--d-t-lg); }

  /* ── piso de artesanía ────────────────────────────────────────────────
     directions.css ya cubre .d-row, .d-cota y los botones de X. Lo que sigue
     es marcado propio de esta página y por lo tanto deuda de esta página. */
  @media (forced-colors: active) {
    /* en contraste forzado los fondos se reemplazan y el anillo de tinta se
       evapora: el filtro puesto quedaría igual al no puesto */
    :global([data-d='X']) .kpi[aria-pressed='true'],
    :global([data-d='X']) .fam[aria-pressed='true'] {
      outline: 2px solid CanvasText;
      outline-offset: -2px;
    }
    :global([data-d='X']) .c-metric::after { background: CanvasText; }
    :global([data-d='X']) .ghead::before { background: CanvasText; }
  }
  @media (prefers-reduced-motion: reduce) {
    :global([data-d='X']) .kpi { transition: none; }
    :global([data-d='X']) .kpi:active { transform: none; }
  }
  /* el tamaño de un dedo es un hecho del aparato y no del ancho de la ventana:
     una tableta de 768px se toca igual que un teléfono. directions.css sube
     .d-btn, .d-input y .d-select de X; las fichas de familia son botones
     propios de esta pantalla y no heredan de .d-btn. */
  @media (pointer: coarse) {
    :global([data-d='X']) .fam {
      min-height: var(--d-touch);
      align-items: center;
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     X · EN ANGOSTO, DECLARADO HASTA 380px

     QUÉ SE APILA
       ≤760px  La fila deja de ser fila de tabla y pasa a ficha de CUATRO
               renglones, uno más que la base: código y estado arriba, equipo,
               plan, y la cota sola a lo ancho abajo. La cota necesita el ancho
               entero o el riel baja a unos 70px, el 100 % cae en 47px y la
               marca del tope deja de tener sitio donde caer.
       ≤560px  La barra de módulo pasa a rejilla de dos columnas y la acción
               primaria toma el renglón entero. Los KPIs pasan a dos por fila
               (base). El aire entre bloques y el relleno del marco bajan un
               escalón. «Agrupar por» se sienta al lado de su campo. La tira de
               familias pasa a arrastre horizontal dentro de su propia caja.
       ≤420px  El KPI deja de apilarse: cifra y etiqueta comparten renglón y la
               nota baja. La cifra de la cota baja un escalón; su nota no. La
               tira de familias sube al renglón del selector, así que la barra
               de filtros entera cuesta 44px en vez de 96.

     A 380px, QUE ES DONDE SE VA A ABRIR DE VERDAD
       Entran los tres bloques. Medido en la celda de 380 × 620 con puntero
       grueso: barra de módulo 110px, veredicto 62 (dos renglones), KPIs 130
       (dos por fila), filtros 44, cabecera del bloque 40. La tabla arranca a
       los 512px, o sea que dentro de la ventana entran el encabezado del grupo
       «Vencidos» con su conteo y la primera ficha vencida completa hasta su
       nombre y su ubicación: sin tocar nada ya se sabe QUÉ máquina atender, que
       es lo único que se le pregunta a esta pantalla. La cota de esa ficha cae
       unos 40px por debajo del corte, que es la manera honesta de decir que hay
       más abajo.
       Antes de apretar la pila, la tabla arrancaba a los 570 y lo único visible
       era la cabecera del bloque: la pantalla contestaba «cuántos» y para
       llegar a «cuál» había que desplazar. Los 58px salieron del aire entre
       bloques, del renglón propio de «Agrupar por» y del renglón propio de la
       tira de familias, y ni un dato se escondió para conseguirlos.
       La ficha de un equipo mide unos 150px: identificación, plan, y la cota
       con su cifra de 14.5px, su riel a 330px de ancho y su nota completa. La
       vertical del plan NO se dibuja a este ancho: sin columna no hay nada que
       alinear, y la marca de cada riel se basta sola.
       Todos los objetivos táctiles quedan en 44px por (pointer: coarse), que
       es el hecho que importa, no el ancho. Medido: cero controles por debajo
       de 44px, y .scroll sin un píxel de desplazamiento lateral.

     QUÉ COLUMNA SE CAE
       Ninguna. Las cinco celdas siguen presentes en la ficha porque las cinco
       son la respuesta a «qué máquina atender»: código, equipo, plan, lectura
       y estado. Esconder la lectura en un teléfono es esconder justo el dato
       que se consulta parado frente al horómetro. Lo que se cae es el
       encabezado de columna, que con una ficha por renglón ya no rotula nada.

     QUÉ SE VUELVE DESPLAZAMIENTO HORIZONTAL
       Solo la tira de fichas de familia, y contenida en su propia caja: nunca
       mueve la página. La tabla se reordena en vez de desplazarse. El
       desplazamiento lateral ACCIDENTAL —el que .scroll produce porque declara
       overflow-y y por lo tanto calcula overflow-x en auto— tiene dos culpables
       reales en este marcado y los dos están anotados abajo.
     ══════════════════════════════════════════════════════════════════════ */
  @media (max-width: 760px) {
    :global([data-d='X']) .row {
      grid-template-columns: minmax(0, 1fr) auto;
      padding-block: var(--d-p2);
      row-gap: 5px;
    }
    :global([data-d='X']) .c-eq { grid-area: 2 / 1 / 3 / 3; }
    :global([data-d='X']) .c-plan { grid-area: 3 / 1 / 4 / 3; }
    :global([data-d='X']) .c-metric { grid-area: 4 / 1 / 5 / 3; }
    :global([data-d='X']) .c-metric::after { content: none; }
    /* CULPABLE 1 de desplazamiento lateral: .cnt va en nowrap y con el título
       al lado no entra en el ancho del panel. Empuja .d-panel y la pantalla
       entera se mueve de lado. Envuelve. */
    :global([data-d='X']) .d-panel-head { flex-wrap: wrap; row-gap: 2px; }
    :global([data-d='X']) .d-panel-title { min-width: 0; }
    :global([data-d='X']) .cnt { white-space: normal; }
    /* la fila deja de recortar y empieza a envolver. En rejilla de cinco
       columnas los puntos suspensivos son correctos porque la columna de al
       lado da contexto; en ficha, «Batidora Imer Syntesi 250» se convertía en
       «Batidora Ime…», que es exactamente la respuesta que se vino a buscar. */
    :global([data-d='X']) .nm,
    :global([data-d='X']) .pl,
    :global([data-d='X']) .sub {
      white-space: normal;
      overflow: visible;
      text-overflow: clip;
    }
    /* la línea del plan se apila; la columna de estado fija ya no cabe */
    :global([data-d='X']) .tlm { grid-template-columns: minmax(0, 1fr); }
  }
  @media (max-width: 560px) {
    /* DENSIDAD, Y NO ES COSMÉTICA. Medido a 380px con el alto de 620 de la
       celda: la pila de arriba —barra, veredicto, KPIs, filtros— se comía casi
       todo y la tabla asomaba por el borde. Una pantalla que contesta «cuántos»
       y hay que desplazar para llegar a «cuál» está contestando la pregunta
       equivocada. Se aprieta un escalón el aire entre bloques y el relleno del
       marco, que a este ancho no separa nada que no separe ya el canto. */
    :global([data-d='X']) .scroll {
      gap: var(--d-p2);
      padding: var(--d-p2);
    }
    /* «Agrupar por» se sienta al lado de su campo en vez de encima: es una
       etiqueta de formulario de dos palabras y su propio renglón costaba 22px
       de tabla. El envoltorio .fbody pasa a display:contents para que la
       etiqueta y el campo caigan en la MISMA línea de flex; envolviéndolo como
       una caja más, la etiqueta se centraba contra los dos renglones enteros de
       .fbody y quedaba flotando a media altura, al lado de nada. */
    :global([data-d='X']) .filters {
      display: flex;
      align-items: center;
      gap: var(--d-p2);
      flex-wrap: wrap;
    }
    :global([data-d='X']) .fbody { display: contents; }
    :global([data-d='X']) .flab { flex: none; }
    /* orden visual = orden del tabulador. La base mueve el buscador con
       order:3 y deja el foco saltando del segundo renglón al primero. En
       rejilla cada cosa cae donde el DOM la puso, y la acción primaria toma el
       renglón de abajo, que es donde llega el pulgar. */
    :global([data-d='X']) .topbar {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
    }
    :global([data-d='X']) .search { order: 0; }
    :global([data-d='X']) .act {
      grid-column: 1 / -1;
      width: 100%;
      margin-left: 0;
    }
    /* siete fichas de familia a 44px de alto son cuatro renglones, o sea unos
       190px de una ventana de 620 para un filtro que casi no se usa. En una
       tira que se arrastra cuestan 52 y la tabla recupera el resto. «Todas» va
       primera y siempre visible, así que el estado de reposo se lee sin
       arrastrar nada. El relleno vertical no es decorativo: overflow-x auto
       obliga al eje vertical a calcularse como auto, y sin esos 4px el anillo
       de foco de una ficha quedaría recortado por su propio contenedor. */
    :global([data-d='X']) .fams {
      flex: 1 1 100%;
      min-width: 0;
      flex-wrap: nowrap;
      overflow-x: auto;
      overscroll-behavior-inline: contain;
      padding-block: 4px;
      scrollbar-width: thin;
    }
  }
  @media (max-width: 420px) {
    /* CULPABLE 2 de desplazamiento lateral: a 380px cada KPI mide unos 176px y
       le quedan 150 de contenido, pero .kl viene con nowrap y SIN recorte, así
       que «Por vencer» apilado bajo una cifra de 34px se sale de su casilla y
       empuja la pantalla.
       El KPI apilado además costaba unos 130px de alto cada uno: entre el
       veredicto y los cuatro no quedaba un píxel de tabla dentro de los 620 y
       la pantalla contestaba «cuántos» sin llegar nunca a «cuál». Cifra y
       etiqueta comparten renglón, la nota baja al segundo. Ni un dato se
       esconde y se recuperan unos 150px, o sea el grupo vencido con su primera
       ficha. */
    :global([data-d='X']) .kpi {
      flex-direction: row;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 0 var(--d-p1);
      padding: var(--d-p1) var(--d-p2);
    }
    :global([data-d='X']) .kpis { gap: var(--d-p2); }
    :global([data-d='X']) .kv { font-size: var(--d-t-xl); }
    :global([data-d='X']) .kl {
      flex: 1 1 auto;
      min-width: 0;
      white-space: normal;
      font-size: var(--d-t-xs);
    }
    :global([data-d='X']) .kn {
      flex: 1 1 100%;
      white-space: normal;
      text-overflow: clip;
    }
    /* el veredicto cede relleno, no cuerpo: bajarle el cuerpo sería cambiar la
       respuesta por el envase */
    :global([data-d='X']) .verdict { padding: var(--d-p2); gap: var(--d-p2); }
    /* LA BARRA DE FILTROS SE REDUCE A UN SOLO RENGLÓN. Medido: con la tira de
       familias en su propia línea, el pliegue de 620px caía dentro de la
       primera ficha vencida y había que desplazar para leer la máquina que la
       pantalla acababa de anunciar. La tira sube al renglón del selector y se
       arrastra desde ahí. Es el control que menos se usa de la pantalla y el
       único que se puede pedir que cueste un gesto: para buscar UN equipo ya
       está el campo de arriba. */
    :global([data-d='X']) .gsel { min-width: 106px; }
    :global([data-d='X']) .fams { flex: 1 1 106px; }
    /* la cifra de la cota baja un escalón; la nota se queda donde está, porque
       el tope es la mitad del dato y ya está en el cuerpo más chico del bloque */
    :global([data-d='X']) .xcota .d-cota-fig { font-size: var(--d-t-md); }
  }

  /* ======================================================================
     AB · PRISMA FARO — la misma ley de luz que en la página de paneles.

     Esta celda tiene su propio marcado de KPI y su propia clase de scope, así
     que las reglas de Paneles no la alcanzan: son dos componentes distintos que
     se llaman igual. La consecuencia era que la dirección brillaba en la página
     donde se la mira de a un componente y NO en la pantalla completa, que es
     justo donde se juzga si el resplandor sirve o molesta.

     Misma geometría que allá y por la misma razón: desplazamiento cero para que
     irradie por los cuatro lados, spread positivo para que salga del borde, y el
     anillo de 1px que pone la fuente en el objeto. Las intensidades salen de los
     mismos --d-faro-*, así que la escala se sigue moviendo desde un solo lugar
     para las dos páginas. */
  :global([data-d='AB']) .kpi[data-tone='critical'] {
    box-shadow: 0 0 26px 3px color-mix(in srgb, var(--d-crit) var(--d-faro-crit), transparent),
                0 0 0 1px color-mix(in srgb, var(--d-crit) var(--d-faro-ring), transparent);
    border-color: color-mix(in srgb, var(--d-crit) var(--d-faro-ring), transparent);
  }
  :global([data-d='AB']) .kpi[data-tone='attention'] {
    box-shadow: 0 0 22px 2px color-mix(in srgb, var(--d-att) var(--d-faro-att), transparent),
                0 0 0 1px color-mix(in srgb, var(--d-att) var(--d-faro-ring), transparent);
    border-color: color-mix(in srgb, var(--d-att) var(--d-faro-ring), transparent);
  }
  :global([data-d='AB']) .kpi[data-tone='positive'] {
    box-shadow: 0 0 18px 1px color-mix(in srgb, var(--d-pos) var(--d-faro-pos), transparent),
                0 0 0 1px color-mix(in srgb, var(--d-pos) var(--d-faro-ring), transparent);
    border-color: color-mix(in srgb, var(--d-pos) var(--d-faro-ring), transparent);
  }
  :global([data-d='AB']) .kpi[data-tone='info'] {
    box-shadow: 0 0 18px 1px color-mix(in srgb, var(--d-info) var(--d-faro-info), transparent),
                0 0 0 1px color-mix(in srgb, var(--d-info) var(--d-faro-ring), transparent);
    border-color: color-mix(in srgb, var(--d-info) var(--d-faro-ring), transparent);
  }
  :global([data-d='AB']) .kpi[data-tone='neutral'] {
    box-shadow: 0 0 16px 1px color-mix(in srgb, var(--d-brand) var(--d-faro-neu), transparent);
  }
  /* Filtrando por un estado, la celda elegida sube un escalón de luz en vez de
     cambiar de dibujo: ya estaba encendida, y apagarla para marcarla habría
     dicho lo contrario de lo que pasa. */
  :global([data-d='AB']) .kpi[aria-pressed='true'] {
    box-shadow: 0 0 30px 5px color-mix(in srgb, var(--tone-fg) 78%, transparent),
                0 0 0 2px var(--tone-fg);
  }
</style>
