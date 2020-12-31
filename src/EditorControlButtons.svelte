<script>
  export let els, el, i;

  const remove = () => els = els.filter((e, n) => n !== i);
  const copy = () => els = [...els, JSON.parse(JSON.stringify(el))];
  const moveUp = () => [els[i], els[i+1]] = [els[i+1], els[i]];
  const moveDown = () => [els[i], els[i-1]] = [els[i-1], els[i]];
</script>

<b on:click={remove} title="Remove">✖</b>
<b on:click={copy} title="Copy">🗗</b>
{#if els.length > 1}
  {#if i}
    <b on:click={moveDown} title="Move down">🠗</b>
  {/if}
  {#if i+1 < els.length}
    <b on:click={moveUp} title="Move up">🠕</b>
  {/if}
{/if}

<style>
  b {
    float: right;
    padding: .1em;
    margin: .2em 0 0 .5em;
    cursor: pointer;
  }

  b:active {
    transform: translateY(1px);
  }
</style>