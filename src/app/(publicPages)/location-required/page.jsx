'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPinIcon, MapPinOffIcon, ShieldAlertIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGeolocation } from '@/lib/hooks/useGeolocation';

const MAX_RETRIES = 3;
const RETRY_COUNT_KEY = 'location_retry_count';

export default function LocationRequiredPage() {
  const router = useRouter();
  const { status, requestPermission } = useGeolocation();
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const count = parseInt(localStorage.getItem(RETRY_COUNT_KEY) || '0', 10);
      setRetryCount(count);
    }
  }, []);

  useEffect(() => {
    if (status === 'granted') {
      localStorage.removeItem(RETRY_COUNT_KEY);
      router.replace('/');
    }
  }, [status, router]);

  const handleRetry = async () => {
    setLoading(true);
    const result = await requestPermission();
    setLoading(false);
    if (result === 'denied') {
      const next = retryCount + 1;
      localStorage.setItem(RETRY_COUNT_KEY, String(next));
      setRetryCount(next);
    }
  };

  const handleDefer = () => {
    localStorage.setItem('location_permission', 'deferred');
    localStorage.removeItem(RETRY_COUNT_KEY);
    window.location.href = '/';
  };

  const showDeferButton = retryCount >= MAX_RETRIES;

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh p-6 text-center">
      <div className="size-20 rounded-full bg-danger-50 flex items-center justify-center mb-5">
        <MapPinOffIcon className="size-9 text-danger-400" />
      </div>
      <h1 className="text-base font-bold text-grey-800 mb-2">دسترسی به موقعیت مکانی</h1>
      <p className="text-sm text-grey-500 leading-relaxed max-w-xs mb-4">
        برای استفاده از اپلیکیشن، باید دسترسی به موقعیت مکانی خود را فعال کنید.
      </p>
      <div className="bg-primary-50 rounded-xl p-4 mb-6 max-w-xs text-right">
        <div className="flex items-start gap-2">
          <MapPinIcon className="size-4 text-primary-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-grey-700 mb-1">چرا به موقعیت مکانی نیاز داریم؟</p>
            <p className="text-[11px] text-grey-600 leading-relaxed">
              موقعیت مکانی شما هنگام ثبت فرم‌ها ذخیره می‌شود تا امکان پیگیری و اعتبارسنجی پاسخ‌ها فراهم شود.
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-start gap-2 bg-warning-50 rounded-xl p-3 mb-6 max-w-xs">
        <ShieldAlertIcon className="size-4 text-warning-500 shrink-0 mt-0.5" />
        <p className="text-xs text-grey-600 text-right leading-relaxed">
          در صورت مسدود بودن دسترسی، از تنظیمات مرورگر خود آن را برای این سایت فعال کنید.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button onClick={handleRetry} className="w-full h-11" disabled={loading}>
          {loading ? 'در حال دریافت موقعیت...' : 'اجازه می‌دهم'}
        </Button>
        {showDeferButton && (
          <Button variant="outline" onClick={handleDefer} className="w-full h-11 text-grey-600">
            بعدا دسترسی می‌دهم
          </Button>
        )}
      </div>
    </div>
  );
}
