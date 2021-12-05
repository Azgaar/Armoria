import {register, init, getLocaleFromNavigator} from "svelte-i18n";

register("en", () => import("./../../public/locales/en/lang.json"));
register("ru-RU", () => import("./../../public/locales/ru/lang.json"));

init({
  fallbackLocale: "en",
  initialLocale: getLocaleFromNavigator()
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
