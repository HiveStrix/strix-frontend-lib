<script>
  // TERCER EJEMPLO: encontrar una máquina entre muchas.
  //
  // Flota muestra datos y Lectura los recibe. Esta enseña la tercera cosa que
  // toda pantalla de operación termina necesitando: BUSCAR. La pregunta que
  // contesta es «¿dónde está la mezcladora chica?», y por eso la ubicación es
  // lo segundo que se lee en cada resultado, después del nombre.
  //
  // Las dos decisiones que le dan forma:
  //
  //   1. EL ORDEN VIVE ARRIBA, NO EN EL ENCABEZADO DE LA TABLA. Hay dos vistas
  //      de los mismos registros y las dos se ordenan igual, así que el control
  //      no puede vivir dentro de una de las dos. Table recibe `autoSort={false}`
  //      y ninguna columna `sortable`: ordena esta pantalla, una sola vez, y la
  //      tabla dibuja lo que le llega. Un segundo control adentro sería un
  //      segundo estado que se desincroniza el día que alguien toque uno.
  //
  //   2. LOS CONTEOS DE LOS FILTROS VAN SOBRE EL CONJUNTO COMPLETO. Es la regla
  //      que FilterChips existe para imponer y vale igual para los dos selects:
  //      un número que cambia cuando lo presionás no sirve para comparar, que es
  //      lo único para lo que estaba ahí.
  import {
    PageHeader, SearchField, FilterChips, Segmented, Toolbar, Select,
    Button, Card, Stack, Row, Pill, Table, EmptyState
  } from '@strix/frontend-lib';

  // Los datos van acá y no en data.js: data.js tiene seis equipos, que alcanzan
  // para una tabla y no para probar un buscador. Filtrar y ordenar solo se ven
  // trabajar cuando hay suficiente como para perderse.
  //
  // La forma del objeto es la del módulo de mantenimiento:
  //   lectura + unidad  el reloj de uso, en las unidades de esa familia
  //   medido            días desde la última lectura REAL; null = nunca se midió
  //   fuente            de dónde llega el uso; null = esta máquina no tiene
  //                     reloj de uso y su plan corre solo contra el calendario
  const EQUIPOS = [
    {
      id: 'BAT-014', nombre: 'Batidora Imer Syntesi 250', familia: 'Batidoras',
      ubicacion: 'Bodega San José', lectura: 312, unidad: 'h', medido: 2,
      fuente: 'MANUAL', estado: 'critical', palabra: 'Vencido',
      tarea: 'Cambio de aceite · cada 250 h'
    },
    {
      id: 'BAT-022', nombre: 'Batidora Imer Syntesi 190', familia: 'Batidoras',
      ubicacion: 'Obra 012 · Santa Ana', lectura: 148, unidad: 'h', medido: 9,
      fuente: 'DISPATCH', estado: 'positive', palabra: 'Al día',
      tarea: 'Cambio de aceite · cada 250 h'
    },
    {
      id: 'BAT-031', nombre: 'Batidora de mortero Baumax BM-90', familia: 'Batidoras',
      ubicacion: 'Bodega Heredia', lectura: null, unidad: 'h', medido: null,
      fuente: 'MANUAL', estado: 'neutral', palabra: 'Sin lectura',
      tarea: 'Engrase general · cada 500 h'
    },
    {
      id: 'HRN-001', nombre: 'Horno rotativo Salva KX-8', familia: 'Hornos',
      ubicacion: 'Planta Alajuela', lectura: 1840, unidad: 'h', medido: 1,
      fuente: 'SCHEDULE', estado: 'attention', palabra: 'Vence en 5 d',
      tarea: 'Revisión de quemador · cada 2 000 h'
    },
    {
      id: 'HRN-004', nombre: 'Horno de convección Unox XEVC-0511EPL', familia: 'Hornos',
      ubicacion: 'Planta Alajuela', lectura: 962, unidad: 'h', medido: 1,
      fuente: 'SCHEDULE', estado: 'positive', palabra: 'Al día',
      tarea: 'Limpieza de cámara y sondas · cada 1 000 h'
    },
    {
      id: 'CAM-03', nombre: 'Camión Hino 300 · placa C-148921', familia: 'Flota',
      ubicacion: 'En ruta', lectura: 7210, unidad: 'km', medido: 4,
      fuente: 'DISPATCH', estado: 'positive', palabra: 'Al día',
      tarea: 'Servicio de 10 000 km'
    },
    {
      id: 'CAM-07', nombre: 'Cabezal Freightliner M2 106 · placa C-152034', familia: 'Flota',
      ubicacion: 'En ruta', lectura: 184320, unidad: 'km', medido: 3,
      fuente: 'IOT', estado: 'attention', palabra: 'Vence en 11 d',
      tarea: 'Cambio de banda de repartición · cada 190 000 km'
    },
    {
      id: 'PIC-02', nombre: 'Pick-up Toyota Hilux 4x4 · placa 641223', familia: 'Flota',
      ubicacion: 'Bodega Heredia', lectura: 96480, unidad: 'km', medido: 27,
      fuente: 'MANUAL', estado: 'critical', palabra: 'Vencido',
      tarea: 'Servicio de 95 000 km'
    },
    {
      id: 'MEZ-021', nombre: 'Mezcladora Baumax BM-160', familia: 'Mezcladoras',
      ubicacion: 'Obra 012 · Santa Ana', lectura: 612, unidad: 'h', medido: 6,
      fuente: 'DISPATCH', estado: 'critical', palabra: 'Vencido',
      tarea: 'Engrase general · cada 600 h'
    },
    {
      id: 'MEZ-045', nombre: 'Mezcladora de concreto Multiquip MC-94S', familia: 'Mezcladoras',
      ubicacion: 'Obra 021 · Pérez Zeledón', lectura: 233, unidad: 'h', medido: 18,
      fuente: 'MANUAL', estado: 'attention', palabra: 'Vence en 6 d',
      tarea: 'Cambio de aceite del motor · cada 250 h'
    },
    {
      id: 'COM-07', nombre: 'Compactadora Wacker Neuson DPU-6555', familia: 'Compactación',
      ubicacion: 'Bodega San José', lectura: null, unidad: 'h', medido: null,
      fuente: 'MANUAL', estado: 'neutral', palabra: 'Sin lectura',
      tarea: 'Cambio de filtro de aire · cada 200 h'
    },
    {
      id: 'COM-12', nombre: 'Rodillo vibratorio Bomag BW 100 AD-5', familia: 'Compactación',
      ubicacion: 'Obra 007 · Liberia', lectura: 1106, unidad: 'h', medido: 12,
      fuente: 'IOT', estado: 'positive', palabra: 'Al día',
      tarea: 'Cambio de refrigerante · cada 3 000 h'
    },
    {
      id: 'GEN-02', nombre: 'Generador Kohler 60REOZK', familia: 'Generadores',
      ubicacion: 'Obra 007 · Liberia', lectura: 2430, unidad: 'h', medido: 1,
      fuente: 'IOT', estado: 'attention', palabra: 'Vence en 9 d',
      tarea: 'Cambio de refrigerante · cada 3 000 h'
    },
    {
      id: 'GEN-09', nombre: 'Planta eléctrica Cummins C40D6', familia: 'Generadores',
      ubicacion: 'Taller · en reparación', lectura: 5878, unidad: 'h', medido: 63,
      fuente: 'MANUAL', estado: 'critical', palabra: 'Vencido',
      tarea: 'Cambio de inyectores · cada 6 000 h'
    },
    {
      id: 'AND-114', nombre: 'Torre de andamio Layher Allround · 6 cuerpos', familia: 'Andamios',
      ubicacion: 'Obra 021 · Pérez Zeledón', lectura: null, unidad: '', medido: null,
      fuente: null, estado: 'attention', palabra: 'Vence en 14 d',
      tarea: 'Inspección estructural · cada 12 meses'
    },
    {
      id: 'AND-127', nombre: 'Andamio colgante Tractel Tirak X-500', familia: 'Andamios',
      ubicacion: 'Bodega Heredia', lectura: null, unidad: '', medido: null,
      fuente: null, estado: 'positive', palabra: 'Al día',
      tarea: 'Prueba de carga del cabrestante · cada 6 meses'
    },
    {
      id: 'HER-208', nombre: 'Cortadora de concreto Husqvarna FS 400 LV', familia: 'Herramienta menor',
      ubicacion: 'Bodega San José', lectura: 88, unidad: 'h', medido: 34,
      fuente: 'MANUAL', estado: 'attention', palabra: 'Vence en 3 d',
      tarea: 'Cambio de faja de transmisión · cada 100 h'
    },
    {
      id: 'HER-233', nombre: 'Martillo demoledor Hilti TE 3000-AVR', familia: 'Herramienta menor',
      ubicacion: 'Obra 012 · Santa Ana', lectura: 41, unidad: 'h', medido: 21,
      fuente: 'MANUAL', estado: 'positive', palabra: 'Al día',
      tarea: 'Revisión de carbones · cada 150 h'
    }
  ];

  // Las cuatro fuentes de uso, escritas para leerse en una fila y no para
  // parecerse a un enum. Ausencia de fuente es un caso real, no un dato que
  // falte: un andamio no tiene horómetro y nunca va a tenerlo.
  const FUENTES = {
    MANUAL: 'Manual',
    DISPATCH: 'Salidas y devoluciones',
    SCHEDULE: 'Horario declarado',
    IOT: 'Telemetría'
  };

  // El orden de las familias es el del negocio (lo pesado primero, la
  // herramienta menor al final), no el alfabético: así es como la bodega las
  // nombra y como están rotuladas las estanterías.
  const FAMILIAS = [
    'Batidoras', 'Hornos', 'Flota', 'Mezcladoras',
    'Compactación', 'Generadores', 'Andamios', 'Herramienta menor'
  ];
  const UBICACIONES = [...new Set(EQUIPOS.map((e) => e.ubicacion))].sort((a, b) =>
    a.localeCompare(b, 'es')
  );

  // Ocho familias más «Todas» son nueve chips, que es una fila que se parte en
  // tres líneas: eso ya no es una fila escaneable, es un menú con pasos de más.
  // FilterChips lo dice en su encabezado, así que familia y ubicación son
  // selects y solo el estado —cuatro cubetas con tono— se queda en chips.
  const OPC_FAMILIA = [
    { value: '', label: `Todas las familias (${EQUIPOS.length})` },
    ...FAMILIAS.map((f) => ({
      value: f,
      label: `${f} (${EQUIPOS.filter((e) => e.familia === f).length})`
    }))
  ];
  const OPC_UBICACION = [
    { value: '', label: `Todas las ubicaciones (${EQUIPOS.length})` },
    ...UBICACIONES.map((u) => ({
      value: u,
      label: `${u} (${EQUIPOS.filter((e) => e.ubicacion === u).length})`
    }))
  ];

  // Los conteos van sobre EQUIPOS y no sobre lo filtrado. Son constantes de
  // verdad —EQUIPOS nunca cambia acá— así que un `const` es honesto; en cuanto
  // los datos vengan de un fetch, esto tiene que pasar a `$:` o se congela.
  const ESTADOS = [
    { key: 'critical', label: 'Vencido', tone: 'critical', count: EQUIPOS.filter((e) => e.estado === 'critical').length },
    { key: 'attention', label: 'Por vencer', tone: 'attention', count: EQUIPOS.filter((e) => e.estado === 'attention').length },
    { key: 'positive', label: 'Al día', tone: 'positive', count: EQUIPOS.filter((e) => e.estado === 'positive').length },
    { key: 'neutral', label: 'Sin lectura', tone: 'neutral', count: EQUIPOS.filter((e) => e.estado === 'neutral').length }
  ];

  // Agrupado, porque «Código» y «Estado» no son opciones: son ejes, y cada uno
  // tiene dos sentidos. Sin optgroups son seis renglones sueltos que hay que
  // leer enteros para encontrar el par que se busca.
  const ORDENES = [
    { value: 'id:asc', group: 'Código', label: 'De la A a la Z' },
    { value: 'id:desc', group: 'Código', label: 'De la Z a la A' },
    { value: 'estado:asc', group: 'Estado', label: 'Primero lo vencido' },
    { value: 'estado:desc', group: 'Estado', label: 'Primero lo que está al día' },
    { value: 'medido:asc', group: 'Última lectura', label: 'La más vieja primero' },
    { value: 'medido:desc', group: 'Última lectura', label: 'La más reciente primero' }
  ];
  const RANGO = { critical: 0, attention: 1, neutral: 2, positive: 3 };

  const VISTAS = [
    { key: 'rejilla', label: 'Rejilla', hint: 'Una tarjeta por equipo, con su ubicación y su próxima tarea' },
    { key: 'lista', label: 'Lista', hint: 'Tabla densa, para comparar una columna de arriba a abajo' }
  ];

  let busqueda = '';
  let familia = '';
  let ubicacion = '';
  let estado = null;
  let orden = 'estado:asc';
  let vista = 'rejilla';
  let tituloResultados;

  // Sin `const` auxiliares cerrando sobre estado reactivo: una sentencia $:
  // solo rastrea los nombres escritos DENTRO de ella, y un helper declarado
  // afuera es invisible para el compilador. Ese bug ya se envió cinco veces en
  // este ecosistema; la expresión va entera adentro.
  //
  // La búsqueda ignora tildes en los dos lados: quien escribe en una tablet en
  // el patio pone «perez» y tiene que encontrar «Obra 021 · Pérez Zeledón».
  $: visibles = EQUIPOS.filter(
    (e) =>
      (familia === '' || e.familia === familia) &&
      (ubicacion === '' || e.ubicacion === ubicacion) &&
      (estado === null || e.estado === estado) &&
      (busqueda === '' ||
        `${e.id} ${e.nombre} ${e.familia} ${e.ubicacion} ${e.tarea}`
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .includes(
            busqueda.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          ))
  );

  // Un solo orden para las dos vistas. Los vacíos van al final en los DOS
  // sentidos, igual que en Table: «nunca medida» no es la lectura más vieja,
  // y ponerla arriba de un orden ascendente es cómo alguien termina trabajando
  // las tres máquinas equivocadas.
  $: ordenados = visibles.slice().sort((a, b) => {
    const dir = orden.endsWith(':desc') ? -1 : 1;
    if (orden.startsWith('estado')) return dir * (RANGO[a.estado] - RANGO[b.estado]);
    if (orden.startsWith('medido')) {
      if (a.medido === null || b.medido === null) {
        return a.medido === b.medido ? 0 : a.medido === null ? 1 : -1;
      }
      return dir * (b.medido - a.medido);
    }
    return dir * a.id.localeCompare(b.id, 'es', { numeric: true });
  });

  $: hayFiltro = busqueda !== '' || familia !== '' || ubicacion !== '' || estado !== null;

  $: resumenFiltros = [
    busqueda !== '' ? `búsqueda «${busqueda}»` : null,
    familia !== '' ? familia : null,
    ubicacion !== '' ? ubicacion : null,
    estado !== null ? ESTADOS.find((s) => s.key === estado)?.label : null
  ]
    .filter(Boolean)
    .join(' · ');

  function limpiar() {
    // El botón que se acaba de presionar puede ser el del estado vacío, que
    // desaparece junto con el estado vacío. Si nadie recoge el foco se queda en
    // <body> y quien navega con teclado vuelve a empezar desde la barra negra.
    const estabaVacio = ordenados.length === 0;
    busqueda = '';
    familia = '';
    ubicacion = '';
    estado = null;
    if (estabaVacio) tituloResultados?.focus();
  }

  // La tarea NO es columna: es prosa, y una tabla promete que sus columnas se
  // comparan de arriba a abajo. Nadie compara «Cambio de banda de repartición ·
  // cada 190 000 km» con «Prueba de carga del cabrestante · cada 6 meses»; se
  // leen una por una, que es justo lo que hace la tarjeta. Esa es la diferencia
  // entre las dos vistas y no la densidad.
  // El ESTADO va segundo y no último. Ocho columnas de nombres largos suman más
  // de lo que mide esta columna de página, así que la tabla se desplaza de lado
  // —Table lo hace a propósito y lo avisa con una sombra— y lo que se sale por
  // la derecha es lo último que se declaró. Puesto de último, lo que se salía
  // era la pastilla de estado: justo el dato con el que se llega a esta
  // pantalla. Puesto segundo, lo que se sale es la fuente del uso, que es
  // contexto y no respuesta.
  //
  // `wrap` no sirve acá: Table le fija a la celda una altura de fila con
  // `overflow: hidden`, así que una segunda línea no ensancha el renglón, se
  // corta a la mitad de las letras.
  const COLUMNAS = [
    { key: 'id', label: 'Código', id: true, primary: true, min: '9ch' },
    { key: 'estado', label: 'Estado', order: 'number', min: '12ch' },
    { key: 'nombre', label: 'Equipo', min: '24ch' },
    // Vuelve cuando hay ancho de sobra. A 1 130px —lo que mide esta columna de
    // página— la familia es la primera que sobra: ya es uno de los dos selects
    // de arriba y sale entera en la tarjeta de la vista de rejilla.
    { key: 'familia', label: 'Familia', optional: true, showAt: 1200, min: '13ch' },
    { key: 'ubicacion', label: 'Ubicación', min: '17ch' },
    {
      key: 'uso',
      label: 'Uso',
      numeric: true,
      min: '10ch',
      value: (r) => (r.lectura === null ? '—' : `${r.lectura.toLocaleString('es-CR')} ${r.unidad}`)
    },
    {
      key: 'medido',
      label: 'Última lectura',
      numeric: true,
      order: 'date',
      min: '12ch',
      // Tres huecos distintos, tres palabras distintas: «—» es que la máquina no
      // tiene reloj de uso, «nunca» es que lo tiene y nadie lo ha leído jamás.
      // Escribir «—» en los dos casos borra el único dato accionable de los dos.
      value: (r) => (r.fuente === null ? '—' : r.medido === null ? 'nunca' : `hace ${r.medido} d`)
    },
    {
      key: 'fuente',
      label: 'Fuente del uso',
      optional: true,
      showAt: 1060,
      min: '14ch',
      value: (r) => FUENTES[r.fuente] ?? 'Solo calendario'
    }
  ];
</script>

<div class="pantalla">
  <PageHeader
    eyebrow="Mantenimiento"
    title="{EQUIPOS.length} equipos repartidos en {UBICACIONES.length} ubicaciones."
    subtitle="El uso llega de cuatro fuentes. Lo que una máquina mide de verdad le gana siempre a lo que un horario declara."
  >
    <svelte:fragment slot="actions">
      <Button variant="ghost">Exportar el catálogo</Button>
      <Button variant="solid">Registrar equipo</Button>
    </svelte:fragment>
  </PageHeader>

  <div class="filtros">
    <div class="campos">
      <SearchField
        bind:value={busqueda}
        showLabel
        label="Buscar equipos"
        placeholder="Código, nombre, placa, ubicación o tarea…"
        resultCount={ordenados.length}
        noun="equipos"
      />
      <Select label="Familia" options={OPC_FAMILIA} bind:value={familia} />
      <Select label="Ubicación" options={OPC_UBICACION} bind:value={ubicacion} />
    </div>

    <FilterChips
      label="Filtrar por estado del plan"
      options={ESTADOS}
      bind:value={estado}
      total={EQUIPOS.length}
      allLabel="Todos"
    />
  </div>

  <section class="resultados" aria-labelledby="cat-conteo">
    <Toolbar align="end" aria-label="Conteo, orden y vista del catálogo">
      <!-- El conteo ES el encabezado de la sección: es la noticia, y así no hay
           que inventarle un título aparte que diga «Resultados» y nada más.
           `tabindex="-1"` porque `limpiar()` le devuelve el foco cuando la
           acción que lo llamó era la del estado vacío. -->
      <h2 id="cat-conteo" class="conteo sx-num" tabindex="-1" bind:this={tituloResultados}>
        {ordenados.length} de {EQUIPOS.length} equipos
      </h2>

      <!-- Siempre presente, deshabilitado con razón en vez de desaparecer: un
           control que se va y vuelve mueve la barra entera bajo el cursor. Con
           `reason` sigue enfocable y explica por qué no hace nada. -->
      <Button
        variant="ghost"
        size="sm"
        disabled={!hayFiltro}
        reason="No hay ningún filtro puesto."
        on:click={limpiar}
      >
        Limpiar los filtros
      </Button>

      <svelte:fragment slot="end">
        <div class="orden">
          <Select label="Ordenar por" options={ORDENES} bind:value={orden} />
        </div>
        <Segmented label="Vista" items={VISTAS} bind:value={vista} size="sm" />
      </svelte:fragment>
    </Toolbar>

    {#if ordenados.length === 0}
      <!-- `kind="filtered"` y no `empty`: hay 18 equipos: decirle a alguien que
           no tiene ninguno porque escribió «bat9» es una traición pequeña. La
           salida es la primera acción y el cuerpo repite los filtros puestos,
           para que se vea cuál de los tres sobra. -->
      <EmptyState
        kind="filtered"
        heading="h3"
        title={busqueda !== ''
          ? `Ningún equipo coincide con «${busqueda}».`
          : 'Ningún equipo pasa esta combinación de filtros.'}
        action="Limpiar los filtros"
        on:action={limpiar}
      >
        Están puestos: {resumenFiltros}. En el catálogo hay {EQUIPOS.length} equipos.
      </EmptyState>

    {:else if vista === 'rejilla'}
      <ul class="rejilla">
        {#each ordenados as e (e.id)}
          {@const hechos =
            e.fuente === null
              ? ['Sin reloj de uso · solo calendario']
              : e.lectura === null
                ? ['Sin una sola lectura', FUENTES[e.fuente]]
                : [
                    `${e.lectura.toLocaleString('es-CR')} ${e.unidad}`,
                    `medida hace ${e.medido} d`,
                    FUENTES[e.fuente]
                  ]}
          <li>
            <Card pad={4}>
              <Stack gap={3}>
                <Row gap={3} justify="between">
                  <span class="sx-id cod">{e.id}</span>
                  <Pill tone={e.estado} size="sm">{e.palabra}</Pill>
                </Row>

                <div>
                  <h3 class="nom">{e.nombre}</h3>
                  <!-- La ubicación es la respuesta a la pregunta con la que la
                       gente llega a esta pantalla, así que va antes que
                       cualquier cifra y en el registro de texto, no de dato. -->
                  <p class="donde">{e.familia} · {e.ubicacion}</p>
                </div>

                <!-- Medios puntos, no columnas: son contexto, y ponerlos en
                     rejilla prometería una comparación que no está en oferta.
                     Es la misma forma que usa DataList para lo mismo. -->
                <!-- El punto viaja DENTRO del trozo que separa y no como un
                     hijo suelto del flex: suelto, cuando la fila se parte, el
                     punto se queda colgando al final de la línea de arriba y
                     el dato al que pertenece arranca la de abajo. -->
                <p class="hechos sx-num">
                  {#each hechos as h, i}
                    <span class="hecho">
                      {#if i > 0}<span class="punto" aria-hidden="true">·</span>{/if}{h}
                    </span>
                  {/each}
                </p>

                <div class="tarea">
                  <p class="sx-cap">Próxima tarea</p>
                  <p class="txt">{e.tarea}</p>
                </div>
              </Stack>
            </Card>
          </li>
        {/each}
      </ul>

    {:else}
      <!-- `autoSort={false}`: el orden ya viene resuelto arriba, para las dos
           vistas. `sort` se le pasa igual porque es lo que Table anuncia en su
           región viva —«18 equipos, ordenados por Código, de la A a la Z»— y sin
           eso quien no ve la rejilla moverse no se entera de nada.
           Tampoco se le pasa `total`: el «Mostrando N de M» que dibujaría sería
           el mismo dato que ya es el encabezado de esta sección. -->
      <Table
        columns={COLUMNAS}
        rows={ordenados}
        rowKey={(r) => r.id}
        caption="Catálogo de equipos con su ubicación, su uso y el estado de su plan"
        sort={{ key: orden.split(':')[0], dir: orden.split(':')[1] }}
        autoSort={false}
        dense
        noun="equipo"
        nounPlural="equipos"
        gender="m"
      >
        <svelte:fragment slot="cell" let:row let:col let:value>
          {#if col.key === 'estado'}
            <Pill tone={row.estado} size="sm">{row.palabra}</Pill>
          {:else}
            {value ?? '—'}
          {/if}
        </svelte:fragment>
      </Table>
    {/if}
  </section>
</div>

<style>
  /* Todo lo que hay aquí es distribución. Ni un color, ni un radio, ni una
     sombra propios: los tipos y las tintas son tokens, los espacios salen de la
     escala, y por eso cambiar de marca o de tema no toca este archivo. */
  .pantalla {
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-6);
    padding: var(--sx-s-6);
    /* 1 240 y no 1 180: la vista de lista tiene siete columnas y a 1 180 la
       última se queda con veinte píxeles de menos, que es lo que hace que
       «Salidas y devoluciones» aparezca cortada a la mitad de una palabra. Es
       el mismo ancho que usa la pantalla de Documentos. */
    max-width: 1240px;
    margin: 0 auto;
  }

  .filtros {
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-4);
  }

  /* HUECO DE LA LIBRERÍA: 240px y 260px no son espacios sino ANCHOS MÍNIMOS de
     columna, y la escala de tokens llega hasta --sx-s-20 (80px), que es aire
     entre cosas y no medida de cosas. No hay una escala de medidas, así que un
     número suelto es lo único que queda. Flota ya tenía el mismo 240px.
     Sin media query a propósito: el módulo se dibuja al lado del riel de 240px
     del Shell, así que el ancho de la ventana nunca es el número que decide. */
  .campos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
    gap: var(--sx-s-4);
    align-items: end;
  }

  .resultados {
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-4);
  }

  .conteo {
    margin: 0;
    font-size: var(--sx-t-md);
    font-weight: var(--sx-w-semi);
    letter-spacing: -0.01em;
  }

  .orden { min-width: 240px; }

  /* auto-fill y no auto-fit: con un solo resultado, auto-fit lo estiraría de
     lado a lado y una tarjeta de 1 100px de ancho miente sobre lo que es. */
  .rejilla {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
    gap: var(--sx-s-4);
    list-style: none;
    margin: 0;
    padding: 0;
  }
  /* Grid de un solo hijo: la tarjeta llena el alto de su fila sin que este
     archivo tenga que alcanzar dentro de Card, que no expone `class`. */
  .rejilla > li {
    display: grid;
    min-width: 0;
  }

  .cod { color: var(--sx-ink-3); }

  .nom {
    margin: 0;
    font-size: var(--sx-t-md);
    font-weight: var(--sx-w-semi);
    letter-spacing: -0.01em;
    line-height: 1.3;
  }

  .donde {
    margin: var(--sx-s-1) 0 0;
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-2);
    line-height: 1.45;
  }

  .hechos {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    /* El aire ya lo pone el margen del punto: un gap encima lo duplicaría en
       los trozos que sí llevan punto. */
    column-gap: var(--sx-s-2);
    row-gap: var(--sx-s-1);
    font-size: var(--sx-t-xs);
    color: var(--sx-ink-3);
  }
  .hecho { white-space: nowrap; }
  /* El separador es de la familia de las líneas, no del texto: se ve, y no
     compite con el dato que separa. */
  .punto {
    color: var(--sx-ink-3);
    opacity: .5;
    margin-right: var(--sx-s-2);
  }

  .tarea p { margin: 0; }
  .tarea .txt {
    margin-top: var(--sx-s-1);
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-2);
    line-height: 1.45;
  }
</style>
