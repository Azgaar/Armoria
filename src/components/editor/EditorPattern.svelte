<script>
  import EditorItem from './EditorItem.svelte';
  import {defaultTinctures} from "./../../data/dataModel";
  export let pattern, t1, t2, size, itemSize;
  const patterns = Object.keys(defaultTinctures.patterns).filter(pattern => pattern !== "semy");

  // clean group
  document.getElementById("patterns").innerHTML = "";

  $: coas = patterns.map(pattern => {
    let tincture = `${pattern}-${t1}-${t2}`;
    if (size !== "standard") tincture += `-${size}`;
    return {pattern, t1: tincture};
  });
</script>

<div>Pattern:</div>
{#each coas as coa}
  <div class=item class:selected={pattern === coa.pattern} on:click={() => pattern = coa.pattern}>
    <EditorItem {coa} tip={coa.pattern} {itemSize}/>
  </div>
{/each}