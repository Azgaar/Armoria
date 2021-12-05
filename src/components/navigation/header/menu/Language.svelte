<script lang="ts">
  // @ts-check
  import {locale, locales, _ as t} from "svelte-i18n";
  import {localeMap} from "scripts/i18n";
  import NavButton from "../shared/NavButton.svelte";
  import NavItem from "../shared/NavItem.svelte";

  const changeLanguage = (newLocale: string) => {
    locale.set(newLocale);
  };
</script>

<div class="container">
  <NavItem value="language" label={$t(`menu.language`)} />
  <div class="dropdown level1">
    {#each $locales as locale}
      <NavButton label={localeMap[locale]} onclick={() => changeLanguage(locale)} />
    {/each}
  </div>
</div>
