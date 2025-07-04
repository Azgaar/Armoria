<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {tooltip} from "scripts/tooltip";

  export let zoom: number;
</script>

<div class="subsection">
  <span data-tooltip={$t("tooltip.zoom")} use:tooltip>
    <span>{$t("editor.zoom")}:</span>
    <input type="number" min="0.1" max="1" step="0.1" bind:value={zoom} />
  </span>
</div>

<style>
  input[type="number"] {
    width: 4em;
  }
</style>
