<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import NavItem from "../../shared/NavItem.svelte";
  import RangeInput from "../../../../shared/RangeInput.svelte";
  import {zoom} from "data/stores";

  const handleInput = (value: number) => {
    zoom.set(value);
    localStorage.setItem("zoom", String($zoom));
  };
</script>

<div class="container">
  <div class="dropdown level2">
    <NavItem wide>
      <RangeInput min={1} max={5} step={0.1} value={$zoom} oninput={handleInput} />
    </NavItem>
  </div>

  <NavItem tip={$t("tooltip.zoom")}>
    {$t(`menu.zoom`)}
  </NavItem>
</div>
