<script>
  import Shield from './Shield.svelte';
  import Grid from './Grid.svelte';
  import Positions from './Positions.svelte';
  import {shield, border, borderWidth} from './stores';
  export let coa, i, w, h;

  const viewBox = {
    no: "0 0 200 200",
    heater: "0 10 200 200",
    oldFrench: "0 10 200 200",
    spanish: "0 10 200 200",
    french: "0 10 200 200",
    swiss: "0 10 200 200",
    wedged: "0 10 200 200",
    italian: "0 0 200 200",
    kite: "0 0 200 200",
    renaissance: "0 0 200 200",
    baroque: "0 10 200 200",
    polish: "0 0 200 200",
    german: "0 0 200 200",
    diamond: "0 0 200 200",
    round: "0 0 200 200",
    vesicaPiscis: "0 0 200 200",
    square: "0 0 200 200",
    flag: "0 0 200 200",
    pennon: "2.5 0 200 200",
    guidon: "2.5 0 200 200",
    banner: "0 10 200 200",
    dovetail: "0 10 200 200",
    gonfalon: "0 10 200 200",
    pennant: "0 0 200 200"
  }
</script>

<svg id="coa{i}" class="coa" xmlns="http://www.w3.org/2000/svg" width={w} height={h} viewBox={viewBox[coa.shield || $shield]} on:click={() => console.log(coa)}>
  <Shield {coa} {i} border={$border} borderWidth={$borderWidth} type={i}/>
  {#if i === "Edit"}
    <Grid/>
    <Positions/>
  {/if}
</svg>