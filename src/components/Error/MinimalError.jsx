import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '../ui/button';

export default function MinimalError({ onRetry, message, statusCode }) {
  const isNetwork = statusCode >= 500 || statusCode === undefined;

  return (
    <div className="py-16 px-4 size-full flex justify-center items-center">
      <div className="text-center max-w-sm space-y-5">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center ring-1 ring-red-100">
          {isNetwork ? (
            <WifiOff className="h-9 w-9 text-red-500" />
          ) : (
            <AlertTriangle className="h-9 w-9 text-red-500" />
          )}
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">خطا در دریافت اطلاعات</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {message || 'مشکلی در برقراری ارتباط با سرور پیش آمده. لطفاً دوباره تلاش کنید.'}
          </p>
        </div>

        {/* Retry */}
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            تلاش مجدد
          </Button>
        )}
      </div>
    </div>
  );
}
