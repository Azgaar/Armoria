<script>
  import MenuItem from '../MenuItem.svelte';
  export let pattern, t1, t2, size, itemSize;
  const patterns = ["vair", "vairInPale", "vairEnPointe", "ermine", "chequy", "lozengy", "fusily", "pally", "barry", "gemelles", "bendy", "bendySinister", "palyBendy", "pappellony", "masoned", "fretty"];
  $: coas = patterns.map(p => new Object({pattern: p, t1: `${p}-${t1}-${t2}-${size}`}));
</script>

<div>Pattern:</div>
{#each coas as coa}
  <div class=item class:selected={pattern === coa.pattern} on:click={() => pattern = coa.pattern}>
    <MenuItem {coa} tip={coa.pattern} {itemSize}/>
  </div>
{/each}