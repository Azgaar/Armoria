<script>
  import {tooltip} from "@/scripts/tooltip";
  export let els, el, i;

  const remove = e => {
    els = els.filter((e, n) => n !== i);
    e.stopPropagation();
  };

  const clone = e => {
    els = [...els, JSON.parse(JSON.stringify(el))];
    e.stopPropagation();
  };

  const forward = e => {
    [els[i], els[i + 1]] = [els[i + 1], els[i]];
    e.stopPropagation();
  };

  const backward = e => {
    [els[i], els[i - 1]] = [els[i - 1], els[i]];
    e.stopPropagation();
  };
</script>

<span>
  <svg on:click={clone} title="Clone" use:tooltip>
    <use href="#clone-icon" />
  </svg>
  {#if els.length > 1}
    {#if i}
      <svg on:click={backward} title="Send backward" use:tooltip>
        <use href="#up-icon" />
      </svg>
    {/if}
    {#if i + 1 < els.length}
      <svg on:click={forward} title="Bring forward" use:tooltip>
        <use href="#down-icon" />
      </svg>
    {/if}
  {/if}
  <svg on:click={remove} title="Remove" use:tooltip>
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
