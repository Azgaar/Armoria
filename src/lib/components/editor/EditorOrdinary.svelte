<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import EditorItem from "./EditorItem.svelte";
  import {ordinaries} from "#lib/data/dataModel.js";

  let {
    ordinary = $bindable(),
    line,
    t1,
    t2,
    shield
  }: {ordinary: string; line: string; t1: string; t2: string; shield?: string} = $props();

  const ordinariesList = Object.keys(ordinaries.lined).concat(Object.keys(ordinaries.straight));
  let coas = $derived(
    ordinariesList.map(ordinary => ({coa: {t1, shield, ordinaries: [{ordinary, line, t: t2}]}, ordinaryName: ordinary}))
  );

  const getTip = (ordinary: string) => {
    const ordinaryName = $t(`ordinaries.${ordinary}`);
    return `${$t("editor.ordinary")}: ${ordinaryName}`;
  };

  const handleChange = (newOrdinary: string) => () => {
    ordinary = newOrdinary;
  };
</script>

<div class="items">
  {#each coas as { coa, ordinaryName } (coa)}
    <div class="item" class:selected={ordinary === ordinaryName} onclick={handleChange(ordinaryName)}>
      <EditorItem {coa} tip={getTip(ordinaryName)} />
    </div>
  {/each}
</div>
