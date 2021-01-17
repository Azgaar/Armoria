<script>
  import Tip from '../Tip.svelte';
  import Switch from '../Switch.svelte';
  export let above;
</script>

<Tip tip="Check to render ordinary above charges">
  <span style="margin-left: 1em">Above charges:</span>
  <Switch bind:checked={above}/>
</Tip>
