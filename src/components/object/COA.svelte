<script>
  import {shieldBox} from "data/shields";
  import {border, borderWidth, shield} from "data/stores";
  import Grid from "./../editor/Grid.svelte";
  import Positions from "./../editor/Positions.svelte";
  import Shield from "./Shield.svelte";
  export let coa,
    i,
    w = "100%",
    h = "100%";

  $: viewBox = shieldBox[$shield] || "0 0 200 200";
</script>

<svg
  id="coa{i}"
  class="coa"
  width={w}
  height={h}
  {viewBox}
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
>
  <Shield {coa} border={$border} borderWidth={$borderWidth} type={i} />
  {#if i === "Edit"}
    <Grid />
    <Positions />
  {/if}
</svg>
