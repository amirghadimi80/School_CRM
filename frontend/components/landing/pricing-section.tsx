'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, ArrowRight, Zap, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "آزمایشی",
      description: "برای شروع و تست کامل",
      price: { monthly: 0, annual: 0 },
      originalPrice: null,
      badge: "۷ روز رایگان",
      badgeColor: "bg-green-100 text-green-800",
      features: [
        "تا ۵۰ دانش‌آموز",
        "تمام امکانات پایه",
        "پشتیبانی ایمیل",
        "دسترسی به گزارش‌ها",
        "مدیریت حضور و غیاب"
      ],
      notIncluded: [
        "گزارش‌گیری پیشرفته",
        "پشتیبانی تلفنی",
        "API دسترسی",
        "برندینگ سفارشی"
      ],
      cta: "شروع رایگان",
      ctaColor: "bg-green-600 hover:bg-green-700",
      popular: false
    },
    {
      name: "پایه",
      description: "برای مدارس کوچک و متوسط",
      price: { monthly: 290000, annual: 2900000 },
      originalPrice: { monthly: 390000, annual: 3900000 },
      badge: "پرفروش‌ترین",
      badgeColor: "bg-blue-100 text-blue-800",
      features: [
        "تا ۲۰۰ دانش‌آموز",
        "تمام امکانات پایه",
        "پشتیبانی تلفنی و ایمیل",
        "گزارش‌گیری پیشرفته",
        "مدیریت مالی کامل",
        "اپلیکیشن موبایل",
        "بکاپ روزانه"
      ],
      notIncluded: [
        "API دسترسی",
        "برندینگ سفارشی",
        "مدیریت چند شعبه"
      ],
      cta: "شروع تریال رایگان",
      ctaColor: "bg-blue-600 hover:bg-blue-700",
      popular: true
    },
    {
      name: "حرفه‌ای",
      description: "برای مدارس بزرگ و زنجیره‌ای",
      price: { monthly: 590000, annual: 5900000 },
      originalPrice: { monthly: 790000, annual: 7900000 },
      badge: "مقرون‌به‌صرفه",
      badgeColor: "bg-purple-100 text-purple-800",
      features: [
        "تا ۵۰۰ دانش‌آموز",
        "تمام امکانات پایه",
        "پشتیبانی ویژه ۲۴/۷",
        "گزارش‌گیری پیشرفته",
        "مدیریت مالی کامل",
        "اپلیکیشن موبایل",
        "بکاپ روزانه",
        "API دسترسی کامل",
        "برندینگ سفارشی",
        "آموزش حضوری"
      ],
      notIncluded: [
        "مدیریت نامحدود شعبه"
      ],
      cta: "شروع تریال رایگان",
      ctaColor: "bg-purple-600 hover:bg-purple-700",
      popular: false
    },
    {
      name: "سازمانی",
      description: "برای آموزش‌وپرورش و سازمان‌های بزرگ",
      price: { monthly: 990000, annual: 9900000 },
      originalPrice: { monthly: 1290000, annual: 12900000 },
      badge: "پیشرفته",
      badgeColor: "bg-amber-100 text-amber-800",
      features: [
        "دانش‌آموزان نامحدود",
        "تمام امکانات حرفه‌ای",
        "مدیریت چند شعبه",
        "سرور اختصاصی",
        "پشتیبانی اختصاصی",
        "توسعه سفارشی",
        "یکپارچه‌سازی با سیستم‌های دیگر",
        "SLA تضمینی",
        "آموزش کامل تیم"
      ],
      notIncluded: [],
      cta: "تماس با فروش",
      ctaColor: "bg-amber-600 hover:bg-amber-700",
      popular: false
    }
  ];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  const discountPercentage = isAnnual ? 25 : 20;

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            تعرفه‌های مناسب برای هر مدرسه‌ای
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            با تخفیف ویژه {discountPercentage}% فقط امروز شروع کن
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-3 rounded-md font-semibold transition-all ${
                !isAnnual
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ماهانه
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-3 rounded-md font-semibold transition-all relative ${
                isAnnual
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              سالانه
              <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1">
                -۲۵٪
              </Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative border-2 ${
                plan.popular 
                  ? 'border-blue-500 shadow-xl scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              } transition-all duration-300`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-2 text-sm font-semibold">
                    <Star className="h-4 w-4 ml-1" />
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="space-y-2">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {plan.name}
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="space-y-2 pt-4">
                  {plan.originalPrice && (
                    <div className="text-gray-400 line-through text-sm">
                      {formatPrice(plan.originalPrice[isAnnual ? 'annual' : 'monthly'])} تومان
                    </div>
                  )}
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(plan.price[isAnnual ? 'annual' : 'monthly'])}
                    </span>
                    <span className="text-gray-600">
                      تومان/{isAnnual ? 'سال' : 'ماه'}
                    </span>
                  </div>
                  {isAnnual && plan.originalPrice && (
                    <div className="text-green-600 text-sm font-semibold">
                      صرفه‌جویی {formatPrice(
                        plan.originalPrice.annual - plan.price.annual
                      )} تومانی در سال
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 opacity-50">
                      <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-500 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  className={`w-full py-6 text-lg font-semibold ${plan.ctaColor} text-white`}
                  asChild
                >
                  <Link href="/auth/register">
                    {plan.cta}
                    <ArrowRight className="h-5 w-5 mr-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Urgency Section */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-6 w-6" />
            <h3 className="text-2xl font-bold">پیشنهاد ویژه امروز فقط معتبره!</h3>
          </div>
          <p className="text-xl mb-6 opacity-90">
            تخفیف {discountPercentage}% + ۱ ماه رایگان برای همه پلن‌ها
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-lg">
              <span className="font-semibold">زمان باقی‌مانده: </span>
              <span className="text-2xl font-bold" id="urgency-timer">۲۳:۵۹:۴۵</span>
            </div>
            <Button
              size="lg"
              className="bg-white text-red-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
              asChild
            >
              <Link href="/auth/register">
                شروع فوری و دریافت تخفیف
                <ArrowRight className="h-5 w-5 mr-2" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Guarantee */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              تضمین بازگشت پول ۳۰ روزه
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              اگر به هر دلیلی از سپاد راضی نبودی، تمام پولت رو بدون هیچ سوالی برگردونیم. 
              ریسک هیچی نداری، فقط امتحان کن.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
