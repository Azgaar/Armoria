<script>
  import Switch from './Switch.svelte';
  import {state} from '../stores';
  import {positionsSelect} from "../dataModel";
  import {getSize} from '../generator';
  import {tooltip} from '../scripts/tooltip';
  export let charge;

  function showPositions() {
    $state.transform = `rotate(${charge.angle||0}) translate(${charge.x||0}, ${charge.y||0})`;
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

<span title="Points on shield to place a charge" use:tooltip>
  Positions:
  <input bind:value={charge.p} on:input={showPositions} on:focus={showPositions} on:blur={hidePositions}/>
  <select bind:value={charge.p} on:change={changePosition} on:focus={showPositions} on:blur={hidePositions}>
    {#each positionsSelect as position}
      <option value={position}>{position}</option>
    {/each}
  </select>
</span>

<span title="Turn charge to the left" use:tooltip>
  <span style="margin-left: 1em">Sinister:</span>
  <Switch bind:checked={charge.sinister}/>
</span>

<span title="Show charge upside down" use:tooltip>
  <span style="margin-left: 1em">Reversed:</span>
  <Switch bind:checked={charge.reversed}/>
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