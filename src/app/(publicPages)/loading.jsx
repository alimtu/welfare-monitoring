export default function Loading() {
  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-grey-100" dir="rtl">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-1.5">
          <span className="size-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="size-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="size-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-xs text-grey-500 font-medium">در حال بارگذاری...</p>
      </div>
    </div>
  );
}
