<script>
  import {fade} from 'svelte/transition';
  import Tooltip from './Tooltip.svelte';
	export let matrix, size, grad, diaper, shield, colors, background, scale, border, borderWidth, showAbout, edit;

  const shields = ["heater", "oldFrench", "spanish", "french", "swiss", "wedged", "italian", "kite", "renaissance", "baroque", "polish", "german", "diamond", "round", "vesicaPiscis", "square", "flag", "pennon", "guidon", "banner", "dovetail", "gonfalon", "pennant"];
  const paths = shields.map(id => document.getElementById(id).innerHTML);
  const sizes = [[80, "Extra Small"], [100, "Small"], [150, "Medium"], [200, "Large"], [300, "Extra Large"], [400, "Giant"]];
  const gradients = ["luster", "spotlight", "backlight"];
  const tinctures = ["argent", "or", "gules", "sable", "azure", "vert", "purpure"];
  const defaultColors = getDefaultColors();
  let locked = localStorage.getItem("Armoria", JSON.stringify(options));

  $: {
    options.size = size;
    options.shield = shield;
    options.grad = grad;
    options.diaper = diaper;
    options.colors = colors;
    options.border = border;
    options.borderWidth = borderWidth;
    options.background = background;
    options.scale = scale;
  }

  async function download() {
    const coas = document.querySelectorAll("svg.coa");
    let width = +coas[0].getAttribute("width");
    let height = +coas[0].getAttribute("height");
    const numberX = coas.length > 1 ? Math.floor(window.innerWidth / width) : 1;
    const numberY = coas.length > 1 ? Math.ceil(coas.length / numberX) : 1;

    width = Math.round(width * scale);
    height = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = width * numberX;
    canvas.height = height * numberY;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let loaded = 0;
    coas.forEach(async function(svg, i) {
      const url = await getURL(svg);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        URL.revokeObjectURL(url);
        ctx.drawImage(img, i % numberX * width, Math.floor(i / numberX) * height, width, height);
        loaded ++;
        if (loaded === coas.length) drawCanvas(canvas);
      }
    });
  }

  async function getURL(svg) {
    const clone = svg.cloneNode(true); // clone svg
    const d = clone.getElementsByTagName("defs")[0];

    d.insertAdjacentHTML("beforeend", defs.getElementById(shield).outerHTML);
    if (grad) d.insertAdjacentHTML("beforeend", defs.getElementById(grad).outerHTML);
    if (diaper) d.insertAdjacentHTML("beforeend", defs.getElementById(diaper).outerHTML);
    clone.querySelectorAll(".charge[charge]").forEach(el => {
      const charge = el.getAttribute("charge");
      d.insertAdjacentHTML("beforeend", defs.getElementById(charge).outerHTML);
    });
    const fieldPattern = clone.getElementById("field").getAttribute("fill").split("(#")[1]?.split(")")[0];
    if (fieldPattern) d.insertAdjacentHTML("beforeend", document.getElementById(fieldPattern).outerHTML);
    const divisionPattern = clone.getElementById("division")?.querySelector("rect").getAttribute("fill").split("(#")[1]?.split(")")[0];
    if (divisionPattern) d.insertAdjacentHTML("beforeend", document.getElementById(divisionPattern).outerHTML);

    const serialized = (new XMLSerializer()).serializeToString(clone);
    const blob = new Blob([serialized], {type: 'image/svg+xml;charset=utf-8'});
    const url = window.URL.createObjectURL(blob);
    return url;
  }

  function drawCanvas(canvas) {
    const link = document.createElement("a");
    link.download = "armoria_download.png";
    canvas.toBlob(function(blob) {
      link.href = window.URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      setTimeout(function() {
        canvas.remove();
        window.URL.revokeObjectURL(link.href);
      }, 5000);
    });
  }

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    background = "#" + [0,0,0,0,0,0].map(i => letters[Math.floor(Math.random() * 16)]).join("");
  }

  function lock() {
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
    {#if matrix}
      <bt on:click={() => matrix -= 1}>Rollback</bt>
    {:else}
      <bd style="color: #333">Rollback</bd>
    {/if}
    <bt on:click={() => matrix += 1}>Reroll</bt>
    <bt on:click={download}>Download</bt>
    <div class="container"><bl>Options</bl>

      <div class="dropdown level1">
        <div class="container">
          <div class="dropdown level2">
            {#each sizes as s}
              <bt class="{size === s[0] ? 'selected' : ''}" on:click={() => size = s[0]}>{s[1]}</bt>
            {/each}
          </div>
          <bl><Tooltip tip="Set gallery size">Size</Tooltip></bl>
        </div>

        <div class="container">
          <div class="dropdown level2">
            {#each tinctures as t}
              <bl>{t}
                {#if colors[t] !== defaultColors[t]}
                  <Tooltip tip="Restore default color">
                    <span on:click={() => colors[t] = defaultColors[t]}>⭯ </span>
                  </Tooltip>
                {/if}
                <input type="color" bind:value={colors[t]}/>
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
              <bt on:click={() => shield = sh}>
                <svg class="{sh === shield ? 'selected' : ''}" width=26 height=26 viewBox="0 0 200 200">{@html paths[i]}</svg>
                {sh.split(/(?=[A-Z])/).join(" ")}
              </bt>
            {/each}
          </div>
          <bl>Shield</bl>
        </div>

        <div class="container">
          <div class="dropdown level2">
            <bt class="{!grad ? 'selected' : ''}" on:click={() => grad = null}>No gradient</bt>
            {#each gradients as g}
              <bt class="{g === grad ? 'selected' : ''}" on:click={() => grad = g}>{g}</bt>
            {/each}
          </div>
          <bl>Gradient</bl>
        </div>

        <div class="container">
          <div class="dropdown level2">
            <bt class="{!diaper ? 'selected' : ''}" on:click={() => diaper = null}>No pattern</bt>
            <bt class="{diaper === "nourse" ? 'selected' : ''}" on:click={() => diaper = "nourse"}>Nourse</bt>
          </div>
          <bl>Damasking</bl>
        </div>

        <div class="container">
          <div class="dropdown level2">
            <bl>Color
              {#if border !== "#333333"}
                <Tooltip tip="Restore default color">
                  <span on:click={() => border = "#333333"}>⭯ </span>
                </Tooltip>
              {/if}
              <input type="color" bind:value={border}/>
            </bl>
            <bl>Width
              <input class="right" type="number" min=0 max=4 step=.1 bind:value={borderWidth}/>
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
              {#if background !== "#333333"}
                <Tooltip tip="Restore default color">
                  <span on:click={() => background = "#333333"}>⭯ </span>
                </Tooltip>
              {/if}
              <input type="color" bind:value={background}/>
            </bl>
          </div>
          <bl>Background</bl>
        </div>

        <div class="container">
          <div class="dropdown level2">
            <bl class="wide">
              <input type="range" min=1 max=4 step=.1 bind:value={scale}/>
              <input type="number" min=1 max=4 step=.1 bind:value={scale}/>
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
    <bt on:click={() => showAbout = 1}>About</bt>
    {#if edit.on}
      <bt id="back" on:click={() => edit.on = 0} transition:fade>Back to gallery</bt>
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