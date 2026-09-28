<script lang="ts">
  // @ts-check
  // Keeps the edited coat of arms outside this page current: the `coa` URL parameter, so a reload or a shared
  // link shows it as it is, and Fantasy Map Generator when it opened the emblem here
  import {changes, colors, message, shield, state} from "data/stores";
  import {getSvgForMap} from "scripts/download";
  import {resolveCoa} from "scripts/coa";

  const parameters = new URLSearchParams(location.search);
  const session = parameters.get("from") === "FMG" ? parameters.get("session") : null;
  const returnOrigin = parameters.get("returnOrigin");

  const SEND_DELAY = 500;
  let sent: string | null = null; // the coat of arms the map shows; the first one is the emblem as it came
  let timer: number;

  $: current = $state.edit && $changes[0] ? JSON.stringify(resolveCoa($changes[0] as string, $colors, $shield)) : null;
  $: syncUrl(current, $state.edit || $state.view);
  $: if (session && returnOrigin && current) scheduleSend(current);

  /** the URL names the coat of arms being edited, and none once the gallery is back */
  function syncUrl(coa: string | null, open: number) {
    const url = new URL(location.href);
    if (coa) {
      url.searchParams.set("coa", coa);
      url.searchParams.delete("seed"); // the coat of arms supersedes the seed it was generated from
    } else if (!open) {
      url.searchParams.delete("coa");
      url.searchParams.delete("seed");
    }
    if (url.href !== location.href) history.replaceState(history.state, "", url);
  }

  function scheduleSend(coa: string) {
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
