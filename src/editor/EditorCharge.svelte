<script>
  import MenuItem from '../MenuItem.svelte';
  import {charges} from "../dataModel";
  export let charge, type, category, t1, t2, size = null, sinister = null, reversed = null, itemSize;
  let coas;
  $: update(category, t1, t2, size, sinister, reversed);

  function update() {
    const chargeList = Object.keys(charges[category]);
    coas = chargeList.map(c => new Object({c, t1: getTincture(c), charges: getCharge(c)}));
  }

  function getTincture(c) {
    if (type === "semy") return `semy_of_${c}-${t1}-${t2}-${size}`;
    return t1;
  }

  function getCharge(c) {
    if (type === "semy") return [];
    return [{charge:c, t: t2, p: "e", size: 1.5, sinister, reversed}];
  }

  function getTip(c) {
    if (type === "semy") return `Semy of ${c}`;
    return `Charge: ${c}`;
  }
</script>

<div>
  {#each coas as coa (coa)}
    <div class=item class:selected={charge === coa.c} on:click={() => charge = coa.c}>
      <MenuItem {coa} tip={getTip(coa.c)} {itemSize}/>
    </div>
  {/each}
</div>