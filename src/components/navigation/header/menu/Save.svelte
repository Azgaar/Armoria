<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
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
        $message = {type: "error", text: $t("error.copyToClipboard"), timeout: 5000};
        console.error(err);
      }
    );
  }

  function copyEditLink() {
    const coa = ($changes[0] as string).replaceAll("#", "%23");
    const url = location.origin + location.pathname + "?coa=" + coa;
    copyToClipboard(url, $t("success.copyEditLink"));
  }

  function copyApiLink() {
    const encoded = encodeURI($changes[0] as string);
    const API = "https://armoria.herokuapp.com/";
    const url = `${API}?size=500&format=png&coa=${encoded}`;
    copyToClipboard(url, $t("success.copyApiLink"));
  }

  function copyCoaString() {
    const encoded = encodeURI($changes[0] as string);
    copyToClipboard(encoded, $t("success.copyCoaString"));
  }
</script>

<div class="container">
  <NavItem value="save" label={$t(`menu.save`)} />
  <div class="dropdown level1">
    <NavButton onclick={() => download(null, "svg")} tip={$t("tooltip.downloadSVG")} hotkey="Ctrl + S">{$t(`menu.downloadSVG`)}</NavButton>
    <NavButton onclick={() => download(null, "png")} tip={$t("tooltip.downloadPNG")} hotkey="Ctrl + P">{$t(`menu.downloadPNG`)}</NavButton>
    <NavButton onclick={() => download(null, "jpeg")} tip={$t("tooltip.downloadJPEG")} hotkey="Ctrl + J">{$t(`menu.downloadJPEG`)}</NavButton>

    {#if $state.edit}
      <NavButton onclick={copyEditLink} tip={$t("tooltip.copyEditLink")}>{$t(`menu.copyEditLink`)}</NavButton>
      <NavButton onclick={copyApiLink} tip={$t("tooltip.copyApiLink")}>{$t(`menu.copyApiLink`)}</NavButton>
      <NavButton onclick={copyCoaString} tip={$t("tooltip.copyCoaString")}>{$t(`menu.copyCoaString`)}</NavButton>
    {/if}
  </div>
</div>
