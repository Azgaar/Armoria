<script lang="ts">
  // @ts-check
  import {DEFAULT_ZOOM} from "config/defaults";
  import {shieldBox} from "data/shields";
  import {border, borderWidth, shield, zoom} from "data/stores";
  import Grid from "./../editor/Grid.svelte";
  import Positions from "./../editor/Positions.svelte";
  import Shield from "./Shield.svelte";

  export let coa: unknown;
  export let i: string | number;
  export let width: string | number = "100%";
  export let height: string | number = "100%";

  const isEdit = i === "Edit";

  function getViewBox() {
    const box = shieldBox[$shield] || "0 0 200 200";
    let [x, y, w, h] = box.split(" ");
    w = Math.round(w * DEFAULT_ZOOM / $zoom);
    h = Math.round(h * DEFAULT_ZOOM / $zoom);
    x = x - w/2 + 100;
    y = y - h/2 + 100;
    return `${x} ${y} ${w} ${h}`;
  }

  $: viewBox = getViewBox($shield, $zoom);
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
