<script>
  import {state, grid, showGrid} from "../stores";
  import {fade} from 'svelte/transition';

  $: transform = $state.transform || null;
</script>

{#if $showGrid}
  <pattern id=gridPattern width={$grid} height={$grid} patternUnits="userSpaceOnUse">
    <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#000" opacity=.2 stroke-width=.5/>
  </pattern>
  <g id=grid style="pointer-events: none" {transform} transform-origin=center transition:fade|local>
    <rect x=-200 y=-200 width=400 height=400 fill="url(#gridPattern)"/>
  </g>
{/if}