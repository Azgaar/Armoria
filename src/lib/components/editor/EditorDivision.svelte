<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import EditorItem from "./EditorItem.svelte";
  import {divisions} from "#lib/data/dataModel.js";
  let {
    division = $bindable(),
    t1,
    t2,
    line,
    shield
  }: {division: string; t1: string; t2: string; line: string; shield?: string} = $props();

  const divisionList = ["no"].concat(Object.keys(divisions.variants));
  let divisionsData = $derived(divisionList.map(division => ({t1, shield, division: {division, t: t2, line}})));

  const getTip = (division: string) => {
    const divisionName = $t(`divisions.${division}`);
    return `${$t("editor.division")}: ${divisionName}`;
  };

  const handleChange = (newDivision: string) => () => {
    division = newDivision;
  };
</script>

<div class="items">
  {#each divisionsData as coa (coa)}
    <div class="item" class:selected={division === coa.division.division} onclick={handleChange(coa.division.division)}>
      <EditorItem {coa} tip={getTip(coa.division.division)} />
    </div>
  {/each}
</div>
