<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import Switch from "./Switch.svelte";
  import {charges} from "$lib/data/dataModel";
  import {tooltip} from "$lib/scripts/tooltip";

  export let charge: string;
  export let outside: "" | "above" | "below" | "around";
</script>

<span data-tooltip={$t("tooltip.outsideShield")} use:tooltip>
  <span style="margin-left: 1em">{$t("editor.outsideShield")}:</span>
  <select bind:value={outside}>
    <option value="">{$t("editor.notOutside")}</option>
    <option value="above">{$t("editor.aboveShield")}</option>
    <option value="below">{$t("editor.belowShield")}</option>
    {#if charges.data[charge]?.layered}
    <option value="around">{$t("editor.aroundShield")}</option>
    {/if}
  </select>
</span>
