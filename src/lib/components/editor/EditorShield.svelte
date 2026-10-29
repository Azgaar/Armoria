<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import EditorItem from "./EditorItem.svelte";
  import {shieldSets, shieldTypes} from "$lib/data/dataModel";
  import {shield as defaultShield} from "$lib/data/stores";

  export let shield: string | undefined = undefined;
  export let t1: string;

  let shieldsData: (import("$lib/types/coa").Coa & {shield: string})[] = [];
  let query: string;
  let queryOld: string;
  let type = getShieldType(shield || $defaultShield);

  const allShields = shieldTypes.map(type => Object.keys(shieldSets[type || "basic"])).flat();
  $: allShieldsTranslated = shieldTypes
    .map(type => Object.keys(shieldSets[type || "basic"]).map(shield => $t(`shield.${type}.${shield}`)))
    .flat();

  $: update({type, t1});
  $: filterShields(query);

  function update(preview = {type, t1}) {
    const shieldList = Object.keys(shieldSets[preview.type || "basic"]);
    shieldsData = shieldList.map(shield => ({shield, t1: preview.t1}));
  }

  function filterShields(query: string) {
    if (!query && query !== queryOld) update();

    queryOld = query;
    if (!query) return;

    const regEx = new RegExp(query.replaceAll(" ", ""), "i");
    const results = allShields.filter((_shield, index) => regEx.test(allShieldsTranslated[index]));
    shieldsData = results.map(shield => ({shield, t1}));
  }

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
<select bind:value={type} class:inactive={query} on:input={resetQuery}>
  {#each shieldTypes as type}
    <option value={type}>{$t(`shield.types.${type}`)}</option>
  {/each}
</select>

<span class:indented={true}>{$t("editor.search")}:</span>
<input bind:value={query} class:inactive={!query} />

<div class="items">
  {#each shieldsData as coa (coa)}
    <div class="item" class:selected={shield === coa.shield} on:click={() => (shield = coa.shield)}>
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
