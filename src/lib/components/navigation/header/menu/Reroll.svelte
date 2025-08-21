<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {state, matrix} from "$lib/data/stores";
  import NavButton from "../shared/NavButton.svelte";

  const reroll = () => {
    $matrix += 1;
  };
</script>

<NavButton
  value="reroll"
  label={$t(`menu.reroll`)}
  onclick={reroll}
  tip={$t($state.edit ? "tooltip.rerollEdit" : "tooltip.reroll")}
  gesture={$t("tooltip.swipeDown")}
  hotkey="Enter"
/>
