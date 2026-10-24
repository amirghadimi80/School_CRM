'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SectionHeading } from '@/components/landing/section-heading';
import { cn } from '@/lib/utils';

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'آزمایشی',
      description: 'برای آشنایی با سامانه',
      price: { monthly: 0, annual: 0 },
      originalPrice: null,
      features: ['تا ۵۰ دانش‌آموز', 'امکانات پایه', 'پشتیبانی ایمیل', '۷ روز رایگان'],
      notIncluded: ['گزارش‌گیری پیشرفته', 'رابط برنامه‌نویسی', 'برندینگ سفارشی'],
      cta: 'شروع رایگان',
      popular: false,
    },
    {
      name: 'پایه',
      description: 'مدارس کوچک و متوسط',
      price: { monthly: 290000, annual: 2900000 },
      originalPrice: { monthly: 390000, annual: 3900000 },
      features: ['تا ۲۰۰ دانش‌آموز', 'گزارش‌گیری پیشرفته', 'مدیریت مالی', 'پشتیبانی تلفنی', 'بکاپ روزانه'],
      notIncluded: ['رابط برنامه‌نویسی', 'چند شعبه'],
      cta: 'شروع دوره آزمایشی',
      popular: true,
    },
    {
      name: 'حرفه‌ای',
      description: 'مدارس بزرگ',
      price: { monthly: 590000, annual: 5900000 },
      originalPrice: { monthly: 790000, annual: 7900000 },
      features: ['تا ۵۰۰ دانش‌آموز', 'پشتیبانی ۲۴ ساعته', 'رابط برنامه‌نویسی', 'برندینگ سفارشی', 'آموزش حضوری'],
      notIncluded: ['شعبه نامحدود'],
      cta: 'شروع دوره آزمایشی',
      popular: false,
    },
    {
      name: 'سازمانی',
      description: 'مجموعه‌های چندشعبه',
      price: { monthly: 990000, annual: 9900000 },
      originalPrice: null,
      features: ['دانش‌آموز نامحدود', 'چند شعبه', 'سرور اختصاصی', 'توسعه سفارشی', 'تعهد سطح خدمت'],
      notIncluded: [],
      cta: 'تماس با فروش',
      popular: false,
    },
  ];

  const formatPrice = (amount: number) => new Intl.NumberFormat('fa-IR').format(amount);
  const period = isAnnual ? 'annual' : 'monthly';

  return (
    <section id="pricing" className="scroll-mt-24 bg-[#f4f1ea] py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <SectionHeading
          badge="قیمت‌گذاری"
          title="پلنی به اندازه مدرسه"
          description="۷ روز رایگان، بدون کارت بانکی. قیمت‌ها به تومان است."
        />

        <div className="mb-10 flex justify-center">
          <div className="inline-flex rounded-full bg-[#102033] p-1" role="group" aria-label="دوره پرداخت">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              aria-pressed={!isAnnual}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-semibold transition-colors',
                !isAnnual ? 'bg-[#14c4d4] text-[#082028]' : 'text-white/70'
              )}
            >
              ماهانه
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              aria-pressed={isAnnual}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-semibold transition-colors',
                isAnnual ? 'bg-[#14c4d4] text-[#082028]' : 'text-white/70'
              )}
            >
              سالانه
              <span className="ms-2 text-[11px] font-bold">۲۵٪ کمتر</span>
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                'relative flex flex-col rounded-[24px] border bg-white p-6',
                plan.popular ? 'border-[#102033] shadow-[0_20px_40px_-24px_rgba(16,32,51,0.45)]' : 'border-[#102033]/10'
              )}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 start-6 border-0 bg-[#14c4d4] px-3 py-1 text-[#082028] hover:bg-[#14c4d4]">
                  پرطرفدار
                </Badge>
              )}

              <header className="mb-5 pt-2">
                <h3 className="text-lg font-extrabold text-[#102033]">{plan.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{plan.description}</p>
                <p className="mt-4 text-3xl font-extrabold text-[#102033]">
                  {formatPrice(plan.price[period])}
                  <span className="ms-1 text-sm font-medium text-slate-500">
                    تومان / {isAnnual ? 'سال' : 'ماه'}
                  </span>
                </p>
                {plan.originalPrice && (
                  <p className="text-sm text-slate-400 line-through">
                    {formatPrice(plan.originalPrice[period])} تومان
                  </p>
                )}
              </header>

              <ul className="mb-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-[#102033]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0c6670]" aria-hidden />
                    {feature}
                  </li>
                ))}
                {plan.notIncluded.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-400">
                    <X className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  'w-full',
                  plan.popular
                    ? 'bg-[#14c4d4] text-[#082028] hover:bg-[#7eebf2]'
                    : 'bg-[#102033] text-white hover:bg-[#1a3348]'
                )}
                asChild
              >
                <Link href="/auth/register">
                  {plan.cta}
                  <ArrowLeft className="ms-2 h-4 w-4" />
                </Link>
              </Button>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-[24px] bg-[#102033] px-6 py-8 text-center text-white">
          <h3 className="text-lg font-extrabold">تضمین بازگشت وجه ۳۰ روزه</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-white/70">
            اگر سامانه به کار مدرسه نخورد، تا ۳۰ روز مبلغ را برمی‌گردانیم.
          </p>
        </div>
      </div>
    </section>
  );
}
