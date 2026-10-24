import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, Settings, Rocket, HeadphonesIcon, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { SectionHeading } from '@/components/landing/section-heading';

const steps = [
  {
    icon: UserPlus,
    step: '۰۱',
    title: 'ثبت‌نام',
    description: 'حساب می‌سازید و مشخصات پایه مدرسه را وارد می‌کنید.',
  },
  {
    icon: Settings,
    step: '۰۲',
    title: 'پیکربندی',
    description: 'کلاس، معلم و دانش‌آموز را در همان جا می‌چینید.',
  },
  {
    icon: Rocket,
    step: '۰۳',
    title: 'شروع کار',
    description: 'حضور، نمره و برنامه را روی سامانه می‌برید.',
  },
  {
    icon: HeadphonesIcon,
    step: '۰۴',
    title: 'پشتیبانی',
    description: 'اگر جایی گیر کردید، تیم پشتیبانی کنار شماست.',
  },
];

export function HowItWorks() {
  return (
    <section id="demo" className="scroll-mt-24 bg-[#e9e3d6] py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <SectionHeading
          badge="شروع کار"
          title="چهار قدم تا استفاده"
          description="راه‌اندازی تحت وب است و نصب جدا نمی‌خواهد."
        />

        <ol className="mb-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.step} className="rounded-[24px] bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-extrabold text-[#0c6670]">{step.step}</span>
                <step.icon className="h-5 w-5 text-[#102033]" aria-hidden />
              </div>
              <h3 className="font-extrabold text-[#102033]">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{step.description}</p>
            </li>
          ))}
        </ol>

        <div className="grid items-center gap-8 overflow-hidden rounded-[28px] bg-[#102033] p-7 text-white lg:grid-cols-2 lg:p-12">
          <div>
            <h3 className="text-2xl font-extrabold leading-snug lg:text-3xl">۷ روز، بدون کارت بانکی</h3>
            <p className="mt-3 leading-8 text-white/70">
              همه امکانات را در همین بازه امتحان می‌کنید و می‌بینید سپاد کجای کار مدرسه می‌نشیند.
            </p>
            <ul className="mt-5 space-y-2">
              {['دسترسی به امکانات سامانه', 'پشتیبانی راه‌اندازی', 'لغو هر زمان'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-white/85">
                  <CheckCircle className="h-4 w-4 shrink-0 text-[#14c4d4]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <Button size="lg" className="mt-6 h-12 bg-[#14c4d4] px-6 font-bold text-[#082028] hover:bg-[#7eebf2]" asChild>
              <Link href="/auth/register">
                شروع دوره آزمایشی
                <ArrowLeft className="ms-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <dl className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            {[
              { label: 'زمان راه‌اندازی', val: 'کمتر از ۱ ساعت' },
              { label: 'نیاز به نصب', val: 'خیر، تحت وب' },
              { label: 'آموزش اولیه', val: 'رایگان' },
              { label: 'پشتیبانی', val: '۲۴ ساعته در پلن بالاتر' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 border-b border-white/10 py-3 last:border-0">
                <dt className="text-sm text-white/60">{row.label}</dt>
                <dd className="text-sm font-bold">{row.val}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
