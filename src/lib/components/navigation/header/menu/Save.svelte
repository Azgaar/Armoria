<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {download} from "$lib/scripts/download";
  import {resolveCoa} from "$lib/scripts/coa";
  import {changes, colors, history, matrices, matrix, message, shield, state} from "$lib/data/stores";
  import NavButton from "../shared/NavButton.svelte";
  import NavItem from "../shared/NavItem.svelte";

  // exports and links carry the coat of arms as drawn here: its shield and custom colours included
  const resolved = (coa: string) => resolveCoa(coa, $colors, $shield);

  function exportJSON() {
    if ($state.edit) {
      download([resolved($changes[0])], "json");
    } else {
      const coas = ($matrices[$matrix] as number[]).map(index => resolved(JSON.stringify($history[index])));
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

  // Keep JSON unencoded until it is placed into a URL query or copied as a component.
  const coaString = () => JSON.stringify(resolved($changes[0] as string));

  function copyEditLink() {
    const url = new URL(location.origin);
    url.pathname = location.pathname;
    url.searchParams.set("coa", coaString());
    copyToClipboard(url.href, "success.copyEditLink");
  }

  function copyApiLink() {
    const url = new URL("https://armoria.vercel.app/api");
    url.searchParams.set("size", "500");
    url.searchParams.set("format", "png");
    url.searchParams.set("coa", coaString());
    copyToClipboard(url.href, "success.copyApiLink");
  }

  function copyCoaString() {
    // One percent-encoded query value; decodeURIComponent once to recover JSON.
    copyToClipboard(encodeURIComponent(coaString()), "success.copyCoaString");
  }
</script>

<div class="container">
  <NavItem value="save" label={$t(`menu.save`)} />
  <div class="dropdown level1">
    <NavButton onclick={() => download(null, "svg")} tip={$t("tooltip.downloadSVG")} hotkey="Ctrl + S"
      >{$t(`menu.downloadSVG`)}</NavButton
    >
    <NavButton onclick={() => download(null, "png")} tip={$t("tooltip.downloadPNG")} hotkey="Ctrl + P"
      >{$t(`menu.downloadPNG`)}</NavButton
    >
    <NavButton onclick={() => download(null, "jpeg")} tip={$t("tooltip.downloadJPEG")} hotkey="Ctrl + J"
      >{$t(`menu.downloadJPEG`)}</NavButton
    >
    <NavButton onclick={exportJSON} tip={$t("tooltip.exportJSON")}>{$t(`menu.exportJSON`)}</NavButton>

    {#if $state.edit}
      <NavButton onclick={copyEditLink} tip={$t("tooltip.copyEditLink")}>{$t(`menu.copyEditLink`)}</NavButton>
      <NavButton onclick={copyApiLink} tip={$t("tooltip.copyApiLink")}>{$t(`menu.copyApiLink`)}</NavButton>
      <NavButton onclick={copyCoaString} tip={$t("tooltip.copyCoaString")}>{$t(`menu.copyCoaString`)}</NavButton>
    {/if}
  </div>
</div>
