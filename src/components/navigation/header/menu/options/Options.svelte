<script lang="ts">
  // @ts-check
  import {_ as t} from "svelte-i18n";
  import {state} from "data/stores";
  import {iconedNavbar} from "config/layout";
  import NavItem from "../../shared/NavItem.svelte";
  import NavButton from "../../shared/NavButton.svelte";
  import NavBackgroundOption from "./NavBackgroundOption.svelte";
  import NavBorderOption from "./NavBorderOption.svelte";
  import NavColorsOption from "./NavColorsOption.svelte";
  import NavDamaskingOption from "./NavDamaskingOption.svelte";
  import NavGalleryOption from "./NavGalleryOption.svelte";
  import NavGradientOption from "./NavGradientOption.svelte";
  import NavScaleOption from "./NavScaleOption.svelte";
  import NavShieldOption from "./NavShieldOption.svelte";

  const showLicense = () => {
    $state.license = 1;
  };
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

    {#if iconedNavbar && $state.edit}
      <NavButton onclick={showLicense} tip="Show information about license" label={$t(`menu.license`)} />
    {/if}
  </div>
</div>
