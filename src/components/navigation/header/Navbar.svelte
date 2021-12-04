<script lang="ts">
  // @ts-check
  import {_ as t} from "svelte-i18n";
  import {locale, locales, dictionary} from "svelte-i18n";
  import {changes, matrix, message, state} from "data/stores";
  import {localeMap} from "scripts/i18n";
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

  $locale = "en"; // fallback locale
  console.log($locales, $locale, $dictionary);

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

  const changeLanguage = (newLocale: string) => {
    locale.set(newLocale);
  };

  window.addEventListener("beforeinstallprompt", e => {
    prompt = e;
    installable = true;
  });

  window.addEventListener("appinstalled", e => {
    $message = {type: "success", text: `Armoria application is installed`, timeout: 5000};
  });
</script>

<nav>
  <Logo />

  <div class="container">
    <NavItem value="options" label={$t(`menu.options`)} />

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

  <NavButton
    value="rollback"
    label={$t(`menu.rollback`)}
    disabled={!$matrix}
    onclick={rollback}
    tip="Roll to the previous list"
    gesture="Swipe up"
    hotkey="Backspace"
  />
  <NavButton value="reroll" label={$t(`menu.reroll`)} onclick={reroll} tip="Regenerate coat of arms" gesture="Swipe down" hotkey="Enter" />

  <div class="container">
    <NavItem value="save" label={$t(`menu.save`)} />
    <div class="dropdown level1">
      <NavButton
        onclick={() => download(null, "svg")}
        tip="Download vector image or set of images. Open in browser or load to Map Generator. Size can be set in options"
        hotkey="Ctrl + S"
      >
        {$t(`menu.downloadSVG`)}
      </NavButton>

      <NavButton onclick={() => download(null, "png")} tip="Download as raster image. Size can be set in options" hotkey="Ctrl + P">
        {$t(`menu.downloadPNG`)}
      </NavButton>

      <NavButton onclick={() => download(null, "jpeg")} tip="Download a compressed raster image. Size can be set in options" hotkey="Ctrl + J">
        {$t(`menu.downloadJPEG`)}
      </NavButton>

      {#if $state.edit}
        <NavButton onclick={copyEditLink} tip="Copy link to the coat of arms in Edit mode to your clipbard">
          {$t(`menu.copyEditLink`)}
        </NavButton>

        <NavButton onclick={copyAPILink} tip="Copy link to the coat of arms for embedding. Armoria API does not support custom charges">
          {$t(`menu.copyApiLink`)}
        </NavButton>

        <NavButton onclick={copyCOA} tip="Copy coa object as encoded string to use in Armoria API or in Watabou's Medieval Fantasy City Generator">
          {$t(`menu.copyCoaString`)}
        </NavButton>
      {/if}
    </div>
  </div>

  <div class="container">
    <NavItem value="upload" label={$t(`menu.upload`)} />
    <div class="dropdown level1">
      <NavButton onclick={showRasterUpload} tip="Upload raster charge (one color, quality loss on scale) from jpg, png or svg image">
        {$t(`menu.rasterCharge`)}
      </NavButton>

      <NavButton onclick={showVectorUpload} tip="Upload vector charge (multicolor and lossless scalable) from prepared svg">
        {$t(`menu.vectorCharge`)}
      </NavButton>
    </div>
  </div>

  {#if installable}
    <NavButton value="install" label={$t(`menu.install`)} onclick={install} flutter tip="Add Armoria application to the desktop or home screen" />
  {/if}

  {#if $state.edit}
    <NavButton
      value="undo"
      label={$t(`menu.undo`)}
      disabled={!position}
      onclick={changes.undo}
      tip="Revert the latest change"
      gesture="Swipe left"
      hotkey="Z"
    />
    <NavButton
      value="redo"
      label={$t(`menu.redo`)}
      disabled={!redoable}
      onclick={changes.redo}
      tip="Restore the next change"
      gesture="Swipe right"
      hotkey="X"
    />
  {/if}

  <BackButton />

  {#if wideScreen || !$state.edit}
    <NavButton value="license" label={$t(`menu.license`)} onclick={showLicense} tip="Show information about license" />
    <NavButton value="about" label={$t(`menu.about`)} onclick={showAbout} tip="Show about screen" hotkey="F1" />
    <NavButton value="support" label={$t(`menu.support`)} onclick={() => openURL("https://www.patreon.com/azgaar")} tip="Support the project on Patreon" />
  {/if}

  {#if !$state.edit}
    <div class="container">
      <NavItem value="language" label={$t(`menu.language`)} />
      <div class="dropdown level1">
        {#each $locales as locale}
          <NavButton label={localeMap[locale]} onclick={() => changeLanguage(locale)} />
        {/each}
      </div>
    </div>
  {/if}
</nav>

<style>
  nav {
    display: flex;
    align-items: center;
    background-color: #1b1c1d;
    height: 45px;
  }
</style>
