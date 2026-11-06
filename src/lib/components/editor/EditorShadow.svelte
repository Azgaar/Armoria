<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {tooltip} from "#lib/scripts/tooltip.ts";
  import Switch from "./Switch.svelte";

  import type {Shadow} from "#lib/types/coa.js";
  let {shadow = $bindable()}: {shadow: Shadow | undefined} = $props();

  function toggle(enabled: boolean) {
    shadow = enabled ? {x: 1, y: 1, blur: 0, color: "#333333"} : undefined;
  }

  function update<K extends keyof Shadow>(key: K, value: Shadow[K]) {
    if (shadow) shadow = {...shadow, [key]: value};
  }
</script>

<span data-tooltip={$t("tooltip.inscriptions.shadow")} use:tooltip>
  <span>{$t("editor.inscriptions.shadow")}:</span>
  <Switch bind:checked={() => Boolean(shadow), toggle} />
</span>

{#if shadow}
  <span data-tooltip={$t("tooltip.shift")} use:tooltip>
    <span>{$t("editor.shift")}:</span>
    <input type="number" min="-100" max="100" bind:value={() => shadow!.x, value => update("x", value)} />
    <input type="number" min="-100" max="100" bind:value={() => shadow!.y, value => update("y", value)} />
  </span>

  <span data-tooltip={$t("tooltip.inscriptions.shadowBlur")} use:tooltip>
    <span>{$t("editor.inscriptions.blur")}:</span>
    <input type="number" min="0" max="10" bind:value={() => shadow!.blur, value => update("blur", value)} />
  </span>

  <span data-tooltip={$t("tooltip.inscriptions.shadowColor")} use:tooltip>
    <span>{$t("editor.inscriptions.color")}:</span>
    <input type="color" bind:value={() => shadow!.color, value => update("color", value)} />
  </span>
{/if}

<style>
  span:not(:first-of-type) > span {
    margin-left: 1em;
  }

  input[type="color"] {
    vertical-align: middle;
    padding: 0;
    cursor: pointer;
  }

  input[type="number"] {
    width: 4em;
  }
</style>
