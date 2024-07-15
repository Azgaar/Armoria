<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";

  export let type: string;
</script>

{$t("editor.type")}
<select bind:value={type}>
  <option value="tincture">{$t("editor.tincture")}</option>
  <option value="pattern">{$t("editor.pattern")}</option>
  <option value="semy">{$t("editor.semy")}</option>
</select>
