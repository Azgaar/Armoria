<script lang="ts">
  // @ts-check
  import {_ as t} from "svelte-i18n";
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

  window.addEventListener("appinstalled", e => {
    $message = {type: "success", text: `Armoria application is installed`, timeout: 5000};
  });
</script>

{#if installable}
  <NavButton value="install" label={$t(`menu.install`)} onclick={install} flutter tip="Add Armoria application to the desktop or home screen" />
{/if}
