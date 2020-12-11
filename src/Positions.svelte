<script>
  import {state, shield, grid} from "./stores";
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
  <g transform={$state.transform || null} transform-origin=center in:fade>
    <defs>
      <pattern id=grid width={$grid} height={$grid} patternUnits="userSpaceOnUse">
        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#000" opacity=.3 stroke-width=.5/>
      </pattern>
    </defs>
    <rect x=-200 y=-200 width=400 height=400 fill="url(#grid)"/>

    <g id=positions transform="translate(100, 100)">
      {#each points as p}
        <g id={p[0]} class={getClass(p[0])}>
          <circle cx={p[1][0]} cy={p[1][1]} r=3 class:active={$state.positions.includes(p[0])}/>
          <text x={p[1][0]} y={p[1][1]} class:active={$state.positions.includes(p[0])}>{p[0]}</text>
        </g>
      {/each}
    </g>
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
    font-family: monospace;
    text-anchor: middle;
    font-size: 5px;
    fill: #ddd;
    dominant-baseline: central;
  }

  text.active {
    fill: #fff;
  }

  .green {
    fill: rgb(12, 80, 12);
  }

  .blue {
    fill: rgb(12, 12, 80);
  }

  .red {
    fill: rgb(80, 12, 12);
  }
</style>