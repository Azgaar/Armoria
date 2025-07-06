<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {tooltip} from "scripts/tooltip";

  export let name: string = undefined;
  export let zoom: number;
</script>

<div class="subsection">
  <span data-tooltip={$t("tooltip.coaName")} use:tooltip>
    <span>{$t("editor.name")}:</span>
    <input type="text" bind:value={name} />
  </span>
</div>
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
