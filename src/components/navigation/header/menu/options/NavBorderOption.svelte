<script lang="ts">
  // @ts-check
  import {_ as t} from "svelte-i18n";
  import NavItem from "../../shared/NavItem.svelte";
  import IconButton from "../../shared/IconButton.svelte";
  import NavNumberInput from "../../inputs/NavNumberInput.svelte";
  import {border, borderWidth} from "data/stores";
  import {DEFAULT_BORDER, DEFAULT_BORDER_WIDTH} from "config/defaults";

  const restoreDefaultBorder = () => {
    border.set(DEFAULT_BORDER);
    localStorage.removeItem("border");
  };

  const restoreDefaultBorderWidth = () => {
    borderWidth.set(DEFAULT_BORDER_WIDTH);
    localStorage.removeItem("borderWidth");
  };

  $: localStorage.setItem("border", $border);
  $: localStorage.setItem("borderWidth", String($borderWidth));
</script>

<div class="container">
  <div class="dropdown level2">
    <NavItem>
      {$t(`menu.color`)}
      {#if $border !== DEFAULT_BORDER}
        <IconButton icon="undo" tip="Restore default color" onclick={restoreDefaultBorder} />
      {/if}
      <input type="color" bind:value={$border} />
    </NavItem>

    <NavItem>
      {$t(`menu.width`)}
      {#if $borderWidth !== DEFAULT_BORDER_WIDTH}
        <IconButton icon="undo" tip="Restore default border width" onclick={restoreDefaultBorderWidth} />
      {/if}
      <NavNumberInput right min={0} max={4} step={0.4} oninput={value => borderWidth.set(value)} value={$borderWidth} />
    </NavItem>
  </div>

  <NavItem tip="Coat of arms border style">
    {$t(`menu.border`)}
  </NavItem>
</div>
