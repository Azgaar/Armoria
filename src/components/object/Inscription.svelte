<script lang="ts">
  // @ts-check
  import {fade} from "svelte/transition";
  import {state} from "data/stores";
  import {drag} from "scripts/drag";
  import {analyzePath, buildPath} from "scripts/getters";
  import {highlight, lowlight} from "scripts/highlight";
  import type {Coa, Inscription} from "types/coa";

  export let coa: Coa;
  export let inscription: Inscription;
  export let pathId: string;
  export let i: number;
  export let type: string;

  let pathData = analyzePath(inscription.path);
  $: isSelected = $state.selectedPath === i;
  $: lines = inscription.text.split("|");

  const addInscriptionDrag = (event: Event) => {
    if (type !== "Edit") return;
    if (pathData.type == "custom") return; // not supported

    $state.selectedPath = i;
    $state.pathChangeMode = -1;
    drag(event, {x: 0, y: 0}, coa, {move: true, resize: false, rotate: false, onEnd});

    function onEnd(element) {
      pathData.points.forEach(p => {
        p.x += element.x;
        p.y += element.y;
      });
      inscription.path = buildPath(pathData.type, pathData.points);
    }
  };

  const addPointDrag = (point: {index: number; x: number; y: number}) => (event: Event) => {
    if (type !== "Edit") return;
    $state.selectedPath = i;

    $state.pathChangeMode = point.index;
    drag(event, point, coa, {move: true, resize: false, rotate: false, onMove});

    function onMove(event, element) {
      pathData.points[element.index] = element;
      inscription.path = buildPath(pathData.type, pathData.points);
    }
  };
</script>

<g transform="translate(100, 100)">
  <g
    class="inscription"
    {i}
    tabindex="-1"
    on:mousedown={addInscriptionDrag}
    on:mouseenter={type === "Edit" ? highlight("menu", "inscription", i) : null}
    on:mouseleave={type === "Edit" ? lowlight("menu", "inscription", i) : null}
  >
    <path id={pathId} class="text-path" fill="none" stroke={isSelected ? "black" : "none"} d={inscription.path} />

    <text
      letter-spacing={inscription.spacing}
      fill={inscription.color}
      font-family={inscription.font}
      font-size="{inscription.size}px"
      font-weight={inscription.bold ? "bold" : "normal"}
      font-style={inscription.italic ? "italic" : "normal"}
      dominant-baseline="middle"
      style={inscription.shadow
        ? `text-shadow: ${inscription.shadow.x}px ${inscription.shadow.y}px ${inscription.shadow.blur}px ${inscription.shadow.color}`
        : null}
    >
      <textPath href="#{pathId}" text-anchor="middle" startOffset="50%">
        {#each lines as line, index}
          <tspan x="0" dy="{index > 0 ? 1 : -0.5 * (lines.length - 1)}em">{line}</tspan>
        {/each}
      </textPath>
    </text>

    {#if isSelected}
      <g class="points" transition:fade|local>
        {#each pathData.points || [] as point}
          <circle transform="translate({point.x} {point.y})" r="3" on:mousedown|stopPropagation={addPointDrag(point)} />
        {/each}
      </g>
    {/if}
  </g>
</g>

<style>
  .text-path {
    stroke-width: 2;
    stroke-opacity: 0.3;
  }

  .points circle {
    fill: red;
    stroke: #841f1f;
    cursor: move;
  }

  g:focus {
    /* for Edge */
    outline: none;
  }
</style>
