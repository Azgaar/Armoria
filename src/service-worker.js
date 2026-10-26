import {build, files, prerendered, version} from "$service-worker";
import {clientsClaim} from "workbox-core";
import {cleanupOutdatedCaches, precacheAndRoute} from "workbox-precaching";
import {registerRoute} from "workbox-routing";
import {NetworkFirst} from "workbox-strategies";

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();

// Match master's update behaviour before the precache route: load the latest
// app online, with a cached fallback when offline or the network is slow.
registerRoute(
  ({request, url}) =>
    url.origin === self.location.origin &&
    !/^\/api(?:\/|$)/.test(url.pathname) &&
    (request.mode === "navigate" || /\.(js|css|html|json)$/.test(url.pathname)),
  new NetworkFirst({cacheName: "armoria-app", networkTimeoutSeconds: 3})
);

precacheAndRoute([...build, ...files, ...prerendered].map(file => ({url: file, revision: version})));
