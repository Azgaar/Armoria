<script lang="ts">
  // @ts-check
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
      <NavButton selected={d === $diaper} onclick={() => changeDamasking(diaper)}>
        <span>{d}</span>
      </NavButton>
    {/each}
  </div>

  {#key $diaper}
    <NavItem tip="Backing style for coat of arms, also known as diaper">
      <Lock key="diaper" />
      <span>Damasking</span>
    </NavItem>
  {/key}
</div>
