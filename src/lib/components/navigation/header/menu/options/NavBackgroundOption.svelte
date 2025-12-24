<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import NavItem from "../../shared/NavItem.svelte";
  import IconButton from "../../shared/IconButton.svelte";
  import {background} from "$lib/data/stores";
  import {DEFAULT_BACKGROUND} from "$lib/config/defaults";
  import ColorInput from "../../../../shared/ColorInput.svelte";

  const restoreDefaultBackground = () => {
    background.set(DEFAULT_BACKGROUND);
    localStorage.removeItem("background");
  };

  const getRandomColor = () => {
    const symbols = "0123456789ABCDEF";
    const color = "#" + [0, 0, 0, 0, 0, 0].map(() => symbols[Math.floor(Math.random() * 16)]).join("");
    background.set(color);
    localStorage.setItem("background", color);
  };

  const changeColor = (color: string) => {
    background.set(color);
    localStorage.setItem("background", color);
  };
</script>

<div class="container">
  <div class="dropdown level2">
    <NavItem>
      {$t(`menu.color`)}
      <IconButton icon="random" tip={$t("tooltip.randomColor")} onclick={getRandomColor} />

      {#if $background !== DEFAULT_BACKGROUND}
        <IconButton icon="undo" tip={$t("tooltip.undoColorChange")} onclick={restoreDefaultBackground} />
      {/if}

      <ColorInput value={$background} oninput={changeColor} />
    </NavItem>
  </div>

  <NavItem tip={$t("tooltip.background")}>
    {$t(`menu.background`)}
  </NavItem>
</div>
