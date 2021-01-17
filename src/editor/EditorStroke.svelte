<script>
  import Tip from '../Tip.svelte';
  import Switch from '../Switch.svelte';
  export let element;
</script>

<Tip tip="Element stroke. Check to render, select a color and set stroke width">
  <span>Stroke:</span>
  <Switch bind:checked={element.showStroke}/>
  {#if element.showStroke}
    <span style="margin-left: 1em">Color:</span>
    <input type=color bind:value={element.stroke}/>

    {#if element.ordinary}
      <span style="margin-left: 1em">Width:</span>
      <input type=number min=.1 max=5 step=.1 bind:value={element.strokeWidth}/>
    {/if}
  {/if}
</Tip>

<style>
  input[type=color] {
    margin: 0 0 0 .2em;
    padding: 0;
    cursor: pointer;
  }

  input[type=number] {
    width: 4em;
  }
</style>