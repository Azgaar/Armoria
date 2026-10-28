<script lang="ts">
  import {settingsStorage} from "$lib/data/storage";
  // @ts-check
  import {t} from "svelte-i18n";
  import {tooltip} from "$lib/scripts/tooltip";
  export let key: string;

  $: locked = settingsStorage.getItem(key);
  $: tip = $t(`tooltip.locked`);

  function unlock(event: Event) {
    event.stopPropagation();
    settingsStorage.removeItem(key);
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
