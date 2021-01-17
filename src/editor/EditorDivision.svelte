<script>
  import MenuItem from '../MenuItem.svelte';
  import {divisions} from "../dataModel";
  export let division, t1, t, line, itemSize;

  const divisionList = ["no"].concat(Object.keys(divisions.variants));
  $: coas = divisionList.map(division => new Object({d: division, t1, division: {division, t, line}}));
</script>

{#each coas as coa (coa)}
  <div class=item class:selected={division === coa.d} on:click={() => division = coa.d}>
    <MenuItem {coa} tip={"Division: " + coa.d} {itemSize}/>
  </div>
{/each}