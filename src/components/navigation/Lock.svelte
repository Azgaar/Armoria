<script lang="ts">
  import {tooltip} from "scripts/tooltip";
  import {capitalize} from "scripts/utils";
  export let key: string;

  $: locked = localStorage.getItem(key);

  const tip = capitalize(key) + " value is saved and auto-applied. Click to remove saved value and use default settings on load";

  function unlock(event: Event) {
    event.stopPropagation();
    localStorage.removeItem(key);
    locked = "";
  }
</script>

{#if Boolean(locked)}
  <span on:click={unlock} data-tooltip={tip} use:tooltip>🔖</span>
{/if}

<style>
  span {
    cursor: pointer;
  }
</style>
