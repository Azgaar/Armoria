<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import Switch from "./Switch.svelte";
  import {tooltip} from "#lib/scripts/tooltip.ts";

  interface IElement {
    showStroke: boolean;
    stroke: string;
    strokeWidth?: number;
    ordinary?: string;
  }

  let {element = $bindable()}: {element: IElement} = $props();
  // The parent may still own a plain legacy object. Replace it through the
  // binding so updates notify that parent without relying on deep proxies.
  function update<K extends keyof IElement>(key: K, value: IElement[K]) {
    element = {...element, [key]: value};
  }
</script>

<span data-tooltip={$t("tooltip.stroke")} use:tooltip>
  <span>{$t("editor.stroke")}:</span>
  <Switch bind:checked={() => element.showStroke, value => update("showStroke", value)} />
  {#if element.showStroke}
    <span style="margin-left: 1em">{$t("editor.color")}:</span>
    <input type="color" bind:value={() => element.stroke, value => update("stroke", value)} />

    {#if element.ordinary}
      <span style="margin-left: 1em">{$t("editor.width")}:</span>
      <input
        type="number"
        min=".1"
        max="99"
        step=".1"
        bind:value={() => element.strokeWidth, value => update("strokeWidth", value)}
      />
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
