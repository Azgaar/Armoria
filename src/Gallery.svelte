<script>
  import COA from './COA.svelte';
  import {fade} from 'svelte/transition';
  import {generate} from './generator.js';
  import {download} from './download.js';
  import {history, matrices, matrix, state} from './stores';
  export let gallery, w, h;

  $:coas = gallery.map(c => {
    let coa = $history[c] || generate();
    if (!$history[c]) $history[c] = coa;
    return coa;
  });

  function regenerate(i) {
    const coa = generate();
    gallery[i] = $history.length;
    $matrix++;
    $matrices[$matrix] = gallery;
    $history.push(coa);
    coas[i] = coa;
  }

  function editCOA(i) {
    $state.edit = 1;
    $state.c = gallery[i];
    $state.i = i;
  }
</script>

<div id="gallery" style="margin-top: 28px; font-size: {Math.ceil(w/20)}px" transition:fade>
  {#each coas as coa, i}
    <div>
      {#key coa}
        <COA {coa} {i} {w} {h}/>
      {/key}
        <div class="control">
        <svg on:click={() => regenerate(i)}><use href="#dice-icon"></use></svg>
        <svg on:click={() => editCOA(i)}><use href="#pencil-icon"></use></svg>
        <svg on:click={() => download(i)}><use href="#download-icon"></use></svg>
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
    transition: background .5s ease;
  }

  #gallery > div:hover {
    background: #00000020;
  }

  .control {
    display: block;
    position: absolute;
    opacity: 0;
    transition: .5s ease-in-out;
    color: #f1f1f1;
    transform: translate(-50%, -150%);
    left: 50%;
    font-size: 2em;
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
    stroke-width: .5em;
    vertical-align: middle;
    margin: 0 .5em;
    padding: .2em;
    cursor: pointer;
  }

  .control > svg:hover {
    background-color: #44444490;
    color: #fff;
  }

  .control > svg:active {
    transform: translateY(1px);
  }
</style>