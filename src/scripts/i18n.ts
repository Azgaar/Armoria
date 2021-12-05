import {register, init, getLocaleFromNavigator} from "svelte-i18n";

register("en", () => import("./../../public/locales/en/lang.json"));
register("ru-RU", () => import("./../../public/locales/ru/lang.json"));

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
  "ru-RU": "Русский",
  es: "Español"
};

export const localeNavMaxWidth = {
  en: 810,
  "ru-RU": 1080
};
