import App from "./App.svelte";
import "https://cdn.jsdelivr.net/npm/@pwabuilder/pwaupdate";

const el = document.createElement("pwa-update");
document.body.appendChild(el);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./pwabuilder-sw.js');
  });
}

const app = new App({
  target: document.body,
  props: {}
});

export default app;