import {register, init, getLocaleFromNavigator} from "svelte-i18n";

register("en", () => import("./../../public/locales/en/lang.json"));
register("ru-RU", () => import("./../../public/locales/ru/lang.json"));
register("es", () => import("./../../public/locales/es/lang.json"));

export const localeMap = {
  en: "English",
  "ru-RU": "Русский",
  es: "Español"
};

init({
  fallbackLocale: "en",
  initialLocale: getLocaleFromNavigator()
});
