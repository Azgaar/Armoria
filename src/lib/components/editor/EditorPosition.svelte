<script lang="ts">
  // @ts-check
  import {onDestroy} from "svelte";
  import {t} from "svelte-i18n";
  import Switch from "./Switch.svelte";
  import {state as editorState} from "#lib/data/stores.ts";
  import {positionsSelect} from "#lib/data/dataModel.js";
  import {getSize} from "#lib/scripts/generator.js";
  import {tooltip} from "#lib/scripts/tooltip.ts";

  import type {EditorCharge} from "#lib/types/editor.js";
  let {charge = $bindable()}: {charge: EditorCharge} = $props();
  let focused = false;
  onDestroy(() => {
    if (focused) hidePositions();
  });

  function update<K extends keyof EditorCharge>(key: K, value: EditorCharge[K]) {
    charge = {...charge, [key]: value};
  }

  function focusPositions() {
    focused = true;
    showPositions();
  }

  function showPositions() {
    $editorState.transform = `rotate(${charge.angle || 0}) translate(${charge.x || 0}, ${charge.y || 0})`;
    $editorState.positions = charge.p;
  }

  function hidePositions() {
    focused = false;
    $editorState.positions = 0;
  }

  function changePosition(p: string, resize = false) {
    charge = {...charge, p, ...(resize ? {size: getSize(p)} : {})};
    showPositions();
  }
</script>

<span data-tooltip={$t("tooltip.positions")} use:tooltip>
  {$t("editor.positions")}:
  <input bind:value={() => charge.p, p => changePosition(p)} onfocus={focusPositions} onblur={hidePositions} />
  <select bind:value={() => charge.p, p => changePosition(p, true)} onfocus={focusPositions} onblur={hidePositions}>
    {#each positionsSelect as position (position)}
      <option value={position}>{position}</option>
    {/each}
  </select>
</span>

<span data-tooltip={$t("tooltip.sinister")} use:tooltip>
  <span style="margin-left: 1em">{$t("editor.sinister")}:</span>
  <Switch bind:checked={() => charge.sinister, value => update("sinister", value)} />
</span>

<span data-tooltip={$t("tooltip.reversed")} use:tooltip>
  <span style="margin-left: 1em">{$t("editor.reversed")}:</span>
  <Switch bind:checked={() => charge.reversed, value => update("reversed", value)} />
</span>

<style>
  span > span {
    margin-left: 1em;
  }

  input {
    width: 8.6em;
  }

  select {
    width: 1.3em;
    margin-left: -1.6em;
    border: 0;
  }
</style>
