<script lang="ts">
  // @ts-check
  import {onMount} from "svelte";
  import {locale, locales, t} from "svelte-i18n";
  import {localeMap, localeNavMaxWidth} from "scripts/i18n";
  import {iconedNav} from "data/stores";
  import NavButton from "../shared/NavButton.svelte";
  import NavItem from "../shared/NavItem.svelte";

  const setIconedNav = (currentLocale: string) => {
    const maxWidth = localeNavMaxWidth[currentLocale] || localeNavMaxWidth.en;
    const iconed = maxWidth > window.innerWidth;
    iconedNav.set(iconed);
  };

  onMount(() => {
    setTimeout(() => {
      setIconedNav($locale);
    }, 0);
  });

  const changeLanguage = (newLocale: string) => {
    locale.set(newLocale);
    setIconedNav(newLocale);
    localStorage.setItem("locale", newLocale);
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
