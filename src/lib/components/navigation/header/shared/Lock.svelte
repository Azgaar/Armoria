<script lang="ts">
  import {settingsStorage} from "#lib/data/storage.ts";
  // @ts-check
  import {t} from "svelte-i18n";
  import {tooltip} from "#lib/scripts/tooltip.ts";
  let {key}: {key: string} = $props();

  let locked = $derived(settingsStorage.getItem(key));
  const tip = $derived($t("tooltip.locked"));

  function unlock(event: Event) {
    event.stopPropagation();
    settingsStorage.removeItem(key);
    locked = "";
  }
</script>

{#if Boolean(locked)}
  <span onclick={unlock} data-tooltip={tip} use:tooltip>🔖</span>
{/if}

<style>
  span {
    cursor: pointer;
  }
</style>
