<script lang="ts">
  // @ts-check
  import {_ as t} from "svelte-i18n";
  import {download} from "scripts/download";
  import {changes, message, state} from "data/stores";
  import NavButton from "../shared/NavButton.svelte";
  import NavItem from "../shared/NavItem.svelte";

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
</script>

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
