<script>
  // UNA PANTALLA DE VERDAD, ARMADA SOLO CON LA LIBRERÍA.
  //
  // Este archivo no define ni un color, ni un radio, ni una sombra. Si algo se
  // ve mal aquí, el arreglo va en la librería y le llega a todos los productos
  // — que es exactamente el punto de tener librería.
  //
  // Lo único que este archivo aporta es LAYOUT: qué va arriba, qué va al lado
  // de qué, y cuánto aire hay en medio. Eso sí es decisión de cada pantalla.
  import {
    PageHeader, SearchField, FilterChips, Button, Pill,
    StatStrip, Stat, Table, Bar, Alert, Card
  } from '@strix/frontend-lib';
  import { EQUIPOS, FAMILIAS, VEREDICTO } from './data.js';

  let familia = null;
  let busqueda = '';

  // Sin `const` auxiliares cerrando sobre estado reactivo: una sentencia $:
  // solo rastrea los nombres escritos DENTRO de ella, así que un helper
  // declarado afuera es invisible para el compilador y el filtro se queda
  // congelado en el primer valor. Ese bug ya se envió cinco veces en este
  // ecosistema; la expresión va entera adentro.
  $: visibles = EQUIPOS.filter(
    (e) =>
      (familia === null || e.familia === familia) &&
      (busqueda === '' ||
        (e.nombre + ' ' + e.id + ' ' + e.ubicacion).toLowerCase().includes(busqueda.toLowerCase()))
  );

  $: vencidos = EQUIPOS.filter((e) => e.estado === 'critical').length;
  $: porVencer = EQUIPOS.filter((e) => e.estado === 'attention').length;
  $: alDia = EQUIPOS.filter((e) => e.estado === 'positive').length;
  $: sinLectura = EQUIPOS.filter((e) => e.estado === 'neutral').length;

  // Las columnas se declaran una vez y el formato vive AQUÍ, no en cada celda.
  // `id: true` pone el registro monoespaciado de identificador; `numeric` alinea
  // a la derecha con cifras tabulares. Una placa NO es numeric — es identificador.
  const columnas = [
    { key: 'id', label: 'Código', id: true, primary: true, min: '9ch' },
    { key: 'nombre', label: 'Equipo', min: '24ch' },
    { key: 'familia', label: 'Familia', optional: true, showAt: 760 },
    { key: 'ubicacion', label: 'Ubicación', optional: true, showAt: 900 },
    {
      key: 'lectura',
      label: 'Última lectura',
      numeric: true,
      value: (r) => (r.lectura === null ? '—' : `${r.lectura.toLocaleString('es-CR')} ${r.unidad}`),
      sortValue: (r) => r.lectura ?? -1
    },
    { key: 'tarea', label: 'Próxima tarea', optional: true, showAt: 1040 },
    {
      key: 'estado',
      label: 'Estado',
      sortValue: (r) => ({ critical: 0, attention: 1, neutral: 2, positive: 3 })[r.estado]
    }
  ];
</script>

<div class="pantalla">
  <PageHeader
    title="Flota"
    subtitle={VEREDICTO}
    eyebrow="Mantenimiento"
  >
    <svelte:fragment slot="actions">
      <Button variant="ghost">Subir salida</Button>
      <Button variant="solid">Registrar lectura</Button>
    </svelte:fragment>
  </PageHeader>

  {#if vencidos > 0}
    <Alert tone="critical" title="{vencidos} equipos vencidos">
      El más atrasado lleva 12 días. Registrá la lectura o posponé el plan con una razón.
    </Alert>
  {/if}

  <StatStrip label="Estado de la flota">
    <Stat label="Vencidos" value={vencidos} tone="critical" note="3 más que ayer" />
    <Stat label="Por vencer" value={porVencer} tone="attention" note="próximos 15 días" />
    <Stat label="Al día" value={alDia} tone="positive" outOf={EQUIPOS.length} />
    <Stat label="Sin lectura" value={sinLectura} tone="neutral" note="nunca medidos" />
  </StatStrip>

  <div class="filtros">
    <SearchField bind:value={busqueda} resultCount={visibles.length} noun="equipos" />
    <FilterChips options={FAMILIAS} bind:value={familia} label="Familia" total={EQUIPOS.length} />
  </div>

  <Table
    columns={columnas}
    rows={visibles}
    rowKey={(r) => r.id}
    caption="Equipos de la flota y su estado de mantenimiento"
    sort={{ key: 'estado', dir: 'asc' }}
  >
    <svelte:fragment slot="cell" let:row let:col let:value>
      {#if col.key === 'estado'}
        <Pill tone={row.estado}>{row.palabra}</Pill>
      {:else}
        {value ?? '—'}
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="actions" let:row>
      <!-- Visible corto, nombre accesible completo. Un botón que dice solo
           «Registrar» repetido seis veces deja a quien navega por lista de
           controles sin saber cuál es cuál; uno que dice «Registrar lectura de
           BAT-014» desborda la columna. El texto oculto resuelve las dos. -->
      <Button size="sm" variant="ghost">
        Registrar<span class="sx-sr"> lectura de {row.id}</span>
      </Button>
    </svelte:fragment>
  </Table>

  <Card>
    <h3>Avance contra el plan</h3>
    <p class="nota">
      Un plan corre contra dos relojes — calendario y uso — y vence con el que
      llegue primero. La barra muestra el que va adelante.
    </p>
    {#each EQUIPOS.filter((e) => e.avance > 0) as e (e.id)}
      <Bar
        label="{e.id} · {e.tarea}"
        value={e.avance}
        max={100}
        unit="%"
        tone={e.estado}
        toneWord={e.palabra}
        note={e.dias < 0 ? `venció hace ${-e.dias} d` : `en ${e.dias} d`}
        estimate={e.id === 'HRN001'}
      />
    {/each}
  </Card>
</div>

<style>
  /* Todo lo que hay aquí es distribución. Ni un color, ni un radio, ni una
     sombra: eso lo pone la librería y por eso un cambio de tema no toca este
     archivo. Los espacios salen de la escala de tokens, no de números sueltos. */
  .pantalla {
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-6);
    padding: var(--sx-s-6);
    max-width: 1180px;
    margin: 0 auto;
  }
  .filtros {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: var(--sx-s-4);
  }
  .filtros :global(> *:first-child) { min-width: 240px; }

  h3 {
    margin: 0 0 var(--sx-s-1);
    font-size: var(--sx-t-md);
    font-weight: var(--sx-w-semi);
    letter-spacing: -0.01em;
  }
  .nota {
    margin: 0 0 var(--sx-s-4);
    font-size: var(--sx-t-sm);
    color: var(--sx-ink-3);
    max-width: 62ch;
  }
</style>
