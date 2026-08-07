<script>
  // FORMULARIOS — la familia donde las ocho direcciones más se separan.
  //
  // La forma del CAMPO es el examen: en E es un pozo relleno sin borde, en G una
  // línea de base sin caja, en F una línea de prompt, en B una celda de 27px que
  // comparte borde con la de al lado. Todo lo demás (buscador, fieldset, casilla,
  // radio, interruptor, error, pie de acciones) tiene que contar la misma
  // historia en cada dirección o la comparación miente.
  //
  // Sin estado en JS: los controles son inputs nativos, así que se pueden probar
  // de verdad (foco, marcado, presionado) sin una sola sentencia reactiva.
  import Grid from '../Grid.svelte';
  import Direction from '../Direction.svelte';
  import { ASSETS, markOf } from '../demo.js';

  export let directions = [];

  const METRICS = [
    { v: 'horas', t: 'Horas de uso', u: 'h' },
    { v: 'km', t: 'Kilómetros', u: 'km' },
    { v: 'dias', t: 'Días de calendario', u: 'd' }
  ];

  const stop = (e) => e.preventDefault();
</script>

<Grid min="440px">
  {#each directions as d (d.id)}
    <Direction id={d.id} flush={d.id === 'F' || d.id === 'G'}>
      <form class="fm" novalidate on:submit={stop} aria-labelledby="fm-ttl-{d.id}">

        <!-- ── BUSCADOR ───────────────────────────────────────────────── -->
        <div class="fm-seek">
          <label class="d-label fm-lab fm-seek-lab" for="fm-q-{d.id}">Buscar equipo</label>
          <div class="fm-seek-ctl">
            <input
              class="d-input fm-inp fm-q" type="search" id="fm-q-{d.id}" name="q"
              placeholder="Wacker, C-148921, Bodega San José…"
              aria-describedby="fm-qh-{d.id}" />
            <button class="d-btn fm-seek-btn" type="button">Buscar</button>
          </div>
          <p class="d-hint fm-hint fm-seek-hint" id="fm-qh-{d.id}">
            Código, nombre, placa o familia. 78 equipos en la flota.
          </p>
        </div>

        <!-- ── EL FORMULARIO ──────────────────────────────────────────── -->
        <section class="d-panel fm-panel">
          <header class="d-panel-head fm-head">
            <h4 class="d-panel-title" id="fm-ttl-{d.id}">Nueva lectura · BAT-014</h4>
            <span class="d-pill" data-tone="critical">
              <svg viewBox="0 0 12 12" aria-hidden="true">{@html markOf('critical')}</svg>
              Vencido
            </span>
          </header>

          <div class="d-panel-body fm-body">

            <!-- grupo de campos -->
            <fieldset class="fm-set">
              <legend class="fm-leg">Nueva lectura</legend>

              <div class="fm-grid">
                <!-- equipo · select · obligatorio -->
                <div class="fm-f fm-f--wide d-rail">
                  <label class="d-label fm-lab" for="fm-eq-{d.id}">
                    Equipo <span class="fm-req" aria-hidden="true">*</span><span class="d-sr">(obligatorio)</span>
                  </label>
                  <div class="fm-ctl">
                    <select class="d-select fm-inp" id="fm-eq-{d.id}" name="equipo" required>
                      {#each ASSETS as a}
                        <option value={a.code} selected={a.code === 'BAT-014'}>{a.code} · {a.name}</option>
                      {/each}
                    </select>
                  </div>
                </div>

                <!-- métrica · radios -->
                <div class="fm-f fm-f--wide d-rail">
                  <span class="d-label fm-lab" id="fm-met-{d.id}">Métrica</span>
                  <div class="fm-ctl">
                    <div class="fm-radios" role="radiogroup" aria-labelledby="fm-met-{d.id}">
                      {#each METRICS as m}
                        <label class="fm-opt" for="fm-met-{m.v}-{d.id}">
                          <input
                            class="fm-in d-sr" type="radio" id="fm-met-{m.v}-{d.id}"
                            name="fm-met-{d.id}" value={m.v} checked={m.v === 'horas'} />
                          <span class="fm-mark fm-mark--rd" aria-hidden="true"></span>
                          <span class="fm-opt-txt">{m.t} <span class="fm-opt-u">({m.u})</span></span>
                        </label>
                      {/each}
                    </div>
                  </div>
                </div>

                <!-- valor · texto con unidad · obligatorio · con pista -->
                <div class="fm-f d-rail">
                  <label class="d-label fm-lab" for="fm-val-{d.id}">
                    Valor <span class="fm-req" aria-hidden="true">*</span><span class="d-sr">(obligatorio)</span>
                  </label>
                  <div class="fm-ctl">
                    <div class="fm-unit">
                      <input
                        class="d-input fm-inp d-num" id="fm-val-{d.id}" name="valor" type="text"
                        inputmode="decimal" value="312" required aria-describedby="fm-valh-{d.id}" />
                      <span class="fm-u">h</span>
                    </div>
                    <p class="d-hint fm-hint" id="fm-valh-{d.id}">
                      Horómetro. Última registrada: 312 h · 2 ago (devolución 8631).
                    </p>
                  </div>
                </div>

                <!-- fecha -->
                <div class="fm-f d-rail">
                  <label class="d-label fm-lab" for="fm-fec-{d.id}">Fecha</label>
                  <div class="fm-ctl">
                    <input class="d-input fm-inp d-num" id="fm-fec-{d.id}" name="fecha" type="date" value="2026-08-05" />
                  </div>
                </div>

                <!-- nota · textarea con pista -->
                <div class="fm-f fm-f--wide d-rail">
                  <label class="d-label fm-lab" for="fm-nota-{d.id}">Nota</label>
                  <div class="fm-ctl">
                    <textarea
                      class="d-textarea fm-inp" id="fm-nota-{d.id}" name="nota" rows="2"
                      aria-describedby="fm-notah-{d.id}"
                      placeholder="Se cambió aceite y filtro. Quedó pendiente la manguera de retorno."
                    ></textarea>
                    <p class="d-hint fm-hint" id="fm-notah-{d.id}">
                      Queda en la bitácora del equipo. No sale en el reporte al cliente.
                    </p>
                  </div>
                </div>
              </div>
            </fieldset>

            <!-- casilla + interruptor -->
            <div class="fm-opts">
              <span class="d-cap fm-cap">Al guardar</span>
              <div class="fm-stack fm-choices">
                <label class="fm-opt" for="fm-cerrar-{d.id}">
                  <input class="fm-in d-sr" type="checkbox" id="fm-cerrar-{d.id}" name="cerrar" checked />
                  <span class="fm-mark fm-mark--ck" aria-hidden="true">
                    <svg viewBox="0 0 12 12">{@html markOf('positive')}</svg>
                  </span>
                  <span class="fm-opt-txt">Cerrar «Cambio de aceite · cada 250 h» con esta lectura</span>
                </label>

                <label class="fm-opt" for="fm-avisar-{d.id}">
                  <input class="fm-in d-sr" type="checkbox" id="fm-avisar-{d.id}" name="avisar" checked />
                  <span class="fm-sw" aria-hidden="true"></span>
                  <span class="fm-opt-txt">Avisar al encargado de Bodega San José</span>
                  <span class="fm-state" aria-hidden="true"></span>
                </label>
              </div>
            </div>

            <!-- error real + campo bloqueado -->
            <div class="fm-states">
              <span class="d-cap fm-cap">Estados del campo</span>
              <div class="fm-stack">
                <div class="fm-f fm-f--bad d-rail" data-tone="critical">
                  <label class="d-label fm-lab" for="fm-bad-{d.id}">Valor</label>
                  <div class="fm-ctl">
                    <div class="fm-unit">
                      <input
                        class="d-input fm-inp d-num" id="fm-bad-{d.id}" name="valor-error" type="text"
                        inputmode="decimal" value="180" aria-invalid="true" aria-describedby="fm-badm-{d.id}" />
                      <span class="fm-u">h</span>
                    </div>
                    <p class="d-error fm-msg" id="fm-badm-{d.id}">
                      <svg class="fm-ico" viewBox="0 0 12 12" aria-hidden="true">{@html markOf('critical')}</svg>
                      <span><strong>Error.</strong> La lectura 180 h es menor que la última registrada, 312 h</span>
                    </p>
                  </div>
                </div>

                <div class="fm-f fm-f--off d-rail">
                  <label class="d-label fm-lab" for="fm-src-{d.id}">
                    Fuente <span class="fm-off">bloqueado</span>
                  </label>
                  <div class="fm-ctl">
                    <select class="d-select fm-inp" id="fm-src-{d.id}" name="fuente" disabled aria-describedby="fm-srch-{d.id}">
                      <option>Salida/devolución</option>
                    </select>
                    <p class="d-hint fm-hint" id="fm-srch-{d.id}">
                      No se edita: la lectura entró con la devolución 8631. Corregila desde el documento.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p class="d-hint fm-note">
              Los campos con <span class="fm-req" aria-hidden="true">*</span> son obligatorios.
            </p>
          </div>

          <footer class="d-panel-foot fm-foot">
            <button class="d-btn d-btn--ghost" type="button">Cancelar</button>
            <div class="d-btn-group fm-acts">
              <button class="d-btn" type="button">Guardar y agregar otra</button>
              <button class="d-btn d-btn--primary" type="submit">Guardar lectura</button>
            </div>
          </footer>
        </section>
      </form>
    </Direction>
  {/each}
</Grid>

<style>
  /* ======================================================================
     BASE — escrita solo contra tokens --d-*. Ni un color, radio ni tamaño
     inventado. Cada dirección hereda su densidad, su radio y su tipografía
     de aquí sin una línea propia.
     ====================================================================== */
  .fm {
    display: grid;
    gap: var(--d-gap);
    min-width: 0;
    container-type: inline-size;
    container-name: fm;
  }

  /* ── buscador ───────────────────────────────────────────────────────── */
  .fm-seek {
    display: grid;
    gap: 5px;
    min-width: 0;
    padding: var(--d-p2) var(--d-p3);
    background: var(--d-surface);
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
  }
  .fm-seek-ctl { display: flex; align-items: stretch; gap: var(--d-p1); flex-wrap: wrap; min-width: 0; }
  .fm-q { flex: 1 1 150px; min-width: 0; }
  .fm-seek-btn { flex: none; }

  /* ── panel ──────────────────────────────────────────────────────────── */
  .fm-panel { min-width: 0; }
  .fm-head { flex-wrap: wrap; row-gap: 4px; }
  .fm-head .d-pill svg { flex: none; }
  .fm-body { display: grid; gap: var(--d-p3); min-width: 0; }

  /* ── fieldset ───────────────────────────────────────────────────────── */
  .fm-set { min-width: 0; margin: 0; padding: 0; border: 0; }
  .fm-leg {
    display: block; padding: 0; margin: 0 0 var(--d-p2);
    font-size: var(--d-label-size); font-weight: var(--d-label-weight);
    letter-spacing: var(--d-label-track); text-transform: var(--d-label-case);
    color: var(--d-label-color);
  }

  /* ── campos ─────────────────────────────────────────────────────────── */
  .fm-grid {
    display: grid; gap: var(--d-p2);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 168px), 1fr));
  }
  .fm-f { display: grid; gap: 5px; min-width: 0; align-content: start; }
  .fm-f--wide { grid-column: 1 / -1; }
  .fm-ctl { display: grid; gap: 4px; min-width: 0; }
  .fm-lab {
    display: block; min-width: 0;
    font-size: var(--d-label-size); font-weight: var(--d-label-weight);
    letter-spacing: var(--d-label-track); text-transform: var(--d-label-case);
    color: var(--d-label-color);
  }
  .fm-req { color: var(--d-crit); font-weight: var(--d-w-bold); }
  .fm-off { color: var(--d-ink-3); font-weight: var(--d-w); }
  .fm-inp { min-width: 0; }
  .fm-hint, .fm-msg, .fm-note { margin: 0; }
  .fm-msg { display: flex; align-items: flex-start; gap: 5px; }
  .fm-ico { flex: none; width: 11px; height: 11px; margin-top: 3px; }
  .fm-note { padding-top: var(--d-p1); }

  /* texto con unidad — el sufijo comparte el canto del campo */
  .fm-unit { display: flex; align-items: stretch; min-width: 0; }
  .fm-unit > .fm-inp { flex: 1 1 auto; min-width: 0; border-start-end-radius: 0; border-end-end-radius: 0; }
  .fm-u {
    flex: none; display: flex; align-items: center; justify-content: center;
    min-width: 34px; padding-inline: var(--d-p1);
    font-size: var(--d-t-xs); font-weight: var(--d-w-med); color: var(--d-ink-3);
    background: var(--d-sunk);
    border: max(var(--d-bw), 1px) solid var(--d-edge); border-left: 0;
    border-radius: 0 var(--d-r) var(--d-r) 0;
  }

  /* ── casilla · radio · interruptor ──────────────────────────────────── */
  .fm-cap { display: block; margin-bottom: var(--d-p1); }
  .fm-stack { display: grid; gap: var(--d-p1); min-width: 0; }
  .fm-radios { display: flex; flex-wrap: wrap; gap: var(--d-p1) var(--d-p3); }
  .fm-opt {
    position: relative; display: flex; align-items: center; gap: var(--d-p2);
    min-height: var(--d-row-h); min-width: 0; cursor: pointer;
  }
  .fm-opt-txt { flex: 1 1 auto; min-width: 0; font-size: var(--d-t-sm); color: var(--d-ink); }
  .fm-opt-u { color: var(--d-ink-3); }
  .fm-mark {
    flex: none; display: grid; place-items: center;
    width: 18px; height: 18px;
    background: var(--d-surface); color: transparent;
    border: max(var(--d-bw), 1px) solid var(--d-edge);
    border-radius: min(var(--d-r), 4px);
    transition: transform 90ms ease, box-shadow 90ms ease;
  }
  .fm-mark svg { width: 11px; height: 11px; }
  .fm-mark--rd { border-radius: 999px; }
  .fm-mark--rd::after { content: ''; width: 8px; height: 8px; border-radius: 999px; background: currentColor; }
  .fm-sw {
    flex: none; position: relative; display: inline-block;
    width: 40px; height: 22px;
    background: var(--d-neu-band);
    border: max(var(--d-bw), 1px) solid var(--d-edge);
    border-radius: var(--d-r-pill);
    transition: background 140ms ease, transform 90ms ease, box-shadow 90ms ease;
  }
  .fm-sw::after {
    content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px;
    background: var(--d-ink-3); border-radius: 999px;
    transition: transform 140ms ease, background 140ms ease;
  }
  .fm-in:checked + .fm-mark { background: var(--d-accent); border-color: var(--d-accent-edge); color: var(--d-accent-ink); }
  .fm-in:checked + .fm-sw { background: var(--d-accent); border-color: var(--d-accent-edge); }
  .fm-in:checked + .fm-sw::after { transform: translateX(18px); background: var(--d-accent-ink); }
  .fm-in:focus-visible + .fm-mark,
  .fm-in:focus-visible + .fm-sw { outline: 2px solid var(--d-focus); outline-offset: 2px; }
  /* estado del interruptor en PALABRA, nunca solo en color */
  .fm-state {
    flex: none; font-size: var(--d-t-2xs); font-weight: var(--d-w-semi);
    color: var(--d-ink-3); letter-spacing: var(--d-label-track);
    text-transform: var(--d-label-case);
  }
  .fm-state::after { content: 'Desactivado'; }
  .fm-in:checked ~ .fm-state::after { content: 'Activado'; }

  /* ── error y bloqueo ────────────────────────────────────────────────── */
  .fm-f--bad .fm-inp,
  .fm-f--bad .fm-u { border-color: var(--d-crit); }
  .fm-f--off .fm-inp[disabled] { background: var(--d-sunk); color: var(--d-ink-3); cursor: not-allowed; }

  /* ── pie ────────────────────────────────────────────────────────────── */
  .fm-foot { justify-content: space-between; flex-wrap: wrap; gap: var(--d-p1); }
  .fm-acts { flex-wrap: wrap; justify-content: flex-end; }

  /* ======================================================================
     A · ELEVACIÓN — nada se toca. Las secciones son bandejas hundidas que
     flotan dentro del panel, separadas por aire y no por líneas.
     ====================================================================== */
  :global([data-d='A']) .fm-body { gap: var(--d-p4); }
  :global([data-d='A']) .fm-seek { transition: box-shadow 140ms ease; }
  :global([data-d='A']) .fm-seek:focus-within { box-shadow: var(--d-shadow-lg); }
  :global([data-d='A']) .fm-opts,
  :global([data-d='A']) .fm-states {
    background: var(--d-sunk); border-radius: var(--d-r-lg); padding: var(--d-p3);
  }
  :global([data-d='A']) .fm-states .fm-inp { background: var(--d-surface); box-shadow: var(--d-shadow); }
  :global([data-d='A']) .fm-set { padding-bottom: var(--d-p1); }

  /* ======================================================================
     B · INSTRUMENTO — todo es celda. El buscador es un marco continuo con
     separadores internos; el fieldset es un marco de 1px con marcas de
     esquina; cada campo es una celda de 27px que COMPARTE borde con la de
     al lado; los radios son un control segmentado con bordes colapsados.
     ====================================================================== */
  :global([data-d='B']) .fm-seek {
    grid-template-columns: auto minmax(0, 1fr);
    align-items: stretch; gap: 0; padding: 0; border-color: var(--d-edge);
  }
  :global([data-d='B']) .fm-seek-lab {
    display: flex; align-items: center; padding-inline: var(--d-p2);
    background: var(--d-sunk); border-right: 1px solid var(--d-edge);
  }
  :global([data-d='B']) .fm-seek-ctl { gap: 0; flex-wrap: nowrap; }
  :global([data-d='B']) .fm-q { border: 0; }
  :global([data-d='B']) .fm-seek-btn { border: 0; border-left: 1px solid var(--d-edge); }
  :global([data-d='B']) .fm-seek-hint {
    grid-column: 1 / -1; padding: 3px var(--d-p2);
    border-top: 1px solid var(--d-line);
  }
  :global([data-d='B']) .fm-set {
    position: relative; border: 1px solid var(--d-edge);
    padding: var(--d-p1) var(--d-p2) var(--d-p2);
  }
  :global([data-d='B']) .fm-set::before,
  :global([data-d='B']) .fm-set::after {
    content: ''; position: absolute; width: 6px; height: 6px;
    border: 1px solid var(--d-edge); pointer-events: none;
  }
  :global([data-d='B']) .fm-set::before { top: 3px; right: 3px; border-left: 0; border-bottom: 0; }
  :global([data-d='B']) .fm-set::after { bottom: 3px; left: 3px; border-right: 0; border-top: 0; }
  :global([data-d='B']) .fm-leg { margin: 0; padding-inline: var(--d-p1); }
  :global([data-d='B']) .fm-grid,
  :global([data-d='B']) .fm-stack {
    gap: 0; border-top: 1px solid var(--d-line); border-left: 1px solid var(--d-line);
  }
  :global([data-d='B']) .fm-grid > .fm-f,
  :global([data-d='B']) .fm-stack > .fm-f,
  :global([data-d='B']) .fm-stack > .fm-opt {
    gap: 2px; padding: var(--d-p1) var(--d-p2);
    border-right: 1px solid var(--d-line); border-bottom: 1px solid var(--d-line);
  }
  :global([data-d='B']) .fm-f .fm-inp {
    border: 0; background: transparent; padding-inline: 0; min-height: 27px;
  }
  :global([data-d='B']) .fm-f .d-textarea { min-height: 54px; }
  :global([data-d='B']) .fm-u {
    border: 0; border-left: 1px solid var(--d-line);
    background: transparent; border-radius: 0;
  }
  :global([data-d='B']) .fm-radios { gap: 0; }
  :global([data-d='B']) .fm-radios .fm-opt {
    min-height: 27px; padding-inline: var(--d-p2); margin-left: -1px;
    border: 1px solid var(--d-line);
  }
  :global([data-d='B']) .fm-radios .fm-opt:first-child { margin-left: 0; }
  :global([data-d='B']) .fm-radios .fm-in:checked ~ .fm-opt-txt { font-weight: var(--d-w-semi); }
  :global([data-d='B']) .fm-mark { width: 12px; height: 12px; border-radius: 0; }
  :global([data-d='B']) .fm-mark svg { width: 8px; height: 8px; }
  :global([data-d='B']) .fm-mark--rd::after { width: 6px; height: 6px; border-radius: 0; }
  :global([data-d='B']) .fm-sw { width: 30px; height: 15px; border-radius: 0; }
  :global([data-d='B']) .fm-sw::after { width: 9px; height: 9px; top: 2px; left: 2px; border-radius: 0; }
  :global([data-d='B']) .fm-in:checked + .fm-sw::after { transform: translateX(13px); }
  :global([data-d='B']) .fm-f--bad { background: var(--d-crit-band); outline: 1px solid var(--d-crit); outline-offset: -1px; }
  :global([data-d='B']) .fm-cap { margin: 0 0 -1px; }

  /* ======================================================================
     C · MARCA — el bloque se anuncia por su cabecera. El buscador tiene su
     etiqueta en una barra teal maciza; la leyenda del fieldset y el título
     de cada sección son bandas de marca a sangre dentro del panel.
     ====================================================================== */
  :global([data-d='C']) .fm-seek { padding: 0; gap: 0; overflow: hidden; }
  :global([data-d='C']) .fm-seek-lab {
    background: var(--d-brand); color: var(--d-brand-ink);
    padding: var(--d-p1) var(--d-p3);
  }
  :global([data-d='C']) .fm-seek-ctl { padding: var(--d-p2) var(--d-p3); }
  :global([data-d='C']) .fm-seek-hint { padding: 0 var(--d-p3) var(--d-p2); }
  :global([data-d='C']) .fm-seek-btn {
    background: var(--d-brand); color: var(--d-brand-ink); border-color: var(--d-brand);
  }
  :global([data-d='C']) .fm-leg {
    background: var(--d-brand); color: var(--d-brand-ink);
    margin: 0 calc(-1 * var(--d-p3)) var(--d-p3);
    padding: var(--d-p1) var(--d-p3);
  }
  :global([data-d='C']) .fm-cap {
    background: var(--d-accent-soft); color: var(--d-brand);
    margin: 0 calc(-1 * var(--d-p3)) var(--d-p2);
    padding: var(--d-p1) var(--d-p3);
  }
  :global([data-d='C']) .fm-u {
    background: var(--d-accent-soft); color: var(--d-brand);
    border-color: var(--d-accent-edge); border-left: 0;
  }
  :global([data-d='C']) .fm-f--bad .fm-lab { color: var(--d-crit); }
  :global([data-d='C']) .fm-msg { background: var(--d-crit-band); padding: 4px var(--d-p2); border-radius: var(--d-r); }

  /* ======================================================================
     D · PESO — cada bloque es una masa: 2px de tinta y sombra sólida a 4px.
     La casilla, el radio y el interruptor son cuadrados con su propia
     sombra dura y se MUEVEN hacia ella al presionarlos.
     ====================================================================== */
  :global([data-d='D']) .fm-seek { border-color: var(--d-ink); box-shadow: var(--d-shadow); }
  :global([data-d='D']) .fm-set {
    border: var(--d-bw) solid var(--d-ink); box-shadow: var(--d-shadow);
    background: var(--d-surface); padding: var(--d-p1) var(--d-p3) var(--d-p3);
  }
  :global([data-d='D']) .fm-leg {
    background: var(--d-ink); color: var(--d-ink-on);
    padding: 3px var(--d-p2); margin-left: calc(-1 * var(--d-p1));
  }
  :global([data-d='D']) .fm-opts,
  :global([data-d='D']) .fm-states {
    border: var(--d-bw) solid var(--d-ink); box-shadow: var(--d-shadow);
    background: var(--d-surface); padding: var(--d-p2) var(--d-p3) var(--d-p3);
  }
  :global([data-d='D']) .fm-u {
    background: var(--d-accent-soft); color: var(--d-ink);
    font-weight: var(--d-w-bold); text-transform: uppercase;
    border-color: var(--d-ink); border-left: 0;
  }
  :global([data-d='D']) .fm-mark {
    width: 20px; height: 20px; border-radius: 0;
    border-color: var(--d-ink); box-shadow: 2px 2px 0 var(--d-ink);
  }
  :global([data-d='D']) .fm-mark--rd { border-radius: 0; }
  :global([data-d='D']) .fm-mark--rd::after { width: 9px; height: 9px; border-radius: 0; }
  :global([data-d='D']) .fm-sw {
    width: 44px; height: 24px; border-radius: 0;
    border-color: var(--d-ink); box-shadow: 2px 2px 0 var(--d-ink);
  }
  :global([data-d='D']) .fm-sw::after {
    width: 14px; height: 14px; top: 3px; left: 3px; border-radius: 0; background: var(--d-ink);
  }
  :global([data-d='D']) .fm-in:checked + .fm-sw::after { transform: translateX(21px); background: var(--d-ink-on); }
  :global([data-d='D']) .fm-opt:active .fm-mark,
  :global([data-d='D']) .fm-opt:active .fm-sw { transform: translate(2px, 2px); box-shadow: none; }
  :global([data-d='D']) .fm-f--bad {
    background: var(--d-crit-band); border: var(--d-bw) solid var(--d-ink);
    box-shadow: var(--d-shadow); padding: var(--d-p2);
  }
  :global([data-d='D']) .fm-state { font-weight: var(--d-w-bold); color: var(--d-ink); }

  /* ======================================================================
     E · AIRE — ni un borde en toda la celda. El campo es un POZO relleno de
     50px con la unidad flotando dentro; el buscador es una pastilla suelta;
     las secciones se separan solo con espacio.
     ====================================================================== */
  :global([data-d='E']) .fm-seek {
    background: transparent; border: 0; box-shadow: none; padding: 0; gap: var(--d-p1);
  }
  :global([data-d='E']) .fm-seek-ctl { gap: var(--d-p2); }
  :global([data-d='E']) .fm-q { border-radius: var(--d-r-pill); padding-inline: var(--d-p3); }
  :global([data-d='E']) .fm-body { gap: var(--d-p4); }
  :global([data-d='E']) .fm-grid { gap: var(--d-p3); }
  :global([data-d='E']) .fm-leg {
    font-size: var(--d-t-lg); font-weight: var(--d-w-semi);
    letter-spacing: -.015em; color: var(--d-ink); margin-bottom: var(--d-p3);
  }
  :global([data-d='E']) .fm-cap { margin-bottom: var(--d-p2); }
  :global([data-d='E']) .fm-unit { position: relative; }
  :global([data-d='E']) .fm-unit > .fm-inp { border-radius: 14px; padding-right: 48px; }
  :global([data-d='E']) .fm-u {
    position: absolute; right: var(--d-p2); top: 0; bottom: 0;
    border: 0; border-radius: 0; background: transparent;
    font-size: var(--d-t-sm); min-width: 0;
  }
  :global([data-d='E']) .fm-mark {
    width: 24px; height: 24px; border: 0; background: var(--d-sunk); border-radius: 8px;
  }
  :global([data-d='E']) .fm-mark svg { width: 13px; height: 13px; }
  :global([data-d='E']) .fm-mark--rd { border-radius: 999px; }
  :global([data-d='E']) .fm-sw { width: 52px; height: 30px; border: 0; background: var(--d-sunk); }
  :global([data-d='E']) .fm-sw::after {
    width: 24px; height: 24px; top: 3px; left: 3px;
    background: var(--d-surface); box-shadow: var(--d-shadow);
  }
  :global([data-d='E']) .fm-in:checked + .fm-sw::after { transform: translateX(22px); background: var(--d-surface); }
  :global([data-d='E']) .fm-stack { gap: var(--d-p1); }
  :global([data-d='E']) .fm-f--bad .fm-inp { background: var(--d-crit-band); color: var(--d-crit); border: 0; }
  :global([data-d='E']) .fm-f--off .fm-inp[disabled] { color: var(--d-ink-3); border: 0; }
  :global([data-d='E']) .fm-msg { padding-inline: var(--d-p2); }
  :global([data-d='E']) .fm-hint { padding-inline: var(--d-p2); }
  :global([data-d='E']) .d-btn { border: 0; }
  :global([data-d='E']) .fm-seek-btn,
  :global([data-d='E']) .fm-acts .d-btn { background: var(--d-accent-soft); }
  :global([data-d='E']) .fm-acts .d-btn--primary { background: var(--d-accent); }

  /* ======================================================================
     F · TERMINAL — el campo es una línea de prompt: etiqueta a la izquierda
     en una columna de caracteres, valor a la derecha, cursor al final del
     buscador. Casilla y radio son [x] y (•); el interruptor es un bloque de
     color detrás de la palabra.
     ====================================================================== */
  :global([data-d='F']) .fm { padding: var(--d-p2); gap: var(--d-p2); }
  :global([data-d='F']) .fm-seek {
    display: flex; align-items: center; flex-wrap: wrap; gap: var(--d-p1) var(--d-p2);
    background: var(--d-sunk); border: 0; border-radius: 0; box-shadow: none;
    padding: var(--d-p1) var(--d-p2);
  }
  :global([data-d='F']) .fm-seek-lab { flex: none; }
  :global([data-d='F']) .fm-seek-ctl { flex: 1 1 160px; gap: 0; flex-wrap: nowrap; align-items: center; }
  :global([data-d='F']) .fm-seek-ctl::after { content: '▌'; flex: none; color: var(--d-accent); }
  :global([data-d='F']) .fm-q { border: 0; background: transparent; padding-inline: 0; }
  :global([data-d='F']) .fm-seek-hint { flex-basis: 100%; }
  :global([data-d='F']) .fm-set { border: 1px solid var(--d-line); padding: var(--d-p1) var(--d-p2) var(--d-p2); }
  :global([data-d='F']) .fm-leg { color: var(--d-accent); padding-inline: var(--d-p1); margin-bottom: var(--d-p1); }
  :global([data-d='F']) .fm-leg::before { content: '── '; color: var(--d-line); }
  :global([data-d='F']) .fm-leg::after { content: ' ─────'; color: var(--d-line); }
  :global([data-d='F']) .fm-grid { grid-template-columns: 1fr; gap: 0; }
  :global([data-d='F']) .fm-f {
    grid-template-columns: minmax(0, 14ch) minmax(0, 1fr);
    gap: 0 var(--d-p1); align-items: start; padding-block: 1px;
  }
  :global([data-d='F']) .fm-lab { padding-top: 3px; }
  :global([data-d='F']) .fm-u {
    border: 0; border-radius: 0; background: transparent;
    min-width: 0; padding-left: var(--d-p1); justify-content: flex-start;
  }
  :global([data-d='F']) .fm-cap { margin-bottom: 0; }
  :global([data-d='F']) .fm-stack { gap: 0; }
  :global([data-d='F']) .fm-opt { gap: var(--d-p1); }
  :global([data-d='F']) .fm-mark {
    width: auto; height: auto; border: 0; border-radius: 0;
    background: transparent; color: var(--d-accent); font-family: var(--d-mono);
  }
  :global([data-d='F']) .fm-mark svg { display: none; }
  :global([data-d='F']) .fm-mark--ck::before { content: '[ ]'; }
  :global([data-d='F']) .fm-in:checked + .fm-mark { background: transparent; color: var(--d-accent); }
  :global([data-d='F']) .fm-in:checked + .fm-mark--ck::before { content: '[x]'; }
  :global([data-d='F']) .fm-mark--rd::after {
    content: '( )'; width: auto; height: auto; background: transparent; border-radius: 0;
  }
  :global([data-d='F']) .fm-in:checked + .fm-mark--rd::after { content: '(•)'; }
  :global([data-d='F']) .fm-sw {
    width: auto; height: auto; border: 0; border-radius: 0; padding: 0 5px;
    background: var(--d-neu-band); color: var(--d-neu); font-size: var(--d-t-xs);
  }
  :global([data-d='F']) .fm-sw::after {
    content: 'off'; position: static; width: auto; height: auto;
    background: transparent; border-radius: 0; transform: none;
  }
  :global([data-d='F']) .fm-in:checked + .fm-sw { background: var(--d-accent-soft); color: var(--d-accent); }
  :global([data-d='F']) .fm-in:checked + .fm-sw::after { content: 'on'; background: transparent; transform: none; }
  :global([data-d='F']) .fm-state { display: none; }
  :global([data-d='F']) .fm-msg { background: var(--d-crit-band); padding: 1px var(--d-p1); }
  :global([data-d='F']) .fm-f--bad .fm-inp { background: var(--d-crit-band); color: var(--d-crit); }

  /* ======================================================================
     G · BANDA — ninguna caja. Franjas horizontales a sangre, raíl fijo de
     etiquetas a la izquierda, y el error como franja de 3px en el canto.
     El campo es una línea de base: la unidad continúa esa misma línea.
     ====================================================================== */
  :global([data-d='G']) .fm { gap: 0; }
  :global([data-d='G']) .fm-seek {
    grid-template-columns: var(--d-rail) minmax(0, 1fr);
    gap: 0 var(--d-p3); align-items: center;
    background: var(--d-sunk); border: 0; border-block: 1px solid var(--d-line);
    border-radius: 0; box-shadow: none; padding: var(--d-p1) var(--d-p3);
  }
  :global([data-d='G']) .fm-seek-lab { text-align: right; }
  :global([data-d='G']) .fm-seek-hint { grid-column: 2; }
  :global([data-d='G']) .fm-body { padding-inline: 0; gap: 0; }
  :global([data-d='G']) .fm-grid,
  :global([data-d='G']) .fm-stack { grid-template-columns: 1fr; gap: 0; }
  :global([data-d='G']) .fm-f {
    position: relative;
    grid-template-columns: var(--d-rail) minmax(0, 1fr);
    gap: 0 var(--d-p3); align-items: baseline;
    padding: var(--d-p2) var(--d-p3);
    border-bottom: 1px solid var(--d-line);
  }
  :global([data-d='G']) .fm-lab { text-align: right; }
  :global([data-d='G']) .fm-f[data-tone]::before {
    content: ''; position: absolute; inset: 0 auto 0 0; width: 3px; background: var(--tone-fg);
  }
  :global([data-d='G']) .fm-f--bad .fm-inp,
  :global([data-d='G']) .fm-f--bad .fm-u { border-color: var(--d-crit); }
  :global([data-d='G']) .fm-u {
    border: 0; border-bottom: 1px solid var(--d-edge); border-radius: 0;
    background: transparent; padding: 0 0 0 6px; min-width: 0; justify-content: flex-start;
  }
  :global([data-d='G']) .fm-leg,
  :global([data-d='G']) .fm-cap {
    margin: 0; padding: var(--d-p1) var(--d-p3);
    background: var(--d-sunk); border-block: 1px solid var(--d-line);
  }
  :global([data-d='G']) .fm-opt {
    padding: var(--d-p1) var(--d-p3); border-bottom: 1px solid var(--d-line);
  }
  :global([data-d='G']) .fm-radios { gap: 0 var(--d-p3); padding-block: var(--d-p1); }
  :global([data-d='G']) .fm-radios .fm-opt { padding: 0; border-bottom: 0; min-height: 0; }
  :global([data-d='G']) .fm-radios .fm-opt-txt { border-bottom: 2px solid transparent; padding-bottom: 2px; }
  :global([data-d='G']) .fm-radios .fm-in:checked ~ .fm-opt-txt {
    border-bottom-color: var(--d-ink); font-weight: var(--d-w-semi);
  }
  :global([data-d='G']) .fm-mark { border-radius: 0; background: transparent; }
  :global([data-d='G']) .fm-mark--rd { border-radius: 999px; }
  :global([data-d='G']) .fm-sw { border-radius: 0; }
  :global([data-d='G']) .fm-sw::after { border-radius: 0; }
  :global([data-d='G']) .fm-note { padding: var(--d-p2) var(--d-p3); }
  :global([data-d='G']) .fm-foot {
    justify-content: flex-start;
    padding-left: calc(var(--d-rail) + var(--d-p3) + var(--d-p3));
  }

  /* ======================================================================
     H · FICHA — el buscador lleva su propia PESTAÑA con la etiqueta, igual
     que la ficha. Regla doble bajo cada encabezado, bloques manila
     insertados en la ficha blanca y canto apilado bajo cada control.
     ====================================================================== */
  :global([data-d='H']) .fm-seek {
    position: relative; margin-top: 26px; margin-bottom: 5px;
    border-color: var(--d-edge); border-radius: var(--d-r);
  }
  :global([data-d='H']) .fm-seek-lab {
    position: absolute; top: -25px; left: -1px;
    padding: 5px var(--d-p3) 6px; max-width: calc(100% + 2px);
    background: var(--d-sunk);
    border: 1px solid var(--d-edge); border-bottom: 0;
    border-radius: 4px 4px 0 0;
  }
  :global([data-d='H']) .fm-leg,
  :global([data-d='H']) .fm-cap {
    width: 100%; padding-bottom: 5px; margin-bottom: var(--d-p2);
    border-bottom: 3px double var(--d-line);
  }
  :global([data-d='H']) .fm-opts,
  :global([data-d='H']) .fm-states {
    background: var(--d-sunk);
    border: 1px solid var(--d-line); border-radius: var(--d-r);
    box-shadow: 0 1px 0 var(--d-edge);
    padding: var(--d-p2) var(--d-p3) var(--d-p3);
  }
  :global([data-d='H']) .fm-mark,
  :global([data-d='H']) .fm-sw { box-shadow: 0 1px 0 var(--d-edge); }
  :global([data-d='H']) .fm-opt:active .fm-mark,
  :global([data-d='H']) .fm-opt:active .fm-sw { transform: translateY(1px); box-shadow: none; }
  :global([data-d='H']) .fm-msg { background: var(--d-crit-band); padding: 4px var(--d-p2); border-radius: var(--d-r); }
  :global([data-d='H']) .fm-set { padding-bottom: var(--d-p1); }

  /* ======================================================================
     RESPONSIVE — hasta 380px. Cuando la celda se estrecha, el raíl de G y la
     columna de caracteres de F se apilan: un raíl de 148px dentro de 300px
     no deja nada para el contenido.
     ====================================================================== */
  @container fm (max-width: 430px) {
    :global([data-d='G']) .fm-seek,
    :global([data-d='G']) .fm-f { grid-template-columns: minmax(0, 1fr); gap: 4px; }
    :global([data-d='G']) .fm-seek-hint { grid-column: 1; }
    :global([data-d='G']) .fm-lab,
    :global([data-d='G']) .fm-seek-lab { text-align: left; }
    :global([data-d='G']) .fm-foot { padding-left: var(--d-p3); }
    :global([data-d='F']) .fm-f { grid-template-columns: minmax(0, 1fr); }
    :global([data-d='B']) .fm-seek { grid-template-columns: minmax(0, 1fr); }
    :global([data-d='B']) .fm-seek-lab { border-right: 0; border-bottom: 1px solid var(--d-edge); padding-block: 3px; }
  }
  @media (max-width: 720px) {
    :global([data-d='G']) .fm-foot { padding-left: var(--d-p3); }
  }
</style>
