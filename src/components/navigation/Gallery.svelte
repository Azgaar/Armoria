<script>
  import COA from "./../object/COA.svelte";
  import {fade} from "svelte/transition";
  import {generate} from "@/scripts/generator";
  import {download} from "@/scripts/download";
  import {history, matrices, matrix, state} from "@/data/stores";
  export let gallery, w, h;

  $: font = Math.max(Math.min(Math.ceil(w / 20), 12), 6);

  $: coas = gallery.map(c => {
    let coa = $history[c] || generate();
    if (!$history[c]) $history[c] = coa;
    return coa;
  });

  function regenerate(i) {
    $state.i = i;
    $matrix++;
    $matrices[$matrix] = $matrices[$matrix - 1].slice();
    $matrices[$matrix][$state.i] = $history.length;
  }

  function editCOA(i) {
    $state.edit = 1;
    $state.c = gallery[i];
    $state.i = i;
  }
</script>

<div id="gallery" style="font-size: {font}px" transition:fade>
  {#each coas as coa, i}
    <div>
      {#key coa}
        <COA {coa} {i} {w} {h} />
      {/key}
      <div class="control">
        <svg on:click={() => regenerate(i)}><use href="#dice-icon" /></svg>
        <svg on:click={() => editCOA(i)}><use href="#pencil-icon" /></svg>
        <svg on:click={() => download(i)}><use href="#download-icon" /></svg>
      </div>
    </div>
  {/each}
</div>

<style>
  div {
    display: inline-table;
  }

  #gallery > div {
    display: inline-block;
    position: relative;
    user-select: none;
    transition: background 0.5s ease;
  }

  #gallery > div:hover {
    background: #00000020;
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

  #gallery > div:hover > .control {
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
  }

  .control > svg:hover {
    fill: #fff;
    cursor: pointer;
  }

  .control > svg:active {
    transform: translateY(1px);
  }
</style>
