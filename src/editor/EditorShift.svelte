<script>
  import Tip from '../Tip.svelte';
  import Switch from '../Switch.svelte';
  import {grid, showGrid, state} from '../stores';
  export let e;

  function updateGrid() {
    $state.transform = `rotate(${e.angle||0})`;
  }
</script>

<Tip tip="Element size in percents">
  Size:
  <input type=number min=1 max=500 step=1 value={e.size * 100 | 0} on:input={function() {e.size = this.value / 100}}/>
</Tip>

<Tip tip="Element rotation angle in degrees">
  <span>Rotation:</span>
  <input type=number min=-180 max=180 bind:value={e.angle} on:change={updateGrid}/>
</Tip>

<Tip tip="Element shift in pixels">
  <span>Shift:</span>
  <input type=number min=-100 max=100 step={$grid} bind:value={e.x}/>
  <input type=number min=-100 max=100 step={$grid} bind:value={e.y}/>
</Tip>

<Tip tip="Grid size: define position shift and drag step in pixels">
  <span>Step:</span>
  <input type=number min=1 max=50 bind:value={$grid}/>
  <Switch bind:checked={$showGrid}/>
</Tip>

<style>
  span {
    margin-left: 1em;
  }

  input[type=number] {
    width: 4em;
  }
</style>