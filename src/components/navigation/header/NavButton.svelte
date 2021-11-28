<script lang="ts">
  // @ts-check
  import {tooltip} from "scripts/tooltip";
  export let tip: string = undefined;
  export let gesture: string = undefined;
  export let hotkey: string = undefined;
  export let disabled: boolean = false;
  export let selected: boolean = false;
  export let flutter: boolean = false;
  export let onclick: (event: Event) => void;
</script>

<li class:disabled class:selected class:flutter data-tooltip={tip} data-gesture={gesture} data-hotkey={hotkey} on:click={onclick} use:tooltip>
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

  li.selected:before {
    content: "\2713";
    display: inline-block;
    padding: 0 6px 0 0;
  }
</style>
