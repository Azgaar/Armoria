<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {tooltip} from "$lib/scripts/tooltip";

  export let els: any[];
  export let el: any;
  export let i: number;

  const remove = (event: Event) => {
    event.stopPropagation();
    els = els.filter((e, n) => n !== i);
  };

  const clone = (event: Event) => {
    event.stopPropagation();
    const elementCopy = JSON.parse(JSON.stringify(el));
    els = [...els, elementCopy];
  };

  const forward = (event: Event) => {
    event.stopPropagation();
    [els[i], els[i + 1]] = [els[i + 1], els[i]];
  };

  const backward = (event: Event) => {
    event.stopPropagation();
    [els[i], els[i - 1]] = [els[i - 1], els[i]];
  };

  const areDifferent = (a: any, b: any) => {
    return JSON.stringify(a) !== JSON.stringify(b);
  };
</script>

<span>
  <svg on:click={clone} data-tooltip={$t("editor.clone")} use:tooltip>
    <use href="#clone-icon" />
  </svg>
  {#if els.length > 1}
    {#if i && areDifferent(el, els[i - 1])}
      <svg on:click={backward} data-tooltip={$t("editor.backward")} use:tooltip>
        <use href="#up-icon" />
      </svg>
    {/if}
    {#if i + 1 < els.length && areDifferent(el, els[i + 1])}
      <svg on:click={forward} data-tooltip={$t("editor.forward")} use:tooltip>
        <use href="#down-icon" />
      </svg>
    {/if}
  {/if}
  <svg on:click={remove} data-tooltip={$t("editor.remove")} use:tooltip>
    <use href="#remove-icon" />
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
