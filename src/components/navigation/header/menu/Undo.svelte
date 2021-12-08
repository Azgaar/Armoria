<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {changes} from "data/stores";
  import NavButton from "../shared/NavButton.svelte";

  $: position = $changes[1];
</script>

<NavButton
  value="undo"
  label={$t(`menu.undo`)}
  disabled={!position}
  onclick={changes.undo}
  tip={$t("tooltip.undo")}
  gesture={$t("tooltip.swipeLeft")}
  hotkey="Z"
/>
