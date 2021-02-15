<script>
  import EditorItem from './EditorItem.svelte';
  import {ordinaries} from "./../../data/dataModel";
  export let ordinary, line, t1, t, itemSize;

  const ordinariesList = Object.keys(ordinaries.lined).concat(Object.keys(ordinaries.straight));
  $: coas = ordinariesList.map(ordinary => new Object({ordinary, t1, ordinaries: [{ordinary, line, t}]}));
</script>

{#each coas as coa (coa)}
  <div class=item class:selected={ordinary === coa.ordinary} on:click={() => ordinary = coa.ordinary}>
    <EditorItem {coa} tip="Ordinary: {coa.ordinary}" {itemSize}/>
  </div>
{/each}