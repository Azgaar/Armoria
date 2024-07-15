<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {state} from "$lib/data/stores";
  import NavButton from "../shared/NavButton.svelte";
  import NavItem from "../shared/NavItem.svelte";

  const showRasterUpload = () => {
    $state.raster = 1;
  };

  const showVectorUpload = () => {
    $state.vector = 1;
  };
</script>

<div class="container">
  <NavItem value="upload" label={$t(`menu.upload`)} />
  <div class="dropdown level1">
    <NavButton onclick={showRasterUpload} tip={$t("tooltip.rasterCharge")}>
      {$t(`menu.rasterCharge`)}
    </NavButton>

    <NavButton onclick={showVectorUpload} tip={$t("tooltip.vectorCharge")}>
      {$t(`menu.vectorCharge`)}
    </NavButton>
  </div>
</div>
