import App from "./components/App.svelte";
import "scripts/aliases";

const isProduction = process.env.production;

if (isProduction && "serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}

const app = new App({
  target: document.body,
  props: {}
});

export default app;
