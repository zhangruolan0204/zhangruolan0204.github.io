/* 秋招工作台 Service Worker · 网络优先，断网兜底 */
var CACHE = 'qz2027-v38';
var ASSETS = [
  './',
  './index.html',
  './icons-preview.html',
  './styles.css',
  './data.js',
  './core.js',
  './pages.js',
  './resume-parser.js',
  './fit-analyzer.js',
  './vendor/xlsx.full.min.js?v=27',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(ASSETS).catch(function () { });
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* 网络优先：有网必拿最新文件并更新缓存；断网时才用缓存兜底 */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; // 飞书等跨域请求不拦截

  /* 页面导航（HTML）：强制绕过浏览器 HTTP 缓存，保证永远拿到站点最新版本 */
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request, { cache: 'reload' }).then(function (res) {
        if (res && res.status === 200) {
          var c2 = res.clone();
          caches.open(CACHE).then(function (c) { c.put('./index.html', c2); });
        }
        return res;
      }).catch(function () {
        return caches.match('./index.html');
      })
    );
    return;
  }

  e.respondWith(
    fetch(e.request).then(function (res) {
      if (res && res.status === 200) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(e.request).then(function (hit) {
        if (hit) return hit;
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});
