<script>
  import EditorItem from "./EditorItem.svelte";
  import {charges} from "data/dataModel";
  export let charge,
    type,
    category,
    t1,
    t2,
    size = null,
    sinister = null,
    reversed = null,
    division = false,
    itemSize;
  let coas = [],
    query,
    queryOld;

  const categories = Object.keys(charges.types);
  const allCharges = categories.map(category => Object.keys(charges[category])).flat();
  const cap = string => string.charAt(0).toUpperCase() + string.slice(1);

  $: update(category, t1, t2, size, sinister, reversed);
  $: showResults(query);

  function update() {
    const chargeList = Object.keys(charges[category]);
    coas = chargeList.map(c => new Object({c, t1: getTincture(c), charges: getCharge(c)}));
  }

  function showResults(query) {
    if (!query && query !== queryOld) update();
    queryOld = query;
    if (!query) return;

    const regEx = new RegExp(query.replaceAll(" ", ""), "i");
    const results = allCharges.filter(c => regEx.test(c));
    coas = results.map(c => new Object({c, t1: getTincture(c), charges: getCharge(c)}));
  }

  function getTincture(c) {
    if (type === "semy") return `semy_of_${c}-${t1}-${t2}-${size}`;
    return t1;
  }

  function getCharge(c) {
    if (type === "semy") return [];
    return [{charge: c, t: t2, p: "e", size: 1.5, sinister, reversed}];
  }

  function getTip(c) {
    if (type === "semy") return `Semy of ${c}`;
    return `Charge: ${c}`;
  }
</script>

{#if type === "semy"}
  <span>Charge:</span>
{:else}
  <span class:indented={division}>Category:</span>
{/if}
<select bind:value={category} class:inactive={query} on:input={() => (query = "")}>
  {#each categories as type}
    <option value={type}>{cap(type)}</option>
  {/each}
</select>

<span class:indented={true}>Search:</span>
<input bind:value={query} class:inactive={!query} />

<div>
  {#each coas as coa (coa)}
    <div class="item" class:selected={charge === coa.c} on:click={() => (charge = coa.c)}>
      <EditorItem {coa} tip={getTip(coa.c)} {itemSize} />
    </div>
  {/each}
</div>

<style>
  input {
    width: 10em;
  }

  .inactive {
    background-color: #ddd;
  }

  .indented {
    margin-left: 1em;
  }
</style>
