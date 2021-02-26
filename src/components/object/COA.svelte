<script>
  import Shield from './Shield.svelte';
  import Grid from './../editor/Grid.svelte';
  import Positions from './../editor/Positions.svelte';
  import {shield, border, borderWidth} from './../../data/stores';
  import {shieldBox} from './../../data/shields';
  export let coa, i, w, h;
  $: viewBox = shieldBox[$shield] || "0 0 200 200";
</script>

<svg id="coa{i}" class="coa" width={w} height={h} {viewBox} xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <Shield {coa} border={$border} borderWidth={$borderWidth} type={i}/>
  {#if i === "Edit"}
    <Grid/>
    <Positions/>
  {/if}
</svg>