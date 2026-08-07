<script context="module">
  let seq = 0;

  const KEY = (f) => `${f.name}:${f.size}:${f.lastModified}`;

  function bytes(n) {
    const b = Number(n ?? 0);
    if (!b) return '0 B';
    if (b < 1024) return `${b} B`;
    if (b < 1048576) return `${Math.round(b / 1024)} kB`;
    return `${(b / 1048576).toFixed(1).replace('.', ',')} MB`;
  }
</script>

<script>
  // FILEDROP — the paperwork the business already prints, on its way in.
  //
  // In Strix this is almost never «upload an avatar». It is twenty salidas
  // exported from the ERP, or the workbook a yard has kept for nine years, and
  // the operator has to be able to see WHICH twenty before anything is written.
  // So the staged list is part of the control, not a consequence of it: files
  // land here, get looked at, get removed one by one if they are wrong, and only
  // then does something else read them.
  //
  //   • THE SAME FILE TWICE IN ONE BATCH IS ONE FILE. Deduped on name, size and
  //     mtime, because dragging a folder in after dragging three of its files is
  //     what people actually do.
  //   • `accept` IS A HINT TO THE SYSTEM DIALOG, NOT A GATE. The server decides
  //     what a PDF is by its bytes; a dropped file is never silently discarded
  //     for having the wrong extension, it is reported with its reason.
  //   • A REJECTED FILE SAYS WHY AND WHAT TO DO. «Pesa 24,3 MB y el máximo es
  //     10» is half a sentence without «volvé a exportarlo sin las imágenes».
  //   • THE ONLY BORDER IN THE FAMILY THAT IS NOT A CONTROL OUTLINE appears
  //     while something is being dragged over it. A drop target has to declare
  //     itself the moment the cursor arrives, and elevation cannot do that.
  //
  //   <FileDrop label="Documentos de despacho" bind:files accept="application/pdf,.pdf"
  //             maxSize={10 * 1024 * 1024}
  //             note="Salidas y devoluciones en PDF, hasta 10 MB cada uno."
  //             on:reject={say} />
  //
  // WHEN NOT TO USE IT: for a photo taken right now — that is a plain
  // `<input type="file" accept="image/*" capture>` and a camera, and a dropzone
  // on a phone is a target nothing can be dragged onto. For one small file that
  // replaces another, a button is enough; a 200px box for one line of work is
  // furniture.
  import { createEventDispatcher } from 'svelte';
  import Field from './Field.svelte';

  /** The staged files. Two-way: `bind:files`. */
  export let files = [];
  /** A hint for the system dialog. Never a filter — see the note above. */
  export let accept = '';
  export let multiple = true;
  /** Bytes. 0 ⇒ no local ceiling; the server is still the authority. */
  export let maxSize = 0;
  /** What belongs here, said in the box before anybody drags anything. */
  export let note = '';

  export let label = '';
  export let hint = '';
  export let error = '';
  export let fix = '';
  export let warning = '';
  export let required = false;
  export let optional = false;
  export let disabled = false;
  export let id = '';

  const dispatch = createEventDispatcher();
  const n = ++seq;

  $: fid = id || `sxfd${n}`;

  let inputEl;
  let dragging = false;
  /** [{ name, why, fix }] — kept until the next drop, so it can be read. */
  let rejected = [];

  $: total = files.reduce((a, f) => a + (f.size ?? 0), 0);

  function add(list) {
    if (disabled) return;
    const have = new Set(files.map(KEY));
    const keep = [];
    const bad = [];
    for (const f of Array.from(list ?? [])) {
      if (have.has(KEY(f))) continue;
      if (maxSize && f.size > maxSize) {
        bad.push({
          name: f.name,
          why: `Pesa ${bytes(f.size)} y el máximo es ${bytes(maxSize)}.`,
          fix: 'Volvé a exportarlo del sistema que lo generó; un PDF de texto pesa una fracción de uno escaneado.'
        });
        continue;
      }
      have.add(KEY(f));
      keep.push(f);
    }
    rejected = bad;
    if (bad.length) dispatch('reject', bad);
    if (!keep.length) return;
    files = multiple ? [...files, ...keep] : keep.slice(0, 1);
    dispatch('change', files);
  }

  function remove(f) {
    files = files.filter((x) => KEY(x) !== KEY(f));
    dispatch('change', files);
  }

  function clearAll() {
    files = [];
    rejected = [];
    dispatch('change', files);
    inputEl?.focus();
  }

  function onPick(e) {
    add(e.currentTarget.files);
    // The same file has to be choosable again after being removed, and the
    // input remembers what it held until it is emptied.
    e.currentTarget.value = '';
  }

  function onDrop(e) {
    dragging = false;
    add(e.dataTransfer?.files);
  }

  // dragleave also fires crossing from one child of the box to another. Without
  // this the target blinks the whole way across.
  function dragOut(e) {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    dragging = false;
  }
</script>

<Field
  {label} {hint} {error} {fix} {warning} {required} {optional} {disabled}
  id={fid} frame={false}
  let:describedBy
  let:invalid
>
  <!-- `presentation` because that is the truth: this box is a POINTER surface
       and nothing else. Drag-and-drop is unreachable by keyboard or by a screen
       reader in any browser, so the accessible control is the real
       `<input type="file">` and its label inside — which keep every semantic
       they have, since `presentation` does not cascade to them. -->
  <div
    class="drop"
    role="presentation"
    class:over={dragging}
    class:slim={files.length > 0}
    class:invalid
    class:disabled
    on:dragover|preventDefault={() => !disabled && (dragging = true)}
    on:dragenter|preventDefault={() => !disabled && (dragging = true)}
    on:dragleave={dragOut}
    on:drop|preventDefault={onDrop}
  >
    <input
      bind:this={inputEl}
      type="file"
      id={fid}
      {accept}
      {multiple}
      {disabled}
      class="sr"
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      on:change={onPick}
      on:focus
      on:blur
    />
    <label class="face" for={fid}>
      <span class="mark" aria-hidden="true">
        <svg viewBox="0 0 20 20">
          <path d="M4.5 2.5h7l4 4v11a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1v-14a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
          <path d="M11.2 2.7v4.1h4.1" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
        </svg>
      </span>
      <span class="say">
        <b>{files.length ? 'Agregar más archivos' : `Arrastrá ${multiple ? 'los archivos' : 'el archivo'} aquí`}</b>
        <span>o hacé clic para elegir{multiple ? 'los' : 'lo'} del disco{note ? ` · ${note}` : ''}</span>
      </span>
    </label>
  </div>

  {#if rejected.length}
    <ul class="bad" role="alert">
      {#each rejected as r (r.name)}
        <li>
          <svg class="mk" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="2" width="8" height="8" rx="1.5" fill="currentColor" /></svg>
          <span><b class="sx-id">{r.name}</b> no entró. {r.why} <span class="how">{r.fix}</span></span>
        </li>
      {/each}
    </ul>
  {/if}

  {#if files.length}
    <div class="stage">
      <p class="head">
        <span class="sx-cap">{files.length === 1 ? '1 archivo listo' : `${files.length} archivos listos`}</span>
        <span class="tot sx-num">{bytes(total)}</span>
        <button type="button" class="all" on:click={clearAll}>Quitar todos</button>
      </p>
      <ul class="list">
        {#each files as f (KEY(f))}
          <li>
            <svg class="fi" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5h5l3 3v8a.8.8 0 0 1-.8.8H3a.8.8 0 0 1-.8-.8v-9.7a.8.8 0 0 1 .8-.8z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" /></svg>
            <span class="nm">{f.name}</span>
            <span class="sz sx-num">{bytes(f.size)}</span>
            <button type="button" class="rm" on:click={() => remove(f)} aria-label={`Quitar ${f.name}`}>
              <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <slot name="action" slot="action" />
</Field>

<style>
  .drop {
    position: relative;
    background: var(--sx-surface);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-1);
    transition: box-shadow var(--sx-beat) var(--sx-ease), background var(--sx-fast) var(--sx-ease);
  }
  .drop:hover:not(.disabled) { box-shadow: var(--sx-e-2); }

  /* The one border in this family that is not a control outline, and it is only
     ever here while a cursor is carrying something. A drop target that does not
     declare itself is a drop target people drop next to. */
  .drop.over { box-shadow: var(--sx-e-2), inset 0 0 0 2px var(--sx-accent); background: var(--sx-sunk); }
  .drop:focus-within { box-shadow: var(--sx-e-2), inset 0 0 0 2px var(--sx-ink); }
  :global([data-sx-theme='dark']) .drop:focus-within,
  :global(.sx-dark) .drop:focus-within { box-shadow: var(--sx-e-2), inset 0 0 0 2px var(--sx-n-0); }
  .drop.invalid { box-shadow: var(--sx-e-1), inset 0 0 0 1px var(--sx-critical); }
  .drop.disabled { background: var(--sx-sunk); box-shadow: none; }

  .sr {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  .face {
    display: flex; align-items: center; gap: var(--sx-s-4);
    padding: var(--sx-s-8) var(--sx-s-5); cursor: pointer; min-width: 0;
  }
  .drop.slim .face { padding: var(--sx-s-4) var(--sx-s-5); }
  .drop.disabled .face { cursor: not-allowed; }

  .mark {
    display: grid; place-items: center; flex: none;
    width: var(--sx-s-12); height: var(--sx-s-12);
    border-radius: var(--sx-r-2); background: var(--sx-sunk); color: var(--sx-ink-2);
  }
  .drop.slim .mark { width: var(--sx-s-10); height: var(--sx-s-10); }
  .mark svg { width: 22px; height: 22px; }
  .drop.slim .mark svg { width: 18px; height: 18px; }

  .say { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .say b { font-size: var(--sx-t-md); font-weight: var(--sx-w-semi); letter-spacing: -.01em; }
  .drop.slim .say b { font-size: var(--sx-t-sm); }
  .say span { font-size: var(--sx-t-xs); color: var(--sx-ink-3); line-height: 1.5; }

  /* ── What did not get in ─────────────────────────────────────────────────── */
  .bad { list-style: none; margin: var(--sx-s-3) 0 0; padding: 0; display: flex; flex-direction: column; gap: var(--sx-s-2); }
  .bad li {
    display: flex; align-items: flex-start; gap: var(--sx-s-2);
    font-size: var(--sx-t-xs); line-height: 1.5; color: var(--sx-ink-2);
  }
  .bad .mk { flex: none; width: 10px; height: 10px; margin-top: var(--sx-s-1); color: var(--sx-critical); }
  .bad b { font-weight: var(--sx-w-semi); color: var(--sx-critical); }
  .how { color: var(--sx-ink-3); }

  /* ── The batch ───────────────────────────────────────────────────────────── */
  .stage { margin-top: var(--sx-s-3); }
  .head { display: flex; align-items: baseline; gap: var(--sx-s-3); margin: 0 0 var(--sx-s-1); }
  .tot { font-size: var(--sx-t-xs); color: var(--sx-ink-3); flex: 1 1 auto; }
  .all {
    flex: none; background: none; border: 0; padding: 0; cursor: pointer; font: inherit;
    font-size: var(--sx-t-xs); font-weight: var(--sx-w-semi); color: var(--sx-ink);
    text-decoration: underline; text-underline-offset: 3px;
  }

  .list { list-style: none; margin: 0; padding: 0; }
  .list li {
    display: flex; align-items: center; gap: var(--sx-s-3);
    padding: var(--sx-s-2); border-radius: var(--sx-r-1);
    color: var(--sx-ink-3);
    transition: background var(--sx-fast) var(--sx-ease);
  }
  .list li:hover { background: var(--sx-sunk); }
  .fi { flex: none; width: 14px; height: 14px; }
  .nm {
    flex: 1 1 auto; min-width: 0; font-size: var(--sx-t-sm); color: var(--sx-ink);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .sz { flex: none; font-size: var(--sx-t-xs); }
  .rm {
    display: inline-flex; align-items: center; justify-content: center; flex: none;
    width: var(--sx-s-6); height: var(--sx-s-6); padding: 0; border: 0;
    border-radius: var(--sx-r-pill); background: none; color: var(--sx-ink-3); cursor: pointer;
    transition: background var(--sx-fast) var(--sx-ease), color var(--sx-fast) var(--sx-ease);
  }
  .rm:hover { background: var(--sx-surface); color: var(--sx-critical); box-shadow: var(--sx-e-1); }
  .rm svg { width: 13px; height: 13px; }

  @media (pointer: coarse) {
    .rm { width: var(--sx-touch); height: var(--sx-touch); }
    .list li { padding-block: 0; }
    .all { padding: var(--sx-s-2) 0; }
  }

  @media (max-width: 460px) {
    .face { flex-direction: column; align-items: flex-start; gap: var(--sx-s-3); padding: var(--sx-s-5) var(--sx-s-4); }
  }
</style>
