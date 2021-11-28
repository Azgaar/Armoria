<script lang="ts">
  // @ts-check
  import {tooltip} from "scripts/tooltip";

  export let tip: string = undefined;
  export let wide: boolean = false;
</script>

<li class:wide data-tooltip={tip} use:tooltip>
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
</style>
