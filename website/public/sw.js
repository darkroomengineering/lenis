if (!self.define) {
  let e,
    s = {}
  const c = (c, a) => (
    (c = new URL(c + '.js', a).href),
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
  self.define = (a, n) => {
    const i =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href
    if (s[i]) return
    let t = {}
    const r = (e) => c(e, i),
      o = { module: { uri: i }, exports: t, require: r }
    s[i] = Promise.all(a.map((e) => o[e] || r(e))).then((e) => (n(...e), t))
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
          url: '/_next/static/chunks/120.e443e8a75361b1c3.js',
          revision: 'e443e8a75361b1c3',
        },
        {
          url: '/_next/static/chunks/143.02215fc6669a8793.js',
          revision: '02215fc6669a8793',
        },
        {
          url: '/_next/static/chunks/214.ac28411fe28c90dc.js',
          revision: 'ac28411fe28c90dc',
        },
        {
          url: '/_next/static/chunks/217.5d82b1ec8a7fa19c.js',
          revision: '5d82b1ec8a7fa19c',
        },
        {
          url: '/_next/static/chunks/237.64b56cf5256a7176.js',
          revision: '64b56cf5256a7176',
        },
        {
          url: '/_next/static/chunks/301-d433ad15f7db4fdc.js',
          revision: 'd433ad15f7db4fdc',
        },
        {
          url: '/_next/static/chunks/3045677e.3b30120cbe61dead.js',
          revision: '3b30120cbe61dead',
        },
        {
          url: '/_next/static/chunks/494.d927caf1067ff270.js',
          revision: 'd927caf1067ff270',
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
          url: '/_next/static/chunks/638.568c7f4894ac0258.js',
          revision: '568c7f4894ac0258',
        },
        {
          url: '/_next/static/chunks/658.daecc733f19dbbd9.js',
          revision: 'daecc733f19dbbd9',
        },
        {
          url: '/_next/static/chunks/734.9c3278f856958440.js',
          revision: '9c3278f856958440',
        },
        {
          url: '/_next/static/chunks/895-a991c0a6be36b5fb.js',
          revision: 'a991c0a6be36b5fb',
        },
        {
          url: '/_next/static/chunks/914-049c8238c1dad8e4.js',
          revision: '049c8238c1dad8e4',
        },
        {
          url: '/_next/static/chunks/917.fdebe17f091e1ff6.js',
          revision: 'fdebe17f091e1ff6',
        },
        {
          url: '/_next/static/chunks/930.742cd96a0733e608.js',
          revision: '742cd96a0733e608',
        },
        {
          url: '/_next/static/chunks/96.723a5c75dc9ed422.js',
          revision: '723a5c75dc9ed422',
        },
        {
          url: '/_next/static/chunks/framework-ac88a2a245aea9ab.js',
          revision: 'ac88a2a245aea9ab',
        },
        {
          url: '/_next/static/chunks/main-60b34c70089d4498.js',
          revision: '60b34c70089d4498',
        },
        {
          url: '/_next/static/chunks/pages/_app-d5ffeafb4486c57f.js',
          revision: 'd5ffeafb4486c57f',
        },
        {
          url: '/_next/static/chunks/pages/_error-90b0ad398b4b2c95.js',
          revision: '90b0ad398b4b2c95',
        },
        {
          url: '/_next/static/chunks/pages/home-ddf23f8a685c337a.js',
          revision: 'ddf23f8a685c337a',
        },
        {
          url: '/_next/static/chunks/pages/index-68cb2ae66ab38534.js',
          revision: '68cb2ae66ab38534',
        },
        {
          url: '/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js',
          revision: '837c0df77fd5009c9e46d446188ecfd0',
        },
        {
          url: '/_next/static/chunks/webpack-7a5ba06d03d6db8f.js',
          revision: '7a5ba06d03d6db8f',
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
          url: '/_next/static/y8YMFhyHoQM2IE7YvpwUB/_buildManifest.js',
          revision: 'c6f98c768f42549e2935e71db9b20a2b',
        },
        {
          url: '/_next/static/y8YMFhyHoQM2IE7YvpwUB/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
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
              event: c,
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
