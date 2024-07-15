<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import Switch from "./Switch.svelte";
  import {grid, showGrid, state} from "$lib/data/stores";
  import {tooltip} from "$lib/scripts/tooltip";

  interface IElement {
    size: number;
    angle: number;
    x: number;
    y: number;
  }

  export let element: IElement;

  const hadleSizeChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    element.size = parseInt(target.value) / 100;
  };

  const updateGrid = () => {
    $state.transform = `rotate(${element.angle || 0})`;
  };
</script>

<span data-tooltip={$t("tooltip.size")} use:tooltip>
  {$t("editor.size")}:
  <input type="number" min="1" max="500" step="1" value={(element.size * 100) | 0} on:input={hadleSizeChange} />
</span>

<span data-tooltip={$t("tooltip.rotation")} use:tooltip>
  <span>{$t("editor.rotation")}:</span>
  <input type="number" min="-180" max="180" bind:value={element.angle} on:change={updateGrid} />
</span>

<span data-tooltip={$t("tooltip.shift")} use:tooltip>
  <span>{$t("editor.shift")}:</span>
  <input type="number" min="-100" max="100" step={$grid} bind:value={element.x} />
  <input type="number" min="-100" max="100" step={$grid} bind:value={element.y} />
</span>

<span data-tooltip={$t("tooltip.step")} use:tooltip>
  <span>{$t("editor.step")}:</span>
  <input type="number" min="1" max="50" bind:value={$grid} />
</span>

<span data-tooltip={$t("tooltip.showGrid")} use:tooltip>
  <Switch bind:checked={$showGrid} />
</span>

<style>
  span > span {
    margin-left: 1em;
  }

  input[type="number"] {
    width: 4em;
  }
</style>
