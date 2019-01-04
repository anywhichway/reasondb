self.addEventListener("install", event => {
  const parts = self.location.search.substring(1).split("="),
  	params = {};
  for(let i=0;i<parts.length;i+=2) {
  	params[parts[i]]=parts[i+1];
  }
	event.waitUntil(Promise.all([caches.open(params.name),caches.open("website")]));
});

async function put(cachename,key,response) {
	if(response.ok) {
		const cache = await caches.open(cachename);
		cache.put(key,response);
	}
}

async function del(cachename,key) {
	const cache = await caches.open(cachename);
	cache.delete(key);
}


self.addEventListener('fetch', event => {
	const parts = event.request.url.split("/"),
		protocol = parts.shift(),
		empty = parts.shift(),
		host = parts.shift(),
		swdb = parts.shift(),
		cachename = parts.shift(),
		deletecache = parts.length===0;
	if(swdb!=="swdb") {
		event.respondWith(caches.open("website").then(async cache => {
			let response = await cache.match(event.request.url);
    	if(response) {
	    	//fetch(event.request).then(refreshed => {
	    	//	setTimeout(put,0,cachename,event.request.url,refreshed.clone());
	    	//});
	    	return response;
    	}
    	response = await fetch(event.request);
    	if(response.ok) cache.put(event.request.url,response.clone());
    	return response;
		}))
	} else if(event.request.method==="PUT") {
		//console.log("put");
		const promise = event.request.json().then(async json => {
			const data = JSON.stringify(json),
				 response = new Response(data,{headers:{"Content-Type":"application/json; ; charset=utf-8","Content-Length":data.length}});			setTimeout(put,0,cachename,event.request.url,response.clone());
			//await put(cachename,event.request.url,response.clone());
			return response;
		});
		event.respondWith(promise.then(response => response))
	} else if(event.request.method==="GET"){
		event.respondWith(
	    caches.open(cachename).then(async cache => {
	    	const response = await cache.match(event.request.url);
	    	if(response) return response;
	    	return new Response("null");
	    }).catch(e => {
  				return new Response("null");
  		})
		)
	} else if(event.request.method==="DELETE") {
		//console.log("delete");
		if(deletecache) {
			const promise = caches.delete(cachename).then(found => new Response(`${found}`));
			event.respondWith(promise.then(response => response));
		} else {
			event.respondWith(
				caches.open(cachename).then(async cache => {
					const deleted = await cache.match(event.request.url);
					if(deleted) {
						setTimeout(del,0,cachename,event.request.url);
						return new Response("true");
					}
					return new Response("false");
				}).catch(e => { 
					return new Response("false"); 
				})
			)
		}
	}
});