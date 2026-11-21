<script lang="ts">
  import {onMount} from "svelte";
  import {on} from "svelte/events";
  import {t} from "svelte-i18n";
  import {message} from "#lib/data/stores.ts";
  import NavButton from "../shared/NavButton.svelte";

  let promptEvent: globalThis.BeforeInstallPromptEvent | null = $state.raw(null);

  function install() {
    const event = promptEvent;
    // Each prompt can be used only once. A later event belongs to a new offer,
    // even if the previous prompt's userChoice has not resolved yet.
    promptEvent = null;
    event?.prompt();
  }

  onMount(() => {
    const stopPrompt = on(window, "beforeinstallprompt", event => {
      promptEvent = event;
    });
    const stopInstalled = on(window, "appinstalled", () => {
      promptEvent = null;
      message.success("success.install");
    });
    return () => {
      stopPrompt();
      stopInstalled();
    };
  });
</script>

{#if promptEvent}
  <NavButton value="install" label={$t(`menu.install`)} onclick={install} flutter tip={$t("tooltip.install")} />
{/if}
