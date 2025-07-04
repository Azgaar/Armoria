<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import NavItem from "../../shared/NavItem.svelte";
  import IconButton from "../../shared/IconButton.svelte";
  import {fontColor} from "data/stores";
  import {DEFAULT_FONT_COLOR} from "config/defaults";
  import ColorInput from "../../../../shared/ColorInput.svelte";

  const restoreDefaultFontColor = () => {
    fontColor.set(DEFAULT_FONT_COLOR);
    localStorage.removeItem("fontColor");
  };

  const getRandomColor = () => {
    const symbols = "0123456789ABCDEF";
    const color = "#" + [0, 0, 0, 0, 0, 0].map(() => symbols[Math.floor(Math.random() * 16)]).join("");
    fontColor.set(color);
    localStorage.setItem("fontColor", color);
  };

  const changeColor = (color: string) => {
    fontColor.set(color);
    localStorage.setItem("fontColor", color);
  };
</script>

<div class="container">
  <div class="dropdown level2">
    <NavItem>
      {$t(`menu.color`)}
      <IconButton icon="random" tip={$t("tooltip.randomColor")} onclick={getRandomColor} />

      {#if $fontColor !== DEFAULT_FONT_COLOR}
        <IconButton icon="undo" tip={$t("tooltip.undoColorChange")} onclick={restoreDefaultFontColor} />
      {/if}

      <ColorInput value={$fontColor} oninput={changeColor} />
    </NavItem>
  </div>

  <NavItem tip={$t("tooltip.fontColor")}>
    {$t(`menu.fontColor`)}
  </NavItem>
</div>
