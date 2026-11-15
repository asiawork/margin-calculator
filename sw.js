// เก็บหน้าไว้ในเครื่อง เปิดได้แม้ไม่มีเน็ต
// แก้ไฟล์ไหนแล้ว ให้เปลี่ยนเลขเวอร์ชันนี้ด้วย
var CACHE = 'margin-calc-v1';
var FILES = [
  './',
  'index.html',
  'icon-180.png',
  'icon-512.png',
  'manifest.json',
  'fonts/sarabun-thai-400-normal.woff2',
  'fonts/sarabun-thai-600-normal.woff2',
  'fonts/sarabun-thai-700-normal.woff2',
  'fonts/sarabun-latin-400-normal.woff2',
  'fonts/sarabun-latin-600-normal.woff2',
  'fonts/sarabun-latin-700-normal.woff2'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;

  // หน้าเว็บ: ลองโหลดใหม่ก่อน ถ้าไม่มีเน็ตค่อยใช้ที่เก็บไว้
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put('index.html', copy); });
        return res;
      }).catch(function () {
        return caches.match('index.html');
      })
    );
    return;
  }

  // ฟอนต์ ไอคอน: ใช้ที่เก็บไว้ก่อน
  e.respondWith(
    caches.match(e.request).then(function (hit) { return hit || fetch(e.request); })
  );
});
