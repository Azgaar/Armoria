<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import NavItem from "../../shared/NavItem.svelte";
  import NavShieldOption from "./NavShieldOption.svelte";
  import NavColorsOption from "./NavColorsOption.svelte";
  import NavGradientOption from "./NavGradientOption.svelte";
  import NavDamaskingOption from "./NavDamaskingOption.svelte";
  import NavGalleryOption from "./NavGalleryOption.svelte";
  import NavBorderOption from "./NavBorderOption.svelte";
  import NavBackgroundOption from "./NavBackgroundOption.svelte";
  import NavScaleOption from "./NavScaleOption.svelte";
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
  </div>
</div>
