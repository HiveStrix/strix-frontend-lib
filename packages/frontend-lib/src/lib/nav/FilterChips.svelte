<script>
  // FILTER CHIPS — narrow the set without leaving the screen.
  //
  // ─────────────────────────────────────────────────────────────────────────
  // THE RULE THIS COMPONENT EXISTS TO ENFORCE
  //
  //   THE COUNTS ARE COMPUTED OVER THE WHOLE SET, NEVER OVER THE FILTERED VIEW.
  //
  // A chip whose number changes when you press it cannot be used to compare —
  // and comparing is the entire reason the numbers are there. «Vencidos 12 ·
  // Por vencer 5 · Al día 41» is a picture of the fleet. Press «Vencidos» and,
  // if the counts are derived from the filtered rows, it becomes «Vencidos 12»
  // and nothing else: the picture is gone, and worse, it was replaced by a
  // picture that looks just as authoritative.
  //
  // So the counts come in as data, computed upstream, off the unfiltered
  // collection:
  //
  //   $: options = ESTADOS.map((s) => ({
  //        ...s,
  //        count: orders.filter(s.of).length      // ← orders, not `rows`
  //      }));
  //
  // Note the `$:`. A legacy reactive statement tracks only the names written
  // inside it, so a plain `const` helper closing over `orders` would never
  // recompute and the chips would show yesterday's tally forever. This has
  // shipped as a bug in this ecosystem more than once.
  // ─────────────────────────────────────────────────────────────────────────
  //
  //   <FilterChips
  //     label="Filtrar por estado"
  //     {options}
  //     total={orders.length}
  //     bind:value={estado}
  //     on:change={(e) => (estado = e.detail.value)} />
  //
  // WHEN NOT TO USE IT
  //
  //   · More than about eight chips. A row that wraps to three lines is a menu
  //     with extra steps; that is a select, and a select does not lie about
  //     being scannable.
  //   · Values that are not a small closed set — a customer, a technician, a
  //     date. Chips are for the four or five buckets somebody already thinks in.
  //   · As navigation. A chip narrows a list in place. If pressing it should
  //     change the screen, you wanted Tabs.
  //
  // A CHIP WITH A ZERO IS NOT SHOWN. A state nobody has produced offers nothing
  // to press and only makes the row longer; `showEmpty` puts them back for the
  // rare case where the absence itself is the news.
  //
  // The chips are Pills, so a filter over semantic states carries the tone AND
  // its mark AND its word, and somebody who cannot separate green from amber
  // still reads the row. A filter over plain groups (familia, ubicación) has no
  // state to carry, so it carries no mark — which is exactly what Pill's
  // `mark={false}` is for.
  import { createEventDispatcher } from 'svelte';
  import Pill from '../Pill.svelte';

  /** [{ key, label, count, tone? }] — count over the WHOLE set. See above. */
  export let options = [];
  /** Selected key, or an array of keys when `multiple`. Bindable. */
  export let value = null;
  /** Several buckets at once. The counts still never overlap the view. */
  export let multiple = false;
  /** Names the group. «Filtrar por estado», «Filtrar por familia». */
  export let label = 'Filtrar';
  /** The size of the whole set, for the «Todas» chip. Pass it — see `allCount`. */
  export let total = null;
  /** The word for «everything». «Todas» for máquinas, «Todos» for equipos. */
  export let allLabel = 'Todas';
  /** Drop the «Todas» chip when the surface clears the filter some other way. */
  export let showAll = true;
  /** Keep chips whose count is 0. Only when the zero is the point. */
  export let showEmpty = false;
  /** sm | md — sm for a chip row inside a toolbar. */
  export let size = 'md';

  const dispatch = createEventDispatcher();

  $: visible = options.filter((o) => showEmpty || o.count == null || o.count > 0);

  // Summing is right only when the options PARTITION the set: every row in
  // exactly one bucket. The moment they overlap (multiple), or some rows belong
  // to no bucket at all, the sum is a different number from the truth — so pass
  // `total` and the component will not have to guess.
  $: allCount = total ?? options.reduce((n, o) => n + (o.count ?? 0), 0);

  $: picked = multiple ? (Array.isArray(value) ? value : []) : value;
  // Reactive, not `const`: `picked` and `multiple` have to be in the dependency
  // list of every statement that calls this, or the pressed state freezes.
  $: isOn = (k) => (multiple ? picked.includes(k) : picked === k);
  $: none = multiple ? picked.length === 0 : picked == null;

  // A dimension whose selected bucket disappeared (the data changed under it)
  // must not leave the row showing a filter that no longer exists.
  $: if (!multiple && value != null && !visible.some((o) => o.key === value)) value = null;

  function toggle(key) {
    if (multiple) {
      value = picked.includes(key) ? picked.filter((k) => k !== key) : [...picked, key];
    } else {
      // Pressing the pressed chip clears it. The chip is the on-switch and the
      // off-switch, so nobody has to hunt for «quitar filtro».
      value = value === key ? null : key;
    }
    dispatch('change', { value });
  }

  function clear() {
    if (none) return;
    value = multiple ? [] : null;
    dispatch('change', { value });
    dispatch('clear');
  }

  // There used to be a `use:typed` action here that walked the rendered chips
  // and stamped `type="button"` on each one, because Pill rendered a bare
  // <button> and a chip press inside a <form> submitted it. Pill now declares
  // the attribute itself, which is where it always belonged — a component that
  // repairs another component from the outside is a seam, and the seam moves
  // every time somebody wraps a Pill in something new.
</script>

{#if visible.length}
  <div class="chips {size}" role="group" aria-label={label}>
    {#if showAll}
      <Pill tone="neutral" size={size === 'sm' ? 'sm' : 'md'} mark={false} pressed={none} on:click={clear}>
        {allLabel}<span class="c sx-num">{allCount}</span>
      </Pill>
    {/if}

    {#each visible as o (o.key)}
      <Pill
        tone={o.tone ?? 'neutral'}
        size={size === 'sm' ? 'sm' : 'md'}
        mark={!!o.tone}
        pressed={isOn(o.key)}
        on:click={() => toggle(o.key)}
      >
        {o.label}{#if o.count != null}<span class="c sx-num">{o.count}</span>{/if}
      </Pill>
    {/each}
  </div>
{/if}

<style>
  .chips {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--sx-s-2);
    min-width: 0;
  }
  .sm { gap: var(--sx-s-1); }

  /* The count is dimmer than the label because the label is what you aim at and
     the number is what you read once you have. It stays tabular so the column
     of figures down a wrapped row still lines up. */
  .c {
    margin-inline-start: var(--sx-s-2);
    font-weight: var(--sx-w-medium);
    opacity: .72;
  }
</style>
