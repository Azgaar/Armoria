<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import NavButton from "../shared/NavButton.svelte";
  import {openURL} from "scripts/utils";

  const openPatreon = () => {
    openURL("https://www.patreon.com/azgaar");
  };
</script>

<NavButton value="support" label={$t(`menu.support`)} onclick={openPatreon} tip="Support the project on Patreon" />
