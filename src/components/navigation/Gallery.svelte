<script lang="ts">
  // @ts-check
  import {fontColor, history, matrices, matrix, state} from "data/stores";
  import {download} from "scripts/download";
  import {generate} from "scripts/generator";
  import {minmax} from "scripts/utils";
  import {fade} from "svelte/transition";
  import COA from "./../object/COA.svelte";

  export let gallery: number[];
  export let width: number;
  export let height: number;

  $: fontSize = minmax(width / 20, 6, 12);

  $: coas = gallery.map(c => {
    if (!$history[c]) $history[c] = generate();
    return $history[c];
  });

  function regenerate(i: number) {
    $state.i = i;
    $matrix++;
    $matrices[$matrix] = $matrices[$matrix - 1].slice();
    $matrices[$matrix][$state.i] = $history.length;
  }

  function editCOA(i: number) {
    $state.edit = 1;
    $state.c = gallery[i];
    $state.i = i;
  }
</script>

<main style="color: {$fontColor}; font-size: {fontSize}px" transition:fade={{duration: 500}}>
  {#each coas as coa, i}
    <div>
      <div class="name">{coa.name || ""}</div>
      {#key coa}
        <COA {coa} {i} {width} {height} />
      {/key}
      <div class="control">
        <svg on:click={() => regenerate(i)}><use href="#dice-icon" /></svg>
        <svg on:click={() => editCOA(i)}><use href="#pencil-icon" /></svg>
        <svg on:click={() => download(i)}><use href="#download-icon" /></svg>
      </div>
    </div>
  {/each}
</main>

<style>
  main > div {
    display: inline-block;
    position: relative;
    user-select: none;
    transition: background 0.5s ease;
  }

  main > div:hover {
    background: #00000020;
  }

  .name {
    position: absolute;
    font-size: 1.6em;
    font-weight: bold;
    width: 100%;
    text-align: center;
    text-transform: uppercase;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .control {
    display: block;
    position: absolute;
    opacity: 0;
    transition: 0.5s ease-in-out;
    transform: translate(-50%, -150%);
    left: 50%;
    font-size: 2.4em;
    white-space: nowrap;
  }

  main > div:hover > .control {
    opacity: 1;
  }

  .control > svg {
    width: 1.2em;
    height: 1.2em;
    fill: #f1f1f1;
    stroke: #333;
    stroke-width: 0.5em;
    vertical-align: middle;
    margin: 0 0.5em;
    transition: 0.1s ease-in-out;
  }

  .control > svg:hover {
    fill: #fff;
    cursor: pointer;
  }

  .control > svg:active {
    transform: translateY(1px) rotate(180deg);
  }
</style>
