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
              <span class="d-cap ta-r">Lectura</span>
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
  :global([data-d='B']) .verdict,
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

  /* ── B · INSTRUMENTO — un plano: los bloques COMPARTEN borde ───────────
     Densidad de cabina: TODA cifra va en monoespaciada. No es un gesto de
     estilo, es lo que hace que 312 h, 1 840 h y 96 d se comparen columna
     contra columna sin que el ojo tenga que recalibrar el ancho de cada
     dígito. Es la regla que más se nota en la dirección más densa. */
  :global([data-d='B']) .d-num { font-family: var(--d-mono); letter-spacing: -.02em; }
  :global([data-d='B']) .kv { font-family: var(--d-mono); font-size: var(--d-t-xl); letter-spacing: -.04em; }
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
  /* el grupo es una división del plano: regla de canto arriba, marca a la
     izquierda y el conteo en la monoespaciada. Sin relleno: un plano técnico
     no se pinta de colores, se marca. */
  :global([data-d='B']) .ghead {
    background: transparent;
    border-top: 1px solid var(--d-edge); border-bottom-color: var(--d-line);
    color: var(--d-ink);
  }
  :global([data-d='B']) .gc { color: var(--d-ink-2); }
  /* la etiqueta del filtro vuelve a versalitas SOLO acá: en Instrumento las
     etiquetas fuera del marco son la silueta declarada de la dirección. */
  :global([data-d='B']) .flab {
    font-size: var(--d-label-size); font-weight: var(--d-label-weight);
    letter-spacing: var(--d-label-track); text-transform: uppercase;
    color: var(--d-ink-3);
  }
  :global([data-d='B']) .cnt { font-family: var(--d-mono); color: var(--d-ink-2); }
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

  /* ── D · PESO — masa, caja alta y una sombra sólida donde caer ───────── */
  :global([data-d='D']) .topbar {
    background: var(--d-ink); color: var(--d-ink-on);
    border-bottom: var(--d-bw) solid var(--d-ink);
  }
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
  /* la regla de guiones de F es texto corrido: .gn vuelve a inline para que los
     dos pseudos y la marca sigan siendo una sola corrida y no tres cajas */
  :global([data-d='F']) .gn { display: inline; }
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
  :global([data-d='J']) .screen { --pg-gloss: color-mix(in srgb, var(--d-surface) 62%, transparent); }
  :global([data-d='J']) .topbar {
    background: linear-gradient(180deg, var(--pg-gloss) 0%, transparent 38%), var(--d-surface-fill);
    border-bottom-color: var(--d-edge);
    box-shadow: var(--d-shadow);
    position: relative; z-index: 2;
  }
  :global([data-d='J']) .title { font-weight: var(--d-w-bold); }
  :global([data-d='J']) .verdict {
    background:
      linear-gradient(180deg, var(--pg-gloss) 0%, transparent 40%),
      linear-gradient(180deg, var(--tone-band) 0%, var(--d-surface) 100%);
    border-color: var(--tone-edge);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='J']) .kpi {
    border-radius: var(--d-r-lg);
    border-color: var(--d-edge);
    padding: var(--d-p2) var(--d-p3) var(--d-p3);
    background: linear-gradient(180deg, var(--pg-gloss) 0%, transparent 40%), var(--d-surface-fill);
    box-shadow: var(--d-shadow);
  }
  /* al presionar, el brillo se apaga y la placa se hunde */
  :global([data-d='J']) .kpi:active {
    transform: translateY(1px);
    box-shadow: inset 0 2px 5px color-mix(in srgb, var(--d-ink) 26%, transparent);
  }
  :global([data-d='J']) .kpi[aria-pressed='true'] {
    background:
      linear-gradient(180deg, var(--pg-gloss) 0%, transparent 40%),
      linear-gradient(180deg, var(--tone-band) 0%, var(--d-surface) 100%);
  }
  :global([data-d='J']) .sect { box-shadow: var(--d-shadow-lg); }
  :global([data-d='J']) .lhead {
    background: linear-gradient(180deg, var(--pg-gloss) 0%, transparent 60%), var(--d-sunk-fill);
    border-bottom-color: var(--d-edge);
  }
  :global([data-d='J']) .ghead {
    background: linear-gradient(180deg, var(--pg-gloss) 0%, transparent 70%), var(--d-sunk-fill);
    border-bottom-color: var(--d-edge);
  }
  :global([data-d='J']) .fam {
    border-radius: var(--d-r-pill);
    border-color: var(--d-edge);
    padding: 5px var(--d-p2);
    background: linear-gradient(180deg, var(--pg-gloss) 0%, transparent 48%), var(--d-surface-fill);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='J']) .fam:active {
    transform: translateY(1px);
    box-shadow: inset 0 2px 4px color-mix(in srgb, var(--d-ink) 24%, transparent);
  }
  /* la pastilla marcada es la única superficie oscura de J: el barrido se
     cambia por el realce del canto para no aclarar el fondo justo debajo de
     una etiqueta blanca de 12px */
  :global([data-d='J']) .fam[aria-pressed='true'] {
    background: var(--d-accent-fill);
    color: var(--d-accent-ink); border-color: var(--d-accent-edge);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='J']) .fam[aria-pressed='true'] .ct { color: inherit; }
  /* el carril es un hueco húmedo y el relleno una placa con su propio brillo */
  :global([data-d='J']) .track {
    height: 12px;
    background: var(--d-sunk-fill);
    box-shadow: inset 0 2px 4px color-mix(in srgb, var(--d-ink) 22%, transparent);
    overflow: hidden;
  }
  :global([data-d='J']) .fill {
    background: linear-gradient(180deg, var(--pg-gloss) 0%, transparent 55%), var(--tone-fg);
  }
  :global([data-d='J']) .thr { background: var(--d-ink-2); }
  :global([data-d='J']) .tlb { gap: var(--d-p3); }
  :global([data-d='J']) .tlr {
    border-radius: var(--d-r); padding: var(--d-p2) var(--d-p3);
    background: linear-gradient(180deg, var(--pg-gloss) 0%, transparent 44%), var(--d-surface-fill);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='J']) .foot {
    background: linear-gradient(180deg, var(--pg-gloss) 0%, transparent 60%), var(--d-sunk-fill);
    border-top-color: var(--d-edge);
  }

  /* ── K · HALO — nada tiene borde: existe lo que irradia ────────────────
     El estado es el COLOR DEL RESPLANDOR, no un relleno. Los KPIs son
     cuatro luces de colores distintos flotando sobre negro; a ojos
     entrecerrados no hay ni una caja en toda la celda.
     HALLAZGO: K no publica ningún token de resplandor —radio, dispersión—,
     solo los tonos. Los desenfoques van a mano; el color, siempre de token. */
  :global([data-d='K']) .topbar {
    background: transparent; border-bottom: 0;
    box-shadow: 0 26px 50px -34px var(--d-accent);
  }
  :global([data-d='K']) .title { text-shadow: 0 0 20px color-mix(in srgb, var(--d-ink) 45%, transparent); }
  :global([data-d='K']) .verdict {
    border: 0; background: var(--tone-band);
    box-shadow: 0 0 0 1px var(--tone-edge), 0 18px 64px -22px var(--tone-fg);
  }
  :global([data-d='K']) .vt { text-shadow: 0 0 24px color-mix(in srgb, var(--tone-fg) 40%, transparent); }
  :global([data-d='K']) .kpi {
    background: transparent; border: 0; border-radius: var(--d-r-lg);
    padding: var(--d-p3);
    box-shadow: 0 0 0 1px var(--tone-edge), 0 14px 46px -18px var(--tone-fg);
  }
  :global([data-d='K']) .kpi:hover { box-shadow: 0 0 0 1px var(--tone-fg), 0 16px 54px -16px var(--tone-fg); }
  :global([data-d='K']) .kv { text-shadow: 0 0 22px var(--tone-fg); }
  /* pulsado: el anillo se enciende entero, no solo cambia el tono */
  :global([data-d='K']) .kpi[aria-pressed='true'] {
    background: var(--tone-band);
    box-shadow: 0 0 0 2px var(--tone-fg), 0 20px 66px -14px var(--tone-fg);
  }
  :global([data-d='K']) .sect { box-shadow: var(--d-shadow-lg); }
  :global([data-d='K']) .lhead {
    background: transparent; border-bottom: 0;
    box-shadow: 0 1px 0 var(--d-neu-edge);
  }
  /* el título del grupo no lleva banda: se enciende en su tono */
  :global([data-d='K']) .ghead {
    background: transparent; border-bottom: 0;
    color: var(--tone-fg); text-shadow: 0 0 18px var(--tone-fg);
    padding-top: var(--d-p2);
  }
  :global([data-d='K']) .gc { color: var(--d-ink-3); text-shadow: none; }
  :global([data-d='K']) .row:hover { background: var(--d-neu-band); }
  :global([data-d='K']) .fam {
    background: transparent; border: 0; border-radius: var(--d-r-pill);
    box-shadow: 0 0 0 1px var(--d-neu-edge);
  }
  :global([data-d='K']) .fam:hover { box-shadow: 0 0 0 1px var(--d-ink-3), 0 6px 22px -12px var(--d-ink-2); }
  :global([data-d='K']) .fam[aria-pressed='true'] {
    background: var(--d-accent-soft); color: var(--d-ink);
    box-shadow: 0 0 0 1px var(--d-accent), 0 8px 28px -12px var(--d-accent);
  }
  :global([data-d='K']) .track {
    height: 6px; background: transparent; box-shadow: inset 0 0 0 1px var(--d-neu-edge);
  }
  :global([data-d='K']) .fill { background: var(--tone-fg); box-shadow: 0 0 20px -2px var(--tone-fg); }
  :global([data-d='K']) .thr { background: var(--d-ink-3); }
  /* cada plan es otra luz suelta, con el anillo del tono y nada de relleno */
  :global([data-d='K']) .tlr {
    border-radius: var(--d-r); padding: var(--d-p2) var(--d-p3);
    box-shadow: 0 0 0 1px var(--tone-edge), 0 12px 44px -22px var(--tone-fg);
  }
  :global([data-d='K']) .tlid { color: var(--d-accent); }
  :global([data-d='K']) .foot {
    background: transparent; border-top: 0;
    box-shadow: 0 -22px 44px -34px var(--d-accent);
  }

  /* ── L · GUIJARRO — cuatro radios distintos, y distintos entre vecinos ─
     HALLAZGO: L publica solo DOS juegos de radios (--d-r y --d-r-lg) y una
     piedra necesita más de dos perfiles: con dos, las vecinas se vuelven a
     leer como la misma tarjeta. Los otros dos salen de CRUZAR los que hay
     con la barra de border-radius —radios horizontales de uno, verticales
     del otro—, que sigue siendo token y no un valor inventado. */
  :global([data-d='L']) .topbar {
    margin: var(--d-p2) var(--d-p2) 0;
    border: 0; border-radius: var(--d-r-lg) / var(--d-r);
    background: var(--d-surface);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='L']) .verdict {
    border: 0; border-radius: var(--d-r-lg);
    background: var(--tone-band);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='L']) .kpi { border: 0; box-shadow: var(--d-shadow); padding: var(--d-p2) var(--d-p3) var(--d-p3); }
  :global([data-d='L']) .kpi:nth-child(1) { border-radius: var(--d-r-lg); }
  :global([data-d='L']) .kpi:nth-child(2) { border-radius: var(--d-r); }
  :global([data-d='L']) .kpi:nth-child(3) { border-radius: var(--d-r-lg) / var(--d-r); }
  :global([data-d='L']) .kpi:nth-child(4) { border-radius: var(--d-r) / var(--d-r-lg); }
  :global([data-d='L']) .kpi:active { box-shadow: inset 3px 4px 9px -4px color-mix(in srgb, var(--d-ink) 32%, transparent); }
  :global([data-d='L']) .kpi[aria-pressed='true'] { background: var(--tone-band); }
  :global([data-d='L']) .sect { box-shadow: var(--d-shadow-lg); }
  :global([data-d='L']) .lhead { background: transparent; border-bottom: 0; }
  /* cada fila es su propio canto: sin líneas, y ninguna igual a la de al lado */
  :global([data-d='L']) .rows {
    display: flex; flex-direction: column; gap: var(--d-p1);
    padding: var(--d-p1) var(--d-p2) var(--d-p2);
  }
  :global([data-d='L']) .row { border-bottom: 0; background: var(--d-sunk); }
  :global([data-d='L']) .row:nth-child(4n + 1) { border-radius: var(--d-r); }
  :global([data-d='L']) .row:nth-child(4n + 2) { border-radius: var(--d-r) / var(--d-r-lg); }
  :global([data-d='L']) .row:nth-child(4n + 3) { border-radius: var(--d-r-lg) / var(--d-r); }
  :global([data-d='L']) .row:nth-child(4n) { border-radius: var(--d-r-lg); }
  /* el encabezado de grupo es una piedrita, no una franja de borde a borde */
  :global([data-d='L']) .ghead {
    width: fit-content; max-width: 100%;
    border-bottom: 0; background: var(--tone-band); color: var(--d-ink);
    border-radius: var(--d-r-lg) / var(--d-r);
    padding: var(--d-p1) var(--d-p3);
    margin-top: var(--d-p1);
  }
  :global([data-d='L']) .fam:nth-child(odd) { border-radius: var(--d-r); }
  :global([data-d='L']) .fam:nth-child(even) { border-radius: var(--d-r) / var(--d-r-lg); }
  :global([data-d='L']) .fam { border: 0; background: var(--d-sunk); box-shadow: var(--d-shadow); padding: 6px var(--d-p2); }
  :global([data-d='L']) .fam[aria-pressed='true'] { background: var(--d-accent); color: var(--d-accent-ink); }
  :global([data-d='L']) .fam[aria-pressed='true'] .ct { color: inherit; }
  :global([data-d='L']) .track { height: 12px; border-radius: var(--d-r) / var(--d-r-lg); background: var(--d-sunk); }
  :global([data-d='L']) .fill { border-radius: inherit; }
  :global([data-d='L']) .thr { background: var(--d-ink-3); }
  :global([data-d='L']) .tlr {
    background: var(--d-surface); border-radius: var(--d-r-lg) / var(--d-r);
    padding: var(--d-p2) var(--d-p3); box-shadow: var(--d-shadow);
  }
  :global([data-d='L']) .foot {
    margin: 0 var(--d-p2) var(--d-p2);
    border-top: 0; border-radius: var(--d-r) / var(--d-r-lg);
    background: var(--d-surface); box-shadow: var(--d-shadow);
  }

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

  /* ── N · CINTA — carriles de puntas redondas que se montan ─────────────
     Hay orden de apilado explícito: el carril de arriba pasa por encima del
     de abajo, y el de abajo devuelve una sombra de contacto hacia arriba.
     Sin las dos cosas —solapamiento y contacto— esto son pastillas sueltas. */
  :global([data-d='N']) .topbar {
    position: relative; z-index: 6;
    margin: var(--d-p2) var(--d-p3) calc(-1 * var(--d-p1));
    padding: var(--d-p1) var(--d-p4);
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r-pill);
    background: var(--d-surface-fill);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='N']) .scroll { gap: 0; padding-top: var(--d-p3); }
  :global([data-d='N']) .scroll > * { position: relative; }
  :global([data-d='N']) .scroll > * + * { margin-top: calc(-1 * var(--d-p1)); }
  :global([data-d='N']) .verdict {
    z-index: 5;
    border-radius: var(--d-r-pill); border-color: var(--tone-edge);
    padding: var(--d-p2) var(--d-p4);
    background: linear-gradient(100deg, var(--tone-band) 0%, var(--d-surface) 64%);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='N']) .kpis { z-index: 4; }
  :global([data-d='N']) .filters { z-index: 3; }
  :global([data-d='N']) .list { z-index: 2; }
  :global([data-d='N']) .tl { z-index: 1; }
  /* cuatro cintas que se montan de izquierda a derecha */
  :global([data-d='N']) .kpi {
    position: relative;
    border-radius: var(--d-r-pill); border-color: var(--d-line);
    padding: var(--d-p1) var(--d-p3);
    background: var(--d-surface-fill);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='N']) .kpi + .kpi { margin-left: calc(-1 * var(--d-p2)); }
  :global([data-d='N']) .kpi[aria-pressed='true'] {
    background: linear-gradient(100deg, var(--tone-band) 0%, var(--d-surface) 70%);
    z-index: 1;
  }
  :global([data-d='N']) .lhead { background: transparent; border-bottom: 0; padding-inline: var(--d-p4); }
  :global([data-d='N']) .rows { padding: 0 var(--d-p2) var(--d-p2); }
  /* la cinta de abajo queda encima, así que la sombra de contacto va hacia arriba */
  :global([data-d='N']) .row {
    margin-bottom: calc(var(--d-p1) / -2);
    box-shadow:
      0 -3px 7px -5px color-mix(in srgb, var(--d-ink) 34%, transparent),
      var(--d-shadow);
  }
  :global([data-d='N']) .ghead {
    width: fit-content; max-width: 100%;
    position: relative; z-index: 2;
    border-bottom: 0; border-radius: var(--d-r-pill);
    padding: var(--d-p1) var(--d-p3);
    background: linear-gradient(100deg, var(--tone-band) 0%, var(--d-surface) 72%);
    box-shadow: var(--d-shadow);
    margin-bottom: calc(var(--d-p1) / -2);
  }
  :global([data-d='N']) .fams { gap: 0; }
  :global([data-d='N']) .fam {
    border-radius: var(--d-r-pill); border-color: var(--d-line);
    padding: 4px var(--d-p2);
    background: var(--d-surface-fill);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='N']) .fam + .fam { margin-left: calc(var(--d-p1) / -3); }
  :global([data-d='N']) .fam:hover, :global([data-d='N']) .fam:focus-visible { z-index: 1; }
  :global([data-d='N']) .fam[aria-pressed='true'] {
    background: var(--d-accent-fill); color: var(--d-accent-ink);
    border-color: var(--d-accent-edge); z-index: 2;
  }
  :global([data-d='N']) .fam[aria-pressed='true'] .ct { color: inherit; }
  :global([data-d='N']) .track { background: var(--d-sunk-fill); height: 10px; }
  :global([data-d='N']) .fill {
    background: linear-gradient(100deg, var(--tone-band) 0%, var(--tone-fg) 70%);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='N']) .thr { background: var(--d-ink-2); }
  :global([data-d='N']) .foot {
    position: relative; z-index: 7;
    margin: calc(-1 * var(--d-p1)) var(--d-p3) var(--d-p2);
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r-pill);
    padding: var(--d-p1) var(--d-p4);
    background: var(--d-sunk-fill);
    box-shadow: var(--d-shadow);
  }

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

  /* ── P · ESPINA — una columna de marca de la que cuelga todo ───────────
     EL RAÍL DE 152px VUELVE, pero solo donde hay ancho de verdad: el
     veredicto, la barra de filtros, la tira de KPIs y las líneas del plan
     ocupan el ancho entero de la pantalla. Las tarjetas angostas que lo
     rompían no existen en esta página, y bajo 760px se recoge (abajo).
     La tira de KPIs deja de ser cuatro columnas y pasa a ser cuatro
     estratos colgados del raíl: es lo que separa a P de G a ojos
     entrecerrados, porque G mantiene la rejilla de cuatro.
     HALLAZGO: el ancho de la espina (6px en directions.css) no está
     tokenizado. La página lo repite a mano; si no, la columna de la
     pantalla y la de cada .d-panel quedarían desalineadas por un pelo. */
  :global([data-d='P']) .topbar {
    background: linear-gradient(90deg, var(--d-brand) 0 6px, transparent 6px), var(--d-surface);
    border-bottom-color: var(--d-line);
    padding-left: calc(var(--d-p3) + 6px);
  }
  :global([data-d='P']) .scroll {
    padding: 0; gap: 0;
    background: linear-gradient(90deg, var(--d-brand) 0 6px, transparent 6px);
  }
  :global([data-d='P']) .verdict {
    position: relative;
    grid-template-columns: var(--d-rail) minmax(0, 1fr);
    gap: 0 var(--d-p3); align-items: baseline;
    background: transparent; border: 0; border-bottom: 1px solid var(--d-line); border-radius: 0;
    padding: var(--d-p3) var(--d-p3) var(--d-p3) calc(var(--d-p3) + 6px);
  }
  /* el estado no pinta el fondo: muerde la espina con una muesca de su tono */
  :global([data-d='P']) .verdict::before,
  :global([data-d='P']) .ghead::before,
  :global([data-d='P']) .kpi::before {
    content: ''; position: absolute; inset: 0 auto 0 0; width: 6px; pointer-events: none;
    background: linear-gradient(180deg, var(--d-brand) 0 26%, var(--tone-fg) 26% 74%, var(--d-brand) 74%);
  }
  :global([data-d='P']) .vk { justify-content: flex-end; text-align: right; color: var(--d-brand); }
  :global([data-d='P']) .kpis { grid-template-columns: minmax(0, 1fr); gap: 0; }
  :global([data-d='P']) .kpi {
    position: relative;
    display: grid; grid-template-columns: var(--d-rail) auto minmax(0, 1fr);
    align-items: baseline; gap: 0 var(--d-p3);
    background: transparent; border: 0; border-radius: 0; box-shadow: none;
    border-bottom: 1px solid var(--d-line);
    padding: var(--d-p2) var(--d-p3) var(--d-p2) calc(var(--d-p3) + 6px);
  }
  :global([data-d='P']) .kl {
    grid-column: 1; grid-row: 1; justify-content: flex-end; text-align: right;
    color: var(--d-brand); font-weight: var(--d-w-semi);
  }
  :global([data-d='P']) .kv { grid-column: 2; grid-row: 1; font-size: var(--d-t-xl); }
  :global([data-d='P']) .kn { grid-column: 3; grid-row: 1; text-align: right; }
  :global([data-d='P']) .kpi[aria-pressed='true'] { background: var(--d-sunk); }
  /* la franja de filtros es opaca y taparía la espina de .scroll: se la
     vuelve a pintar encima, del mismo ancho */
  :global([data-d='P']) .filters {
    grid-template-columns: var(--d-rail) minmax(0, 1fr);
    gap: 0 var(--d-p3); align-items: center;
    background: linear-gradient(90deg, var(--d-brand) 0 6px, transparent 6px), var(--d-sunk);
    border-bottom: 1px solid var(--d-line);
    padding: var(--d-p2) var(--d-p3) var(--d-p2) calc(var(--d-p3) + 6px);
  }
  /* el panel trae 6px de padding para dejarle sitio a su propia espina, y eso
     empujaba la muesca de cada fila a un segundo carril de 6 a 12px: dos
     columnas de marca donde tiene que haber una. Sin ese padding, la espina
     del panel y las muescas de filas y grupos caen en el mismo carril. */
  :global([data-d='P']) .sect { padding-left: 0; }
  :global([data-d='P']) .flab { text-align: right; color: var(--d-brand); }
  :global([data-d='P']) .fam {
    border: 0; border-bottom: 2px solid transparent; border-radius: 0;
    background: transparent; padding-inline: 4px;
  }
  :global([data-d='P']) .fam[aria-pressed='true'] {
    background: transparent; color: var(--d-brand); border-bottom-color: var(--d-brand);
  }
  /* la rejilla del listado arranca donde termina la espina */
  :global([data-d='P']) .lhead { background: transparent; padding-left: calc(var(--d-p3) + 6px); }
  :global([data-d='P']) .ghead {
    position: relative;
    background: var(--d-sunk); color: var(--d-brand);
    border-bottom-color: var(--d-line);
    padding-left: calc(var(--d-p3) + 6px);
  }
  /* mismo ajuste que en C: a .7 el conteo caía a 3.7:1 sobre --d-sunk. */
  :global([data-d='P']) .gc { color: var(--d-brand); opacity: .85; }
  :global([data-d='P']) .tlb { padding: 0; gap: 0; }
  :global([data-d='P']) .tlr {
    position: relative;
    grid-template-columns: var(--d-rail) minmax(0, 1fr);
    gap: 0 var(--d-p3); align-items: baseline;
    border-bottom: 1px solid var(--d-line);
    padding: var(--d-p2) var(--d-p3) var(--d-p2) calc(var(--d-p3) + 6px);
  }
  :global([data-d='P']) .tlr::before {
    content: ''; position: absolute; inset: 0 auto 0 0; width: 6px;
    background: linear-gradient(180deg, var(--d-brand) 0 26%, var(--tone-fg) 26% 74%, var(--d-brand) 74%);
  }
  :global([data-d='P']) .tlid { text-align: right; color: var(--d-brand); }
  :global([data-d='P']) .track { height: 4px; border-radius: 0; background: var(--d-sunk); }
  :global([data-d='P']) .fill { border-radius: 0; }
  :global([data-d='P']) .thr { top: -4px; bottom: -4px; background: var(--d-ink-2); }
  :global([data-d='P']) .foot {
    background: linear-gradient(90deg, var(--d-brand) 0 6px, transparent 6px), var(--d-sunk);
    border-top-color: var(--d-line);
    padding-left: calc(var(--d-p3) + 6px);
  }

  /* ── Q · CHAROL — masa dura con la superficie mojada ───────────────────
     Borde de 2px, sombra sólida desplazada y el barrido húmedo encima. El
     barrido va en el fondo, como en J, para que no le tape el clic a nada.
     HALLAZGO: mismo vacío que J — no hay --d-gloss. Se compone acá desde
     --d-surface, que en Q es blanco puro. */
  :global([data-d='Q']) .screen { --pg-gloss: color-mix(in srgb, var(--d-surface) 58%, transparent); }
  /* La barra lleva tinta clara, así que NO lleva barrido: un blanco al 58 %
     sobre el tercio de arriba deja el texto en 3:1 justo donde vive. Lo
     mojado se lo da el propio degradado de --d-accent-fill —que ya no es un
     color plano— más el realce duro de 1px del canto. */
  :global([data-d='Q']) .topbar {
    background: var(--d-accent-fill);
    color: var(--d-accent-ink);
    border-bottom: var(--d-bw) solid var(--d-ink);
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--d-surface) 75%, transparent);
  }
  :global([data-d='Q']) .title { text-transform: uppercase; font-weight: var(--d-w-bold); }
  /* crimson sobre crimson no se ve: la acción se invierte a placa clara */
  :global([data-d='Q']) .topbar .act {
    background: linear-gradient(180deg, var(--pg-gloss) 0%, transparent 40%), var(--d-surface-fill);
    color: var(--d-ink);
  }
  :global([data-d='Q']) .verdict {
    border: var(--d-bw) solid var(--d-ink);
    background: linear-gradient(180deg, var(--pg-gloss) 0%, transparent 40%), var(--tone-band);
    box-shadow: var(--d-shadow);
    margin-right: 5px;
  }
  :global([data-d='Q']) .vt { font-weight: var(--d-w-semi); }
  :global([data-d='Q']) .kpis { padding-right: 5px; }
  :global([data-d='Q']) .kpi {
    border: var(--d-bw) solid var(--d-ink); border-radius: var(--d-r-lg);
    background: linear-gradient(180deg, var(--pg-gloss) 0%, transparent 34%), var(--tone-band);
    box-shadow: var(--d-shadow);
    padding: var(--d-p2) var(--d-p3) var(--d-p3);
  }
  :global([data-d='Q']) .kv { color: var(--d-ink); }
  :global([data-d='Q']) .kl { text-transform: uppercase; font-weight: var(--d-w-bold); font-size: var(--d-t-xs); }
  :global([data-d='Q']) .kpi:active {
    transform: translate(5px, 5px);
    box-shadow: inset 0 2px 5px color-mix(in srgb, var(--d-ink) 35%, transparent);
  }
  /* misma razón que en la barra: sobre crimson el barrido se cambia por el
     realce duro del canto, que no cruza ninguna palabra */
  :global([data-d='Q']) .kpi[aria-pressed='true'] {
    background: var(--d-accent-fill);
    color: var(--d-accent-ink);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='Q']) .kpi[aria-pressed='true'] .kv,
  :global([data-d='Q']) .kpi[aria-pressed='true'] .kn { color: var(--d-accent-ink); }
  :global([data-d='Q']) .sect { margin-right: 5px; box-shadow: var(--d-shadow); }
  :global([data-d='Q']) .lhead {
    background: linear-gradient(180deg, var(--pg-gloss) 0%, transparent 50%), var(--d-sunk-fill);
    border-bottom-color: var(--d-ink);
  }
  :global([data-d='Q']) .ghead {
    background: linear-gradient(180deg, var(--pg-gloss) 0%, transparent 45%), var(--tone-band);
    color: var(--d-ink); font-weight: var(--d-w-bold);
    border-top: var(--d-bw) solid var(--d-ink); border-bottom-color: var(--d-ink);
  }
  :global([data-d='Q']) .fam {
    border-color: var(--d-ink); border-radius: var(--d-r);
    background: linear-gradient(180deg, var(--pg-gloss) 0%, transparent 45%), var(--d-surface-fill);
    box-shadow: 3px 3px 0 var(--d-ink);
    text-transform: uppercase; font-weight: var(--d-w-semi); margin-bottom: 3px;
  }
  :global([data-d='Q']) .fam:active { transform: translate(3px, 3px); box-shadow: none; }
  :global([data-d='Q']) .fam[aria-pressed='true'] {
    background: var(--d-accent-fill);
    color: var(--d-accent-ink);
    box-shadow: 3px 3px 0 var(--d-ink), inset 0 1px 0 color-mix(in srgb, var(--d-surface) 70%, transparent);
  }
  :global([data-d='Q']) .fam[aria-pressed='true'] .ct { color: inherit; }
  :global([data-d='Q']) .track {
    height: 16px; border: var(--d-bw) solid var(--d-ink);
    background: var(--d-sunk-fill); overflow: hidden;
  }
  :global([data-d='Q']) .fill {
    background: linear-gradient(180deg, var(--pg-gloss) 0%, transparent 55%), var(--tone-fg);
  }
  :global([data-d='Q']) .thr { top: -3px; bottom: -3px; width: 2px; background: var(--d-ink); }
  :global([data-d='Q']) .foot {
    background: linear-gradient(180deg, var(--pg-gloss) 0%, transparent 45%), var(--d-sunk-fill);
    border-top: var(--d-bw) solid var(--d-ink);
  }

  /* ── R · VITRINA — densidad de consola, material de vidrio ─────────────
     La más densa de las diecinueve: fila de 26px, todo en una línea, y aun
     así respira porque el fondo pasa a través. No repite los corchetes ni
     los guiones de F: lo que la separa de Terminal es el material y el
     cebrado de vidrio, no otro juego de signos.
     ANIDADO: blur solo en barra, KPIs y pie. Dentro de .sect, alfa. */
  :global([data-d='R']) .scroll { padding: var(--d-p2); gap: var(--d-p2); }
  :global([data-d='R']) .topbar {
    padding: var(--d-p1) var(--d-p2);
    background: var(--d-surface);
    backdrop-filter: blur(16px) saturate(1.3);
    -webkit-backdrop-filter: blur(16px) saturate(1.3);
    border-bottom-color: var(--d-line);
  }
  :global([data-d='R']) .title {
    font-size: var(--d-t-md); text-transform: uppercase;
    letter-spacing: .12em; color: var(--d-accent);
  }
  :global([data-d='R']) .verdict {
    border-radius: var(--d-r); border-color: var(--tone-edge);
    padding: var(--d-p1) var(--d-p2);
    backdrop-filter: blur(16px) saturate(1.3);
    -webkit-backdrop-filter: blur(16px) saturate(1.3);
  }
  :global([data-d='R']) .vt { font-size: var(--d-t-md); font-weight: var(--d-w-med); color: var(--tone-fg); }
  :global([data-d='R']) .kpis { gap: var(--d-p1); }
  /* el KPI se aplasta a dos líneas de consola */
  :global([data-d='R']) .kpi {
    flex-direction: row; align-items: baseline; flex-wrap: wrap;
    gap: 0 var(--d-p1);
    padding: var(--d-p1) var(--d-p2);
    border-color: var(--d-line); border-radius: var(--d-r);
    background: var(--d-surface);
    backdrop-filter: blur(16px) saturate(1.3);
    -webkit-backdrop-filter: blur(16px) saturate(1.3);
  }
  :global([data-d='R']) .kv { font-size: var(--d-t-lg); }
  :global([data-d='R']) .kn { flex: 1 1 100%; }
  :global([data-d='R']) .kpi[aria-pressed='true'] { box-shadow: inset 0 0 0 1px var(--tone-fg); }
  :global([data-d='R']) .sect { box-shadow: var(--d-shadow); }
  :global([data-d='R']) .lhead { background: var(--d-sunk); border-bottom-color: var(--d-line); }
  :global([data-d='R']) .lhead, :global([data-d='R']) .row {
    grid-template-columns: 64px minmax(0, 2.2fr) minmax(0, 1.4fr) 92px 100px;
    gap: var(--d-p2);
  }
  /* una fila, una línea: 26px y ni un pixel más */
  :global([data-d='R']) .nm, :global([data-d='R']) .pl,
  :global([data-d='R']) .mv, :global([data-d='R']) .sub { display: inline; overflow: visible; }
  :global([data-d='R']) .sub::before { content: ' · '; color: var(--d-ink-3); }
  :global([data-d='R']) .c-eq, :global([data-d='R']) .c-plan, :global([data-d='R']) .c-metric {
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  /* cebrado de vidrio: el renglón par deja pasar un poco menos de fondo */
  :global([data-d='R']) .row:nth-child(even) { background: var(--d-sunk); }
  :global([data-d='R']) .ghead {
    min-height: var(--d-row-h); padding: 0 var(--d-p2);
    background: var(--tone-band); color: var(--tone-fg); border-bottom: 0;
  }
  :global([data-d='R']) .gc { color: var(--d-ink-3); }
  :global([data-d='R']) .fam {
    padding: 0 var(--d-p1); font-size: var(--d-t-2xs);
    border-color: var(--d-line); background: var(--d-surface);
  }
  :global([data-d='R']) .fam[aria-pressed='true'] { border-color: var(--d-accent); }
  :global([data-d='R']) .tlb { padding: var(--d-p1) var(--d-p2) var(--d-p2); gap: var(--d-p1); }
  /* el carril es un medidor segmentado, no una pastilla */
  :global([data-d='R']) .track {
    height: 8px; border-radius: var(--d-r); background-color: var(--d-sunk);
    background-image: repeating-linear-gradient(90deg, var(--d-line) 0 1px, transparent 1px 8.333%);
    box-shadow: inset 0 0 0 1px var(--d-line);
  }
  :global([data-d='R']) .fill { box-shadow: 0 0 12px -2px var(--tone-fg); }
  :global([data-d='R']) .thr { background: var(--d-ink-2); }
  :global([data-d='R']) .foot {
    padding: var(--d-p1) var(--d-p2);
    background: var(--d-sunk);
    backdrop-filter: blur(16px) saturate(1.3);
    -webkit-backdrop-filter: blur(16px) saturate(1.3);
    border-top-color: var(--d-line);
  }

  /* ── S · UMBRA — la tarjeta se queda blanca; informa la sombra ─────────
     HALLAZGO, y es el que más pesa: la firma de S está escrita a mano
     dentro de directions.css y SOLO para .d-panel y .d-row. No existe un
     --d-shadow-tone, así que todo el marcado propio de una página —los
     KPIs, el veredicto, los encabezados de grupo, las líneas del plan—
     nacía sin firma y la dirección se caía justo donde se arma la pantalla.
     Se recompone acá una vez, en --pg-lift, y se reparte a todo lo que
     informa un estado. El contenido no se tiñe en ningún caso: el número va
     en tinta, y lo que dice el estado son la marca, la palabra y la luz. */
  :global([data-d='S']) .screen { --pg-lift: 0 10px 30px -12px var(--tone-fg); }
  :global([data-d='S']) .topbar {
    background: var(--d-surface); border-bottom: 0;
    box-shadow: var(--d-shadow);
    position: relative; z-index: 2;
  }
  :global([data-d='S']) .verdict {
    background: var(--d-surface); border: 0;
    box-shadow: var(--pg-lift), var(--d-shadow);
  }
  :global([data-d='S']) .vt { color: var(--d-ink); }
  :global([data-d='S']) .kpi {
    background: var(--d-surface); border: 0; border-radius: var(--d-r-lg);
    padding: var(--d-p2) var(--d-p3) var(--d-p3);
    box-shadow: var(--pg-lift), var(--d-shadow);
  }
  /* el número va en tinta: en esta dirección el color no toca el contenido */
  :global([data-d='S']) .kv { color: var(--d-ink); }
  :global([data-d='S']) .kpi:hover { transform: translateY(-1px); box-shadow: var(--pg-lift), var(--d-shadow-lg); }
  /* pulsado sin cambiar de color: anillo de tinta, que se ve en gris también */
  :global([data-d='S']) .kpi[aria-pressed='true'] {
    background: var(--d-surface);
    box-shadow: inset 0 0 0 2px var(--d-ink), var(--pg-lift);
  }
  :global([data-d='S']) .sect { box-shadow: var(--d-shadow-lg); }
  :global([data-d='S']) .lhead { background: transparent; border-bottom: 0; }
  /* las filas ya traen la firma del primitivo: acá se les hace sitio */
  :global([data-d='S']) .rows { padding: var(--d-p1) var(--d-p2) var(--d-p2); }
  :global([data-d='S']) .ghead {
    background: var(--d-surface); border-bottom: 0; border-radius: var(--d-r);
    margin: var(--d-p2) 0 var(--d-p1);
    box-shadow: var(--pg-lift);
    position: relative; z-index: 1;
  }
  :global([data-d='S']) .fam {
    border: 0; background: var(--d-sunk); border-radius: var(--d-r-pill);
    padding: 5px var(--d-p2);
  }
  :global([data-d='S']) .fam[aria-pressed='true'] {
    background: var(--d-surface); color: var(--d-ink);
    box-shadow: 0 4px 12px -5px var(--d-ink), inset 0 0 0 1px var(--d-edge);
  }
  :global([data-d='S']) .track { background: var(--d-sunk); height: 10px; }
  :global([data-d='S']) .fill { box-shadow: var(--pg-lift); }
  :global([data-d='S']) .thr { background: var(--d-ink-3); }
  /* la línea del plan es marcado propio: sin esto, se quedaba sin firma */
  :global([data-d='S']) .tlb { padding: var(--d-p2) var(--d-p3) var(--d-p3); gap: var(--d-p3); }
  :global([data-d='S']) .tlr {
    background: var(--d-surface); border-radius: var(--d-r);
    padding: var(--d-p2) var(--d-p3);
    box-shadow: var(--pg-lift), var(--d-shadow);
  }
  /* hasta la pastilla se queda limpia: el fondo pasa a blanco y el tono se va
     abajo, a la luz. La palabra y la marca siguen llevando el estado, así que
     no queda información colgando solo del color */
  :global([data-d='S']) .c-state .d-pill,
  :global([data-d='S']) .tlw {
    background: var(--d-surface);
    box-shadow: 0 4px 12px -6px var(--tone-fg);
  }
  :global([data-d='S']) .foot {
    background: var(--d-surface); border-top: 0;
    box-shadow: 0 -8px 24px -14px color-mix(in srgb, var(--d-ink) 55%, transparent);
  }

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

  /* ── Las once nuevas, en angosto. Se recoge siempre lo mismo: raíles
     fijos, rejillas de columnas y solapamientos horizontales, que son las
     tres cosas que necesitan ancho para no volverse un carácter por línea.
     El material —vidrio, esmalte, luz, piedra— no se toca: no depende del
     ancho y es lo que identifica a cada dirección. ────────────────────── */
  @media (max-width: 760px) {
    /* P — el raíl de 152px se guarda de nuevo: bajo este ancho es
       exactamente la trampa por la que se había retirado. La espina se
       queda, porque no depende del ancho. */
    :global([data-d='P']) .verdict,
    :global([data-d='P']) .filters,
    :global([data-d='P']) .tlr,
    :global([data-d='P']) .kpi { grid-template-columns: minmax(0, 1fr); }
    :global([data-d='P']) .kl,
    :global([data-d='P']) .kv,
    :global([data-d='P']) .kn {
      grid-column: 1; grid-row: auto; text-align: left; justify-content: flex-start;
    }
    :global([data-d='P']) .vk,
    :global([data-d='P']) .flab,
    :global([data-d='P']) .tlid { text-align: left; justify-content: flex-start; }
    /* R — la fila de consola se rinde y pasa a ficha, como todas */
    :global([data-d='R']) .lhead, :global([data-d='R']) .row {
      grid-template-columns: minmax(0, 1fr) auto;
    }
    :global([data-d='R']) .c-eq, :global([data-d='R']) .c-plan, :global([data-d='R']) .c-metric {
      white-space: normal;
    }
  }
  @media (max-width: 560px) {
    /* O — la losa segmentada pasa a dos por dos: las divisiones de luz
       cambian de sitio o quedan cortando por la mitad de una fila */
    :global([data-d='O']) .kpi:nth-child(odd) { border-left: 0; }
    :global([data-d='O']) .kpi:nth-child(n + 3) { border-top: var(--d-bw) solid var(--d-line); }
    /* N — dos carriles por fila: el que abre cada fila no se monta con
       nada a su izquierda, y el solapamiento pasa a ser vertical */
    :global([data-d='N']) .kpi:nth-child(odd) { margin-left: 0; }
    :global([data-d='N']) .kpi:nth-child(n + 3) { margin-top: calc(-1 * var(--d-p1)); }
    /* I — con la barra y el pie flotando, el aire de los lados se recorta */
    :global([data-d='I']) .topbar { margin: var(--d-p2) var(--d-p2) 0; }
    :global([data-d='I']) .foot { margin: 0 var(--d-p2) var(--d-p2); }
  }
</style>
