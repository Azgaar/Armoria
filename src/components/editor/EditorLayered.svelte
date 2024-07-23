<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import Switch from "./Switch.svelte";
  import {tooltip} from "scripts/tooltip";

  export let layered: boolean;
</script>

<span data-tooltip={$t("tooltip.layered")} use:tooltip>
  <span style="margin-left: 1em">{$t("editor.layered")}:</span>
  <Switch bind:checked={layered} />
</span>
