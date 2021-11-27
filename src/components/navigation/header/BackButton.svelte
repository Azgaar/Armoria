<script>
  import {fade} from "svelte/transition";
  import NavButton from "./NavButton.svelte";
  import {state} from "data/stores";

  const exitEdit = () => {
    $state.edit = 0;
  };
</script>

{#if $state.edit}
  <div transition:fade>
    <NavButton onclick={exitEdit} tip="Get back to Gallery" hotkey="Escape">
      <slot />
    </NavButton>
  </div>
{/if}

<style>
  div {
    position: absolute;
    right: 0;
  }
</style>
