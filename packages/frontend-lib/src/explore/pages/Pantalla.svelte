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
            <span class="d-cap kicker">Mantenimiento</span>
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
          <!-- VEREDICTO: lo primero que se lee ------------------------------->
          <div class="verdict d-rail" data-tone="critical">
            <span class="d-cap vk">
              <svg class="mk" viewBox="0 0 12 12" aria-hidden="true">{@html markOf('critical')}</svg>
              Hoy
            </span>
            <p class="vt">{COPY.verdict}</p>
          </div>

          <!-- TIRA DE KPIS: además de contar, filtran ------------------------>
          <div class="kpis" role="group" aria-label="Resumen de la flota — filtrar por estado">
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
            <label class="d-cap flab" for={'g-' + d.id}>Agrupar por</label>
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
              <span class="d-cap cnt d-num">{view[d.id].length} de {ASSETS.length}</span>
            </div>

            <div class="lhead" aria-hidden="true">
              <span class="d-cap">Código</span>
              <span class="d-cap">Equipo</span>
              <span class="d-cap">Plan · próximo</span>
              <span class="d-cap ta-r">Lectura</span>
              <span class="d-cap">Estado</span>
            </div>

            <div class="rows">
              {#each grouped[d.id] as g (g.name)}
                <div class="ghead" data-tone={g.tone}>
                  <span class="gn">{g.name}</span>
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
                      <span class="mv d-num">{a.metric}</span>
                      <span class="sub d-num">{a.pct ? a.pct + ' %' : 'sin dato'}</span>
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
              <span class="d-cap cnt">escala 0–120 %</span>
            </div>
            <div class="tlb">
              {#each PLANS.filter((p) => view[d.id].some((a) => a.code === p.asset)).slice(0, 3) as p (p.asset)}
                <div class="tlr d-rail" data-tone={p.tone}>
                  <span class="d-cap d-id tlid">
                    {p.asset}
                    <span class="tlev">{p.every} · reloj de {p.clock}</span>
                  </span>
                  <div class="tlm">
                    <span class="tlt">{p.task}</span>
                    <span class="tlbar">
                      {#if d.id === 'F'}
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
  .kicker { line-height: 1.1; }
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
  .kn { font-size: var(--d-t-2xs); color: var(--d-ink-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
  .kpi[aria-pressed='true'] { background: var(--tone-band); border-color: var(--tone-edge); }

  /* ── barra de filtros ─────────────────────────────────────────────── */
  .filters { padding: 0; }
  .flab { align-self: center; }
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
  .cnt { white-space: nowrap; }
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
  .tlid { line-height: 1.3; }
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

  /* ── A · ELEVACIÓN — todo flota y se separa por aire, nunca por líneas ─ */
  :global([data-d='A']) .topbar { border-bottom: 0; box-shadow: var(--d-shadow-lg); position: relative; z-index: 2; }
  :global([data-d='A']) .sect { box-shadow: var(--d-shadow-lg); border-color: transparent; }
  :global([data-d='A']) .kpi:hover { transform: translateY(-1px); box-shadow: var(--d-shadow-lg); }
  :global([data-d='A']) .verdict { border-color: transparent; box-shadow: var(--d-shadow); }
  /* los grupos se separan por espacio, no por una barra */
  :global([data-d='A']) .ghead {
    background: transparent; border-bottom: 0;
    padding-top: var(--d-p3); padding-bottom: 2px;
  }
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

  /* ── B · INSTRUMENTO — un plano: los bloques COMPARTEN borde ─────────── */
  :global([data-d='B']) .scroll { padding: var(--d-p2); }
  /* la pila entera se convierte en un solo marco continuo */
  :global([data-d='B']) .scroll > * + * { margin-top: -1px; }
  :global([data-d='B']) .topbar {
    border-bottom-color: var(--d-edge);
    padding: 0; gap: 0;
  }
  :global([data-d='B']) .topbar .mod { padding: var(--d-p1) var(--d-p3); }
  :global([data-d='B']) .topbar .search {
    padding: var(--d-p1) var(--d-p2);
    border-left: 1px solid var(--d-line);
    border-right: 1px solid var(--d-line);
    align-self: stretch;
  }
  :global([data-d='B']) .topbar .act { margin: var(--d-p1) var(--d-p2); }
  :global([data-d='B']) .verdict {
    background: transparent; border-color: var(--d-edge); border-radius: 0;
    position: relative; padding: var(--d-p2) var(--d-p3);
  }
  /* marcas de esquina, como en .d-panel */
  :global([data-d='B']) .verdict::before,
  :global([data-d='B']) .verdict::after {
    content: ''; position: absolute; width: 7px; height: 7px;
    border: 1px solid var(--d-edge); pointer-events: none;
  }
  :global([data-d='B']) .verdict::before { top: 3px; left: 3px; border-right: 0; border-bottom: 0; }
  :global([data-d='B']) .verdict::after { bottom: 3px; right: 3px; border-left: 0; border-top: 0; }
  :global([data-d='B']) .vt { font-size: var(--d-t-md); font-weight: var(--d-w-semi); }
  :global([data-d='B']) .kpis { gap: 0; }
  :global([data-d='B']) .kpi + .kpi { margin-left: -1px; }
  :global([data-d='B']) .filters {
    border: 1px solid var(--d-line); padding: 0;
    grid-template-columns: auto minmax(0, 1fr);
  }
  :global([data-d='B']) .flab { padding: var(--d-p1) var(--d-p2); border-right: 1px solid var(--d-line); align-self: stretch; display: flex; align-items: center; }
  :global([data-d='B']) .fbody { padding: var(--d-p1) var(--d-p2); }
  :global([data-d='B']) .fams { gap: 0; }
  :global([data-d='B']) .fam + .fam { margin-left: -1px; }
  :global([data-d='B']) .fam[aria-pressed='true'] { background: var(--d-accent); color: var(--d-accent-ink); position: relative; z-index: 1; }
  :global([data-d='B']) .lhead { border-bottom-color: var(--d-edge); background: transparent; }
  :global([data-d='B']) .ghead {
    background: transparent;
    border-top: 1px solid var(--d-edge); border-bottom-color: var(--d-line);
    color: var(--d-ink);
  }
  /* fila de una sola línea: la densidad es el punto */
  :global([data-d='B']) .c-eq, :global([data-d='B']) .c-plan, :global([data-d='B']) .c-metric {
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  :global([data-d='B']) .nm, :global([data-d='B']) .pl,
  :global([data-d='B']) .mv, :global([data-d='B']) .sub { display: inline; overflow: visible; }
  :global([data-d='B']) .sub::before { content: ' · '; color: var(--d-line); }
  :global([data-d='B']) .lhead, :global([data-d='B']) .row {
    grid-template-columns: 72px minmax(0, 2fr) minmax(0, 1.35fr) 116px 100px;
  }
  /* la barra es una regla graduada, no una pastilla */
  :global([data-d='B']) .track {
    height: 10px; border-radius: 0; background: transparent;
    border: 1px solid var(--d-line);
    background-image: repeating-linear-gradient(90deg, var(--d-line) 0 1px, transparent 1px 25%);
  }
  :global([data-d='B']) .fill { border-radius: 0; }
  :global([data-d='B']) .thr { top: -2px; bottom: -2px; background: var(--d-edge); }

  /* ── C · MARCA — la pantalla la sostienen barras llenas de color ─────── */
  :global([data-d='C']) .topbar {
    background: var(--d-brand); color: var(--d-brand-ink); border-bottom: 0;
  }
  :global([data-d='C']) .topbar .kicker { color: var(--d-brand-ink); opacity: .72; }
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
  :global([data-d='C']) .lhead { background: var(--d-accent-soft); border-bottom-color: var(--d-accent-edge); }
  :global([data-d='C']) .ghead {
    background: var(--d-accent-soft); color: var(--d-brand);
    border-bottom-color: var(--d-accent-edge);
    font-weight: var(--d-w-semi);
  }
  :global([data-d='C']) .gc { color: var(--d-brand); opacity: .7; }
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
  /* La cabecera del bloque es teal lleno y .d-cap pinta en --d-brand: la nota
     de la derecha quedaba teal sobre teal, invisible. Va en tinta de marca. */
  :global([data-d='C']) .d-panel-head .d-cap { color: var(--d-brand-ink); }

  /* ── D · PESO — masa, caja alta y una sombra sólida donde caer ───────── */
  :global([data-d='D']) .topbar {
    background: var(--d-ink); color: var(--d-ink-on);
    border-bottom: var(--d-bw) solid var(--d-ink);
  }
  :global([data-d='D']) .topbar .kicker { color: var(--d-ink-on); opacity: .7; }
  :global([data-d='D']) .title { text-transform: uppercase; font-weight: var(--d-w-bold); }
  :global([data-d='D']) .topbar .d-input { border-color: var(--d-surface); }
  :global([data-d='D']) .topbar .act {
    background: var(--d-surface); color: var(--d-ink); border-color: var(--d-surface); box-shadow: none;
  }
  :global([data-d='D']) .topbar .act:hover { filter: none; background: var(--d-sunk); }
  :global([data-d='D']) .verdict {
    border: var(--d-bw) solid var(--d-ink); box-shadow: var(--d-shadow);
    margin-right: 4px;
  }
  :global([data-d='D']) .vt { text-transform: uppercase; font-weight: var(--d-w-bold); letter-spacing: -.005em; }
  :global([data-d='D']) .kpis { padding-right: 4px; }
  :global([data-d='D']) .kpi {
    background: var(--tone-band); border-color: var(--d-ink); box-shadow: var(--d-shadow);
  }
  :global([data-d='D']) .kpi:active { transform: translate(4px, 4px); box-shadow: none; }
  :global([data-d='D']) .kpi[aria-pressed='true'] { background: var(--d-ink); color: var(--d-ink-on); }
  :global([data-d='D']) .kpi[aria-pressed='true'] .kv,
  :global([data-d='D']) .kpi[aria-pressed='true'] .kn { color: var(--d-ink-on); }
  :global([data-d='D']) .kv { color: var(--d-ink); font-size: var(--d-t-2xl); }
  :global([data-d='D']) .kl { text-transform: uppercase; font-weight: var(--d-w-bold); font-size: var(--d-t-xs); }
  :global([data-d='D']) .sect { margin-right: 4px; }
  :global([data-d='D']) .lhead {
    background: var(--d-ink); border-bottom-color: var(--d-ink);
  }
  :global([data-d='D']) .lhead .d-cap { color: var(--d-ink-on); }
  :global([data-d='D']) .ghead {
    background: var(--d-surface); color: var(--d-ink);
    border-top: var(--d-bw) solid var(--d-ink); border-bottom-color: var(--d-ink);
    font-weight: var(--d-w-bold);
  }
  :global([data-d='D']) .fam {
    border-color: var(--d-ink); box-shadow: 3px 3px 0 var(--d-ink);
    text-transform: uppercase; font-weight: var(--d-w-semi); margin-bottom: 3px;
  }
  :global([data-d='D']) .fam:active { transform: translate(3px, 3px); box-shadow: none; }
  :global([data-d='D']) .fam[aria-pressed='true'] { background: var(--d-ink); color: var(--d-ink-on); }
  :global([data-d='D']) .fam[aria-pressed='true'] .ct { color: var(--d-ink-on); }
  /* la barra es un bloque con borde, y el relleno es el pastel del tono */
  :global([data-d='D']) .track {
    height: 16px; border: var(--d-bw) solid var(--d-ink); border-radius: 0; background: var(--d-surface);
  }
  :global([data-d='D']) .fill { background: var(--tone-band); border-radius: 0; }
  :global([data-d='D']) .thr { top: -3px; bottom: -3px; width: 2px; background: var(--d-ink); }
  /* la pastilla en caja alta con borde de 2px pide su propia columna */
  :global([data-d='D']) .lhead, :global([data-d='D']) .row {
    grid-template-columns: 80px minmax(0, 1.9fr) minmax(0, 1.2fr) 78px 136px;
  }
  :global([data-d='D']) .foot { border-top-color: var(--d-ink); }

  /* ── E · AIRE — cero bordes en toda la celda; separa el espacio ──────── */
  :global([data-d='E']) .topbar {
    background: transparent; border-bottom: 0;
    padding: var(--d-p3) var(--d-p3) var(--d-p1);
  }
  :global([data-d='E']) .scroll { padding: var(--d-p2) var(--d-p3) var(--d-p3); }
  :global([data-d='E']) .verdict {
    background: transparent; border: 0; padding: var(--d-p1) 0 var(--d-p2);
  }
  :global([data-d='E']) .vt {
    font-size: var(--d-t-xl); font-weight: var(--d-w); letter-spacing: -.025em; line-height: 1.28;
  }
  :global([data-d='E']) .kpi {
    border: 0; box-shadow: none; background: var(--d-sunk);
    border-radius: var(--d-r-lg); padding: var(--d-p2) var(--d-p3) var(--d-p3);
  }
  :global([data-d='E']) .kpi[aria-pressed='true'] { background: var(--tone-band); }
  :global([data-d='E']) .kl { text-transform: none; letter-spacing: 0; }
  :global([data-d='E']) .filters { padding-block: var(--d-p1); }
  :global([data-d='E']) .fams { gap: var(--d-p1); }
  :global([data-d='E']) .fam {
    border: 0; background: var(--d-sunk); border-radius: var(--d-r-pill);
    padding: 9px var(--d-p2); font-size: var(--d-t-xs);
  }
  :global([data-d='E']) .fam[aria-pressed='true'] { background: var(--d-accent); color: var(--d-accent-ink); }
  :global([data-d='E']) .fam[aria-pressed='true'] .ct { color: var(--d-accent-ink); opacity: .75; }
  :global([data-d='E']) .lhead { background: transparent; border-bottom: 0; padding-bottom: 0; }
  :global([data-d='E']) .lhead, :global([data-d='E']) .row {
    grid-template-columns: 82px minmax(0, 2fr) minmax(0, 1.25fr) 78px 124px;
  }
  /* la fila no lleva línea: la separa el aire, y el reposo es una pastilla */
  :global([data-d='E']) .rows { display: flex; flex-direction: column; gap: 2px; padding: var(--d-p1) var(--d-p1) var(--d-p2); }
  :global([data-d='E']) .row { border-bottom: 0; border-radius: var(--d-r); }
  :global([data-d='E']) .ghead {
    background: transparent; border-bottom: 0;
    padding: var(--d-p3) var(--d-p3) var(--d-p1);
    font-size: var(--d-t-md); font-weight: var(--d-w-semi);
    text-transform: none; letter-spacing: 0; color: var(--d-ink);
  }
  :global([data-d='E']) .track { height: 10px; border-radius: var(--d-r-pill); }
  :global([data-d='E']) .thr { background: var(--d-ink-3); opacity: .55; }
  :global([data-d='E']) .foot { background: transparent; border-top: 0; }

  /* ── F · TERMINAL — una pantalla de texto, el color como bloque ──────── */
  :global([data-d='F']) .topbar { background: var(--d-sunk); border-bottom-color: var(--d-line); }
  :global([data-d='F']) .title::before { content: '~/'; color: var(--d-ink-3); }
  :global([data-d='F']) .search::before { content: '$'; color: var(--d-accent); flex: none; }
  :global([data-d='F']) .verdict {
    background: var(--tone-band); border-color: var(--tone-edge); border-radius: 0;
    padding: var(--d-p1) var(--d-p2);
  }
  :global([data-d='F']) .vt { font-size: var(--d-t-md); font-weight: var(--d-w-med); color: var(--tone-fg); }
  :global([data-d='F']) .vt::before { content: '!! '; }
  /* la tira de KPIs es una rejilla de un pelo, no cuatro tarjetas */
  :global([data-d='F']) .kpis { gap: 1px; background: var(--d-line); border: 1px solid var(--d-line); }
  :global([data-d='F']) .kpi { border: 0; border-radius: 0; padding: var(--d-p1) var(--d-p2); }
  :global([data-d='F']) .kv {
    font-size: var(--d-t-lg); background: var(--tone-band); color: var(--tone-fg); padding: 0 var(--d-p1);
  }
  :global([data-d='F']) .lhead { background: transparent; border-bottom: var(--d-bw) dashed var(--d-line); }
  :global([data-d='F']) .ghead { background: transparent; border-bottom: 0; color: var(--d-accent); }
  :global([data-d='F']) .gn::before { content: '── '; color: var(--d-line); }
  :global([data-d='F']) .gn::after { content: ' ─────────────'; color: var(--d-line); }
  /* columnas separadas por regla, como una tabla de terminal */
  :global([data-d='F']) .c-eq, :global([data-d='F']) .c-plan,
  :global([data-d='F']) .c-metric, :global([data-d='F']) .c-state {
    border-left: var(--d-bw) solid var(--d-line); padding-left: var(--d-p2);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  :global([data-d='F']) .nm, :global([data-d='F']) .pl,
  :global([data-d='F']) .mv, :global([data-d='F']) .sub { display: inline; overflow: visible; }
  :global([data-d='F']) .sub::before { content: ' · '; color: var(--d-line); }
  :global([data-d='F']) .lhead, :global([data-d='F']) .row {
    grid-template-columns: 72px minmax(0, 2.4fr) minmax(0, 1.2fr) 118px 104px;
  }
  :global([data-d='F']) .fam {
    border: 0; background: transparent; color: var(--d-ink-2); padding: 0 2px; border-radius: 0;
  }
  :global([data-d='F']) .fam::before { content: '['; color: var(--d-ink-3); }
  :global([data-d='F']) .fam::after { content: ']'; color: var(--d-ink-3); }
  :global([data-d='F']) .fam[aria-pressed='true'] { background: var(--d-accent-soft); color: var(--d-accent); }
  /* la barra de progreso es una barra de caracteres, con marca de umbral */
  :global([data-d='F']) .ascii {
    position: relative; flex: 1 1 auto; letter-spacing: 0;
    color: var(--tone-fg); font-size: var(--d-t-sm); white-space: pre;
  }
  :global([data-d='F']) .ascii::after {
    content: '|'; position: absolute; left: 16.7ch; top: 0; color: var(--d-ink-3);
  }
  :global([data-d='F']) .foot { background: var(--d-sunk); }

  /* ── G · BANDA — ninguna caja: estratos a sangre y raíl a la izquierda ─ */
  :global([data-d='G']) .scroll { padding: 0; gap: 0; }
  /* la barra del módulo también respeta el raíl */
  :global([data-d='G']) .topbar {
    display: grid; grid-template-columns: var(--d-rail) minmax(0, 1fr) auto;
    gap: 0 var(--d-p3); align-items: center;
    background: transparent; border-bottom-color: var(--d-line);
  }
  :global([data-d='G']) .topbar .mod { align-items: flex-end; text-align: right; }
  :global([data-d='G']) .verdict {
    position: relative; background: transparent; border: 0;
    border-bottom: 1px solid var(--d-line); border-radius: 0;
    padding: var(--d-p3) var(--d-p3) var(--d-p3) calc(var(--d-p3) + 3px);
  }
  /* el estado va como franja de 3px en el canto izquierdo, nunca como fondo */
  :global([data-d='G']) .verdict::before {
    content: ''; position: absolute; inset: 0 auto 0 0; width: 3px; background: var(--tone-fg);
  }
  :global([data-d='G']) .kpis {
    gap: 0; border-bottom: 1px solid var(--d-line);
  }
  :global([data-d='G']) .kpi {
    background: transparent; border: 0; border-radius: 0; box-shadow: none;
    border-left: 3px solid var(--tone-fg); border-right: 1px solid var(--d-line);
    padding: var(--d-p2) var(--d-p3);
  }
  :global([data-d='G']) .kpi:last-child { border-right: 0; }
  :global([data-d='G']) .kpi[aria-pressed='true'] { background: var(--d-sunk); }
  :global([data-d='G']) .filters {
    background: var(--d-sunk); border-bottom: 1px solid var(--d-line);
    padding: var(--d-p2) var(--d-p3);
  }
  :global([data-d='G']) .fam { border: 0; background: transparent; border-bottom: 2px solid transparent; border-radius: 0; padding-inline: 4px; }
  :global([data-d='G']) .fam[aria-pressed='true'] { background: transparent; border-bottom-color: var(--d-ink); }
  :global([data-d='G']) .lhead { background: transparent; border-bottom-color: var(--d-line); }
  :global([data-d='G']) .lhead > .d-cap:first-child { text-align: right; }
  :global([data-d='G']) .c-code { text-align: right; }
  :global([data-d='G']) .ghead {
    background: var(--d-sunk); border-block: 1px solid var(--d-line);
    padding-left: calc(var(--d-p3) + 3px);
  }
  /* franja de una sola línea: un estrato no se parte en dos */
  :global([data-d='G']) .c-eq, :global([data-d='G']) .c-plan, :global([data-d='G']) .c-metric {
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  :global([data-d='G']) .nm, :global([data-d='G']) .pl,
  :global([data-d='G']) .mv, :global([data-d='G']) .sub { display: inline; overflow: visible; }
  :global([data-d='G']) .sub::before { content: ' · '; color: var(--d-edge); }
  :global([data-d='G']) .lhead, :global([data-d='G']) .row {
    grid-template-columns: 78px minmax(0, 2fr) minmax(0, 1.3fr) 118px 104px;
  }
  :global([data-d='G']) .row { padding-left: calc(var(--d-p3) + 3px); }
  :global([data-d='G']) .tlb { padding: 0; gap: 0; }
  :global([data-d='G']) .tlr {
    position: relative; border-bottom: 1px solid var(--d-line);
    padding: var(--d-p2) var(--d-p3) var(--d-p2) calc(var(--d-p3) + 3px);
  }
  :global([data-d='G']) .tlr::before {
    content: ''; position: absolute; inset: 0 auto 0 0; width: 3px; background: var(--tone-fg);
  }
  :global([data-d='G']) .track { height: 4px; border-radius: 0; background: var(--d-sunk); }
  :global([data-d='G']) .thr { top: -4px; bottom: -4px; }
  :global([data-d='G']) .foot {
    display: grid; grid-template-columns: var(--d-rail) minmax(0, 1fr);
    gap: 0 var(--d-p3); align-items: center;
    background: transparent; border-top-color: var(--d-line);
  }
  :global([data-d='G']) .fcount { text-align: right; }
  :global([data-d='G']) .vk { justify-content: flex-end; }

  /* ── H · FICHA — pestaña arriba, canto apilado abajo, regla doble ────── */
  :global([data-d='H']) .topbar {
    background: var(--d-sunk); border-bottom-color: var(--d-edge);
    box-shadow: 0 2px 0 var(--d-surface), 0 3px 0 var(--d-edge);
    margin-bottom: 3px;
  }
  :global([data-d='H']) .verdict {
    box-shadow: 0 2px 0 var(--d-surface), 0 3px 0 var(--tone-edge);
    margin-bottom: 3px;
  }
  :global([data-d='H']) .kpis { padding-bottom: 5px; }
  :global([data-d='H']) .kpi[aria-pressed='true'] { box-shadow: var(--d-shadow-lg); }
  :global([data-d='H']) .fam {
    background: var(--d-sunk); border-color: var(--d-edge);
    border-radius: 4px 4px 0 0; box-shadow: 0 1px 0 var(--d-edge); margin-bottom: 2px;
  }
  :global([data-d='H']) .fam[aria-pressed='true'] {
    background: var(--d-surface); border-bottom-color: var(--d-accent);
    box-shadow: 0 2px 0 var(--d-accent);
  }
  /* la regla doble bajo el encabezado de columnas — el tic de la ficha */
  :global([data-d='H']) .lhead {
    background: var(--d-surface); border-bottom-color: var(--d-line);
    box-shadow: inset 0 -3px 0 -1px var(--d-line);
    padding-bottom: calc(var(--d-p1) + 3px);
  }
  :global([data-d='H']) .ghead { background: var(--d-sunk); border-bottom-color: var(--d-edge); }
  :global([data-d='H']) .track {
    height: 9px; border-radius: 0; border: 1px solid var(--d-edge); background: var(--d-sunk);
  }
  /* relleno tramado: la barra de una ficha se raya, no se pinta */
  :global([data-d='H']) .fill {
    border-radius: 0;
    background:
      repeating-linear-gradient(45deg, var(--tone-fg) 0 1px, transparent 1px 4px),
      var(--tone-band);
    box-shadow: inset -2px 0 0 var(--tone-fg);
  }
  :global([data-d='H']) .tlr { border-bottom: 1px solid var(--d-line); padding-bottom: var(--d-p2); }
  :global([data-d='H']) .tlr:last-child { border-bottom: 0; }
  :global([data-d='H']) .thr { background: var(--d-ink-2); }
  :global([data-d='H']) .foot { background: var(--d-sunk); border-top-color: var(--d-edge); }

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
    :global([data-d='G']) .topbar,
    :global([data-d='G']) .foot { grid-template-columns: minmax(0, 1fr); }
    :global([data-d='G']) .topbar .mod { align-items: flex-start; text-align: left; }
    :global([data-d='G']) .fcount { text-align: left; }
    :global([data-d='G']) .vk { justify-content: flex-start; }
    :global([data-d='E']) .lhead, :global([data-d='E']) .row,
    :global([data-d='D']) .lhead, :global([data-d='D']) .row,
    :global([data-d='B']) .lhead, :global([data-d='B']) .row,
    :global([data-d='F']) .lhead, :global([data-d='F']) .row,
    :global([data-d='G']) .lhead, :global([data-d='G']) .row { grid-template-columns: minmax(0, 1fr) auto; }
    /* el marco de la barra de filtros se apila: la etiqueta pasa arriba */
    :global([data-d='B']) .filters { grid-template-columns: minmax(0, 1fr); }
    :global([data-d='F']) .c-eq, :global([data-d='F']) .c-plan,
    :global([data-d='F']) .c-metric, :global([data-d='F']) .c-state {
      border-left: 0; padding-left: 0;
    }
    :global([data-d='B']) .flab { border-right: 0; border-bottom: 1px solid var(--d-line); }
  }
  @media (max-width: 560px) {
    .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    /* la rejilla de dos columnas necesita otro juego de divisiones */
    :global([data-d='G']) .kpi:nth-child(2n) { border-right: 0; }
    :global([data-d='G']) .kpi:nth-child(-n + 2) { border-bottom: 1px solid var(--d-line); }
    .search { flex: 1 1 100%; order: 3; }
    .act { margin-left: auto; }
    .tlt { flex: 1 1 100%; }
  }
</style>
