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
      o = { module: { uri: i }, exports: t, require: r }
    s[i] = Promise.all(n.map((e) => o[e] || r(e))).then((e) => (c(...e), t))
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
          url: '/_next/static/Y_HDW3k8P9E6Ua6eojUOa/_buildManifest.js',
          revision: '0530c1b8c9c11437067e10f3f16f9492',
        },
        {
          url: '/_next/static/Y_HDW3k8P9E6Ua6eojUOa/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/142dd345.1cfa895bc0a444be.js',
          revision: '1cfa895bc0a444be',
        },
        {
          url: '/_next/static/chunks/188.50734a51b56679a6.js',
          revision: '50734a51b56679a6',
        },
        {
          url: '/_next/static/chunks/340.3e3c6f06a4cf1dce.js',
          revision: '3e3c6f06a4cf1dce',
        },
        {
          url: '/_next/static/chunks/442.c970f24911174e14.js',
          revision: 'c970f24911174e14',
        },
        {
          url: '/_next/static/chunks/529.e789bfbc8d6f1a8f.js',
          revision: 'e789bfbc8d6f1a8f',
        },
        {
          url: '/_next/static/chunks/594-1bc4a1bc5b8f64d5.js',
          revision: '1bc4a1bc5b8f64d5',
        },
        {
          url: '/_next/static/chunks/614.eac2d85c3c1afacb.js',
          revision: 'eac2d85c3c1afacb',
        },
        {
          url: '/_next/static/chunks/65.dafba68c4f4775bc.js',
          revision: 'dafba68c4f4775bc',
        },
        {
          url: '/_next/static/chunks/842.a147c50b2d5933ae.js',
          revision: 'a147c50b2d5933ae',
        },
        {
          url: '/_next/static/chunks/906.3b8ad42637d95251.js',
          revision: '3b8ad42637d95251',
        },
        {
          url: '/_next/static/chunks/990-8a5f34ff4765e787.js',
          revision: '8a5f34ff4765e787',
        },
        {
          url: '/_next/static/chunks/framework-c87cbe29bcbbc912.js',
          revision: 'c87cbe29bcbbc912',
        },
        {
          url: '/_next/static/chunks/main-9ca5e642524055d7.js',
          revision: '9ca5e642524055d7',
        },
        {
          url: '/_next/static/chunks/pages/_app-4cf00157b3da94d0.js',
          revision: '4cf00157b3da94d0',
        },
        {
          url: '/_next/static/chunks/pages/_error-594beb530f8e95b5.js',
          revision: '594beb530f8e95b5',
        },
        {
          url: '/_next/static/chunks/pages/home-51baa79a4770a17f.js',
          revision: '51baa79a4770a17f',
        },
        {
          url: '/_next/static/chunks/pages/index-fffc9ee02db9314b.js',
          revision: 'fffc9ee02db9314b',
        },
        {
          url: '/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js',
          revision: '837c0df77fd5009c9e46d446188ecfd0',
        },
        {
          url: '/_next/static/chunks/webpack-5296448aced6a67d.js',
          revision: '5296448aced6a67d',
        },
        {
          url: '/_next/static/css/57d7fc4352487ffc.css',
          revision: '57d7fc4352487ffc',
        },
        {
          url: '/_next/static/css/719318096eace446.css',
          revision: '719318096eace446',
        },
        {
          url: '/_next/static/css/8a233b5df237aa85.css',
          revision: '8a233b5df237aa85',
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
