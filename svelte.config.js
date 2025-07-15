import adapter from "@sveltejs/adapter-vercel";
import {vitePreprocess} from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter()
  },
  onwarn: (warning, handler) => {
    if (warning.code === "a11y_click_events_have_key_events" || warning.code === "a11y_no_static_element_interactions") return;
    handler(warning);
  }
};

export default config;
