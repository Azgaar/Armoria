<script lang="ts">
  // @ts-check
  import {state as editorState} from "#lib/data/stores.ts";
  import {shields} from "#lib/data/dataModel.js";
  import {fade} from "svelte/transition";

  let {shield}: {shield: string} = $props();

  // on shield change
  let points = $derived(Object.entries(shields.data[shield].positions || shields.data.spanish.positions || {}));

  function getClass(p: string) {
    if ("abcdefghi".includes(p)) return "green";
    if ("ABCDEFGHIJKL".includes(p)) return "red";
    if ("zy".includes(p)) return "yellow";
    return "blue";
  }
</script>

{#if $editorState.positions}
  <g transform={$editorState.transform || null} transform-origin="center">
    <g id="positions" transform="translate(100, 100)" transition:fade|local>
      {#each points as p (p[0])}
        <g id={p[0]} class={getClass(p[0])}>
          <circle cx={p[1][0]} cy={p[1][1]} r="3" class:active={$editorState.positions.includes(p[0])} />
          <text style="dominant-baseline: central" x={p[1][0]} y={p[1][1]} class:active={$editorState.positions.includes(p[0])}
            >{p[0]}</text
          >
        </g>
      {/each}
    </g>
  </g>
{/if}

<style>
  circle {
    opacity: 0.6;
  }

  circle.active {
    opacity: 1;
  }

  text {
    font-family: monospace;
    text-anchor: middle;
    font-size: 5px;
    fill: #ddd;
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

  .yellow {
    fill: rgb(84, 84, 0);
  }
</style>
