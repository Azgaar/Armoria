<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import EditorItem from "./EditorItem.svelte";
  import {DEFAULT_TINCTURES} from "#lib/config/defaults.ts";

  let {
    pattern = $bindable(),
    t1,
    t2,
    size,
    shield
  }: {pattern: string; t1: string; t2: string; size: string; shield?: string} = $props();

  const patterns = Object.keys(DEFAULT_TINCTURES.patterns).filter(pattern => pattern !== "semy");

  // clean unused patterns
  const usedPatterns = Array.from(
    document.querySelectorAll("[fill]"),
    elem => elem.getAttribute("fill")?.match(/url\(#(.+)\)/)?.[1]
  );
  document.querySelectorAll("#patterns pattern").forEach(function (elem) {
    if (!usedPatterns.includes(elem.getAttribute("id") || "")) elem.remove();
  });

  let patternsData = $derived(
    patterns.map(pattern => {
      let tincture = `${pattern}-${t1}-${t2}`;
      if (size !== "standard") tincture += `-${size}`;

      const tip = $t(`patterns.${pattern}`);
      return {coa: {pattern, shield, t1: tincture}, tip};
    })
  );

  const handleChange = (newPattern: string) => () => {
    pattern = newPattern;
  };
</script>

{$t("editor.pattern")}:
<div class="items">
  {#each patternsData as { coa, tip } (coa.pattern)}
    <div class="item" class:selected={pattern === coa.pattern} onclick={handleChange(coa.pattern)}>
      <EditorItem {coa} {tip} />
    </div>
  {/each}
</div>
