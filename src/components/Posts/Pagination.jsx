import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ meta, currentPage, onPageChange }) {
  const totalPages = meta.totalPages || 1;

  const getVisiblePages = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // Fixed-height container so layout doesn't shift when pagination appears/disappears
  return (
    <div className="min-h-24 flex items-center justify-center" dir="rtl">
      {totalPages <= 1 ? (
        <div className="h-9" />
      ) : (
        <nav className="flex items-center gap-1.5" aria-label="صفحه‌بندی">
          {/* Previous (صفحه قبل) — in RTL shows on the right */}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="صفحه قبل"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {getVisiblePages()[0] > 1 && (
            <>
              <Button
                variant={currentPage === 1 ? 'default' : 'outline'}
                size="sm"
                className="h-9 w-9 min-w-9 p-0 shrink-0"
                onClick={() => onPageChange(1)}
              >
                1
              </Button>
              {getVisiblePages()[0] > 2 && (
                <span className="px-1 text-muted-foreground shrink-0">…</span>
              )}
            </>
          )}

          {getVisiblePages().map(page => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              className="h-9 w-9 min-w-9 p-0 shrink-0"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}

          {getVisiblePages().at(-1) < totalPages && (
            <>
              {getVisiblePages().at(-1) < totalPages - 1 && (
                <span className="px-1 text-muted-foreground shrink-0">…</span>
              )}
              <Button
                variant={currentPage === totalPages ? 'default' : 'outline'}
                size="sm"
                className="h-9 w-9 min-w-9 p-0 shrink-0"
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}

          {/* Next (صفحه بعد) — in RTL shows on the left */}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="صفحه بعد"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </nav>
      )}
    </div>
  );
}
