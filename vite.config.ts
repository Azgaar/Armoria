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
  // Kit includes nested dependency IDs, but its lazy client also imports these bare
  // IDs. Optimize both up front to avoid invalidating in-flight client modules.
  optimizeDeps: {include: ["devalue", "esm-env"]},
  define: {"process.env.NODE_ENV": '\"production\"'}
});
