<script>
  // SEGUNDO EJEMPLO: un formulario que se puede equivocar.
  //
  // La pantalla de flota enseña cómo se ve la librería mostrando datos. Esta
  // enseña lo otro, que es donde un sistema de diseño se gana el sueldo: qué
  // pasa cuando la persona escribe algo que no cuadra.
  //
  // La regla que la librería impone y este ejemplo respeta: un error dice QUÉ
  // pasó y CÓMO se arregla. `error` es el qué, `fix` es el cómo. Un mensaje que
  // solo dice «valor inválido» no pasa revisión.
  import { Panel, Stack, Row, Field, NumberInput, Select, DateInput, Textarea,
           Button, Alert, Pill, Toast, today } from '@strix/frontend-lib';
  import { EQUIPOS } from './data.js';

  let equipoId = 'BAT-014';
  let valor = '';
  let fecha = today();
  let nota = '';
  let toasts = [];
  let intentado = false;

  const opciones = EQUIPOS.map((e) => ({ value: e.id, label: `${e.id} · ${e.nombre}` }));

  // La expresión completa dentro del $:. Un `const equipo = () => …` declarado
  // afuera no lo rastrea el compilador y la validación se queda mirando el
  // primer equipo para siempre.
  $: equipo = EQUIPOS.find((e) => e.id === equipoId);

  // Una lectura de uso NUNCA baja: un horómetro no retrocede. Si baja, o la
  // escribieron mal o le cambiaron el instrumento al equipo, y las dos cosas
  // necesitan que alguien decida — no que el sistema adivine.
  $: retrocede =
    equipo?.lectura !== null &&
    valor !== '' &&
    Number(valor) < equipo.lectura;

  $: vacio = intentado && valor === '';

  function guardar() {
    intentado = true;
    if (valor === '' || retrocede) return;
    toasts = [
      ...toasts,
      { id: Date.now(), tone: 'positive', text: `Lectura registrada · ${valor} ${equipo.unidad} en ${equipo.id}`, action: 'Deshacer' }
    ];
    valor = '';
    nota = '';
    intentado = false;
  }
</script>

<div class="pantalla">
  <Panel title="Registrar lectura" sub="El reloj de uso avanza con lo que se mida. Lo que no se mide se proyecta.">
    <Stack gap={5}>
      {#if equipo}
        <Alert tone="info" title="{equipo.id} · {equipo.tarea}" mark={false}>
          Última lectura registrada:
          {equipo.lectura === null ? 'ninguna' : `${equipo.lectura.toLocaleString('es-CR')} ${equipo.unidad}`}.
          Estado actual: <Pill tone={equipo.estado} size="sm">{equipo.palabra}</Pill>
        </Alert>
      {/if}

      <Select label="Equipo" options={opciones} bind:value={equipoId} required />

      <Row gap={4}>
        <NumberInput
          label="Lectura"
          unit={equipo?.unidad ?? ''}
          bind:value={valor}
          align="right"
          required
          hint={equipo?.lectura === null
            ? 'Este equipo nunca se ha medido.'
            : `Tiene que ser igual o mayor que ${equipo.lectura.toLocaleString('es-CR')} ${equipo.unidad}.`}
          error={retrocede
            ? `Una lectura de uso no puede bajar. La última fue ${equipo.lectura.toLocaleString('es-CR')} ${equipo.unidad}.`
            : vacio
              ? 'Falta la lectura.'
              : ''}
          fix={retrocede
            ? 'Revisá el número, o registrá un cambio de instrumento si le pusieron un horómetro nuevo.'
            : ''}
        />
        <DateInput label="Fecha de la lectura" bind:value={fecha} max={today()} relative />
      </Row>

      <Textarea
        label="Nota"
        optional
        rows={3}
        limit={280}
        bind:value={nota}
        hint="Lo que un compañero necesitaría saber dentro de seis meses."
      />
    </Stack>

    <svelte:fragment slot="footer">
      <Button variant="ghost">Cancelar</Button>
      <Button variant="solid" on:click={guardar}>Registrar lectura</Button>
    </svelte:fragment>
  </Panel>
</div>

<Toast bind:toasts />

<style>
  /* Solo distribución, como en la otra pantalla. */
  .pantalla {
    max-width: 720px;
    margin: 0 auto;
    padding: var(--sx-s-6);
  }
</style>
