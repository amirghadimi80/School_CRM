'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, Settings, Rocket, HeadphonesIcon, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { SectionHeading } from '@/components/landing/section-heading';

const steps = [
  {
    icon: UserPlus,
    step: '۰۱',
    title: 'ثبت‌نام',
    description: 'ایجاد حساب و وارد کردن اطلاعات پایه مدرسه',
  },
  {
    icon: Settings,
    step: '۰۲',
    title: 'پیکربندی',
    description: 'تنظیم کلاس‌ها، معلمان و دانش‌آموزان',
  },
  {
    icon: Rocket,
    step: '۰۳',
    title: 'راه‌اندازی',
    description: 'شروع استفاده از تمام امکانات سامانه',
  },
  {
    icon: HeadphonesIcon,
    step: '۰۴',
    title: 'پشتیبانی',
    description: 'همراهی تیم فنی در تمام مراحل',
  },
];

export function HowItWorks() {
  return (
    <section id="demo" className="bg-slate-50 py-24">
      <div className="container mx-auto px-4">
        <SectionHeading
          badge="شروع کار"
          title="در ۴ مرحله ساده آماده‌اید"
          description="راه‌اندازی سپاد سریع و بدون نیاز به دانش فنی است"
        />

        <div className="relative mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="absolute right-0 top-12 hidden h-0.5 w-full bg-gradient-to-l from-blue-200 to-emerald-200 lg:block" />
          {steps.map((s) => (
            <div key={s.step} className="relative rounded-2xl border border-slate-200/80 bg-white p-6">
              <span className="absolute -top-3 right-4 rounded-full bg-gradient-to-l from-blue-600 to-emerald-600 px-3 py-0.5 text-xs font-bold text-white">
                {s.step}
              </span>
              <div className="mb-4 mt-2 inline-flex rounded-xl bg-blue-50 p-3">
                <s.icon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="mb-1 font-bold text-slate-900">{s.title}</h3>
              <p className="text-sm text-slate-600">{s.description}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 p-8 lg:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="space-y-6 text-white">
              <h3 className="text-2xl font-bold lg:text-3xl">۷ روز استفاده رایگان</h3>
              <p className="leading-relaxed text-blue-100">
                بدون نیاز به کارت بانکی، تمام امکانات را امتحان کنید و ببینید سپاد چطور مدیریت
                مدرسه‌تان را ساده می‌کند.
              </p>
              <ul className="space-y-3">
                {['دسترسی کامل به امکانات', 'پشتیبانی راه‌اندازی', 'لغو هر زمان'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-blue-50">
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-300" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                className="bg-white text-blue-700 shadow-lg hover:bg-blue-50"
                asChild
              >
                <Link href="/auth/register">
                  شروع دوره آزمایشی
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <div className="space-y-4">
                {[
                  { label: 'زمان راه‌اندازی', val: 'کمتر از ۱ ساعت' },
                  { label: 'نیاز به نصب', val: 'خیر — تحت وب' },
                  { label: 'آموزش اولیه', val: 'رایگان' },
                  { label: 'پشتیبانی', val: '۲۴ ساعته' },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-sm text-blue-100">{row.label}</span>
                    <span className="font-semibold text-white">{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
