<script>
  import {fade} from "svelte/transition";
  import NavButton from "../shared/NavButton.svelte";
  import {iconedNavbar} from "config/layout";
  import {state} from "data/stores";

  const exitEdit = () => {
    $state.edit = 0;
  };
</script>

{#if $state.edit}
  <div transition:fade>
    <NavButton onclick={exitEdit} tip="Get back to Gallery" hotkey="Escape">
      {#if iconedNavbar}
        <svg>
          <use href="#back-icon" />
        </svg>
      {:else}
        Back
      {/if}
    </NavButton>
  </div>
{/if}

<style>
  div {
    position: absolute;
    right: 0;
  }

  svg {
    fill: currentColor;
    stroke: none;
    width: 1em;
    height: 1em;
    vertical-align: middle;
  }
</style>
