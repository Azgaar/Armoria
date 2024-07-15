<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import NavButton from "../../shared/NavButton.svelte";
  import NavItem from "../../shared/NavItem.svelte";
  import Lock from "../../shared/Lock.svelte";
  import {shields, shieldPaths, shieldTypes} from "$lib/data/shields";
  import {shield, changes} from "$lib/data/stores";

  const changeShield = (value: string) => {
    shield.set(value);
    localStorage.setItem("shield", value);

    if (changes.length()) {
      const coa = JSON.parse($changes[0] as string);
      coa.shield = $shield;
      changes.add(JSON.stringify(coa));
    }
  };

  const getShieldsInType = (type: string) => Object.keys(shields[type]);
</script>

<div class="container">
  <div class="dropdown level2">
    {#each shieldTypes as shieldType}
      <div class="container">
        <div class="dropdown level3 iconed">
          {#each getShieldsInType(shieldType) as shieldName}
            <NavButton onclick={() => changeShield(shieldName)}>
              <svg class:selected={shieldName === $shield} width="26" height="26" viewBox="0 0 200 210">
                <path d={shieldPaths[shieldName]} />
              </svg>
              {$t(`shield.${shieldType}.${shieldName}`)}
            </NavButton>
          {/each}
        </div>

        <NavItem>{$t(`shield.types.${shieldType}`)}</NavItem>
      </div>
    {/each}
  </div>

  {#key $shield}
    <NavItem tip={$t("tooltip.shield")}>
      <Lock key="shield" />
      {$t(`menu.shield`)}
    </NavItem>
  {/key}
</div>

<style>
  svg {
    position: absolute;
    fill: none;
    stroke: #fff;
    stroke-width: 5px;
    margin: -0.4em 0 0 -2.2em;
  }

  svg.selected {
    fill: #777;
    stroke: #333;
  }

  div.iconed {
    text-indent: 1.8em;
  }
</style>
