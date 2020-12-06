<script>
  import MenuItem from './MenuItem.svelte';
  export let t1, itemSize;
  const tinctures = ["argent", "or", "gules", "sable", "azure", "vert", "purpure"].map(t => new Object({t1: t}));
  const cap = string => string.charAt(0).toUpperCase() + string.slice(1);
</script>

<div>Tincture:</div>
{#each tinctures as coa}
  <div class=item class:selected={t1 === coa.t1} on:click={() => t1 = coa.t1}>
    <MenuItem {coa} title={cap(coa.t1)} {itemSize}/>
  </div>
{/each}