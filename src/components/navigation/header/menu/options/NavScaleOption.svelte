<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import NavItem from "../../shared/NavItem.svelte";
  import RangeInput from "../../../../shared/RangeInput.svelte";
  import {scale} from "data/stores";

  const handleInput = (value: number) => {
    scale.set(value);
    localStorage.setItem("scale", String($scale));
  };
</script>

<div class="container">
  <div class="dropdown level2">
    <NavItem wide>
      <RangeInput min={1} max={4} step={0.1} value={$scale} oninput={handleInput} />
    </NavItem>
  </div>

  <NavItem tip="Downloaded image size, 1 is default size, 2 - 2x size, etc.">
    {$t(`menu.scale`)}
  </NavItem>
</div>
