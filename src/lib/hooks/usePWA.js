'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const IS_PROD = process.env.NODE_ENV === 'production';

export function useServiceWorker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const registrationRef = useRef(null);
  const reloadingRef = useRef(false);

  useEffect(() => {
    if (!IS_PROD) return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((reg) => {
        registrationRef.current = reg;

        if (reg.waiting && navigator.serviceWorker.controller) {
          setUpdateAvailable(true);
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      })
      .catch(() => {});

    const onControllerChange = () => {
      if (reloadingRef.current) return;
      reloadingRef.current = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  const applyUpdate = useCallback(() => {
    const reg = registrationRef.current;
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, []);

  return { updateAvailable, applyUpdate };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return isOnline;
}

export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const deferredPrompt = useRef(null);

  useEffect(() => {
    if (!IS_PROD) return;

    const handler = (e) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
      setCanInstall(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt.current) return false;

    deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    setCanInstall(false);

    return outcome === 'accepted';
  }, []);

  return { canInstall, install };
}

export function useIsStandalone() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      navigator.standalone === true;
    setIsStandalone(standalone);
  }, []);

  return isStandalone;
}
