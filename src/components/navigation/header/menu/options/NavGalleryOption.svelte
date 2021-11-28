<script lang="ts">
  // @ts-check
  import NavButton from "../../shared/NavButton.svelte";
  import NavItem from "../../shared/NavItem.svelte";
  import Lock from "../../shared/Lock.svelte";
  import {sizes} from "config/options";
  import {size} from "data/stores";

  const changeSize = (value: string | number) => {
    if (typeof value !== "number") return;

    size.set(value);
    localStorage.setItem("size", String(value));
  };
</script>

<div class="container">
  <div class="dropdown level2">
    {#each sizes as [sizeNumber, sizeName]}
      <NavButton selected={sizeNumber === $size} onclick={() => changeSize(sizeNumber)}>
        {sizeName}
      </NavButton>
    {/each}
  </div>

  {#key $size}
    <NavItem tip="Coat of arms gallery size. Change to smaller value to make coat of arms bigger">
      <Lock key="size" />
      Gallery
    </NavItem>
  {/key}
</div>
