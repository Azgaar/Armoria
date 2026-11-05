import {sveltekit} from "@sveltejs/kit/vite";
import {vitePreprocess} from "@sveltejs/vite-plugin-svelte";
import adapter from "@sveltejs/adapter-vercel";
import {defineConfig} from "vite";

export default defineConfig({
  plugins: [
    sveltekit({
      preprocess: vitePreprocess(),
      adapter: adapter({runtime: "nodejs24.x"}),
      onwarn: (warning, handler) => {
        if (warning.code === "a11y_click_events_have_key_events" || warning.code === "a11y_no_static_element_interactions")
          return;
        handler(warning);
      }
    })
  ],
  define: {"process.env.NODE_ENV": '\"production\"'}
});
