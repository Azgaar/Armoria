<script lang="ts">
  // @ts-check
  // Keeps the edited coat of arms outside this page current: the `coa` URL parameter, so a reload or a shared
  // link shows it as it is, and Fantasy Map Generator when it opened the emblem here
  import {changes, colors, shield, state} from "$lib/data/stores";
  import {getSvgForMap} from "$lib/scripts/download";
  import {resolveCoa} from "$lib/scripts/coa";
  import {afterNavigate, replaceState} from "$app/navigation";
  import {page} from "$app/stores";

  const parameters = new URLSearchParams(location.search);
  const session = parameters.get("from") === "FMG" ? parameters.get("session") : null;
  const returnOrigin = parameters.get("returnOrigin");

  const SEND_DELAY = 500;
  let sent: string | null = null; // the coat of arms the map shows; the first one is the emblem as it came
  let timer: number;
  let routerReady = false;
  afterNavigate(() => {
    routerReady = true;
  });

  $: current = $state.edit && $changes[0] ? JSON.stringify(resolveCoa($changes[0] as string, $colors, $shield)) : null;
  $: if (routerReady) syncUrl(current, $state.edit || $state.view);
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
    if (url.href !== location.href) replaceState(url, $page.state);
  }

  function scheduleSend(coa: string) {
    if (sent === null) sent = coa;
    window.clearTimeout(timer);
    if (coa !== sent) timer = window.setTimeout(() => sendToMap(coa), SEND_DELAY);
  }

  async function sendToMap(coa: string) {
    if (!window.opener || window.opener.closed) return;
    let svg = "";
    try {
      svg = await getSvgForMap();
    } catch (error) {
      console.error(error); // the map still draws a coat of arms it knows; only its picture fallback is lost
    }
    window.opener.postMessage({type: "armoria:coa", version: 1, session, coa: JSON.parse(coa), svg}, returnOrigin);
    sent = coa;
  }
</script>
