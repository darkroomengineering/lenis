if (!self.define) {
  let e,
    s = {}
  const n = (n, a) => (
    (n = new URL(n + '.js', a).href),
    s[n] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script')
          ;(e.src = n), (e.onload = s), document.head.appendChild(e)
        } else (e = n), importScripts(n), s()
      }).then(() => {
        let e = s[n]
        if (!e) throw new Error(`Module ${n} didn’t register its module`)
        return e
      })
  )
  self.define = (a, i) => {
    const c =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href
    if (s[c]) return
    let t = {}
    const r = (e) => n(e, c),
      o = { module: { uri: c }, exports: t, require: r }
    s[c] = Promise.all(a.map((e) => o[e] || r(e))).then((e) => (i(...e), t))
  }
}
define(['./workbox-4d30eff7'], function (e) {
  'use strict'
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '/_next/static/ZEucHvN9HUvshi8v8sk9c/_buildManifest.js',
          revision: '69387dcd34534a7d97733b8c98d77bcf',
        },
        {
          url: '/_next/static/ZEucHvN9HUvshi8v8sk9c/_ssgManifest.js',
          revision: '5352cb582146311d1540f6075d1f265e',
        },
        {
          url: '/_next/static/chunks/194-ce5f69f9a6e2dc15.js',
          revision: 'ce5f69f9a6e2dc15',
        },
        {
          url: '/_next/static/chunks/234-ce160b35505ea92c.js',
          revision: 'ce160b35505ea92c',
        },
        {
          url: '/_next/static/chunks/326.5bb9d4924c9fc717.js',
          revision: '5bb9d4924c9fc717',
        },
        {
          url: '/_next/static/chunks/502.edb44d6dc58002eb.js',
          revision: 'edb44d6dc58002eb',
        },
        {
          url: '/_next/static/chunks/framework-ba86d075c3365de8.js',
          revision: 'ba86d075c3365de8',
        },
        {
          url: '/_next/static/chunks/main-f54931046ffcd8f4.js',
          revision: 'f54931046ffcd8f4',
        },
        {
          url: '/_next/static/chunks/pages/_app-8c7d0ac2632cf675.js',
          revision: '8c7d0ac2632cf675',
        },
        {
          url: '/_next/static/chunks/pages/_error-239f60a629a92dd1.js',
          revision: '239f60a629a92dd1',
        },
        {
          url: '/_next/static/chunks/pages/home-78e06029566b61c5.js',
          revision: '78e06029566b61c5',
        },
        {
          url: '/_next/static/chunks/pages/index-fe54a7316287cf2d.js',
          revision: 'fe54a7316287cf2d',
        },
        {
          url: '/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js',
          revision: '837c0df77fd5009c9e46d446188ecfd0',
        },
        {
          url: '/_next/static/chunks/webpack-cdb023f96e81577d.js',
          revision: 'cdb023f96e81577d',
        },
        {
          url: '/_next/static/css/7129874a6853f8ad.css',
          revision: '7129874a6853f8ad',
        },
        {
          url: '/_next/static/css/8a233b5df237aa85.css',
          revision: '8a233b5df237aa85',
        },
        {
          url: '/_next/static/css/fbbd0610535f144e.css',
          revision: 'fbbd0610535f144e',
        },
        {
          url: '/android-chrome-192x192.png',
          revision: 'ec033e1b5b775da43790a09a34f43278',
        },
        {
          url: '/android-chrome-512x512.png',
          revision: 'f30ddd05b814bce6028610a928a1568a',
        },
        {
          url: '/apple-touch-icon.png',
          revision: '341af53f94257f47d8589e591043f9b4',
        },
        {
          url: '/favicon-16x16.png',
          revision: 'c74a131737938caa21720c07f731b08d',
        },
        {
          url: '/favicon-32x32.png',
          revision: '763611e9088074fe59b7bd8c1ff22752',
        },
        { url: '/favicon.ico', revision: '2f3cf1385f616e11c488c34579459116' },
        { url: '/manifest.json', revision: '8edabb281c2a9ef2cea4a726ee1df74a' },
        {
          url: '/mstile-150x150.png',
          revision: 'bb18012a13596459a921563805ad1368',
        },
        { url: '/robots.txt', revision: 'be89723a86ffb628df65dec53ee6dbc6' },
        {
          url: '/safari-pinned-tab.svg',
          revision: 'c57399513e529cad8cfadf6538f2b376',
        },
        {
          url: '/site.webmanifest',
          revision: '8edabb281c2a9ef2cea4a726ee1df74a',
        },
        { url: '/sitemap-0.xml', revision: '77888a530e1008437efe82937198a99f' },
        { url: '/sitemap.xml', revision: 'f9be0e6d7fd6188cf1eec816e6c822f4' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: n,
              state: a,
            }) =>
              s && 'opaqueredirect' === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: s.headers,
                  })
                : s,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1
        const s = e.pathname
        return !s.startsWith('/api/auth/') && !!s.startsWith('/api/')
      },
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1
        return !e.pathname.startsWith('/api/')
      },
      new e.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      'GET'
    )
})
