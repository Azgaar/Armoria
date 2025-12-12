import adapter from "@sveltejs/adapter-vercel";
import {vitePreprocess} from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter()
  },
  onwarn: (warning, handler) => {
    if (warning.code === "a11y-click-events-have-key-events" || warning.code === "a11y-no-static-element-interactions") return;
    handler(warning);
  }
};

export default config;
