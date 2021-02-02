<script>
  import {tooltip} from '../tooltip';
  export let els, el, i;

  const remove = e => {
    els = els.filter((e, n) => n !== i);
    e.stopPropagation();
  }

  const clone = e => {
    els = [...els, JSON.parse(JSON.stringify(el))];
    e.stopPropagation();
  }

  const moveUp = e => {
    [els[i], els[i+1]] = [els[i+1], els[i]];
    e.stopPropagation();
  }

  const moveDown = e => {
    [els[i], els[i-1]] = [els[i-1], els[i]];
    e.stopPropagation();
  }
</script>

<span>
  <svg on:click={clone} title="Clone element" use:tooltip>
    <use href="#clone-icon"></use>
  </svg>
  {#if els.length > 1}
    {#if i}
      <svg on:click={moveDown} title="Move element down" use:tooltip>
        <use href="#down-icon"></use>
      </svg>
    {/if}
    {#if i+1 < els.length}
      <svg on:click={moveUp} title="Move element up" use:tooltip>
        <use href="#up-icon"></use>
      </svg>
    {/if}
  {/if}
  <svg on:click={remove} title="Remove element" use:tooltip>
    <use href="#remove-icon"></use>
  </svg>
</span>

<style>
  svg {
    width: .8em;
    height: .8em;
    fill: #fff;
  }

  b {
    padding: .1em;
    margin-top: -.1em;
  }

  b:active {
    transform: translateY(1px);
  }
</style>