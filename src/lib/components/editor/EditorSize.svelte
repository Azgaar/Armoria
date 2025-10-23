<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";

  export let size: string;
</script>

<span style="margin-left: 1em">{$t("editor.size")}:</span>
<select bind:value={size}>
  <option value="bigger">{$t("editor.bigger")}</option>
  <option value="big">{$t("editor.big")}</option>
  <option value="standard">{$t("editor.standard")}</option>
  <option value="small">{$t("editor.small")}</option>
  <option value="smaller">{$t("editor.smaller")}</option>
  <option value="smallest">{$t("editor.smallest")}</option>
</select>
