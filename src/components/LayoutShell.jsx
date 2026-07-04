'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { LogOutIcon } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import PWAProvider from './PWA/PWAProvider';
import { isAuthed, clearAuth } from '@/lib/auth/session';

// --- WEB SERVICES DISABLED (temporary) ---
// The backend is not in use, so nothing is fetched from a web service on
// startup. The version/logo data used to come from `useVersionData`.
// import useVersionData from '@/lib/hooks/useVersionData';
// --- GET LOCATION FROM USER DISABLED (temporary) ---
// import LocationPrompt from './LocationPrompt';
// import { useGeolocation } from '@/lib/hooks/useGeolocation';

export default function LayoutShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/login';
  const isLocationRequiredPage = pathname === '/location-required';

  // --- WEB SERVICE DISABLED: no version data is fetched on startup ---
  // const { data: versionData } = useVersionData();

  // --- MOCK AUTH GATING ---
  // Send authenticated users away from /login, and everyone else to /login until
  // they pass the OTP step. Auth is a localStorage flag (no web service).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const authed = isAuthed();
    if (authed && isLoginPage) {
      router.replace('/');
    } else if (!authed && !isLoginPage) {
      router.replace('/login');
    }
  }, [pathname, isLoginPage, router]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const handleLogout = () => {
    clearAuth();
    router.replace('/login');
  };

  return (
    <PWAProvider>
      <div className="min-h-screen bg-grey-100 flex justify-center overflow-x-hidden print:bg-white">
        <div className="w-full max-w-[480px] min-h-screen bg-white shadow-xl relative flex flex-col overflow-x-hidden print:shadow-none">
          {!isLoginPage && !isLocationRequiredPage && (
            <header className="fixed top-0 w-full md:max-w-[480px] md:w-[480px] z-40 flex h-14 items-center justify-between border-b border-grey-100 bg-white px-4 print:hidden">
              <div className="flex items-center gap-2 min-w-0">
                <img src="/icons/logo.png" alt="" className="size-8 shrink-0 rounded object-contain" />
                <span className="text-sm font-bold text-primary-600 truncate">پایش رفاه دانشگاهی</span>
              </div>
              <div className="flex items-center gap-2">
                {/* --- GALLERY BUTTON DISABLED (depended on the version web service) --- */}
                {/* {versionData?.images?.length > 0 && (
                  <button type="button" onClick={() => router.push('/gallery')} className="flex items-center text-grey-500 hover:text-grey-700 transition-colors">
                    <ImageIcon className="size-5" />
                  </button>
                )} */}
                {/* --- PROFILE BUTTON DISABLED (profile page is disabled) --- */}
                {/* <button type="button" onClick={() => router.push('/profile')} className="flex items-center text-grey-500 hover:text-grey-700 transition-colors">
                  <UserCircleIcon className="size-6" />
                </button> */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center text-grey-500 hover:text-grey-700 transition-colors"
                  aria-label="خروج از حساب"
                >
                  <LogOutIcon className="size-5" />
                </button>
              </div>
            </header>
          )}
          <Toaster position="top-center" />

          <main className="flex-1 pt-14 print:pt-0">{children}</main>
          {/* --- GET LOCATION FROM USER DISABLED (temporary) --- */}
          {/* {needsLocationPrompt && (
            <LocationPrompt status={status} onAllow={requestPermission} onClose={...} />
          )} */}
        </div>
      </div>
    </PWAProvider>
  );
}
