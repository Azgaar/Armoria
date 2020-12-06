<script>
  import Tooltip from './Tooltip.svelte';
  import {fade} from 'svelte/transition';
  import {download} from './download.js';
  import {size, grad, diaper, shield, colors, background, scale, border, borderWidth, matrix, state, changes} from './stores';

  const shields = ["heater", "oldFrench", "spanish", "french", "swiss", "wedged", "italian", "kite", "renaissance", "baroque", "polish", "german", "diamond", "round", "vesicaPiscis", "square", "flag", "pennon", "guidon", "banner", "dovetail", "gonfalon", "pennant"];
  const paths = shields.map(id => document.getElementById(id).innerHTML);
  const sizes = [[80, "Extra Small"], [100, "Small"], [150, "Medium"], [200, "Large"], [300, "Extra Large"], [400, "Giant"]];
  const gradients = ["luster", "spotlight", "backlight"];
  const diapers = ["nourse", "tessellation"];
  const tinctures = ["argent", "or", "gules", "sable", "azure", "vert", "purpure"];
  const defaultColors = {argent: "#fafafa", or: "#ffe066", gules: "#d7374a", sable: "#333333", azure: "#377cd7", vert: "#26c061", purpure: "#522d5b"};
  let locked = localStorage.getItem("Armoria");
  
  $: position = $changes[1];

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    $background = "#" + [0,0,0,0,0,0].map(i => letters[Math.floor(Math.random() * 16)]).join("");
  }

  function lock() {
    const options = {};
    localStorage.setItem("Armoria", JSON.stringify(options));
    locked = true;
  }

  function reset() {
    localStorage.removeItem("Armoria");
    locked = false;
  }
</script>

<div id="navbar">
  <ul>
    <bd><img alt="Armoria" src="../logo.png"><b>Armoria</b></bd>
    {#if $matrix}
      <bt on:click={() => $matrix -= 1}>Rollback</bt>
    {:else}
      <bd style="color: #333">Rollback</bd>
    {/if}
    <bt on:click={() => $matrix += 1}>Reroll</bt>

    <bt on:click={() => download()}>Download</bt>
    <div class="container"><bl>Options</bl>

      <div class="dropdown level1">
        <div class="container">
          <div class="dropdown level2">
            {#each sizes as s}
              <bt class:selected={$size === s[0]} on:click={() => $size = s[0]}>{s[1]}</bt>
            {/each}
          </div>
          <bl><Tooltip tip="Set gallery size">Gallery Size</Tooltip></bl>
        </div>

        <div class="container">
          <div class="dropdown level2">
            {#each tinctures as t}
              <bl>{t}
                {#if $colors[t] !== defaultColors[t]}
                  <Tooltip tip="Restore default color">
                    <span on:click={() => $colors[t] = defaultColors[t]}>⭯ </span>
                  </Tooltip>
                {/if}
                <input type="color" bind:value={$colors[t]}/>
              </bl>
            {/each}
          </div>
          <bl>
            <Tooltip tip="Set hue of tinctures and metals. Edit COA to change tincture or metal itself">Colors</Tooltip>
          </bl>
        </div>

        <div class="container">
          <div class="dropdown level2 columns3 iconed">
            {#each shields as sh, i}
              <bt on:click={() => $shield = sh}>
                <svg class:selected={sh === $shield} width=26 height=26 viewBox="0 0 200 200">{@html paths[i]}</svg>
                {sh.split(/(?=[A-Z])/).join(" ")}
              </bt>
            {/each}
          </div>
          <bl>Shield</bl>
        </div>

        <div class="container">
          <div class="dropdown level2">
            <bt class:selected={!$grad} on:click={() => $grad = null}>No gradient</bt>
            {#each gradients as g}
              <bt class:selected={g === $grad} on:click={() => $grad = g}>{g}</bt>
            {/each}
          </div>
          <bl>Gradient</bl>
        </div>

        <div class="container">
          <div class="dropdown level2">
            <bt class:selected={!$diaper} on:click={() => $diaper = null}>No pattern</bt>
            {#each diapers as d}
              <bt class:selected={d === $diaper} on:click={() => $diaper = d}>{d}</bt>
            {/each}
          </div>
          <bl>Damasking</bl>
        </div>

        <div class="container">
          <div class="dropdown level2">
            <bl>Color
              {#if $border !== "#333333"}
                <Tooltip tip="Restore default color">
                  <span on:click={() => $border = "#333333"}>⭯ </span>
                </Tooltip>
              {/if}
              <input type="color" bind:value={$border}/>
            </bl>
            <bl>Width
              <input class="right" type="number" min=0 max=4 step=.1 bind:value={$borderWidth}/>
            </bl>
          </div>
          <bl>Border</bl>
        </div>

        <div class="container">
          <div class="dropdown level2">
            <bl>Color
              <Tooltip tip="Select random color">
                <span on:click={getRandomColor}>⭮ </span>
              </Tooltip>
              {#if $background !== "#333333"}
                <Tooltip tip="Restore default color">
                  <span on:click={() => $background = "#333333"}>⭯ </span>
                </Tooltip>
              {/if}
              <input type="color" bind:value={$background}/>
            </bl>
          </div>
          <bl>Background</bl>
        </div>

        <div class="container">
          <div class="dropdown level2">
            <bl class="wide">
              <input type="range" min=1 max=4 step=.1 bind:value={$scale}/>
              <input type="number" min=1 max=4 step=.1 bind:value={$scale}/>
            </bl>
          </div>
          <bl>
            <Tooltip tip="Downloaded image size, 1 is default size, 2 - 2x size, etc.">Scale</Tooltip>
          </bl>
        </div>

        {#if locked}
          <bt on:click={reset}><Tooltip tip="Remove saved options. Refresh the page to apply default settings">Reset</Tooltip></bt>
        {:else}
          <bt on:click={lock}>
            <Tooltip tip="Save options to auto-apply them on page reload">Lock</Tooltip>
          </bt>
        {/if}
      </div>
    </div>
    
    <bt on:click={() => $state.about = 1}>About</bt>
    
    {#if $state.edit}
      {#if position > 0}
        <bt on:click={() => changes.undo()}>Undo</bt>
      {:else}
        <bd style="color: #333">Undo</bd>
      {/if}

      {#if position < changes.length() - 1}
        <bt on:click={() => changes.redo()}>Redo</bt>
      {:else}
        <bd style="color: #333">Redo</bd>
      {/if}
    {/if}

    {#if $state.edit}
      <bt id="back" on:click={() => $state.edit = 0} transition:fade>Back to gallery</bt>
    {/if}
  </ul>
</div>

<style>
  ul {
    position: fixed;
    top: 0;
    width: 100%;
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    overflow: hidden;
    background-color: #1b1c1d;
    z-index: 1;
  }

  bt, bl, bd {
    user-select: none;
    padding: 1em 1.14em;
    line-height: 1.24;
    color: #fff;
    text-transform: capitalize;
  }

  bt {
    cursor: pointer;
    transition: background-color .1s;
  }

  bt:hover, bl:hover {
    background-color: #2d2e2f;
  }

  bt:active, span:active {
    transform: translateY(1px);
  }

  bd img {
    vertical-align: middle;
    margin: -.8em 1.2em;
    width: 2.5em;
  }

  input[type="color"] {
    position: absolute;
    padding: 0;
    margin: -.3em 0;
    right: 1em;
    border: 0;
    width: 3em;
    cursor: pointer;
  }

  input[type="range"] {
    padding: 0;
    width: 72%;
    margin: 0;
    height: .6em;
    cursor: pointer;
  }

  input[type="number"] {
    padding: 0 0 0 3px;
    width: 25%;
    margin: 0;
    border: 0;
  }

  input[type="number"].right {
    position: absolute;
    padding: 2px;
    margin: -.25em 0;
    right: 1em;
    width: 3em;
  }

  .dropdown {
    display: none;
    position: fixed;
    background-color: #1b1c1d;
    min-width: 10em;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
  }

  .level1 {
    margin-top: 1em;
  }

  .level2 {
    z-index: 1;
    margin-left: 10.25em;
  }

  .dropdown bt, .dropdown bl {
    padding: 12px 16px;
    width: 8em;
    display: block;
  }

  .dropdown bl.wide {
    width: 12em;
  }

  .container:hover > .dropdown {
    display: block;
  }

  .dropdown bt.selected:before {
    content: '\2713';
    display: inline-block;
    padding: 0 6px 0 0;
  }

  .columns3 {
    column-count: 3;
  }

  .dropdown.iconed {
    text-indent: 1.8em;
  }

  svg {
    position: absolute;
    fill: none;
    stroke: #fff;
    stroke-width: 4px;
    margin: -0.4em 0 0 -2.2em;
  }

  svg.selected {
    fill: #777;
    stroke: #333;
  }

  span {
    cursor: pointer;
  }

  #back {
    position: absolute;
    right: 0;
  }
</style>