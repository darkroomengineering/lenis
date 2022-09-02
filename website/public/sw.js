if (!self.define) {
  let e,
    s = {}
  const n = (n, i) => (
    (n = new URL(n + '.js', i).href),
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
  self.define = (i, a) => {
    const t =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href
    if (s[t]) return
    let c = {}
    const r = (e) => n(e, t),
      o = { module: { uri: t }, exports: c, require: r }
    s[t] = Promise.all(i.map((e) => o[e] || r(e))).then((e) => (a(...e), c))
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
          url: '/_next/static/RXE1qZnqTRgpOv8aGTJBG/_buildManifest.js',
          revision: '0f6af3429e96c0f488cbcd11e4a84ced',
        },
        {
          url: '/_next/static/RXE1qZnqTRgpOv8aGTJBG/_ssgManifest.js',
          revision: '5352cb582146311d1540f6075d1f265e',
        },
        {
          url: '/_next/static/chunks/188.6993b57baa27f12e.js',
          revision: '6993b57baa27f12e',
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
          url: '/_next/static/chunks/614.dbfe6d81ccb666d7.js',
          revision: 'dbfe6d81ccb666d7',
        },
        {
          url: '/_next/static/chunks/671-34ba9fdd985e3278.js',
          revision: '34ba9fdd985e3278',
        },
        {
          url: '/_next/static/chunks/856-28053615a6161962.js',
          revision: '28053615a6161962',
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
          url: '/_next/static/chunks/pages/_app-326a317de87ad85e.js',
          revision: '326a317de87ad85e',
        },
        {
          url: '/_next/static/chunks/pages/_error-239f60a629a92dd1.js',
          revision: '239f60a629a92dd1',
        },
        {
          url: '/_next/static/chunks/pages/home-8993e747556d49f5.js',
          revision: '8993e747556d49f5',
        },
        {
          url: '/_next/static/chunks/pages/index-7fba21820947906f.js',
          revision: '7fba21820947906f',
        },
        {
          url: '/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js',
          revision: '837c0df77fd5009c9e46d446188ecfd0',
        },
        {
          url: '/_next/static/chunks/webpack-ec07fcec31f3ebe2.js',
          revision: 'ec07fcec31f3ebe2',
        },
        {
          url: '/_next/static/css/1363e7b8951a7756.css',
          revision: '1363e7b8951a7756',
        },
        {
          url: '/_next/static/css/8a233b5df237aa85.css',
          revision: '8a233b5df237aa85',
        },
        {
          url: '/_next/static/css/df94ed591972abbb.css',
          revision: 'df94ed591972abbb',
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
        {
          url: '/fonts/Slussen-Bold.woff2',
          revision: 'e7763140521609dc25ea44f512606bd3',
        },
        {
          url: '/fonts/Slussen-Compressed-Black.woff2',
          revision: '03544e36539058c093dcd5dd9bb8196c',
        },
        {
          url: '/fonts/Slussen-Expanded-Black.woff2',
          revision: 'ec68f3582a4274fb58287f7a85173047',
        },
        {
          url: '/fonts/Slussen-Medium.woff2',
          revision: '58b3bab2301a6332846956924fb2717b',
        },
        {
          url: '/fonts/Slussen-Regular.woff2',
          revision: '607dbd3e6823789222434856623059de',
        },
        {
          url: '/fonts/Slussen-Semibold.woff2',
          revision: '7b17a1bc6619610d74bc39355860c796',
        },
        { url: '/manifest.json', revision: 'e8b501e9f3b68022ca64737b86338691' },
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
          revision: 'e8b501e9f3b68022ca64737b86338691',
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
              state: i,
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
