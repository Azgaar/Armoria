<script>
  import Switch from "./Switch.svelte";
  import {tooltip} from "scripts/tooltip";
  export let element;
</script>

<span data-tooltip="Element stroke. Check to render and select a color" use:tooltip>
  <span>Stroke:</span>
  <Switch bind:checked={element.showStroke} />
  {#if element.showStroke}
    <span style="margin-left: 1em">Color:</span>
    <input type="color" bind:value={element.stroke} />

    {#if element.ordinary}
      <span style="margin-left: 1em">Width:</span>
      <input type="number" min=".1" max="5" step=".1" bind:value={element.strokeWidth} />
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
