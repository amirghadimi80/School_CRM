'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { landingImages } from '@/lib/landing-images';

const benefits = [
  '۷ روز استفاده رایگان',
  'بدون نیاز به کارت بانکی',
  'دسترسی به تمام امکانات',
  'پشتیبانی راه‌اندازی',
  'لغو هر زمان',
  'تضمین بازگشت وجه ۳۰ روزه',
];

export function FinalCTA() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            <div className="absolute inset-0 hidden opacity-30 lg:block">
              <Image
                src={landingImages.campus.graduation}
                alt=""
                fill
                className="object-cover"
                sizes="1200px"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-slate-900 via-slate-900/90 to-slate-900/70" />
            </div>

            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
            </div>

            <div className="relative grid items-center gap-12 px-8 py-16 lg:grid-cols-2 lg:px-16">
              <div className="space-y-6 text-right">
                <h2 className="text-3xl font-bold leading-tight text-white lg:text-4xl">
                  آماده‌اید مدرسه‌تان را
                  <br />
                  <span className="text-emerald-400">هوشمند کنید؟</span>
                </h2>
                <p className="text-lg text-slate-300">
                  همین امروز ثبت‌نام کنید و ۷ روز رایگان از تمام امکانات سپاد استفاده کنید.
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {benefits.map((b) => (
                    <div key={b} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                      {b}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-8 backdrop-blur-md">
                <div className="mb-6 flex items-center gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white/30">
                    <Image
                      src={landingImages.roles.student}
                      alt="دانش‌آموز"
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">شروع رایگان</h3>
                    <p className="text-sm text-slate-400">بدون تعهد — لغو هر زمان</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="h-12 w-full bg-gradient-to-l from-blue-500 to-emerald-500 text-base font-semibold shadow-lg hover:from-blue-600 hover:to-emerald-600"
                    asChild
                  >
                    <Link href="/auth/register">
                      ثبت‌نام و شروع ۷ روز رایگان
                      <ArrowLeft className="mr-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 w-full border-white/20 bg-transparent text-white hover:bg-white/10"
                    asChild
                  >
                    <Link href="/auth/login">ورود به حساب</Link>
                  </Button>
                </div>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  اطلاعات شما امن و محرمانه است
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
