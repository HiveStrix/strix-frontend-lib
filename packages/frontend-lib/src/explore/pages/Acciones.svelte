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
    <!-- G va a sangre: sus franjas tienen que tocar los bordes de la celda. -->
    <Direction id={d.id} flush={d.id === 'G'}>
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

  /* Al final del todo, para ganarle en orden a las variaciones por dirección. */
  @media (prefers-reduced-motion: reduce) {
    .spin,
    :global([data-d='F']) .spin { animation: none; opacity: .6; }
  }
</style>
