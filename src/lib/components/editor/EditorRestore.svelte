<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {tooltip} from "$lib/scripts/tooltip";

  export let callback: () => void;

  function restore(e: Event) {
    e.stopPropagation();
    callback();
  }
</script>

<span>
  <svg on:click={restore} data-tooltip={$t("editor.default")} use:tooltip>
    <use href="#undo-icon" />
  </svg>
</span>

<style>
  span {
    position: absolute;
  }

  svg {
    width: 1em;
    height: 1em;
    fill: #dfdfdf;
    padding: 0 0.2em;
    transition: all 0.1s ease-in-out;
  }

  svg:hover {
    fill: #fff;
  }

  svg:active {
    transform: translateY(1px);
  }
</style>
