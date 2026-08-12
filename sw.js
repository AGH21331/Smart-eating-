const VERSION='smartmeal-ultimate-2026-08-12-v5';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.origin!==location.origin)return;if(e.request.method!=='GET')return;if(u.pathname==='/'||u.pathname==='/index.html'||u.pathname.endsWith('.js')||u.pathname.endsWith('.html')){e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));}});
