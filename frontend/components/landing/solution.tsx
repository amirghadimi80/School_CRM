import { Button } from '@/components/ui/button';
import { CheckCircle, Zap, Shield, TrendingUp, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { SectionHeading } from '@/components/landing/section-heading';

const benefits = [
  {
    icon: CheckCircle,
    title: 'یکپارچگی',
    description: 'حضور، نمره، برنامه و شهریه در یک سامانه هماهنگ می‌ماند.',
  },
  {
    icon: Zap,
    title: 'کار کمترِ تکراری',
    description: 'ثبت دستی و گزارش‌های پراکنده جای خود را به یک گردش کار مشخص می‌دهد.',
  },
  {
    icon: Shield,
    title: 'دسترسی کنترل‌شده',
    description: 'هر نقش فقط بخش مربوط به خودش را می‌بیند.',
  },
  {
    icon: TrendingUp,
    title: 'گزارش دم‌دست',
    description: 'آمار کلاس و وضعیت مالی را بدون جمع‌کردن فایل جدا می‌بینید.',
  },
];

const modules = [
  { title: 'حضور و غیاب', sub: 'ثبت لحظه‌ای', tone: 'bg-[#102033] text-white' },
  { title: 'نمرات و کارنامه', sub: 'ورود و مشاهده', tone: 'bg-[#14c4d4] text-[#082028]' },
  { title: 'برنامه هفتگی', sub: 'چیدمان کلاس و معلم', tone: 'bg-[#243eae] text-white' },
  { title: 'امور مالی', sub: 'شهریه و پرداخت', tone: 'bg-[#f5c451] text-[#082028]' },
];

export function Solution() {
  return (
    <section id="about" className="scroll-mt-24 bg-[#f4f1ea] py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[36px] bg-[#14c4d4]/15 blur-2xl" aria-hidden />
            <div className="rounded-[28px] border border-[#102033]/10 bg-white p-6 shadow-[0_24px_50px_-28px_rgba(16,32,51,0.4)] sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <Image src="/images/logo.png" alt="" width={44} height={44} className="h-11 w-11 object-contain" />
                <div>
                  <p className="font-extrabold text-[#102033]">داشبورد سپاد</p>
                  <p className="text-sm text-slate-500">چهار کار اصلی مدرسه، کنار هم</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {modules.map((module) => (
                  <div key={module.title} className={`rounded-2xl p-4 ${module.tone}`}>
                    <p className="font-bold">{module.title}</p>
                    <p className="mt-1 text-xs opacity-80">{module.sub}</p>
                  </div>
                ))}
              </div>
              <ul className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-[#102033]">
                {['تحت وب', 'تقویم شمسی', 'نقش جدا'].map((item) => (
                  <li key={item} className="rounded-xl bg-[#f4f1ea] px-2 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <SectionHeading
              badge="راه‌حل"
              title="یک سامانه برای کار مدرسه"
              description="سپاد مدیریت روزانه، کار آموزشی و امور مالی را در یک جا جمع می‌کند."
              align="right"
              className="mb-8"
            />

            <ul className="space-y-5">
              {benefits.map((benefit) => (
                <li key={benefit.title} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#102033] text-[#14c4d4]">
                    <benefit.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-bold text-[#102033]">{benefit.title}</span>
                    <span className="mt-0.5 block text-sm leading-7 text-slate-600">{benefit.description}</span>
                  </span>
                </li>
              ))}
            </ul>

            <Button size="lg" className="mt-8 h-12 bg-[#102033] px-7 text-white hover:bg-[#1a3348]" asChild>
              <Link href="/auth/register">
                همین حالا شروع کنید
                <ArrowLeft className="ms-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
