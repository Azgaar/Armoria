import {register, init} from "svelte-i18n";
import {isTextReady} from "data/stores";
import {fetcher} from "./utils";

const localesPath = "./locales/";
const fallbackLocale = "en";

const registerSupportedLocales = async () => {
  try {
    const manifest = await fetcher(`${localesPath}manifest.json`)();
    const {files, languages} = manifest;
    const file = files[0];

    if (!languages?.length || !file) {
      throw new Error("Could not load languages from manifest");
    }

    for (const language of languages) {
      register(language, fetcher(`${localesPath}${language}${file}`));
    }

    const storedLocale = localStorage.getItem("locale");
    const preferredLocale = storedLocale || navigator.language;
    const shortLocale = preferredLocale.split("-")[0];
    const initialLocale = languages.find((language: string) => language === preferredLocale || language === shortLocale) || fallbackLocale;

    await init({fallbackLocale, initialLocale});
    isTextReady.set(true);
  }
  catch(error) {
    console.error(error);
    isTextReady.set(true);
  }
};

registerSupportedLocales();
