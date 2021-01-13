<script>
  import Shield from './Shield.svelte';
  import Grid from './Grid.svelte';
  import Positions from './Positions.svelte';
  import {shield, border, borderWidth} from './stores';
  import {shieldBox} from './dataModel';
  export let coa, i, w, h;
  $: viewBox = shieldBox[coa.shield || $shield] || "0 0 200 200";

  function logToConsole() {
    console.log(JSON.stringify(coa).replaceAll("#", "%23"));
  }
</script>

<svg id="coa{i}" class="coa" xmlns="http://www.w3.org/2000/svg" width={w} height={h} {viewBox} on:click={logToConsole}>
  <Shield {coa} {i} border={$border} borderWidth={$borderWidth} type={i}/>
  {#if i === "Edit"}
    <Grid/>
    <Positions/>
  {/if}
</svg>