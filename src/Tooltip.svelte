<script>
  // Source: https://github.com/Abreu00/svelte-tooltip
  export let tip = "", top = false, bottom = false, left = false, active = false, color = "#222";
  let right = top || bottom || left ? false : true; // default side 
  let style = `background-color: ${color};`;
</script>

<div class="tooltip-wrapper">
  <span class="tooltip-slot">
    <slot/>
  </span>
  <div class="tooltip" class:active class:left class:right class:bottom class:top>
    {#if tip}
      <div class="default-tip" {style}>{tip}</div>
    {:else}
      <slot name="custom-tip" />
    {/if}
  </div>
</div>

<style>
  .tooltip-wrapper {
    position: relative;
    display: inline-block;
    cursor: help;
  }
  .tooltip {
    position: absolute;
    font-family: inherit;
    display: inline-block;
    white-space: nowrap;
    color: inherit;
    opacity: 0;
    visibility: hidden;
    text-transform: initial;
    transition-delay: .5s;
    transition-property: opacity;
    transition-duration: 150ms;
    z-index: 10;
  }

  .default-tip {
    display: inline-block;
    padding: .5em .8em;
    border-radius: .4em;
    font-size: .9em;
    color: inherit;
  }

  .tooltip.top {
    left: 50%;
    transform: translate(-50%, -100%);
    margin-top: -8px;
  }

  .tooltip.bottom {
    left: 50%;
    bottom: 0;
    transform: translate(-50%, 100%);
    margin-bottom: -8px;
  }

  .tooltip.left {
    left: 0;
    transform: translateX(-100%);
    margin-left: -8px;
  }

  .tooltip.right {
    right: 0;
    transform: translateX(100%);
    margin-right: -8px;
  }

  .tooltip.active {
    opacity: 1;
    visibility: initial;
  }

  .tooltip-slot:hover + .tooltip {
    opacity: 1;
    visibility: initial;
  }
</style>