if (!self.define) {
  let e,
    s = {}
  const c = (c, n) => (
    (c = new URL(c + '.js', n).href),
    s[c] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script')
          ;(e.src = c), (e.onload = s), document.head.appendChild(e)
        } else (e = c), importScripts(c), s()
      }).then(() => {
        let e = s[c]
        if (!e) throw new Error(`Module ${c} didn’t register its module`)
        return e
      })
  )
  self.define = (n, i) => {
    const a =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href
    if (s[a]) return
    let t = {}
    const r = (e) => c(e, a),
      f = { module: { uri: a }, exports: t, require: r }
    s[a] = Promise.all(n.map((e) => f[e] || r(e))).then((e) => (i(...e), t))
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
          url: '/_next/static/0nO_o5i1gAsXkzPZya-t1/_buildManifest.js',
          revision: '1e5b3ed3978d65f2020b69ab735d5791',
        },
        {
          url: '/_next/static/0nO_o5i1gAsXkzPZya-t1/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/148-880bf6b6308d5624.js',
          revision: '880bf6b6308d5624',
        },
        {
          url: '/_next/static/chunks/237.64b56cf5256a7176.js',
          revision: '64b56cf5256a7176',
        },
        {
          url: '/_next/static/chunks/289-0326ca481d6bf740.js',
          revision: '0326ca481d6bf740',
        },
        {
          url: '/_next/static/chunks/3045677e.2e1d139393b47856.js',
          revision: '2e1d139393b47856',
        },
        {
          url: '/_next/static/chunks/316.d53bd2b6009fcb8b.js',
          revision: 'd53bd2b6009fcb8b',
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
          url: '/_next/static/chunks/580.b7bfe392afd5ff4c.js',
          revision: 'b7bfe392afd5ff4c',
        },
        {
          url: '/_next/static/chunks/587.b3beab90500e3224.js',
          revision: 'b3beab90500e3224',
        },
        {
          url: '/_next/static/chunks/590.25f32ee5e41babf6.js',
          revision: '25f32ee5e41babf6',
        },
        {
          url: '/_next/static/chunks/653.58ff4c5d387a9eae.js',
          revision: '58ff4c5d387a9eae',
        },
        {
          url: '/_next/static/chunks/68.6cd8c07f782f8ca4.js',
          revision: '6cd8c07f782f8ca4',
        },
        {
          url: '/_next/static/chunks/735.7d54342103bcc136.js',
          revision: '7d54342103bcc136',
        },
        {
          url: '/_next/static/chunks/752.55bc95d85725762f.js',
          revision: '55bc95d85725762f',
        },
        {
          url: '/_next/static/chunks/79.a6c47c3778324316.js',
          revision: 'a6c47c3778324316',
        },
        {
          url: '/_next/static/chunks/790.01f893b9b16f746f.js',
          revision: '01f893b9b16f746f',
        },
        {
          url: '/_next/static/chunks/915-c0a67bdfbcfa90e3.js',
          revision: 'c0a67bdfbcfa90e3',
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
          url: '/_next/static/chunks/pages/_app-b83f43993c0c901c.js',
          revision: 'b83f43993c0c901c',
        },
        {
          url: '/_next/static/chunks/pages/_error-4750231d615c8077.js',
          revision: '4750231d615c8077',
        },
        {
          url: '/_next/static/chunks/pages/home-b9c127d9f6e303d0.js',
          revision: 'b9c127d9f6e303d0',
        },
        {
          url: '/_next/static/chunks/pages/index-8a927dfe6eaf28b7.js',
          revision: '8a927dfe6eaf28b7',
        },
        {
          url: '/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js',
          revision: '837c0df77fd5009c9e46d446188ecfd0',
        },
        {
          url: '/_next/static/chunks/webpack-fcd3d66e60cda0f1.js',
          revision: 'fcd3d66e60cda0f1',
        },
        {
          url: '/_next/static/css/1be338ee286b1e44.css',
          revision: '1be338ee286b1e44',
        },
        {
          url: '/_next/static/css/428ce2fb94c322f4.css',
          revision: '428ce2fb94c322f4',
        },
        {
          url: '/_next/static/css/49db7c7ec778dd3e.css',
          revision: '49db7c7ec778dd3e',
        },
        {
          url: '/_next/static/css/576078fb40719be3.css',
          revision: '576078fb40719be3',
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
          url: '/_next/static/css/d5eae639ffb82c4e.css',
          revision: 'd5eae639ffb82c4e',
        },
        {
          url: '/_next/static/css/df4862f22178cc0c.css',
          revision: 'df4862f22178cc0c',
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
              event: c,
              state: n,
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
