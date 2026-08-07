<script>
  // TERCER EJEMPLO: el formulario largo.
  //
  // Flota enseña cómo se ve la librería mostrando datos; Lectura, qué pasa
  // cuando alguien escribe algo que no cuadra. Esta enseña la tercera cosa, que
  // es la que se rompe primero en un producto real: qué pasa cuando hay CUARENTA
  // campos en la pantalla en vez de cuatro. Con cuatro campos cualquier
  // distribución sirve; con cuarenta, lo único que hace legible la pantalla es
  // que los tamaños de letra digan quién manda sobre quién.
  //
  // Este archivo no define ni un color, ni un radio, ni una sombra. Aporta
  // layout: qué está adentro de qué, y cuánto aire hay en medio.
  import {
    PageHeader, Tabs, Panel, Well, Stack, Row, Divider, Toolbar, Glyph,
    Button, IconButton, Pill,
    Field, Input, NumberInput, Textarea, Select, Checkbox,
    Alert, Confirm, Toast
  } from '@strix/frontend-lib';

  // Los datos de esta pantalla no están en data.js —data.js es de la flota— así
  // que viven acá arriba, con la forma que tiene el módulo de mantenimiento de
  // verdad. La familia sí es la misma: BAT-014 en Flota es uno de estos catorce.
  const EQUIPOS_CON_EL_PLAN = 14;

  // «Cliente» en Strix es el ESPACIO DE TRABAJO —el tenant—, nunca la empresa
  // que alquila la máquina. Como la palabra se malinterpreta sola, en la
  // pantalla se escribe «espacio de trabajo» y se deja «cliente» para el código.
  const HEREDADO_DEL_CLIENTE = '10';

  const CATEGORIAS = [
    { value: 'liviano', label: 'Equipo liviano de obra' },
    { value: 'pesado', label: 'Equipo pesado y movimiento de tierra' },
    { value: 'planta', label: 'Planta, generación y compresores' },
    { value: 'flota', label: 'Flota vehicular' },
    { value: 'cocina', label: 'Panadería y cocina industrial' }
  ];

  const UNIDADES = [
    { value: 'h', label: 'Horas (h)' },
    { value: 'km', label: 'Kilómetros (km)' },
    { value: 'd', label: 'Días afuera (d)' },
    { value: 'ciclos', label: 'Ciclos de batido' },
    { value: 'm3', label: 'Metros cúbicos batidos (m³)' }
  ];
  const SIMBOLO = { h: 'h', km: 'km', d: 'd', ciclos: 'ciclos', m3: 'm³' };

  // Las cuatro fuentes se llaman así en el resto del producto —en el importador,
  // en la bitácora, en el CSV— así que la pantalla las llama igual. Traducirlas
  // solo acá obliga a traducirlas de vuelta cuando alguien reporta un problema.
  const FUENTES = [
    { value: 'MANUAL', label: 'MANUAL · alguien la anota' },
    { value: 'DISPATCH', label: 'DISPATCH · salidas y devoluciones' },
    { value: 'SCHEDULE', label: 'SCHEDULE · ritmo declarado' },
    { value: 'IOT', label: 'IOT · dispositivo en la máquina' }
  ];
  const NOTA_FUENTE = {
    MANUAL: 'Avanza cuando alguien registra la lectura. Entre una y otra, el vencimiento se proyecta.',
    DISPATCH: 'Avanza con lo que dicen las salidas y devoluciones en PDF. Nadie tiene que leer nada en el patio.',
    SCHEDULE: 'No se mide: se supone. Solo cubre a los equipos que no tienen ninguna fuente observada.',
    IOT: 'Llega del dispositivo instalado en la máquina. Es la fuente más fina y la que menos se atiende.'
  };

  const UNIDADES_CAL = [
    { value: 'días', label: 'días' },
    { value: 'meses', label: 'meses' },
    { value: 'años', label: 'años' }
  ];

  const REPETICION = [
    { value: 'una', label: 'Una sola vez' },
    { value: 'diario', label: 'Todos los días hasta que se atienda' },
    { value: 'semanal', label: 'Una vez por semana hasta que se atienda' }
  ];

  const SECCIONES = { identidad: 'Identidad', metricas: 'Métricas', tareas: 'Tareas', alertas: 'Alertas' };

  // El estado guardado. Es un `let` y no un `const` porque Guardar lo reemplaza:
  // «descartar» significa volver a lo último guardado, no volver al arranque.
  let base = {
    nombre: 'Batidoras de concreto y mortero',
    codigo: 'BAT',
    descripcion:
      'Batidoras de tambor basculante de 120 a 250 litros, con motor de gasolina o eléctrico. ' +
      'Se alquilan por día y salen a obra en pick-up, así que casi todas vuelven sucias y con el horómetro sin leer.',
    categoria: 'liviano',
    relojes: [
      { id: 'rel-motor', nombre: 'Horas de motor', unidad: 'h', fuente: 'MANUAL', ritmo: '' },
      { id: 'rel-afuera', nombre: 'Días afuera', unidad: 'd', fuente: 'DISPATCH', ritmo: '' },
      { id: 'rel-obra', nombre: 'Horas de operación en obra', unidad: 'h', fuente: 'SCHEDULE', ritmo: '6' }
    ],
    tareas: [
      { id: 'tar-aceite', nombre: 'Cambio de aceite y filtro · motor Honda GX-390', cada: '6', unidadCal: 'meses', usoCada: '250', usoReloj: 'rel-motor' },
      { id: 'tar-engrase', nombre: 'Engrase de corona, piñón y rodamientos del tambor', cada: '2', unidadCal: 'meses', usoCada: '100', usoReloj: 'rel-motor' },
      { id: 'tar-refri', nombre: 'Cambio de refrigerante · cada 3 000 h', cada: '', unidadCal: 'meses', usoCada: '3000', usoReloj: 'rel-motor' },
      { id: 'tar-aspas', nombre: 'Revisión de aspas y paletas de batido', cada: '', unidadCal: 'meses', usoCada: '300', usoReloj: 'rel-obra' },
      { id: 'tar-tablero', nombre: 'Prueba de aislamiento eléctrico del tablero', cada: '12', unidadCal: 'meses', usoCada: '', usoReloj: '' },
      { id: 'tar-mangueras', nombre: 'Inspección de mangueras y acople de descarga', cada: '45', unidadCal: 'días', usoCada: '', usoReloj: '' }
    ],
    anticipoDias: '15',
    anticipoUso: '85',
    repetir: 'semanal',
    avisaBodega: true,
    avisaTaller: true,
    avisaCoordinacion: false,
    vigilarSinLectura: true,
    diasSinLectura: '30'
  };

  let nombre = base.nombre;
  let codigo = base.codigo;
  let descripcion = base.descripcion;
  let categoria = base.categoria;
  let relojes = base.relojes.map((r) => ({ ...r }));
  let tareas = base.tareas.map((t) => ({ ...t }));
  let anticipoDias = base.anticipoDias;
  let anticipoUso = base.anticipoUso;
  let repetir = base.repetir;
  let avisaBodega = base.avisaBodega;
  let avisaTaller = base.avisaTaller;
  let avisaCoordinacion = base.avisaCoordinacion;
  let vigilarSinLectura = base.vigilarSinLectura;
  let diasSinLectura = base.diasSinLectura;

  let seccion = 'identidad';
  let editando = null;   // la tarea abierta en edición; una a la vez
  let intentado = false;
  let borrando = false;
  let toasts = [];
  let nuevos = 0;
  let deshacer = null;   // la foto anterior a un «quitar», para el Deshacer del toast

  // Ninguna de estas sentencias usa un helper declarado afuera: una sentencia
  // reactiva solo rastrea los nombres escritos DENTRO de ella, y un `const` que
  // cierra sobre estado reactivo es invisible para el compilador. Ese bug ya se
  // envió cinco veces en este ecosistema. Las expresiones van enteras adentro.
  $: cambioIdentidad =
    nombre !== base.nombre ||
    codigo !== base.codigo ||
    descripcion !== base.descripcion ||
    categoria !== base.categoria;

  $: cambioMetricas = JSON.stringify(relojes) !== JSON.stringify(base.relojes);
  $: cambioTareas = JSON.stringify(tareas) !== JSON.stringify(base.tareas);

  $: cambioAlertas =
    anticipoDias !== base.anticipoDias ||
    anticipoUso !== base.anticipoUso ||
    repetir !== base.repetir ||
    avisaBodega !== base.avisaBodega ||
    avisaTaller !== base.avisaTaller ||
    avisaCoordinacion !== base.avisaCoordinacion ||
    vigilarSinLectura !== base.vigilarSinLectura ||
    diasSinLectura !== base.diasSinLectura;

  // El pie NOMBRA las secciones que cambiaron, y no solo dice «hay cambios».
  // Con cuatro pestañas, lo que se cambió casi nunca es lo que se está viendo, y
  // «tenés cambios sin guardar» a secas obliga a abrir las cuatro para buscarlos.
  //
  // AUSENCIA DE LA LIBRERÍA: Tabs no tiene cómo marcar una pestaña como
  // «modificada». `count` es una cifra —y usarla para decir «acá hay algo» sería
  // un 1 que no cuenta nada—, así que el aviso se dice con palabras en el pie.
  $: cambiadas = [
    cambioIdentidad && SECCIONES.identidad,
    cambioMetricas && SECCIONES.metricas,
    cambioTareas && SECCIONES.tareas,
    cambioAlertas && SECCIONES.alertas
  ].filter(Boolean);

  $: sucio = cambiadas.length > 0;

  $: dondeCambio =
    cambiadas.length < 2
      ? cambiadas.join('')
      : cambiadas.slice(0, -1).join(', ') + ' y ' + cambiadas[cambiadas.length - 1];

  // Cada problema sabe en qué pestaña vive. Sin eso, un formulario con secciones
  // manda a buscar el error a ciegas — que es la forma más rápida de que alguien
  // presione Guardar tres veces y se vaya convencido de que el sistema falla.
  $: problemas = (() => {
    const p = [];
    if (nombre.trim() === '') p.push({ ir: 'identidad', texto: 'La familia no tiene nombre.' });
    if (!/^[A-Z]{2,4}$/.test(codigo))
      p.push({ ir: 'identidad', texto: 'El código tiene que ser de 2 a 4 letras mayúsculas, como BAT.' });
    for (const r of relojes) {
      if (r.nombre.trim() === '') p.push({ ir: 'metricas', texto: 'Hay un reloj sin nombre.' });
      else if (r.fuente === 'SCHEDULE' && r.ritmo === '')
        p.push({ ir: 'metricas', texto: `«${r.nombre}» es de ritmo declarado y no dice cuánto avanza por día.` });
    }
    for (const t of tareas) {
      if (t.nombre.trim() === '') p.push({ ir: 'tareas', texto: 'Hay una tarea sin nombre.' });
      else if (t.cada === '' && t.usoCada === '')
        p.push({ ir: 'tareas', texto: `«${t.nombre}» no tiene ningún intervalo: nunca va a vencer.` });
      else if (t.usoCada !== '' && t.usoReloj === '')
        p.push({ ir: 'tareas', texto: `«${t.nombre}» vence por uso pero no dice sobre cuál reloj.` });
    }
    if (!avisaBodega && !avisaTaller && !avisaCoordinacion)
      p.push({ ir: 'alertas', texto: 'Nadie recibe los avisos de esta familia.' });
    return p;
  })();

  // Los relojes observados le ganan al declarado, así que la pantalla dice
  // cuántos equipos quedan de verdad debajo del ritmo supuesto en vez de dejar
  // creer que aplica a los catorce.
  $: observados = relojes.filter((r) => r.fuente !== 'SCHEDULE').length;

  $: pestanas = [
    { key: 'identidad', label: SECCIONES.identidad },
    { key: 'metricas', label: SECCIONES.metricas, count: relojes.length },
    { key: 'tareas', label: SECCIONES.tareas, count: tareas.length },
    { key: 'alertas', label: SECCIONES.alertas }
  ];

  $: opcionesReloj = relojes.map((r) => ({ value: r.id, label: r.nombre || 'Reloj sin nombre' }));

  function avisar(t) {
    toasts = [...toasts, { id: `av-${++nuevos}`, ...t }];
  }
  function quitarToast(id) {
    toasts = toasts.filter((t) => t.id !== id);
  }

  function agregarReloj() {
    relojes = [...relojes, { id: `rel-${++nuevos}`, nombre: '', unidad: 'h', fuente: 'MANUAL', ritmo: '' }];
  }

  // Quitar un reloj deja tareas colgando de un reloj que ya no existe. En vez de
  // prohibirlo —y dejar a alguien atrapado sin poder reorganizar la familia— se
  // hace, se dice EN NÚMEROS qué se llevó por delante, y se ofrece deshacerlo.
  function quitarReloj(id) {
    if (relojes.length === 1) return;
    const reloj = relojes.find((r) => r.id === id);
    const afectadas = tareas.filter((t) => t.usoReloj === id).length;
    deshacer = { relojes: relojes.map((r) => ({ ...r })), tareas: tareas.map((t) => ({ ...t })) };
    relojes = relojes.filter((r) => r.id !== id);
    tareas = tareas.map((t) => (t.usoReloj === id ? { ...t, usoReloj: '', usoCada: '' } : t));
    avisar({
      tone: afectadas ? 'attention' : 'neutral',
      text: afectadas
        ? `Se quitó «${reloj.nombre}» y ${afectadas} tareas quedaron sin intervalo por uso.`
        : `Se quitó «${reloj.nombre}».`,
      action: 'Deshacer'
    });
  }

  function agregarTarea() {
    const id = `tar-${++nuevos}`;
    tareas = [...tareas, { id, nombre: '', cada: '', unidadCal: 'meses', usoCada: '', usoReloj: relojes[0]?.id ?? '' }];
    editando = id;
  }

  function quitarTarea(id) {
    const tarea = tareas.find((t) => t.id === id);
    deshacer = { relojes: relojes.map((r) => ({ ...r })), tareas: tareas.map((t) => ({ ...t })) };
    tareas = tareas.filter((t) => t.id !== id);
    if (editando === id) editando = null;
    avisar({ text: `Se quitó «${tarea.nombre || 'la tarea sin nombre'}».`, action: 'Deshacer' });
  }

  function revertir(id) {
    if (!deshacer) return;
    relojes = deshacer.relojes.map((r) => ({ ...r }));
    tareas = deshacer.tareas.map((t) => ({ ...t }));
    deshacer = null;
    quitarToast(id);
  }

  function guardar() {
    intentado = true;
    if (problemas.length) {
      seccion = problemas[0].ir;
      return;
    }
    base = {
      nombre, codigo, descripcion, categoria,
      relojes: relojes.map((r) => ({ ...r })),
      tareas: tareas.map((t) => ({ ...t })),
      anticipoDias, anticipoUso, repetir,
      avisaBodega, avisaTaller, avisaCoordinacion,
      vigilarSinLectura, diasSinLectura
    };
    avisar({ tone: 'positive', text: `Guardado. Los ${EQUIPOS_CON_EL_PLAN} equipos ya corren con este plan.` });
  }

  function descartar() {
    nombre = base.nombre;
    codigo = base.codigo;
    descripcion = base.descripcion;
    categoria = base.categoria;
    relojes = base.relojes.map((r) => ({ ...r }));
    tareas = base.tareas.map((t) => ({ ...t }));
    anticipoDias = base.anticipoDias;
    anticipoUso = base.anticipoUso;
    repetir = base.repetir;
    avisaBodega = base.avisaBodega;
    avisaTaller = base.avisaTaller;
    avisaCoordinacion = base.avisaCoordinacion;
    vigilarSinLectura = base.vigilarSinLectura;
    diasSinLectura = base.diasSinLectura;
    editando = null;
    intentado = false;
    deshacer = null;
  }

  function eliminarFamilia() {
    borrando = false;
    // En el producto real esto devuelve a la lista de familias y el toast es lo
    // primero que se ve al llegar. Acá el toast es lo único que se puede mostrar
    // sin inventarle una navegación al ejemplo.
    avisar({
      tone: 'attention',
      text: `Se eliminó «${nombre}». ${EQUIPOS_CON_EL_PLAN} equipos quedaron sin plan.`
    });
  }
</script>

<div class="pantalla">
  <PageHeader
    eyebrow={nombre || 'Familia sin nombre'}
    title="{EQUIPOS_CON_EL_PLAN} equipos siguen este plan."
    subtitle="Lo que se cambie acá les llega a los {EQUIPOS_CON_EL_PLAN} apenas se guarde: los relojes, las tareas y con cuánta anticipación avisan."
  >
    <!-- Un <a>, no un botón: lleva a otra pantalla, así que tiene que abrirse en
         una pestaña nueva con el botón del medio como cualquier enlace. -->
    <Button slot="actions" variant="ghost" href="#flota">Ver los {EQUIPOS_CON_EL_PLAN} equipos</Button>
  </PageHeader>

  <Panel
    title="Ajustes de la familia"
    sub="Las cuatro secciones se guardan juntas: hay un solo Guardar, abajo."
    level={2}
  >
    {#if intentado && problemas.length}
      <div class="antes">
        <Alert
          tone="critical"
          title={problemas.length === 1
            ? 'Falta una cosa para poder guardar'
            : `Faltan ${problemas.length} cosas para poder guardar`}
        >
          <Stack gap={2} as="ul">
            {#each problemas as p, i (i)}
              <Row gap={2} as="li">
                <span class="crece">{p.texto}</span>
                <!-- Visible corto, nombre accesible completo: «Ir a Métricas»
                     repetido tres veces deja a quien navega por lista de
                     controles sin saber cuál es cuál. -->
                <Button size="sm" variant="ghost" on:click={() => (seccion = p.ir)}>
                  Ir a {SECCIONES[p.ir]}<span class="sx-sr">: {p.texto}</span>
                </Button>
              </Row>
            {/each}
          </Stack>
        </Alert>
      </div>
    {/if}

    <!-- El contenido va DENTRO del slot de Tabs a propósito: así el
         `aria-controls` apunta a un panel que existe de verdad, en vez de a un
         id que alguien tiene que acordarse de renderizar. -->
    <Tabs items={pestanas} bind:value={seccion} label="Secciones de los ajustes">
      {#if seccion === 'identidad'}
        <Stack gap={5}>
          <div>
            <h3>Cómo se llama y qué agrupa</h3>
            <p class="nota">
              La familia es lo que decide qué tareas y qué relojes hereda un equipo.
              Cambiar el nombre no mueve nada; cambiar la categoría sí, porque de ahí
              salen las plantillas que se ofrecen al dar de alta una máquina nueva.
            </p>
          </div>

          <div class="campos">
            <Input
              label="Nombre de la familia"
              bind:value={nombre}
              required
              hint="Como se le dice en el patio, no como viene en la factura del proveedor."
              error={intentado && nombre.trim() === '' ? 'La familia no tiene nombre.' : ''}
              fix="Escribí el nombre con el que la piden por teléfono."
            />
            <Input
              label="Código"
              bind:value={codigo}
              mono
              required
              maxlength={4}
              hint="Es el prefijo del código de cada equipo: BAT-014, BAT-027."
              error={intentado && !/^[A-Z]{2,4}$/.test(codigo)
                ? 'El código tiene que ser de 2 a 4 letras mayúsculas.'
                : ''}
              fix="Sin números y sin guion: el guion y el consecutivo los pone el sistema."
            />
          </div>

          <Select
            label="Categoría"
            options={CATEGORIAS}
            bind:value={categoria}
            hint="Decide qué plantillas de tareas se ofrecen y en qué grupo salen estos equipos en los reportes."
          />

          <Textarea
            label="Descripción"
            optional
            rows={4}
            limit={400}
            bind:value={descripcion}
            hint="Lo que necesitaría saber alguien que entra al puesto en seis meses."
          />

          <Divider strong />

          <div>
            <h3>Eliminar la familia</h3>
            <p class="nota">
              Los {EQUIPOS_CON_EL_PLAN} equipos que hoy siguen este plan se quedan sin plan:
              no vencen, no avisan y dejan de aparecer en «por vencer». Siguen en la flota
              y con su historial, pero sin nada que les diga cuándo tocarlos.
            </p>
          </div>
          <Row>
            <!-- La puerta a lo destructivo no es roja. `danger` es el momento de
                 la irreversibilidad, y ese momento es el botón de adentro del
                 Confirm — rojo repartido por toda la pantalla es rojo que para
                 el jueves ya nadie lee. -->
            <Button on:click={() => (borrando = true)}>
              <Glyph slot="icon" name="trash" />
              Eliminar la familia
            </Button>
          </Row>
        </Stack>
      {/if}

      {#if seccion === 'metricas'}
        <Stack gap={5}>
          <div>
            <h3>Relojes de uso</h3>
            <p class="nota">
              Un plan corre contra dos relojes —el calendario y el uso— y vence con el
              que llegue primero. El calendario lo pone el sistema; los de uso los
              declara la familia, y son estos.
            </p>
          </div>

          <!-- `live={false}`: es una regla que ya era cierta antes de que alguien
               abriera la pantalla, no algo que acaba de pasar. Un banner estático
               que se anuncia al cargar es una interrupción sin noticia. -->
          <Alert tone="info" title="Lo observado le gana a lo declarado" live={false}>
            Si un equipo se mide de verdad —a mano, por documento o por dispositivo—
            esa lectura manda. Un ritmo declarado nunca pisa una máquina que sí reporta.
          </Alert>

          <Stack gap={4} as="ul">
            {#each relojes as r, i (r.id)}
              <Well as="li" pad={4} radius={2}>
                <Stack gap={4}>
                  <Row justify="between" gap={3}>
                    <h4>{r.nombre || 'Reloj sin nombre'}</h4>
                    <Row gap={2}>
                      <!-- Sin marca: la fuente es una etiqueta, no un estado. La
                           marca de Pill es para «vencido», «al día» y compañía. -->
                      <Pill tone="neutral" size="sm" mark={false}>{r.fuente}</Pill>
                      <IconButton
                        label="Quitar el reloj «{r.nombre || 'sin nombre'}»"
                        size="sm"
                        disabled={relojes.length === 1}
                        reason="Una familia necesita al menos un reloj de uso."
                        on:click={() => quitarReloj(r.id)}
                      >
                        <Glyph name="trash" />
                      </IconButton>
                    </Row>
                  </Row>

                  <div class="campos">
                    <Input
                      label="Nombre del reloj"
                      bind:value={relojes[i].nombre}
                      required
                      hint="Como lo diría alguien en el patio: «horas de motor»."
                      error={intentado && relojes[i].nombre.trim() === '' ? 'Este reloj no tiene nombre.' : ''}
                      fix="Ponele el nombre del instrumento que se lee, no el de la tarea."
                    />
                    <Select
                      label="Unidad"
                      options={UNIDADES}
                      bind:value={relojes[i].unidad}
                      hint="Un horómetro no retrocede: si una lectura baja, el sistema la rechaza."
                    />
                    <Select
                      label="De dónde sale el uso"
                      options={FUENTES}
                      bind:value={relojes[i].fuente}
                      hint={NOTA_FUENTE[r.fuente]}
                    />
                    {#if r.fuente === 'SCHEDULE'}
                      <NumberInput
                        label="Ritmo declarado"
                        unit="{SIMBOLO[r.unidad]}/día"
                        bind:value={relojes[i].ritmo}
                        stepper
                        step={0.5}
                        min="0"
                        align="right"
                        hint="Lo que se asume por cada día que el equipo está afuera. El horno de la panadería es el caso claro: 14 h/día."
                        error={intentado && relojes[i].ritmo === ''
                          ? 'Un reloj declarado sin ritmo no avanza nunca.'
                          : ''}
                        fix="Poné las horas que trabaja un día normal, aunque sea aproximado."
                      />
                    {/if}
                  </div>

                  {#if r.fuente === 'SCHEDULE'}
                    <p class="nota">
                      {#if observados > 0}
                        Este ritmo solo se aplica donde no hay nada que leer: los equipos que
                        reportan por los otros {observados} relojes lo ignoran.
                      {:else}
                        Ahora mismo ningún reloj de esta familia observa nada, así que los
                        {EQUIPOS_CON_EL_PLAN} equipos vencen sobre una suposición.
                      {/if}
                    </p>
                  {/if}
                </Stack>
              </Well>
            {/each}
          </Stack>

          <Row>
            <Button on:click={agregarReloj}>
              <Glyph slot="icon" name="plus" />
              Agregar un reloj
            </Button>
          </Row>
        </Stack>
      {/if}

      {#if seccion === 'tareas'}
        <Stack gap={5}>
          <div>
            <h3>Tareas de la familia</h3>
            <p class="nota">
              Cada uno de los {EQUIPOS_CON_EL_PLAN} equipos hereda estas {tareas.length} tareas.
              Una tarea puede vencer por calendario, por uso o por los dos, y con dos
              intervalos vence con el que llegue primero.
            </p>
          </div>

          <Stack gap={3} as="ul">
            {#each tareas as t, i (t.id)}
              <Well as="li" pad={4} radius={2}>
                <Stack gap={4}>
                  <!-- El resumen no se va cuando se abre la edición, y no es
                       decoración: el botón que abre es el mismo que cierra, así
                       que nunca desaparece bajo el foco de quien lo acaba de
                       presionar. Un control que se borra a sí mismo al activarse
                       deja a un teclado en <body> y de vuelta a tabular desde
                       arriba. De paso, las pastillas de intervalo se actualizan
                       mientras se escribe abajo. -->
                  <Row justify="between" gap={3}>
                    <div class="cara">
                      <h4>{t.nombre || 'Tarea sin nombre'}</h4>
                      <Row gap={2} as="p">
                        {#if t.cada}
                          <Pill tone="neutral" size="sm" mark={false}>cada {t.cada} {t.unidadCal}</Pill>
                        {/if}
                        {#if t.usoCada}
                          <Pill tone="neutral" size="sm" mark={false}>
                            cada {t.usoCada} {SIMBOLO[relojes.find((r) => r.id === t.usoReloj)?.unidad] ?? ''}
                            · {relojes.find((r) => r.id === t.usoReloj)?.nombre ?? 'sin reloj'}
                          </Pill>
                        {/if}
                        {#if !t.cada && !t.usoCada}
                          <Pill tone="attention" size="sm">Sin intervalo</Pill>
                        {/if}
                      </Row>
                      {#if t.cada && t.usoCada}
                        <p class="nota">Vence con el que llegue primero.</p>
                      {/if}
                    </div>
                    <!-- `aria-controls` solo cuando el bloque existe: un aria
                         que apunta a un id que nadie renderizó miente, y un aria
                         que miente es peor que ninguno. -->
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-expanded={editando === t.id}
                      aria-controls={editando === t.id ? `campos-${t.id}` : undefined}
                      on:click={() => (editando = editando === t.id ? null : t.id)}
                    >
                      {editando === t.id ? 'Cerrar' : 'Editar'}<span class="sx-sr">
                        la tarea {t.nombre || 'sin nombre'}</span>
                    </Button>
                  </Row>

                  {#if editando === t.id}
                    <Divider />
                    <Stack gap={4} id={`campos-${t.id}`}>
                      <Input
                        label="Qué se hace"
                        bind:value={tareas[i].nombre}
                        required
                        hint="El nombre completo, como va en la orden de trabajo."
                        error={intentado && tareas[i].nombre.trim() === '' ? 'Esta tarea no tiene nombre.' : ''}
                        fix="Escribí la acción y sobre qué: «Cambio de aceite y filtro · motor Honda GX-390»."
                      />

                      <!-- Los dos intervalos van uno DEBAJO del otro y no lado a
                           lado. Metidos los cuatro controles en una fila, cada
                           uno se queda con ~185px, «Calendario · cada» se parte
                           en dos líneas y la marca «opcional» cae en medio del
                           rótulo. Un rótulo partido a la mitad por su propia
                           etiqueta es un rótulo que ya no se lee. -->
                      <div class="intervalos">
                        <!-- Un intervalo son dos controles que se leen como uno,
                             así que van pegados. Los cuatro rótulos son distintos
                             a propósito: dos campos que se llaman «Cada» en la
                             misma pantalla son dos campos que nadie puede nombrar
                             por teléfono ni distinguir por lista de controles. -->
                        <div class="par">
                          <NumberInput
                            label="Calendario · cada"
                            unit={t.unidadCal}
                            bind:value={tareas[i].cada}
                            stepper
                            min="0"
                            align="right"
                            optional
                            hint="Vacío si esta tarea no vence por tiempo."
                          />
                          <Select label="Unidad" options={UNIDADES_CAL} bind:value={tareas[i].unidadCal} />
                        </div>

                        <div class="par">
                          <NumberInput
                            label="Uso · cada"
                            unit={SIMBOLO[relojes.find((r) => r.id === t.usoReloj)?.unidad] ?? ''}
                            bind:value={tareas[i].usoCada}
                            stepper
                            step={10}
                            min="0"
                            align="right"
                            optional
                            hint="Vacío si esta tarea no vence por uso."
                          />
                          <Select
                            label="Reloj"
                            options={opcionesReloj}
                            bind:value={tareas[i].usoReloj}
                            placeholder="Elegí un reloj"
                            error={intentado && tareas[i].usoCada !== '' && tareas[i].usoReloj === ''
                              ? 'Falta decir sobre cuál reloj.'
                              : ''}
                            fix="Los relojes se declaran en la pestaña Métricas."
                          />
                        </div>
                      </div>

                      {#if tareas[i].cada === '' && tareas[i].usoCada === ''}
                        <Alert tone="attention" title="Esta tarea no vence nunca" live={false}>
                          Sin intervalo por calendario ni por uso, la tarea queda en la ficha
                          del equipo pero no genera vencimiento ni aviso.
                        </Alert>
                      {/if}

                      <Row>
                        <!-- Sin Confirm: mientras no se guarde, el Descartar del
                             pie devuelve la tarea. Un Confirm delante de algo
                             reversible es un peaje que pagan los que sí querían
                             hacerlo. Lo que sí hay es un Deshacer en el toast. -->
                        <Button size="sm" variant="ghost" on:click={() => quitarTarea(t.id)}>
                          Quitar<span class="sx-sr"> la tarea {t.nombre || 'sin nombre'}</span>
                        </Button>
                      </Row>
                    </Stack>
                  {/if}
                </Stack>
              </Well>
            {/each}
          </Stack>

          <Row>
            <Button on:click={agregarTarea}>
              <Glyph slot="icon" name="plus" />
              Agregar una tarea
            </Button>
          </Row>
        </Stack>
      {/if}

      {#if seccion === 'alertas'}
        <Stack gap={5}>
          <div>
            <h3>Con cuánta anticipación avisar</h3>
            <p class="nota">
              El aviso sale del reloj que va adelante. Lo que vence por calendario avisa
              cuando faltan los días; lo que vence por uso, cuando el uso llega al
              porcentaje del intervalo.
            </p>
          </div>

          <div class="campos">
            <!-- `origin` es la respuesta a «¿por qué dice 10 si yo no escribí
                 eso?». El valor viene de los ajustes del espacio de trabajo —el
                 tenant—, y al pisarlo la línea cambia sola y ofrece el camino de
                 vuelta diciendo A QUÉ vuelve. -->
            <NumberInput
              label="Avisar cuando falten"
              unit="días"
              bind:value={anticipoDias}
              stepper
              min="0"
              max="90"
              align="right"
              hint="Sobre el reloj de calendario."
              warning={anticipoDias === '0' ? 'Con 0 días el aviso llega el mismo día del vencimiento.' : ''}
              fix={anticipoDias === '0' ? 'El filtro de estas batidoras tarda 3 días en llegar de proveedor.' : ''}
              origin="los ajustes del espacio de trabajo"
              originValue="{HEREDADO_DEL_CLIENTE} días"
              changed={anticipoDias !== HEREDADO_DEL_CLIENTE}
              on:revert={() => (anticipoDias = HEREDADO_DEL_CLIENTE)}
            />

            <NumberInput
              label="Avisar cuando el uso llegue a"
              unit="%"
              bind:value={anticipoUso}
              stepper
              step={5}
              min="50"
              max="100"
              align="right"
              hint="Del intervalo por uso. Con 85 %, una tarea de 250 h avisa a las 212 h."
            />
          </div>

          <Select
            label="Cada cuánto repetir el aviso"
            options={REPETICION}
            bind:value={repetir}
            hint="Un aviso que se repite todos los días deja de leerse en una semana."
          />

          <Field
            group
            frame={false}
            label="¿A quién le llega?"
            hint="Al menos uno, o el vencimiento pasa sin que nadie se entere."
            error={intentado && !avisaBodega && !avisaTaller && !avisaCoordinacion
              ? 'Nadie recibe los avisos de esta familia.'
              : ''}
            fix="Marcá por lo menos a quien tiene la máquina a mano."
            let:labelId
            let:describedBy
          >
            <Stack gap={2} role="group" aria-labelledby={labelId} aria-describedby={describedBy}>
              <!-- Checkbox y no Switch: acá abajo hay un Guardar. Un switch
                   promete que la cosa pasó al soltarlo, y este no pasa hasta que
                   alguien guarde. -->
              <Checkbox bind:checked={avisaBodega} label="Bodega San José" hint="Donde entran y salen las batidoras." />
              <Checkbox bind:checked={avisaTaller} label="Taller de Alajuela" hint="El que hace el servicio." />
              <Checkbox
                bind:checked={avisaCoordinacion}
                label="Coordinación de flota"
                hint="Recibe el resumen del día, no un aviso por equipo."
              />
            </Stack>
          </Field>

          <Divider label="Equipos que no reportan" />

          <p class="nota">
            Un equipo que no se lee no está al día: está sin medir. Sin este aviso, una
            batidora que nadie leyó en cuatro meses se ve igual que una recién servida.
          </p>

          <Stack gap={3}>
            <Checkbox
              bind:checked={vigilarSinLectura}
              label="Avisar cuando un equipo pase mucho tiempo sin lectura"
              hint="Solo para los relojes MANUAL: los otros tres se alimentan solos."
            />
            {#if vigilarSinLectura}
              <div class="campos">
                <NumberInput
                  label="Después de"
                  unit="días sin lectura"
                  bind:value={diasSinLectura}
                  stepper
                  step={5}
                  min="1"
                  align="right"
                  hint="Contados desde la última lectura registrada, no desde la última salida."
                />
              </div>
            {/if}
          </Stack>
        </Stack>
      {/if}
    </Tabs>

    <svelte:fragment slot="footer">
      <!-- AUSENCIA DE LA LIBRERÍA: Toolbar se pega arriba (`top: 0`) y no hay
           forma de pegar una barra de acciones ABAJO. En un formulario de cuatro
           secciones eso significa bajar hasta el final para guardar, y volver a
           subir. Es un caso lo bastante repetido —ajustes, editor de plantilla,
           orden de trabajo— para que valga un `stick="bottom"` en Toolbar. -->
      <Toolbar gap={3}>
        {#if sucio}
          <p class="pie">
            <Pill tone="attention" size="sm">Sin guardar</Pill>
            <span>Hay cambios en {dondeCambio}. No se aplican a ningún equipo hasta que guardés.</span>
          </p>
        {:else}
          <p class="pie">
            <span>Todo guardado. La última vez fue hoy a las 9:12 a. m., por Marielos Vargas.</span>
          </p>
        {/if}

        <svelte:fragment slot="end">
          <Button
            variant="ghost"
            disabled={!sucio}
            reason="No hay cambios que descartar."
            on:click={descartar}
          >
            Descartar
          </Button>
          <!-- El único solid de la pantalla. Todo lo demás es outline o ghost. -->
          <Button
            variant="solid"
            disabled={!sucio}
            reason="No hay cambios que guardar."
            on:click={guardar}
          >
            Guardar los cambios
          </Button>
        </svelte:fragment>
      </Toolbar>
    </svelte:fragment>
  </Panel>
</div>

{#if borrando}
  <!-- Los conteos salen del estado, no de un texto escrito a mano: si alguien
       agrega una tarea y después elimina la familia, el diálogo dice la verdad.
       Un Confirm que miente sobre lo que se lleva es peor que no tener Confirm. -->
  <Confirm
    action="Eliminar la familia"
    subject="{nombre} · código {codigo}"
    loses={[
      { n: EQUIPOS_CON_EL_PLAN, text: 'equipos se quedan sin plan de mantenimiento' },
      { n: tareas.length, text: 'tareas de la familia se borran' },
      { n: relojes.length, text: 'relojes declarados dejan de proyectar vencimientos' }
    ]}
    keeps={[
      'Las lecturas y el historial de servicios de cada equipo no se tocan',
      `Los ${EQUIPOS_CON_EL_PLAN} equipos siguen en la flota, sin familia`
    ]}
    on:confirm={eliminarFamilia}
    on:cancel={() => (borrando = false)}
  />
{/if}

<Toast
  {toasts}
  on:dismiss={(e) => quitarToast(e.detail.id)}
  on:action={(e) => revertir(e.detail.id)}
/>

<style>
  /* Todo lo que hay acá es distribución. Ni un color, ni un radio, ni una
     sombra, y los espacios salen de la escala de tokens y no de números sueltos. */
  .pantalla {
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-6);
    padding: var(--sx-s-6);
    /* Más angosto que Flota: un formulario de una columna que se estira a 1180px
       obliga al ojo a saltar del final de un campo al principio del siguiente. */
    max-width: 900px;
    margin: 0 auto;
  }

  h3 {
    margin: 0 0 var(--sx-s-1);
    font-size: var(--sx-t-md);
    font-weight: var(--sx-w-semi);
    letter-spacing: -0.01em;
  }
  /* Un escalón por debajo del h3 y sin más peso que el de un campo: el nombre de
     un reloj o de una tarea encabeza su bloque, pero no compite con el título de
     la sección que los agrupa. */
  h4 {
    margin: 0;
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-semi);
    min-width: 0;
  }
  .nota {
    margin: 0;
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-3);
    line-height: 1.5;
    max-width: 62ch;
  }

  /* `auto-fit` con un mínimo en `min()`: dos columnas donde caben dos, una sola
     cuando no, y nunca un desbordamiento horizontal a 380px porque el mínimo
     jamás puede pasarse del ancho disponible. */
  .campos {
    display: grid;
    gap: var(--sx-s-4);
    grid-template-columns: repeat(auto-fit, minmax(min(15rem, 100%), 1fr));
    align-items: start;
  }
  /* Los dos intervalos, en columna: cada par se queda con el ancho entero y sus
     rótulos caben en una línea. */
  .intervalos {
    display: grid;
    gap: var(--sx-s-4);
  }
  /* Un intervalo son dos controles que se leen juntos —«cada 250 h»— así que
     viajan como uno solo dentro de la rejilla de campos.
     `end` y no `start`: el número trae pista y el select no, así que alineados
     por arriba las dos cajas quedan a alturas distintas y el par deja de leerse
     como un solo control. */
  .par {
    display: grid;
    gap: var(--sx-s-3);
    grid-template-columns: repeat(auto-fit, minmax(min(10rem, 100%), 1fr));
    align-items: end;
  }

  .antes { margin-bottom: var(--sx-s-5); }
  .cara { min-width: 0; display: flex; flex-direction: column; gap: var(--sx-s-2); }
  .crece { flex: 1 1 20ch; min-width: 0; }

  .pie {
    margin: 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--sx-s-2);
  }

  @media (max-width: 520px) {
    .pantalla { padding: var(--sx-s-4); gap: var(--sx-s-5); }
  }
</style>
