<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import EditorItem from "./EditorItem.svelte";
  import {lines} from "#lib/data/dataModel.js";

  let {
    line = $bindable(),
    division = null,
    ordinary = null,
    t1,
    t2,
    shield
  }: {line: string; division?: string | null; ordinary?: string | null; t1: string; t2: string; shield?: string} = $props();

  const lineList = Object.keys(lines.variants);

  let linesData = $derived(
    division
      ? lineList.map(line => ({coa: {t1, shield, division: {division, t: t2, line}}, newLine: line}))
      : lineList.map(line => ({coa: {t1, shield, ordinaries: [{ordinary: ordinary || "", t: t2, line}]}, newLine: line}))
  );

  const getTip = (line: string) => `${$t("editor.line")}: ${$t(`lines.${line}`)}`;

  const handleChange = (newLine: string) => () => {
    line = newLine;
  };
</script>

{$t("editor.line")}:
<div class="items">
  {#each linesData as { coa, newLine } (coa)}
    <div class="item" class:selected={line === newLine} onclick={handleChange(newLine)}>
      <EditorItem {coa} tip={getTip(newLine)} />
    </div>
  {/each}
</div>
