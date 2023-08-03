<script lang="ts">
  // @ts-check
  import Shield from "./../object/Shield.svelte";
  import {tooltip} from "scripts/tooltip";

  export let coa: any;
  export let tip: string;
</script>

<svg class="menuItem" width="100%" height="100%" viewBox="0 0 200 200" data-tooltip={tip} use:tooltip>
  <Shield {coa} border="#333" borderWidth={2} type="menuItem" />
</svg>
