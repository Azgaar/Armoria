<script lang="ts">
  // @ts-check
  import {_ as t} from "svelte-i18n";
  import NavItem from "../../shared/NavItem.svelte";
  import {scale} from "data/stores";

  $: localStorage.setItem("scale", String($scale));
</script>

<div class="container">
  <div class="dropdown level2">
    <NavItem wide>
      <input type="range" min="1" max="4" step=".1" bind:value={$scale} />
      <input type="number" min="1" max="4" step=".1" bind:value={$scale} />
    </NavItem>
  </div>

  <NavItem tip="Downloaded image size, 1 is default size, 2 - 2x size, etc.">
    {$t(`menu.scale`)}
  </NavItem>
</div>
