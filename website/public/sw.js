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
  self.define = (i, c) => {
    const a =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href
    if (s[a]) return
    let t = {}
    const r = (e) => n(e, a),
      o = { module: { uri: a }, exports: t, require: r }
    s[a] = Promise.all(i.map((e) => o[e] || r(e))).then((e) => (c(...e), t))
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
          url: '/_next/static/chunks/142dd345.b13116bfd5d40db5.js',
          revision: 'b13116bfd5d40db5',
        },
        {
          url: '/_next/static/chunks/188.5c464e73d35bc181.js',
          revision: '5c464e73d35bc181',
        },
        {
          url: '/_next/static/chunks/195.9be2979cc40658d3.js',
          revision: '9be2979cc40658d3',
        },
        {
          url: '/_next/static/chunks/326.668354b4c4b7520a.js',
          revision: '668354b4c4b7520a',
        },
        {
          url: '/_next/static/chunks/340.c75e7f99069654eb.js',
          revision: 'c75e7f99069654eb',
        },
        {
          url: '/_next/static/chunks/459-96325062018811dc.js',
          revision: '96325062018811dc',
        },
        {
          url: '/_next/static/chunks/494.0fb8f5186585a78a.js',
          revision: '0fb8f5186585a78a',
        },
        {
          url: '/_next/static/chunks/502.c5da646068a4f924.js',
          revision: 'c5da646068a4f924',
        },
        {
          url: '/_next/static/chunks/614.e9f4223cd38a501b.js',
          revision: 'e9f4223cd38a501b',
        },
        {
          url: '/_next/static/chunks/616-d00b82f126359dde.js',
          revision: 'd00b82f126359dde',
        },
        {
          url: '/_next/static/chunks/842.257dd1681cf4ff1a.js',
          revision: '257dd1681cf4ff1a',
        },
        {
          url: '/_next/static/chunks/855.e882be3bc62b5dbc.js',
          revision: 'e882be3bc62b5dbc',
        },
        {
          url: '/_next/static/chunks/89-92ef279386592e5d.js',
          revision: '92ef279386592e5d',
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
          url: '/_next/static/chunks/pages/_app-08752485732a6ef9.js',
          revision: '08752485732a6ef9',
        },
        {
          url: '/_next/static/chunks/pages/_error-239f60a629a92dd1.js',
          revision: '239f60a629a92dd1',
        },
        {
          url: '/_next/static/chunks/pages/components-cee548981031d67f.js',
          revision: 'cee548981031d67f',
        },
        {
          url: '/_next/static/chunks/pages/home-ab5a9b2942943533.js',
          revision: 'ab5a9b2942943533',
        },
        {
          url: '/_next/static/chunks/pages/index-6e539e0f374c3ce0.js',
          revision: '6e539e0f374c3ce0',
        },
        {
          url: '/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js',
          revision: '837c0df77fd5009c9e46d446188ecfd0',
        },
        {
          url: '/_next/static/chunks/webpack-c56cc21b26ec65db.js',
          revision: 'c56cc21b26ec65db',
        },
        {
          url: '/_next/static/css/8a233b5df237aa85.css',
          revision: '8a233b5df237aa85',
        },
        {
          url: '/_next/static/css/b8653e77a111a8de.css',
          revision: 'b8653e77a111a8de',
        },
        {
          url: '/_next/static/css/d2527cc11610d5e8.css',
          revision: 'd2527cc11610d5e8',
        },
        {
          url: '/_next/static/css/fc65406d683146ac.css',
          revision: 'fc65406d683146ac',
        },
        {
          url: '/_next/static/v7q1iKHAxw9uThi6D-P0-/_buildManifest.js',
          revision: '5f011d9e6205189e548a1990caf0ca32',
        },
        {
          url: '/_next/static/v7q1iKHAxw9uThi6D-P0-/_ssgManifest.js',
          revision: '5352cb582146311d1540f6075d1f265e',
        },
        {
          url: '/android-chrome-192x192.png',
          revision: '2cec36d86c894a4176dba7f66ceaf921',
        },
        {
          url: '/android-chrome-512x512.png',
          revision: '516053f0219331f3c982116c08d2b377',
        },
        {
          url: '/apple-touch-icon.png',
          revision: 'f18d3d44b9af2082002bba8356563e22',
        },
        {
          url: '/favicon-16x16.png',
          revision: '6dd634de3196ba6f393f63c3720578d2',
        },
        {
          url: '/favicon-32x32.png',
          revision: '1b1410d4a48fb925cce27e29804bfbf6',
        },
        { url: '/favicon.ico', revision: '19a1218dab78fe1b97d058d2129b67e2' },
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
          url: '/mstile-144x144.png',
          revision: 'b2187f68d18967c8c654ce40522ab86d',
        },
        {
          url: '/mstile-150x150.png',
          revision: '2bc37e341cc4ca63fecad18465868633',
        },
        {
          url: '/mstile-310x150.png',
          revision: 'd1370ff86b12b55f9b995e651ac53491',
        },
        {
          url: '/mstile-310x310.png',
          revision: '7c53aa46e9d09dfcc1485d7350b19e64',
        },
        {
          url: '/mstile-70x70.png',
          revision: 'c369206944cee83aa2af0d8fc0623423',
        },
        { url: '/robots.txt', revision: '5e7cae9db7bf84d12429e5067e7098f0' },
        {
          url: '/safari-pinned-tab.svg',
          revision: 'd49e75ef6d47ef4a6edadcbb79896bea',
        },
        {
          url: '/site.webmanifest',
          revision: 'e8b501e9f3b68022ca64737b86338691',
        },
        { url: '/sitemap-0.xml', revision: '354272943d275db8b35c009b3346535f' },
        { url: '/sitemap.xml', revision: '14d21a3d0435172dda6d8fff244cafe9' },
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
