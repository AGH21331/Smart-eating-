const CACHE='smartmeal-final-20260812';
const STATIC=['./manifest.json','./site.webmanifest','./smartmeal-icon-192.png','./smartmeal-icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);if(u.origin!==self.location.origin)return;
  // Always fetch HTML and JS from the network so a new deployment is immediately visible.
  if(e.request.mode==='navigate' || u.pathname.endsWith('.html') || u.pathname.endsWith('.js') || u.pathname.startsWith('/api/')){
    e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put(e.request,r.clone()));return r}).catch(()=>cached)));
});
