/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core'
import {
  addPlugins,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
  type PrecacheEntry,
} from 'workbox-precaching'
import { RangeRequestsPlugin } from 'workbox-range-requests'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: PrecacheEntry[] }

self.importScripts('push-handler.js')
void self.skipWaiting()
clientsClaim()

addPlugins([new RangeRequestsPlugin()])
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()
registerRoute(
  ({ sameOrigin, url }) =>
    sameOrigin &&
    (url.pathname === '/api/drinks' ||
      /^\/api\/(?:drinks|drink-images)\/[^/]+$/.test(url.pathname)),
  new NetworkFirst({ cacheName: 'drink-cat-catalog', networkTimeoutSeconds: 3 }),
)
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('index.html'), { denylist: [/^\/api(?:\/|$)/] }),
)
