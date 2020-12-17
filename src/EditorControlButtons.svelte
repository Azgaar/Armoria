<script>
  export let els, el, i;

  const removeCharge = () => els = els.filter((e, n) => n !== i);
  const copyCharge = () => els = [...els, JSON.parse(JSON.stringify(el))];
  const moveUp = () => [els[i], els[i+1]] = [els[i+1], els[i]];
  const moveDown = () => [els[i], els[i-1]] = [els[i-1], els[i]];
</script>

<b on:click={removeCharge} title="Remove charge">✖</b>
<b on:click={copyCharge} title="Copy charge">🗗</b>
{#if els.length > 1}
  {#if i}
    <b on:click={moveDown} title="Move charge down">🠗</b>
  {/if}
  {#if i+1 < els.length}
    <b on:click={moveUp} title="Move charge up">🠕</b>
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