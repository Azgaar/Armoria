import App from "./components/App.svelte";

// register serviceWorker
if ("serviceWorker" in navigator && location.hostname !== "localhost") {
  navigator.serviceWorker.register("./sw.js");
}

const app = new App({
  target: document.body,
  props: {},
});

export default app;
