<script lang="ts">
  // @ts-check
  import type {Writable} from "svelte/store";
  import Logo from "./Logo.svelte";
  import NavItem from "./NavItem.svelte";
  import NavButton from "./NavButton.svelte";
  import BackButton from "./BackButton.svelte";
  import IconButton from "./IconButton.svelte";
  import Lock from "./Lock.svelte";
  import {download} from "scripts/download";
  import {sizes, gradients, diapers} from "config/options";
  import {size, grad, diaper, shield, background, scale, border, borderWidth, matrix, state, changes, message} from "data/stores";
  import {shields, shieldPaths} from "data/shields";
  import {openURL} from "scripts/utils";

  let installable = false;
  let prompt = null;

  const wideScreen = window.innerWidth > 600;

  $: position = $changes[1];
  $: redoable = position < changes.length() - 1;

  function change(event: Event, store: Writable<any>, value: any, key: string) {
    event.stopPropagation();
    store.set(value);
    localStorage.setItem(key, value);

    // update coa on shield change
    if (key === "shield" && changes.length()) {
      const coa = JSON.parse($changes[0] as string);
      coa.shield = $shield;
      changes.add(JSON.stringify(coa));
    }
  }

  function getRandomColor() {
    const l = "0123456789ABCDEF";
    $background = "#" + [0, 0, 0, 0, 0, 0].map(() => l[Math.floor(Math.random() * 16)]).join("");
    localStorage.setItem("background", $background);
  }

  const restoreDefaultBorder = (event: Event) => {
    event.stopPropagation();
    border.set("#333333");
    localStorage.removeItem("border");
  };

  const restoreDefaultBorderWidth = (event: Event) => {
    event.stopPropagation();
    borderWidth.set(1);
    localStorage.removeItem("borderWidth");
  };

  const restoreDefaultBackground = (event: Event) => {
    event.stopPropagation();
    background.set("#333333");
    localStorage.removeItem("background");
  };

  function restoreDefault(e, store, key, value) {
    e.stopPropagation();
    store.set(value);
    localStorage.removeItem(key);
  }

  function copyEditLink() {
    const coa = ($changes[0] as string).replaceAll("#", "%23");
    const url = location.origin + location.pathname + "?coa=" + coa;
    copyToClipboard(url, "Coat of arms link is copied to your clipboard");
  }

  function copyAPILink() {
    const encoded = encodeURI($changes[0] as string);
    const API = "https://armoria.herokuapp.com/";
    const url = `${API}?size=500&format=png&coa=${encoded}`;
    copyToClipboard(url, "API link is copied to your clipboard");
  }

  function copyCOA() {
    const encoded = encodeURI($changes[0] as string);
    copyToClipboard(encoded, "Encoded COA string is copied to your clipboard");
  }

  function copyToClipboard(stringToCopy: string, text: string) {
    $message = null;

    navigator.clipboard.writeText(stringToCopy).then(
      () => {
        $message = null;
        setTimeout(() => {
          $message = {type: "success", text, timeout: 5000};
        }, 500);
      },
      err => {
        $message = {type: "error", text: "Cannot copy to the clipboard!", timeout: 5000};
        console.error(err);
      }
    );
  }

  function install() {
    installable = false;
    prompt.prompt();
    prompt.userChoice.then(() => {
      prompt = null;
    });
  }

  const rollback = () => {
    $matrix -= 1;
  };

  const reroll = () => {
    $matrix += 1;
  };

  const showLicense = () => {
    $state.license = 1;
  };

  const showAbout = () => {
    $state.about = 1;
  };

  const showTinctures = () => {
    $state.tinctures = 1;
  };

  const showRasterUpload = () => {
    $state.raster = 1;
  };

  const showVectorUpload = () => {
    $state.vector = 1;
  };

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
  $: localStorage.setItem("borderWidth", String($borderWidth));
  $: localStorage.setItem("scale", String($scale));
</script>

<nav>
  <Logo />

  <div class="container">
    <NavItem value="options" />

    <div class="dropdown level1">
      <div class="container">
        <div class="dropdown level2">
          {#each Object.keys(shields.types) as type}
            <div class="container">
              <div class="dropdown level3 iconed">
                {#each Object.keys(shields[type]) as sh}
                  <NavButton onclick={event => change(event, shield, sh, "shield")}>
                    <svg class="shield" class:selected={sh === $shield} width="26" height="26" viewBox="0 0 200 210">
                      <path d={shieldPaths[sh]} />
                    </svg>
                    {sh.split(/(?=[A-Z])/).join(" ")}
                  </NavButton>
                {/each}
              </div>

              <NavItem>{type.split(/(?=[A-Z])/).join(" ")}</NavItem>
            </div>
          {/each}
        </div>

        {#key $shield}
          <NavItem tip="Shield or banner shape. If not set, a random one is selected on reroll">
            <Lock key="shield" />

            <span>Shield</span>
          </NavItem>
        {/key}
      </div>

      <NavButton onclick={showTinctures} tip="Setup tinctures (colors)">
        <Lock key="tinctures" />
        <Lock key="colors" />
        <span>Colors</span>
      </NavButton>

      <div class="container">
        <div class="dropdown level2">
          {#each gradients as gradient}
            <NavButton selected={gradient === $grad} onclick={e => change(e, grad, gradient, "grad")}>
              <span>{gradient}</span>
            </NavButton>
          {/each}
        </div>

        {#key $grad}
          <NavItem tip="Overlay style to be applied on top of coat of arms">
            <Lock key="grad" />
            <span>Gradient</span>
          </NavItem>
        {/key}
      </div>

      <div class="container">
        <div class="dropdown level2">
          {#each diapers as d}
            <NavButton selected={d === $diaper} onclick={e => change(e, diaper, d, "diaper")}>
              <span>{d}</span>
            </NavButton>
          {/each}
        </div>

        {#key $diaper}
          <NavItem tip="Backing style for coat of arms, also known as diaper">
            <Lock key="diaper" />
            <span>Damasking</span>
          </NavItem>
        {/key}
      </div>

      <div class="container">
        <div class="dropdown level2">
          {#each sizes as s}
            <NavButton selected={s[0] === $size} onclick={e => change(e, size, s[0], "size")}>
              <span>{s[1]}</span>
            </NavButton>
          {/each}
        </div>

        {#key $size}
          <NavItem tip="Coat of arms gallery size. Change to smaller value to make coat of arms bigger">
            <Lock key="size" />
            <span>Gallery</span>
          </NavItem>
        {/key}
      </div>

      <div class="container">
        <div class="dropdown level2">
          <NavItem>
            <span>Color</span>
            {#if $border !== "#333333"}
              <IconButton icon="undo" tip="Restore default color" onclick={restoreDefaultBorder} />
            {/if}
            <input type="color" bind:value={$border} />
          </NavItem>

          <NavItem>
            <span>Width</span>
            {#if $borderWidth !== 1}
              <IconButton icon="undo" tip="Restore default border width" onclick={restoreDefaultBorderWidth} />
            {/if}
            <input
              class="right"
              type="number"
              min="0"
              max="4"
              step=".1"
              on:input={function (e) {
                change(e, borderWidth, +this.value, "borderWidth");
              }}
              value={$borderWidth}
            />
          </NavItem>
        </div>

        <NavItem tip="Coat of arms border style">
          <span>Border</span>
        </NavItem>
      </div>

      <div class="container">
        <div class="dropdown level2">
          <NavItem tip="Window background color">
            <span>Color</span>
            <IconButton icon="random" tip="Use random color" onclick={getRandomColor} />

            {#if $background !== "#333333"}
              <IconButton icon="undo" tip="Restore default color" onclick={restoreDefaultBackground} />
            {/if}
            <input type="color" bind:value={$background} />
          </NavItem>
        </div>

        <NavItem tip="Window background color">
          <span>Background</span>
        </NavItem>
      </div>

      <div class="container">
        <div class="dropdown level2">
          <NavItem wide>
            <input type="range" min="1" max="4" step=".1" bind:value={$scale} />
            <input type="number" min="1" max="4" step=".1" bind:value={$scale} />
          </NavItem>
        </div>

        <NavItem tip="Downloaded image size, 1 is default size, 2 - 2x size, etc.">
          <span>Scale</span>
        </NavItem>
      </div>

      {#if !wideScreen && $state.edit}
        <NavButton onclick={showLicense} tip="Show information about license">
          <span>License</span>
        </NavButton>
      {/if}
    </div>
  </div>

  <NavButton value="rollback" disabled={!$matrix} onclick={rollback} tip="Roll to the previous list" gesture="Swipe up" hotkey="Backspace" />
  <NavButton value="reroll" onclick={reroll} tip="Regenerate coat of arms" gesture="Swipe down" hotkey="Enter" />

  <div class="container">
    <NavItem value="save" />
    <div class="dropdown level1">
      <NavButton
        onclick={() => download(null, "svg")}
        tip="Download vector image or set of images. Open in browser or load to Map Generator. Size can be set in options"
        hotkey="Ctrl + S"
      >
        <span>Download SVG</span>
      </NavButton>

      <NavButton onclick={() => download(null, "png")} tip="Download as raster image. Size can be set in options" hotkey="Ctrl + P">
        <span>Download PNG</span>
      </NavButton>

      <NavButton onclick={() => download(null, "jpeg")} tip="Download a compressed raster image. Size can be set in options" hotkey="Ctrl + J">
        <span>Download JPEG</span>
      </NavButton>

      {#if $state.edit}
        <NavButton onclick={copyEditLink} tip="Copy link to the coat of arms in Edit mode to your clipbard">
          <span>Copy edit link</span>
        </NavButton>

        <NavButton onclick={copyAPILink} tip="Copy link to the coat of arms for embedding. Armoria API does not support custom charges">
          <span>Copy API link</span>
        </NavButton>

        <NavButton onclick={copyCOA} tip="Copy coa object as encoded string to use in Armoria API or in Watabou's Medieval Fantasy City Generator">
          <span>Copy COA string</span>
        </NavButton>
      {/if}
    </div>
  </div>

  <div class="container">
    <NavItem value="upload" />
    <div class="dropdown level1">
      <NavButton onclick={showRasterUpload} tip="Upload raster charge (one color, quality loss on scale) from jpg, png or svg image">
        <span>Raster charge</span>
      </NavButton>

      <NavButton onclick={showVectorUpload} tip="Upload vector charge (multicolor and lossless scalable) from prepared svg">
        <span>Vector charge</span>
      </NavButton>
    </div>
  </div>

  {#if installable}
    <NavButton value="install" onclick={install} flutter tip="Add Armoria application to the desktop or home screen" />
  {/if}

  {#if $state.edit}
    <NavButton value="undo" disabled={!position} onclick={changes.undo} tip="Revert the latest change" gesture="Swipe left" hotkey="Z" />
    <NavButton value="redo" disabled={!redoable} onclick={changes.redo} tip="Restore the next change" gesture="Swipe right" hotkey="X" />
  {/if}

  <BackButton />

  {#if wideScreen || !$state.edit}
    <NavButton value="license" onclick={showLicense} tip="Show information about license" />
    <NavButton value="about" onclick={showAbout} tip="Show about screen" hotkey="F1" />
    <NavButton value="support" onclick={() => openURL("https://www.patreon.com/azgaar")} tip="Support the project on Patreon" />
  {/if}
</nav>

<style>
  nav {
    display: flex;
    align-items: center;
    background-color: #1b1c1d;
    height: 45px;
  }

  input[type="color"] {
    position: absolute;
    padding: 0;
    margin: -0.3em 0;
    right: 0.4em;
    border: 0;
    width: 3em;
    cursor: pointer;
  }

  input[type="range"] {
    padding: 0;
    width: 72%;
    margin: 0;
    height: 0.6em;
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
    margin: -0.25em 0;
    right: 0.4em;
    width: 3em;
  }

  .dropdown {
    display: none;
    position: fixed;
    background-color: #1b1c1d;
    min-width: 10em;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }

  .level2 {
    margin-left: 10em;
  }

  .level3 {
    z-index: 2;
    margin-left: 10em;
  }

  .container:hover > .dropdown {
    display: block;
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
</style>
