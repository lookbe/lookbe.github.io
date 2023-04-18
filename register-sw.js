if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.register('service-worker.js', {scope: location.pathname != '/' ? location.origin : location.pathname});
}
