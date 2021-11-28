<script lang="ts">
  // @ts-check
  import NavItem from "../../shared/NavItem.svelte";
  import IconButton from "../../shared/IconButton.svelte";
  import {background} from "data/stores";
  import {DEFAULT_BACKGROUND} from "config/defaults";

  const restoreDefaultBackground = () => {
    background.set(DEFAULT_BACKGROUND);
    localStorage.removeItem("background");
  };

  const getRandomColor = () => {
    const l = "0123456789ABCDEF";
    const color = "#" + [0, 0, 0, 0, 0, 0].map(() => l[Math.floor(Math.random() * 16)]).join("");
    $background = color;
    localStorage.setItem("background", color);
  };

  $: localStorage.setItem("background", $background);
</script>

<div class="container">
  <div class="dropdown level2">
    <NavItem tip="Window background color">
      Color
      <IconButton icon="random" tip="Use random color" onclick={getRandomColor} />

      {#if $background !== DEFAULT_BACKGROUND}
        <IconButton icon="undo" tip="Restore default color" onclick={restoreDefaultBackground} />
      {/if}
      <input type="color" bind:value={$background} />
    </NavItem>
  </div>

  <NavItem tip="Window background color">Background</NavItem>
</div>
