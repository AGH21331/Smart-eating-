const VERSION='smartmeal-6-20260812';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(VERSION))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return; if(new URL(e.request.url).origin===location.origin){e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)))}});
