<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {tooltip} from "$lib/scripts/tooltip";

  export let componySize = 0;
  export let gyronnyNumber = 0;
  export let striped = "";

  function changeStriped(e: Event) {
    componySize = 0;
    gyronnyNumber = 0;
    if (striped === "compony") {
      componySize = 25;
    } else if (striped === "gyronny") {
      gyronnyNumber = 8;
    }
  }
</script>

<span>{$t("editor.striped")}:</span>
<select bind:value={striped} on:change={changeStriped}>
  <option value="">{$t("editor.notStriped")}</option>
  <option value="compony">{$t("editor.compony")}</option>
  <option value="gyronny">{$t("editor.gyronny")}</option>
</select>

{#if striped === "compony"}
  <span data-tooltip={$t("tooltip.componySize")} use:tooltip>
    {$t("editor.componySize")}:
    <input type="number" min="5" max="100" step="1" bind:value={componySize} />
  </span>
{:else if striped === "gyronny"}
  <span data-tooltip={$t("tooltip.gyronnyNumber")} use:tooltip>
    {$t("editor.gyronnyNumber")}:
    <input type="number" min="4" max="100" step="2" bind:value={gyronnyNumber} />
  </span>
{/if}

<style>
  span:not(:first-of-type) {
    margin-left: 1em;
  }

  input[type="number"] {
    width: 4em;
  }
</style>
