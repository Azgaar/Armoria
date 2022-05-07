<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import type {Divided} from "types.ts/menu";

  export let divided: Divided;
  export let raster = false;
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
