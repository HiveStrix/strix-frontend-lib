<script>
  // RETROALIMENTACIÓN — the catalogue page for the feedback family.
  //
  // It is written to be read at 11 pm by somebody trying to ship, so every
  // component appears in the states that actually break: not just the happy one,
  // but empty, loading, disabled, failed, and focused. A catalogue that shows
  // only the happy path is how a design system rots — the states nobody
  // documented are the states everybody reinvents, differently, four times.
  import { onDestroy } from 'svelte';
  import Dialog from '../../lib/feedback/Dialog.svelte';
  import Confirm from '../../lib/feedback/Confirm.svelte';
  import Toast from '../../lib/feedback/Toast.svelte';
  import Alert from '../../lib/feedback/Alert.svelte';
  import EmptyState from '../../lib/feedback/EmptyState.svelte';
  import ErrorState from '../../lib/feedback/ErrorState.svelte';
  import Skeleton from '../../lib/feedback/Skeleton.svelte';
  import Progress from '../../lib/feedback/Progress.svelte';
  import ReviewPanel from '../../lib/feedback/ReviewPanel.svelte';

  // ── Los avisos viven una sola vez, arriba de todo ────────────────────────
  let toasts = [];
  let seq = 0;
  const push = (t) => (toasts = [...toasts, { id: ++seq, ...t }]);
  const drop = (id) => (toasts = toasts.filter((t) => t.id !== id));

  // ── Dialog ───────────────────────────────────────────────────────────────
  let dlg = '';           // '' | 'form' | 'locked' | 'long'
  let reading = '1248';
  let saving = false;
  let saveTimer;

  function saveReading() {
    saving = true;
    saveTimer = setTimeout(() => {
      saving = false;
      dlg = '';
      push({ tone: 'positive', text: `Lectura registrada: BAT001, ${reading} h.` });
    }, 1600);
  }

  // ── Confirm ──────────────────────────────────────────────────────────────
  let asking = '';        // '' | 'plan' | 'order'
  let removing = false;
  let removeTimer;
  // Cancelar una orden pide motivo. Antes de `reasonLabel`/`reasonRequired`
  // esto se armaba a mano —un Dialog propio, un Textarea propio, la misma
  // pareja `error`/`fix` reinventada— y funcionaba, que es exactamente por qué
  // el hueco se cerró adentro de Confirm en vez de quedar como una receta que
  // cada producto copia. `cancelReason` vive acá, no en Confirm: quién exige
  // el motivo y qué hace con el texto es siempre del que llama.
  let cancelReason = '';

  function reallyRemove() {
    removing = true;
    removeTimer = setTimeout(() => {
      removing = false;
      asking = '';
      push({ tone: 'neutral', text: 'Plan eliminado: Cambio de aceite 250 h.', action: 'Deshacer' });
    }, 1700);
  }

  // ── Progress ─────────────────────────────────────────────────────────────
  let read = 0;
  const total = 34;
  let ticking = false;
  let tick;

  function runProgress() {
    clearInterval(tick);
    read = 0;
    ticking = true;
    tick = setInterval(() => {
      read += 1;
      if (read >= total) {
        clearInterval(tick);
        ticking = false;
        push({ tone: 'positive', text: '34 documentos leídos. Nada se ha escrito todavía.' });
      }
    }, 220);
  }

  // ── Skeleton ─────────────────────────────────────────────────────────────
  let loaded = false;
  let loadTimer;

  function fakeLoad() {
    loaded = false;
    clearTimeout(loadTimer);
    loadTimer = setTimeout(() => (loaded = true), 2200);
  }

  // ── ErrorState ───────────────────────────────────────────────────────────
  let retrying = false;
  let retryTimer;

  function retry() {
    retrying = true;
    retryTimer = setTimeout(() => {
      retrying = false;
      push({ tone: 'critical', text: 'Sigue sin responder. Es el mismo corte.' });
    }, 1800);
  }

  // ── ReviewPanel ──────────────────────────────────────────────────────────
  // Papelería real de un patio de alquiler: dos salidas, una devolución, un
  // duplicado exacto, un artículo que nadie ha mapeado y un PDF escaneado que
  // no tiene texto adentro.
  const batch = [
    {
      id: 'f1',
      kind: 'Salida',
      code: 'SAL-118432',
      title: 'salida-118432.pdf',
      meta: ['1.2 MB', '3 líneas', 'OPRA'],
      verdict: 'write',
      message: 'BAT007 sale a alquiler el 14 de julio. Suma horas cuando vuelva.',
      lines: [
        { id: 'l1', label: 'Línea 1', text: 'BAT-4471 · unidad BAT007 · × 1', verdict: 'write' },
        { id: 'l2', label: 'Línea 2', text: 'PUNTAL-30 · × 20', verdict: 'skip', message: 'a granel, nunca es una máquina' }
      ],
      footnote: {
        label: '6 campos quedaron inciertos y ninguno frena el documento',
        text: 'Cliente, contacto, teléfono, dirección, proyecto y vendedor. Son datos de referencia: no deciden cuál máquina es ni cuánto corrió, así que quedan anotados y nada más.'
      }
    },
    {
      id: 'f2',
      kind: 'Devolución',
      code: 'DEV-118201',
      title: 'devolucion-118201.pdf',
      meta: ['840 KB', '1 línea', 'OPRA'],
      verdict: 'write',
      message: 'CL445926 vuelve del alquiler: suma 412 km y 6 días fuera.'
    },
    {
      id: 'f3',
      kind: 'Salida',
      code: 'SAL-118440',
      title: 'salida-118440.pdf',
      meta: ['1.1 MB', '2 líneas', 'OPRA'],
      verdict: 'question',
      message: 'El documento se registra igual. Falta decir qué es el código 9920-MIX.',
      fix: 'Contestá una vez y queda contestado para siempre: o es una máquina del patio, y la enlazás; o se alquila a granel, y el código completo se marca así. Mientras tanto la línea no suma horas a nadie.',
      lines: [
        { id: 'l3', label: 'Línea 1', text: '9920-MIX · unidad 14 · × 1', verdict: 'question', message: 'sin máquina' }
      ]
    },
    {
      id: 'f4',
      kind: 'Salida',
      code: 'SAL-118433',
      title: 'salida-118433.pdf',
      meta: ['1.2 MB', 'OPRA'],
      verdict: 'duplicate',
      message: 'Son exactamente los mismos bytes que ya están registrados.'
    },
    {
      id: 'f5',
      code: '',
      title: 'devolucion-escaneada.pdf',
      meta: ['4.7 MB', 'OPRA'],
      verdict: 'block',
      message: 'El archivo nunca llegó a documento: adentro solo hay una foto de la hoja.',
      fix: 'Volvé a exportarlo del ERP. Si lo único que existe es la hoja impresa, cargá la devolución a mano desde la ficha de la máquina — son cuatro datos.'
    }
  ];

  // El mismo lote, pero sin nada que escribir: la vista previa que apaga su
  // propio botón. Es el estado que más se olvida y el que más se necesita.
  const stuck = [
    { id: 's1', kind: 'Salida', code: 'SAL-119002', title: 'salida-119002.pdf', meta: ['980 KB'],
      verdict: 'block', message: 'Viene sin fecha de salida.',
      fix: 'Media salida no es una salida, así que ninguna de sus líneas se escribe. Corregila en el ERP y volvé a exportarla.' },
    { id: 's2', kind: 'Salida', code: 'SAL-119003', title: 'salida-119003.pdf', meta: ['1.0 MB'],
      verdict: 'duplicate', message: 'Ya estaba registrada desde el 3 de julio.' }
  ];

  let rp = 'review';      // review | working | done
  let rpTimer;

  function commit() {
    rp = 'working';
    rpTimer = setTimeout(() => {
      rp = 'done';
      push({ tone: 'positive', text: 'Se registraron 3 documentos. 1 quedó esperando en pendientes.' });
    }, 1800);
  }

  onDestroy(() => {
    clearTimeout(saveTimer);
    clearTimeout(removeTimer);
    clearTimeout(loadTimer);
    clearTimeout(retryTimer);
    clearTimeout(rpTimer);
    clearInterval(tick);
  });

  // ── Enfocar a mano, para ver el anillo sin adivinar ──────────────────────
  let ringTarget;
  const showRing = () => ringTarget?.focus();

  // ── Copiar el markup ─────────────────────────────────────────────────────
  let copied = '';
  let copyTimer;

  async function copy(key, text) {
    try {
      await navigator.clipboard.writeText(text);
      copied = key;
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => (copied = ''), 2000);
    } catch {
      copied = '';
    }
  }
  onDestroy(() => clearTimeout(copyTimer));

  const NAV = [
    ['dialog', 'Dialog'], ['confirm', 'Confirm'], ['toast', 'Toast'], ['alert', 'Alert'],
    ['empty', 'EmptyState'], ['error', 'ErrorState'], ['skeleton', 'Skeleton'],
    ['progress', 'Progress'], ['review', 'ReviewPanel']
  ];

  const CODE = {
    dialog: `{#if editing}
  <Dialog title="Registrar lectura" note="BAT001 · horómetro"
          on:close={() => (editing = false)}>
    <label class="sx-cap" for="h">Horómetro</label>
    <input id="h" data-sx-autofocus type="number" bind:value={hours} />

    <svelte:fragment slot="foot">
      <button on:click={() => (editing = false)}>Cancelar</button>
      <button on:click={save}>Guardar la lectura</button>
    </svelte:fragment>
  </Dialog>
{/if}

<!-- Mientras escribe, el diálogo deja de ser descartable: -->
<Dialog title="Registrando…" dismissible={false} on:close={noop}>…</Dialog>`,

    confirm: `<Confirm
  action="Eliminar el plan"
  subject="Cambio de aceite 250 h · BAT001"
  loses={[
    { n: 3, text: 'servicios ya registrados quedan sin plan' },
    { n: 1, text: 'proyección de vencimiento deja de calcularse' }
  ]}
  keeps={['El historial de servicios de BAT001 no se toca']}
  busy={removing}
  busyNote="Eliminando el plan…"
  on:confirm={remove}
  on:cancel={() => (asking = '')} />`,

    toast: `<script>
  let toasts = [];
  let seq = 0;
  const push = (t) => (toasts = [...toasts, { id: ++seq, ...t }]);
  const drop = (id) => (toasts = toasts.filter((t) => t.id !== id));
<\/script>

<!-- Una sola vez, en la raíz del producto -->
<Toast {toasts}
  on:dismiss={(e) => drop(e.detail.id)}
  on:action={(e) => { undo(e.detail.toast); drop(e.detail.id); }} />

push({ text: 'Lectura registrada: BAT001, 1 248 h.' })
push({ tone: 'positive', text: 'OT-0042 completada.', action: 'Deshacer' })
push({ tone: 'critical', text: 'No se guardó OT-0042.', action: 'Reintentar' })`,

    alert: `<Alert tone="attention" title="BAT001 no registra lecturas hace 47 días">
  Sin lecturas, la proyección de vencimiento es adivinanza.
  <button slot="actions" on:click={openReading}>Registrar lectura</button>
</Alert>

<Alert tone="info" mark={false} live={false}>
  El IVA se calcula al 13 % sobre el subtotal de cada línea.
</Alert>`,

    empty: `<EmptyState
  title="Todavía no hay planes."
  action="Configurar familias"
  secondary="Registrar equipo"
  on:action={goFamilies} on:secondary={newAsset}>
  El programa se arma solo: definí una familia de equipo, dale una plantilla
  de mantenimiento, y cada máquina de esa familia hereda su plan.
</EmptyState>

<!-- Una búsqueda que no encontró nada NO es un patio sin máquinas -->
<EmptyState kind="filtered" inline
  title={'Ningún servicio coincide con «' + q + '».'}
  action="Limpiar la búsqueda" on:action={clear} />`,

    error: `<ErrorState
  title="No se pudo cargar la flota."
  recovery="Es una interrupción del servicio, no de tus datos: nada se perdió.
            Reintentá; si en unos minutos sigue igual, avisale a soporte con el
            código de abajo."
  code="req_9f3ac21b"
  busy={retrying}
  on:retry={load} />

<!-- Si las filas viejas siguen en pantalla, es una banda, no una lápida -->
<ErrorState band
  title="No se pudo actualizar."
  recovery="Lo que ves es de hace 4 minutos."
  retry="Reintentar" on:retry={load} />`,

    skeleton: `{#if loading}
  <div class="card">
    <Skeleton variant="circle" label="Cargando la ficha del equipo" />
    <Skeleton variant="text" lines={3} />
    <Skeleton variant="block" height="var(--sx-s-16)" />
  </div>
{:else}
  <Ficha {asset} />
{/if}`,

    progress: `<Progress label="Leyendo documentos" value={read} max={34}
          valueText={read + ' de 34'}
          hint="Todavía no se escribió nada: al final vas a poder revisarlo." />

<Progress label="Registrando" indeterminate
          hint="No cierres esta pestaña." />

<Progress label="Espacio del plan" value={92} tone="attention"
          valueText="92 % usado" size="sm" />`,

    review: `<ReviewPanel
  title="Lo que se entendió"
  note="6 archivos · papelería OPRA"
  items={preview.files}
  state={writing ? 'working' : wrote ? 'done' : 'review'}
  noun={['documento', 'documentos']}
  selectable
  on:commit={(e) => write(e.detail.ids)}
  on:cancel={backToFiles} />

<!-- Otro producto, mismo componente: -->
<ReviewPanel items={rows} noun={['precio', 'precios']}
  verb={{ infinitive: 'aplicar', commit: 'Aplicar', doing: 'Aplicando…',
          done: 'aplicado', donePlural: 'aplicados' }} />`
  };
</script>

<svelte:head><title>Retroalimentación · Strix</title></svelte:head>

<Toast
  {toasts}
  on:dismiss={(e) => drop(e.detail.id)}
  on:action={(e) => {
    push({ tone: 'neutral', text: `«${e.detail.toast.action}» quedó registrado en la demo.` });
    drop(e.detail.id);
  }}
/>

<div class="page">
  <header class="lede">
    <p class="sx-cap">Familia</p>
    <h1>Retroalimentación</h1>
    <p class="thesis">
      Todo lo que el sistema contesta. Nueve componentes que cubren cuatro momentos: cuando el sistema
      espera a una persona, cuando una persona espera al sistema, cuando algo ya pasó, y cuando no hay
      nada que mostrar. Elegí por ese eje y casi nunca vas a elegir mal; elegí por cuán fuerte se siente
      el mensaje y terminás con la pantalla donde un guardado fallido es un toast, una lista vacía es un
      error, y un diálogo de confirmación cuida algo que se puede deshacer.
    </p>

    <nav class="jump" aria-label="Componentes de esta página">
      {#each NAV as [id, name] (id)}
        <a href="#{id}" class="sx-id">{name}</a>
      {/each}
    </nav>
  </header>

  <section class="chooser" aria-labelledby="chooser-h">
    <h2 id="chooser-h">Cuál, en una tabla</h2>
    <div class="scroller">
      <table>
        <thead>
          <tr>
            <th scope="col"><span class="sx-cap">Quién espera</span></th>
            <th scope="col"><span class="sx-cap">Componente</span></th>
            <th scope="col"><span class="sx-cap">La pregunta que lo decide</span></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">El sistema espera a una persona</th>
            <td><b class="sx-id">Dialog</b> · <b class="sx-id">Confirm</b> · <b class="sx-id">ReviewPanel</b></td>
            <td>¿Hace falta una decisión antes de escribir algo?</td>
          </tr>
          <tr>
            <th scope="row">Una persona espera al sistema</th>
            <td><b class="sx-id">Skeleton</b> · <b class="sx-id">Progress</b></td>
            <td>¿Se sabe cuánto falta? Si sí, Progress. Si no y es corto, Skeleton.</td>
          </tr>
          <tr>
            <th scope="row">Ya pasó algo</th>
            <td><b class="sx-id">Toast</b> · <b class="sx-id">Alert</b></td>
            <td>¿Sigue siendo cierto? Si sigue, se queda en la página: Alert.</td>
          </tr>
          <tr>
            <th scope="row">No hay nada que mostrar</th>
            <td><b class="sx-id">EmptyState</b> · <b class="sx-id">ErrorState</b></td>
            <td>¿Está vacío o falló la lectura? Nunca son lo mismo.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="aside">
      Las tres reglas del sistema valen acá igual que en todos lados: el color nunca viaja solo — un tono
      siempre trae su palabra y casi siempre su forma —, las cifras que se comparan van en tabulares, y
      el cromo es acromático: el único color de estos nueve componentes es semántico.
    </p>
  </section>

  <!-- ══ DIALOG ══════════════════════════════════════════════════════════ -->
  <section class="c" id="dialog">
    <header class="chead">
      <h2><span class="sx-id">Dialog</span></h2>
      <p class="one">Lo único en una superficie Strix que de verdad flota, y por eso lo único con <span class="sx-id">--sx-e-3</span>.</p>
    </header>

    <div class="when">
      <div class="use">
        <p class="sx-cap">Usalo</p>
        <ul>
          <li>Para una decisión o un formulario corto que no cabe en la página sin perder el lugar.</li>
          <li>Cuando lo de atrás tiene que quedarse quieto mientras esto se contesta.</li>
        </ul>
      </div>
      <div class="dont">
        <p class="sx-cap">No lo usés</p>
        <ul>
          <li>Si hay que comparar contra lo que está detrás. Un diálogo es una pared.</li>
          <li>Para una pregunta destructiva: eso es <span class="sx-id">Confirm</span>, que ya trae el argumento hecho.</li>
          <li>Para avisar que algo salió bien. Un diálogo que solo dice «listo» es una puerta que hay que cerrar para salir de un cuarto al que nadie quiso entrar.</li>
        </ul>
      </div>
    </div>

    <div class="demo">
      <div class="row">
        <button class="btn solid" on:click={() => (dlg = 'form')}>Abrir un diálogo</button>
        <button class="btn" on:click={() => (dlg = 'long')}>Uno largo, que hace scroll</button>
        <button class="btn" on:click={() => (dlg = 'locked')}>Uno que no se puede descartar</button>
      </div>
      <p class="tip">
        Con el diálogo abierto: <b>Tab</b> da vueltas adentro y nunca se escapa. <b>Escape</b> lo cierra y no
        llega al Shell. Arrastrá desde adentro del texto y soltá sobre el scrim: no se cierra, porque para
        descartar hacen falta las dos puntas afuera. Al cerrar, el foco vuelve exactamente al botón que lo abrió.
      </p>
    </div>

    <div class="code">
      <button class="copy" on:click={() => copy('dialog', CODE.dialog)}>{copied === 'dialog' ? 'Markup copiado' : 'Copiar el markup'}</button>
      <pre><code>{CODE.dialog}</code></pre>
    </div>

    <dl class="api">
      <div><dt class="sx-id">title</dt><dd>El nombre, para el ojo y para el árbol de accesibilidad. Obligatorio.</dd></div>
      <div><dt class="sx-id">note</dt><dd>La línea de asunto: cuál máquina, cuál orden. Se vuelve la descripción.</dd></div>
      <div><dt class="sx-id">size</dt><dd><code>sm</code> · <code>md</code> · <code>lg</code>. Medidos en <code>ch</code>, porque lo que decide el ancho de un diálogo es la medida del texto.</dd></div>
      <div><dt class="sx-id">dismissible</dt><dd><code>false</code> mientras se escribe: sin ✕, sin Escape, sin scrim. La tecla igual se traga.</dd></div>
      <div><dt class="sx-id">on:close</dt><dd>Lo desmontás vos. Se monta con <code>{'{#if}'}</code>, nunca se esconde.</dd></div>
      <div><dt class="sx-id">data-sx-autofocus</dt><dd>Poneselo al campo que debe recibir el foco. Sin eso, el foco va al panel y el lector lee el título antes que un botón.</dd></div>
    </dl>
  </section>

  <!-- ══ CONFIRM ═════════════════════════════════════════════════════════ -->
  <section class="c" id="confirm">
    <header class="chead">
      <h2><span class="sx-id">Confirm</span></h2>
      <p class="one">La pregunta destructiva, hecha de la única forma en que vale la pena hacerla: nombrando lo que se pierde <em>antes</em> de preguntar.</p>
    </header>

    <div class="when">
      <div class="use">
        <p class="sx-cap">Usalo</p>
        <ul>
          <li>Cuando la acción destruye algo que no vuelve, y se puede decir en números qué destruye.</li>
          <li>Cuando interrumpe trabajo de otra persona: cancelar una orden abierta, cerrar un período.</li>
        </ul>
      </div>
      <div class="dont">
        <p class="sx-cap">No lo usés</p>
        <ul>
          <li>Si la acción se puede deshacer. Hacela y ofrecé «Deshacer» en un Toast: es más rápido para el noventa por ciento que sí quería, e igual de seguro para el diez que no.</li>
          <li>Para pedir que escriban el código de la máquina. Ese patrón le cobra su seguridad al técnico con guantes mojados parado al lado de una batidora prendida. Nombrar la pérdida <em>es</em> la seguridad.</li>
        </ul>
      </div>
    </div>

    <div class="demo">
      <div class="row">
        <button class="btn danger" on:click={() => (asking = 'plan')}>Eliminar el plan</button>
        <button class="btn" on:click={() => (asking = 'order')}>Cancelar la orden OT-0042</button>
      </div>
      <p class="tip">
        El botón destructivo nunca arranca con el foco: el foco cae en el panel para que se lea la pérdida
        primero, y la primera parada de <b>Tab</b> es Cancelar. Confirmá el primero para ver el estado
        ocupado — mientras escribe, ni Escape ni el scrim descartan.
      </p>
      <p class="tip">
        <b>«Cancelar la orden» pide un motivo, y es obligatorio.</b> Es <span class="sx-id">reasonLabel</span> +
        <span class="sx-id">reasonRequired</span>, no un <span class="sx-id">Dialog</span> más un
        <span class="sx-id">Textarea</span> armados a mano al lado — eso es justo lo que este par de props
        reemplaza. «Cancelar la orden» se queda deshabilitado —con el motivo dicho, no callado— hasta que
        haya texto, y el foco sigue cayendo en el panel al abrir, no en el campo.
      </p>
    </div>

    <div class="code">
      <button class="copy" on:click={() => copy('confirm', CODE.confirm)}>{copied === 'confirm' ? 'Markup copiado' : 'Copiar el markup'}</button>
      <pre><code>{CODE.confirm}</code></pre>
    </div>

    <dl class="api">
      <div><dt class="sx-id">action</dt><dd>La frase verbal. Titula el diálogo <em>y</em> etiqueta el botón, con las mismas palabras.</dd></div>
      <div><dt class="sx-id">subject</dt><dd>Sobre qué actúa: un código, un nombre, un rango de fechas.</dd></div>
      <div><dt class="sx-id">loses</dt><dd><code>'texto'</code> o <code>{'{ n, text }'}</code>. Con <code>n</code> las cifras se alinean en su propia columna y tres pérdidas se leen como un conteo.</dd></div>
      <div><dt class="sx-id">keeps</dt><dd>Lo que <em>no</em> se toca. Decilo cuando sea cierto: el silencio se lee como «se va todo».</dd></div>
      <div><dt class="sx-id">reversible</dt><dd><code>true</code> solo si de verdad se puede revertir desde la interfaz. Cambia la última línea antes del botón.</dd></div>
      <div><dt class="sx-id">busy</dt><dd>La escritura va en camino: los dos botones se congelan y el diálogo se cierra por dentro.</dd></div>
      <div><dt class="sx-id">reasonLabel</dt><dd>Vacío (el default) ⇒ sin campo. Cualquier otro texto lo prende y lo etiqueta — ver la demo de «Cancelar la orden», abajo.</dd></div>
      <div><dt class="sx-id">reasonRequired</dt><dd>Del que llama, nunca del componente. Si es <code>true</code>, «{action}» queda deshabilitado —con su motivo dicho en voz alta, no en silencio— hasta que haya texto.</dd></div>
      <div><dt class="sx-id">reasonError</dt> · <dt class="sx-id">reasonFix</dt><dd>El mismo par de todo el sistema: qué está mal, cómo se arregla. Se reenvían directo al <span class="sx-id">Textarea</span> de adentro.</dd></div>
      <div><dt class="sx-id">on:confirm</dt><dd>El detalle trae <code>{'{ reason }'}</code> —vacío si <span class="sx-id">reasonLabel</span> nunca se usó— así que no hace falta leer una segunda variable aparte del evento.</dd></div>
    </dl>
  </section>

  <!-- ══ TOAST ═══════════════════════════════════════════════════════════ -->
  <section class="c" id="toast">
    <header class="chead">
      <h2><span class="sx-id">Toast</span></h2>
      <p class="one">Lo que pasó, después de que pasó, sin quitarle la pantalla a nadie. El componente es la <em>región</em>, no un mensaje: se monta una vez y se le pasa la lista.</p>
    </header>

    <div class="when">
      <div class="use">
        <p class="sx-cap">Usalo</p>
        <ul>
          <li>Para confirmar una acción que ya terminó, en una sola oración.</li>
          <li>Para ofrecer «Deshacer» — el sustituto correcto de la mitad de los <span class="sx-id">Confirm</span> que se escriben.</li>
        </ul>
      </div>
      <div class="dont">
        <p class="sx-cap">No lo usés</p>
        <ul>
          <li>Para algo que hay que atender antes de seguir: eso es un Alert en el flujo, o un Dialog.</li>
          <li>Para un error de campo. Ese mensaje va al lado del campo, no en la esquina.</li>
          <li>Para algo que haya que poder releer después. Un toast no es una bitácora.</li>
        </ul>
      </div>
    </div>

    <div class="demo">
      <div class="row">
        <button class="btn" on:click={() => push({ text: 'Lectura registrada: BAT001, 1 248 h.' })}>Neutro</button>
        <button class="btn" on:click={() => push({ tone: 'positive', text: 'OT-0042 completada. ₡184 500 en repuestos.' })}>Positivo</button>
        <button class="btn" on:click={() => push({ tone: 'positive', text: 'Plan eliminado: Cambio de aceite 250 h.', action: 'Deshacer' })}>Con «Deshacer»</button>
        <button class="btn" on:click={() => push({ tone: 'attention', text: 'La devolución DEV-118201 quedó esperando en pendientes.', action: 'Ver' })}>Atención</button>
        <button class="btn" on:click={() => push({ tone: 'critical', text: 'No se guardó la orden OT-0042: se cayó la conexión.', action: 'Reintentar' })}>Crítico (no se va solo)</button>
      </div>
      <p class="tip">
        Tres reglas de tiempo, y son todo el diseño: uno normal se va a los 6 s; uno con acción vive el doble,
        porque un «Deshacer» que desaparece en seis segundos es una promesa que la interfaz no cumple; uno
        crítico no se va nunca solo. Pasá el mouse por encima o entrá con <b>Tab</b>: todos los relojes se
        pausan mientras se lee. Los críticos hablan por <code>assertive</code> y el resto por <code>polite</code>,
        en dos regiones separadas, porque la cortesía no se puede mezclar en una sola.
      </p>
    </div>

    <div class="code">
      <button class="copy" on:click={() => copy('toast', CODE.toast)}>{copied === 'toast' ? 'Markup copiado' : 'Copiar el markup'}</button>
      <pre><code>{CODE.toast}</code></pre>
    </div>

    <dl class="api">
      <div><dt class="sx-id">toasts</dt><dd><code>{'[{ id, text, tone?, action?, duration? }]'}</code>. El <code>id</code> tiene que ser estable y único.</dd></div>
      <div><dt class="sx-id">duration</dt><dd>Cuánto vive uno normal. <code>duration: 0</code> en un toast lo vuelve permanente.</dd></div>
      <div><dt class="sx-id">on:dismiss</dt><dd><code>{'{ id, toast }'}</code>. Sacalo vos de la lista: el componente no es dueño de tus datos.</dd></div>
      <div><dt class="sx-id">on:action</dt><dd>Se disparó el botón. Normalmente hacés la acción y descartás.</dd></div>
    </dl>
  </section>

  <!-- ══ ALERT ═══════════════════════════════════════════════════════════ -->
  <section class="c" id="alert">
    <header class="chead">
      <h2><span class="sx-id">Alert</span></h2>
      <p class="one">Una condición que la superficie tiene que decir, en su lugar y mientras siga siendo cierta.</p>
    </header>

    <div class="when">
      <div class="use">
        <p class="sx-cap">Usalo</p>
        <ul>
          <li>Arriba de aquello de lo que habla, y solo mientras la condición dure.</li>
          <li>Cuando trae la acción que la resuelve: un aviso sin salida es media ayuda.</li>
        </ul>
      </div>
      <div class="dont">
        <p class="sx-cap">No lo usés</p>
        <ul>
          <li>Para el resultado de un botón que se acaba de apretar: eso es un Toast.</li>
          <li>Para explicar una lista vacía. Que la lista se explique sola con un <span class="sx-id">EmptyState</span>.</li>
          <li>Tres a la vez. Tres bandas apiladas son cero bandas leídas.</li>
        </ul>
      </div>
    </div>

    <div class="demo stack">
      <Alert tone="critical" live={false} title="La orden OT-0042 no se pudo cerrar">
        El repuesto FCM-03 quedó con existencia negativa. Ajustá la bodega o quitá la línea, y volvé a cerrarla.
      </Alert>

      <Alert tone="attention" live={false} title="BAT001 no registra lecturas hace 47 días">
        Sin lecturas la proyección es adivinanza: la fecha de vencimiento que ves está calculada con el
        consumo de marzo.
        <svelte:fragment slot="actions">
          <button class="btn sm" on:click={() => push({ text: 'Abriría el formulario de lectura de BAT001.' })}>Registrar lectura</button>
          <button class="btn sm ghost" on:click={() => push({ text: 'Iría a la ficha de BAT001.' })}>Ver la máquina</button>
        </svelte:fragment>
      </Alert>

      <Alert tone="positive" live={false} title="Toda la flota al día">
        22 planes corriendo, ninguno por vencer en los próximos 30 días.
      </Alert>

      <Alert tone="info" live={false} title="Este patio factura con IVA incluido">
        Los precios del catálogo ya traen el 13 %. En las órdenes de trabajo el impuesto se calcula aparte,
        línea por línea.
      </Alert>

      <Alert tone="neutral" live={false} mark={false} dismissible on:dismiss={() => push({ text: 'La banda se descartó.' })}>
        La bodega Opra cierra el 25 de diciembre. Las órdenes con fecha de ese día se reprograman solas.
      </Alert>
    </div>
    <p class="tip">
      Los cinco tonos traen su forma: palomita, triángulo, cuadrado, anillo, barra — distinguibles por
      <em>silueta</em> a 9px, en una fotocopia y para quien no separa el verde del ámbar. Son las mismas cinco
      de <span class="sx-id">Pill</span>: un vocabulario o ninguno. Acá van con <code>live={'{false}'}</code>
      porque cinco bandas de catálogo son documentación, no cinco interrupciones.
    </p>

    <div class="code">
      <button class="copy" on:click={() => copy('alert', CODE.alert)}>{copied === 'alert' ? 'Markup copiado' : 'Copiar el markup'}</button>
      <pre><code>{CODE.alert}</code></pre>
    </div>

    <dl class="api">
      <div><dt class="sx-id">tone</dt><dd><code>positive</code> · <code>attention</code> · <code>critical</code> · <code>info</code> · <code>neutral</code>.</dd></div>
      <div><dt class="sx-id">title</dt><dd>La condición. El slot lleva el detalle.</dd></div>
      <div><dt class="sx-id">slot="actions"</dt><dd>La salida. Ponela cuando exista.</dd></div>
      <div><dt class="sx-id">live</dt><dd>Anunciar al aparecer. Solo <code>critical</code> interrumpe; el resto espera su turno.</dd></div>
      <div><dt class="sx-id">dismissible</dt><dd>Solo para un aviso que una persona tiene derecho a dejar de ver.</dd></div>
    </dl>
  </section>

  <!-- ══ EMPTYSTATE ══════════════════════════════════════════════════════ -->
  <section class="c" id="empty">
    <header class="chead">
      <h2><span class="sx-id">EmptyState</span></h2>
      <p class="one">La superficie sin nada adentro — que es la primera que una persona conoce, y por la que juzga el producto.</p>
    </header>

    <div class="when">
      <div class="use">
        <p class="sx-cap">Usalo</p>
        <ul>
          <li><code>kind="empty"</code> cuando nunca hubo nada: es una invitación y tiene que nombrar la <em>única</em> acción que la termina.</li>
          <li><code>kind="filtered"</code> cuando el filtro no encontró nada: es una corrección, y su único trabajo es devolver el filtro.</li>
        </ul>
      </div>
      <div class="dont">
        <p class="sx-cap">No lo usés</p>
        <ul>
          <li>Cuando la lista está vacía porque la lectura falló. Un corte disfrazado de invitación es la frase más tranquila de la pantalla justo cuando alguien tiene que mirar.</li>
          <li>Mientras los datos vienen en camino. Eso es <span class="sx-id">Skeleton</span>: un vacío que parpadea 200 ms enseña que el producto está roto.</li>
          <li>Con «no hay datos». Eso es un hecho sobre la base de datos, no una puerta.</li>
        </ul>
      </div>
    </div>

    <div class="demo stack">
      <EmptyState
        title="Todavía no hay planes."
        action="Configurar familias"
        secondary="Registrar equipo"
        on:action={() => push({ text: 'Iría a familias de equipo.' })}
        on:secondary={() => push({ text: 'Abriría el alta de equipo.' })}
      >
        El programa se arma solo: definí una familia de equipo, dale una plantilla de mantenimiento, y cada
        máquina de esa familia hereda su plan.
      </EmptyState>

      <EmptyState
        kind="filtered"
        title="Nada en «Guanacaste» coincide con «BAT9»."
        action="Quitar los dos filtros"
        on:action={() => push({ text: 'Limpiaría la búsqueda y la ubicación.' })}
      >
        Hay 22 máquinas en el patio y 6 en Guanacaste. Ninguna se llama así.
      </EmptyState>

      <div class="inline-demo">
        <p class="sx-cap">Y adentro de una lista, en una línea:</p>
        <EmptyState
          kind="filtered"
          inline
          title="Ningún servicio sin cerrar coincide con «CL33»."
          action="Quitar ambos filtros"
          on:action={() => push({ text: 'Volvería al libro completo.' })}
        />
      </div>
    </div>

    <div class="code">
      <button class="copy" on:click={() => copy('empty', CODE.empty)}>{copied === 'empty' ? 'Markup copiado' : 'Copiar el markup'}</button>
      <pre><code>{CODE.empty}</code></pre>
    </div>

    <dl class="api">
      <div><dt class="sx-id">kind</dt><dd><code>empty</code> (nunca hubo nada) · <code>filtered</code> (el filtro no encontró). Se llamaba <code>first</code> acá y <code>empty</code> en <span class="sx-id">DataState</span>, para la misma situación; ahora es una palabra y <code>first</code> sigue funcionando.</dd></div>
      <div><dt class="sx-id">title</dt><dd>La oración entera, con punto. Es una afirmación, no un encabezado.</dd></div>
      <div><dt class="sx-id">action</dt><dd>La única acción que termina el vacío. <code>secondary</code> solo si existe de verdad.</dd></div>
      <div><dt class="sx-id">inline</dt><dd>Una línea adentro de la lista, con el control que deshace el filtro dentro de la oración.</dd></div>
      <div><dt class="sx-id">compact</dt><dd>La misma tarjeta con menos aire. La misma palabra significa lo mismo en <span class="sx-id">ErrorState</span> y en <span class="sx-id">DataState</span>.</dd></div>
      <div><dt class="sx-id">slot="art"</dt><dd>Reemplaza el dibujo. El de <code>empty</code> es una bandeja abierta; el de <code>filtered</code>, una lupa.</dd></div>
    </dl>
  </section>

  <!-- ══ ERRORSTATE ══════════════════════════════════════════════════════ -->
  <section class="c" id="error">
    <header class="chead">
      <h2><span class="sx-id">ErrorState</span></h2>
      <p class="one">Lo que no se pudo leer, dicho en las dos mitades de las que está hecho un error: <b>el problema</b> y <b>la salida</b>.</p>
    </header>

    <div class="when">
      <div class="use">
        <p class="sx-cap">Usalo</p>
        <ul>
          <li>Cuando la superficie no se pudo cargar y no hay nada viejo que mostrar.</li>
          <li><code>band</code> cuando las filas viejas siguen en pantalla: un refresco fallido <em>no</em> es una lista vacía, y reemplazar los datos que alguien estaba leyendo hace un segundo es decirle que ya no existen.</li>
        </ul>
      </div>
      <div class="dont">
        <p class="sx-cap">No lo usés</p>
        <ul>
          <li>Para un resultado vacío. Un filtro que no coincidió no es una falla.</li>
          <li>Para un campo mal llenado. Ese mensaje va pegado al campo.</li>
          <li>Para una acción que falló mientras el resto de la pantalla sigue bien: eso es un Toast crítico con «Reintentar». Tirar una pantalla de contexto para reportar un guardado es su propio bug.</li>
          <li>Con «Reintentar» y nada más. Reintentar solo es una esperanza; si es lo único que hay, decí por qué esta vez podría funcionar.</li>
        </ul>
      </div>
    </div>

    <div class="demo stack">
      <ErrorState
        live={false}
        title="No se pudo cargar la flota."
        recovery="Es una interrupción del servicio, no de tus datos: nada de lo que registraste se perdió. Reintentá; si en unos minutos sigue igual, avisale a soporte con el código de abajo."
        code="req_9f3ac21b·2026-07-14T09:12Z"
        busy={retrying}
        secondary="Ver el estado del servicio"
        on:retry={retry}
        on:secondary={() => push({ text: 'Abriría el estado del servicio.' })}
      />

      <div class="stale">
        <ErrorState
          live={false}
          band
          title="No se pudo actualizar el libro de servicios."
          recovery="Lo que ves abajo es de hace 4 minutos."
          retry="Reintentar"
          on:retry={() => push({ tone: 'critical', text: 'Sigue sin responder.' })}
        />
        <div class="ghost-rows" aria-hidden="true">
          <div class="grow"><span class="sx-id">OT-0041</span><span class="sx-id">BAT007</span><span class="sx-num">₡84 300</span></div>
          <div class="grow"><span class="sx-id">OT-0040</span><span class="sx-id">CL445926</span><span class="sx-num">₡212 750</span></div>
          <div class="grow"><span class="sx-id">OT-0039</span><span class="sx-id">BAT014</span><span class="sx-num">₡31 200</span></div>
        </div>
      </div>
    </div>
    <p class="tip">
      Apretá <b>Reintentar</b> arriba para ver el estado ocupado. El código de soporte vive detrás de una
      divulgación porque quien lee el error no lo necesita: lo necesita la persona a la que va a llamar. Y el
      control dice «Copiar el código», así que la confirmación dice «Código copiado» — la misma palabra.
    </p>

    <div class="code">
      <button class="copy" on:click={() => copy('error', CODE.error)}>{copied === 'error' ? 'Markup copiado' : 'Copiar el markup'}</button>
      <pre><code>{CODE.error}</code></pre>
    </div>

    <dl class="api">
      <div><dt class="sx-id">title</dt><dd>El problema, en oración entera y en las palabras de quien lee.</dd></div>
      <div><dt class="sx-id">recovery</dt><dd>Qué hacer. Es la mitad que siempre se cae del error.</dd></div>
      <div><dt class="sx-id">retry</dt><dd>Etiqueta del control que reintenta. Vacío ⇒ no hay reintento, y algunas fallas no lo tienen.</dd></div>
      <div><dt class="sx-id">code</dt><dd>Id de correlación o de ticket: el hilo que seis meses después contesta «¿por qué el sistema creyó eso?».</dd></div>
      <div><dt class="sx-id">band</dt><dd>Banda sobre datos que siguen en pantalla, en vez de tarjeta en su lugar.</dd></div>
      <div><dt class="sx-id">compact</dt><dd>La misma tarjeta con menos aire. La misma palabra significa lo mismo en <span class="sx-id">EmptyState</span> y en <span class="sx-id">DataState</span>.</dd></div>
    </dl>
  </section>

  <!-- ══ SKELETON ════════════════════════════════════════════════════════ -->
  <section class="c" id="skeleton">
    <header class="chead">
      <h2><span class="sx-id">Skeleton</span></h2>
      <p class="one">La forma de lo que viene, sosteniéndole el lugar mientras viene.</p>
    </header>

    <div class="when">
      <div class="use">
        <p class="sx-cap">Usalo</p>
        <ul>
          <li>Cuando podés reservar el espacio <em>exacto</em> que va a ocupar el contenido real.</li>
          <li>Entre 300 ms y unos diez segundos. Ese es su rango entero.</li>
        </ul>
      </div>
      <div class="dont">
        <p class="sx-cap">No lo usés</p>
        <ul>
          <li>Por debajo de 300 ms: un esqueleto que parpadea se lee como un defecto. Sostené el estado anterior.</li>
          <li>Cuando la espera se puede medir. Eso es <span class="sx-id">Progress</span>; a los diez segundos «ya casi» es mentira.</li>
          <li>Para una acción que alguien acaba de disparar: eso es el estado ocupado del botón, justo donde está mirando.</li>
          <li>Si no coincide con lo que lo reemplaza. Un esqueleto que promete un layout y después lo rompe es peor que un spinner.</li>
        </ul>
      </div>
    </div>

    <div class="demo">
      <div class="row">
        <button class="btn" on:click={fakeLoad}>Simular una carga de 2,2 s</button>
      </div>
      <div class="fichas">
        {#if loaded}
          <article class="ficha">
            <div class="avatar sx-num">07</div>
            <div class="fbody">
              <p class="ftitle"><b class="sx-id">BAT007</b> · Batidora de concreto 1 saco</p>
              <p class="fmeta">Guanacaste · eléctrica · 1 248 h · próximo servicio en 12 días</p>
              <div class="fbar"><span class="sx-num">₡84 300 en repuestos este año</span></div>
            </div>
          </article>
        {:else}
          <article class="ficha">
            <Skeleton variant="circle" label="Cargando la ficha del equipo" />
            <div class="fbody">
              <Skeleton variant="text" lines={2} />
              <Skeleton variant="block" height="var(--sx-s-12)" />
            </div>
          </article>
        {/if}
      </div>
      <p class="tip">
        Una sola anunciación por <em>región</em>, no una por forma: acá solo el círculo lleva <code>label</code>.
        Cinco «cargando» en una región viva son cinco interrupciones para una sola espera. Con
        <code>prefers-reduced-motion</code> el barrido no se congela a medio camino: desaparece, y queda la
        forma quieta.
      </p>
    </div>

    <div class="code">
      <button class="copy" on:click={() => copy('skeleton', CODE.skeleton)}>{copied === 'skeleton' ? 'Markup copiado' : 'Copiar el markup'}</button>
      <pre><code>{CODE.skeleton}</code></pre>
    </div>

    <dl class="api">
      <div><dt class="sx-id">variant</dt><dd><code>text</code> (la última línea sale corta, como la prosa de verdad) · <code>block</code> · <code>circle</code>.</dd></div>
      <div><dt class="sx-id">lines</dt><dd>Solo para <code>text</code>.</dd></div>
      <div><dt class="sx-id">width · height · radius</dt><dd>Cualquier longitud CSS. Pasá tokens, o <code>%</code> para calzar con una columna.</dd></div>
      <div><dt class="sx-id">label</dt><dd>Solo en el esqueleto más externo, y que nombre qué carga: «Cargando la flota» se merece oírse, «Cargando» no.</dd></div>
    </dl>
  </section>

  <!-- ══ PROGRESS ════════════════════════════════════════════════════════ -->
  <section class="c" id="progress">
    <header class="chead">
      <h2><span class="sx-id">Progress</span></h2>
      <p class="one">Una espera con forma. Determinada siempre que el número se sepa — y en este sistema casi siempre se sabe.</p>
    </header>

    <div class="when">
      <div class="use">
        <p class="sx-cap">Usalo</p>
        <ul>
          <li>Cuando hay un total: 34 documentos, 400 filas, 6 archivos. «11 de 34» le dice a alguien si esperar o irse a hacer otra cosa, que es la única decisión que una barra existe para sostener.</li>
          <li>Para una ocupación que se acerca a un límite, con tono.</li>
        </ul>
      </div>
      <div class="dont">
        <p class="sx-cap">No lo usés</p>
        <ul>
          <li>Para menos de un segundo: aparece y desaparece, y se lee como un parpadeo.</li>
          <li>Dos veces en la misma pantalla. Una pantalla con tres barras es una pantalla que no decidió qué está haciendo.</li>
          <li>Solo con porcentaje, si se puede evitar: 60 % ¿de qué?</li>
        </ul>
      </div>
    </div>

    <div class="demo stack">
      <div class="row">
        <button class="btn" on:click={runProgress} disabled={ticking}>
          {ticking ? 'Leyendo…' : 'Simular la lectura de 34 documentos'}
        </button>
      </div>

      <Progress
        label="Leyendo documentos"
        value={read}
        max={total}
        valueText={`${read} de ${total}`}
        hint="Todavía no se escribió nada: al terminar vas a poder revisarlo antes de registrar."
      />

      <Progress label="Registrando en el servidor" indeterminate hint="No cierres esta pestaña." />

      <Progress label="Espacio del plan" value={92} valueText="92 % usado · 46 de 50 equipos" tone="attention" />

      <div class="mini">
        <span class="sx-cap">Tamaño <code>sm</code>, adentro de una fila</span>
        <Progress value={read} max={total} size="sm" label="Lectura del lote" />
      </div>
    </div>
    <p class="tip">
      La cifra va en tabulares porque cambia en el lugar: con figuras proporcionales, el «1» hace temblar la
      línea entera en cada tick. La indeterminada tiene su propia regla para <code>prefers-reduced-motion</code>:
      el reset global le congelaría la franja a mitad de camino, así que en vez de eso se vuelve una pista
      encendida y quieta, y la palabra hace el trabajo.
    </p>

    <div class="code">
      <button class="copy" on:click={() => copy('progress', CODE.progress)}>{copied === 'progress' ? 'Markup copiado' : 'Copiar el markup'}</button>
      <pre><code>{CODE.progress}</code></pre>
    </div>

    <dl class="api">
      <div><dt class="sx-id">value · max</dt><dd><code>value</code> nulo ⇒ indeterminada, y el <code>aria-valuenow</code> desaparece en vez de mentir un cero.</dd></div>
      <div><dt class="sx-id">valueText</dt><dd>Lo que lee una persona: «11 de 34», «92 % usado». También es el <code>aria-valuetext</code>.</dd></div>
      <div><dt class="sx-id">hint</dt><dd>Qué no hacer mientras corre, o qué pasa después.</dd></div>
      <div><dt class="sx-id">tone</dt><dd><code>accent</code> · <code>positive</code> · <code>attention</code> · <code>critical</code>. Con tono, siempre con palabra.</dd></div>
      <div><dt class="sx-id">size</dt><dd><code>sm</code> deja solo la barra, para una fila o la esquina de una tarjeta.</dd></div>
    </dl>
  </section>

  <!-- ══ REVIEWPANEL ═════════════════════════════════════════════════════ -->
  <section class="c" id="review">
    <header class="chead">
      <h2><span class="sx-id">ReviewPanel</span></h2>
      <p class="one">
        Nada se escribe hasta que una persona lo diga, y antes de decirlo ve exactamente qué se escribiría.
        Es el mecanismo que hace que Strix pueda leer documentos sin que dé miedo.
      </p>
    </header>

    <div class="when">
      <div class="use">
        <p class="sx-cap">Usalo</p>
        <ul>
          <li>Para cualquier lote de <em>propuestas</em>: documentos leídos, una lista de precios, filas de una integración, lo que sacó un modelo.</li>
          <li>Cuando cada fila tiene su propio veredicto y su propia razón.</li>
          <li>Con <code>selectable</code> cuando una persona debe poder sacar una fila del lote antes de confirmar.</li>
        </ul>
      </div>
      <div class="dont">
        <p class="sx-cap">No lo usés</p>
        <ul>
          <li>Para un solo objeto que alguien está editando: eso es un formulario con su botón de guardar.</li>
          <li>Para una acción sin resultado por ítem: un <span class="sx-id">Confirm</span> es más chico y más claro.</li>
          <li>Como comprobante. Una vez escrito, el registro va a la bitácora del módulo, no a un panel que desaparece.</li>
        </ul>
      </div>
    </div>

    <div class="contract">
      <p class="sx-cap">El contrato que este panel asume</p>
      <p>
        La vista previa y el registro son <b>la misma petición con una bandera cambiada</b>, y la confirmación
        reenvía el payload exacto que produjo los veredictos en pantalla. Cualquier otra cosa y lo que una
        persona aprobó y lo que el servidor escribe son dos cosas distintas que apenas se parecen. El
        componente no puede hacer cumplir eso solo — por eso está escrito acá.
      </p>
    </div>

    <div class="demo">
      <ReviewPanel
        title="Lo que se entendió"
        note={rp === 'done'
          ? '5 archivos · papelería OPRA · ya escrito'
          : '5 archivos · papelería OPRA · nada escrito todavía'}
        items={batch}
        state={rp}
        noun={['documento', 'documentos']}
        selectable
        on:commit={commit}
        on:cancel={() => push({ text: 'Volvería a la lista de archivos.' })}
        on:done={() => (rp = 'review')}
        on:toggle={(e) => push({ text: e.detail.included ? 'Vuelve al lote.' : 'Sale del lote.' })}
      />
      <p class="tip">
        Cinco veredictos, y el vocabulario es fijo a propósito: <b>se va a registrar</b> · <b>falta contestar</b> ·
        <b>no se va a registrar</b> · <b>ya estaba</b> · <b>se omite</b>. Ese último es un <em>éxito</em>: veinte
        puntales correctamente no son una máquina, y pintar eso de ámbar enseña a ignorar el ámbar. Lo que pide
        atención sube solo al principio de la lista. Destildá una fila y mirá cómo cambian, a la vez, la oración
        de arriba y el botón de abajo.
      </p>
    </div>

    <div class="demo">
      <p class="sx-cap">El estado que más se olvida: la vista previa que apaga su propio botón</p>
      <ReviewPanel
        items={stuck}
        noun={['documento', 'documentos']}
        cancelLabel="Volver a los archivos"
        on:cancel={() => push({ text: 'Volvería a la lista de archivos.' })}
      />
    </div>

    <div class="demo">
      <p class="sx-cap">Y el lote vacío</p>
      <ReviewPanel items={[]} />
    </div>

    <div class="code">
      <button class="copy" on:click={() => copy('review', CODE.review)}>{copied === 'review' ? 'Markup copiado' : 'Copiar el markup'}</button>
      <pre><code>{CODE.review}</code></pre>
    </div>

    <dl class="api">
      <div><dt class="sx-id">items</dt><dd><code>{'{ id, verdict, kind?, code?, title?, meta?, message?, fix?, lines?, footnote? }'}</code>.</dd></div>
      <div><dt class="sx-id">verdict</dt><dd><code>write</code> · <code>question</code> · <code>block</code> · <code>duplicate</code> · <code>skip</code>. Fijos para todo el ecosistema.</dd></div>
      <div><dt class="sx-id">state</dt><dd><code>review</code> · <code>working</code> · <code>done</code>. En <code>done</code> las palabras pasan a pasado solas.</dd></div>
      <div><dt class="sx-id">verb</dt><dd>El verbo del producto en cinco formas: <code>{'{ infinitive, commit, doing, done, donePlural }'}</code>. Parcial: lo que no pasás queda por defecto.</dd></div>
      <div><dt class="sx-id">noun</dt><dd><code>['documento', 'documentos']</code> — lo que se está revisando, para que las oraciones concuerden.</dd></div>
      <div><dt class="sx-id">on:commit</dt><dd><code>{'{ ids, items }'}</code>: solo los que quedaron adentro.</dd></div>
      <div><dt class="sx-id">item.fix</dt><dd>La salida de ese ítem. Un veredicto que no dice qué hacer es media ayuda.</dd></div>
      <div><dt class="sx-id">item.footnote</dt><dd>Lo que no frena nada, detrás de una divulgación. Quien aprueba 200 filas las sella; a quien se le piden cuatro campos, los revisa.</dd></div>
    </dl>
  </section>

  <!-- ══ NOTAS ═══════════════════════════════════════════════════════════ -->
  <section class="c" id="notas">
    <header class="chead">
      <h2>Lo que esta familia le pide al sistema</h2>
      <p class="one">Todo lo de arriba está hecho solo con <span class="sx-id">--sx-*</span>. Estas tres cosas hicieron falta y no existían.</p>
    </header>

    <ul class="gaps">
      <li>
        <b>Un token de scrim.</b> El velo del <span class="sx-id">Dialog</span> se mezcla con
        <code>color-mix(in srgb, var(--sx-n-900) 42%, transparent)</code> en vez de inventarse un hex. Un
        <code>--sx-scrim</code> por tema lo resolvería, y en oscuro probablemente quiera ser más denso.
      </li>
      <li>
        <b>Un tamaño de texto de 16px para controles.</b> No hay ninguno: <code>--sx-t-md</code> son 15px y por
        debajo de 16 iOS hace zoom al enfocar un campo. Esta familia lo esquivó — <span class="sx-id">Confirm</span>
        a propósito no pide escribir nada —, pero la familia de formularios se va a topar con eso de frente.
      </li>
      <li>
        <b>Las cinco formas de tono, en un solo lugar.</b> Hoy viven en <span class="sx-id">Pill.svelte</span> y,
        copiadas, en <span class="sx-id">Alert.svelte</span> (de donde las importan Toast y ReviewPanel). Deberían
        subir a <code>src/lib/marks.js</code> para que las dos copias no puedan separarse nunca.
      </li>
      <li>
        <b>Botones.</b> Los controles de estos componentes están declarados adentro de cada archivo, mínimos y
        hechos solo de tokens, porque la familia de controles es hermana y esta no mete la mano ahí. Cuando
        aterrice <span class="sx-id">Button</span>, esas tres reglas por archivo son exactamente lo que reemplaza.
      </li>
    </ul>
  </section>
</div>

<!-- ══ Los diálogos vivos de la página ═══════════════════════════════════ -->
{#if dlg === 'form'}
  <Dialog title="Registrar lectura" note="BAT007 · horómetro · Bodega Opra" on:close={() => (dlg = '')}>
    <p class="dlg-p">La última lectura fue de 1 200 h el 28 de junio. El plan siguiente vence a las 1 250 h.</p>
    <label class="dlg-l sx-cap" for="demo-h">Horómetro (h)</label>
    <input id="demo-h" class="dlg-i sx-num" data-sx-autofocus type="text" inputmode="numeric" bind:value={reading} />
    <p class="dlg-h">Se guarda con la fecha de hoy y con tu usuario.</p>
    <svelte:fragment slot="foot">
      <button class="btn" on:click={() => (dlg = '')} disabled={saving}>Cancelar</button>
      <button class="btn solid" on:click={saveReading} disabled={saving}>
        {saving ? 'Guardando…' : 'Guardar la lectura'}
      </button>
    </svelte:fragment>
  </Dialog>
{/if}

{#if dlg === 'long'}
  <Dialog title="Actividades de la familia «Batidoras»" note="45 códigos · el cuerpo hace scroll, el pie no" size="lg" on:close={() => (dlg = '')}>
    <ul class="acts-list">
      {#each ['M-01 Revisión de tambor', 'M-02 Ajuste de corona y piñón', 'M-03 Cambio de aceite de motor', 'M-04 Revisión de chumaceras', 'E-01 Revisión de tablero', 'E-02 Continuidad de bobinado', 'E-03 Cambio de contactor', 'L-01 Engrase general', 'L-02 Cambio de grasa de rodamientos', 'I-01 Calibración de horómetro', 'I-02 Revisión de tacómetro', 'M-05 Revisión de llantas y ejes', 'M-06 Torque de pernos de chasis', 'E-04 Prueba de aislamiento', 'L-03 Nivel de aceite de reductor'] as a, i (a)}
        <li><b class="sx-id">{a.slice(0, 4)}</b><span>{a.slice(5)}</span><span class="sx-num dim">cada {[30, 60, 90, 180, 360][i % 5]} d</span></li>
      {/each}
    </ul>
    <svelte:fragment slot="foot">
      <button class="btn solid" on:click={() => (dlg = '')}>Cerrar</button>
    </svelte:fragment>
  </Dialog>
{/if}

{#if dlg === 'locked'}
  <Dialog title="Registrando 34 documentos" note="No cierres esta pestaña" dismissible={false} on:close={() => {}}>
    <p class="dlg-p">
      Mientras esto corre no hay ✕, Escape no cierra — y tampoco se escapa hacia el Shell — y el scrim no
      descarta. Cuando termine, el diálogo se desmonta solo.
    </p>
    <Progress label="Escribiendo" indeterminate hint="Empezó hace unos segundos." />
    <svelte:fragment slot="foot">
      <button class="btn" bind:this={ringTarget} on:click={() => (dlg = '')}>Salir de la demo</button>
      <button class="btn solid" on:click={showRing}>Enfocar el otro botón</button>
    </svelte:fragment>
  </Dialog>
{/if}

{#if asking === 'plan'}
  <Confirm
    action="Eliminar el plan"
    subject="Cambio de aceite 250 h · BAT007"
    loses={[
      { n: 3, text: 'servicios ya registrados quedan sin plan' },
      { n: 1, text: 'proyección de vencimiento deja de calcularse' },
      { n: 22, text: 'días de aviso anticipado se pierden' }
    ]}
    keeps={['El historial de servicios de BAT007 no se toca', 'La plantilla de la familia «Batidoras» sigue igual']}
    busy={removing}
    busyNote="Eliminando el plan…"
    on:confirm={reallyRemove}
    on:cancel={() => (asking = '')}
  />
{/if}

{#if asking === 'order'}
  <Confirm
    action="Cancelar la orden"
    subject="OT-0042 · BAT007 · abierta hace 6 días"
    tone="attention"
    reversible
    loses={[
      { n: 2, text: 'líneas de repuesto vuelven a bodega' },
      { n: 1, text: 'aviso le llega a Jose Leobardo Gonzalez' }
    ]}
    keeps={['El plan sigue corriendo y va a volver a vencer']}
    cancelLabel="Dejarla abierta"
    reasonLabel="Motivo de la cancelación"
    reasonRequired
    reasonHint="Le llega a Jose Leobardo Gonzalez junto con el aviso."
    bind:reason={cancelReason}
    on:confirm={(e) => {
      asking = '';
      cancelReason = '';
      push({ tone: 'attention', text: `OT-0042 quedó cancelada: «${e.detail.reason}».`, action: 'Deshacer' });
    }}
    on:cancel={() => { asking = ''; cancelReason = ''; }}
  />
{/if}

<style>
  .page {
    max-width: 76ch;
    margin: 0 auto;
    padding: var(--sx-s-10) var(--sx-s-5) var(--sx-s-20);
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-16);
    color: var(--sx-ink);
  }

  /* ── La cabecera ─────────────────────────────────────────────────────── */
  .lede h1 {
    margin: var(--sx-s-2) 0 0;
    font-size: var(--sx-t-3xl);
    font-weight: var(--sx-w-bold);
    letter-spacing: -.04em;
    line-height: 1.02;
  }
  .thesis {
    margin: var(--sx-s-5) 0 0;
    font-size: var(--sx-t-lg);
    line-height: 1.5;
    color: var(--sx-ink-2);
    max-width: 62ch;
  }
  .jump { display: flex; flex-wrap: wrap; gap: var(--sx-s-2); margin-top: var(--sx-s-6); }
  .jump a {
    padding: var(--sx-s-1) var(--sx-s-3);
    background: var(--sx-sunk);
    color: var(--sx-ink-2);
    border-radius: var(--sx-r-pill);
    font-size: var(--sx-t-xs);
    text-decoration: none;
    transition: background var(--sx-fast) var(--sx-ease), color var(--sx-fast) var(--sx-ease);
  }
  .jump a:hover { background: var(--sx-neutral-band); color: var(--sx-ink); }

  /* ── La tabla de elección ────────────────────────────────────────────── */
  .chooser h2, .c h2 {
    margin: 0;
    font-size: var(--sx-t-xl);
    font-weight: var(--sx-w-semi);
    letter-spacing: -.03em;
  }
  .scroller {
    margin-top: var(--sx-s-4);
    overflow-x: auto;
    background: var(--sx-surface);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-1);
  }
  table { width: 100%; border-collapse: collapse; min-width: 46ch; }
  th, td {
    text-align: left;
    padding: var(--sx-s-3) var(--sx-s-4);
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-normal);
    vertical-align: top;
  }
  thead th { padding-bottom: var(--sx-s-2); }
  tbody th { font-weight: var(--sx-w-semi); color: var(--sx-ink); }
  tbody td { color: var(--sx-ink-2); }
  tbody tr + tr th, tbody tr + tr td { box-shadow: inset 0 1px 0 var(--sx-line); }
  .aside {
    margin: var(--sx-s-4) 0 0;
    font-size: var(--sx-t-sm);
    line-height: 1.6;
    color: var(--sx-ink-3);
    max-width: 66ch;
  }

  /* ── Una sección de componente ───────────────────────────────────────── */
  .c { display: flex; flex-direction: column; gap: var(--sx-s-5); scroll-margin-top: var(--sx-s-6); }
  .chead .one {
    margin: var(--sx-s-2) 0 0;
    font-size: var(--sx-t-md);
    line-height: 1.55;
    color: var(--sx-ink-2);
    max-width: 64ch;
  }

  .when { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sx-s-4); }
  .use, .dont {
    padding: var(--sx-s-4);
    border-radius: var(--sx-r-2);
    background: var(--sx-surface);
    box-shadow: var(--sx-e-1);
  }
  /* Sí y no se separan por una barra de tono, no por color de texto: la palabra
     de arriba ya lo dice, y la barra es la que se ve de reojo. */
  .use { box-shadow: var(--sx-e-1), inset 3px 0 0 var(--sx-positive); }
  .dont { box-shadow: var(--sx-e-1), inset 3px 0 0 var(--sx-critical); }
  .when ul { margin: var(--sx-s-2) 0 0; padding-left: var(--sx-s-4); }
  .when li { font-size: var(--sx-t-sm); line-height: 1.55; color: var(--sx-ink-2); margin-bottom: var(--sx-s-2); }
  .when li:last-child { margin-bottom: 0; }

  .demo {
    padding: var(--sx-s-5);
    background: var(--sx-ground);
    border-radius: var(--sx-r-3);
    box-shadow: inset 0 0 0 1px var(--sx-line);
  }
  .demo.stack, .demo .fichas { display: flex; flex-direction: column; gap: var(--sx-s-4); }
  .row { display: flex; flex-wrap: wrap; gap: var(--sx-s-2); }
  .demo .row + :global(*) { margin-top: var(--sx-s-4); }
  .tip {
    margin: var(--sx-s-4) 0 0;
    font-size: var(--sx-t-xs);
    line-height: 1.65;
    color: var(--sx-ink-3);
    max-width: 70ch;
  }
  .tip b { color: var(--sx-ink-2); font-weight: var(--sx-w-semi); }
  .inline-demo {
    padding: var(--sx-s-4);
    background: var(--sx-surface);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-1);
  }
  .inline-demo :global(.sx-cap) { display: block; margin-bottom: var(--sx-s-3); }

  .contract {
    padding: var(--sx-s-4);
    background: var(--sx-info-band);
    border: 1px solid var(--sx-info-edge);
    border-radius: var(--sx-r-2);
  }
  .contract p { margin: var(--sx-s-2) 0 0; font-size: var(--sx-t-sm); line-height: 1.6; color: var(--sx-ink); max-width: 66ch; }

  /* Filas viejas debajo de la banda de error: existen para que se vea que
     siguen ahí, así que no son legibles ni interactivas. */
  .stale { background: var(--sx-surface); border-radius: var(--sx-r-2); padding: var(--sx-s-3); box-shadow: var(--sx-e-1); }
  .ghost-rows { margin-top: var(--sx-s-3); opacity: .45; display: flex; flex-direction: column; gap: var(--sx-s-1); }
  .grow {
    display: flex; justify-content: space-between; gap: var(--sx-s-3);
    padding: var(--sx-s-2) var(--sx-s-3);
    background: var(--sx-sunk);
    border-radius: var(--sx-r-1);
    font-size: var(--sx-t-xs);
    color: var(--sx-ink-2);
  }

  /* La ficha que carga */
  .ficha {
    display: flex;
    gap: var(--sx-s-4);
    padding: var(--sx-s-4);
    background: var(--sx-surface);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-1);
  }
  .fbody { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--sx-s-3); }
  .avatar {
    flex: none;
    width: var(--sx-s-10); height: var(--sx-s-10);
    display: flex; align-items: center; justify-content: center;
    background: var(--sx-accent-soft);
    color: var(--sx-ink);
    border-radius: var(--sx-r-pill);
    font-weight: var(--sx-w-bold);
    font-size: var(--sx-t-sm);
  }
  .ftitle { margin: 0; font-size: var(--sx-t-sm); }
  .fmeta { margin: 0; font-size: var(--sx-t-xs); color: var(--sx-ink-3); }
  .fbar {
    display: flex; align-items: center;
    height: var(--sx-s-12);
    padding: 0 var(--sx-s-4);
    background: var(--sx-sunk);
    border-radius: var(--sx-r-2);
    font-size: var(--sx-t-xs);
    color: var(--sx-ink-2);
  }

  .mini {
    display: flex; align-items: center; gap: var(--sx-s-4);
    padding: var(--sx-s-3) var(--sx-s-4);
    background: var(--sx-surface);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-1);
  }
  .mini :global(.wrap) { flex: 1; }

  /* ── Código ──────────────────────────────────────────────────────────── */
  .code { position: relative; }
  pre {
    margin: 0;
    padding: var(--sx-s-4);
    padding-top: var(--sx-s-10);
    background: var(--sx-n-900);
    color: var(--sx-n-100);
    border-radius: var(--sx-r-2);
    overflow-x: auto;
    font-family: var(--sx-font-mono);
    font-size: var(--sx-t-xs);
    line-height: 1.7;
  }
  .copy {
    position: absolute;
    top: var(--sx-s-3);
    right: var(--sx-s-3);
    z-index: 1;
    padding: var(--sx-s-1) var(--sx-s-3);
    background: var(--sx-n-700);
    color: var(--sx-n-50);
    border: none;
    border-radius: var(--sx-r-pill);
    font: inherit;
    font-size: var(--sx-t-2xs);
    font-weight: var(--sx-w-semi);
    cursor: pointer;
    transition: background var(--sx-fast) var(--sx-ease);
  }
  .copy:hover { background: var(--sx-n-500); }

  /* ── API ─────────────────────────────────────────────────────────────── */
  .api { margin: 0; display: flex; flex-direction: column; gap: var(--sx-s-2); }
  .api > div {
    display: grid;
    grid-template-columns: minmax(10ch, 18ch) 1fr;
    gap: var(--sx-s-4);
    padding: var(--sx-s-2) 0;
    box-shadow: inset 0 1px 0 var(--sx-line);
  }
  .api dt { font-size: var(--sx-t-xs); font-weight: var(--sx-w-semi); color: var(--sx-ink); }
  .api dd { margin: 0; font-size: var(--sx-t-sm); line-height: 1.55; color: var(--sx-ink-2); }
  code {
    font-family: var(--sx-font-mono);
    font-size: .92em;
    padding: 1px var(--sx-s-1);
    background: var(--sx-sunk);
    border-radius: var(--sx-r-1);
  }
  /* The inline `code` chip above is a chip; inside a block it is the block. */
  pre code { padding: 0; background: none; font-size: inherit; border-radius: 0; }

  .gaps { margin: 0; padding-left: var(--sx-s-5); display: flex; flex-direction: column; gap: var(--sx-s-3); }
  .gaps li { font-size: var(--sx-t-sm); line-height: 1.6; color: var(--sx-ink-2); max-width: 70ch; }
  .gaps b { color: var(--sx-ink); font-weight: var(--sx-w-semi); }

  /* ── Los controles de la demo ────────────────────────────────────────── */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--sx-s-2);
    min-height: var(--sx-s-10);
    padding: var(--sx-s-2) var(--sx-s-4);
    background: var(--sx-surface);
    color: var(--sx-ink);
    border: 1px solid var(--sx-edge);
    border-radius: var(--sx-r-pill);
    font: inherit;
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-semi);
    cursor: pointer;
    transition: background var(--sx-fast) var(--sx-ease), transform var(--sx-fast) var(--sx-ease);
  }
  .btn:hover:not(:disabled) { background: var(--sx-sunk); }
  .btn:disabled { opacity: .55; cursor: not-allowed; }
  .btn.solid { background: var(--sx-accent); color: var(--sx-accent-ink); border-color: transparent; }
  .btn.solid:hover:not(:disabled) { transform: translateY(-1px); }
  .btn.danger { background: var(--sx-critical); color: var(--sx-ink-on); border-color: transparent; }
  .btn.danger:hover:not(:disabled) { transform: translateY(-1px); }
  .btn.sm { min-height: var(--sx-s-8); padding: var(--sx-s-1) var(--sx-s-3); font-size: var(--sx-t-xs); }
  .btn.ghost { background: transparent; border-color: transparent; }

  /* ── Contenido de los diálogos de la demo ────────────────────────────── */
  .dlg-p { margin: 0 0 var(--sx-s-4); font-size: var(--sx-t-sm); color: var(--sx-ink-2); line-height: 1.55; }
  .dlg-l { display: block; margin-bottom: var(--sx-s-2); }
  .dlg-i {
    width: 100%;
    min-height: var(--sx-s-10);
    padding: var(--sx-s-2) var(--sx-s-3);
    background: var(--sx-surface);
    color: var(--sx-ink);
    border: 1px solid var(--sx-edge);
    border-radius: var(--sx-r-1);
    font: inherit;
  }
  .dlg-h { margin: var(--sx-s-2) 0 0; font-size: var(--sx-t-xs); color: var(--sx-ink-3); }
  .acts-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--sx-s-1); }
  .acts-list li {
    display: flex; align-items: baseline; gap: var(--sx-s-3);
    padding: var(--sx-s-2) var(--sx-s-3);
    background: var(--sx-sunk);
    border-radius: var(--sx-r-1);
    font-size: var(--sx-t-sm);
  }
  .acts-list li span:first-of-type { flex: 1; color: var(--sx-ink-2); }
  .dim { color: var(--sx-ink-3); font-size: var(--sx-t-xs); }

  /* ── Angosto ─────────────────────────────────────────────────────────── */
  @media (max-width: 720px) {
    .page { padding: var(--sx-s-6) var(--sx-s-4) var(--sx-s-16); gap: var(--sx-s-12); }
    .lede h1 { font-size: var(--sx-t-2xl); }
    .thesis { font-size: var(--sx-t-md); }
    .when { grid-template-columns: 1fr; }
    .demo { padding: var(--sx-s-4); }
    .api > div { grid-template-columns: 1fr; gap: var(--sx-s-1); }
    .ficha { flex-direction: column; }
    .mini { flex-direction: column; align-items: stretch; gap: var(--sx-s-2); }
  }
  @media (pointer: coarse) {
    .btn { min-height: var(--sx-touch); }
    .btn.sm { min-height: var(--sx-touch); }
    .jump a { min-height: var(--sx-touch); display: inline-flex; align-items: center; }
    .copy { min-height: var(--sx-s-8); }
    /* 16px, o iOS hace zoom a toda la página al enfocar el campo. El sistema no
       tiene un token de ese tamaño — `--sx-t-md` son 15 —, así que acá se toma
       prestado el del ritmo, que sí vale 16. Está anotado abajo, en lo que esta
       familia le pide al sistema. */
    .dlg-i { font-size: var(--sx-s-4); }
  }
</style>
