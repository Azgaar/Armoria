<script lang="ts">
  // @ts-check
  import {fade} from "svelte/transition";

  export let label: string = undefined;
</script>

{#if label}
  <span in:fade={{duration: 100}}>
    {label}
  </span>
{/if}
