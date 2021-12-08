<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {message} from "data/stores";
  import NavButton from "../shared/NavButton.svelte";

  let installable = false;
  let promptEvent = null;

  function install() {
    installable = false;
    promptEvent.prompt();
    promptEvent.userChoice.then(() => {
      promptEvent = null;
    });
  }

  window.addEventListener("beforeinstallprompt", event => {
    promptEvent = event;
    installable = true;
  });

  window.addEventListener("appinstalled", () => {
    message.success($t("success.install"));
  });
</script>

{#if installable}
  <NavButton value="install" label={$t(`menu.install`)} onclick={install} flutter tip={$t("tooltip.install")} />
{/if}
