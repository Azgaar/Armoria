<script>
  import EditorItem from "./EditorItem.svelte";
  import {tinctures} from "@/data/stores";
  export let t1, itemSize;

  const coas = ["metals", "colours", "stains"]
    .map(type => {
      return Object.keys($tinctures[type]).map(t => {
        return {t1: t, tip: `${type.slice(0, -1)}: ${t}`};
      });
    })
    .flat();
</script>

<div>Tincture:</div>
{#each coas as coa}
  <div class="item" class:selected={t1 === coa.t1} on:click={() => (t1 = coa.t1)}>
    <EditorItem {coa} tip={coa.tip} {itemSize} />
  </div>
{/each}
