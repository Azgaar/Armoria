<script lang="ts">
  // @ts-check
  import {untrack} from "svelte";
  import {t} from "svelte-i18n";
  import EditorItem from "./EditorItem.svelte";
  import {shieldSets, shieldTypes} from "#lib/data/dataModel.js";
  import {shield as defaultShield} from "#lib/data/stores.ts";

  let {shield = $bindable(), t1}: {shield?: string; t1: string} = $props();

  let query = $state("");
  // Keep the category selected when this panel opens; choosing a result does not reset it.
  let type = $state(untrack(() => getShieldType(shield || $defaultShield)));
  const allShields = shieldTypes.flatMap(type => Object.keys(shieldSets[type || "basic"]));
  let allShieldsTranslated = $derived(
    shieldTypes.flatMap(type => Object.keys(shieldSets[type || "basic"]).map(shield => $t(`shield.${type}.${shield}`)))
  );
  let shieldsData = $derived.by(() => {
    const regEx = query ? new RegExp(query.replaceAll(" ", ""), "i") : null;
    const results = regEx
      ? allShields.filter((_shield, index) => regEx.test(allShieldsTranslated[index]))
      : Object.keys(shieldSets[type || "basic"]);
    return results.map(shield => ({shield, t1}));
  });

  function resetQuery() {
    query = "";
  }

  function getShieldType(name: string) {
    return shieldTypes.find(type => shieldSets[type || "basic"][name] !== undefined);
  }

  function getTip(name: string) {
    const type = getShieldType(name);
    const shieldName = $t(`shield.${type}.${name}`);
    return `${$t("editor.shield")}: ${shieldName}`;
  }
</script>

<span class:indented={true}>{$t("editor.category")}:</span>
<select bind:value={type} class:inactive={query} oninput={resetQuery}>
  {#each shieldTypes as type (type)}
    <option value={type}>{$t(`shield.types.${type}`)}</option>
  {/each}
</select>

<span class:indented={true}>{$t("editor.search")}:</span>
<input bind:value={query} class:inactive={!query} />

<div class="items">
  {#each shieldsData as coa (coa)}
    <div class="item" class:selected={shield === coa.shield} onclick={() => (shield = coa.shield)}>
      <EditorItem {coa} tip={getTip(coa.shield)} />
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
