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
  // Keep the dev dependency graph stable while Kit's lazy client and service worker
  // load concurrently. Late optimizer runs otherwise invalidate in-flight modules.
  optimizeDeps: {
    noDiscovery: true,
    include: [
      "devalue",
      "esm-env",
      "path-data-polyfill",
      "svelte-i18n",
      "dompurify",
      "workbox-core",
      "workbox-precaching",
      "workbox-routing",
      "workbox-strategies"
    ]
  },
  define: {"process.env.NODE_ENV": '\"production\"'}
});
