const CACHE_NAME = 'jewelry-v1';
const ASSETS = [
  './',
  './index.html',
  './admin.html',
  './supabase.js',
  './manifest.json'
];

// تثبيت
self.addEventListener('install', (e) => {
  console.log('[SW] تثبيت');
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(ASSETS).catch(err => console.warn("Cache error:", err)))
      .then(() => self.skipWaiting())
  );
});

// تنشيط
self.addEventListener('activate', (e) => {
  console.log('[SW] تنشيط');
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// اعتراض الطلبات
self.addEventListener('fetch', (e) => {
  // لا تخزن طلبات Supabase - دائماً من الشبكة
  if (e.request.url.includes('supabase.co')) {
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      
      return fetch(e.request).then(response => {
        // خزّن نسخة فقط للأصول المحلية
        if (response && response.status === 200 && e.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, responseClone).catch(()=>{});
          });
        }
        return response;
      }).catch(() => {
        // إذا فشل الاتصال، جرّب الـ index
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
