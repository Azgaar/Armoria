import {register, init} from "svelte-i18n";
import {isTextReady} from "data/stores";
import {fetcher} from "./utils";

const fallbackLocale = "en";

const registerSupportedLocales = async () => {
  const manifest = await fetcher(`/locales/manifest.json`)();
  const {files, languages} = manifest;
  const file = files[0];

  if (!languages?.length || !file) {
    console.error("Could not load languages from manifest");
    isTextReady.set(true);
    return;
  }

  for (const language of languages) {
    register(language, fetcher(`/locales/${language}${file}`));
  }

  const storedLocale = localStorage.getItem("locale");
  const preferredLocale = storedLocale || navigator.language;
  const shortLocale = preferredLocale.split("-")[0];
  const initialLocale = languages.find((language: string) => language === preferredLocale || language === shortLocale) || fallbackLocale;

  await init({fallbackLocale, initialLocale});
  isTextReady.set(true);
};

registerSupportedLocales();