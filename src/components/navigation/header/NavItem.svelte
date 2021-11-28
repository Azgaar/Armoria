<script lang="ts">
  // @ts-check
  import {tooltip} from "scripts/tooltip";

  export let value: string = undefined;
  export let tip: string = undefined;
  export let wide: boolean = false;

  $: showIcon = window.innerWidth <= 600;
</script>

<li class:wide data-tooltip={tip} use:tooltip>
  {#if value && showIcon}
    <svg>
      <use href="#{value}-icon" />
    </svg>
  {:else if value}
    {value}
  {/if}

  <slot />
</li>

<style>
  li {
    user-select: none;
    padding: 1em;
    color: #fff;
    text-transform: capitalize;
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
