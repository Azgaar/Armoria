<script lang="ts">
  // @ts-check
  import {DEFAULT_SHIELD_BOX} from "#lib/data/dataModel.js";
  import {tooltip} from "#lib/scripts/tooltip.ts";
  import {colors, shield, grad, diaper} from "#lib/data/stores.ts";
  import Shield from "./../object/Shield.svelte";

  export let coa: any;
  export let tip: string;
</script>

<svg class="menuItem" width="100%" height="100%" viewBox={DEFAULT_SHIELD_BOX} data-tooltip={tip} use:tooltip>
  <Shield
    {coa}
    palette={$colors}
    defaultShield={$shield}
    gradient={$grad}
    diaper={$diaper}
    border="#333"
    borderWidth={2}
    type="menuItem"
  />
</svg>
