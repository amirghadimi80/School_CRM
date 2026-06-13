'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Sparkles,
  Shield,
  Clock,
  Users,
  BarChart3,
  CalendarCheck,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { landingImages } from '@/lib/landing-images';

const stats = [
  { value: '۵۰+', label: 'مدرسه فعال' },
  { value: '۱۰K+', label: 'دانش‌آموز' },
  { value: '۹۸٪', label: 'رضایت' },
  { value: '۲۴/۷', label: 'پشتیبانی' },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
          <ScrollReveal direction="right" className="space-y-8 text-right">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-4 py-1.5 text-sm font-medium text-blue-700">
              <Sparkles className="h-4 w-4" />
              سامانه یکپارچه مدیریت مدرسه
            </div>

            <div className="space-y-5">
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 lg:text-5xl xl:text-6xl">
                مدیریت مدرسه با{' '}
                <span className="bg-gradient-to-l from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  سپاد
                </span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-slate-600 lg:text-xl">
                حضور و غیاب، نمرات، برنامه درسی، پیام‌رسانی و امور مالی — همه در یک داشبورد واحد
                برای مدیر، معلم، دانش‌آموز و اولیا.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button
                size="lg"
                className="h-12 bg-gradient-to-l from-blue-600 to-blue-700 px-8 text-base font-semibold shadow-lg shadow-blue-200/50 transition-transform hover:scale-[1.02]"
                asChild
              >
                <Link href="/auth/register">
                  شروع رایگان — ۷ روز
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 border-slate-300 px-8 text-base font-semibold"
                asChild
              >
                <Link href="#roles">مشاهده پنل‌ها</Link>
              </Button>
            </div>

            {/* Social proof mini */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex -space-x-2 space-x-reverse">
                {[
                  landingImages.avatars.maryam,
                  landingImages.avatars.reza,
                  landingImages.avatars.sara,
                ].map((src, i) => (
                  <div
                    key={i}
                    className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white shadow-sm"
                  >
                    <Image src={src} alt="" fill className="object-cover" sizes="36px" />
                  </div>
                ))}
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-xs font-bold text-white shadow-sm">
                  +۵۰
                </div>
              </div>
              <div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-500">مورد اعتماد مدیران مدارس</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-blue-500" />
                امنیت داده‌ها
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-500" />
                راه‌اندازی سریع
              </span>
            </div>
          </ScrollReveal>

          {/* Visual collage */}
          <ScrollReveal direction="left" delay={200} className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="relative aspect-[4/5] max-h-[560px] w-full sm:aspect-square lg:aspect-[5/4]">
              {/* Main student photo */}
              <div className="absolute inset-4 overflow-hidden rounded-3xl shadow-2xl shadow-slate-300/50">
                <Image
                  src={landingImages.hero.students}
                  alt="دانش‌آموزان در کلاس"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 via-transparent to-transparent" />
              </div>

              {/* Teacher inset */}
              <div className="animate-float absolute -left-2 top-8 z-10 h-28 w-28 overflow-hidden rounded-2xl border-4 border-white shadow-xl sm:h-32 sm:w-32">
                <Image
                  src={landingImages.hero.teacher}
                  alt="معلم"
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>

              {/* Dashboard card */}
              <div className="animate-float-delayed absolute -bottom-2 -right-2 z-20 w-[85%] overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-sm sm:w-[75%]">
                <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-3 py-2">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="mr-auto text-[10px] text-slate-400">dashboard.sepaad.ir</span>
                </div>
                <div className="space-y-3 p-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: Users, val: '۳۲۴', label: 'دانش‌آموز', c: 'text-blue-600 bg-blue-50' },
                      { icon: CalendarCheck, val: '۹۶٪', label: 'حضور', c: 'text-emerald-600 bg-emerald-50' },
                      { icon: BarChart3, val: '۱۸.۴', label: 'میانگین', c: 'text-violet-600 bg-violet-50' },
                    ].map(({ icon: Icon, val, label, c }) => (
                      <div key={label} className="rounded-lg border border-slate-100 p-2 text-center">
                        <div className={`mx-auto mb-1 inline-flex rounded p-1 ${c}`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <p className="text-sm font-bold text-slate-800">{val}</p>
                        <p className="text-[9px] text-slate-400">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex h-10 items-end gap-1 rounded-lg bg-slate-50 p-2">
                    {[60, 75, 68, 90, 82, 70, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-blue-500 to-blue-400"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Classroom inset */}
              <div className="absolute -right-4 top-1/3 z-10 hidden h-24 w-32 overflow-hidden rounded-xl border-4 border-white shadow-lg sm:block">
                <Image
                  src={landingImages.hero.classroom}
                  alt="کلاس درس"
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>

              {/* Badge */}
              <div className="absolute left-6 top-1/2 z-10 rounded-xl border border-emerald-100 bg-white px-4 py-2.5 shadow-lg">
                <p className="text-[10px] text-slate-500">صرفه‌جویی زمانی</p>
                <p className="text-lg font-bold text-emerald-600">+۴۰ ساعت/ماه</p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={300}>
          <div className="mt-16 grid grid-cols-2 gap-6 border-t border-slate-200/60 pt-10 md:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-transparent p-4 text-center transition-colors hover:border-slate-200 hover:bg-slate-50 md:text-right"
              >
                <p className="text-2xl font-bold text-slate-900 lg:text-3xl">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
