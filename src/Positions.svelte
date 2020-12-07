<script>
  import {state, shield} from "./stores";
  import {shields} from "./dataModel.js";
  import {fade} from 'svelte/transition';

  // on shield change
  $: points = shields[$shield] ? Object.entries(shields[$shield]) : Object.entries(shields.spanish);

  function getClass(p) {
    if ("abcdefghi".includes(p)) return "green";
    if ("ABCDEFGHIJK".includes(p)) return "red";
    return "blue";
  }
</script>

{#if $state.positions}
  <g id=positions transform="translate(100, 100)" in:fade>
    {#each points as p}
      <g id={p[0]} class={getClass(p[0])}>
        <circle cx={p[1][0]} cy={p[1][1]} r=3 class:active={$state.positions.includes(p[0])}/>
        <text x={p[1][0]} y={p[1][1]} class:active={$state.positions.includes(p[0])}>{p[0]}</text>
      </g>
    {/each}
  </g>
{/if}

<style>
  circle {
    opacity: .5;
  }

  circle.active {
    opacity: .9;
  }

  text {
    font-family: 'Lato', 'Helvetica Neue', Arial, Helvetica, sans-serif;
    text-anchor: middle;
    font-size: 5px;
    fill: #ddd;
    dominant-baseline: central;
  }

  text.active {
    fill: #fff;
  }

  .green {
    fill: rgb(8, 57, 8);
  }

  .blue {
    fill: rgb(8, 8, 57);
  }

  .red {
    fill: rgb(57, 8, 8);
  }
</style>