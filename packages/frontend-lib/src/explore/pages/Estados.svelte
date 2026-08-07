<script>
  // ESTADOS Y DIÁLOGOS: todo lo que interrumpe.
  //
  // Una sola anatomía para lo que interrumpe: .blk = marca + palabra de estado
  // (.blk-kind), titular, cuerpo y acciones. Esa anatomía se re-arma en cada
  // dirección: píldora de estado en A, legenda sobre el marco en B, cabecera
  // llena de color en C, faceta de vidrio en O, mancha derramada en M, anillo
  // de luz en T. El mismo aviso tiene veinte siluetas y no veinte paletas.
  //
  // La palabra de estado NO es un epígrafe. Es la misma píldora que enseña la
  // sección 1, con la misma marca y el mismo tono, aplicada a lo que
  // interrumpe. Por eso en las finalistas se lee en caja normal y no en
  // versalitas: la versalita solo sobrevive donde es el idioma declarado de la
  // dirección, que es B.
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
          <h4 class="sec-cap d-cap" id={'s2-' + d.id}>Avisos y errores</h4>
          <div class="sec-body">
            <div class="blk d-rail" data-tone="info">
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
          <h4 class="sec-cap d-cap" id={'s3-' + d.id}>Hecho, y cómo deshacerlo</h4>
          <div class="sec-body">
            {#if (toast[d.id] ?? 'on') === 'off'}
              <p class="reopen">
                <button type="button" class="d-btn d-btn--sm" on:click={() => setToast(d.id, 'on')}>
                  Volver a mostrar el aviso
                </button>
              </p>
            {:else if (toast[d.id] ?? 'on') === 'undone'}
              <div class="blk blk--toast d-rail" data-tone="neutral" role="status">
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
          <h4 class="sec-cap d-cap" id={'s4-' + d.id}>Confirmar antes de eliminar</h4>
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
                    <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">{@html markOf('critical')}</svg>Confirmar
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
              <h5 class="blk-title">{COPY.emptyTitle}</h5>
              <p class="blk-body">{COPY.emptyBody}</p>
              <div class="blk-acts">
                <button type="button" class="d-btn d-btn--primary d-btn--sm">Agregar equipo</button>
                <button type="button" class="d-btn d-btn--sm">Subir salida en PDF</button>
              </div>
            </div>

            <div class="blk d-rail" data-tone="attention">
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
     BASE. Todo sale de los tokens --d-*. Ni un color, radio o sombra a mano.

     Las cinco propiedades de abajo llevan valor por defecto entre paréntesis:
     una dirección que no las rebindea queda exactamente como estaba. Es la
     manera de mover las siete finalistas sin tocar a las trece que se quedan.
     ====================================================================== */
  .page { position: relative; display: flex; flex-direction: column; gap: var(--d-gap); min-width: 0; }
  .sec { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); row-gap: var(--d-p1); min-width: 0; }
  /* El encabezado de sección. Donde la versalita no es el idioma declarado de
     la dirección, se lee en caja normal: seis versalitas seguidas dan el mismo
     ritmo tibio en las seis secciones y ninguna gana la mirada. */
  .sec-cap {
    margin: 0;
    font-size: var(--cap-size, var(--d-label-size));
    font-weight: var(--cap-weight, var(--d-label-weight));
    letter-spacing: var(--cap-track, var(--d-label-track));
    text-transform: var(--cap-case, var(--d-label-case));
    color: var(--cap-color, var(--d-label-color));
  }
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
  /* La palabra de estado. No es un epígrafe: es la misma píldora de la sección
     1 puesta sobre lo que interrumpe, y por eso lleva marca y tono. */
  .blk-kind {
    margin: 0; min-width: 0;
    display: inline-flex; align-items: center; gap: .4em;
    color: var(--tone-fg);
    font-size: var(--kind-size, var(--d-label-size));
    font-weight: var(--kind-weight, var(--d-label-weight));
    letter-spacing: var(--kind-track, var(--d-label-track));
    text-transform: var(--kind-case, var(--d-label-case));
  }
  .blk-kind svg { width: 1em; height: 1em; flex: none; }
  .blk-title { margin: 0; font-size: var(--blk-title-size, var(--d-t-sm)); font-weight: var(--d-w-semi); line-height: 1.32; letter-spacing: -.01em; }
  .blk-body { margin: 0; font-size: var(--blk-body-size, var(--d-t-xs)); line-height: 1.45; color: var(--d-ink-2); }
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
  /* El ancho de cada bloque sale de la medida del contenido real, no de un
     porcentaje: un código de siete caracteres y una píldora de estado. */
  .skel-b--id { width: var(--skel-id, 20%); }
  .skel-b--name { flex: 1 1 auto; }
  .skel-b--pill { width: var(--skel-pill, 18%); }
  .skel-row:nth-child(2) .skel-b { animation-delay: .18s; }
  .skel-row:nth-child(3) .skel-b { animation-delay: .36s; }
  @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: .42 } }
  /* Qué se está cargando se lee antes que su forma. */
  .load-cap { margin: 0; order: var(--load-order, 0); }

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
     LO QUE COMPARTEN LAS SIETE FINALISTAS.

     Tres correcciones que no dependen de la silueta y que valen igual en las
     siete. Van acá y no repetidas siete veces porque son de contenido, no de
     forma: dicen QUÉ se lee primero y CON QUÉ medida, no cómo se ve.
     ====================================================================== */
  :global([data-d='A']) .page, :global([data-d='B']) .page, :global([data-d='C']) .page,
  :global([data-d='I']) .page, :global([data-d='M']) .page, :global([data-d='O']) .page,
  :global([data-d='T']) .page {
    --load-order: -1;
    --skel-id: 4.6em;
    --skel-pill: 7em;
    /* El titular de un aviso tiene que ganarle al cuerpo de lejos, y el cuerpo
       tiene que leerse con el teléfono en la mano: 12,5px no alcanzaba. */
    --blk-title-size: var(--d-t-md);
    --blk-body-size: var(--d-t-sm);
  }

  /* EL RECORTE DE VERSALITAS. Seis de las siete dejan de escribirlas: los seis
     encabezados de sección pasan a caja normal, y las siete palabras de estado
     pasan a leerse como la píldora que ya son. B se las queda enteras, porque
     su forma declarada dice literalmente que las etiquetas van fuera del marco
     y en versalitas: ahí la versalita no es adorno, es el idioma del plano. */
  :global([data-d='A']) .page, :global([data-d='C']) .page, :global([data-d='I']) .page,
  :global([data-d='M']) .page, :global([data-d='O']) .page, :global([data-d='T']) .page {
    --cap-case: none; --cap-track: 0;
    --cap-size: var(--d-t-sm); --cap-weight: var(--d-w-semi); --cap-color: var(--d-ink);
    --kind-case: none; --kind-track: 0;
    --kind-size: var(--d-t-xs); --kind-weight: var(--d-w-semi);
  }

  /* ======================================================================
     A · ELEVACIÓN. Tarjetas redondeadas que flotan, separadas por aire.

     Lo que cambió: la elevación pasa a decir algo. Antes los seis bloques
     usaban la sombra larga y flotaban todos igual, así que la altura no
     informaba nada. Ahora lo que se queda en pantalla se apoya con la sombra
     corta y solo lo pasajero o lo que bloquea, el toast y el diálogo, flota
     con la larga. También se fue el canto apilado falso del toast: sugería
     una pila de avisos que no existe, y un recurso de forma que no codifica
     nada del contenido es decoración.
     ====================================================================== */
  :global([data-d='A']) .blk {
    --blk-bg: var(--d-surface);
    border-color: var(--d-line); border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow); padding: var(--d-p3);
  }
  /* La palabra de estado ES la píldora de la sección 1: banda de tono, canto
     de tono, marca y palabra. El anillo la despega del papel blanco. */
  :global([data-d='A']) .blk-kind {
    justify-self: start; padding: 3px var(--d-p2) 3px var(--d-p1);
    background: var(--tone-band); border: 1px solid var(--tone-edge);
    border-radius: var(--d-r-pill);
  }
  :global([data-d='A']) .blk--toast { box-shadow: var(--d-shadow-lg); }
  :global([data-d='A']) .scene { border-radius: var(--d-r-lg); box-shadow: var(--d-shadow); }
  :global([data-d='A']) .dlg { border-radius: var(--d-r-lg); box-shadow: var(--d-shadow-lg); }
  /* Lo que carga y lo que procesa también son tarjetas con filas: el esqueleto
     tiene la forma del contenido final, incluido el contenedor que lo sostiene.
     Antes flotaban sueltos sobre el fondo, que es la única parte de la celda
     donde A no era A. */
  :global([data-d='A']) .load, :global([data-d='A']) .proc {
    background: var(--d-surface);
    border: 1px solid var(--d-line); border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow); padding: var(--d-p2) var(--d-p3) var(--d-p3);
  }
  :global([data-d='A']) .skel-row + .skel-row { border-top: 1px solid var(--d-line); }

  /* ======================================================================
     B · INSTRUMENTO. Un solo marco continuo; los avisos comparten borde y la
     palabra de estado cabalga sobre la línea, como la leyenda de un plano.

     Lo que cambió, y es lo que más pedía esta dirección: densidad de cabina.
     La celda tenía aire de tarjeta con ropa de plano. Ahora el bloque respira
     lo que respira un instrumento, la fila del esqueleto va a la altura de
     fila real de la dirección (30px), y las cifras se escriben en
     monoespaciada, porque un plano no anota un número con la misma letra con
     la que escribe una palabra. La barra de proceso deja de ser una barra
     rellena y pasa a ser una escala graduada cada 10 %: la parte llena tapa
     las marcas que ya pasó, que es lo que hace una aguja sobre una regla.
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
    padding: var(--d-p2) var(--d-p3) var(--d-p2);
    border-bottom: 1px solid var(--d-line);
    row-gap: var(--d-p2);
  }
  :global([data-d='B']) .sec:last-child { border-bottom: 0; }
  :global([data-d='B']) .sec-body { gap: 0; }
  :global([data-d='B']) .blk {
    --blk-bg: var(--d-surface);
    border-color: var(--d-edge); padding: var(--d-p3) var(--d-p2) var(--d-p2);
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
  /* Las cifras, en monoespaciada. Las píldoras de esta página llevan la
     lectura pegada a la palabra («Vencido · hace 12 d»), así que la píldora
     entera va en mono: partirla en dos letras dentro de la misma pastilla se
     ve peor que anotarla como la anota un plano. */
  :global([data-d='B']) .d-pill,
  :global([data-d='B']) .load-cap,
  :global([data-d='B']) .proc-meta { font-family: var(--d-mono); }
  :global([data-d='B']) .skel-b { background: transparent; border: 1px solid var(--d-line); }
  /* La fila que carga tiene la altura de fila de la dirección y su misma
     línea de base: es el hueco exacto que va a ocupar el equipo que falta. */
  :global([data-d='B']) .skel-row {
    min-height: var(--d-row-h); border-bottom: 1px solid var(--d-line);
  }
  :global([data-d='B']) .proc-track { background: transparent; border: 1px solid var(--d-edge); }
  /* La escala graduada: una marca cada 10 %. */
  :global([data-d='B']) .proc-track::after {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background: repeating-linear-gradient(90deg, var(--d-edge) 0 1px, transparent 1px 10%);
  }
  /* Una espera indeterminada no tiene escala: no se sabe dónde está. */
  :global([data-d='B']) .proc-track--wait::after { content: none; }
  :global([data-d='B']) .proc-fill { background: var(--d-ink); position: relative; z-index: 1; }
  :global([data-d='B']) .veil {
    background:
      repeating-linear-gradient(45deg, transparent 0 4px, color-mix(in srgb, var(--d-ink) 16%, transparent) 4px 5px),
      color-mix(in srgb, var(--d-surface) 62%, transparent);
  }
  :global([data-d='B']) .dlg { outline: 1px solid var(--d-edge); outline-offset: 3px; }

  /* ======================================================================
     C · MARCA. El bloque se anuncia por su cabecera llena de color, no por su
     borde: la palabra de estado ES la barra que corona el aviso.

     Dos cosas cambiaron. La primera es el radio: el aviso usaba el chico (4px)
     mientras los paneles de la dirección usan el grande (10px), así que una
     cabecera de color quedaba con esquinas distintas a las del panel de al
     lado. Ahora los contenedores usan --d-r-lg y los controles --d-r, que es
     la escala de dos pasos que la dirección declara y nada más.

     La segunda es que lo que carga y lo que procesa eran los dos únicos
     bloques de la celda sin identidad de dirección: papel suelto sobre el
     fondo. Ahora también se anuncian por cabecera, y de paso el rótulo dice
     qué se está cargando ANTES de mostrar su forma.
     ====================================================================== */
  :global([data-d='C']) .blk {
    --blk-bg: var(--d-surface);
    border-color: var(--d-line); border-radius: var(--d-r-lg);
    padding: 0; row-gap: var(--d-p1); overflow: hidden;
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
  :global([data-d='C']) .scene { border-radius: var(--d-r-lg); }
  :global([data-d='C']) .veil { background: color-mix(in srgb, var(--d-brand-deep) 46%, transparent); }
  :global([data-d='C']) .dlg { border-radius: var(--d-r-lg); box-shadow: var(--d-shadow-lg); }
  :global([data-d='C']) .proc-fill { background: var(--d-brand); }
  /* Lo que carga y lo que procesa, con la misma cabecera que todo lo demás. */
  :global([data-d='C']) .load, :global([data-d='C']) .proc {
    background: var(--d-surface); border: 1px solid var(--d-line);
    border-radius: var(--d-r-lg); box-shadow: var(--d-shadow);
    overflow: hidden; row-gap: 0; padding-bottom: var(--d-p2);
  }
  :global([data-d='C']) .load-cap, :global([data-d='C']) .proc-lbl {
    background: var(--d-brand); color: var(--d-brand-ink);
    padding: var(--d-p1) var(--d-p3);
    font-size: var(--d-t-xs); font-weight: var(--d-w-semi);
  }
  :global([data-d='C']) .skel { padding-inline: var(--d-p3); }
  :global([data-d='C']) .skel-row + .skel-row { border-top: 1px solid var(--d-line); }
  :global([data-d='C']) .proc .proc-track { margin: var(--d-p3) var(--d-p3) var(--d-p1); }
  :global([data-d='C']) .proc-meta { margin-inline: var(--d-p3); }
  /* La barra de espera vive DENTRO del aviso de sin conexión, no en la tarjeta
     de proceso: en C el cuerpo del aviso va sangrado y ella se quedaba pegada
     al canto, desalineada con el texto que la explica. */
  :global([data-d='C']) .blk .proc-track { margin-inline: var(--d-p3); }

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
     I · CRISTAL. El aviso es una lámina de vidrio sobre el campo teñido y el
     velo del diálogo es vidrio DE VERDAD: desenfoca la flota que queda debajo
     en vez de pintarle un gris encima.

     La regla que ordena la celda: vidrio sobre vidrio se enturbia. Solo dos
     capas desenfocan acá, la lámina y el velo. Lo que va ENCIMA del velo (el
     diálogo, el chip de estado) se anida con TRANSPARENCIA, nunca con más
     desenfoque.

     Lo que cambió: lo que carga y lo que procesa eran los únicos bloques de
     la celda apoyados directamente sobre el campo de manchas, o sea texto sin
     lámina en la dirección cuya tesis es que todo es lámina. Y el radio: el
     esqueleto y la barra usaban radio de píldora mientras la dirección corre
     en 14 y 24, así que ahora hay una sola escala.
     ====================================================================== */
  :global([data-d='I']) .blk {
    --blk-bg: var(--d-surface);
    backdrop-filter: blur(18px) saturate(1.5);
    -webkit-backdrop-filter: blur(18px) saturate(1.5);
    border-color: var(--d-line); border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow); padding: var(--d-p3);
  }
  /* El filo especular. Va en z-index -1: por encima del vidrio y por DEBAJO
     del texto, porque pintado encima le come el contraste al titular. */
  :global([data-d='I']) .blk::after {
    content: ''; position: absolute; inset: 0; z-index: -1;
    border-radius: inherit; pointer-events: none;
    background: radial-gradient(130% 74% at 14% -32%,
                color-mix(in srgb, var(--d-line) 72%, transparent) 0%, transparent 62%);
  }
  /* El tono se anida con transparencia: banda translúcida y un filo de luz,
     sin un segundo backdrop-filter. */
  :global([data-d='I']) .blk-kind {
    justify-self: start; padding: 3px var(--d-p2) 3px var(--d-p1);
    background: var(--tone-band); border: 1px solid var(--tone-edge);
    border-radius: var(--d-r-pill);
  }
  :global([data-d='I']) .blk--toast { --blk-bg: var(--d-sunk); box-shadow: var(--d-shadow-lg); }
  :global([data-d='I']) .scene {
    background: var(--d-surface);
    backdrop-filter: blur(18px) saturate(1.5);
    -webkit-backdrop-filter: blur(18px) saturate(1.5);
    border-color: var(--d-line); border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='I']) .veil {
    background: color-mix(in srgb, var(--d-line) 58%, transparent);
    backdrop-filter: blur(14px) saturate(1.3);
    -webkit-backdrop-filter: blur(14px) saturate(1.3);
  }
  /* Sobre el velo NO va otro desenfoque. El diálogo condensa el mismo vidrio
     pintándolo dos veces, 1−(1−a)², que es más opaco sin inventar un color
     que no está en el bloque de tokens. */
  :global([data-d='I']) .dlg {
    --blk-bg: linear-gradient(var(--d-surface), var(--d-surface)),
              linear-gradient(var(--d-surface), var(--d-surface));
    backdrop-filter: none; -webkit-backdrop-filter: none;
    border-radius: var(--d-r-lg); box-shadow: var(--d-shadow-lg); padding: var(--d-p4);
  }
  /* Lo que carga y lo que procesa también son láminas. Es la única capa que
     falta para que en esta celda no haya un solo texto apoyado sobre el campo
     de manchas sin vidrio debajo. */
  :global([data-d='I']) .load, :global([data-d='I']) .proc {
    background: var(--d-surface);
    backdrop-filter: blur(18px) saturate(1.5);
    -webkit-backdrop-filter: blur(18px) saturate(1.5);
    border: 1px solid var(--d-line); border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow); padding: var(--d-p2) var(--d-p3) var(--d-p3);
  }
  :global([data-d='I']) .skel-b {
    background: color-mix(in srgb, var(--d-line) 58%, transparent);
  }
  :global([data-d='I']) .proc-track {
    background: var(--d-sunk);
    box-shadow: inset 0 1px 3px color-mix(in srgb, var(--d-ink) 14%, transparent);
  }
  :global([data-d='I']) .proc-fill {
    box-shadow: 0 0 var(--d-p2) calc(-1 * var(--d-p1)) var(--d-accent);
  }
  /* HALLAZGO de contraste, el mismo que ya está escrito en Acciones, Tablas y
     Formularios: en directions.css `[data-d='I'] .d-btn` pesa (0,2,0) y
     `.d-btn--primary` pesa (0,1,0), así que el vidrio blanco le gana el fondo
     al primario y queda tinta blanca sobre blanco, 1.02:1, invisible. El
     arreglo de raíz va en directions.css; mientras tanto esta página lo repone. */
  :global([data-d='I']) .d-btn--primary {
    background: var(--d-accent);
    color: var(--d-accent-ink);
  }
  /* Y el destructivo se lo comía la misma regla: quedaba un botón de vidrio
     blanco indistinguible de «Cancelar» justo al lado. Vuelve su banda. */
  :global([data-d='I']) .d-btn--danger {
    background: var(--d-crit-band);
    color: var(--d-crit);
    border-color: var(--d-crit-edge);
  }

  /* ======================================================================
     J · LACA — ninguna superficie es color plano: el aviso es una placa de
     esmalte con degradado vertical, realce duro arriba y sombra profunda
     abajo. El barrido de brillo vive en el tercio superior.
     ====================================================================== */
  :global([data-d='J']) .blk {
    --blk-bg: linear-gradient(180deg,
              color-mix(in srgb, var(--d-surface) 62%, var(--tone-band)) 0%,
              var(--tone-band) 100%);
    isolation: isolate;
    border-color: var(--tone-edge); border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow); padding: var(--d-p3);
    transition: box-shadow 110ms ease;
  }
  /* El barrido: pointer-events none para no taparle el clic a nada, y
     z-index -1 para caer entre el esmalte y el texto. Encima del texto sería
     un velo blanco sobre el titular, que es lo único que hay que poder leer. */
  :global([data-d='J']) .blk::after {
    content: ''; position: absolute; inset: 0 0 auto 0; height: 38%;
    z-index: -1; pointer-events: none;
    border-radius: var(--d-r-lg) var(--d-r-lg) 40% 40% / var(--d-r-lg) var(--d-r-lg) 100% 100%;
    background: linear-gradient(180deg,
                color-mix(in srgb, var(--d-surface) 74%, transparent), transparent);
    transition: opacity 110ms ease;
  }
  /* La palabra de estado es una ficha de esmalte levantada, no una etiqueta. */
  :global([data-d='J']) .blk-kind {
    justify-self: start; padding: var(--d-p1) var(--d-p2);
    border-radius: var(--d-r-pill);
    background: linear-gradient(180deg,
                color-mix(in srgb, var(--d-surface) 70%, var(--tone-band)), var(--tone-band));
    box-shadow: 0 2px 5px -2px color-mix(in srgb, var(--d-ink) 34%, transparent),
                inset 0 1px 0 color-mix(in srgb, var(--d-surface) 92%, transparent);
  }
  /* Al presionar, el brillo se apaga y la placa se hunde. */
  :global([data-d='J']) .blk:has(.d-btn:active) {
    box-shadow: inset 0 2px 6px color-mix(in srgb, var(--d-ink) 28%, transparent);
  }
  :global([data-d='J']) .blk:has(.d-btn:active)::after { opacity: .3; }
  :global([data-d='J']) .blk--toast { --blk-bg: var(--d-surface-fill); box-shadow: var(--d-shadow-lg); }
  :global([data-d='J']) .scene {
    background: var(--d-sunk-fill); border-color: var(--d-edge);
    border-radius: var(--d-r-lg); box-shadow: var(--d-shadow);
  }
  :global([data-d='J']) .veil {
    background: linear-gradient(180deg,
                color-mix(in srgb, var(--d-ink) 28%, transparent),
                color-mix(in srgb, var(--d-ink) 56%, transparent));
  }
  :global([data-d='J']) .dlg {
    --blk-bg: var(--d-surface-fill);
    border-color: var(--d-edge); border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow-lg); padding: var(--d-p3) var(--d-p4) var(--d-p4);
  }
  :global([data-d='J']) .skel-b {
    background: var(--d-sunk-fill); border-radius: var(--d-r-pill); height: .95em;
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--d-surface) 90%, transparent);
  }
  :global([data-d='J']) .proc-track {
    height: var(--d-p2); background: var(--d-sunk-fill); border-radius: var(--d-r-pill);
    box-shadow: inset 0 2px 4px color-mix(in srgb, var(--d-ink) 24%, transparent);
  }
  :global([data-d='J']) .proc-fill {
    background: var(--d-accent-fill);
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--d-surface) 76%, transparent);
  }
  :global([data-d='J']) .d-pill {
    background: linear-gradient(180deg,
                color-mix(in srgb, var(--d-surface) 52%, var(--tone-band)), var(--tone-band));
  }

  /* ======================================================================
     K · HALO — cero bordes y cero rellenos sólidos. El aviso existe porque
     IRRADIA: anillo de 1px en su propio tono más un resplandor difuso. La
     alerta crítica es la que más luz tira de toda la celda.
     ====================================================================== */
  :global([data-d='K']) .blk {
    --blk-bg: var(--tone-band);
    border: 0; border-radius: var(--d-r-lg); padding: var(--d-p3);
    box-shadow: 0 0 0 1px var(--tone-edge),
                0 var(--d-p2) calc(var(--d-p4) * 2) calc(-1 * var(--d-p2)) var(--tone-fg);
  }
  /* La crítica no comparte intensidad con las demás: irradia hacia afuera y
     se enciende por dentro. El estado es el color del resplandor. */
  :global([data-d='K']) .blk[data-tone='critical'] {
    box-shadow: inset 0 0 var(--d-p4) calc(-1 * var(--d-p2)) var(--tone-fg),
                0 0 0 1px var(--tone-edge),
                0 var(--d-p2) calc(var(--d-p4) * 3) calc(-1 * var(--d-p3)) var(--tone-fg);
  }
  :global([data-d='K']) .blk-kind {
    color: var(--tone-fg);
    text-shadow: 0 0 var(--d-p2) color-mix(in srgb, var(--tone-fg) 55%, transparent);
  }
  :global([data-d='K']) .blk-title {
    text-shadow: 0 0 var(--d-p3) color-mix(in srgb, var(--d-ink) 24%, transparent);
  }
  :global([data-d='K']) .sec-cap {
    color: var(--d-accent);
    text-shadow: 0 0 var(--d-p2) color-mix(in srgb, var(--d-accent) 42%, transparent);
  }
  :global([data-d='K']) .scene {
    background: var(--d-sunk); border: 0; border-radius: var(--d-r-lg);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--d-ink) 10%, transparent);
  }
  /* El velo no es un gris: es la oscuridad, y el diálogo la enciende de rojo
     desde adentro. */
  :global([data-d='K']) .veil {
    background:
      radial-gradient(88% 70% at 50% 50%,
        color-mix(in srgb, var(--d-crit) 18%, transparent) 0%, transparent 72%),
      color-mix(in srgb, var(--d-ink-on) 80%, transparent);
  }
  :global([data-d='K']) .dlg {
    --blk-bg: var(--d-surface); padding: var(--d-p4);
    box-shadow: 0 0 0 1px var(--tone-edge),
                0 var(--d-p3) calc(var(--d-p4) * 3) calc(-1 * var(--d-p2)) var(--tone-fg);
  }
  :global([data-d='K']) .skel-b {
    background: color-mix(in srgb, var(--d-ink) 7%, transparent);
    border-radius: var(--d-r-pill);
    box-shadow: 0 0 var(--d-p3) calc(-1 * var(--d-p1)) var(--d-accent);
  }
  :global([data-d='K']) .proc-track {
    background: color-mix(in srgb, var(--d-ink) 7%, transparent);
    border-radius: var(--d-r-pill);
  }
  :global([data-d='K']) .proc-fill {
    border-radius: var(--d-r-pill);
    box-shadow: 0 0 var(--d-p3) calc(var(--d-p1) * -.5) var(--d-accent);
  }

  /* ======================================================================
     L · GUIJARRO — cuatro radios distintos por contenedor y distintos entre
     vecinos. Si los cinco avisos comparten los mismos cuatro, vuelven a ser
     tarjetas.

     HALLAZGO: el bloque de tokens de L solo trae DOS juegos de radio
     (--d-r y --d-r-lg). La silueta pide una permutación por pieza, así que
     las variantes salen de rotar la escala de espaciado —p1/p2/p3/p4, cuatro
     valores distintos— en lugar de inventar píxeles. Lo que falta en
     directions.css es algo como --d-r-alt-1 / -2 / -3.
     ====================================================================== */
  :global([data-d='L']) .blk {
    --blk-bg: var(--d-surface);
    border: 0; padding: var(--d-p3);
    border-radius: var(--d-p4) var(--d-p2) var(--d-p3) var(--d-p1);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='L']) .blk + .blk { border-radius: var(--d-p2) var(--d-p4) var(--d-p1) var(--d-p3); }
  :global([data-d='L']) .blk--toast { border-radius: var(--d-p3) var(--d-p1) var(--d-p4) var(--d-p2); }
  :global([data-d='L']) .blk-kind {
    justify-self: start;
    padding: calc(var(--d-p1) * .5) var(--d-p2);
    background: var(--tone-band);
    border-radius: var(--d-p2) var(--d-p1) var(--d-p3) var(--d-p1);
    box-shadow: 2px 3px 7px -3px color-mix(in srgb, var(--d-ink) 32%, transparent);
  }
  /* Cinco guijarros en fila, ninguno con la forma del de al lado. */
  :global([data-d='L']) .pillrow > .d-pill { border-radius: var(--d-p3) var(--d-p1) var(--d-p2) var(--d-p1); }
  :global([data-d='L']) .pillrow > .d-pill:nth-child(2) { border-radius: var(--d-p1) var(--d-p3) var(--d-p1) var(--d-p2); }
  :global([data-d='L']) .pillrow > .d-pill:nth-child(3) { border-radius: var(--d-p2) var(--d-p2) var(--d-p3) var(--d-p1); }
  :global([data-d='L']) .pillrow > .d-pill:nth-child(4) { border-radius: var(--d-p3) var(--d-p2) var(--d-p1) var(--d-p3); }
  :global([data-d='L']) .pillrow > .d-pill:nth-child(5) { border-radius: var(--d-p1) var(--d-p2) var(--d-p2) var(--d-p3); }
  :global([data-d='L']) .scene {
    border: 0; background: var(--d-sunk);
    border-radius: var(--d-p4) var(--d-p3) var(--d-p2) var(--d-p4);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='L']) .veil { background: color-mix(in srgb, var(--d-ink) 34%, transparent); }
  :global([data-d='L']) .dlg {
    --blk-bg: var(--d-surface);
    border-radius: var(--d-p3) var(--d-p4) var(--d-p2) var(--d-p4);
    box-shadow: var(--d-shadow-lg); padding: var(--d-p3) var(--d-p4) var(--d-p4);
  }
  :global([data-d='L']) .skel-b { height: 1em; border-radius: var(--d-p2) var(--d-p1) var(--d-p2) var(--d-p1); }
  :global([data-d='L']) .skel-row:nth-child(2) .skel-b { border-radius: var(--d-p1) var(--d-p2) var(--d-p1) var(--d-p2); }
  :global([data-d='L']) .skel-row:nth-child(3) .skel-b { border-radius: var(--d-p2) var(--d-p2) var(--d-p1) var(--d-p1); }
  :global([data-d='L']) .proc-track {
    height: var(--d-p1); background: var(--d-sunk); border-radius: var(--d-r-pill);
    box-shadow: inset 3px 4px 9px -5px color-mix(in srgb, var(--d-ink) 34%, transparent);
  }
  :global([data-d='L']) .proc-fill { border-radius: var(--d-r-pill); }

  /* ======================================================================
     M · BRUMA. Sin contenedores. Ningún aviso tiene relleno ni borde: lo que
     agrupa es una mancha de color desenfocada que se derrama por detrás y se
     desvanece sin filo. Los titulares van en serif.

     Lo que cambió, y era el agujero de esta celda: la mancha usaba --tone-band,
     que es el token pensado para una píldora chica y sin desenfoque. A 26px de
     blur no se veía nada, así que la única señal de agrupación que tiene la
     dirección estaba apagada y los seis avisos se leían como un solo texto
     corrido. directions.css ya trae los tokens correctos, --*-wash, con más
     saturación justamente porque van desenfocados. Ahora la página los usa.

     El encabezado de sección también pasa a serif: un titular es un titular, y
     esta es la única dirección con dos familias, así que la versalita sobraba
     dos veces.
     ====================================================================== */
  :global([data-d='M']) .page {
    --cap-size: var(--d-t-md); --cap-weight: var(--d-w); --cap-color: var(--d-ink-3);
  }
  :global([data-d='M']) .sec-cap { font-family: var(--d-display); }
  :global([data-d='M']) .blk {
    --blk-bg: none;
    isolation: isolate;
    border: 0; box-shadow: none; padding: var(--d-p2) 0;
  }
  /* Dos manchas descentradas y desenfocadas, en z-index -1: se derraman fuera
     del bloque, que es justamente lo que un contenedor no puede hacer. */
  :global([data-d='M']) .blk::before {
    content: ''; position: absolute; z-index: -1; pointer-events: none;
    inset: calc(-1 * var(--d-p3)) calc(-1 * var(--d-p4));
    background:
      radial-gradient(62% 70% at 18% 14%, var(--tone-wash, var(--tone-band)) 0%, transparent 70%),
      radial-gradient(52% 58% at 88% 86%, var(--tone-wash, var(--tone-band)) 0%, transparent 68%);
    filter: blur(26px);
  }
  :global([data-d='M']) .blk-title,
  :global([data-d='M']) .proc-lbl {
    font-family: var(--d-display);
    font-size: var(--d-t-lg); font-weight: 400; letter-spacing: -.01em; line-height: 1.24;
  }
  :global([data-d='M']) .blk--toast .blk-title { font-size: var(--d-t-md); }
  :global([data-d='M']) .blk-kind { color: var(--tone-fg); }
  :global([data-d='M']) .sec-body { gap: var(--d-p4); }
  :global([data-d='M']) .scene { background: none; border: 0; border-radius: 0; }
  /* El velo tampoco es una caja: es niebla que se cierra hacia el centro. */
  :global([data-d='M']) .veil {
    background: radial-gradient(120% 92% at 50% 46%,
                color-mix(in srgb, var(--d-ground) 94%, transparent) 34%,
                color-mix(in srgb, var(--d-ground) 42%, transparent) 100%);
    backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
  }
  /* El diálogo se lee sobre papel opaco en el centro, pero su borde se
     disuelve: es legible sin volverse un rectángulo. */
  :global([data-d='M']) .dlg {
    /* El papel llega opaco hasta el 74 %: la fila de acciones vive abajo y
       tiene que leerse sobre algo, aunque el filo siga disolviéndose. */
    --blk-bg: radial-gradient(96% 104% at 50% 46%, var(--d-ground) 0 74%, transparent 100%);
    border: 0; box-shadow: none; padding: var(--d-p4); margin: var(--d-p3);
  }
  :global([data-d='M']) .dlg::before { inset: calc(-1 * var(--d-p4)); filter: blur(30px); }
  /* Lo que carga se derrama igual que todo lo demás: bordes difusos, no
     rectángulos grises. La forma de la fila se conserva; lo que falta es el
     filo, que es exactamente lo que falta cuando el dato todavía no llegó. */
  :global([data-d='M']) .skel-b {
    height: .9em; background: var(--d-neu-band); filter: blur(3px);
  }
  :global([data-d='M']) .proc-track { height: var(--d-p1); background: var(--d-sunk); }
  :global([data-d='M']) .proc-fill {
    background: linear-gradient(90deg, transparent, var(--d-accent));
  }
  /* Misma trampa que en I: `[data-d='M'] .d-btn { background: var(--d-sunk) }`
     tapa a `.d-btn--primary`, y el primario queda papel sobre papel, 1.08:1. */
  :global([data-d='M']) .d-btn--primary {
    background: var(--d-accent);
    color: var(--d-accent-ink);
  }
  /* Y al destructivo le pasaba lo mismo: quedaba igual que «Cancelar» salvo
     por la tinta. Vuelve su banda, que acá además es la única mancha con filo
     de toda la dirección y por eso pesa. */
  :global([data-d='M']) .d-btn--danger {
    background: var(--d-crit-band);
    color: var(--d-crit);
  }

  /* ======================================================================
     N · CINTA — los avisos no se separan: se MONTAN. Cada uno es un carril
     con degradado a lo largo, una cápsula de punta redonda con el color del
     estado metida adentro, y el de abajo sube sobre el de arriba dejándole
     una sombra de contacto. Hay orden de apilado, no solo aire.
     ====================================================================== */
  :global([data-d='N']) .sec-body { gap: 0; }
  :global([data-d='N']) .blk {
    --blk-bg: linear-gradient(100deg, var(--tone-band) 0%, var(--d-surface) 58%, var(--d-sunk) 100%);
    border-color: var(--d-line); border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    padding: var(--d-p2) var(--d-p3) var(--d-p2) calc(var(--d-p3) + var(--d-p2));
  }
  :global([data-d='N']) .blk + .blk {
    margin-top: calc(-1 * var(--d-p2)); z-index: 1;
    box-shadow: var(--d-shadow-lg);
  }
  /* La cápsula: puntas redondas de verdad, dentro del carril. No es un borde
     de 3px como en Banda ni una espina cuadrada como en Espina. */
  :global([data-d='N']) .blk::before {
    content: ''; position: absolute;
    left: var(--d-p2); top: var(--d-p2); bottom: var(--d-p2); width: var(--d-p1);
    border-radius: var(--d-r-pill);
    background: linear-gradient(180deg, var(--tone-fg) 0%,
                color-mix(in srgb, var(--tone-fg) 42%, transparent) 100%);
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--d-surface) 80%, transparent);
  }
  :global([data-d='N']) .blk-kind {
    justify-self: start; padding: calc(var(--d-p1) * .4) var(--d-p2);
    border-radius: var(--d-r-pill);
    background: linear-gradient(100deg, var(--tone-band) 0%, var(--d-surface) 100%);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='N']) .blk--toast { --blk-bg: var(--d-surface-fill); }
  :global([data-d='N']) .scene {
    border: 0; border-radius: var(--d-r-lg);
    background: var(--d-sunk-fill); box-shadow: var(--d-shadow);
    padding: var(--d-p1);
  }
  :global([data-d='N']) .veil {
    border-radius: var(--d-r-lg);
    background: linear-gradient(100deg,
                color-mix(in srgb, var(--d-ink) 46%, transparent),
                color-mix(in srgb, var(--d-ink) 28%, transparent));
  }
  :global([data-d='N']) .dlg {
    --blk-bg: var(--d-surface-fill);
    border-radius: var(--d-r-lg); box-shadow: var(--d-shadow-lg);
    padding: var(--d-p3) var(--d-p3) var(--d-p3) calc(var(--d-p3) + var(--d-p2));
  }
  /* Lo que carga también son carriles, montados igual que los avisos. */
  :global([data-d='N']) .skel-row {
    border-radius: var(--d-r-pill); background: var(--d-surface-fill);
    box-shadow: var(--d-shadow); margin-bottom: calc(var(--d-p1) * .5);
    padding-inline: var(--d-p3);
  }
  :global([data-d='N']) .skel-b { border-radius: var(--d-r-pill); background: var(--d-sunk-fill); }
  :global([data-d='N']) .proc-track {
    height: var(--d-p2); border-radius: var(--d-r-pill); background: var(--d-sunk-fill);
    box-shadow: inset 0 2px 4px color-mix(in srgb, var(--d-ink) 14%, transparent);
  }
  :global([data-d='N']) .proc-fill {
    border-radius: var(--d-r-pill); background: var(--d-accent-fill);
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--d-surface) 68%, transparent);
  }

  /* ======================================================================
     O · PRISMA. Vidrio con la marca teñida ADENTRO. La palabra de estado no
     es una barra opaca que parte la tarjeta (eso es Marca): es una FACETA que
     sale del canto izquierdo y termina en punta redonda, teñida de marca y de
     tono a la vez. Y la botonera es vidrio SEGMENTADO: una sola lámina con
     divisiones, no tres botones sueltos.

     Lo que cambió: el diálogo era el único vidrio de la celda SIN marca
     adentro. Se condensaba a blanco puro para poder leerse sobre el velo, y
     con eso perdía justo la tesis de la dirección en el momento en que más se
     mira. Ahora la capa de marca va encima de las dos de superficie: sigue
     siendo opaco donde tiene que serlo y vuelve a estar teñido. Y lo que carga
     y lo que procesa también son láminas, como en Cristal.
     ====================================================================== */
  :global([data-d='O']) .page { --cap-color: var(--d-brand); }
  :global([data-d='O']) .blk {
    --blk-bg: linear-gradient(180deg,
              color-mix(in srgb, var(--d-brand) 15%, transparent) 0%, transparent 62%),
              var(--d-surface);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    border-color: var(--d-line); border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow); padding: var(--d-p3); overflow: hidden;
  }
  :global([data-d='O']) .blk-kind {
    justify-self: start;
    margin-left: calc(-1 * var(--d-p3));
    padding: var(--d-p1) var(--d-p3);
    border-radius: 0 var(--d-r-pill) var(--d-r-pill) 0;
    background: linear-gradient(90deg,
                color-mix(in srgb, var(--d-brand) 28%, transparent), var(--tone-band));
    border-block: 1px solid var(--d-line);
    border-right: 1px solid var(--tone-edge);
    color: var(--tone-fg);
  }
  /* Vidrio segmentado. Sin overflow:hidden: el anillo de foco de cada
     segmento tiene que poder salirse del grupo. */
  :global([data-d='O']) .blk-acts {
    justify-self: start; gap: 0;
    background: var(--d-surface);
    border: 1px solid var(--d-line); border-radius: var(--d-r);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='O']) .blk-acts > .d-btn {
    background: transparent; border: 0; border-radius: 0; box-shadow: none;
    backdrop-filter: none; -webkit-backdrop-filter: none;
  }
  :global([data-d='O']) .blk-acts > .d-btn + .d-btn { border-left: 1px solid var(--d-line); }
  :global([data-d='O']) .blk-acts > .d-btn:first-child {
    border-start-start-radius: var(--d-r); border-end-start-radius: var(--d-r);
  }
  :global([data-d='O']) .blk-acts > .d-btn:last-child {
    border-start-end-radius: var(--d-r); border-end-end-radius: var(--d-r);
  }
  :global([data-d='O']) .blk-acts > .d-btn:hover {
    background: color-mix(in srgb, var(--d-brand) 12%, transparent);
  }
  /* Un segmento sigue diciendo lo que es: el primario se llena de marca y el
     destructivo de su banda, dentro de la misma lámina. El hover se re-declara
     en los dos porque el genérico de arriba les gana por especificidad y les
     lavaría el relleno justo cuando el puntero está encima. */
  :global([data-d='O']) .blk-acts > .d-btn--primary,
  :global([data-d='O']) .blk-acts > .d-btn--primary:hover {
    background: var(--d-accent); color: var(--d-accent-ink);
  }
  :global([data-d='O']) .blk-acts > .d-btn--danger,
  :global([data-d='O']) .blk-acts > .d-btn--danger:hover {
    background: var(--d-crit-band); color: var(--d-crit);
  }
  /* El destructivo responde con un anillo, no con otro color: dentro de una
     lámina segmentada un cambio de tinte se lee como cambio de estado. */
  :global([data-d='O']) .blk-acts > .d-btn--danger:hover { box-shadow: inset 0 0 0 1px var(--d-crit-edge); }
  :global([data-d='O']) .dlg-acts { justify-self: end; padding-top: 0; margin-top: var(--d-p1); }
  :global([data-d='O']) .scene {
    background: var(--d-surface);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    border-color: var(--d-line); border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
  }
  /* El velo es vidrio de verdad, teñido de marca: desenfoca la flota. */
  :global([data-d='O']) .veil {
    background: color-mix(in srgb, var(--d-brand) 20%, transparent);
    backdrop-filter: blur(14px) saturate(1.4);
    -webkit-backdrop-filter: blur(14px) saturate(1.4);
  }
  /* Encima del velo no va otro desenfoque: el diálogo condensa el mismo vidrio
     pintándolo dos veces, y la marca va como capa de arriba para que el vidrio
     siga teñido en vez de blanquearse justo cuando bloquea la pantalla. */
  :global([data-d='O']) .dlg {
    --blk-bg: linear-gradient(180deg,
                color-mix(in srgb, var(--d-brand) 15%, transparent) 0%, transparent 58%),
              linear-gradient(var(--d-surface), var(--d-surface)),
              linear-gradient(var(--d-surface), var(--d-surface));
    backdrop-filter: none; -webkit-backdrop-filter: none;
    border-radius: var(--d-r-lg); box-shadow: var(--d-shadow-lg);
  }
  :global([data-d='O']) .load, :global([data-d='O']) .proc {
    background: var(--d-surface);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    border: 1px solid var(--d-line); border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow); padding: var(--d-p2) var(--d-p3) var(--d-p3);
  }
  :global([data-d='O']) .skel-b {
    background: color-mix(in srgb, var(--d-line) 62%, transparent);
  }
  :global([data-d='O']) .proc-track {
    background: var(--d-sunk);
    box-shadow: inset 0 1px 3px color-mix(in srgb, var(--d-ink) 12%, transparent);
  }

  /* ======================================================================
     P · ESPINA — UNA columna de marca que baja por toda la celda y de la que
     cuelga todo. Ninguna caja. El estado no pinta fondos: le MUERDE una
     muesca de su tono a la espina.
     ====================================================================== */
  :global([data-d='P']) .page {
    padding-left: calc(var(--d-p1) + var(--d-p3));
    /* La medida que decide el raíl se toma de acá, no del viewport. */
    container-type: inline-size;
  }
  :global([data-d='P']) .page::before {
    content: ''; position: absolute; inset: 0 auto 0 0;
    width: var(--d-p1); background: var(--d-brand);
  }
  :global([data-d='P']) .sec {
    row-gap: var(--d-p1); padding-block: var(--d-p2);
    border-top: 1px solid var(--d-line);
  }
  :global([data-d='P']) .sec:first-child { border-top: 0; }
  :global([data-d='P']) .sec-body { gap: var(--d-p2); }
  :global([data-d='P']) .blk {
    --blk-bg: transparent;
    border: 0; border-radius: 0; box-shadow: none; padding: var(--d-p2) 0;
  }
  :global([data-d='P']) .blk + .blk { border-top: 1px solid var(--d-line); }
  /* La muesca: cada aviso se come su tramo de espina con su propio tono. */
  :global([data-d='P']) .blk::before {
    content: ''; position: absolute; top: 0; bottom: 0;
    left: calc(-1 * (var(--d-p1) + var(--d-p3)));
    width: var(--d-p1); background: var(--tone-fg);
  }
  :global([data-d='P']) .blk-kind { color: var(--tone-fg); }
  /* Las píldoras cuelgan de una mordida, no de una franja lateral: es lo que
     las separa de las de Banda, que llevan el tono a la izquierda. */
  :global([data-d='P']) .pillrow > .d-pill {
    background: transparent; border: 0; border-radius: 0;
    border-bottom: 2px solid var(--tone-fg);
    padding-inline: 0; padding-bottom: 2px;
  }
  :global([data-d='P']) .scene { border: 0; border-top: 1px solid var(--d-line); border-radius: 0; }
  :global([data-d='P']) .veil { background: color-mix(in srgb, var(--d-brand) 32%, transparent); }
  :global([data-d='P']) .dlg {
    --blk-bg: var(--d-surface);
    margin: 0; padding: var(--d-p3); box-shadow: var(--d-shadow-lg);
    border-left: var(--d-p1) solid var(--tone-fg);
  }
  /* El diálogo cuelga de su propia espina, no de la de la página: la muesca
     de la página quedaría fuera del escenario y recortada. */
  :global([data-d='P']) .dlg::before { content: none; }
  :global([data-d='P']) .dlg-acts { justify-content: flex-start; }
  :global([data-d='P']) .skel-row { border-bottom: 1px solid var(--d-line); }
  :global([data-d='P']) .skel-b { background: var(--d-sunk); border-radius: 0; }
  :global([data-d='P']) .proc-track { background: var(--d-sunk); border-radius: 0; }
  :global([data-d='P']) .proc-fill { background: var(--d-brand); border-radius: 0; }

  /* EL RAÍL DE 152px, DE VUELTA — pero solo donde de verdad hay ancho. La
     consulta va contra .page, no contra el viewport: en esta rejilla una
     celda de 430px convive con una de 900px y una media query no sabe
     distinguirlas, que es exactamente por lo que el raíl se había retirado. */
  @container (min-width: 560px) {
    :global([data-d='P']) .sec {
      grid-template-columns: var(--d-rail) minmax(0, 1fr);
      column-gap: var(--d-p3);
    }
    :global([data-d='P']) .sec-cap { grid-column: 1; grid-row: 1; text-align: right; }
    :global([data-d='P']) .sec-body { grid-column: 2; grid-row: 1; }
    :global([data-d='P']) .blk {
      grid-template-columns: var(--d-rail) minmax(0, 1fr);
      column-gap: var(--d-p3);
    }
    :global([data-d='P']) .blk-kind { grid-column: 1; grid-row: 1; justify-content: flex-end; text-align: right; }
    :global([data-d='P']) .blk-title,
    :global([data-d='P']) .blk-body,
    :global([data-d='P']) .blk-acts,
    :global([data-d='P']) .dlg-check { grid-column: 2; }
    /* El diálogo NO lleva raíl aunque la página sea ancha: vive dentro del
       escenario y con márgenes, y ahí 152px de gutter son media caja. */
    :global([data-d='P']) .dlg { grid-template-columns: minmax(0, 1fr); }
    :global([data-d='P']) .dlg .blk-kind { grid-column: 1; grid-row: auto; justify-content: flex-start; text-align: left; }
    :global([data-d='P']) .dlg .blk-title,
    :global([data-d='P']) .dlg .blk-body,
    :global([data-d='P']) .dlg .blk-acts,
    :global([data-d='P']) .dlg .dlg-check { grid-column: 1; }
  }

  /* ======================================================================
     Q · CHAROL — masa dura con superficie mojada. Borde 2px negro, sombra
     sólida desplazada y el brillo encima. La palabra de estado no es la
     bandera plana de Peso: es una chapa de charol remachada sobre el canto,
     con su propio borde negro y su propia sombra sólida.
     ====================================================================== */
  :global([data-d='Q']) .blk {
    --blk-bg: linear-gradient(180deg,
              color-mix(in srgb, var(--d-surface) 68%, var(--tone-band)) 0%,
              var(--tone-band) 100%);
    isolation: isolate;
    border: var(--d-bw) solid var(--d-ink); border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    padding: var(--d-p3) var(--d-p3) var(--d-p3);
    transition: transform 90ms ease, box-shadow 90ms ease;
  }
  /* El charol: barrido húmedo en el tercio de arriba, dentro del borde duro.
     pointer-events none y z-index -1 — encima del texto sería un velo blanco
     sobre el titular. */
  :global([data-d='Q']) .blk::after {
    content: ''; position: absolute; inset: 0 0 auto 0; height: 34%;
    z-index: -1; pointer-events: none;
    border-radius: calc(var(--d-r-lg) - var(--d-bw)) calc(var(--d-r-lg) - var(--d-bw)) 0 0;
    background: linear-gradient(180deg,
                color-mix(in srgb, var(--d-surface) 66%, transparent), transparent);
    transition: opacity 90ms ease;
  }
  /* Al presionar, la masa se mueve hacia su sombra y el charol se apaga. */
  :global([data-d='Q']) .blk:has(.d-btn:active) {
    transform: translate(3px, 3px);
    box-shadow: inset 0 2px 6px color-mix(in srgb, var(--d-ink) 34%, transparent);
  }
  :global([data-d='Q']) .blk:has(.d-btn:active)::after { opacity: .28; }
  :global([data-d='Q']) .blk-kind {
    justify-self: start;
    margin-top: calc(-1 * var(--d-p2) - var(--d-bw));
    padding: calc(var(--d-p1) * .5) var(--d-p2);
    color: var(--d-ink);
    background: linear-gradient(180deg,
                color-mix(in srgb, var(--d-surface) 55%, var(--tone-band)), var(--tone-band));
    border: var(--d-bw) solid var(--d-ink); border-radius: var(--d-r-pill);
    box-shadow: 3px 3px 0 var(--d-ink),
                inset 0 1px 0 color-mix(in srgb, var(--d-surface) 88%, transparent);
  }
  :global([data-d='Q']) .blk-title { font-size: var(--d-t-md); font-weight: var(--d-w-bold); }
  :global([data-d='Q']) .sec-cap { border-bottom: var(--d-bw) solid var(--d-ink); padding-bottom: 2px; }
  :global([data-d='Q']) .scene {
    background: var(--d-sunk-fill);
    border: var(--d-bw) solid var(--d-ink); border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
  }
  /* Agua negra con un reflejo diagonal encima: el velo también está mojado. */
  :global([data-d='Q']) .veil {
    background:
      linear-gradient(112deg, transparent 34%,
        color-mix(in srgb, var(--d-surface) 26%, transparent) 46%, transparent 58%),
      color-mix(in srgb, var(--d-ink) 52%, transparent);
  }
  :global([data-d='Q']) .dlg {
    --blk-bg: var(--d-surface-fill);
    border-color: var(--d-ink); box-shadow: var(--d-shadow-lg);
  }
  :global([data-d='Q']) .dlg-acts { padding-top: var(--d-p2); }
  :global([data-d='Q']) .skel-b {
    height: 1.1em; background: var(--d-sunk-fill);
    border: var(--d-bw) solid var(--d-ink); border-radius: var(--d-r-pill);
  }
  :global([data-d='Q']) .proc-track {
    height: var(--d-p2); background: var(--d-sunk-fill);
    border: var(--d-bw) solid var(--d-ink); border-radius: var(--d-r-pill);
  }
  :global([data-d='Q']) .proc-fill {
    background: var(--d-accent-fill);
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--d-surface) 68%, transparent);
  }

  /* ======================================================================
     R · VITRINA — densidad de terminal en vidrio oscuro. La más densa de las
     diecinueve: cada aviso es una lámina translúcida con una regleta de
     cabecera a la altura de fila (26px) y una barra de tono mordida en el
     canto. Terminal mete el nivel en una columna a la izquierda; acá el
     nivel es un ESTANTE que cruza la lámina de lado a lado.
     ====================================================================== */
  :global([data-d='R']) .page { gap: var(--d-p3); }
  :global([data-d='R']) .sec-body { gap: var(--d-p1); }
  :global([data-d='R']) .blk {
    --blk-bg: var(--d-surface);
    backdrop-filter: blur(16px) saturate(1.3);
    -webkit-backdrop-filter: blur(16px) saturate(1.3);
    border-color: var(--d-line); border-radius: var(--d-r);
    box-shadow: var(--d-shadow), inset 2px 0 0 var(--tone-fg);
    padding: 0 0 var(--d-p1);
    row-gap: calc(var(--d-p1) * .6);
  }
  :global([data-d='R']) .blk-kind {
    min-height: var(--d-row-h); padding: 0 var(--d-p2);
    background: color-mix(in srgb, var(--tone-fg) 13%, transparent);
    border-bottom: 1px solid var(--d-line);
    color: var(--tone-fg);
  }
  :global([data-d='R']) .blk-title { padding-inline: var(--d-p2); }
  :global([data-d='R']) .blk-body { padding-inline: var(--d-p2); line-height: 1.35; }
  :global([data-d='R']) .blk-acts { padding-inline: var(--d-p2); gap: var(--d-p1); }
  :global([data-d='R']) .dlg-check { padding-inline: var(--d-p2); }
  :global([data-d='R']) .sec-cap {
    color: var(--d-accent); padding-bottom: 2px; border-bottom: 1px solid var(--d-line);
  }
  :global([data-d='R']) .d-pill { border-radius: var(--d-r); padding: 0 var(--d-p1); }
  :global([data-d='R']) .pill-lg { padding: 1px var(--d-p2); }
  :global([data-d='R']) .scene {
    background: var(--d-surface);
    backdrop-filter: blur(16px) saturate(1.3);
    -webkit-backdrop-filter: blur(16px) saturate(1.3);
    border-color: var(--d-line); border-radius: var(--d-r);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='R']) .veil {
    background: color-mix(in srgb, var(--d-ink-on) 72%, transparent);
    backdrop-filter: blur(10px) saturate(.9);
    -webkit-backdrop-filter: blur(10px) saturate(.9);
  }
  /* HALLAZGO: --d-ground en I, O y R es un FONDO compuesto (varias capas de
     gradiente), no un color, así que no sirve para color-mix ni para tapar
     una lista. Acá el opaco sale de --d-ink-on, que sí es color. El vidrio
     del diálogo se densifica apilando capas en vez de bajar la opacidad. */
  :global([data-d='R']) .dlg {
    --blk-bg: linear-gradient(var(--d-surface), var(--d-surface)),
              linear-gradient(var(--d-sunk), var(--d-sunk)),
              linear-gradient(var(--d-ink-on), var(--d-ink-on));
    backdrop-filter: none; -webkit-backdrop-filter: none;
    border-color: var(--d-edge); box-shadow: var(--d-shadow-lg);
    margin: var(--d-p2);
  }
  :global([data-d='R']) .load, :global([data-d='R']) .proc {
    background: var(--d-surface); border: 1px solid var(--d-line);
    border-radius: var(--d-r); padding: var(--d-p1) var(--d-p2);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  }
  :global([data-d='R']) .skel-row { min-height: var(--d-row-h); border-bottom: 1px solid var(--d-line); }
  :global([data-d='R']) .skel-b {
    height: .72em; border-radius: var(--d-r);
    background: color-mix(in srgb, var(--d-ink) 13%, transparent);
  }
  :global([data-d='R']) .proc-track {
    height: var(--d-p1); border-radius: var(--d-r);
    background: color-mix(in srgb, var(--d-ink) 10%, transparent);
  }
  :global([data-d='R']) .proc-fill {
    box-shadow: 0 0 var(--d-p3) calc(-1 * var(--d-p2)) var(--d-accent);
  }

  /* ======================================================================
     S · UMBRA — la tarjeta se queda BLANCA y lo que informa es la sombra
     teñida de abajo.

     En directions.css la firma solo la llevan .d-panel y .d-row. Acá se la
     damos a TODO el marcado propio de esta página: el aviso, el toast, el
     diálogo, el escenario, las píldoras, las filas de esqueleto y los
     bloques de carga y proceso.

     HALLAZGO: S no trae un token de sombra de tono (algo como
     --d-shadow-tone). La geometría de abajo sale de la escala de espaciado
     —p1/p2/p3/p4— para no escribir píxeles a mano.
     ====================================================================== */
  :global([data-d='S']) .blk {
    --blk-bg: var(--d-surface);
    border: 0; border-radius: var(--d-r-lg); padding: var(--d-p3);
    box-shadow: var(--d-shadow),
                0 var(--d-p1) calc(var(--d-p3) * 1.6) calc(-1 * var(--d-p2)) var(--tone-fg);
  }
  /* El color no toca el contenido: la palabra va en tinta y el tono se queda
     en la marca —la forma, no el relleno— y en la luz de abajo. */
  :global([data-d='S']) .blk-kind { color: var(--d-ink-2); }
  :global([data-d='S']) .blk-kind svg { color: var(--tone-fg); }
  :global([data-d='S']) .blk--toast {
    box-shadow: var(--d-shadow-lg),
                0 var(--d-p2) calc(var(--d-p4) * 1.6) calc(-1 * var(--d-p2)) var(--tone-fg);
  }
  :global([data-d='S']) .pillrow > .d-pill {
    background: var(--d-surface); color: var(--d-ink-2);
    box-shadow: 0 calc(var(--d-p1) * .6) var(--d-p2) calc(-1 * var(--d-p1)) var(--tone-fg);
  }
  :global([data-d='S']) .pillrow > .d-pill svg { color: var(--tone-fg); }
  :global([data-d='S']) .scene { border: 0; border-radius: var(--d-r-lg); box-shadow: var(--d-shadow); }
  /* Mientras el diálogo destructivo está abierto, el escenario entero
     proyecta rojo: la advertencia se lee desde el otro lado del cuarto sin
     que una sola letra cambie de color. */
  :global([data-d='S']) .scene:has(.dlg) {
    box-shadow: var(--d-shadow-lg),
                0 var(--d-p2) calc(var(--d-p4) * 2) calc(-1 * var(--d-p3)) var(--d-crit);
  }
  :global([data-d='S']) .veil { background: color-mix(in srgb, var(--d-surface) 76%, transparent); }
  :global([data-d='S']) .dlg {
    border-radius: var(--d-r-lg); padding: var(--d-p3) var(--d-p4) var(--d-p4);
    box-shadow: var(--d-shadow-lg),
                0 var(--d-p2) calc(var(--d-p4) * 2) calc(-1 * var(--d-p2)) var(--tone-fg);
  }
  /* Las filas del escenario ya llevan la firma por primitiva; las del
     esqueleto no son .d-row, así que se la damos acá. */
  :global([data-d='S']) .skel-row {
    min-height: var(--d-row-h); margin-bottom: var(--d-p1); padding-inline: var(--d-p2);
    background: var(--d-surface); border-radius: var(--d-r); box-shadow: var(--d-shadow);
  }
  :global([data-d='S']) .skel-b { background: var(--d-sunk); border-radius: var(--d-r-pill); }
  :global([data-d='S']) .load {
    background: var(--d-surface); border-radius: var(--d-r-lg);
    padding: var(--d-p3); box-shadow: var(--d-shadow);
  }
  :global([data-d='S']) .proc {
    background: var(--d-surface); border-radius: var(--d-r-lg); padding: var(--d-p3);
    box-shadow: var(--d-shadow),
                0 var(--d-p1) calc(var(--d-p3) * 1.6) calc(-1 * var(--d-p2)) var(--d-info);
  }
  :global([data-d='S']) .proc-track { background: var(--d-sunk); border-radius: var(--d-r-pill); }
  :global([data-d='S']) .proc-fill {
    border-radius: var(--d-r-pill);
    box-shadow: 0 2px var(--d-p2) calc(-1 * var(--d-p1)) var(--d-info);
  }

  /* ======================================================================
     T · HALO CLARO. Halo, del otro lado de la luz.

     La regla de Halo se conserva entera: nada tiene borde ni relleno de color.
     Un aviso existe porque IRRADIA, y sobre papel eso es un anillo de 1px de
     su propio tono más un halo del mismo tono proyectado hacia afuera.

     Lo que la separa de Umbra, que también es papel con sombra teñida: en
     Umbra la tarjeta es una tarjeta neutra y la sombra teñida es un dato
     añadido encima. Acá el anillo y el halo son lo único que hay. Por eso las
     píldoras pierden la banda y quedan en puro anillo, el esqueleto no es un
     relleno gris sino un contorno de luz que respira, y el velo del diálogo no
     es una sombra: es luz de papel que inunda la lista mientras el error quema
     rojo a través. En Halo esa misma escena la hacía la oscuridad.

     La celda pide más aire que ninguna otra por una razón física: un halo de
     34px que se cruza con el de al lado deja de leerse como dos cosas.
     ====================================================================== */
  :global([data-d='T']) .page { gap: var(--d-p4); }
  :global([data-d='T']) .sec-body { gap: var(--d-p3); }
  :global([data-d='T']) .blk {
    --blk-bg: var(--d-surface);
    border: 0; border-radius: var(--d-r-lg); padding: var(--d-p3);
    box-shadow: 0 0 0 1px var(--tone-edge),
                0 var(--d-p2) calc(var(--d-p4) * 1.6) calc(-1 * var(--d-p2)) var(--tone-fg);
  }
  /* El error es lo único de la celda que hay que ver desde el otro lado del
     taller, así que es lo único que además se enciende por dentro. El rescoldo
     entra con radio negativo: muere contra el canto y no llega nunca al texto. */
  :global([data-d='T']) .blk[data-tone='critical'] {
    box-shadow: inset 0 0 var(--d-p4) calc(-1 * var(--d-p3)) var(--tone-fg),
                0 0 0 1px var(--tone-edge),
                0 var(--d-p2) calc(var(--d-p4) * 2.4) calc(-1 * var(--d-p2)) var(--tone-fg);
  }
  /* Sin relleno: la palabra de estado es tinta de su tono dentro de su propio
     anillo. Tinta de tono sobre papel blanco pasa AA en los cinco tonos. */
  :global([data-d='T']) .blk-kind {
    justify-self: start;
    padding: calc(var(--d-p1) * .5) var(--d-p2);
    border-radius: var(--d-r-pill);
    box-shadow: 0 0 0 1px var(--tone-edge),
                0 2px var(--d-p2) calc(-1 * var(--d-p1)) var(--tone-fg);
  }
  :global([data-d='T']) .blk--toast {
    box-shadow: 0 0 0 1px var(--tone-edge),
                0 var(--d-p2) calc(var(--d-p4) * 2) calc(-1 * var(--d-p2)) var(--tone-fg);
  }
  /* Las píldoras también pierden la banda: si el estado se rellenara de color
     acá, la dirección dejaría de ser Halo y pasaría a ser Elevación con brillo. */
  :global([data-d='T']) .d-pill {
    background: none;
    box-shadow: 0 0 0 1px var(--tone-edge),
                0 2px var(--d-p2) calc(-1 * var(--d-p1)) var(--tone-fg);
  }
  :global([data-d='T']) .scene {
    border: 0; border-radius: var(--d-r-lg);
    padding: var(--d-p1); box-shadow: var(--d-shadow);
  }
  /* Las filas ya vienen en cápsula con anillo desde directions.css; la línea
     de abajo sería un segundo borde encima de un anillo. */
  :global([data-d='T']) .scene-list .d-row { border-bottom: 0; }
  :global([data-d='T']) .scene-list .d-row:last-child { margin-bottom: 0; }
  /* El velo es LUZ, no sombra: el papel inunda la lista y el diálogo quema
     rojo a través de él. Es el momento en que esta dirección se explica sola. */
  :global([data-d='T']) .veil {
    background:
      radial-gradient(84% 66% at 50% 50%,
        color-mix(in srgb, var(--d-crit) 16%, transparent) 0%, transparent 70%),
      color-mix(in srgb, var(--d-surface) 84%, transparent);
  }
  :global([data-d='T']) .dlg {
    border: 0; border-radius: var(--d-r-lg);
    padding: var(--d-p3) var(--d-p4) var(--d-p4);
    box-shadow: 0 0 0 1px var(--tone-edge),
                0 var(--d-p3) calc(var(--d-p4) * 2.6) calc(-1 * var(--d-p2)) var(--tone-fg);
  }
  /* El esqueleto no es un relleno gris: es el contorno de una fila que todavía
     no llegó, con la altura de fila real. Lo que late es su luz. */
  :global([data-d='T']) .load, :global([data-d='T']) .proc {
    background: var(--d-surface); border-radius: var(--d-r-lg);
    padding: var(--d-p2) var(--d-p3) var(--d-p3); box-shadow: var(--d-shadow);
  }
  :global([data-d='T']) .skel-row { min-height: var(--d-row-h); }
  :global([data-d='T']) .skel-b {
    background: var(--d-accent-soft);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--d-accent) 18%, transparent),
                0 0 var(--d-p3) calc(-1 * var(--d-p2)) var(--d-accent);
  }
  :global([data-d='T']) .proc-track {
    background: var(--d-accent-soft);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--d-accent) 14%, transparent);
  }
  :global([data-d='T']) .proc-fill {
    box-shadow: 0 0 var(--d-p3) calc(-1 * var(--d-p1)) var(--d-accent);
  }
  /* El destructivo no se rellena de rojo: se enciende de rojo. La tinta queda
     sobre papel blanco, que es donde más contraste tiene. */
  :global([data-d='T']) .d-btn--danger {
    background: var(--d-surface); color: var(--d-crit);
    box-shadow: 0 0 0 1px var(--d-crit-edge),
                0 4px var(--d-p3) calc(-1 * var(--d-p2)) var(--d-crit);
  }

  /* ======================================================================
     Movimiento y tamaños chicos.
     ====================================================================== */
  @media (prefers-reduced-motion: reduce) {
    .skel-b { animation: none; opacity: .72; }
    .proc-fill--wait { animation: none; width: 100%; opacity: .6; }
    .blk { transition: none; }
    /* El barrido de esmalte de J y Q también se apaga al presionar: sin
       transición, no con una transición larga. */
    .blk::after { transition: none; }
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
    /* La lámina segmentada de O deja de encogerse y ocupa el ancho: si no,
       los segmentos se estiran fuera de su propio marco. */
    :global([data-d='O']) .blk-acts { justify-self: stretch; }
    :global([data-d='O']) .dlg-acts { justify-self: stretch; }
    /* En N los carriles montados no se pisan cuando el texto ya ocupa tres
       líneas: a este ancho el solape se lee como error de maquetación. */
    :global([data-d='N']) .blk + .blk { margin-top: 0; }
    :global([data-d='N']) .sec-body { gap: var(--d-p1); }
  }
</style>
