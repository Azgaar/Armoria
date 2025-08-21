<script lang="ts">
  // @ts-check
  import {t, dictionary, locale} from "svelte-i18n";
  import EditorItem from "./EditorItem.svelte";
  import {charges} from "data/dataModel";
  import {uploaded} from "data/stores";
  import {removeCharge} from "scripts/getters";
  import {tooltip} from "scripts/tooltip";

  export let charge: string;
  export let type: string;
  export let category: string;
  export let t1: string;
  export let t2: string;
  export let t3: string | undefined;
  export let t4: string | undefined;
  export let size = null;
  export let sinister = null;
  export let reversed = null;
  export let division = false;
  export let shield: string = undefined;

  let chargesData = [];
  let query: string;
  let queryOld: string;

  const categories = Object.keys(charges.types);
  const allCharges = categories.map(category => Object.keys(charges[category])).flat();
  $: allChargesTranslated = allCharges.map(charge => $t(`charges.${charge}`));

  // @ts-ignore
  $: update(category, t1, t2, t3, t4, size, sinister, reversed);
  $: filterCharges(query);

  function update() {
    const chargeList = Object.keys(charges[category]);
    chargesData = chargeList.map(charge => ({charge, shield, t1: getTincture(charge), charges: getCharge(charge)}));
  }

  function filterCharges(query: string) {
    if (!query && query !== queryOld) update();

    queryOld = query;
    if (!query) return;

    const regEx = new RegExp(query.replaceAll(" ", ""), "i");
    const results = allCharges.filter((_charge, index) => regEx.test(allChargesTranslated[index]));
    chargesData = results.map(charge => ({charge, shield, t1: getTincture(charge), charges: getCharge(charge)}));
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
    return [{charge, t: t2, t2: t3, t3: t4, p: "e", size: 1.5, sinister, reversed}];
  }

  const translateSafely = (group: string, key: string) => {
    const isInDictionary = $dictionary?.[$locale]?.[group]?.[key];
    return isInDictionary ? $t(`${group}.${key}`) : key;
  };

  function getTip(charge: string) {
    const chargeName = translateSafely("charges", charge);
    if (type === "semy") return `${$t("editor.semyOf")} ${chargeName}`;
    return `${$t("tinctures.charge")}: ${chargeName}`;
  }

  function removeUploaded(charge: string) {
    delete charges.data[charge];
    delete charges[$uploaded[charge].category][charge];
    update();
    delete $uploaded[charge];
    localStorage.setItem("uploaded", JSON.stringify($uploaded));
    removeCharge(charge);
  }
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
    <div class="wrapper">
      <div class="item" class:selected={charge === coa.charge} on:click={() => (charge = coa.charge)}>
        <EditorItem {coa} tip={getTip(coa.charge)} />
      </div>
      {#if $uploaded[coa.charge]}
      <div class="controls">
        <svg class="remove" on:click={() => removeUploaded(coa.charge)} data-tooltip={$t("tooltip.removeUploaded")} use:tooltip>
          <use href="#remove-icon" />
        </svg>
      </div>
      {/if}
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

  .remove {
    top: 0.8em;
    right: 0.8em;
  }
</style>
