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
    <Direction id={d.id} flush={d.id === 'G' || d.id === 'F'}>
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
  }
  @container (min-width: 800px) {
    :global([data-d='E']) .kpis { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    :global([data-d='E']) .kpis--pair { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @container (max-width: 359px) {
    .kpis { grid-template-columns: minmax(0, 1fr); }
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
  }
</style>
