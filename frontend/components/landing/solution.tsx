'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Zap, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export function Solution() {
  const benefits = [
    {
      icon: CheckCircle,
      title: "یکپارچگی کامل",
      description: "تمام فرآیندهای مدیریتی در یک پلتفرم جامع و هماهنگ"
    },
    {
      icon: Zap,
      title: "بهینه‌سازی زمان",
      description: "کاهش چشمگیر زمان مورد نیاز برای فرآیندهای مدیریتی"
    },
    {
      icon: Shield,
      title: "دقت بالا",
      description: "کاهش خطا در محاسبات و ثبت اطلاعات با فرآیندهای خودکار"
    },
    {
      icon: TrendingUp,
      title: "گزارش‌دهی هوشمند",
      description: "دسترسی سریع به گزارش‌های تحلیلی و مدیریتی"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                راه‌حل جامع مدیریت مدرسه
              </h2>
              <p className="text-xl text-gray-600">
                سامانه سپاد، پلتفرمی یکپارچه برای مدیریت هوشمند فرآیندهای آموزشی
              </p>
            </div>

            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    همین امروز شروع کن
                  </h4>
                  <p className="text-gray-600">
                    ۷ روز کامل رایگان试用 کن، بعد تصمیم بگیر
                  </p>
                </div>
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-6"
                  asChild
                >
                  <Link href="/auth/register">
                    شروع رایگان
                    <ArrowRight className="h-5 w-5 mr-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="space-y-6">
            {/* Main Feature Card */}
            <Card className="border-2 border-green-200 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">س</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      همه‌چیز در یک نگاه
                    </h3>
                    <p className="text-gray-600 mb-4">
                      داشبورد مدیریتی که همه‌چیز رو بهت نشون میده
                    </p>
                  </div>
                  
                  {/* Feature List */}
                  <div className="grid grid-cols-2 gap-4 text-right">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-green-800 font-semibold">حضور و غیاب</div>
                      <div className="text-green-600 text-sm">آنلاین و خودکار</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-blue-800 font-semibold">نمرات و کارنامه</div>
                      <div className="text-blue-600 text-sm">لحظه‌ای</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-purple-800 font-semibold">مدیریت مالی</div>
                      <div className="text-purple-600 text-sm">شهریه و پرداخت</div>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg">
                      <div className="text-amber-800 font-semibold">گزارش‌گیری</div>
                      <div className="text-amber-600 text-sm">تحلیلی و هوشمند</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center shadow-md">
                <div className="text-2xl font-bold text-green-600">۱۰۰٪</div>
                <div className="text-sm text-gray-600">دقت</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-md">
                <div className="text-2xl font-bold text-blue-600">۱۰x</div>
                <div className="text-sm text-gray-600">سرعت</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-md">
                <div className="text-2xl font-bold text-purple-600">۲۴/۷</div>
                <div className="text-sm text-gray-600">دسترسی</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
