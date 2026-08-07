<script>
  // SHORTCUT OVERLAY — the sheet that says what the keyboard can do.
  //
  // WHY THIS EXISTS AT ALL
  //
  // Strix is used by people who do the same eight things four hundred times a
  // day. For them a shortcut is not a power-user feature, it is the difference
  // between a shift that ends at five and one that ends at six. But a shortcut
  // nobody can discover does not exist, and a tooltip on hover is not discovery
  // — you have to already know where to hover.
  //
  // So: `?` opens this, from anywhere, and every screen that has shortcuts says
  // «?» somewhere once. That is the whole contract.
  //
  //   <ShortcutOverlay bind:open groups={[
  //     { title: 'Moverse', items: [
  //       { keys: ['G', 'F'], sep: 'luego', label: 'Ir a la flota' },
  //       { keys: ['G', 'D'], sep: 'luego', label: 'Ir a documentos' }
  //     ]},
  //     { title: 'En la lista', items: [
  //       { keys: ['/'],            label: 'Buscar' },
  //       { keys: ['⌘', 'Enter'],   label: 'Registrar el servicio' },
  //       { keys: ['Esc'],          label: 'Cerrar o limpiar' }
  //     ]}
  //   ]} />
  //
  // IT DOES NOT BIND THE SHORTCUTS IT LISTS. It binds exactly one — its own `?`
  // — and everything else is the surface's own doing. A help sheet that
  // promises a key nothing listens for is worse than no help sheet: the person
  // presses it, nothing happens, and now they do not trust any of the others.
  // Whoever writes the handler writes the row.
  //
  // ON THE FOCUS TRAP
  //
  // It is a native <dialog> opened with `showModal()`, and that is the entire
  // implementation of the trap. The browser puts the dialog in the top layer,
  // makes everything behind it inert, keeps Tab inside, handles Escape, and —
  // the part hand-rolled traps forget — RESTORES FOCUS to whatever had it
  // before, on close. A trap you did not have to write is a trap that cannot be
  // wrong, and this one is also the only one that keeps working when the module
  // is inside a shadow root under a strict CSP.
  //
  // ON TOUCH: it is still worth shipping. The sheet is the reference a
  // technician reads once on the tablet and then uses at the desk, and the `?`
  // hint hides itself where there is no keyboard to press it on.
  import { createEventDispatcher, onMount } from 'svelte';

  /** Bindable. Setting it true opens the dialog. */
  export let open = false;
  /** [{ title, items: [{ keys: [...], sep?: '+' | 'luego', label }] }] */
  export let groups = [];
  /** The key that opens it. '' turns the global listener off. */
  export let hotkey = '?';
  export let title = 'Atajos de teclado';
  /** One line under the title. Say where the shortcuts apply. */
  export let subtitle = '';

  const dispatch = createEventDispatcher();

  const uid = `sx-keys-${Math.random().toString(36).slice(2, 9)}`;

  let dlg;

  // Both `dlg` and `open` are written inside the statement, so both are in its
  // dependency list. A `const` helper closing over them would be invisible here
  // and the dialog would open exactly once — the classic legacy-`$:` trap.
  $: sync(dlg, open);

  function sync(d, o) {
    if (!d) return;
    if (o && !d.open) d.showModal();
    else if (!o && d.open) d.close();
  }

  function close() {
    open = false;
    dispatch('close');
  }

  // The backdrop click, added from JS rather than as `on:click` on the <dialog>:
  // a click handler on a non-interactive element is a lint rule you end up
  // silencing, and the keyboard equivalent already exists and is Escape.
  // A click that lands on the dialog element itself landed on the backdrop —
  // the panel inside covers everything else.
  function backdrop(node) {
    const onclick = (e) => { if (e.target === node) close(); };
    node.addEventListener('click', onclick);
    return { destroy: () => node.removeEventListener('click', onclick) };
  }

  function onWindowKey(e) {
    if (!hotkey || e.key !== hotkey) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    // Not while somebody is typing: «¿por qué?» in a notes field must stay a
    // question mark. `composedPath` is what makes this true inside a shadow root.
    for (const n of e.composedPath?.() ?? []) {
      const tag = n?.tagName;
      if (!tag) continue;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (n.isContentEditable) return;
    }
    e.preventDefault();
    if (open) close();
    else { open = true; dispatch('open'); }
  }

  onMount(() => {
    window.addEventListener('keydown', onWindowKey);
    return () => {
      window.removeEventListener('keydown', onWindowKey);
      // A module can be torn out of the Shell mid-dialog; leaving an open
      // dialog in the top layer would leave the page inert forever.
      if (dlg?.open) dlg.close();
    };
  });
</script>

<dialog
  class="sheet"
  bind:this={dlg}
  use:backdrop
  aria-labelledby="{uid}-t"
  aria-describedby={subtitle ? `${uid}-s` : undefined}
  on:close={() => { if (open) close(); }}
>
  <div class="panel">
    <header class="hd">
      <div class="say">
        <h2 id="{uid}-t">{title}</h2>
        {#if subtitle}<p id="{uid}-s" class="sub">{subtitle}</p>{/if}
      </div>
      <button class="x" type="button" on:click={close}>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
        <span class="sr">Cerrar</span>
      </button>
    </header>

    {#if groups.length}
      <div class="cols">
        {#each groups as g (g.title)}
          <section class="grp">
            <h3 class="sx-cap">{g.title}</h3>
            <dl>
              {#each g.items as it (it.label)}
                <div class="row">
                  <dt>
                    {#each it.keys as k, i (i)}
                      {#if i > 0}<span class="sep">{it.sep === 'luego' ? 'luego' : '+'}</span>{/if}
                      <kbd>{k}</kbd>
                    {/each}
                  </dt>
                  <dd>{it.label}</dd>
                </div>
              {/each}
            </dl>
          </section>
        {/each}
      </div>
    {:else}
      <!-- An empty state that invites the specific action, because the person
           reading it is the person who can fix it. -->
      <p class="none">
        Esta pantalla todavía no declara atajos. Agregalos donde vive el manejador
        de teclas y pasalos en <code>groups</code>: una fila por atajo que de
        verdad exista.
      </p>
    {/if}

    <footer class="ft">
      <span class="sx-cap">Cerrar</span>
      <kbd>Esc</kbd>
      {#if hotkey}
        <span class="sx-cap">Abrir</span>
        <kbd>{hotkey}</kbd>
      {/if}
    </footer>
  </div>
</dialog>

<style>
  .sr {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  .sheet {
    padding: 0;
    border: 0;
    background: none;
    max-width: min(64ch, calc(100vw - var(--sx-s-8)));
    width: 100%;
    max-height: calc(100vh - var(--sx-s-12));
    /* Removes the default margin:auto quirk so the panel is genuinely centred
       in the top layer at every width. */
    margin: auto;
    overflow: visible;
    color: var(--sx-ink);
  }

  /* `--sx-scrim`, the same veil Dialog and Sheet use. NOTE, and it is a real
     limitation: `::backdrop` inherits from nothing, so on this element the
     custom property has to resolve from `:root` — which it does in a document
     and does NOT inside a shadow root. A Core that needs this overlay must bind
     `--sx-scrim` on `:root` as well as on `:host`, or accept the fallback. */
  .sheet::backdrop {
    background: var(--sx-scrim, rgba(20, 24, 26, .62));
  }

  .panel {
    display: flex;
    flex-direction: column;
    gap: var(--sx-s-5);
    max-height: calc(100vh - var(--sx-s-12));
    overflow: auto;
    overscroll-behavior: contain;
    padding: var(--sx-s-6);
    background: var(--sx-surface);
    border-radius: var(--sx-r-3);
    box-shadow: var(--sx-e-3);
  }

  .hd { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--sx-s-4); }
  .say { min-width: 0; }
  h2 { margin: 0; font-size: var(--sx-t-lg); font-weight: var(--sx-w-bold); letter-spacing: -.02em; }
  .sub { margin: var(--sx-s-1) 0 0; font-size: var(--sx-t-sm); color: var(--sx-ink-3); max-width: 52ch; }

  .x {
    flex: none;
    display: inline-flex; align-items: center; justify-content: center;
    width: var(--sx-s-8); height: var(--sx-s-8);
    border: 0; border-radius: var(--sx-r-pill);
    background: var(--sx-sunk); color: var(--sx-ink-2);
    cursor: pointer;
    transition: background var(--sx-fast) var(--sx-ease);
  }
  .x:hover { background: var(--sx-neutral-band); }
  .x svg { width: 14px; height: 14px; }

  /* Two columns while there is room, so the whole sheet is one glance and not a
     scroll. Below that, one — a shortcut list that scrolls sideways is a joke. */
  .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(26ch, 1fr)); gap: var(--sx-s-5) var(--sx-s-8); }

  .grp h3 { margin: 0 0 var(--sx-s-2); }
  dl { margin: 0; display: flex; flex-direction: column; }
  .row {
    display: flex;
    align-items: baseline;
    gap: var(--sx-s-3);
    padding-block: var(--sx-s-2);
  }
  .row + .row { box-shadow: inset 0 1px 0 var(--sx-line); }
  dt { flex: none; display: flex; align-items: center; gap: var(--sx-s-1); }
  dd { margin: 0; font-size: var(--sx-t-sm); color: var(--sx-ink-2); min-width: 0; }

  kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--sx-s-6);
    padding: 2px var(--sx-s-2);
    font-family: var(--sx-font-mono);
    font-size: var(--sx-t-2xs);
    font-weight: var(--sx-w-semi);
    line-height: 1.5;
    color: var(--sx-ink);
    background: var(--sx-sunk);
    border-radius: var(--sx-r-1);
    /* The one place a border earns its keep: a key looks like a key because it
       has an edge and sits a hair above the page. */
    box-shadow: var(--sx-e-1), inset 0 -1px 0 var(--sx-edge);
  }

  .sep { font-size: var(--sx-t-2xs); color: var(--sx-ink-3); }

  .none { margin: 0; font-size: var(--sx-t-sm); color: var(--sx-ink-2); line-height: 1.6; max-width: 56ch; }
  .none code { font-family: var(--sx-font-mono); font-size: .94em; background: var(--sx-sunk); border-radius: var(--sx-r-1); padding: 0 var(--sx-s-1); }

  .ft {
    display: flex;
    align-items: center;
    gap: var(--sx-s-2);
    padding-top: var(--sx-s-4);
    box-shadow: inset 0 1px 0 var(--sx-line);
  }

  /* Repeated in-component: base.css does not cross a shadow boundary. */
  .x:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: 2px; }

  @media (pointer: coarse) {
    .x { width: var(--sx-touch); height: var(--sx-touch); }
    .row { padding-block: var(--sx-s-3); }
  }

  @media (max-width: 480px) {
    .panel { padding: var(--sx-s-4); gap: var(--sx-s-4); }
  }
</style>
