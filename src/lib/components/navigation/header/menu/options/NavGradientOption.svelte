<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import NavButton from "../../shared/NavButton.svelte";
  import NavItem from "../../shared/NavItem.svelte";
  import Lock from "../../shared/Lock.svelte";
  import {gradients} from "$lib/config/options";
  import {grad} from "$lib/data/stores";

  const changeGradient = (value: string) => {
    grad.set(value);
    localStorage.setItem("grad", value);
  };
</script>

<div class="container">
  <div class="dropdown level2">
    {#each gradients as gradient}
      <NavButton selected={gradient === $grad} onclick={() => changeGradient(gradient)}>
        {$t(`gradient.${gradient}`)}
      </NavButton>
    {/each}
  </div>

  {#key $grad}
    <NavItem tip={$t("tooltip.gradient")}>
      <Lock key="grad" />
      {$t(`menu.gradient`)}
    </NavItem>
  {/key}
</div>
