<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import Switch from "./Switch.svelte";
  import {tooltip} from "scripts/tooltip";

  interface IElement {
    showStroke: boolean;
    stroke: string;
    strokeWidth?: number;
    ordinary?: string;
  }

  export let element: IElement;
</script>

<span data-tooltip={$t("tooltip.stroke")} use:tooltip>
  <span>{$t("editor.stroke")}:</span>
  <Switch bind:checked={element.showStroke} />
  {#if element.showStroke}
    <span style="margin-left: 1em">{$t("editor.color")}:</span>
    <input type="color" bind:value={element.stroke} />

    {#if element.ordinary}
      <span style="margin-left: 1em">{$t("editor.width")}:</span>
      <input type="number" min=".1" max="99" step=".1" bind:value={element.strokeWidth} />
    {/if}
  {/if}
</span>

<style>
  input[type="color"] {
    margin: 0 0 0 0.2em;
    padding: 0;
    cursor: pointer;
  }

  input[type="number"] {
    width: 4em;
  }
</style>
