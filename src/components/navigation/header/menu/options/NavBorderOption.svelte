<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import NavItem from "../../shared/NavItem.svelte";
  import IconButton from "../../shared/IconButton.svelte";
  import {border, borderWidth} from "data/stores";
  import {DEFAULT_BORDER, DEFAULT_BORDER_WIDTH} from "config/defaults";
  import ColorInput from "../../../../shared/ColorInput.svelte";
  import NumberInput from "../../../../shared/NumberInput.svelte";

  const restoreDefaultBorder = () => {
    border.set(DEFAULT_BORDER);
    localStorage.removeItem("border");
  };

  const restoreDefaultBorderWidth = () => {
    borderWidth.set(DEFAULT_BORDER_WIDTH);
    localStorage.removeItem("borderWidth");
  };

  const changeWidth = (width: number) => {
    borderWidth.set(width);
    localStorage.setItem("borderWidth", String(width));
  };

  const changeColor = (color: string) => {
    border.set(color);
    localStorage.setItem("border", color);
  };
</script>

<div class="container">
  <div class="dropdown level2">
    <NavItem>
      {$t(`menu.color`)}
      {#if $border !== DEFAULT_BORDER}
        <IconButton icon="undo" tip={$t("tooltip.undoColorChange")} onclick={restoreDefaultBorder} />
      {/if}
      <ColorInput value={$border} oninput={changeColor} />
    </NavItem>

    <NavItem>
      {$t(`menu.width`)}
      {#if $borderWidth !== DEFAULT_BORDER_WIDTH}
        <IconButton icon="undo" tip={$t("tooltip.undoBorderWidthChange")} onclick={restoreDefaultBorderWidth} />
      {/if}
      <NumberInput min={0} max={4} step={0.4} value={$borderWidth} oninput={changeWidth} />
    </NavItem>
  </div>

  <NavItem tip={$t("tooltip.border")}>
    {$t(`menu.border`)}
  </NavItem>
</div>
