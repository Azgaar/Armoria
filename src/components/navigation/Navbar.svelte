<script>
  import Lock from './Lock.svelte';
  import {fade} from 'svelte/transition';
  import {download} from './../../scripts/download';
  import {size, grad, diaper, shield, background, scale, border, borderWidth, matrix, state, changes, message} from './../../data/stores';
  import {shields, shieldPaths} from './../../data/shields';
  import {tooltip} from './../../scripts/tooltip';

  let installable = false, prompt = null;
  const sizes = [[80, "Giant"], [100, "Huge"], [150, "Large"], [200, "Medium"], [300, "Small"], [400, "Tiny"]];
  const gradients = ["no", "luster", "spotlight", "backlight", "brink"];
  const diapers = ["no", "nourse", "tessellation", "sennwald", "sulzbach"];
  const wideScreen = window.innerWidth > 600;

  $: position = $changes[1];

  function getIcon(icon, active = "active") {
    if (wideScreen) return `<span class="navBarIcon ${active}">${icon}</span>`;
    return `<svg class="navBarIcon ${active}"><use href="#${icon}-icon"></use></svg>`;
  }

  function change(e, store, value, key) {
    e.stopPropagation();
    store.set(value);
    localStorage.setItem(key, value);

    // update coa on shield change
    if (key === "shield" && changes.length()) {
      const coa = JSON.parse($changes[0]);
      coa.shield = $shield;
      changes.add(JSON.stringify(coa));
    }
  }

  function getRandomColor() {
    const l = '0123456789ABCDEF';
    $background = "#"+[0,0,0,0,0,0].map(() => l[Math.floor(Math.random() * 16)]).join("");
    localStorage.setItem("background", $background);
  }

  function restoreDefault(e, store, key, value) {
    e.stopPropagation();
    store.set(value);
    localStorage.removeItem(key);
  }

  function goHome() {
    location.href = (location.origin + location.pathname);
  }

  function copyEditLink() {
    const coa = $changes[0].replaceAll("#", "%23");
    const url = location.origin + location.pathname + "?coa=" + coa;
    copyToClipboard(url, "Coat of arms link is copied to your clipboard");
  }

  function copyAPILink() {
    const encoded = encodeURI($changes[0]);
    const API = "https://armoria.herokuapp.com/";
    const url = `${API}?size=500&format=png&coa=${encoded}`;
    copyToClipboard(url, "API link is copied to your clipboard");
  }

  function copyCOA() {
    const encoded = encodeURI($changes[0]);
    copyToClipboard(encoded, "Encoded COA string is copied to your clipboard");
  }

  function copyToClipboard(stringToCopy, response) {
    $message = null;

    navigator.clipboard.writeText(stringToCopy).then(
      () => {
        $message = null;
        setTimeout(() => {
          $message = {type: "success", text: response, timeout: 5000};
        }, 500);
      }, err => {
        const text = "Cannot copy to the clipboard!";
        $message = {type: "error", text, timeout: 5000};
        console.error(err);
      }
    );
  }

  function install() {
    installable = false;
    prompt.prompt();
    prompt.userChoice.then(choise => prompt = null);
  }

  window.addEventListener("beforeinstallprompt", e => {
    console.log("beforeinstallprompt is fired");
    //e.preventDefault(); // no default prompt
    prompt = e;
    installable = true;
  });

  window.addEventListener("appinstalled", e => {
    console.log("App installation: success");
    $message = {type: "success", text: `Armoria application is installed`, timeout: 5000};
  });

  // values to be always saved
  $: localStorage.setItem("background", $background);
  $: localStorage.setItem("border", $border);
  $: localStorage.setItem("borderWidth", $borderWidth);
  $: localStorage.setItem("scale", $scale);
</script>

<nav>
  <svg on:click={goHome} class=logo width=35 height=35 viewBox="-2 -1 55 55">
    <path fill="#fff" stroke="none" d="m 46,3 0.6,1.4 c -1.5,0.7 -2.6,1.4 -3.3,2.2 -0.7,0.7 -1.2,1.5 -1.5,2.4 -0.3,0.9 -0.4,2.2 -0.4,3.9 0,0.6 0,1.3 0,2.2 l 0.5,23.2 c 0,2.5 0.3,4.2 0.8,5 0.4,0.6 0.8,0.8 1.3,0.8 0.6,0 1.5,-0.6 2.8,-1.8 l 0.9,1.1 -5.8,4.9 -1.9,1.6 C 38.4,49.2 37.2,48.2 36.5,46.9 35.8,45.7 35.3,36.7 35.2,34 c -7.6,0.1 -20.2,0 -20.2,0 0,0 -7.4,9.1 -7.4,11.1 0,0.6 0.2,1.1 0.6,1.8 0.5,0.9 0.8,1.4 0.8,1.7 0,0.4 -0.1,0.7 -0.4,1 -0.3,0.3 -0.6,0.4 -1.1,0.4 -0.5,0 -0.9,-0.2 -1.2,-0.6 -0.5,-0.6 -0.7,-1.3 -0.7,-2.2 0,-1 0.3,-2.1 0.8,-3.3 C 8.8,39.9 11.3,36.7 14.1,32.9 11.1,30.7 9,28.5 7.8,26.4 6.6,24.4 6,22.1 6,19.5 c 0,-3 0.8,-5.7 2.3,-8.3 1.5,-2.5 3.8,-4.5 6.9,-6 3.1,-1.5 6.2,-2.2 9.4,-2.2 4.9,0 9.7,1.7 14.3,5.1 1.1,-1.2 2.2,-2.1 3.2,-2.9 1,-0.8 2.4,-1.5 4,-2.3 z M 30.7,10.2 c -2.6,-1.3 -5.2,-1.9 -7.8,-1.9 -2.7,0 -5.3,0.6 -7.8,1.8 -2.4,1.2 -4.2,2.8 -5.4,4.7 -1.2,1.9 -1.8,3.9 -1.8,5.9 0,4.2 2.3,8 6.9,11.3 L 25.2,17.7 c -1.6,-0.8 -2.9,-1.3 -4.2,-1.3 -1.7,0 -3.1,0.8 -4.2,2.4 -0.4,0.7 -1,0.5 -1.1,-0.2 0,-0.6 0.3,-1.5 1,-2.7 0.7,-1.1 1.6,-2.1 2.9,-2.8 1.3,-0.7 2.6,-1.1 4,-1.1 1.4,0 3.1,0.4 4.9,1.1 z m 4,3.2 C 34,12.4 32.8,11.5 32,11 L 18.4,29.4 h 16.7 z"/>
  </svg>

  <div class="container">
    <bl>{@html getIcon("options")}</bl>

    <div class="dropdown level1">
      <div class="container">
        <div class="dropdown level2">
          {#each Object.keys(shields.types) as type}
            <div class="container">
              <div class="dropdown level3 iconed">
                {#each Object.keys(shields[type]) as sh}
                  <bt on:click={e => change(e, shield, sh, "shield")}>
                    <svg class=shield class:selected={sh === $shield} width=26 height=26 viewBox="0 0 200 210">
                      <path d="{shieldPaths[sh]}"/>
                    </svg>
                    {sh.split(/(?=[A-Z])/).join(" ")}
                  </bt>
                {/each}
              </div>

              <bl>
                {type.split(/(?=[A-Z])/).join(" ")}
              </bl>
            </div>
          {/each}
        </div>
        <bl title="Shield or banner shape. If not set, a random one is selected on reroll" use:tooltip>
          {#key $shield}<Lock key=shield/>{/key}
          <span>Shield</span>
        </bl>
      </div>

      <bt on:click={() => $state.tinctures = 1} title="Setup tinctures selection chance and hue" use:tooltip>
        <Lock key=tinctures/>
        <Lock key=colors/>
        <span>Tinctures</span>
      </bt>

      <div class="container">
        <div class="dropdown level2">
          {#each gradients as g}
            <bt class:selected={g === $grad} on:click={e => change(e, grad, g, "grad")}>{g}</bt>
          {/each}
        </div>
        <bl title="Overlay style to be applied on top of coat of arms" use:tooltip>
          {#key $grad}<Lock key=grad/>{/key}
          <span>Gradient</span>
        </bl>
      </div>

      <div class="container">
        <div class="dropdown level2">
          {#each diapers as d}
            <bt class:selected={d === $diaper} on:click={e => change(e, diaper, d, "diaper")}>{d}</bt>
          {/each}
        </div>
        <bl title="Backing style for coat of arms, also known as diaper" use:tooltip>
          {#key $diaper}<Lock key=diaper/>{/key}
          <span>Damasking</span>
        </bl>
      </div>

      <div class="container">
        <div class="dropdown level2">
          {#each sizes as s}
            <bt class:selected={$size == s[0]} on:click={e => change(e, size, s[0], "size")}>{s[1]}</bt>
          {/each}
        </div>
        <bl title="Coat of arms gallery size. Change to smaller value to make coat of arms bigger" use:tooltip>
          {#key $size}<Lock key=size/>{/key}
          <span>Gallery</span>
        </bl>
      </div>

      <div class="container">
        <div class="dropdown level2">
          <bl>Color
            {#if $border !== "#333333"}
              <svg on:click={e => restoreDefault(e, border, "border", "#333333")} class="navBarIcon active smaller" title="Restore default color" use:tooltip>
                <use href="#undo-icon"></use>
              </svg>
            {/if}
            <input type="color" bind:value={$border}/>
          </bl>
          <bl>Width
            {#if $borderWidth !== 1}
              <svg on:click={e => restoreDefault(e, borderWidth, "borderWidth", "#333333")} class="navBarIcon active smaller" title="Restore default border width" use:tooltip>
                <use href="#undo-icon"></use>
              </svg>
            {/if}
            <input class="right" type="number" min=0 max=4 step=.1 on:input={function(e) {change(e, borderWidth, +this.value, "borderWidth")}} value={$borderWidth}/>
          </bl>
        </div>
        <bl title="Coat of arms border style" use:tooltip>
          <span>Border</span>
        </bl>
      </div>

      <div class="container">
        <div class="dropdown level2">
          <bl>Color
            <svg on:click={getRandomColor} class="navBarIcon active smaller" title="Select random color" use:tooltip>
              <use href="#random-icon"></use>
            </svg>
            {#if $background !== "#333333"}
              <svg on:click={e => restoreDefault(e, background, "background", "#333333")} class="navBarIcon active smaller" title="Restore default color" use:tooltip>
                <use href="#undo-icon"></use>
              </svg>
            {/if}
            <input type="color" bind:value={$background}/>
          </bl>
        </div>
        <bl title="Window background color" use:tooltip>
          <span>Background</span>
        </bl>
      </div>

      <div class="container">
        <div class="dropdown level2">
          <bl class="wide">
            <input type="range" min=1 max=4 step=.1 bind:value={$scale}/>
            <input type="number" min=1 max=4 step=.1 bind:value={$scale}/>
          </bl>
        </div>
        <bl title="Downloaded image size, 1 is default size, 2 - 2x size, etc." use:tooltip>
          <span>Scale</span>
        </bl>
      </div>

      {#if !wideScreen && $state.edit}
        <bt on:click={() => $state.license = 1} title="Show information about license" use:tooltip>
          License
        </bt>
      {/if}
    </div>
  </div>

  {#if $matrix}
    <bt on:click={() => $matrix -= 1} title="Roll to the previous list" gesture="Swipe up" hotkey="Backspace" use:tooltip>
      {@html getIcon("rollback")}
    </bt>
  {:else}
    <bd>{@html getIcon("rollback", "inactive")}</bd>
  {/if}

  <bt on:click={() => $matrix += 1} title="Regenerate coat of arms" gesture="Swipe down" hotkey="Enter" use:tooltip>
    {@html getIcon("reroll")}
  </bt>

  <div class="container"><bl>{@html getIcon("save")}</bl>
    <div class="dropdown level1">
      <bt on:click={() => download(null, "svg")} title="Download vector image or set of images. Open in browser or load to Map Generator. Size can be set in options" hotkey="Ctrl + S" use:tooltip>
        <span>Download SVG</span>
      </bt>

      <bt on:click={() => download(null, "png")} title="Download as raster image. Size can be set in options" hotkey="Ctrl + P" use:tooltip>
        <span>Download PNG</span>
      </bt>

      <bt on:click={() => download(null, "jpeg")} title="Download a compressed raster image. Size can be set in options" hotkey="Ctrl + J" use:tooltip>
        <span>Download JPEG</span>
      </bt>

      {#if $state.edit}
        <bt on:click={copyEditLink} title="Copy link to the coat of arms in Edit mode to your clipbard" use:tooltip>
          <span>Copy edit link</span>
        </bt>

        <bt on:click={copyAPILink} title="Copy link to the coat of arms for embedding. Armoria API does not support custom charges" use:tooltip>
          <span>Copy API link</span>
        </bt>

        <bt on:click={copyCOA} title="Copy coa object as encoded string to use in Armoria API" use:tooltip>
          <span>Copy COA string</span>
        </bt>
      {/if}
    </div>
  </div>

  <div class="container"><bl>{@html getIcon("upload")}</bl>
    <div class="dropdown level1">
      <bt on:click={() => $state.raster = 1} title="Upload raster charge (one color, quality loss on scale) from jpg, png or svg image" use:tooltip>
        <span>Raster charge</span>
      </bt>

      <bt on:click={() => $state.vector = 1} title="Upload vector charge (multicolor and lossless scalable) from prepared svg" use:tooltip>
        <span>Vector charge</span>
      </bt>
    </div>
  </div>

  {#if installable}
    <bt on:click={() => install()} class=flutter in:fade title="Add Armoria application to the desktop or home screen" use:tooltip>
      {@html getIcon("install")}
    </bt>
  {/if}

  {#if $state.edit}
    {#if position > 0}
      <bt on:click={() => changes.undo()} title="Revert the latest change" gesture="Swipe left" hotkey="Z" use:tooltip>
        {@html getIcon("undo")}
      </bt>
    {:else}
      <bd>{@html getIcon("undo", "inactive")}</bd>
    {/if}

    {#if position < changes.length() - 1}
      <bt on:click={() => changes.redo()} title="Restore the next change" gesture="Swipe right" hotkey="X" use:tooltip>
        {@html getIcon("redo")}
      </bt>
    {:else}
      <bd>{@html getIcon("redo", "inactive")}</bd>
    {/if}
  {/if}

  {#if $state.edit}
    <bt id="back" on:click={() => $state.edit = 0} transition:fade title="Get back to Gallery" hotkey="Escape" use:tooltip>
      {@html getIcon("back")}
    </bt>
  {/if}

  {#if wideScreen || !$state.edit}
    <bt on:click={() => $state.license = 1} title="Show information about license" use:tooltip>
      {@html getIcon("license")}
    </bt>
    <bt on:click={() => $state.about = 1} title="Show about screen" hotkey="F1" use:tooltip>
      {@html getIcon("about")}
    </bt>
    <bt on:click={() => window.open("https://www.patreon.com/azgaar", "_blank")} title="Support the project on Patreon" use:tooltip>
      {@html getIcon("support")}
    </bt>
  {/if}
</nav>

<style>
  nav {
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
    white-space: nowrap;
  }

  .logo {
    display: block;
    margin: 0 .5em 0 1em;
    background-color: #35bdb2;
    cursor: pointer;
  }

  :global(svg.navBarIcon) {
    width: 1em;
    height: 1em;
    fill: #333;
    stroke: none;
    vertical-align: middle;
  }

  :global(svg.navBarIcon.active) {
    fill: #fff;
    cursor: pointer;
  }

  :global(span.navBarIcon) {
    color: #333;
  }

  :global(span.navBarIcon.active) {
    color: #fff;
  }

  .navBarIcon.smaller {
    width: .8em;
    height: .8em;
  }

  .navBarIcon.smaller:active {
    transform: translateY(1px);
  }

  bt, bl, bd {
    user-select: none;
    padding: 1em;
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

  bt:active:not(:last-child) {
    transform: translateY(1px);
  }

  input[type="color"] {
    position: absolute;
    padding: 0;
    margin: -.3em 0;
    right: .4em;
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
    right: .4em;
    width: 3em;
  }

  .dropdown {
    display: none;
    position: fixed;
    background-color: #1b1c1d;
    min-width: 9em;
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

  .level3 {
    z-index: 2;
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

  /* low-width (narrow) screen */
  @media only screen and (max-width: 720px) {
    .logo {
      display: none;
    }

    .level3 {
      margin-left: -10.25em;
      background-color: #222;
    }
  }

  /* low-height screen */
  @media only screen and (max-height: 640px) and (orientation: landscape) {
    .dropdown bt, .dropdown bl {
      padding: 6px 16px;
      width: 7em;
    }

    .level2 {
      margin-left: 9.25em;
    }

    .level3 {
      margin-left: 9.25em;
    }
  }
  

  @media only screen and (max-height: 640px) and (min-width: 520px) and (orientation: landscape) {
    .logo {display: none;}
    .level3 {column-count: 2;}
  }

  @media only screen and (max-height: 640px) and (min-width: 680px) and (orientation: landscape) {
    .logo {display: none;}
    .level3 {column-count: 3;}
  }

  .dropdown.iconed {
    text-indent: 1.8em;
  }

  .shield {
    position: absolute;
    fill: none;
    stroke: #fff;
    stroke-width: 5px;
    margin: -0.4em 0 0 -2.2em;
  }

  .shield.selected {
    fill: #777;
    stroke: #333;
  }

  #back {
    position: absolute;
    right: 0;
  }
</style>