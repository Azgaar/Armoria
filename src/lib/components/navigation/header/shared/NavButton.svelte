<script lang="ts">
  import type {Snippet} from "svelte";
  // @ts-check
  import {iconedNav} from "#lib/data/stores.ts";
  import {tooltip} from "#lib/scripts/tooltip.ts";
  import NavLabel from "./NavLabel.svelte";

  let {
    value,
    label,
    tip,
    gesture,
    hotkey,
    disabled = false,
    selected = false,
    flutter = false,
    right = false,
    onclick,
    children
  }: {
    value?: string;
    label?: string;
    tip?: string;
    gesture?: string;
    hotkey?: string;
    disabled?: boolean;
    selected?: boolean;
    flutter?: boolean;
    right?: boolean;
    onclick: () => void;
    children?: Snippet;
  } = $props();

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
  onclick={handleClick}
  onkeydown={handleClick}
  use:tooltip
>
  {#if value && $iconedNav}
    <svg>
      <use href="#{value}-icon" />
    </svg>
  {:else}
    <NavLabel {label} />
  {/if}
  {@render children?.()}
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
