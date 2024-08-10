<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import EditorItem from "./EditorItem.svelte";
  import {DEFAULT_TINCTURES} from "config/defaults";
  import {addShieldPatterns} from "scripts/getters";

  export let pattern: string;
  export let t1: string;
  export let t2: string;
  export let size: string;
  export let coa;

  const patterns = Object.keys(DEFAULT_TINCTURES.patterns).filter(pattern => pattern !== "semy");

  // clean group
  document.getElementById("patterns").innerHTML = "";
  addShieldPatterns(coa);

  $: patternsData = patterns.map(pattern => {
    let tincture = `${pattern}-${t1}-${t2}`;
    if (size !== "standard") tincture += `-${size}`;

    const tip = $t(`patterns.${pattern}`);
    return {coa: {pattern, t1: tincture}, tip};
  });

  const handleChange = (newPattern: string) => () => {
    pattern = newPattern;
  };
</script>

{$t("editor.pattern")}:
<div class="items">
  {#each patternsData as { coa, tip }}
    <div class="item" class:selected={pattern === coa.pattern} on:click={handleChange(coa.pattern)}>
      <EditorItem {coa} {tip} />
    </div>
  {/each}
</div>
