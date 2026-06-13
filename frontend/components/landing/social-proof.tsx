'use client';

import Image from 'next/image';
import { Star, Quote, Users, TrendingUp, Award, Shield } from 'lucide-react';
import { SectionHeading } from '@/components/landing/section-heading';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { landingImages } from '@/lib/landing-images';

const testimonials = [
  {
    name: 'مریم احمدی',
    role: 'مدیر مدرسه فرزانگان',
    content:
      'قبل از سپاد هر روز ساعت‌ها برای گزارش‌گیری وقت می‌گذاشتم. الان همه‌چیز در چند دقیقه انجام می‌شود.',
    avatar: landingImages.avatars.maryam,
  },
  {
    name: 'رضا محمدی',
    role: 'مدیر آموزشگاه پارس',
    content:
      'شفافیت مالی و ارتباط با اولیا خیلی بهتر شده. والدین از دسترسی آنلاین به نمرات راضی‌اند.',
    avatar: landingImages.avatars.reza,
  },
  {
    name: 'سارا قاسمی',
    role: 'معاون دبیرستان آینده',
    content:
      'خطای انسانی در ثبت نمرات تقریباً صفر شده و معلمان حضور و غیاب را خیلی سریع‌تر ثبت می‌کنند.',
    avatar: landingImages.avatars.sara,
  },
];

const stats = [
  { icon: Users, value: '۵۰+', label: 'مدرسه فعال' },
  { icon: TrendingUp, value: '۱۰K+', label: 'دانش‌آموز' },
  { icon: Award, value: '۹۸٪', label: 'رضایت' },
  { icon: Star, value: '۴.۹', label: 'امتیاز کاربران' },
];

export function SocialProof() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <SectionHeading
            badge="اعتماد"
            title="مدارس ایرانی به سپاد اعتماد کرده‌اند"
            description="نظرات مدیران و معلمان که هر روز از سامانه استفاده می‌کنند"
          />
        </ScrollReveal>

        <div className="mb-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 100}>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center transition-shadow hover:shadow-lg">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600">
                  <s.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="mt-1 text-sm text-slate-500">{s.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 120}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-32 overflow-hidden">
                  <Image
                    src={landingImages.campus.group}
                    alt=""
                    fill
                    className="object-cover opacity-40 transition-opacity group-hover:opacity-50"
                    sizes="400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
                </div>
                <div className="relative -mt-10 px-6 pb-6">
                  <div className="mb-4 flex h-14 w-14 overflow-hidden rounded-full border-4 border-white shadow-md">
                    <Image src={t.avatar} alt={t.name} width={56} height={56} className="object-cover" />
                  </div>
                  <Quote className="mb-2 h-6 w-6 text-blue-100" />
                  <div className="mb-3 flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mb-5 text-sm leading-relaxed text-slate-600">{t.content}</p>
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={200}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 rounded-2xl border border-slate-200/80 bg-slate-50 px-8 py-6">
            {[
              { icon: Shield, label: 'رمزنگاری SSL' },
              { icon: Shield, label: 'سرورهای ایران' },
              { icon: Shield, label: 'پشتیبانی فارسی' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-slate-600">
                <item.icon className="h-4 w-4 text-emerald-600" />
                {item.label}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
