<svelte:options runes />

<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {state as editorState} from "#lib/data/stores.ts";
  import NavButton from "../shared/NavButton.svelte";
  import NavItem from "../shared/NavItem.svelte";

  const showJSONUpload = () => {
    $editorState.import = 1;
  };

  const showRasterUpload = () => {
    $editorState.raster = 1;
  };

  const showVectorUpload = () => {
    $editorState.vector = 1;
  };
</script>

<div class="container">
  <NavItem value="upload" label={$t(`menu.upload`)} />
  <div class="dropdown level1">
    <NavButton onclick={showJSONUpload} tip={$t("tooltip.importJSON")}>
      {$t(`menu.importJSON`)}
    </NavButton>

    <NavButton onclick={showRasterUpload} tip={$t("tooltip.rasterCharge")}>
      {$t(`menu.rasterCharge`)}
    </NavButton>

    <NavButton onclick={showVectorUpload} tip={$t("tooltip.vectorCharge")}>
      {$t(`menu.vectorCharge`)}
    </NavButton>
  </div>
</div>
