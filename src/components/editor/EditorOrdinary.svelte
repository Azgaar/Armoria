<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import EditorItem from "./EditorItem.svelte";
  import {ordinaries} from "data/dataModel";

  export let ordinary: string;
  export let line: string;
  export let t1: string;
  export let t2: string;

  const ordinariesList = Object.keys(ordinaries.lined).concat(Object.keys(ordinaries.straight));
  $: coas = ordinariesList.map(ordinary => ({coa: {t1, ordinaries: [{ordinary, line, t: t2}]}, ordinaryName: ordinary}));

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
    <div class="item" class:selected={ordinary === ordinaryName} on:click={handleChange(ordinaryName)}>
      <EditorItem {coa} tip={getTip(ordinaryName)} />
    </div>
  {/each}
</div>
