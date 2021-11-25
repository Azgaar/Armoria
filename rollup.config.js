import autoPreprocess from "svelte-preprocess";
import svelte from "rollup-plugin-svelte";
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import {terser} from "rollup-plugin-terser";
import {generateSW} from "rollup-plugin-workbox";

const production = !process.env.ROLLUP_WATCH;

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require("child_process").spawn("npm", ["run", "start", "--", "--dev"], {
        stdio: ["ignore", "inherit", "inherit"],
        shell: true
      });

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    }
  };
}

export default {
  input: "src/main.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/build/bundle.js"
  },
  plugins: [
    svelte({
      preprocess: autoPreprocess(),
      dev: !production,
      css: css => {
        css.write("bundle.css");
      }
    }),

    typescript({sourceMap: !production}),

    resolve({browser: true, dedupe: ["svelte"]}),

    // convert CommonJS modules to ES6
    commonjs(),

    !production && serve(),
    !production && livereload("public"),

    // generate service worker and add charges folder to precache
    production &&
      generateSW({
        swDest: "./public/sw.js",
        globDirectory: "public/",
        globPatterns: ["**/*.svg"],
        cacheId: "armoria-precache",
        cleanupOutdatedCaches: true,
        inlineWorkboxRuntime: true,
        runtimeCaching: [
          {
            urlPattern: /\.(js|css|html)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "armoria-app-files"
            }
          }
        ]
      }),

    // minify
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
};
