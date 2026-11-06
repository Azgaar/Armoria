<svelte:options runes />

<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {state as editorState, matrix} from "#lib/data/stores.ts";
  import NavButton from "../shared/NavButton.svelte";

  const reroll = () => {
    matrix.update(value => value + 1);
  };
</script>

<NavButton
  value="reroll"
  label={$t(`menu.reroll`)}
  onclick={reroll}
  tip={$t($editorState.edit ? "tooltip.rerollEdit" : "tooltip.reroll")}
  gesture={$t("tooltip.swipeDown")}
  hotkey="Enter"
/>
