<script lang="ts">
  import COA from "./../object/COA.svelte";
  import {history, tinctures} from "#lib/data/stores.ts";
  import {generate} from "#lib/scripts/generator.js";
  import {untrack} from "svelte";

  let {c, seed, coaSize}: {c: number; seed?: string; coaSize: number} = $props();

  // Viewing captures the initial artwork, even if gallery stores later change.
  const coa = untrack(() => $history[c] || generate(seed || undefined, $tinctures));

  function edit() {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has("noedit")) return;
    const URL = window.location.href.replace("view=1", "view=0");
    const win = window.open(URL, "_blank");
    win?.focus();
  }
</script>

<div id="viewer" onclick={edit}>
  <COA {coa} i="View" width={coaSize} height={coaSize} />
</div>
