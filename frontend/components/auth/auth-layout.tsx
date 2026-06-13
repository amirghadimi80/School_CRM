'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { BarChart3, Shield, Sparkles, Users } from 'lucide-react';
import { PLATFORM_NAME } from '@/lib/brand';

const features = [
  {
    icon: Users,
    title: 'مدیریت جامع پرسنل و دانش‌آموزان',
    description:
      'ثبت‌نام آنلاین، پرونده تحصیلی، تخصیص کلاس و ارتباط یکپارچه بین مدیر، معلم، دانش‌آموز و اولیا.',
  },
  {
    icon: BarChart3,
    title: 'گزارش‌گیری هوشمند و کارنامه دیجیتال',
    description:
      'استخراج خودکار آمار، کارنامه آنلاین، نمودار پیشرفت تحصیلی و تحلیل عملکرد هر کلاس در چند ثانیه.',
  },
  {
    icon: Shield,
    title: 'امنیت بالا و پشتیبانی همیشه در دسترس',
    description:
      'نگهداری امن اطلاعات، سطوح دسترسی اختصاصی برای هر نقش و پشتیبانی فنی در تمام روزهای هفته.',
  },
];

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen" dir="rtl">
      {/* Brand panel — desktop */}
      <aside className="relative hidden w-[45%] overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-400/15 blur-2xl" />
        </div>

        <div className="relative z-10 p-10">
          <Link href="/" className="inline-flex items-center gap-3 transition-opacity hover:opacity-90">
            <img src="/images/logo.png" alt="سپاد" className="h-12 w-12 rounded-xl bg-white/10 p-1.5 object-contain" />
            <div>
              <p className="text-lg font-bold text-white">{PLATFORM_NAME}</p>
              <p className="text-sm text-blue-100">راه‌حل هوشمند مدیریت مدرسه</p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 space-y-8 px-10 pb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-blue-50 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span>سامانه مورد اعتماد مدارس</span>
            </div>
            <h2 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
              مدیریت مدرسه،
              <br />
              <span className="text-emerald-200">ساده‌تر از همیشه</span>
            </h2>
            <p className="max-w-md text-base leading-relaxed text-blue-100">
              حضور و غیاب، نمرات، برنامه درسی، پیام‌رسانی و امور مالی — همه در یک داشبورد واحد برای مدیر، معلم، دانش‌آموز و اولیا.
            </p>
          </div>

          <ul className="space-y-5">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-3 text-blue-50">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                  <Icon className="h-4 w-4 text-white" />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold leading-snug text-white">{title}</p>
                  <p className="text-xs leading-relaxed text-blue-100/90">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 border-t border-white/10 px-10 py-6">
          <p className="text-xs text-blue-200/80">© {new Date().getFullYear()} سپاد — تمامی حقوق محفوظ است</p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="relative flex flex-1 flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/60">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-20 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute -right-20 bottom-32 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl" />
        </div>

        {/* Mobile header */}
        <div className="relative z-10 flex items-center justify-between border-b border-slate-200/60 bg-white/70 px-6 py-4 backdrop-blur-md lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/logo.png" alt="سپاد" className="h-9 w-9 object-contain" />
            <span className="font-bold text-slate-800">سپاد</span>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            بازگشت به سایت
          </Link>
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-[420px]">
            <div className="mb-8 text-center lg:text-right">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">{subtitle}</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-sm sm:p-8">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
