<script lang="ts">
  // @ts-check
  import NavItem from "../shared/NavItem.svelte";
</script>

<div class="container">
  <NavItem value="other" />

  <div class="dropdown horizontal short">
    <slot />
  </div>
</div>

<style>
  .short {
    min-width: auto;
  }
</style>
