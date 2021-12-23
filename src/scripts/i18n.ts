import {register, init} from "svelte-i18n";
import {isTextReady} from "data/stores";
import {fetcher} from "./utils";

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

const registerSupportedLocales = async () => {
  const hash = "b12697186f40ee9c2da1f58yf2f";
  const manifest = await fetcher(`https://distributions.crowdin.net/${hash}/manifest.json`)();
  const {files, languages} = manifest;
  const file = files[0];

  if (!languages?.length || !file) {
    console.error("Could not load languages from manifest");
    isTextReady.set(true);
    return;
  }

  for (const language of languages) {
    register(language, fetcher(`https://distributions.crowdin.net/${hash}/content/${language}${file}`));
  }

  await init({fallbackLocale: "en", initialLocale: getInitialLocale()});
  isTextReady.set(true);
};
registerSupportedLocales();

export const localeNavMaxWidth = {
  en: 810,
  ru: 1080
};
