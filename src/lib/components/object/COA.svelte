<script lang="ts">
  // @ts-check
  import {DEFAULT_ZOOM} from "$lib/config/defaults";
  import {DEFAULT_SHIELD_BOX, shieldBox} from "$lib/data/shields";
  import {border, borderWidth, shield} from "$lib/data/stores";
  import Grid from "./../editor/Grid.svelte";
  import Positions from "./../editor/Positions.svelte";
  import Shield from "./Shield.svelte";
  import type {Coa} from "$lib/types/coa";

  export let coa: Coa;
  export let i: string;
  export let width: string | number = "100%";
  export let height: string | number = "100%";

  const isEdit = i === "Edit";

  function getViewBox(shield: string, zoom: number) {
    const box = shieldBox[shield] || DEFAULT_SHIELD_BOX;
    const [x0, y0, w0, h0] = box.split(" ");
    const w = Math.round((w0 * DEFAULT_ZOOM) / zoom);
    const h = Math.round((h0 * DEFAULT_ZOOM) / zoom);
    const x = x0 - w / 2 + 100;
    const y = y0 - h / 2 + 100;
    return `${x} ${y} ${w} ${h}`;
  }

  $: viewBox = getViewBox(coa.shield || $shield, coa.zoom || DEFAULT_ZOOM);
</script>

<svg
  id="coa{i}"
  class="coa"
  {width}
  {height}
  {viewBox}
  xmlns="http://www.w3.org/2000/svg"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
>
  <Shield {coa} border={$border} borderWidth={$borderWidth} type={i} />
  {#if isEdit}
    <Grid />
    <Positions shield={coa.shield || $shield} />
  {/if}
</svg>
