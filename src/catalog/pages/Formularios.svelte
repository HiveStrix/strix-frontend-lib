<script>
  // FORMULARIOS — the catalogue page for the INPUT family.
  //
  // It is written to be read at 11pm by somebody who has to ship a form
  // tomorrow. So every component appears in the states that actually break —
  // disabled, loading, error, empty, inherited — and every section says when NOT
  // to use the thing, because a catalogue that only shows the happy path is what
  // makes a design system rot into thirteen bespoke inputs.
  //
  // Two things here are built inline on purpose, and are NOT library components:
  // the code block with its copy button, and the plain buttons in the demos.
  // Buttons belong to another family; borrowing one across families would make
  // this page fail the day that family lands. `Pill` IS the library's, imported
  // as the signature component it is.
  import { onDestroy } from 'svelte';
  import Pill from '../../lib/Pill.svelte';
  import {
    Field, Input, NumberInput, Textarea, Select, Combobox,
    Checkbox, Radio, Switch, DateInput, FileDrop, ChoiceCards, today,
    Calendar, DateRange
  } from '../../lib/form/index.js';

  // ── El índice ─────────────────────────────────────────────────────────────
  const TOC = [
    { id: 'field', label: 'Field' },
    { id: 'estados', label: 'Los estados' },
    { id: 'validacion', label: 'La validación' },
    { id: 'heredado', label: 'El valor heredado' },
    { id: 'input', label: 'Input' },
    { id: 'number', label: 'NumberInput' },
    { id: 'textarea', label: 'Textarea' },
    { id: 'select', label: 'Select' },
    { id: 'combobox', label: 'Combobox' },
    { id: 'date', label: 'DateInput' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'daterange', label: 'DateRange' },
    { id: 'checkbox', label: 'Checkbox' },
    { id: 'radio', label: 'Radio' },
    { id: 'switch', label: 'Switch' },
    { id: 'choicecards', label: 'ChoiceCards' },
    { id: 'filedrop', label: 'FileDrop' },
    { id: 'formulario', label: 'Un formulario entero' },
    { id: 'reglas', label: 'Las reglas' }
  ];

  // ── Copiar ────────────────────────────────────────────────────────────────
  let copied = '';
  let failed = '';
  let timer;
  async function copy(text, key) {
    clearTimeout(timer);
    try {
      await navigator.clipboard.writeText(text);
      copied = key;
      failed = '';
    } catch {
      copied = '';
      failed = key;
    }
    timer = setTimeout(() => { copied = ''; failed = ''; }, 2400);
  }
  onDestroy(() => clearTimeout(timer));

  // ── Datos de demostración ─────────────────────────────────────────────────
  // Todo sale de los dos libros reales: 22 batidoras y 2 HINO.
  const FAMILIAS = [
    { value: 'bat-e', label: 'Batidora eléctrica' },
    { value: 'bat-g', label: 'Batidora de gasolina' },
    { value: 'camion', label: 'Camión de carga' },
    { value: 'compact', label: 'Compactadora' }
  ];

  const EQUIPOS = [
    { value: 'BAT001', label: 'BAT001 · Batidora eléctrica 1 saco', hint: 'Bodega Opra · activa', meta: '180 d' },
    { value: 'BAT014', label: 'BAT014 · Batidora de gasolina 2 sacos', hint: 'Guanacaste · activa', meta: '46 d' },
    { value: 'BAT019', label: 'BAT019 · Batidora eléctrica 1 saco', hint: 'Heredia · activa', meta: 'vencida' },
    { value: 'BAT022', label: 'BAT022 · Batidora de gasolina 1 saco', hint: 'Bodega Opra · en reparación', meta: '—' },
    { value: 'CL445926', label: 'CL445926 · HINO 500 GH', hint: 'Heredia · activa', meta: '12 400 km' },
    { value: 'CL336793', label: 'CL336793 · HINO 300', hint: 'Alajuela · activa', meta: '8 910 km' }
  ];

  const REPUESTOS = [
    { value: 'REP-0031', label: 'Retén de cilindro 45 mm', hint: 'Existencia 4', meta: '₡18 500' },
    { value: 'REP-0044', label: 'Faja de transmisión A-42', hint: 'Existencia 0', meta: '₡9 200' },
    { value: 'REP-0102', label: 'Filtro de aceite HINO 500', hint: 'Existencia 11', meta: '₡14 750' },
    { value: 'REP-0110', label: 'Empaque de tapa de balde', hint: 'Existencia 2', meta: '₡3 100' }
  ];

  const FALLAS = [
    { value: 'FCM-01', label: 'FCM-01 · Desgaste normal', group: 'Mecánica' },
    { value: 'FCM-02', label: 'FCM-02 · Falta de lubricación', group: 'Mecánica' },
    { value: 'FCM-03', label: 'FCM-03 · Sobrecarga', group: 'Mecánica' },
    { value: 'FCM-05', label: 'FCM-05 · Falla eléctrica', group: 'Eléctrica' },
    { value: 'FCM-06', label: 'FCM-06 · Falso contacto', group: 'Eléctrica' },
    { value: 'FCM-07', label: 'FCM-07 · Error de operación', group: 'Operación' }
  ];

  const UBICACIONES = [
    { value: 'opra', label: 'Bodega Opra', hint: 'Heredia centro' },
    { value: 'heredia', label: 'Proyecto Heredia norte', hint: 'Construcción' },
    { value: 'guana', label: 'Proyecto Guanacaste', hint: 'Construcción' },
    { value: 'alajuela', label: 'Taller Alajuela', hint: 'Servicio externo' }
  ];

  // `today()` y no `toISOString().slice(0, 10)`: eso último es el día UTC, y en
  // Costa Rica de las 6 de la tarde en adelante devuelve mañana — un `max` así
  // deja registrar un servicio para un día que todavía no llegó.
  const hoy = today();

  // ── Input: verificación contra el servidor ────────────────────────────────
  const OCUPADOS = { BAT001: 'Batidora eléctrica 1 saco', BAT014: 'Batidora de gasolina 2 sacos', CL445926: 'HINO 500 GH' };
  let codigo = '';
  let checking = false;
  let checkTimer;
  let ocupadoPor = '';
  // `e.target.value` y nunca `e.detail`: Input reenvía el evento del DOM tal
  // cual, y el `detail` de un InputEvent es 0, no la carga útil. Leerlo así
  // hacía que la verificación nunca encontrara nada.
  function checkCode(e) {
    const v = String(e?.target?.value ?? codigo).trim().toUpperCase();
    ocupadoPor = '';
    clearTimeout(checkTimer);
    if (!v) { checking = false; return; }
    checking = true;
    checkTimer = setTimeout(() => {
      checking = false;
      ocupadoPor = OCUPADOS[v] ?? '';
    }, 700);
  }
  onDestroy(() => clearTimeout(checkTimer));
  // `$:` y no `const`: una sentencia reactiva legacy solo rastrea los nombres
  // escritos adentro, así que un ayudante que cierre sobre `ocupadoPor` sería
  // invisible para quien lo llame. Es la trampa que este sistema documenta.
  $: codeError = ocupadoPor ? `Ese código ya lo tiene la ${ocupadoPor}.` : '';
  $: codeFix = ocupadoPor ? 'Cada máquina lleva el código que está pintado en ella. Si son dos máquinas distintas, una está mal rotulada.' : '';

  // ── El resto de las demos ────────────────────────────────────────────────
  let busqueda = 'batidora';
  let km = '12400';
  let costo = '1250000';
  let cantidad = '2';
  let nota = 'Se cambió el retén del cilindro y se purgó el sistema. La manguera de retorno está reseca';
  let familia = '';
  let falla = 'FCM-03';
  let equipo = '';
  let repuesto = '';
  let fecha = hoy;
  let fechaMala = '2027-03-14';
  // ── Calendar / DateRange ──────────────────────────────────────────────────
  // Los estados feos que pide el pliego: sin elegir todavía, con días
  // deshabilitados, un mes que empieza en domingo y uno que termina en lunes.
  // Los dos últimos necesitan un mes puntual — `viewDate` lo abre sin elegir
  // nada — en vez de depender de qué mes sea «hoy» cuando alguien mire esto.
  let calVacio = '';
  // Antes de «hoy» a propósito: esta demo pone `max={hoy}`, así que un elegido
  // posterior a hoy sería un día a la vez elegido Y deshabilitado — un estado
  // confuso para liderar la demostración, no uno que la aclare.
  let calElegido = '2026-08-03';
  let rangoDesde = '2026-08-20';
  let rangoHasta = '2026-08-05'; // a propósito antes que «desde»: el estado roto.
  let cobrable = true;
  let todas = false;
  let medida = 'ambos';
  let auto = true;
  let ia = false;
  let iaBusy = false;
  let iaTimer;
  function toggleIa() {
    iaBusy = true;
    clearTimeout(iaTimer);
    iaTimer = setTimeout(() => { iaBusy = false; ia = !ia; }, 1100);
  }
  onDestroy(() => clearTimeout(iaTimer));
  let modo = 'alquiler';
  let archivos = [];

  // ── El valor heredado ────────────────────────────────────────────────────
  const HEREDADO = '180';
  let periodo = HEREDADO;
  // Derivado, no manejado a mano: así el estado «cambiado» también es correcto
  // cuando el valor se mueve con los botones de paso o con el teclado, que no
  // pasan por ningún `on:input` del que uno se acuerde.
  $: periodoTocado = periodo !== HEREDADO;
  const volverAlPlan = () => (periodo = HEREDADO);

  // ── El formulario entero ─────────────────────────────────────────────────
  let f = { codigo: '', nombre: '', familia: '', ubicacion: '', medidor: 'horas', intervalo: '180', ingreso: hoy, notas: '' };
  $: intervaloTocado = f.intervalo !== '180';
  let enviado = false;
  let guardando = false;
  let guardado = false;
  let guardaTimer;

  $: errores = (() => {
    const e = {};
    if (!f.codigo.trim()) e.codigo = { p: 'Falta el código.', f: 'Es el que está pintado en la máquina: BAT023, CL445927.' };
    else if (OCUPADOS[f.codigo.trim().toUpperCase()])
      e.codigo = { p: `Ese código ya lo tiene la ${OCUPADOS[f.codigo.trim().toUpperCase()]}.`, f: 'Probá con el siguiente libre de la serie.' };
    if (!f.nombre.trim()) e.nombre = { p: 'Falta el nombre.', f: 'Como lo llaman en la bodega: «Batidora eléctrica 1 saco».' };
    if (!f.familia) e.familia = { p: 'Falta la familia.', f: 'Decide qué actividades le aplican y qué plan hereda. Sin ella el equipo no entra en la línea de tiempo.' };
    if (!f.intervalo || Number(f.intervalo) <= 0)
      e.intervalo = { p: 'El intervalo tiene que ser mayor que cero.', f: 'Un plan cada 0 días vence el día que se crea.' };
    return e;
  })();

  $: hayErrores = Object.keys(errores).length > 0;

  function guardar() {
    enviado = true;
    if (hayErrores) return;
    guardando = true;
    clearTimeout(guardaTimer);
    guardaTimer = setTimeout(() => { guardando = false; guardado = true; }, 900);
  }
  onDestroy(() => clearTimeout(guardaTimer));

  function limpiarFormulario() {
    f = { codigo: '', nombre: '', familia: '', ubicacion: '', medidor: 'horas', intervalo: '180', ingreso: hoy, notas: '' };
    enviado = false;
    guardado = false;
  }

  // ── Los bloques de código ────────────────────────────────────────────────
  const C = {
    field: `<Field
  label="Horas de paro"
  hint="Desde que se detuvo hasta que volvió a producir."
  error={malo ? 'El paro no puede ser negativo.' : ''}
  fix="Si la máquina nunca se detuvo, dejalo en cero."
  let:id let:describedBy let:invalid
>
  <input {id} aria-describedby={describedBy} aria-invalid={invalid} />
</Field>`,

    grupo: `<Field group label="¿Qué se le cambió?" let:labelId let:describedBy>
  <div role="group" aria-labelledby={labelId} aria-describedby={describedBy}>
    <Checkbox bind:checked={aceite} label="Aceite de motor" />
    <Checkbox bind:checked={filtro} label="Filtro de aceite" />
  </div>
</Field>`,

    validacion: `<!-- El problema y la salida, siempre juntos. -->
<Input
  label="Código"
  bind:value={codigo}
  mono required
  loading={verificando}
  loadingLabel="Verificando…"
  error={ocupado ? 'Ese código ya lo tiene la ' + ocupado + '.' : ''}
  fix="Cada máquina lleva el código que está pintado en ella."
/>`,

    heredado: `<!-- De dónde salió el valor, y cómo volver. -->
<NumberInput
  label="Cada cuántos días"
  bind:value={periodo}
  unit="días"
  origin={'la plantilla «Batidoras eléctricas»'}
  originValue="180 días"
  changed={tocado}
  on:revert={volverAlPlan}
/>`,

    input: `<Input label="Código" bind:value={codigo} mono required
       hint="Como está pintado en la máquina." />

<Input label="Buscar" type="search" bind:value={q} clearable
       placeholder="Código, placa o folio…" />`,

    number: `<NumberInput label="Lectura del odómetro" bind:value={km}
             unit="km" stepper step={100} min="0" />

<!-- Money is NUMERIC on the wire: value is always a string. -->
<NumberInput label="Costo de repuestos" bind:value={costo} currency />`,

    textarea: `<Textarea label="Qué se hizo" bind:value={nota} limit={280} rows={4}
          hint="Lo que otro técnico necesitaría saber dentro de seis meses." />`,

    select: `<Select label="Familia" bind:value={familia} options={FAMILIAS}
        placeholder="Elegí una familia"
        hint="Decide qué actividades y qué plantillas le aplican." />`,

    combobox: `<Combobox label="Equipo" bind:value={equipo} options={EQUIPOS}
          noun="equipo" nounPlural="equipos"
          placeholder="Código o nombre…" />`,

    date: `<DateInput label="Fecha del servicio" bind:value={fecha} relative
           max={hoy} />`,

    calendar: `<Calendar bind:value={fecha} label="Fecha del servicio" max={hoy} />`,

    daterange: `<!-- La de fin no puede ser anterior a la de inicio, y si pasa,
     el sistema lo dice en el campo — no adivina. -->
<DateRange bind:start={desde} bind:end={hasta}
           startLabel="Desde" endLabel="Hasta" />`,

    checkbox: `<Checkbox bind:checked={cobrable} label="Cobrable al cliente"
          hint="Entra en la factura de la orden con el 13 % de IVA." />`,

    radio: `<Field group label="¿Cómo se mide el intervalo?" let:labelId let:describedBy>
  <div role="radiogroup" aria-labelledby={labelId} aria-describedby={describedBy}>
    <Radio bind:group={medida} value="cal"   name="medida" label="Por calendario" />
    <Radio bind:group={medida} value="uso"   name="medida" label="Por uso" />
    <Radio bind:group={medida} value="ambos" name="medida" label="Lo que ocurra primero"
           hint="Es lo normal en flota." />
  </div>
</Field>`,

    switche: `<Switch bind:checked={auto}
        label="Leer los documentos automáticamente"
        hint="Cada salida y devolución que entre se procesa sola." />`,

    cards: `<ChoiceCards label="¿Cómo se le da seguimiento?" bind:value={modo}
  hint="Decide de dónde sale el reloj de mantenimiento de esta familia."
  options={[
    { value: 'mano',     title: 'Lectura a mano',        detail: 'Alguien anota el horómetro cuando pasa por la máquina.' },
    { value: 'alquiler', title: 'Mientras está afuera',  detail: 'La salida y la devolución son el uso.', badge: 'Recomendado' },
    { value: 'ciclo',    title: 'Ciclo declarado',       detail: 'Se asume una jornada fija por día trabajado.' },
    { value: 'iot',      title: 'Dispositivo',           detail: 'Fase 2. Todavía no disponible.', disabled: true }
  ]} />`,

    filedrop: `<FileDrop label="Documentos de despacho" bind:files
          accept="application/pdf,.pdf"
          maxSize={10 * 1024 * 1024}
          note="Salidas y devoluciones en PDF, hasta 10 MB cada uno."
          on:reject={avisar} />`
  };
</script>

<div class="page">
  <header class="lede">
    <p class="sx-cap kicker">Familia · Entrada</p>
    <h1>Formularios</h1>
    <p class="stand">
      Todo lo que una persona contesta. Catorce componentes, casi todos con un solo envoltorio compartido, para que
      un formulario de nueve campos se lea como un formulario y no como nueve decisiones distintas
      tomadas en nueve martes distintos.
    </p>
    <div class="rules">
      <div>
        <h2 class="sx-cap">El envoltorio manda</h2>
        <p>Field pone el id, dibuja la caja, cablea el <span class="sx-id">aria</span> y escribe el mensaje.
           Los controles solo aportan su elemento. Por eso alinean sin que nadie los alinee y por eso
           arreglar el anillo de foco es una edición, no trece.</p>
      </div>
      <div>
        <h2 class="sx-cap">Un error dice cómo salir</h2>
        <p>Dos props, no una: <span class="sx-id">error</span> nombra el problema y
           <span class="sx-id">fix</span> nombra la salida. Una sola prop es cómo se llega a
           «Fecha inválida», que no ayuda a nadie a las 6 de la mañana en un patio.</p>
      </div>
      <div>
        <h2 class="sx-cap">El color nunca viaja solo</h2>
        <p>Todo estado trae palabra y forma: el asterisco del obligatorio, el cuadrado del error,
           el triángulo del aviso, el visto del elegido. Quien no separe rojo de ámbar no pierde nada.</p>
      </div>
      <div>
        <h2 class="sx-cap">Las cifras se comparan</h2>
        <p><span class="sx-id">tabular-nums</span> en todo lo que es número — lecturas, colones,
           contadores — y en nada que sea prosa, donde se lee como un tartamudeo.</p>
      </div>
    </div>
    <p class="note">
      Probá el tema oscuro con el interruptor del catálogo: cada estado de esta página está resuelto
      en los dos. Y angostá la ventana hasta 390 px — un módulo de Strix se dibuja al lado de una
      barra lateral de 240 px, así que la columna útil es siempre más angosta que la ventana.
    </p>
  </header>

  <div class="body">
    <nav class="toc" aria-label="Índice de la página">
      <ul>
        {#each TOC as t (t.id)}
          <li><a href={`#${t.id}`}>{t.label}</a></li>
        {/each}
      </ul>
    </nav>

    <main>
      <!-- ═══ FIELD ═══════════════════════════════════════════════════════ -->
      <section id="field">
        <h2>Field</h2>
        <p class="why">
          El envoltorio con el que se compone todo lo demás. No es un detalle de implementación: es
          el componente que decide si un formulario se puede llenar. Pone el id y lo reparte, dibuja
          la caja y su anillo, arma el <span class="sx-id">aria-describedby</span> —para que nadie
          río abajo lo escriba a mano y lo escriba mal— y es el único lugar donde se dice de dónde
          vino un valor que la persona no escribió.
        </p>

        <div class="two">
          <div class="when yes">
            <h3 class="sx-cap">Usalo</h3>
            <ul>
              <li>Para cualquier control propio que no esté en esta familia: un selector de color, un mapa, un editor de firmas.</li>
              <li>Para agrupar casillas o radios: <span class="sx-id">group</span> convierte la etiqueta en un nombre al que apuntar con <span class="sx-id">aria-labelledby</span>.</li>
              <li>Cuando necesités la caja sin sus adentros: <span class="sx-id">frame</span> la enciende y la apaga.</li>
            </ul>
          </div>
          <div class="when no">
            <h3 class="sx-cap">No lo usés</h3>
            <ul>
              <li>Alrededor de un Checkbox, un Radio o un Switch: esos traen su etiqueta al lado y el Field la nombraría dos veces.</li>
              <li>Para poner una leyenda encima de un bloque que no contesta nada. Eso es un encabezado, no un campo.</li>
              <li>Envolviendo un Input: el Input ya es un Field. Pasale las props y ya.</li>
            </ul>
          </div>
        </div>

        <div class="demo">
          <div class="anatomy">
            <Field
              label="Horas de paro"
              required
              hint="Desde que la máquina se detuvo hasta que volvió a producir."
              error="El paro no puede ser negativo."
              fix="Si la máquina nunca se detuvo, dejalo en cero."
              origin={'la orden OT-0042'}
              originValue="3,5 h"
              changed
              let:id
              let:describedBy
              let:invalid
            >
              <input {id} value="-2" aria-describedby={describedBy} aria-invalid={invalid} />
              <span class="raw-affix">h</span>
            </Field>
            <ol class="parts sx-num">
              <li><b>La etiqueta</b> en el registro de rótulo, un tono más oscura que un pie de figura: se lee mientras se decide qué escribir.</li>
              <li><b>El asterisco</b> marca la minoría. Si casi todo es obligatorio, marcá <span class="sx-id">optional</span> en vez.</li>
              <li><b>La pista</b> va antes de la caja, porque se lee antes de llenarla.</li>
              <li><b>La caja</b> es la única forma con borde de la familia: un contorno de control es lo que dice «escribí aquí», y la elevación sola no puede decirlo.</li>
              <li><b>El mensaje</b> vive en una región viva que ya existía antes de tener texto. Una región que aparece junto con su mensaje es una región que nadie oye.</li>
              <li><b>La procedencia</b> dice de dónde salió el valor y ofrece el camino de vuelta, nombrando a qué se vuelve.</li>
            </ol>
          </div>
        </div>

        <div class="code">
          <pre><code>{C.field}</code></pre>
          <button class="copy" on:click={() => copy(C.field, 'field')}>
            {copied === 'field' ? 'Copiado' : failed === 'field' ? 'No se pudo — usá Ctrl+C' : 'Copiar'}
          </button>
        </div>

        <p class="aside">
          Para un grupo, <span class="sx-id">group</span> deja de emitir <span class="sx-id">for</span> y
          entrega <span class="sx-id">labelId</span>: un radiogroup se nombra por
          <span class="sx-id">aria-labelledby</span>, nunca por <span class="sx-id">for</span>, porque no
          hay un solo control al que apuntar.
        </p>

        <div class="code">
          <pre><code>{C.grupo}</code></pre>
          <button class="copy" on:click={() => copy(C.grupo, 'grupo')}>
            {copied === 'grupo' ? 'Copiado' : failed === 'grupo' ? 'No se pudo — usá Ctrl+C' : 'Copiar'}
          </button>
        </div>
      </section>

      <!-- ═══ ESTADOS ═════════════════════════════════════════════════════ -->
      <section id="estados">
        <h2>Los estados</h2>
        <p class="why">
          Los seis en los que un campo pasa la mayor parte de su vida. Un catálogo que solo enseña el
          primero es la razón por la que después cada pantalla inventa el suyo.
        </p>

        <div class="demo grid3">
          <Input label="Normal" value="BAT001" mono hint="Nada que reportar." />
          <Input label="Con foco" value="BAT0" mono hint="Hacé clic acá para ver el anillo." placeholder="BAT023" />
          <Input label="Desactivado" value="BAT001" mono disabled hint="Un código no se cambia después de creado." />
          <Input label="Solo lectura" value="CL445926" mono readonly hint="Viene de la placa; se corrige en el registro." />
          <Input label="Verificando" value="BAT014" mono loading loadingLabel="Verificando…" hint="Hay una pregunta en vuelo." />
          <Input
            label="Con error"
            value="BAT001"
            mono
            error="Ese código ya lo tiene la Batidora eléctrica 1 saco."
            fix="Probá con el siguiente número libre de la serie: BAT023."
          />
          <Input label="Vacío" value="" mono placeholder="BAT023" hint="El marcador de posición muestra la forma, no la instrucción." />
          <Input
            label="Con aviso"
            value="99999"
            mono
            warning="Ese salto es grande para esta máquina."
            fix="Se puede registrar igual; queda anotado para revisión."
          />
          <Input label="Opcional" value="" optional placeholder="Ninguno" hint="Marcá la minoría: si casi todo es obligatorio, marcá lo opcional." />
        </div>

        <p class="aside">
          El deshabilitado y el de solo lectura no son lo mismo y la diferencia importa: lo
          deshabilitado no se puede leer con el teclado ni se envía con el formulario; lo de solo
          lectura se puede seleccionar, copiar y enviar. Un código de máquina que no se puede
          cambiar pero sí copiar es <span class="sx-id">readonly</span>, no
          <span class="sx-id">disabled</span>.
        </p>
      </section>

      <!-- ═══ VALIDACIÓN ══════════════════════════════════════════════════ -->
      <section id="validacion">
        <h2>La validación</h2>
        <p class="why">
          Un error nombra el problema <b>y</b> la salida. Por eso son dos props y no una: con una
          sola, lo que se termina escribiendo es «Fecha inválida», y eso no es ayuda, es una
          constatación. Escribí <span class="sx-id">BAT001</span>, <span class="sx-id">BAT014</span>
          o <span class="sx-id">CL445926</span> en el campo de abajo para verlo trabajar de verdad:
          hay una verificación simulada de 700 ms contra el servidor.
        </p>

        <div class="demo">
          <div class="col-narrow">
            <Input
              label="Código del equipo"
              bind:value={codigo}
              mono
              required
              placeholder="BAT023"
              loading={checking}
              loadingLabel="Verificando…"
              hint="Como está pintado en la máquina."
              error={codeError}
              fix={codeFix}
              on:input={checkCode}
            />
            <p class="hintline">
              {#if checking}
                <Pill tone="neutral" size="sm">Consultando</Pill> el catálogo del inquilino.
              {:else if ocupadoPor}
                <Pill tone="critical" size="sm">Ocupado</Pill> el código está tomado.
              {:else if codigo}
                <Pill tone="positive" size="sm">Libre</Pill> se puede usar.
              {:else}
                <Pill tone="neutral" size="sm">Vacío</Pill> escribí un código para ver el ciclo completo.
              {/if}
            </p>
          </div>
        </div>

        <div class="two">
          <div class="when yes">
            <h3 class="sx-cap">Escribilo así</h3>
            <ul>
              <li>«Ese código ya lo tiene la Batidora eléctrica 1 saco.» → nombra qué pasó y a quién.</li>
              <li>«Probá con el siguiente número libre: BAT023.» → nombra qué hacer, con el dato en la mano.</li>
              <li>Un aviso (<span class="sx-id">warning</span>) es para lo que no frena: «ese salto es grande para esta máquina, se registra igual».</li>
            </ul>
          </div>
          <div class="when no">
            <h3 class="sx-cap">Nunca así</h3>
            <ul>
              <li>«Campo inválido», «Error», «Formato incorrecto». No dicen qué ni cómo.</li>
              <li>Un error rojo mientras la persona todavía está escribiendo la primera letra. Validá al salir del campo o al enviar, no en la tercera tecla.</li>
              <li>Un error que solo existe en color. El cuadrado y la palabra son lo que se lee en una fotocopia.</li>
            </ul>
          </div>
        </div>

        <div class="code">
          <pre><code>{C.validacion}</code></pre>
          <button class="copy" on:click={() => copy(C.validacion, 'validacion')}>
            {copied === 'validacion' ? 'Copiado' : failed === 'validacion' ? 'No se pudo — usá Ctrl+C' : 'Copiar'}
          </button>
        </div>
      </section>

      <!-- ═══ HEREDADO ════════════════════════════════════════════════════ -->
      <section id="heredado">
        <h2>El valor heredado</h2>
        <p class="why">
          El patrón que Strix vuelve a descubrir en cada módulo: un campo cuyo valor llegó de otro
          lado —una plantilla, una familia, el último documento, los ajustes del inquilino— y que
          tiene que decir de dónde. No es una pista y no es un error. Es la respuesta a «¿por qué
          dice 180 si yo no escribí eso?» y a «¿qué pierdo si lo cambio?». Cambiá el número y mirá
          cómo la línea de abajo cambia de palabra, de glifo y de tono, y ofrece el camino de vuelta
          <b>nombrando a qué vuelve</b>.
        </p>

        <div class="demo">
          <div class="col-narrow">
            <NumberInput
              label="Cada cuántos días"
              bind:value={periodo}
              unit="días"
              stepper
              step={30}
              min="1"
              hint="Cada cuánto vence el plan de esta máquina por calendario."
              origin={'la plantilla «Batidoras eléctricas»'}
              originValue="180 días"
              changed={periodoTocado}
              on:revert={volverAlPlan}
            />
          </div>
        </div>

        <div class="two">
          <div class="when yes">
            <h3 class="sx-cap">Usalo</h3>
            <ul>
              <li>Cuando el valor por defecto viene de un objeto que la persona puede ir a ver: una familia, una plantilla, un contrato.</li>
              <li>Cuando apartarse del origen es una decisión que alguien va a tener que explicar seis meses después.</li>
              <li>Cuando volver al valor de origen tiene que ser un botón y no un acto de memoria.</li>
            </ul>
          </div>
          <div class="when no">
            <h3 class="sx-cap">No lo usés</h3>
            <ul>
              <li>Para un valor inicial cualquiera —la fecha de hoy en un campo de fecha— que nadie heredó de nada.</li>
              <li>Para explicar qué es el campo. Eso es <span class="sx-id">hint</span>.</li>
              <li>Para un valor que el sistema calcula y la persona no puede cambiar. Eso no es un campo, es un dato: mostralo como texto.</li>
            </ul>
          </div>
        </div>

        <div class="code">
          <pre><code>{C.heredado}</code></pre>
          <button class="copy" on:click={() => copy(C.heredado, 'heredado')}>
            {copied === 'heredado' ? 'Copiado' : failed === 'heredado' ? 'No se pudo — usá Ctrl+C' : 'Copiar'}
          </button>
        </div>
      </section>

      <!-- ═══ INPUT ═══════════════════════════════════════════════════════ -->
      <section id="input">
        <h2>Input</h2>
        <p class="why">
          Una línea de texto. Lo más simple de la familia y lo que más peso carga: un patio escribe
          códigos, placas, folios y nombres aquí todo el día. Lo único que agrega sobre un
          <span class="sx-id">&lt;input&gt;</span> pelado es el registro de identificador
          (<span class="sx-id">mono</span>), un estado de verificación, y no inventar cromo propio.
        </p>

        <div class="two">
          <div class="when yes">
            <h3 class="sx-cap">Usalo</h3>
            <ul>
              <li>Texto libre corto: nombre, responsable, número de factura del proveedor.</li>
              <li>Identificadores, con <span class="sx-id">mono</span>: BAT001, CL445926, la cédula jurídica. Se leen carácter por carácter y el cero deja de ser una O.</li>
              <li>Una búsqueda, con <span class="sx-id">type="search"</span> y <span class="sx-id">clearable</span>.</li>
            </ul>
          </div>
          <div class="when no">
            <h3 class="sx-cap">No lo usés</h3>
            <ul>
              <li>Para una cifra: NumberInput sabe de unidades, de colones y de agrupación.</li>
              <li>Para una fecha: DateInput da el selector de la plataforma, que es el único que funciona con un pulgar.</li>
              <li>Para algo que ya es una lista: Select bajo una docena, Combobox por encima. Un campo libre donde va una lista es cómo una flota termina con «Heredia», «heredia» y «HEREDIA».</li>
            </ul>
          </div>
        </div>

        <div class="demo grid2">
          <Input label="Nombre del equipo" value="Batidora eléctrica 1 saco" hint="Como lo llaman en la bodega." />
          <Input label="Código" value="CL445926" mono hint="Registro de identificador: mono, cifras tabulares, cero rebanado." />
          <Input
            label="Buscar"
            type="search"
            bind:value={busqueda}
            clearable
            placeholder="Código, placa o folio…"
            hint="Con botón de limpiar, porque una búsqueda se borra mil veces al día."
          >
            <svg slot="lead" class="lead-ico" viewBox="0 0 14 14" aria-hidden="true"><circle cx="6" cy="6" r="4.2" fill="none" stroke="currentColor" stroke-width="1.7" /><path d="M9.2 9.2 12.4 12.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" /></svg>
          </Input>
          <Input label="Responsable" value="Jose Leobardo Gonzalez" optional hint="Prosa: nunca mono, nunca cifras tabulares." />
        </div>

        <div class="code">
          <pre><code>{C.input}</code></pre>
          <button class="copy" on:click={() => copy(C.input, 'input')}>
            {copied === 'input' ? 'Copiado' : failed === 'input' ? 'No se pudo — usá Ctrl+C' : 'Copiar'}
          </button>
        </div>
      </section>

      <!-- ═══ NUMBERINPUT ═════════════════════════════════════════════════ -->
      <section id="number">
        <h2>NumberInput</h2>
        <p class="why">
          Una cifra, y de qué es la cifra. En software de operación un número nunca va desnudo: es
          12 400 <b>kilómetros</b>, o 180 <b>días</b>, o <b>₡</b>1 250 000. «Cambiar cada 250» es la
          frase con la que una máquina entra al taller ocho meses tarde.
        </p>
        <p class="why">
          Tres cuidados que ya costaron caro en algún lado: el dinero es una <b>cadena</b>
          canónica —«1250000.5»— porque del otro lado es <span class="sx-id">NUMERIC</span> y un
          flotante es un error de redondeo esperando una factura; la caja <b>reagrupa al salir</b>,
          nunca mientras se escribe, porque reagrupar bajo el cursor lo salta; y los separadores se
          <b>leen del formateador es-CR</b> de la plataforma, que agrupa con un espacio fino que
          nadie puede teclear.
        </p>

        <div class="two">
          <div class="when yes">
            <h3 class="sx-cap">Usalo</h3>
            <ul>
              <li>Lecturas de contador, intervalos, cantidades, horas de paro.</li>
              <li>Colones, con <span class="sx-id">currency</span>: signo adelante, dos decimales, agrupación tica.</li>
              <li>Cantidades pequeñas en tablet, con <span class="sx-id">stepper</span>: dos mitades de un objetivo de 44 px, y el teclado sigue teniendo ↑ ↓.</li>
            </ul>
          </div>
          <div class="when no">
            <h3 class="sx-cap">No lo usés</h3>
            <ul>
              <li>Para un folio, una cédula, una placa o un teléfono. Son identificadores que resultan ser dígitos: nunca se suman, conservan los ceros a la izquierda, y van en <span class="sx-id">Input mono</span>.</li>
              <li>Para un porcentaje que en realidad son tres opciones (0 %, 13 %, exento). Eso es un Select.</li>
              <li>Para un año. Un campo numérico con flechas invita a subir de 2026 a 2027 sin querer.</li>
            </ul>
          </div>
        </div>

        <div class="demo grid2">
          <NumberInput label="Lectura del odómetro" bind:value={km} unit="km" stepper step={100} min="0" hint="La que marca ahora mismo, no la del último servicio." />
          <NumberInput label="Costo de repuestos" bind:value={costo} currency hint="Sale de la caja formateado. Al entrar, se vuelve editable." />
          <NumberInput label="Cantidad" bind:value={cantidad} unit="un" stepper step={1} min="0" max="99" align="right" hint="Alineado a la derecha: va en una columna con otras cifras." />
          <NumberInput label="Horas de paro" value="0" unit="h" disabled hint="Desactivado: la orden todavía no se cerró." />
          <NumberInput
            label="Lectura nueva"
            value="99999"
            unit="h"
            warning="Ese salto no cuadra con la historia de esta máquina."
            fix="Se puede registrar igual y queda como pendiente para revisión."
          />
          <NumberInput
            label="Intervalo"
            value="0"
            unit="días"
            error="El intervalo tiene que ser mayor que cero."
            fix="Un plan cada 0 días vence el mismo día en que se crea."
          />
        </div>

        <div class="code">
          <pre><code>{C.number}</code></pre>
          <button class="copy" on:click={() => copy(C.number, 'number')}>
            {copied === 'number' ? 'Copiado' : failed === 'number' ? 'No se pudo — usá Ctrl+C' : 'Copiar'}
          </button>
        </div>
      </section>

      <!-- ═══ TEXTAREA ════════════════════════════════════════════════════ -->
      <section id="textarea">
        <h2>Textarea</h2>
        <p class="why">
          La nota que un técnico escribe con una mano. Es el único registro de por qué una máquina
          costó lo que costó, así que la caja es generosa y se quita del medio. El contador
          <b>aparece solo cuando empieza a importar</b> —en el último tramo, no desde el carácter
          cero— y el límite es <b>blando</b> por defecto: un <span class="sx-id">maxlength</span> de
          verdad se come la cola de un pegado en silencio, y alguien pega el informe entero, lo ve
          entrar, y solo quedaron los primeros 500 caracteres.
        </p>

        <div class="two">
          <div class="when yes">
            <h3 class="sx-cap">Usalo</h3>
            <ul>
              <li>Qué se hizo, qué se observó, por qué se descarta un pendiente.</li>
              <li>Cuando la respuesta correcta puede ser un párrafo y truncarla pierde información real.</li>
            </ul>
          </div>
          <div class="when no">
            <h3 class="sx-cap">No lo usés</h3>
            <ul>
              <li>Para nada que después se vaya a filtrar, contar o comparar. Un modo de falla va en un Select contra <span class="sx-id">FCM-01…07</span>, no en prosa que dice «se quemó» de nueve maneras.</li>
              <li>Para una dirección o un nombre largo. Eso es un Input; una caja de cuatro filas promete un párrafo que nadie va a escribir.</li>
            </ul>
          </div>
        </div>

        <div class="demo grid2">
          <Textarea
            label="Qué se hizo"
            bind:value={nota}
            limit={280}
            rows={4}
            hint="Lo que otro técnico necesitaría saber dentro de seis meses. Seguí escribiendo: el contador aparece en el último tramo."
          />
          <Textarea
            label="Por qué se descarta"
            value="No corresponde"
            rows={4}
            optional
            hint="Sin presupuesto: no hay contador, porque no hay nada que contar."
          />
          <Textarea
            label="Observaciones"
            value="Sin novedad."
            rows={3}
            readonly
            hint="Solo lectura: se puede seleccionar y copiar, pero la orden ya se cerró."
          />
          <Textarea
            label="Diagnóstico"
            value=""
            rows={3}
            required
            error="Una orden correctiva no se cierra sin diagnóstico."
            fix="Basta una línea: qué falló y qué se le hizo."
          />
        </div>

        <div class="code">
          <pre><code>{C.textarea}</code></pre>
          <button class="copy" on:click={() => copy(C.textarea, 'textarea')}>
            {copied === 'textarea' ? 'Copiado' : failed === 'textarea' ? 'No se pudo — usá Ctrl+C' : 'Copiar'}
          </button>
        </div>
      </section>

      <!-- ═══ SELECT ══════════════════════════════════════════════════════ -->
      <section id="select">
        <h2>Select</h2>
        <p class="why">
          El <span class="sx-id">&lt;select&gt;</span> nativo, a propósito. No porque sea fácil, sino
          porque es <b>mejor</b> en lo suyo: en la tablet que sostiene un técnico abre la rueda de la
          plataforma, que es un movimiento de pulgar por opción y nunca le mueve la página debajo.
          Cualquier desplegable a mano tendría que reimplementar el tipeo anticipado, el ajuste, el
          contrato del Escape y cómo lo acomoda un teléfono, y terminaría peor.
        </p>

        <div class="two">
          <div class="when yes">
            <h3 class="sx-cap">Usalo</h3>
            <ul>
              <li>Listas cerradas de menos de una docena: familias, modos de falla, categorías de costo (REP / MO / DOM).</li>
              <li>Cuando las opciones se agrupan de verdad: <span class="sx-id">group</span> arma los <span class="sx-id">optgroup</span>.</li>
            </ul>
          </div>
          <div class="when no">
            <h3 class="sx-cap">No lo usés</h3>
            <ul>
              <li>Sobre una docena de opciones. Un select con 300 máquinas es una lista donde nadie encuentra nada: eso es Combobox.</li>
              <li>Bajo cinco opciones que hay que <b>sopesar</b> entre sí. Un select esconde la comparación detrás de un clic: eso es Radio, o ChoiceCards si cada opción merece una frase.</li>
              <li>Para un sí/no. Eso es Checkbox o Switch.</li>
            </ul>
          </div>
        </div>

        <div class="demo grid2">
          <Select label="Familia" bind:value={familia} options={FAMILIAS} placeholder="Elegí una familia" required hint="Decide qué actividades le aplican y qué plantillas hereda." />
          <Select label="Modo de falla" bind:value={falla} options={FALLAS} hint="Agrupado por disciplina, como en el libro de las batidoras." />
          <Select label="Categoría de costo" value="REP" options={[{ value: 'REP', label: 'REP · Repuestos' }, { value: 'MO', label: 'MO · Mano de obra' }, { value: 'DOM', label: 'DOM · Servicio a domicilio' }]} hint="El vocabulario que los técnicos ya usan." />
          <Select label="Bodega" value="" options={FAMILIAS} placeholder="Elegí una bodega" disabled hint="Desactivado: la familia todavía no está definida." />
          <Select
            label="Familia"
            value=""
            options={FAMILIAS}
            placeholder="Elegí una familia"
            error="Sin familia el equipo no entra en la línea de tiempo."
            fix="La familia decide qué plan hereda. Si todavía no existe, creala en Catálogos y volvé."
          />
          <Select label="Estado" value="" options={[]} placeholder="No hay estados configurados" hint="Vacío: la lista existe pero no tiene nada. Decilo en el marcador de posición." />
        </div>

        <div class="code">
          <pre><code>{C.select}</code></pre>
          <button class="copy" on:click={() => copy(C.select, 'select')}>
            {copied === 'select' ? 'Copiado' : failed === 'select' ? 'No se pudo — usá Ctrl+C' : 'Copiar'}
          </button>
        </div>
      </section>

      <!-- ═══ COMBOBOX ════════════════════════════════════════════════════ -->
      <section id="combobox">
        <h2>Combobox</h2>
        <p class="why">
          Una lista demasiado larga para mirarla, hecha encontrable escribiendo. Escribí
          <span class="sx-id">bat</span>, <span class="sx-id">hino</span> o
          <span class="sx-id">electrica</span> sin tilde: el filtro pliega los acentos, porque el
          español se escribe con tildes y se teclea sin ellas.
        </p>
        <p class="why">
          <b>Dice cuántos coincidieron</b>, en pantalla y en voz alta. Una lista que se acorta en
          silencio es una lista en la que se deja de confiar, y ese renglón es la razón por la que
          alguien teclea una cuarta letra en vez de ponerse a rodar. <b>No inventa</b>: salir con
          texto que no es una opción devuelve la que sí está elegida. Y <b>el Escape es un nivel por
          tecla</b>, detenido acá mismo, porque un combobox dentro de un diálogo dentro del Shell no
          puede cerrar los tres.
        </p>

        <div class="two">
          <div class="when yes">
            <h3 class="sx-cap">Usalo</h3>
            <ul>
              <li>Equipos, repuestos, actividades, ubicaciones: todo lo que crece con el inquilino.</li>
              <li>Cuando la fila necesita contexto además del nombre: <span class="sx-id">hint</span> a la izquierda, <span class="sx-id">meta</span> a la derecha.</li>
            </ul>
          </div>
          <div class="when no">
            <h3 class="sx-cap">No lo usés</h3>
            <ul>
              <li>Bajo una docena de opciones: Select abre el selector nativo y no cuesta teclear.</li>
              <li>Para un valor que todavía no existe. Un combobox que acepta cualquier cosa en silencio es un campo de texto disfrazado: poné al lado una acción de «crear» de verdad, en vez de <span class="sx-id">allowFree</span>.</li>
              <li>Como filtro de una tabla que ya está en pantalla. Eso es un campo de búsqueda, y la tabla misma es la lista de resultados.</li>
            </ul>
          </div>
        </div>

        <div class="demo grid2">
          <Combobox label="Equipo" bind:value={equipo} options={EQUIPOS} noun="equipo" nounPlural="equipos" placeholder="Código o nombre…" hint="22 batidoras y 2 camiones. Escribí «bat» o «hino»." />
          <Combobox label="Repuesto" bind:value={repuesto} options={REPUESTOS} noun="repuesto" nounPlural="repuestos" placeholder="Nombre o código…" hint="La existencia va de pista, el precio de meta." />
          <Combobox label="Ubicación" value="" options={[]} noun="ubicación" nounPlural="ubicaciones" loading placeholder="Cargando…" hint="Cargando: lo dice en vez de mostrar una lista vacía." />
          <Combobox
            label="Equipo"
            value=""
            options={EQUIPOS}
            noun="equipo"
            nounPlural="equipos"
            placeholder="Código o nombre…"
            required
            error="Una orden sin equipo no se puede costear."
            fix="Elegí la máquina a la que se le hizo el trabajo; si no está, registrala primero en Flota."
          />
        </div>

        <div class="code">
          <pre><code>{C.combobox}</code></pre>
          <button class="copy" on:click={() => copy(C.combobox, 'combobox')}>
            {copied === 'combobox' ? 'Copiado' : failed === 'combobox' ? 'No se pudo — usá Ctrl+C' : 'Copiar'}
          </button>
        </div>

        <p class="aside">
          Teclado completo: ↓ abre y baja, ↑ sube, Inicio y Fin van a las puntas, Enter elige,
          Tab cierra, Escape cierra y —con la lista ya cerrada— limpia. El foco nunca sale del
          campo: se mueve <span class="sx-id">aria-activedescendant</span>, que es el patrón que
          este control es.
        </p>
      </section>

      <!-- ═══ DATEINPUT ═══════════════════════════════════════════════════ -->
      <section id="date">
        <h2>DateInput</h2>
        <p class="why">
          El <span class="sx-id">&lt;input type="date"&gt;</span> nativo, por la misma razón que el
          select: en la tablet abre el calendario de la plataforma. Lo que el control nativo
          <b>no</b> hace es decirle a nadie qué acaba de elegir, y «03/08/26» es de donde salen los
          errores de tres días. Así que esto lo devuelve en palabras y —la parte que de verdad se
          gana el espacio en mantenimiento— dice a qué distancia está.
        </p>

        <div class="demo grid2">
          <DateInput label="Fecha del servicio" bind:value={fecha} relative max={hoy} hint="Se hizo hoy: mirá el eco debajo." />
          <DateInput label="Próximo vencimiento" bind:value={fechaMala} relative hint="Un año de más se ve al instante en el «en N días»." />
          <DateInput label="Fecha de ingreso" value="" relative optional hint="Vacío: sin eco, y sin espacio reservado para un eco que no hay." />
          <DateInput
            label="Fecha del servicio"
            value="2027-01-15"
            relative
            error="Esa fecha todavía no llega."
            fix="Un servicio se registra cuando ya se hizo. Si está programado, dejalo como plan."
          />
          <DateInput label="Cerrada el" value="2026-07-18" readonly relative hint="Solo lectura: la orden ya está cerrada." />
          <DateInput label="Salida" value="2026-08-01T07:30" time relative hint="Con hora, para la papelería de despacho." />
        </div>

        <div class="two">
          <div class="when yes">
            <h3 class="sx-cap">Usalo</h3>
            <ul>
              <li>El día en que algo pasó o va a pasar: un servicio, una salida, un ingreso.</li>
              <li>Con <span class="sx-id">relative</span> siempre que la distancia en el tiempo signifique algo — que en mantenimiento es casi siempre.</li>
            </ul>
          </div>
          <div class="when no">
            <h3 class="sx-cap">No lo usés</h3>
            <ul>
              <li>Para un período. «Cada 180 días» es un NumberInput con unidad, no una fecha.</li>
              <li>Para una fecha que el sistema sabe mejor que la persona — el próximo vencimiento de un plan. Mostrala como texto: un campo invita a una edición que no significa nada.</li>
              <li>Para un mes o un año solos. Un selector de día que ignora su día miente sobre lo que recoge.</li>
            </ul>
          </div>
        </div>

        <div class="code">
          <pre><code>{C.date}</code></pre>
          <button class="copy" on:click={() => copy(C.date, 'date')}>
            {copied === 'date' ? 'Copiado' : failed === 'date' ? 'No se pudo — usá Ctrl+C' : 'Copiar'}
          </button>
        </div>
      </section>

      <!-- ═══ CALENDAR ════════════════════════════════════════════════════ -->
      <section id="calendar">
        <h2>Calendar</h2>
        <p class="why">
          El componente que no existía y que obligaba a cada producto a escribir el suyo. Una
          rejilla de mes navegable por teclado —el patrón ARIA es el de <span class="sx-id">grid</span>,
          leído de la especificación, no improvisado— con semana que empieza el lunes, como
          corresponde en es-CR. Se puede usar sola, sin <span class="sx-id">Field</span> alrededor:
          es un widget, no un control de texto.
        </p>
        <p class="why">
          Reusa el parseo con corrección de zona horaria de <span class="sx-id">DateInput</span> — nada de
          eso se resuelve dos veces— y los dos tokens que ya separaban lo pasajero de lo persistente
          en <span class="sx-id">Table</span>: <span class="sx-id">--sx-accent-soft</span> bajo el
          puntero o el foco, <span class="sx-id">--sx-accent-pick</span> en el día elegido. «Hoy» no
          se pinta con relleno — eso es lo que significa «elegido» acá— es una marca pequeña, debajo
          de la cifra. Sin rejilla dibujada: la alineación es aire, nunca una raya.
        </p>

        <div class="demo grid3">
          <div class="stack">
            <p class="hintline">Sin nada elegido todavía</p>
            <Calendar value={calVacio} label="Fecha del servicio" />
          </div>
          <div class="stack">
            <p class="hintline">Con días deshabilitados (no se puede ir al futuro)</p>
            <Calendar value={calElegido} max={hoy} label="Fecha de la lectura" />
          </div>
          <div class="stack">
            <p class="hintline">Un mes que empieza domingo</p>
            <Calendar value="" viewDate="2026-02-01" label="Febrero de ejemplo" />
          </div>
          <div class="stack">
            <p class="hintline">Un mes que termina lunes</p>
            <Calendar value="" viewDate="2026-08-01" label="Agosto de ejemplo" />
          </div>
        </div>

        <div class="two">
          <div class="when yes">
            <h3 class="sx-cap">Usalo</h3>
            <ul>
              <li>Cuando la elección misma es la tarea — agendar, filtrar por período— y ver el mes entero ayuda a decidir.</li>
              <li>Con <span class="sx-id">min</span>/<span class="sx-id">max</span> para acotar lo que se puede elegir, con la misma convención que <span class="sx-id">DateInput</span>.</li>
              <li>Navegado <b>solo con teclado</b>: flechas por día, <span class="sx-id">Home</span>/<span class="sx-id">End</span> a los extremos de la semana, <span class="sx-id">PageUp</span>/<span class="sx-id">PageDown</span> por mes.</li>
            </ul>
          </div>
          <div class="when no">
            <h3 class="sx-cap">No lo usés</h3>
            <ul>
              <li>Para un dato que se escribe rápido y de memoria — «cuándo se hizo esto» es <span class="sx-id">DateInput</span>, que además abre el calendario nativo en una tablet.</li>
              <li>Para un rango de dos fechas: eso es <span class="sx-id">DateRange</span>, que ya trae la regla entre ambas.</li>
            </ul>
          </div>
        </div>

        <div class="code">
          <pre><code>{C.calendar}</code></pre>
          <button class="copy" on:click={() => copy(C.calendar, 'calendar')}>
            {copied === 'calendar' ? 'Copiado' : failed === 'calendar' ? 'No se pudo — usá Ctrl+C' : 'Copiar'}
          </button>
        </div>
      </section>

      <!-- ═══ DATERANGE ═══════════════════════════════════════════════════ -->
      <section id="daterange">
        <h2>DateRange</h2>
        <p class="why">
          Dos <span class="sx-id">DateInput</span> no son un rango: un rango es dos fechas más la
          regla que las une, y la regla es que la de fin no puede ser anterior a la de inicio.
          Cuando eso pasa el sistema no adivina — lo dice, en el campo que está mal, con el mismo
          par <span class="sx-id">error</span> + <span class="sx-id">fix</span> que ya usa el resto
          de la librería: dos frases, porque «qué está mal» y «cómo se arregla» son dos frases
          distintas.
        </p>

        <div class="demo">
          <p class="hintline">Con la fecha de fin puesta antes que la de inicio, a propósito</p>
          <DateRange bind:start={rangoDesde} bind:end={rangoHasta} />
        </div>

        <div class="two">
          <div class="when yes">
            <h3 class="sx-cap">Usalo</h3>
            <ul>
              <li>Para un período real: la ventana de un reporte, la vigencia de un alquiler.</li>
              <li>Con <span class="sx-id">min</span>/<span class="sx-id">max</span> compartidos entre las dos puntas.</li>
            </ul>
          </div>
          <div class="when no">
            <h3 class="sx-cap">No lo usés</h3>
            <ul>
              <li>Para dos fechas que no son un tramo de lo mismo — «fecha de compra» y «fecha de garantía vencida» son dos hechos distintos, no un rango.</li>
            </ul>
          </div>
        </div>

        <div class="code">
          <pre><code>{C.daterange}</code></pre>
          <button class="copy" on:click={() => copy(C.daterange, 'daterange')}>
            {copied === 'daterange' ? 'Copiado' : failed === 'daterange' ? 'No se pudo — usá Ctrl+C' : 'Copiar'}
          </button>
        </div>
      </section>

      <!-- ═══ CHECKBOX ════════════════════════════════════════════════════ -->
      <section id="checkbox">
        <h2>Checkbox</h2>
        <p class="why">
          Un sí que es parte de un sí más grande. No actúa: fija un valor sobre el que después va a
          actuar otra cosa —Guardar, Registrar, Generar la orden—. Esa es toda la diferencia con
          Switch, y confundirla es cómo alguien marca una casilla, se va, y una semana después
          descubre que nunca se guardó nada.
        </p>

        <div class="demo grid2">
          <div class="stack">
            <Checkbox bind:checked={cobrable} label="Cobrable al cliente" hint="Entra en la factura de la orden con el 13 % de IVA." />
            <Checkbox checked={false} label="Requiere paro de planta" />
            <Checkbox checked disabled label="Preventiva" hint="Desactivado: lo decide la plantilla del plan." />
            <Checkbox checked={false} invalid label="Acepto que el código es definitivo" hint="El anillo es la segunda señal; la frase del grupo es la primera." />
          </div>
          <div class="stack">
            <Field group label="¿Qué se le cambió?" let:labelId let:describedBy>
              <div role="group" aria-labelledby={labelId} aria-describedby={describedBy} class="stack">
                <Checkbox bind:checked={todas} indeterminate={!todas} label="Todas las actividades" hint="Tercer estado: algunas de las de abajo están marcadas." />
                <div class="indent stack">
                  <Checkbox checked label="M-12 · Revisión de rodamientos" />
                  <Checkbox checked={false} label="E-07 · Prueba de aislamiento" />
                  <Checkbox checked={false} label="L-03 · Engrase de corona" />
                </div>
              </div>
            </Field>
          </div>
        </div>

        <div class="two">
          <div class="when yes">
            <h3 class="sx-cap">Usalo</h3>
            <ul>
              <li>Dentro de un formulario con un Guardar abajo.</li>
              <li>Para varios sí independientes: qué actividades incluye una orden.</li>
              <li>Con <span class="sx-id">indeterminate</span> para el «todas» de una lista parcialmente marcada.</li>
            </ul>
          </div>
          <div class="when no">
            <h3 class="sx-cap">No lo usés</h3>
            <ul>
              <li>Para algo que surte efecto al apretarlo. Eso es Switch.</li>
              <li>Para una de varias respuestas excluyentes. Eso es Radio, o ChoiceCards.</li>
              <li>Envuelto en un Field: la etiqueta ya está al lado y el Field la nombraría dos veces.</li>
            </ul>
          </div>
        </div>

        <div class="code">
          <pre><code>{C.checkbox}</code></pre>
          <button class="copy" on:click={() => copy(C.checkbox, 'checkbox')}>
            {copied === 'checkbox' ? 'Copiado' : failed === 'checkbox' ? 'No se pudo — usá Ctrl+C' : 'Copiar'}
          </button>
        </div>
      </section>

      <!-- ═══ RADIO ═══════════════════════════════════════════════════════ -->
      <section id="radio">
        <h2>Radio</h2>
        <p class="why">
          Una de pocas, cuando las pocas vale la pena verlas juntas. El argumento contra el Select no
          es de gusto, es aritmética: un select esconde todas las opciones menos una detrás de un
          clic, así que <b>comparar cuesta un clic</b>. Bajo cinco opciones que hay que sopesar, la
          comparación es la decisión.
        </p>
        <p class="why">
          Es un <span class="sx-id">&lt;input type="radio"&gt;</span> de verdad, y eso es lo que
          compra las flechas, una sola parada de tabulación para todo el grupo, el anuncio de «2 de
          3» y el envío del formulario. <span class="sx-id">name</span> no es opcional en la
          práctica: sin él las flechas se van al grupo siguiente de la página.
        </p>

        <div class="demo grid2">
          <Field group label="¿Cómo se mide el intervalo?" hint="Los dos relojes corren; vence el que llegue primero." let:labelId let:describedBy>
            <div role="radiogroup" aria-labelledby={labelId} aria-describedby={describedBy} class="stack">
              <Radio bind:group={medida} value="cal" name="medida" label="Por calendario" hint="Cada tantos días, corra o no corra." />
              <Radio bind:group={medida} value="uso" name="medida" label="Por uso" hint="Por el contador de la máquina: kilómetros, horas, ciclos." />
              <Radio bind:group={medida} value="ambos" name="medida" label="Lo que ocurra primero" hint="Es lo normal en flota: el camión que no rueda igual envejece." />
            </div>
          </Field>

          <Field
            group
            label="¿Qué tipo de orden es?"
            required
            error="Falta decir de qué tipo es."
            fix="Preventiva si sale de un plan; correctiva si algo se rompió."
            let:labelId
            let:describedBy
          >
            <div role="radiogroup" aria-labelledby={labelId} aria-describedby={describedBy} class="stack">
              <Radio group="" value="prev" name="tipo" label="Preventiva" invalid />
              <Radio group="" value="corr" name="tipo" label="Correctiva" invalid />
              <Radio group="" value="mejora" name="tipo" label="Mejora" disabled hint="Desactivado: este inquilino no la tiene habilitada." />
            </div>
          </Field>
        </div>

        <div class="two">
          <div class="when yes">
            <h3 class="sx-cap">Usalo</h3>
            <ul>
              <li>De dos a seis opciones excluyentes que caben en una palabra o dos.</li>
              <li>Cuando ver las opciones juntas es parte de decidir.</li>
            </ul>
          </div>
          <div class="when no">
            <h3 class="sx-cap">No lo usés</h3>
            <ul>
              <li>Sobre seis opciones: eso es Select, o Combobox.</li>
              <li>Cuando cada opción necesita una frase y una insignia para elegirse con honestidad: eso es ChoiceCards.</li>
              <li>Para un encendido/apagado. Un grupo de un solo radio no se puede des-elegir.</li>
            </ul>
          </div>
        </div>

        <div class="code">
          <pre><code>{C.radio}</code></pre>
          <button class="copy" on:click={() => copy(C.radio, 'radio')}>
            {copied === 'radio' ? 'Copiado' : failed === 'radio' ? 'No se pudo — usá Ctrl+C' : 'Copiar'}
          </button>
        </div>
      </section>

      <!-- ═══ SWITCH ══════════════════════════════════════════════════════ -->
      <section id="switch">
        <h2>Switch</h2>
        <p class="why">
          Un ajuste que surte efecto en el momento en que se aprieta. Si apretarlo no cambia el
          mundo por sí solo, es un checkbox disfrazado y alguien lo va a mover, se va a ir, y va a
          estar equivocado sobre lo que el sistema está haciendo. Por eso este control tiene estado
          <span class="sx-id">busy</span>: «surte efecto de inmediato» quiere decir que hay una
          petición en vuelo, y un interruptor que se devuelve solo tres segundos después sin
          explicar nada es peor que uno que espera.
        </p>

        <div class="demo grid2">
          <div class="panel">
            <Switch bind:checked={auto} label="Leer los documentos automáticamente" hint="Cada salida y devolución que entre se procesa sola." />
            <hr />
            <Switch checked={ia} busy={iaBusy} words label="Asistencia de IA para campos dudosos" hint="Se envían números, nunca nombres. Se puede apagar cuando quiera." on:change={toggleIa} />
            <hr />
            <Switch checked={false} disabled label="Alertas por WhatsApp" hint="Desactivado: no hay número verificado para este inquilino." />
          </div>
          <div class="side">
            <p>
              Apretá el segundo: espera 1,1 s con el reloj en la perilla antes de moverse, que es lo
              que hace una petición real. La palabra <b>Sí / No</b> —<span class="sx-id">words</span>—
              se pone cuando alguien tiene que estar <em>seguro</em> de en qué quedó.
            </p>
            <p>
              El estado no es un color: la perilla se mueve, y lleva un visto encendida y una barra
              apagada. Dos formas, dos posiciones, y el relleno de acento como tercera señal. Si el
              movimiento está desactivado por <span class="sx-id">prefers-reduced-motion</span>, la
              perilla simplemente <em>está</em> en el otro lado, y sigue leyéndose.
            </p>
          </div>
        </div>

        <div class="two">
          <div class="when yes">
            <h3 class="sx-cap">Usalo</h3>
            <ul>
              <li>Ajustes de una pantalla de configuración que se guardan solos.</li>
              <li>Encender o apagar un comportamiento del sistema en vivo.</li>
            </ul>
          </div>
          <div class="when no">
            <h3 class="sx-cap">No lo usés</h3>
            <ul>
              <li>Dentro de un formulario con Guardar abajo. Eso es Checkbox.</li>
              <li>Para algo destructivo o irreversible: «marcar como inventario a granel» es para siempre, y para siempre merece un botón y una frase, no un manotazo.</li>
              <li>Para filtrar una lista. Eso es un Pill en estado presionado, al lado de la lista que filtra.</li>
            </ul>
          </div>
        </div>

        <div class="code">
          <pre><code>{C.switche}</code></pre>
          <button class="copy" on:click={() => copy(C.switche, 'switch')}>
            {copied === 'switch' ? 'Copiado' : failed === 'switch' ? 'No se pudo — usá Ctrl+C' : 'Copiar'}
          </button>
        </div>
      </section>

      <!-- ═══ CHOICECARDS ═════════════════════════════════════════════════ -->
      <section id="choicecards">
        <h2>ChoiceCards</h2>
        <p class="why">
          Un radiogroup para una elección que hay que <b>argumentar</b>, no listar. La pregunta para
          la que existe es «¿cómo se le da seguimiento?»: una familia declara cómo acumula su
          contador, y las cuatro respuestas no son cuatro palabras, son cuatro consecuencias. Quien
          elige entre ellas está eligiendo qué <em>será</em> el reloj de mantenimiento de esa máquina
          durante los próximos nueve años. Un select esconde tres de las cuatro y le pide decidir de
          memoria.
        </p>

        <div class="demo">
          <ChoiceCards
            label="¿Cómo se le da seguimiento?"
            bind:value={modo}
            hint="Decide de dónde sale el reloj de mantenimiento de esta familia. Se puede cambiar después, pero lo ya acumulado no se recalcula."
            options={[
              { value: 'mano', title: 'Lectura a mano', detail: 'Alguien anota el horómetro cuando pasa por la máquina. Sirve donde hay contador y hay quien lo lea.' },
              { value: 'alquiler', title: 'Mientras está afuera', detail: 'La salida y la devolución son el uso. Nadie tiene que leer nada: la papelería que el ERP ya imprime es el reloj.', badge: 'Recomendado' },
              { value: 'ciclo', title: 'Ciclo declarado', detail: 'Se asume una jornada fija por cada día trabajado. Es una estimación y la ficha lo dice.' },
              { value: 'iot', title: 'Dispositivo', detail: 'Fase 2. El endpoint ya existe; el equipo todavía no.', disabled: true }
            ]}
          />
        </div>

        <p class="aside">
          Sigue siendo un radiogroup: <b>una sola parada de tabulación</b> para todo el grupo, las
          flechas mueven y mover elige, Inicio y Fin van a las puntas, y las tarjetas desactivadas se
          saltan en vez de recibir el foco. Sin nada elegido, la parada la tiene la primera tarjeta
          elegible, para que el grupo nunca quede fuera del recorrido.
        </p>

        <div class="two">
          <div class="when yes">
            <h3 class="sx-cap">Usalo</h3>
            <ul>
              <li>De dos a cuatro opciones donde cada una necesita una frase para elegirse bien.</li>
              <li>Cuando la elección define cómo va a comportarse el sistema de aquí en adelante.</li>
              <li>Cuando una opción es la recomendada y decirlo con una insignia ahorra una consulta.</li>
            </ul>
          </div>
          <div class="when no">
            <h3 class="sx-cap">No lo usés</h3>
            <ul>
              <li>Cuando las etiquetas solas ya contestan: «kilómetros / horas» no necesita un tercio de pantalla. Eso es Radio.</li>
              <li>Sobre seis opciones: deja de ser una comparación y es una pared. Select o Combobox.</li>
              <li>Para selección múltiple. Son radios; una tarjeta que se puede apretar dos veces es una casilla.</li>
            </ul>
          </div>
        </div>

        <div class="code">
          <pre><code>{C.cards}</code></pre>
          <button class="copy" on:click={() => copy(C.cards, 'cards')}>
            {copied === 'cards' ? 'Copiado' : failed === 'cards' ? 'No se pudo — usá Ctrl+C' : 'Copiar'}
          </button>
        </div>
      </section>

      <!-- ═══ FILEDROP ════════════════════════════════════════════════════ -->
      <section id="filedrop">
        <h2>FileDrop</h2>
        <p class="why">
          La papelería que el negocio ya imprime, entrando. Acá casi nunca es «subí una foto de
          perfil»: son veinte salidas exportadas del ERP, y el operador tiene que poder ver
          <b>cuáles</b> veinte antes de que se escriba nada. Por eso la lista es parte del control y
          no una consecuencia suya. Arrastrá archivos, o hacé clic; probá con uno de más de 10 MB
          para ver el rechazo con su salida.
        </p>

        <div class="demo">
          <FileDrop
            label="Documentos de despacho"
            bind:files={archivos}
            accept="application/pdf,.pdf"
            maxSize={10 * 1024 * 1024}
            note="Salidas y devoluciones en PDF, hasta 10 MB cada uno"
            hint="Los archivos no se guardan: se leen en memoria y de cada uno sobrevive su huella, que es lo que reconoce un documento repetido seis meses después."
          />
        </div>

        <div class="demo grid2">
          <FileDrop label="Adjunto de la orden" files={[]} multiple={false} note="Un archivo" disabled hint="Desactivado: la orden ya se cerró." />
          <FileDrop
            label="Libro de mantenimiento"
            files={[]}
            accept=".xlsm,.xlsx"
            note="Excel del inquilino"
            error="Ese archivo no se pudo abrir."
            fix="Está protegido con contraseña. Quitale la protección en Excel y volvé a subirlo."
          />
        </div>

        <div class="two">
          <div class="when yes">
            <h3 class="sx-cap">Usalo</h3>
            <ul>
              <li>Lotes de documentos que después se revisan antes de escribirse.</li>
              <li>Cuando ver el nombre y el peso de cada archivo antes de mandarlos es parte del trabajo.</li>
            </ul>
          </div>
          <div class="when no">
            <h3 class="sx-cap">No lo usés</h3>
            <ul>
              <li>Para una foto tomada en el momento: eso es un <span class="sx-id">&lt;input type="file" capture&gt;</span> y una cámara. En un teléfono no hay nada que arrastrar.</li>
              <li>Para un archivo chico que reemplaza a otro. Un botón alcanza; una caja de 200 px para una línea de trabajo es mobiliario.</li>
            </ul>
          </div>
        </div>

        <p class="aside">
          <span class="sx-id">accept</span> es una pista para el diálogo del sistema, no un filtro: el
          servidor decide qué es un PDF por sus bytes mágicos y nunca por el nombre. Un archivo
          arrastrado jamás se descarta en silencio; se reporta con su motivo y su salida.
        </p>

        <div class="code">
          <pre><code>{C.filedrop}</code></pre>
          <button class="copy" on:click={() => copy(C.filedrop, 'filedrop')}>
            {copied === 'filedrop' ? 'Copiado' : failed === 'filedrop' ? 'No se pudo — usá Ctrl+C' : 'Copiar'}
          </button>
        </div>
      </section>

      <!-- ═══ FORMULARIO ══════════════════════════════════════════════════ -->
      <section id="formulario">
        <h2>Un formulario entero</h2>
        <p class="why">
          Siete controles distintos en una sola columna. Nadie los alineó: comparten el envoltorio,
          así que comparten el alto de caja, el anillo de foco, el sitio del mensaje y el objetivo de
          44 px en pantalla táctil. Apretá <b>Registrar equipo</b> con el formulario vacío para ver
          la validación entera, y fijate en el intervalo, que llega heredado de la familia.
        </p>

        <div class="demo">
          <form class="form" on:submit|preventDefault={guardar} novalidate>
            <div class="form-head">
              <h3>Registrar equipo</h3>
              {#if guardado}
                <Pill tone="positive">Registrado</Pill>
              {:else if enviado && hayErrores}
                <Pill tone="critical">{Object.keys(errores).length === 1 ? 'Falta 1 dato' : `Faltan ${Object.keys(errores).length} datos`}</Pill>
              {:else}
                <Pill tone="neutral">Borrador</Pill>
              {/if}
            </div>

            <div class="row2">
              <Input
                label="Código"
                bind:value={f.codigo}
                mono
                required
                placeholder="BAT023"
                hint="Como está pintado en la máquina."
                error={enviado ? errores.codigo?.p ?? '' : ''}
                fix={enviado ? errores.codigo?.f ?? '' : ''}
              />
              <Input
                label="Nombre"
                bind:value={f.nombre}
                required
                placeholder="Batidora eléctrica 1 saco"
                hint="Como lo llaman en la bodega."
                error={enviado ? errores.nombre?.p ?? '' : ''}
                fix={enviado ? errores.nombre?.f ?? '' : ''}
              />
            </div>

            <div class="row2">
              <Select
                label="Familia"
                bind:value={f.familia}
                options={FAMILIAS}
                placeholder="Elegí una familia"
                required
                error={enviado ? errores.familia?.p ?? '' : ''}
                fix={enviado ? errores.familia?.f ?? '' : ''}
              />
              <Combobox
                label="Ubicación"
                bind:value={f.ubicacion}
                options={UBICACIONES}
                noun="ubicación"
                nounPlural="ubicaciones"
                placeholder="Bodega o proyecto…"
                optional
              />
            </div>

            <Field group label="¿Con qué contador se le sigue?" let:labelId let:describedBy>
              <div role="radiogroup" aria-labelledby={labelId} aria-describedby={describedBy} class="rowradio">
                <Radio bind:group={f.medidor} value="horas" name="medidor" label="Horas" />
                <Radio bind:group={f.medidor} value="km" name="medidor" label="Kilómetros" />
                <Radio bind:group={f.medidor} value="ciclos" name="medidor" label="Ciclos" />
                <Radio bind:group={f.medidor} value="ninguno" name="medidor" label="Ninguno" />
              </div>
            </Field>

            <div class="row2">
              <NumberInput
                label="Cada cuántos días"
                bind:value={f.intervalo}
                unit="días"
                stepper
                step={30}
                min="1"
                origin={'la familia elegida'}
                originValue="180 días"
                changed={intervaloTocado}
                on:revert={() => (f.intervalo = '180')}
                error={enviado ? errores.intervalo?.p ?? '' : ''}
                fix={enviado ? errores.intervalo?.f ?? '' : ''}
              />
              <DateInput label="Fecha de ingreso" bind:value={f.ingreso} relative max={hoy} />
            </div>

            <Textarea label="Notas" bind:value={f.notas} limit={240} rows={3} optional hint="Lo que no cabe en ningún otro campo." />

            <div class="acts">
              <button type="button" class="ghost" on:click={limpiarFormulario}>Limpiar</button>
              <button type="submit" class="solid" disabled={guardando}>
                {guardando ? 'Registrando…' : 'Registrar equipo'}
              </button>
            </div>

            {#if guardado}
              <p class="ok" role="status">
                Quedó registrado. Hereda el plan de su familia y ya aparece en la línea de tiempo.
              </p>
            {/if}
          </form>
        </div>

        <p class="aside">
          La confirmación reutiliza la palabra del control: el botón dice <b>Registrar equipo</b> y
          lo que vuelve dice <b>Quedó registrado</b>. Si el botón dijera «Guardar» y la
          confirmación «Creado», serían dos vocabularios para una sola acción.
        </p>
      </section>

      <!-- ═══ REGLAS ══════════════════════════════════════════════════════ -->
      <section id="reglas">
        <h2>Las reglas</h2>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th><span class="sx-cap">Si tenés</span></th>
                <th><span class="sx-cap">Usá</span></th>
                <th><span class="sx-cap">Y no</span></th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Texto libre corto</td><td>Input</td><td>Textarea de cuatro filas</td></tr>
              <tr><td>Un identificador</td><td>Input <span class="sx-id">mono</span></td><td>NumberInput</td></tr>
              <tr><td>Una cifra con unidad</td><td>NumberInput</td><td>Input con la unidad en el marcador</td></tr>
              <tr><td>Colones</td><td>NumberInput <span class="sx-id">currency</span></td><td>Un flotante en el estado</td></tr>
              <tr><td>Un párrafo</td><td>Textarea</td><td>Un dato que después haya que filtrar</td></tr>
              <tr><td>2 a 6 opciones cortas</td><td>Radio</td><td>Select</td></tr>
              <tr><td>2 a 4 opciones que hay que explicar</td><td>ChoiceCards</td><td>Radio con pistas larguísimas</td></tr>
              <tr><td>Hasta 12 opciones</td><td>Select</td><td>Combobox</td></tr>
              <tr><td>Más de 12 opciones</td><td>Combobox</td><td>Select</td></tr>
              <tr><td>Una fecha</td><td>DateInput</td><td>Tres selects de día, mes y año</td></tr>
              <tr><td>Sí/no dentro de un formulario</td><td>Checkbox</td><td>Switch</td></tr>
              <tr><td>Sí/no que surte efecto ya</td><td>Switch</td><td>Checkbox</td></tr>
              <tr><td>Archivos por lote</td><td>FileDrop</td><td>Un input de archivo pelado</td></tr>
              <tr><td>Un control que no está acá</td><td>Field + tu elemento</td><td>Otra caja hecha a mano</td></tr>
            </tbody>
          </table>
        </div>

        <div class="two">
          <div class="when yes">
            <h3 class="sx-cap">Lo que la familia garantiza</h3>
            <ul>
              <li>Solo tokens <span class="sx-id">--sx-*</span>. Nada de hexadecimales ni de radios sueltos.</li>
              <li>Los dos temas. Probá con <span class="sx-id">data-sx-theme="dark"</span> en el <span class="sx-id">&lt;html&gt;</span>.</li>
              <li>Teclado primero: foco visible, orden correcto, semántica real y <span class="sx-id">aria</span> que dice la verdad.</li>
              <li>44 px y tipografía de 16 px con <span class="sx-id">(pointer: coarse)</span>: por debajo de 16, iOS hace zoom a toda la página al enfocar.</li>
              <li>Estilos con alcance de componente, para que sobrevivan dentro de un shadow root abierto.</li>
            </ul>
          </div>
          <div class="when no">
            <h3 class="sx-cap">Lo que le falta al sistema</h3>
            <ul>
              <li>No hay token de tipografía de 16 px, que es el mínimo que exige iOS en un campo. Los componentes lo escriben crudo, con su comentario: es una constante del navegador, no una decisión de diseño.</li>
              <li>No hay <span class="sx-id">--sx-scheme</span>. El calendario nativo, el desplegable del select y las barras de desplazamiento se dibujan desde <span class="sx-id">color-scheme</span>, y sin un token que lo lleve, dentro de un shadow root el tema oscuro no llega a ellos.</li>
              <li>No hay escala de tamaños de control. Los componentes usan los tokens de espacio (<span class="sx-id">--sx-s-10</span> = 40 px, <span class="sx-id">--sx-touch</span> = 44) y funciona, pero es una coincidencia aritmética, no un contrato.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  </div>
</div>

<style>
  /* ── La página ───────────────────────────────────────────────────────────
     Un módulo de Strix se dibuja al lado de una barra lateral de 240 px, así
     que todo acá está pensado para la columna de contenido y nunca para la
     ventana. */
  .page { max-width: 76rem; margin: 0 auto; padding: var(--sx-s-8) var(--sx-s-5) var(--sx-s-20); }

  .lede { max-width: 72ch; }
  .kicker { display: block; margin: 0 0 var(--sx-s-2); }
  h1 {
    margin: 0; font-size: var(--sx-t-3xl); font-weight: var(--sx-w-bold);
    letter-spacing: -.035em; line-height: 1.05;
  }
  .stand {
    margin: var(--sx-s-4) 0 0; font-size: var(--sx-t-lg);
    color: var(--sx-ink-2); line-height: 1.5; max-width: 56ch;
  }

  .rules {
    display: grid; gap: var(--sx-s-4); margin: var(--sx-s-8) 0 0;
    grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  }
  .rules > div {
    background: var(--sx-surface); border-radius: var(--sx-r-2);
    box-shadow: var(--sx-e-1); padding: var(--sx-s-4);
  }
  .rules h2 { margin: 0 0 var(--sx-s-2); font-size: var(--sx-t-2xs); }
  .rules p { margin: 0; font-size: var(--sx-t-sm); color: var(--sx-ink-2); line-height: 1.55; }

  .note {
    margin: var(--sx-s-6) 0 0; font-size: var(--sx-t-sm);
    color: var(--sx-ink-3); line-height: 1.6; max-width: 68ch;
  }

  /* ── El cuerpo ─────────────────────────────────────────────────────────── */
  .body { display: block; margin-top: var(--sx-s-12); }

  .toc { margin: 0 0 var(--sx-s-8); }
  .toc ul {
    list-style: none; margin: 0; padding: 0;
    display: flex; gap: var(--sx-s-2); overflow-x: auto;
    padding-bottom: var(--sx-s-2);
  }
  .toc a {
    display: inline-flex; align-items: center; white-space: nowrap;
    padding: var(--sx-s-2) var(--sx-s-3); border-radius: var(--sx-r-pill);
    background: var(--sx-surface); box-shadow: var(--sx-e-1);
    font-size: var(--sx-t-xs); font-weight: var(--sx-w-semi);
    color: var(--sx-ink-2); text-decoration: none;
    transition: color var(--sx-fast) var(--sx-ease), box-shadow var(--sx-fast) var(--sx-ease);
  }
  .toc a:hover { color: var(--sx-ink); box-shadow: var(--sx-e-2); }

  section {
    margin: 0 0 var(--sx-s-20);
    scroll-margin-top: var(--sx-s-6);
  }
  section h2 {
    margin: 0 0 var(--sx-s-3); font-size: var(--sx-t-2xl);
    font-weight: var(--sx-w-bold); letter-spacing: -.03em; line-height: 1.15;
  }
  .why {
    margin: 0 0 var(--sx-s-4); font-size: var(--sx-t-md);
    color: var(--sx-ink-2); line-height: 1.6; max-width: 66ch;
  }
  .why b { color: var(--sx-ink); font-weight: var(--sx-w-semi); }
  .aside {
    margin: var(--sx-s-4) 0 0; font-size: var(--sx-t-sm);
    color: var(--sx-ink-3); line-height: 1.6; max-width: 68ch;
  }
  .aside b { color: var(--sx-ink-2); font-weight: var(--sx-w-semi); }

  /* ── Cuándo sí / cuándo no ─────────────────────────────────────────────── */
  .two {
    display: grid; gap: var(--sx-s-4); margin: var(--sx-s-5) 0;
    grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
  }
  .when {
    position: relative; padding: var(--sx-s-4) var(--sx-s-4) var(--sx-s-4) var(--sx-s-5);
    background: var(--sx-surface); border-radius: var(--sx-r-2); box-shadow: var(--sx-e-1);
  }
  /* Una barra de 3 px, no un fondo: la geometría de las dos tarjetas es
     idéntica, y el tono siempre llega con su palabra encima. */
  .when::before {
    content: ''; position: absolute; left: var(--sx-s-3); top: var(--sx-s-4); bottom: var(--sx-s-4);
    width: 3px; border-radius: var(--sx-r-pill);
  }
  .when.yes::before { background: var(--sx-positive); }
  .when.no::before { background: var(--sx-critical); }
  .when h3 { margin: 0 0 var(--sx-s-2); font-size: var(--sx-t-2xs); }
  .when.yes h3 { color: var(--sx-positive); }
  .when.no h3 { color: var(--sx-critical); }
  .when ul { margin: 0; padding-left: var(--sx-s-4); }
  .when li { font-size: var(--sx-t-sm); color: var(--sx-ink-2); line-height: 1.55; margin-bottom: var(--sx-s-2); }
  .when li:last-child { margin-bottom: 0; }

  /* ── Las demostraciones ────────────────────────────────────────────────── */
  .demo {
    background: var(--sx-surface); border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-1); padding: var(--sx-s-6); margin: var(--sx-s-5) 0;
  }
  .grid2, .grid3 { display: grid; gap: var(--sx-s-6) var(--sx-s-5); }
  .grid2 { grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr)); }
  .grid3 { grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); }
  .col-narrow { max-width: 26rem; }
  .stack { display: flex; flex-direction: column; gap: var(--sx-s-2); }
  .indent { padding-left: var(--sx-s-6); }
  .panel > :global(hr) { border: 0; border-top: 1px solid var(--sx-line); margin: var(--sx-s-3) 0; }
  .side p { margin: 0 0 var(--sx-s-3); font-size: var(--sx-t-sm); color: var(--sx-ink-2); line-height: 1.6; }
  .side b { color: var(--sx-ink); font-weight: var(--sx-w-semi); }
  .hintline {
    display: flex; align-items: center; gap: var(--sx-s-2); flex-wrap: wrap;
    margin: var(--sx-s-3) 0 0; font-size: var(--sx-t-xs); color: var(--sx-ink-3);
  }
  .lead-ico { width: 15px; height: 15px; align-self: center; flex: none; color: var(--sx-ink-3); }

  /* ── Anatomía ──────────────────────────────────────────────────────────── */
  .anatomy { display: grid; gap: var(--sx-s-6); grid-template-columns: minmax(0, 22rem) minmax(0, 1fr); align-items: start; }
  .raw-affix { display: inline-flex; align-items: center; flex: none; align-self: center; font-size: var(--sx-t-xs); color: var(--sx-ink-3); }
  .parts { margin: 0; padding-left: var(--sx-s-5); }
  .parts li { font-size: var(--sx-t-sm); color: var(--sx-ink-3); line-height: 1.55; margin-bottom: var(--sx-s-2); }
  .parts b { color: var(--sx-ink); font-weight: var(--sx-w-semi); }

  /* ── El código ─────────────────────────────────────────────────────────── */
  .code { position: relative; margin: var(--sx-s-5) 0 0; }
  pre {
    margin: 0; padding: var(--sx-s-4) var(--sx-s-5);
    background: var(--sx-sunk); border-radius: var(--sx-r-2);
    overflow-x: auto;
  }
  code {
    font-family: var(--sx-font-mono); font-size: var(--sx-t-xs);
    line-height: 1.65; color: var(--sx-ink-2); white-space: pre;
  }
  .copy {
    position: absolute; top: var(--sx-s-2); right: var(--sx-s-2);
    padding: var(--sx-s-1) var(--sx-s-3); min-height: var(--sx-s-6);
    border: 0; border-radius: var(--sx-r-pill);
    background: var(--sx-surface); color: var(--sx-ink-2);
    box-shadow: var(--sx-e-1); cursor: pointer;
    font: inherit; font-size: var(--sx-t-2xs); font-weight: var(--sx-w-semi);
    transition: color var(--sx-fast) var(--sx-ease), box-shadow var(--sx-fast) var(--sx-ease);
  }
  .copy:hover { color: var(--sx-ink); box-shadow: var(--sx-e-2); }

  /* ── El formulario entero ──────────────────────────────────────────────── */
  .form { display: flex; flex-direction: column; gap: var(--sx-s-5); max-width: 44rem; }
  .form-head { display: flex; align-items: center; justify-content: space-between; gap: var(--sx-s-4); }
  .form-head h3 { margin: 0; font-size: var(--sx-t-lg); font-weight: var(--sx-w-semi); letter-spacing: -.02em; }
  .row2 { display: grid; gap: var(--sx-s-5); grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); }
  .rowradio { display: flex; flex-wrap: wrap; gap: var(--sx-s-2) var(--sx-s-6); }
  .acts { display: flex; gap: var(--sx-s-2); justify-content: flex-end; flex-wrap: wrap; }
  /* Botones mínimos hechos acá a propósito: los botones son de otra familia y
     tomarlos prestados haría que esta página se rompa el día que esa familia
     llegue. */
  .solid, .ghost {
    display: inline-flex; align-items: center; justify-content: center;
    min-height: var(--sx-s-10); padding: 0 var(--sx-s-5);
    border: 0; border-radius: var(--sx-r-pill); cursor: pointer;
    font: inherit; font-size: var(--sx-t-sm); font-weight: var(--sx-w-semi);
    transition: transform var(--sx-fast) var(--sx-ease), box-shadow var(--sx-fast) var(--sx-ease);
  }
  .solid { background: var(--sx-accent); color: var(--sx-accent-ink); box-shadow: var(--sx-e-1); }
  .ghost { background: var(--sx-sunk); color: var(--sx-ink-2); }
  .solid:hover:not(:disabled), .ghost:hover { transform: translateY(-1px); box-shadow: var(--sx-e-2); }
  .solid:disabled { opacity: .5; cursor: not-allowed; transform: none; }
  .ok {
    margin: 0; padding: var(--sx-s-3) var(--sx-s-4);
    background: var(--sx-positive-band); color: var(--sx-positive);
    border: 1px solid var(--sx-positive-edge); border-radius: var(--sx-r-2);
    font-size: var(--sx-t-sm); line-height: 1.5;
  }

  /* ── La tabla ──────────────────────────────────────────────────────────── */
  .table-wrap {
    background: var(--sx-surface); border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-1); overflow-x: auto; margin: var(--sx-s-5) 0;
  }
  table { width: 100%; border-collapse: collapse; min-width: 34rem; }
  th { text-align: left; padding: var(--sx-s-3) var(--sx-s-4); white-space: nowrap; }
  td { padding: var(--sx-s-3) var(--sx-s-4); font-size: var(--sx-t-sm); color: var(--sx-ink-2); }
  tbody tr { box-shadow: inset 0 1px 0 var(--sx-line); }
  tbody td:nth-child(2) { color: var(--sx-ink); font-weight: var(--sx-w-medium); }
  tbody td:nth-child(3) { color: var(--sx-ink-3); }

  /* ── Ancho ─────────────────────────────────────────────────────────────── */
  @media (min-width: 68rem) {
    .body { display: grid; grid-template-columns: 11rem minmax(0, 1fr); gap: var(--sx-s-10); align-items: start; }
    .toc { position: sticky; top: var(--sx-s-5); margin: 0; }
    .toc ul { flex-direction: column; gap: var(--sx-s-1); overflow: visible; padding: 0; }
    .toc a { background: none; box-shadow: none; padding: var(--sx-s-1) var(--sx-s-2); color: var(--sx-ink-3); }
    .toc a:hover { background: var(--sx-sunk); box-shadow: none; color: var(--sx-ink); }
  }

  @media (max-width: 52rem) {
    .anatomy { grid-template-columns: 1fr; }
  }

  @media (max-width: 30rem) {
    .page { padding: var(--sx-s-6) var(--sx-s-4) var(--sx-s-16); }
    h1 { font-size: var(--sx-t-2xl); }
    .stand { font-size: var(--sx-t-md); }
    section h2 { font-size: var(--sx-t-xl); }
    .demo { padding: var(--sx-s-4); }
    section { margin-bottom: var(--sx-s-16); }
  }
</style>
