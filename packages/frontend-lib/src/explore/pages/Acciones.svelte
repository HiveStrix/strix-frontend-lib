<script>
  // ACCIONES — la familia de botones, vista en las ocho direcciones.
  //
  // Todo lo que se ve aquí actúa sobre equipos y tareas reales del módulo de
  // mantenimiento: la barra de herramientas es la del detalle de un equipo
  // vencido, el botón dividido registra una lectura, y el deshabilitado lo está
  // porque la compactadora nunca registró una.
  //
  // La silueta de cada dirección se expresa en el CSS de abajo: en B la barra es
  // UN marco continuo con separadores internos, en E son pastillas sueltas muy
  // separadas, en F una línea de comandos, en G una franja con el raíl a la
  // izquierda. Las variaciones por dirección van con :global([data-d='X']),
  // porque ese atributo vive en Direction.svelte y el alcance de Svelte no
  // cruza la frontera de componente.
  import { onDestroy, tick } from 'svelte';
  import Grid from '../Grid.svelte';
  import Direction from '../Direction.svelte';
  import { ASSETS, PLANS, markOf } from '../demo.js';

  export let directions = [];

  /** El equipo sobre el que actúa la barra: vencido hace 12 días. */
  const asset = ASSETS[0];        // BAT-014 · Batidora Imer Syntesi 250
  /** El que no deja marcar hecho: nunca se le tomó lectura. */
  const noRead = ASSETS[4];       // COM-07 · Compactadora Wacker DPU-6555

  // La cota de X necesita la lectura y el tope como NÚMEROS, porque separa la
  // cifra de su unidad y resta el sobrepaso. Los dos salen del mismo contenido
  // que ve el resto de las direcciones —asset.metric y plan.every— en vez de
  // escribirse a mano, para que nadie tenga que confiar en dos cifras sueltas.
  /** El plan que mide a BAT-014: cambio de aceite cada 250 h. */
  const plan = PLANS[0];
  /** 312 — el horómetro, de asset.metric ('312 h'). */
  const read = Number(asset.metric.replace(/\D/g, ''));
  /** 250 — el tope del plan, de plan.every ('cada 250 h'). */
  const cap = Number(plan.every.replace(/\D/g, ''));

  const ICONS = {
    gauge:
      '<path d="M2.4 12.2a6.4 6.4 0 1 1 11.2 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M8 12.2 11 6.9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    upload:
      '<path d="M8 10.6V2.8m0 0L5.3 5.5M8 2.8l2.7 2.7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M2.7 10.2v2.4a.7.7 0 0 0 .7.7h9.2a.7.7 0 0 0 .7-.7v-2.4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    out:
      '<path d="M9.6 2.6h3.8v3.8M13.4 2.6 8.1 7.9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M11.6 9.4v3.1a.7.7 0 0 1-.7.7H3.3a.7.7 0 0 1-.7-.7V4.9a.7.7 0 0 1 .7-.7h3.1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    trash:
      '<path d="M3.2 4.5h9.6M6.3 4.5V3.2a.7.7 0 0 1 .7-.7h2a.7.7 0 0 1 .7.7v1.3M4.6 4.5l.5 8.1a.7.7 0 0 0 .7.6h4.4a.7.7 0 0 0 .7-.6l.5-8.1" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
    more:
      '<circle cx="8" cy="3.3" r="1.25" fill="currentColor"/><circle cx="8" cy="8" r="1.25" fill="currentColor"/><circle cx="8" cy="12.7" r="1.25" fill="currentColor"/>',
    chevron:
      '<path d="M4.5 6.4 8 9.9l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    clock:
      '<circle cx="8" cy="8" r="5.6" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
      '<path d="M8 4.6V8l2.4 1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'
  };

  // Una sola dirección a la vez guarda o tiene el menú abierto: el catálogo se
  // lee mejor con un único foco de actividad, y así no hace falta mutar objetos.
  let openMenu = null;
  let busy = null;
  let timer;

  function save(id) {
    if (busy === id) return;
    busy = id;
    clearTimeout(timer);
    timer = setTimeout(() => (busy = null), 1900);
  }

  async function toggleMenu(e, id) {
    const el = e.currentTarget;
    if (openMenu === id) {
      openMenu = null;
      return;
    }
    openMenu = id;
    await tick();
    el.closest('.split-wrap')?.querySelector('.menu-item')?.focus();
  }

  async function toggleKey(e, id) {
    if (e.key === 'Escape') {
      openMenu = null;
      return;
    }
    if (e.key !== 'ArrowDown') return;
    e.preventDefault();
    const el = e.currentTarget;
    openMenu = id;
    await tick();
    el.closest('.split-wrap')?.querySelector('.menu-item')?.focus();
  }

  function menuKey(e) {
    const el = e.currentTarget;
    if (e.key === 'Escape') {
      openMenu = null;
      el.closest('.split-wrap')?.querySelector('.split-toggle')?.focus();
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = Array.from(el.closest('.menu').querySelectorAll('.menu-item'));
    const step = e.key === 'ArrowDown' ? 1 : items.length - 1;
    items[(items.indexOf(el) + step) % items.length].focus();
  }

  function choose(e, id) {
    openMenu = null;
    e.currentTarget.closest('.split-wrap')?.querySelector('.split-toggle')?.focus();
    save(id);
  }

  function leave(e, id) {
    // Sin relatedTarget el foco no fue a ningún lado (Safari al clicar un
    // botón): cerrar ahí mataría el clic antes de que llegue al menú.
    if (!e.relatedTarget) return;
    if (openMenu === id && !e.currentTarget.contains(e.relatedTarget)) openMenu = null;
  }

  onDestroy(() => clearTimeout(timer));
</script>

<Grid min="470px">
  {#each directions as d (d.id)}
    <!-- G y P van a sangre: sus franjas tienen que tocar los bordes de la
         celda. En P además la espina de marca baja pegada al canto izquierdo,
         y con el relleno del contenedor quedaría flotando a 20px del borde. -->
    <Direction id={d.id} flush={d.id === 'G' || d.id === 'P'}>
      <div class="spec">

        <!-- 1 · BARRA DE HERRAMIENTAS REAL -->
        <!-- En G el raíl de etiquetas es la primitiva .d-rail; en el resto de
             direcciones esa clase no pinta nada, así que sólo va en G. -->
        <section
          class="sec"
          class:d-rail={d.id === 'G'}
          data-tone={asset.tone}
          aria-labelledby="cap-bar-{d.id}"
        >
          <h4 class="sec-cap" id="cap-bar-{d.id}">Barra del equipo</h4>
          <div class="sec-body">
            <p class="ctx">
              <span class="ctx-code d-id">{asset.code}</span>
              <span class="ctx-name">{asset.name}</span>
              <span class="d-pill" data-tone={asset.tone}>
                <svg viewBox="0 0 12 12" aria-hidden="true">{@html markOf(asset.tone)}</svg>
                {asset.state} · {asset.due}
              </span>
            </p>

            <!-- LA COTA, Y SÓLO EN X.
                 Es la única cifra medida contra un tope que existe en esta
                 pantalla: el horómetro de BAT-014 contra las 250 h de su plan.
                 Va acá porque es lo que explica la barra de abajo — la primaria
                 dice «Registrar lectura» justamente porque el contador pasó su
                 tope hace 62 h. El orden de lectura queda: qué máquina, cuánto
                 se pasó, qué se puede hacer.
                 Las otras diecinueve direcciones no la llevan: la primitiva es
                 la firma de Cota, y meterla en las demás les cambiaría la
                 página en vez de dejarlas como están. -->
            {#if d.id === 'X'}
              <div class="cota d-cota" data-tone={asset.tone} style="--cota:{asset.pct}">
                <div class="d-cota-fig"><b>{read}</b> <span>h</span></div>
                <div class="d-cota-rail"><i class="d-cota-fill"></i><i class="d-cota-tick"></i></div>
                <div class="d-cota-note">horómetro · tope {cap} h · se pasó {read - cap} h</div>
              </div>
            {/if}

            <div class="bar" role="group" aria-label="Acciones de {asset.name}">
              <button type="button" class="d-btn d-btn--primary">
                <svg class="ico" viewBox="0 0 16 16" aria-hidden="true">{@html ICONS.gauge}</svg>
                <span class="glyph" aria-hidden="true">#</span>
                Registrar lectura
              </button>
              <button type="button" class="d-btn">
                <svg class="ico" viewBox="0 0 16 16" aria-hidden="true">{@html ICONS.upload}</svg>
                <span class="glyph" aria-hidden="true">^</span>
                Subir salida en PDF
              </button>
              <button type="button" class="d-btn">
                <svg class="ico" viewBox="0 0 16 16" aria-hidden="true">{@html ICONS.out}</svg>
                <span class="glyph" aria-hidden="true">&gt;</span>
                Exportar
              </button>
              <span class="bar-sep" aria-hidden="true"></span>
              <button
                type="button"
                class="d-btn d-btn--ghost only"
                title="Más acciones"
                aria-label="Más acciones de {asset.code}"
              >
                <svg class="ico" viewBox="0 0 16 16" aria-hidden="true">{@html ICONS.more}</svg>
                <span class="glyph" aria-hidden="true">...</span>
              </button>
              <button type="button" class="d-btn d-btn--danger bar-push">
                <svg class="ico" viewBox="0 0 16 16" aria-hidden="true">{@html ICONS.trash}</svg>
                <span class="glyph" aria-hidden="true">x</span>
                Eliminar equipo
              </button>
            </div>
          </div>
        </section>

        <!-- 2 · LA ESCALA: RANGO Y TAMAÑO EN UN SOLO BLOQUE -->
        <!-- Eran dos secciones rotuladas. Rango y tamaño son la misma pregunta
             («cuánto pesa este botón»), y partirla en dos obligaba a comparar
             de memoria entre bloques. Los dos tamaños ahora van uno al lado del
             otro, que es la única forma de ver una diferencia de 9px. -->
        <section class="sec" class:d-rail={d.id === 'G'} aria-labelledby="cap-esc-{d.id}">
          <h4 class="sec-cap" id="cap-esc-{d.id}">La escala de acción</h4>
          <div class="sec-body">
            <div class="row">
              <span class="cell">
                <button type="button" class="d-btn d-btn--primary">Registrar lectura</button>
                <span class="sub">primario</span>
              </span>
              <span class="cell">
                <button type="button" class="d-btn">Subir salida en PDF</button>
                <span class="sub">secundario</span>
              </span>
              <span class="cell">
                <button type="button" class="d-btn d-btn--ghost">Posponer</button>
                <span class="sub">fantasma</span>
              </span>
              <span class="cell">
                <button type="button" class="d-btn d-btn--danger">Eliminar equipo</button>
                <span class="sub">destructivo</span>
              </span>
              <span class="cell">
                <button type="button" class="d-btn" disabled>Marcar hecho</button>
                <span class="sub">deshabilitado</span>
              </span>
            </div>
            <p class="hint">
              «Marcar hecho» está deshabilitado: {noRead.code} · {noRead.name} no registró
              lectura {noRead.reading}.
            </p>
            <div class="row">
              <button type="button" class="d-btn d-btn--primary">Registrar lectura</button>
              <button type="button" class="d-btn d-btn--primary d-btn--sm">Registrar lectura</button>
              <span class="sub">normal en la cabecera del equipo, pequeño dentro de una fila de la tabla de planes</span>
            </div>
          </div>
        </section>

        <!-- 3 · GRUPO DE BOTONES -->
        <section class="sec" class:d-rail={d.id === 'G'} aria-labelledby="cap-grp-{d.id}">
          <h4 class="sec-cap" id="cap-grp-{d.id}">Sobre la selección</h4>
          <div class="sec-body">
            <div class="row">
              <span
                class="grp d-btn-group"
                role="group"
                aria-label="Acciones sobre 3 tareas seleccionadas"
              >
                <button type="button" class="d-btn">
                  <svg class="ico" viewBox="0 0 12 12" aria-hidden="true">{@html markOf('positive')}</svg>
                  <span class="glyph" aria-hidden="true">v</span>
                  Marcar hecho
                </button>
                <button type="button" class="d-btn">
                  <svg class="ico" viewBox="0 0 16 16" aria-hidden="true">{@html ICONS.clock}</svg>
                  <span class="glyph" aria-hidden="true">~</span>
                  Posponer
                </button>
                <button type="button" class="d-btn">Reasignar</button>
              </span>
              <button
                type="button"
                class="d-btn only"
                title="Exportar la selección"
                aria-label="Exportar las 3 tareas seleccionadas"
              >
                <svg class="ico" viewBox="0 0 16 16" aria-hidden="true">{@html ICONS.out}</svg>
                <span class="glyph" aria-hidden="true">&gt;</span>
              </button>
            </div>
            <p class="hint">
              3 tareas seleccionadas: Cambio de aceite · cada 250 h, Engrase general · cada 90 d,
              Cambio de refrigerante · cada 3 000 h.
            </p>
          </div>
        </section>

        <!-- 4 · BOTÓN DIVIDIDO -->
        <section class="sec" class:d-rail={d.id === 'G'} aria-labelledby="cap-div-{d.id}">
          <h4 class="sec-cap" id="cap-div-{d.id}">Acción dividida</h4>
          <div class="sec-body">
            <div class="split-wrap" on:focusout={(e) => leave(e, d.id)}>
              <span class="split">
                <button
                  type="button"
                  class="d-btn d-btn--primary split-main"
                  on:click={() => save(d.id)}
                >Registrar lectura</button>
                <button
                  type="button"
                  class="d-btn d-btn--primary split-toggle"
                  aria-haspopup="menu"
                  aria-expanded={openMenu === d.id}
                  aria-label="Otras formas de registrar la lectura"
                  on:click={(e) => toggleMenu(e, d.id)}
                  on:keydown={(e) => toggleKey(e, d.id)}
                >
                  <svg class="ico" viewBox="0 0 16 16" aria-hidden="true">{@html ICONS.chevron}</svg>
                  <span class="glyph" aria-hidden="true">v</span>
                </button>
              </span>

              {#if openMenu === d.id}
                <ul class="menu" role="menu" aria-label="Otras formas de registrar la lectura">
                  <li role="none">
                    <button
                      type="button" role="menuitem" class="menu-item"
                      on:click={(e) => choose(e, d.id)} on:keydown={menuKey}
                    >Registrar lectura y marcar hecho</button>
                  </li>
                  <li role="none">
                    <button
                      type="button" role="menuitem" class="menu-item"
                      on:click={(e) => choose(e, d.id)} on:keydown={menuKey}
                    >Registrar lectura y posponer 7 días</button>
                  </li>
                  <li role="none">
                    <button
                      type="button" role="menuitem" class="menu-item"
                      on:click={(e) => choose(e, d.id)} on:keydown={menuKey}
                    >Subir salida en PDF y leer el contador</button>
                  </li>
                </ul>
              {/if}
            </div>
            <p class="hint">Lectura anterior: {asset.reading} · origen {asset.source}.</p>
          </div>
        </section>

        <!-- 5 · CARGA Y ENLACE -->
        <section class="sec" class:d-rail={d.id === 'G'} aria-labelledby="cap-car-{d.id}">
          <h4 class="sec-cap" id="cap-car-{d.id}">Mientras guarda</h4>
          <div class="sec-body">
            <div class="row">
              <button
                type="button"
                class="d-btn d-btn--primary"
                aria-busy={busy === d.id}
                on:click={() => save(d.id)}
              >
                {#if busy === d.id}<span class="spin" aria-hidden="true"></span>{/if}
                {busy === d.id ? 'Guardando…' : 'Marcar hecho'}
              </button>
              <button type="button" class="d-btn" aria-busy="true" disabled>
                <span class="spin" aria-hidden="true"></span>
                Guardando…
              </button>
              <a class="link" href="#historial-{asset.code}">Ver el historial de {asset.code}</a>
            </div>
            <p class="hint">
              El botón queda ocupado hasta que el servidor confirma la lectura de {asset.metric}.
            </p>
            <p class="d-sr" role="status">{busy === d.id ? 'Guardando la lectura de ' + asset.code : ''}</p>
          </div>
        </section>

      </div>
    </Direction>
  {/each}
</Grid>

<style>
  /* ======================================================================
     BASE — sin un solo color, radio, sombra ni tamaño a mano: todo sale de
     los tokens --d-*, para que ninguna dirección mienta.
     ====================================================================== */
  .spec { display: grid; gap: var(--d-gap); align-content: start; min-width: 0; }
  .sec { position: relative; min-width: 0; }
  /* El rótulo de sección era una versalita —.d-cap— en las seis secciones, y
     seis versalitas seguidas no son jerarquía: son un ritmo parejo que tapa lo
     que sí importa (el nombre del equipo, el botón que hay que apretar). Ahora
     es un encabezado de verdad, con el mismo tratamiento que .d-panel-title de
     la librería, y ninguna sección lleva epígrafe. La única dirección que
     recupera la versalita es B, porque en Instrumento la chapa grabada ES la
     forma declarada, no un adorno heredado. */
  .sec-cap {
    margin: 0 0 var(--d-p2);
    font-size: var(--d-t-sm);
    font-weight: var(--d-w-semi);
    letter-spacing: -.01em;
    color: var(--d-ink);
  }
  .sec-body { display: grid; gap: var(--d-p2); min-width: 0; }

  .row { display: flex; align-items: center; flex-wrap: wrap; gap: var(--d-p1); min-width: 0; }
  .cell { display: inline-grid; justify-items: start; gap: calc(var(--d-p1) / 2); }
  .ctx { display: flex; align-items: baseline; flex-wrap: wrap; gap: var(--d-p1); margin: 0; min-width: 0; }
  .ctx-code { color: var(--d-ink-3); font-size: var(--d-t-xs); }
  /* Lo más grande del bloque es el nombre de la máquina, no el rótulo de la
     sección: con el equipo enfrente, eso es lo que se busca primero. */
  .ctx-name { font-weight: var(--d-w-semi); font-size: var(--d-t-md); letter-spacing: -.01em; }
  .hint { margin: 0; font-size: var(--d-t-xs); color: var(--d-ink-3); min-width: 0; }
  .sub { font-size: var(--d-t-2xs); color: var(--d-ink-3); }

  /* La barra de herramientas. Cada dirección la vuelve otra cosa más abajo. */
  .bar { display: flex; align-items: center; flex-wrap: wrap; gap: var(--d-p1); min-width: 0; }
  .bar-sep {
    align-self: stretch; width: 0; min-height: 1.6em;
    border-left: max(var(--d-bw), 1px) solid var(--d-line);
    margin-inline: var(--d-p1);
  }
  .bar-push { margin-left: auto; }

  /* Se escriben con .d-btn delante para ganarle en peso a los ajustes de
     botón por dirección, sin depender del orden de las hojas. */
  .d-btn.only { padding-inline: var(--d-p2); }
  @media (pointer: coarse) {
    .d-btn.only { min-width: var(--d-touch); min-height: var(--d-touch); }
    .menu-item { min-height: max(var(--d-row-h), var(--d-touch)); }
  }

  /* El icono mide en em: hereda el tamaño de texto de cada dirección. */
  .ico { width: 1.05em; height: 1.05em; flex: none; }
  .glyph { display: none; }         /* sólo F cambia icono por glifo */

  .grp { display: inline-flex; flex-wrap: wrap; }

  /* Botón dividido: acción principal + menú, con la costura entre los dos. */
  .split-wrap { position: relative; display: inline-flex; flex-direction: column; align-items: start; min-width: 0; }
  .split { display: inline-flex; max-width: 100%; }
  .d-btn.split-main { border-start-end-radius: 0; border-end-end-radius: 0; }
  .d-btn.split-toggle {
    border-start-start-radius: 0; border-end-start-radius: 0;
    padding-inline: var(--d-p2);
    margin-left: calc(-1 * max(var(--d-bw), 1px));
    border-inline-start-color: color-mix(in srgb, var(--d-accent-ink) 42%, transparent);
  }

  .menu {
    position: absolute; top: calc(100% + var(--d-p1)); left: 0; z-index: 6;
    display: grid; gap: 0;
    margin: 0; padding: var(--d-p1); list-style: none;
    width: max-content; min-width: 100%; max-width: min(320px, 72vw);
    /* --d-overlay si la dirección lo declara, su superficie si no. Las opacas
       no declaran ninguno y siguen igual: su superficie YA era sólida. */
    background: var(--d-overlay, var(--d-surface));
    border: max(var(--d-bw), 1px) solid var(--d-line);
    border-radius: var(--d-r);
    box-shadow: var(--d-shadow-lg);
  }
  .menu li { min-width: 0; }
  .menu-item {
    display: flex; align-items: center; width: 100%;
    min-height: var(--d-row-h);
    padding: var(--d-p1) var(--d-p2);
    font: inherit; font-size: var(--d-t-sm); text-align: left;
    color: var(--d-ink); background: transparent;
    border: 0; border-radius: var(--d-r);
    cursor: pointer;
  }
  .menu-item:hover { background: var(--d-sunk); }

  .link {
    font-size: var(--d-t-sm); font-weight: var(--d-w-med); color: var(--d-ink);
    text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 2px;
  }

  .spin {
    width: .85em; height: .85em; flex: none;
    border: max(var(--d-bw), 2px) solid currentColor; border-top-color: transparent;
    border-radius: var(--d-r-pill);
    animation: d-spin 720ms linear infinite;
  }
  @keyframes d-spin { to { transform: rotate(360deg); } }
  @keyframes d-blink { 50% { opacity: 0; } }

  /* ======================================================================
     A · ELEVACIÓN — la altura ES el rango.
     Antes todas las tarjetas flotaban a la misma altura y TODOS los botones
     traían sombra: una dirección cuya tesis es la elevación gastada en repartir
     la misma cantidad a todo el mundo. Ahora hay un escalón y significa algo.
     Arriba: el espécimen (la barra real del equipo) sube un escalón sobre las
     secciones de referencia. Abajo: dentro de una tarjeta, lo único levantado
     es el primario; el resto apoya plano y sube sólo cuando lo tocás. Con la
     vista borrosa, en cada tarjeta hay UNA cosa que flota.
     Y el separador de la barra vuelve a ser lo que esta dirección dice que es:
     aire. Una línea de 1px contradecía la única regla de A.
     ====================================================================== */
  :global([data-d='A']) .spec { gap: var(--d-p4); }
  :global([data-d='A']) .sec {
    background: var(--d-surface);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    padding: var(--d-p3);
  }
  :global([data-d='A']) .sec:first-child { box-shadow: var(--d-shadow-lg); }
  :global([data-d='A']) .sec-body { gap: var(--d-p3); }
  :global([data-d='A']) .bar { gap: var(--d-p2); }
  :global([data-d='A']) .bar-sep {
    border-left: 0; width: var(--d-p3); min-height: 0; margin-inline: 0;
  }
  :global([data-d='A']) .menu { border-radius: var(--d-r-lg); }
  :global([data-d='A']) .link { text-underline-offset: 3px; }
  :global([data-d='A']) .d-btn { box-shadow: none; }
  :global([data-d='A']) .d-btn:hover { box-shadow: var(--d-shadow); }
  :global([data-d='A']) .d-btn:active { box-shadow: none; transform: translateY(1px); }
  :global([data-d='A']) .d-btn--primary { box-shadow: var(--d-shadow-lg); }
  :global([data-d='A']) .d-btn--primary:hover { box-shadow: var(--d-shadow-lg); transform: translateY(-1px); }
  :global([data-d='A']) .d-btn--primary:active { box-shadow: var(--d-shadow); transform: translateY(1px); }
  :global([data-d='A']) .d-btn--ghost:hover { box-shadow: none; }
  :global([data-d='A']) .d-btn[disabled],
  :global([data-d='A']) .d-btn[disabled]:hover { box-shadow: none; transform: none; }
  /* El dividido es UN objeto sobre la mesa: una sombra, no dos pegadas. */
  :global([data-d='A']) .split { border-radius: var(--d-r); box-shadow: var(--d-shadow-lg); }
  :global([data-d='A']) .d-btn.split-main,
  :global([data-d='A']) .d-btn.split-toggle { box-shadow: none; }
  :global([data-d='A']) .d-btn.split-main:hover,
  :global([data-d='A']) .d-btn.split-toggle:hover { box-shadow: none; transform: none; }

  /* ======================================================================
     B · INSTRUMENTO — un solo marco continuo, y densidad de cabina de verdad.
     Cambia tres cosas respecto de la ronda anterior:

     1. El marco se CIERRA. Tenía dos marcas de esquina de cuatro, que en un
        plano técnico es un marco a medio dibujar. Las dos que faltaban cuelgan
        de la primera y la última sección, porque esos bordes son literalmente
        los del marco.
     2. Las cifras van en monoespaciada tabular. En esta dirección los pies de
        nota no son prosa: son lecturas («312 h · 2 ago», «cada 250 h»), y
        alineadas en la rejilla del carácter se comparan sin leerlas.
     3. El botón se alinea a la fila del instrumento (30px) y el tamaño pequeño
        vuelve a ser pequeño: `.d-btn--sm` medía 27px igual que el normal, así
        que la sección de dos tamaños mostraba dos veces el mismo botón.

     La versalita se queda SÓLO aquí. En Instrumento la chapa grabada es la
     forma declarada de la dirección; en las otras seis era ritmo heredado.
     ====================================================================== */
  /* Dentro del marco, lo único relleno es el primario: en un mundo de líneas de
     1px, una superficie sólida se ve desde la otra punta del taller. */
  /* Un instrumento no rebota: el contacto se confirma invirtiendo la tecla. */

  /* ======================================================================
     C · MARCA — el color es estructura, y por eso aparece en un solo sitio.
     La versión anterior tenía DOS franjas teal por bloque: la cabecera y la
     botonera. Con cinco bloques por celda eso son diez piezas de marca en
     pantalla, que es exactamente cómo un color de identidad se convierte en
     ruido. Peor: dentro de la franja teal, el primario quedaba blanco y los
     secundarios eran contornos blancos, así que la acción principal competía
     contra su propio fondo en vez de destacar.

     Ahora el teal está en la cabecera del bloque y en el botón primario, y en
     ningún otro lugar. La botonera pasa a ser una bandeja hundida con tabiques
     de un pelo, y el grupo es la MISMA bandeja: una sola idea de agrupador
     usada dos veces. El borde de la tarjeta se va: si el contenedor se anuncia
     por su cabecera, un borde alrededor es decir lo mismo dos veces.
     ====================================================================== */
  :global([data-d='C']) .sec {
    background: var(--d-surface);
    border: 0;
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    /* Sin overflow:hidden: recortaría el menú del botón dividido. La cabecera
       redondea sus propias esquinas de arriba. */
  }
  :global([data-d='C']) .sec-cap {
    margin: 0; padding: var(--d-p1) var(--d-p3);
    background: var(--d-brand); color: var(--d-brand-ink);
    border-radius: var(--d-r-lg) var(--d-r-lg) 0 0;
    letter-spacing: 0;
  }
  :global([data-d='C']) .sec-body { padding: var(--d-p3); }
  :global([data-d='C']) .bar,
  :global([data-d='C']) .grp {
    gap: 0;
    background: var(--d-sunk);
    border-radius: var(--d-r-lg);
    padding: calc(var(--d-p1) / 2);
  }
  :global([data-d='C']) .bar > .d-btn,
  :global([data-d='C']) .grp > .d-btn {
    border: 0; border-radius: var(--d-r); box-shadow: none;
  }
  :global([data-d='C']) .bar > .d-btn:not(.d-btn--primary):not(.d-btn--danger),
  :global([data-d='C']) .grp > .d-btn { background: transparent; }
  :global([data-d='C']) .bar > .d-btn:not(.d-btn--primary):not(.d-btn--danger):hover,
  :global([data-d='C']) .grp > .d-btn:hover { background: var(--d-surface); }
  :global([data-d='C']) .bar > .d-btn + .d-btn,
  :global([data-d='C']) .grp > .d-btn + .d-btn { border-left: 1px solid var(--d-line); }
  /* El destructivo se fue al otro extremo de la bandeja: un tabique suelto en
     medio del aire no separa nada. */
  :global([data-d='C']) .bar > .d-btn.bar-push { border-left: 0; }
  :global([data-d='C']) .bar-sep {
    margin-inline: 0; min-height: 0; align-self: stretch; border-left-color: var(--d-edge);
  }
  :global([data-d='C']) .menu { border-color: var(--d-line); }
  :global([data-d='C']) .menu-item:hover { background: var(--d-accent-soft); }
  :global([data-d='C']) .link { color: var(--d-brand); }

  /* ======================================================================
     D · PESO — bloques de 2px con sombra sólida. La barra es un solo bloque
     cuyos botones comparten borde; dentro del bloque no se mueven hacia la
     sombra, se invierten.
     ====================================================================== */

  /* ======================================================================
     E · AIRE — ni un borde en toda la celda. El separador de la barra es
     espacio, el grupo son pastillas sueltas y el dividido se parte en dos.
     ====================================================================== */

  /* ======================================================================
     F · TERMINAL — la barra es una línea de comandos: prompt, [cmd] [cmd],
     tubería como separador. Los iconos se cambian por glifos para que todo
     caiga en la rejilla del carácter.
     ====================================================================== */

  /* ======================================================================
     G · BANDA — ninguna caja. Franjas a sangre separadas por un pelo de
     línea y un cambio de tono, raíl de etiquetas a la izquierda (.d-rail) y
     el estado como filo de 3px en el canto izquierdo.
     ====================================================================== */
  @media (max-width: 720px) {
    /* Un raíl de 148px en un teléfono no deja nada para el contenido. */
  }

  /* ======================================================================
     H · FICHA — cada sección es una ficha con la pestaña saliendo arriba (la
     pestaña ES la cabecera), regla doble bajo ella y canto apilado abajo.
     ====================================================================== */
  /* La regla doble vuelve como separador de la barra, y la nota al pie de la
     ficha se lee como anotación a mano. */

  /* ======================================================================
     I · CRISTAL — vidrio sobre el campo de manchas.
     La regla que manda aquí es la que puede arruinarlo: NO se apilan
     desenfoques. La sección es el vidrio; la botonera de adentro anida por
     TRANSPARENCIA (un rebaje más claro sobre el mismo vidrio) y sus botones
     renuncian al backdrop-filter que traen de las primitivas. Si cada botón
     desenfocara lo que ya desenfocó el panel, el resultado no es más vidrio:
     es plástico lechoso.

     HALLAZGO: I —y también O y R— no exponen su desenfoque como token. No hay
     --d-blur, así que el `blur(18px) saturate(1.5)` de .d-panel hay que
     repetirlo a mano en cualquier contenedor que una página invente. Un
     --d-blur / --d-blur-sm en el bloque de tokens lo arreglaría de raíz.
     ====================================================================== */
  :global([data-d='I']) .spec { gap: var(--d-p4); }
  :global([data-d='I']) .sec {
    background: var(--d-surface);
    backdrop-filter: blur(18px) saturate(1.5);
    -webkit-backdrop-filter: blur(18px) saturate(1.5);
    border: max(var(--d-bw), 1px) solid var(--d-line);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    padding: var(--d-p3);
  }
  :global([data-d='I']) .sec-body { gap: var(--d-p3); }
  /* UNA sola escala de radio, que es lo que faltaba: la losa toma --d-r-lg y
     los gajos --d-r. Antes el grupo era una pastilla de 999px metida entre
     paneles de 24px, o sea dos formas distintas para el mismo objeto, que es
     el error que delata un sistema sin bloqueo de forma.
     Barra y grupo son ahora la misma losa segmentada. Los tabiques son luz
     (--d-line es blanco al 68 %), no líneas de tinta. */
  :global([data-d='I']) .bar,
  :global([data-d='I']) .grp {
    gap: 0;
    background: var(--d-sunk);
    border: max(var(--d-bw), 1px) solid var(--d-line);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    padding: var(--d-p1);
  }
  :global([data-d='I']) .bar > .d-btn,
  :global([data-d='I']) .grp > .d-btn {
    backdrop-filter: none; -webkit-backdrop-filter: none;
    border: 0; border-radius: var(--d-r); box-shadow: none;
  }
  :global([data-d='I']) .bar > .d-btn:not(.d-btn--primary):not(.d-btn--danger),
  :global([data-d='I']) .grp > .d-btn { background: transparent; }
  :global([data-d='I']) .bar > .d-btn:not(.d-btn--primary):not(.d-btn--danger):hover,
  :global([data-d='I']) .grp > .d-btn:hover { background: var(--d-surface); }
  :global([data-d='I']) .bar > .d-btn + .d-btn,
  :global([data-d='I']) .grp > .d-btn + .d-btn {
    border-left: max(var(--d-bw), 1px) solid var(--d-line);
  }
  :global([data-d='I']) .bar > .d-btn.bar-push { border-left: 0; }
  /* Lo único opaco del cristal es lo que se pulsa, así que el primario conserva
     su sombra y su filo especular: se lee SOBRE la losa, no dentro de ella. */
  :global([data-d='I']) .bar > .d-btn--primary { box-shadow: var(--d-shadow); }
  :global([data-d='I']) .bar-sep {
    margin-inline: 0; min-height: 0; align-self: stretch;
    border-left-color: var(--d-line);
  }
  :global([data-d='I']) .split { border-radius: var(--d-r); box-shadow: var(--d-shadow); }
  :global([data-d='I']) .d-btn.split-toggle { border-inline-start-color: var(--d-line); }
  /* HALLAZGO: I no tiene superficie opaca. El menú flota SOBRE el vidrio de la
     sección; darle su propio desenfoque sería vidrio sobre vidrio. Se anida con
     transparencia y sin desenfoque nuevo, pero con --d-surface una sola vez
     (blanco al 56 %) el texto de abajo se leía a través del menú, que es lo
     único de la página que TIENE que tapar. Dos capas de la misma --d-surface
     dan .81 de opacidad efectiva sin inventar un color: sigue siendo vidrio, ya
     no es una ventana. Un --d-surface-solid en los tokens lo resolvería sin
     apilar capas. */
  :global([data-d='I']) .menu {
    /* El apilado que pedía --d-surface-solid en la nota de arriba: ese token
       existe ahora y se llama --d-overlay. Una capa, opaca, sin trucos. */
    background: var(--d-overlay);
    backdrop-filter: none; -webkit-backdrop-filter: none;
    border-color: var(--d-line);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow-lg);
  }
  :global([data-d='I']) .menu-item { border-radius: var(--d-r); }
  :global([data-d='I']) .menu-item:hover { background: var(--d-surface); }
  :global([data-d='I']) .link { color: var(--d-accent); }
  /* HALLAZGO, y es el más caro de los tres: en directions.css la regla
     `[data-d='I'] .d-btn { background: rgba(255,255,255,.52) }` pesa (0,2,0) y
     `.d-btn--primary { background: var(--d-accent) }` pesa (0,1,0). Gana la de
     la dirección aunque esté antes, así que HOY el botón primario de Cristal
     es vidrio blanco con tinta blanca encima: ilegible. Lo mismo le pasa al
     destructivo, que pierde su banda. Se arregla en directions.css moviendo
     --primary/--danger detrás de la regla de dirección; mientras tanto, esta
     página los restituye para no publicar un primario invisible. */
  :global([data-d='I']) .d-btn--primary {
    background: var(--d-accent); color: var(--d-accent-ink);
  }
  :global([data-d='I']) .d-btn--danger {
    background: var(--d-crit-band); color: var(--d-crit); border-color: var(--d-crit-edge);
  }

  /* ======================================================================
     J · LACA — ninguna superficie es color plano.
     Cada plancha es un degradado vertical (--d-surface-fill / --d-sunk-fill) y
     el barrido de brillo vive en el tercio de arriba. Dos cuidados que pide la
     dirección: el barrido no atrapa el clic (pointer-events: none) y se pinta
     POR DEBAJO del contenido — un velo blanco al 62 % encima de la cabecera se
     la come. Por eso la sección se aísla y el contenido sube a z-index 1.
     ====================================================================== */
  /* Aislar la plancha la convierte en contexto de apilado, y entonces el orden
     entre secciones deja de ser automático: sin esta escalera el menú del
     botón dividido —que cuelga hacia abajo— quedaría debajo de la plancha
     siguiente, que es opaca. La escalera va al revés del DOM. */
  /* La bandeja: un rebaje lacado, con el degradado invertido y sombra interior. */
  /* El grupo es una sola plancha partida en gajos: comparten canto y cada gajo
     conserva su propio realce blanco arriba. */

  /* ======================================================================
     K · HALO — cero bordes, cero cajas.
     Una sección no es un recuadro: es una zona que irradia y se apaga sin
     filo, así que su «fondo» es un radial que se desvanece. Y el grupo son
     TRES LUCES SUELTAS, no una botonera: unirlas pediría un canto compartido
     y en esta dirección no existe el canto. Cada luz lleva el tono de lo que
     hace —hecho, pospuesto, reasignado— y el rótulo lo dice igual, así que el
     color nunca es la única señal.
     ====================================================================== */
  /* El estado es el color del resplandor, no un relleno. */
  /* El separador tampoco puede ser una línea: es un punto que irradia. */
  /* La costura del dividido no puede ser un borde: es una rendija de negro. */
  /* El hover tampoco rellena: enciende. */

  /* ======================================================================
     L · GUIJARRO — cuatro radios distintos por contenedor, y distintos entre
     vecinos. Si las seis secciones compartieran las mismas cuatro esquinas
     volverían a ser tarjetas, así que cada una rota su forma. Las variantes
     NO son números nuevos: son los dos tokens de radio cruzados en el eje
     horizontal y el vertical (`A / B`), que da esquinas elípticas sin
     inventar medidas.

     HALLAZGO: L declara --d-r y --d-r-lg y nada más. Una dirección cuya regla
     es «ningún vecino repite esquinas» pide una familia (--d-r-lg-2,
     --d-r-lg-3) en su bloque de tokens; cruzar los dos que hay alcanza para
     tres formas, no para más.
     ====================================================================== */
  /* Los guijarros no se alinean en un estante: se posan con aire entre ellos. */
  /* El dividido es UNA piedra con una grieta, no dos piedras. */

  /* ======================================================================
     M · BRUMA — no hay contenedores.
     La sección no tiene relleno, ni borde, ni radio: lo que agrupa es una
     mancha desenfocada que se derrama por detrás y se desvanece sin filo. Va
     en dos derrames descentrados, porque uno solo centrado se lee como un
     relleno con las esquinas borrosas —la caja que esta dirección no quiere
     ser—. Y los titulares van en serif con var(--d-display), que es el único
     bloque de tokens que la declara.

     El aislamiento no es decorativo: sin él la mancha en z-index -1 cae por
     debajo del fondo de la celda y no se ve nada.
     ====================================================================== */
  :global([data-d='M']) .spec { gap: var(--d-p4); }
  :global([data-d='M']) .sec { isolation: isolate; padding-block: var(--d-p1); }
  :global([data-d='M']) .sec::before {
    content: ''; position: absolute;
    inset: calc(-1 * var(--d-p3)) calc(-1 * var(--d-p4));
    /* --tone-wash, no --tone-band: directions.css separa los dos tokens
       justamente porque a 26px de desenfoque la banda de la píldora se
       desvanece hasta no agrupar nada. Esta página usaba el token equivocado y
       las manchas casi no se veían. */
    background:
      radial-gradient(58% 68% at 16% 12%, var(--tone-wash, var(--d-neu-wash)) 0%, transparent 70%),
      radial-gradient(50% 56% at 86% 88%, var(--tone-wash, var(--d-neu-wash)) 0%, transparent 68%);
    filter: blur(26px);
    pointer-events: none;
    z-index: -1;
  }
  :global([data-d='M']) .sec-cap {
    margin-bottom: var(--d-p2);
    font-family: var(--d-display);
    font-size: var(--d-t-lg); font-weight: 400;
    letter-spacing: -.01em; text-transform: none;
    color: var(--d-ink);
  }
  :global([data-d='M']) .sec-body { gap: var(--d-p3); }
  /* Mismo motivo que en J: aislar para que la mancha se vea cuesta el orden
     automático entre secciones, y el menú desplegado lo necesita. */
  :global([data-d='M']) .sec:nth-child(1) { z-index: 6; }
  :global([data-d='M']) .sec:nth-child(2) { z-index: 5; }
  :global([data-d='M']) .sec:nth-child(3) { z-index: 4; }
  :global([data-d='M']) .sec:nth-child(4) { z-index: 3; }
  :global([data-d='M']) .sec:nth-child(5) { z-index: 2; }
  :global([data-d='M']) .sec:nth-child(6) { z-index: 1; }
  :global([data-d='M']) .hint {
    font-family: var(--d-display); font-style: italic; font-size: var(--d-t-sm);
  }
  :global([data-d='M']) .bar { gap: var(--d-p2); }
  /* Ni siquiera el separador es una línea: es un borrón. */
  :global([data-d='M']) .bar-sep {
    border-left: 0; margin-inline: var(--d-p2);
    width: max(var(--d-bw), 2px); min-height: 1.2em; align-self: center;
    background: var(--d-neu-band); filter: blur(2px);
  }
  /* El grupo no se encierra: se posa sobre su propia mancha. Y esa mancha es
     NEUTRA, no de acento: el único color de la celda tiene que ser el del
     primario, o dejan de distinguirse a un metro de distancia. */
  :global([data-d='M']) .grp { isolation: isolate; gap: var(--d-p2); position: relative; }
  :global([data-d='M']) .grp::before {
    content: ''; position: absolute;
    inset: calc(-1 * var(--d-p2)) calc(-1 * var(--d-p3));
    background: radial-gradient(60% 100% at 50% 50%, var(--d-neu-wash) 0%, transparent 72%);
    filter: blur(14px);
    pointer-events: none;
    z-index: -1;
  }
  :global([data-d='M']) .grp > .d-btn { background: transparent; }
  :global([data-d='M']) .grp > .d-btn:hover { background: var(--d-sunk); }
  :global([data-d='M']) .split { gap: 2px; }
  :global([data-d='M']) .d-btn.split-toggle { margin-left: 0; border-inline-start-color: transparent; }
  /* HALLAZGO: M declara --d-surface: transparent y --d-shadow: none, que es lo
     correcto para un panel que no existe, pero deja sin resolver el único
     elemento que SÍ tiene que tapar lo de abajo: un menú flotante. Se toma
     --d-ground (el papel) porque es el único opaco del bloque, y la separación
     se construye con las escalas de espaciado. Un --d-surface-raised lo
     resolvería sin pedir prestado. */
  :global([data-d='M']) .menu {
    background: var(--d-ground);
    border: 0;
    border-radius: var(--d-r-lg);
    box-shadow: 0 var(--d-p2) var(--d-p4) calc(-1 * var(--d-p2)) var(--d-neu);
  }
  :global([data-d='M']) .menu-item { border-radius: var(--d-r); }
  /* --d-edge en Bruma es tinta al 16 %: el subrayado desaparecía y el enlace
     quedaba indistinguible de un pie de nota. */
  :global([data-d='M']) .link { text-decoration-color: var(--d-ink-3); text-underline-offset: 4px; }
  /* EL PRIMARIO DE BRUMA NO TIENE CAJA.
     Hay dos cosas que arreglar acá y la ronda anterior sólo arregló una. La
     primera es de peso: `[data-d='M'] .d-btn { background: var(--d-sunk) }`
     (0,2,0) tapa a `.d-btn--primary` (0,1,0), así que el primario salía con
     tinta casi blanca sobre un lavado casi blanco. La segunda es de dirección:
     devolverle una placa sólida de acento lo arreglaba pintando en Bruma el
     único rectángulo relleno de toda la celda, o sea contradiciendo la regla
     que define la dirección.
     Lo que se pulsa es el texto del acento sobre su propio derrame: una mancha
     sin filo, más ancha que el botón, que es la misma técnica que agrupa las
     secciones aplicada al elemento más chico. Al 34 % de acento el texto queda
     en 4.9:1 contra el centro de la mancha, y en el borde sube. Es lo único
     con color en toda la celda, y por eso se encuentra sin leer nada.

     Y para que se lea como el primero de una escalera y no como un botón raro,
     lo de al lado tuvo que ceder: `[data-d='M'] .d-btn { background:
     var(--d-sunk) }` le daba una placa gris a CADA botón, o sea que en la
     dirección que declara «ningún panel tiene relleno ni borde» todos los
     controles eran placas menos el importante. Ahora el relleno existe una vez
     por celda y es el derrame del primario. */
  :global([data-d='M']) .d-btn { background: transparent; }
  :global([data-d='M']) .d-btn:hover { background: var(--d-sunk); }
  :global([data-d='M']) .d-btn--ghost { color: var(--d-ink-3); }
  /* Misma excepción que en Halo claro: sin rótulo del que agarrarse, un botón
     de sólo icono necesita conservar su lavado o deja de leerse como control. */
  :global([data-d='M']) .d-btn.only { background: var(--d-sunk); }
  :global([data-d='M']) .d-btn--primary {
    position: relative; isolation: isolate;
    background: transparent;
    color: var(--d-accent); font-weight: var(--d-w-bold);
  }
  :global([data-d='M']) .d-btn--primary::before {
    content: ''; position: absolute;
    inset: calc(-1 * var(--d-p2)) calc(-1 * var(--d-p3));
    background: radial-gradient(56% 100% at 50% 50%,
                color-mix(in srgb, var(--d-accent) 34%, transparent) 0%, transparent 74%);
    filter: blur(12px);
    pointer-events: none;
    z-index: -1;
    transition: filter 160ms ease, opacity 160ms ease;
  }
  /* El único gesto de la dirección: al tocarlo, el color se derrama más lejos;
     al soltarlo, se recoge. Se mueve la mancha, no el botón. */
  :global([data-d='M']) .d-btn--primary:hover { background: transparent; }
  :global([data-d='M']) .d-btn--primary:hover::before { filter: blur(14px); }
  :global([data-d='M']) .d-btn--primary:active::before { filter: blur(6px); }
  /* El destructivo es lo contrario del primario: en una dirección sin cajas,
     lo que no querés que se pulse por error no se pinta. Dice lo que hace y
     lleva el rojo en la tinta, no debajo. */
  :global([data-d='M']) .d-btn--danger { background: transparent; color: var(--d-crit); }
  :global([data-d='M']) .d-btn--danger:hover { background: var(--d-crit-band); }

  /* ======================================================================
     N · CINTA — carriles de puntas redondas que se montan uno sobre otro.
     Hay orden de apilado explícito y sombra de contacto: cada carril pisa al
     de abajo por 9px. El orden va al REVÉS del DOM a propósito — si el carril
     siguiente pisara al anterior, taparía el menú desplegado del botón
     dividido, que cuelga hacia abajo.
     La botonera es el carril partido: los botones se solapan y forman una
     cinta continua que se CORTA en el separador y arranca de nuevo.
     ====================================================================== */
  /* El rótulo es la etiqueta cosida a la punta del carril. */
  /* El destructivo no se engancha al carril: se queda solo, al otro extremo.
     Hace falta decirlo con la misma especificidad que el solape, o el margen
     negativo se lo lleva puesto. */
  /* El corte del carril: un cabo de cinta, no una línea. */
  /* El grupo es un carril entero, hundido, con los gajos adentro. */
  /* El relleno de carril de N (línea 906 de directions.css) también le gana en
     peso a .d-btn--danger y le come la banda. Se devuelve como lo que es en
     esta dirección: un degradado a lo largo del carril, igual que .d-row[data-tone]. */

  /* ======================================================================
     O · PRISMA — vidrio con la marca teñida ADENTRO, flotando.
     La diferencia con I no es la paleta: la cabecera es el mismo vidrio
     teñido de marca (no una barra opaca que parta la tarjeta en dos), la
     sombra de Elevación la levanta de verdad, y la botonera es una PASTILLA
     de vidrio segmentado —tabiques de marca, no de luz blanca— en vez de la
     losa ancha de I. Misma técnica, silueta distinta.
     Mismo cuidado que en I: los botones de adentro pierden su desenfoque
     propio para no apilar vidrio sobre vidrio.
     ====================================================================== */
  :global([data-d='O']) .spec { gap: var(--d-p4); }
  :global([data-d='O']) .sec {
    background: var(--d-surface);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    border: max(var(--d-bw), 1px) solid var(--d-line);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow-lg);
    padding: 0 var(--d-p3) var(--d-p3);
  }
  /* La marca teñida ADENTRO del vidrio es la tesis entera de la dirección, y a
     --d-accent-soft (14 %) plano no se veía: la cabecera parecía vidrio neutro.
     El degradado de 22 % a 10 % es la misma receta que usa .d-panel-head en
     directions.css, escrita con el token en vez de con el color a mano, así que
     un cliente que rebindea --d-brand se lleva la cabecera con él. */
  :global([data-d='O']) .sec-cap {
    margin: 0 calc(-1 * var(--d-p3)) var(--d-p3);
    padding: var(--d-p2) var(--d-p3);
    background: linear-gradient(180deg,
                color-mix(in srgb, var(--d-accent) 22%, transparent),
                color-mix(in srgb, var(--d-accent) 10%, transparent));
    color: var(--d-brand-ink);
    border-bottom: max(var(--d-bw), 1px) solid var(--d-accent-edge);
    border-radius: var(--d-r-lg) var(--d-r-lg) 0 0;
  }
  :global([data-d='O']) .sec-body { gap: var(--d-p3); }
  /* Misma escala de radio que los paneles: losa en --d-r-lg, gajos en --d-r.
     La pastilla de 999px de la ronda anterior era la única forma de 999px en
     una celda construida sobre 22px; lo que separa a Prisma de Cristal no es
     ese radio suelto, son los tabiques teñidos y la cabecera de marca. */
  :global([data-d='O']) .bar,
  :global([data-d='O']) .grp {
    gap: 0;
    background: var(--d-accent-soft);
    border: max(var(--d-bw), 1px) solid var(--d-line);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    padding: calc(var(--d-p1) / 2);
  }
  :global([data-d='O']) .bar > .d-btn,
  :global([data-d='O']) .grp > .d-btn {
    backdrop-filter: none; -webkit-backdrop-filter: none;
    border: 0; border-radius: var(--d-r); box-shadow: none;
  }
  :global([data-d='O']) .bar > .d-btn:not(.d-btn--primary):not(.d-btn--danger),
  :global([data-d='O']) .grp > .d-btn { background: transparent; }
  :global([data-d='O']) .bar > .d-btn:not(.d-btn--primary):not(.d-btn--danger):hover,
  :global([data-d='O']) .grp > .d-btn:hover { background: var(--d-surface); }
  /* Los tabiques van teñidos de marca: es lo que hace que el vidrio se lea
     como UNA pieza de la marca y no como vidrio neutro con botones encima. */
  :global([data-d='O']) .bar > .d-btn + .d-btn,
  :global([data-d='O']) .grp > .d-btn + .d-btn {
    border-left: max(var(--d-bw), 1px) solid var(--d-accent-edge);
  }
  :global([data-d='O']) .bar > .d-btn.bar-push { border-left: 0; }
  :global([data-d='O']) .bar > .d-btn--primary { box-shadow: var(--d-shadow); }
  :global([data-d='O']) .bar-sep {
    margin-inline: 0; min-height: 0; align-self: stretch;
    border-left-color: var(--d-accent-edge);
  }
  :global([data-d='O']) .split { border-radius: var(--d-r); box-shadow: var(--d-shadow); }
  :global([data-d='O']) .d-btn.split-toggle { border-inline-start-color: var(--d-accent-edge); }
  /* HALLAZGO, y es el mismo choque de peso que ya estaba documentado para
     Cristal y Bruma pero que a Prisma no se le había aplicado: en
     directions.css `[data-d='O'] .d-btn { background: rgba(255,255,255,.58) }`
     pesa (0,2,0) y `.d-btn--danger` pesa (0,1,0). Hoy «Eliminar equipo» en
     Prisma es vidrio blanco con borde blanco: pierde la banda y queda idéntico
     a un secundario. Se restituye con los tokens de la dirección. */
  :global([data-d='O']) .d-btn--danger {
    background: var(--d-crit-band); color: var(--d-crit); border-color: var(--d-crit-edge);
  }
  /* Menú: mismas dos capas que en Cristal para que tape de verdad, más la
     misma cabecera teñida que llevan los bloques. Un borde superior de color no
     dice nada que la marca no diga mejor derramada sobre el primer renglón. */
  :global([data-d='O']) .menu {
    background-color: var(--d-surface);
    background-image:
      linear-gradient(180deg, color-mix(in srgb, var(--d-accent) 16%, transparent) 0, transparent var(--d-p4)),
      linear-gradient(var(--d-surface), var(--d-surface));
    backdrop-filter: none; -webkit-backdrop-filter: none;
    border-color: var(--d-line);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow-lg);
  }
  :global([data-d='O']) .menu-item { border-radius: var(--d-r); }
  :global([data-d='O']) .menu-item:hover { background: var(--d-accent-soft); }
  :global([data-d='O']) .link { color: var(--d-brand); }

  /* ======================================================================
     P · ESPINA — una columna de marca a la izquierda de la que cuelga todo.
     La espina no se repite por franja: es UNA sola pieza de color que baja por
     toda la celda, y por eso vive en .spec y no en cada sección. El estado no
     pinta fondo — muerde la espina con una muesca de su tono.

     El raíl de etiquetas de 152px VUELVE, que es lo que directions.css dejó
     pendiente. Pero vuelve medido: la sección se pregunta por el ancho REAL de
     su contenedor (@container, no @media), así que en una celda angosta el
     rótulo se queda arriba y nunca deja una palabra por línea. Ese fue el
     motivo por el que se había retirado.
     ====================================================================== */
  /* El grupo no son tres subrayados: es UN subrayado de marca continuo del que
     cuelgan las tres acciones, como cuelgan las franjas de la espina. */

  /* ======================================================================
     Q · CHAROL — masa dura con superficie mojada.
     Borde 2px negro, sombra sólida desplazada, y el brillo encima. Aquí el
     brillo va como CAPA DE FONDO y no como velo superpuesto: sobre un plano
     de charol rojo, un velo blanco encima del texto tira el contraste por
     debajo de AA. Como capa de fondo queda debajo de la tinta y el realce
     blanco duro del canto de arriba lo lleva un inset, que tampoco toca el
     texto. La botonera es un marco continuo: los botones comparten canto
     negro dentro de un solo bloque, y al presionar se hunden en vez de
     moverse hacia la sombra.
     ====================================================================== */
  /* Igual que en Cristal y Bruma, el relleno de la dirección le gana al de la
     variante. Aquí no basta con devolver la banda plana: en Charol ninguna
     superficie es color plano, así que vuelve como plancha lacada. */

  /* ======================================================================
     R · VITRINA — densidad de terminal en vidrio oscuro.
     Es la más densa de las diecinueve: fila de 26px, monoespaciada, y todo
     comando entre CORCHETES, que es lo que hace que la fila se lea sin aire.
     Se separa de F por el material: F es relleno opaco y glifos de texto;
     R conserva los iconos y las superficies son vidrio sobre el campo con luz
     —y por eso, como en I y O, lo de adentro de un panel no vuelve a
     desenfocar.
     ====================================================================== */
  /* El cursor de la consola, no la regla de guiones de F. */
  /* Corchetes pegados: [Marcar hecho][Posponer][Reasignar]. */

  /* ======================================================================
     S · UMBRA — la tarjeta se queda BLANCA y lo que informa es la sombra.
     directions.css le da la firma a .d-panel y a .d-row, y nada más: el
     marcado propio de esta página —secciones, botonera, grupo, menú, el botón
     destructivo— venía sin ella y por eso la dirección no se veía aquí.
     --umbra la escribe UNA vez: --tone-fg sólo existe donde hay estado, así
     que el fallback transparente deja limpio todo lo demás. Y como el valor de
     una custom property se resuelve en el elemento que la declara, la
     botonera de la sección vencida hereda el charco rojo YA resuelto sin
     tener que repetir el tono.
     El destructivo es el caso más claro: no se pinta de rojo, proyecta rojo —
     y sigue diciendo «Eliminar equipo» con su icono, así que el color nunca
     es la única señal.
     ====================================================================== */
  /* La botonera llega hasta el canto de la tarjeta: así su charco teñido se
     derrama por fuera del borde en vez de quedar escondido debajo. */

  /* ======================================================================
     T · HALO CLARO — el rango es cuánta luz tira cada cosa.
     Esta página es la de las acciones, así que la regla de Halo («nada tiene
     borde ni relleno sólido; un elemento existe porque IRRADIA») se gasta
     entera en una sola escalera, que además es la única pregunta que importa
     en una botonera:

       primario      anillo de acento + resplandor grande      la única fuente
       secundario    anillo neutro de 1px + resplandor corto
       fantasma      no irradia hasta que lo tocás
       destructivo   anillo y resplandor en rojo
       deshabilitado NO IRRADIA, y eso es todo lo que hace falta decir

     El deshabilitado es donde la dirección se paga sola. En las otras
     diecinueve es una opacidad al 45 % que deja el rótulo a media asta y falla
     contraste; acá es la ausencia de luz, que es exactamente lo que significa,
     y el texto puede quedarse legible (5.3:1) porque no necesita atenuarse para
     leerse apagado.

     Se separa de Umbra, que es la otra dirección clara con sombra de color, en
     que Umbra tiñe la sombra de una tarjeta que sigue siendo una tarjeta
     neutra; acá el anillo de 1px ES el contorno, no hay ninguno más, y el
     acento es un color que brilla en vez de ser tinta.
     ====================================================================== */
  :global([data-d='T']) .spec { gap: var(--d-p4); }
  :global([data-d='T']) .sec {
    background: var(--d-surface);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    padding: var(--d-p3);
  }
  /* El estado no se pinta: se irradia. La sección del equipo vencido lleva el
     anillo y el halo en rojo, y el texto sigue leyéndose sobre blanco puro. */
  :global([data-d='T']) .sec[data-tone] {
    box-shadow:
      0 0 0 1px var(--tone-edge),
      0 var(--d-p2) var(--d-p4) calc(-1 * var(--d-p2)) var(--tone-fg);
  }
  :global([data-d='T']) .sec-body { gap: var(--d-p3); }
  /* Sin cajas: la botonera no existe como objeto. Lo que agrupa es que las tres
     acciones nombradas irradian igual, y lo que separa al destructivo es el
     aire más el color de su propia luz. Un tabique de 1px sería la única línea
     de la dirección. */
  :global([data-d='T']) .bar { gap: var(--d-p2); }
  :global([data-d='T']) .bar-sep {
    border-left: 0; width: var(--d-p3); min-height: 0; margin-inline: 0;
  }
  :global([data-d='T']) .d-btn:hover {
    background: var(--d-sunk);
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--d-ink) 16%, transparent),
      0 var(--d-p1) var(--d-p3) calc(-1 * var(--d-p1)) color-mix(in srgb, var(--d-accent) 42%, transparent);
  }
  /* El primario es la única fuente de luz de la celda. Al tocarlo el halo se
     abre, al presionarlo se recoge: el gesto de la dirección es la luz, no el
     desplazamiento. */
  :global([data-d='T']) .d-btn--primary {
    box-shadow:
      0 0 0 1px var(--d-accent),
      0 var(--d-p1) var(--d-p4) calc(-1 * var(--d-p1)) color-mix(in srgb, var(--d-accent) 62%, transparent);
  }
  :global([data-d='T']) .d-btn--primary:hover {
    background: var(--d-accent);
    box-shadow:
      0 0 0 1px var(--d-accent),
      0 var(--d-p2) calc(var(--d-p4) * 1.3) calc(-1 * var(--d-p1)) color-mix(in srgb, var(--d-accent) 78%, transparent);
  }
  :global([data-d='T']) .d-btn--primary:active {
    background: var(--d-accent);
    box-shadow:
      0 0 0 1px var(--d-accent),
      0 calc(var(--d-p1) / 2) var(--d-p2) calc(-1 * var(--d-p1)) var(--d-accent);
  }
  :global([data-d='T']) .d-btn--danger {
    background: var(--d-surface); color: var(--d-crit);
    box-shadow:
      0 0 0 1px var(--d-crit-edge),
      0 var(--d-p1) var(--d-p3) calc(-1 * var(--d-p1)) color-mix(in srgb, var(--d-crit) 50%, transparent);
  }
  :global([data-d='T']) .d-btn--danger:hover {
    background: var(--d-crit-band);
    box-shadow:
      0 0 0 1px var(--d-crit),
      0 var(--d-p2) var(--d-p4) calc(-1 * var(--d-p1)) color-mix(in srgb, var(--d-crit) 60%, transparent);
  }
  /* HALLAZGO: `.d-btn[disabled] { box-shadow: none }` vive en directions.css
     ANTES de `[data-d='T'] .d-btn { box-shadow: <anillo + halo> }`, y las dos
     pesan (0,2,0). Gana la de la dirección: hoy un botón deshabilitado en Halo
     claro sigue irradiando igual que uno vivo, sólo que al 45 % de opacidad. */
  :global([data-d='T']) .d-btn[disabled],
  :global([data-d='T']) .d-btn[disabled]:hover {
    opacity: 1;
    background: var(--d-sunk);
    color: var(--d-ink-3);
    box-shadow: none;
  }
  :global([data-d='T']) .d-btn--ghost { background: transparent; box-shadow: none; }
  /* Excepción con motivo: un botón de sólo icono no tiene rótulo del que
     agarrarse, así que en una dirección sin bordes es lo único que se vuelve
     invisible. El anillo de 1px es el mínimo para que se lea como un control. */
  :global([data-d='T']) .d-btn--ghost.only:not(:hover) {
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--d-ink) 10%, transparent);
  }
  /* El grupo es una sola charca de luz con las tres acciones adentro; los gajos
     dejan de irradiar por su cuenta porque ya están dentro del halo. */
  :global([data-d='T']) .grp {
    gap: 0;
    background: var(--d-surface);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    padding: calc(var(--d-p1) / 2);
  }
  :global([data-d='T']) .grp > .d-btn {
    background: transparent; border-radius: var(--d-r); box-shadow: none;
  }
  :global([data-d='T']) .grp > .d-btn:hover { background: var(--d-sunk); box-shadow: none; }
  /* El dividido es UNA luz partida: el halo lo lleva la pieza entera y la
     costura es la rendija por donde se ve el filo del acento. */
  :global([data-d='T']) .split {
    border-radius: var(--d-r);
    box-shadow:
      0 0 0 1px var(--d-accent),
      0 var(--d-p1) var(--d-p4) calc(-1 * var(--d-p1)) color-mix(in srgb, var(--d-accent) 62%, transparent);
  }
  :global([data-d='T']) .d-btn.split-main,
  :global([data-d='T']) .d-btn.split-main:hover { box-shadow: none; background: var(--d-accent); }
  :global([data-d='T']) .d-btn.split-toggle,
  :global([data-d='T']) .d-btn.split-toggle:hover {
    margin-left: 0; background: var(--d-accent);
    box-shadow: inset 1px 0 0 color-mix(in srgb, var(--d-accent-ink) 40%, transparent);
  }
  :global([data-d='T']) .menu {
    background: var(--d-surface);
    border-color: transparent;
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow-lg);
  }
  :global([data-d='T']) .menu-item { border-radius: var(--d-r); }
  /* Hover en un menú también es encender, pero el renglón se queda en tinta:
     el acento sobre su propio lavado deja el texto en 4.6:1 y no vale gastar
     el margen entero para colorear una fila que ya se señala con el anillo. */
  :global([data-d='T']) .menu-item:hover {
    background: var(--d-accent-soft);
    box-shadow: 0 0 0 1px var(--d-accent-edge);
  }
  :global([data-d='T']) .link { color: var(--d-accent); text-decoration-color: var(--d-accent-edge); }
  :global([data-d='T']) .spin { border-color: currentColor; border-top-color: transparent; }

  /* ======================================================================
     W · CRISTAL TEMPLADO. El vidrio se gasta UNA vez, en el panel.

     Esta página es la que más caro le sale a Cristal. En I todo lo que agrupa
     botones se convierte en otra losa de vidrio, y con cinco bloques por celda
     terminan siendo cinco superficies translúcidas apiladas más las botoneras
     de adentro. W dice lo contrario y acá se nota a simple vista: hay UNA losa
     de vidrio por bloque y encima fichas opacas. En el ensayo con la vista
     borrosa, I muestra cajas dentro de cajas y W muestra objetos sobre un
     cristal.

     Lo que NO se hace acá, y en I sí: la botonera no es una bandeja. Una
     bandeja obliga a que los botones de adentro se vuelvan transparentes para
     no pisarla, y un control transparente es justo lo que la regla 4 de la
     dirección prohíbe, porque en W la opacidad ES la señal de que algo se
     toca. Lo que agrupa la barra es el panel, el aire y un pelo de tinta
     delante del destructivo. El único sitio donde los botones comparten canto
     es el grupo de «Sobre la selección», y ahí el canto compartido dice algo
     verdadero: las tres acciones caen sobre la misma selección, o sea que son
     una decisión con tres salidas y no tres decisiones.

     HALLAZGO, el mismo que ya está anotado para I: la dirección no expone su
     desenfoque como token. Sin --d-blur, el blur(20px) saturate(1.5) de
     .d-panel hay que repetirlo a mano en cualquier contenedor que una página
     invente. Tampoco hay token para el anillo del doble bisel ni para el pelo
     de tinta de la cabecera; los dos se derivan de --d-line y de --d-ink con
     color-mix en vez de escribir un blanco o un gris a mano.
     ====================================================================== */
  :global([data-d='W']) .spec {
    /* El umbral de esta página se mide contra el ancho REAL de la celda y no
       contra el de la ventana. La rejilla del catálogo va de una a tres
       columnas, así que a 1440px una celda puede ser tan angosta como la
       pantalla de un teléfono, y a 380px la celda ES la pantalla. Preguntarle
       al viewport da la respuesta equivocada en los dos extremos, y además es
       lo que dejó este hueco sin encontrar: Chrome headless en macOS recorta
       el ancho mínimo, así que la ventana nunca bajó de 500px. El contenedor
       sí baja. */
    container-type: inline-size;
    container-name: acc-w;
    gap: var(--d-p4);
  }

  /* EL PANEL, la única pieza de vidrio del bloque. */
  :global([data-d='W']) .sec {
    background: var(--d-surface);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    border: max(var(--d-bw), 1px) solid var(--d-line);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
  }
  /* El desenfoque convierte al panel en contexto de apilado, y entonces el
     orden entre bloques deja de ser automático: el menú desplegado, que cuelga
     hacia abajo, quedaría por DEBAJO del bloque siguiente, que también
     desenfoca. La escalera va al revés del DOM, igual que en Bruma y en Cinta.
     Sin ella el menú se ve, porque es sólido, pero se ve tapado. */
  :global([data-d='W']) .sec:nth-child(1) { z-index: 6; }
  :global([data-d='W']) .sec:nth-child(2) { z-index: 5; }
  :global([data-d='W']) .sec:nth-child(3) { z-index: 4; }
  :global([data-d='W']) .sec:nth-child(4) { z-index: 3; }
  :global([data-d='W']) .sec:nth-child(5) { z-index: 2; }
  /* EL DOBLE BISEL, que en directions.css cuelga de .d-panel. Un panel de
     vidrio apoyado plano sobre el fondo se ve como un recorte; con dos anillos
     concéntricos, uno exterior de sombra que lo despega del campo y uno
     interior de luz que le da canto, se ve como una pieza. */
  :global([data-d='W']) .sec::after {
    content: ''; position: absolute; inset: 1px;
    border-radius: calc(var(--d-r-lg) - max(var(--d-bw), 1px));
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--d-line) 64%, transparent);
    pointer-events: none;
  }
  /* La cabecera del bloque es la de un .d-panel de la librería, con el mismo
     pelo de tinta al 10 % que W le da a .d-panel-head. Quien ya conoce el
     panel reconoce el bloque sin aprender una forma nueva, que en una pantalla
     de trabajo vale más que la forma nueva. */
  :global([data-d='W']) .sec-cap {
    margin: 0;
    padding: var(--d-p2) var(--d-p3);
    border-bottom: max(var(--d-bw), 1px) solid color-mix(in srgb, var(--d-ink) 10%, transparent);
  }
  :global([data-d='W']) .sec-body { padding: var(--d-p3); gap: var(--d-p3); }
  :global([data-d='W']) .cell { min-width: 0; }
  :global([data-d='W']) .hint,
  :global([data-d='W']) .sub,
  :global([data-d='W']) .ctx-name { overflow-wrap: break-word; }

  /* LA EXCEPCIÓN, Y LA ÚNICA. El equipo vencido irradia y nada más en la celda
     lo hace. El filo de 3px a la izquierda es la misma marca que directions.css
     le pone a la fila y al panel críticos, así que el gesto se aprende una vez
     y sirve en toda la dirección; además hace el trabajo cuando alguien no
     distingue el rojo. La sombra base se conserva detrás para que el bloque no
     pierda su canto de luz al ponerse crítico. */
  :global([data-d='W']) .sec[data-tone='critical'] {
    box-shadow:
      inset 3px 0 0 var(--d-crit),
      0 4px 18px -8px color-mix(in srgb, var(--d-crit) 55%, transparent),
      var(--d-shadow);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }

  /* LA BARRA TIENE DOS PISOS, EN CUALQUIER ANCHO.
     Medida en la celda real del catálogo, la botonera de este equipo pide unos
     760px y la celda da 640 en el mejor caso, así que envuelve siempre. Y con
     `margin-left: auto`, envolver dejaba «Eliminar equipo» solo en el segundo
     renglón, pegado al canto derecho y con medio renglón de hueco delante:
     flotando sin dueño, y encima con el aspecto de ser lo más importante de la
     barra por estar aparte.
     La regla ocupa su propio renglón y ordena los dos pisos: arriba las tres
     órdenes que operan el equipo, abajo lo que no lo opera, o sea el menú de
     más acciones y el destructivo. Así el corte deja de ser un accidente del
     ancho y pasa a decir algo. Es el mismo separador de siempre, girado de eje.
     --d-line es blanco al 70 %, invisible sobre un panel casi blanco, así que
     la regla toma --d-edge, que es el filo de tinta de la dirección. */
  :global([data-d='W']) .bar { gap: var(--d-p2); }
  :global([data-d='W']) .bar-sep {
    flex: 1 0 100%;
    width: auto; height: 0; min-height: 0;
    margin: 0;
    border-left: 0;
    border-top: max(var(--d-bw), 1px) solid var(--d-edge);
  }
  :global([data-d='W']) .link { color: var(--d-accent); text-underline-offset: 3px; }
  /* Sin retardo de doble toque en el único elemento de la página que se toca. */
  :global([data-d='W']) .d-btn { touch-action: manipulation; }

  /* El grupo comparte canto porque las tres acciones caen sobre la MISMA
     selección. Sigue siendo opaco: lo que cambia es dónde están las esquinas,
     no de qué está hecho el botón. */
  @container acc-w (min-width: 26rem) {
    :global([data-d='W']) .grp { gap: 0; }
    :global([data-d='W']) .grp > .d-btn:not(:first-child) {
      margin-left: calc(-1 * max(var(--d-bw), 1px));
      border-start-start-radius: 0; border-end-start-radius: 0;
    }
    :global([data-d='W']) .grp > .d-btn:not(:last-child) {
      border-start-end-radius: 0; border-end-end-radius: 0;
    }
  }

  /* LAS VARIANTES, QUE ES DONDE ESTA DIRECCIÓN SE COBRA PÁGINAS.
     `[data-d='W'] .d-btn` pesa (0,2,0) y las variantes pesan (0,1,0), así que
     la dirección le gana a la variante en todo lo que la dirección toca.
     directions.css repone el primario en reposo, pero NO repone ninguna
     variante en :hover, y `[data-d='W'] .d-btn:hover { background: #FFFFFF }`
     pesa (0,3,0). O sea que hoy, al pasarle el ratón, el primario de W se
     vuelve blanco y conserva la tinta blanca: texto blanco sobre fondo blanco,
     sin un error en consola. Al destructivo le pasa lo mismo y encima pierde
     la banda. Se reponen las dos acá, y con ellas el fantasma y el
     deshabilitado, que también quedaban blancos al pasar por encima. */
  :global([data-d='W']) .d-btn--primary:hover {
    background: var(--d-accent); filter: brightness(1.12);
  }
  /* El destructivo se separa del primario por VALOR, no por tono: el primario
     es tinta clara sobre un bloque oscuro y el destructivo es tinta oscura
     sobre una banda clara. En escala de grises son opuestos, así que se
     distinguen sin que el rojo participe. El anillo va en --d-crit a plena
     fuerza y no en --d-crit-edge, porque sobre vidrio el filo pálido se
     desvanecía y el botón quedaba idéntico a un secundario con la tinta roja. */
  :global([data-d='W']) .d-btn--danger {
    background: var(--d-crit-band);
    color: var(--d-crit);
    border-color: var(--d-crit);
  }
  :global([data-d='W']) .d-btn--danger:hover {
    background: color-mix(in srgb, var(--d-crit-band) 82%, var(--d-crit));
  }
  /* En W lo opaco es lo que se toca, así que el hover del fantasma es
     MATERIALIZAR: pasa de no existir a ser una ficha sólida con su canto. El
     relleno blanco ya se lo da la dirección; lo que falta es el filo. */
  :global([data-d='W']) .d-btn--ghost:hover { border-color: var(--d-edge); }
  /* Excepción con motivo: «Más acciones» no tiene rótulo del que agarrarse. En
     una dirección donde el canto es lo que dice «esto es un control», el botón
     de sólo icono necesita el suyo desde el principio, no al pasar el ratón. */
  :global([data-d='W']) .d-btn--ghost.only { border-color: var(--d-edge); }
  /* El deshabilitado. `.d-btn[disabled] { opacity: .45 }` sobre vidrio deja la
     tinta en 2.9:1 contra el panel, y además `[data-d='W'] .d-btn:hover` le
     pinta el fondo blanco al pasar por encima, que es lo contrario de lo que un
     control apagado tiene que hacer. Acá se apaga con la banda neutra OPACA de
     la dirección: 6.2:1 de --d-ink-3 contra --d-neu-band. Y lo que dice «no se
     puede» no es el color sino que perdió el canto de luz y la sombra de
     contacto, o sea que dejó de ser un objeto apoyado sobre el vidrio. */
  :global([data-d='W']) .d-btn[disabled],
  :global([data-d='W']) .d-btn[disabled]:hover {
    opacity: 1;
    background: var(--d-neu-band);
    color: var(--d-ink-3);
    border-color: var(--d-neu-edge);
    box-shadow: none;
    transform: none;
  }
  /* El anillo de foco de la dirección sale 2px hacia afuera. En el grupo y en
     el dividido los cantos se tocan, así que sin esto el anillo del botón con
     foco queda por debajo del vecino y se lee a medias. */
  :global([data-d='W']) .d-btn:focus-visible { position: relative; z-index: 2; }

  /* LO QUE FLOTA VA SÓLIDO, Y ACÁ HAY QUE ESCRIBIRLO.
     directions.css trae la red de seguridad `[data-d='W'] [class*='menu']`,
     pero pesa (0,2,0) y el `.menu` de esta página pesa lo mismo en cuanto
     Svelte le agrega su clase de alcance. Empatan, y gana la que se imprime
     después, que es la del componente: sin estas líneas el menú de W volvería a
     ser --d-surface, o sea vidrio, y el texto del bloque de abajo se leería a
     través del renglón «Registrar lectura y posponer 7 días». Es exactamente el
     defecto que esta dirección existe para arreglar. */
  :global([data-d='W']) .menu {
    background: var(--d-overlay);
    color: var(--d-overlay-ink);
    border-color: var(--d-overlay-edge);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-overlay-shadow);
  }
  /* La misma red alcanza a .menu-item, que también lleva «menu» en el nombre de
     la clase: cada renglón salía con fondo blanco propio y con la sombra larga
     del desplegable entero. Tres renglones, tres sombras, dentro de un menú que
     ya tiene la suya. */
  :global([data-d='W']) .menu-item {
    background: transparent;
    border-color: transparent;
    border-radius: var(--d-r);
    box-shadow: none;
  }
  /* Y el hover heredado era --d-sunk, blanco al 34 %, invisible sobre un menú
     que ahora es blanco sólido. El teclado tiñe el renglón igual que el ratón,
     porque el foco se pasea por el menú con las flechas. */
  :global([data-d='W']) .menu-item:hover,
  :global([data-d='W']) .menu-item:focus-visible {
    background: var(--d-accent-soft);
  }

  /* ── W · PANTALLA ANGOSTA, DECLARADA ───────────────────────────────────
     Debajo de 26rem (416px de celda), el orden en que cae cada cosa:

     1. La barra pasa a UNA orden por renglón, a lo ancho, con el rótulo
        alineado a la izquierda. Una columna de comandos se barre con el pulgar;
        cuatro fichas centradas de anchos distintos, no. El menú de más acciones
        se queda en su cuadrado de 44 y no se estira, porque un botón sin rótulo
        estirado a todo lo ancho no gana nada y pierde su forma de icono.
     2. El destructivo deja de irse a la derecha: en una pila no hay derecha. Lo
        sigue separando la regla, que ya era horizontal.
     3. El grupo se despliega hacia abajo y las costuras cambian de eje. Sigue
        siendo una sola pieza, con las esquinas arriba y abajo.
     4. El dividido NO se parte. Partirlo lo convertiría en dos controles y se
        perdería lo único que dice que la flecha pertenece al botón. La mitad
        principal se estira y la flecha se queda en un cuadrado de 44.
     5. El vidrio se apaga, por el motivo que ya escribió la dirección: a esta
        altura el panel ocupa el ancho entero, no queda campo alrededor que
        desenfocar, y el efecto se paga en GPU sin verse. El filo del crítico
        engorda a 5px porque 3px al borde de la pantalla se pierden contra el
        marco del teléfono.

     Lo que NO depende del ancho: los dos pisos de la barra, que ya están
     puestos arriba, y el objetivo táctil, que depende del puntero y no del
     ancho de nada.

     LO QUE NO PASA: nada se vuelve scroll horizontal. Una botonera que hay que
     arrastrar esconde comandos, y ésta es la página de los comandos. El único
     elemento que podría sobrar del ancho de la celda es el menú, y se limita al
     100 %, porque la celda del catálogo recorta lo que se le salga. */
  @container acc-w (max-width: 26rem) {
    :global([data-d='W']) .sec {
      backdrop-filter: none; -webkit-backdrop-filter: none;
      background: color-mix(in srgb, var(--d-overlay) 92%, transparent);
    }
    :global([data-d='W']) .sec::after { display: none; }
    :global([data-d='W']) .sec[data-tone='critical'] {
      box-shadow: inset 5px 0 0 var(--d-crit), var(--d-shadow);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }

    :global([data-d='W']) .bar {
      display: grid; grid-auto-flow: row; justify-items: stretch;
      gap: var(--d-p1);
    }
    :global([data-d='W']) .bar > .d-btn {
      width: 100%; justify-content: flex-start; min-height: var(--d-touch);
    }
    /* Los de sólo icono se quedan cuadrados de 44 en vez de estirarse: sin
       rótulo, un botón a todo lo ancho no gana nada y pierde su forma. El
       cuadrado los vuelve a hacer reconocibles, y de paso les da el ancho
       táctil que a esta altura ya tienen de alto. */
    :global([data-d='W']) .d-btn.only { min-width: var(--d-touch); }
    :global([data-d='W']) .bar > .d-btn.only {
      width: var(--d-touch);
      justify-self: start; justify-content: center;
    }
    /* La regla ya es horizontal en cualquier ancho; en la rejilla se estira
       sola. Lo único que cambia es que el destructivo deja de ir a la derecha,
       porque en una pila no hay derecha. */
    :global([data-d='W']) .bar-push { margin-left: 0; }

    :global([data-d='W']) .grp { display: grid; grid-auto-flow: row; width: 100%; }
    :global([data-d='W']) .grp > .d-btn {
      width: 100%; justify-content: flex-start;
      min-height: var(--d-touch); border-radius: 0;
    }
    :global([data-d='W']) .grp > .d-btn:not(:first-child) {
      margin-top: calc(-1 * max(var(--d-bw), 1px));
    }
    :global([data-d='W']) .grp > .d-btn:first-child {
      border-start-start-radius: var(--d-r); border-start-end-radius: var(--d-r);
    }
    :global([data-d='W']) .grp > .d-btn:last-child {
      border-end-start-radius: var(--d-r); border-end-end-radius: var(--d-r);
    }

    :global([data-d='W']) .split-wrap { width: 100%; align-items: stretch; }
    :global([data-d='W']) .split { width: 100%; }
    :global([data-d='W']) .d-btn.split-main {
      flex: 1 1 auto; min-width: 0;
      justify-content: flex-start; min-height: var(--d-touch);
    }
    :global([data-d='W']) .d-btn.split-toggle {
      flex: 0 0 var(--d-touch);
      min-width: var(--d-touch); min-height: var(--d-touch);
      padding-inline: 0;
    }
    :global([data-d='W']) .menu { max-width: 100%; }
  }

  /* OBJETIVO TÁCTIL. directions.css ya sube el botón de W a 44px, pero lo hace
     por ancho de ventana (max-width: 560px), y el dedo no depende del ancho de
     la ventana: una tableta táctil de 900px se quedaba sin él. Acá se pregunta
     por el puntero, que es el eje correcto.
     Consecuencia declarada: con puntero grueso W NO tiene botón pequeño. El de
     la fila de la tabla de planes sigue siendo el más liviano de los dos, por
     tipografía y por ancho, pero su caja llega a 44 igual que las demás,
     porque 27px de alto en una fila que se toca con el pulgar no es una
     variante de tamaño sino un fallo. */
  @media (pointer: coarse) {
    :global([data-d='W']) .d-btn { min-height: var(--d-touch); }
    :global([data-d='W']) .d-btn.only,
    :global([data-d='W']) .d-btn.split-toggle { min-width: var(--d-touch); }
    /* El enlace de texto medía 170 × 20 y está solo en su renglón, así que la
       excepción de «objetivo dentro de un bloque de texto» no lo cubre: es un
       destino suelto de 20px de alto. Se le da caja de 44 sin tocar el cuerpo
       de la letra —un enlace que crece de tamaño deja de parecer un enlace—:
       el relleno agranda el área y el margen negativo devuelve el renglón a
       donde estaba, así que la fila no se mueve un pixel. */
    :global([data-d='W']) .link {
      display: inline-flex; align-items: center;
      min-height: var(--d-touch);
      padding-block: calc((var(--d-touch) - 1.5em) / 2);
      margin-block: calc((1.5em - var(--d-touch)) / 2);
    }
  }

  /* TRANSPARENCIA REDUCIDA Y CONTRASTE ALTO. directions.css los resuelve a
     nivel de token (--d-surface pasa a blanco sólido en los dos), así que lo
     único que falta acá es apagar el desenfoque del bloque, que es propio de
     esta página, y retirar el anillo interior de luz, que sobre blanco sólido
     ya no tiene nada que biselar. */
  @media (prefers-reduced-transparency: reduce) {
    :global([data-d='W']) .sec {
      backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
    }
    :global([data-d='W']) .sec::after { display: none; }
  }
  @media (prefers-contrast: more) {
    :global([data-d='W']) .sec {
      backdrop-filter: none; -webkit-backdrop-filter: none;
    }
    :global([data-d='W']) .sec::after { display: none; }
  }

  /* ======================================================================
     X · COTA — papel mate y tinta, y la jerarquía tiene que leerse en gris.

     Esta es la página donde la primera regla de la dirección se cobra: si el
     color está RESERVADO al estado, entonces la escalera de acción no puede
     apoyarse en él ni un poco. Tapando mentalmente el rojo, esto queda, de más
     masa a menos:

       primaria       bloque macizo de tinta con el texto en papel
       secundaria     papel con un canto de tinta de 1px
       fantasma       ni canto ni relleno hasta que la tocás
       destructiva    papel con el canto DOBLE, y aparte de las demás
       deshabilitada  banda neutra opaca, sin canto de contacto

     El destructivo es el que obliga a inventar algo. En escala de grises el
     canto de --d-crit (L .095) y el de --d-ink-3 (L .126) caen casi encima uno
     del otro, así que dejarlo en «tinta roja» sería dejar que el color haga
     todo el trabajo, que es exactamente lo que esta dirección no permite. Lo
     que lo separa es la REGLA DOBLE: dos filos con un pelo de papel entre
     ellos, que en un formulario impreso es lo que se le hace a la casilla que
     no se puede deshacer. Es el único control de la celda con dos rayas, y eso
     se ve sin distinguir un solo color.

     Lo que NO se hace acá, aunque diecisiete direcciones de arriba lo hagan:
     ni bandeja, ni marco continuo, ni pastilla alrededor de los botones. Un
     agrupador con relleno es un material elegido por cómo se ve. Lo que agrupa
     en Cota es el rango de la tinta, la alineación y una regla.
     ====================================================================== */
  :global([data-d='X']) .spec {
    /* El umbral se mide contra el ancho REAL de la celda y no contra el de la
       ventana: la rejilla del catálogo va de una a tres columnas, así que el
       viewport miente en los dos extremos. Medido: con la ventana en 380px
       .spec da 275px si el navegador reserva la barra de desplazamiento y 290px
       si la superpone, que es lo que hace un teléfono. Los dos números están
       muy por debajo del umbral, así que a 380px corre la rama angosta entera
       y no hay un borde donde el resultado dependa del navegador. */
    container-type: inline-size;
    container-name: acc-x;
    gap: var(--d-p3);
  }

  /* LA HOJA. Línea, canto de 4px y un pixel de sombra sin desenfoque: la misma
     receta que .d-panel en esta dirección, para que el bloque no sea una forma
     nueva que haya que aprender. La profundidad la da la línea, no la sombra. */
  :global([data-d='X']) .sec {
    background: var(--d-surface);
    border: max(var(--d-bw), 1px) solid var(--d-line);
    border-radius: var(--d-r);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='X']) .sec-cap {
    margin: 0;
    padding: var(--d-p2) var(--d-p3);
    border-bottom: max(var(--d-bw), 1px) solid var(--d-line);
  }
  :global([data-d='X']) .sec-body { padding: var(--d-p3); gap: var(--d-p3); }

  /* El estado de la hoja es el filo de 3px del canto izquierdo, que es la misma
     marca que directions.css le pone a .d-row en X: se aprende una vez y sirve
     en toda la dirección. Va como sombra interior de cero desenfoque en vez de
     un ::before porque así sigue el radio de la hoja sin recortar nada, y
     porque el ::before de .sec ya está tomado por otras direcciones.
     Se pinta UNA sola vez por celda, en la hoja del equipo vencido. */
  :global([data-d='X']) .sec[data-tone] {
    box-shadow: inset 3px 0 0 var(--tone-fg), var(--d-shadow);
  }

  /* La tipografía carga la personalidad y acá no hay fuente que elegir, así que
     sale del tratamiento: el nombre de la máquina es lo más grande de la hoja
     —es lo que se busca con el equipo enfrente— con tracking negativo, y todo
     lo que sea lectura va en figuras tabulares para que dos lecturas se
     comparen sin leerlas. */
  :global([data-d='X']) .ctx-name {
    font-size: var(--d-t-lg); letter-spacing: -.018em;
  }
  :global([data-d='X']) .ctx-code,
  :global([data-d='X']) .hint,
  :global([data-d='X']) .sub { font-variant-numeric: var(--d-num); }
  :global([data-d='X']) .ctx-name,
  :global([data-d='X']) .hint,
  :global([data-d='X']) .sub { overflow-wrap: break-word; }

  /* LA COTA. El riel se corta a 30ch: llega hasta donde el ojo abarca la marca
     del tope y la punta del relleno de una sola mirada. Estirado a los 640px de
     una celda ancha, el riel deja de ser una cota y pasa a ser una barra
     decorativa, que es justo lo que la primitiva existe para no ser.
     La lectura vuelve a nombrarse más abajo («Lectura anterior: 312 h») y ahí
     NO lleva riel: es la misma medida ya acotada en esta pantalla, y repetir la
     marca la convertiría en adorno. Lo que le toca ahí es la figura tabular. */
  :global([data-d='X']) .cota { max-width: min(100%, 30ch); }

  /* LA BARRA TIENE DOS PISOS, EN CUALQUIER ANCHO.
     La botonera de este equipo pide unos 760px y la celda del catálogo da 640
     en el mejor caso, así que envuelve siempre; y con `margin-left: auto`,
     envolver dejaba «Eliminar equipo» solo en el segundo renglón, pegado al
     canto y con aspecto de ser lo más importante de la barra por estar aparte.
     El separador ocupa su propio renglón y ordena los dos pisos: arriba las
     tres órdenes que operan la máquina, abajo lo que no la opera —el menú de
     más acciones y el destructivo—. Así el corte deja de ser un accidente del
     ancho y dice algo. Es el mismo separador de siempre, girado de eje: una
     regla trazada de margen a margen, que es lo que un formulario hace. */
  :global([data-d='X']) .bar { gap: var(--d-p2); }
  :global([data-d='X']) .bar-sep {
    flex: 1 0 100%;
    width: auto; height: 0; min-height: 0;
    margin: 0;
    border-left: 0;
    border-top: max(var(--d-bw), 1px) solid var(--d-line);
  }

  /* HALLAZGO, y es de token: --d-edge (#C4C7C5) da 1.70:1 contra el papel, muy
     por debajo del 3:1 que WCAG 1.4.11 pide para el canto de un control, y en
     esta página el canto ES lo que dice que algo se puede apretar. X necesita
     un --d-control-edge propio; mientras no exista, el canto toma --d-ink-3,
     que es el único token de la familia que llega (5.98:1) y que además le da a
     la dirección lo que le corresponde: una caja DIBUJADA con tinta, no
     insinuada con un gris de 3 %.
     El deshabilitado, más abajo, es el único que se queda con --d-edge, y ahí
     está bien: 1.4.11 exime a los controles inactivos. */
  :global([data-d='X']) .d-btn { border-color: var(--d-ink-3); }

  /* Y ACTO SEGUIDO LAS CUATRO VARIANTES, porque redefinir .d-btn en una
     dirección pesa (0,3,0) con la clase de alcance de Svelte y cada variante
     pesa (0,1,0): sin estas líneas el primario se quedaría con el canto gris
     del secundario y el destructivo perdería el suyo. Es el choque que ya se
     cobró seis páginas en este archivo. */
  :global([data-d='X']) .d-btn--primary {
    background: var(--d-accent); color: var(--d-accent-ink);
    border-color: var(--d-accent);
  }
  /* `[data-d='X'] .d-btn:hover { background: var(--d-sunk) }` pesa (0,3,0) y
     `.d-btn--primary:hover` pesa (0,2,0): HOY, al pasarle el ratón, el primario
     de Cota se vuelve papel casi blanco y conserva la tinta blanca. Texto
     blanco sobre blanco, sin un error en consola. Se repone acá, y con el gesto
     que corresponde a un bloque de tinta sobre papel: la tinta sube un escalón
     de valor. El brightness heredado no se veía sobre #16181A. */
  :global([data-d='X']) .d-btn--primary:hover {
    background: var(--d-ink-2); filter: none;
  }

  /* EL DESTRUCTIVO: tinta roja y regla doble, sin un pixel de relleno.
     La banda --d-crit-band que trae la primitiva es color puesto en un control,
     y en Cota el color es del estado. Acá el rojo está en la tinta del rótulo y
     en los dos filos; el relleno sigue siendo papel, igual que el secundario.
     La regla doble se dibuja con dos sombras interiores de cero desenfoque —un
     pelo de papel y después el segundo filo—, así que no mueve nada de sitio:
     con box-sizing en border-box el botón conserva sus 36px y su línea de base.
     Al pasar por encima las dos reglas se CIERRAN en una sola de 2px, que es un
     gesto que hace trabajo: dice «esto se compromete» y usa la transición de
     120ms que .d-btn ya tenía declarada, sin agregar moción nueva a la página. */
  :global([data-d='X']) .d-btn--danger {
    background: var(--d-surface);
    color: var(--d-crit);
    border-color: var(--d-crit);
    box-shadow:
      inset 0 0 0 max(var(--d-bw), 1px) var(--d-surface),
      inset 0 0 0 calc(max(var(--d-bw), 1px) * 2) var(--d-crit),
      var(--d-shadow);
  }
  :global([data-d='X']) .d-btn--danger:hover {
    background: var(--d-surface);
    box-shadow:
      inset 0 0 0 calc(max(var(--d-bw), 1px) * 2) var(--d-crit),
      var(--d-shadow);
  }
  /* Al presionar, la hoja pierde su pixel de sombra igual que todos los demás
     botones de la dirección: `[data-d='X'] .d-btn:active { box-shadow: none }`
     pesa (0,3,0) y la regla doble pesa (0,4,0), así que sin esta línea el
     destructivo sería el único que no se hunde. */
  :global([data-d='X']) .d-btn--danger:active {
    box-shadow: inset 0 0 0 calc(max(var(--d-bw), 1px) * 2) var(--d-crit);
  }

  :global([data-d='X']) .d-btn--ghost { border-color: transparent; }
  /* Excepción con motivo: «Más acciones» no tiene rótulo del que agarrarse. En
     una dirección donde el canto es lo que dice «esto es un control», el botón
     de sólo icono necesita el suyo desde el principio y no al pasar el ratón. */
  :global([data-d='X']) .d-btn--ghost.only { border-color: var(--d-ink-3); }

  /* El hover heredado es --d-sunk (#F4F5F4), que contra el papel blanco de la
     hoja da 1.05:1: no es un hover tenue, es ningún hover. En la página de los
     controles eso no se puede dejar. Pasa a --d-accent-soft, que sigue siendo
     acromático porque el acento de Cota es tinta. Primario y destructivo quedan
     fuera porque ya tienen el suyo, y el deshabilitado también: un control
     apagado no responde al ratón. */
  :global([data-d='X']) .d-btn:not(.d-btn--primary):not(.d-btn--danger):not([disabled]):hover {
    background: var(--d-accent-soft);
  }

  /* El deshabilitado. `.d-btn[disabled] { opacity: .45 }` deja la tinta en
     2.7:1 contra el papel, y además el hover de la dirección le repinta el
     fondo al pasar por encima, que es lo contrario de lo que un control apagado
     tiene que hacer. Acá se apaga con la banda neutra OPACA: --d-ink-3 sobre
     --d-neu-band da 5.14:1, o sea que el rótulo se puede LEER apagado, que es
     lo que hace falta para entender por qué no se puede apretar. Y lo que dice
     «no se puede» no es el color: es que perdió el canto de tinta y la sombra
     de contacto, o sea que dejó de ser una casilla dibujada. */
  :global([data-d='X']) .d-btn[disabled],
  :global([data-d='X']) .d-btn[disabled]:hover {
    opacity: 1;
    background: var(--d-neu-band);
    color: var(--d-ink-3);
    border-color: var(--d-neu-edge);
    box-shadow: none;
    transform: none;
  }
  /* Consecuencia declarada, la misma que en W: con puntero grueso
     directions.css sube TODO .d-btn de X a 44px y `.d-btn--sm` pesa menos, así
     que con el dedo no hay botón pequeño. La diferencia de la fila de planes
     sobrevive en la tipografía y en el ancho; 27px de alto en una fila que se
     toca con el pulgar no es una variante de tamaño, es un fallo. */

  /* El grupo comparte canto porque las tres acciones caen sobre la MISMA
     selección: son una decisión con tres salidas y no tres decisiones. Sólo
     desde 26rem, que es donde las tres entran en un renglón; por debajo se
     apilan y el canto compartido cambia de eje. */
  @container acc-x (min-width: 26rem) {
    :global([data-d='X']) .grp { gap: 0; }
    :global([data-d='X']) .grp > .d-btn:not(:first-child) {
      margin-left: calc(-1 * max(var(--d-bw), 1px));
      border-start-start-radius: 0; border-end-start-radius: 0;
    }
    :global([data-d='X']) .grp > .d-btn:not(:last-child) {
      border-start-end-radius: 0; border-end-end-radius: 0;
    }
  }
  /* El anillo de foco sale 2px hacia afuera. Donde los cantos se tocan —el
     grupo y el dividido— sin esto quedaría por debajo del vecino. */
  :global([data-d='X']) .d-btn:focus-visible { position: relative; z-index: 2; }

  /* El menú flota, así que va sobre papel opaco con el canto de un borde real y
     no con la línea interior de la hoja. El renglón activo se marca con el
     mismo --d-accent-soft que los botones, y el teclado lo tiñe igual que el
     ratón, porque en este menú el foco se pasea con las flechas. */
  :global([data-d='X']) .menu { border-color: var(--d-edge); }
  :global([data-d='X']) .menu-item:hover,
  :global([data-d='X']) .menu-item:focus-visible { background: var(--d-accent-soft); }
  :global([data-d='X']) .link { text-underline-offset: 3px; }

  @media (pointer: coarse) {
    :global([data-d='X']) .d-btn.split-toggle { min-width: var(--d-touch); }
    /* El enlace mide 170 × 20 y está solo en su renglón, así que no lo cubre la
       excepción de «destino dentro de un bloque de texto». Se le da caja de 44
       sin tocar el cuerpo de la letra: el relleno agranda el área y el margen
       negativo devuelve el renglón a donde estaba. */
    :global([data-d='X']) .link {
      display: inline-flex; align-items: center;
      min-height: var(--d-touch);
      padding-block: calc((var(--d-touch) - 1.5em) / 2);
      margin-block: calc((1.5em - var(--d-touch)) / 2);
    }
  }

  /* En colores forzados las sombras interiores se descartan, y con ellas la
     regla doble. El canto vuelve a 2px para que lo irreversible siga siendo el
     único control con el filo grueso; border-box lo absorbe sin mover nada. */
  @media (forced-colors: active) {
    :global([data-d='X']) .d-btn--danger { border-width: 2px; }
  }

  /* ── X · PANTALLA ANGOSTA, DECLARADA ───────────────────────────────────
     Con la ventana en 380px la celda mide 275px, así que lo que corre a esa
     altura es esta rama entera. Lo que hace, en orden:

     1. La barra pasa a UNA orden por renglón, a lo ancho y con el rótulo a la
        izquierda: una columna de comandos se barre con el pulgar, cuatro fichas
        de anchos distintos no. El menú de más acciones se queda en su cuadrado
        de 44 porque un botón sin rótulo estirado no gana nada y pierde su forma.
     2. El destructivo deja de irse a la derecha: en una pila no hay derecha. Lo
        sigue separando la regla, que ya era horizontal en todos los anchos.
     3. El grupo se apila y las costuras cambian de eje. Sigue siendo una sola
        pieza, con las esquinas arriba y abajo.
     4. El dividido NO se parte: partirlo lo volvería dos controles y se perdería
        lo único que dice que la flecha pertenece al botón. La mitad principal se
        estira y la flecha se queda en un cuadrado de 44.
     5. El filo del estado engorda de 3px a 5px: al borde de la pantalla, 3px se
        pierden contra el marco del teléfono.
     6. La cota suelta su tope de 30ch y toma el ancho entero. El riel es lo
        único que no puede encogerse por debajo de su marca, y la marca vive en
        el 66,67 % del riel, así que a 290px sigue cayendo a 193px del origen:
        se ve dónde estaba el tope y cuánto lo pasó.

     LO QUE NO PASA: nada se vuelve scroll horizontal. Una botonera que hay que
     arrastrar esconde comandos, y ésta es la página de los comandos. El menú se
     limita al 100 % porque la celda del catálogo recorta lo que se le salga.

     LO QUE NO CAMBIA, a propósito: la fila de especímenes de «La escala de
     acción» sigue envolviendo con cada botón en su ancho natural, en vez de
     estirarse como la barra. Estirar los dos tamaños al 100 % los volvería
     idénticos y esa fila existe para que se vea la diferencia de 9px. El ancho
     natural más grande de la fila es «Subir salida en PDF», 186px, que entra
     con holgura en los 245px de contenido que quedan a 380px de ventana.
     Medido en el navegador a 380px: scrollWidth = clientWidth y ningún
     descendiente de la celda pasa del canto derecho. */
  @container acc-x (max-width: 26rem) {
    :global([data-d='X']) .sec-body { padding: var(--d-p2); }
    :global([data-d='X']) .sec[data-tone] {
      box-shadow: inset 5px 0 0 var(--tone-fg), var(--d-shadow);
    }
    :global([data-d='X']) .cota { max-width: 100%; }

    :global([data-d='X']) .bar {
      display: grid; grid-auto-flow: row; justify-items: stretch;
      gap: var(--d-p1);
    }
    :global([data-d='X']) .bar > .d-btn {
      width: 100%; justify-content: flex-start; min-height: var(--d-touch);
    }
    :global([data-d='X']) .d-btn.only { min-width: var(--d-touch); }
    :global([data-d='X']) .bar > .d-btn.only {
      width: var(--d-touch);
      justify-self: start; justify-content: center;
    }
    :global([data-d='X']) .bar-push { margin-left: 0; }
    :global([data-d='X']) .bar-sep { margin-block: calc(var(--d-p1) / 2); }

    /* `gap: 0` va también acá y no sólo en la rama ancha: .d-btn-group trae
       gap: var(--d-p1) de la librería, y sin apagarlo las tres órdenes se
       apilan separadas por 7px con el canto compartido sin llegar a tocarse,
       o sea tres decisiones en vez de una con tres salidas. */
    :global([data-d='X']) .grp {
      display: grid; grid-auto-flow: row; width: 100%; gap: 0;
    }
    :global([data-d='X']) .grp > .d-btn {
      width: 100%; justify-content: flex-start;
      min-height: var(--d-touch); border-radius: 0;
    }
    :global([data-d='X']) .grp > .d-btn:not(:first-child) {
      margin-top: calc(-1 * max(var(--d-bw), 1px));
    }
    :global([data-d='X']) .grp > .d-btn:first-child {
      border-start-start-radius: var(--d-r); border-start-end-radius: var(--d-r);
    }
    :global([data-d='X']) .grp > .d-btn:last-child {
      border-end-start-radius: var(--d-r); border-end-end-radius: var(--d-r);
    }

    :global([data-d='X']) .split-wrap { width: 100%; align-items: stretch; }
    :global([data-d='X']) .split { width: 100%; }
    :global([data-d='X']) .d-btn.split-main {
      flex: 1 1 auto; min-width: 0;
      justify-content: flex-start; min-height: var(--d-touch);
    }
    :global([data-d='X']) .d-btn.split-toggle {
      flex: 0 0 var(--d-touch);
      min-width: var(--d-touch); min-height: var(--d-touch);
      padding-inline: 0;
    }
    :global([data-d='X']) .menu { max-width: 100%; }
  }

  /* AA · PRISMA VIVO. Misma ley que en el diálogo: lo que flota va sólido. Un
     menú translúcido deja que la etiqueta de abajo se cruce con la opción de
     arriba, y en una lista de acciones eso significa elegir mal. */
  :global([data-d='AA']) .menu {
    background: var(--d-overlay);
    backdrop-filter: none; -webkit-backdrop-filter: none;
    border-color: rgba(21, 15, 38, .10);
  }

  /* Al final del todo, para ganarle en orden a las variaciones por dirección. */
  @media (prefers-reduced-motion: reduce) {
    .spin{ animation: none; opacity: .6; }
    :global([data-d='M']) .d-btn--primary::before { transition: none; }
  }
</style>
