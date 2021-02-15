<script>
  import Shield from './Shield.svelte';
  import Grid from './Grid.svelte';
  import Positions from './Positions.svelte';
  import {shield, border, borderWidth} from './stores';
  import {shieldBox} from './dataModel';
  export let coa, i, w, h;
  $: viewBox = shieldBox[$shield] || "0 0 200 200";
</script>

<svg id="coa{i}" class="coa" xmlns="http://www.w3.org/2000/svg" width={w} height={h} {viewBox}>
  <Shield {coa} {i} border={$border} borderWidth={$borderWidth} type={i}/>
  {#if i === "Edit"}
    <Grid/>
    <Positions/>
  {/if}
</svg>