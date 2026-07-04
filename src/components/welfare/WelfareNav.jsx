'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboardIcon, ListChecksIcon, ClipboardListIcon, BarChart3Icon, CalendarRangeIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/dashboard', label: 'داشبورد', icon: LayoutDashboardIcon },
  { href: '/indicators', label: 'شاخص‌ها', icon: ListChecksIcon },
  { href: '/submissions', label: 'ثبت‌ها', icon: ClipboardListIcon },
  { href: '/reports', label: 'گزارش‌ها', icon: BarChart3Icon },
  { href: '/periods', label: 'دوره‌ها', icon: CalendarRangeIcon },
];

/** Fixed bottom tab navigation for the welfare app (mobile-first). */
export function WelfareNav() {
  const pathname = usePathname();

  // Focused entry screens (direct/checklist submission) hide the tab bar so the
  // sticky submit action bar can sit cleanly at the bottom.
  if (pathname.startsWith('/submit/')) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex justify-center print:hidden">
      <div className="flex w-full max-w-[480px] items-stretch justify-around border-t border-grey-100 bg-white/95 backdrop-blur-sm safe-bottom">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
                active ? 'text-primary-600' : 'text-grey-400 hover:text-grey-600',
              )}
            >
              <Icon className={cn('size-5', active && 'stroke-[2.4]')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
