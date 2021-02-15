import App from "./components/App.svelte";

// register serviceWorker
if ("serviceWorker" in navigator) navigator.serviceWorker.register('./sw.js');

const app = new App({
  target: document.body,
  props: {}
});

export default app;