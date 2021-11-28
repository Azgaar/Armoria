<script lang="ts">
  // @ts-check
  import {tooltip} from "scripts/tooltip";

  export let icon: string;
  export let tip: string = undefined;
  export let onclick: (event: Event) => void;
</script>

<svg on:click={onclick} data-tooltip={tip} use:tooltip>
  <use href="#{icon}-icon" />
</svg>

<style>
  svg {
    fill: currentColor;
    width: 0.8em;
    height: 0.8em;
    vertical-align: middle;
    cursor: pointer;
  }

  svg:active {
    transform: translateY(1px);
  }
</style>
