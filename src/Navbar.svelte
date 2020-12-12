<script>
  import Tooltip from './Tooltip.svelte';
  import Lock from './Lock.svelte';
  import {fade} from 'svelte/transition';
  import {download} from './download.js';
  import {size, grad, diaper, shield, colors, background, scale, border, borderWidth, matrix, state, changes} from './stores';

  const shields = ["heater", "oldFrench", "spanish", "french", "swiss", "wedged", "italian", "round", "renaissance", "baroque", "polish", "german", "diamond", "kite", "vesicaPiscis", "square", "flag", "pennon", "guidon", "banner", "dovetail", "gonfalon", "pennant"];
  const paths = shields.map(id => document.getElementById(id).innerHTML);
  const sizes = [[80, "Giant"], [100, "Huge"], [150, "Large"], [200, "Medium"], [300, "Small"], [400, "Tiny"]];
  const gradients = ["luster", "spotlight", "backlight"];
  const diapers = ["nourse", "tessellation"];
  const tinctures = ["argent", "or", "gules", "sable", "azure", "vert", "purpure"];
  const defaultColors = {argent: "#fafafa", or: "#ffe066", gules: "#d7374a", sable: "#333333", azure: "#377cd7", vert: "#26c061", purpure: "#522d5b"};

  const wideScreen = window.innerWidth > 600;

  const icons = {
    options: "☰",
    rollback: "⭯",
    reroll: "⭮",
    download : "⇩",
    undo: "⤺",
    redo: "⤻",
    back: "⮪",
    about: "A"
  }

  function label(i) {
    if (wideScreen) return i;
    return icons[i] || i;
  }

  $: position = $changes[1];
  // save options on change
  $: lock("size", $size);
  $: lock("grad", $grad);
  $: lock("diaper", $diaper);
  $: lock("shield", $shield);
  $: lock("colors", JSON.stringify($colors));
  $: lock("background", $background);
  $: lock("scale", $scale);
  $: lock("border", $border);
  $: lock("borderWidth", $borderWidth);

  // don't lock options on load
  const loaded = [];
  function lock(key, value) {
    if (loaded.includes(key)) localStorage.setItem(key, value);
    else loaded.push(key);
  }

  function getRandomColor() {
    const l = '0123456789ABCDEF';
    $background = "#"+[0,0,0,0,0,0].map(() => l[Math.floor(Math.random() * 16)]).join("");
  }
</script>

<div id="navbar">
  <ul>
    {#if wideScreen}
      <svg class=logo width=35 height=35 viewBox="-2 -1 55 55">
        <title>Armoria: Heraldry Generator</title>
        <path fill="#fff" stroke="none" d="m 46,3 0.6,1.4 c -1.5,0.7 -2.6,1.4 -3.3,2.2 -0.7,0.7 -1.2,1.5 -1.5,2.4 -0.3,0.9 -0.4,2.2 -0.4,3.9 0,0.6 0,1.3 0,2.2 l 0.5,23.2 c 0,2.5 0.3,4.2 0.8,5 0.4,0.6 0.8,0.8 1.3,0.8 0.6,0 1.5,-0.6 2.8,-1.8 l 0.9,1.1 -5.8,4.9 -1.9,1.6 C 38.4,49.2 37.2,48.2 36.5,46.9 35.8,45.7 35.3,36.7 35.2,34 c -7.6,0.1 -20.2,0 -20.2,0 0,0 -7.4,9.1 -7.4,11.1 0,0.6 0.2,1.1 0.6,1.8 0.5,0.9 0.8,1.4 0.8,1.7 0,0.4 -0.1,0.7 -0.4,1 -0.3,0.3 -0.6,0.4 -1.1,0.4 -0.5,0 -0.9,-0.2 -1.2,-0.6 -0.5,-0.6 -0.7,-1.3 -0.7,-2.2 0,-1 0.3,-2.1 0.8,-3.3 C 8.8,39.9 11.3,36.7 14.1,32.9 11.1,30.7 9,28.5 7.8,26.4 6.6,24.4 6,22.1 6,19.5 c 0,-3 0.8,-5.7 2.3,-8.3 1.5,-2.5 3.8,-4.5 6.9,-6 3.1,-1.5 6.2,-2.2 9.4,-2.2 4.9,0 9.7,1.7 14.3,5.1 1.1,-1.2 2.2,-2.1 3.2,-2.9 1,-0.8 2.4,-1.5 4,-2.3 z M 30.7,10.2 c -2.6,-1.3 -5.2,-1.9 -7.8,-1.9 -2.7,0 -5.3,0.6 -7.8,1.8 -2.4,1.2 -4.2,2.8 -5.4,4.7 -1.2,1.9 -1.8,3.9 -1.8,5.9 0,4.2 2.3,8 6.9,11.3 L 25.2,17.7 c -1.6,-0.8 -2.9,-1.3 -4.2,-1.3 -1.7,0 -3.1,0.8 -4.2,2.4 -0.4,0.7 -1,0.5 -1.1,-0.2 0,-0.6 0.3,-1.5 1,-2.7 0.7,-1.1 1.6,-2.1 2.9,-2.8 1.3,-0.7 2.6,-1.1 4,-1.1 1.4,0 3.1,0.4 4.9,1.1 z m 4,3.2 C 34,12.4 32.8,11.5 32,11 L 18.4,29.4 h 16.7 z"/>
      </svg>
    {/if}

    <div class="container"><bl>{label("options")}</bl>

      <div class="dropdown level1">
        <div class="container">
          <div class="dropdown level2 columns3 iconed">
            {#each shields as sh, i}
              <bt on:click={() => $shield = sh}>
                <svg class=shield class:selected={sh === $shield} width=26 height=26 viewBox="0 0 200 200">{@html paths[i]}</svg>
                {sh.split(/(?=[A-Z])/).join(" ")}
              </bt>
            {/each}
          </div>
          <bl>
            <Lock key=shield/>
            <Tooltip tip="Shield or banner form. Some forms do not work well with auto-generated heralrdy">Shield</Tooltip>
          </bl>
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
            <Lock key=colors/>
            <Tooltip tip="Hue of tinctures and metals. Edit COA to change tincture or metal itself">Colors</Tooltip>
          </bl>
        </div>

        <div class="container">
          <div class="dropdown level2">
            <bt class:selected={!$grad} on:click={() => $grad = null}>No gradient</bt>
            {#each gradients as g}
              <bt class:selected={g === $grad} on:click={() => $grad = g}>{g}</bt>
            {/each}
          </div>
          <bl>
            <Lock key=grad/>
            <Tooltip tip="Gradient (overlay) style to be applied over coat of arms">Gradient</Tooltip>
          </bl>
        </div>

        <div class="container">
          <div class="dropdown level2">
            <bt class:selected={!$diaper} on:click={() => $diaper = null}>No pattern</bt>
            {#each diapers as d}
              <bt class:selected={d === $diaper} on:click={() => $diaper = d}>{d}</bt>
            {/each}
          </div>
          <bl>
            <Lock key=diaper/>
            <Tooltip tip="Diaper (subtle backing on coat of arms) style">Damasking</Tooltip></bl>
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
          <bl>
            <Lock key=border/>
            <Tooltip tip="Border style for coat of arms">Border</Tooltip>
          </bl>
        </div>

        <div class="container">
          <div class="dropdown level2">
            {#each sizes as s}
              <bt class:selected={$size == s[0]} on:click={() => $size = s[0]}>{s[1]}</bt>
            {/each}
          </div>
          <bl>
            <Lock key=size/>
            <Tooltip tip="Gallery size">Gallery</Tooltip>
          </bl>
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
          <bl>
            <Lock key=background/>
            <Tooltip tip="Background color">Background</Tooltip>
          </bl>
        </div>

        <div class="container">
          <div class="dropdown level2">
            <bl class="wide">
              <input type="range" min=1 max=4 step=.1 bind:value={$scale}/>
              <input type="number" min=1 max=4 step=.1 bind:value={$scale}/>
            </bl>
          </div>
          <bl>
            <Lock key=scale/>
            <Tooltip tip="Downloaded image size, 1 is default size, 2 - 2x size, etc.">Scale</Tooltip>
          </bl>
        </div>
      </div>
    </div>

    {#if $matrix}
    <bt on:click={() => $matrix -= 1}>
      <Tooltip tip="Roll to the previous list. Hotkey: Backspace">{label("rollback")}</Tooltip>
    </bt>
    {:else}
      <bd style="color: #333">{label("rollback")}</bd>
    {/if}

    <bt on:click={() => $matrix += 1}>
      <Tooltip tip="Regenerate coat of arms. Hotkey: Enter">{label("reroll")}</Tooltip>
    </bt>

    <bt on:click={() => download()}>
      <Tooltip tip="Download png image. Set size in options. Hotkey: D">{label("download")}</Tooltip>
    </bt>
    
    {#if $state.edit}
      {#if position > 0}
        <bt on:click={() => changes.undo()}>
          <Tooltip tip="Revert the latest change. Hotkey: Z">{label("undo")}</Tooltip>
        </bt>
      {:else}
        <bd style="color: #333">{label("undo")}</bd>
      {/if}

      {#if position < changes.length() - 1}
        <bt on:click={() => changes.redo()}>
          <Tooltip tip="Restore next change. Hotkey: X">{label("redo")}</Tooltip>
        </bt>
      {:else}
        <bd style="color: #333">{label("redo")}</bd>
      {/if}
    {/if}

    {#if $state.edit}
      <bt id="back" on:click={() => $state.edit = 0} transition:fade>
        <Tooltip tip="Get back to Gallery">{label("back")}</Tooltip>
      </bt>
    {/if}

    {#if wideScreen || !$state.edit}
      <bt on:click={() => $state.about = 1}>
        <Tooltip tip="Show about screen. Hotkey: F1">{label("about")}</Tooltip>
      </bt>
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

  .logo {
    margin: 0 .5em 0 1em;
    background-color: #35bdb2;
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

  @media only screen and (max-width: 640px) {
    .columns3 {
      column-count: 1;
    }

    .dropdown bt, .dropdown bl {
      padding: 8px 16px;
    }
  }

  @media only screen and (max-height: 640px) {
    .dropdown bt, .dropdown bl {
      padding: 8px 16px;
    }
  }

  .dropdown.iconed {
    text-indent: 1.8em;
  }

  .shield {
    position: absolute;
    fill: none;
    stroke: #fff;
    stroke-width: 4px;
    margin: -0.4em 0 0 -2.2em;
  }

  .shield.selected {
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