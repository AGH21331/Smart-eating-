const CACHE='smartmeal-v18';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url); if(u.origin!==location.origin)return;
  if(u.pathname==='/'||u.pathname==='/index.html'||u.pathname==='/sw.js'||u.pathname.startsWith('/api/')){e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));return;}
  e.respondWith(caches.open(CACHE).then(async c=>{try{const r=await fetch(e.request);if(r.ok)c.put(e.request,r.clone());return r}catch{return c.match(e.request)}}));
});
