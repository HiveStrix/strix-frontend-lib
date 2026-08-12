<script>
  // PIEZA INTERNA DE SIDEBAR — no exportada, no en `nav/index.js`, no parte
  // de la API pública. Existe por una sola razón mecánica: Svelte 5 no deja
  // mezclar `<slot>` con `{#snippet}`/`{@render}` dentro del MISMO
  // componente («Cannot use `<slot>` syntax and `{@render ...}` tags in the
  // same component»), y `Sidebar.svelte` necesita dibujar esta misma lista
  // de ítems dos veces — una vez en su columna fija, otra vez adentro del
  // `Sheet` del cajón de teléfono — sin mantener dos copias de la lógica de
  // `aria-current`/`svelte:element`/`use:activate`. Un componente hijo con
  // `<slot>` normal no choca con nada: el choque es dentro de un mismo
  // archivo, no entre un padre y un hijo. Ver «THE PHONE DRAWER» en
  // Sidebar.svelte para el resto de la decisión.
  //
  // `collapsed`/`phone` en vez de heredar clases del padre por cascada: los
  // selectores de `.tuck .it` etc. necesitan un ancestro con esa clase
  // DENTRO del propio scope de este componente — el `.tuck` que `Sidebar`
  // pone en su `<nav>` vive en el scope de `Sidebar`, no en el de este
  // archivo, y el CSS con ámbito de Svelte no cruza esa frontera sin
  // `:global()`. Más simple pasar los dos booleanos como props y aplicar las
  // clases acá mismo que andar marcando selectores como globales.
  import { GLYPH_VIEWBOX } from '../shell/Glyph.svelte';

  export let items = [];
  export let value = '';
  export let current = 'page';
  /** Icon-only geometry — sólo tiene sentido cuando `phone` es false. */
  export let collapsed = false;
  /** El cajón de teléfono nunca colapsa: ya es toda la pantalla. Además
   *  excluye la geometría FORZADA de icon-only bajo 640px (ver el `@media`
   *  al final) — esa fuerza existe para la columna angosta, no para un
   *  panel que ya ocupa el ancho entero. */
  export let phone = false;
  /** (item, event) => void — Sidebar decide qué significa elegir un ítem;
   *  esto sólo dibuja y avisa. */
  export let onPick = () => {};

  $: isOn = (it) => it.key != null && it.key === value;
  const initial = (s) => (s ?? '').trim().charAt(0).toUpperCase();

  // Misma razón que en SideRail/Sidebar: el compilador no sabe qué etiqueta
  // resuelve `<svelte:element>`, así que el listener se mueve en vez de la
  // semántica.
  function activate(node, it) {
    let item = it;
    const onclick = (e) => onPick(item, e);
    node.addEventListener('click', onclick);
    return {
      update: (next) => (item = next),
      destroy: () => node.removeEventListener('click', onclick)
    };
  }
</script>

<div class="items" class:tuck={collapsed} class:phone>
  {#if $$slots.header}
    <div class="head"><slot name="header" /></div>
  {/if}

  <ul>
    {#each items as it, i (it.key ?? `s-${i}`)}
      {#if it.kind === 'section'}
        <li class="sect"><span class="sx-cap">{it.label}</span></li>
      {:else}
        <li>
          <svelte:element
            this={it.href ? 'a' : 'button'}
            class="it"
            class:on={isOn(it)}
            class:dis={it.disabled}
            href={it.href || undefined}
            type={it.href ? undefined : 'button'}
            tabindex={it.disabled ? -1 : 0}
            aria-current={isOn(it) ? current : undefined}
            aria-disabled={it.disabled ? 'true' : undefined}
            title={it.label}
            use:activate={it}
          >
            <span class="ic" aria-hidden="true">
              {#if it.icon}
                <svg viewBox={GLYPH_VIEWBOX}><path d={it.icon} fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" /></svg>
              {:else}
                <span class="ini">{initial(it.label)}</span>
              {/if}
            </span>

            <span class="lb">{it.label}</span>

            {#if it.count != null}
              <span class="n sx-num">{it.count}</span>
            {/if}
          </svelte:element>
        </li>
      {/if}
    {/each}
  </ul>

  {#if $$slots.footer}
    <div class="foot"><slot name="footer" /></div>
  {/if}
</div>

<style>
  .items { display: flex; flex-direction: column; gap: var(--sx-s-2); min-width: 0; }

  ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }

  .sect { padding: var(--sx-s-3) var(--sx-s-3) var(--sx-s-1); }
  .tuck .sect { padding-inline: 0; text-align: center; overflow: hidden; }

  .it {
    display: flex;
    align-items: center;
    gap: var(--sx-s-3);
    width: 100%;
    min-height: var(--sx-s-10);
    padding: var(--sx-s-2) var(--sx-s-3);
    border: 0;
    border-radius: var(--sx-r-2);
    background: none;
    color: var(--sx-ink-2);
    font-size: var(--sx-t-sm);
    font-weight: var(--sx-w-medium);
    text-align: start;
    text-decoration: none;
    cursor: pointer;
    transition: background var(--sx-fast) var(--sx-ease), color var(--sx-fast) var(--sx-ease);
  }

  .it:hover:not(.dis) { background: var(--sx-accent-soft); color: var(--sx-ink); }

  /* Elegido: relleno persistente (accent-pick, ya medido en el arnés) + tinta
     plena + semibold + aria-current — el mismo escalón de dos pasos que
     SideRail, sin cantos. La CUARTA señal, la que SideRail no necesita porque
     no vive colapsado por defecto: el trazo del ícono se engrosa (2.3 en vez
     de 1.7), una diferencia de FORMA que sigue viéndose cuando la etiqueta
     está recortada. */
  .it.on {
    background: var(--sx-accent-pick);
    color: var(--sx-ink);
    font-weight: var(--sx-w-semi);
  }
  .it.on .ic svg { stroke-width: 2.3; }

  .it.dis { opacity: .45; cursor: not-allowed; }

  .ic { display: flex; align-items: center; justify-content: center; flex: none; width: 20px; height: 20px; }
  .ic svg { width: 20px; height: 20px; transition: stroke-width var(--sx-fast) var(--sx-ease); }
  .ini {
    display: flex; align-items: center; justify-content: center;
    width: 20px; height: 20px;
    border-radius: var(--sx-r-1);
    background: var(--sx-sunk);
    font-size: var(--sx-t-2xs);
    font-weight: var(--sx-w-semi);
    line-height: 1;
  }

  .lb { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .n {
    flex: none;
    font-size: var(--sx-t-2xs);
    font-weight: var(--sx-w-semi);
    color: var(--sx-ink-3);
    background: var(--sx-sunk);
    border-radius: var(--sx-r-pill);
    padding: 1px var(--sx-s-2);
  }
  .it.on .n { color: var(--sx-ink-2); background: var(--sx-surface); }

  /* THE COLLAPSE — identical mechanism to SideRail's, and it has to be: a
     person moving between the two levels should not learn a second way a
     label can hide. */
  .tuck .it { justify-content: center; padding-inline: 0; position: relative; }
  .tuck .lb {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip-path: inset(50%); white-space: nowrap; border: 0;
  }
  .tuck .n {
    position: absolute;
    inset-block-start: var(--sx-s-1);
    inset-inline-end: var(--sx-s-2);
    padding: 0 var(--sx-s-1);
    line-height: 1.4;
  }

  .head, .foot { padding: var(--sx-s-2) var(--sx-s-3); min-width: 0; }
  .foot { margin-top: auto; }

  .it:focus-visible {
    outline: 2px solid var(--sx-ink);
    outline-offset: -2px;
    border-radius: var(--sx-r-2);
  }

  @media (pointer: coarse) {
    .it { min-height: var(--sx-touch); }
  }

  @media (prefers-reduced-motion: reduce) {
    .it, .ic svg { transition: none; }
  }

  /* Repite la geometría forzada de `Sidebar.svelte` para el mismo rango
     (561–640px) que ese archivo fuerza en `.side`, y por la misma razón:
     `collapsed` es un punto de partida, no una promesa, así que el icon-only
     se impone acá también pase lo que pase con la prop. `:not(.phone)`: el
     cajón de teléfono nunca colapsa — ver la nota del prop arriba. */
  @media (max-width: 640px) {
    .items:not(.phone) .it { justify-content: center; padding-inline: 0; position: relative; }
    .items:not(.phone) .lb {
      position: absolute; width: 1px; height: 1px;
      padding: 0; margin: -1px; overflow: hidden;
      clip-path: inset(50%); white-space: nowrap; border: 0;
    }
    .items:not(.phone) .n {
      position: absolute;
      inset-block-start: var(--sx-s-1);
      inset-inline-end: var(--sx-s-2);
      padding: 0 var(--sx-s-1);
      line-height: 1.4;
    }
    .items:not(.phone) .sect { padding-inline: 0; text-align: center; overflow: hidden; }
  }
</style>
