<svelte:options runes />

<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {state as editorState} from "#lib/data/stores.ts";
  import Lock from "../../shared/Lock.svelte";
  import NavButton from "../../shared/NavButton.svelte";

  const showTinctures = () => {
    $editorState.tinctures = 1;
  };
</script>

<NavButton onclick={showTinctures} tip={$t("tooltip.colors")}>
  <Lock key="tinctures" />
  <Lock key="colors" />
  {$t(`menu.colors`)}
</NavButton>
