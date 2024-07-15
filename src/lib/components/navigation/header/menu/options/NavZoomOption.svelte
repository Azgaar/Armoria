<script lang="ts">
  // @ts-check
  import {zoom} from "$lib/data/stores";
  import {t} from "svelte-i18n";
  import RangeInput from "../../../../shared/RangeInput.svelte";
  import NavItem from "../../shared/NavItem.svelte";

  const handleInput = (value: number) => {
    zoom.set(value);
    localStorage.setItem("zoom", String($zoom));
  };
</script>

<div class="container">
  <div class="dropdown level2">
    <NavItem wide>
      <RangeInput min={0.1} max={1} step={0.1} value={$zoom} oninput={handleInput} />
    </NavItem>
  </div>

  <NavItem tip={$t("tooltip.zoom")}>
    {$t(`menu.zoom`)}
  </NavItem>
</div>
