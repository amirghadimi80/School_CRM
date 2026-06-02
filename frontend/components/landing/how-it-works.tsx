'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, UserPlus, Settings, BarChart, CheckCircle, Clock, Play } from 'lucide-react';
import Link from 'next/link';

export function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: "ثبت‌نام اولیه",
      description: "ایجاد حساب کاربری و اطلاعات پایه مدرسه",
      time: "سریع",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Settings,
      title: "پیکربندی سامانه",
      description: "تنظیمات اولیه و وارد کردن اطلاعات دانش‌آموزان",
      time: "آسان",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: BarChart,
      title: "آموزش و راه‌اندازی",
      description: "آموزش کار با سامانه و شروع استفاده",
      time: "کامل",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: CheckCircle,
      title: "پشتیبانی مستمر",
      description: "پشتیبانی فنی و بهینه‌سازی مستمر",
      time: "دائمی",
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    }
  ];

  return (
    <section id="demo" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            فرآیند پیاده‌سازی سامانه
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            راه‌اندازی سریع و آسان سامانه مدیریت مدرسه سپاد
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 -z-10"></div>
              )}
              
              <Card className="border-2 border-gray-100 hover:border-gray-300 hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6 text-center space-y-4">
                  {/* Step Number */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 ${step.bgColor} rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className={`h-8 w-8 ${step.color}`} />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {step.description}
                    </p>
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${step.bgColor} ${step.color}`}>
                      <Clock className="h-3 w-3" />
                      {step.time}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Live Demo Section */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">
                قبل از خرید، ببین چطوری کار می‌کنه
              </h3>
              <p className="text-lg text-gray-600">
                نیازی به ثبت‌نام نیست! همون الان دمو رو ببین و قابلیت‌ها رو تست کن
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">دسترسی کامل به تمام بخش‌ها</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">داده‌های نمونه واقعی</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">بدون نیاز به ثبت‌نام</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">۱۵ دقیقه زمان تست</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold"
                  asChild
                >
                  <Link href="/demo">
                    شروع دمو رایگان
                    <ArrowRight className="h-5 w-5 mr-2" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-6 text-lg font-semibold"
                  asChild
                >
                  <Link href="/auth/register">
                    شروع تریال ۷ روزه
                    <ArrowRight className="h-5 w-5 mr-2" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Demo Preview */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mx-auto flex items-center justify-center">
                      <Play className="h-10 w-10 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-800">دمو زنده سپاد</h4>
                    <p className="text-gray-600">روی دکمه Play کلیک کن</p>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
                <span className="font-semibold">آماده تست</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-600">۴</div>
              <div className="text-sm text-gray-600">دقیقه راه‌اندازی</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">۰</div>
              <div className="text-sm text-gray-600">نیاز به تخصص</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-600">۲۴/۷</div>
              <div className="text-sm text-gray-600">پشتیبانی</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-amber-600">۱۰۰٪</div>
              <div className="text-sm text-gray-600">رضایت تضمینی</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
