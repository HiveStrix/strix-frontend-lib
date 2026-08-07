<script>
  // The comparison grid. One column below 900px, because two 380px cells side
  // by side on a laptop is where a direction stops being legible and starts
  // being a thumbnail.
  export let min = '400px';
</script>

<div class="grid" style="--min:{min}"><slot /></div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(var(--min), 100%), 1fr));
    gap: 26px;
    align-items: start;
  }
</style>
