<script>
  import {t} from "svelte-i18n";
  import {changes, state, history} from "$lib/data/stores";
  import NavButton from "../shared/NavButton.svelte";

  const exitEdit = () => {
    $history[$state.c] = JSON.parse($changes[0]);
    $state.edit = 0;
    $state.selectedPath = -1;
  };
</script>

<NavButton right value="back" label={$t(`menu.back`)} onclick={exitEdit} tip={$t("tooltip.back")} hotkey="Escape" />
