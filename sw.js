const CACHE='smart-dashboard-v4';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{
 e.waitUntil(
  caches.keys().then(keys=>Promise.all(
   keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
  )).then(()=>clients.claim())
 );
});
self.addEventListener('fetch',e=>{
 e.respondWith(caches.open(CACHE).then(async c=>{
  const r=await c.match(e.request);
  if(r) return r;
  try{
   const n=await fetch(e.request);
   c.put(e.request,n.clone());
   return n;
  }catch(err){ return r || Response.error(); }
 }));
});
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting();});
