<script lang="ts">
  // @ts-check
  import NavItem from "../shared/NavItem.svelte";
  import License from "./License.svelte";
  import About from "./About.svelte";
  import Support from "./Support.svelte";
  import Language from "./Language.svelte";
</script>

<div class="container">
  <NavItem value="other" />

  <div class="dropdown horizontal">
    <Language />
    <License />
    <Support />
    <About />
  </div>
</div>
