<script lang="ts">
  // @ts-check
  import NavItem from "../../shared/NavItem.svelte";
  import IconButton from "../../shared/IconButton.svelte";
  import NavNumberInput from "../../inputs/NavNumberInput.svelte";
  import {border, borderWidth} from "data/stores";

  const restoreDefaultBorder = () => {
    border.set("#333333");
    localStorage.removeItem("border");
  };

  const restoreDefaultBorderWidth = () => {
    borderWidth.set(1);
    localStorage.removeItem("borderWidth");
  };

  $: localStorage.setItem("border", $border);
  $: localStorage.setItem("borderWidth", String($borderWidth));
</script>

<div class="container">
  <div class="dropdown level2">
    <NavItem>
      <span>Color</span>
      {#if $border !== "#333333"}
        <IconButton icon="undo" tip="Restore default color" onclick={restoreDefaultBorder} />
      {/if}
      <input type="color" bind:value={$border} />
    </NavItem>

    <NavItem>
      <span>Width</span>
      {#if $borderWidth !== 1}
        <IconButton icon="undo" tip="Restore default border width" onclick={restoreDefaultBorderWidth} />
      {/if}
      <NavNumberInput right min={0} max={4} step={0.4} oninput={value => borderWidth.set(value)} value={$borderWidth} />
    </NavItem>
  </div>

  <NavItem tip="Coat of arms border style">
    <span>Border</span>
  </NavItem>
</div>
