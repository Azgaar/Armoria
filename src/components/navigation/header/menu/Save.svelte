<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {download} from "scripts/download";
  import {resolveCoa} from "scripts/coa";
  import {changes, colors, history, matrices, matrix, message, shield, state} from "data/stores";
  import NavButton from "../shared/NavButton.svelte";
  import NavItem from "../shared/NavItem.svelte";

  // exports and links carry the coat of arms as drawn here: its shield and custom colours included
  const resolved = (coa: string) => resolveCoa(coa, $colors, $shield);

  function exportJSON() {
    if ($state.edit) {
      download([resolved($changes[0])], "json");
    } else {
      const coas = $matrices[$matrix].map(index => resolved(JSON.stringify($history[index])));
      download(coas, "json");
    }
  }

  function copyToClipboard(stringToCopy: string, text: string) {
    message.clear();

    navigator.clipboard.writeText(stringToCopy).then(
      () => {
        setTimeout(() => {
          message.success(text);
        }, 500);
      },
      err => {
        message.error("error.copyToClipboard");
        console.error(err);
      }
    );
  }

  /** the edited coat of arms as a URL-safe string: hex colours' "#" would otherwise start a fragment */
  const coaString = () => encodeURI(JSON.stringify(resolved($changes[0] as string))).replaceAll("#", "%23");

  function copyEditLink() {
    const url = location.origin + location.pathname + "?coa=" + coaString();
    copyToClipboard(url, "success.copyEditLink");
  }

  function copyApiLink() {
    const API = "https://armoria.herokuapp.com/";
    const url = `${API}?size=500&format=png&coa=${coaString()}`;
    copyToClipboard(url, "success.copyApiLink");
  }

  function copyCoaString() {
    copyToClipboard(coaString(), "success.copyCoaString");
  }
</script>

<div class="container">
  <NavItem value="save" label={$t(`menu.save`)} />
  <div class="dropdown level1">
    <NavButton onclick={() => download(null, "svg")} tip={$t("tooltip.downloadSVG")} hotkey="Ctrl + S">{$t(`menu.downloadSVG`)}</NavButton>
    <NavButton onclick={() => download(null, "png")} tip={$t("tooltip.downloadPNG")} hotkey="Ctrl + P">{$t(`menu.downloadPNG`)}</NavButton>
    <NavButton onclick={() => download(null, "jpeg")} tip={$t("tooltip.downloadJPEG")} hotkey="Ctrl + J">{$t(`menu.downloadJPEG`)}</NavButton>
    <NavButton onclick={exportJSON} tip={$t("tooltip.exportJSON")}>{$t(`menu.exportJSON`)}</NavButton>

    {#if $state.edit}
      <NavButton onclick={copyEditLink} tip={$t("tooltip.copyEditLink")}>{$t(`menu.copyEditLink`)}</NavButton>
      <NavButton onclick={copyApiLink} tip={$t("tooltip.copyApiLink")}>{$t(`menu.copyApiLink`)}</NavButton>
      <NavButton onclick={copyCoaString} tip={$t("tooltip.copyCoaString")}>{$t(`menu.copyCoaString`)}</NavButton>
    {/if}
  </div>
</div>
