<script lang="ts">
  // @ts-check
  import {fade} from "svelte/transition";

  let {label}: {label?: string} = $props();
</script>

{#if label}
  <span in:fade={{duration: 100}}>
    {label}
  </span>
{/if}
