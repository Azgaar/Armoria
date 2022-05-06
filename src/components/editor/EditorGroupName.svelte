<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";

  export let name: string;
</script>

<span>{$t("editor.groupName")}:</span>
<input bind:value={name} />
