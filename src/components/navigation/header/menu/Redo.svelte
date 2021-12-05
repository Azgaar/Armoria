<script lang="ts">
  // @ts-check
  import {_ as t} from "svelte-i18n";
  import {changes} from "data/stores";
  import NavButton from "../shared/NavButton.svelte";

  $: redoable = $changes[1] < changes.length() - 1;
</script>

<NavButton value="redo" label={$t(`menu.redo`)} disabled={!redoable} onclick={changes.redo} tip="Restore the next change" gesture="Swipe right" hotkey="X" />
