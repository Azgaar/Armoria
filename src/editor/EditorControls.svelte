<script>
  export let els, el, i;

  const remove = e => {
    els = els.filter((e, n) => n !== i);
    e.stopPropagation();
  }

  const copy = e => {
    els = [...els, JSON.parse(JSON.stringify(el))];
    e.stopPropagation();
  }

  const moveUp = e => {
    [els[i], els[i+1]] = [els[i+1], els[i]];
    e.stopPropagation();
  }

  const moveDown = e => {
    [els[i], els[i-1]] = [els[i-1], els[i]];
    e.stopPropagation();
  }
</script>

<span>
  <b on:click={copy} title="Copy">🗗</b>
  {#if els.length > 1}
    {#if i}
      <b on:click={moveDown} title="Move down">🠗</b>
    {/if}
    {#if i+1 < els.length}
      <b on:click={moveUp} title="Move up">🠕</b>
    {/if}
  {/if}
  <b on:click={remove} title="Remove">✖</b>
</span>

<style>
  b {
    padding: .1em;
    margin-top: -.1em;
  }

  b:active {
    transform: translateY(1px);
  }
</style>