import {isTextReady} from "data/stores";
import {init, register} from "svelte-i18n";
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
    const initialLocale =
      languages.find((language: string) => language === preferredLocale || language === shortLocale) || fallbackLocale;

    await init({fallbackLocale, initialLocale});
    isTextReady.set(true);
  } catch (error) {
    console.error(error);
    isTextReady.set(true);
  }
};

registerSupportedLocales();

// parse translated string in Markdown format (partial support) to HTML
export function markdown(input: string) {
  input = input.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"); // bold
  input = input.replace(/\*(.+?)\*/g, "<em>$1</em>"); // italic
  input = input.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>'); // link

  return input;
}
