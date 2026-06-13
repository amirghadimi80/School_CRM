'use client';

import Image from 'next/image';
import { FileX, Clock, Users, AlertTriangle } from 'lucide-react';
import { SectionHeading } from '@/components/landing/section-heading';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { landingImages } from '@/lib/landing-images';

const painPoints = [
  {
    icon: FileX,
    title: 'پراکندگی اطلاعات',
    description: 'داده‌های دانش‌آموزان، نمرات و مالی در فایل‌ها و سامانه‌های جدا — بدون یکپارچگی.',
    color: 'text-red-600 bg-red-50',
  },
  {
    icon: Clock,
    title: 'اتلاف وقت',
    description: 'ساعت‌ها کار دستی برای حضور و غیاب، کارنامه و گزارش‌گیری روزانه.',
    color: 'text-amber-600 bg-amber-50',
  },
  {
    icon: Users,
    title: 'خطای انسانی',
    description: 'اشتباه در ثبت نمرات و محاسبات به‌دلیل فرآیندهای غیرخودکار.',
    color: 'text-orange-600 bg-orange-50',
  },
  {
    icon: AlertTriangle,
    title: 'دسترسی محدود',
    description: 'عدم دسترسی لحظه‌ای والدین و معلمان به اطلاعات مورد نیاز.',
    color: 'text-violet-600 bg-violet-50',
  },
];

export function PainPoints() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <SectionHeading
            badge="چالش‌ها"
            title="مدیریت مدرسه بدون سامانه یکپارچه"
            description="بسیاری از مدارس هنوز با روش‌های سنتی درگیر این مشکلات هستند"
          />
        </ScrollReveal>

        <div className="grid items-center gap-10 lg:grid-cols-5">
          <ScrollReveal direction="right" className="relative hidden lg:col-span-2 lg:block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl">
              <Image
                src={landingImages.campus.studying}
                alt="دانش‌آموز در حال مطالعه"
                fill
                className="object-cover"
                sizes="400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent" />
              <div className="absolute bottom-6 right-6 left-6 rounded-xl bg-white/90 p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold text-slate-900">مدیریت پراکنده و زمان‌بر</p>
                <p className="mt-1 text-xs text-slate-600">مدیریت دستی = خطا + اتلاف وقت</p>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-3">
            {painPoints.map((point, i) => (
              <ScrollReveal key={point.title} delay={i * 100}>
                <div className="h-full rounded-2xl border border-slate-200/80 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div className={`mb-4 inline-flex rounded-xl p-3 ${point.color}`}>
                    <point.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 font-bold text-slate-900">{point.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{point.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
