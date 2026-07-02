'use client';

// --- PROFILE PAGE DISABLED (temporary) ---
// The profile page depended on the backend via `useProfile` / `useUpdateProfile`
// web services (fetch + update the user's profile). The backend is not in use,
// so all of that code is disabled — no web service is called here. The previous
// implementation is available in git history.

export default function ProfilePage() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center p-8 text-center">
      <p className="text-sm font-semibold text-grey-700">حساب کاربری</p>
      <p className="mt-1 text-xs text-grey-400">این بخش در حال حاضر غیرفعال است.</p>
    </div>
  );
}
