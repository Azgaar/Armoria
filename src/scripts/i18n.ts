import {register, init} from "svelte-i18n";

register("en", () => import("./../../public/locales/en/lang.json"));
register("ru", () => import("./../../public/locales/ru/lang.json"));

const getLocaleFromNavigator = () => {
  const navigatorLang = navigator.language;
  const locale = navigatorLang.split("-")[0];
  return locale;
};

const getInitialLocale = () => {
  const stored = localStorage.getItem("locale");
  const locale = stored || getLocaleFromNavigator();
  return locale;
};

init({
  fallbackLocale: "en",
  initialLocale: getInitialLocale()
});

export const localeMap = {
  en: "English",
  ru: "Русский"
};

export const localeNavMaxWidth = {
  en: 810,
  ru: 1080
};
