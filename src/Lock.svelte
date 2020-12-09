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
  <Tooltip tip="Option is locked. Selected value will be always used on app load. Click to unlock and apply default value on load">
    <span style="cursor: pointer" on:click={unlock}>🔒</span>
  </Tooltip>
{/if}