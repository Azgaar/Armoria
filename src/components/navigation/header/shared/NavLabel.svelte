<script lang="ts">
  // @ts-check
  import {fade} from "svelte/transition";
  import {isTextReady} from "data/stores";

  export let label: string = undefined;
</script>

{#if $isTextReady}
  <span in:fade={{duration: 100}}>
    {label}
  </span>
{/if}
