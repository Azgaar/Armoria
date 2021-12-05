<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {tooltip} from "scripts/tooltip";
  export let key: string;

  $: locked = localStorage.getItem(key);
  $: tip = $t(`tooltip.locked`);

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
