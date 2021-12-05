<script>
  import {_ as t} from "svelte-i18n";
  import {state} from "data/stores";
  import NavButton from "../shared/NavButton.svelte";

  const exitEdit = () => {
    $state.edit = 0;
  };
</script>

{#if $state.edit}
  <NavButton right value="back" label={$t(`menu.back`)} onclick={exitEdit} tip="Get back to Gallery" hotkey="Escape" />
{/if}
