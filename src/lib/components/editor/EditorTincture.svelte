<script lang="ts">
  import {settingsStorage} from "#lib/data/storage.ts";
  // @ts-check
  import {t} from "svelte-i18n";
  import EditorItem from "./EditorItem.svelte";
  import {colors, tinctures} from "#lib/data/stores.ts";
  import {tooltip} from "#lib/scripts/tooltip.ts";
  import {DEFAULT_COLORS as defaults} from "#lib/config/defaults.ts";

  let {t1 = $bindable(), shield}: {t1?: string; shield?: string} = $props();

  let savedColors = JSON.stringify($colors);
  $effect(() => {
    if (JSON.stringify($colors) === savedColors) return;
    savedColors = JSON.stringify($colors);
    settingsStorage.setItem("colors", savedColors);
  });
  const colorChanged = (tincture: string) => defaults[tincture] && $colors[tincture] !== defaults[tincture];

  let tincturesData = $derived(
    (["metals", "colours", "stains"] as const)
      .map(type =>
        Object.keys($tinctures[type]).map(tincture => {
          const tinctureName = $t(`tinctures.${tincture}`, {default: tincture});
          const typeName = $t(`editor.${type.slice(0, -1)}`);
          return {coa: {t1: tincture, shield}, tip: `${typeName}: ${tinctureName}`};
        })
      )
      .flat()
  );

  const handleChange = (tincture: string) => {
    t1 = tincture;
  };

  function openColorInput(event: MouseEvent) {
    const target = event.currentTarget;
    if (!(target instanceof Element)) return;
    const input = target.previousElementSibling;
    if (input instanceof HTMLInputElement) input.click();
  }

  function restoreColor(tincture: string) {
    $colors[tincture] = defaults[tincture];
  }
</script>

{$t("editor.tincture")}:
<div class="items">
  {#each tincturesData as { coa, tip } (coa.t1)}
    <div class="wrapper">
      <div class="item" class:selected={t1 === coa.t1} onclick={() => handleChange(coa.t1)}>
        <EditorItem {coa} {tip} />
      </div>

      <div class="controls">
        {#if colorChanged(coa.t1)}
          <svg class="undo" onclick={() => restoreColor(coa.t1)} data-tooltip={$t("tooltip.undoColorChange")} use:tooltip>
            <use href="#undo-icon" />
          </svg>
        {/if}

        <div>
          <input type="color" bind:value={$colors[coa.t1]} />
          <svg class="edit" onclick={openColorInput} data-tooltip={$t("tooltip.changeColor")} use:tooltip>
            <use href="#pencil-icon" />
          </svg>
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .edit {
    top: 0.8em;
    right: 0.8em;
  }

  .undo {
    top: 0.8em;
    right: 2.2em;
  }

  input[type="color"] {
    visibility: hidden;
    position: absolute;
    width: 1em;
    height: 1em;
    top: 1.2em;
    right: 1.2em;
  }
</style>
