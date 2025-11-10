<script lang="ts">
  // @ts-check
  import {iconedNav} from "$lib/data/stores";
  import {tooltip} from "$lib/scripts/tooltip";
  import NavLabel from "./NavLabel.svelte";

  export let value: string = undefined;
  export let label: string = undefined;
  export let tip: string = undefined;
  export let gesture: string = undefined;
  export let hotkey: string = undefined;
  export let disabled: boolean = false;
  export let selected: boolean = false;
  export let flutter: boolean = false;
  export let right: boolean = false;
  export let onclick: () => void;

  const handleClick = (event: Event) => {
    event.stopPropagation();
    onclick();
  };
</script>

<li
  class:disabled
  class:selected
  class:flutter
  class:right
  data-tooltip={tip}
  data-gesture={gesture}
  data-hotkey={hotkey}
  on:click={handleClick}
  on:keydown={handleClick}
  use:tooltip
>
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
    list-style: none;
    transition: all 0.1s;
  }

  @media (max-width: 380px) {
    li {
      padding-inline: 0.75em;
    }
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

  li.right {
    margin-left: auto;
  }

  svg {
    fill: currentColor;
    stroke: none;
    width: 1em;
    height: 1em;
    vertical-align: middle;
  }
</style>
