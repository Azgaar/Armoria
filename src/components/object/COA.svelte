<script lang="ts">
  // @ts-check
  import {shieldBox} from "data/shields";
  import {border, borderWidth, shield} from "data/stores";
  import Grid from "./../editor/Grid.svelte";
  import Positions from "./../editor/Positions.svelte";
  import Shield from "./Shield.svelte";

  export let coa: unknown;
  export let i: string | number;
  export let width: string | number = "100%";
  export let height: string | number = "100%";

  const isEdit = i === "Edit";

  $: viewBox = shieldBox[$shield] || "0 0 200 200";
</script>

<svg
  id="coa{i}"
  class="coa"
  {width}
  {height}
  {viewBox}
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
>
  <Shield {coa} border={$border} borderWidth={$borderWidth} type={i} />
  {#if isEdit}
    <Grid />
    <Positions />
  {/if}
</svg>
