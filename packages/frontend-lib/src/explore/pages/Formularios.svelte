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
              <legend class="fm-leg">Equipo y medición</legend>

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

            <!-- casilla + interruptor.
                 data-tone no pinta nada por sí solo: solo declara de qué
                 informa el bloque. Las diecinueve tienen los tokens de tono,
                 así que las que saben leerlo lo usan (S lo tiñe en la sombra,
                 M lo derrama por detrás, K lo irradia, N lo corre por el
                 carril) y las demás lo ignoran sin cambiar de aspecto. -->
            <div class="fm-opts" data-tone="info">
              <h5 class="fm-cap">Al guardar</h5>
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
            <div class="fm-states" data-tone="critical">
              <h5 class="fm-cap">Estados del campo</h5>
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
  /* EL NOMBRE DE UNA SECCIÓN ES UN ENCABEZADO, NO UNA VERSALITA.
     Los tres bloques del cuerpo se llamaban con la MISMA versalita gris de
     11px que llevan las ocho etiquetas de campo. Con todo en el mismo tono no
     hay jerarquía: el ojo no distingue qué nombra una sección y qué rotula un
     control, y hay que leer para saberlo. Ahora la sección es tinta plena en
     caja normal y la etiqueta se queda un escalón abajo. La página no ronda
     ni un epígrafe. */
  .fm-leg, .fm-cap {
    display: block; padding: 0; margin: 0 0 var(--d-p2);
    font-size: var(--d-t-sm); font-weight: var(--d-w-semi);
    letter-spacing: -.01em; text-transform: none; color: var(--d-ink);
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
  /* El sufijo lleva la UNIDAD, que es dato duro: «312» sin «h» no vale nada.
     Iba en --d-ink-3 sobre --d-sunk, o sea gris claro sobre gris claro: 4,5:1
     raspando en A y por debajo en varias. Sube a --d-ink-2 en las diecinueve. */
  .fm-u {
    flex: none; display: flex; align-items: center; justify-content: center;
    min-width: 34px; padding-inline: var(--d-p1);
    font-size: var(--d-t-xs); font-weight: var(--d-w-med); color: var(--d-ink-2);
    background: var(--d-sunk);
    border: max(var(--d-bw), 1px) solid var(--d-edge); border-left: 0;
    border-radius: 0 var(--d-r) var(--d-r) 0;
  }

  /* ── casilla · radio · interruptor ──────────────────────────────────── */
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
  /* Estado del interruptor en PALABRA, nunca solo en color. Iba en versalitas
     de 11px: la palabra que dice si el aviso sale o no sale es lo último que
     conviene poner en caja alta y gris claro. */
  .fm-state {
    flex: none; font-size: var(--d-t-xs); font-weight: var(--d-w-semi);
    color: var(--d-ink-2); letter-spacing: normal; text-transform: none;
  }
  .fm-state::after { content: 'Desactivado'; }
  .fm-in:checked ~ .fm-state::after { content: 'Activado'; }

  /* ── error y bloqueo ────────────────────────────────────────────────── */
  .fm-f--bad .fm-inp,
  .fm-f--bad .fm-u { border-color: var(--d-crit); }
  /* Bloqueado no es ilegible: «Salida/devolución» es la respuesta a «¿de
     dónde salió este número?» y se lee tanto como el resto. */
  .fm-f--off .fm-inp[disabled] { background: var(--d-sunk); color: var(--d-ink-2); cursor: not-allowed; }

  /* ── pie ────────────────────────────────────────────────────────────── */
  .fm-foot { justify-content: space-between; flex-wrap: wrap; gap: var(--d-p1); }
  .fm-acts { flex-wrap: wrap; justify-content: flex-end; }

  /* ======================================================================
     A · ELEVACIÓN — la incumbente, y por eso la que hay que llevar a su mejor
     versión antes de compararla: perderle contra un hombre de paja no sirve.

     LA ALTURA ES EL DATO, no un adorno. Tres alturas y ninguna más:
       hundido    agrupa (las bandejas de sección)
       apoyado    no se puede operar (el campo bloqueado no proyecta nada)
       levantado  se toca, y sube más cuando reclama la mano (foco, error)
     Un técnico distingue bandeja de campo sin leer una palabra, y el campo
     bloqueado se delata solo porque no tiene sombra.

     Las etiquetas dejan las versalitas: en A los rótulos de campo eran ocho
     corridas de 11px en caja alta y gris, el mismo tono que la sección.
     ====================================================================== */
  :global([data-d='A']) .fm-body { gap: var(--d-p4); }
  :global([data-d='A']) .fm-lab {
    font-size: var(--d-t-xs); font-weight: var(--d-w-med);
    letter-spacing: normal; text-transform: none; color: var(--d-ink-2);
  }
  :global([data-d='A']) .fm-seek { transition: box-shadow 140ms ease; }
  :global([data-d='A']) .fm-seek:focus-within { box-shadow: var(--d-shadow-lg); }
  /* Hundido: agrupa sin dibujar una sola línea. */
  :global([data-d='A']) .fm-opts,
  :global([data-d='A']) .fm-states {
    background: var(--d-sunk); border-radius: var(--d-r-lg); padding: var(--d-p3);
  }
  /* Levantado: dentro de la bandeja, todo lo operable vuelve a subir. */
  :global([data-d='A']) .fm-states .fm-inp { background: var(--d-surface); box-shadow: var(--d-shadow); }
  :global([data-d='A']) .fm-mark,
  :global([data-d='A']) .fm-sw { box-shadow: var(--d-shadow); }
  /* Y sube un escalón más lo que tiene el cursor encima. Es la única moción
     de A y hace un trabajo: sin bordes de color, la altura dice dónde estás. */
  :global([data-d='A']) .fm-inp { transition: box-shadow 140ms ease; }
  :global([data-d='A']) .fm-inp:focus { box-shadow: var(--d-shadow-lg); }
  :global([data-d='A']) .fm-choices .fm-opt {
    background: var(--d-surface); border-radius: var(--d-r);
    padding-inline: var(--d-p2); box-shadow: var(--d-shadow);
  }
  /* El error es lo más alto de la bandeja: es lo único que reclama la mano. */
  :global([data-d='A']) .fm-f--bad {
    background: var(--d-surface); border-radius: var(--d-r);
    padding: var(--d-p2); box-shadow: var(--d-shadow-lg);
  }
  :global([data-d='A']) .fm-f--bad .fm-inp,
  :global([data-d='A']) .fm-f--bad .fm-u { box-shadow: none; }
  :global([data-d='A']) .fm-f--bad .fm-inp:focus { box-shadow: var(--d-shadow); }
  /* Apoyado: sin sombra, pegado al fondo de la bandeja. No se levanta. */
  :global([data-d='A']) .fm-f--off .fm-inp[disabled] {
    background: var(--d-sunk); box-shadow: none;
  }
  :global([data-d='A']) .fm-set { padding-bottom: var(--d-p1); }

  /* ======================================================================
     B · INSTRUMENTO — todo es celda. El buscador es un marco continuo con
     separadores internos; cada campo es una celda de 27px que COMPARTE borde
     con la de al lado; los radios son un control segmentado con bordes
     colapsados.

     LO QUE CAMBIA EN ESTA RONDA, y es lo que le faltaba para ser un plano:
     los tres bloques del cuerpo eran un marco (el fieldset) más dos cajas
     sueltas sin marco. En un plano no hay tarjetas: hay un dibujo. Ahora los
     tres colapsan canto contra canto en un solo marco continuo y las marcas
     de esquina abrazan el conjunto, no el primer bloque.

     Y las cifras van en monoespaciada. En un instrumento un número se lee por
     columna: 312 sobre 180 alineados al dígito se comparan de un vistazo,
     en proporcional hay que leerlos. Es la única dirección donde la densidad
     es de cabina, así que es la única donde esto se paga solo.

     Las versalitas se QUEDAN, pero solo en las etiquetas de campo: es la
     silueta declarada de B («las etiquetas van fuera del marco, en
     versalitas»), no un adorno. Los nombres de sección son encabezados como
     en las otras dieciocho.
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
  /* EL DIBUJO CONTINUO. Los tres bloques comparten canto en vez de separarse:
     gap 0 y un pelo de solape para que las dos líneas de contacto sean una. */
  :global([data-d='B']) .fm-body { gap: 0; }
  :global([data-d='B']) .fm-set,
  :global([data-d='B']) .fm-opts,
  :global([data-d='B']) .fm-states {
    position: relative; border: 1px solid var(--d-edge);
    padding: var(--d-p1) var(--d-p2) var(--d-p2);
  }
  :global([data-d='B']) .fm-opts,
  :global([data-d='B']) .fm-states { margin-top: -1px; }
  /* Las marcas de esquina abrazan el DIBUJO entero: la de arriba en el primer
     bloque, la de abajo en el último. Antes las dos vivían en el fieldset y
     marcaban una caja que ya no existe. */
  :global([data-d='B']) .fm-set::before,
  :global([data-d='B']) .fm-states::after {
    content: ''; position: absolute; width: 6px; height: 6px;
    border: 1px solid var(--d-edge); pointer-events: none;
  }
  :global([data-d='B']) .fm-set::before { top: 3px; right: 3px; border-left: 0; border-bottom: 0; }
  :global([data-d='B']) .fm-states::after { bottom: 3px; left: 3px; border-right: 0; border-top: 0; }
  :global([data-d='B']) .fm-leg,
  :global([data-d='B']) .fm-cap {
    margin: 0 0 var(--d-p1); padding-inline: var(--d-p1);
    font-size: var(--d-t-xs);
  }
  :global([data-d='B']) .fm-note { padding: var(--d-p2) var(--d-p2) 0; }
  /* Etiqueta de campo: versalita, que es la silueta de B, y en --d-ink-2 para
     que 10px en caja alta no queden en gris de segunda. */
  :global([data-d='B']) .fm-lab { color: var(--d-ink-2); }
  /* Cifras en monoespaciada: se comparan por columna, no por palabra. */
  :global([data-d='B']) .d-num { font-family: var(--d-mono); }
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

  /* ======================================================================
     C · MARCA — el bloque se anuncia por su cabecera.

     LA CORRECCIÓN DE ESTA RONDA ES DE RACIÓN, NO DE FORMA. Si el color es
     estructura, tiene que servir para saber DÓNDE estás, y para eso hace
     falta que no esté en todas partes. La versión anterior gastaba teal en la
     cabecera del panel, la barra del buscador, el botón del buscador, la
     leyenda, los dos títulos de sección, el sufijo de unidad Y las ocho
     etiquetas de campo. Con quince piezas teal, el teal deja de identificar y
     pasa a ser el fondo.

     Quedan tres niveles y ni uno más:
       marca maciza     identifica el bloque   (panel, buscador, leyenda)
       marca lavada     nombra la subsección   (los dos títulos, la unidad)
       marca de trazo   la acción secundaria   (el botón del buscador)
     Las etiquetas de campo vuelven a tinta. Ocho rótulos teal no identifican
     nada; el que tiene que resaltar es el bloque, no cada renglón.
     ====================================================================== */
  :global([data-d='C']) .fm-seek { padding: 0; gap: 0; overflow: hidden; }
  :global([data-d='C']) .fm-seek-lab {
    background: var(--d-brand); color: var(--d-brand-ink);
    padding: var(--d-p1) var(--d-p3);
  }
  :global([data-d='C']) .fm-seek-ctl { padding: var(--d-p2) var(--d-p3); }
  :global([data-d='C']) .fm-seek-hint { padding: 0 var(--d-p3) var(--d-p2); }
  /* Trazo, no macizo: la barra de arriba ya dijo de quién es este bloque, y
     el único primario de la celda vive en el pie. */
  :global([data-d='C']) .fm-seek-btn {
    background: var(--d-surface); color: var(--d-brand); border-color: var(--d-brand);
  }
  :global([data-d='C']) .fm-seek-btn:hover { background: var(--d-accent-soft); }
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
  /* Tinta, no marca. Menos el rótulo del buscador: ese va DENTRO de la banda
     maciza de marca y su tinta ya la fijó la regla de arriba. Sin el :not() las
     dos reglas pesan (0,2,0), gana la última por orden de archivo, y el rótulo
     se queda con tinta oscura sobre teal — 1.15 de contraste. */
  :global([data-d='C']) .fm-lab:not(.fm-seek-lab) { color: var(--d-ink-2); }
  /* El error usa la misma gramática de banda que la marca, en su propio tono:
     así el bloque roto se anuncia igual que se anuncia un bloque de marca. */
  :global([data-d='C']) .fm-f--bad .fm-lab { color: var(--d-crit); }
  :global([data-d='C']) .fm-msg {
    background: var(--d-crit-band); color: var(--d-crit);
    padding: 4px var(--d-p2); border-radius: var(--d-r);
    box-shadow: inset 3px 0 0 var(--d-crit);
  }

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
     I · CRISTAL — el campo es un POZO de vidrio: filo especular arriba,
     profundidad abajo, y el campo de manchas visible a través.

     LA TRAMPA, ESCRITA. Vidrio sobre vidrio se enturbia: dos backdrop-filter
     encadenados desenfocan el desenfoque y el resultado es plástico gris. Así
     que el blur vive UNA sola vez por capa apoyada en el fondo — el buscador,
     que se apoya directo en las manchas, y el panel, que ya lo trae de
     directions.css. Todo lo que va DENTRO del panel se anida con
     TRANSPARENCIA y filo de luz, nunca con más desenfoque, y lo apaga
     explícitamente para que nadie lo reintroduzca por herencia.
     ====================================================================== */
  :global([data-d='I']) .fm-seek {
    padding: var(--d-p3);
    backdrop-filter: blur(18px) saturate(1.5);
    -webkit-backdrop-filter: blur(18px) saturate(1.5);
    border-color: var(--d-line);
    transition: box-shadow 160ms ease;
  }
  :global([data-d='I']) .fm-seek:focus-within { box-shadow: var(--d-shadow-lg); }
  :global([data-d='I']) .fm-seek-ctl { gap: var(--d-p2); }
  /* Las etiquetas dejan las versalitas. En vidrio, la caja alta tracked de
     11px sobre un fondo que cambia de tono cada 200px es lo primero que se
     vuelve ilegible: el rótulo tiene que ganarle al campo de manchas por
     tamaño y peso, no por espaciado. */
  :global([data-d='I']) .fm-lab {
    font-size: var(--d-t-xs); font-weight: var(--d-w-med);
    letter-spacing: normal; text-transform: none; color: var(--d-ink-2);
  }
  /* Una sola escala de radio: el pozo grande a --d-r, la casilla a la mitad.
     Un cuadrado de 4px dentro de una dirección de 14 y 24 es de otra familia. */
  :global([data-d='I']) .fm-mark { border-radius: calc(var(--d-r) / 2); }
  :global([data-d='I']) .fm-mark--rd { border-radius: var(--d-r-pill); }
  /* Los pozos flotan sueltos y separados: I es vidrio DISCRETO. (O, la mezcla,
     va por el camino opuesto y los suelda en losas segmentadas.) */
  :global([data-d='I']) .fm-body { gap: var(--d-p4); }
  :global([data-d='I']) .fm-grid { gap: var(--d-p3); }
  :global([data-d='I']) .fm-opts,
  :global([data-d='I']) .fm-states {
    background: var(--d-sunk);
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r-lg);
    padding: var(--d-p3);
    box-shadow: inset 0 1px 0 var(--d-line);
    /* anidado por transparencia, NO por más desenfoque */
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  :global([data-d='I']) .fm-set { padding-bottom: var(--d-p1); }
  :global([data-d='I']) .fm-leg,
  :global([data-d='I']) .fm-cap {
    padding-bottom: var(--d-p1);
    border-bottom: max(var(--d-bw), 1px) solid var(--d-line);
  }
  /* El pozo: línea especular en el labio de arriba y sombra interior corta.
     Sin el filo de luz, el vidrio se lee como papel translúcido. */
  :global([data-d='I']) .fm-inp {
    box-shadow: inset 0 1px 0 var(--d-line), inset 0 4px 10px -6px var(--d-edge);
    transition: box-shadow 160ms ease;
  }
  /* Al enfocar, la pieza de vidrio se despega del campo y proyecta. Es la
     única moción de I y hace falta: sobre un fondo que ya tiene tres manchas
     de color, un borde de foco de 2px se pierde y la altura no. */
  :global([data-d='I']) .fm-inp:focus {
    box-shadow: inset 0 1px 0 var(--d-line), 0 8px 22px -10px var(--d-edge);
  }
  :global([data-d='I']) .fm-u {
    background: var(--d-sunk);
    border-color: var(--d-line);
    border-left: 0;
    color: var(--d-ink-2);
    box-shadow: inset 0 1px 0 var(--d-line);
  }
  :global([data-d='I']) .fm-mark {
    background: var(--d-sunk);
    border-color: var(--d-line);
    box-shadow: inset 0 1px 0 var(--d-line), 0 2px 7px -4px var(--d-edge);
  }
  :global([data-d='I']) .fm-in:checked + .fm-mark {
    box-shadow: inset 0 1px 0 var(--d-line), 0 4px 12px -4px var(--d-accent-edge);
  }
  :global([data-d='I']) .fm-sw {
    background: var(--d-sunk);
    border-color: var(--d-line);
    box-shadow: inset 0 2px 5px -2px var(--d-edge);
  }
  :global([data-d='I']) .fm-sw::after { box-shadow: 0 1px 4px -1px var(--d-edge); }
  :global([data-d='I']) .fm-opt { gap: var(--d-p2); }
  /* El error no pone un filo rojo sobre el vidrio: tiñe el vidrio. */
  :global([data-d='I']) .fm-f--bad {
    background: var(--tone-band);
    border-radius: var(--d-r-lg);
    padding: var(--d-p2);
    box-shadow: inset 0 1px 0 var(--d-line);
  }
  :global([data-d='I']) .fm-f--bad .fm-inp,
  :global([data-d='I']) .fm-f--bad .fm-u { border-color: var(--tone-edge); }
  :global([data-d='I']) .fm-msg {
    background: var(--tone-band);
    border-radius: var(--d-r);
    padding: 4px var(--d-p2);
  }
  :global([data-d='I']) .fm-f--off .fm-inp[disabled] {
    background: var(--d-sunk);
    border-color: var(--d-line);
    box-shadow: none;
  }
  :global([data-d='I']) .fm-foot { border-radius: 0 0 var(--d-r-lg) var(--d-r-lg); }
  /* HALLAZGO de contraste. En I, [data-d='I'] .d-btn (0,2,0) le gana a
     .d-btn--primary (0,1,0) y le pisa el fondo: el botón primario queda con
     tinta blanca sobre vidrio blanco, ilegible. Las otras direcciones de
     vidrio (J, K, N, O, P, Q, R) tienen su propia regla --primary en
     directions.css; I y M son las dos que no. No puedo tocar ese archivo, así
     que repongo el fondo acá, donde vive mi pie. */
  :global([data-d='I']) .fm-acts .d-btn--primary {
    background: var(--d-accent);
    color: var(--d-accent-ink);
  }

  /* ======================================================================
     J · LACA — ninguna superficie es color plano. Cada bloque propio de esta
     página es una placa: relleno degradado, realce blanco duro en el canto de
     arriba (viene dentro de --d-shadow) y sombra larga debajo.

     EL BARRIDO. Vive en el tercio superior y se pinta en un ::after, que por
     definición se pinta DESPUÉS de todo el contenido de la placa — o sea,
     encima del texto y de los controles. Por eso lleva pointer-events: none
     sin excepción: sin eso, el brillo se come el clic de todo lo que tape.

     HALLAZGO: no hay token de brillo (--d-gloss). directions.css lo escribe a
     mano en .d-panel::after. Acá no invento un rgba blanco: la placa se apoya
     en --d-sunk-fill (más oscura) y el barrido es --d-surface (más clara)
     recortado con una máscara que solo usa alfa, no paleta.
     ====================================================================== */
  :global([data-d='J']) .fm-seek,
  :global([data-d='J']) .fm-set,
  :global([data-d='J']) .fm-opts,
  :global([data-d='J']) .fm-states {
    position: relative;
    overflow: hidden;
    background: var(--d-sunk-fill);
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r-lg);
    padding: var(--d-p3);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='J']) .fm-seek::after,
  :global([data-d='J']) .fm-set::after,
  :global([data-d='J']) .fm-opts::after,
  :global([data-d='J']) .fm-states::after {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 38%;
    background: var(--d-surface);
    -webkit-mask-image: linear-gradient(180deg, currentColor 0%, transparent 100%);
    mask-image: linear-gradient(180deg, currentColor 0%, transparent 100%);
    opacity: .75;
    pointer-events: none;
  }
  /* El contenido va POR ENCIMA del barrido; el barrido solo baña la placa. */
  :global([data-d='J']) .fm-seek > *,
  :global([data-d='J']) .fm-set > *,
  :global([data-d='J']) .fm-opts > *,
  :global([data-d='J']) .fm-states > * { position: relative; z-index: 1; }
  :global([data-d='J']) .fm-leg { margin-bottom: var(--d-p2); }
  :global([data-d='J']) .fm-u {
    background: var(--d-sunk-fill);
    border-color: var(--d-edge);
    box-shadow: inset 0 1px 0 var(--d-line);
  }
  :global([data-d='J']) .fm-mark {
    background: var(--d-surface-fill);
    border-color: var(--d-edge);
    box-shadow: 0 2px 4px -1px var(--d-edge), inset 0 1px 0 var(--d-surface);
  }
  :global([data-d='J']) .fm-in:checked + .fm-mark {
    background: var(--d-accent-fill);
    border-color: var(--d-accent-edge);
  }
  :global([data-d='J']) .fm-sw {
    background: var(--d-sunk-fill);
    border-color: var(--d-edge);
    box-shadow: inset 0 2px 4px -1px var(--d-edge);
  }
  :global([data-d='J']) .fm-sw::after {
    background: var(--d-surface-fill);
    box-shadow: 0 1px 3px -1px var(--d-edge);
  }
  :global([data-d='J']) .fm-in:checked + .fm-sw { background: var(--d-accent-fill); }
  /* Al presionar, el brillo se apaga y la pieza se hunde. */
  :global([data-d='J']) .fm-opt:active .fm-mark,
  :global([data-d='J']) .fm-opt:active .fm-sw {
    transform: translateY(1px);
    box-shadow: inset 0 2px 5px -1px var(--d-edge);
  }
  :global([data-d='J']) .fm-f--bad .fm-inp,
  :global([data-d='J']) .fm-f--bad .fm-u {
    background: var(--tone-band);
    border-color: var(--d-crit);
  }
  :global([data-d='J']) .fm-msg {
    background: var(--tone-band);
    border-radius: var(--d-r);
    padding: 4px var(--d-p2);
    box-shadow: inset 0 1px 0 var(--d-surface);
  }
  :global([data-d='J']) .fm-f--off .fm-inp[disabled] {
    background: var(--d-sunk-fill);
    box-shadow: inset 0 2px 4px -1px var(--d-edge);
  }
  :global([data-d='J']) .fm-foot { background: var(--d-sunk-fill); }

  /* ======================================================================
     K · HALO — cero bordes en toda la celda. Un campo existe porque irradia:
     un anillo de 1px de su propio tono más un resplandor difuso hacia afuera.
     El estado ES el color del resplandor, nunca un relleno.
     ====================================================================== */
  :global([data-d='K']) .fm-seek {
    border: 0;
    background: var(--d-sunk);
    box-shadow: var(--d-shadow);
    padding: var(--d-p3);
    transition: box-shadow 200ms ease;
  }
  :global([data-d='K']) .fm-seek:focus-within {
    box-shadow: 0 0 0 1px var(--d-accent-edge), 0 14px 60px -18px var(--d-accent);
  }
  :global([data-d='K']) .fm-body { gap: var(--d-p4); }
  /* Cada bloque irradia en el tono de lo que informa: el de estados en rojo,
     el de «al guardar» en azul. Se lee desde el otro lado del cuarto. */
  :global([data-d='K']) .fm-opts,
  :global([data-d='K']) .fm-states {
    border: 0;
    border-radius: var(--d-r-lg);
    background: var(--d-sunk);
    padding: var(--d-p3);
    box-shadow: 0 0 0 1px var(--tone-edge), 0 14px 54px -20px var(--tone-fg);
  }
  :global([data-d='K']) .fm-leg,
  :global([data-d='K']) .fm-cap { color: var(--d-accent); }
  :global([data-d='K']) .fm-u {
    background: transparent;
    border: 0;
    box-shadow: inset 0 0 0 1px var(--d-neu-edge);
    border-radius: 0 var(--d-r) var(--d-r) 0;
  }
  :global([data-d='K']) .fm-mark {
    background: transparent;
    border: 0;
    box-shadow: inset 0 0 0 1px var(--d-neu-edge);
  }
  :global([data-d='K']) .fm-in:checked + .fm-mark {
    background: var(--d-accent);
    box-shadow: 0 0 0 1px var(--d-accent-edge), 0 0 22px -4px var(--d-accent);
  }
  :global([data-d='K']) .fm-sw {
    background: transparent;
    border: 0;
    box-shadow: inset 0 0 0 1px var(--d-neu-edge);
  }
  :global([data-d='K']) .fm-in:checked + .fm-sw {
    background: var(--d-accent);
    box-shadow: 0 0 0 1px var(--d-accent-edge), 0 0 26px -6px var(--d-accent);
  }
  :global([data-d='K']) .fm-in:checked ~ .fm-state { color: var(--d-accent); }
  /* El error no se rellena de rojo: el pozo se pone a irradiar rojo. */
  :global([data-d='K']) .fm-f--bad .fm-inp,
  :global([data-d='K']) .fm-f--bad .fm-u {
    border-color: transparent;
    background: transparent;
    box-shadow: inset 0 0 0 1px var(--tone-edge), 0 0 26px -8px var(--tone-fg);
  }
  :global([data-d='K']) .fm-msg { color: var(--tone-fg); }
  :global([data-d='K']) .fm-f--off .fm-inp[disabled] {
    background: transparent;
    box-shadow: inset 0 0 0 1px var(--d-neu-edge);
    opacity: .6;
  }
  :global([data-d='K']) .fm-foot { border-top: 0; box-shadow: 0 -1px 0 var(--d-neu-edge); }
  :global([data-d='K']) .fm-req { color: var(--d-crit); }

  /* ======================================================================
     L · GUIJARRO — el campo es una piedra HUNDIDA en la mesa. Cuatro radios
     distintos por contenedor y distintos entre vecinos: si los tres bloques
     compartieran los mismos cuatro, volverían a ser tarjetas. Por eso cada
     pieza de abajo lleva su propio juego, y los pozos rotan entre tres.
     ====================================================================== */
  :global([data-d='L']) .fm-seek {
    border: 0;
    border-radius: 30px 40px 26px 34px;
    padding: var(--d-p3);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='L']) .fm-opts {
    border-radius: 42px 24px 36px 28px;
    background: var(--d-sunk);
    padding: var(--d-p3);
    box-shadow: inset 4px 5px 12px -7px var(--d-ink-3);
  }
  :global([data-d='L']) .fm-states {
    border-radius: 26px 38px 22px 44px;
    background: var(--d-sunk);
    padding: var(--d-p3);
    box-shadow: inset 4px 5px 12px -7px var(--d-ink-3);
  }
  :global([data-d='L']) .fm-grid { gap: var(--d-p2) var(--d-p3); }
  /* Ningún pozo igual al de al lado. */
  :global([data-d='L']) .fm-grid > .fm-f:nth-child(3n + 2) .fm-inp { border-radius: 24px 16px 22px 18px; }
  :global([data-d='L']) .fm-grid > .fm-f:nth-child(3n) .fm-inp { border-radius: 16px 22px 26px 14px; }
  :global([data-d='L']) .fm-stack > .fm-f:nth-child(2n) .fm-inp { border-radius: 22px 18px 24px 16px; }
  :global([data-d='L']) .fm-u {
    border: 0;
    border-radius: 6px 22px 20px 6px;
    background: var(--d-sunk);
    box-shadow: inset 3px 4px 9px -6px var(--d-ink-3);
  }
  :global([data-d='L']) .fm-mark {
    border: 0;
    border-radius: 9px 6px 10px 7px;
    background: var(--d-sunk);
    box-shadow: 3px 4px 9px -5px var(--d-ink-3);
  }
  :global([data-d='L']) .fm-mark--rd { border-radius: 999px; }
  :global([data-d='L']) .fm-sw {
    border: 0;
    border-radius: 999px;
    background: var(--d-sunk);
    box-shadow: inset 3px 4px 9px -5px var(--d-ink-3);
  }
  :global([data-d='L']) .fm-sw::after { background: var(--d-ink-3); box-shadow: 2px 3px 6px -3px var(--d-ink-3); }
  :global([data-d='L']) .fm-in:checked + .fm-sw::after { background: var(--d-accent-ink); }
  :global([data-d='L']) .fm-opt:active .fm-mark { box-shadow: inset 3px 4px 9px -5px var(--d-ink-3); }
  :global([data-d='L']) .fm-f--bad {
    background: var(--tone-band);
    border-radius: 34px 22px 30px 20px;
    padding: var(--d-p2) var(--d-p3);
  }
  :global([data-d='L']) .fm-f--bad .fm-inp,
  :global([data-d='L']) .fm-f--bad .fm-u { border: 0; box-shadow: inset 3px 4px 9px -5px var(--d-crit); }
  :global([data-d='L']) .fm-msg { padding-inline: var(--d-p1); }
  :global([data-d='L']) .fm-f--off .fm-inp[disabled] { box-shadow: inset 3px 4px 9px -6px var(--d-ink-3); }
  :global([data-d='L']) .fm-seek-btn { border-radius: 22px 16px 24px 18px; }
  :global([data-d='L']) .fm-leg,
  :global([data-d='L']) .fm-cap { font-size: var(--d-t-lg); color: var(--d-ink); letter-spacing: -.01em; }
  :global([data-d='L']) .fm-hint { padding-inline: var(--d-p2); }

  /* ======================================================================
     M · BRUMA — no hay contenedores. El campo es un SUBRAYADO que se
     desvanece hacia la derecha, y lo que agrupa es una mancha desenfocada
     que se derrama por detrás. Titulares en serif con var(--d-display).

     HALLAZGO de pintado: una mancha en ::before con z-index:-1 se pinta antes
     que el fondo de cualquier bloque en flujo que la contenga, así que sin un
     contexto de apilado propio queda tapada por el fondo del escenario. Se
     resuelve con isolation:isolate en la pieza que la proyecta — se lo doy
     también a .fm-panel, cuya mancha vive en directions.css y hoy no se ve.
     ====================================================================== */
  :global([data-d='M']) .fm-panel { isolation: isolate; }
  :global([data-d='M']) .fm-seek {
    position: relative;
    isolation: isolate;
    background: none;
    border: 0;
    box-shadow: none;
    padding: var(--d-p2) 0;
  }
  :global([data-d='M']) .fm-seek::before,
  :global([data-d='M']) .fm-opts::before,
  :global([data-d='M']) .fm-states::before {
    content: '';
    position: absolute;
    inset: -20px -26px;
    background:
      radial-gradient(58% 66% at 20% 12%, var(--tone-band, var(--d-neu-band)) 0%, transparent 70%),
      radial-gradient(48% 56% at 86% 88%, var(--tone-band, var(--d-neu-band)) 0%, transparent 68%);
    filter: blur(24px);
    pointer-events: none;
    z-index: -1;
  }
  :global([data-d='M']) .fm-opts,
  :global([data-d='M']) .fm-states {
    position: relative;
    isolation: isolate;
    padding: var(--d-p2) 0;
  }
  /* La única dirección con dos familias: serif para lo que titula. */
  :global([data-d='M']) .fm-leg,
  :global([data-d='M']) .fm-cap {
    font-family: var(--d-display);
    font-size: var(--d-t-lg);
    font-weight: 400;
    letter-spacing: -.01em;
    text-transform: none;
    color: var(--d-ink);
  }
  :global([data-d='M']) .fm-note { font-family: var(--d-display); font-style: italic; }
  :global([data-d='M']) .fm-body { gap: var(--d-p4); }
  :global([data-d='M']) .fm-grid { gap: var(--d-p3); }
  /* La sans es para lo que se opera: la etiqueta de campo es un rótulo de
     trabajo, no un titular, así que sale de las versalitas y se queda en
     caja normal. La serif de arriba es la que titula. Esa es la regla de las
     dos familias, y con las versalitas puestas no se veía: caja alta tracked
     y serif compiten por el mismo puesto. */
  :global([data-d='M']) .fm-lab {
    font-family: var(--d-font);
    font-size: var(--d-t-xs); font-weight: var(--d-w-med);
    letter-spacing: normal; text-transform: none; color: var(--d-ink-2);
  }
  /* EL SUBRAYADO SE DESVANECE, PERO DESPUÉS DE DECIR DÓNDE TERMINA EL CAMPO.
     Dos arreglos, los dos medidos:
       · Empezaba a apagarse al 45 %. Más de la mitad del campo quedaba sin
         canto y no se sabía dónde tocar. Ahora sostiene hasta el 72 %.
       · Iba en --d-edge, que es un 16 % de tinta: 1,3:1 contra el papel, o
         sea invisible. Pasa a --d-ink-3, la misma tinta de las ayudas, y da
         6,3:1. Un trazo de tinta sobre papel es vocabulario de Bruma; un
         canto que no se ve, no.
     Sigue sin filo, que es lo que la dirección pide, y ya se puede usar. */
  :global([data-d='M']) .fm-inp {
    border-bottom-color: transparent;
    background-image: linear-gradient(90deg, var(--d-ink-3) 0%, var(--d-ink-3) 72%, transparent 100%);
    background-repeat: no-repeat;
    background-size: 100% 1px;
    background-position: 0 100%;
  }
  :global([data-d='M']) .fm-inp:focus {
    background-image: linear-gradient(90deg, var(--d-accent) 0%, var(--d-accent) 80%, transparent 100%);
    background-size: 100% 2px;
  }
  :global([data-d='M']) .fm-u {
    border: 0;
    background: transparent;
    background-image: linear-gradient(90deg, var(--d-ink-3) 0%, transparent 100%);
    background-repeat: no-repeat;
    background-size: 100% 1px;
    background-position: 0 100%;
    border-radius: 0;
    min-width: 0;
    padding-left: var(--d-p1);
    justify-content: flex-start;
  }
  /* PUESTO Y NO PUESTO TIENEN QUE SER DOS COSAS DISTINTAS.
     La casilla marcada era --d-accent-soft y la sin marcar --d-neu-band: dos
     lavados del 12 % sobre el mismo papel, o sea el mismo gris. La diferencia
     quedaba solo en el glifo. Que Bruma no encajone no la exime de que un
     control diga si está puesto: los contenedores no tienen filo, los
     controles sí. Marcado pasa a acento macizo con el glifo en papel, y el
     halo se queda para que el color siga derramándose. */
  :global([data-d='M']) .fm-mark {
    border: 0;
    border-radius: calc(var(--d-r) / 2);
    background: var(--d-neu-band);
    box-shadow: inset 0 0 0 1px var(--d-ink-3);
    color: transparent;
  }
  :global([data-d='M']) .fm-mark--rd { border-radius: var(--d-r-pill); }
  :global([data-d='M']) .fm-in:checked + .fm-mark {
    background: var(--d-accent);
    color: var(--d-accent-ink);
    box-shadow: 0 0 22px -4px var(--d-accent-soft);
  }
  :global([data-d='M']) .fm-sw {
    border: 0;
    background: var(--d-neu-band);
    box-shadow: inset 0 0 0 1px var(--d-ink-3);
  }
  :global([data-d='M']) .fm-in:checked + .fm-sw {
    background: var(--d-accent);
    box-shadow: 0 0 24px -5px var(--d-accent-soft);
  }
  :global([data-d='M']) .fm-in:checked ~ .fm-state { color: var(--d-accent); }
  /* El error tampoco encajona: el subrayado se tiñe y el color se derrama. */
  :global([data-d='M']) .fm-f--bad {
    position: relative;
    isolation: isolate;
  }
  :global([data-d='M']) .fm-f--bad::before {
    content: '';
    position: absolute;
    inset: -14px -18px;
    background: radial-gradient(64% 74% at 24% 40%, var(--tone-band) 0%, transparent 72%);
    filter: blur(20px);
    pointer-events: none;
    z-index: -1;
  }
  :global([data-d='M']) .fm-f--bad .fm-inp,
  :global([data-d='M']) .fm-f--bad .fm-u {
    border-color: transparent;
    background-image: linear-gradient(90deg, var(--d-crit) 0%, var(--d-crit) 55%, transparent 100%);
    background-size: 100% 2px;
  }
  :global([data-d='M']) .fm-f--off .fm-inp[disabled] { background-image: none; opacity: .7; }
  :global([data-d='M']) .fm-foot { padding-inline: 0; }
  /* Mismo hallazgo que en I: [data-d='M'] .d-btn le pisa el fondo al primario
     y queda tinta casi blanca sobre --d-sunk. Repuesto acá. */
  :global([data-d='M']) .fm-acts .d-btn--primary {
    background: var(--d-accent);
    color: var(--d-accent-ink);
  }

  /* ======================================================================
     N · CINTA — el campo NO es una caja: es un carril de puntas redondas con
     la etiqueta montada en su cabo izquierdo. Los carriles se solapan unos
     milímetros, así que hay orden de apilado explícito —el de arriba pisa al
     de abajo— y la sombra de --d-shadow hace de sombra de contacto.
     ====================================================================== */
  :global([data-d='N']) .fm-seek {
    border-radius: var(--d-r-pill);
    background: var(--d-surface-fill);
    padding: var(--d-p2) var(--d-p4);
  }
  :global([data-d='N']) .fm-seek-ctl { gap: var(--d-p2); }
  :global([data-d='N']) .fm-grid,
  :global([data-d='N']) .fm-stack { grid-template-columns: minmax(0, 1fr); gap: 0; }
  :global([data-d='N']) .fm-f {
    position: relative;
    grid-template-columns: minmax(0, 11ch) minmax(0, 1fr);
    align-items: center;
    gap: 0 var(--d-p2);
    min-height: var(--d-row-h);
    padding: var(--d-p1) var(--d-p3);
    border-radius: var(--d-r-pill);
    background: var(--d-surface-fill);
    box-shadow: var(--d-shadow);
    margin-bottom: calc(-1 * var(--d-p1));
  }
  /* Orden de apilado: la cinta de arriba se monta sobre la de abajo. */
  :global([data-d='N']) .fm-grid > .fm-f:nth-child(1) { z-index: 5; }
  :global([data-d='N']) .fm-grid > .fm-f:nth-child(2) { z-index: 4; }
  :global([data-d='N']) .fm-grid > .fm-f:nth-child(3) { z-index: 3; }
  :global([data-d='N']) .fm-grid > .fm-f:nth-child(4) { z-index: 2; }
  :global([data-d='N']) .fm-grid > .fm-f:nth-child(5) { z-index: 1; }
  /* Carril dentro de carril se vuelve papilla: el pozo se apaga y el carril
     entero pasa a ser el control. */
  :global([data-d='N']) .fm-f .fm-inp {
    background: transparent;
    border-color: transparent;
    border-radius: 0;
    box-shadow: none;
    padding-inline: 0;
  }
  :global([data-d='N']) .fm-f .d-textarea { padding-block: var(--d-p1); }
  :global([data-d='N']) .fm-u {
    border: 0;
    background: transparent;
    border-radius: 0 var(--d-r-pill) var(--d-r-pill) 0;
    min-width: 0;
    padding-left: var(--d-p1);
    justify-content: flex-start;
  }
  :global([data-d='N']) .fm-f--bad {
    background: linear-gradient(100deg, var(--tone-band) 0%, var(--d-surface) 62%);
  }
  :global([data-d='N']) .fm-f--bad .fm-inp,
  :global([data-d='N']) .fm-f--bad .fm-u { border-color: transparent; }
  :global([data-d='N']) .fm-msg { padding-left: var(--d-p1); }
  :global([data-d='N']) .fm-opts,
  :global([data-d='N']) .fm-states {
    border-radius: var(--d-r-lg);
    background: var(--d-sunk-fill);
    padding: var(--d-p2) var(--d-p3) var(--d-p3);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='N']) .fm-choices { gap: 0; }
  /* El colchón vertical iguala al solape: sin él, la cinta de arriba se come
     la primera línea de la de abajo cuando el texto crece a dos renglones. */
  :global([data-d='N']) .fm-choices .fm-opt {
    position: relative;
    border-radius: var(--d-r-pill);
    background: var(--d-surface-fill);
    padding: var(--d-p1) var(--d-p3);
    box-shadow: var(--d-shadow);
    margin-bottom: calc(-1 * var(--d-p1));
  }
  :global([data-d='N']) .fm-choices .fm-opt:nth-child(1) { z-index: 2; }
  :global([data-d='N']) .fm-choices .fm-opt:nth-child(2) { z-index: 1; }
  :global([data-d='N']) .fm-radios { gap: var(--d-p1); }
  :global([data-d='N']) .fm-radios .fm-opt {
    min-height: 34px;
    padding-inline: var(--d-p2);
    border-radius: var(--d-r-pill);
    background: var(--d-sunk-fill);
    box-shadow: inset 0 2px 4px -2px var(--d-edge);
  }
  :global([data-d='N']) .fm-radios .fm-opt:has(.fm-in:checked) {
    background: var(--d-accent-soft);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='N']) .fm-mark { border-radius: var(--d-r-pill); background: var(--d-surface-fill); }
  :global([data-d='N']) .fm-sw { background: var(--d-sunk-fill); box-shadow: inset 0 2px 4px -1px var(--d-edge); }
  :global([data-d='N']) .fm-sw::after { background: var(--d-ink-3); box-shadow: 0 1px 3px -1px var(--d-edge); }
  :global([data-d='N']) .fm-in:checked + .fm-sw { background: var(--d-accent-fill); }
  :global([data-d='N']) .fm-foot { border-radius: 0 0 var(--d-r-lg) var(--d-r-lg); }

  /* ======================================================================
     O · PRISMA — vidrio con la marca teñida ADENTRO. El campo vuelve a ser un
     pozo, pero acá el vidrio se SUELDA: donde I deja piezas sueltas flotando,
     O agrupa en losas segmentadas — una sola pieza de vidrio con divisiones
     de un pelo. La botonera del pie es la prueba: no son tres botones
     sueltos, es una losa de vidrio partida en tres.

     Misma trampa que en I y misma regla: un solo backdrop-filter por capa
     apoyada en el fondo. Lo de adentro se tiñe, no se vuelve a desenfocar.
     ====================================================================== */
  :global([data-d='O']) .fm-seek {
    display: flex;
    align-items: stretch;
    flex-wrap: wrap;
    gap: 0;
    padding: 0;
    overflow: hidden;
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    border-color: var(--d-line);
  }
  :global([data-d='O']) .fm-seek-lab {
    flex: none;
    display: flex;
    align-items: center;
    padding-inline: var(--d-p3);
    background: var(--d-accent-soft);
    color: var(--d-brand);
    border-right: max(var(--d-bw), 1px) solid var(--d-line);
  }
  :global([data-d='O']) .fm-seek-ctl { flex: 1 1 180px; gap: 0; flex-wrap: nowrap; }
  :global([data-d='O']) .fm-q {
    border: 0;
    border-radius: 0;
    background: var(--d-sunk);
    box-shadow: inset 0 1px 3px var(--d-edge);
  }
  :global([data-d='O']) .fm-seek-btn {
    border: 0;
    border-left: max(var(--d-bw), 1px) solid var(--d-line);
    border-radius: 0;
    box-shadow: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  :global([data-d='O']) .fm-seek-hint {
    flex-basis: 100%;
    padding: 4px var(--d-p3) var(--d-p1);
    border-top: max(var(--d-bw), 1px) solid var(--d-line);
  }
  /* Losas: el título de sección es la capa de marca, translúcida y a sangre,
     no una barra opaca que parta la pieza en dos. */
  :global([data-d='O']) .fm-opts,
  :global([data-d='O']) .fm-states {
    overflow: hidden;
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r-lg);
    background: var(--d-sunk);
    box-shadow: inset 0 1px 0 var(--d-line);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  :global([data-d='O']) .fm-opts .fm-cap,
  :global([data-d='O']) .fm-states .fm-cap {
    margin: 0 0 var(--d-p2);
    padding: var(--d-p1) var(--d-p3);
    background: var(--d-accent-soft);
    color: var(--d-brand);
    border-bottom: max(var(--d-bw), 1px) solid var(--d-line);
  }
  :global([data-d='O']) .fm-opts .fm-stack,
  :global([data-d='O']) .fm-states .fm-stack { padding: 0 var(--d-p3) var(--d-p3); }
  /* LA LOSA QUE FALTABA. El grupo de campos era el único bloque del cuerpo
     que no estaba soldado: dos losas de vidrio con capa de marca y, entre
     ellas, un montón de campos sueltos al aire. Ahora los tres son la misma
     pieza y la tesis de O se lee de una: la marca no parte el contenedor en
     dos, lo tiñe entero por dentro. */
  :global([data-d='O']) .fm-set {
    overflow: hidden;
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r-lg);
    background: var(--d-sunk);
    box-shadow: inset 0 1px 0 var(--d-line);
    padding: 0 0 var(--d-p3);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  :global([data-d='O']) .fm-leg {
    margin: 0 0 var(--d-p3);
    padding: var(--d-p1) var(--d-p3);
    background: var(--d-accent-soft);
    color: var(--d-brand);
    border-bottom: max(var(--d-bw), 1px) solid var(--d-line);
  }
  :global([data-d='O']) .fm-grid { padding-inline: var(--d-p3); }
  /* La marca nombra el BLOQUE, no cada renglón: con la capa teñida arriba de
     cada losa, ocho etiquetas también en teal dejan de señalar nada. */
  :global([data-d='O']) .fm-lab:not(.fm-seek-lab) {
    font-size: var(--d-t-xs); font-weight: var(--d-w-med);
    letter-spacing: normal; text-transform: none; color: var(--d-ink-2);
  }
  :global([data-d='O']) .fm-mark { border-radius: calc(var(--d-r) / 2); }
  :global([data-d='O']) .fm-mark--rd { border-radius: var(--d-r-pill); }
  :global([data-d='O']) .fm-inp {
    box-shadow: inset 0 1px 0 var(--d-line), inset 0 4px 10px -6px var(--d-edge);
  }
  :global([data-d='O']) .fm-u {
    background: var(--d-accent-soft);
    color: var(--d-brand);
    border-color: var(--d-line);
    border-left: 0;
  }
  /* La botonera: UNA losa de vidrio segmentada, no tres botones sueltos.
     Y sin desenfoque propio: la losa vive dentro del panel, que ya desenfoca.
     Lo que la hace vidrio acá es la transparencia más el filo especular, no
     un segundo blur — ese es justamente el que enturbia. */
  :global([data-d='O']) .fm-acts,
  :global([data-d='O']) .fm-radios {
    gap: 0;
    overflow: hidden;
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r);
    background: var(--d-surface);
    box-shadow: var(--d-shadow);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  :global([data-d='O']) .fm-acts .d-btn {
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  :global([data-d='O']) .fm-acts .d-btn + .d-btn,
  :global([data-d='O']) .fm-radios .fm-opt + .fm-opt {
    border-left: max(var(--d-bw), 1px) solid var(--d-line);
  }
  :global([data-d='O']) .fm-acts .d-btn--primary { background: var(--d-accent); color: var(--d-accent-ink); }
  :global([data-d='O']) .fm-radios .fm-opt {
    flex: 1 1 auto;
    min-height: var(--d-row-h);
    padding-inline: var(--d-p2);
  }
  :global([data-d='O']) .fm-radios .fm-opt:has(.fm-in:checked) { background: var(--d-accent-soft); }
  :global([data-d='O']) .fm-radios .fm-in:checked ~ .fm-opt-txt { font-weight: var(--d-w-semi); }
  :global([data-d='O']) .fm-mark,
  :global([data-d='O']) .fm-sw { border-color: var(--d-line); box-shadow: inset 0 1px 0 var(--d-line); }
  :global([data-d='O']) .fm-f--bad .fm-inp,
  :global([data-d='O']) .fm-f--bad .fm-u { border-color: var(--tone-edge); background: var(--tone-band); }
  :global([data-d='O']) .fm-msg {
    background: var(--tone-band);
    border-radius: var(--d-r);
    padding: 4px var(--d-p2);
  }
  :global([data-d='O']) .fm-f--off .fm-inp[disabled] { background: var(--d-sunk); box-shadow: none; }

  /* ======================================================================
     P · ESPINA — una columna de marca baja por la izquierda y de ella cuelga
     TODO: el buscador, cada estrato del formulario, cada opción. Ninguna
     caja. El campo es una línea de base que arranca contra la espina.

     EL RAÍL DE 152px VUELVE, PERO MEDIDO. Se retiró de directions.css porque
     .d-rail se aplicaba a ciegas y una columna fija de 152px dentro de una
     tarjeta de 200px deja un carácter por línea. Acá vuelve dentro de una
     consulta de contenedor —abajo, junto al resto del responsive— sobre la
     misma frontera de 430px con la que G conserva el suyo. Ahí sí hay ancho.
     ====================================================================== */
  :global([data-d='P']) .fm { gap: 0; }
  :global([data-d='P']) .fm-seek {
    position: relative;
    background: var(--d-sunk);
    border: 0;
    border-top: max(var(--d-bw), 1px) solid var(--d-line);
    border-radius: 0;
    box-shadow: none;
    padding: var(--d-p2) var(--d-p3) var(--d-p2) calc(6px + var(--d-p3));
  }
  /* La espina del buscador y la del panel se tocan (gap 0): se leen como UNA
     sola columna que baja por toda la celda. */
  :global([data-d='P']) .fm-seek::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 6px;
    background: var(--d-brand);
  }
  :global([data-d='P']) .fm-body { padding-inline: 0; gap: 0; }
  :global([data-d='P']) .fm-grid,
  :global([data-d='P']) .fm-stack { grid-template-columns: minmax(0, 1fr); gap: 0; }
  :global([data-d='P']) .fm-f,
  :global([data-d='P']) .fm-choices .fm-opt {
    position: relative;
    margin-left: -6px;
    padding: var(--d-p2) var(--d-p3) var(--d-p2) calc(6px + var(--d-p3));
    border-bottom: max(var(--d-bw), 1px) solid var(--d-line);
  }
  :global([data-d='P']) .fm-f::before,
  :global([data-d='P']) .fm-choices .fm-opt::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 6px;
    background: var(--d-brand);
  }
  /* El estado no pinta el fondo: muerde la espina con una muesca de su tono. */
  :global([data-d='P']) .fm-f[data-tone]::before {
    background: linear-gradient(180deg, var(--d-brand) 0%, var(--d-brand) 26%,
                var(--tone-fg) 26%, var(--tone-fg) 74%, var(--d-brand) 74%);
  }
  :global([data-d='P']) .fm-leg,
  :global([data-d='P']) .fm-cap {
    margin: 0 0 0 -6px;
    padding: var(--d-p1) var(--d-p3) var(--d-p1) calc(6px + var(--d-p3));
    background: var(--d-sunk);
    border-block: max(var(--d-bw), 1px) solid var(--d-line);
    color: var(--d-brand);
  }
  :global([data-d='P']) .fm-note { padding: var(--d-p2) var(--d-p3); }
  :global([data-d='P']) .fm-u {
    border: 0;
    border-bottom: max(var(--d-bw), 1px) solid var(--d-edge);
    border-radius: 0;
    background: transparent;
    min-width: 0;
    padding: 0 0 0 6px;
    justify-content: flex-start;
  }
  :global([data-d='P']) .fm-radios { gap: var(--d-p1) var(--d-p3); }
  :global([data-d='P']) .fm-radios .fm-opt { min-height: 0; padding: 0; margin: 0; border: 0; }
  :global([data-d='P']) .fm-mark { border-radius: 0; }
  :global([data-d='P']) .fm-mark--rd { border-radius: 999px; }
  :global([data-d='P']) .fm-sw { border-radius: 0; }
  :global([data-d='P']) .fm-sw::after { border-radius: 0; }
  :global([data-d='P']) .fm-f--bad .fm-inp,
  :global([data-d='P']) .fm-f--bad .fm-u { border-bottom-color: var(--d-crit); border-bottom-width: 2px; }
  :global([data-d='P']) .fm-f--off .fm-inp[disabled] { background: transparent; }
  /* El pie NO se sangra hasta el raíl. Con 152px de raíl más los dos paddings
     quedan ~280px para tres botones y se apilan de a uno. Cuelgan del canto,
     como el resto de los estratos, y se leen en una línea. */
  :global([data-d='P']) .fm-foot { justify-content: flex-start; padding-inline: var(--d-p3); }
  :global([data-d='P']) .fm-acts { justify-content: flex-start; }

  /* ======================================================================
     Q · CHAROL — masa dura con superficie mojada. Cada bloque propio lleva
     las tres cosas a la vez: borde de 2px de tinta, sombra sólida desplazada
     (las dos vienen de --d-bw y --d-shadow) y el barrido húmedo encima.

     Mismo hallazgo que en J: no hay token de brillo. La placa se apoya en
     --d-sunk-fill y el barrido es --d-surface recortado con una máscara de
     alfa; ni un blanco inventado. Y pointer-events: none, porque el ::after
     se pinta después del contenido.
     ====================================================================== */
  :global([data-d='Q']) .fm-seek,
  :global([data-d='Q']) .fm-set,
  :global([data-d='Q']) .fm-opts,
  :global([data-d='Q']) .fm-states {
    position: relative;
    overflow: hidden;
    background: var(--d-sunk-fill);
    border: var(--d-bw) solid var(--d-edge);
    border-radius: var(--d-r-lg);
    padding: var(--d-p3);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='Q']) .fm-seek::after,
  :global([data-d='Q']) .fm-set::after,
  :global([data-d='Q']) .fm-opts::after,
  :global([data-d='Q']) .fm-states::after {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 34%;
    background: var(--d-surface);
    -webkit-mask-image: linear-gradient(180deg, currentColor 0%, transparent 100%);
    mask-image: linear-gradient(180deg, currentColor 0%, transparent 100%);
    opacity: .7;
    pointer-events: none;
  }
  :global([data-d='Q']) .fm-seek > *,
  :global([data-d='Q']) .fm-set > *,
  :global([data-d='Q']) .fm-opts > *,
  :global([data-d='Q']) .fm-states > * { position: relative; z-index: 1; }
  /* La leyenda es una placa lacada de accent, no una barra de tinta plana:
     es lo que separa a Q de la masa seca de D. */
  :global([data-d='Q']) .fm-leg {
    display: inline-block;
    background: var(--d-accent-fill);
    color: var(--d-accent-ink);
    border: var(--d-bw) solid var(--d-edge);
    border-radius: var(--d-r);
    margin: 0 0 var(--d-p3);
    padding: 3px var(--d-p2);
    box-shadow: 3px 3px 0 var(--d-ink), inset 0 1px 0 var(--d-surface);
  }
  :global([data-d='Q']) .fm-cap {
    display: inline-block;
    background: var(--d-ink);
    color: var(--d-ink-on);
    border-radius: var(--d-r);
    padding: 2px var(--d-p2);
    margin-bottom: var(--d-p2);
  }
  :global([data-d='Q']) .fm-u {
    background: var(--d-sunk-fill);
    border-color: var(--d-edge);
    color: var(--d-ink);
    font-weight: var(--d-w-bold);
    box-shadow: inset 0 1px 0 var(--d-surface);
  }
  :global([data-d='Q']) .fm-mark {
    border-color: var(--d-edge);
    border-radius: min(var(--d-r), 6px);
    background: var(--d-surface-fill);
    box-shadow: 2px 2px 0 var(--d-ink), inset 0 1px 0 var(--d-surface);
  }
  :global([data-d='Q']) .fm-in:checked + .fm-mark { background: var(--d-accent-fill); }
  :global([data-d='Q']) .fm-sw {
    border-color: var(--d-edge);
    background: var(--d-sunk-fill);
    box-shadow: 2px 2px 0 var(--d-ink), inset 0 2px 4px -1px var(--d-edge);
  }
  :global([data-d='Q']) .fm-sw::after { background: var(--d-ink); box-shadow: inset 0 1px 0 var(--d-surface); }
  :global([data-d='Q']) .fm-in:checked + .fm-sw { background: var(--d-accent-fill); }
  :global([data-d='Q']) .fm-in:checked + .fm-sw::after { background: var(--d-surface-fill); }
  /* Al presionar, la pieza entra en su sombra y el charol se apaga. */
  :global([data-d='Q']) .fm-opt:active .fm-mark,
  :global([data-d='Q']) .fm-opt:active .fm-sw {
    transform: translate(2px, 2px);
    box-shadow: inset 0 2px 5px -1px var(--d-edge);
  }
  :global([data-d='Q']) .fm-f--bad {
    background: var(--tone-band);
    border: var(--d-bw) solid var(--d-edge);
    border-radius: var(--d-r);
    box-shadow: var(--d-shadow);
    padding: var(--d-p2);
  }
  :global([data-d='Q']) .fm-msg {
    background: var(--d-surface);
    border: var(--d-bw) solid var(--d-edge);
    border-radius: var(--d-r);
    padding: 4px var(--d-p2);
  }
  :global([data-d='Q']) .fm-f--off .fm-inp[disabled] {
    background: var(--d-sunk-fill);
    box-shadow: inset 0 2px 4px -1px var(--d-edge);
  }
  :global([data-d='Q']) .fm-acts { gap: var(--d-p2); }
  :global([data-d='Q']) .fm-foot { gap: var(--d-p2); background: var(--d-sunk-fill); }
  :global([data-d='Q']) .fm-state { font-weight: var(--d-w-bold); color: var(--d-ink); }

  /* ======================================================================
     R · VITRINA — la más densa de las diecinueve: fila de 26px y
     monoespaciada de Terminal, pero sobre vidrio oscuro con luz de color
     detrás. El campo es una celda de fichero: la etiqueta vive en su propia
     columna de vidrio con un pelo de divisoria, el valor a la derecha.

     Mismo cuidado que en I y O: el desenfoque solo en la barra que se apoya
     en el fondo. Dentro del panel, transparencia.
     ====================================================================== */
  :global([data-d='R']) .fm { padding: var(--d-p2); gap: var(--d-p2); }
  :global([data-d='R']) .fm-seek {
    display: flex;
    align-items: stretch;
    flex-wrap: wrap;
    gap: 0;
    padding: 0;
    overflow: hidden;
    backdrop-filter: blur(16px) saturate(1.3);
    -webkit-backdrop-filter: blur(16px) saturate(1.3);
  }
  :global([data-d='R']) .fm-seek-lab {
    flex: none;
    display: flex;
    align-items: center;
    padding-inline: var(--d-p2);
    background: var(--d-sunk);
    border-right: max(var(--d-bw), 1px) solid var(--d-line);
  }
  :global([data-d='R']) .fm-seek-ctl { flex: 1 1 140px; gap: 0; flex-wrap: nowrap; align-items: stretch; }
  :global([data-d='R']) .fm-q { border: 0; border-radius: 0; background: transparent; }
  :global([data-d='R']) .fm-seek-btn {
    border: 0;
    border-left: max(var(--d-bw), 1px) solid var(--d-line);
    border-radius: 0;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  :global([data-d='R']) .fm-seek-hint {
    flex-basis: 100%;
    padding: 2px var(--d-p2);
    border-top: max(var(--d-bw), 1px) solid var(--d-line);
  }
  :global([data-d='R']) .fm-body { gap: var(--d-p2); }
  :global([data-d='R']) .fm-set {
    border: max(var(--d-bw), 1px) solid var(--d-line);
    background: var(--d-sunk);
  }
  :global([data-d='R']) .fm-leg,
  :global([data-d='R']) .fm-cap {
    margin: 0;
    padding: 2px var(--d-p2);
    color: var(--d-accent);
    background: var(--d-surface);
    border-bottom: max(var(--d-bw), 1px) solid var(--d-line);
  }
  :global([data-d='R']) .fm-grid,
  :global([data-d='R']) .fm-stack { grid-template-columns: minmax(0, 1fr); gap: 0; }
  /* La fila de fichero: 26px, etiqueta en columna de vidrio propia. */
  :global([data-d='R']) .fm-f {
    /* 15ch, no 13: «Fuente bloqueado» en versalitas monoespaciadas no entra en
       13 y se recortaba contra la divisoria. */
    grid-template-columns: minmax(0, 15ch) minmax(0, 1fr);
    gap: 0;
    align-items: stretch;
    min-height: var(--d-row-h);
    border-bottom: max(var(--d-bw), 1px) solid var(--d-line);
  }
  :global([data-d='R']) .fm-lab {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    overflow-wrap: anywhere;
    line-height: 1.25;
    padding: 2px var(--d-p2);
    background: var(--d-sunk);
    border-right: max(var(--d-bw), 1px) solid var(--d-line);
  }
  :global([data-d='R']) .fm-ctl { gap: 0; align-content: center; padding-block: 1px; }
  :global([data-d='R']) .fm-f .fm-inp {
    border: 0;
    border-radius: 0;
    background: transparent;
    padding-inline: var(--d-p2);
  }
  :global([data-d='R']) .fm-hint,
  :global([data-d='R']) .fm-msg { padding-inline: var(--d-p2); }
  :global([data-d='R']) .fm-u {
    border: 0;
    border-radius: 0;
    background: transparent;
    min-width: 0;
    padding-inline: var(--d-p1);
    justify-content: flex-start;
  }
  :global([data-d='R']) .fm-opts,
  :global([data-d='R']) .fm-states {
    border: max(var(--d-bw), 1px) solid var(--d-line);
    background: var(--d-sunk);
  }
  :global([data-d='R']) .fm-opt { min-height: var(--d-row-h); gap: var(--d-p2); padding-inline: var(--d-p2); }
  :global([data-d='R']) .fm-stack > .fm-opt { border-bottom: max(var(--d-bw), 1px) solid var(--d-line); }
  :global([data-d='R']) .fm-radios { gap: 0 var(--d-p3); padding: 0 var(--d-p2); }
  :global([data-d='R']) .fm-mark {
    width: 12px;
    height: 12px;
    border-radius: 0;
    border-color: var(--d-edge);
    background: var(--d-surface);
  }
  :global([data-d='R']) .fm-mark svg { width: 8px; height: 8px; }
  :global([data-d='R']) .fm-mark--rd { border-radius: 999px; }
  :global([data-d='R']) .fm-mark--rd::after { width: 6px; height: 6px; }
  :global([data-d='R']) .fm-sw { width: 30px; height: 15px; border-color: var(--d-edge); background: var(--d-surface); }
  :global([data-d='R']) .fm-sw::after { width: 9px; height: 9px; top: 2px; left: 2px; }
  :global([data-d='R']) .fm-in:checked + .fm-sw::after { transform: translateX(13px); }
  /* El canto de estado va en la columna de etiqueta, que es la que tiene su
     propio relleno: en el .fm-f quedaría por debajo y no se vería. */
  :global([data-d='R']) .fm-f--bad { background: var(--tone-band); }
  :global([data-d='R']) .fm-f--bad .fm-lab { box-shadow: inset 2px 0 0 var(--tone-fg); }
  :global([data-d='R']) .fm-f--bad .fm-inp,
  :global([data-d='R']) .fm-f--bad .fm-u { border-color: transparent; color: var(--tone-fg); }
  :global([data-d='R']) .fm-f--off .fm-inp[disabled] { background: transparent; }
  :global([data-d='R']) .fm-note { padding: var(--d-p1) var(--d-p2) 0; }
  :global([data-d='R']) .fm-foot { padding: var(--d-p1) var(--d-p2); }

  /* ======================================================================
     S · UMBRA — la tarjeta se queda BLANCA y lo que informa es la sombra
     teñida de abajo. En directions.css la firma solo la llevan .d-panel y
     .d-row; acá se la doy al marcado propio de esta página, que es donde de
     verdad se juega: los dos bloques de sección proyectan su tono, el campo
     con error proyecta rojo SIN teñirse de rojo, y cada opción marcada
     proyecta verde. El texto siempre se lee sobre blanco.

     El color nunca queda solo: el error mantiene su glifo y su frase, y el
     interruptor su palabra en .fm-state.
     ====================================================================== */
  :global([data-d='S']) .fm-seek {
    border: 0;
    padding: var(--d-p3);
    transition: box-shadow 160ms ease;
  }
  :global([data-d='S']) .fm-seek:focus-within { box-shadow: var(--d-shadow-lg); }
  :global([data-d='S']) .fm-body { gap: var(--d-p4); }
  :global([data-d='S']) .fm-grid { gap: var(--d-p3); }
  /* LA FIRMA, en el marcado de esta página. */
  :global([data-d='S']) .fm-opts,
  :global([data-d='S']) .fm-states {
    background: var(--d-surface);
    border-radius: var(--d-r-lg);
    padding: var(--d-p3);
    box-shadow: 0 14px 36px -16px var(--tone-fg), var(--d-shadow);
  }
  :global([data-d='S']) .fm-leg,
  :global([data-d='S']) .fm-cap { margin-bottom: var(--d-p2); }
  :global([data-d='S']) .fm-u {
    border: 0;
    background: var(--d-sunk);
    border-radius: 0 var(--d-r) var(--d-r) 0;
  }
  :global([data-d='S']) .fm-mark { border-color: var(--d-edge); background: var(--d-surface); }
  :global([data-d='S']) .fm-in:checked + .fm-mark { box-shadow: 0 6px 14px -6px var(--d-accent); }
  :global([data-d='S']) .fm-sw { background: var(--d-sunk); border-color: transparent; }
  :global([data-d='S']) .fm-sw::after { background: var(--d-ink-3); box-shadow: var(--d-shadow); }
  :global([data-d='S']) .fm-in:checked + .fm-sw { box-shadow: 0 6px 16px -7px var(--d-pos); }
  /* La fila hecha a mano: blanca, y la luz de abajo dice que está activa. */
  :global([data-d='S']) .fm-choices .fm-opt {
    background: var(--d-surface);
    border-radius: var(--d-r);
    padding-inline: var(--d-p2);
    box-shadow: var(--d-shadow);
    transition: box-shadow 160ms ease;
  }
  :global([data-d='S']) .fm-choices .fm-opt:has(.fm-in:checked) {
    box-shadow: 0 10px 26px -12px var(--d-pos), var(--d-shadow);
  }
  /* El campo con error NO se tiñe: sigue blanco y proyecta rojo. */
  :global([data-d='S']) .fm-f--bad {
    background: var(--d-surface);
    border-radius: var(--d-r);
    padding: var(--d-p2);
    box-shadow: 0 12px 30px -14px var(--tone-fg), var(--d-shadow);
  }
  :global([data-d='S']) .fm-f--bad .fm-inp,
  :global([data-d='S']) .fm-f--bad .fm-u { border-color: transparent; background: var(--d-sunk); }
  :global([data-d='S']) .fm-f--off .fm-inp[disabled] { background: var(--d-sunk); box-shadow: none; }
  :global([data-d='S']) .fm-msg { color: var(--d-crit); }
  :global([data-d='S']) .fm-foot { border-top: 0; }
  :global([data-d='S']) .fm-set { padding-bottom: var(--d-p1); }

  /* ======================================================================
     T · HALO CLARO — Halo, del otro lado de la luz.

     LA REGLA QUE SE IMPONE EN UN FORMULARIO: IRRADIA LO QUE SE TOCA O LO QUE
     INFORMA. En una dirección sin un solo borde, si todo brilla no brilla
     nada, así que la luz tiene que estar repartida por función y no por
     gusto. Cuatro escalones y ninguno más:

       papel plano   el grupo de campos. Ni anillo ni resplandor: lo que
                     agrupa es el encabezado y el aire.
       anillo        todo control. El campo no tiene borde, lo define un
                     anillo interior de 1px. Ese anillo es lo único que dice
                     dónde empieza y dónde termina la zona que se toca, así
                     que va en --d-ink-3 y da 5,6:1 contra el papel. Con el
                     lavado del 7 % que traen las sombras del token quedaba
                     en 1,4:1, que sobre papel es no estar.
       halo propio   lo marcado, lo enfocado y lo roto. Sube la luz.
       apagado       lo bloqueado. Ni halo ni acento: se hunde en el papel.

     CONTRA UMBRA, que es la hermana peligrosa: en S la tarjeta es una
     tarjeta y la sombra teñida es un dato añadido encima. Acá no hay tarjeta.
     El anillo del propio tono es la pieza que S no tiene, y el acento
     (--d-accent, teal saturado) brilla por sí mismo en vez de ser tinta
     negra. Un acento, uno solo, en toda la celda.

     Una escala de radio: --d-r-lg para los bloques, --d-r para el campo y el
     error, la mitad de --d-r para la casilla, y la píldora solo en el
     interruptor, que es lo único con forma de riel.
     ====================================================================== */
  /* Sobre papel, un rótulo en versalitas grises de 11px es una mancha, no una
     palabra. La etiqueta se lee, y el que brilla es el campo. */
  :global([data-d='T']) .fm-lab {
    font-size: var(--d-t-xs); font-weight: var(--d-w-med);
    letter-spacing: normal; text-transform: none; color: var(--d-ink-2);
  }
  /* El buscador se apoya en el papel con un halo bajo. Al entrar el foco, el
     halo toma el acento: sin bordes en toda la pantalla, esto es lo único
     que dice en qué bloque está el cursor, así que la moción trabaja. */
  :global([data-d='T']) .fm-seek {
    border: 0;
    background: var(--d-surface);
    border-radius: var(--d-r-lg);
    padding: var(--d-p3);
    box-shadow: var(--d-shadow);
    transition: box-shadow 180ms ease;
  }
  :global([data-d='T']) .fm-seek:focus-within {
    box-shadow: 0 0 0 1px var(--d-accent-edge), 0 14px 44px -16px var(--d-accent);
  }
  :global([data-d='T']) .fm-body { gap: var(--d-p4); }
  /* Papel plano: el grupo de campos no es un contenedor. */
  :global([data-d='T']) .fm-set { padding-bottom: var(--d-p1); }
  :global([data-d='T']) .fm-grid { gap: var(--d-p3) var(--d-p2); }
  /* Los dos bloques que informan de algo sí irradian, cada uno en su tono:
     el de «al guardar» en azul, el de estados en rojo. Es la misma regla de
     Halo, que el estado sea el color de lo que se irradia, solo que acá se
     irradia sobre papel y el texto se sigue leyendo en negro sobre blanco. */
  :global([data-d='T']) .fm-opts,
  :global([data-d='T']) .fm-states {
    border: 0;
    border-radius: var(--d-r-lg);
    background: var(--d-surface);
    padding: var(--d-p3);
    box-shadow: 0 0 0 1px var(--tone-edge), 0 14px 40px -18px var(--tone-fg);
  }
  /* EL ANILLO. Se escribe una vez y lo comparten el campo, el sufijo y los
     controles, para que todo lo tocable tenga el mismo canto. */
  :global([data-d='T']) .fm-inp {
    background: var(--d-surface);
    border: 0;
    box-shadow: inset 0 0 0 1px var(--d-ink-3);
    transition: box-shadow 160ms ease;
  }
  :global([data-d='T']) .fm-inp:focus {
    box-shadow: inset 0 0 0 1px var(--d-accent), 0 0 0 3px var(--d-accent-soft),
                0 6px 18px -8px var(--d-accent);
  }
  /* El sufijo de unidad continúa el anillo por tres lados: sin la pared
     izquierda, el par campo + unidad se lee como UNA pieza y no como dos
     cajas pegadas con una doble línea en la costura. */
  :global([data-d='T']) .fm-u {
    background: var(--d-sunk);
    border: 0;
    border-radius: 0 var(--d-r) var(--d-r) 0;
    color: var(--d-ink-2);
    box-shadow: inset -1px 0 0 var(--d-ink-3),
                inset 0 1px 0 var(--d-ink-3),
                inset 0 -1px 0 var(--d-ink-3);
  }
  :global([data-d='T']) .fm-mark {
    border: 0;
    border-radius: calc(var(--d-r) / 2);
    background: var(--d-surface);
    box-shadow: inset 0 0 0 1px var(--d-ink-3);
  }
  :global([data-d='T']) .fm-mark--rd { border-radius: var(--d-r-pill); }
  :global([data-d='T']) .fm-in:checked + .fm-mark {
    background: var(--d-accent);
    box-shadow: 0 0 0 1px var(--d-accent), 0 6px 18px -7px var(--d-accent);
  }
  :global([data-d='T']) .fm-sw {
    border: 0;
    background: var(--d-sunk);
    box-shadow: inset 0 0 0 1px var(--d-ink-3);
  }
  :global([data-d='T']) .fm-sw::after { background: var(--d-ink-2); }
  :global([data-d='T']) .fm-in:checked + .fm-sw {
    background: var(--d-accent);
    box-shadow: 0 0 0 1px var(--d-accent), 0 7px 22px -8px var(--d-accent);
  }
  :global([data-d='T']) .fm-in:checked ~ .fm-state { color: var(--d-accent); }
  /* Marcado = irradia. Una fila con la casilla puesta se ve desde lejos sin
     leerla, que es exactamente lo que hace falta cuando lo que se marca es
     «cerrar la tarea» y no da lo mismo. */
  :global([data-d='T']) .fm-choices .fm-opt {
    border-radius: var(--d-r);
    padding-inline: var(--d-p2);
    transition: box-shadow 180ms ease;
  }
  :global([data-d='T']) .fm-choices .fm-opt:has(.fm-in:checked) {
    box-shadow: 0 0 0 1px var(--d-accent-edge), 0 8px 26px -14px var(--d-accent);
  }
  :global([data-d='T']) .fm-radios { gap: var(--d-p1) var(--d-p3); }
  /* El error no se rellena de rojo: el campo se pone a irradiar rojo, el
     anillo toma el tono y el texto sigue sobre papel blanco. El color nunca
     va solo: quedan el glifo y la frase completa debajo del campo. */
  :global([data-d='T']) .fm-f--bad {
    background: var(--d-surface);
    border-radius: var(--d-r);
    padding: var(--d-p2);
    box-shadow: 0 0 0 1px var(--tone-edge), 0 10px 30px -13px var(--tone-fg);
  }
  :global([data-d='T']) .fm-f--bad .fm-inp {
    box-shadow: inset 0 0 0 1px var(--tone-fg);
  }
  :global([data-d='T']) .fm-f--bad .fm-u {
    box-shadow: inset -1px 0 0 var(--tone-fg),
                inset 0 1px 0 var(--tone-fg),
                inset 0 -1px 0 var(--tone-fg);
  }
  /* Apagado: el único elemento de la celda que no irradia nada. Se hunde en
     --d-sunk y conserva el anillo neutro, porque sigue habiendo que leerlo. */
  :global([data-d='T']) .fm-f--off .fm-inp[disabled] {
    background: var(--d-sunk);
    box-shadow: inset 0 0 0 1px var(--d-neu-edge);
  }
  /* Ni una línea tampoco en el pie: lo que separa es un canto de luz. */
  :global([data-d='T']) .fm-foot { border-top: 0; box-shadow: 0 -1px 0 var(--d-neu-edge); }
  :global([data-d='T']) .fm-note { padding-top: var(--d-p2); }

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

  /* ======================================================================
     RESPONSIVE DE LAS ONCE.

     P · EL RAÍL DE 152px, MEDIDO. Aquí es donde vuelve: solo por encima de
     430px de ancho DEL FORMULARIO —no de la ventana—, que es la misma
     frontera con la que G conserva el suyo unas líneas más arriba. Por
     debajo, P no pierde identidad: la espina de marca y las versalitas de
     marca no dependen del ancho, y las etiquetas se apilan.
     ====================================================================== */
  @container fm (min-width: 431px) {
    :global([data-d='P']) .fm-seek {
      grid-template-columns: var(--d-rail) minmax(0, 1fr);
      gap: 0 var(--d-p3);
      align-items: center;
    }
    :global([data-d='P']) .fm-seek-hint { grid-column: 2; }
    :global([data-d='P']) .fm-f {
      grid-template-columns: var(--d-rail) minmax(0, 1fr);
      gap: 0 var(--d-p3);
      align-items: baseline;
    }
    :global([data-d='P']) .fm-lab,
    :global([data-d='P']) .fm-seek-lab { text-align: right; }
  }

  /* Y donde no hay ancho: la etiqueta montada en el cabo de la cinta (N) y
     la columna de fichero de la vitrina (R) se apilan antes que recortarse. */
  @container fm (max-width: 430px) {
    :global([data-d='N']) .fm-f {
      grid-template-columns: minmax(0, 1fr);
      align-items: start;
      gap: 2px;
      border-radius: var(--d-r-lg);
    }
    :global([data-d='R']) .fm-f { grid-template-columns: minmax(0, 1fr); }
    :global([data-d='R']) .fm-lab {
      border-right: 0;
      border-bottom: max(var(--d-bw), 1px) solid var(--d-line);
    }
    :global([data-d='O']) .fm-seek-lab {
      flex: 1 1 100%;
      border-right: 0;
      border-bottom: max(var(--d-bw), 1px) solid var(--d-line);
      padding-block: 3px;
    }
    :global([data-d='R']) .fm-seek-lab {
      flex: 1 1 100%;
      border-right: 0;
      border-bottom: max(var(--d-bw), 1px) solid var(--d-line);
    }
    :global([data-d='O']) .fm-radios,
    :global([data-d='O']) .fm-acts { flex-wrap: wrap; }
    :global([data-d='O']) .fm-radios .fm-opt + .fm-opt,
    :global([data-d='O']) .fm-acts .d-btn + .d-btn {
      border-left: 0;
      border-top: max(var(--d-bw), 1px) solid var(--d-line);
    }
    :global([data-d='O']) .fm-radios .fm-opt,
    :global([data-d='O']) .fm-acts .d-btn { flex: 1 1 100%; }
  }
</style>
