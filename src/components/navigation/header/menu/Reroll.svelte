<script lang="ts">
  // @ts-check
  import {_ as t} from "svelte-i18n";
  import {matrix} from "data/stores";
  import NavButton from "../shared/NavButton.svelte";

  const reroll = () => {
    $matrix += 1;
  };
</script>

<NavButton value="reroll" label={$t(`menu.reroll`)} onclick={reroll} tip="Regenerate coat of arms" gesture="Swipe down" hotkey="Enter" />
