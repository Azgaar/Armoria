<script lang="ts">
  import {tooltip} from "scripts/tooltip";
  export let key: string;

  $: locked = localStorage.getItem(key);

  const cap = key.charAt(0).toUpperCase() + key.slice(1);
  const tip = cap + " value is saved and auto-applied. Click to remove saved value and use default settings on load";

  function unlock(event: Event) {
    event.stopPropagation();
    localStorage.removeItem(key);
    locked = "";
  }
</script>

{#if Boolean(locked)}
  <span style="cursor: pointer" on:click={unlock} title={tip} use:tooltip>🔖</span>
{/if}
