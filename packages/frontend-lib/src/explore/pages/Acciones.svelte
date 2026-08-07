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
  import { ASSETS, markOf } from '../demo.js';

  export let directions = [];

  /** El equipo sobre el que actúa la barra: vencido hace 12 días. */
  const asset = ASSETS[0];        // BAT-014 · Batidora Imer Syntesi 250
  /** El que no deja marcar hecho: nunca se le tomó lectura. */
  const noRead = ASSETS[4];       // COM-07 · Compactadora Wacker DPU-6555

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
          <h4 class="sec-cap d-cap" id="cap-bar-{d.id}">Barra del equipo</h4>
          <div class="sec-body">
            <p class="ctx">
              <span class="ctx-code d-id">{asset.code}</span>
              <span class="ctx-name">{asset.name}</span>
              <span class="d-pill" data-tone={asset.tone}>
                <svg viewBox="0 0 12 12" aria-hidden="true">{@html markOf(asset.tone)}</svg>
                {asset.state} · {asset.due}
              </span>
            </p>

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

        <!-- 2 · JERARQUÍA COMPLETA -->
        <section class="sec" class:d-rail={d.id === 'G'} aria-labelledby="cap-jer-{d.id}">
          <h4 class="sec-cap d-cap" id="cap-jer-{d.id}">Jerarquía</h4>
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
          </div>
        </section>

        <!-- 3 · DOS TAMAÑOS -->
        <section class="sec" class:d-rail={d.id === 'G'} aria-labelledby="cap-tam-{d.id}">
          <h4 class="sec-cap d-cap" id="cap-tam-{d.id}">Dos tamaños</h4>
          <div class="sec-body">
            <div class="row">
              <button type="button" class="d-btn d-btn--primary">Registrar lectura</button>
              <button type="button" class="d-btn">Posponer</button>
              <span class="sub">normal · cabecera del equipo</span>
            </div>
            <div class="row">
              <button type="button" class="d-btn d-btn--primary d-btn--sm">Registrar lectura</button>
              <button type="button" class="d-btn d-btn--sm">Posponer</button>
              <span class="sub">pequeño · dentro de una fila de la tabla de planes</span>
            </div>
          </div>
        </section>

        <!-- 4 · GRUPO DE BOTONES -->
        <section class="sec" class:d-rail={d.id === 'G'} aria-labelledby="cap-grp-{d.id}">
          <h4 class="sec-cap d-cap" id="cap-grp-{d.id}">Grupo</h4>
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

        <!-- 5 · BOTÓN DIVIDIDO -->
        <section class="sec" class:d-rail={d.id === 'G'} aria-labelledby="cap-div-{d.id}">
          <h4 class="sec-cap d-cap" id="cap-div-{d.id}">Acción dividida</h4>
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

        <!-- 6 · CARGA Y ENLACE -->
        <section class="sec" class:d-rail={d.id === 'G'} aria-labelledby="cap-car-{d.id}">
          <h4 class="sec-cap d-cap" id="cap-car-{d.id}">Carga y enlace</h4>
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
  .sec-cap { margin: 0 0 var(--d-p2); }
  .sec-body { display: grid; gap: var(--d-p2); min-width: 0; }

  .row { display: flex; align-items: center; flex-wrap: wrap; gap: var(--d-p1); min-width: 0; }
  .cell { display: inline-grid; justify-items: start; gap: calc(var(--d-p1) / 2); }
  .ctx { display: flex; align-items: baseline; flex-wrap: wrap; gap: var(--d-p1); margin: 0; min-width: 0; }
  .ctx-code { color: var(--d-ink-3); font-size: var(--d-t-xs); }
  .ctx-name { font-weight: var(--d-w-semi); font-size: var(--d-t-sm); }
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
    background: var(--d-surface);
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
     A · ELEVACIÓN — cada sección es una tarjeta que flota, y el aire (no una
     línea) es lo que separa las acciones.
     ====================================================================== */
  :global([data-d='A']) .spec { gap: var(--d-p4); }
  :global([data-d='A']) .sec {
    background: var(--d-surface);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow-lg);
    padding: var(--d-p3);
  }
  :global([data-d='A']) .sec-body { gap: var(--d-p3); }
  :global([data-d='A']) .bar { gap: var(--d-p2); }
  :global([data-d='A']) .menu { border-radius: var(--d-r-lg); }
  :global([data-d='A']) .link { text-underline-offset: 3px; }
  /* Aquí el feedback también es altura: al pasar sube, al presionar baja. */
  :global([data-d='A']) .d-btn:hover { box-shadow: var(--d-shadow-lg); }
  :global([data-d='A']) .d-btn:active { box-shadow: var(--d-shadow); transform: translateY(1px); }
  :global([data-d='A']) .d-btn--ghost:hover,
  :global([data-d='A']) .d-btn[disabled]:hover { box-shadow: none; }

  /* ======================================================================
     B · INSTRUMENTO — un solo marco continuo con marcas de esquina. Las
     secciones comparten borde y la barra es UN marco con separadores
     internos, no tres botones sueltos.
     ====================================================================== */
  :global([data-d='B']) .spec {
    gap: 0;
    position: relative;                 /* las marcas de esquina cuelgan de aquí */
    background: var(--d-surface);
    border: 1px solid var(--d-edge);
  }
  :global([data-d='B']) .spec::before,
  :global([data-d='B']) .spec::after {
    content: ''; position: absolute; width: 7px; height: 7px;
    border: 1px solid var(--d-edge); pointer-events: none;
  }
  :global([data-d='B']) .spec::before { top: 3px; left: 3px; border-right: 0; border-bottom: 0; }
  :global([data-d='B']) .spec::after { bottom: 3px; right: 3px; border-left: 0; border-top: 0; }
  :global([data-d='B']) .sec { border-bottom: 1px solid var(--d-line); }
  :global([data-d='B']) .sec:last-child { border-bottom: 0; }
  :global([data-d='B']) .sec-cap {
    margin: 0; padding: calc(var(--d-p1) / 2) var(--d-p3);
    background: var(--d-sunk);
    border-bottom: 1px solid var(--d-line);
  }
  :global([data-d='B']) .sec-body { padding: var(--d-p2) var(--d-p3) var(--d-p3); }
  :global([data-d='B']) .bar { gap: 0; border: 1px solid var(--d-edge); }
  :global([data-d='B']) .bar > .d-btn {
    border: 0; border-right: 1px solid var(--d-line); border-radius: 0; box-shadow: none;
  }
  :global([data-d='B']) .bar > .d-btn:last-child { border-right: 0; }
  :global([data-d='B']) .bar-sep { margin-inline: 0; min-height: 0; border-left-color: var(--d-edge); }
  :global([data-d='B']) .bar-push { border-left: 1px solid var(--d-edge); }
  :global([data-d='B']) .menu { border-color: var(--d-edge); padding: 0; gap: 0; }
  :global([data-d='B']) .menu-item { border-bottom: 1px solid var(--d-line); border-radius: 0; }
  :global([data-d='B']) .menu li:last-child .menu-item { border-bottom: 0; }

  /* ======================================================================
     C · MARCA — la cabecera teal identifica cada bloque, y la barra de
     acciones es una franja de marca con las acciones encima.
     ====================================================================== */
  :global([data-d='C']) .sec {
    background: var(--d-surface);
    border: 1px solid var(--d-line);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    /* Sin overflow:hidden: recortaría el menú del botón dividido. La cabecera
       redondea sus propias esquinas de arriba. */
  }
  :global([data-d='C']) .sec-cap {
    margin: 0; padding: var(--d-p1) var(--d-p3);
    background: var(--d-brand); color: var(--d-brand-ink);
    border-radius: calc(var(--d-r-lg) - 1px) calc(var(--d-r-lg) - 1px) 0 0;
    font-size: var(--d-t-xs); font-weight: var(--d-w-semi);
  }
  :global([data-d='C']) .sec-body { padding: var(--d-p3); }
  :global([data-d='C']) .bar {
    background: var(--d-brand);
    border-radius: var(--d-r);
    padding: var(--d-p1) var(--d-p2);
  }
  :global([data-d='C']) .bar > .d-btn {
    background: transparent; color: var(--d-brand-ink); box-shadow: none;
    border-color: color-mix(in srgb, var(--d-brand-ink) 42%, transparent);
  }
  :global([data-d='C']) .bar > .d-btn:not(.d-btn--primary):not(.d-btn--danger):hover {
    background: color-mix(in srgb, var(--d-brand-ink) 16%, transparent);
  }
  :global([data-d='C']) .bar > .d-btn--primary:hover { filter: brightness(.93); }
  :global([data-d='C']) .bar > .d-btn--primary {
    background: var(--d-brand-ink); color: var(--d-brand); border-color: var(--d-brand-ink);
  }
  :global([data-d='C']) .bar > .d-btn--danger {
    background: var(--d-crit-band); color: var(--d-crit); border-color: var(--d-crit-band);
  }
  :global([data-d='C']) .bar > .d-btn:focus-visible { outline-color: var(--d-brand-ink); }
  :global([data-d='C']) .bar-sep { border-left-color: color-mix(in srgb, var(--d-brand-ink) 45%, transparent); }
  :global([data-d='C']) .menu { border-top: calc(var(--d-bw) * 3) solid var(--d-brand); }
  :global([data-d='C']) .link { color: var(--d-brand); }

  /* ======================================================================
     D · PESO — bloques de 2px con sombra sólida. La barra es un solo bloque
     cuyos botones comparten borde; dentro del bloque no se mueven hacia la
     sombra, se invierten.
     ====================================================================== */
  :global([data-d='D']) .spec { gap: var(--d-p4); }
  :global([data-d='D']) .sec {
    background: var(--d-surface);
    border: var(--d-bw) solid var(--d-ink);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='D']) .sec-cap {
    margin: 0; padding: var(--d-p1) var(--d-p2);
    background: var(--d-ink); color: var(--d-ink-on);
  }
  :global([data-d='D']) .sec-body { padding: var(--d-p2) var(--d-p3) var(--d-p3); }
  :global([data-d='D']) .bar {
    gap: 0;
    background: var(--d-surface);
    border: var(--d-bw) solid var(--d-ink);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='D']) .bar > .d-btn {
    border: 0; border-right: var(--d-bw) solid var(--d-ink); box-shadow: none;
  }
  :global([data-d='D']) .bar > .d-btn:last-child { border-right: 0; }
  :global([data-d='D']) .bar > .d-btn:active {
    transform: none; box-shadow: none;
    background: var(--d-ink); color: var(--d-ink-on);
  }
  :global([data-d='D']) .bar-sep { margin-inline: 0; border-left-color: var(--d-ink); }
  :global([data-d='D']) .bar-push { border-left: var(--d-bw) solid var(--d-ink); }
  :global([data-d='D']) .menu {
    border: var(--d-bw) solid var(--d-ink); box-shadow: var(--d-shadow); padding: 0; gap: 0;
  }
  :global([data-d='D']) .menu-item {
    border-bottom: var(--d-bw) solid var(--d-ink);
    font-weight: var(--d-w-semi); text-transform: uppercase;
  }
  :global([data-d='D']) .menu li:last-child .menu-item { border-bottom: 0; }
  :global([data-d='D']) .link {
    font-weight: var(--d-w-bold); text-transform: uppercase;
    text-decoration-thickness: 3px; text-underline-offset: 3px;
  }
  :global([data-d='D']) .spin { border-width: calc(var(--d-bw) * 1.5); }

  /* ======================================================================
     E · AIRE — ni un borde en toda la celda. El separador de la barra es
     espacio, el grupo son pastillas sueltas y el dividido se parte en dos.
     ====================================================================== */
  :global([data-d='E']) .spec { gap: var(--d-p4); }
  :global([data-d='E']) .sec {
    background: var(--d-surface);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    padding: var(--d-p3) var(--d-p4) var(--d-p4);
  }
  :global([data-d='E']) .sec-cap { margin-bottom: var(--d-p3); }
  :global([data-d='E']) .sec-body { gap: var(--d-p3); }
  :global([data-d='E']) .bar { gap: var(--d-p2); }
  :global([data-d='E']) .bar-sep { border-left: 0; width: var(--d-p3); min-height: 0; margin-inline: 0; }
  :global([data-d='E']) .grp { gap: var(--d-p2); }
  :global([data-d='E']) .split { gap: var(--d-p1); }
  :global([data-d='E']) .d-btn.split-main,
  :global([data-d='E']) .d-btn.split-toggle {
    border-radius: var(--d-r-pill); margin-left: 0; border-inline-start-color: transparent;
  }
  :global([data-d='E']) .menu { border-radius: var(--d-r-lg); }
  :global([data-d='E']) .menu-item { border-radius: var(--d-r-pill); padding-inline: var(--d-p2); }
  :global([data-d='E']) .link { text-underline-offset: 6px; }

  /* ======================================================================
     F · TERMINAL — la barra es una línea de comandos: prompt, [cmd] [cmd],
     tubería como separador. Los iconos se cambian por glifos para que todo
     caiga en la rejilla del carácter.
     ====================================================================== */
  :global([data-d='F']) .spec { gap: var(--d-p2); }
  :global([data-d='F']) .sec-cap {
    display: flex; align-items: center; gap: var(--d-p1);
    margin-bottom: var(--d-p1); color: var(--d-accent);
  }
  :global([data-d='F']) .sec-cap::before { content: '──'; color: var(--d-line); }
  :global([data-d='F']) .sec-cap::after { content: ''; flex: 1; border-top: 1px solid var(--d-line); }
  :global([data-d='F']) .sec-body { gap: var(--d-p1); }
  :global([data-d='F']) .bar {
    background: var(--d-sunk);
    border: 1px solid var(--d-line);
    padding: var(--d-p1) var(--d-p2);
  }
  :global([data-d='F']) .bar::before {
    content: 'strix ~ $'; color: var(--d-accent);
    font-size: var(--d-t-xs); white-space: nowrap;
  }
  :global([data-d='F']) .bar-sep {
    border-left: 0; width: auto; min-height: 0; margin-inline: var(--d-p1);
  }
  :global([data-d='F']) .bar-sep::before { content: '|'; color: var(--d-ink-3); }
  :global([data-d='F']) .ico { display: none; }
  :global([data-d='F']) .glyph { display: inline; color: var(--d-ink-3); }
  :global([data-d='F']) .menu { border-color: var(--d-edge); padding: 0; gap: 0; }
  :global([data-d='F']) .menu-item { border-radius: 0; }
  :global([data-d='F']) .menu-item::before { content: '> '; color: var(--d-accent); white-space: pre; }
  :global([data-d='F']) .menu-item:hover { background: var(--d-accent-soft); }
  :global([data-d='F']) .link { color: var(--d-accent); text-decoration: none; }
  :global([data-d='F']) .link::before { content: '>> '; white-space: pre; }
  :global([data-d='F']) .link:hover { text-decoration: underline; }
  :global([data-d='F']) .spin {
    width: .55em; height: 1em;
    border: 0; border-radius: 0;
    background: var(--d-accent);
    animation: d-blink 900ms steps(1) infinite;
  }

  /* ======================================================================
     G · BANDA — ninguna caja. Franjas a sangre separadas por un pelo de
     línea y un cambio de tono, raíl de etiquetas a la izquierda (.d-rail) y
     el estado como filo de 3px en el canto izquierdo.
     ====================================================================== */
  :global([data-d='G']) .spec { gap: 0; }
  :global([data-d='G']) .sec {
    display: grid;
    grid-template-columns: var(--d-rail) minmax(0, 1fr);
    gap: 0 var(--d-p3);
    padding: var(--d-p2) var(--d-p3);
    border-top: 1px solid var(--d-line);
  }
  :global([data-d='G']) .sec:last-child { border-bottom: 1px solid var(--d-line); }
  :global([data-d='G']) .sec:nth-child(even) { background: var(--d-sunk); }
  :global([data-d='G']) .sec[data-tone] { padding-left: calc(var(--d-p3) + 3px); }
  :global([data-d='G']) .sec[data-tone]::before {
    content: ''; position: absolute; inset: 0 auto 0 0; width: 3px; background: var(--tone-fg);
  }
  :global([data-d='G']) .sec-cap { margin: 0; text-align: right; }
  :global([data-d='G']) .bar { gap: var(--d-p3); }
  :global([data-d='G']) .bar-sep { margin-inline: 0; }
  :global([data-d='G']) .grp {
    background: var(--d-accent-soft); padding: var(--d-p1) var(--d-p2); gap: var(--d-p3);
  }
  :global([data-d='G']) .menu {
    border: 0; border-top: calc(var(--d-bw) * 2) solid var(--d-ink); border-radius: 0; padding: 0; gap: 0;
  }
  :global([data-d='G']) .menu-item { border-radius: 0; border-bottom: 1px solid var(--d-line); }
  :global([data-d='G']) .link { text-decoration-thickness: 2px; text-underline-offset: 4px; }
  @media (max-width: 720px) {
    /* Un raíl de 148px en un teléfono no deja nada para el contenido. */
    :global([data-d='G']) .sec { grid-template-columns: 1fr; }
    :global([data-d='G']) .sec-cap { text-align: left; margin-bottom: var(--d-p1); }
  }

  /* ======================================================================
     H · FICHA — cada sección es una ficha con la pestaña saliendo arriba (la
     pestaña ES la cabecera), regla doble bajo ella y canto apilado abajo.
     ====================================================================== */
  :global([data-d='H']) .spec { --tab: 25px; gap: var(--d-p4); }
  :global([data-d='H']) .sec {
    margin-top: var(--tab);
    background: var(--d-surface);
    border: 1px solid var(--d-edge);
    border-radius: var(--d-r);
    box-shadow: var(--d-shadow);
    padding: var(--d-p3);
  }
  :global([data-d='H']) .sec-cap {
    position: absolute; top: calc(1px - var(--tab)); left: -1px; margin: 0;
    padding: calc(var(--d-p1) / 2) var(--d-p3);
    max-width: calc(100% + 2px);
    background: var(--d-sunk);
    border: 1px solid var(--d-edge); border-bottom: 0;
    border-radius: var(--d-r-lg) var(--d-r-lg) 0 0;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  :global([data-d='H']) .sec-body {
    padding-top: var(--d-p2);
    border-top: 1px solid var(--d-line);
    box-shadow: inset 0 2px 0 -1px var(--d-surface), inset 0 3px 0 -1px var(--d-line);
  }
  :global([data-d='H']) .bar {
    background: var(--d-sunk);
    border: 1px solid var(--d-line);
    padding: var(--d-p1);
  }
  :global([data-d='H']) .menu { box-shadow: var(--d-shadow-lg); }
  :global([data-d='H']) .link { color: var(--d-accent); text-underline-offset: 3px; }
  /* La regla doble vuelve como separador de la barra, y la nota al pie de la
     ficha se lee como anotación a mano. */
  :global([data-d='H']) .bar-sep { border-left-style: double; border-left-width: calc(var(--d-bw) * 3); }
  :global([data-d='H']) .hint { font-style: italic; }

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
  /* La botonera: UNA losa de vidrio segmentada. Los tabiques son luz
     (--d-line es blanco al 68 %), no líneas de tinta. */
  :global([data-d='I']) .bar {
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
  :global([data-d='I']) .bar-sep {
    margin-inline: 0; min-height: 0; align-self: stretch;
    border-left-color: var(--d-line);
  }
  /* El grupo es la misma losa en pastilla: segmentada, no tres botones sueltos. */
  :global([data-d='I']) .grp {
    gap: 0;
    background: var(--d-sunk);
    border: max(var(--d-bw), 1px) solid var(--d-line);
    border-radius: var(--d-r-pill);
    box-shadow: var(--d-shadow);
    padding: var(--d-p1);
  }
  :global([data-d='I']) .grp > .d-btn { border-radius: var(--d-r-pill); }
  :global([data-d='I']) .split { border-radius: var(--d-r-lg); box-shadow: var(--d-shadow); }
  :global([data-d='I']) .d-btn.split-toggle { border-inline-start-color: var(--d-line); }
  /* HALLAZGO: I no tiene superficie opaca. El menú flota SOBRE el vidrio de la
     sección; darle su propio desenfoque sería vidrio sobre vidrio. Se anida con
     transparencia —la misma --d-surface, sin desenfoque nuevo— y lo que lo
     despega es la sombra larga. Un --d-surface-solid haría esto sin trampa. */
  :global([data-d='I']) .menu {
    background: var(--d-surface);
    backdrop-filter: none; -webkit-backdrop-filter: none;
    border-color: var(--d-line);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow-lg);
  }
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
  :global([data-d='J']) .spec { gap: var(--d-p4); }
  :global([data-d='J']) .sec {
    isolation: isolate;
    background: var(--d-surface-fill);
    border: max(var(--d-bw), 1px) solid var(--d-line);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow-lg);
    padding: var(--d-p3);
  }
  :global([data-d='J']) .sec::after {
    content: ''; position: absolute; inset: 0 0 auto 0; height: 38%;
    border-radius: var(--d-r-lg) var(--d-r-lg) 40% 40% / var(--d-r-lg) var(--d-r-lg) 100% 100%;
    background: linear-gradient(180deg, color-mix(in srgb, var(--d-surface) 62%, transparent), transparent);
    pointer-events: none;
    z-index: 0;
  }
  :global([data-d='J']) .sec-cap,
  :global([data-d='J']) .sec-body { position: relative; z-index: 1; }
  :global([data-d='J']) .sec-body { gap: var(--d-p3); }
  /* Aislar la plancha la convierte en contexto de apilado, y entonces el orden
     entre secciones deja de ser automático: sin esta escalera el menú del
     botón dividido —que cuelga hacia abajo— quedaría debajo de la plancha
     siguiente, que es opaca. La escalera va al revés del DOM. */
  :global([data-d='J']) .sec:nth-child(1) { z-index: 6; }
  :global([data-d='J']) .sec:nth-child(2) { z-index: 5; }
  :global([data-d='J']) .sec:nth-child(3) { z-index: 4; }
  :global([data-d='J']) .sec:nth-child(4) { z-index: 3; }
  :global([data-d='J']) .sec:nth-child(5) { z-index: 2; }
  :global([data-d='J']) .sec:nth-child(6) { z-index: 1; }
  /* La bandeja: un rebaje lacado, con el degradado invertido y sombra interior. */
  :global([data-d='J']) .bar {
    gap: var(--d-p2);
    background: var(--d-sunk-fill);
    border-radius: var(--d-r-lg);
    box-shadow: inset 0 2px 5px color-mix(in srgb, var(--d-ink) 16%, transparent);
    padding: var(--d-p1) var(--d-p2);
  }
  :global([data-d='J']) .bar-sep {
    border-left: 0; width: max(var(--d-bw), 1px); min-height: 0;
    align-self: stretch; margin-inline: var(--d-p1);
    background: linear-gradient(180deg, transparent,
                color-mix(in srgb, var(--d-ink) 26%, transparent), transparent);
  }
  /* El grupo es una sola plancha partida en gajos: comparten canto y cada gajo
     conserva su propio realce blanco arriba. */
  :global([data-d='J']) .grp { gap: 0; }
  :global([data-d='J']) .grp > .d-btn { border-radius: 0; }
  :global([data-d='J']) .grp > .d-btn:first-child {
    border-start-start-radius: var(--d-r); border-end-start-radius: var(--d-r);
  }
  :global([data-d='J']) .grp > .d-btn:last-child {
    border-start-end-radius: var(--d-r); border-end-end-radius: var(--d-r);
  }
  :global([data-d='J']) .grp > .d-btn + .d-btn { margin-left: calc(-1 * max(var(--d-bw), 1px)); }
  :global([data-d='J']) .menu {
    background: var(--d-surface-fill);
    border-color: var(--d-edge);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow-lg);
  }
  :global([data-d='J']) .menu-item:hover { background: var(--d-sunk-fill); }
  :global([data-d='J']) .link { color: var(--d-accent); text-underline-offset: 3px; }

  /* ======================================================================
     K · HALO — cero bordes, cero cajas.
     Una sección no es un recuadro: es una zona que irradia y se apaga sin
     filo, así que su «fondo» es un radial que se desvanece. Y el grupo son
     TRES LUCES SUELTAS, no una botonera: unirlas pediría un canto compartido
     y en esta dirección no existe el canto. Cada luz lleva el tono de lo que
     hace —hecho, pospuesto, reasignado— y el rótulo lo dice igual, así que el
     color nunca es la única señal.
     ====================================================================== */
  :global([data-d='K']) .spec { gap: var(--d-p4); }
  :global([data-d='K']) .sec {
    background: radial-gradient(120% 100% at 50% 0%, var(--d-surface) 0%, transparent 78%);
    border-radius: var(--d-r-lg);
    padding: var(--d-p3) var(--d-p3) var(--d-p4);
  }
  /* El estado es el color del resplandor, no un relleno. */
  :global([data-d='K']) .sec[data-tone] {
    background:
      radial-gradient(120% 100% at 50% 0%, var(--tone-band) 0%, transparent 72%),
      radial-gradient(120% 100% at 50% 0%, var(--d-surface) 0%, transparent 80%);
  }
  :global([data-d='K']) .sec-cap { color: var(--d-accent); }
  :global([data-d='K']) .sec[data-tone] .sec-cap { color: var(--tone-fg); }
  :global([data-d='K']) .sec-body { gap: var(--d-p3); }
  :global([data-d='K']) .bar { gap: var(--d-p3); }
  /* El separador tampoco puede ser una línea: es un punto que irradia. */
  :global([data-d='K']) .bar-sep {
    border-left: 0; margin-inline: var(--d-p2);
    width: calc(var(--d-p1) / 2); height: calc(var(--d-p1) / 2); min-height: 0;
    align-self: center;
    border-radius: var(--d-r-pill);
    background: var(--d-ink-3);
    box-shadow: 0 0 var(--d-p2) var(--d-ink-3);
  }
  :global([data-d='K']) .grp { gap: var(--d-p3); }
  :global([data-d='K']) .grp > .d-btn { background: transparent; }
  :global([data-d='K']) .grp > .d-btn:nth-child(1) {
    color: var(--d-pos);
    box-shadow: 0 0 0 1px var(--d-pos-edge), 0 var(--d-p1) var(--d-p4) calc(-1 * var(--d-p2)) var(--d-pos);
  }
  :global([data-d='K']) .grp > .d-btn:nth-child(2) {
    color: var(--d-att);
    box-shadow: 0 0 0 1px var(--d-att-edge), 0 var(--d-p1) var(--d-p4) calc(-1 * var(--d-p2)) var(--d-att);
  }
  :global([data-d='K']) .grp > .d-btn:nth-child(3) {
    color: var(--d-info);
    box-shadow: 0 0 0 1px var(--d-info-edge), 0 var(--d-p1) var(--d-p4) calc(-1 * var(--d-p2)) var(--d-info);
  }
  /* La costura del dividido no puede ser un borde: es una rendija de negro. */
  :global([data-d='K']) .split { gap: 2px; }
  :global([data-d='K']) .d-btn.split-toggle { margin-left: 0; border-inline-start-color: transparent; }
  :global([data-d='K']) .menu {
    border: 0; background: var(--d-surface);
    border-radius: var(--d-r-lg); box-shadow: var(--d-shadow-lg);
  }
  /* El hover tampoco rellena: enciende. */
  :global([data-d='K']) .menu-item:hover {
    background: transparent; color: var(--d-accent);
    box-shadow: 0 0 0 1px var(--d-accent-edge), 0 var(--d-p1) var(--d-p4) calc(-1 * var(--d-p2)) var(--d-accent);
  }
  :global([data-d='K']) .link {
    color: var(--d-accent);
    text-decoration-color: var(--d-accent-edge);
    text-shadow: 0 0 var(--d-p4) var(--d-accent-edge);
  }
  :global([data-d='K']) .spin {
    border-color: var(--d-accent-edge); border-top-color: transparent;
    filter: drop-shadow(0 0 var(--d-p1) var(--d-accent));
  }

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
  :global([data-d='L']) .spec { gap: var(--d-p4); }
  :global([data-d='L']) .sec {
    background: var(--d-surface);
    border: 0;
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    padding: var(--d-p3);
  }
  :global([data-d='L']) .sec:nth-child(3n+2) { border-radius: var(--d-r-lg) / var(--d-r); }
  :global([data-d='L']) .sec:nth-child(3n) { border-radius: var(--d-r) / var(--d-r-lg); }
  :global([data-d='L']) .sec-body { gap: var(--d-p3); }
  /* Los guijarros no se alinean en un estante: se posan con aire entre ellos. */
  :global([data-d='L']) .bar { gap: var(--d-p2); }
  :global([data-d='L']) .d-btn:nth-of-type(3n) { border-radius: var(--d-r) / var(--d-r-lg); }
  :global([data-d='L']) .bar-sep {
    border-left: 0; margin-inline: var(--d-p1);
    width: calc(var(--d-p1) / 2); height: calc(var(--d-p1) / 2); min-height: 0;
    align-self: center;
    border-radius: var(--d-r-pill);
    background: color-mix(in srgb, var(--d-neu) 45%, transparent);
  }
  :global([data-d='L']) .grp { gap: var(--d-p1); }
  :global([data-d='L']) .grp > .d-btn:nth-child(1) { border-radius: var(--d-r-lg); }
  :global([data-d='L']) .grp > .d-btn:nth-child(2) { border-radius: var(--d-r-lg) / var(--d-r); }
  :global([data-d='L']) .grp > .d-btn:nth-child(3) { border-radius: var(--d-r) / var(--d-r-lg); }
  /* El dividido es UNA piedra con una grieta, no dos piedras. */
  :global([data-d='L']) .split { gap: 0; }
  :global([data-d='L']) .d-btn.split-main {
    border-radius: var(--d-r-lg);
    border-start-end-radius: 0; border-end-end-radius: 0;
  }
  :global([data-d='L']) .d-btn.split-toggle {
    border-radius: var(--d-r-lg);
    border-start-start-radius: 0; border-end-start-radius: 0;
    margin-left: 1px; border-inline-start-color: transparent;
  }
  :global([data-d='L']) .menu {
    border: 0; border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow-lg); padding: var(--d-p1);
  }
  :global([data-d='L']) .menu-item { border-radius: var(--d-r); }
  :global([data-d='L']) .menu li:nth-child(2n) .menu-item { border-radius: var(--d-r) / var(--d-r-lg); }
  :global([data-d='L']) .link { text-underline-offset: 4px; }

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
    background:
      radial-gradient(58% 68% at 16% 12%, var(--tone-band, var(--d-neu-band)) 0%, transparent 70%),
      radial-gradient(50% 56% at 86% 88%, var(--tone-band, var(--d-neu-band)) 0%, transparent 68%);
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
  /* El grupo no se encierra: se posa sobre su propia mancha. */
  :global([data-d='M']) .grp { isolation: isolate; gap: var(--d-p2); position: relative; }
  :global([data-d='M']) .grp::before {
    content: ''; position: absolute;
    inset: calc(-1 * var(--d-p2)) calc(-1 * var(--d-p3));
    background: radial-gradient(60% 100% at 50% 50%, var(--d-accent-soft) 0%, transparent 72%);
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
  :global([data-d='M']) .link { text-decoration-color: var(--d-edge); text-underline-offset: 4px; }
  /* Mismo choque de peso que en Cristal: `[data-d='M'] .d-btn { background:
     var(--d-sunk) }` (0,2,0) tapa a `.d-btn--primary` (0,1,0), y el primario de
     Bruma queda con tinta casi blanca sobre un lavado casi blanco. Aquí el
     relleno del primario es una mancha, no una placa: es lo único de la
     dirección que tiene derecho a ser sólido, porque es lo único que se pulsa. */
  :global([data-d='M']) .d-btn--primary {
    background: var(--d-accent); color: var(--d-accent-ink);
  }
  :global([data-d='M']) .d-btn--danger { background: var(--d-crit-band); color: var(--d-crit); }

  /* ======================================================================
     N · CINTA — carriles de puntas redondas que se montan uno sobre otro.
     Hay orden de apilado explícito y sombra de contacto: cada carril pisa al
     de abajo por 9px. El orden va al REVÉS del DOM a propósito — si el carril
     siguiente pisara al anterior, taparía el menú desplegado del botón
     dividido, que cuelga hacia abajo.
     La botonera es el carril partido: los botones se solapan y forman una
     cinta continua que se CORTA en el separador y arranca de nuevo.
     ====================================================================== */
  :global([data-d='N']) .spec { gap: var(--d-p2); }
  :global([data-d='N']) .sec {
    background: var(--d-surface-fill);
    border: max(var(--d-bw), 1px) solid var(--d-line);
    /* Puntas redondas de verdad: 999px en el radio horizontal contra el
       vertical de --d-r-lg. Da la curva ancha y baja de un cabo de cinta, no
       la esquina suavizada de una tarjeta. */
    border-radius: var(--d-r-pill) / var(--d-r-lg);
    box-shadow: var(--d-shadow);
    padding: var(--d-p2) var(--d-p3) var(--d-p3);
  }
  :global([data-d='N']) .sec + .sec { margin-top: calc(-1 * var(--d-p1)); }
  :global([data-d='N']) .sec:nth-child(1) { z-index: 6; }
  :global([data-d='N']) .sec:nth-child(2) { z-index: 5; }
  :global([data-d='N']) .sec:nth-child(3) { z-index: 4; }
  :global([data-d='N']) .sec:nth-child(4) { z-index: 3; }
  :global([data-d='N']) .sec:nth-child(5) { z-index: 2; }
  :global([data-d='N']) .sec:nth-child(6) { z-index: 1; }
  /* El rótulo es la etiqueta cosida a la punta del carril. */
  :global([data-d='N']) .sec-cap {
    display: inline-block; margin: 0 0 var(--d-p2);
    padding: calc(var(--d-p1) / 2) var(--d-p3);
    background: var(--d-accent-fill); color: var(--d-accent-ink);
    border-radius: var(--d-r-pill);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='N']) .bar { gap: 0; }
  :global([data-d='N']) .bar > .d-btn { position: relative; }
  :global([data-d='N']) .bar > .d-btn + .d-btn { margin-left: calc(-1 * var(--d-p2)); }
  :global([data-d='N']) .bar > .d-btn:nth-child(1) { z-index: 5; }
  :global([data-d='N']) .bar > .d-btn:nth-child(2) { z-index: 4; }
  :global([data-d='N']) .bar > .d-btn:nth-child(3) { z-index: 3; }
  :global([data-d='N']) .bar > .d-btn:hover,
  :global([data-d='N']) .bar > .d-btn:focus-visible { z-index: 7; }
  /* El destructivo no se engancha al carril: se queda solo, al otro extremo.
     Hace falta decirlo con la misma especificidad que el solape, o el margen
     negativo se lo lleva puesto. */
  :global([data-d='N']) .bar > .d-btn.bar-push { margin-left: auto; }
  /* El corte del carril: un cabo de cinta, no una línea. */
  :global([data-d='N']) .bar-sep {
    border-left: 0; margin-inline: var(--d-p2);
    width: var(--d-p2); height: max(var(--d-bw), 2px); min-height: 0;
    align-self: center;
    border-radius: var(--d-r-pill);
    background: var(--d-edge);
  }
  /* El grupo es un carril entero, hundido, con los gajos adentro. */
  :global([data-d='N']) .grp {
    gap: 0;
    background: var(--d-sunk-fill);
    border-radius: var(--d-r-pill);
    box-shadow: inset 0 2px 4px color-mix(in srgb, var(--d-ink) 14%, transparent);
    padding: calc(var(--d-p1) / 2);
  }
  :global([data-d='N']) .grp > .d-btn {
    background: transparent; border-color: transparent; box-shadow: none;
  }
  :global([data-d='N']) .grp > .d-btn:hover { background: var(--d-surface-fill); box-shadow: var(--d-shadow); }
  :global([data-d='N']) .d-btn.split-main { position: relative; z-index: 2; border-radius: var(--d-r-pill); }
  :global([data-d='N']) .d-btn.split-toggle {
    position: relative; z-index: 1;
    border-radius: var(--d-r-pill);
    margin-left: calc(-1 * var(--d-p3));
    padding-left: calc(var(--d-p3) + var(--d-p1));
    border-inline-start-color: transparent;
  }
  :global([data-d='N']) .menu {
    background: var(--d-surface-fill);
    border-color: var(--d-line);
    border-radius: var(--d-r-lg);
  }
  :global([data-d='N']) .menu-item { border-radius: var(--d-r-pill); }
  :global([data-d='N']) .menu-item:hover { background: var(--d-sunk-fill); box-shadow: var(--d-shadow); }
  :global([data-d='N']) .link { text-decoration-color: var(--d-accent); text-underline-offset: 4px; }
  /* El relleno de carril de N (línea 906 de directions.css) también le gana en
     peso a .d-btn--danger y le come la banda. Se devuelve como lo que es en
     esta dirección: un degradado a lo largo del carril, igual que .d-row[data-tone]. */
  :global([data-d='N']) .d-btn--danger {
    background: linear-gradient(100deg, var(--d-crit-band) 0%, var(--d-surface) 76%);
  }

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
  :global([data-d='O']) .sec-cap {
    margin: 0 calc(-1 * var(--d-p3)) var(--d-p3);
    padding: var(--d-p2) var(--d-p3);
    background: var(--d-accent-soft);
    color: var(--d-brand-ink);
    border-bottom: max(var(--d-bw), 1px) solid var(--d-accent-edge);
    border-radius: var(--d-r-lg) var(--d-r-lg) 0 0;
  }
  :global([data-d='O']) .sec-body { gap: var(--d-p3); }
  :global([data-d='O']) .bar,
  :global([data-d='O']) .grp {
    gap: 0;
    background: var(--d-accent-soft);
    border: max(var(--d-bw), 1px) solid var(--d-line);
    border-radius: var(--d-r-pill);
    box-shadow: var(--d-shadow);
    padding: calc(var(--d-p1) / 2);
  }
  :global([data-d='O']) .bar > .d-btn,
  :global([data-d='O']) .grp > .d-btn {
    backdrop-filter: none; -webkit-backdrop-filter: none;
    border: 0; border-radius: var(--d-r-pill); box-shadow: none;
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
  :global([data-d='O']) .bar-sep {
    margin-inline: 0; min-height: 0; align-self: stretch;
    border-left-color: var(--d-accent-edge);
  }
  :global([data-d='O']) .split {
    border-radius: var(--d-r-pill);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='O']) .d-btn.split-main {
    border-start-start-radius: var(--d-r-pill); border-end-start-radius: var(--d-r-pill);
  }
  :global([data-d='O']) .d-btn.split-toggle {
    border-start-end-radius: var(--d-r-pill); border-end-end-radius: var(--d-r-pill);
  }
  /* Igual que en I: el menú anida por transparencia, sin desenfoque nuevo. */
  :global([data-d='O']) .menu {
    background: var(--d-surface);
    backdrop-filter: none; -webkit-backdrop-filter: none;
    border-color: var(--d-line);
    border-radius: var(--d-r-lg);
    border-top: calc(max(var(--d-bw), 1px) * 2) solid var(--d-accent-edge);
    box-shadow: var(--d-shadow-lg);
  }
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
  :global([data-d='P']) .spec {
    --spine: var(--d-p1);
    container-type: inline-size;
    container-name: acc;
    position: relative;
    gap: 0;
    padding-left: var(--spine);
  }
  :global([data-d='P']) .spec::before {
    content: ''; position: absolute; inset: 0 auto 0 0;
    width: var(--spine); background: var(--d-brand);
  }
  :global([data-d='P']) .sec {
    padding: var(--d-p2) var(--d-p3);
    border-top: max(var(--d-bw), 1px) solid var(--d-line);
  }
  :global([data-d='P']) .sec:first-child { border-top: 0; }
  :global([data-d='P']) .sec[data-tone]::before {
    content: ''; position: absolute;
    inset: var(--d-p2) auto var(--d-p2) calc(-1 * var(--spine));
    width: var(--spine); background: var(--tone-fg);
  }
  :global([data-d='P']) .sec-cap { margin: 0 0 var(--d-p1); color: var(--d-brand); }
  @container acc (min-width: 560px) {
    :global([data-d='P']) .sec {
      display: grid;
      grid-template-columns: var(--d-rail) minmax(0, 1fr);
      gap: 0 var(--d-p3);
    }
    :global([data-d='P']) .sec-cap {
      margin: 0; align-self: stretch;
      text-align: right; padding-right: var(--d-p3);
      border-right: max(var(--d-bw), 1px) solid var(--d-accent-soft);
    }
  }
  :global([data-d='P']) .bar { gap: var(--d-p3); }
  :global([data-d='P']) .bar-sep {
    margin-inline: 0; align-self: stretch;
    border-left-color: color-mix(in srgb, var(--d-brand) 34%, transparent);
  }
  /* El grupo no son tres subrayados: es UN subrayado de marca continuo del que
     cuelgan las tres acciones, como cuelgan las franjas de la espina. */
  :global([data-d='P']) .grp {
    gap: var(--d-p3);
    border-bottom: calc(max(var(--d-bw), 1px) * 2) solid var(--d-brand);
  }
  :global([data-d='P']) .grp > .d-btn { border-bottom: 0; }
  :global([data-d='P']) .menu {
    border: 0;
    border-left: calc(max(var(--d-bw), 1px) * 4) solid var(--d-brand);
    border-radius: 0; padding: 0; gap: 0;
    box-shadow: var(--d-shadow-lg);
  }
  :global([data-d='P']) .menu-item {
    border-radius: 0;
    border-bottom: max(var(--d-bw), 1px) solid var(--d-line);
  }
  :global([data-d='P']) .menu li:last-child .menu-item { border-bottom: 0; }
  :global([data-d='P']) .menu-item:hover { background: var(--d-accent-soft); color: var(--d-brand); }
  :global([data-d='P']) .link {
    color: var(--d-brand);
    text-decoration-thickness: 2px; text-underline-offset: 4px;
  }

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
  :global([data-d='Q']) .spec { gap: var(--d-p4); }
  :global([data-d='Q']) .sec {
    background: var(--d-surface-fill);
    border: var(--d-bw) solid var(--d-ink);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='Q']) .sec-cap {
    margin: 0; padding: var(--d-p1) var(--d-p3);
    background: var(--d-accent-fill); color: var(--d-accent-ink);
    border-bottom: var(--d-bw) solid var(--d-ink);
    border-radius: calc(var(--d-r-lg) - var(--d-bw)) calc(var(--d-r-lg) - var(--d-bw)) 0 0;
    box-shadow: inset 0 max(var(--d-bw), 1px) 0 color-mix(in srgb, var(--d-accent-ink) 52%, transparent);
  }
  :global([data-d='Q']) .sec-body { padding: var(--d-p3); gap: var(--d-p3); }
  :global([data-d='Q']) .bar,
  :global([data-d='Q']) .grp {
    gap: 0; overflow: hidden;
    background: var(--d-sunk-fill);
    border: var(--d-bw) solid var(--d-ink);
    border-radius: var(--d-r);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='Q']) .bar > .d-btn,
  :global([data-d='Q']) .grp > .d-btn {
    border: 0; border-right: var(--d-bw) solid var(--d-ink);
    border-radius: 0;
    box-shadow: inset 0 max(var(--d-bw), 1px) 0 color-mix(in srgb, var(--d-surface) 90%, transparent);
  }
  :global([data-d='Q']) .bar > .d-btn:last-child,
  :global([data-d='Q']) .grp > .d-btn:last-child { border-right: 0; }
  :global([data-d='Q']) .bar > .d-btn:active,
  :global([data-d='Q']) .grp > .d-btn:active {
    transform: none;
    box-shadow: inset 0 3px 6px color-mix(in srgb, var(--d-ink) 34%, transparent);
  }
  :global([data-d='Q']) .bar-sep { margin-inline: 0; min-height: 0; border-left-color: var(--d-ink); }
  :global([data-d='Q']) .bar-push { border-left: var(--d-bw) solid var(--d-ink); }
  :global([data-d='Q']) .d-btn.split-toggle { border-inline-start-color: var(--d-ink); }
  :global([data-d='Q']) .menu {
    overflow: hidden; padding: 0; gap: 0;
    background: var(--d-surface-fill);
    border: var(--d-bw) solid var(--d-ink);
    border-radius: var(--d-r);
    box-shadow: var(--d-shadow-lg);
  }
  :global([data-d='Q']) .menu-item {
    border-radius: 0;
    border-bottom: max(var(--d-bw), 1px) solid var(--d-ink);
    font-weight: var(--d-w-semi);
  }
  :global([data-d='Q']) .menu li:last-child .menu-item { border-bottom: 0; }
  :global([data-d='Q']) .menu-item:hover { background: var(--d-accent-soft); }
  :global([data-d='Q']) .link {
    color: var(--d-accent); font-weight: var(--d-w-bold);
    text-decoration-thickness: 3px; text-underline-offset: 3px;
  }
  /* Igual que en Cristal y Bruma, el relleno de la dirección le gana al de la
     variante. Aquí no basta con devolver la banda plana: en Charol ninguna
     superficie es color plano, así que vuelve como plancha lacada. */
  :global([data-d='Q']) .d-btn--danger {
    background: linear-gradient(180deg, var(--d-crit-band) 0%,
                color-mix(in srgb, var(--d-crit-band) 58%, var(--d-crit)) 100%);
    color: var(--d-ink);
  }

  /* ======================================================================
     R · VITRINA — densidad de terminal en vidrio oscuro.
     Es la más densa de las diecinueve: fila de 26px, monoespaciada, y todo
     comando entre CORCHETES, que es lo que hace que la fila se lea sin aire.
     Se separa de F por el material: F es relleno opaco y glifos de texto;
     R conserva los iconos y las superficies son vidrio sobre el campo con luz
     —y por eso, como en I y O, lo de adentro de un panel no vuelve a
     desenfocar.
     ====================================================================== */
  :global([data-d='R']) .spec { gap: var(--d-p2); }
  :global([data-d='R']) .sec {
    background: var(--d-surface);
    backdrop-filter: blur(16px) saturate(1.3);
    -webkit-backdrop-filter: blur(16px) saturate(1.3);
    border: max(var(--d-bw), 1px) solid var(--d-line);
    border-radius: var(--d-r);
    box-shadow: var(--d-shadow);
    padding: 0 var(--d-p2) var(--d-p2);
  }
  :global([data-d='R']) .sec-cap {
    display: flex; align-items: center; gap: var(--d-p1);
    margin: 0 calc(-1 * var(--d-p2)) var(--d-p2);
    padding-inline: var(--d-p2);
    min-height: var(--d-row-h);
    background: var(--d-sunk);
    border-bottom: max(var(--d-bw), 1px) solid var(--d-line);
    color: var(--d-accent);
  }
  /* El cursor de la consola, no la regla de guiones de F. */
  :global([data-d='R']) .sec-cap::before {
    content: ''; width: calc(var(--d-p1) / 2); height: 1em;
    background: var(--d-accent);
  }
  :global([data-d='R']) .sec-body { gap: var(--d-p1); }
  :global([data-d='R']) .row { gap: var(--d-p1); }
  :global([data-d='R']) .hint, :global([data-d='R']) .sub { font-size: var(--d-t-2xs); }
  :global([data-d='R']) .d-btn { gap: calc(var(--d-p1) / 2); }
  :global([data-d='R']) .d-btn::before { content: '['; color: var(--d-ink-3); }
  :global([data-d='R']) .d-btn::after { content: ']'; color: var(--d-ink-3); }
  :global([data-d='R']) .d-btn--primary::before,
  :global([data-d='R']) .d-btn--primary::after {
    color: color-mix(in srgb, var(--d-accent-ink) 62%, transparent);
  }
  :global([data-d='R']) .bar {
    gap: calc(var(--d-p1) / 2);
    background: var(--d-sunk);
    border: max(var(--d-bw), 1px) solid var(--d-line);
    border-radius: var(--d-r);
    padding: calc(var(--d-p1) / 2) var(--d-p1);
  }
  :global([data-d='R']) .bar > .d-btn {
    border-color: transparent; box-shadow: none;
    backdrop-filter: none; -webkit-backdrop-filter: none;
  }
  :global([data-d='R']) .bar > .d-btn:not(.d-btn--primary):not(.d-btn--danger) { background: transparent; }
  :global([data-d='R']) .bar > .d-btn:not(.d-btn--primary):not(.d-btn--danger):hover { background: var(--d-surface); }
  :global([data-d='R']) .bar-sep {
    width: 0; min-height: 0; align-self: stretch;
    margin-inline: calc(var(--d-p1) / 2);
    border-left-color: var(--d-edge);
  }
  /* Corchetes pegados: [Marcar hecho][Posponer][Reasignar]. */
  :global([data-d='R']) .grp { gap: 0; }
  :global([data-d='R']) .grp > .d-btn {
    background: transparent; border-color: transparent; box-shadow: none;
    backdrop-filter: none; -webkit-backdrop-filter: none;
  }
  :global([data-d='R']) .grp > .d-btn:hover { background: var(--d-surface); }
  :global([data-d='R']) .d-btn.split-main { border-radius: var(--d-r); }
  :global([data-d='R']) .d-btn.split-toggle {
    margin-left: 0; border-radius: var(--d-r); border-inline-start-color: transparent;
  }
  :global([data-d='R']) .menu {
    counter-reset: r-item;
    padding: 0; gap: 0;
    background: var(--d-surface);
    backdrop-filter: none; -webkit-backdrop-filter: none;
    border-color: var(--d-line);
    border-radius: var(--d-r);
  }
  :global([data-d='R']) .menu-item {
    counter-increment: r-item;
    gap: var(--d-p1);
    min-height: var(--d-row-h);
    border-radius: 0;
    border-bottom: max(var(--d-bw), 1px) solid var(--d-line);
  }
  :global([data-d='R']) .menu-item::before { content: counter(r-item) '·'; color: var(--d-accent); }
  :global([data-d='R']) .menu li:last-child .menu-item { border-bottom: 0; }
  :global([data-d='R']) .menu-item:hover { background: var(--d-accent-soft); }
  :global([data-d='R']) .link { color: var(--d-accent); text-decoration-color: var(--d-accent-edge); }

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
  :global([data-d='S']) .spec { gap: var(--d-p4); }
  :global([data-d='S']) .sec {
    --umbra: 0 var(--d-p2) var(--d-p4) calc(-1 * var(--d-p2)) var(--tone-fg, transparent);
    background: var(--d-surface);
    border: 0;
    border-radius: var(--d-r-lg);
    box-shadow: var(--umbra), var(--d-shadow);
    padding: var(--d-p3) var(--d-p4) var(--d-p4);
  }
  :global([data-d='S']) .sec-cap { margin-bottom: var(--d-p3); }
  :global([data-d='S']) .sec-body { gap: var(--d-p3); }
  /* La botonera llega hasta el canto de la tarjeta: así su charco teñido se
     derrama por fuera del borde en vez de quedar escondido debajo. */
  :global([data-d='S']) .bar {
    gap: var(--d-p2);
    margin-inline: calc(-1 * var(--d-p4));
    background: var(--d-surface);
    border-radius: var(--d-r-lg);
    box-shadow: var(--umbra), var(--d-shadow);
    padding: var(--d-p1) var(--d-p2);
  }
  :global([data-d='S']) .bar-sep {
    border-left: 0; margin-inline: var(--d-p1);
    width: max(var(--d-bw), 1px); min-height: 0; align-self: stretch;
    background: var(--d-sunk);
  }
  :global([data-d='S']) .d-btn--primary {
    box-shadow: 0 var(--d-p1) var(--d-p3) calc(-1 * var(--d-p1)) var(--d-accent);
  }
  :global([data-d='S']) .d-btn--danger {
    background: var(--d-surface); color: var(--d-crit); border-color: transparent;
    box-shadow: 0 var(--d-p1) var(--d-p3) calc(-1 * var(--d-p1)) var(--d-crit);
  }
  :global([data-d='S']) .d-btn--danger:hover {
    background: var(--d-surface);
    box-shadow: 0 var(--d-p2) var(--d-p4) calc(-1 * var(--d-p1)) var(--d-crit);
  }
  :global([data-d='S']) .grp {
    gap: 0;
    background: var(--d-surface);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    padding: calc(var(--d-p1) / 2);
  }
  :global([data-d='S']) .grp > .d-btn {
    background: transparent; border-color: transparent; box-shadow: none;
    border-radius: var(--d-r);
  }
  :global([data-d='S']) .grp > .d-btn + .d-btn {
    box-shadow: inset max(var(--d-bw), 1px) 0 0 var(--d-sunk);
  }
  :global([data-d='S']) .grp > .d-btn:hover { background: var(--d-sunk); }
  :global([data-d='S']) .split { border-radius: var(--d-r); box-shadow: var(--d-shadow); }
  :global([data-d='S']) .d-btn.split-main,
  :global([data-d='S']) .d-btn.split-toggle { box-shadow: none; }
  :global([data-d='S']) .menu {
    border: 0; border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow-lg); padding: var(--d-p1);
  }
  :global([data-d='S']) .menu-item { border-radius: var(--d-r); }
  :global([data-d='S']) .link { text-decoration-color: var(--d-ink-3); text-underline-offset: 4px; }

  /* Al final del todo, para ganarle en orden a las variaciones por dirección. */
  @media (prefers-reduced-motion: reduce) {
    .spin,
    :global([data-d='F']) .spin { animation: none; opacity: .6; }
  }
</style>
