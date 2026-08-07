<script>
  // PANELES Y KPIS
  //
  // Contenedores y cifras. La cifra grande es el elemento que decide esta
  // comparación: es lo único que sigue siendo visible cuando entrecerrás los
  // ojos, así que cada dirección la trata distinto — en D pesa 800 y ocupa la
  // celda, en E respira enorme y ligera, en F es una casilla de color dentro de
  // dos líneas de terminal, en G no tiene caja y cuelga del raíl de etiquetas.
  //
  // Todo el contenido sale de demo.js. Todo el color, radio, sombra y densidad
  // sale de los tokens --d-*. Lo único que esta página escribe por su cuenta es
  // la SILUETA de su familia allí donde las primitivas no llegan: la tira de
  // KPIs, la ficha técnica, el aviso y el anidado.
  import Grid from '../Grid.svelte';
  import Direction from '../Direction.svelte';
  import { KPIS, PLANS, ASSETS, COPY, markOf } from '../demo.js';

  export let directions = [];

  // Contenido fijo, no reactivo: sale entero de demo.js.
  const BAT = ASSETS[0]; // Batidora Imer Syntesi 250 — vencida hace 12 d
  const HRN = ASSETS[1]; // Horno rotativo Salva KX-8 — sin lectura, se estima
  const COM = ASSETS[4]; // Compactadora Wacker DPU-6555 — nunca medida
  const GEN = ASSETS[5]; // Generador Kohler 60REOZK
  const TAREAS = PLANS.slice(0, 3);
  const LECTURAS = [BAT, GEN];
  const TOTAL = KPIS[0].value + KPIS[1].value + KPIS[2].value + KPIS[3].value;

  // Una sola selección compartida por las ocho celdas: al elegir un KPI se ve
  // de un golpe cómo dibuja cada dirección el estado "seleccionado".
  let foco = KPIS[0].label;
</script>

<Grid>
  {#each directions as d (d.id)}
    <Direction id={d.id} flush={d.id === 'G' || d.id === 'F' || d.id === 'P' || d.id === 'R'}>
      <div class="root">
        <!-- SECCIÓN: encabezado + descripción ------------------------------ -->
        <section class="sec" aria-labelledby={'sec-' + d.id}>
          <div class="sec-head d-rail">
            <h4 class="sec-title" id={'sec-' + d.id}>Flota · {TOTAL} equipos</h4>
            <p class="sec-desc">{COPY.verdict}</p>
          </div>

          <!-- TIRA DE CUATRO KPIS ----------------------------------------- -->
          <div class="kpis" role="group" aria-label="Vencimientos de la flota">
            {#each KPIS as k (k.label)}
              <button
                type="button"
                class="kpi d-rail"
                class:on={foco === k.label}
                aria-pressed={foco === k.label}
                data-tone={k.tone}
                on:click={() => (foco = k.label)}
              >
                <span class="kpi-lab d-cap">
                  <svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf(k.tone)}</svg>
                  <span class="kpi-lab-t">{k.label}</span>
                </span>
                <span class="kpi-body">
                  <span class="kpi-fig d-num">{k.value}</span>
                  <span class="kpi-note">{k.note}</span>
                </span>
              </button>
            {/each}
          </div>

          <!-- KPI CON VARIACIÓN · KPI SIN DATO ---------------------------- -->
          <div class="kpis kpis--pair" role="group" aria-label="Variación y falta de dato">
            <button
              type="button"
              class="kpi d-rail"
              class:on={foco === 'Vencidos vs. ayer'}
              aria-pressed={foco === 'Vencidos vs. ayer'}
              data-tone="critical"
              on:click={() => (foco = 'Vencidos vs. ayer')}
            >
              <span class="kpi-lab d-cap">
                <svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf('critical')}</svg>
                <span class="kpi-lab-t">Vencidos vs. ayer</span>
              </span>
              <span class="kpi-body">
                <span class="kpi-fig d-num">{KPIS[0].value}</span>
                <span class="kpi-tag d-num">+3 desde ayer</span>
                <span class="kpi-note">Empeora · {KPIS[0].note}</span>
              </span>
            </button>

            <button
              type="button"
              class="kpi d-rail"
              class:on={foco === 'Horas · ' + COM.code}
              aria-pressed={foco === 'Horas · ' + COM.code}
              data-tone={COM.tone}
              on:click={() => (foco = 'Horas · ' + COM.code)}
            >
              <span class="kpi-lab d-cap">
                <svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf(COM.tone)}</svg>
                <span class="kpi-lab-t">Horas · {COM.code}</span>
              </span>
              <span class="kpi-body">
                <span class="kpi-fig d-num">{COM.metric}</span>
                <span class="kpi-tag">Sin dato</span>
                <span class="kpi-note">{COM.name} · lectura {COM.reading}</span>
              </span>
            </button>
          </div>
        </section>

        <div class="aside-row">
          <!-- FICHA TÉCNICA DEL EQUIPO ------------------------------------ -->
          <article class="d-panel ficha" data-tone={BAT.tone} aria-labelledby={'ficha-' + d.id}>
            <header class="d-panel-head">
              <h5 class="d-panel-title" id={'ficha-' + d.id}>
                <span class="d-id">{BAT.code}</span> · {BAT.family}
              </h5>
            </header>
            <div class="d-panel-body">
              <p class="ficha-name">{BAT.name}</p>
              <p class="ficha-state">
                <span class="d-pill" data-tone={BAT.tone}>
                  <svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf(BAT.tone)}</svg>
                  {BAT.state}
                </span>
                <span class="ficha-loc">{BAT.location}</span>
              </p>
              <dl class="ficha-meta">
                <div class="d-rail">
                  <dt class="d-cap">Próxima tarea</dt>
                  <dd>{BAT.plan} · {PLANS[0].every} — {PLANS[0].when}</dd>
                </div>
                <div class="d-rail">
                  <dt class="d-cap">Última lectura</dt>
                  <dd class="d-num">{BAT.reading}</dd>
                </div>
                <div class="d-rail">
                  <dt class="d-cap">Origen del dato</dt>
                  <dd>{BAT.source}</dd>
                </div>
              </dl>
            </div>
            <footer class="d-panel-foot">
              <button type="button" class="d-btn d-btn--sm">Registrar lectura</button>
              <button type="button" class="d-btn d-btn--sm d-btn--primary">Abrir ficha técnica</button>
            </footer>
          </article>

          <!-- AVISO LATERAL ----------------------------------------------- -->
          <div class="callout" data-tone="info" role="note">
            <p class="callout-kicker d-cap">
              <svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf('info')}</svg>
              <span>Aviso · dato estimado</span>
            </p>
            <div class="callout-txt">
              <p class="callout-title">{HRN.code} · {HRN.name} no reporta lectura</p>
              <p class="callout-body">
                Se estima con {HRN.reading}. Con ese supuesto, la {HRN.plan.toLowerCase()}
                ({PLANS[1].every}) vence {HRN.due}.
              </p>
            </div>
          </div>
        </div>

        <!-- PANEL: cabecera, cuerpo, panel anidado y pie de acciones ------- -->
        <section class="d-panel plan" aria-labelledby={'plan-' + d.id}>
          <header class="d-panel-head">
            <h5 class="d-panel-title" id={'plan-' + d.id}>Plan de mantenimiento</h5>
            <span class="d-cap d-num">{TAREAS.length} de {PLANS.length} tareas</span>
          </header>

          <ul class="plans">
            {#each TAREAS as t (t.asset)}
              <li class="d-row plan-row" data-tone={t.tone}>
                <span class="plan-task">
                  <span class="d-id">{t.asset}</span>
                  <span class="plan-name">{t.task} · {t.every}</span>
                </span>
                <span class="d-pill" data-tone={t.tone}>
                  <svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf(t.tone)}</svg>
                  {t.when}
                </span>
              </li>
            {/each}
          </ul>

          <div class="d-panel-body nest-wrap">
            <section class="d-panel nest" aria-labelledby={'nest-' + d.id}>
              <header class="d-panel-head">
                <h6 class="d-panel-title" id={'nest-' + d.id}>Lecturas recibidas</h6>
                <span class="d-cap">esta semana</span>
              </header>
              <ul class="plans">
                {#each LECTURAS as a (a.code)}
                  <li class="d-row plan-row" data-tone={a.tone}>
                    <span class="plan-task">
                      <span class="d-id">{a.code}</span>
                      <span class="plan-name d-num">{a.reading}</span>
                    </span>
                    <span class="plan-src d-cap">{a.source}</span>
                  </li>
                {/each}
              </ul>
            </section>
          </div>

          <footer class="d-panel-foot">
            <button type="button" class="d-btn d-btn--sm d-btn--ghost">Descartar cambios</button>
            <button type="button" class="d-btn d-btn--sm d-btn--primary">Guardar plan</button>
          </footer>
        </section>
      </div>
    </Direction>
  {/each}
</Grid>

<style>
  /* ======================================================================
     BASE — escrita solo con tokens. Ninguna dirección se decide acá.
     ====================================================================== */
  .root { display: grid; gap: var(--d-gap); min-width: 0; container-type: inline-size; }

  .sec { display: grid; gap: var(--d-gap); min-width: 0; }
  .sec-head { min-width: 0; }
  .sec-title {
    margin: 0 0 calc(var(--d-p1) / 2);
    font-size: var(--d-t-lg); font-weight: var(--d-w-semi); letter-spacing: -.015em;
    overflow-wrap: anywhere;
  }
  .sec-desc { margin: 0; font-size: var(--d-t-sm); color: var(--d-ink-3); max-width: 60ch; }

  .kpis {
    display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--d-gap); min-width: 0;
  }

  /* La tarjeta de cifra. Es un <button> porque filtra la flota de verdad. */
  .kpi {
    position: relative; width: 100%; min-width: 0; margin: 0;
    row-gap: 0;
    text-align: left; font: inherit; color: inherit; cursor: pointer;
    padding: var(--d-p3);
    background: var(--d-surface);
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    transition: box-shadow 120ms ease, transform 120ms ease, background 120ms ease;
  }
  .kpi-lab { display: flex; align-items: center; gap: calc(var(--d-p1) * .6); min-width: 0; }
  .kpi-lab-t { min-width: 0; overflow-wrap: anywhere; }
  .kpi-body { display: block; min-width: 0; margin-top: var(--d-p1); }
  .kpi-fig {
    display: block; line-height: 1.02;
    font-size: var(--d-t-2xl); font-weight: var(--d-w-bold); letter-spacing: -.02em;
    font-variant-numeric: var(--d-num);
    color: var(--tone-fg);
  }
  .kpi-note {
    display: block; margin-top: calc(var(--d-p1) / 2);
    font-size: var(--d-t-xs); color: var(--d-ink-3); overflow-wrap: anywhere;
  }
  .kpi-tag {
    display: inline-flex; align-items: center; margin-top: calc(var(--d-p1) / 2);
    padding: 1px var(--d-p1); border-radius: var(--d-r-pill);
    background: var(--tone-band); color: var(--tone-fg);
    border: max(var(--d-bw), 1px) solid var(--tone-edge);
    font-size: var(--d-t-2xs); font-weight: var(--d-w-semi);
    font-variant-numeric: var(--d-num);
  }
  .mk { width: 1em; height: 1em; flex: none; color: var(--tone-fg); }

  .ficha .d-panel-title { min-width: 0; overflow-wrap: anywhere; }
  .ficha-name {
    margin: 0; font-size: var(--d-t-lg); font-weight: var(--d-w-semi);
    letter-spacing: -.01em; overflow-wrap: anywhere;
  }
  .ficha-state {
    display: flex; align-items: center; gap: var(--d-p2); flex-wrap: wrap;
    margin: var(--d-p1) 0 0;
  }
  .ficha-loc { font-size: var(--d-t-xs); color: var(--d-ink-3); }
  .ficha-meta { margin: var(--d-p3) 0 0; display: grid; gap: var(--d-p1); }
  .ficha-meta dt { margin: 0; }
  .ficha-meta dd { margin: 0; font-size: var(--d-t-sm); overflow-wrap: anywhere; }

  .plans { list-style: none; margin: 0; padding: 0; }
  .plan-row { flex-wrap: wrap; padding-block: calc(var(--d-p1) / 2); }
  .plan-task {
    display: flex; align-items: baseline;
    row-gap: calc(var(--d-p1) * .5); column-gap: var(--d-p2);
    flex: 1 1 150px; min-width: 0; flex-wrap: wrap;
  }
  .plan-name { font-size: var(--d-t-sm); overflow-wrap: anywhere; }
  .plan-src { white-space: nowrap; }
  .nest-wrap { min-width: 0; }

  .callout {
    display: grid; gap: calc(var(--d-p1) / 2); min-width: 0;
    padding: var(--d-p3);
    background: var(--tone-band); color: var(--d-ink);
    border: var(--d-bw) solid var(--tone-edge);
    border-radius: var(--d-r-lg);
  }
  .callout-kicker {
    display: flex; align-items: center; gap: calc(var(--d-p1) * .6);
    margin: 0; color: var(--tone-fg);
  }
  .callout-txt { min-width: 0; display: grid; gap: calc(var(--d-p1) / 3); }
  .callout-title {
    margin: 0; font-size: var(--d-t-sm); font-weight: var(--d-w-semi);
    overflow-wrap: anywhere;
  }
  .callout-body { margin: 0; font-size: var(--d-t-xs); color: var(--d-ink-2); overflow-wrap: anywhere; }

  .aside-row { display: grid; gap: var(--d-gap); min-width: 0; }

  /* ======================================================================
     A · ELEVACIÓN — la sombra contiene, el borde apenas existe. Todo se
     separa por aire y el anidado FLOTA sobre su contenedor.
     ====================================================================== */
  :global([data-d='A']) .kpi { border-color: transparent; box-shadow: var(--d-shadow-lg); }
  :global([data-d='A']) .kpi:hover { transform: translateY(-2px); }
  :global([data-d='A']) .kpi.on {
    box-shadow: var(--d-shadow-lg), 0 0 0 calc(var(--d-bw) * 2) var(--tone-fg);
  }
  :global([data-d='A']) .kpi.on .kpi-lab { font-weight: var(--d-w-bold); color: var(--d-ink); }
  :global([data-d='A']) .ficha { border-color: transparent; box-shadow: var(--d-shadow-lg); }
  :global([data-d='A']) .callout { border-color: transparent; box-shadow: var(--d-shadow); }
  :global([data-d='A']) .nest {
    border-color: transparent; box-shadow: var(--d-shadow-lg); border-radius: var(--d-r-lg);
  }
  :global([data-d='A']) .sec-head { padding-bottom: var(--d-p1); }

  /* ======================================================================
     B · INSTRUMENTO — la tira es UN marco continuo: las celdas comparten
     el filo de 1px en vez de separarse, y el marco lleva marcas de esquina.
     ====================================================================== */
  :global([data-d='B']) .kpis {
    position: relative;
    gap: var(--d-bw);
    background: var(--d-line);
    border: var(--d-bw) solid var(--d-edge);
  }
  :global([data-d='B']) .kpis::before,
  :global([data-d='B']) .kpis::after {
    content: ''; position: absolute; pointer-events: none;
    width: calc(var(--d-p1) + var(--d-bw)); height: calc(var(--d-p1) + var(--d-bw));
    border: var(--d-bw) solid var(--d-edge);
  }
  :global([data-d='B']) .kpis::before {
    top: calc(var(--d-p1) / 2); left: calc(var(--d-p1) / 2); border-right: 0; border-bottom: 0;
  }
  :global([data-d='B']) .kpis::after {
    bottom: calc(var(--d-p1) / 2); right: calc(var(--d-p1) / 2); border-left: 0; border-top: 0;
  }
  :global([data-d='B']) .kpi { border: 0; box-shadow: none; padding: var(--d-p2); }
  :global([data-d='B']) .kpi-lab {
    border-bottom: var(--d-bw) solid var(--d-line);
    padding-bottom: calc(var(--d-p1) / 2);
  }
  :global([data-d='B']) .kpi.on { background: var(--d-sunk); }
  :global([data-d='B']) .kpi.on .kpi-lab {
    background: var(--d-edge); color: var(--d-ink-on);
    margin: calc(-1 * var(--d-p2)) calc(-1 * var(--d-p2)) 0;
    padding: calc(var(--d-p1) / 2) var(--d-p2);
    border-bottom-color: var(--d-edge);
  }
  /* La franja llena invierte el texto; la marca seguía en color de tono y se
     perdía contra el fondo. Toma la misma tinta que la etiqueta. */
  :global([data-d='B']) .kpi.on .kpi-lab .mk { color: var(--d-ink-on); }
  :global([data-d='B']) .sec-head {
    border-bottom: var(--d-bw) solid var(--d-edge); padding-bottom: var(--d-p1);
  }
  :global([data-d='B']) .sec-title {
    font-size: var(--d-t-md); text-transform: uppercase; letter-spacing: .09em;
  }
  :global([data-d='B']) .callout { background: var(--d-surface); border-color: var(--d-edge); }
  :global([data-d='B']) .callout-kicker {
    background: var(--tone-band); border-bottom: var(--d-bw) solid var(--tone-edge);
    margin: calc(-1 * var(--d-p3)) calc(-1 * var(--d-p3)) 0;
    padding: calc(var(--d-p1) / 2) var(--d-p3);
  }
  /* El anidado no flota: comparte los cantos laterales de su contenedor. */
  :global([data-d='B']) .nest {
    margin-inline: calc(-1 * var(--d-p3)); border-left: 0; border-right: 0;
  }
  /* El pie tampoco es "tres botones sueltos": es un marco con divisiones. */
  :global([data-d='B']) .d-panel-foot { gap: 0; }
  :global([data-d='B']) .d-panel-foot .d-btn + .d-btn { margin-left: calc(-1 * var(--d-bw)); }

  /* ======================================================================
     C · MARCA — cada cifra se anuncia por su cabecera llena de teal; el
     borde no identifica nada.
     ====================================================================== */
  :global([data-d='C']) .kpi { padding: 0; gap: 0; overflow: hidden; }
  :global([data-d='C']) .kpi-lab {
    background: var(--d-brand); color: var(--d-brand-ink);
    padding: var(--d-p1) var(--d-p2);
  }
  /* Cabecera teal llena: la marca iba en color de tono (verde, ámbar, rojo)
     sobre teal y era ilegible. Toma la tinta de marca, como la etiqueta. */
  :global([data-d='C']) .kpi-lab .mk { color: var(--d-brand-ink); }
  :global([data-d='C']) .kpi-body { margin-top: 0; padding: var(--d-p2) var(--d-p2) var(--d-p3); }
  :global([data-d='C']) .kpi.on { border-color: var(--d-brand); box-shadow: var(--d-shadow-lg); }
  :global([data-d='C']) .kpi.on .kpi-lab { background: var(--d-brand-deep); }
  :global([data-d='C']) .sec-title { color: var(--d-brand); }
  :global([data-d='C']) .sec-head {
    border-bottom: max(var(--d-bw), 1px) solid var(--d-accent-edge); padding-bottom: var(--d-p1);
  }
  :global([data-d='C']) .callout { background: var(--d-surface); border-color: var(--d-line); padding: 0; }
  :global([data-d='C']) .callout-kicker {
    background: var(--tone-fg); color: var(--d-ink-on);
    padding: var(--d-p1) var(--d-p3);
  }
  /* El kicker se llena con el propio color de tono: la marca, que también va
     en ese color, desaparecía. Toma la tinta invertida del kicker. */
  :global([data-d='C']) .callout-kicker .mk { color: var(--d-ink-on); }
  :global([data-d='C']) .callout-txt { padding: 0 var(--d-p3) var(--d-p3); }
  /* La cabecera del bloque es teal lleno y .d-cap pinta en --d-brand: la nota
     de la derecha quedaba teal sobre teal, invisible. Va en tinta de marca. */
  :global([data-d='C']) .d-panel-head .d-cap { color: var(--d-brand-ink); }

  /* ======================================================================
     D · PESO — la cifra ocupa la celda a 800, la etiqueta es una franja de
     tono con filo negro, y el bloque se mueve hacia su sombra al presionar.
     ====================================================================== */
  :global([data-d='D']) .kpi { padding: 0; gap: 0; border-color: var(--d-ink); }
  :global([data-d='D']) .kpi-lab {
    background: var(--tone-band); color: var(--d-ink);
    border-bottom: var(--d-bw) solid var(--d-ink);
    padding: calc(var(--d-p1) / 2) var(--d-p2);
  }
  :global([data-d='D']) .kpi-body { margin-top: 0; padding: var(--d-p2); }
  :global([data-d='D']) .kpi-fig {
    font-size: calc(var(--d-t-2xl) * 1.2); font-weight: var(--d-w-bold);
    line-height: .92; color: var(--d-ink); letter-spacing: -.03em;
  }
  :global([data-d='D']) .kpi:active,
  :global([data-d='D']) .kpi.on {
    transform: translate(var(--d-bw), var(--d-bw));
    box-shadow: var(--d-bw) var(--d-bw) 0 var(--d-ink);
  }
  :global([data-d='D']) .kpi.on .kpi-lab { background: var(--d-ink); color: var(--d-ink-on); }
  /* En D todas las marcas son tinta negra: sobre la franja negra del KPI
     activo quedaban invisibles. Se invierten con la etiqueta. */
  :global([data-d='D']) .kpi.on .kpi-lab .mk { color: var(--d-ink-on); }
  :global([data-d='D']) .sec-title { text-transform: uppercase; font-weight: var(--d-w-bold); }
  :global([data-d='D']) .sec-head {
    border-bottom: var(--d-bw) solid var(--d-ink); padding-bottom: var(--d-p1);
  }
  :global([data-d='D']) .callout { border-color: var(--d-ink); box-shadow: var(--d-shadow); }
  :global([data-d='D']) .callout-title { text-transform: uppercase; font-weight: var(--d-w-bold); }
  /* Anidado: el bloque de adentro conserva su propia masa y su propia sombra. */
  :global([data-d='D']) .nest { box-shadow: var(--d-shadow); border-color: var(--d-ink); }

  /* ======================================================================
     E · AIRE — cero bordes en toda la celda. La cifra es enorme y ligera,
     y la separación la hace el espacio, nunca una línea.
     ====================================================================== */
  :global([data-d='E']) .kpi { border: 0; padding: var(--d-p4); }
  :global([data-d='E']) .kpi-body { margin-top: var(--d-p2); }
  :global([data-d='E']) .kpi-fig {
    font-size: calc(var(--d-t-2xl) * 1.35); font-weight: var(--d-w);
    letter-spacing: -.035em; line-height: 1.06;
  }
  :global([data-d='E']) .kpi-tag { border: 0; padding: calc(var(--d-p1) / 2) var(--d-p2); }
  :global([data-d='E']) .kpi.on { background: var(--tone-band); box-shadow: var(--d-shadow-lg); }
  :global([data-d='E']) .sec-title { font-size: var(--d-t-xl); font-weight: var(--d-w-med); }
  :global([data-d='E']) .sec-head { padding-bottom: var(--d-p2); }
  :global([data-d='E']) .callout { border: 0; padding: var(--d-p4); }
  :global([data-d='E']) .plan-row { border-bottom: 0; }
  :global([data-d='E']) .plans { display: grid; gap: calc(var(--d-p1) / 2); }
  :global([data-d='E']) .nest { background: var(--d-sunk); box-shadow: none; border: 0; }
  :global([data-d='E']) .ficha-meta { gap: var(--d-p2); }

  /* ======================================================================
     F · TERMINAL — cada KPI es una línea de dos renglones: etiqueta con
     guía de puntos, cifra en una casilla de color, y la nota colgando.
     ====================================================================== */
  :global([data-d='F']) .root { padding: var(--d-p2); }
  :global([data-d='F']) .kpis {
    grid-template-columns: minmax(0, 1fr); gap: 0;
    border: var(--d-bw) solid var(--d-line);
  }
  :global([data-d='F']) .kpi {
    display: grid; grid-template-columns: minmax(0, 1fr) auto;
    align-content: center; column-gap: var(--d-p2);
    min-height: calc(var(--d-row-h) * 2);
    padding: 0 var(--d-p2);
    border: 0; border-bottom: var(--d-bw) solid var(--d-line); box-shadow: none;
  }
  :global([data-d='F']) .kpi:last-child { border-bottom: 0; }
  :global([data-d='F']) .kpi-body { display: contents; }
  :global([data-d='F']) .kpi-lab { grid-column: 1; grid-row: 1; }
  :global([data-d='F']) .kpi-lab::after {
    content: ''; flex: 1 1 auto; min-width: var(--d-p3);
    border-bottom: var(--d-bw) dotted var(--d-line);
    transform: translateY(-.3em);
  }
  :global([data-d='F']) .kpi-fig {
    grid-column: 2; grid-row: 1; align-self: center;
    font-size: var(--d-t-lg);
    background: var(--tone-band); color: var(--tone-fg);
    padding-inline: var(--d-p1);
  }
  :global([data-d='F']) .kpi-note { grid-column: 1 / -1; grid-row: 2; margin-top: 0; }
  :global([data-d='F']) .kpi-note::before { content: '└ '; color: var(--d-line); }
  :global([data-d='F']) .kpi-tag {
    grid-column: 1 / -1; grid-row: 3; justify-self: start;
    margin-top: 0; border-radius: 0; border: 0;
  }
  :global([data-d='F']) .kpi.on { background: var(--d-sunk); }
  :global([data-d='F']) .kpi.on .kpi-lab::before { content: '> '; color: var(--d-accent); }
  :global([data-d='F']) .sec-title {
    font-size: var(--d-t-md); text-transform: uppercase; letter-spacing: .08em;
  }
  :global([data-d='F']) .sec-title::before { content: '## '; color: var(--d-accent); }
  :global([data-d='F']) .sec-desc::before { content: '# '; color: var(--d-line); }
  :global([data-d='F']) .callout {
    background: var(--d-surface); border-color: var(--d-line); padding: var(--d-p2);
  }
  :global([data-d='F']) .callout-kicker {
    background: var(--tone-band); padding: 0 var(--d-p1); justify-self: start;
  }
  :global([data-d='F']) .nest-wrap { padding: var(--d-p1) var(--d-p2); }

  /* ======================================================================
     G · BANDA — ninguna caja. Franjas a sangre, raíl de etiquetas a la
     izquierda, y el estado como franja de 3px en el canto izquierdo.
     ====================================================================== */
  :global([data-d='G']) .root { padding-block: var(--d-p1); }
  :global([data-d='G']) .sec-head {
    padding-inline: var(--d-p3); padding-block: var(--d-p2);
    border-bottom: var(--d-bw) solid var(--d-line);
  }
  :global([data-d='G']) .sec-title {
    margin-bottom: 0; text-align: right;
    font-size: var(--d-t-sm); text-transform: uppercase;
    letter-spacing: var(--d-label-track); color: var(--d-ink-3);
  }
  :global([data-d='G']) .kpis { grid-template-columns: minmax(0, 1fr); gap: 0; }
  :global([data-d='G']) .kpi {
    border: 0; border-bottom: var(--d-bw) solid var(--d-line); border-radius: 0;
    background: transparent; box-shadow: none;
    padding: var(--d-p2) var(--d-p3);
  }
  :global([data-d='G']) .kpi[data-tone]::before {
    content: ''; position: absolute; inset: 0 auto 0 0; width: 3px;
    background: var(--tone-fg);
  }
  /* En el raíl la etiqueta es un bloque alineado a la derecha: si envuelve en
     dos líneas, la marca sigue pegada al texto y no se queda sola al margen.
     La marca vuelve a ser inline — base.css la deja en block y en un bloque
     alineado a la derecha se caería sola a su propio renglón. */
  :global([data-d='G']) .kpi-lab { display: block; text-align: right; }
  :global([data-d='G']) .mk { display: inline-block; vertical-align: -.12em; }
  :global([data-d='G']) .kpi-body { margin-top: 0; }
  :global([data-d='G']) .kpi-fig {
    color: var(--d-ink); font-weight: var(--d-w-med);
    font-size: calc(var(--d-t-2xl) * 1.1);
  }
  :global([data-d='G']) .kpi.on { background: var(--d-sunk); }
  :global([data-d='G']) .kpi.on::before { width: var(--d-p1); }
  :global([data-d='G']) .callout {
    position: relative;
    grid-template-columns: var(--d-rail) minmax(0, 1fr);
    gap: 0 var(--d-p3);
    align-items: baseline;
    background: transparent; border: 0;
    border-bottom: var(--d-bw) solid var(--d-line); border-radius: 0;
    padding: var(--d-p2) var(--d-p3);
  }
  :global([data-d='G']) .callout::before {
    content: ''; position: absolute; inset: 0 auto 0 0; width: 3px; background: var(--tone-fg);
  }
  :global([data-d='G']) .callout-kicker { display: block; text-align: right; }
  /* El anidado sigue siendo una franja: no se encoge dentro de su contenedor. */
  :global([data-d='G']) .nest-wrap { padding: 0; }
  :global([data-d='G']) .nest { margin-block: 0; }

  /* ======================================================================
     H · FICHA — la etiqueta es una PESTAÑA que sobresale arriba, la ficha
     lleva canto apilado abajo y el encabezado va bajo regla doble.
     ====================================================================== */
  :global([data-d='H']) .kpi {
    gap: 0;
    margin-top: calc(var(--d-p4) + var(--d-p2));
    padding-top: var(--d-p2);
    border-color: var(--d-edge);
  }
  :global([data-d='H']) .kpi-lab {
    position: absolute; bottom: 100%; left: calc(-1 * var(--d-bw));
    margin-bottom: calc(-1 * var(--d-bw));
    max-width: calc(100% + var(--d-bw) * 2);
    padding: calc(var(--d-p1) / 2) var(--d-p2);
    background: var(--d-sunk);
    border: var(--d-bw) solid var(--d-edge); border-bottom: 0;
    border-radius: var(--d-r-lg) var(--d-r-lg) 0 0;
  }
  :global([data-d='H']) .kpi-body { margin-top: 0; }
  :global([data-d='H']) .kpi.on { box-shadow: var(--d-shadow-lg); }
  :global([data-d='H']) .kpi.on .kpi-lab { background: var(--d-accent-soft); color: var(--d-accent); }
  :global([data-d='H']) .sec-head {
    padding-bottom: var(--d-p1);
    border-bottom: calc(var(--d-bw) * 3) double var(--d-edge);
  }
  :global([data-d='H']) .callout {
    background: var(--d-surface); box-shadow: var(--d-shadow); border-color: var(--tone-edge);
  }
  :global([data-d='H']) .callout-kicker {
    background: var(--tone-band);
    margin: calc(-1 * var(--d-p3)) calc(-1 * var(--d-p3)) 0;
    padding: calc(var(--d-p1) / 2) var(--d-p3);
  }
  :global([data-d='H']) .nest { background: var(--d-sunk); }

  /* ======================================================================
     I · CRISTAL — la tira de KPIs es UNA sola pieza de vidrio y las cuatro
     cifras viven DENTRO de ella. Vidrio sobre vidrio se enturbia: un segundo
     backdrop-filter no aclara nada, satura el mismo fondo dos veces y deja
     todo lechoso. Así que la tira desenfoca y las celdas solo son velos de
     transparencia distinta sobre ese mismo vidrio.

     HALLAZGO: I, O y R desenfocan en directions.css con un literal (18/20/16px)
     y no exponen un token --d-blur. Una página no puede igualar el vidrio de su
     dirección sin repetir el número a mano. Acá el radio sale de --d-p4, que en
     las tres es del mismo orden; el contrato debería declararlo.
     ====================================================================== */
  :global([data-d='I']) .kpis {
    gap: 0;
    background: var(--d-sunk);
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    overflow: hidden;
    backdrop-filter: blur(var(--d-p4)) saturate(1.5);
    -webkit-backdrop-filter: blur(var(--d-p4)) saturate(1.5);
  }
  /* La celda NO vuelve a desenfocar: es transparente, y su única arista es un
     filo de luz arriba. El borde en esta dirección es reflejo, no línea. */
  :global([data-d='I']) .kpi {
    background: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border: 0;
    border-radius: 0;
    box-shadow: inset 0 var(--d-bw) 0 var(--d-line);
  }
  :global([data-d='I']) .kpi.on {
    background: var(--d-surface);
    box-shadow: inset 0 var(--d-bw) 0 var(--d-line),
                inset 0 0 0 var(--d-bw) var(--tone-edge);
  }
  :global([data-d='I']) .kpi:hover { background: var(--d-sunk); }
  :global([data-d='I']) .kpi.on .kpi-lab { color: var(--d-ink); font-weight: var(--d-w-bold); }
  /* La tira recorta: sin esto el anillo de foco se pierde bajo el overflow. */
  :global([data-d='I']) .kpi:focus-visible { outline-offset: calc(-1 * var(--d-p1)); }
  :global([data-d='I']) .kpi-fig { text-shadow: 0 var(--d-bw) 0 var(--d-line); }
  :global([data-d='I']) .kpi-tag { box-shadow: inset 0 var(--d-bw) 0 var(--d-line); }
  :global([data-d='I']) .sec-title { text-shadow: 0 var(--d-bw) 0 var(--d-line); }
  :global([data-d='I']) .sec-head { padding-bottom: var(--d-p1); }
  /* El aviso sí está apoyado sobre el campo: le toca vidrio de verdad. */
  :global([data-d='I']) .callout {
    border-color: var(--d-line);
    box-shadow: var(--d-shadow);
    backdrop-filter: blur(var(--d-p3)) saturate(1.5);
    -webkit-backdrop-filter: blur(var(--d-p3)) saturate(1.5);
  }
  /* EL ANIDADO. Dentro de un panel que ya es vidrio, otro backdrop-filter
     duplica el desenfoque sobre el mismo fondo y el conjunto se enturbia.
     Se anida con transparencia: el panel de adentro solo es un velo. */
  :global([data-d='I']) .nest {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: var(--d-sunk);
    border-color: var(--d-line);
    box-shadow: inset 0 var(--d-bw) 0 var(--d-line);
  }
  /* Y su cabecera tampoco suma un velo más: sería la tercera capa de blanco
     sobre el mismo punto del campo. */
  :global([data-d='I']) .nest .d-panel-head { background: transparent; }
  :global([data-d='I']) .callout-kicker { text-shadow: 0 var(--d-bw) 0 var(--d-line); }
  :global([data-d='I']) .ficha-name { text-shadow: 0 var(--d-bw) 0 var(--d-line); }
  /* HALLAZGO de contraste, el mismo que ya está escrito en Acciones, Tablas y
     Formularios: en directions.css `[data-d='I'] .d-btn` pesa (0,2,0) y
     `.d-btn--primary` pesa (0,1,0), así que el vidrio blanco le gana el fondo
     al primario y queda tinta blanca sobre blanco — 1.01:1, invisible. El
     arreglo de raíz va en directions.css (mover --primary detrás de la regla
     de dirección); mientras tanto esta página lo repone, como las otras. */
  :global([data-d='I']) .d-btn--primary {
    background: var(--d-accent);
    color: var(--d-accent-ink);
  }

  /* ======================================================================
     J · LACA — ninguna superficie es color plano. El KPI es una placa de
     esmalte: degradado vertical, realce duro arriba, sombra larga abajo. El
     barrido vive en el tercio superior, no captura el clic y no se pinta
     encima del texto — la placa se hunde y el brillo se apaga al presionar.

     HALLAZGO: J y Q no declaran un token de brillo (--d-gloss). El barrido usa
     --d-ink-on, que en las dos es blanco puro, y se gradúa con opacidad. Es la
     única tinta clara que el contrato ofrece.
     ====================================================================== */
  :global([data-d='J']) .kpi {
    overflow: hidden;
    background: var(--d-surface-fill);
    border-color: var(--d-line);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='J']) .kpi::after {
    content: ''; position: absolute; inset: 0 0 auto 0; height: 38%;
    border-radius: var(--d-r-lg) var(--d-r-lg) 40% 40% /
                   var(--d-r-lg) var(--d-r-lg) 100% 100%;
    background: linear-gradient(180deg, var(--d-ink-on), transparent);
    opacity: .55;
    pointer-events: none;
    z-index: 0;
    transition: opacity 120ms ease;
  }
  /* El barrido es un pseudo posicionado: sin esto pintaría ENCIMA del contenido
     en línea del botón. El texto sube a su propia capa. */
  :global([data-d='J']) .kpi-lab,
  :global([data-d='J']) .kpi-body { position: relative; z-index: 1; }
  :global([data-d='J']) .kpi:focus-visible { outline-offset: calc(-1 * var(--d-p1)); }
  :global([data-d='J']) .kpi:active { transform: translateY(var(--d-bw)); }
  :global([data-d='J']) .kpi:active::after { opacity: 0; }
  :global([data-d='J']) .kpi.on {
    background: var(--d-sunk-fill);
    border-color: var(--tone-edge);
    box-shadow: inset 0 var(--d-p1) var(--d-p2) calc(-1 * var(--d-p1)) var(--d-edge);
  }
  :global([data-d='J']) .kpi.on::after { opacity: .18; }
  :global([data-d='J']) .kpi.on .kpi-lab { color: var(--d-ink); font-weight: var(--d-w-bold); }
  :global([data-d='J']) .kpi-fig { text-shadow: 0 var(--d-bw) 0 var(--d-ink-on); }
  :global([data-d='J']) .kpi-tag { background: linear-gradient(180deg, var(--d-ink-on), var(--tone-band)); }
  :global([data-d='J']) .sec-head { border-bottom: var(--d-bw) solid var(--d-line); padding-bottom: var(--d-p2); }
  :global([data-d='J']) .callout {
    position: relative; overflow: hidden;
    background: linear-gradient(180deg, var(--tone-band), var(--d-surface));
    border-color: var(--tone-edge);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='J']) .callout::before {
    content: ''; position: absolute; inset: 0 0 auto 0; height: 34%;
    background: linear-gradient(180deg, var(--d-ink-on), transparent);
    opacity: .5; pointer-events: none;
  }
  :global([data-d='J']) .callout-kicker,
  :global([data-d='J']) .callout-txt { position: relative; z-index: 1; }
  :global([data-d='J']) .nest { background: var(--d-sunk-fill); }

  /* ======================================================================
     K · HALO — cero bordes y cero rellenos sólidos. Un KPI existe porque
     irradia: anillo de 1px en su propio tono y resplandor difuso hacia
     afuera. El estado es el COLOR DE LA LUZ, no un relleno detrás del texto.
     ====================================================================== */
  :global([data-d='K']) .kpi {
    background: transparent;
    border: 0;
    box-shadow: 0 0 0 max(var(--d-bw), 1px) var(--tone-edge),
                0 var(--d-p2) calc(var(--d-p4) * 2) calc(-1 * var(--d-p3)) var(--tone-fg);
  }
  :global([data-d='K']) .kpi:hover {
    box-shadow: 0 0 0 max(var(--d-bw), 1px) var(--tone-fg),
                0 var(--d-p2) calc(var(--d-p4) * 2.4) calc(-1 * var(--d-p3)) var(--tone-fg);
  }
  /* Seleccionado: irradia más y desde más cerca. El grosor del anillo cambia
     además del color, para que el estado no dependa solo del tono. */
  :global([data-d='K']) .kpi.on {
    background: var(--tone-band);
    box-shadow: 0 0 0 max(var(--d-bw), 2px) var(--tone-fg),
                0 var(--d-p1) calc(var(--d-p4) * 2.6) calc(-1 * var(--d-p2)) var(--tone-fg);
  }
  :global([data-d='K']) .kpi.on .kpi-lab { color: var(--d-ink); font-weight: var(--d-w-bold); }
  /* El bloom del texto: apenas perceptible, pero es lo que hace que la cifra
     parezca emitir en vez de estar impresa. */
  :global([data-d='K']) .kpi-fig { text-shadow: 0 0 var(--d-p3) var(--tone-fg); }
  :global([data-d='K']) .mk { filter: drop-shadow(0 0 var(--d-p1) var(--tone-fg)); }
  :global([data-d='K']) .kpi-tag {
    background: transparent;
    border-color: transparent;
    box-shadow: 0 0 0 max(var(--d-bw), 1px) var(--tone-edge),
                0 0 var(--d-p3) calc(-1 * var(--d-p1)) var(--tone-fg);
  }
  :global([data-d='K']) .sec-head { padding-bottom: var(--d-p2); }
  :global([data-d='K']) .sec-title { text-shadow: 0 0 var(--d-p4) var(--d-accent-edge); }
  :global([data-d='K']) .callout {
    background: transparent;
    border: 0;
    box-shadow: 0 0 0 max(var(--d-bw), 1px) var(--tone-edge),
                0 var(--d-p2) calc(var(--d-p4) * 2) calc(-1 * var(--d-p3)) var(--tone-fg);
  }
  :global([data-d='K']) .callout-title { text-shadow: 0 0 var(--d-p3) var(--tone-fg); }
  /* El anidado no vuelve a irradiar hacia afuera —dos halos concéntricos se
     leen como una mancha—: se ilumina hacia adentro. */
  :global([data-d='K']) .nest {
    background: transparent;
    box-shadow: inset 0 0 0 max(var(--d-bw), 1px) var(--d-neu-edge),
                inset 0 0 var(--d-p4) calc(-1 * var(--d-p2)) var(--d-accent);
  }
  :global([data-d='K']) .ficha-name { text-shadow: 0 0 var(--d-p3) var(--tone-fg); }

  /* ======================================================================
     L · GUIJARRO — cuatro radios distintos por contenedor Y distintos entre
     vecinos. Si los cuatro KPIs comparten la misma cuaterna vuelven a ser
     tarjetas puestas en fila.

     HALLAZGO: L solo declara dos cuaternas (--d-r y --d-r-lg) y la dirección
     exige que ningún vecino repita. Las demás se componen permutando
     --d-p1..--d-p4, que son cuatro valores distintos entre sí; el contrato
     debería traer --d-r-a/b/c/d en vez de obligar a la página a improvisar.
     ====================================================================== */
  :global([data-d='L']) .kpi { border: 0; box-shadow: var(--d-shadow); }
  :global([data-d='L']) .kpis > .kpi:nth-child(1) { border-radius: var(--d-r-lg); }
  :global([data-d='L']) .kpis > .kpi:nth-child(2) { border-radius: var(--d-p4) var(--d-p2) var(--d-p3) var(--d-p1); }
  :global([data-d='L']) .kpis > .kpi:nth-child(3) { border-radius: var(--d-p2) var(--d-p3) var(--d-p1) var(--d-p4); }
  :global([data-d='L']) .kpis > .kpi:nth-child(4) { border-radius: var(--d-p3) var(--d-p1) var(--d-p4) var(--d-p2); }
  :global([data-d='L']) .kpis--pair > .kpi:nth-child(1) { border-radius: var(--d-p1) var(--d-p4) var(--d-p2) var(--d-p3); }
  :global([data-d='L']) .kpis--pair > .kpi:nth-child(2) { border-radius: var(--d-p3) var(--d-p2) var(--d-p4) var(--d-p1); }
  /* El guijarro se asienta sobre la mesa en vez de hundirse en ella. */
  :global([data-d='L']) .kpi:active { box-shadow: none; transform: translateY(calc(var(--d-p1) / 6)); }
  :global([data-d='L']) .kpi.on { background: var(--tone-band); box-shadow: var(--d-shadow-lg); }
  :global([data-d='L']) .kpi.on .kpi-lab { color: var(--d-ink); font-weight: var(--d-w-bold); }
  :global([data-d='L']) .kpi-fig { font-weight: var(--d-w-semi); letter-spacing: -.03em; }
  :global([data-d='L']) .kpi-tag { border: 0; border-radius: var(--d-p2) var(--d-p1) var(--d-p3) var(--d-p1); }
  :global([data-d='L']) .sec-head { padding-bottom: var(--d-p1); }
  :global([data-d='L']) .callout {
    border: 0;
    border-radius: var(--d-p3) var(--d-p1) var(--d-p4) var(--d-p2);
    box-shadow: var(--d-shadow);
  }
  /* Cuatro radios propios: si heredara los de .d-panel sería el mismo canto
     rodado que la ficha de al lado. */
  :global([data-d='L']) .nest-wrap .nest {
    border-radius: var(--d-p1) var(--d-p4) var(--d-p2) var(--d-p3);
    background: var(--d-sunk);
    box-shadow: none;
  }
  :global([data-d='L']) .aside-row .ficha[data-tone] { border-radius: var(--d-r-lg); }
  :global([data-d='L']) .d-panel-foot { gap: var(--d-p2); }

  /* ======================================================================
     M · BRUMA — sin contenedores. El KPI no tiene relleno, ni borde, ni
     sombra: lo que lo agrupa es una mancha de su tono que se derrama por
     detrás y se desvanece sin filo. Titulares en serif, cifras en serif;
     lo que se opera sigue en sans.
     ====================================================================== */
  :global([data-d='M']) .kpi {
    background: transparent;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    padding: var(--d-p1) 0 var(--d-p2);
    isolation: isolate;              /* la mancha queda contenida en su capa */
  }
  /* Dos manchas descentradas y de tamaños distintos: una sola, centrada, se
     lee como un relleno con las esquinas borrosas — o sea, la caja que esta
     dirección justamente no quiere ser. */
  :global([data-d='M']) .kpi::before {
    content: ''; position: absolute;
    inset: calc(-1 * var(--d-p2)) calc(-1 * var(--d-p3));
    background:
      radial-gradient(58% 66% at 20% 16%, var(--tone-band) 0%, transparent 70%),
      radial-gradient(46% 54% at 86% 88%, var(--tone-band) 0%, transparent 68%);
    filter: blur(var(--d-p4));
    opacity: .5;
    pointer-events: none;
    z-index: -1;
    transition: opacity 160ms ease;
  }
  :global([data-d='M']) .kpi.on::before { opacity: 1; }
  :global([data-d='M']) .kpi.on .kpi-lab { color: var(--d-ink); font-weight: var(--d-w-bold); }
  :global([data-d='M']) .kpi-fig {
    font-family: var(--d-display);
    font-weight: 400;
    letter-spacing: -.02em;
  }
  :global([data-d='M']) .kpi-tag { background: transparent; border: 0; padding-inline: 0; }
  :global([data-d='M']) .sec-title {
    font-family: var(--d-display);
    font-size: var(--d-t-xl); font-weight: 400; letter-spacing: -.01em;
  }
  :global([data-d='M']) .ficha-name { font-family: var(--d-display); font-weight: 400; }
  :global([data-d='M']) .callout-title {
    font-family: var(--d-display);
    font-size: var(--d-t-lg); font-weight: 400;
  }
  :global([data-d='M']) .callout {
    position: relative;
    isolation: isolate;
    background: none;
    border: 0;
    border-radius: 0;
    padding: var(--d-p2) 0;
  }
  :global([data-d='M']) .callout::before {
    content: ''; position: absolute;
    inset: calc(-1 * var(--d-p2)) calc(-1 * var(--d-p3));
    background:
      radial-gradient(60% 68% at 16% 18%, var(--tone-band) 0%, transparent 70%),
      radial-gradient(48% 56% at 90% 84%, var(--tone-band) 0%, transparent 68%);
    filter: blur(var(--d-p4));
    pointer-events: none;
    z-index: -1;
  }
  /* Dos manchas superpuestas se suman y vuelven a leerse como una caja: el
     anidado no trae la suya, se marca por sangría. */
  :global([data-d='M']) .nest::before { display: none; }
  :global([data-d='M']) .nest { padding-left: var(--d-p3); }
  :global([data-d='M']) .nest-wrap { padding: var(--d-p2) 0 0; }
  /* Misma trampa que en I: `[data-d='M'] .d-btn { background: var(--d-sunk) }`
     tapa a `.d-btn--primary`, y el primario queda papel sobre papel — 1.07:1. */
  :global([data-d='M']) .d-btn--primary {
    background: var(--d-accent);
    color: var(--d-accent-ink);
  }

  /* ======================================================================
     N · CINTA — el KPI no es una caja: es un carril de puntas redondas. Los
     carriles se montan unos milímetros entre sí, así que hay orden de
     apilado explícito y sombra de contacto contra el de abajo.
     ====================================================================== */
  :global([data-d='N']) .kpis { grid-template-columns: minmax(0, 1fr); gap: 0; }
  :global([data-d='N']) .kpi {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    column-gap: var(--d-p3);
    min-height: var(--d-row-h);
    padding: var(--d-p1) var(--d-p3);
    border: 0;
    border-radius: var(--d-r-pill);
    background: linear-gradient(100deg, var(--tone-band) 0%, var(--d-surface) 58%);
    box-shadow: var(--d-shadow),
                0 var(--d-p1) var(--d-p2) calc(-1 * var(--d-p1)) var(--d-edge);
  }
  /* El solape. Sin z-index los carriles se apilan al revés de como se leen. */
  :global([data-d='N']) .kpi + .kpi { margin-top: calc(-1 * var(--d-p1)); }
  :global([data-d='N']) .kpis > .kpi:nth-child(1) { z-index: 1; }
  :global([data-d='N']) .kpis > .kpi:nth-child(2) { z-index: 2; }
  :global([data-d='N']) .kpis > .kpi:nth-child(3) { z-index: 3; }
  :global([data-d='N']) .kpis > .kpi:nth-child(4) { z-index: 4; }
  :global([data-d='N']) .kpi-body { display: contents; }
  :global([data-d='N']) .kpi-lab { grid-column: 1; grid-row: 1; }
  :global([data-d='N']) .kpi-note { grid-column: 1; grid-row: 2; margin-top: 0; }
  :global([data-d='N']) .kpi-fig {
    grid-column: 2; grid-row: 1 / 3; align-self: center;
    font-size: var(--d-t-xl); text-align: right;
  }
  :global([data-d='N']) .kpi-tag { grid-column: 1; grid-row: 3; justify-self: start; }
  /* El carril elegido sube al tope de la pila y se monta sobre los dos vecinos. */
  :global([data-d='N']) .kpi.on {
    z-index: 5;
    box-shadow: var(--d-shadow-lg),
                0 var(--d-p1) var(--d-p2) calc(-1 * var(--d-p1)) var(--d-edge);
    background: linear-gradient(100deg, var(--tone-band) 0%, var(--tone-band) 24%, var(--d-surface) 72%);
  }
  :global([data-d='N']) .kpi.on .kpi-lab { color: var(--d-ink); font-weight: var(--d-w-bold); }
  :global([data-d='N']) .sec-head { padding: 0 var(--d-p3) var(--d-p2); }
  :global([data-d='N']) .callout {
    border: 0;
    border-radius: var(--d-r-pill);
    padding: var(--d-p2) var(--d-p4);
    background: linear-gradient(100deg, var(--tone-band) 0%, var(--d-surface) 62%);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='N']) .ficha-meta > .d-rail {
    border-radius: var(--d-r-pill);
    padding: calc(var(--d-p1) / 2) var(--d-p3);
    background: var(--d-sunk-fill);
  }
  :global([data-d='N']) .nest { box-shadow: var(--d-shadow); }

  /* ======================================================================
     O · PRISMA — la marca vive DENTRO del vidrio. La cabecera de cada cifra
     es el mismo vidrio teñido, no una barra opaca encima, así que la tarjeta
     sigue leyéndose como UNA pieza flotando sobre el campo.
     ====================================================================== */
  :global([data-d='O']) .kpi {
    padding: 0;
    gap: 0;
    overflow: hidden;
    border-color: var(--d-line);
    box-shadow: var(--d-shadow);
    backdrop-filter: blur(var(--d-p4)) saturate(1.5);
    -webkit-backdrop-filter: blur(var(--d-p4)) saturate(1.5);
  }
  :global([data-d='O']) .kpi-lab {
    background: linear-gradient(180deg, var(--d-accent-edge), var(--d-accent-soft));
    color: var(--d-brand-ink);
    border-bottom: var(--d-bw) solid var(--d-accent-soft);
    padding: var(--d-p1) var(--d-p2);
  }
  /* Sobre el vidrio teñido la marca de tono se apagaba: toma la tinta de marca,
     que en O es la oscura porque el tinte es claro. */
  :global([data-d='O']) .kpi-lab .mk { color: var(--d-brand-ink); }
  :global([data-d='O']) .kpi-body { margin-top: 0; padding: var(--d-p2) var(--d-p2) var(--d-p3); }
  :global([data-d='O']) .kpi:focus-visible { outline-offset: calc(-1 * var(--d-p1)); }
  :global([data-d='O']) .kpi:hover { transform: translateY(calc(-1 * var(--d-bw) * 2)); box-shadow: var(--d-shadow-lg); }
  /* Elegido: el vidrio se aclara (--d-line es el blanco al 72 %, el único
     token de O más claro que --d-surface) y el tinte de marca de la cabecera
     se duplica. Sigue siendo capa translúcida, nunca barra opaca. */
  :global([data-d='O']) .kpi.on {
    background: var(--d-line);
    box-shadow: var(--d-shadow-lg), 0 0 0 var(--d-bw) var(--d-accent-edge);
  }
  :global([data-d='O']) .kpi.on .kpi-lab {
    background: linear-gradient(180deg, var(--d-accent-edge), var(--d-accent-edge));
    font-weight: var(--d-w-bold);
  }
  /* UNA BOTONERA ACÁ ES VIDRIO SEGMENTADO. Tres botones sueltos, cada uno con
     su propio backdrop-filter y su propia sombra, son tres piezas de vidrio
     superpuestas: el pie entero pasa a ser la pieza y los botones, segmentos
     separados por una junta de luz. */
  :global([data-d='O']) .d-panel-foot {
    gap: 0;
    padding: 0;
    background: var(--d-sunk);
    border-top-color: var(--d-line);
    backdrop-filter: blur(var(--d-p3)) saturate(1.4);
    -webkit-backdrop-filter: blur(var(--d-p3)) saturate(1.4);
  }
  :global([data-d='O']) .d-panel-foot .d-btn {
    flex: 1 1 auto;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    min-height: var(--d-row-h);
  }
  :global([data-d='O']) .d-panel-foot .d-btn + .d-btn { box-shadow: inset var(--d-bw) 0 0 var(--d-line); }
  :global([data-d='O']) .d-panel-foot .d-btn:hover { background: var(--d-surface); }
  /* El segmento primario se tiñe de marca en vez de volverse una placa opaca:
     tinta oscura de marca sobre tinte claro, que es lo que sostiene el AA. */
  :global([data-d='O']) .d-panel-foot .d-btn--primary {
    background: var(--d-accent-soft);
    color: var(--d-brand-ink);
    font-weight: var(--d-w-bold);
  }
  :global([data-d='O']) .d-panel-foot .d-btn--primary:hover { background: var(--d-accent-edge); }
  :global([data-d='O']) .callout {
    border-color: var(--d-line);
    box-shadow: var(--d-shadow);
    backdrop-filter: blur(var(--d-p3)) saturate(1.5);
    -webkit-backdrop-filter: blur(var(--d-p3)) saturate(1.5);
  }
  /* Mismo problema que en I: el vidrio anidado enturbia. Velo, no desenfoque. */
  :global([data-d='O']) .nest {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: var(--d-sunk);
    box-shadow: inset 0 var(--d-bw) 0 var(--d-line);
  }

  /* ======================================================================
     P · ESPINA — una columna de marca a la izquierda de la que cuelga todo.
     Cada bloque dibuja su propio tramo a x=0, así que la celda entera lee
     como UNA columna continua; el estado no pinta fondo, muerde la espina.

     EL RAÍL DE 152px VUELVE, pero solo donde hay ancho de verdad: la franja
     del KPI y la cabecera de sección ocupan la celda entera. Y vuelve del
     lado contrario al de Banda —acá el raíl lleva la CIFRA, no la etiqueta—,
     para que la mezcla C+G no termine siendo G con otro color.
     ====================================================================== */
  :global([data-d='P']) .root { padding-block: var(--d-p2); }
  :global([data-d='P']) .sec { position: relative; padding-left: calc(var(--d-p2) / 2); }
  :global([data-d='P']) .sec::before {
    content: ''; position: absolute; inset: 0 auto 0 0;
    width: calc(var(--d-p2) / 2);
    background: var(--d-brand);
  }
  :global([data-d='P']) .sec-head {
    grid-template-columns: var(--d-rail) minmax(0, 1fr);
    gap: 0 var(--d-p3);
    align-items: baseline;
    padding: var(--d-p2) var(--d-p3);
    border-bottom: var(--d-bw) solid var(--d-line);
  }
  :global([data-d='P']) .sec-title {
    margin-bottom: 0;
    text-align: right;
    font-size: var(--d-t-sm);
    font-weight: var(--d-w-semi);
    color: var(--d-brand);
  }
  :global([data-d='P']) .kpis { grid-template-columns: minmax(0, 1fr); gap: 0; }
  :global([data-d='P']) .kpi {
    display: grid;
    grid-template-columns: var(--d-rail) minmax(0, 1fr);
    column-gap: var(--d-p3);
    align-items: start;
    padding: var(--d-p2) var(--d-p3) var(--d-p2) calc(var(--d-p3) + var(--d-p2) / 2);
    margin-left: calc(-1 * var(--d-p2) / 2);
    background: transparent;
    border: 0;
    border-bottom: var(--d-bw) solid var(--d-line);
    border-radius: 0;
    box-shadow: none;
  }
  :global([data-d='P']) .kpi::before {
    content: ''; position: absolute; inset: 0 auto 0 0;
    width: calc(var(--d-p2) / 2);
    background: var(--d-brand);
  }
  /* La muesca: el tono muerde la espina en vez de teñir la franja. */
  :global([data-d='P']) .kpi[data-tone]::before {
    background: linear-gradient(180deg, var(--d-brand) 0%, var(--d-brand) 26%,
                var(--tone-fg) 26%, var(--tone-fg) 74%, var(--d-brand) 74%);
  }
  :global([data-d='P']) .kpi.on { background: var(--d-sunk); }
  :global([data-d='P']) .kpi.on::before {
    background: linear-gradient(180deg, var(--d-brand) 0%, var(--d-brand) 12%,
                var(--tone-fg) 12%, var(--tone-fg) 88%, var(--d-brand) 88%);
  }
  :global([data-d='P']) .kpi.on .kpi-lab { color: var(--d-ink); font-weight: var(--d-w-bold); }
  :global([data-d='P']) .kpi-body { display: contents; }
  /* La cifra ocupa el raíl, pegada contra la espina. */
  :global([data-d='P']) .kpi-fig {
    grid-column: 1; grid-row: 1 / 3;
    justify-self: end; align-self: center; text-align: right;
    font-size: calc(var(--d-t-2xl) * 1.1);
    font-weight: var(--d-w-med);
    color: var(--d-brand);
  }
  :global([data-d='P']) .kpi-lab { grid-column: 2; grid-row: 1; }
  :global([data-d='P']) .kpi-note { grid-column: 2; grid-row: 2; margin-top: 0; }
  :global([data-d='P']) .kpi-tag { grid-column: 2; grid-row: 3; justify-self: start; }
  :global([data-d='P']) .callout {
    position: relative;
    background: transparent;
    border: 0;
    border-bottom: var(--d-bw) solid var(--d-line);
    border-radius: 0;
    padding: var(--d-p2) var(--d-p3) var(--d-p2) calc(var(--d-p3) + var(--d-p2) / 2);
  }
  :global([data-d='P']) .callout::before {
    content: ''; position: absolute; inset: 0 auto 0 0;
    width: calc(var(--d-p2) / 2);
    background: linear-gradient(180deg, var(--d-brand) 0%, var(--d-brand) 26%,
                var(--tone-fg) 26%, var(--tone-fg) 74%, var(--d-brand) 74%);
  }
  :global([data-d='P']) .nest-wrap { padding-block: 0; }

  /* ======================================================================
     Q · CHAROL — masa dura con superficie mojada. Borde de 2px, sombra
     sólida desplazada y el charol encima: la cifra es un bloque macizo
     recién pintado. Al presionar, el bloque entra en su sombra y el brillo
     se apaga — se moja y se hunde a la vez.
     ====================================================================== */
  :global([data-d='Q']) .kpi {
    padding: 0;
    gap: 0;
    overflow: hidden;
    background: var(--d-surface-fill);
    border-color: var(--d-ink);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='Q']) .kpi::after {
    content: ''; position: absolute; inset: 0 0 auto 0; height: 34%;
    background: linear-gradient(180deg, var(--d-ink-on), transparent);
    opacity: .62;
    pointer-events: none;
    z-index: 0;
    transition: opacity 120ms ease;
  }
  /* El charol es un pseudo posicionado: el contenido tiene que subir a su capa
     o el barrido le pasa por encima al texto. */
  :global([data-d='Q']) .kpi-lab,
  :global([data-d='Q']) .kpi-body { position: relative; z-index: 1; }
  :global([data-d='Q']) .kpi-lab {
    background: var(--tone-band);
    color: var(--d-ink);
    border-bottom: var(--d-bw) solid var(--d-ink);
    padding: calc(var(--d-p1) / 2) var(--d-p2);
  }
  :global([data-d='Q']) .kpi-body { margin-top: 0; padding: var(--d-p2) var(--d-p3) var(--d-p3); }
  :global([data-d='Q']) .kpi-fig {
    font-size: calc(var(--d-t-2xl) * 1.15);
    font-weight: var(--d-w-bold);
    line-height: .94;
    letter-spacing: -.03em;
    color: var(--d-ink);
    text-shadow: 0 var(--d-bw) 0 var(--d-ink-on);
  }
  :global([data-d='Q']) .kpi:focus-visible { outline-offset: calc(-1 * var(--d-p1)); }
  :global([data-d='Q']) .kpi:active,
  :global([data-d='Q']) .kpi.on {
    transform: translate(var(--d-bw), var(--d-bw));
    box-shadow: var(--d-bw) var(--d-bw) 0 var(--d-ink);
  }
  :global([data-d='Q']) .kpi:active::after,
  :global([data-d='Q']) .kpi.on::after { opacity: .16; }
  :global([data-d='Q']) .kpi.on .kpi-lab { background: var(--d-ink); color: var(--d-ink-on); }
  /* Franja negra: la marca, que en Q es tinta, quedaba invisible. Se invierte. */
  :global([data-d='Q']) .kpi.on .kpi-lab .mk { color: var(--d-ink-on); }
  :global([data-d='Q']) .sec-title { text-transform: uppercase; font-weight: var(--d-w-bold); }
  :global([data-d='Q']) .sec-head { border-bottom: var(--d-bw) solid var(--d-ink); padding-bottom: var(--d-p1); }
  :global([data-d='Q']) .callout {
    position: relative;
    overflow: hidden;
    background: linear-gradient(180deg, var(--tone-band), var(--d-surface));
    border-color: var(--d-ink);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='Q']) .callout::before {
    content: ''; position: absolute; inset: 0 0 auto 0; height: 34%;
    background: linear-gradient(180deg, var(--d-ink-on), transparent);
    opacity: .5; pointer-events: none;
  }
  :global([data-d='Q']) .callout-kicker,
  :global([data-d='Q']) .callout-txt { position: relative; z-index: 1; }
  :global([data-d='Q']) .callout-title { text-transform: uppercase; font-weight: var(--d-w-bold); }
  :global([data-d='Q']) .nest { border-color: var(--d-ink); box-shadow: var(--d-shadow); }

  /* ======================================================================
     R · VITRINA — la más densa de las diecinueve. Una sola lámina de vidrio
     oscuro y, dentro, filas de 26px monoespaciadas: etiqueta, nota y cifra
     en UN renglón (Terminal usa dos). El tono es una barra encendida en el
     canto derecho, del lado contrario al de Banda.
     ====================================================================== */
  :global([data-d='R']) .root { padding: var(--d-p3); }
  :global([data-d='R']) .kpis {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
    background: var(--d-surface);
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    overflow: hidden;
    backdrop-filter: blur(var(--d-p4)) saturate(1.3);
    -webkit-backdrop-filter: blur(var(--d-p4)) saturate(1.3);
  }
  :global([data-d='R']) .kpi {
    display: grid;
    grid-template-columns: minmax(0, auto) minmax(0, 1fr) auto;
    align-items: center;
    column-gap: var(--d-p2);
    min-height: var(--d-row-h);
    padding: 0 var(--d-p3) 0 var(--d-p2);
    background: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border: 0;
    border-bottom: var(--d-bw) solid var(--d-line);
    border-radius: 0;
    box-shadow: none;
  }
  :global([data-d='R']) .kpi:last-child { border-bottom: 0; }
  :global([data-d='R']) .kpi::after {
    content: ''; position: absolute; inset: 0 0 0 auto;
    width: calc(var(--d-bw) * 2);
    background: var(--tone-fg);
    opacity: .75;
  }
  :global([data-d='R']) .kpi-body { display: contents; }
  :global([data-d='R']) .kpi-lab { grid-column: 1; grid-row: 1; overflow: hidden; }
  /* Renglón de 26px: la etiqueta no puede envolver o la fila deja de ser densa
     y pasa a ser dos filas. Se recorta, que es lo que hace una consola. */
  :global([data-d='R']) .kpi-lab-t { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  :global([data-d='R']) .kpi-note {
    grid-column: 2; grid-row: 1; margin-top: 0;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  :global([data-d='R']) .kpi-fig {
    grid-column: 3; grid-row: 1;
    font-size: var(--d-t-lg); line-height: 1;
  }
  :global([data-d='R']) .kpi-tag {
    grid-column: 1 / -1; grid-row: 2;
    justify-self: start; margin-top: 0;
    border-radius: 0;
  }
  /* La fila elegida se enciende por dentro: la luz entra por el canto izquierdo
     y el vidrio de esa banda se aclara. */
  :global([data-d='R']) .kpi.on {
    background: var(--d-accent-soft);
    box-shadow: inset calc(var(--d-bw) * 3) 0 0 var(--d-accent);
  }
  :global([data-d='R']) .kpi.on .kpi-lab { color: var(--d-accent); font-weight: var(--d-w-bold); }
  :global([data-d='R']) .kpi:hover { background: var(--d-sunk); }
  :global([data-d='R']) .kpi:focus-visible { outline-offset: calc(-1 * var(--d-p1)); }
  :global([data-d='R']) .sec-title {
    font-size: var(--d-t-md); text-transform: uppercase; letter-spacing: .09em;
    color: var(--d-accent);
  }
  :global([data-d='R']) .sec-head { padding-bottom: var(--d-p2); }
  :global([data-d='R']) .callout {
    border-color: var(--d-line);
    box-shadow: var(--d-shadow);
    padding: var(--d-p2);
    backdrop-filter: blur(var(--d-p3)) saturate(1.3);
    -webkit-backdrop-filter: blur(var(--d-p3)) saturate(1.3);
  }
  :global([data-d='R']) .callout-kicker { justify-self: start; }
  /* Vidrio dentro de vidrio: el anidado no vuelve a desenfocar. */
  :global([data-d='R']) .nest {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: var(--d-sunk);
    box-shadow: none;
  }
  :global([data-d='R']) .nest-wrap { padding: var(--d-p2); }
  :global([data-d='R']) .ficha-meta { gap: 0; }

  /* ======================================================================
     S · UMBRA — LA FIRMA, y hasta hoy la llevaban solo .d-panel y .d-row.
     El marcado propio de esta página —los seis KPIs, el aviso, la etiqueta
     de "Sin dato"— se veía blanco y mudo: toda la dirección estaba apagada
     justo en la familia donde más se juega.

     La tarjeta se queda BLANCA. Lo que informa es la luz teñida de abajo:
     vencidos proyectan rojo, al día proyecta verde, sin lectura proyecta
     gris. El contenido nunca se ensucia de color.

     HALLAZGO: S no declara tokens de sombra teñida; la primitiva escribe los
     desplazamientos a mano. Acá se componen con --d-p1..--d-p4 para que la
     luz de un KPI tenga la misma física que la de un .d-panel.
     ====================================================================== */
  :global([data-d='S']) .kpi {
    border: 0;
    background: var(--d-surface);
    box-shadow: 0 var(--d-p1) calc(var(--d-p3) * 1.5) calc(-1 * var(--d-p2)) var(--tone-fg),
                var(--d-shadow);
  }
  :global([data-d='S']) .kpi:hover {
    transform: translateY(calc(var(--d-p1) / -5));
    box-shadow: 0 var(--d-p2) calc(var(--d-p4) * 1.6) calc(-1 * var(--d-p2)) var(--tone-fg),
                var(--d-shadow);
  }
  /* Seleccionado: la luz se acerca y crece. El peso de la etiqueta y la
     elevación cambian con ella, para que el estado no sea solo color. */
  :global([data-d='S']) .kpi.on {
    transform: translateY(calc(var(--d-p1) / -4));
    box-shadow: 0 var(--d-p2) calc(var(--d-p4) * 2) calc(-1 * var(--d-p1)) var(--tone-fg),
                var(--d-shadow-lg);
  }
  :global([data-d='S']) .kpi.on .kpi-lab { color: var(--d-ink); font-weight: var(--d-w-bold); }
  :global([data-d='S']) .kpi-fig { font-weight: var(--d-w-semi); letter-spacing: -.03em; }
  /* La etiqueta tampoco se rellena de tono: se apoya en su propia luz. */
  :global([data-d='S']) .kpi-tag {
    background: var(--d-surface);
    border: 0;
    color: var(--tone-fg);
    box-shadow: 0 calc(var(--d-p1) / 2) var(--d-p2) calc(var(--d-p1) / -2) var(--tone-fg);
  }
  /* El aviso deja de ser una banda de color y pasa a ser una tarjeta blanca
     con luz de información abajo. Es el mismo dato, sin teñir el texto. */
  :global([data-d='S']) .callout {
    background: var(--d-surface);
    border: 0;
    box-shadow: 0 var(--d-p1) calc(var(--d-p3) * 1.5) calc(-1 * var(--d-p2)) var(--tone-fg),
                var(--d-shadow);
  }
  :global([data-d='S']) .sec-head { padding-bottom: var(--d-p1); }
  /* Una tarjeta blanca con sombra dentro de otra tarjeta blanca con sombra es
     barro: el anidado se hunde en vez de flotar. */
  :global([data-d='S']) .nest {
    background: var(--d-sunk);
    border-radius: var(--d-r);
    box-shadow: none;
  }
  :global([data-d='S']) .nest .d-panel-head { border-bottom-color: var(--d-edge); }
  /* La fila de plan ya flota con su propia luz teñida: la línea de abajo la
     ata al listado y deshace la separación que hace la sombra. */
  :global([data-d='S']) .plan-row { padding-block: var(--d-p1); border-bottom: 0; }
  :global([data-d='S']) .plans { padding-block: calc(var(--d-p1) / 2); }
  /* La ficha es la pieza grande de la celda y lleva el estado del equipo: su
     luz es proporcionalmente mayor, como la de un objeto más grande sobre la
     misma mesa. La primitiva la calibra para un panel cualquiera. */
  :global([data-d='S']) .aside-row .ficha[data-tone] {
    box-shadow: 0 var(--d-p2) calc(var(--d-p4) * 1.8) calc(-1 * var(--d-p2)) var(--tone-fg),
                var(--d-shadow-lg);
  }
  :global([data-d='S']) .ficha-meta { gap: var(--d-p2); }
  :global([data-d='S']) .sec-title { font-weight: var(--d-w-semi); }

  /* ======================================================================
     RESPONSIVE — hasta 380px. La celda manda, no la ventana: el contenedor
     es .root, así que una celda angosta se comporta igual esté sola o en
     una rejilla de ocho.
     ====================================================================== */
  @container (min-width: 520px) {
    .kpis { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .kpis--pair { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .aside-row { grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); align-items: start; }
    :global([data-d='F']) .kpis,
    :global([data-d='G']) .kpis { grid-template-columns: minmax(0, 1fr); }
    :global([data-d='F']) .aside-row,
    :global([data-d='G']) .aside-row { grid-template-columns: minmax(0, 1fr); }
    /* E paga su aire: con este padding, cuatro columnas parten las notas en
       dos palabras por línea. Aguanta en dos hasta que haya sitio de verdad. */
    :global([data-d='E']) .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    /* Las que se apilan en carriles o franjas: cuatro columnas las convierte
       otra vez en tarjetas y pierden la silueta entera. */
    :global([data-d='N']) .kpis,
    :global([data-d='P']) .kpis,
    :global([data-d='R']) .kpis { grid-template-columns: minmax(0, 1fr); }
    :global([data-d='N']) .aside-row,
    :global([data-d='P']) .aside-row { grid-template-columns: minmax(0, 1fr); }
    /* K, L y M pagan lo mismo que E: halo, guijarro y bruma necesitan aire
       alrededor o los resplandores y las manchas se pisan entre vecinos. */
    :global([data-d='K']) .kpis,
    :global([data-d='L']) .kpis,
    :global([data-d='M']) .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    /* El raíl de 152px vuelve donde hay ancho de verdad: la ficha ocupa toda
       la franja en P, así que la columna de etiquetas cabe sin ahogar el dato. */
    :global([data-d='P']) .ficha-meta > .d-rail {
      grid-template-columns: var(--d-rail) minmax(0, 1fr);
      gap: 0 var(--d-p3);
      align-items: baseline;
    }
    :global([data-d='P']) .ficha-meta > .d-rail > .d-cap { text-align: right; }
  }
  @container (min-width: 800px) {
    :global([data-d='E']) .kpis { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    :global([data-d='E']) .kpis--pair { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    :global([data-d='K']) .kpis,
    :global([data-d='L']) .kpis,
    :global([data-d='M']) .kpis { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    :global([data-d='K']) .kpis--pair,
    :global([data-d='L']) .kpis--pair,
    :global([data-d='M']) .kpis--pair { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  /* El raíl de P no se aplica a ciegas: por debajo de este ancho la cifra deja
     de tener sus 152px y la franja se pliega a una sola columna. Es exactamente
     la razón por la que se había retirado del contrato. */
  @container (max-width: 439px) {
    :global([data-d='P']) .kpi { grid-template-columns: minmax(0, 1fr); }
    :global([data-d='P']) .kpi-fig {
      grid-column: 1; grid-row: 1; justify-self: start; text-align: left;
    }
    :global([data-d='P']) .kpi-lab { grid-column: 1; grid-row: 2; }
    :global([data-d='P']) .kpi-note { grid-column: 1; grid-row: 3; }
    :global([data-d='P']) .kpi-tag { grid-column: 1; grid-row: 4; }
    :global([data-d='P']) .sec-head { grid-template-columns: minmax(0, 1fr); }
    :global([data-d='P']) .sec-title { text-align: left; }
  }
  @container (max-width: 359px) {
    .kpis { grid-template-columns: minmax(0, 1fr); }
    /* En R la nota y la cifra ya no caben en el mismo renglón de 26px. */
    :global([data-d='R']) .kpi { grid-template-columns: minmax(0, 1fr) auto; }
    :global([data-d='R']) .kpi-note { grid-column: 1 / -1; grid-row: 2; }
    :global([data-d='R']) .kpi-fig { grid-column: 2; grid-row: 1; }
    :global([data-d='R']) .kpi-tag { grid-row: 3; }
  }
  /* El raíl de G se pliega con el mismo umbral que usa la primitiva. */
  @media (max-width: 720px) {
    :global([data-d='G']) .callout { grid-template-columns: minmax(0, 1fr); }
    :global([data-d='G']) .callout-kicker { text-align: left; }
    :global([data-d='G']) .kpi-lab { text-align: left; }
    :global([data-d='G']) .sec-title { text-align: left; }
  }
  @media (prefers-reduced-motion: reduce) {
    .kpi { transition: none; }
    :global([data-d='A']) .kpi:hover { transform: none; }
    :global([data-d='O']) .kpi:hover,
    :global([data-d='S']) .kpi:hover,
    :global([data-d='S']) .kpi.on { transform: none; }
    :global([data-d='J']) .kpi::after,
    :global([data-d='M']) .kpi::before,
    :global([data-d='Q']) .kpi::after { transition: none; }
  }
</style>
