<svelte:options runes />

<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {state as editorState} from "#lib/data/stores.ts";
  import NavButton from "../shared/NavButton.svelte";

  const showLicense = () => {
    $editorState.license = 1;
  };
</script>

<NavButton value="license" label={$t(`menu.license`)} onclick={showLicense} tip={$t("tooltip.license")} />
