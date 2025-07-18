<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {grid, showGrid, state} from "$lib/data/stores";
  import {analyzePath, buildPath} from "$lib/scripts/getters";
  import {tooltip} from "$lib/scripts/tooltip";
  import Switch from "./Switch.svelte";

  export let path: string;

  let pathData;
  let pathType: string;
  let mode: number;

  $: updatePath(path);
  $: updateMode(path, $state.pathChangeMode);

  function updatePath() {
    pathData = analyzePath(path);
    pathType = pathData.type;
  }

  function updateMode() {
    mode = $state.pathChangeMode;
    if ((pathType === "line" && mode === 2) || mode === undefined) mode = -1;
  }

  function changePathType() {
    if (pathData.type == "line") {
      if (pathType === "curve") {
        if (mode === 2) $state.pathChangeMode = -1;
        path = buildPath("line", pathData.points);
      } else if (pathType === "custom") {
        path = "M-50 0 L50 0";
      }
    }
    if (pathData.type === "curve") {
      if (pathType === "line") {
        const p = pathData.points;
        path = buildPath("curve", [
          p[0],
          p[1],
          {x: Math.floor((p[0].x + p[1].x) / 2), y: Math.floor((p[0].y + p[1].y) / 2)}
        ]);
      } else if (pathType === "custom") {
        path = "M-50 0 Q0 -20 50 0";
      }
    }
  }

  function changeShift(obj) {
    if (mode != -1) {
      if (obj.x !== undefined) pathData.points[mode].x = obj.x;
      if (obj.y !== undefined) pathData.points[mode].y = obj.y;
    } else {
      const dx = obj.x === undefined ? 0 : obj.x - pathData.points[0].x;
      const dy = obj.y === undefined ? 0 : obj.y - pathData.points[0].y;
      pathData.points.forEach(function (p) {
        p.x += dx;
        p.y += dy;
      });
    }
    path = buildPath(pathData.type, pathData.points);
  }
</script>

<span data-tooltip={$t("tooltip.inscriptions.path")} use:tooltip>
  <span>{$t("editor.inscriptions.path")}:</span>
  <select bind:value={pathData.type} on:change={changePathType}>
    <option value="line">{$t("editor.inscriptions.line")}</option>
    <option value="curve">{$t("editor.inscriptions.curve")}</option>
    <option value="custom">{$t("editor.inscriptions.custom")}</option>
  </select>
  {#if pathData.type === "custom"}
    <input type="text" value={path} on:blur={e => (path = e.target.value)} />
  {/if}
</span>

{#if pathData.type !== "custom"}
  <span data-tooltip={$t("tooltip.shift")} use:tooltip>
    <span>{$t("editor.shift")}:</span>
    <select value={mode.toString()} on:change={e => ($state.pathChangeMode = parseInt(e.target.value))}>
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
      on:change={e => changeShift({x: e.target.value})}
    />
    <input
      type="number"
      min="-100"
      max="100"
      step={$grid}
      value={pathData.points[mode == -1 ? 0 : mode].y}
      on:change={e => changeShift({y: e.target.value})}
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
