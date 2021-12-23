import {register, init} from "svelte-i18n";
import {isTextReady} from "data/stores";
import {fetcher} from "./utils";

const cdn = "https://distributions.crowdin.net";
const hash = "b12697186f40ee9c2da1f58yf2f";
const fallbackLocale = "en";

const registerSupportedLocales = async () => {
  const manifest = await fetcher(`${cdn}/${hash}/manifest.json`)();
  const {files, languages} = manifest;
  const file = files[0];

  if (!languages?.length || !file) {
    console.error("Could not load languages from manifest");
    isTextReady.set(true);
    return;
  }

  for (const language of languages) {
    register(language, fetcher(`${cdn}/${hash}/content/${language}${file}`));
  }

  const storedLocale = localStorage.getItem("locale");
  const navigatorLocale = navigator.language;
  const baseNavigatorLocale = navigatorLocale.split("-")[0];
  const desiredLocale = [storedLocale, navigatorLocale, baseNavigatorLocale];
  const initialLocale = languages.find((language: string) => desiredLocale.includes(language)) || fallbackLocale;

  await init({fallbackLocale, initialLocale});
  isTextReady.set(true);
};

registerSupportedLocales();
