<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {fonts, state as editorState} from "#lib/data/stores.ts";
  import {tooltip} from "#lib/scripts/tooltip.ts";
  import Switch from "./Switch.svelte";
  import type {EditorInscription as Inscription} from "#lib/types/editor.js";

  let {inscription = $bindable()}: {inscription: Inscription} = $props();
  // The parent may still own a plain legacy object. Replace it through the
  // binding so updates notify that parent without relying on deep proxies.
  function update<K extends keyof Inscription>(key: K, value: Inscription[K]) {
    inscription = {...inscription, [key]: value};
  }
</script>

<span data-tooltip={$t("tooltip.inscriptions.text")} use:tooltip>
  <span>{$t("editor.inscriptions.text")}:</span>
  <input type="text" bind:value={() => inscription.text, value => update("text", value)} />
</span>

<span>
  <span>{$t("editor.inscriptions.font")}:</span>
  <select
    bind:value={() => inscription.font, value => update("font", value)}
    data-tooltip={$t("tooltip.inscriptions.font")}
    use:tooltip
  >
    {#each Object.keys($fonts) as font (font)}
      <option value={font} style="font-family: {font};">{font}</option>
    {/each}
  </select>

  <button
    aria-label={$t("tooltip.inscriptions.addFont")}
    onclick={() => ($editorState.fonts = 1)}
    data-tooltip={$t("tooltip.inscriptions.addFont")}
    use:tooltip
  >
    <svg class="icon">
      <use href="#plus-icon" />
    </svg>
  </button>
</span>

<span data-tooltip={$t("tooltip.inscriptions.size")} use:tooltip>
  <span>{$t("editor.inscriptions.size")}:</span>
  <input type="number" min="1" max="100" bind:value={() => inscription.size, value => update("size", value)} />
</span>

<span>
  <span>{$t("editor.inscriptions.bold")}:</span>
  <Switch bind:checked={() => inscription.bold, value => update("bold", value)} />
</span>

<span>
  <span>{$t("editor.inscriptions.italic")}:</span>
  <Switch bind:checked={() => inscription.italic, value => update("italic", value)} />
</span>

<span data-tooltip={$t("tooltip.inscriptions.spacing")} use:tooltip>
  <span>{$t("editor.inscriptions.spacing")}:</span>
  <input type="number" min="-2" max="10" step="0.1" bind:value={() => inscription.spacing, value => update("spacing", value)} />
</span>

<span data-tooltip={$t("tooltip.inscriptions.color")} use:tooltip>
  <span>{$t("editor.inscriptions.color")}:</span>
  <input type="color" bind:value={() => inscription.color, value => update("color", value)} />
</span>

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

  svg.icon {
    height: 1em;
    width: 1em;
    vertical-align: middle;
  }
</style>
