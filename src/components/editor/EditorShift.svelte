<script>
  import Switch from './Switch.svelte';
  import {grid, showGrid, state} from './../../data/stores';
  import {tooltip} from './../../scripts/tooltip';
  export let e;

  function updateGrid() {
    $state.transform = `rotate(${e.angle||0})`;
  }
</script>

<span title="Element size in percents" use:tooltip>
  Size:
  <input type=number min=1 max=500 step=1 value={e.size * 100 | 0} on:input={function() {e.size = this.value / 100}}/>
</span>

<span title="Element rotation angle in degrees" use:tooltip>
  <span>Rotation:</span>
  <input type=number min=-180 max=180 bind:value={e.angle} on:change={updateGrid}/>
</span>

<span title="Element shift in pixels" use:tooltip>
  <span>Shift:</span>
  <input type=number min=-100 max=100 step={$grid} bind:value={e.x}/>
  <input type=number min=-100 max=100 step={$grid} bind:value={e.y}/>
</span>

<span title="Define grid size, angle and position shift step (in pixels and degrees)" use:tooltip>
  <span>Step:</span>
  <input type=number min=1 max=50 bind:value={$grid}/>
  <Switch bind:checked={$showGrid}/>
</span>

<style>
  span > span {
    margin-left: 1em;
  }

  input[type=number] {
    width: 4em;
  }
</style>