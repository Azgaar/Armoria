import App from "./App.svelte";

// register serviceWorker
if ("serviceWorker" in navigator) navigator.serviceWorker.register('./sw.js');

const app = new App({
  target: document.body,
  props: {}
});

window.addEventListener("beforeinstallprompt", e => {
  console.log("beforeinstallprompt from main", e);
});

export default app;