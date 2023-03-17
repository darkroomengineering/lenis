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
  self.define = (a, c) => {
    const i =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href
    if (s[i]) return
    let t = {}
    const r = (e) => n(e, i),
      o = { module: { uri: i }, exports: t, require: r }
    s[i] = Promise.all(a.map((e) => o[e] || r(e))).then((e) => (c(...e), t))
  }
}
define(['./workbox-588899ac'], function (e) {
  'use strict'
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '/_next/static/bbZnV2vLYgXz4qUHrNpX_/_buildManifest.js',
          revision: '98b86494f6aa06abc33835ab5f6cba36',
        },
        {
          url: '/_next/static/bbZnV2vLYgXz4qUHrNpX_/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/139-1de889f521a7e339.js',
          revision: '1de889f521a7e339',
        },
        {
          url: '/_next/static/chunks/171.6dbe1a035c29ab99.js',
          revision: '6dbe1a035c29ab99',
        },
        {
          url: '/_next/static/chunks/271.22a30b150c0fa990.js',
          revision: '22a30b150c0fa990',
        },
        {
          url: '/_next/static/chunks/337.660dec252f492b0d.js',
          revision: '660dec252f492b0d',
        },
        {
          url: '/_next/static/chunks/354-ae77c6170069f1e6.js',
          revision: 'ae77c6170069f1e6',
        },
        {
          url: '/_next/static/chunks/361.e1cade26796d278f.js',
          revision: 'e1cade26796d278f',
        },
        {
          url: '/_next/static/chunks/377.b09769ed3966182b.js',
          revision: 'b09769ed3966182b',
        },
        {
          url: '/_next/static/chunks/644.7b419d582a677c72.js',
          revision: '7b419d582a677c72',
        },
        {
          url: '/_next/static/chunks/686.ecff8c6e33bc2309.js',
          revision: 'ecff8c6e33bc2309',
        },
        {
          url: '/_next/static/chunks/696.d2eb68bea0be4954.js',
          revision: 'd2eb68bea0be4954',
        },
        {
          url: '/_next/static/chunks/739.381332c621987ef6.js',
          revision: '381332c621987ef6',
        },
        {
          url: '/_next/static/chunks/764.60dfa2b37234c8fd.js',
          revision: '60dfa2b37234c8fd',
        },
        {
          url: '/_next/static/chunks/780.6651ba13717aaedf.js',
          revision: '6651ba13717aaedf',
        },
        {
          url: '/_next/static/chunks/810.361fdc4215c2ba90.js',
          revision: '361fdc4215c2ba90',
        },
        {
          url: '/_next/static/chunks/89.0ab9e157d2ed09f4.js',
          revision: '0ab9e157d2ed09f4',
        },
        {
          url: '/_next/static/chunks/91.640f6512083393d6.js',
          revision: '640f6512083393d6',
        },
        {
          url: '/_next/static/chunks/949-e7899854a2b27d5b.js',
          revision: 'e7899854a2b27d5b',
        },
        {
          url: '/_next/static/chunks/fb7d5399.79cfd94b6314e301.js',
          revision: '79cfd94b6314e301',
        },
        {
          url: '/_next/static/chunks/framework-3583eef75b58b7b2.js',
          revision: '3583eef75b58b7b2',
        },
        {
          url: '/_next/static/chunks/main-49b9cef85e85f34d.js',
          revision: '49b9cef85e85f34d',
        },
        {
          url: '/_next/static/chunks/pages/_app-d140a0eb907f031c.js',
          revision: 'd140a0eb907f031c',
        },
        {
          url: '/_next/static/chunks/pages/_error-a4ba2246ff8fb532.js',
          revision: 'a4ba2246ff8fb532',
        },
        {
          url: '/_next/static/chunks/pages/home-8250f02adb3ec8dc.js',
          revision: '8250f02adb3ec8dc',
        },
        {
          url: '/_next/static/chunks/pages/index-d48ce53390e63bc6.js',
          revision: 'd48ce53390e63bc6',
        },
        {
          url: '/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js',
          revision: '837c0df77fd5009c9e46d446188ecfd0',
        },
        {
          url: '/_next/static/chunks/webpack-9c6542e85de4f5a0.js',
          revision: '9c6542e85de4f5a0',
        },
        {
          url: '/_next/static/css/139aac406896f941.css',
          revision: '139aac406896f941',
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
          url: '/_next/static/css/65e738caaa674704.css',
          revision: '65e738caaa674704',
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
