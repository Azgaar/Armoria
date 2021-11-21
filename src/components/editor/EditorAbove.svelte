<script>
  import Switch from "./Switch.svelte";
  import {tooltip} from "scripts/tooltip";
  export let above;
</script>

<span title="Check to render ordinary above charges" use:tooltip>
  <span style="margin-left: 1em">Above charges:</span>
  <Switch bind:checked={above} />
</span>
