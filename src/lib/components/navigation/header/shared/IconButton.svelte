<script lang="ts">
  // @ts-check
  import {tooltip} from "$lib/scripts/tooltip";

  export let icon: string;
  export let tip: string = undefined;
  export let onclick: () => void;

  const handleClick = (event: Event) => {
    event.stopPropagation();
    onclick();
  };
</script>

<svg on:click={handleClick} data-tooltip={tip} use:tooltip>
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
