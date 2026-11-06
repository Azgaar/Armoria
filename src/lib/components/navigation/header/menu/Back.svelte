<svelte:options runes />

<script>
  import {t} from "svelte-i18n";
  import {changes, state as editorState, history} from "#lib/data/stores.ts";
  import NavButton from "../shared/NavButton.svelte";

  const exitEdit = () => {
    $history[$editorState.c] = JSON.parse($changes[0]);
    $editorState.edit = 0;
    $editorState.selectedPath = -1;
  };
</script>

<NavButton right value="back" label={$t(`menu.back`)} onclick={exitEdit} tip={$t("tooltip.back")} hotkey="Escape" />
