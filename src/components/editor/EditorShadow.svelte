<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {tooltip} from "scripts/tooltip";
  import Switch from "./Switch.svelte";

  export let shadow;

  let showShadow = !!shadow;

  $: {
    if (showShadow && !shadow) {
      shadow = {x: 1, y: 1, blur: 0, color: "#333333"};
    } else if (!showShadow) {
      shadow = null;
    }
  }
</script>

<span data-tooltip={$t("tooltip.inscriptions.shadow")} use:tooltip>
  <span>{$t("editor.inscriptions.shadow")}:</span>
  <Switch bind:checked={showShadow} />
</span>

{#if showShadow}
  <span data-tooltip={$t("tooltip.shift")} use:tooltip>
    <span>{$t("editor.shift")}:</span>
    <input type="number" min="-100" max="100" bind:value={shadow.x} />
    <input type="number" min="-100" max="100" bind:value={shadow.y} />
  </span>

  <span data-tooltip={$t("tooltip.inscriptions.shadowBlur")} use:tooltip>
    <span>{$t("editor.inscriptions.blur")}:</span>
    <input type="number" min="0" max="10" bind:value={shadow.blur} />
  </span>

  <span data-tooltip={$t("tooltip.inscriptions.shadowColor")} use:tooltip>
    <span>{$t("editor.inscriptions.color")}:</span>
    <input type="color" bind:value={shadow.color} />
  </span>
{/if}

<style>
  span:not(:first-of-type) > span {
    margin-left: 1em;
  }

  input[type="color"] {
    vertical-align: middle;
    padding: 0;
    cursor: pointer;
  }

  input[type="number"] {
    width: 4em;
  }
</style>
