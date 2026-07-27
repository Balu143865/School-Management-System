export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('[ServiceWorker] Registered with scope:', registration.scope);
        },
        (error) => {
          console.info('[ServiceWorker] Registration deferred/failed:', error);
        }
      );
    });
  }
}
