'use client';

import Link from 'next/link';
import {
  ShieldCheckIcon,
  HeartHandshakeIcon,
  LineChartIcon,
  UsersIcon,
  ArrowLeftIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';

const features = [
  {
    icon: HeartHandshakeIcon,
    title: 'پایش رفاه دانشجویی',
    description: 'رصد و پیگیری وضعیت رفاهی دانشجویان دانشگاه به صورت پیوسته.',
  },
  {
    icon: LineChartIcon,
    title: 'گزارش‌ها و آمار',
    description: 'تحلیل داده‌ها و ارائه گزارش‌های کاربردی برای تصمیم‌گیری بهتر.',
  },
  {
    icon: UsersIcon,
    title: 'ارتباط با جامعه دانشگاهی',
    description: 'بستری برای تعامل و دریافت بازخورد از دانشجویان و کارکنان.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'حفاظت از داده‌ها',
    description: 'نگهداری امن اطلاعات و رعایت حریم خصوصی کاربران.',
  },
];

export default function HomePage() {
  return (
    <div className="p-4 space-y-6">
      {/* Project intro / hero */}
      <div className="flex flex-col items-center text-center pt-6">
        <div className="size-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
          <ShieldCheckIcon className="size-8 text-primary-500" />
        </div>
        <h1 className="text-lg font-bold text-primary-700">
          University Welfare Monitoring
        </h1>
        <p className="text-sm font-medium text-grey-600 mt-1">
          سامانه پایش رفاه دانشگاهی
        </p>
        <p className="text-xs text-grey-500 leading-relaxed max-w-xs mt-3">
          سامانه‌ای برای رصد، پایش و بهبود وضعیت رفاهی جامعه دانشگاهی؛
          با هدف ارتقای کیفیت زندگی دانشجویان و کارکنان.
        </p>
        <Button asChild className="mt-5 h-11 px-6">
          <Link href="/dashboard">
            ورود به سامانه پایش
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
      </div>

      <Divider label="امکانات" />

      {/* Feature cards */}
      <div className="grid grid-cols-1 gap-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="flex items-start gap-3 rounded-xl border border-grey-100 bg-white p-4"
            >
              <div className="size-10 shrink-0 rounded-lg bg-primary-50 flex items-center justify-center">
                <Icon className="size-5 text-primary-500" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-grey-800">{feature.title}</h2>
                <p className="text-xs text-grey-500 leading-relaxed mt-1">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
