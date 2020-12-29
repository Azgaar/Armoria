<script>
  import Tooltip from './Tooltip.svelte';
  export let key;
  $: locked = localStorage.getItem(key);

  const cap = string => string.charAt(0).toUpperCase() + string.slice(1);
  const tip = cap(key) + " value is saved and auto-applied. Click to remove saved value and use default settings on load";

  function unlock() {
    localStorage.removeItem(key);
    locked = false;
  }
</script>

{#if locked}
  <Tooltip {tip}>
    <span style="cursor: pointer" on:click={unlock}>🔖</span>
  </Tooltip>
{/if}