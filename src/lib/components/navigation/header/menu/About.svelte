<svelte:options runes />

<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {state as editorState} from "#lib/data/stores.ts";
  import NavButton from "../shared/NavButton.svelte";

  const showAbout = () => {
    $editorState.about = 1;
  };
</script>

<NavButton value="about" label={$t(`menu.about`)} onclick={showAbout} tip={$t("tooltip.about")} hotkey="F1" />
