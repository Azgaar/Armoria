import {build, files, prerendered, version} from '$service-worker';
import {precacheAndRoute} from 'workbox-precaching';

precacheAndRoute([...build, ...files, ...prerendered].map(file => ({
  url: file,
  revision: version
})));
