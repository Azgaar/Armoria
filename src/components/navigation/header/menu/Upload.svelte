<script lang="ts">
  // @ts-check
  import {_ as t} from "svelte-i18n";
  import {state} from "data/stores";
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
    <NavButton onclick={showRasterUpload} tip="Upload raster charge (one color, quality loss on scale) from jpg, png or svg image">
      {$t(`menu.rasterCharge`)}
    </NavButton>

    <NavButton onclick={showVectorUpload} tip="Upload vector charge (multicolor and lossless scalable) from prepared svg">
      {$t(`menu.vectorCharge`)}
    </NavButton>
  </div>
</div>
