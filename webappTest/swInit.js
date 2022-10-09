if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./serviceWorker.js").catch(err => {
        console.error("Service Worker failed to register");
        console.error(err.stack);
    });
  
    navigator.serviceWorker.ready.then(() => {
      const broadcast = new BroadcastChannel('version');
  
      broadcast.addEventListener('message', e => {
        if (!e.data) return;
  
        if (e.data.type === 'VERSION') {
            const node = document.getElementById('swVersion');
            if (!node) return;
            node.textContent = e.data.version;
        }
      });
  
      broadcast.postMessage({ type: 'GET_VERSION' });
    })
}