<script>
  // IMPORTPREVIEW — la UI de `ingest.v1`, una sola vez para los cuatro módulos.
  //
  // El contrato de importación de archivos (§8) la pide acá y no en cada core:
  // «FileDrop.svelte más una vista de preview que hable ingest.v1 sirve a los
  // cuatro módulos. Es el premio real de compartir la forma y no el código: UNA
  // UI de importación, no cuatro».
  //
  // NO HABLA CON LA RED. Recibe dos funciones —`prepare` y `commit`— y el core
  // que la usa decide cómo llama a su propio gateway. Lo que esta componente
  // sabe es la FORMA de la conversación, que es justamente lo que el contrato
  // comparte; el transporte y el `kind` son de cada repo.
  //
  // POR QUÉ ENVUELVE A ReviewPanel EN VEZ DE DIBUJAR OTRA TABLA. ReviewPanel ya
  // es «el mecanismo que hace seguro ofrecer ingestión automatizada» y su propio
  // encabezado lo dice: un lote de PROPUESTAS, cada una con su veredicto,
  // ninguna escrita. Lo único que faltaba era traducir el vocabulario de
  // `ingest.v1` al suyo, y eso se hace UNA vez, acá.
  //
  // LOS CINCO VEREDICTOS NO SON LOS MISMOS, y la traducción es de esta capa:
  //
  //   ingest.v1            ReviewPanel   por qué
  //   CREATE / UPDATE  →   write         se va a escribir
  //   DUPLICATE        →   duplicate     ya estaba
  //   REVIEW           →   question      no resolvió; va a la bandeja
  //   REJECT           →   block         no se escribe, y se dice por qué
  //
  // UNA NOTA SOBRE EL ENCABEZADO DE ReviewPanel: dice que «el preview y el
  // commit son la MISMA petición con una bandera cambiada, y el commit reenvía
  // el payload exacto». Eso describe el modelo `dry_run` que el contrato
  // REEMPLAZÓ por `import_id`, justamente porque reenviar el payload es lo que
  // deja al cliente meter filas que el preview no vio. El `import_id` cumple su
  // intención MEJOR: el commit no manda filas, sólo el handle y qué quitar.
  import { createEventDispatcher } from 'svelte';
  import FileDrop from './FileDrop.svelte';
  import Button from '../action/Button.svelte';
  import Alert from '../feedback/Alert.svelte';
  import ReviewPanel from '../feedback/ReviewPanel.svelte';

  /** Sube los archivos y devuelve la respuesta de PrepareImport. */
  export let prepare;
  /** Confirma: recibe (importId, excludeIds) y devuelve CommitImportResponse. */
  export let commit;
  /** Qué importación de este core: "items", "clients", "meter_readings". */
  export let kind = '';
  /** De quién es el papeleo. Del request, NUNCA del documento (§3). */
  export let source = '';
  /** Extensiones que este `kind` acepta. Elige un LECTOR, no decide qué es. */
  export let accept = '.csv,.xlsx,.xls';
  /** [singular, plural] de lo que se está importando. */
  export let noun = ['fila', 'filas'];
  export let title = 'Lo que se entendió';
  /**
   * Rechazar el lote entero si algo no resolvió. Va como bandera del commit, no
   * como filtro del cliente: quien decide es el servidor.
   */
  export let allOrNothing = false;

  const dispatch = createEventDispatcher();

  let files = [];
  let preview = null;
  let result = null;
  let excluded = new Set();
  let phase = 'files'; // files | review | working | done
  let error = '';
  let fix = '';

  const VERDICT = {
    ITEM_VERDICT_CREATE: 'write',
    ITEM_VERDICT_UPDATE: 'write',
    ITEM_VERDICT_DUPLICATE: 'duplicate',
    ITEM_VERDICT_REVIEW: 'question',
    ITEM_VERDICT_REJECT: 'block'
  };

  // LOS CAMPOS INCIERTOS SON LO QUE UN REVISOR TIENE QUE MIRAR, y es la razón
  // por la que `FieldInfo` lleva `status` y `provenance`. Se resumen en la nota
  // al pie del ítem para que no haya que abrir cada fila.
  function footnoteFor(item) {
    const dudosos = (item.fields ?? []).filter(
      (f) => f.status === 'FIELD_STATUS_MISSING' || f.status === 'FIELD_STATUS_AMBIGUOUS'
    );
    if (dudosos.length === 0) return undefined;
    return {
      label:
        dudosos.length === 1
          ? '1 campo quedó incierto'
          : `${dudosos.length} campos quedaron inciertos`,
      text: dudosos.map((f) => `${f.name}: ${f.provenance || 'sin procedencia'}`).join(' · ')
    };
  }

  function toReviewItem(item) {
    const bloqueantes = (item.problems ?? []).filter((p) => p.blocking);
    const primero = bloqueantes[0] ?? (item.problems ?? [])[0];
    return {
      id: item.itemId,
      code: item.label,
      title: item.label,
      verdict: VERDICT[item.verdict] ?? 'question',
      message: primero?.message ?? '',
      meta: (item.fields ?? [])
        .filter((f) => f.status === 'FIELD_STATUS_FOUND' && f.value)
        .slice(0, 3)
        .map((f) => `${f.name}: ${f.value}`),
      footnote: footnoteFor(item)
    };
  }

  $: reviewItems = (preview?.items ?? []).map(toReviewItem);

  async function onPrepare() {
    if (files.length === 0) {
      error = 'Elegí al menos un archivo.';
      return;
    }
    error = '';
    fix = '';
    phase = 'working';
    try {
      preview = await prepare(files, { kind, source });
      excluded = new Set();
      phase = 'review';
      dispatch('prepared', preview);
    } catch (e) {
      error = e?.message ?? String(e);
      // El vencido y el archivo ilegible se arreglan distinto, y el mensaje del
      // servidor ya lo dice: acá sólo se le da un lugar donde leerse.
      fix = 'Revisá el archivo y volvé a subirlo.';
      phase = 'files';
    }
  }

  // `commit` emite los INCLUIDOS; el contrato manda los EXCLUIDOS. La resta se
  // hace acá porque el servidor sólo acepta quitar: «entre preview y commit el
  // operador solo puede QUITAR, nunca inventar».
  async function onCommit(e) {
    const incluidos = new Set(e.detail.ids);
    const exclude = (preview?.items ?? [])
      .map((i) => i.itemId)
      .filter((id) => !incluidos.has(id));

    phase = 'working';
    error = '';
    try {
      result = await commit(preview.importId, exclude, { allOrNothing });
      phase = 'done';
      dispatch('committed', result);
    } catch (e2) {
      error = e2?.message ?? String(e2);
      fix = 'Nada se escribió. Volvé a intentar, o quitá las filas con problemas.';
      phase = 'review';
    }
  }

  function reset() {
    files = [];
    preview = null;
    result = null;
    excluded = new Set();
    phase = 'files';
    error = '';
    fix = '';
    dispatch('cancel');
  }

  $: resumen = result
    ? [
        result.created ? `${result.created} creada(s)` : '',
        result.updated ? `${result.updated} actualizada(s)` : '',
        result.skipped ? `${result.skipped} omitida(s)` : '',
        result.reviewItems ? `${result.reviewItems} a revisar` : ''
      ]
        .filter(Boolean)
        .join(' · ')
    : '';
</script>

{#if error}
  <Alert tone="critical" title="No se pudo continuar.">{error}{#if fix} {fix}{/if}</Alert>
{/if}

{#if phase === 'files'}
  <FileDrop
    bind:files
    {accept}
    label="Archivo"
    hint="El nombre elige el lector; qué es el documento se lee del contenido."
  />
  <div class="sx-import-actions">
    <Button variant="solid" disabled={files.length === 0} on:click={onPrepare}>Leer el archivo</Button>
  </div>
{:else}
  <ReviewPanel
    {title}
    {noun}
    items={reviewItems}
    state={phase === 'working' ? 'working' : phase === 'done' ? 'done' : 'review'}
    selectable
    note={phase === 'done' ? resumen : ''}
    verb={{ infinitive: 'importar', commit: 'Importar', doing: 'Importando…', done: 'importada', donePlural: 'importadas' }}
    on:commit={onCommit}
    on:cancel={reset}
    on:done={reset}
  />
{/if}

<style>
  .sx-import-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: var(--sx-s-3);
  }
</style>
