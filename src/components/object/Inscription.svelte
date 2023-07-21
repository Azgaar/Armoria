<script lang="ts">
  // @ts-check
  import {fade} from "svelte/transition";
  import {state} from "data/stores";
  import {drag} from "scripts/drag";
  import {analyzePath, buildPath} from "scripts/getters";
  import type {Coa, Inscription} from "types.ts/coa";

  export let coa: Coa;
  export let inscription: Inscription;
  export let pathId: string;
  export let i: number;
  export let type: string;

  let pathData = analyzePath(inscription.path);

  $: lines = inscription.text.split("|");
  $: selected = ($state.selectedPath === i);

  const addDrag = (obj: Object) => (event: Event) => {
    if (type !== "Edit") return;
    $state.selectedPath = i;
    if (!obj) {
      if (pathData.type == "custom") return; // not supported
      $state.pathChangeMode = -1;
      drag(event, {x: 0, y: 0}, coa, {move: true, resize: false, rotate: false, stop});
    }
    else {
      $state.pathChangeMode = obj.index;
      drag(event, obj, coa, {move, resize: false, rotate: false});
    }
  };

  function move(event, element) {
    pathData.points[element.index] = element;
    inscription.path = buildPath(pathData.type, pathData.points);
  }

  function stop(element) {
    pathData.points.forEach(function(p) {
      p.x += element.x;
      p.y += element.y;
    });
    inscription.path = buildPath(pathData.type, pathData.points);
  }

  function blur(event) {
    // Do not reinitialize selection if blur is triggered when redrawing the COA after dragging,
    // nor if the selection has already changed to another element
    if (event.sourceCapabilities !== null && selected)
      $state.selectedPath = null;
  }

  function refocus(element) {
    // Refocus the element after dragging
    if (selected) element.focus();
  }
</script>

<g transform="translate(100, 100)">
  <g
    class="inscription"
    {i}
    tabindex="-1"
    on:blur={blur}
    on:mousedown={addDrag()}
    use:refocus
  >
    <path id="{pathId}" class="text-path" fill="none" stroke={selected ? "black" : "none"} d={inscription.path} />
    <text
      letter-spacing={inscription.spacing}
      fill={inscription.color}
      font-family={inscription.font}
      font-size={inscription.size}px
      font-weight={inscription.bold ? "bold" : "normal"}
      font-style={inscription.italic ? "italic" : "normal"}
      dominant-baseline="middle"
      style={inscription.shadow ? `text-shadow: ${inscription.shadow.x}px ${inscription.shadow.y}px ${inscription.shadow.blur}px ${inscription.shadow.color}` : null}
    >
      <textPath href="#{pathId}" text-anchor="middle" startOffset="50%">
        {#each lines as line, index}
          <tspan x="0" dy="{index > 0 ? 1 : -0.5 * (lines.length - 1)}em">{line}</tspan>
        {/each}
      </textPath>
    </text>
    {#if selected}
    <g class="points" transition:fade|local>
      {#each (pathData.points || []) as p, index}
        <circle transform="translate({p.x} {p.y})" r="3" on:mousedown|stopPropagation={addDrag(p)} />
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
