<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import Switch from "./Switch.svelte";
  import {tooltip} from "#lib/scripts/tooltip.ts";

  let {above = $bindable()}: {above: boolean} = $props();
</script>

<span data-tooltip={$t("tooltip.aboveCharges")} use:tooltip>
  <span style="margin-left: 1em">{$t("editor.aboveCharges")}:</span>
  <Switch bind:checked={above} />
</span>
