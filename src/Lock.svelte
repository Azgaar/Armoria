<script>
  import {message} from './stores.js';
  export let key;
  $: locked = localStorage.getItem(key);

  function showMessage() {
    const cap = key.charAt(0).toUpperCase() + key.slice(1);
    const text = cap + " value is saved and auto-applied. Click to remove saved value and use default settings on load";
    $message = {text, type: "tip", timeout: 30000};
  }

  function hideMessage() {
    $message = null;
  }

  function unlock(e) {
    e.stopPropagation();
    localStorage.removeItem(key);
    locked = false;
  }
</script>

{#if locked}
  <span style="cursor: pointer" on:mouseenter={showMessage} on:mouseleave={hideMessage} on:click={unlock}>🔖</span>
{/if}