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
                {#if d.id === 'X'}
                  <!-- En Cota ninguna cifra medida aparece sola, y acá ya no hay
                       medida: la lectura se retiró. Así que se va la cifra del
                       texto en vez de dibujarle un riel vacío, que sería una
                       cota sin nada que medir. -->
                  <p class="blk-title">Se descartó la última lectura de BAT-014</p>
                {:else}
                  <p class="blk-title">Se descartó la lectura de 312 h en BAT-014</p>
                {/if}
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
                {#if d.id === 'X'}
                  <!-- LA COTA. La única cifra medida contra un tope que existe en
                       toda esta familia, y este es el momento en que llega: el
                       técnico acaba de anotar el horómetro. «312 h» solo no dice
                       nada; 312 h con la marca de las 250 h del plan detrás dice
                       que se pasó, y cuánto. La cifra sale del titular para no
                       quedar escrita dos veces. -->
                  <p class="blk-title">Lectura registrada en BAT-014</p>
                  <div class="d-cota" data-tone="critical" style="--cota:118">
                    <div class="d-cota-fig"><b>312</b> <span>h</span></div>
                    <div class="d-cota-rail" aria-hidden="true"><i class="d-cota-fill"></i><i class="d-cota-tick"></i></div>
                    <div class="d-cota-note">tope 250 h · se pasó 62 h</div>
                  </div>
                {:else}
                  <p class="blk-title">Lectura registrada · 312 h en BAT-014</p>
                {/if}
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
  /* El neutro NO lleva .blk-kind: el único bloque de tono neutro de la página
     es el aviso deshecho, y ese arranca directo en el titular. La regla que
     había acá —«el gris medio sobre blanco no da contraste, el neutro va en
     tinta»— no llegaba a pintar nada y era el único aviso del build. Si algún
     día un bloque neutro estrena epígrafe, vuelve con la razón intacta. */
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

  /* ======================================================================
     F · TERMINAL — cada aviso es una línea de log: el nivel va como bloque
     de color detrás del texto y el resto se alinea a la cuadrícula.
     ====================================================================== */
  /* El esqueleto y la barra se dibujan con caracteres, no con rectángulos:
     bloques del ancho de un carácter, alineados a la cuadrícula. */

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
  /* En manila, lo que carga también es una ficha (sin pestaña todavía). */

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
  /* El barrido: pointer-events none para no taparle el clic a nada, y
     z-index -1 para caer entre el esmalte y el texto. Encima del texto sería
     un velo blanco sobre el titular, que es lo único que hay que poder leer. */
  /* La palabra de estado es una ficha de esmalte levantada, no una etiqueta. */
  /* Al presionar, el brillo se apaga y la placa se hunde. */

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
     W · CRISTAL TEMPLADO. Cristal, con las tres correcciones puestas donde
     esta página las pone a prueba de verdad: acá vive el diálogo.

     La celda codifica dos hechos con dos recursos, y ninguno de los dos es
     adorno.

     EL MATERIAL DICE DÓNDE VIVE LA COSA. Lo que está EN la página es vidrio:
     el aviso, el vacío, el sin conexión, el error, el escenario, lo que carga
     y lo que procesa. Todo eso se queda quieto, que es la condición para que
     el desenfoque valga la pena. Lo que aparece ENCIMA de la página se pinta
     sólido con --d-overlay: el toast y el diálogo. Un diálogo translúcido
     cruza su texto con el de la lista de abajo y no se lee ninguno de los
     dos. El desenfoque no arregla eso, lo disimula.

     EL HALO DICE SI URGE. Lo lleva una sola cosa de esta celda: el error. El
     aviso informativo, el vacío, el sin conexión, los dos toasts, la barra de
     proceso y el propio diálogo no irradian. Por eso cuando algo irradia se
     ve. Un halo por objeto crítico y nunca anidado: la palabra «Error» no
     vuelve a brillar dentro de un bloque que ya está brillando. El diálogo
     tampoco necesita luz, porque el velo ya sacó del medio a todo lo que
     podía competirle.

     El velo sí desenfoca, y es el único desenfoque de la página que hace
     trabajo de verdad: no lleva texto encima, y lo que empaña (la flota) es
     justo lo que dejó de estar disponible.

     La regla de bandas opacas queda demostrada dentro de la propia celda: la
     misma píldora de tono aparece sobre cuatro sustratos, vidrio, fila
     teñida, papel del toast y papel del diálogo, y vale lo mismo en los
     cuatro. En Cristal la banda era translúcida y su contraste dependía de
     cuántas capas hubiera debajo.

     HALLAZGO para directions.css: la red de seguridad de W ataja lo que flota
     por clase o por rol, y esta página se le escapa entera. El diálogo lleva
     class="dlg" y role="alertdialog", y ninguno de los once selectores de esa
     lista los alcanza: ni [class*='dialog'] matchea «dlg» ni [role='dialog']
     matchea «alertdialog». O sea que el caso para el que se escribió la regla
     1 es exactamente el caso que la regla no cubre. Falta [role='alertdialog']
     en esa lista. Mientras tanto W va sólido acá a mano.
     ====================================================================== */
  :global([data-d='W']) .page {
    --load-order: -1;
    --skel-id: 4.6em;
    --skel-pill: 7em;
    /* El titular de un aviso le gana al cuerpo de lejos, y el cuerpo se lee
       con el teléfono en la mano: 12,5px no alcanzaba. */
    --blk-title-size: var(--d-t-md);
    --blk-body-size: var(--d-t-sm);
    /* Sin versalitas. W no declara la caja alta como idioma en ninguna parte
       de su ficha: la heredó de Cristal. Seis encabezados en versalitas dan
       seis veces el mismo ritmo tibio y ninguno gana la mirada, y una etiqueta
       trackeada sobre cada sección es gramática que nadie eligió. En caja
       normal el encabezado vuelve a ser un encabezado y la palabra de estado
       vuelve a ser la píldora que ya es. */
    --cap-case: none; --cap-track: 0;
    --cap-size: var(--d-t-sm); --cap-weight: var(--d-w-semi); --cap-color: var(--d-ink);
    --kind-case: none; --kind-track: 0;
    --kind-size: var(--d-t-xs); --kind-weight: var(--d-w-semi);
  }

  /* EL VIDRIO, y solo acá. Las cuatro superficies que se quedan quietas. */
  :global([data-d='W']) .blk {
    --blk-bg: var(--d-surface);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    border-color: var(--d-line);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
    padding: var(--d-p3);
  }
  :global([data-d='W']) .scene,
  :global([data-d='W']) .load,
  :global([data-d='W']) .proc {
    position: relative;
    background: var(--d-surface);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r-lg);
    box-shadow: var(--d-shadow);
  }
  :global([data-d='W']) .load,
  :global([data-d='W']) .proc { padding: var(--d-p2) var(--d-p3) var(--d-p3); }

  /* EL DOBLE BISEL, el mismo que la dirección le da a .d-panel: un anillo de
     sombra por fuera y uno de luz por dentro. Es lo que separa un div con
     blur de una pieza de material apoyada en su bandeja. Va en el vidrio y
     solo en el vidrio: sobre papel opaco un anillo de luz es un borde de más. */
  :global([data-d='W']) .blk::after,
  :global([data-d='W']) .scene::after,
  :global([data-d='W']) .load::after,
  :global([data-d='W']) .proc::after {
    content: ''; position: absolute; inset: 1px;
    border-radius: calc(var(--d-r-lg) - 1px);
    box-shadow: inset 0 0 0 1px var(--d-line);
    pointer-events: none;
  }

  /* La palabra de estado ES la píldora de la sección 1: banda de tono opaca,
     canto de tono, marca y palabra. W no tiene un token de espaciado por
     debajo de --d-p1 (8px), así que el relleno vertical sale de escalarlo. */
  :global([data-d='W']) .blk-kind {
    justify-self: start;
    padding: calc(var(--d-p1) * .4) var(--d-p2) calc(var(--d-p1) * .4) var(--d-p1);
    background: var(--tone-band);
    border: var(--d-bw) solid var(--tone-edge);
    border-radius: var(--d-r-pill);
  }

  /* LO ÚNICO QUE IRRADIA EN TODA LA CELDA. El filo de 3px hace el trabajo
     cuando alguien no distingue el rojo, así que el estado no queda dicho solo
     por color. El realce de arriba se repone a mano porque el halo reemplaza a
     --d-shadow entero y ahí se iba el canto de luz que tiene el resto. */
  :global([data-d='W']) .blk[data-tone='critical'] {
    box-shadow: inset 3px 0 0 var(--d-crit),
                inset 0 1px 0 var(--d-line),
                0 4px 18px -8px color-mix(in srgb, var(--d-crit) 55%, transparent);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }

  /* LO QUE FLOTA VA SÓLIDO. En el producto el toast es fixed y el diálogo
     bloquea; en esta celda los dos viven en el flujo porque una celda no puede
     alojar un fixed, pero se pintan con el material que les toca. La opacidad
     es lo que dice si algo es página o si está encima de la página. */
  :global([data-d='W']) .blk--toast,
  :global([data-d='W']) .dlg {
    --blk-bg: var(--d-overlay);
    color: var(--d-overlay-ink);
    backdrop-filter: none; -webkit-backdrop-filter: none;
    border-color: var(--d-overlay-edge);
    box-shadow: var(--d-overlay-shadow);
  }
  :global([data-d='W']) .blk--toast::after,
  :global([data-d='W']) .dlg::after { content: none; }
  :global([data-d='W']) .dlg { border-radius: var(--d-r-lg); padding: var(--d-p4); }

  /* En la página el botón se aclara al pasar por encima, porque su fondo es
     vidrio y el blanco lo levanta. Sobre el papel sólido del diálogo y del
     toast eso no se ve, es blanco sobre blanco: ahí el botón se hunde en
     tinta. Sin esta línea las cuatro acciones que viven sobre papel no tienen
     respuesta de puntero. */
  :global([data-d='W']) .dlg .d-btn:hover,
  :global([data-d='W']) .blk--toast .d-btn:hover {
    background: color-mix(in srgb, var(--d-ink) 7%, transparent);
  }
  :global([data-d='W']) .dlg .d-btn--danger:hover {
    background: color-mix(in srgb, var(--d-crit-band) 78%, var(--d-crit));
  }

  /* El esqueleto y la barra no pueden salir de --d-line: en W la línea es
     BLANCA (rgba blanco al 70 %), así que un bloque hecho con ella sobre
     vidrio blanco no existe. Salen de la tinta, que es lo único que contrasta
     contra el vidrio con cualquier cosa debajo. */
  :global([data-d='W']) .skel-b {
    background: color-mix(in srgb, var(--d-ink) 9%, transparent);
    border-radius: var(--d-r);
  }
  :global([data-d='W']) .skel-row { min-height: var(--d-row-h); }
  :global([data-d='W']) .proc-track {
    background: color-mix(in srgb, var(--d-ink) 8%, transparent);
    border-radius: var(--d-r);
    box-shadow: inset 0 1px 2px color-mix(in srgb, var(--d-ink) 10%, transparent);
  }
  /* La barra NO brilla, ni la determinada ni la de espera. Un proceso que
     avanza informa, no urge, y el halo está reservado. */
  :global([data-d='W']) .proc-fill { border-radius: var(--d-r); box-shadow: none; }

  /* Un código pegado a mano o un nombre de equipo sin espacios no rompen la
     caja: parten donde tengan que partir. */
  :global([data-d='W']) .blk-title,
  :global([data-d='W']) .blk-body,
  :global([data-d='W']) .scene-name { overflow-wrap: break-word; }
  :global([data-d='W']) .reopen > * { min-width: 0; }

  /* La casilla del diálogo medía 13px y su etiqueta 19px de alto: el objetivo
     real de puntero era la etiqueta entera y se quedaba corta incluso con
     mouse. Sube a 24px, que sale de escalar --d-p1 porque W no trae un token
     de objetivo intermedio entre nada y --d-touch. */
  :global([data-d='W']) .dlg-check { min-height: calc(var(--d-p1) * 3); }

  /* HALLAZGO de contraste, y es el que más pesa de todos los que lleva esta
     página, porque cae justo sobre la acción que borra 14 equipos. En
     directions.css `[data-d='W'] .d-btn` pesa (0,2,0) y `.d-btn--danger` pesa
     (0,1,0): el vidrio templado le gana el relleno Y el borde, y lo único que
     sobrevive del destructivo es el color del texto. «Eliminar la familia»
     queda idéntico a «Cancelar» salvo por la tinta, que es estado dicho solo
     por color en el peor lugar posible. El arreglo de raíz va en
     directions.css, donde falta un `[data-d='W'] .d-btn--danger` como el que
     ya tienen U y V; mientras tanto esta página lo repone. Tinta #931C14 sobre
     banda #F3DAD8 da 6,55:1. */
  :global([data-d='W']) .d-btn--danger {
    background: var(--d-crit-band);
    color: var(--d-crit);
    border-color: var(--d-crit-edge);
  }
  :global([data-d='W']) .d-btn--danger:hover {
    background: color-mix(in srgb, var(--d-crit-band) 78%, var(--d-crit));
  }
  /* Un control ocupado se sigue leyendo: al 45 % sobre vidrio, «Reintentando…»
     se desvanecía justo cuando es lo único que explica por qué no responde. */
  :global([data-d='W']) .d-btn[disabled] { opacity: .62; }

  /* El diálogo se queda con el filo crítico y sin halo. Va DESPUÉS del bloque
     crítico a propósito: `.blk[data-tone='critical']` y
     `.dlg[data-tone='critical']` pesan los dos (0,4,0), así que acá el orden
     es lo único que decide, y sin esta línea el diálogo heredaría el
     resplandor del error y quedarían dos cosas irradiando. */
  :global([data-d='W']) .dlg[data-tone='critical'] {
    box-shadow: inset 3px 0 0 var(--d-crit), var(--d-overlay-shadow);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }

  /* EL VELO. El único desenfoque de la página que se gana el costo: no lleva
     texto encima, y lo que empaña es la lista que acaba de dejar de estar
     disponible. Desenfoca menos que el panel, 10px contra 20px, y es a
     propósito: las filas se tienen que seguir reconociendo como filas, porque
     el dato es que siguen ahí y vuelven cuando el diálogo se cierre. */
  :global([data-d='W']) .veil {
    background: color-mix(in srgb, var(--d-ink) 26%, transparent);
    backdrop-filter: blur(10px) saturate(1.1);
    -webkit-backdrop-filter: blur(10px) saturate(1.1);
    animation: veil-in 160ms var(--d-ease, cubic-bezier(.2, .8, .2, 1)) both;
  }
  /* La única moción que agrega esta dirección, y hace un trabajo concreto: la
     escarcha cerrándose es lo que explica que la flota pasó a estar fuera de
     alcance. El diálogo no entra animado, porque es lo que hay que leer. */
  @keyframes veil-in { from { opacity: 0 } to { opacity: 1 } }
  @media (prefers-reduced-motion: reduce) {
    :global([data-d='W']) .veil { animation: none; }
  }

  /* TRANSPARENCIA REDUCIDA. Quien la activa suele hacerlo porque el texto
     sobre fondos vivos le cuesta, así que W deja de ser de vidrio y sigue
     siendo usable. --d-surface ya viene sólido desde directions.css; lo que
     falta acá es apagar el desenfoque de las superficies propias de la página
     y endurecer el canto, porque --d-line es blanco y sobre papel blanco no
     dibuja nada. El velo deja de ser escarcha y pasa a ser una placa: si el
     pedido es no ver a través, la lista se tapa en vez de mostrarse a medias. */
  @media (prefers-reduced-transparency: reduce) {
    :global([data-d='W']) .blk,
    :global([data-d='W']) .scene,
    :global([data-d='W']) .load,
    :global([data-d='W']) .proc {
      backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
      border-color: var(--d-edge);
    }
    :global([data-d='W']) .blk::after,
    :global([data-d='W']) .scene::after,
    :global([data-d='W']) .load::after,
    :global([data-d='W']) .proc::after { content: none; }
    :global([data-d='W']) .veil {
      background: var(--d-sunk);
      backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
    }
  }

  /* CONTRASTE ALTO. Misma lógica, del otro lado: directions.css ya apaga el
     campo de color y endurece --d-line, así que los bordes se afilan solos.
     Falta apagar el desenfoque, que a esa altura ya no tiene nada que
     desenfocar. El halo crítico se queda: ahí el color ES el dato. */
  @media (prefers-contrast: more) {
    :global([data-d='W']) .blk,
    :global([data-d='W']) .scene,
    :global([data-d='W']) .load,
    :global([data-d='W']) .proc {
      backdrop-filter: none; -webkit-backdrop-filter: none;
    }
  }

  /* ======================================================================
     W · PANTALLA ANGOSTA, declarada.

     Nadie miró esta celda abajo de 500px porque Chrome headless en macOS
     recorta el ancho mínimo. La medida real: a 320px de viewport la celda
     tiene 230px útiles, que es 320 menos los 24px de padding del harness a
     cada lado, menos el borde del escenario, menos los 20px de padding
     interno. Todo lo de abajo está pensado contra esos 230px.

     1 · SE APILA todo lo que ya venía en una columna, más las acciones: los
         botones pasan a ancho completo y su rótulo parte en dos líneas en vez
         de desbordar la caja, porque «Asignar el equipo a mano» mide 174px y
         el bloque deja 196px, que es margen de dos caracteres.

     2 · SE CAE EL NOMBRE DEL EQUIPO, que es la tercera columna en orden de
         importancia. Con 230px, el código (62px), la píldora de estado (78px)
         y los dos huecos de 12px dejan 32px para «Batidora Imer Syntesi 250»,
         que se apila en ocho renglones y convierte cada fila en un párrafo.
         Arriba quedan el código y el estado, que son los dos datos que se
         buscan; el nombre baja entero a la segunda línea. La fila crece por
         encima de sus 44px en vez de recortar.

     3 · NADA SE VUELVE SCROLL HORIZONTAL, y es una decisión y no un olvido.
         Lo único tabular de esta página es una lista de tres campos, y una
         lista de tres campos que se desplaza de lado esconde justamente la
         píldora de estado, que es lo único que se mira. Reflujo antes que
         desplazamiento, y ni recorte con puntos suspensivos: en un parte de
         taller el nombre completo del equipo es lo que se compara contra la
         chapa.

     4 · SE APAGA EL DESENFOQUE en las superficies de página, por la misma
         razón que la dirección lo apaga en .d-panel: a este ancho el panel
         ocupa todo y no queda campo alrededor que desenfocar, así que el
         efecto se paga en GPU y no se ve. Con él se va el doble bisel.

     5 · NO SE APAGA EL DEL VELO, y es la única excepción. Su desenfoque no
         depende de que sobre campo alrededor: lo que empaña es la lista que
         tiene justo debajo, que está ahí a cualquier ancho. Es el desenfoque
         que hace trabajo, así que es el que sobrevive.

     6 · CRECEN LOS OBJETIVOS TÁCTILES. La dirección ya lleva los botones a
         44px de alto; faltaban el ancho del descarte, que es una × de 32px, y
         la casilla del diálogo, cuya etiqueta medía 18px de alto entera. Y el
         filo crítico engorda a 5px, porque en un teléfono 3px contra el canto
         se pierden contra el marco.
     ====================================================================== */
  @media (max-width: 560px) {
    :global([data-d='W']) .blk,
    :global([data-d='W']) .scene,
    :global([data-d='W']) .load,
    :global([data-d='W']) .proc {
      backdrop-filter: none; -webkit-backdrop-filter: none;
      border-color: var(--d-edge);
    }
    :global([data-d='W']) .blk::after,
    :global([data-d='W']) .scene::after,
    :global([data-d='W']) .load::after,
    :global([data-d='W']) .proc::after { content: none; }
    /* Sin desenfoque debajo, la superficie sube a casi opaca: si no, el texto
       queda leyéndose contra el campo de manchas a través de un 60 % de
       blanco, que es donde el contraste se cae. El vidrio se condensa
       pintándolo tres veces, 1−(1−a)³, que da 94 % sin inventar un color que
       no esté en el bloque de tokens. */
    :global([data-d='W']) .blk {
      --blk-bg: linear-gradient(var(--d-surface), var(--d-surface)),
                linear-gradient(var(--d-surface), var(--d-surface)),
                linear-gradient(var(--d-surface), var(--d-surface));
    }
    :global([data-d='W']) .scene,
    :global([data-d='W']) .load,
    :global([data-d='W']) .proc {
      background: linear-gradient(var(--d-surface), var(--d-surface)),
                  linear-gradient(var(--d-surface), var(--d-surface)),
                  linear-gradient(var(--d-surface), var(--d-surface));
    }
    /* Los overlays ya eran sólidos y no cambian a ningún ancho. Lo que los
       sigue separando de la página cuando la página también es casi opaca no
       es el relleno: es la elevación, --d-overlay-shadow contra --d-shadow, y
       en el caso del diálogo el velo que tiene abajo. */
    :global([data-d='W']) .blk--toast,
    :global([data-d='W']) .dlg { --blk-bg: var(--d-overlay); }

    :global([data-d='W']) .blk[data-tone='critical']:not(.dlg) {
      box-shadow: inset 5px 0 0 var(--d-crit), inset 0 1px 0 var(--d-line);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }
    :global([data-d='W']) .dlg[data-tone='critical'] {
      box-shadow: inset 5px 0 0 var(--d-crit), var(--d-overlay-shadow);
    border-top-left-radius: 0; border-bottom-left-radius: 0;
  }
    :global([data-d='W']) .dlg { margin: var(--d-p1); padding: var(--d-p3); }

    /* La fila se parte: código y estado arriba, nombre entero abajo. */
    :global([data-d='W']) .scene-list .d-row {
      flex-wrap: wrap; row-gap: 2px; padding-block: var(--d-p1);
    }
    :global([data-d='W']) .scene-list .d-row .d-pill { margin-left: auto; }
    :global([data-d='W']) .scene-name { order: 1; flex: 1 0 100%; }
    /* El esqueleto se parte igual. Es el hueco exacto de la fila que todavía
       no llegó, así que si la fila se pliega en dos líneas y él no, la lista
       da un salto al cargar y el bloque del nombre queda en 28px, que no es
       la forma de ningún nombre. */
    :global([data-d='W']) .skel-row { flex-wrap: wrap; row-gap: var(--d-p1); padding-block: var(--d-p1); }
    :global([data-d='W']) .skel-b--pill { margin-left: auto; }
    :global([data-d='W']) .skel-b--name { order: 1; flex: 1 0 100%; }

    :global([data-d='W']) .blk-acts .d-btn--ghost { min-width: var(--d-touch); }
    :global([data-d='W']) .dlg-check { min-height: var(--d-touch); }
    :global([data-d='W']) .dlg-box { inline-size: 1.25em; block-size: 1.25em; }
  }

  @media (max-width: 420px) {
    /* El rótulo parte antes que desbordar. La altura mínima de 44px que ya
       pone la dirección absorbe la segunda línea sin que el botón crezca. */
    :global([data-d='W']) .blk-acts .d-btn,
    :global([data-d='W']) .dlg-acts .d-btn {
      white-space: normal; text-align: center; line-height: 1.3;
      padding-block: var(--d-p1);
    }
    /* El descarte no se estira con los demás. Un botón de ancho completo con
       una × sola adentro se lee como una acción principal vacía, y es lo
       contrario de lo que es: se queda cuadrado al final de la fila, del
       tamaño de un pulgar y nada más. */
    :global([data-d='W']) .blk-acts .d-btn--ghost {
      flex: 0 0 auto; min-width: var(--d-touch); padding-inline: 0;
    }
  }

  /* ======================================================================
     X · COTA. Papel mate y tinta. Nada más.

     LA REGLA QUE ORDENA ESTA CELDA, y es la de la dirección: el color está
     reservado al estado. Todo el cromo de la página, el papel, las hojas, los
     bordes, la tipografía, los botones, el esqueleto, la barra de proceso y el
     velo, es acromático. La consecuencia se ve mejor acá que en ninguna otra
     página del catálogo, porque esta familia es justamente la de los estados:
     lo único de color que hay en pantalla es lo que informa, y por eso el ojo
     encuentra el error antes de leer una palabra.

     De ahí salen las tres decisiones de esta celda, y ninguna es de gusto:

     1 · CADA BLOQUE QUE INTERRUMPE LLEVA UN FILO DE 3px DE SU TONO en el canto
         izquierdo, que es el mismo recurso que la dirección le da a la fila.
         El filo está siempre; lo único que cambia es su color. Así el estado
         queda dicho por una sola cosa y esa cosa es la que lleva el color.

     2 · SOLO EL ERROR SE TIÑE. El aviso informativo se queda en papel blanco
         con su filo y nada más, que es exactamente lo que pide el sujeto: un
         parte de flota no urge. El error lleva banda y canto de su tono porque
         es lo único que interrumpe de verdad. Rellenar los cinco tonos obliga
         a re-verificar contraste cinco veces y no informa nada que el filo no
         diga ya.

     3 · EL DIÁLOGO ES PAPEL SOBRE PAPEL. Ni sombra difusa ni desenfoque: una
         hoja opaca con canto duro, apoyada sobre un velo que es otra hoja. La
         profundidad la da la línea, no la luz. Y el velo hace un trabajo que
         se ve: al cerrarse, el color se le va a la lista de abajo, y el rojo
         del diálogo queda como el único de la pantalla.
     ====================================================================== */
  :global([data-d='X']) .page {
    /* Qué se está cargando se lee antes que su forma, y el esqueleto se mide
       con el dato real: siete caracteres de código y una píldora de estado. */
    --load-order: -1;
    --skel-id: 4.6em;
    --skel-pill: 7em;
    /* El titular le gana al cuerpo de lejos y el cuerpo se lee con el teléfono
       en la mano. Es el mismo ajuste de contenido que ya comparten las siete
       finalistas; acá va en su propio bloque porque X no está en esa lista. */
    --blk-title-size: var(--d-t-md);
    --blk-body-size: var(--d-t-sm);
    /* Sin versalitas: X ya trae --d-label-case: none en su bloque de tokens,
       así que acá solo hace falta que el encabezado de sección pese como un
       encabezado y no como una etiqueta gris. La palabra de estado se queda un
       escalón por debajo, que es el que le corresponde. */
    --cap-size: var(--d-t-sm); --cap-weight: var(--d-w-semi); --cap-color: var(--d-ink);
    --kind-size: var(--d-t-xs); --kind-weight: var(--d-w-semi);
  }

  /* La hoja va rayada. Cada sección arranca en una línea, que es la única
     separación que hay: ni tarjetas sueltas ni aire de más. */
  :global([data-d='X']) .sec + .sec {
    border-top: var(--d-bw) solid var(--d-line);
    padding-top: var(--d-p3);
  }
  :global([data-d='X']) .sec-cap { letter-spacing: -.01em; }

  /* LA PERSONALIDAD SALE DEL TRATAMIENTO, no de la fuente: no hay fuente que
     elegir porque un @font-face dentro de un shadow root lo ignoran Chrome y
     Safari. Contraste de peso, tracking negativo y figuras tabulares en todo
     lo que lleva un número, que en esta página es casi todo: horas, códigos de
     equipo, números de devolución, plazos. Una columna de cifras que baila de
     ancho es la firma de un formulario mal hecho. */
  :global([data-d='X']) .blk-title { letter-spacing: -.014em; }
  :global([data-d='X']) .blk-title,
  :global([data-d='X']) .blk-body,
  :global([data-d='X']) .scene-name,
  :global([data-d='X']) .proc-lbl,
  :global([data-d='X']) .reopen { font-variant-numeric: var(--d-num); }

  /* EL BLOQUE QUE INTERRUMPE. Hoja blanca, canto de 4px, un píxel de sombra
     sin desenfoque, y el filo de 3px de su tono pegado al borde izquierdo. El
     relleno de la izquierda le hace sitio al filo igual que en la fila. */
  :global([data-d='X']) .blk {
    --blk-bg: var(--d-surface);
    border-color: var(--d-line);
    border-radius: var(--d-r);
    box-shadow: var(--d-shadow);
    padding: var(--d-p2) var(--d-p3) var(--d-p3) calc(var(--d-p3) + 3px);
  }
  :global([data-d='X']) .blk::before {
    content: ''; position: absolute; inset: 0 auto 0 0; width: 3px;
    background: var(--tone-fg);
    border-radius: calc(var(--d-r) - var(--d-bw)) 0 0 calc(var(--d-r) - var(--d-bw));
  }
  /* Lo único que se tiñe en toda la celda. El error es el único bloque que
     interrumpe de verdad, así que es el único que se pinta. */
  :global([data-d='X']) .blk[data-tone='critical'] {
    --blk-bg: var(--d-crit-band);
    border-color: var(--d-crit-edge);
  }
  /* Lo que está SOBRE la página lleva canto duro y lo que está EN la página
     lleva canto claro. La dureza del borde dice de qué capa es la hoja, que es
     la única manera de decirlo sin sombra difusa. */
  :global([data-d='X']) .blk--toast { border-color: var(--d-edge); }

  /* EL DIÁLOGO: papel sobre papel. Se queda blanco aunque su tono sea crítico,
     porque lo que bloquea la pantalla tiene que leerse como una hoja aparte y
     no como un bloque teñido más. Lo crítico lo dice su filo y lo dice el
     botón que borra. Va DESPUÉS de .blk[data-tone='critical'] a propósito: los
     dos selectores pesan (0,2,0) contando el atributo, así que acá el orden es
     lo único que decide, y al revés el diálogo saldría con la banda del error. */
  :global([data-d='X']) .dlg {
    --blk-bg: var(--d-surface);
    border-color: var(--d-edge);
    border-radius: var(--d-r);
    box-shadow: var(--d-shadow);
    padding: var(--d-p3) var(--d-p3) var(--d-p3) calc(var(--d-p3) + 3px);
  }
  :global([data-d='X']) .dlg[data-tone='critical'] {
    --blk-bg: var(--d-surface);
    border-color: var(--d-edge);
  }
  :global([data-d='X']) .dlg-acts { padding-top: var(--d-p2); }
  /* El velo es una hoja mate apoyada encima, sin desenfoque. Al 88 % la flota
     se sigue reconociendo como flota, que es el dato (sigue ahí y vuelve al
     cerrar), pero pierde el color: las filas vencidas se van a gris y el rojo
     del diálogo queda solo en pantalla. */
  :global([data-d='X']) .veil {
    background: color-mix(in srgb, var(--d-ground) 88%, transparent);
  }

  /* LO QUE CARGA Y LO QUE PROCESA también son hojas. Eran los dos únicos
     bloques de la celda apoyados directo sobre el papel de fondo. */
  :global([data-d='X']) .load,
  :global([data-d='X']) .proc {
    background: var(--d-surface);
    border: var(--d-bw) solid var(--d-line);
    border-radius: var(--d-r);
    box-shadow: var(--d-shadow);
    padding: var(--d-p2) var(--d-p3) var(--d-p3);
  }
  /* El esqueleto tiene la forma de la fila que falta: la misma altura de fila
     de la dirección y la misma regla corrida de canto a canto de la hoja. Es
     el hueco exacto que va a ocupar el equipo cuando llegue, así que la lista
     no da un salto al cargar. */
  :global([data-d='X']) .skel { margin-inline: calc(-1 * var(--d-p3)); }
  :global([data-d='X']) .skel-row {
    min-height: var(--d-row-h);
    padding-inline: var(--d-p3);
    border-bottom: var(--d-bw) solid var(--d-line);
  }
  :global([data-d='X']) .skel-row:last-child { border-bottom: 0; }
  /* --d-sunk sobre blanco no se ve. El bloque sale del gris de acento, que en
     esta dirección es neutro porque el acento es tinta. */
  :global([data-d='X']) .skel-b { background: var(--d-accent-soft); height: .82em; }

  /* LA BARRA DE PROCESO NO ES UNA COTA, y no tiene que parecerlo. Acá no hay
     tope que pasarse: hay 12 líneas en la devolución y se leen de a una, así
     que el riel se dibuja partido en esas 12 líneas en vez de correr liso y se
     pueden contar las tres que ya pasaron. Los cortes son duros, sin ninguna
     interpolación de color: es una regla graduada, no un degradado. Un riel
     liso sin marca sería una cota a la que le falta el tope, que es justo lo
     que la dirección prohíbe. */
  :global([data-d='X']) .proc-track {
    height: var(--d-p2);
    border-radius: 0;
    background: var(--d-surface);
    border: var(--d-bw) solid var(--d-edge);
  }
  :global([data-d='X']) .proc-track::after {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background: repeating-linear-gradient(90deg,
                transparent 0 calc(100% / 12 - 1px),
                var(--d-edge) calc(100% / 12 - 1px) calc(100% / 12));
  }
  /* Una espera indeterminada no tiene líneas que contar: no se sabe dónde
     está. Ahí el riel se queda liso y lo que informa es que algo se mueve. */
  :global([data-d='X']) .proc-track--wait::after { content: none; }
  :global([data-d='X']) .proc-fill { background: var(--d-ink); border-radius: 0; }

  /* LA COTA. Vive en el aviso de lectura registrada y en ningún otro lado de
     esta página, porque en toda la familia hay exactamente una cifra medida
     contra un tope: las 312 h de BAT-014 contra las 250 h de su plan. Los
     otros números de la celda son cuentas (8 equipos, 14 equipos, 3 tareas,
     línea 3 de 12) y una cuenta no tiene tope que pasarse. Meterle un riel a
     una cuenta es exactamente el error que la dirección nombra: una cota sin
     marca es una barra de progreso, y una barra de progreso decorativa es
     ruido.

     El aviso es positivo (la lectura se guardó) y la cifra es crítica (con esa
     lectura la máquina se pasó). Son dos hechos distintos y por eso llevan dos
     tonos: el filo verde del bloque dice que se guardó, el rojo de la cifra
     dice que hay que ir a cambiar el aceite. Ese es el trabajo que ahorra el
     riel: el técnico no vuelve a la lista a averiguar qué significa 312. */
  :global([data-d='X']) .d-cota { padding-top: calc(var(--d-p1) * .5); }
  /* La única moción que agrega Cota, y se gana el lugar: el relleno arranca en
     cero y corre hasta pasar la marca, que es literalmente lo que acaba de
     pasar con la máquina. Sin ella la barra ya está pasada cuando aparece y no
     se ve el cruce, que es el dato. */
  :global([data-d='X']) .d-cota-fill { animation: cota-run 560ms cubic-bezier(.22, .75, .2, 1); }
  @keyframes cota-run { from { width: 0 } }

  /* HALLAZGO de contraste, y es la trampa de especificidad que este proyecto
     persiguió toda la semana, viva dentro del propio bloque de X: en
     directions.css `[data-d='X'] .d-btn:hover` pesa (0,3,0) contando el
     atributo y `.d-btn--primary` pesa (0,2,0), así que al pasar el puntero por
     encima el primario pierde el relleno negro y conserva la tinta blanca:
     blanco sobre #F4F5F4, 1,05:1, sin un solo error en consola. Cae sobre
     «Agregar equipo» y sobre «Reintentar», que son las dos salidas del estado
     vacío y del estado sin conexión. El arreglo de raíz va en directions.css;
     mientras tanto esta página lo repone y de paso le da al primario negro un
     hover que se vea, porque el brightness(1.12) de la base sobre tinta casi
     no mueve nada. */
  :global([data-d='X']) .d-btn--primary:hover {
    background: color-mix(in srgb, var(--d-accent) 86%, var(--d-surface));
    color: var(--d-accent-ink);
    filter: none;
  }
  /* Y al destructivo lo alcanzan las dos: `[data-d='X'] .d-btn` le pisa el
     canto rojo en reposo y `:hover` le pisa la banda, así que «Eliminar la
     familia» quedaba idéntico a «Cancelar» salvo por la tinta, que es estado
     dicho solo por color en el peor sitio posible. Tinta #A82118 sobre banda
     #FAE4E0 da 5,95:1, y sobre la banda del hover 5,2:1. */
  :global([data-d='X']) .d-btn--danger { border-color: var(--d-crit-edge); }
  :global([data-d='X']) .d-btn--danger:hover {
    background: color-mix(in srgb, var(--d-crit-band) 88%, var(--d-crit));
  }
  /* Un control ocupado se tiene que seguir leyendo. La base baja el botón
     entero al 45 % de opacidad, y sobre el primario negro eso deja el rótulo
     blanco contra un gris de 2,9:1 justo cuando «Reintentando…» es lo único
     que explica por qué la pantalla no responde. Al 62 % da 5,0:1. */
  :global([data-d='X']) .d-btn[disabled] { opacity: .62; }

  /* CONTRASTE ALTO. Cota se apoya entera en una línea de un píxel, así que
     cuando alguien pide más contraste lo que hay que endurecer es la línea:
     el canto de las hojas sube al tono de borde y el filo de estado engorda,
     porque es el que carga el dato. */
  @media (prefers-contrast: more) {
    :global([data-d='X']) .blk,
    :global([data-d='X']) .load,
    :global([data-d='X']) .proc,
    :global([data-d='X']) .scene { border-color: var(--d-edge); }
    :global([data-d='X']) .blk::before { width: 4px; }
    :global([data-d='X']) .blk,
    :global([data-d='X']) .dlg { padding-left: calc(var(--d-p3) + 4px); }
  }

  /* Piso de artesanía. En contraste forzado el velo no puede ser una capa
     translúcida: color-mix se pierde y el diálogo quedaría leyéndose encima de
     la lista. Ahí el velo pasa a ser una placa opaca, que es lo mismo que
     dice, y el filo de tono pasa a tinta del sistema. */
  @media (forced-colors: active) {
    :global([data-d='X']) .veil { background: Canvas; }
    :global([data-d='X']) .blk::before { background: CanvasText; }
    :global([data-d='X']) .dlg { outline: 1px solid CanvasText; outline-offset: -1px; }
    :global([data-d='X']) .skel-b { background: GrayText; }
  }
  @media (prefers-reduced-motion: reduce) {
    :global([data-d='X']) .d-cota-fill { animation: none; }
  }
  /* El tamaño de un dedo es un hecho del aparato y no del ancho de la ventana.
     directions.css ya sube los botones y los campos de X a --d-touch con
     puntero grueso; lo que le falta es lo que esta página agrega por su
     cuenta: la × de descartar, que mide 32px de ancho, y la casilla del
     diálogo, cuyo objetivo real es la etiqueta entera y medía 19px de alto. */
  @media (pointer: coarse) {
    :global([data-d='X']) .blk-acts .d-btn--ghost { min-width: var(--d-touch); }
    :global([data-d='X']) .dlg-check { min-height: var(--d-touch); align-items: center; }
    :global([data-d='X']) .dlg-box { inline-size: 1.25em; block-size: 1.25em; }
  }

  /* ══ X · PANTALLA ANGOSTA, DECLARADA ═════════════════════════════════════
     La medida, para no suponer: a 380px de viewport la celda deja 290px
     útiles. Son 380 menos los 24px de relleno del harness a cada lado, menos
     el borde del escenario, menos los 20px de relleno interno de la celda a
     cada lado. Todo lo de abajo está pensado contra esos 290px, y el umbral va
     en 420px porque es el que ya usa esta página y no hace falta inventar otra
     escala de cortes.

     1 · SE PARTE LA FILA de la lista que hay detrás del diálogo. Con 290px la
         fila deja 260 de contenido, y el código (58px), la píldora de estado
         (82px) y los dos huecos de 11px se comen 162: quedan 98px para
         «Compactadora Wacker DPU-6555», que se apila en cuatro renglones y
         convierte cada fila en un párrafo. Arriba quedan el código y el
         estado, que son los dos datos que se buscan, y el nombre baja entero a
         la segunda línea. La fila crece por encima de sus 38px en vez de
         recortar.

     2 · EL ESQUELETO SE PARTE IGUAL, porque es el hueco de la fila que todavía
         no llegó. Si la fila se pliega en dos líneas y él no, la lista da un
         salto al cargar.

     3 · NADA SE VUELVE SCROLL HORIZONTAL, y es decisión y no olvido. Lo único
         tabular de esta página es una lista de tres campos, y una lista de
         tres campos que se desplaza de lado esconde justo la píldora de
         estado, que es lo único que se mira. Reflujo antes que desplazamiento,
         y nunca recorte con puntos suspensivos: en un parte de taller el
         nombre completo del equipo es lo que se compara contra la chapa.

     4 · LA COTA NO SE ENCOGE. Es la carga útil del aviso, así que la cifra se
         queda en --d-t-xl y lo que se acomoda es el resto. El riel es fluido y
         la marca del tope cae siempre en el mismo sitio, a dos tercios, así
         que a 258px de ancho la marca queda en 172 y el sobrepaso sigue
         teniendo dónde verse. La nota parte de línea si hace falta.

     5 · EL RIEL DE 12 LÍNEAS DE LA BARRA DE PROCESO SE QUEDA EN 12. A 258px
         cada línea mide 21px, que se sigue contando. Bajarlas a seis sería
         mentir sobre el documento.

     6 · EL FILO DE TONO SIGUE EN 3px. No engorda en angosto: acá el bloque no
         llega nunca al canto del aparato porque la celda tiene 20px de aire
         alrededor, así que los 3px no compiten contra ningún marco.

     7 · LOS BOTONES parten el rótulo antes que desbordar. «Asignar el equipo a
         mano» mide 165px y a 290 entra, pero a 320 de viewport ya no, y el
         alto mínimo de 44px que pone la dirección con puntero grueso absorbe
         la segunda línea sin que el botón crezca.
     ════════════════════════════════════════════════════════════════════════ */
  @media (max-width: 420px) {
    :global([data-d='X']) .scene-list .d-row {
      flex-wrap: wrap; row-gap: 2px; padding-block: var(--d-p1);
    }
    :global([data-d='X']) .scene-list .d-row .d-pill { margin-left: auto; }
    :global([data-d='X']) .scene-name { order: 1; flex: 1 0 100%; }
    :global([data-d='X']) .skel-row { flex-wrap: wrap; row-gap: var(--d-p1); padding-block: var(--d-p1); }
    :global([data-d='X']) .skel-b--pill { margin-left: auto; }
    :global([data-d='X']) .skel-b--name { order: 1; flex: 1 0 100%; }

    :global([data-d='X']) .blk-acts .d-btn,
    :global([data-d='X']) .dlg-acts .d-btn {
      white-space: normal; text-align: center; line-height: 1.3;
      padding-block: var(--d-p1);
    }
    /* El descarte no se estira con los demás: un botón de ancho completo con
       una × sola adentro se lee como una acción principal vacía, que es lo
       contrario de lo que es. Se queda cuadrado al final de la fila. */
    :global([data-d='X']) .blk-acts .d-btn--ghost {
      flex: 0 0 auto; min-width: var(--d-touch); padding-inline: 0;
    }
    :global([data-d='X']) .dlg {
      margin: var(--d-p2);
      padding: var(--d-p2) var(--d-p2) var(--d-p2) calc(var(--d-p2) + 3px);
    }
    :global([data-d='X']) .dlg-check { min-height: var(--d-touch); }
    /* Un código pegado a mano o un nombre de equipo sin espacios no rompen la
       caja: parten donde tengan que partir. */
    :global([data-d='X']) .blk-title,
    :global([data-d='X']) .blk-body,
    :global([data-d='X']) .scene-name,
    :global([data-d='X']) .d-cota-note { overflow-wrap: break-word; }
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

  /* ══ W · OBJETIVOS TÁCTILES, POR PUNTERO Y NO POR ANCHO ══════════════════
     El tamaño de un dedo es un hecho del aparato, no del ancho de la ventana.
     directions.css sube los .d-btn de W a --d-touch dentro de
     @media (max-width: 560px), así que una tableta de 768px —que se toca con
     el pulgar igual que un teléfono— se quedaba con los controles de ratón.
     Medido con puntero grueso emulado por CDP a 768px, esta página tenía
     11 objetivos por debajo de 44px. Va por (pointer: coarse) porque ese es
     el hecho que importa; el ancho ya tiene sus propias reglas y hacen otra
     cosa. Con ratón no cambia un pixel. */
  @media (pointer: coarse) {
    :global([data-d='W']) .blk-acts .d-btn,
    :global([data-d='W']) .dlg-acts .d-btn { min-height: var(--d-touch); }
    /* La × de descartar es la única que también fallaba de ancho: 34px. */
    :global([data-d='W']) .blk-acts .d-btn--ghost { min-width: var(--d-touch); }
    /* La casilla del diálogo mide 16px. El objetivo es la etiqueta entera,
       que ya la envuelve: sólo le faltaba alto. */
    :global([data-d='W']) .dlg-check {
      min-height: var(--d-touch);
      align-items: center;
    }
  }
</style>
