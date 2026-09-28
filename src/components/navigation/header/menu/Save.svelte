<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {download, getSvgForMap} from "scripts/download";
  import {changes, history, matrices, matrix, message, state} from "data/stores";
  import NavButton from "../shared/NavButton.svelte";
  import NavItem from "../shared/NavItem.svelte";

  function exportJSON() {
    if ($state.edit) {
      download([JSON.parse($changes[0])], "json");
    } else {
      const coas = [];
      for (const index of $matrices[$matrix]) {
        const coa = {...$history[index]};
        delete coa.seed;
        coas.push(coa);
      }
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

  function copyEditLink() {
    const coa = ($changes[0] as string).replaceAll("#", "%23");
    const url = location.origin + location.pathname + "?coa=" + coa;
    copyToClipboard(url, "success.copyEditLink");
  }

  function copyApiLink() {
    const encoded = encodeURI($changes[0] as string);
    const API = "https://armoria.herokuapp.com/";
    const url = `${API}?size=500&format=png&coa=${encoded}`;
    copyToClipboard(url, "success.copyApiLink");
  }

  function copyCoaString() {
    const encoded = encodeURI($changes[0] as string);
    copyToClipboard(encoded, "success.copyCoaString");
  }

  const parameters = new URLSearchParams(location.search);
  const session = parameters.get("from") === "FMG" ? parameters.get("session") : null;
  const returnOrigin = parameters.get("returnOrigin");

  // opened from Fantasy Map Generator: each edit goes back to the map once the editing pauses
  const SEND_DELAY = 500;
  let sent: string | null = null; // the blazon the map shows; the first one is the emblem as it came
  let timer: number;

  $: if (session && returnOrigin && $state.edit) scheduleSend($changes[0] as string);

  function scheduleSend(coa: string) {
    if (!coa) return;
    if (sent === null) sent = coa;
    window.clearTimeout(timer);
    if (coa !== sent) timer = window.setTimeout(() => sendToMap(coa), SEND_DELAY);
  }

  async function sendToMap(coa: string) {
    if (!window.opener || window.opener.closed) return;
    try {
      const svg = await getSvgForMap();
      window.opener.postMessage({type: "armoria:coa", version: 1, session, coa: JSON.parse(coa), svg}, returnOrigin);
      sent = coa;
    } catch (error) {
      console.error(error);
      message.error("Could not send the emblem to the map");
    }
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
