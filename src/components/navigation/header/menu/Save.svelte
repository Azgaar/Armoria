<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {download, getSvgForMap} from "scripts/download";
  import {DEFAULT_COLORS} from "config/defaults";
  import {changes, colors, history, matrices, matrix, message, state} from "data/stores";
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

  // opened from Fantasy Map Generator: each edit or recolouring goes back to the map once the editing pauses
  const SEND_DELAY = 500;
  let sent: string | null = null; // the update the map shows; the first one is the emblem as it came
  let timer: number;

  $: if (session && returnOrigin && $state.edit) scheduleSend($changes[0] as string, customColors($colors));

  /** the tinctures recoloured or added here, which the map would otherwise draw in its default shades */
  function customColors(palette: Record<string, string>): Record<string, string> {
    return Object.fromEntries(Object.entries(palette).filter(([name, color]) => DEFAULT_COLORS[name] !== color));
  }

  /** the blazon as the map should draw it: a tincture recoloured or added here becomes its hex colour */
  function withShades(coa: string, shades: Record<string, string>) {
    const shade = (tincture: string | undefined) => {
      if (!tincture) return tincture;
      const parts = tincture.split("-"); // a pattern names its tinctures second and third
      if (parts.length === 1) return shades[tincture] ?? tincture;
      return parts.map((part, i) => ((i === 1 || i === 2) && shades[part]) || part).join("-");
    };
    const blazon = JSON.parse(coa);
    blazon.t1 = shade(blazon.t1);
    if (blazon.division) blazon.division.t = shade(blazon.division.t);
    for (const ordinary of blazon.ordinaries ?? []) {
      ordinary.t = shade(ordinary.t);
      if (ordinary.t2) ordinary.t2 = shade(ordinary.t2);
    }
    for (const charge of blazon.charges ?? []) {
      charge.t = shade(charge.t);
      if (charge.t2) charge.t2 = shade(charge.t2);
      if (charge.t3) charge.t3 = shade(charge.t3);
    }
    return blazon;
  }

  function scheduleSend(coa: string, colors: Record<string, string>) {
    if (!coa) return;
    const update = JSON.stringify(withShades(coa, colors));
    if (sent === null) sent = update;
    window.clearTimeout(timer);
    if (update !== sent) timer = window.setTimeout(() => sendToMap(update), SEND_DELAY);
  }

  async function sendToMap(update: string) {
    if (!window.opener || window.opener.closed) return;
    try {
      const svg = await getSvgForMap();
      window.opener.postMessage({type: "armoria:coa", version: 1, session, coa: JSON.parse(update), svg}, returnOrigin);
      sent = update;
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
