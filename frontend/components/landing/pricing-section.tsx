'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, ArrowLeft, CheckCircle } from 'lucide-react';
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
      features: ['تا ۵۰ دانش‌آموز', 'تمام امکانات پایه', 'پشتیبانی ایمیل', '۷ روز رایگان'],
      notIncluded: ['گزارش‌گیری پیشرفته', 'API', 'برندینگ سفارشی'],
      cta: 'شروع رایگان',
      popular: false,
    },
    {
      name: 'پایه',
      description: 'مدارس کوچک و متوسط',
      price: { monthly: 290000, annual: 2900000 },
      originalPrice: { monthly: 390000, annual: 3900000 },
      features: [
        'تا ۲۰۰ دانش‌آموز',
        'گزارش‌گیری پیشرفته',
        'مدیریت مالی',
        'پشتیبانی تلفنی',
        'بکاپ روزانه',
      ],
      notIncluded: ['API', 'چند شعبه'],
      cta: 'شروع تریال',
      popular: true,
    },
    {
      name: 'حرفه‌ای',
      description: 'مدارس بزرگ',
      price: { monthly: 590000, annual: 5900000 },
      originalPrice: { monthly: 790000, annual: 7900000 },
      features: [
        'تا ۵۰۰ دانش‌آموز',
        'پشتیبانی ۲۴/۷',
        'API کامل',
        'برندینگ سفارشی',
        'آموزش حضوری',
      ],
      notIncluded: ['شعبه نامحدود'],
      cta: 'شروع تریال',
      popular: false,
    },
    {
      name: 'سازمانی',
      description: 'سازمان‌ها و زنجیره‌ها',
      price: { monthly: 990000, annual: 9900000 },
      originalPrice: null,
      features: [
        'دانش‌آموز نامحدود',
        'چند شعبه',
        'سرور اختصاصی',
        'توسعه سفارشی',
        'SLA تضمینی',
      ],
      notIncluded: [],
      cta: 'تماس با فروش',
      popular: false,
    },
  ];

  const formatPrice = (amount: number) => new Intl.NumberFormat('fa-IR').format(amount);

  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <SectionHeading
          badge="قیمت‌گذاری"
          title="پلن مناسب برای هر مدرسه"
          description="۷ روز رایگان — بدون نیاز به کارت بانکی"
        />

        <div className="mb-12 flex justify-center">
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={cn(
                'rounded-lg px-5 py-2.5 text-sm font-semibold transition-all',
                !isAnnual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              )}
            >
              ماهانه
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={cn(
                'relative rounded-lg px-5 py-2.5 text-sm font-semibold transition-all',
                isAnnual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              )}
            >
              سالانه
              <Badge className="absolute -top-2 -left-2 bg-emerald-500 text-[10px] text-white">
                -۲۵٪
              </Badge>
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-white p-6 transition-shadow hover:shadow-lg',
                plan.popular
                  ? 'border-blue-300 shadow-lg shadow-blue-100/50 ring-1 ring-blue-200'
                  : 'border-slate-200/80'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600 px-3 py-1 text-white">
                    <Star className="ml-1 h-3 w-3" />
                    پرطرفدار
                  </Badge>
                </div>
              )}

              <div className="mb-6 pt-2 text-center">
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{plan.description}</p>
                <div className="mt-4">
                  {plan.originalPrice && (
                    <p className="text-sm text-slate-400 line-through">
                      {formatPrice(plan.originalPrice[isAnnual ? 'annual' : 'monthly'])} تومان
                    </p>
                  )}
                  <p className="text-3xl font-bold text-slate-900">
                    {formatPrice(plan.price[isAnnual ? 'annual' : 'monthly'])}
                    <span className="text-sm font-normal text-slate-500">
                      {' '}
                      تومان/{isAnnual ? 'سال' : 'ماه'}
                    </span>
                  </p>
                </div>
              </div>

              <ul className="mb-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
                {plan.notIncluded.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                    <X className="mt-0.5 h-4 w-4 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  'w-full',
                  plan.popular
                    ? 'bg-gradient-to-l from-blue-600 to-blue-700'
                    : 'bg-slate-900 hover:bg-slate-800'
                )}
                asChild
              >
                <Link href="/auth/register">
                  {plan.cta}
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-8 text-center">
          <CheckCircle className="mx-auto mb-3 h-8 w-8 text-emerald-600" />
          <h3 className="text-lg font-bold text-slate-900">تضمین بازگشت وجه ۳۰ روزه</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
            اگر راضی نبودید، بدون سوال پولتان را برمی‌گردانیم.
          </p>
        </div>
      </div>
    </section>
  );
}
