<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {grid, showGrid, state as editorState} from "#lib/data/stores.ts";
  import {analyzePath, buildPath} from "#lib/scripts/getters.js";
  import {tooltip} from "#lib/scripts/tooltip.ts";
  import Switch from "./Switch.svelte";

  let {path = $bindable()}: {path: string} = $props();

  // Custom mode is a temporary UI override until a path is committed or restored.
  let pathData = $derived(analyzePath(path));
  let mode = $derived(pathData.type === "line" && $editorState.pathChangeMode === 2 ? -1 : ($editorState.pathChangeMode ?? -1));

  function changePathType(e: Event) {
    if (!(e.currentTarget instanceof HTMLSelectElement)) return;
    const pathType = pathData.type;
    const previousMode = mode;
    pathData = {...pathData, type: e.currentTarget.value};
    if (pathData.type == "line") {
      if (pathType === "curve") {
        if (previousMode === 2) $editorState.pathChangeMode = -1;
        path = buildPath("line", pathData.points);
      } else if (pathType === "custom") {
        path = "M-50 0 L50 0";
      }
    }
    if (pathData.type === "curve") {
      if (pathType === "line") {
        const p = pathData.points;
        path = buildPath("curve", [p[0], p[1], {x: Math.floor((p[0].x + p[1].x) / 2), y: Math.floor((p[0].y + p[1].y) / 2)}]);
      } else if (pathType === "custom") {
        path = "M-50 0 Q0 -20 50 0";
      }
    }
  }

  function changeShift(obj: {x?: number; y?: number}) {
    const points = pathData.points.map(point => ({...point}));
    if (mode !== -1) {
      if (obj.x !== undefined) points[mode].x = obj.x;
      if (obj.y !== undefined) points[mode].y = obj.y;
    } else {
      const dx = obj.x === undefined ? 0 : obj.x - points[0].x;
      const dy = obj.y === undefined ? 0 : obj.y - points[0].y;
      points.forEach(point => {
        point.x += dx;
        point.y += dy;
      });
    }
    path = buildPath(pathData.type, points);
  }
</script>

<span data-tooltip={$t("tooltip.inscriptions.path")} use:tooltip>
  <span>{$t("editor.inscriptions.path")}:</span>
  <select value={pathData.type} onchange={changePathType}>
    <option value="line">{$t("editor.inscriptions.line")}</option>
    <option value="curve">{$t("editor.inscriptions.curve")}</option>
    <option value="custom">{$t("editor.inscriptions.custom")}</option>
  </select>
  {#if pathData.type === "custom"}
    <input type="text" value={path} onblur={e => (path = e.currentTarget.value)} />
  {/if}
</span>

{#if pathData.type !== "custom"}
  <span data-tooltip={$t("tooltip.shift")} use:tooltip>
    <span>{$t("editor.shift")}:</span>
    <select value={mode.toString()} onchange={e => ($editorState.pathChangeMode = parseInt(e.currentTarget.value))}>
      <option value="-1">{$t("editor.inscriptions.all")}</option>
      <option value="0">{$t("editor.inscriptions.start")}</option>
      <option value="1">{$t("editor.inscriptions.end")}</option>
      {#if pathData.type === "curve"}
        <option value="2">{$t("editor.inscriptions.control")}</option>
      {/if}
    </select>
    <input
      type="number"
      min="-100"
      max="100"
      step={$grid}
      value={pathData.points[mode == -1 ? 0 : mode].x}
      onchange={e => changeShift({x: e.currentTarget.valueAsNumber})}
    />
    <input
      type="number"
      min="-100"
      max="100"
      step={$grid}
      value={pathData.points[mode == -1 ? 0 : mode].y}
      onchange={e => changeShift({y: e.currentTarget.valueAsNumber})}
    />
  </span>
{/if}

<span data-tooltip={$t("tooltip.step")} use:tooltip>
  <span>{$t("editor.step")}:</span>
  <input type="number" min="1" max="50" bind:value={$grid} />
</span>

<span data-tooltip={$t("tooltip.showGrid")} use:tooltip>
  <Switch bind:checked={$showGrid} />
</span>

<style>
  span:not(:first-of-type) > span {
    margin-left: 1em;
  }

  input[type="number"] {
    width: 4em;
  }

  input[type="text"] {
    width: 50%;
  }
</style>
