<script lang="ts">
  // @ts-check
  import {DEFAULT_SHIELD_BOX} from "data/dataModel";
  import {tooltip} from "scripts/tooltip";
  import Shield from "./../object/Shield.svelte";

  export let coa: any;
  export let tip: string;
</script>

<svg class="menuItem" width="100%" height="100%" viewBox={DEFAULT_SHIELD_BOX} data-tooltip={tip} use:tooltip>
  <Shield {coa} border="#333" borderWidth={2} type="menuItem" />
</svg>
