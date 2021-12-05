<script lang="ts">
  // @ts-check
  import {_ as t} from "svelte-i18n";
  import {iconedNav, state} from "data/stores";
  import NavItem from "../../shared/NavItem.svelte";
  import NavShieldOption from "./NavShieldOption.svelte";
  import NavColorsOption from "./NavColorsOption.svelte";
  import NavGradientOption from "./NavGradientOption.svelte";
  import NavDamaskingOption from "./NavDamaskingOption.svelte";
  import NavGalleryOption from "./NavGalleryOption.svelte";
  import NavBorderOption from "./NavBorderOption.svelte";
  import NavBackgroundOption from "./NavBackgroundOption.svelte";
  import NavScaleOption from "./NavScaleOption.svelte";
  import License from "../License.svelte";
</script>

<div class="container">
  <NavItem value="options" label={$t(`menu.options`)} />

  <div class="dropdown level1">
    <NavShieldOption />
    <NavColorsOption />
    <NavGradientOption />
    <NavDamaskingOption />
    <NavGalleryOption />
    <NavBorderOption />
    <NavBackgroundOption />
    <NavScaleOption />

    {#if $iconedNav && $state.edit}
      <License />
    {/if}
  </div>
</div>
