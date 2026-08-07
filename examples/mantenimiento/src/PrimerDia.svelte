<script>
  // TERCER EJEMPLO: el módulo cuando todavía no hay nada.
  //
  // Flota enseña a mostrar datos y Lectura a recibirlos. Esta enseña lo que casi
  // nadie diseña: qué ve la persona que abre el módulo el primer día, cuando no
  // hay ni un equipo, ni una familia, ni una lectura. Es la pantalla que decide
  // si alguien vuelve mañana, y normalmente es la que se resuelve con la palabra
  // «vacío» centrada en gris.
  //
  // Dos decisiones sostienen todo lo demás:
  //
  //   · EL VACÍO NO ES UN ESTADO, SON DOS. «No hay nada» y «hay dos equipos y
  //     ninguna lectura» se parecen en la base de datos y no se parecen en nada
  //     para quien mira: en el primero no hay contra qué medir, en el segundo el
  //     reloj de uso existe y está en cero. El segundo casi siempre queda sin
  //     diseñar y es el que dura más tiempo.
  //   · LOS TRES CAMINOS DE ENTRADA NO CUESTAN LO MISMO, así que la pantalla dice
  //     lo que pide cada uno. Ofrecer tres botones iguales es empujar a la gente
  //     al más barato de empezar y al más caro de mantener.
  //
  // Este archivo no define ni un color, ni un radio, ni una sombra. Lo único que
  // aporta es distribución, y los espacios salen de la escala de tokens.
  import {
    PageHeader, Segmented, EmptyState, Alert, Panel, Card, Well, Stack, Row,
    Divider, Glyph, Pill, Button, Bar, DataList
  } from '@strix/frontend-lib';

  // Nada de esto está en data.js —los datos de ahí son de una flota ya cargada—
  // y data.js no se toca: los ejemplos se escriben en paralelo.
  const ESTADOS = [
    { key: 'vacio', label: 'Vacío total', hint: 'Sin equipos, sin familias, sin lecturas' },
    { key: 'medias', label: 'A medias', hint: 'Dos equipos cargados y ninguna lectura' }
  ];

  let modo = 'vacio';

  // Los dos equipos que existen en el estado «a medias». Nombres largos y feos a
  // propósito: es lo que la bodega escribe de verdad, y es lo que la pantalla
  // tiene que aguantar sin romperse.
  const EQUIPOS_NUEVOS = [
    {
      id: 'COM-11',
      nombre: 'Compactadora Wacker Neuson DPU-6555 · placa de inventario 4471',
      familia: 'Compactación',
      ubicacion: 'Bodega Alajuela',
      plan: 'Cambio de aceite de motor · cada 250 h o cada 6 meses, lo que llegue primero',
      creado: 'Creado hoy, 9:14 a. m.'
    },
    {
      id: 'GEN-04',
      nombre: 'Generador Kohler 60REOZK4 con tablero de transferencia automática',
      familia: 'Generadores',
      ubicacion: 'Obra 231 · Guácimo, Limón',
      plan: 'Cambio de refrigerante · cada 3 000 h',
      creado: 'Creado hoy, 9:21 a. m.'
    }
  ];

  // Las tres puertas. El costo va en la tarjeta y no en una nota al pie porque es
  // justo el dato con el que se elige: «20 minutos si tenés los PDF» y «2 minutos
  // pero alguien anota el horómetro para siempre» son la misma decisión vista de
  // los dos lados.
  const PUERTAS = [
    {
      id: 'manual',
      glifo: 'plus',
      titulo: 'Crear un equipo a mano',
      costo: '2 minutos',
      dice: 'Un nombre, una familia y una unidad de conteo. El plan se hereda de la familia y el módulo queda funcionando hoy mismo.',
      pide: 'Nada. Sirve para probar con una máquina antes de mover la flota entera.',
      cuesta: 'El uso queda en MANUAL: alguien tiene que acordarse de anotar el horómetro, cada vez, para siempre.',
      accion: 'Crear un equipo',
      // La única puerta cableada: es la que tiene un segundo estado que enseñar.
      // En el producto abre el formulario; acá lleva a donde llega ese formulario.
      llega: 'medias'
    },
    {
      id: 'despacho',
      glifo: 'truck',
      titulo: 'Subir salidas en PDF',
      costo: '20 minutos la primera vez',
      dice: 'Los equipos se crean solos con lo que dicen los documentos, y el uso empieza a contarse desde la primera salida sin que nadie mida nada.',
      pide: 'Tener a mano las salidas y devoluciones del último año, en PDF, como las exporta el sistema de alquiler.',
      cuesta: 'Nada después. Es la fuente que se mantiene sola.',
      accion: 'Subir salidas',
      recomendada: true,
      llega: null
    },
    {
      id: 'planilla',
      glifo: 'layers',
      titulo: 'Importar una planilla',
      costo: 'Depende de la planilla',
      dice: 'Toda la flota de una vez, con el horómetro que ya venías anotando en Excel.',
      pide: 'Una fila por máquina y un encabezado por columna.',
      cuesta: 'Si la planilla tiene celdas combinadas, filas de título o una hoja por bodega, este es el camino más caro de los tres.',
      accion: 'Importar planilla',
      llega: null
    }
  ];

  // La expresión va entera dentro del $:. Un `const pasos = (m) => …` declarado
  // afuera no lo rastrea el compilador —una sentencia reactiva solo ve los
  // nombres escritos DENTRO de ella— y la lista se quedaría congelada en el
  // primer estado. Ese bug ya se envió cinco veces en este ecosistema.
  $: PASOS = [
    {
      id: 'cliente',
      titulo: 'Abrir el cliente',
      nota: 'Alquileres del Valle · San José. «Cliente» acá es el espacio de trabajo, no la empresa que alquila la máquina.',
      hecho: true,
      accion: ''
    },
    {
      id: 'equipos',
      titulo: 'Meter los equipos',
      nota:
        modo === 'vacio'
          ? 'Ninguno todavía. Es el único paso que bloquea a los demás.'
          : '2 registrados a mano. Faltan los otros 45 que están en la planilla de la bodega de Alajuela.',
      hecho: modo !== 'vacio',
      accion: 'Agregar'
    },
    {
      id: 'fuente',
      titulo: 'Decir de dónde sale el uso de cada familia',
      nota:
        modo === 'vacio'
          ? 'Sin esto todo nace en MANUAL, que es la fuente más cara de sostener.'
          : 'Las dos máquinas quedaron en MANUAL. Compactadoras y generadores casi siempre conviene contarlos por salida.',
      hecho: false,
      accion: 'Configurar familias'
    },
    {
      id: 'lectura',
      titulo: 'Registrar la primera lectura',
      nota: 'Hasta que no haya una, el reloj de uso no arranca y el plan solo puede vencer por calendario.',
      hecho: false,
      accion: 'Registrar'
    },
    {
      id: 'docs',
      titulo: 'Subir las salidas del último año',
      nota: 'Es lo que convierte la suposición en medición: con salidas y devoluciones el uso se cuenta solo.',
      hecho: false,
      accion: 'Subir PDF'
    }
  ];

  $: listos = PASOS.filter((p) => p.hecho).length;
</script>

<div class="pantalla">
  <!-- ESTE CONTROL ES DEL EJEMPLO, NO DEL PRODUCTO. En el módulo real el estado
       sale de los datos y nadie lo elige; acá se elige para poder ver los dos sin
       tener que cargar y borrar equipos. Va arriba y dice que es del ejemplo,
       igual que la barra negra de App.svelte dice que es del demo. -->
  <Well>
    <Row gap={4} justify="between" align="center">
      <p class="demo">
        <span class="sx-cap etiqueta">Ejemplo</span>
        El mismo módulo en dos momentos del primer día.
      </p>
      <Segmented label="Estado del módulo" items={ESTADOS} bind:value={modo} />
    </Row>
  </Well>

  <!-- Sin acciones en el encabezado, en ninguno de los dos estados. Un módulo
       recién abierto con tres botones arriba da tres respuestas a una pregunta
       que todavía nadie hizo; acá cada acción viaja pegada al párrafo que la
       justifica, que es lo único que hace que se entienda el primer día. -->
  {#if modo === 'vacio'}
    <PageHeader
      eyebrow="Mantenimiento"
      title="Todavía no hay nada que mantener."
      subtitle="El cliente Alquileres del Valle está recién abierto: sin equipos, sin familias y sin una sola lectura. Nada aparece vencido porque no hay contra qué medir."
    />

    <EmptyState heading="h2" title="Ni una máquina registrada.">
      <p>
        El plan de mantenimiento no se escribe máquina por máquina: se hereda de la
        familia. Por eso el primer paso no es configurar nada, es meter equipos —
        y con el primero ya se ve el módulo funcionando.
      </p>
      <p>
        Hay tres formas de meterlos y no cuestan lo mismo. Están abajo, con lo que
        pide cada una.
      </p>
      <svelte:fragment slot="actions">
        <Button variant="solid" on:click={() => (modo = 'medias')}>
          Crear el primer equipo
        </Button>
      </svelte:fragment>
    </EmptyState>
  {:else}
    <PageHeader
      eyebrow="Mantenimiento"
      title="Dos equipos cargados y ninguna lectura."
      subtitle="El plan ya corre por calendario. El reloj de uso está en cero y va a quedarse ahí hasta que alguien mida algo o hasta que entren las salidas."
    />

    <!-- Alert y no EmptyState: acá SÍ hay algo en la superficie. Lo que falta no
         es contenido, es una condición que sigue siendo cierta mientras nadie la
         resuelva — y esa es exactamente la diferencia entre los dos componentes. -->
    <Alert tone="attention" title="Ninguno de los dos equipos tiene una lectura todavía.">
      «Cada 250 h» no puede vencer nunca si nadie cuenta las horas. Una lectura por
      máquina alcanza para arrancar, pero lo que arregla esto de raíz es que el uso
      deje de depender de que alguien se acuerde.
      <svelte:fragment slot="actions">
        <Button size="sm" variant="solid">Subir las salidas del último año</Button>
      </svelte:fragment>
    </Alert>

    <section class="seccion">
      <h2 class="titulo">Equipos registrados</h2>
      <!-- DataList y no Table: dos registros con un nombre larguísimo, un plan en
           prosa y ninguna cifra que comparar no son columnas, son fichas. Una
           tabla acá prometería una comparación que no existe. -->
      <DataList
        label="Equipos registrados"
        items={EQUIPOS_NUEVOS}
        itemKey={(e) => e.id}
        title={(e) => e.nombre}
        code={(e) => e.id}
        note={(e) => e.plan}
        meta={(e) => [e.familia, e.ubicacion, e.creado]}
        noun="equipo"
        nounPlural="equipos"
      >
        <svelte:fragment slot="tag">
          <Pill tone="neutral">Sin lectura</Pill>
        </svelte:fragment>

        <svelte:fragment slot="actions" let:item>
          <!-- Texto visible corto y nombre accesible completo: «Registrar» dos
               veces deja a quien navega por lista de controles sin saber cuál es
               cuál, y el nombre entero no cabe en la fila. -->
          <Button size="sm" variant="ghost">
            Registrar<span class="sx-sr"> lectura de {item.id}</span>
          </Button>
        </svelte:fragment>
      </DataList>
    </section>
  {/if}

  <section class="seccion">
    <h2 class="titulo">
      {modo === 'vacio' ? 'Tres formas de empezar' : 'Tres formas de seguir cargando'}
    </h2>
    <p class="entrada">
      La primera es la más rápida de probar y la más cara de sostener. La segunda es
      la que de verdad se quiere. Ninguna excluye a las otras: se puede crear una
      máquina a mano hoy y subir los documentos la semana entrante.
    </p>

    <div class="puertas">
      {#each PUERTAS as p (p.id)}
        <Card>
          <!-- El div propio existe para que el botón quede pegado al piso de la
               tarjeta: las tres puertas tienen textos de largos distintos y una
               fila de botones a tres alturas se lee como tres cosas distintas. -->
          <div class="puerta">
            <Row gap={2} align="center">
              <Glyph name={p.glifo} size={18} />
              <h3 class="puerta-t">{p.titulo}</h3>
            </Row>

            <Row gap={2}>
              <Pill size="sm" mark={false}>{p.costo}</Pill>
              {#if p.recomendada}
                <!-- El único pill sólido de la pantalla. Es la respuesta, no una
                     etiqueta más, y por eso no hay un segundo botón primario
                     compitiendo con él: la recomendación va en la palabra. -->
                <Pill size="sm" mark={false} solid>Recomendado</Pill>
              {/if}
            </Row>

            <p class="dice">{p.dice}</p>

            <p class="pide">
              <span class="sx-cap">Pide</span>
              {p.pide}
            </p>
            <p class="pide">
              <span class="sx-cap">Cuesta después</span>
              {p.cuesta}
            </p>

            <div class="pie">
              <Button on:click={() => { if (p.llega) modo = p.llega; }}>{p.accion}</Button>
            </div>
          </div>
        </Card>
      {/each}
    </div>
  </section>

  <Panel
    level={2}
    icon="clipboard"
    title="Puesta en marcha"
    sub="Lo que ya está y lo que falta para que el módulo empiece a avisar solo."
  >
    <Stack gap={5}>
      <!-- Bar y no Progress: Progress es una espera, y esto no es una espera de
           nadie — es una cuenta contra un total conocido, y Bar obliga a imprimir
           de cuánto es la fracción. -->
      <!-- El rótulo de la barra NO repite el título del panel: dos renglones
           seguidos que dicen «Puesta en marcha» son un renglón desperdiciado y
           hacen dudar de si son dos cosas distintas. -->
      <Bar
        label="Pasos completados"
        value={listos}
        max={PASOS.length}
        showValue={false}
        scale="{listos} de {PASOS.length} pasos listos"
      />

      <Stack as="ul" gap={4}>
        {#each PASOS as p (p.id)}
          <li>
            <Row gap={3} align="start">
              <!-- Tono + marca + palabra. Un check verde y un círculo gris sin
                   palabra dejan el estado del arranque colgando de un color. -->
              <Pill tone={p.hecho ? 'positive' : 'neutral'} size="sm">
                {p.hecho ? 'Listo' : 'Falta'}
              </Pill>

              <div class="paso">
                <p class="paso-t">{p.titulo}</p>
                <p class="paso-n">{p.nota}</p>
              </div>

              {#if !p.hecho}
                <Button size="sm" variant="ghost">{p.accion}</Button>
              {/if}
            </Row>
          </li>
        {/each}
      </Stack>
    </Stack>

    <!-- El slot del pie se llama «footer». Un nombre equivocado no es error de
         compilación: el contenido no se dibuja y la consola queda limpia. -->
    <svelte:fragment slot="footer">
      Cuando los cinco estén listos, esta lista desaparece sola y en su lugar queda
      la flota.
    </svelte:fragment>
  </Panel>

  <!-- El primer día es el único momento en que alguien de verdad lee cómo
       funciona el producto. Después ya tiene una teoría propia, correcta o no. -->
  <Panel
    level={2}
    icon="clock"
    title="Cómo decide este módulo que algo venció"
    sub="Dos frases. Explican todo lo demás."
  >
    <Stack gap={5}>
      <p class="lead">
        Un plan de mantenimiento corre contra <strong>dos relojes</strong>, el
        calendario y el uso, y vence con el que llegue primero: «cada 6 meses o cada
        250 horas» vence a los 6 meses si la máquina no salió de la bodega, y a las
        250 horas si salió todos los días.
      </p>
      <p class="lead">
        El uso llega de cuatro fuentes y <strong>lo observado le gana a lo
        declarado</strong>: una máquina que de verdad se mide nunca la pisa una
        suposición.
      </p>

      <Divider label="De dónde sale el uso" />

      <!-- HALLAZGO: la librería no tiene un componente para pares término /
           definición, que es la forma de media docena de explicaciones por
           producto. Acá va un <dl> con layout propio; si aparece una tercera vez
           en el ecosistema, el arreglo va en la librería y no en esta pantalla. -->
      <dl class="fuentes">
        <div>
          <dt class="sx-cap">Manual</dt>
          <dd>Alguien anota el horómetro cuando pasa por la máquina. Declarado.</dd>
        </div>
        <div>
          <dt class="sx-cap">Dispatch</dt>
          <dd>Las salidas y devoluciones en PDF dicen cuánto estuvo afuera. Observado.</dd>
        </div>
        <div>
          <dt class="sx-cap">Schedule</dt>
          <dd>Un horario declarado: el horno trabaja 14 h por día. Vale mientras nada lo contradiga.</dd>
        </div>
        <div>
          <dt class="sx-cap">IoT</dt>
          <dd>El equipo reporta solo. Observado, y le gana a las otras tres.</dd>
        </div>
      </dl>

      <Well>
        <strong>Y una regla que no se rompe nunca:</strong> un horómetro no
        retrocede. Si una lectura baja, o la escribieron mal o le cambiaron el
        instrumento al equipo — las dos cosas necesitan que alguien decida, no que
        el sistema adivine.
      </Well>
    </Stack>
  </Panel>
</div>

<style>
  /* Todo lo que hay acá es distribución. Ni un color, ni un radio, ni una sombra:
     eso lo pone la librería, y por eso cambiar de marca o de tema no toca este
     archivo. Los espacios son pasos de la escala de tokens, no números sueltos. */
  .pantalla {
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-8);
    padding: var(--sx-s-6);
    max-width: 1080px;
    margin: 0 auto;
  }
  /* Más aire que en Flota —s-8 y no s-6— porque esta pantalla es una secuencia de
     argumentos y no un tablero: cada bloque se lee antes de pasar al siguiente. */

  .demo {
    margin: 0;
    flex: 1 1 26ch;
    min-width: 0;
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-2);
  }
  .etiqueta { margin-right: var(--sx-s-2); }

  .seccion {
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-4);
  }
  .titulo {
    margin: 0;
    font-size: var(--sx-t-lg);
    font-weight: var(--sx-w-semi);
    letter-spacing: -0.02em;
  }
  .entrada {
    margin: calc(var(--sx-s-2) * -1) 0 0;
    max-width: 68ch;
    font-size: var(--sx-t-sm);
    line-height: 1.55;
    color: var(--sx-ink-3);
  }

  /* auto-fit, no tres columnas fijas: a 380px cada puerta ocupa la fila entera
     sin necesidad de una media query, y a 1080 caben las tres. */
  .puertas {
    display: grid;
    gap: var(--sx-s-4);
    grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
  }
  .puerta {
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-3);
    flex: 1 1 auto;
  }
  .puerta-t {
    margin: 0;
    min-width: 0;
    font-size: var(--sx-t-md);
    font-weight: var(--sx-w-semi);
    letter-spacing: -0.01em;
    line-height: 1.3;
  }
  .dice {
    margin: 0;
    font-size: var(--sx-t-sm);
    line-height: 1.55;
    color: var(--sx-ink-2);
  }
  .pide {
    margin: 0;
    font-size: var(--sx-t-xs);
    line-height: 1.55;
    color: var(--sx-ink-3);
  }
  .pide .sx-cap { margin-right: var(--sx-s-2); }
  .pie { margin-top: auto; padding-top: var(--sx-s-2); }

  .paso {
    flex: 1 1 24ch;
    min-width: 0;
  }
  .paso-t {
    margin: 0;
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-semi);
    line-height: 1.4;
  }
  .paso-n {
    margin: var(--sx-s-1) 0 0;
    max-width: 66ch;
    font-size: var(--sx-t-xs);
    line-height: 1.55;
    color: var(--sx-ink-3);
  }

  .lead {
    margin: 0;
    max-width: 72ch;
    font-size: var(--sx-t-sm);
    line-height: 1.6;
    color: var(--sx-ink-2);
  }

  .fuentes {
    margin: 0;
    display: grid;
    gap: var(--sx-s-4);
    grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  }
  .fuentes dt { margin: 0 0 var(--sx-s-1); }
  .fuentes dd {
    margin: 0;
    font-size: var(--sx-t-sm);
    line-height: 1.5;
    color: var(--sx-ink-2);
  }
</style>
