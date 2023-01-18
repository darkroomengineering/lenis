if (!self.define) {
  let e,
    s = {}
  const n = (n, c) => (
    (n = new URL(n + '.js', c).href),
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
  self.define = (c, i) => {
    const a =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href
    if (s[a]) return
    let t = {}
    const r = (e) => n(e, a),
      o = { module: { uri: a }, exports: t, require: r }
    s[a] = Promise.all(c.map((e) => o[e] || r(e))).then((e) => (i(...e), t))
  }
}
define(['./workbox-7028bf80'], function (e) {
  'use strict'
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '/_next/static/21iTtEKKEgKfKZN_hn_bk/_buildManifest.js',
          revision: '26f347e6772c6ce81517b9e8d1cc999c',
        },
        {
          url: '/_next/static/21iTtEKKEgKfKZN_hn_bk/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/214-9f07825ab9342f94.js',
          revision: '9f07825ab9342f94',
        },
        {
          url: '/_next/static/chunks/237.64b56cf5256a7176.js',
          revision: '64b56cf5256a7176',
        },
        {
          url: '/_next/static/chunks/245-4fdf056a5effe55c.js',
          revision: '4fdf056a5effe55c',
        },
        {
          url: '/_next/static/chunks/257-479b66cbfb5f81d4.js',
          revision: '479b66cbfb5f81d4',
        },
        {
          url: '/_next/static/chunks/3045677e.2e1d139393b47856.js',
          revision: '2e1d139393b47856',
        },
        {
          url: '/_next/static/chunks/316.10fea43d370c3a02.js',
          revision: '10fea43d370c3a02',
        },
        {
          url: '/_next/static/chunks/457.557fe559dd28e478.js',
          revision: '557fe559dd28e478',
        },
        {
          url: '/_next/static/chunks/542.57530c81ed716758.js',
          revision: '57530c81ed716758',
        },
        {
          url: '/_next/static/chunks/590.25f32ee5e41babf6.js',
          revision: '25f32ee5e41babf6',
        },
        {
          url: '/_next/static/chunks/68.6cd8c07f782f8ca4.js',
          revision: '6cd8c07f782f8ca4',
        },
        {
          url: '/_next/static/chunks/735.46ccd0535d0c122c.js',
          revision: '46ccd0535d0c122c',
        },
        {
          url: '/_next/static/chunks/752.b28c6d7af448f5c3.js',
          revision: 'b28c6d7af448f5c3',
        },
        {
          url: '/_next/static/chunks/930.742cd96a0733e608.js',
          revision: '742cd96a0733e608',
        },
        {
          url: '/_next/static/chunks/framework-581f102fc68ef277.js',
          revision: '581f102fc68ef277',
        },
        {
          url: '/_next/static/chunks/main-e614ce263c4c39dd.js',
          revision: 'e614ce263c4c39dd',
        },
        {
          url: '/_next/static/chunks/pages/_app-3d53125cf011aa26.js',
          revision: '3d53125cf011aa26',
        },
        {
          url: '/_next/static/chunks/pages/_error-4750231d615c8077.js',
          revision: '4750231d615c8077',
        },
        {
          url: '/_next/static/chunks/pages/home-5ea834c6e367201f.js',
          revision: '5ea834c6e367201f',
        },
        {
          url: '/_next/static/chunks/pages/index-55f298ac901aacc3.js',
          revision: '55f298ac901aacc3',
        },
        {
          url: '/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js',
          revision: '837c0df77fd5009c9e46d446188ecfd0',
        },
        {
          url: '/_next/static/chunks/webpack-c5e51873a37bf060.js',
          revision: 'c5e51873a37bf060',
        },
        {
          url: '/_next/static/css/49db7c7ec778dd3e.css',
          revision: '49db7c7ec778dd3e',
        },
        {
          url: '/_next/static/css/59f9cbcd6da5cc30.css',
          revision: '59f9cbcd6da5cc30',
        },
        {
          url: '/_next/static/css/8a233b5df237aa85.css',
          revision: '8a233b5df237aa85',
        },
        {
          url: '/_next/static/css/ae60ce9d0c79077a.css',
          revision: 'ae60ce9d0c79077a',
        },
        {
          url: '/android-chrome-192x192.png',
          revision: '04eb6136d9dc975f98a1f26dad3a18c2',
        },
        {
          url: '/android-chrome-512x512.png',
          revision: '5ba0786478ab465215d7156b8a623a5e',
        },
        {
          url: '/apple-touch-icon.png',
          revision: '9060e0a05ed9801bc5b539250957553b',
        },
        {
          url: '/favicon-16x16.png',
          revision: '7c8feca611e573887cbe1e7d4ab10259',
        },
        {
          url: '/favicon-32x32.png',
          revision: 'a29a4e8cd9548bad4738130754e260e5',
        },
        { url: '/favicon.ico', revision: '4fb3df6ed391a3eda1b886aa150d1891' },
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
          url: '/models/arm.glb',
          revision: 'e2088db2700752eb8a6d38861b57ff39',
        },
        {
          url: '/models/arm2.glb',
          revision: 'd38b4c53972c5a261b6c74eaeed2e0ee',
        },
        {
          url: '/mstile-144x144.png',
          revision: '33e7495d37ae7978f4efebcbaa3808ff',
        },
        {
          url: '/mstile-150x150.png',
          revision: '096242c965b38c65f90904363abb4994',
        },
        {
          url: '/mstile-310x150.png',
          revision: 'f8064114d6d6b8b47492cdf74d83c47f',
        },
        {
          url: '/mstile-310x310.png',
          revision: 'cd4ade9fda6af6f0193d044127ff159d',
        },
        {
          url: '/mstile-70x70.png',
          revision: '330d4b654cb6a8599badb81dccbda358',
        },
        { url: '/robots.txt', revision: '5e7cae9db7bf84d12429e5067e7098f0' },
        {
          url: '/safari-pinned-tab.svg',
          revision: 'f6193529c7cdeb951a6feabbf2e6c94c',
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
              state: c,
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
