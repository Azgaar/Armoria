<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {state, matrix} from "$lib/data/stores";
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
  tip={$t($state.edit ? "tooltip.rollbackEdit" : "tooltip.rollback")}
  gesture={$t("tooltip.swipeUp")}
  hotkey="Backspace"
/>
