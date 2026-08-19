<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import Switch from "./Switch.svelte";
  import {state} from "$lib/data/stores";
  import {positionsSelect} from "$lib/data/dataModel";
  import {getSize} from "$lib/scripts/generator";
  import {tooltip} from "$lib/scripts/tooltip";

  interface ICharge {
    angle: number;
    size: number;
    p: string;
    sinister: boolean;
    reversed: boolean;
  }

  export let charge: ICharge;

  function showPositions() {
    $state.transform = `rotate(${charge.angle || 0}) translate(${charge.x || 0}, ${charge.y || 0})`;
    $state.positions = charge.p;
  }

  function hidePositions() {
    $state.positions = 0;
  }

  function changePosition() {
    showPositions();
    charge.size = getSize(charge.p);
  }
</script>

<span data-tooltip={$t("tooltip.positions")} use:tooltip>
  {$t("editor.positions")}:
  <input bind:value={charge.p} on:input={showPositions} on:focus={showPositions} on:blur={hidePositions} />
  <select bind:value={charge.p} on:change={changePosition} on:focus={showPositions} on:blur={hidePositions}>
    {#each positionsSelect as position}
      <option value={position}>{position}</option>
    {/each}
  </select>
</span>

<span data-tooltip={$t("tooltip.sinister")} use:tooltip>
  <span style="margin-left: 1em">{$t("editor.sinister")}:</span>
  <Switch bind:checked={charge.sinister} />
</span>

<span data-tooltip={$t("tooltip.reversed")} use:tooltip>
  <span style="margin-left: 1em">{$t("editor.reversed")}:</span>
  <Switch bind:checked={charge.reversed} />
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
