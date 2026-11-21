<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";

  let {divided = $bindable(), raster = false}: {divided: "" | "field" | "division" | "counter"; raster?: boolean} = $props();
</script>

<span>{$t("editor.divided")}:</span>
<select bind:value={divided}>
  <option value="">{$t("editor.notDivided")}</option>
  <option value="field">{$t("editor.cropByField")}</option>
  <option value="division">{$t("editor.cropByDivision")}</option>
  {#if !raster}
    <option value="counter">{$t("editor.counterchanged")}</option>
  {/if}
</select>
