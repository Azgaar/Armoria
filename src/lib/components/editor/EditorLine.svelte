<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import EditorItem from "./EditorItem.svelte";
  import {lines} from "$lib/data/dataModel";

  export let line: string;
  export let division: string | null = null;
  export let ordinary: string | null = null;
  export let t1: string;
  export let t2: string;
  export let shield: string | undefined = undefined;

  const lineList = Object.keys(lines.variants);

  $: linesData = division
    ? lineList.map(line => ({coa: {t1, shield, division: {division, t: t2, line}}, newLine: line}))
    : lineList.map(line => ({coa: {t1, shield, ordinaries: [{ordinary, t: t2, line}]}, newLine: line}));

  const getTip = (line: string) => `${$t("editor.line")}: ${$t(`lines.${line}`)}`;

  const handleChange = (newLine: string) => () => {
    line = newLine;
  };
</script>

{$t("editor.line")}:
<div class="items">
  {#each linesData as { coa, newLine } (coa)}
    <div class="item" class:selected={line === newLine} on:click={handleChange(newLine)}>
      <EditorItem {coa} tip={getTip(newLine)} />
    </div>
  {/each}
</div>
