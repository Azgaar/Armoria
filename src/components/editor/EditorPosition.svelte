<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import Switch from "./Switch.svelte";
  import {state} from "data/stores";
  import {positionsSelect} from "data/dataModel";
  import {getSize} from "scripts/generator";
  import {tooltip} from "scripts/tooltip";

  interface IElement {
    angle: number;
    size: number;
    p: string;
    sinister: boolean;
    reversed: boolean;
  }

  export let element: IElement;

  function showPositions() {
    $state.transform = `rotate(${element.angle || 0}) translate(${element.x || 0}, ${element.y || 0})`;
    $state.positions = element.p;
  }

  function hidePositions() {
    $state.positions = 0;
  }

  function changePosition() {
    showPositions();
    element.size = getSize(element.p);
  }
</script>

<span data-tooltip={$t("tooltip.positions")} use:tooltip>
  {$t("editor.positions")}:
  <input bind:value={element.p} on:input={showPositions} on:focus={showPositions} on:blur={hidePositions} />
  <select bind:value={element.p} on:change={changePosition} on:focus={showPositions} on:blur={hidePositions}>
    {#each positionsSelect as position}
      <option value={position}>{position}</option>
    {/each}
  </select>
</span>

<span data-tooltip={$t("tooltip.sinister")} use:tooltip>
  <span style="margin-left: 1em">{$t("editor.sinister")}:</span>
  <Switch bind:checked={element.sinister} />
</span>

<span data-tooltip={$t("tooltip.reversed")} use:tooltip>
  <span style="margin-left: 1em">{$t("editor.reversed")}:</span>
  <Switch bind:checked={element.reversed} />
</span>

<style>
  span > span {
    margin-left: 1em;
  }

  input {
    width: 8.6em;
  }

  select {
    width: 1.3em;
    margin-left: -1.6em;
    border: 0;
  }
</style>
