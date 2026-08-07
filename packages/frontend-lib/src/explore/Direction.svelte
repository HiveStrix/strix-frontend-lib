<script>
  // One direction's cell in the comparison grid.
  //
  // The frame around it is DELIBERATELY neutral — a fixed grey chrome that
  // belongs to the harness, not to any direction. If the frame took on the
  // direction's colours, a dark direction would get a dark frame and would look
  // more committed than the others for a reason that has nothing to do with the
  // design. Every cell gets the same chrome so the only thing being compared is
  // what's inside it.
  import { byId } from './directions.js';
  export let id;
  /** Let the specimen breathe on its own ground rather than inside a card. */
  export let flush = false;
  $: d = byId[id];
</script>

<section class="cell">
  <header>
    <span class="tag">{d.id}</span>
    <h3>{d.name}</h3>
    <p>{d.tagline}</p>
  </header>
  <div class="stage" class:flush data-d={id}>
    <div class="inner"><slot /></div>
  </div>
</section>

<style>
  .cell { display: flex; flex-direction: column; min-width: 0; }
  header {
    display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;
    padding: 0 0 8px;
  }
  .tag {
    font: 600 10px/1 ui-monospace, Menlo, monospace;
    letter-spacing: .08em;
    color: #fff; background: #14181a;
    padding: 4px 5px; border-radius: 3px;
  }
  h3 { margin: 0; font-size: 14px; font-weight: 620; letter-spacing: -.01em; color: #14181a; }
  p { margin: 0; font-size: 12px; color: #71777c; flex: 1 1 180px; min-width: 0; }
  .stage {
    flex: 1;
    border: 1px solid #dfe1e3;
    border-radius: 4px;
    overflow: hidden;
  }
  .inner { padding: 20px; }
  .flush .inner { padding: 0; }

  @media (prefers-color-scheme: dark) {
    h3 { color: #edeff0; }
    p { color: #8e9498; }
    .tag { background: #edeff0; color: #14181a; }
    .stage { border-color: #2c3134; }
  }
</style>
