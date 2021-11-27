<script>
  import {tooltip} from "scripts/tooltip";
  export let tip;
  export let gesture;
  export let hotkey;
  export let disabled;
  export let flutter;
  export let onclick;
</script>

<li class:disabled class:flutter data-tooltip={tip} {gesture} {hotkey} on:click={onclick} use:tooltip>
  <slot />
</li>

<style>
  li {
    user-select: none;
    padding: 1em;
    text-transform: capitalize;
    list-style: none;
    transition: all 0.1s;
  }

  li:hover {
    background-color: #2d2e2f;
  }

  li:active:not(:last-child) {
    transform: translateY(1px);
  }

  li:not(.disabled) {
    color: #fff;
    cursor: pointer;
  }

  li.disabled {
    pointer-events: none;
    color: #333;
  }
</style>
