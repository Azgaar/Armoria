<script lang="ts">
  import type {Snippet} from "svelte";
  // @ts-check
  import {tooltip} from "#lib/scripts/tooltip.ts";
  import {iconedNav} from "#lib/data/stores.ts";
  import NavLabel from "./NavLabel.svelte";

  let {
    value,
    label,
    tip,
    wide = false,
    children
  }: {
    value?: string;
    label?: string;
    tip?: string;
    wide?: boolean;
    children?: Snippet;
  } = $props();
</script>

<li class:wide data-tooltip={tip} use:tooltip>
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
    color: #fff;
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
