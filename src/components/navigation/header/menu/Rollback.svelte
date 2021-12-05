<script lang="ts">
  // @ts-check
  import {_ as t} from "svelte-i18n";
  import {matrix} from "data/stores";
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
  tip="Roll to the previous list"
  gesture="Swipe up"
  hotkey="Backspace"
/>
