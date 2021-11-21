<script lang="ts">
  import {tooltip} from "scripts/tooltip";
  export let els: any[], el: any, i: number;

  const remove = (event: Event) => {
    event.stopPropagation();
    els = els.filter((e, n) => n !== i);
  };

  const clone = (event: Event) => {
    event.stopPropagation();
    els = [...els, JSON.parse(JSON.stringify(el))];
  };

  const forward = (event: Event) => {
    event.stopPropagation();
    [els[i], els[i + 1]] = [els[i + 1], els[i]];
  };

  const backward = (event: Event) => {
    event.stopPropagation();
    [els[i], els[i - 1]] = [els[i - 1], els[i]];
  };
</script>

<span>
  <svg on:click={clone} data-tooltip="Clone" use:tooltip>
    <use href="#clone-icon" />
  </svg>
  {#if els.length > 1}
    {#if i}
      <svg on:click={backward} data-tooltip="Send backward" use:tooltip>
        <use href="#up-icon" />
      </svg>
    {/if}
    {#if i + 1 < els.length}
      <svg on:click={forward} data-tooltip="Bring forward" use:tooltip>
        <use href="#down-icon" />
      </svg>
    {/if}
  {/if}
  <svg on:click={remove} data-tooltip="Remove" use:tooltip>
    <use href="#remove-icon" />
  </svg>
</span>

<style>
  svg {
    width: 0.8em;
    height: 0.8em;
    fill: #fff;
  }

  svg:active {
    transform: translateY(1px);
  }
</style>
