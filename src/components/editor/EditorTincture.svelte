<script lang="ts">
  // @ts-check
  import {t, dictionary, locale} from "svelte-i18n";
  import EditorItem from "./EditorItem.svelte";
  import {tinctures} from "data/stores";

  export let t1: string;
  export let itemSize: number;

  const tincturesData = ["metals", "colours", "stains"]
    .map(type =>
      Object.keys($tinctures[type]).map(tincture => {
        const tinctureName = $dictionary[$locale]?.tinctures?.[tincture] ? $t(`tinctures.${tincture}`) : tincture;
        const typeName = $t(`editor.${type.slice(0, -1)}`);
        return {coa: {t1: tincture}, tip: `${typeName}: ${tinctureName}`};
      })
    )
    .flat();

  const handleChange = (newTincture: string) => () => {
    t1 = newTincture;
  };
</script>

{$t("editor.tincture")}:
<div class="items">
  {#each tincturesData as { coa, tip }}
    <div class="item" class:selected={t1 === coa.t1} on:click={handleChange(coa.t1)}>
      <EditorItem {coa} {tip} {itemSize} />
    </div>
  {/each}
</div>
