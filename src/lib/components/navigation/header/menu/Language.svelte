<script lang="ts">
  // @ts-check
  import {locale, locales, t} from "svelte-i18n";
  import {capitalize} from "$lib/scripts/utils";
  import NavButton from "../shared/NavButton.svelte";
  import NavItem from "../shared/NavItem.svelte";

  const changeLanguage = (newLocale: string) => () => {
    locale.set(newLocale);
    localStorage.setItem("locale", newLocale);
  };

  const getLocaleName = (locale: string) => {
    const languageName = new Intl.DisplayNames([locale], {type: "language"});
    return capitalize(languageName.of(locale));
  };
</script>

<div class="container">
  <NavItem value="language" label={$t(`menu.language`)} tip={$t("tooltip.language")} />
  <div class="dropdown level1">
    {#each $locales as langCode}
      <NavButton selected={$locale === langCode} label={getLocaleName(langCode)} onclick={changeLanguage(langCode)} />
    {/each}
  </div>
</div>
