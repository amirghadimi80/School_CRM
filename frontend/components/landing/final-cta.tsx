import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { GraduationScene } from '@/components/landing/visuals';

const benefits = [
  '۷ روز استفاده رایگان',
  'بدون کارت بانکی',
  'دسترسی به امکانات سامانه',
  'پشتیبانی راه‌اندازی',
  'لغو هر زمان',
  'بازگشت وجه تا ۳۰ روز',
];

export function FinalCTA() {
  return (
    <section className="bg-[#f4f1ea] py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="grid overflow-hidden rounded-[32px] bg-[#0c1b2a] text-white lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[220px] border-b border-white/10 lg:border-b-0 lg:border-e">
              <GraduationScene />
              <p className="absolute bottom-5 start-5 text-sm font-bold text-white">مسیر مدرسه، روی یک سامانه</p>
            </div>

            <div className="p-7 sm:p-10">
              <h2 className="text-3xl font-extrabold leading-[1.4] lg:text-4xl">
                هفت روز با امکانات کامل کار کنید
              </h2>
              <p className="mt-3 leading-8 text-white/70">
                ثبت‌نام را باز کنید، مدرسه را بچینید و ببینید حضور، نمره و شهریه کجا جمع می‌شود.
              </p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 text-sm text-white/85">
                    <CheckCircle className="h-4 w-4 shrink-0 text-[#14c4d4]" aria-hidden />
                    {benefit}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="h-12 bg-[#14c4d4] font-bold text-[#082028] hover:bg-[#7eebf2]" asChild>
                  <Link href="/auth/register">
                    ثبت‌نام و شروع ۷ روز رایگان
                    <ArrowLeft className="ms-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <Link href="/auth/login">ورود به حساب</Link>
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
