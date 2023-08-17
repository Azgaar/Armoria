<script>
  import COA from "./../object/COA.svelte";
  import {history} from "data//stores";
  import {generate} from "scripts/generator";
  export let c, seed, coaSize;

  let coa = $history[c] || generate(seed || undefined); // on load

  function edit() {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has("noedit")) return;
    const URL = window.location.href.replace("view=1", "view=0");
    const win = window.open(URL, "_blank");
    win.focus();
  }
</script>

<div id="viewer" on:click={edit}>
  <COA {coa} i="View" width={coaSize} height={coaSize} />
</div>
