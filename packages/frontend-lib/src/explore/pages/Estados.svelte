<script>
  // ESTADOS Y DIÁLOGOS — todo lo que interrumpe.
  //
  // Una sola anatomía para todo lo que interrumpe: .blk = marca + palabra
  // (.blk-kind), titular, cuerpo y acciones. Esa anatomía se re-arma en cada
  // dirección: legenda sobre el marco en B, cabecera llena de color en C,
  // sello negro en D, bloque de log en F, raíl de 148px en G, pestaña en H.
  // Así el mismo aviso tiene ocho siluetas y no ocho paletas.
  import Grid from '../Grid.svelte';
  import Direction from '../Direction.svelte';
  import { COPY, ASSETS, markOf } from '../demo.js';

  export let directions = [];

  /** Las cinco palabras del vocabulario de estado, con su tono y su marca. */
  const TONES = [
    { tone: 'positive', word: 'Al día', note: 'en 47 d' },
    { tone: 'attention', word: 'Por vencer', note: 'en 5 d' },
    { tone: 'critical', word: 'Vencido', note: 'hace 12 d' },
    { tone: 'info', word: 'Programado', note: 'cada 3 000 h' },
    { tone: 'neutral', word: 'Sin lectura', note: 'nunca' }
  ];

  /** Lo que queda debajo del velo: la flota real, no un rectángulo gris. */
  const BEHIND = ASSETS.slice(0, 5);

  // Estado por dirección. Cada celda es un espécimen independiente.
  let dlg = {};    // 'open' | 'cancel' | 'confirm'
  let toast = {};  // 'on' | 'undone' | 'off'
  let net = {};    // 'down' | 'trying'

  function answer(id, how) { dlg[id] = how; }
  function reopen(id) { dlg[id] = 'open'; }
  function setToast(id, v) { toast[id] = v; }
  function tryAgain(id) {
    if (net[id] === 'trying') return;
    net[id] = 'trying';
    setTimeout(() => { net[id] = 'down'; }, 1600);
  }
</script>

<Grid min="430px">
  {#each directions as d (d.id)}
    <Direction id={d.id} flush={d.id === 'G'}>
      <div class="page">

        <!-- 1 · Las cinco píldoras, en dos tamaños. Tono + marca + palabra. -->
        <section class="sec" aria-labelledby={'s1-' + d.id}>
          <h4 class="sec-cap d-cap" id={'s1-' + d.id}>Estados</h4>
          <div class="sec-body">
            <div class="pillrow">
              {#each TONES as t}
                <span class="d-pill pill-lg" data-tone={t.tone}>
                  <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf(t.tone)}</svg>{t.word}
                </span>
              {/each}
            </div>
            <div class="pillrow">
              {#each TONES as t}
                <span class="d-pill" data-tone={t.tone}>
                  <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf(t.tone)}</svg>{t.word} · {t.note}
                </span>
              {/each}
            </div>
          </div>
        </section>

        <!-- 2 · Aviso informativo y aviso de error. -->
        <section class="sec" aria-labelledby={'s2-' + d.id}>
          <h4 class="sec-cap d-cap" id={'s2-' + d.id}>Avisos</h4>
          <div class="sec-body">
            <div class="blk d-rail" data-tone="info">
              <p class="blk-kind d-cap">
                <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf('info')}</svg>Aviso
              </p>
              <h5 class="blk-title">Estado de la flota de hoy</h5>
              <p class="blk-body">{COPY.verdict}</p>
            </div>

            <div class="blk d-rail" data-tone="critical" role="alert">
              <p class="blk-kind d-cap">
                <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf('critical')}</svg>Error
              </p>
              <h5 class="blk-title">{COPY.errorTitle}</h5>
              <p class="blk-body">{COPY.errorBody}</p>
              <div class="blk-acts">
                <button type="button" class="d-btn d-btn--sm">Ver el documento</button>
                <button type="button" class="d-btn d-btn--sm">Asignar el equipo a mano</button>
              </div>
            </div>
          </div>
        </section>

        <!-- 3 · Toast de confirmación con deshacer. Vive en la celda, sin fixed. -->
        <section class="sec" aria-labelledby={'s3-' + d.id}>
          <h4 class="sec-cap d-cap" id={'s3-' + d.id}>Confirmación</h4>
          <div class="sec-body">
            {#if (toast[d.id] ?? 'on') === 'off'}
              <p class="reopen">
                <button type="button" class="d-btn d-btn--sm" on:click={() => setToast(d.id, 'on')}>
                  Volver a mostrar el aviso
                </button>
              </p>
            {:else if (toast[d.id] ?? 'on') === 'undone'}
              <div class="blk blk--toast d-rail" data-tone="neutral" role="status">
                <p class="blk-kind d-cap">
                  <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf('neutral')}</svg>Deshecho
                </p>
                <p class="blk-title">Se descartó la lectura de 312 h en BAT-014</p>
                <div class="blk-acts">
                  <button type="button" class="d-btn d-btn--sm" on:click={() => setToast(d.id, 'on')}>Rehacer</button>
                  <button type="button" class="d-btn d-btn--ghost d-btn--sm" aria-label="Descartar este aviso"
                          on:click={() => setToast(d.id, 'off')}>×</button>
                </div>
              </div>
            {:else}
              <div class="blk blk--toast d-rail" data-tone="positive" role="status">
                <p class="blk-kind d-cap">
                  <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf('positive')}</svg>Listo
                </p>
                <p class="blk-title">Lectura registrada · 312 h en BAT-014</p>
                <div class="blk-acts">
                  <button type="button" class="d-btn d-btn--sm" on:click={() => setToast(d.id, 'undone')}>Deshacer</button>
                  <button type="button" class="d-btn d-btn--ghost d-btn--sm" aria-label="Descartar este aviso"
                          on:click={() => setToast(d.id, 'off')}>×</button>
                </div>
              </div>
            {/if}
          </div>
        </section>

        <!-- 4 · Confirmación destructiva EN LÍNEA: velo simulado dentro de la celda. -->
        <section class="sec" aria-labelledby={'s4-' + d.id}>
          <h4 class="sec-cap d-cap" id={'s4-' + d.id}>Confirmar y eliminar</h4>
          <div class="sec-body">
            <div class="scene">
              <div class="scene-list" aria-hidden={(dlg[d.id] ?? 'open') === 'open' ? 'true' : null}>
                {#each BEHIND as a}
                  <div class="d-row" data-tone={a.tone}>
                    <span class="d-id">{a.code}</span>
                    <span class="scene-name">{a.name}</span>
                    <span class="d-pill" data-tone={a.tone}>
                      <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf(a.tone)}</svg>{a.state}
                    </span>
                  </div>
                {/each}
              </div>

              {#if (dlg[d.id] ?? 'open') === 'open'}
                <div class="veil"></div>
                <div class="blk dlg d-rail" data-tone="critical" role="alertdialog" aria-modal="false"
                     aria-labelledby={'dt-' + d.id} aria-describedby={'db-' + d.id}>
                  <p class="blk-kind d-cap">
                    <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf('critical')}</svg>Eliminar
                  </p>
                  <h5 class="blk-title" id={'dt-' + d.id}>{COPY.confirmTitle}</h5>
                  <p class="blk-body" id={'db-' + d.id}>{COPY.confirmBody}</p>
                  <label class="dlg-check" for={'chk-' + d.id}>
                    <input class="dlg-box" type="checkbox" id={'chk-' + d.id} />
                    <span>Eliminar también sus 3 tareas</span>
                  </label>
                  <div class="blk-acts dlg-acts">
                    <button type="button" class="d-btn" on:click={() => answer(d.id, 'cancel')}>Cancelar</button>
                    <button type="button" class="d-btn d-btn--danger" on:click={() => answer(d.id, 'confirm')}>
                      Eliminar la familia
                    </button>
                  </div>
                </div>
              {/if}
            </div>

            {#if (dlg[d.id] ?? 'open') !== 'open'}
              <p class="reopen">
                <span class="d-hint">
                  {(dlg[d.id] === 'confirm')
                    ? 'Se eliminó la familia Batidoras. Sus 14 equipos quedaron sin plan.'
                    : 'Cancelaste. La familia Batidoras sigue con sus 14 equipos.'}
                </span>
                <button type="button" class="d-btn d-btn--sm" on:click={() => reopen(d.id)}>Volver a abrirlo</button>
              </p>
            {/if}
          </div>
        </section>

        <!-- 5 · Esqueleto de carga e indicador de proceso. -->
        <section class="sec" aria-labelledby={'s5-' + d.id}>
          <h4 class="sec-cap d-cap" id={'s5-' + d.id}>Carga y proceso</h4>
          <div class="sec-body">
            <div class="load">
              <div class="skel" aria-hidden="true">
                <div class="skel-row"><span class="skel-b skel-b--id"></span><span class="skel-b skel-b--name"></span><span class="skel-b skel-b--pill"></span></div>
                <div class="skel-row"><span class="skel-b skel-b--id"></span><span class="skel-b skel-b--name"></span><span class="skel-b skel-b--pill"></span></div>
                <div class="skel-row"><span class="skel-b skel-b--id"></span><span class="skel-b skel-b--name"></span><span class="skel-b skel-b--pill"></span></div>
              </div>
              <p class="load-cap d-hint">Cargando {ASSETS.length} equipos de Bodega San José…</p>
            </div>

            <div class="proc">
              <p class="proc-lbl" id={'pr-' + d.id}>Procesando la devolución 8631</p>
              <div class="proc-track" role="progressbar" aria-labelledby={'pr-' + d.id}
                   aria-valuemin="0" aria-valuemax="100" aria-valuenow="25" aria-valuetext="línea 3 de 12">
                <span class="proc-fill" style="width:25%"></span>
              </div>
              <p class="proc-meta d-hint d-num">línea 3 de 12 · 25 %</p>
            </div>
          </div>
        </section>

        <!-- 6 · Vacío y sin conexión, con su acción de reintento. -->
        <section class="sec" aria-labelledby={'s6-' + d.id}>
          <h4 class="sec-cap d-cap" id={'s6-' + d.id}>Vacío y sin conexión</h4>
          <div class="sec-body">
            <div class="blk d-rail" data-tone="neutral">
              <p class="blk-kind d-cap">
                <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf('neutral')}</svg>Sin equipos
              </p>
              <h5 class="blk-title">{COPY.emptyTitle}</h5>
              <p class="blk-body">{COPY.emptyBody}</p>
              <div class="blk-acts">
                <button type="button" class="d-btn d-btn--primary d-btn--sm">Agregar equipo</button>
                <button type="button" class="d-btn d-btn--sm">Subir salida en PDF</button>
              </div>
            </div>

            <div class="blk d-rail" data-tone="attention">
              <p class="blk-kind d-cap">
                <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf('attention')}</svg>Sin conexión
              </p>
              <h5 class="blk-title">No hay conexión con el servidor</h5>
              <p class="blk-body">
                Los cambios que registres se guardan en este equipo y se envían solos cuando vuelva la señal.
              </p>
              {#if net[d.id] === 'trying'}
                <div class="proc-track proc-track--wait" aria-hidden="true"><span class="proc-fill proc-fill--wait"></span></div>
              {/if}
              <p class="d-sr" role="status">{net[d.id] === 'trying' ? 'Reintentando la conexión' : ''}</p>
              <div class="blk-acts">
                <button type="button" class="d-btn d-btn--primary d-btn--sm"
                        aria-busy={net[d.id] === 'trying'} disabled={net[d.id] === 'trying'}
                        on:click={() => tryAgain(d.id)}>
                  {net[d.id] === 'trying' ? 'Reintentando…' : 'Reintentar'}
                </button>
                <button type="button" class="d-btn d-btn--sm">Seguir sin conexión</button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </Direction>
  {/each}
</Grid>

<style>
  /* ======================================================================
     BASE — todo sale de los tokens --d-*. Ni un color, radio o sombra a mano.
     ====================================================================== */
  .page { position: relative; display: flex; flex-direction: column; gap: var(--d-gap); min-width: 0; }
  .sec { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); row-gap: var(--d-p1); min-width: 0; }
  .sec-cap { margin: 0; }
  .sec-body { display: flex; flex-direction: column; gap: var(--d-p2); min-width: 0; }

  .pillrow { display: flex; flex-wrap: wrap; align-items: center; gap: var(--d-p1); min-width: 0; }
  .pill-lg { font-size: var(--d-t-sm); padding: var(--d-p1) var(--d-p3); }
  .pill-lg svg { width: .95em; height: .95em; }

  /* La anatomía única de lo que interrumpe. */
  .blk {
    position: relative;
    display: grid; grid-template-columns: minmax(0, 1fr);
    row-gap: var(--d-p1);
    padding: var(--d-p2) var(--d-p3);
    min-width: 0;
    color: var(--d-ink);
    background: var(--blk-bg, var(--tone-band));
    border: var(--d-bw) solid var(--tone-edge);
    border-radius: var(--d-r);
    box-shadow: var(--d-shadow);
  }
  .blk-kind {
    margin: 0; min-width: 0;
    display: inline-flex; align-items: center; gap: .4em;
    color: var(--tone-fg);
  }
  .blk-kind svg { width: 1em; height: 1em; flex: none; }
  .blk-title { margin: 0; font-size: var(--d-t-sm); font-weight: var(--d-w-semi); line-height: 1.32; letter-spacing: -.01em; }
  .blk-body { margin: 0; font-size: var(--d-t-xs); line-height: 1.45; color: var(--d-ink-2); }
  .blk-acts { display: flex; flex-wrap: wrap; align-items: center; gap: var(--d-p1); min-width: 0; }

  /* El diálogo: misma anatomía, fondo de superficie en vez de banda de tono. */
  .dlg { --blk-bg: var(--d-surface); grid-area: 1 / 1; z-index: 2; align-self: center; margin: var(--d-p3); }
  .dlg-acts { justify-content: flex-end; padding-top: var(--d-p1); }
  .dlg-check { display: flex; align-items: center; gap: var(--d-p1); font-size: var(--d-t-xs); color: var(--d-ink-2); cursor: pointer; }
  .dlg-box { accent-color: var(--d-accent); inline-size: 1.05em; block-size: 1.05em; margin: 0; flex: none; }

  /* El escenario del diálogo: relative + un velo absolute, dentro de la celda. */
  .scene {
    position: relative; display: grid; min-width: 0;
    background: var(--d-surface);
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r);
    overflow: hidden;
  }
  .scene-list { grid-area: 1 / 1; min-width: 0; }
  .scene-name { flex: 1 1 auto; min-width: 0; font-size: var(--d-t-xs); color: var(--d-ink-2); }
  .veil { position: absolute; inset: 0; z-index: 1; background: color-mix(in srgb, var(--d-ink) 42%, transparent); }
  .reopen { display: flex; flex-wrap: wrap; align-items: center; gap: var(--d-p2); margin: 0; }

  .load { display: grid; row-gap: var(--d-p1); min-width: 0; }
  .skel { display: grid; min-width: 0; }
  .skel-row { display: flex; align-items: center; gap: var(--d-p2); min-height: var(--d-row-h); min-width: 0; }
  .skel-b { display: block; min-width: 0; height: .8em; border-radius: var(--d-r); background: var(--d-sunk); animation: pulse 1.5s ease-in-out infinite; }
  .skel-b--id { width: 20%; }
  .skel-b--name { flex: 1 1 auto; }
  .skel-b--pill { width: 18%; }
  .skel-row:nth-child(2) .skel-b { animation-delay: .18s; }
  .skel-row:nth-child(3) .skel-b { animation-delay: .36s; }
  @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: .42 } }
  .load-cap { margin: 0; }

  .proc { display: grid; row-gap: var(--d-p1); min-width: 0; }
  .proc-lbl { margin: 0; font-size: var(--d-t-sm); font-weight: var(--d-w-med); }
  .proc-track {
    position: relative; overflow: hidden;
    height: var(--d-p1);
    background: var(--d-sunk);
    border-radius: var(--d-r);
  }
  .proc-fill { display: block; height: 100%; background: var(--d-accent); border-radius: inherit; }
  .proc-fill--wait { width: 34%; animation: slide 1.1s ease-in-out infinite alternate; }
  @keyframes slide { from { transform: translateX(-12%) } to { transform: translateX(300%) } }
  .proc-meta { margin: 0; }

  /* ======================================================================
     A · ELEVACIÓN — tarjetas redondeadas que flotan, separadas por aire.
     ====================================================================== */
  :global([data-d='A']) .blk {
    --blk-bg: var(--d-surface);
    border-color: var(--d-line); border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow-lg); padding: var(--d-p3);
  }
  :global([data-d='A']) .blk-kind {
    justify-self: start; padding: 3px var(--d-p2) 3px var(--d-p1);
    background: var(--tone-band); border-radius: var(--d-r-pill);
  }
  :global([data-d='A']) .blk--toast::after {
    content: ''; position: absolute; z-index: -1;
    inset: auto var(--d-p3) calc(-1 * var(--d-p1));
    height: var(--d-p2);
    background: var(--d-surface); border: 1px solid var(--d-line);
    border-radius: 0 0 var(--d-r-lg) var(--d-r-lg); box-shadow: var(--d-shadow);
  }
  :global([data-d='A']) .scene { border-radius: var(--d-r-lg); box-shadow: var(--d-shadow); }
  :global([data-d='A']) .dlg { border-radius: var(--d-r-lg); box-shadow: var(--d-shadow-lg); }
  :global([data-d='A']) .proc-track { border-radius: var(--d-r-pill); }

  /* ======================================================================
     B · INSTRUMENTO — un solo marco continuo; los avisos comparten borde y
     la palabra de estado cabalga sobre la línea, como la leyenda de un plano.
     ====================================================================== */
  :global([data-d='B']) .page { border: 1px solid var(--d-edge); }
  :global([data-d='B']) .page::before,
  :global([data-d='B']) .page::after {
    content: ''; position: absolute; width: 7px; height: 7px;
    border: 1px solid var(--d-edge); pointer-events: none;
  }
  :global([data-d='B']) .page::before { top: 3px; left: 3px; border-right: 0; border-bottom: 0; }
  :global([data-d='B']) .page::after { bottom: 3px; right: 3px; border-left: 0; border-top: 0; }
  :global([data-d='B']) .sec {
    padding: var(--d-p2) var(--d-p3) var(--d-p3);
    border-bottom: 1px solid var(--d-line);
    row-gap: var(--d-p3);
  }
  :global([data-d='B']) .sec:last-child { border-bottom: 0; }
  :global([data-d='B']) .sec-body { gap: 0; }
  :global([data-d='B']) .blk {
    --blk-bg: var(--d-surface);
    border-color: var(--d-edge); padding: var(--d-p4) var(--d-p3) var(--d-p3);
  }
  :global([data-d='B']) .blk + .blk { margin-top: -1px; }
  :global([data-d='B']) .blk-kind {
    position: absolute; top: 0; left: var(--d-p2); transform: translateY(-50%);
    background: var(--d-surface); padding-inline: 4px;
  }
  :global([data-d='B']) .blk::after {
    content: ''; position: absolute; top: 3px; right: 3px; width: 6px; height: 6px;
    border: 1px solid var(--tone-edge); border-left: 0; border-bottom: 0; pointer-events: none;
  }
  :global([data-d='B']) .pillrow { gap: 0; }
  :global([data-d='B']) .pillrow > .d-pill + .d-pill { margin-left: -1px; }
  :global([data-d='B']) .skel-b { background: transparent; border: 1px solid var(--d-line); }
  :global([data-d='B']) .proc-track { background: transparent; border: 1px solid var(--d-edge); }
  :global([data-d='B']) .proc-fill { background: var(--d-ink); }
  :global([data-d='B']) .veil {
    background:
      repeating-linear-gradient(45deg, transparent 0 4px, color-mix(in srgb, var(--d-ink) 16%, transparent) 4px 5px),
      color-mix(in srgb, var(--d-surface) 62%, transparent);
  }
  :global([data-d='B']) .dlg { outline: 1px solid var(--d-edge); outline-offset: 3px; }

  /* ======================================================================
     C · MARCA — el bloque se anuncia por su cabecera llena de color, no por
     su borde: la palabra de estado ES la barra que corona el aviso.
     ====================================================================== */
  :global([data-d='C']) .blk {
    --blk-bg: var(--d-surface);
    border-color: var(--d-line); padding: 0; row-gap: var(--d-p1); overflow: hidden;
  }
  :global([data-d='C']) .blk-kind {
    background: var(--tone-fg); color: var(--d-ink-on);
    padding: var(--d-p1) var(--d-p3); margin-bottom: var(--d-p1);
  }
  /* El gris medio sobre blanco no da contraste: el neutro va en tinta. */
  :global([data-d='C']) .blk[data-tone='neutral'] .blk-kind { background: var(--d-ink-2); }
  :global([data-d='C']) .blk-title,
  :global([data-d='C']) .blk-body,
  :global([data-d='C']) .blk-acts,
  :global([data-d='C']) .dlg-check { margin-inline: var(--d-p3); }
  :global([data-d='C']) .blk > :last-child { margin-bottom: var(--d-p3); }
  :global([data-d='C']) .veil { background: color-mix(in srgb, var(--d-brand-deep) 46%, transparent); }
  :global([data-d='C']) .dlg { box-shadow: var(--d-shadow-lg); }
  :global([data-d='C']) .proc-fill { background: var(--d-brand); }
  :global([data-d='C']) .skel-row:first-child .skel-b--id { background: var(--d-accent-soft); }

  /* ======================================================================
     D · PESO — borde de 2px, sombra sólida y la palabra de estado como un
     sello de tinta clavado en la esquina. Al presionar, el bloque entero se
     mueve hacia su sombra.
     ====================================================================== */
  :global([data-d='D']) .blk {
    border-color: var(--d-ink); border-radius: 0;
    box-shadow: var(--d-shadow);
    padding: var(--d-p2) var(--d-p3) var(--d-p3);
    transition: transform 90ms ease, box-shadow 90ms ease;
  }
  :global([data-d='D']) .blk:has(.d-btn:active) { transform: translate(3px, 3px); box-shadow: 1px 1px 0 var(--d-ink); }
  :global([data-d='D']) .blk-kind {
    justify-self: start;
    margin: calc(-1 * var(--d-p2)) 0 0 calc(-1 * var(--d-p3));
    padding: var(--d-p1) var(--d-p2);
    background: var(--d-ink); color: var(--d-ink-on);
  }
  :global([data-d='D']) .blk-title { font-size: var(--d-t-md); font-weight: var(--d-w-bold); text-transform: uppercase; }
  :global([data-d='D']) .sec-cap { border-bottom: var(--d-bw) solid var(--d-ink); padding-bottom: 2px; }
  :global([data-d='D']) .scene { border-color: var(--d-ink); box-shadow: var(--d-shadow); }
  :global([data-d='D']) .dlg { box-shadow: var(--d-shadow-lg); }
  :global([data-d='D']) .veil {
    background-color: color-mix(in srgb, var(--d-sunk) 34%, transparent);
    background-image: radial-gradient(var(--d-ink) 1.1px, transparent 1.2px);
    background-size: 5px 5px;
  }
  :global([data-d='D']) .skel-b { background: var(--d-sunk); border: var(--d-bw) solid var(--d-ink); height: 1em; }
  :global([data-d='D']) .proc-track { background: var(--d-surface); border: var(--d-bw) solid var(--d-ink); }
  :global([data-d='D']) .proc-fill { background: var(--d-ink); }
  :global([data-d='D']) .dlg-acts { padding-top: var(--d-p2); }

  /* ======================================================================
     E · AIRE — ni un borde en toda la celda. Radios enormes, aire enorme,
     la palabra de estado flotando en su propia cápsula blanca.
     ====================================================================== */
  :global([data-d='E']) .blk {
    border: 0; border-radius: var(--d-r-lg);
    box-shadow: none; padding: var(--d-p3);
  }
  :global([data-d='E']) .blk-kind {
    justify-self: start; padding: var(--d-p1) var(--d-p2);
    background: var(--d-surface); border-radius: var(--d-r-pill);
  }
  :global([data-d='E']) .blk-title { font-size: var(--d-t-lg); letter-spacing: -.015em; }
  :global([data-d='E']) .blk-body { font-size: var(--d-t-sm); }
  :global([data-d='E']) .blk-acts { padding-top: var(--d-p1); }
  :global([data-d='E']) .blk--toast {
    --blk-bg: var(--d-surface);
    box-shadow: var(--d-shadow-lg); padding: var(--d-p3) var(--d-p4);
  }
  :global([data-d='E']) .sec-body { gap: var(--d-p2); }
  :global([data-d='E']) .scene { border: 0; border-radius: var(--d-r-lg); background: var(--d-sunk); }
  :global([data-d='E']) .dlg { border-radius: var(--d-r-lg); box-shadow: var(--d-shadow-lg); padding: var(--d-p4); }
  :global([data-d='E']) .veil {
    background: color-mix(in srgb, var(--d-ground) 74%, transparent);
    backdrop-filter: blur(2px);
  }
  :global([data-d='E']) .skel-b { height: 1.05em; border-radius: var(--d-r-pill); }
  :global([data-d='E']) .proc-track { border-radius: var(--d-r-pill); }

  /* ======================================================================
     F · TERMINAL — cada aviso es una línea de log: el nivel va como bloque
     de color detrás del texto y el resto se alinea a la cuadrícula.
     ====================================================================== */
  :global([data-d='F']) .blk {
    --blk-bg: var(--d-sunk);
    border: 0; border-radius: 0;
    padding: var(--d-p1) var(--d-p2);
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: var(--d-p2); row-gap: 0;
  }
  :global([data-d='F']) .blk-kind {
    grid-column: 1; grid-row: 1; align-self: start;
    padding: 0 var(--d-p1);
    background: var(--tone-band); color: var(--tone-fg);
  }
  :global([data-d='F']) .blk-title,
  :global([data-d='F']) .blk-body,
  :global([data-d='F']) .blk-acts,
  :global([data-d='F']) .dlg-check { grid-column: 2; }
  :global([data-d='F']) .blk-title { font-size: var(--d-t-sm); font-weight: var(--d-w-med); }
  :global([data-d='F']) .blk-body { color: var(--d-ink-3); }
  :global([data-d='F']) .blk-acts { padding-top: var(--d-p1); }
  :global([data-d='F']) .sec-cap { color: var(--d-accent); white-space: nowrap; overflow: hidden; }
  :global([data-d='F']) .sec-cap::before { content: '── '; color: var(--d-line); }
  :global([data-d='F']) .sec-cap::after { content: ' ────────────────────────────────────────'; color: var(--d-line); }
  :global([data-d='F']) .scene { border-color: var(--d-line); }
  :global([data-d='F']) .veil { background: color-mix(in srgb, var(--d-ground) 76%, transparent); }
  :global([data-d='F']) .dlg { --blk-bg: var(--d-surface); border: 1px solid var(--d-edge); padding: var(--d-p2); }
  :global([data-d='F']) .scene-name { color: var(--d-ink-2); }
  /* El esqueleto y la barra se dibujan con caracteres, no con rectángulos:
     bloques del ancho de un carácter, alineados a la cuadrícula. */
  :global([data-d='F']) .skel-b {
    height: 1em; border-radius: 0; background: repeating-linear-gradient(90deg, var(--d-line) 0 6px, transparent 6px 7px);
  }
  :global([data-d='F']) .skel-row { min-height: var(--d-row-h); }
  :global([data-d='F']) .proc-track { height: auto; background: transparent; border-radius: 0; line-height: 1.2; }
  :global([data-d='F']) .proc-track::before { content: '········································'; color: var(--d-ink-3); letter-spacing: .1em; }
  :global([data-d='F']) .proc-fill {
    position: absolute; inset: 0 auto 0 0; height: auto;
    background: transparent; overflow: hidden; white-space: nowrap; color: var(--d-accent);
  }
  :global([data-d='F']) .proc-fill::before { content: '████████████████████████████████████████'; }
  :global([data-d='F']) .proc-fill--wait { background: var(--d-accent-soft); }
  :global([data-d='F']) .proc-fill--wait::before { content: ''; }
  :global([data-d='F']) .proc-track--wait { height: var(--d-p1); background: var(--d-sunk); }
  :global([data-d='F']) .proc-track--wait::before { content: ''; }

  /* ======================================================================
     G · BANDA — ninguna caja: franjas a sangre, raíl fijo de etiquetas a la
     izquierda y el estado como franja de 3px en el canto izquierdo.
     ====================================================================== */
  :global([data-d='G']) .page { gap: 0; }
  :global([data-d='G']) .sec { row-gap: 0; }
  :global([data-d='G']) .sec-cap {
    background: var(--d-sunk); border-block: 1px solid var(--d-line);
    padding: var(--d-p1) var(--d-p3); margin-block: -1px 0;
  }
  :global([data-d='G']) .sec-body { gap: 0; }
  :global([data-d='G']) .blk {
    --blk-bg: transparent;
    border: 0; border-bottom: 1px solid var(--d-line); border-radius: 0; box-shadow: none;
    grid-template-columns: var(--d-rail) minmax(0, 1fr);
    column-gap: var(--d-p3); row-gap: 2px;
    padding: var(--d-p2) var(--d-p3);
  }
  :global([data-d='G']) .blk::before {
    content: ''; position: absolute; inset: 0 auto 0 0; width: 3px; background: var(--tone-fg);
  }
  :global([data-d='G']) .blk-kind { grid-column: 1; grid-row: 1; justify-content: flex-end; text-align: right; }
  :global([data-d='G']) .blk-title,
  :global([data-d='G']) .blk-body,
  :global([data-d='G']) .blk-acts,
  :global([data-d='G']) .dlg-check { grid-column: 2; }
  :global([data-d='G']) .blk-acts { padding-top: var(--d-p1); }
  :global([data-d='G']) .d-pill { border-radius: 0; border-left: 3px solid var(--tone-fg); padding-left: var(--d-p1); }
  :global([data-d='G']) .pillrow,
  :global([data-d='G']) .load-cap,
  :global([data-d='G']) .proc,
  :global([data-d='G']) .reopen { padding: var(--d-p2) var(--d-p3); }
  :global([data-d='G']) .skel-row { padding-inline: var(--d-p3); border-bottom: 1px solid var(--d-line); }
  :global([data-d='G']) .scene { border: 0; border-radius: 0; }
  :global([data-d='G']) .veil { background: color-mix(in srgb, var(--d-ink) 26%, transparent); }
  :global([data-d='G']) .dlg { --blk-bg: var(--d-surface); margin: 0; box-shadow: var(--d-shadow-lg); }
  :global([data-d='G']) .dlg-acts { justify-content: flex-start; }
  :global([data-d='G']) .proc-track { border-radius: 0; }

  /* ======================================================================
     H · FICHA — la palabra de estado sale como pestaña por encima de la
     ficha, el canto apilado va debajo y bajo el titular hay regla doble.
     ====================================================================== */
  :global([data-d='H']) .blk {
    --blk-bg: var(--d-surface);
    border-color: var(--d-edge); box-shadow: var(--d-shadow);
    margin-top: 1.9em; padding: var(--d-p2) var(--d-p3) var(--d-p3);
  }
  :global([data-d='H']) .blk-kind {
    position: absolute; top: 0; left: -1px; transform: translateY(-100%);
    max-width: calc(100% + 2px);
    padding: calc(var(--d-p1) * .5) var(--d-p2);
    background: var(--d-sunk);
    border: 1px solid var(--d-edge); border-bottom: 0;
    border-radius: var(--d-r-lg) var(--d-r-lg) 0 0;
  }
  :global([data-d='H']) .blk-title { padding-bottom: var(--d-p1); border-bottom: 3px double var(--d-line); }
  :global([data-d='H']) .sec-body { gap: var(--d-p2); }
  :global([data-d='H']) .scene { background: var(--d-surface); box-shadow: var(--d-shadow); margin-bottom: 5px; }
  :global([data-d='H']) .dlg { box-shadow: var(--d-shadow-lg); margin-bottom: var(--d-p4); }
  :global([data-d='H']) .veil { background: color-mix(in srgb, var(--d-ground) 74%, transparent); }
  :global([data-d='H']) .skel-b { background: var(--d-sunk); border-bottom: 1px solid var(--d-line); height: 1.15em; }
  /* En manila, lo que carga también es una ficha (sin pestaña todavía). */
  :global([data-d='H']) .load,
  :global([data-d='H']) .proc {
    background: var(--d-surface); border: 1px solid var(--d-edge);
    box-shadow: var(--d-shadow); padding: var(--d-p2) var(--d-p3); margin-bottom: 5px;
  }
  :global([data-d='H']) .proc-track { background: var(--d-sunk); border: 1px solid var(--d-edge); }

  /* ======================================================================
     Movimiento y tamaños chicos.
     ====================================================================== */
  @media (prefers-reduced-motion: reduce) {
    .skel-b { animation: none; opacity: .72; }
    .proc-fill--wait { animation: none; width: 100%; opacity: .6; }
    .blk { transition: none; }
  }

  /* Debajo de 720px el raíl de G se pliega: 148px de etiquetas en un teléfono
     no dejan nada para el contenido. Mismo umbral que la primitiva .d-rail. */
  @media (max-width: 720px) {
    :global([data-d='G']) .blk { grid-template-columns: minmax(0, 1fr); row-gap: var(--d-p1); }
    :global([data-d='G']) .blk-kind { grid-column: 1; grid-row: auto; justify-content: flex-start; text-align: left; }
    :global([data-d='G']) .blk-title,
    :global([data-d='G']) .blk-body,
    :global([data-d='G']) .blk-acts,
    :global([data-d='G']) .dlg-check { grid-column: 1; }
  }

  @media (max-width: 420px) {
    .blk-acts .d-btn, .dlg-acts .d-btn { flex: 1 1 auto; }
    .dlg { margin: var(--d-p2); }
    .reopen { align-items: flex-start; }
  }
</style>
