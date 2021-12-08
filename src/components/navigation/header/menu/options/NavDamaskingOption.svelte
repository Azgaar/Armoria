<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import NavButton from "../../shared/NavButton.svelte";
  import NavItem from "../../shared/NavItem.svelte";
  import Lock from "../../shared/Lock.svelte";
  import {diapers} from "config/options";
  import {diaper} from "data/stores";

  const changeDamasking = (value: string) => {
    diaper.set(value);
    localStorage.setItem("diaper", value);
  };
</script>

<div class="container">
  <div class="dropdown level2">
    {#each diapers as d}
      <NavButton selected={d === $diaper} onclick={() => changeDamasking(d)}>
        {$t(`diaper.${d}`)}
      </NavButton>
    {/each}
  </div>

  {#key $diaper}
    <NavItem tip={$t("tooltip.damasking")}>
      <Lock key="diaper" />
      {$t(`menu.damasking`)}
    </NavItem>
  {/key}
</div>
