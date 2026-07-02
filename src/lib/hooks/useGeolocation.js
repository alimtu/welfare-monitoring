'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'user_location';
const PERMISSION_KEY = 'location_permission';

function saveLocation(lat, lng) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng, updatedAt: Date.now() }));
}

export function getSavedLocation() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function getLocationPermission() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PERMISSION_KEY);
}

export function useGeolocation() {
  const [status, setStatus] = useState('idle');
  const [location, setLocation] = useState(null);
  const [checking, setChecking] = useState(true);

  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('unsupported');
      return Promise.resolve('unsupported');
    }

    setStatus('loading');
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          saveLocation(loc.lat, loc.lng);
          localStorage.setItem(PERMISSION_KEY, 'granted');
          setLocation(loc);
          setStatus('granted');
          resolve('granted');
        },
        () => {
          localStorage.setItem(PERMISSION_KEY, 'denied');
          setStatus('denied');
          resolve('denied');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  useEffect(() => {
    const saved = getSavedLocation();
    if (saved) setLocation(saved);

    const perm = localStorage.getItem(PERMISSION_KEY);
    if (perm === 'granted') {
      fetchLocation().finally(() => setChecking(false));
    } else if (perm === 'denied') {
      setStatus('denied');
      setChecking(false);
    } else if (perm === 'deferred') {
      setStatus('deferred');
      setChecking(false);
    } else {
      setChecking(false);
    }
  }, [fetchLocation]);

  return { status, location, checking, requestPermission: fetchLocation };
}
