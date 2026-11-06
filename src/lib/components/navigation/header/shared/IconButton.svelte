<script lang="ts">
  // @ts-check
  import {tooltip} from "#lib/scripts/tooltip.ts";

  let {icon, tip, onclick}: {icon: string; tip?: string; onclick: () => void} = $props();

  const handleClick = (event: Event) => {
    event.stopPropagation();
    onclick();
  };
</script>

<svg onclick={handleClick} data-tooltip={tip} use:tooltip>
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
