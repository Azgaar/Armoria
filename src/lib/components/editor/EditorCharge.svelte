<script lang="ts">
  import {settingsStorage} from "#lib/data/storage.ts";
  // @ts-check
  import {t, dictionary, locale} from "svelte-i18n";
  import EditorItem from "./EditorItem.svelte";
  import {charges, chargeSets} from "#lib/data/dataModel.js";
  import {unregisterCharge} from "#lib/data/charges.js";
  import {uploaded} from "#lib/data/stores.ts";
  import {removeCharge} from "#lib/scripts/getters.js";
  import {tooltip} from "#lib/scripts/tooltip.ts";

  let {
    charge = $bindable(),
    type,
    category = $bindable(),
    t1,
    t2,
    t3,
    t4,
    sinister = false,
    reversed = false,
    division = false,
    shield
  }: {
    charge: string;
    type: string;
    category: string;
    t1: string;
    t2: string;
    t3?: string;
    t4?: string;
    size?: string | null;
    sinister?: boolean;
    reversed?: boolean;
    division?: boolean;
    shield?: string;
  } = $props();

  let query = $state("");
  let categories = $derived([...new Set([...Object.keys(charges.types), ...Object.values($uploaded).map(c => c.category)])]);
  let chargeLists = $derived(Object.fromEntries(categories.map(category => [category, Object.keys(chargeSets[category])])));
  let allCharges = $derived(Object.values(chargeLists).flat());
  let allChargesTranslated = $derived(allCharges.map(charge => $t(`charges.${charge}`, {default: charge})));
  let chargesData = $derived.by(() => {
    const regEx = query ? new RegExp(query.replaceAll(" ", ""), "i") : null;
    const results = regEx
      ? allCharges.filter((_charge, index) => regEx.test(allChargesTranslated[index]))
      : chargeLists[category];
    return results.map(charge => ({charge, shield, t1, charges: getCharge(charge)}));
  });

  function resetQuery() {
    query = "";
  }

  function getCharge(charge: string) {
    return [{charge, t: t2, t2: t3, t3: t4, p: "e", size: 1.5, sinister, reversed}];
  }

  const translateSafely = (group: string, key: string) => {
    const messages = $dictionary[$locale || ""]?.[group];
    const isInDictionary = messages && typeof messages === "object" && !Array.isArray(messages) && key in messages;
    return isInDictionary ? $t(`${group}.${key}`) : key;
  };

  function getTip(charge: string) {
    const chargeName = translateSafely("charges", charge);
    if (type === "semy") return `${$t("editor.semyOf")} ${chargeName}`;
    return `${$t("tinctures.charge")}: ${chargeName}`;
  }

  function removeUploaded(charge: string) {
    delete charges.data[charge];
    unregisterCharge(charge, $uploaded[charge].category);
    const remaining = {...$uploaded};
    delete remaining[charge];
    $uploaded = remaining;
    settingsStorage.setItem("uploaded", JSON.stringify(remaining));
    removeCharge(charge);
  }
</script>

<span class:indented={division}>{$t("editor.category")}:</span>
<select bind:value={category} class:inactive={query} oninput={resetQuery}>
  {#each categories as category (category)}
    <option value={category}>{$t(`categories.${category}`)}</option>
  {/each}
</select>

<span class:indented={true}>{$t("editor.search")}:</span>
<input bind:value={query} class:inactive={!query} />

<div class="items">
  {#each chargesData as coa (coa)}
    <div class="wrapper">
      <div class="item" class:selected={charge === coa.charge} onclick={() => (charge = coa.charge)}>
        <EditorItem {coa} tip={getTip(coa.charge)} />
      </div>
      {#if $uploaded[coa.charge]}
        <div class="controls">
          <svg class="remove" onclick={() => removeUploaded(coa.charge)} data-tooltip={$t("tooltip.removeUploaded")} use:tooltip>
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
