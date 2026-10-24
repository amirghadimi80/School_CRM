import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Clock } from 'lucide-react';
import Link from 'next/link';
import { CommandCenter } from '@/components/landing/visuals';

const stats = [
  { value: '۵۰+', label: 'مدرسه فعال' },
  { value: '+۱۰ هزار', label: 'دانش‌آموز' },
  { value: '۹۸٪', label: 'رضایت' },
  { value: '۲۴/۷', label: 'پشتیبانی' },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0c1b2a] pt-24 text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="landing-drift absolute -right-24 top-10 h-80 w-80 rounded-full bg-[#14c4d4]/20 blur-3xl" />
        <div className="landing-drift absolute -left-20 bottom-0 h-96 w-96 rounded-full bg-[#243eae]/40 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(to left, rgba(255,255,255,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.16) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
          }}
        />
      </div>

      <div className="container relative mx-auto px-4 pb-12 pt-6 lg:pb-16 lg:pt-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-8">
          <div className="text-start">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#14c4d4]/30 bg-[#14c4d4]/10 px-3 py-1 text-xs font-semibold text-[#9cf4f8] sm:text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#14c4d4] animate-pulse-soft motion-reduce:animate-none" aria-hidden />
              سامانه یکپارچه مدیریت مدرسه
            </p>

            <h1 className="mt-5 text-[2.35rem] font-extrabold leading-[1.35] text-white sm:text-5xl lg:text-[3.4rem]">
              مدیریت مدرسه
              <span className="mt-1 block text-[#14c4d4]">در یک داشبورد</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-white/75 sm:text-lg">
              حضور و غیاب، نمرات، برنامه درسی و امور مالی را برای مدیر، معلم، دانش‌آموز و اولیا در همین سامانه ببینید.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-12 bg-[#14c4d4] px-7 text-base font-bold text-[#082028] shadow-none hover:bg-[#7eebf2]"
                asChild
              >
                <Link href="/auth/register">
                  شروع رایگان، ۷ روز
                  <ArrowLeft className="ms-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 border-white/25 bg-transparent px-7 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="#roles">مشاهده پنل‌ها</Link>
              </Button>
            </div>

            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/65">
              <li className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-[#14c4d4]" aria-hidden />
                امنیت داده‌ها
              </li>
              <li className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#14c4d4]" aria-hidden />
                راه‌اندازی سریع
              </li>
            </ul>
          </div>

          <CommandCenter />
        </div>

        <dl className="mt-12 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="border-white/10 px-4 py-4 sm:border-s sm:first:border-s-0">
              <dt className="text-xs text-white/55">{stat.label}</dt>
              <dd className="mt-1 text-2xl font-extrabold text-white lg:text-3xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
