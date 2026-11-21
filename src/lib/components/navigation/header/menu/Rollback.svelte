<svelte:options runes />

<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {state as editorState, matrix} from "#lib/data/stores.ts";
  import NavButton from "../shared/NavButton.svelte";

  const rollback = () => {
    $matrix -= 1;
  };
</script>

<NavButton
  value="rollback"
  label={$t(`menu.rollback`)}
  disabled={!$matrix}
  onclick={rollback}
  tip={$t($editorState.edit ? "tooltip.rollbackEdit" : "tooltip.rollback")}
  gesture={$t("tooltip.swipeUp")}
  hotkey="Backspace"
/>
