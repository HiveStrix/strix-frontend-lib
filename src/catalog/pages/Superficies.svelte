<script>
  // SUPERFICIES — la página de la familia SHELL.
  //
  // Esta página no existía. Diez componentes vivían en `src/lib/shell` sin que
  // nada los renderizara nunca, lo que quiere decir que nadie los había mirado
  // — ni en claro, ni en oscuro, ni a 390 px. Un componente que no se dibujó
  // nunca no está terminado: está escrito.
  //
  // Es más corta que Formularios o Tablas a propósito, y eso también es honesto:
  // documenta cada componente en su forma principal y en el estado que lo rompe,
  // no en las quince combinaciones. Lo que falta está anotado en el README.
  import { Hero, Card, Panel, Well, Stack, Row, Divider, Toolbar, Sheet, Tooltip, Glyph, GLYPHS } from '../../lib/shell/index.js';
  import { Stat, StatStrip } from '../../lib/metric/index.js';
  import Pill from '../../lib/Pill.svelte';
  import Button from '../../lib/action/Button.svelte';

  const TOC = [
    ['hero', 'Hero'], ['card', 'Card'], ['panel', 'Panel'], ['well', 'Well'], ['aire', 'Stack · Row'],
    ['divider', 'Divider'], ['toolbar', 'Toolbar'], ['sheet', 'Sheet'],
    ['tooltip', 'Tooltip'], ['glyph', 'Glyph']
  ];

  let sheet = false;
  let sheetLeft = false;
  let selected = 'BAT014';
</script>

<div class="page">
  <header class="lede">
    <p class="sx-cap">Familia · <span class="sx-id">src/lib/shell</span></p>
    <h1>Superficies</h1>
    <p class="stand">
      La familia callada. Nada de acá dice nada: ponen la superficie, la profundidad, el aire y
      el orden, y después se quitan del medio para que los componentes que sí dicen algo —&nbsp;el
      Pill, los controles, las tablas&nbsp;— sean lo único en pantalla con una opinión.
    </p>
  </header>

  <div class="rules">
    <div>
      <h2 class="sx-cap">La profundidad viene de la luz</h2>
      <p>
        Una tarjeta es relleno + radio + elevación. Sin borde. Las sombras del sistema tienen
        desplazamiento real y desenfoque suave porque eso es lo que hace una cosa levantada con
        la luz; un rectángulo de 1 px es el <em>dibujo</em> de una caja, no una caja.
      </p>
    </div>
    <div>
      <h2 class="sx-cap">La elevación es altitud, no importancia</h2>
      <p>
        <span class="sx-id">e-1</span> es el mobiliario de la página. <span class="sx-id">e-2</span>
        es algo que se adelantó: un menú, un hover. <span class="sx-id">e-3</span> es algo que se
        tomó la pantalla. Una ficha en e-3 no se lee como importante: se lee como rota.
      </p>
    </div>
    <div>
      <h2 class="sx-cap">El espacio es de Stack y de Row</h2>
      <p>
        Ningún otro componente tiene opinión sobre su propio margen. Por eso la respuesta a
        «¿qué tan separado?» siempre es un paso de la misma escala, y por eso no existe el
        problema de los catorce píxeles.
      </p>
    </div>
  </div>


  <div class="body">
    <nav class="toc" aria-label="Índice de la página">
      <ul>
        {#each TOC as [id, name] (id)}
          <li><a href="#/superficies/{id}">{name}</a></li>
        {/each}
      </ul>
    </nav>

    <main>
      <!-- ═══ CARD ═══════════════════════════════════════════════════════ -->
  <section id="hero">
    <h2>Hero</h2>
    <p class="stand">
      El panel grande, el primero de una pantalla. Responde «¿cómo vamos?» antes
      de que nadie lea una tabla. Dos columnas con pesos distintos —1.4 a 1, para
      que la derecha se lea como secundaria— su propio campo, y más aire que
      cualquier otra superficie. Hay uno por pantalla; por eso puede permitirse
      traer color propio.
    </p>

    <Hero
      title="Flota"
      lede="Cuatro equipos vencidos y dos por vencer esta semana."
      tone="critical">
      <svelte:fragment slot="actions">
        <Button variant="solid">Registrar lectura</Button>
        <Button>Ver vencidos</Button>
      </svelte:fragment>
      <svelte:fragment slot="aside">
        <StatStrip>
          <Stat label="Vencidos" value={4} tone="critical" />
          <Stat label="Por vencer" value={2} tone="attention" />
          <Stat label="Al día" value={62} tone="positive" />
        </StatStrip>
      </svelte:fragment>
    </Hero>

    <p class="stand" style="margin-top: var(--sx-s-6)">
      <b>Tres campos.</b> La diferencia entre ellos es de qué está hecho el fondo,
      no de cuánto color lleva. Un producto elige uno y lo repite.
    </p>

    <Hero surface="ink" title="Cierre de mes" lede="Todo conciliado.">
      <svelte:fragment slot="aside">
        <StatStrip>
          <Stat label="Órdenes" value={148} />
          <Stat label="Sin cerrar" value={0} />
        </StatStrip>
      </svelte:fragment>
    </Hero>

    <Hero surface="plain" title="Repuestos" lede="Sin movimientos hoy." />
  </section>

      <section id="card">
        <h2>Card</h2>
        <p class="why">
          El objeto. Todo lo que una pantalla de Strix muestra se apoya en algo, y esto es ese
          algo. Es una columna flex a propósito: una Card a la que su padre le da altura puede
          pasársela a un hijo que hace scroll, y sobre eso está construido el
          <span class="sx-id">scroll</span> de Panel.
        </p>

        <div class="demo">
          <div class="cards">
            <Card><p class="cl"><b>e-1 · el mobiliario</b><span>Filas, fichas, paneles. Lo normal.</span></p></Card>
            <Card elevation={2}><p class="cl"><b>e-2 · se adelantó</b><span>Un menú abierto, un hover, algo que se arrastra.</span></p></Card>
            <Card elevation={3}><p class="cl"><b>e-3 · se tomó la pantalla</b><span>Un diálogo, un Sheet. Nada más.</span></p></Card>
          </div>

          <div class="cards">
            <Card interactive selected={selected === 'BAT014'} on:click={() => (selected = 'BAT014')}>
              <p class="cl"><b>BAT014</b><span>Interactiva y seleccionada. Es un <span class="sx-id">&lt;button&gt;</span> de verdad con <span class="sx-id">aria-pressed</span>.</span></p>
            </Card>
            <Card interactive selected={selected === 'CL445926'} on:click={() => (selected = 'CL445926')}>
              <p class="cl"><b>CL445926</b><span>El anillo de selección se dibuja por dentro: elegir una no mueve la grilla dos píxeles.</span></p>
            </Card>
            <Card interactive disabled>
              <p class="cl"><b>BAT022 · dada de baja</b><span>Inerte y atenuada. Un enlace deshabilitado no existe, así que se vuelve botón.</span></p>
            </Card>
          </div>
        </div>

        <p class="note">
          <span class="sx-id">class</span> no es parte de la API. Una clase con ámbito del
          componente que llama no llegaría hasta acá de todos modos —&nbsp;otro ámbito, y dentro de
          un Core otro shadow root&nbsp;— así que se compone con props y slots en vez de meter mano.
        </p>

        <h3 class="sx-cap sub">tone — la sombra, teñida, no un canto</h3>
        <p class="why">
          Nueve componentes ya aceptaban <span class="sx-id">tone</span> —Pill, Well, Alert, Stat,
          Bar…— y las dos superficies principales no: se podía decir «este pozo es crítico» y no
          «esta tarjeta es crítica». Teñir la tarjeta entera la habría convertido en decoración de
          fondo, compitiendo con lo que hay escrito encima —&nbsp;eso es lo que hace Well, a tamaño
          de banda, donde el relleno ES el punto. La primera versión de esto dibujaba un cabo de
          tres píxeles en el borde superior, y el veredicto al verlo en pantalla fue preciso: una
          franja de color en el canto de una tarjeta es de los patrones más repetidos que existen
          — no dice nada de este sistema. La salida está en la propia ley de Nácar, que ya resolvió
          el mismo problema en <span class="sx-id">PageHeader</span>: nada se separa con una línea
          si puede separarse con luz. Acá el tono tiñe la sombra que la tarjeta ya proyecta
          (<span class="sx-id">--sx-e-1/2/3</span>) en vez de agregar un borde — de cerca casi no
          se nota, de lejos una grilla de tarjetas se lee por dónde está caliente.
        </p>

        <div class="demo">
          <div class="cards">
            <Card tone="critical">
              <p class="cl">
                <b>BAT014</b>
                <Pill tone="critical" size="sm">Vencido</Pill>
                <span>12 días sin cerrar el plan semestral.</span>
              </p>
            </Card>
            <Card tone="attention">
              <p class="cl">
                <b>BAT001</b>
                <Pill tone="attention" size="sm">Vence en 3 días</Pill>
                <span>Cambio de aceite programado para el jueves.</span>
              </p>
            </Card>
            <Card tone="positive">
              <p class="cl">
                <b>CL445926</b>
                <Pill tone="positive" size="sm">Al día</Pill>
                <span>Última lectura hace 4 días, dentro del intervalo.</span>
              </p>
            </Card>
            <Card tone="info">
              <p class="cl">
                <b>CL336793</b>
                <Pill tone="info" size="sm">Reasignado</Pill>
                <span>Pasó de Alajuela a Heredia el 2 de agosto.</span>
              </p>
            </Card>
            <Card tone="neutral">
              <p class="cl">
                <b>BAT022</b>
                <Pill tone="neutral" size="sm" mark={false}>51 equipos</Pill>
                <span>Un conteo, sin estado que reclamar.</span>
              </p>
            </Card>
            <Card tone="critical" elevation={2}>
              <p class="cl">
                <b>BAT019</b>
                <Pill tone="critical" size="sm">Vencido</Pill>
                <span>
                  Texto largo a propósito, y en e-2: el tinte vive en la sombra, no en el
                  contenido, así que ni el largo del párrafo ni la altitud de la tarjeta lo mueven
                  o lo cortan.
                </span>
              </p>
            </Card>
          </div>
        </div>

        <p class="note">
          <b>El color nunca viaja solo, tampoco acá.</b> El tinte acompaña a un <span class="sx-id">Pill</span>
          o a una palabra que ya nombra el estado — no lo reemplaza. Una tarjeta cuya sombra está
          teñida sin nada adentro que diga qué significa ese color es exactamente lo que la regla
          prohíbe. El tinte es deliberadamente tenue —más todavía en oscuro, donde una luz de color
          se nota antes que sobre blanco— y por eso no entra al contrato duro de
          <span class="sx-id">pnpm contrast</span>: es una sombra difusa, como
          <span class="sx-id">--sx-halo</span>, no un borde nítido contra el que medir 1.4.11. Ver
          el comentario junto a <span class="sx-id">--card-glow</span> en <span class="sx-id">Card.svelte</span>.
        </p>

        <h3 class="sx-cap sub">variant — tres maneras de cerrar una superficie</h3>
        <p class="why">
          Luz, línea o tono: las tres maneras en que una superficie puede distinguirse de su
          fondo. <span class="sx-id">raised</span> es la ley — la sombra — y no se toca.
          <span class="sx-id">crest</span> y <span class="sx-id">filled</span> son salidas
          explícitas, no un reemplazo: la misma tarjeta, el mismo contenido, separada del fondo
          de otra manera. El argumento completo —por qué existen y por qué el marco importa más
          que ellas— está en la cabecera de <span class="sx-id">Card.svelte</span>.
        </p>

        <div class="demo">
          <div class="cards">
            <Card>
              <p class="cl">
                <b>raised · default</b>
                <span>BAT014 — la sombra. No se toca.</span>
              </p>
            </Card>
            <Card variant="crest" crestColor="#2563EB">
              <p class="cl">
                <b>crest</b>
                <span>
                  BAT014 — un anillo de 1&nbsp;px en la sombra, no en <span class="sx-id">border</span>,
                  con un reflejo arriba. Adaptada de un ERP real, recompuesta con tokens de Nácar.
                </span>
              </p>
            </Card>
            <Card variant="filled">
              <p class="cl">
                <b>filled</b>
                <span>BAT014 — el relleno, sin sombra. Para cuando muchas tarjetas juntas acumulan ruido.</span>
              </p>
            </Card>
          </div>
        </div>

        <p class="note">
          <b>Cuándo usar cada una.</b> <span class="sx-id">raised</span>, siempre que no haya un
          motivo concreto para otra cosa — es el default por algo. <span class="sx-id">crest</span>
          cuando una superficie tiene que leerse «cerrada» sin pedir más sombra —un formulario
          compuesto, un panel de configuración— y el anillo hace ese trabajo mejor que otro
          escalón de <span class="sx-id">elevation</span>. <span class="sx-id">filled</span> cuando
          hay muchas tarjetas juntas —una grilla, un tablero— y la sombra de cada una deja de
          separar y empieza a acumularse como ruido de fondo. Elegir una no es gusto: es decir con
          qué mecanismo se separa esa superficie, a propósito — y una pantalla con las tres
          mezcladas sin ese criterio es peor que una pantalla con una sola.
        </p>
      </section>

      <!-- ═══ PANEL ══════════════════════════════════════════════════════ -->
      <section id="panel">
        <h2>Panel</h2>
        <p class="why">
          Una Card que dice qué es. El objeto más común de todos los productos no es una tarjeta:
          es una tarjeta con un título y dos controles en la esquina. Escrito a mano son una fila
          flex, un encabezado cuyo nivel alguien adivinó, y un padding de 20&nbsp;px acá y
          24&nbsp;allá.
        </p>

        <div class="demo two-up">
          <Panel title="Servicios" sub="Los últimos 12 meses" icon="clipboard" level={3}>
            <svelte:fragment slot="actions">
              <Button size="sm" variant="ghost">Exportar CSV</Button>
              <Button size="sm">Registrar</Button>
            </svelte:fragment>
            <Stack gap={2}>
              <Row justify="between"><span>Preventivas</span><b class="sx-num">18</b></Row>
              <Row justify="between"><span>Correctivas</span><b class="sx-num">7</b></Row>
              <Row justify="between"><span>Canceladas</span><b class="sx-num">2</b></Row>
            </Stack>
            <svelte:fragment slot="footer">
              <Row justify="between"><span>Costo del período</span><b class="sx-num">₡4 820 000</b></Row>
            </svelte:fragment>
          </Panel>

          <Panel title="Libro de servicios" sub="flush · el contenido llega al borde" level={3} flush>
            <ul class="rows">
              <li><span class="sx-id">OT-0042</span><span>BAT007</span><Pill tone="positive" size="sm">Completada</Pill></li>
              <li><span class="sx-id">OT-0041</span><span>CL445926</span><Pill tone="positive" size="sm">Completada</Pill></li>
              <li><span class="sx-id">OT-0040</span><span>BAT014</span><Pill tone="attention" size="sm">Sin cerrar</Pill></li>
            </ul>
          </Panel>
        </div>

        <p class="note">
          <b>El nivel del encabezado es una prop y no tiene un valor por defecto en el que confiar.</b>
          Un panel no sabe qué tan profundo está en el documento, y un <span class="sx-id">h2</span>
          anidado bajo otro <span class="sx-id">h2</span> es exactamente la clase de mentira que
          deja inútil el esquema de un lector de pantalla. Los dos de arriba pasan
          <span class="sx-id">level=&#123;3&#125;</span> porque viven bajo el <span class="sx-id">h2</span>
          de esta sección.
        </p>

        <h3 class="sx-cap sub">headVariant — el estilo Sarion, comparado con el default</h3>
        <p class="why">
          Se pidió ver la pieza trabajando, no la barra sola: <span class="sx-id">PageHeader
          variant="sarion"</span> vive en <span class="sx-id">Estructura</span> como una cabecera
          suelta, y una barra sola no alcanza para juzgar cómo se ve cerrando un Panel de verdad.
          Panel no tenía esa cabecera — su <span class="sx-id">.head</span> siempre fue la banda de
          <span class="sx-id">--sx-thead</span>, sin salida —, así que ahora es un prop propio,
          <span class="sx-id">headVariant</span>, con la misma tipografía que
          <span class="sx-id">PageHeader</span> ya calibró para <span class="sx-id">sarion</span>
          (no <span class="sx-id">PageHeader</span> montado adentro: ver la nota en
          <span class="sx-id">Panel.svelte</span> sobre por qué — en corto, su <span class="sx-id">level</span>
          sólo entiende <span class="sx-id">h1</span>/<span class="sx-id">h2</span> y el de Panel
          tiene que llegar hasta <span class="sx-id">h6</span>). Mismo título, mismo subtítulo,
          mismas acciones, mismo cuerpo, mismo pie — sólo la cabecera cambia, para que se pueda
          comparar en vez de sólo mirar dos cosas lindas.
        </p>

        <div class="demo two-up">
          <Panel title="Servicios" sub="Los últimos 12 meses" icon="clipboard" level={3}>
            <svelte:fragment slot="actions">
              <Button size="sm" variant="ghost">Exportar CSV</Button>
              <Button size="sm">Registrar</Button>
            </svelte:fragment>
            <Stack gap={2}>
              <Row justify="between"><span>Preventivas</span><b class="sx-num">18</b></Row>
              <Row justify="between"><span>Correctivas</span><b class="sx-num">7</b></Row>
              <Row justify="between"><span>Canceladas</span><b class="sx-num">2</b></Row>
            </Stack>
            <svelte:fragment slot="footer">
              <Row justify="between"><span>Costo del período</span><b class="sx-num">₡4 820 000</b></Row>
            </svelte:fragment>
          </Panel>

          <Panel title="Servicios" sub="Los últimos 12 meses" icon="clipboard" level={3} headVariant="sarion">
            <svelte:fragment slot="actions">
              <Button size="sm" variant="ghost">Exportar CSV</Button>
              <Button size="sm">Registrar</Button>
            </svelte:fragment>
            <Stack gap={2}>
              <Row justify="between"><span>Preventivas</span><b class="sx-num">18</b></Row>
              <Row justify="between"><span>Correctivas</span><b class="sx-num">7</b></Row>
              <Row justify="between"><span>Canceladas</span><b class="sx-num">2</b></Row>
            </Stack>
            <svelte:fragment slot="footer">
              <Row justify="between"><span>Costo del período</span><b class="sx-num">₡4 820 000</b></Row>
            </svelte:fragment>
          </Panel>
        </div>

        <h3 class="sx-cap sub">tone — el mismo tinte, forwardeado a Card</h3>
        <p class="why">
          <span class="sx-id">tone</span> viaja a la <span class="sx-id">Card</span> de adentro tal
          cual. Antes éste era el caso que de verdad probaba algo: la banda de
          <span class="sx-id">--sx-thead</span> es opaca y se dibuja encima, así que si el canto se
          hubiera dibujado detrás de los hijos, como una sombra normal, un panel con título se lo
          comía entero — hacía falta un <span class="sx-id">::before</span> pintado DESPUÉS del
          contenido para sobrevivir. Esa complicación desapareció sola: la sombra de la tarjeta se
          dibuja por FUERA de su propia caja, nunca debajo de los hijos, así que la banda opaca del
          encabezado nunca estuvo en su camino. Una ventaja de mudar el gesto a luz en vez de
          contorno que no se buscaba, y que igual se llevó puesta.
        </p>

        <div class="demo">
          <Panel title="BAT014 · Batidora Guanacaste" sub="Plan semestral" icon="alert" level={3} tone="critical">
            <svelte:fragment slot="actions">
              <Pill tone="critical" size="sm">Vencido</Pill>
            </svelte:fragment>
            <p class="cl">12 días sin cerrar «Cambio de aceite 250 h». El canto de arriba es el único color nuevo en esta tarjeta — la palabra la dice el Pill.</p>
          </Panel>
        </div>

        <h3 class="sx-cap sub">variant — reenviado a Card, medido acá</h3>
        <p class="why">
          <span class="sx-id">variant</span> (de <span class="sx-id">Card</span>) también reenvía,
          sin listarse entre los props de este componente a propósito —
          <span class="sx-id">$$restProps</span> lo lleva igual que <span class="sx-id">href</span>
          o <span class="sx-id">interactive</span>. <span class="sx-id">crest</span> ya estaba medido:
          el anillo vive en la Card exterior, independiente de <span class="sx-id">.head</span>.
          <span class="sx-id">filled</span> no lo estaba — su cabecera del catálogo, hasta hoy, decía
          que nadie había medido <span class="sx-id">--sx-thead</span> contra el relleno nuevo de
          <span class="sx-id">--card-fill</span>. Es exactamente el par que el arnés ya mide con otro
          nombre: <span class="sx-id">--card-fill</span> es <span class="sx-id">var(--sx-accent-soft)</span>
          tal cual, y la fila <i>«cabecera contra el hover de su control»</i> de
          <span class="sx-id">DISTINCT</span> ya compara <span class="sx-id">--sx-thead</span> contra
          <span class="sx-id">--sx-accent-soft</span> en las cuatro combinaciones. El peor caso —claro,
          cromo morado, el que este catálogo pinta por defecto— da 1.06:1: pasa el piso de 1.05, con
          menos margen que el que <span class="sx-id">crest</span> tenía cuando medía 1.12 y no se veía
          nada. Por eso la banda de acá abajo no se da por buena sólo con el número: la línea que seguía
          se sacó mirando esta misma tarjeta en pantalla, en las cuatro combinaciones.
        </p>

        <div class="demo two-up">
          <Panel title="Servicios" sub="raised — el default" icon="clipboard" level={3}>
            <svelte:fragment slot="actions">
              <Button size="sm" variant="ghost">Exportar CSV</Button>
            </svelte:fragment>
            <Stack gap={2}>
              <Row justify="between"><span>Preventivas</span><b class="sx-num">18</b></Row>
              <Row justify="between"><span>Correctivas</span><b class="sx-num">7</b></Row>
            </Stack>
          </Panel>

          <Panel title="Servicios" sub="filled — el relleno con acento" icon="clipboard" level={3} variant="filled">
            <svelte:fragment slot="actions">
              <Button size="sm" variant="ghost">Exportar CSV</Button>
            </svelte:fragment>
            <Stack gap={2}>
              <Row justify="between"><span>Preventivas</span><b class="sx-num">18</b></Row>
              <Row justify="between"><span>Correctivas</span><b class="sx-num">7</b></Row>
            </Stack>
          </Panel>
        </div>

        <p class="note">
          <b>Medido, no sólo calculado.</b> La banda superior se sigue leyendo como una pieza posada
          sobre el relleno en las dos combinaciones de tema y las dos de cromo — el mismo veredicto que
          el número. Queda como verificado en <span class="sx-id">Panel.svelte</span>: no hizo falta una
          fila nueva en <span class="sx-id">DISTINCT</span> —la que ya medía «cabecera contra el hover
          de su control» es, token por token, esta misma comparación— así que lo que cambió fue su
          comentario, para que diga las dos cosas que mide.
        </p>
      </section>

      <!-- ═══ WELL ═══════════════════════════════════════════════════════ -->
      <section id="well">
        <h2>Well</h2>
        <p class="why">
          La banda hundida: el movimiento opuesto a Card. Una Card viene hacia vos; un Well se
          va. Es la parte de una superficie que está <em>debajo</em> de la superficie —&nbsp;el
          resumen bajo un formulario, la nota que el sistema hace sobre lo que acabás de hacer,
          los totales bajo una tabla.
        </p>

        <div class="demo">
          <Stack gap={3}>
            <Well>Sin tono: la banda normal. Fondo hundido, tinta secundaria, sin borde de color.</Well>
            <Well tone="attention">
              <Row gap={2} wrap={false} align="start">
                <Glyph name="alert" size={16} />
                <span><b>Falta la lectura de julio.</b> Sin ella la proyección de BAT001 es una adivinanza.</span>
              </Row>
            </Well>
            <Well tone="critical">
              <Row gap={2} wrap={false} align="start">
                <Glyph name="alert" size={16} />
                <span><b>Vencido hace 12 días.</b> El plan semestral de BAT014 no se cerró.</span>
              </Row>
            </Well>
            <Well tone="positive">
              <Row gap={2} wrap={false} align="start">
                <Glyph name="check" size={16} />
                <span><b>Al día.</b> Las 41 máquinas restantes están dentro de su intervalo.</span>
              </Row>
            </Well>
          </Stack>
        </div>

        <p class="note">
          <b>Un Well con tono es un color, y el color nunca viaja solo.</b> El tono es el
          <em>contenedor</em>, así que la palabra tiene que estar adentro: quien no separe la banda
          ámbar de la verde no pierde absolutamente nada. Una banda que sólo dice
          «₡1&nbsp;240&nbsp;000» en ámbar no le dice nada a un tercio de quienes la leen, y nada de
          nada en una fotocopia.
        </p>
      </section>

      <!-- ═══ STACK · ROW ════════════════════════════════════════════════ -->
      <section id="aire">
        <h2>Stack &amp; Row</h2>
        <p class="why">
          El aire. El margen puntual es cómo se pudre un sistema de diseño:
          <span class="sx-id">margin-bottom: 14px</span> bajo un título en una pantalla, 12 en la
          siguiente, 16 en la tercera porque alguien lo midió a ojo en una laptop. Stack se queda
          con el espacio vertical para que ningún otro componente tenga que tener uno.
        </p>

        <div class="demo grid2">
          <div class="mini">
            <p class="sx-cap">Stack · gap 1 · 2 · 4 · 6</p>
            <div class="rail">
              {#each [1, 2, 4, 6] as g (g)}
                <Stack gap={g}>
                  <span class="blk"></span><span class="blk"></span><span class="blk"></span>
                </Stack>
              {/each}
            </div>
          </div>
          <div class="mini">
            <p class="sx-cap">Row · envuelve por defecto</p>
            <Row gap={2}>
              {#each ['Preventiva', 'Correctiva', 'Predictiva', 'Garantía', 'Siniestro', 'Reacondicionado'] as w (w)}
                <Pill tone="neutral" mark={false} size="sm">{w}</Pill>
              {/each}
            </Row>
            <p class="tiny">
              Un módulo se dibuja al lado de una barra lateral de 240&nbsp;px: una fila de cuatro
              controles que entra a 1440 tiene 380&nbsp;px para vivir en una tableta. Apagar el
              envolvimiento es deliberado, nunca por defecto.
            </p>
          </div>
        </div>

        <p class="note">
          <span class="sx-id">gap</span> es un <em>paso</em> (1 2 3 4 5 6 8 10 12 16 20), no una
          cuenta de píxeles. Cualquier otra cosa colapsa a 0 en vez de inventar en silencio un
          valor que el sistema no tiene: un espacio equivocado que se ve gana a uno que parece
          plausible.
        </p>
      </section>

      <!-- ═══ DIVIDER ════════════════════════════════════════════════════ -->
      <section id="divider">
        <h2>Divider</h2>
        <p class="why">
          La única línea que el sistema permite, y se gana la excepción por ser sobre
          <em>secuencia</em> y no sobre contención: «este grupo terminó, empieza otro», dentro de
          una sola superficie. Si querés un borde alrededor de algo, querés una Card o un Well.
        </p>

        <div class="demo">
          <Card pad={5}>
            <Stack gap={4}>
              <span>Datos del equipo</span>
              <Divider />
              <span>Después de una regla simple</span>
              <Divider label="Repuestos" />
              <span>Después de una que nombra lo que viene</span>
              <Divider strong />
              <span>Después del corte fuerte, el único de un panel largo</span>
              <Row gap={3} align="center">
                <span>Vertical</span><Divider vertical /><span>entre dos</span><Divider vertical /><span>controles</span>
              </Row>
            </Stack>
          </Card>
        </div>

        <p class="note">
          No lleva margen. El espacio entre las cosas es trabajo de Stack y de Row, y un
          componente con opinión sobre su propio margen es el principio del problema que esos dos
          existen para terminar.
        </p>
      </section>

      <!-- ═══ TOOLBAR ════════════════════════════════════════════════════ -->
      <section id="toolbar">
        <h2>Toolbar</h2>
        <p class="why">
          La barra sobre el trabajo: qué estás mirando a la izquierda, qué podés hacer a la
          derecha. Escrita a mano son las mismas ocho líneas de flex cada vez, y las ocho líneas
          no se ponen de acuerdo entre pantallas sobre el espacio ni sobre qué pasa al hacer scroll.
        </p>

        <div class="demo">
          <Card pad={4}>
            <Toolbar aria-label="Filtros del libro de servicios">
              <Pill tone="critical" size="sm">3 vencidas</Pill>
              <Pill tone="attention" size="sm">5 por vencer</Pill>
              <Pill tone="neutral" size="sm" mark={false}>51 equipos</Pill>
              <svelte:fragment slot="end">
                <Button size="sm" variant="ghost">Exportar</Button>
                <Button size="sm" variant="solid">Registrar servicio</Button>
              </svelte:fragment>
            </Toolbar>
          </Card>
        </div>

        <p class="note">
          <b>No es <span class="sx-id">role="toolbar"</span>, a propósito.</b> Ese rol promete foco
          rotativo: una sola parada de tabulación para toda la barra y flechas entre los controles
          de adentro. Eso no está implementado, así que reclamarlo le enseñaría a alguien que usa
          el teclado un modelo de navegación que no existe —&nbsp;y un atributo aria que miente es
          peor que ninguno. Lo que esto es, es un grupo de controles con nombre.
        </p>
      </section>

      <!-- ═══ SHEET ══════════════════════════════════════════════════════ -->
      <section id="sheet">
        <h2>Sheet</h2>
        <p class="why">
          El cajón lateral: una segunda superficie sin abandonar la primera. El trabajo en estos
          productos es una lista, y lo que se abre desde una lista es una de sus filas. Un diálogo
          centrado tira la lista y después te pide que la recuerdes; un cajón la deja en pantalla,
          así que «¿cuál de las veintidós era?» sigue teniendo respuesta.
        </p>

        <div class="demo">
          <Row gap={2}>
            <Button on:click={() => { sheetLeft = false; sheet = true; }}>Abrir el cajón</Button>
            <Button variant="ghost" on:click={() => { sheetLeft = true; sheet = true; }}>Abrirlo por la izquierda</Button>
          </Row>
        </div>

        <Sheet bind:open={sheet} side={sheetLeft ? 'left' : 'right'} title="BAT014 · Batidora Guanacaste">
          <Stack gap={4}>
            <Well tone="critical">
              <Row gap={2} wrap={false} align="start">
                <Glyph name="alert" size={16} />
                <span><b>Vencida hace 12 días</b> en «Cambio de aceite 250&nbsp;h».</span>
              </Row>
            </Well>
            <!-- Una <dl> de verdad, no Rows: `dt` y `dd` sólo son válidos como
                 hijos directos de una lista de definiciones, y una grilla de dos
                 columnas alinea los valores mejor de todos modos. -->
            <dl class="facts">
              <dt>Horómetro</dt><dd class="sx-num">1 248 h</dd>
              <dt>Última lectura</dt><dd>18 de julio de 2026</dd>
              <dt>Ubicación</dt><dd>Patio Guanacaste</dd>
              <dt>Familia</dt><dd>Batidoras eléctricas</dd>
            </dl>
            <p class="tiny">
              Probá el teclado: <b>Tab</b> queda atrapado adentro, <b>Escape</b> cierra un nivel y
              sólo uno, y al cerrar el foco vuelve al botón que lo abrió. Esa última parte es la que
              todo el mundo se salta y la que decide si alguien puede seguir trabajando.
            </p>
          </Stack>
          <svelte:fragment slot="footer">
            <Button variant="ghost" on:click={() => (sheet = false)}>Cerrar</Button>
            <Button variant="solid">Registrar el servicio</Button>
          </svelte:fragment>
        </Sheet>

        <p class="note">
          <b>No hace portal, y es deliberado.</b> Mover el nodo a <span class="sx-id">document.body</span>
          es el truco habitual para escapar de un ancestro recortado, y dentro de un Core es fatal:
          el nodo saldría del shadow root y perdería todos sus estilos y todos sus tokens con él.
          El costo, dicho claro: un ancestro con <span class="sx-id">transform</span> se vuelve el
          bloque contenedor de <span class="sx-id">fixed</span> y el cajón queda atrapado adentro.
        </p>
      </section>

      <!-- ═══ TOOLTIP ════════════════════════════════════════════════════ -->
      <section id="tooltip">
        <h2>Tooltip</h2>
        <p class="why">
          Una reparación, no una funcionalidad. Cada tooltip es la admisión de que algo en
          pantalla no está diciendo qué es. Lo que <b>nunca</b> puede llevar es algo que una
          persona necesita leer para hacer el trabajo: en una tableta no hay hover, en un lector
          de pantalla llega como ocurrencia tardía, y en una máquina lenta llega tarde.
        </p>

        <div class="demo">
          <Row gap={4}>
            <Tooltip text="Exportar el libro filtrado a CSV">
              <Button variant="outline" label="Exportar CSV" iconOnly>
                <svelte:fragment slot="icon"><Glyph name="download" /></svelte:fragment>
              </Button>
            </Tooltip>
            <Tooltip text="Volver a leer desde el servidor" placement="bottom">
              <Button variant="outline" label="Actualizar" iconOnly>
                <svelte:fragment slot="icon"><Glyph name="refresh" /></svelte:fragment>
              </Button>
            </Tooltip>
            <Tooltip text="Dar de baja el equipo" placement="right">
              <Button variant="ghost" label="Dar de baja" iconOnly>
                <svelte:fragment slot="icon"><Glyph name="trash" /></svelte:fragment>
              </Button>
            </Tooltip>
          </Row>
        </div>

        <p class="note">
          El disparador es tuyo, no nuestro: pasás un <span class="sx-id">&lt;button&gt;</span> o un
          <span class="sx-id">&lt;a&gt;</span> de verdad en el slot y al montar el id del globo se
          pone sobre el primer nodo enfocable como <span class="sx-id">aria-describedby</span>. Si no
          hay nada enfocable adentro, <b>no se ata nada</b>: el componente se niega a tapar un
          control que un teclado no puede alcanzar.
        </p>
      </section>

      <!-- ═══ GLYPH ══════════════════════════════════════════════════════ -->
      <section id="glyph">
        <h2>Glyph</h2>
        <p class="why">
          Veintitrés dibujos, hechos <em>a</em> 16&nbsp;px, que es el tamaño al que se usan. Un
          juego prestado se dibuja en una grilla de 24 y después se escala: a 16&nbsp;px eso es un
          dibujo de 24 al 67&nbsp;%, los trazos se caen de la grilla de píxeles y el juego que se
          veía nítido en el README se ve embarrado en el monitor de ₡90&nbsp;000 de la oficina del
          patio.
        </p>

        <div class="demo">
          <ul class="glyphs">
            {#each GLYPHS as g (g)}
              <li><Glyph name={g} size={20} /><span class="sx-id">{g}</span></li>
            {/each}
          </ul>
        </div>

        <p class="note">
          <b>La marca no es el mensaje.</b> Un glifo nunca declara un estado por sí solo —&nbsp;ese
          es el trabajo de Pill, y el argumento entero de Pill es tono + marca + palabra. Acá lo
          predeterminado es <span class="sx-id">aria-hidden</span>, porque el caso abrumadoramente
          común es un ícono al lado de un texto que ya lo dice. Pasá <span class="sx-id">label</span>
          sólo cuando el glifo de verdad sea lo único que está diciendo algo.
        </p>
      </section>

      <section class="closing">
        <h2>Lo que esta página todavía no muestra</h2>
        <ul>
          <li>Panel con <span class="sx-id">scroll</span>, que necesita una altura desde afuera —&nbsp;se ve funcionando dentro de Tablas.</li>
          <li>Card como <span class="sx-id">&lt;a href&gt;</span>. Está implementado y probado; acá haría que la página navegara a ninguna parte.</li>
          <li>Toolbar <span class="sx-id">sticky</span>, que sólo tiene sentido sobre contenido que hace scroll de verdad.</li>
        </ul>
      </section>
    </main>
  </div>
</div>

<style>
  .page { max-width: 1180px; margin: 0 auto; padding: var(--sx-s-12) var(--sx-s-5) var(--sx-s-20); }

  /* La ruta del archivo es un identificador, y un identificador no se grita:
     el registro de caption pone `text-transform: uppercase` y acá se apaga. */
  .lede :global(.sx-id) { text-transform: none; letter-spacing: 0; }

  .lede { max-width: 74ch; }
  h1 {
    margin: var(--sx-s-3) 0 0;
    font-size: var(--sx-t-3xl);
    font-weight: var(--sx-w-bold);
    letter-spacing: -.035em;
    line-height: 1.05;
  }
  .stand { margin: var(--sx-s-5) 0 0; font-size: var(--sx-t-lg); line-height: 1.5; color: var(--sx-ink-2); }

  /* THREE cells and `repeat(3, …)`, not `auto-fit`. The gap-as-divider trick —
     a 1px grid gap over a `--sx-line` background, each cell painting the
     surface back — is what StatStrip does and it is right, but it has one
     precondition: every cell in the grid must be filled. With `auto-fit` and
     three items the row wraps to 2 + 1 and the missing fourth cell shows
     through as a grey rectangle. Ask for exactly the columns you have. */
  .rules {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--sx-s-1);
    margin-top: var(--sx-s-8);
    background: var(--sx-line);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-1);
    overflow: hidden;
  }
  .rules > div { background: var(--sx-surface); padding: var(--sx-s-5); }
  /* GOTCHA QUE VALE ESCRIBIR: `.sx-cap` es una clase global de base.css con
     especificidad 0-1-0, y el selector de elemento `h2` de esta página, una vez
     que Svelte lo limita a su ámbito, es `h2.svelte-hash` — 0-1-1. El selector
     de tipo GANA, y el registro de caption se pierde en silencio. Cualquier
     página que estilice `h2` por elemento y use `.sx-cap` sobre uno tiene este
     bug. Se vuelve a declarar acá, explícito. */
  .rules h2 {
    margin: 0 0 var(--sx-s-2);
    font-size: var(--sx-t-2xs);
    font-weight: var(--sx-w-semi);
    letter-spacing: .07em;
    text-transform: uppercase;
    color: var(--sx-ink-3);
  }
  .rules p { margin: 0; font-size: var(--sx-t-sm); line-height: 1.6; color: var(--sx-ink-2); }

  .body { display: grid; grid-template-columns: 13rem minmax(0, 1fr); gap: var(--sx-s-10); margin-top: var(--sx-s-16); align-items: start; }

  .toc { position: sticky; top: calc(var(--sx-s-16) + var(--sx-s-2)); }
  .toc ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
  .toc a {
    display: block;
    padding: var(--sx-s-2) var(--sx-s-3);
    border-radius: var(--sx-r-1);
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-medium);
    color: var(--sx-ink-3);
    text-decoration: none;
  }
  .toc a:hover { background: var(--sx-sunk); color: var(--sx-ink); }

  main { display: flex; flex-direction: column; gap: var(--sx-s-16); min-width: 0; }
  section { min-width: 0; scroll-margin-top: var(--sx-s-16); }
  h2 { margin: 0; font-size: var(--sx-t-xl); font-weight: var(--sx-w-bold); letter-spacing: -.025em; }
  .why { margin: var(--sx-s-3) 0 0; max-width: 68ch; font-size: var(--sx-t-md); line-height: 1.6; color: var(--sx-ink-2); }
  /* Un sub-título dentro de una sección — «tone» adentro de Card, por ejemplo —
     que separa dos demostraciones del mismo componente sin inventar un h2
     nuevo (eso movería el índice; esto no tiene por qué). */
  .sub { margin: var(--sx-s-8) 0 0; }
  .note {
    margin: var(--sx-s-5) 0 0;
    max-width: 72ch;
    padding: var(--sx-s-4);
    background: var(--sx-sunk);
    border-radius: var(--sx-r-2);
    font-size: var(--sx-t-sm);
    line-height: 1.6;
    color: var(--sx-ink-2);
  }
  .tiny { margin: var(--sx-s-3) 0 0; font-size: var(--sx-t-xs); line-height: 1.6; color: var(--sx-ink-3); max-width: 60ch; }

  .demo { margin-top: var(--sx-s-6); display: flex; flex-direction: column; gap: var(--sx-s-4); }
  .demo.two-up, .demo.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(20rem, 100%), 1fr)); gap: var(--sx-s-4); }

  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(15rem, 100%), 1fr)); gap: var(--sx-s-3); }
  .cl { margin: 0; display: flex; flex-direction: column; gap: var(--sx-s-1); font-size: var(--sx-t-sm); color: var(--sx-ink-2); }
  .cl b { color: var(--sx-ink); font-weight: var(--sx-w-semi); }

  .rows { list-style: none; margin: 0; padding: 0; }
  .rows li {
    display: flex;
    align-items: center;
    gap: var(--sx-s-3);
    padding: var(--sx-s-3) var(--sx-s-5);
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-2);
    box-shadow: inset 0 -1px 0 var(--sx-line);
  }
  .rows li :global(.pill) { margin-left: auto; }

  .mini { display: flex; flex-direction: column; gap: var(--sx-s-3); }
  .rail { display: flex; gap: var(--sx-s-6); align-items: flex-start; }
  .blk { display: block; width: var(--sx-s-12); height: var(--sx-s-2); border-radius: var(--sx-r-1); background: var(--sx-edge); }

  .facts { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: var(--sx-s-2) var(--sx-s-4); }
  .facts dt { color: var(--sx-ink-3); font-size: var(--sx-t-sm); }
  .facts dd { margin: 0; text-align: right; font-weight: var(--sx-w-medium); font-size: var(--sx-t-sm); }

  .glyphs {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(9rem, 100%), 1fr));
    gap: 1px;
    background: var(--sx-line);
    border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-1);
    overflow: hidden;
  }
  .glyphs li {
    display: flex;
    align-items: center;
    gap: var(--sx-s-3);
    padding: var(--sx-s-3) var(--sx-s-4);
    background: var(--sx-surface);
    font-size: var(--sx-t-xs);
    color: var(--sx-ink-3);
  }

  .closing { padding-top: var(--sx-s-8); box-shadow: inset 0 1px 0 var(--sx-line); }
  .closing ul { margin: var(--sx-s-4) 0 0; padding-left: var(--sx-s-5); max-width: 70ch; }
  .closing li { font-size: var(--sx-t-sm); line-height: 1.7; color: var(--sx-ink-2); }

  @media (max-width: 1000px) {
    .rules { grid-template-columns: 1fr; }
  }

  @media (max-width: 900px) {
    .body { grid-template-columns: 1fr; gap: var(--sx-s-6); }
    .toc { position: static; }
    .toc ul { flex-direction: row; flex-wrap: wrap; gap: var(--sx-s-1); }
  }

  @media (max-width: 720px) {
    .page { padding: var(--sx-s-8) var(--sx-s-4) var(--sx-s-16); }
    h1 { font-size: var(--sx-t-2xl); }
    .stand { font-size: var(--sx-t-md); }
    .rail { flex-wrap: wrap; gap: var(--sx-s-4); }
  }
</style>
