<script>
  import Tooltip from './Tooltip.svelte';
  export let key;
  $: locked = localStorage.getItem(key);

  function unlock() {
    localStorage.removeItem(key);
    locked = false;
  }
</script>

{#if locked}
  <Tooltip tip="Selected value will be used on app load. Click to apply default value on load">
    <span style="cursor: pointer" on:click={unlock}>🔖</span>
  </Tooltip>
{/if}