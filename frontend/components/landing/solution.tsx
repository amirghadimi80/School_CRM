'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle, Zap, Shield, TrendingUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SectionHeading } from '@/components/landing/section-heading';

const benefits = [
  {
    icon: CheckCircle,
    title: 'یکپارچگی کامل',
    description: 'تمام فرآیندهای مدیریتی در یک پلتفرم هماهنگ',
  },
  {
    icon: Zap,
    title: 'صرفه‌جویی در زمان',
    description: 'کاهش چشمگیر کارهای دستی و تکراری',
  },
  {
    icon: Shield,
    title: 'دقت و امنیت',
    description: 'کاهش خطا با فرآیندهای خودکار و دسترسی کنترل‌شده',
  },
  {
    icon: TrendingUp,
    title: 'گزارش‌گیری هوشمند',
    description: 'دسترسی سریع به آمار و تحلیل عملکرد',
  },
];

const modules = [
  { title: 'حضور و غیاب', sub: 'آنلاین و لحظه‌ای', color: 'border-emerald-100 bg-emerald-50/50' },
  { title: 'نمرات و کارنامه', sub: 'دیجیتال', color: 'border-blue-100 bg-blue-50/50' },
  { title: 'برنامه هفتگی', sub: 'خودکار', color: 'border-violet-100 bg-violet-50/50' },
  { title: 'امور مالی', sub: 'شهریه و پرداخت', color: 'border-amber-100 bg-amber-50/50' },
];

export function Solution() {
  return (
    <section id="about" className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="relative">
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-blue-100/60 to-emerald-100/60 blur-xl" />
              <div className="relative rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl">
                <div className="mb-6 flex items-center gap-3">
                  <img src="/images/logo.png" alt="سپاد" className="h-10 w-10 object-contain" />
                  <div>
                    <p className="font-bold text-slate-900">داشبورد یکپارچه سپاد</p>
                    <p className="text-sm text-slate-500">همه‌چیز در یک نگاه</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {modules.map((m) => (
                    <div key={m.title} className={`rounded-xl border p-4 ${m.color}`}>
                      <p className="font-semibold text-slate-800">{m.title}</p>
                      <p className="text-xs text-slate-500">{m.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  {[
                    { val: '۱۰x', label: 'سرعت' },
                    { val: '۱۰۰٪', label: 'دقت' },
                    { val: '۲۴/۷', label: 'دسترسی' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-slate-50 py-3">
                      <p className="text-lg font-bold text-blue-600">{s.val}</p>
                      <p className="text-xs text-slate-500">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 space-y-8 lg:order-2">
            <SectionHeading
              badge="راه‌حل"
              title="یک پلتفرم برای کل مدرسه"
              description="سپاد تمام نیازهای مدیریتی، آموزشی و مالی مدرسه را در یک سامانه واحد پوشش می‌دهد"
              align="right"
              className="mb-0"
            />

            <div className="space-y-5">
              {benefits.map((b) => (
                <div key={b.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                    <b.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{b.title}</h3>
                    <p className="mt-0.5 text-sm text-slate-600">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="bg-gradient-to-l from-emerald-600 to-blue-600 shadow-md"
              asChild
            >
              <Link href="/auth/register">
                همین الان شروع کنید
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
