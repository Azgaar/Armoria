<script lang="ts">
  // @ts-check
  import {changes, matrix, message, scale, state} from "data/stores";
  import {download} from "scripts/download";
  import {openURL} from "scripts/utils";
  import BackButton from "./menu/BackButton.svelte";
  import Logo from "./menu/Logo.svelte";
  import NavBackgroundOption from "./menu/options/NavBackgroundOption.svelte";
  import NavBorderOption from "./menu/options/NavBorderOption.svelte";
  import NavColorsOption from "./menu/options/NavColorsOption.svelte";
  import NavDamaskingOption from "./menu/options/NavDamaskingOption.svelte";
  import NavGalleryOption from "./menu/options/NavGalleryOption.svelte";
  import NavGradientOption from "./menu/options/NavGradientOption.svelte";
  import NavScaleOption from "./menu/options/NavScaleOption.svelte";
  import NavShieldOption from "./menu/options/NavShieldOption.svelte";
  import NavButton from "./shared/NavButton.svelte";
  import NavItem from "./shared/NavItem.svelte";

  let installable = false;
  let prompt = null;

  const wideScreen = window.innerWidth > 600;

  $: position = $changes[1];
  $: redoable = position < changes.length() - 1;

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
</script>

<nav>
  <Logo />

  <div class="container">
    <NavItem value="options" />

    <div class="dropdown level1">
      <NavShieldOption />
      <NavColorsOption />
      <NavGradientOption />
      <NavDamaskingOption />
      <NavGalleryOption />
      <NavBorderOption />
      <NavBackgroundOption />
      <NavScaleOption />

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
</style>
