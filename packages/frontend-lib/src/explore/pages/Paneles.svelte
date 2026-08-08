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
  const CAM = ASSETS[2]; // Camión Hino 300 — corriendo hacia los 10 000 km
  const COM = ASSETS[4]; // Compactadora Wacker DPU-6555 — nunca medida
  const GEN = ASSETS[5]; // Generador Kohler 60REOZK
  const TAREAS = PLANS.slice(0, 3);
  const LECTURAS = [BAT, GEN];
  const TOTAL = KPIS[0].value + KPIS[1].value + KPIS[2].value + KPIS[3].value;
  // Hoy hay 8 vencidos y la nota de demo.js dice "3 más que ayer": ayer eran 5.
  // Aritmética sobre el dato real, no una cifra decorativa.
  const AYER = KPIS[0].value - 3;

  // Una sola selección compartida por las ocho celdas: al elegir un KPI se ve
  // de un golpe cómo dibuja cada dirección el estado "seleccionado".
  let foco = KPIS[0].label;

  // X · COTA. Las dos lecturas de la flota que corren hacia su tope y todavía
  // no lo alcanzaron. La cifra y el porcentaje salen de demo.js, el tope sale
  // del plan del equipo, y la resta está hecha una sola vez acá para que nadie
  // tenga que hacerla en la cabeza con la máquina enfrente:
  //   GEN-02  2 430 de 3 000 h  ->  faltan 570 h    (2 430 / 3 000 = 81 %)
  //   CAM-03  7 210 de 10 000 km -> faltan 2 790 km (7 210 / 10 000 = 72 %)
  // La tercera medida de la celda, la única que se pasó, vive en la ficha de
  // BAT-014, que es de quién habla esta pantalla.
  const COTAS = [
    {
      code: GEN.code, task: PLANS[4].task, fig: '2 430', unit: 'h',
      pct: GEN.pct, tone: GEN.tone, note: 'tope 3 000 h · faltan 570 h'
    },
    {
      code: CAM.code, task: PLANS[2].task, fig: '7 210', unit: 'km',
      pct: CAM.pct, tone: CAM.tone, note: 'tope 10 000 km · faltan 2 790 km'
    }
  ];
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
              <!-- --kpi-pct es DATO, no silueta: qué parte de los 88 equipos es
                   esta cifra. Va en el marcado por la misma razón que --cota en
                   la celda de X, para que una dirección que quiera dibujar la
                   proporción no tenga que recalcularla. Las que no la usan no
                   pagan nada: una custom property sin consumidor no hace nada. -->
              <button
                type="button"
                class="kpi d-rail"
                class:on={foco === k.label}
                aria-pressed={foco === k.label}
                data-tone={k.tone}
                style="--kpi-pct:{Math.round((k.value / TOTAL) * 100)}"
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
                <span class="kpi-tag d-num">+3</span>
                <span class="kpi-note d-num">ayer eran {AYER}</span>
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
              <!-- La casilla de la cifra nunca se queda en blanco ni con una
                   raya: dice qué pasó. "nunca" ocupa el mismo sitio que ocuparía
                   el número y contesta la pregunta del rótulo, que es cuántas
                   horas lleva la máquina. -->
              <span class="kpi-body">
                <span class="kpi-fig">{COM.reading}</span>
                <span class="kpi-tag">{COM.state}</span>
                <span class="kpi-note">{COM.name}</span>
              </span>
            </button>
          </div>

          <!-- X · LA COTA: AVANCE CONTRA TOPE -----------------------------
               Solo X. Las otras diecinueve direcciones se quedan exactamente
               con el contenido que ya tenían, así que la comparación entre
               ellas sigue siendo la misma de siempre.

               Va acá y no en la tira de recuentos de arriba porque acá hay
               tope: 2 430 h corriendo hacia las 3 000 del refrigerante y
               7 210 km corriendo hacia los 10 000 del servicio.

               Las dos tiras de arriba no la llevan, y por dos razones
               distintas. "8 vencidos" es un censo: no corre hacia ningún tope,
               y una cota sin marca es una barra de progreso. COM-07 sí tiene
               tope, cada 200 h, pero nunca se midió: un riel vacío no es una
               medida, es una casilla sin llenar, y la palabra "nunca" en el
               sitio de la cifra contesta mejor. -->
          {#if d.id === 'X'}
            <div class="cotas">
              {#each COTAS as c (c.code)}
                <div class="cota-kpi">
                  <p class="cota-lab">
                    <span class="d-id">{c.code}</span>
                    <span class="cota-task">{c.task}</span>
                  </p>
                  <div class="d-cota" data-tone={c.tone} style="--cota:{c.pct}">
                    <div class="d-cota-fig"><b>{c.fig}</b> <span>{c.unit}</span></div>
                    <div class="d-cota-rail"><i class="d-cota-fill"></i><i class="d-cota-tick"></i></div>
                    <div class="d-cota-note">{c.note}</div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
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
                  <dd>{BAT.plan}, {PLANS[0].every}. {PLANS[0].when}.</dd>
                </div>
                <div class="d-rail">
                  <dt class="d-cap">Última lectura</dt>
                  <!-- X · LA COTA, DONDE LA MEDIDA SE PASÓ DEL TOPE.
                       "312 h" solo no dice nada. Con la marca de las 250 h del
                       plan atrás, dice que se pasó, y el riel sigue hasta el
                       150 % para que las 62 h de sobrepaso tengan dónde verse.
                       Es la única cifra roja de la celda. -->
                  {#if d.id === 'X'}
                    <dd>
                      <div class="d-cota" data-tone={BAT.tone} style="--cota:{BAT.pct}">
                        <div class="d-cota-fig"><b>312</b> <span>h</span></div>
                        <div class="d-cota-rail"><i class="d-cota-fill"></i><i class="d-cota-tick"></i></div>
                        <div class="d-cota-note">tope 250 h · se pasó 62 h · leída 2 ago</div>
                      </div>
                    </dd>
                  {:else}
                    <dd class="d-num">{BAT.reading}</dd>
                  {/if}
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
            <!-- El único epígrafe que queda en pie en toda la página. Sobrevive
                 porque clasifica algo que el titular no dice: lo que sigue no es
                 una medición, es un supuesto. -->
            <p class="callout-kicker d-cap">
              <svg class="mk" viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf('info')}</svg>
              <span>Estimado</span>
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
            <span class="head-meta d-num">{TAREAS.length} de {PLANS.length} tareas</span>
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
              </header>
              <ul class="plans">
                {#each LECTURAS as a (a.code)}
                  <li class="d-row plan-row" data-tone={a.tone}>
                    <span class="plan-task">
                      <span class="d-id">{a.code}</span>
                      <span class="plan-name d-num">{a.reading}</span>
                    </span>
                    <span class="plan-src">{a.source}</span>
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

  /* ----------------------------------------------------------------------
     LA VERSALITA SE RETIRA.

     Esta era la página con más versalitas del catálogo: seis rótulos de KPI,
     tres de la ficha, dos de origen, el recuento de la cabecera y el aviso.
     Trece marcas de agua compitiendo por el mismo tono de voz, que es
     exactamente el ritmo templado que delata una plantilla.

     El rótulo de un KPI sí es información: no se borra, se degrada a palabra.
     Vuelve a caja normal, sube de 10-11px a --d-t-sm y toma tinta secundaria,
     así el orden de lectura pasa a ser palabra, cifra, nota, sin que nada
     dependa de descifrar una línea de mayúsculas espaciadas.

     Dos excepciones, ambas del contrato y no del gusto:
       B declara en su ficha de dirección que las etiquetas van en versalitas.
         Ahí la versalita es la marca grabada del instrumento, no un epígrafe.
       C ya trae --d-label-case: none, así que su rótulo nunca fue versalita.
     ---------------------------------------------------------------------- */
  :global([data-d='A']) .kpi-lab, :global([data-d='A']) .ficha-meta dt,
  :global([data-d='I']) .kpi-lab, :global([data-d='I']) .ficha-meta dt,
  :global([data-d='O']) .kpi-lab, :global([data-d='O']) .ficha-meta dt,
  :global([data-d='M']) .kpi-lab, :global([data-d='M']) .ficha-meta dt,
  :global([data-d='T']) .kpi-lab, :global([data-d='T']) .ficha-meta dt,
  :global([data-d='W']) .kpi-lab, :global([data-d='W']) .ficha-meta dt {
    font-size: var(--d-t-sm);
    font-weight: var(--d-w-med);
    letter-spacing: 0;
    text-transform: none;
    color: var(--d-ink-2);
  }

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
  /* El recuento de la cabecera y el origen de una lectura son DATOS, no
     rótulos: leídos en versalitas de 10px con tracking abierto tardan más que
     el texto que acompañan. Bajan a texto normal y suben de tamaño. */
  .head-meta { font-size: var(--d-t-xs); color: var(--d-ink-3); white-space: nowrap; }
  .plan-task {
    display: flex; align-items: baseline;
    row-gap: calc(var(--d-p1) * .5); column-gap: var(--d-p2);
    flex: 1 1 150px; min-width: 0; flex-wrap: wrap;
  }
  .plan-name { font-size: var(--d-t-sm); overflow-wrap: anywhere; }
  .plan-src { white-space: nowrap; font-size: var(--d-t-xs); color: var(--d-ink-3); }
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
     A · ELEVACIÓN — la incumbente, y la que llegaba peor calibrada.

     Su tesis es que la altura significa algo. Hasta ahora las seis cifras,
     la ficha y el anidado flotaban todos a --d-shadow-lg: cuando todo está
     a la misma altura, la elevación deja de informar y queda como textura.

     Acá la altura ES la jerarquía y ES el estado. En reposo la cifra apoya
     sobre el fondo; el puntero la levanta; la elegida se queda arriba. El
     anillo de tono confirma lo que la altura ya dijo, no lo sustituye, así
     que el filtro puesto se reconoce en el perfil de la celda antes de leer
     una palabra o distinguir un color.
     ====================================================================== */
  :global([data-d='A']) .kpi { border-color: transparent; box-shadow: var(--d-shadow); }
  :global([data-d='A']) .kpi:hover {
    transform: translateY(calc(var(--d-p1) / -4));
    box-shadow: var(--d-shadow-lg);
  }
  :global([data-d='A']) .kpi.on {
    transform: translateY(calc(var(--d-p1) / -3));
    box-shadow: var(--d-shadow-lg), 0 0 0 calc(var(--d-bw) * 2) var(--tone-fg);
  }
  :global([data-d='A']) .kpi.on .kpi-lab { font-weight: var(--d-w-bold); color: var(--d-ink); }
  /* Las dos piezas grandes de la celda son las que más alto vuelan. */
  :global([data-d='A']) .ficha,
  :global([data-d='A']) .plan { border-color: transparent; box-shadow: var(--d-shadow-lg); }
  :global([data-d='A']) .callout { border-color: transparent; box-shadow: var(--d-shadow); }
  /* Dentro de una tarjeta, otra tarjeta que flota MÁS que la que la sostiene
     es física al revés. El anidado baja un escalón de sombra y otro de radio:
     concéntrico de verdad, no dos cajas del mismo tamaño de esquina. */
  :global([data-d='A']) .nest {
    border-color: transparent;
    box-shadow: var(--d-shadow);
    border-radius: var(--d-r);
  }
  :global([data-d='A']) .sec-head { padding-bottom: var(--d-p2); }

  /* ======================================================================
     B · INSTRUMENTO — la tira es UN marco continuo: las celdas comparten
     el filo de 1px en vez de separarse, y el marco lleva marcas de esquina.
     ====================================================================== */
  /* Un instrumento no se mueve al mirarlo: la transición se corta entera. */
  /* LA CIFRA VA EN MONOESPACIADA. Es la única dirección de densidad de cabina
     y en una cabina los números se comparan uno debajo del otro: si el 8 y el
     62 no ocupan el mismo ancho por dígito, la columna deja de ser columna.
     Baja de --d-t-2xl a --d-t-xl porque la mono es más ancha por carácter y a
     28px la celda de 30px de fila se desarma. */
  /* La fila del plan vuelve a los 30px del contrato: el relleno vertical extra
     la estiraba a 36 y deshacía la única densidad real del catálogo. */
  /* LA FICHA ES UNA TABLA, NO TRES PÁRRAFOS. Rótulo y valor comparten columna
     entre las tres filas, así que los tres valores arrancan alineados y el ojo
     baja por una sola vertical. `display: contents` disuelve cada .d-rail para
     que las seis celdas caigan en la MISMA rejilla; una rejilla por fila
     alinearía cada fila con la longitud de su propio rótulo, que es no
     alinear nada. */
  /* La última corrida cierra contra el filo del pie: dos líneas a un pelo una
     de otra son un error de dibujo, no un cierre. */
  /* La franja llena invierte el texto; la marca seguía en color de tono y se
     perdía contra el fondo. Toma la misma tinta que la etiqueta. */
  /* El anidado no flota: comparte los cantos laterales de su contenedor. */
  /* El pie tampoco es "tres botones sueltos": es un marco con divisiones. */

  /* ======================================================================
     C · MARCA — el color identifica el bloque; no lo decora.

     Esa frase es la ficha de la dirección y era justo lo que la celda no
     cumplía: nueve barras de teal lleno por pantalla (cuatro cifras, dos
     variantes, ficha, plan, anidado, aviso) convierten el color de marca en
     papel pintado. Cuando todo es teal, el teal no identifica nada.

     Acá el teal tiene tres volúmenes y cada uno significa algo distinto:
       lleno       el contenedor se anuncia (ficha y plan) y la cifra ACTIVA
       tinte pálido las cifras en reposo y el anidado, que es un nivel abajo
       tinta       titulares y rótulos sobre papel
     Así el bloque de color más fuerte de la celda está diciendo cuál es el
     filtro puesto, en vez de repetir nueve veces quién fabrica el software.
     ====================================================================== */
  :global([data-d='C']) .kpi { padding: 0; gap: 0; overflow: hidden; }
  :global([data-d='C']) .kpi-lab {
    background: var(--d-accent-soft); color: var(--d-brand);
    border-bottom: max(var(--d-bw), 1px) solid var(--d-accent-edge);
    padding: var(--d-p1) var(--d-p2);
  }
  :global([data-d='C']) .kpi-lab .mk { color: var(--d-brand); }
  :global([data-d='C']) .kpi-body { margin-top: 0; padding: var(--d-p2) var(--d-p2) var(--d-p3); }
  :global([data-d='C']) .kpi.on { border-color: var(--d-brand); box-shadow: var(--d-shadow-lg); }
  /* El teal lleno aparece UNA vez en la tira, y aparece donde hay una decisión
     tomada. Tinta de marca sobre tinte pálido y tinta clara sobre teal lleno:
     las dos combinaciones pasan AA con holgura. */
  :global([data-d='C']) .kpi.on .kpi-lab {
    background: var(--d-brand); color: var(--d-brand-ink);
    border-bottom-color: var(--d-brand);
    font-weight: var(--d-w-bold);
  }
  :global([data-d='C']) .kpi.on .kpi-lab .mk { color: var(--d-brand-ink); }
  :global([data-d='C']) .sec-title { color: var(--d-brand); }
  :global([data-d='C']) .sec-head {
    border-bottom: max(var(--d-bw), 1px) solid var(--d-accent-edge); padding-bottom: var(--d-p1);
  }
  /* Dos cabeceras de teal lleno apiladas se leen como dos bloques hermanos,
     no como uno DENTRO de otro. El anidado baja de volumen: mismo color,
     menos peso. El color pasa a codificar profundidad. */
  :global([data-d='C']) .nest > .d-panel-head {
    background: var(--d-accent-soft);
    border-bottom: max(var(--d-bw), 1px) solid var(--d-accent-edge);
  }
  :global([data-d='C']) .nest > .d-panel-head .d-panel-title { color: var(--d-brand); }
  :global([data-d='C']) .callout { background: var(--d-surface); border-color: var(--d-line); padding: 0; }
  /* El tono de aviso en C es el mismo teal que la marca, así que una barra
     llena acá sería una décima cabecera de marca. Se queda en el tinte. */
  :global([data-d='C']) .callout-kicker {
    background: var(--tone-band); color: var(--tone-fg);
    border-bottom: max(var(--d-bw), 1px) solid var(--tone-edge);
    padding: var(--d-p1) var(--d-p3);
  }
  :global([data-d='C']) .callout-txt { padding: 0 var(--d-p3) var(--d-p3); }
  /* La cabecera del plan sigue siendo teal lleno: el recuento va en tinta
     clara o se pierde teal sobre teal. */
  :global([data-d='C']) .d-panel-head .head-meta { color: var(--d-brand-ink); }

  /* ======================================================================
     D · PESO — la cifra ocupa la celda a 800, la etiqueta es una franja de
     tono con filo negro, y el bloque se mueve hacia su sombra al presionar.
     ====================================================================== */
  /* En D todas las marcas son tinta negra: sobre la franja negra del KPI
     activo quedaban invisibles. Se invierten con la etiqueta. */
  /* Anidado: el bloque de adentro conserva su propia masa y su propia sombra. */

  /* ======================================================================
     E · AIRE — cero bordes en toda la celda. La cifra es enorme y ligera,
     y la separación la hace el espacio, nunca una línea.
     ====================================================================== */

  /* ======================================================================
     F · TERMINAL — cada KPI es una línea de dos renglones: etiqueta con
     guía de puntos, cifra en una casilla de color, y la nota colgando.
     ====================================================================== */

  /* ======================================================================
     G · BANDA — ninguna caja. Franjas a sangre, raíl de etiquetas a la
     izquierda, y el estado como franja de 3px en el canto izquierdo.
     ====================================================================== */
  /* En el raíl la etiqueta es un bloque alineado a la derecha: si envuelve en
     dos líneas, la marca sigue pegada al texto y no se queda sola al margen.
     La marca vuelve a ser inline — base.css la deja en block y en un bloque
     alineado a la derecha se caería sola a su propio renglón. */
  /* El anidado sigue siendo una franja: no se encoge dentro de su contenedor. */

  /* ======================================================================
     H · FICHA — la etiqueta es una PESTAÑA que sobresale arriba, la ficha
     lleva canto apilado abajo y el encabezado va bajo regla doble.
     ====================================================================== */

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
  /* EL VIDRIO SE ESPESA. I tiene tres opacidades de blanco y estaban usadas al
     revés: la celda apuntada bajaba a --d-sunk (30 %) y quedaba MÁS translúcida
     que en reposo, o sea que apuntar apagaba la celda. La escala real es
     sunk 30 < surface 56 < line 68, así que el gesto correcto es subir por
     ella: apoyada transparente, apuntada opaca, elegida la lámina más gruesa
     que la dirección tiene. */
  :global([data-d='I']) .kpi:hover { background: var(--d-surface); }
  :global([data-d='I']) .kpi.on {
    background: var(--d-line);
    box-shadow: inset 0 var(--d-bw) 0 var(--d-line),
                inset 0 0 0 calc(var(--d-bw) * 2) var(--tone-edge);
  }
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
  /* El barrido es un pseudo posicionado: sin esto pintaría ENCIMA del contenido
     en línea del botón. El texto sube a su propia capa. */

  /* ======================================================================
     K · HALO — cero bordes y cero rellenos sólidos. Un KPI existe porque
     irradia: anillo de 1px en su propio tono y resplandor difuso hacia
     afuera. El estado es el COLOR DE LA LUZ, no un relleno detrás del texto.
     ====================================================================== */
  /* Seleccionado: irradia más y desde más cerca. El grosor del anillo cambia
     además del color, para que el estado no dependa solo del tono. */
  /* El bloom del texto: apenas perceptible, pero es lo que hace que la cifra
     parezca emitir en vez de estar impresa. */
  /* El anidado no vuelve a irradiar hacia afuera —dos halos concéntricos se
     leen como una mancha—: se ilumina hacia adentro. */

  /* ======================================================================
     L · GUIJARRO — cuatro radios distintos por contenedor Y distintos entre
     vecinos. Si los cuatro KPIs comparten la misma cuaterna vuelven a ser
     tarjetas puestas en fila.

     HALLAZGO: L solo declara dos cuaternas (--d-r y --d-r-lg) y la dirección
     exige que ningún vecino repita. Las demás se componen permutando
     --d-p1..--d-p4, que son cuatro valores distintos entre sí; el contrato
     debería traer --d-r-a/b/c/d en vez de obligar a la página a improvisar.
     ====================================================================== */
  /* El guijarro se asienta sobre la mesa en vez de hundirse en ella. */
  /* Cuatro radios propios: si heredara los de .d-panel sería el mismo canto
     rodado que la ficha de al lado. */

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
    opacity: .34;
    pointer-events: none;
    z-index: -1;
    transition: opacity 160ms ease;
  }
  /* La mancha es lo ÚNICO que agrupa en esta dirección, así que también tiene
     que ser lo único que marca la selección. Con .5 contra 1 la diferencia
     entre puesta y sin poner era medio tono de niebla; con .34 contra 1 la
     mancha elegida aterriza y las otras cinco se quedan en el papel. */
  :global([data-d='M']) .kpi.on::before { opacity: 1; }
  :global([data-d='M']) .kpi.on .kpi-lab { color: var(--d-ink); font-weight: var(--d-w-bold); }
  :global([data-d='M']) .kpi.on .kpi-note { color: var(--d-ink-2); }
  /* Seis manchas de 28px de desenfoque a 26px de separación se tocan entre
     vecinas y el conjunto vuelve a leerse como una sola nube. Bruma paga su
     falta de contenedor en aire, igual que E y K. */
  :global([data-d='M']) .kpis { gap: calc(var(--d-gap) * 1.4); }
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
  /* El solape. Sin z-index los carriles se apilan al revés de como se leen. */
  /* El carril elegido sube al tope de la pila y se monta sobre los dos vecinos. */

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
    font-weight: var(--d-w-semi);
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
     se duplica. Sigue siendo capa translúcida, nunca barra opaca.

     EL ANILLO ES DE TONO, NO DE MARCA. Es la prueba que O tiene que pasar:
     tres colores conviviendo sin ensuciarse. La marca dice QUÉ es el bloque y
     vive en la cabecera; el tono dice CÓMO está y vive en el filo y en la
     cifra. Con el anillo también teal, los dos colores dirían lo mismo dos
     veces y la mezcla no demostraría nada. */
  :global([data-d='O']) .kpi.on {
    background: var(--d-line);
    box-shadow: var(--d-shadow-lg), 0 0 0 calc(var(--d-bw) * 2) var(--tone-edge);
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
  /* El segmento primario se tiñe de marca en vez de volverse una placa opaca.
     Iba en --d-accent-soft (14 %) y contra el vidrio blanco del segmento vecino
     el vidrio ganaba: la acción principal era la que MENOS se veía del pie.
     Sube al tinte saturado, que sigue dejando pasar el campo pero ya es
     claramente el bloque de color de la barra. Tinta oscura de marca encima:
     7,8:1, muy por encima de AA. */
  :global([data-d='O']) .d-panel-foot .d-btn--primary {
    background: var(--d-accent-edge);
    color: var(--d-brand-ink);
    font-weight: var(--d-w-bold);
  }
  :global([data-d='O']) .d-panel-foot .d-btn--primary:hover {
    background: var(--d-accent-edge);
    box-shadow: inset 0 0 0 max(var(--d-bw), 1px) var(--d-accent);
  }
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
  /* El tinte de marca también se atenúa un nivel al anidar, por la misma razón
     que en C: dos cabeceras teñidas igual son hermanas, no madre e hija. */
  :global([data-d='O']) .nest > .d-panel-head {
    background: linear-gradient(180deg, var(--d-accent-soft), transparent);
    border-bottom-color: var(--d-accent-soft);
  }
  :global([data-d='O']) .d-panel-head .head-meta { color: var(--d-brand-ink); }

  /* ======================================================================
     P · ESPINA — una columna de marca a la izquierda de la que cuelga todo.
     Cada bloque dibuja su propio tramo a x=0, así que la celda entera lee
     como UNA columna continua; el estado no pinta fondo, muerde la espina.

     EL RAÍL DE 152px VUELVE, pero solo donde hay ancho de verdad: la franja
     del KPI y la cabecera de sección ocupan la celda entera. Y vuelve del
     lado contrario al de Banda —acá el raíl lleva la CIFRA, no la etiqueta—,
     para que la mezcla C+G no termine siendo G con otro color.
     ====================================================================== */
  /* La muesca: el tono muerde la espina en vez de teñir la franja. */
  /* La cifra ocupa el raíl, pegada contra la espina. */

  /* ======================================================================
     Q · CHAROL — masa dura con superficie mojada. Borde de 2px, sombra
     sólida desplazada y el charol encima: la cifra es un bloque macizo
     recién pintado. Al presionar, el bloque entra en su sombra y el brillo
     se apaga — se moja y se hunde a la vez.
     ====================================================================== */
  /* El charol es un pseudo posicionado: el contenido tiene que subir a su capa
     o el barrido le pasa por encima al texto. */
  /* Franja negra: la marca, que en Q es tinta, quedaba invisible. Se invierte. */

  /* ======================================================================
     R · VITRINA — la más densa de las diecinueve. Una sola lámina de vidrio
     oscuro y, dentro, filas de 26px monoespaciadas: etiqueta, nota y cifra
     en UN renglón (Terminal usa dos). El tono es una barra encendida en el
     canto derecho, del lado contrario al de Banda.
     ====================================================================== */
  /* Renglón de 26px: la etiqueta no puede envolver o la fila deja de ser densa
     y pasa a ser dos filas. Se recorta, que es lo que hace una consola. */
  /* La fila elegida se enciende por dentro: la luz entra por el canto izquierdo
     y el vidrio de esa banda se aclara. */
  /* Vidrio dentro de vidrio: el anidado no vuelve a desenfocar. */

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
  /* Seleccionado: la luz se acerca y crece. El peso de la etiqueta y la
     elevación cambian con ella, para que el estado no sea solo color. */
  /* La etiqueta tampoco se rellena de tono: se apoya en su propia luz. */
  /* El aviso deja de ser una banda de color y pasa a ser una tarjeta blanca
     con luz de información abajo. Es el mismo dato, sin teñir el texto. */
  /* Una tarjeta blanca con sombra dentro de otra tarjeta blanca con sombra es
     barro: el anidado se hunde en vez de flotar. */
  /* La fila de plan ya flota con su propia luz teñida: la línea de abajo la
     ata al listado y deshace la separación que hace la sombra. */
  /* La ficha es la pieza grande de la celda y lleva el estado del equipo: su
     luz es proporcionalmente mayor, como la de un objeto más grande sobre la
     misma mesa. La primitiva la calibra para un panel cualquiera. */

  /* ======================================================================
     T · HALO CLARO — la dirección nueva, y la que no tenía ni una regla.

     Conserva la de Halo entera: nada tiene borde ni relleno sólido, y una
     cosa existe porque IRRADIA. Lo único que cambia es de qué lado está la
     luz. Sobre papel, un anillo de 1px del propio tono más un halo proyectado
     hacia afuera.

     DÓNDE SE SEPARA DE UMBRA, que es la vecina peligrosa: en S la tarjeta es
     una tarjeta blanca, opaca, y la sombra teñida es un dato que se le añade.
     Acá la celda en reposo no tiene fondo propio: es papel, y lo único que la
     delimita son el anillo y el halo. Al elegirla el papel se levanta a blanco
     y el anillo engorda al doble, así que la selección se reconoce por FORMA
     antes que por color: sirve igual para quien no distingue el rojo del
     ámbar y para quien mira la pantalla al sol.

     EL BLOOM DE TEXTO DE HALO NO CRUZA. Sobre negro una cifra clara emite de
     verdad; sobre papel, un resplandor detrás de tinta oscura solo la
     emborrona. Acá la luz la proyecta el objeto, nunca la letra.
     ====================================================================== */
  :global([data-d='T']) .kpi {
    background: transparent;
    border: 0;
    box-shadow: 0 0 0 max(var(--d-bw), 1px) var(--tone-edge),
                0 var(--d-p1) calc(var(--d-p4) * 1.6) calc(-1 * var(--d-p2)) var(--tone-fg);
  }
  :global([data-d='T']) .kpi:hover {
    background: var(--d-surface);
    box-shadow: 0 0 0 max(var(--d-bw), 1px) var(--tone-fg),
                0 var(--d-p2) calc(var(--d-p4) * 1.9) calc(-1 * var(--d-p2)) var(--tone-fg);
  }
  :global([data-d='T']) .kpi.on {
    background: var(--d-surface);
    box-shadow: 0 0 0 max(var(--d-bw), 2px) var(--tone-fg),
                0 var(--d-p2) calc(var(--d-p4) * 2.2) calc(-1 * var(--d-p1)) var(--tone-fg);
  }
  :global([data-d='T']) .kpi.on .kpi-lab { color: var(--d-ink); font-weight: var(--d-w-bold); }
  /* La etiqueta de dato ausente tampoco se rellena: se apoya en su propio
     anillo. Tinta de tono sobre papel, que es donde el AA sale holgado. */
  :global([data-d='T']) .kpi-tag {
    background: transparent;
    border: 0;
    color: var(--tone-fg);
    box-shadow: 0 0 0 max(var(--d-bw), 1px) var(--tone-edge),
                0 calc(var(--d-p1) / 2) var(--d-p2) calc(var(--d-p1) / -2) var(--tone-fg);
  }
  :global([data-d='T']) .callout {
    background: transparent;
    border: 0;
    box-shadow: 0 0 0 max(var(--d-bw), 1px) var(--tone-edge),
                0 var(--d-p1) calc(var(--d-p4) * 1.6) calc(-1 * var(--d-p2)) var(--tone-fg);
  }
  /* Sin bordes quiere decir sin bordes. La primitiva deja hairlines de cortesía
     en cabecera, pie y fila; acá se retiran y la separación pasa a ser aire,
     que es lo que la dirección declara. */
  :global([data-d='T']) .ficha > .d-panel-head,
  :global([data-d='T']) .nest > .d-panel-head { border-bottom: 0; padding-bottom: 0; }
  :global([data-d='T']) .plan > .d-panel-head { border-bottom: 0; padding-bottom: var(--d-p1); }
  :global([data-d='T']) .d-panel-foot { border-top: 0; padding-top: var(--d-p3); }
  :global([data-d='T']) .sec-head { padding-bottom: var(--d-p2); }
  :global([data-d='T']) .ficha-meta { gap: var(--d-p2); }
  /* Cada tarea del plan ya flota con su propio anillo y su propia luz: la línea
     de abajo la ataba al listado y deshacía justo esa separación. El listado
     recupera el margen que los halos necesitan para no cortarse contra el
     canto del panel. */
  :global([data-d='T']) .plan-row { border-bottom: 0; padding-inline: var(--d-p2); }
  :global([data-d='T']) .plans { padding: var(--d-p1) var(--d-p3); }
  /* Dos halos concéntricos se leen como una mancha, no como dos cosas. El
     anidado deja de irradiar hacia afuera y se ilumina hacia adentro: es la
     misma regla que en K, del otro lado de la luz. */
  :global([data-d='T']) .nest {
    background: transparent;
    border-radius: var(--d-r);
    box-shadow: inset 0 0 0 max(var(--d-bw), 1px) var(--d-accent-edge);
  }

  /* ======================================================================
     W · CRISTAL TEMPLADO. Cristal con las tres correcciones puestas.

     Esta familia se ordena por MATERIAL, y en W el material tiene TRES
     niveles, no uno. Esa es la diferencia entera con Cristal, que solo tenía
     «vidrio» y «vidrio otra vez»:

       LOSA     .ficha y .plan. Vidrio de verdad: desenfoque, sombra larga y el
                doble bisel que el contrato le pone a todo .d-panel. Es una
                pieza que se levantaría de la mesa.
       LÁMINA   el mosaico de cifras. Mismo vidrio, pero es UNA superficie
                continua de lectura y no una pieza apoyada sobre otra pieza:
                lleva el realce especular que --d-shadow ya trae y NO un
                segundo anillo interior. El doble bisel es la firma de la losa;
                repetirlo acá lo gasta y deja de querer decir «pieza».
       REGIÓN   las seis celdas y el panel anidado. Sin desenfoque propio, sin
                sombra y sin bisel: son zonas de la superficie que las
                contiene, y su único dibujo es la junta de luz.

     Cristal ponía cada cifra a flotar por su cuenta. Seis objetos flotantes en
     fila son la misma tabla de treinta objetos flotantes que la regla 2 de W
     manda aplanar, solo que más corta. Acá el mosaico es una lámina y las
     cifras viven adentro.

     Los rótulos de KPI y de la ficha entran en la retirada de versalitas de
     más arriba: W hereda de Cristal los mismos tokens de etiqueta (11px, caja
     alta, .08em) y con ellos esta celda llegaba a diez marcas de agua. Queda
     un solo epígrafe en pie, el «Estimado» del aviso, que es el único que
     clasifica algo que el titular no dice.

     HALLAZGO, el mismo que I, O y R ya tienen anotado unas líneas arriba: W
     desenfoca en directions.css con literales (blur 20px saturate 1.5) y no
     expone --d-blur ni --d-blur-sat, así que una página no puede igualar el
     vidrio de su propia dirección sin repetir el número a mano. Acá el radio
     sale de --d-p4, que es del mismo orden.
     ====================================================================== */
  :global([data-d='W']) .kpis {
    gap: 0;
    background: var(--d-surface);
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    overflow: hidden;
    backdrop-filter: blur(var(--d-p4)) saturate(1.5);
    -webkit-backdrop-filter: blur(var(--d-p4)) saturate(1.5);
  }
  /* LA JUNTA, Y POR QUÉ NO ES DE LUZ. Cristal divide con filos blancos: un
     inset de --d-line arriba de cada pieza. Sobre una lámina que ya es blanco
     al 60 %, blanco sobre blanco no divide nada, y probado en pantalla la
     junta clara sencillamente no estaba. W ya resolvió esto para sus filas y
     sus cabeceras, que se dividen con una línea OSCURA fina; el mosaico sigue
     esa gramática en vez de inventar otra. El brillo se queda donde sí tiene
     detrás algo más oscuro: el borde exterior y el realce especular.

     Va arriba y a la izquierda de CADA celda, y por eso la lámina queda bien
     dividida con cuatro columnas, con dos o con una, sin una regla por punto
     de quiebre: al plegarse, la misma junta pasa sola de dividir columnas a
     dividir filas. Contra el canto de la lámina cae bajo el borde y no agrega
     una segunda línea, así que el doble bisel sigue siendo de la losa.

     HALLAZGO: W escribe sus divisiones internas con literales
     (rgba(14,23,32,.09) en .d-row, .10 en .d-panel-head) y no las expone como
     token. La página usa --d-edge, que es lo más cercano que el contrato
     declara y pinta un punto más marcado. Falta un --d-divider. */
  :global([data-d='W']) .kpi {
    background: transparent;
    border: 0;
    border-radius: 0;
    box-shadow: inset var(--d-bw) 0 0 var(--d-edge),
                inset 0 var(--d-bw) 0 var(--d-edge);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }
  /* La cifra respira. A 35px sobre vidrio, pegada al rótulo, el bloque entero
     se lee como una mancha oscura antes que como un número. */
  :global([data-d='W']) .kpi-body { margin-top: var(--d-p2); }
  :global([data-d='W']) .kpi:hover { background: var(--d-sunk); }
  /* ELEGIDA: OPACA, Y TEÑIDA DE ACENTO. Es la regla de W puesta donde más se
     nota. La celda con la que estás filtrando la flota es justo la que menos
     puede tener un campo de color moviéndose por detrás, así que deja de ser
     vidrio y pasa a ser superficie sólida.

     El relleno no depende de la lámina: es blanco opaco con un velo de acento
     encima, así que se ve igual con el vidrio puesto, con el vidrio apagado en
     el teléfono y con transparencia reducida. Sin eso, el estado dependería de
     que dos capas de blanco se distingan, que es exactamente lo que deja de
     pasar en cuanto se apaga el desenfoque.

     Y el relleno NO se tiñe del tono de la celda. Cada celda ya lleva su tono
     en la marca y en la cifra; si además se rellenara de tono, no habría forma
     de saber si la roja está rellena por estar elegida o por estar vencida.
     Acento para el estado, tono para el dato, y no se cruzan.

     HALLAZGO: --d-overlay está declarado para «lo que flota». Una celda
     elegida no flota, pero es el único blanco opaco que W declara. Falta un
     --d-surface-solid, que es el vidrio hecho sólido para lo que se queda
     quieto; hoy la página tiene que pedirle prestado al token de los menús. */
  :global([data-d='W']) .kpi.on {
    background-color: var(--d-overlay);
    background-image: linear-gradient(var(--d-accent-soft), var(--d-accent-soft));
    color: var(--d-overlay-ink);
    box-shadow: inset 0 0 0 max(var(--d-bw), 2px) var(--d-accent);
  }
  :global([data-d='W']) .kpi.on .kpi-lab { color: var(--d-ink); font-weight: var(--d-w-bold); }
  /* EL HALO NO ENTRA EN EL MOSAICO, Y ES A PROPÓSITO. Dentro de una lámina que
     recorta, un resplandor hacia afuera se corta contra el canto: se vería un
     borrón detenido, no una alarma. El que flota es el mosaico entero, no la
     celda. La alarma la lleva el mismo filo de 3px que el contrato le pone a
     la fila crítica y a la ficha crítica, así que lo vencido tiene UN solo
     dibujo en toda la celda y se reconoce sin distinguir el rojo. El 3px sale
     de --d-bw para que siga el grosor de línea de la dirección en vez de ser
     un número suelto. */
  :global([data-d='W']) .kpi[data-tone='critical'] {
    box-shadow: inset calc(var(--d-bw) * 3) 0 0 var(--d-crit),
                inset var(--d-bw) 0 0 var(--d-edge),
                inset 0 var(--d-bw) 0 var(--d-edge);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }
  /* Elegida Y vencida. Las dos reglas de arriba pesan igual, así que sin esta
     la última escrita se comería a la otra y la celda perdería un estado. El
     filo se pinta antes que el anillo, o sea encima de él en el canto
     izquierdo: se leen los dos a la vez. */
  :global([data-d='W']) .kpi[data-tone='critical'].on {
    box-shadow: inset calc(var(--d-bw) * 3) 0 0 var(--d-crit),
                inset 0 0 0 max(var(--d-bw), 2px) var(--d-accent);
  }
  /* La lámina recorta: sin esto el anillo de foco se pierde bajo el overflow. */
  :global([data-d='W']) .kpi:focus-visible { outline-offset: calc(-1 * var(--d-p1)); }
  /* Cristal levanta sus titulares del campo con una sombra blanca de 1px. Acá
     no: sobre la mancha más oscura que W dibuja en el fondo, la tinta de
     titular saca 14:1, así que esa sombra no estaba resolviendo un problema de
     lectura, estaba disimulando el fondo. Es la regla 1 aplicada a la
     tipografía. */
  :global([data-d='W']) .sec-head { padding-bottom: var(--d-p1); }
  /* LA FICHA CRÍTICA RECUPERA SU MATERIAL. El contrato le da a
     .d-panel[data-tone='critical'] un box-shadow entero, así que la ficha se
     quedaba sin --d-shadow: sin elevación y sin el realce especular de arriba.
     La pieza que lleva el equipo vencido era la única de la celda que no se
     veía de vidrio. Vuelve el material y se conserva la alarma: filo, un
     resplandor corto y la sombra de vidrio, en ese orden de pintado. */
  :global([data-d='W']) .ficha[data-tone='critical'] {
    box-shadow: inset calc(var(--d-bw) * 3) 0 0 var(--d-crit),
                0 var(--d-p1) var(--d-p4) calc(-1 * var(--d-p2)) var(--d-crit),
                var(--d-shadow);
  }
  :global([data-d='W']) .ficha-meta { gap: var(--d-p2); }
  /* EL ANIDADO ES UNA REGIÓN, NO UNA SEGUNDA LOSA. Un backdrop-filter dentro
     de otro desenfoca dos veces el mismo punto del campo y el conjunto se
     enturbia; y una losa dentro de una losa pide un segundo doble bisel, que
     es la firma repetida a un centímetro de sí misma. Se queda sin relleno y
     sin sombra: lo delimitan una línea y un radio un escalón menor, que es lo
     que hace que un anidado se vea concéntrico y no como dos cajas del mismo
     tamaño de esquina.

     Y la línea es oscura, por lo mismo que la junta del mosaico: el filo
     blanco que .d-panel le presta sirve para separar una pieza del campo, no
     para dividir por dentro de una pieza que ya es blanca. Sale una regla
     sola para toda la celda, que es lo que hace que esto se lea como un
     material y no como una colección de trucos: EL BLANCO ES EL CANTO DE
     AFUERA, LA LÍNEA OSCURA ES LA DIVISIÓN DE ADENTRO.

     Y recorta. Las bandas de tono de W son opacas y llegan de canto a canto,
     así que la última fila del anidado sacaba dos esquinas cuadradas fuera del
     radio: la banda se salía de la caja. Recortar es seguro justo porque acá
     el crítico ya no irradia hacia afuera, solo lleva filo. */
  :global([data-d='W']) .nest {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: transparent;
    border-color: var(--d-edge);
    border-radius: var(--d-r);
    box-shadow: none;
    overflow: hidden;
  }
  :global([data-d='W']) .nest::after { display: none; }
  /* «Lecturas recibidas» no es una lista de urgencias: es la procedencia del
     dato. BAT-014 aparece ahí porque su lectura llegó, no porque venza, así
     que la fila conserva el filo, que dice de qué equipo se habla, y suelta el
     resplandor. Con el halo también acá, en la celda habría cinco cosas
     irradiando y ninguna urgiría, que es el defecto que W vino a corregir. */
  :global([data-d='W']) .nest .plan-row[data-tone='critical'] {
    box-shadow: inset calc(var(--d-bw) * 3) 0 0 var(--d-crit);
  }
  /* Dos resplandores concéntricos se leen como una mancha, no como dos cosas:
     misma regla que K y T aplican más arriba. En esta celda TODA píldora
     crítica vive dentro de algo que ya irradia, la ficha vencida y la fila
     vencida, así que suelta el halo y se queda con su banda opaca, su marca y
     su palabra, que es lo que informa. */
  :global([data-d='W']) .d-pill[data-tone='critical'] { box-shadow: none; }
  /* EL AVISO SE QUEDA PLANO Y OPACO, que es la frase de W dicha en un solo
     elemento: al lado de una losa de vidrio con sombra larga, una banda opaca
     sin sombra dice sola cuál de las dos cosas es material y cuál es texto. No
     lleva halo porque no urge, es un supuesto. Y baja un escalón de radio por
     la misma razón que el anidado: 22px es el canto de una pieza de vidrio, y
     esto no es una pieza. Una sola escala de radio, dos alturas. */
  :global([data-d='W']) .callout { border-radius: var(--d-r); }
  /* Los dos botones del pie llevan white-space: nowrap y el pie no envuelve:
     por debajo de unos 270px de columna se salen de la ficha. Envuelven, y
     siguen alineados a la derecha. */
  :global([data-d='W']) .d-panel-foot { flex-wrap: wrap; }

  /* ══════════════════════════════════════════════════════════════════════
     X · COTA. Papel mate y tinta, y el color reservado al estado.

     Esta familia es donde la dirección se juega entera, por dos razones.

     LA PRIMERA es la cifra grande. En las diecinueve anteriores la tira de
     recuentos sale a pantalla con cuatro cifras de cuatro colores: roja,
     ámbar, verde y gris. Ahí el color dejó de ser información y pasó a ser
     el modo normal de dibujar un número, así que cuando de verdad urge algo
     tiene que urgir contra otros tres colores que también gritan. En X la
     cifra es TINTA, y toma color en un solo sitio de toda la celda: los ocho
     vencidos, que es la única de las cuatro que ES un estado y no un
     recuento. Los 62 al día en verde y los 4 sin lectura en gris eran cromo
     disfrazado de dato.

     LA SEGUNDA es que acá hay medidas de verdad, y una medida sin su tope no
     se puede leer. La cota entra en dos sitios y en ninguno más: el par de
     lecturas que corren hacia su plan y la lectura de BAT-014, que se pasó.
     Los recuentos NO la llevan, porque un censo de máquinas no corre hacia
     ningún tope: pintarles un riel sería una barra de progreso decorativa,
     que es exactamente el ruido que esta dirección vino a sacar.

     Y como el cromo es acromático de punta a punta, todo el color de esta
     celda cabe en una lista corta: el filo y la cifra de lo vencido, el
     relleno de cada riel, las marcas de estado y las píldoras. Nada más.
     ══════════════════════════════════════════════════════════════════════ */

  /* La cabecera es el cajetín de un plano: título, recuento y regla debajo.
     La regla no decora, cierra el bloque. */
  :global([data-d='X']) .sec-head {
    padding-bottom: var(--d-p2);
    border-bottom: max(var(--d-bw), 1px) solid var(--d-edge);
  }
  :global([data-d='X']) .sec-title {
    font-variant-numeric: var(--d-num);
    letter-spacing: -.02em;
  }

  /* ── LA CELDA DE RECUENTO ────────────────────────────────────────────── */
  /* Una hoja: papel, línea de un pixel y un pixel de sombra sin desenfoque. La
     profundidad la da la línea, nunca una nube. Conserva el canto de .d-panel
     y no baja a 4px: la celda de recuento, la hoja de cotas, la ficha y el
     aviso son todos la misma clase de objeto y tienen que tener el mismo
     canto. Los 4px quedan para lo que va DENTRO de una hoja, que es como se
     reconoce un anidado. */
  :global([data-d='X']) .kpi {
    border-color: var(--d-line);
    box-shadow: var(--d-shadow);
    transition: background 120ms ease, border-color 120ms ease, transform 120ms ease;
  }
  :global([data-d='X']) .kpi:hover { background: var(--d-sunk); }
  /* La única moción de la celda, y hace un trabajo: la hoja se hunde un pixel
     bajo el dedo, igual que el botón del contrato. Es acuse de recibo, no
     animación. */
  :global([data-d='X']) .kpi:active { transform: translateY(1px); box-shadow: none; }
  /* ELEGIDA: DOS FILOS DE TINTA Y NADA MÁS. El estado de un control no puede
     gastar color, porque el color acá ya está comprometido con el estado del
     equipo. Si la celda elegida se rellenara de tono no habría manera de saber
     si el rojo dice "vencidos" o dice "este es el filtro puesto". Tinta para
     el control, tono para el dato, y no se cruzan. */
  :global([data-d='X']) .kpi.on {
    background: var(--d-surface);
    border-color: var(--d-ink);
    box-shadow: inset 0 0 0 max(var(--d-bw), 1px) var(--d-ink);
  }
  :global([data-d='X']) .kpi.on .kpi-lab { color: var(--d-ink); font-weight: var(--d-w-bold); }
  /* Solo lo vencido lleva filo, que es la regla que el contrato ya aplica a la
     fila. Si las seis celdas llevaran su franja de tono, el rojo volvería a ser
     uno de cuatro colores en fila en vez de lo primero que encuentra el ojo.
     El filo va en el borde y no en una sombra interior: así nunca queda tapado
     por el fondo de un hijo, y el relleno de la izquierda se descuenta para que
     el texto no se corra dos pixeles respecto de las otras cinco celdas. */
  :global([data-d='X']) .kpi[data-tone='critical'] {
    border-left: calc(var(--d-bw) * 3) solid var(--d-crit);
    padding-left: calc(var(--d-p3) - var(--d-bw) * 2);
  }

  /* El rótulo es una palabra, no una versalita: X trae --d-label-case: none
     justamente porque la línea de mayúsculas espaciadas sobre cada bloque es
     el ritmo que delata una plantilla. Sube a 13,5px y a tinta secundaria, y
     la personalidad sale del contraste contra la cifra: 520 contra 700, gris
     contra tinta, 13,5 contra 34. */
  :global([data-d='X']) .kpi-lab {
    font-size: var(--d-t-sm);
    font-weight: var(--d-w-med);
    color: var(--d-ink-2);
  }
  /* LA CIFRA GRANDE, SIN COLOR DE CROMO. Tabular siempre, para que 8, 14, 62
     y 4 caigan sobre la misma vertical al comparar cuatro celdas en fila, y
     con tracking negativo, que a 34px es lo que separa una cifra dibujada de
     una cifra por defecto. */
  :global([data-d='X']) .kpi-fig {
    color: var(--d-ink);
    font-weight: var(--d-w-bold);
    letter-spacing: -.03em;
    font-variant-numeric: var(--d-num);
  }
  /* El número toma el tono solo cuando ES el estado. Pasa una vez. */
  :global([data-d='X']) .kpi[data-tone='critical'] .kpi-fig { color: var(--d-crit); }
  :global([data-d='X']) .kpi-note { font-variant-numeric: var(--d-num); }

  /* ── LA COTA, LA FIRMA DEL SISTEMA ──────────────────────────────────────
     Las dos lecturas son UNA hoja partida por un pelo de línea, no dos
     tarjetas puestas al lado: son la misma pregunta hecha sobre dos máquinas.
     La junta es el hueco de la rejilla sobre el fondo de la hoja, así que al
     plegarse a una columna pasa sola de dividir columnas a dividir filas, sin
     una regla por punto de quiebre. */
  :global([data-d='X']) .cotas {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--d-bw);
    min-width: 0;
    background: var(--d-line);
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    overflow: hidden;
  }
  :global([data-d='X']) .cota-kpi {
    min-width: 0;
    padding: var(--d-p3);
    background: var(--d-surface);
  }
  /* Quién y qué se mide, en una línea. El código de equipo en mono y tinta
     llena, la tarea en gris: se busca por placa, se confirma por tarea. */
  :global([data-d='X']) .cota-lab {
    display: flex; align-items: baseline; flex-wrap: wrap;
    /* Si la tarea se va a un segundo renglón, no queda pegada a la placa. */
    gap: 2px calc(var(--d-p1) * .8);
    margin: 0 0 var(--d-p2);
    min-width: 0;
    font-size: var(--d-t-sm);
  }
  :global([data-d='X']) .cota-lab .d-id { color: var(--d-ink); font-weight: var(--d-w-semi); }
  :global([data-d='X']) .cota-task { color: var(--d-ink-3); overflow-wrap: anywhere; }
  /* La cifra de la cota iguala a la del recuento: 34px, 700, mismo tracking.
     Son la misma clase de dato leído de dos maneras y tienen que pesar igual
     en la página. El contrato la deja en 25px, que es el tamaño de cuando la
     cota va dentro de una corrida de ficha, y ahí abajo se queda en 25. */
  :global([data-d='X']) .cota-kpi .d-cota-fig {
    font-size: var(--d-t-2xl);
    font-weight: var(--d-w-bold);
    letter-spacing: -.03em;
  }

  /* ── LA FICHA ES UNA BOLETA ──────────────────────────────────────────────
     Rótulo y valor comparten columna en las tres corridas, así que los tres
     valores arrancan sobre la misma vertical y el ojo baja por una sola línea
     en vez de buscar cada dato donde termine su rótulo. `display: contents`
     disuelve cada .d-rail para que las seis celdas caigan en la MISMA rejilla:
     una rejilla por corrida alinearía cada fila consigo misma, que es no
     alinear nada. */
  :global([data-d='X']) .ficha-meta {
    grid-template-columns: max-content minmax(0, 1fr);
    column-gap: var(--d-p3);
    row-gap: 0;
  }
  :global([data-d='X']) .ficha-meta > .d-rail { display: contents; }
  :global([data-d='X']) .ficha-meta dt,
  :global([data-d='X']) .ficha-meta dd {
    padding-block: var(--d-p2);
    border-top: max(var(--d-bw), 1px) solid var(--d-line);
  }
  /* La primera corrida no abre con una línea: ya tiene el estado del equipo
     encima y dos reglas a un pelo una de otra son un error de dibujo. */
  :global([data-d='X']) .ficha-meta > .d-rail:first-child dt,
  :global([data-d='X']) .ficha-meta > .d-rail:first-child dd {
    border-top: 0;
    padding-top: 0;
  }
  /* La ficha lleva el equipo vencido y toma el mismo filo de 3px que la fila y
     que la celda de recuento: una sola manera de dibujar "vencido" en toda la
     pantalla, reconocible sin distinguir el rojo. En el borde y no en una
     sombra interior, porque el pie de la ficha tiene fondo propio y taparía
     una sombra justo en su tramo. */
  :global([data-d='X']) .ficha[data-tone='critical'] {
    border-left: calc(var(--d-bw) * 3) solid var(--d-crit);
  }
  :global([data-d='X']) .ficha-name { letter-spacing: -.015em; }
  /* Los dos botones del pie llevan white-space: nowrap y el pie no envuelve:
     por debajo de unos 280px de columna se salen de la hoja. Envuelven, y
     siguen alineados a la derecha. */
  :global([data-d='X']) .d-panel-foot { flex-wrap: wrap; }

  /* EL AVISO NO ES UNA ALARMA, ES UN SUPUESTO. Deja de ser una banda de color
     y pasa a ser papel con el filo de su tono: la misma gramática que el
     contrato le da a la fila, donde el relleno queda reservado a lo vencido.
     La palabra "Estimado" baja a tinta secundaria y el tono se queda en la
     marca y en el filo, que es donde informa sin competir con el rojo. */
  :global([data-d='X']) .callout {
    background: var(--d-surface);
    border-color: var(--d-line);
    border-left: calc(var(--d-bw) * 3) solid var(--tone-fg);
  }
  :global([data-d='X']) .callout-kicker { color: var(--d-ink-2); }

  /* ANIDADO: papel sobre papel. Un escalón menos de canto, sin sombra y sobre
     el fondo hundido. Lo que lo separa de su contenedor es la línea, no la
     altura, que es la regla de material de toda la dirección. */
  :global([data-d='X']) .nest {
    background: var(--d-sunk);
    border-color: var(--d-line);
    border-radius: var(--d-r);
    box-shadow: none;
  }
  :global([data-d='X']) .nest > .d-panel-head { background: transparent; }
  :global([data-d='X']) .plan-src { font-variant-numeric: var(--d-num); }

  /* ── X · PANTALLA ANGOSTA, DECLARADA HASTA 380px ─────────────────────────
     Manda la CELDA, no la ventana: el contenedor es .root, así que una celda
     angosta se comporta igual sola que dentro de una rejilla de veinte.

       520c  el mosaico de recuentos pasa a cuatro columnas y la hoja de cotas
             a dos, por la regla compartida de más abajo y por la de acá.
             También es donde el aviso se pone al lado de la ficha.
       440c  la boleta se deshace: la columna de rótulos deja de caber sin
             ahogar el dato, así que rótulo y valor vuelven a apilarse. Y los
             botones del pie toman 44px, porque una celda de este ancho ya
             tiene forma de teléfono aunque la ventana sea ancha.
       360c  el mosaico y la hoja de cotas se pliegan a una columna. La hoja no
             se rompe: las dos cotas quedan apiladas dentro de la misma pieza y
             la junta pasa a ser horizontal.

     A 380px de ventana la celda queda alrededor de 320c, o sea que rigen las
     tres. Lo más ancho que existe acá es la cifra de la cota, "7 210 km" a
     34px con tracking negativo, que mide unos 140px: le sobra sitio.

     QUÉ SE VUELVE SCROLL HORIZONTAL: nada, y es una respuesta y no un olvido.
     Esta familia no tiene tabla. Las píldoras con white-space: nowrap viven en
     filas con flex-wrap, los nombres de equipo parten con overflow-wrap:
     anywhere, y el riel de la cota es un bloque con min-width: 0 que se encoge
     con su columna en vez de empujarla. Si algún día entra una tabla, el
     scroll va contenido en su propio envoltorio y nunca en el body. */
  @container (min-width: 520px) {
    :global([data-d='X']) .cotas { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @container (max-width: 439px) {
    :global([data-d='X']) .ficha-meta { grid-template-columns: minmax(0, 1fr); }
    :global([data-d='X']) .ficha-meta > .d-rail { display: grid; }
    :global([data-d='X']) .ficha-meta dt { padding-block: var(--d-p2) 2px; }
    :global([data-d='X']) .ficha-meta dd { padding-block: 0; border-top: 0; }
    /* Solo min-height. Tocar .d-btn entero acá le ganaría el fondo a
       .d-btn--primary del contrato y dejaría tinta blanca sobre blanco. */
    :global([data-d='X']) .d-panel-foot .d-btn { min-height: var(--d-touch); }
  }

  /* Piso de artesanía, igual que el que el contrato le pone a la fila y al
     riel: en alto contraste forzado la sombra interior de tinta desaparece y
     la celda elegida perdería su único distintivo. Pasa a contorno. */
  @media (forced-colors: active) {
    :global([data-d='X']) .kpi.on { outline: 2px solid CanvasText; outline-offset: -2px; }
  }

  /* ======================================================================
     RESPONSIVE — hasta 380px. La celda manda, no la ventana: el contenedor
     es .root, así que una celda angosta se comporta igual esté sola o en
     una rejilla de ocho.
     ====================================================================== */
  @container (min-width: 520px) {
    .kpis { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .kpis--pair { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .aside-row { grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); align-items: start; }
    /* E paga su aire: con este padding, cuatro columnas parten las notas en
       dos palabras por línea. Aguanta en dos hasta que haya sitio de verdad. */
    /* Las que se apilan en carriles o franjas: cuatro columnas las convierte
       otra vez en tarjetas y pierden la silueta entera. */
    /* K, L, M y T pagan lo mismo que E: halo, guijarro y bruma necesitan aire
       alrededor o los resplandores y las manchas se pisan entre vecinos. En T
       el halo se derrama 38px hacia afuera, así que a cuatro columnas en una
       celda angosta los seis resplandores se suman y el color deja de ser
       legible como estado. */
    :global([data-d='M']) .kpis,
    :global([data-d='T']) .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    /* El raíl de 152px vuelve donde hay ancho de verdad: la ficha ocupa toda
       la franja en P, así que la columna de etiquetas cabe sin ahogar el dato. */
  }
  @container (min-width: 800px) {
    :global([data-d='M']) .kpis,
    :global([data-d='T']) .kpis { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    :global([data-d='M']) .kpis--pair,
    :global([data-d='T']) .kpis--pair { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  /* El raíl de P no se aplica a ciegas: por debajo de este ancho la cifra deja
     de tener sus 152px y la franja se pliega a una sola columna. Es exactamente
     la razón por la que se había retirado del contrato. */
  @container (max-width: 359px) {
    .kpis { grid-template-columns: minmax(0, 1fr); }
    /* En R la nota y la cifra ya no caben en el mismo renglón de 26px. */
  }
  /* El raíl de G se pliega con el mismo umbral que usa la primitiva. */
  /* ======================================================================
     W · PANTALLA ANGOSTA, DECLARADA. Nadie había probado esta celda debajo de
     500px, así que acá va escrito qué hace y por qué, en vez de confiar en que
     el contrato la alcance.

     QUÉ MANDA, LA VENTANA O LA CELDA. Las dos, y en sitios distintos:

       LA VENTANA manda sobre el desenfoque, y solo sobre eso. directions.css
       apaga el vidrio de .d-panel a 560px de ventana porque el desenfoque de
       fondo lo paga la GPU del aparato, no el ancho de la columna. La lámina
       de KPIs es de esta página y el contrato no la alcanza, así que se apaga
       acá, con el MISMO umbral y también en @media: si la lámina siguiera
       desenfocando dentro de un panel que ya no desenfoca, el vidrio quedaría
       medio puesto, que se ve peor que no estar. Con el campo apagado la
       lámina pasa a sólida, igual que hacen los paneles.

       LA CELDA manda sobre todo lo demás, con @container sobre .root:

         520c  el mosaico pasa de dos columnas a cuatro y la ficha se pone al
               lado del aviso. Debajo de ese ancho EL AVISO ES LA COLUMNA QUE
               CAE PRIMERO, y cae debajo de la ficha: el equipo vencido es el
               objeto de la pantalla y el supuesto es un comentario sobre otro
               equipo.
         440c  los botones de pie toman 44px. Una celda de este ancho ya tiene
               forma de teléfono aunque la ventana sea ancha, y el umbral de
               560px del contrato no la ve. El pie ya envuelve a cualquier
               ancho.
         360c  el mosaico se pliega a una columna. La lámina no se rompe: las
               celdas quedan apiladas dentro de la misma pieza de vidrio y la
               junta de luz pasa sola de dividir columnas a dividir filas,
               porque va arriba y a la izquierda de cada celda.

     QUÉ SE VUELVE SCROLL HORIZONTAL: nada, y es una respuesta, no un olvido.
     Esta familia no tiene tabla. Lo más ancho que hay son la cifra, las
     píldoras con white-space: nowrap (que viven en filas con flex-wrap) y los
     nombres de equipo (que parten con overflow-wrap: anywhere), así que a
     320px nada empuja el ancho. Si alguna vez entra una tabla en esta página,
     el scroll va contenido en su propio envoltorio y nunca en el body.
     ====================================================================== */
  @media (max-width: 560px) {
    :global([data-d='W']) .kpis {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      background: var(--d-overlay);
    }
    /* Sobre lámina sólida, --d-sunk es blanco sobre blanco y el apuntado deja
       de verse. No se repone: a este ancho el puntero es un dedo y no hay
       apuntado. Lo elegido y lo crítico no dependen del puntero. */
    /* El contrato engorda el filo crítico a 5px en el teléfono, porque 3px
       contra el marco de la pantalla se pierden. El mosaico lo sigue, y las
       dos piezas que esta página redefine también, o quedarían finas justo
       donde el resto engordó. */
    :global([data-d='W']) .kpi[data-tone='critical'] {
      box-shadow: inset calc(var(--d-bw) * 5) 0 0 var(--d-crit),
                  inset var(--d-bw) 0 0 var(--d-edge),
                  inset 0 var(--d-bw) 0 var(--d-edge);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }
    :global([data-d='W']) .kpi[data-tone='critical'].on {
      box-shadow: inset calc(var(--d-bw) * 5) 0 0 var(--d-crit),
                  inset 0 0 0 max(var(--d-bw), 2px) var(--d-accent);
    }
    /* Y el resplandor se retira con el del contrato: a distancia de teléfono
       un halo corto es humo, y el filo grueso hace el trabajo entero. */
    :global([data-d='W']) .ficha[data-tone='critical'] {
      box-shadow: inset calc(var(--d-bw) * 5) 0 0 var(--d-crit), var(--d-shadow);
    }
    :global([data-d='W']) .nest .plan-row[data-tone='critical'] {
      box-shadow: inset calc(var(--d-bw) * 5) 0 0 var(--d-crit);
    }
  }
  @container (max-width: 439px) {
    /* Solo min-height. Tocar .d-btn entero acá le ganaría el fondo a
       .d-btn--primary del contrato y dejaría tinta blanca sobre blanco. */
    :global([data-d='W']) .d-panel-foot .d-btn { min-height: var(--d-touch); }
  }
  /* Vidrio apagado por preferencia. directions.css ya vuelve opacos --d-surface
     y --d-sunk cuando alguien pide menos transparencia o más contraste, así que
     la lámina y el apuntado se resuelven solos; lo único que el contrato no
     alcanza es el desenfoque de la lámina, que es de esta página. El relleno de
     la celda elegida no depende de ninguno de esos dos tokens, así que se ve
     igual en los tres modos. */
  @media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
    :global([data-d='W']) .kpis {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .kpi { transition: none; }
    :global([data-d='A']) .kpi:hover { transform: none; }
    :global([data-d='O']) .kpi:hover{ transform: none; }
    :global([data-d='M']) .kpi::before{ transition: none; }
    /* En X el hundimiento de la hoja se retira igual que el del botón en el
       contrato. Lo elegido no depende de él: depende del filo de tinta. */
    :global([data-d='X']) .kpi:active { transform: none; }
  }

  /* ══ W · OBJETIVOS TÁCTILES, POR PUNTERO Y NO POR ANCHO ══════════════════
     El tamaño de un dedo es un hecho del aparato, no del ancho de la ventana.
     directions.css sube los .d-btn de W a --d-touch dentro de
     @media (max-width: 560px), así que una tableta de 768px —que se toca con
     el pulgar igual que un teléfono— se quedaba con los controles de ratón.
     Medido con puntero grueso emulado por CDP a 768px, esta página tenía
     4 objetivos por debajo de 44px. Va por (pointer: coarse) porque ese es
     el hecho que importa; el ancho ya tiene sus propias reglas y hacen otra
     cosa. Con ratón no cambia un pixel. */
  @media (pointer: coarse) {
    :global([data-d='W']) .d-btn { min-height: var(--d-touch); }
  }

  /* ======================================================================
     AA · PRISMA VIVO — el KPI medido.

     Lo primero es lo que NO hace falta tocar: la cifra ya sale del color de su
     estado, porque `.kpi-fig` resuelve `var(--tone-fg)` en la base y eso vale
     para las veintitrés direcciones. Pintarla nunca fue el problema.

     Lo que le faltaba al KPI es la ESCALA. «8 vencidos» y «62 al día» se
     dibujan con el mismo cuerpo de 35px, así que las dos cifras pesan igual en
     la mirada aunque una sea casi ocho veces la otra, y para saber cuánto es 8
     hay que buscar el 88 del titular y dividir. El riel hace esa división: la
     barra de vencidos ocupa un noveno de su carril y la de «al día» casi
     entero. La proporción sale de --kpi-pct, que el marcado ya calcula.

     El riel es un carril completo con su relleno dentro, no una barra suelta:
     sin el carril de fondo, una barra corta y una barra larga no se comparan
     contra nada y vuelve a hacer falta el cálculo mental que veníamos a
     ahorrar. Van los dos pseudo-elementos, que en `.kpi` estaban libres. */
  :global([data-d='AA']) .kpis:not(.kpis--pair) .kpi,
  :global([data-d='AB']) .kpis:not(.kpis--pair) .kpi { padding-bottom: calc(var(--d-p3) + var(--d-p2)); }
  :global([data-d='AA']) .kpis:not(.kpis--pair) .kpi::before,
  :global([data-d='AA']) .kpis:not(.kpis--pair) .kpi::after,
  :global([data-d='AB']) .kpis:not(.kpis--pair) .kpi::before,
  :global([data-d='AB']) .kpis:not(.kpis--pair) .kpi::after {
    content: ''; position: absolute; bottom: var(--d-p3);
    height: 3px; border-radius: 999px; pointer-events: none;
  }
  :global([data-d='AA']) .kpis:not(.kpis--pair) .kpi::before,
  :global([data-d='AB']) .kpis:not(.kpis--pair) .kpi::before {
    left: var(--d-p3); right: var(--d-p3);
    background: rgba(21, 15, 38, .10);
  }
  :global([data-d='AA']) .kpis:not(.kpis--pair) .kpi::after,
  :global([data-d='AB']) .kpis:not(.kpis--pair) .kpi::after {
    left: var(--d-p3);
    width: calc((100% - var(--d-p3) * 2) * var(--kpi-pct) / 100);
    background: var(--tone-fg);
  }
  /* EL TINTE QUEDA RESERVADO. Si las cuatro celdas se tiñen del color de su
     estado, las cuatro gritan y la mirada no tiene dónde caer primero — es la
     misma razón por la que W reserva el halo a lo crítico. Se tiñe UNA, la
     vencida, y por eso significa algo que esté teñida. */
  :global([data-d='AA']) .kpi[data-tone='critical'] {
    background: linear-gradient(180deg, var(--d-crit-band), rgba(255, 255, 255, .30));
    border-color: var(--d-crit-edge);
  }
  /* La variación era una píldora muda: «+3» sin decir si subir es bueno. Acá
     lleva la flecha de su dirección y el color de lo que significa que suba —
     en «vencidos vs. ayer», subir es malo. Es la primera celda del par y no
     tiene clase propia, así que se la nombra por posición, como hace L con sus
     radios; si algún día el par cambia de orden, esta regla se muda con él. */
  :global([data-d='AA']) .kpis--pair > .kpi:first-child .kpi-tag,
  :global([data-d='AB']) .kpis--pair > .kpi:first-child .kpi-tag {
    background: var(--tone-band);
    border-color: var(--tone-edge);
    color: var(--tone-fg);
    font-weight: var(--d-w-semi);
  }
  :global([data-d='AA']) .kpis--pair > .kpi:first-child .kpi-tag::before,
  :global([data-d='AB']) .kpis--pair > .kpi:first-child .kpi-tag::before {
    content: '↑'; margin-right: .25em;
  }
  /* Seleccionada: el anillo es del morado de marca, que ahora tiene fuerza para
     sostenerlo sin ayuda de una sombra extra. */
  :global([data-d='AA']) .kpi.on,
  :global([data-d='AB']) .kpi.on {
    box-shadow: 0 0 0 2px var(--d-accent), var(--d-shadow-lg);
    border-color: transparent;
  }
  :global([data-d='AA']) .kpi:hover { background: rgba(255, 255, 255, .78); }
  :global([data-d='AA']) .kpi[data-tone='critical']:hover {
    background: linear-gradient(180deg, var(--d-crit-band), rgba(255, 255, 255, .46));
  }

  /* ======================================================================
     AB · PRISMA FARO — la luz graduada.

     AA marca lo urgente tiñendo la celda vencida: teñida o no teñida, dos
     estados. La flota no es binaria, y una escala de dos posiciones obliga a
     leer las cifras para saber si «por vencer» es hoy o el mes que viene.

     Acá la señal es la luz, que sí tiene grados. Cada celda irradia en su tono
     con la intensidad de su urgencia, y las intensidades salen de --d-faro-*,
     un token por tono, para que la escala se suba o se baje entera sin tocar
     seis reglas.

     Se van las dos marcas planas de AA —el tinte de la celda vencida y su
     hover— porque el tinte y el resplandor dicen lo mismo dos veces y el que
     dice menos es el tinte. La celda vuelve a ser vidrio y la única diferencia
     entre una y otra es cuánto alumbran.

     El resplandor va en el MISMO box-shadow que la sombra de contacto, no en
     una capa aparte: son la misma propiedad, y declararlos por separado hacía
     que el segundo pisara al primero y la tarjeta perdiera el peso de Prisma. */
  :global([data-d='AB']) .kpi[data-tone='critical'] {
    box-shadow: 0 10px 30px -8px color-mix(in srgb, var(--d-crit) var(--d-faro-crit), transparent),
                var(--d-shadow);
  }
  :global([data-d='AB']) .kpi[data-tone='attention'] {
    box-shadow: 0 10px 30px -10px color-mix(in srgb, var(--d-att) var(--d-faro-att), transparent),
                var(--d-shadow);
  }
  :global([data-d='AB']) .kpi[data-tone='positive'] {
    box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--d-pos) var(--d-faro-pos), transparent),
                0 0 0 1px color-mix(in srgb, var(--d-pos) var(--d-faro-ring), transparent),
                var(--d-shadow);
    border-color: color-mix(in srgb, var(--d-pos) var(--d-faro-ring), transparent);
  }
  :global([data-d='AB']) .kpi[data-tone='info'] {
    box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--d-info) var(--d-faro-info), transparent),
                0 0 0 1px color-mix(in srgb, var(--d-info) var(--d-faro-ring), transparent),
                var(--d-shadow);
    border-color: color-mix(in srgb, var(--d-info) var(--d-faro-ring), transparent);
  }
  /* Sin dato no hay nada que anunciar. Apagado es un valor de la escala, no un
     olvido: es lo que hace que las otras cuatro signifiquen algo. */
  :global([data-d='AB']) .kpi[data-tone='neutral'] { box-shadow: var(--d-shadow); }

  /* El riel deja de ser una barra pintada y pasa a ser un filamento: el relleno
     alumbra su propio carril. Es el mismo dibujo de AA con corriente. */
  :global([data-d='AB']) .kpis:not(.kpis--pair) .kpi::after {
    box-shadow: 0 0 7px color-mix(in srgb, var(--tone-fg) 65%, transparent);
  }
  /* Al pasar el cursor sube el vidrio, no la luz: la intensidad es información
     y moverla con el puntero diría que algo se volvió más urgente por mirarlo. */
  :global([data-d='AB']) .kpi:hover { background: rgba(255, 255, 255, .80); }
</style>
