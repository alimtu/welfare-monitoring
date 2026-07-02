import { ImageOff } from 'lucide-react';

export default function PostsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <ImageOff className="w-16 h-16 text-muted-foreground/40 mb-4" />
      <h2 className="text-lg font-medium text-foreground mb-1">پستی یافت نشد</h2>
      <p className="text-sm text-muted-foreground">در حال حاضر پستی برای نمایش وجود ندارد.</p>
    </div>
  );
}
