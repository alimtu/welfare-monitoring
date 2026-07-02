import queryClient from './queryClient';

let isLoggingOut = false;

export default function logout() {
  if (typeof window === 'undefined' || isLoggingOut) return;
  isLoggingOut = true;

  queryClient.cancelQueries();
  queryClient.clear();

  localStorage.clear();
  sessionStorage.clear();

  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }

  if (navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((r) => r.unregister());
    });
  }

  window.location.href = '/login';
}
