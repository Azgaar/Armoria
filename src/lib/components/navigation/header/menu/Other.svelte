<script lang="ts">
  import type {Snippet} from "svelte";
  // @ts-check
  import NavItem from "../shared/NavItem.svelte";

  let {children}: {children?: Snippet} = $props();
</script>

<div class="container">
  <NavItem value="other" />

  <div class="dropdown horizontal short">
    {@render children?.()}
  </div>
</div>

<style>
  .short {
    min-width: auto;
  }
</style>
