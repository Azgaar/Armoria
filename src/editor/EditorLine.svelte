<script>
  import EditorItem from './EditorItem.svelte';
  import {lines} from "../dataModel";
  export let line, division = null, ordinary = null, t1, t, itemSize;

  const lineList = Object.keys(lines);
  $: coas = division ? 
    lineList.map(line => new Object({line, t1, division: {division, t, line}})) :
    lineList.map(line => new Object({line, t1, ordinaries: [{ordinary, t, line}]})); 
  const getTip = l => division ? "Division line: " + l : "Ordinary line: " + l;
</script>

<div>Line:</div>
{#each coas as coa (coa)}
  <div class=item class:selected={line === coa.line} on:click={() => line = coa.line}>
    <EditorItem {coa} tip={getTip(coa.line)} {itemSize}/>
  </div>
{/each}