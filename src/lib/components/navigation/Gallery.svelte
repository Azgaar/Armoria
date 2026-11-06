<script lang="ts">
  // @ts-check
  import {fontColor, tinctures, history, matrices, matrix, state as editorState} from "#lib/data/stores.ts";
  import {download} from "#lib/scripts/download.js";
  import {generate} from "#lib/scripts/generator.js";
  import {minmax} from "#lib/scripts/utils.ts";
  import {untrack} from "svelte";
  import type {Coa} from "#lib/types/coa.js";
  import {fade} from "svelte/transition";
  import COA from "./../object/COA.svelte";

  let {gallery, width, height}: {gallery: number[]; width: number; height: number} = $props();

  const fontSize = $derived(minmax(width / 20, 6, 12));
  let coas = $state.raw<Coa[]>([]);

  $effect.pre(() => {
    const indices = gallery;
    const saved = $history;
    const palette = $tinctures;
    // Generate only missing entries; reading existing history must not reroll it.
    untrack(() => {
      coas = indices.map(c => {
        if (!saved[c]) $history[c] = generate(undefined, palette);
        return saved[c];
      });
    });
  });

  function regenerate(i: number) {
    $editorState.i = i;
    $matrix++;
    $matrices[$matrix] = $matrices[$matrix - 1].slice();
    $matrices[$matrix][$editorState.i] = $history.length;
  }

  function editCOA(i: number) {
    $editorState.edit = 1;
    $editorState.c = gallery[i];
    $editorState.i = i;
  }
</script>

<main style="color: {$fontColor}; font-size: {fontSize}px" transition:fade={{duration: 500}}>
  {#each coas as coa, i (i)}
    <div>
      <div class="name">{coa.name || ""}</div>
      {#key coa}
        <COA {coa} {i} {width} {height} />
      {/key}
      <div class="control">
        <svg onclick={() => regenerate(i)}><use href="#dice-icon" /></svg>
        <svg onclick={() => editCOA(i)}><use href="#pencil-icon" /></svg>
        <svg onclick={() => download(i)}><use href="#download-icon" /></svg>
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
    visibility: hidden;
    opacity: 0;
    transition: 0.5s ease-in-out;
    transform: translate(-50%, -150%);
    left: 50%;
    font-size: 2.4em;
    white-space: nowrap;
  }

  main > div:hover > .control {
    visibility: visible;
    opacity: 1;
  }

  @media not (pointer: fine) {
    main > div:hover > .control {
      animation: disable-pointer-events 0.5s;
    }
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
