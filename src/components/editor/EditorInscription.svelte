<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {fonts, state} from "data/stores";
  import {tooltip} from "scripts/tooltip";
  import Switch from "./Switch.svelte";

  interface IInscription {
    text: string;
    font: string;
    size: number;
    bold: true;
    italic: true;
    spacing: number;
    color: string;
    path: string;
  }
  export let inscription: IInscription;

  function addFont() {
    $state.fonts = 1;
    $state.currentInscription = inscription;
  }
</script>

<span data-tooltip={$t("tooltip.inscriptions.text")} use:tooltip>
  <span>{$t("editor.inscriptions.text")}:</span>
  <input type="text" bind:value={inscription.text} />
</span>

<span>
  <span>{$t("editor.inscriptions.font")}:</span>
  <select bind:value={inscription.font} data-tooltip={$t("tooltip.inscriptions.font")} use:tooltip>
    {#each Object.keys($fonts) as font}
      <option value={font} style="font-family: {font};">{font}</option>
    {/each}
  </select>
  <button on:click={addFont} data-tooltip={$t("tooltip.inscriptions.addFont")} use:tooltip>
    <svg class="icon">
      <use href="#plus-icon" />
    </svg>
  </button>
</span>

<span data-tooltip={$t("tooltip.inscriptions.size")} use:tooltip>
  <span>{$t("editor.inscriptions.size")}:</span>
  <input type="number" min="1" max="100" bind:value={inscription.size} />
</span>

<span>
  <span>{$t("editor.inscriptions.bold")}:</span>
  <Switch bind:checked={inscription.bold} />
</span>

<span>
  <span>{$t("editor.inscriptions.italic")}:</span>
  <Switch bind:checked={inscription.italic} />
</span>

<span data-tooltip={$t("tooltip.inscriptions.spacing")} use:tooltip>
  <span>{$t("editor.inscriptions.spacing")}:</span>
  <input type="number" min="-2" max="10" step="0.1" bind:value={inscription.spacing} />
</span>

<span data-tooltip={$t("tooltip.inscriptions.color")} use:tooltip>
  <span>{$t("editor.inscriptions.color")}:</span>
  <input type="color" bind:value={inscription.color} />
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
