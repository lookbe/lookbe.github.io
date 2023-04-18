var cacheName = 'cocosPWA_V1';

var cacheFirstType = [
	'audio',
	'image',
	'font',
];
var networkFirstType = [
	'document',
	'script',
	'style',
	'manifest',
];
var cacheFirstExtension = [
	'mp3',
];
var networkFirstExtension = [
	'json',
	'cconb',
];

self.addEventListener('install', function (e) {
	console.log('[ServiceWorker] Install');
	e.waitUntil(caches.open(cacheName));
	self.skipWaiting();
});

self.addEventListener('activate', function (e) {
	console.log('[ServiceWorker] Activate');
	return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
	const url = new URL(event.request.url);
	const destination = event.request.destination;
	const extension = get_url_extension(event.request.url);

	if (url.origin.includes('localhost')) {
		networkOnly(event);
	}
	else 
	if (isSameOrigin(url)) {
		if (cacheFirstType.includes(destination) || (extension != null && cacheFirstExtension.includes(extension))) {
			cacheFirst(event);
		}
		else
		if (networkFirstType.includes(destination) || (extension != null && networkFirstExtension.includes(extension))) {
			networkFirst(event);
		}
		else {
			console.log(event.request.url);
			console.log(destination);
			networkOnly(event);
		}
	}
	else {
		networkOnly(event);
	}
})

function get_url_extension( url ) {
    return url.split(/[#?]/)[0].split('.').pop().trim();
}

function isSameOrigin(url) {
	return url.origin === self.location.origin;
}

function cacheFirst(event) {
	event.respondWith(
		caches.open(cacheName).then(function(cache) {
				return cache.match(event.request).then( function(cacheResponse) {
						if(cacheResponse)
							return cacheResponse
						else
							return fetch(event.request).then(function(networkResponse) {
									cache.put(event.request, networkResponse.clone())
									return networkResponse
								})
					})
			})
	)
}

function networkFirst(event) {
    event.respondWith(caches.open(cacheName).then((cache) => {
		return fetch(event.request.url).then((fetchedResponse) => {
		  cache.put(event.request, fetchedResponse.clone());
  
		  return fetchedResponse;
		}).catch(() => {
		  return cache.match(event.request.url);
		});
	  }));
}

function networkOnly(event) {
	event.respondWith(fetch(event.request))
}