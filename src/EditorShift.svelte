<script>
  import Tooltip from './Tooltip.svelte';
  import Switch from './Switch.svelte';
  import {grid, showGrid, state} from './stores';
  export let e;

  function updateGrid() {
    $state.transform = `rotate(${e.angle||0})`;
  }
</script>

<Tooltip tip="Element size">Size:</Tooltip>
<input type=number min=1 max=500 step=1 value={e.size * 100 | 0} on:input={function() {e.size = this.value / 100}}/>

<Tooltip tip="Element rotation"><span style="margin-left: 1em">Rotation:</span></Tooltip>
<input style="margin-left: 1em" type="number" min=-180 max=180 bind:value={e.angle} on:change={updateGrid}/>

<Tooltip tip="Element shift"><span style="margin-left: 1em">Shift:</span></Tooltip>
<input type="number" min=-100 max=100 step={$grid} bind:value={e.x}/>
<input type="number" min=-100 max=100 step={$grid} bind:value={e.y}/>

<Tooltip tip="Grid size: define position shift and drag step"><span style="margin-left: 1em">Step:</span></Tooltip>
<input type="number" min=1 max=50 bind:value={$grid}/>
<Switch bind:checked={$showGrid}/>

<style>
  input[type="number"] {
    width: 4em;
  }
</style>