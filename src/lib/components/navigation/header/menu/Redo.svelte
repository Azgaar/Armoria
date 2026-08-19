<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {changes} from "$lib/data/stores";
  import NavButton from "../shared/NavButton.svelte";

  $: redoable = $changes[1] < changes.length() - 1;
</script>

<NavButton
  value="redo"
  label={$t(`menu.redo`)}
  disabled={!redoable}
  onclick={changes.redo}
  tip={$t(`tooltip.redo`)}
  gesture={$t("tooltip.swipeRight")}
  hotkey="X"
/>
