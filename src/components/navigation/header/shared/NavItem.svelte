<script lang="ts">
  // @ts-check
  import {tooltip} from "scripts/tooltip";
  import {iconedNav} from "data/stores";
  import NavLabel from "./NavLabel.svelte";

  export let value: string = undefined;
  export let label: string = undefined;
  export let tip: string = undefined;
  export let wide: boolean = false;
</script>

<li class:wide data-tooltip={tip} use:tooltip>
  {#if value && $iconedNav}
    <svg>
      <use href="#{value}-icon" />
    </svg>
  {:else}
    <NavLabel {label} />
  {/if}

  <slot />
</li>

<style>
  li {
    user-select: none;
    padding: 1em;
    color: #fff;
    list-style: none;
    transition: all 0.1s;
  }

  li:hover {
    background-color: #2d2e2f;
  }

  li.wide {
    width: 12em;
  }

  svg {
    fill: currentColor;
    stroke: none;
    width: 1em;
    height: 1em;
    vertical-align: middle;
  }
</style>
