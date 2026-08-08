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

  // ── X · COTA. La lectura que se escribe, contra el tope de su plan.
  //
  // BAT-014 lleva «Cambio de aceite · cada 250 h» (demo.js). El campo Valor es
  // la ÚNICA cifra medida contra un tope que hay en este formulario, así que es
  // la única que monta riel. Las otras diecinueve direcciones no montan la
  // cota, y este manejador sale por la puerta en cuanto el campo no es el de X:
  // escribir en cualquiera de ellas no mueve un pixel en ninguna parte.
  const TOPE_H = 250;
  let lectura = 312;
  const leerLectura = (e) => {
    if (e.currentTarget.id !== 'fm-val-X') return;
    const n = Number(String(e.currentTarget.value).replace(/[^\d.,]/g, '').replace(',', '.'));
    lectura = Number.isFinite(n) ? Math.max(0, n) : 0;
  };
  $: cotaFig = Math.round(lectura);
  $: cotaPct = Math.round((cotaFig / TOPE_H) * 100);
  $: cotaDelta = cotaFig - TOPE_H;
  $: cotaTono = cotaDelta >= 0 ? 'critical' : 'neutral';
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
                        inputmode="decimal" value="312" required aria-describedby="fm-valh-{d.id}"
                        on:input={leerLectura} />
                      <span class="fm-u">h</span>
                    </div>

                    <!-- LA COTA, y solo la monta X.
                         Es la única medida contra un tope de todo el formulario:
                         BAT-014 tiene el aceite planificado cada 250 h. El riel
                         corre pegado al canto de abajo del campo, la marca queda
                         fija en el tope y el relleno se mueve mientras se
                         escribe, así que «312» deja de ser un número y pasa a
                         ser «62 h pasado». La cifra grande no repite el campo
                         por repetir: es lo que el sistema ENTENDIÓ de lo que se
                         tecleó, y es la que se lee de un vistazo con la máquina
                         enfrente. El riel va oculto para el lector de pantalla,
                         que recibe la cifra y la nota en texto. -->
                    {#if d.id === 'X'}
                      <div class="d-cota fm-cota" data-tone={cotaTono} style="--cota:{cotaPct}">
                        <div class="d-cota-fig"><b>{cotaFig}</b> <span>h</span></div>
                        <div class="d-cota-rail" aria-hidden="true"><i class="d-cota-fill"></i><i class="d-cota-tick"></i></div>
                        <div class="d-cota-note" aria-live="polite">{#if cotaDelta >= 0}tope {TOPE_H} h · se pasó {cotaDelta} h{:else}tope {TOPE_H} h · faltan {-cotaDelta} h{/if}</div>
                      </div>
                    {/if}

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
  /* EL DIBUJO CONTINUO. Los tres bloques comparten canto en vez de separarse:
     gap 0 y un pelo de solape para que las dos líneas de contacto sean una. */
  /* Las marcas de esquina abrazan el DIBUJO entero: la de arriba en el primer
     bloque, la de abajo en el último. Antes las dos vivían en el fieldset y
     marcaban una caja que ya no existe. */
  /* Etiqueta de campo: versalita, que es la silueta de B, y en --d-ink-2 para
     que 10px en caja alta no queden en gris de segunda. */
  /* Cifras en monoespaciada: se comparan por columna, no por palabra. */

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

  /* ======================================================================
     E · AIRE — ni un borde en toda la celda. El campo es un POZO relleno de
     50px con la unidad flotando dentro; el buscador es una pastilla suelta;
     las secciones se separan solo con espacio.
     ====================================================================== */

  /* ======================================================================
     F · TERMINAL — el campo es una línea de prompt: etiqueta a la izquierda
     en una columna de caracteres, valor a la derecha, cursor al final del
     buscador. Casilla y radio son [x] y (•); el interruptor es un bloque de
     color detrás de la palabra.
     ====================================================================== */

  /* ======================================================================
     G · BANDA — ninguna caja. Franjas horizontales a sangre, raíl fijo de
     etiquetas a la izquierda, y el error como franja de 3px en el canto.
     El campo es una línea de base: la unidad continúa esa misma línea.
     ====================================================================== */

  /* ======================================================================
     H · FICHA — el buscador lleva su propia PESTAÑA con la etiqueta, igual
     que la ficha. Regla doble bajo cada encabezado, bloques manila
     insertados en la ficha blanca y canto apilado bajo cada control.
     ====================================================================== */

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
  /* El contenido va POR ENCIMA del barrido; el barrido solo baña la placa. */
  /* Al presionar, el brillo se apaga y la pieza se hunde. */

  /* ======================================================================
     K · HALO — cero bordes en toda la celda. Un campo existe porque irradia:
     un anillo de 1px de su propio tono más un resplandor difuso hacia afuera.
     El estado ES el color del resplandor, nunca un relleno.
     ====================================================================== */
  /* Cada bloque irradia en el tono de lo que informa: el de estados en rojo,
     el de «al guardar» en azul. Se lee desde el otro lado del cuarto. */
  /* El error no se rellena de rojo: el pozo se pone a irradiar rojo. */

  /* ======================================================================
     L · GUIJARRO — el campo es una piedra HUNDIDA en la mesa. Cuatro radios
     distintos por contenedor y distintos entre vecinos: si los tres bloques
     compartieran los mismos cuatro, volverían a ser tarjetas. Por eso cada
     pieza de abajo lleva su propio juego, y los pozos rotan entre tres.
     ====================================================================== */
  /* Ningún pozo igual al de al lado. */

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
  /* Orden de apilado: la cinta de arriba se monta sobre la de abajo. */
  /* Carril dentro de carril se vuelve papilla: el pozo se apaga y el carril
     entero pasa a ser el control. */
  /* El colchón vertical iguala al solape: sin él, la cinta de arriba se come
     la primera línea de la de abajo cuando el texto crece a dos renglones. */

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
  /* La espina del buscador y la del panel se tocan (gap 0): se leen como UNA
     sola columna que baja por toda la celda. */
  /* El estado no pinta el fondo: muerde la espina con una muesca de su tono. */
  /* El pie NO se sangra hasta el raíl. Con 152px de raíl más los dos paddings
     quedan ~280px para tres botones y se apilan de a uno. Cuelgan del canto,
     como el resto de los estratos, y se leen en una línea. */

  /* ======================================================================
     Q · CHAROL — masa dura con superficie mojada. Cada bloque propio lleva
     las tres cosas a la vez: borde de 2px de tinta, sombra sólida desplazada
     (las dos vienen de --d-bw y --d-shadow) y el barrido húmedo encima.

     Mismo hallazgo que en J: no hay token de brillo. La placa se apoya en
     --d-sunk-fill y el barrido es --d-surface recortado con una máscara de
     alfa; ni un blanco inventado. Y pointer-events: none, porque el ::after
     se pinta después del contenido.
     ====================================================================== */
  /* La leyenda es una placa lacada de accent, no una barra de tinta plana:
     es lo que separa a Q de la masa seca de D. */
  /* Al presionar, la pieza entra en su sombra y el charol se apaga. */

  /* ======================================================================
     R · VITRINA — la más densa de las diecinueve: fila de 26px y
     monoespaciada de Terminal, pero sobre vidrio oscuro con luz de color
     detrás. El campo es una celda de fichero: la etiqueta vive en su propia
     columna de vidrio con un pelo de divisoria, el valor a la derecha.

     Mismo cuidado que en I y O: el desenfoque solo en la barra que se apoya
     en el fondo. Dentro del panel, transparencia.
     ====================================================================== */
  /* La fila de fichero: 26px, etiqueta en columna de vidrio propia. */
  /* El canto de estado va en la columna de etiqueta, que es la que tiene su
     propio relleno: en el .fm-f quedaría por debajo y no se vería. */

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
  /* LA FIRMA, en el marcado de esta página. */
  /* La fila hecha a mano: blanca, y la luz de abajo dice que está activa. */
  /* El campo con error NO se tiñe: sigue blanco y proyecta rojo. */

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
     W · CRISTAL TEMPLADO. Vidrio donde sirve, opaco donde estorba, halo solo
     donde urge. Es Cristal con las tres correcciones puestas, así que lo que
     I resolvió bien se hereda tal cual y lo que I hace de más se retira.

     REGLA 1, AUDITADA EN ESTA PÁGINA. La red de seguridad de directions.css
     atrapa lo que flota por SUBCADENA de clase (menu, drop, pop, overlay,
     sheet, dialog, tip) y por rol. Ninguna clase de esta página cae en esa
     lista, y no es un descuido: acá lo único que flota de verdad es la lista
     del select y el calendario del input date, que los dibuja el navegador.
     Al select le declaro la opacidad igual, con --d-overlay, que es el token
     que W creó para eso. En macOS el popup es nativo y la ignora; donde el
     navegador lo pinta en página, la aplica. Y queda escrita la intención.

     REGLA 4 ES LA QUE MÁS TRABAJO DA EN UN FORMULARIO, porque un formulario
     es casi todo control. Los controles hechos a mano de esta página (la
     casilla, el interruptor, el sufijo de unidad, el campo bloqueado) se
     apoyan en la base sobre --d-surface y --d-sunk, que en W son blancos al
     60 % y al 34 %. Encima del panel de vidrio eso son dos capas translúcidas
     sobre una tercera: el mismo apilado que W nombra en sus propios tokens
     cuando decide que las bandas de tono van opacas. Todo lo tocable pasa a
     --d-neu-band.

     HALLAZGO DE TOKEN: a W le falta una superficie hundida OPACA. --d-sunk es
     translúcido a propósito y solo se vuelve sólido bajo
     prefers-reduced-transparency, o sea justo cuando ya no hace falta. Le
     vendría un --d-sunk-solid. Mientras no exista, --d-neu-band hace ese
     papel, que es el que ya hacía en la base para el fondo del interruptor.

     Y EL HALO, UNA SOLA VEZ EN TODA LA CELDA: el campo roto, con la misma
     firma que directions.css le da a la fila crítica (filo de 3px a la
     izquierda más un resplandor corto). Por eso el buscador NO se levanta al
     foco, aunque I, T, S, K y A sí lo hagan; los dos bloques del cuerpo no se
     tiñen de su data-tone; y una opción marcada no brilla, se rellena. Si
     todo brilla, nada urge.
     ====================================================================== */

  /* El buscador es la otra superficie que se queda QUIETA, así que lleva el
     mismo vidrio que el panel, una sola vez y apoyado directo en el campo de
     manchas: es hermano del panel, no una capa encima (esa es la trampa que I
     dejó escrita, y vale igual acá). El doble bisel se queda en el panel: a
     esta altura el labio especular que ya trae --d-shadow alcanza, y W no
     tiene un blanco más tenue que --d-line con el que graduar un segundo
     anillo sin inventar un alfa. */
  :global([data-d='W']) .fm-seek {
    padding: var(--d-p3);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    border-color: var(--d-line);
  }
  :global([data-d='W']) .fm-seek-ctl { gap: var(--d-p2); }

  /* Las etiquetas dejan las versalitas, por la razón que I dejó escrita y que
     en W no cambia: el rótulo no se apoya en el campo blanco, se apoya en el
     vidrio, y debajo del vidrio el fondo cambia de tono cada 200px. Once
     píxeles en caja alta y tracked es lo primero que se pierde ahí. Gana por
     tamaño y peso: 12,5px en --d-ink-2 dan 10:1 contra el panel. */
  :global([data-d='W']) .fm-lab {
    font-size: var(--d-t-xs); font-weight: var(--d-w-med);
    letter-spacing: normal; text-transform: none; color: var(--d-ink-2);
  }

  /* Los dos bloques del cuerpo NO son bandejas. En I son sub-paneles de vidrio
     hundido; en W el vidrio vive solo en el panel, así que dejan de fingir que
     son contenedores y lo que agrupa vuelve a ser el encabezado más el aire.
     Se ahorran dos capas translúcidas apiladas y el panel queda como una sola
     pieza de material, que es lo que se reconoce de lejos. El filete bajo cada
     encabezado es de tinta, no de luz: es el mismo que W le pone al canto de
     .d-panel-head, y a 1px sobre vidrio claro la línea blanca no se ve. */
  :global([data-d='W']) .fm-body { gap: var(--d-p4); }
  :global([data-d='W']) .fm-grid { gap: var(--d-p3); }
  :global([data-d='W']) .fm-set { padding-bottom: var(--d-p1); }
  :global([data-d='W']) .fm-leg,
  :global([data-d='W']) .fm-cap {
    padding-bottom: var(--d-p1);
    border-bottom: max(var(--d-bw), 1px) solid var(--d-edge);
  }

  /* CONTROLES OPACOS. El sufijo de unidad se queda con el canto suave de
     --d-edge, que es el mismo peso que el borde del campo al que está soldado:
     es texto fijo, no una zona que se toque, y un anillo oscuro de un lado de
     la costura y uno claro del otro delata que son dos piezas. Y no le toco el
     borde por una segunda razón: esta regla pesaría igual que
     .fm-f--bad .fm-u de la base y va después, así que le borraría el filo rojo
     al campo con error. */
  :global([data-d='W']) .fm-u { background: var(--d-neu-band); }
  /* La casilla y el interruptor sí llevan anillo de tinta, porque ahí el canto
     es lo único que dice dónde termina la zona que se toca. En --d-edge, al
     16 %, ese anillo da 1,4:1 sobre --d-neu-band; en --d-ink-3 da 6,2:1.
     Una escala de radio y ni un cuadrado de otra familia: el pozo a --d-r, la
     casilla a la mitad, la píldora solo en el riel del interruptor. */
  :global([data-d='W']) .fm-mark,
  :global([data-d='W']) .fm-sw {
    background: var(--d-neu-band);
    border-color: var(--d-ink-3);
  }
  :global([data-d='W']) .fm-mark { border-radius: calc(var(--d-r) / 2); }
  :global([data-d='W']) .fm-mark--rd { border-radius: var(--d-r-pill); }
  /* CUIDADO CON LA ESPECIFICIDAD, y acá se cobraba. Las tres reglas de arriba
     pesan (0,2,0) igual que .fm-in:checked + .fm-mark de la base, y van
     después: sin estas dos, la casilla marcada se quedaba gris con el glifo
     blanco encima, o sea invisible, y sin un solo error en consola. */
  :global([data-d='W']) .fm-in:checked + .fm-mark {
    background: var(--d-accent); border-color: var(--d-accent); color: var(--d-accent-ink);
  }
  :global([data-d='W']) .fm-in:checked + .fm-sw {
    background: var(--d-accent); border-color: var(--d-accent);
  }

  /* El foco del textarea. directions.css le da a W su propio foco a .d-input y
     .d-select (borde de acento, sin contorno) y deja el textarea con el
     contorno global de tinta: dos focos distintos en el mismo formulario. Se
     iguala acá, con el mismo par de tokens y sin tocar el otro archivo. La
     especificidad sube por elemento, (0,3,1), para no pelearle a nada. */
  :global([data-d='W']) textarea.fm-inp:focus-visible {
    outline: 0;
    border-color: var(--d-accent);
    box-shadow: 0 0 0 3px var(--d-accent-soft);
  }

  /* EL ÚNICO HALO. Misma firma que la fila crítica de directions.css: banda
     opaca, filo de 3px a la izquierda y un resplandor corto que no se derrama.
     El filo hace el trabajo cuando alguien no distingue el rojo, y debajo
     siguen el glifo y la frase completa, así que el estado nunca queda solo en
     color. --d-crit sobre --d-crit-band da 7,2:1. */
  :global([data-d='W']) .fm-f--bad {
    background: var(--tone-band);
    border-radius: var(--d-r);
    padding: var(--d-p2);
    box-shadow: inset 3px 0 0 var(--d-crit), 0 4px 18px -8px var(--d-crit);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }

  /* Bloqueado es opaco como todo lo demás: si lo dejo en --d-sunk, el campo
     que NO se puede tocar pasa a ser el único por el que se ven las manchas,
     que es la señal de affordance al revés. Y se sigue leyendo: --d-ink-2
     sobre --d-neu-band da 9,5:1. La palabra «bloqueado» va en la etiqueta, así
     que el estado tampoco depende del relleno. */
  :global([data-d='W']) .fm-f--off .fm-inp[disabled] {
    background: var(--d-neu-band);
    box-shadow: none;
  }

  /* Lo único que flota en esta página lo dibuja el navegador. Donde el select
     se pinta en página, se pinta con el token de W para lo que flota. */
  :global([data-d='W']) .fm-inp option {
    background: var(--d-overlay);
    color: var(--d-overlay-ink);
  }

  /* El pie es translúcido y el panel tiene 22px de radio: sin esto la banda
     del pie cuadra las dos esquinas de abajo por encima del vidrio. */
  :global([data-d='W']) .fm-foot { border-radius: 0 0 var(--d-r-lg) var(--d-r-lg); }

  /* Los dos modos que W ya contempla en directions.css para .d-panel valen
     igual para el buscador, que es el otro vidrio de la celda. El fondo no hay
     que reponerlo: en los dos modos --d-surface ya se vuelve sólido. */
  @media (prefers-reduced-transparency: reduce) {
    :global([data-d='W']) .fm-seek {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
  }
  @media (prefers-contrast: more) {
    :global([data-d='W']) .fm-seek {
      backdrop-filter: none; -webkit-backdrop-filter: none;
    }
  }

  /* ── W · PANTALLA ANGOSTA, DECLARADA ─────────────────────────────────────
     Nadie probó esto abajo de 500px, así que va escrito y no supuesto. Son dos
     fronteras porque son dos problemas distintos:

       MATERIAL, por ventana (560px, la misma de directions.css). El desenfoque
       de fondo es lo más caro que hay en una GPU de teléfono, y con el panel
       ocupando el ancho entero no queda campo alrededor que desenfocar: el
       efecto se paga y no se ve. Y el filo crítico engorda, porque 3px contra
       el marco del teléfono se pierden.

       DISPOSICIÓN, por contenedor (430px, la misma frontera con la que G y R
       apilan sus raíles). Una celda de 380px dentro de una ventana de 1400
       tiene el mismo problema de ancho que un teléfono, y acá las ocho celdas
       se comparan en paralelo.

     QUÉ SE APILA, EN ORDEN:
       1 · La rejilla de campos cae a una columna. Es la primera que se cae
           porque es la única que reparte ancho: con auto-fit y 168px de
           mínimo, «Valor» y «Fecha» todavía entran de a dos en 350px, y a ese
           ancho un campo de fecha nativo ya no muestra el año.
       2 · El botón Buscar baja a su propio renglón a lo ancho. Antes quedaba
           un muñón de 70px al lado de un campo de 200.
       3 · Las tres métricas pasan a un renglón cada una, de 44px de alto y
           todo el ancho: tres blancos de medio renglón son tres blancos que se
           fallan.
       4 · El pie se vuelve columna. No se reordena nada: Cancelar arriba y el
           primario abajo, que es donde llega el pulgar, y así el orden de
           tabulador sigue siendo el orden visual.

     QUÉ NO SE APILA: el par valor + unidad. Son UN control, y partirlo lo
     convierte en dos campos. El valor se encoge (min-width 0 en la base) y el
     sufijo se queda en sus 34px.

     QUÉ NO SE TRUNCA: ninguna etiqueta. Envuelven, con break-word por si algún
     idioma trae una palabra más larga que la columna. Ni un ellipsis en la
     celda.

     QUÉ SE VUELVE SCROLL HORIZONTAL: nada. No hay tabla acá y ningún bloque
     tiene ancho mínimo propio, así que la celda nunca empuja hacia los lados.
     Lo único que recorta en vez de envolver es el texto del select nativo
     («BAT-014 · Batidora Imer Syntesi 250»), que lo recorta el navegador
     dentro del campo y no ensancha nada.
     ──────────────────────────────────────────────────────────────────────── */
  @media (max-width: 560px) {
    :global([data-d='W']) .fm-seek {
      backdrop-filter: none; -webkit-backdrop-filter: none;
    }
    :global([data-d='W']) .fm-f--bad { box-shadow: inset 5px 0 0 var(--d-crit);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }
  }
  @container fm (max-width: 430px) {
    :global([data-d='W']) .fm-grid { grid-template-columns: minmax(0, 1fr); }
    :global([data-d='W']) .fm-lab { overflow-wrap: break-word; }
    :global([data-d='W']) .fm-seek-btn { flex: 1 1 100%; min-height: var(--d-touch); }
    :global([data-d='W']) .fm-radios { gap: var(--d-p1); }
    :global([data-d='W']) .fm-radios .fm-opt { flex: 1 1 100%; }
    /* Solo disposición: ni fondo, ni tinta, ni borde. Tocar .d-btn acá con
       (0,3,0) le arrancaría el relleno al primario y lo dejaría con tinta
       blanca sobre blanco. */
    :global([data-d='W']) .fm-foot { flex-direction: column; align-items: stretch; }
    :global([data-d='W']) .fm-acts { flex-direction: column; align-items: stretch; width: 100%; }
    :global([data-d='W']) .fm-foot .d-btn { width: 100%; min-height: var(--d-touch); }
  }

  /* ======================================================================
     RESPONSIVE — hasta 380px. Cuando la celda se estrecha, el raíl de G y la
     columna de caracteres de F se apilan: un raíl de 148px dentro de 300px
     no deja nada para el contenido.
     ====================================================================== */

  /* ======================================================================
     RESPONSIVE DE LAS ONCE.

     P · EL RAÍL DE 152px, MEDIDO. Aquí es donde vuelve: solo por encima de
     430px de ancho DEL FORMULARIO —no de la ventana—, que es la misma
     frontera con la que G conserva el suyo unas líneas más arriba. Por
     debajo, P no pierde identidad: la espina de marca y las versalitas de
     marca no dependen del ancho, y las etiquetas se apilan.
     ====================================================================== */

  /* Y donde no hay ancho: la etiqueta montada en el cabo de la cinta (N) y
     la columna de fichero de la vitrina (R) se apilan antes que recortarse. */
  @container fm (max-width: 430px) {
    :global([data-d='O']) .fm-seek-lab {
      flex: 1 1 100%;
      border-right: 0;
      border-bottom: max(var(--d-bw), 1px) solid var(--d-line);
      padding-block: 3px;
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

  /* ══ W · OBJETIVOS TÁCTILES, POR PUNTERO Y NO POR ANCHO ══════════════════
     El tamaño de un dedo es un hecho del aparato, no del ancho de la ventana.
     directions.css sube los .d-btn de W a --d-touch dentro de
     @media (max-width: 560px), así que una tableta de 768px —que se toca con
     el pulgar igual que un teléfono— se quedaba con los controles de ratón.
     Medido con puntero grueso emulado por CDP a 768px, esta página tenía
     15 objetivos por debajo de 44px. Va por (pointer: coarse) porque ese es
     el hecho que importa; el ancho ya tiene sus propias reglas y hacen otra
     cosa. Con ratón no cambia un pixel. */
  @media (pointer: coarse) {
    :global([data-d='W']) .d-btn,
    :global([data-d='W']) .fm-inp,
    :global([data-d='W']) .d-input,
    :global([data-d='W']) .d-select,
    :global([data-d='W']) .d-textarea { min-height: var(--d-touch); }
    /* La tarjeta de opción es el objetivo real: el radio y la casilla viven
       en .d-sr y quien toca, toca la tarjeta. */
    :global([data-d='W']) .fm-opt { min-height: var(--d-touch); }
  }

  /* ══════════════════════════════════════════════════════════════════════
     X · COTA. Papel mate y tinta, y una sola cifra con riel.

     LA ESCENA, que es de donde sale todo lo de abajo. Un técnico con la
     batidora enfrente, un guante puesto y el teléfono en la otra mano,
     anotando el horómetro antes de devolver el equipo a la bodega de San
     José. Tiene una sola pregunta y tiene que resolverla en tres segundos:
     el número que acabo de escribir, ¿ya pasó el tope del plan?

     REGLA 1 · EL COLOR ES ESTADO, HASTA EL FINAL.
     Contá el color de una celda de X en reposo. La píldora «Vencido» de la
     cabecera. La cifra y el relleno de la cota. El campo roto del bloque de
     estados. Tres cosas, las tres rojas, las tres hablando del mismo equipo.
     Nada más tiene un pixel de color: ni el buscador, ni las etiquetas, ni el
     selector de métrica, ni la casilla, ni el interruptor, ni el botón
     primario, que es tinta negra porque --d-accent de X es tinta.

     Por eso el asterisco de obligatorio SALE del rojo. «Obligatorio» no es un
     estado sino una propiedad del campo: está igual de rojo cuando el
     formulario está impecable. Con el asterisco teñido, la celda arranca con
     dos manchas de color que no informan de nada y el ojo deja de creerle al
     rojo justo cuando el rojo importa. Pasa a tinta; la obligatoriedad la
     sostienen la palabra escondida para lector de pantalla y la línea del pie.

     REGLA 2 · LA COTA VA UNA VEZ, DEBAJO DEL CAMPO DE LECTURA, y no está en
     los otros dos sitios donde hay cifras, a propósito:
       · el campo del bloque de errores (180 h) no lleva riel porque no es una
         lectura, es un valor RECHAZADO; y su referencia no es un tope sino un
         piso, la última registrada de 312 h. La marca de la primitiva es un
         tope y ponerla de piso miente al revés: el relleno corto leería
         «todavía te falta» cuando lo que pasa es «esto no puede bajar».
       · «78 equipos en la flota» y la nota del pie no tienen tope contra el
         que medirse, y un riel sin marca es una barra de progreso.

     LA COTA VIVE, y esa es la única moción de la celda que hace un trabajo:
     el relleno corre mientras se teclea y la nota se recalcula. Escribir 240
     lo deja corto de la marca y todo queda en gris; escribir 312 la pasa y la
     cifra, el relleno y la nota se ponen rojos a la vez. Eso es el producto.
     ══════════════════════════════════════════════════════════════════════ */

  /* El buscador es una tira de papel: una línea, el canto de 4px y el único
     pixel de sombra que trae el token. El campo y su botón comparten costura,
     así que se leen como UN control con su acción y no como dos objetos
     sueltos sobre la tira. */
  :global([data-d='X']) .fm-seek-ctl { gap: 0; flex-wrap: nowrap; }
  :global([data-d='X']) .fm-q { border-start-end-radius: 0; border-end-end-radius: 0; }
  :global([data-d='X']) .fm-seek-btn {
    border-start-start-radius: 0; border-end-start-radius: 0;
    margin-left: calc(-1 * max(var(--d-bw), 1px));
  }

  /* TRES ESCALONES DE TINTA Y NI UNO MÁS: encabezado de sección en tinta
     plena, etiqueta de campo un escalón abajo, ayuda en el tercero. La
     etiqueta sube de --d-ink-3 (5,7:1) a --d-ink-2 (9,4:1): es el rótulo que
     se busca primero con el equipo enfrente y no puede estar en el mismo gris
     que la letra chica que lo acompaña. */
  :global([data-d='X']) .fm-lab { color: var(--d-ink-2); }
  /* Figuras tabulares en todo lo que trae cifras, también en la letra chica:
     «312 h · 2 ago» sobre «180 h» tiene que alinear por dígito para que se
     comparen sin leerlas. */
  :global([data-d='X']) .fm-hint,
  :global([data-d='X']) .fm-msg,
  :global([data-d='X']) .fm-head .d-panel-title { font-variant-numeric: var(--d-num); }
  :global([data-d='X']) .fm-req { color: var(--d-ink); }

  /* Cada sección se abre con un renglón de la boleta: el nombre en tinta y una
     regla de un pixel que cruza la hoja de canto a canto. Es la única
     estructura que separa los tres bloques del cuerpo, y separa de verdad: no
     hay bandeja, ni relleno, ni caja dentro de la caja. */
  :global([data-d='X']) .fm-body { gap: var(--d-p4); }
  :global([data-d='X']) .fm-leg,
  :global([data-d='X']) .fm-cap {
    margin: 0 calc(-1 * var(--d-p3)) var(--d-p3);
    padding: 0 var(--d-p3) var(--d-p1);
    border-bottom: max(var(--d-bw), 1px) solid var(--d-line);
  }
  :global([data-d='X']) .fm-grid { gap: var(--d-p3) var(--d-p2); }

  /* LA COTA. Va pegada al canto de abajo del campo y ocupa su mismo ancho,
     así que se lee como la acotación de ese control y no como un gráfico
     suelto. Tamaño, peso, tracking y figuras tabulares ya vienen de la
     primitiva en directions.css; acá solo se ajusta el aire. */
  :global([data-d='X']) .fm-cota { margin-top: var(--d-p1); gap: 4px; }
  :global([data-d='X']) .fm-cota .d-cota-fig { line-height: 1; }
  :global([data-d='X']) .fm-cota .d-cota-note { line-height: 1.35; }
  :global([data-d='X']) .fm-cota .d-cota-fill { transition: width 140ms ease; }

  /* LA MÉTRICA ES UN SELECTOR DE TRES POSICIONES, NO TRES CASILLAS SUELTAS.
     Horas, kilómetros y días son excluyentes y cortas: en una máquina eso es
     una perilla con tres topes, no tres botones repartidos por la mesa. El
     segmentado dice cuál está puesta sin leer nada, porque la posición activa
     se rellena de tinta, y de paso saca de X la única forma redonda que
     quedaba (el punto del radio), que era una segunda escala de radio en una
     dirección que tiene una sola. El control sigue siendo un radio nativo:
     cambia el dibujo, no el elemento. */
  :global([data-d='X']) .fm-radios {
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0;
    background: var(--d-surface);
    border: max(var(--d-bw), 1px) solid var(--d-edge);
    border-radius: var(--d-r);
    overflow: hidden;
  }
  :global([data-d='X']) .fm-radios .fm-opt {
    justify-content: center; text-align: center; gap: 0;
    min-height: var(--d-row-h);
    padding: var(--d-p1) var(--d-p2);
  }
  :global([data-d='X']) .fm-radios .fm-opt + .fm-opt {
    border-left: max(var(--d-bw), 1px) solid var(--d-line);
  }
  :global([data-d='X']) .fm-radios .fm-mark { display: none; }
  :global([data-d='X']) .fm-radios .fm-opt-txt {
    flex: 0 1 auto; font-size: var(--d-t-xs); line-height: 1.25;
  }
  :global([data-d='X']) .fm-radios .fm-opt:has(.fm-in:checked) { background: var(--d-accent); }
  /* La unidad entre paréntesis vivía en --d-ink-3: sobre la posición puesta
     eso es gris medio sobre tinta y no se lee. Las dos piezas del segmento
     activo pasan a --d-accent-ink, que da 17:1. */
  :global([data-d='X']) .fm-radios .fm-opt:has(.fm-in:checked) .fm-opt-txt,
  :global([data-d='X']) .fm-radios .fm-opt:has(.fm-in:checked) .fm-opt-u {
    color: var(--d-accent-ink); font-weight: var(--d-w-semi);
  }
  /* El foco vivía en el punto del radio y el punto ya no está: pasa al
     segmento, que es lo que se ve y lo que se toca. */
  :global([data-d='X']) .fm-radios .fm-opt:has(.fm-in:focus-visible) {
    outline: 2px solid var(--d-focus); outline-offset: -2px;
  }

  /* Una sola escala de radio en toda la dirección. El interruptor deja la
     píldora y se vuelve un seccionador de tablero, que es la pieza que el
     técnico ya tiene en la mano todos los días. La casilla ya estaba en 4px. */
  :global([data-d='X']) .fm-sw { border-radius: var(--d-r); }
  :global([data-d='X']) .fm-sw::after { border-radius: calc(var(--d-r) / 2); }
  /* Las dos opciones de «Al guardar» son renglones de la boleta, con la misma
     línea de un pixel que separa las filas de una tabla en X. */
  :global([data-d='X']) .fm-choices { gap: 0; }
  :global([data-d='X']) .fm-choices .fm-opt {
    padding-block: var(--d-p1);
    border-bottom: max(var(--d-bw), 1px) solid var(--d-line);
  }
  :global([data-d='X']) .fm-choices .fm-opt:last-child { border-bottom: 0; }

  /* EL CAMPO ROTO SE ANUNCIA IGUAL QUE UNA FILA VENCIDA. directions.css le da
     a X un filo de 3px en el canto izquierdo más un lavado apenas para la fila
     crítica; el campo con error usa esa misma gramática, así que quien aprendió
     a leer «vencido» en la tabla ya sabe leerlo en el formulario. Eso es lo que
     evita tener que aprender dos vocabularios para el mismo hecho. */
  :global([data-d='X']) .fm-f--bad {
    position: relative;
    background: var(--d-crit-band);
    border-radius: var(--d-r);
    padding: var(--d-p2) var(--d-p2) var(--d-p2) calc(var(--d-p2) + 3px);
  }
  :global([data-d='X']) .fm-f--bad::before {
    content: ''; position: absolute; inset: 0 auto 0 0; width: 3px;
    border-radius: var(--d-r) 0 0 var(--d-r);
    background: var(--tone-fg);
  }

  /* FOCO EN TINTA, Y QUE SE VEA. directions.css le pone al campo de X un halo
     de negro al 22 %, que sobre papel blanco da 1,6:1: a esa altura el foco es
     el cambio de borde y nada más. Acá el canto pasa a tinta plena y el halo a
     --d-ink-3, que da 5,7:1 y se ve con el teléfono al sol. Va a (0,3,0) para
     no depender del orden en que se carguen las dos hojas, y el área de texto
     entra por la misma puerta: un solo foco en todo el formulario.

     HALLAZGO DE TOKEN: a X le falta un --d-focus-ring. El anillo quiere ser
     más tenue que --d-ink-3 y más firme que --d-edge, y hoy eso solo se
     escribe con un rgba a mano, que es exactamente lo que no se puede hacer
     desde una página. Con --d-ink-3 el anillo queda un punto más duro de lo
     ideal; es el precio de no inventar un hex acá. */
  :global([data-d='X']) .fm .fm-inp:focus-visible {
    outline: 0;
    position: relative; z-index: 1;
    border-color: var(--d-ink);
    box-shadow: 0 0 0 2px var(--d-ink-3);
  }
  /* El par valor + unidad es UN control, así que el anillo lo abraza entero.
     Sin esto el sufijo tapa el anillo del lado de la costura y el foco parece
     dibujado a medias. (0,4,0) y (0,5,0) para ganarle a la regla de arriba. */
  :global([data-d='X']) .fm .fm-unit:has(.fm-inp:focus-visible) {
    border-radius: var(--d-r);
    box-shadow: 0 0 0 2px var(--d-ink-3);
  }
  :global([data-d='X']) .fm .fm-unit:has(.fm-inp:focus-visible) .fm-inp { box-shadow: none; }
  :global([data-d='X']) .fm .fm-unit:has(.fm-inp:focus-visible) .fm-u { border-color: var(--d-ink); }
  /* Y el campo roto sigue rojo mientras se corrige. Si al enfocarlo el canto
     se volviera tinta, el error se apagaría justo cuando se está trabajando
     en él, que es el único momento en que hace falta. */
  :global([data-d='X']) .fm .fm-f--bad .fm-inp:focus-visible { border-color: var(--d-crit); }
  :global([data-d='X']) .fm .fm-f--bad .fm-unit:has(.fm-inp:focus-visible) {
    box-shadow: 0 0 0 2px var(--d-crit-edge);
  }
  :global([data-d='X']) .fm .fm-f--bad .fm-unit:has(.fm-inp:focus-visible) .fm-u {
    border-color: var(--d-crit);
  }

  /* BLOQUEADO ES LO ÚNICO QUE NO TIENE LABIO. Todo lo que se opera en X trae
     un pelo de sombra interior arriba, como papel prensado bajo el punzón; el
     campo que no se puede tocar lo pierde y queda plano contra la hoja. La
     señal de affordance es esa, no el gris, y se sigue leyendo: --d-ink-2
     sobre --d-sunk da 8,9:1, porque «Salida/devolución» es la respuesta a
     «¿de dónde salió este número?». */
  :global([data-d='X']) .fm-f--off .fm-inp[disabled] {
    background: var(--d-sunk); box-shadow: none;
  }

  /* El pie: banda hundida y una línea. Acá NO se le toca ni el fondo ni la
     tinta a .d-btn. Una regla con [data-d='X'] al frente pesa (0,2,0) o más y
     le gana a .d-btn--primary, que pesa (0,1,0): el primario se quedaría con
     el texto blanco sobre blanco y sin un error en consola. */
  :global([data-d='X']) .fm-foot { gap: var(--d-p2); }
  :global([data-d='X']) .fm-acts { gap: var(--d-p1); }

  /* ── X · PANTALLA ANGOSTA, DECLARADA A 380px ─────────────────────────────
     A 380px de ventana la celda entrega 340px de formulario (380 menos los
     20px de relleno de cada lado del escenario de Direction.svelte). Esto es
     lo que pasa exactamente a esa medida, escrito y no supuesto. La frontera
     es de CONTENEDOR, 430px, la misma con la que G, R y W apilan sus raíles,
     porque una celda de 380px dentro de una ventana de 1400 tiene el mismo
     problema de ancho que un teléfono y acá las veinte se ven en paralelo.

     QUÉ SE APILA, EN ORDEN:
       1 · La rejilla de campos cae a una columna. Valor y Fecha todavía
           entraban de a dos con el mínimo de 168px, y a ese ancho el campo de
           fecha nativo deja de mostrar el año.
       2 · El selector de métrica pasa de tres columnas a tres renglones de
           44px y las divisorias se acuestan. En 340px un tercio son 113px, y
           «Días de calendario (d)» se parte en tres líneas.
       3 · El botón Buscar baja a su propio renglón, a lo ancho y con 44px, y
           recupera sus cuatro cantos: ya no comparte costura con nada.
       4 · El pie se vuelve columna sin reordenar nada: Cancelar arriba y el
           primario abajo, que es donde llega el pulgar, así que el orden de
           tabulador sigue siendo el orden visual.

     QUÉ NO SE APILA: el par valor + unidad, que es un control y no dos (el
     valor se encoge con min-width 0 y el sufijo se queda en sus 34px), y la
     cota, que mide ese par y tiene que conservar su ancho exacto.

     QUÉ NO SE TRUNCA: nada. Etiquetas, nota de la cota y mensaje de error
     envuelven; no hay un solo ellipsis en la celda.

     QUÉ SE VUELVE SCROLL HORIZONTAL: nada. Ningún bloque de X tiene ancho
     mínimo propio, así que la celda no empuja hacia los lados. Lo único que
     recorta es el texto del select nativo («BAT-014 · Batidora Imer Syntesi
     250»), que lo recorta el navegador dentro del campo sin ensanchar nada.
     ──────────────────────────────────────────────────────────────────────── */
  @container fm (max-width: 430px) {
    :global([data-d='X']) .fm-grid { grid-template-columns: minmax(0, 1fr); }
    :global([data-d='X']) .fm-lab { overflow-wrap: break-word; }
    :global([data-d='X']) .fm-radios { grid-template-columns: minmax(0, 1fr); }
    :global([data-d='X']) .fm-radios .fm-opt { min-height: var(--d-touch); }
    :global([data-d='X']) .fm-radios .fm-opt + .fm-opt {
      border-left: 0;
      border-top: max(var(--d-bw), 1px) solid var(--d-line);
    }
    :global([data-d='X']) .fm-seek-ctl { flex-wrap: wrap; }
    :global([data-d='X']) .fm-q { border-radius: var(--d-r); }
    :global([data-d='X']) .fm-seek-btn {
      flex: 1 1 100%; margin-left: 0;
      border-radius: var(--d-r); min-height: var(--d-touch);
    }
    /* Solo disposición y alto. Tocarle el fondo a .d-btn desde acá pesaría
       (0,3,0) y le arrancaría el relleno al primario. */
    :global([data-d='X']) .fm-foot { flex-direction: column; align-items: stretch; }
    :global([data-d='X']) .fm-acts { flex-direction: column; align-items: stretch; width: 100%; }
    :global([data-d='X']) .fm-foot .d-btn { width: 100%; min-height: var(--d-touch); }
  }

  /* Objetivos táctiles por PUNTERO y no por ancho: el tamaño de un dedo es un
     hecho del aparato, no de la ventana. directions.css ya sube .d-btn,
     .d-input y .d-select de X con (pointer: coarse); faltaban la fila de
     opción y los segmentos del selector, que es lo que de verdad se toca,
     porque el radio y la casilla viven en .d-sr. */
  @media (pointer: coarse) {
    :global([data-d='X']) .fm-opt { min-height: var(--d-touch); }
  }

  /* Piso de artesanía, no parche. En contraste forzado el relleno de tinta del
     segmento activo lo pisa el sistema y la posición puesta dejaría de
     distinguirse, así que la marca la lleva un contorno; y el filo del campo
     roto vuelve a tinta del sistema, igual que hace directions.css con el filo
     de la fila crítica. */
  @media (forced-colors: active) {
    :global([data-d='X']) .fm-radios .fm-opt:has(.fm-in:checked) {
      outline: 2px solid CanvasText; outline-offset: -2px;
    }
    :global([data-d='X']) .fm-f--bad::before { background: CanvasText; }
  }
  @media (prefers-reduced-motion: reduce) {
    :global([data-d='X']) .fm-cota .d-cota-fill { transition: none; }
  }
</style>
