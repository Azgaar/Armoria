<script lang="ts">
  import {t} from "svelte-i18n";
  import {storageStatus} from "$lib/data/storage";

  let dismissed = false;
</script>

{#if !dismissed && ($storageStatus.recovered || $storageStatus.unavailable)}
  <aside role="status" data-settings-notice>
    <span>{$t($storageStatus.unavailable ? "info.storageUnavailable" : "info.settingsRecovered")}</span>
    <button type="button" aria-label={$t("info.dismissSettingsNotice")} on:click={() => (dismissed = true)}>&times;</button>
  </aside>
{/if}

<style>
  aside {
    position: fixed;
    right: 1em;
    bottom: 1em;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 1em;
    max-width: min(32em, calc(100vw - 4em));
    padding: 0.8em;
    color: #fff;
    background: #333;
    border: 1px solid #b98d39;
  }
  button {
    color: inherit;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.5em;
  }
</style>
