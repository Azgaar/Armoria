<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import EditorItem from "./EditorItem.svelte";
  import {charges} from "data/dataModel";
  import {capitalize} from "scripts/utils";

  export let charge: string;
  export let type: string;
  export let category: string;
  export let t1: string;
  export let t2: string;
  export let size = null;
  export let sinister = null;
  export let reversed = null;
  export let division = false;

  let chargesData = [];
  let query: string;
  let queryOld: string;

  const categories = Object.keys(charges.types);
  const allCharges = categories.map(category => Object.keys(charges[category])).flat();
  const allChargesTranslated = allCharges.map(charge => $t(`charges.${charge}`));

  $: update(category, t1, t2, size, sinister, reversed);
  $: filterCharges(query);

  function update() {
    const chargeList = Object.keys(charges[category]);
    chargesData = chargeList.map(charge => new Object({charge, t1: getTincture(charge), charges: getCharge(charge)}));
  }

  function filterCharges(query: string) {
    if (!query && query !== queryOld) update();

    queryOld = query;
    if (!query) return;

    const regEx = new RegExp(query.replaceAll(" ", ""), "i");
    const results = allCharges.filter((charge, index) => regEx.test(allChargesTranslated[index]));
    chargesData = results.map(charge => new Object({charge, t1: getTincture(charge), charges: getCharge(charge)}));
  }

  function resetQuery() {
    query = "";
  }

  function getTincture(charge: string) {
    if (type === "semy") return `semy_of_${charge}-${t1}-${t2}-${size}`;
    return t1;
  }

  function getCharge(charge: string) {
    if (type === "semy") return [];
    return [{charge, t: t2, p: "e", size: 1.5, sinister, reversed}];
  }

  function getTip(charge: string) {
    const chargeName = $t(`charges.${charge}`);
    if (type === "semy") return `${$t("editor.semyOf")} ${chargeName}`;
    return `${$t("tinctures.charge")}: ${chargeName}`;
  }

  const handleChange = (newCharge: string) => () => {
    charge = newCharge;
  };
</script>

<span class:indented={division}>{$t("editor.category")}:</span>
<select bind:value={category} class:inactive={query} on:input={resetQuery}>
  {#each categories as category}
    <option value={category}>{$t(`categories.${category}`)}</option>
  {/each}
</select>

<span class:indented={true}>{$t("editor.search")}:</span>
<input bind:value={query} class:inactive={!query} />

<div class="items">
  {#each chargesData as coa (coa)}
    <div class="item" class:selected={charge === coa.charge} on:click={handleChange(coa.charge)}>
      <EditorItem {coa} tip={getTip(coa.charge)} />
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
