<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {state} from "data/stores";
  import NavButton from "../shared/NavButton.svelte";

  const showAbout = () => {
    $state.about = 1;
  };
</script>

<NavButton value="about" label={$t(`menu.about`)} onclick={showAbout} tip="Show about screen" hotkey="F1" />
