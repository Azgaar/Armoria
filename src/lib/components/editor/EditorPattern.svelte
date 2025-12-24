<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import EditorItem from "./EditorItem.svelte";
  import {DEFAULT_TINCTURES} from "$lib/config/defaults";

  export let pattern: string;
  export let t1: string;
  export let t2: string;
  export let size: string;
  export let shield: string = undefined;

  const patterns = Object.keys(DEFAULT_TINCTURES.patterns).filter(pattern => pattern !== "semy");

  // clean unused patterns
  const usedPatterns = new Set();
  document.querySelectorAll("[fill]").forEach(function(elem) {
    const fill = elem.getAttribute("fill");
    const match = fill.match(/url\(#(.+)\)/);
    if (match) usedPatterns.add(match[1]);
  });
  document.querySelectorAll("#patterns pattern").forEach(function(elem) {
    if (!usedPatterns.has(elem.getAttribute("id"))) elem.remove();
  });

  $: patternsData = patterns.map(pattern => {
    let tincture = `${pattern}-${t1}-${t2}`;
    if (size !== "standard") tincture += `-${size}`;

    const tip = $t(`patterns.${pattern}`);
    return {coa: {pattern, shield, t1: tincture}, tip};
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
