if (!self.define) {
  let e,
    s = {}
  const a = (a, n) => (
    (a = new URL(a + '.js', n).href),
    s[a] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script')
          ;(e.src = a), (e.onload = s), document.head.appendChild(e)
        } else (e = a), importScripts(a), s()
      }).then(() => {
        let e = s[a]
        if (!e) throw new Error(`Module ${a} didn’t register its module`)
        return e
      })
  )
  self.define = (n, c) => {
    const i =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href
    if (s[i]) return
    let t = {}
    const r = (e) => a(e, i),
      d = { module: { uri: i }, exports: t, require: r }
    s[i] = Promise.all(n.map((e) => d[e] || r(e))).then((e) => (c(...e), t))
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
          url: '/_next/static/chunks/157.40ab71b4a2eefb1d.js',
          revision: '40ab71b4a2eefb1d',
        },
        {
          url: '/_next/static/chunks/178.e4bda95d0a7077e9.js',
          revision: 'e4bda95d0a7077e9',
        },
        {
          url: '/_next/static/chunks/18.2419f6bef4c47926.js',
          revision: '2419f6bef4c47926',
        },
        {
          url: '/_next/static/chunks/209-ebe625028d3492fe.js',
          revision: 'ebe625028d3492fe',
        },
        {
          url: '/_next/static/chunks/247.4c9155f3abf96ebd.js',
          revision: '4c9155f3abf96ebd',
        },
        {
          url: '/_next/static/chunks/255.094acfd2b4d762c5.js',
          revision: '094acfd2b4d762c5',
        },
        {
          url: '/_next/static/chunks/3045677e.3b30120cbe61dead.js',
          revision: '3b30120cbe61dead',
        },
        {
          url: '/_next/static/chunks/42-ba178d3c9e95cf32.js',
          revision: 'ba178d3c9e95cf32',
        },
        {
          url: '/_next/static/chunks/439.7ebeb94d963cdbb0.js',
          revision: '7ebeb94d963cdbb0',
        },
        {
          url: '/_next/static/chunks/457.45cdb88d7f9a53af.js',
          revision: '45cdb88d7f9a53af',
        },
        {
          url: '/_next/static/chunks/601.386a7914ac43546f.js',
          revision: '386a7914ac43546f',
        },
        {
          url: '/_next/static/chunks/605.35dbf91641b3e065.js',
          revision: '35dbf91641b3e065',
        },
        {
          url: '/_next/static/chunks/616.0916eca3138dc097.js',
          revision: '0916eca3138dc097',
        },
        {
          url: '/_next/static/chunks/652.4f29b770dc59fdab.js',
          revision: '4f29b770dc59fdab',
        },
        {
          url: '/_next/static/chunks/738.9e96989472050d94.js',
          revision: '9e96989472050d94',
        },
        {
          url: '/_next/static/chunks/895.a991c0a6be36b5fb.js',
          revision: 'a991c0a6be36b5fb',
        },
        {
          url: '/_next/static/chunks/922.6fc9de9eef43ad82.js',
          revision: '6fc9de9eef43ad82',
        },
        {
          url: '/_next/static/chunks/985.15b24cf58bf32461.js',
          revision: '15b24cf58bf32461',
        },
        {
          url: '/_next/static/chunks/framework-ac88a2a245aea9ab.js',
          revision: 'ac88a2a245aea9ab',
        },
        {
          url: '/_next/static/chunks/main-9ae136a08245a04a.js',
          revision: '9ae136a08245a04a',
        },
        {
          url: '/_next/static/chunks/pages/_app-fba43587dd8b1040.js',
          revision: 'fba43587dd8b1040',
        },
        {
          url: '/_next/static/chunks/pages/_error-dab5318c07849fbb.js',
          revision: 'dab5318c07849fbb',
        },
        {
          url: '/_next/static/chunks/pages/home-4da11fee3458ce6c.js',
          revision: '4da11fee3458ce6c',
        },
        {
          url: '/_next/static/chunks/pages/index-2feca405587c38d5.js',
          revision: '2feca405587c38d5',
        },
        {
          url: '/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js',
          revision: '837c0df77fd5009c9e46d446188ecfd0',
        },
        {
          url: '/_next/static/chunks/webpack-c23807411edffe65.js',
          revision: 'c23807411edffe65',
        },
        {
          url: '/_next/static/ckkGTtX57ewX-v2zNWUSa/_buildManifest.js',
          revision: '347e9f2e2a65f78f2dc08b95cd54301b',
        },
        {
          url: '/_next/static/ckkGTtX57ewX-v2zNWUSa/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
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
        { url: '/sitemap-0.xml', revision: '43f7078a5b19c3d1b7cefeb99451ae3e' },
        { url: '/sitemap.xml', revision: 'e103591648354e570c9ca84427dfb4c1' },
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
              event: a,
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
