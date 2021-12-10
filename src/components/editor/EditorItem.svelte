<script lang="ts">
  // @ts-check
  import Shield from "./../object/Shield.svelte";
  import {tooltip} from "scripts/tooltip";
  import {capitalize} from "scripts/utils";

  export let coa: any;
  export let tip: string;
  export let itemSize: number;

  const i = Math.floor(1e6 * Math.random());
</script>

<svg class="menuItem" width={itemSize} height={itemSize} viewBox="0 0 200 200" data-tooltip={capitalize(tip)} use:tooltip>
  <Shield {coa} {i} border="#333" borderWidth="2" type="menuItem" />
</svg>
