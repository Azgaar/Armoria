<script>
  import {tooltip} from '../../scripts/tooltip';
  export let key;
  $: locked = localStorage.getItem(key);

  const cap = key.charAt(0).toUpperCase() + key.slice(1);
  const tip = cap + " value is saved and auto-applied. Click to remove saved value and use default settings on load";

  function unlock(e) {
    e.stopPropagation();
    localStorage.removeItem(key);
    locked = false;
  }
</script>

{#if locked}
  <span style="cursor: pointer" on:click={unlock} title={tip} use:tooltip>🔖</span>
{/if}