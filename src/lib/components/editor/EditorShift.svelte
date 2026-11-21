<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import Switch from "./Switch.svelte";
  import {grid, showGrid, state as editorState} from "#lib/data/stores.ts";
  import {tooltip} from "#lib/scripts/tooltip.ts";

  interface IElement {
    size: number;
    stretch: number;
    angle: number;
    x: number;
    y: number;
  }

  let {element = $bindable()}: {element: IElement} = $props();

  function update<K extends keyof IElement>(key: K, value: IElement[K]) {
    element = {...element, [key]: value};
  }

  const handleSizeChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    update("size", parseInt(target.value) / 100);
  };

  const handleStretchChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    update("stretch", parseInt(target.value) / 100);
  };

  const updateGrid = () => {
    $editorState.transform = `rotate(${element.angle || 0})`;
  };
</script>

<span data-tooltip={$t("tooltip.size")} use:tooltip>
  {$t("editor.size")}:
  <input type="number" min="1" max="500" step="1" value={Math.round(element.size * 100) | 0} oninput={handleSizeChange} />
</span>

<span data-tooltip={$t("tooltip.stretch")} use:tooltip>
  <span>{$t("editor.stretch")}:</span>
  <input
    type="number"
    min="-1000"
    max="1000"
    step="1"
    value={Math.round(element.stretch * 100) | 0}
    oninput={handleStretchChange}
  />
</span>

<span data-tooltip={$t("tooltip.rotation")} use:tooltip>
  <span>{$t("editor.rotation")}:</span>
  <input
    type="number"
    min="-180"
    max="180"
    bind:value={() => element.angle, value => update("angle", value)}
    onchange={updateGrid}
  />
</span>

<span data-tooltip={$t("tooltip.shift")} use:tooltip>
  <span>{$t("editor.shift")}:</span>
  <input type="number" min="-100" max="100" step={$grid} bind:value={() => element.x, value => update("x", value)} />
  <input type="number" min="-100" max="100" step={$grid} bind:value={() => element.y, value => update("y", value)} />
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
