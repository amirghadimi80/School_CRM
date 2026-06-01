'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Shield, Star, Zap } from 'lucide-react';
import Link from 'next/link';

export function FinalCTA() {
  const [email, setEmail] = useState('');

  const benefits = [
    "۷ روز استفاده کامل رایگان",
    "دسترسی به تمام امکانات",
    "بدون نیاز به کارت اعتباری",
    "لغو هر زمان که خواستید",
    "پشتیبانی ۲۴/۷",
    "تضمین بازگشت پول ۳۰ روزه"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission
    console.log('Email submitted:', email);
    // Redirect to registration or show success message
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                  همین امروز مدرسه‌تو هوشمند کن
                </h2>
                <p className="text-xl text-gray-300">
                  هزاران مدیر مدرسه مثل شما به سپاد پیوستن و حالا با آرامش مدیریت می‌کنن
                </p>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-200">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span className="text-sm text-gray-300">SSL Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm text-gray-300">۴.۹/۵ امتیاز</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-400" />
                  <span className="text-sm text-gray-300">راه‌اندازی ۴ دقیقه‌ای</span>
                </div>
              </div>
            </div>

            {/* Right Form */}
            <div>
              <Card className="bg-white text-gray-900 border-2 border-gray-200 shadow-2xl">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">شروع فوری تریال رایگان</h3>
                    <p className="text-gray-600">
                      ایمیلت رو وارد کن تا بلافاصله شروع کنی
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Input
                        type="email"
                        placeholder="ایمیل خود را وارد کنید"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="text-lg py-6 px-4 border-2 border-gray-200 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      شروع تریال ۷ روزه رایگان
                      <ArrowRight className="h-5 w-5 mr-2" />
                    </Button>
                  </form>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      یا از طریق لینک زیر ثبت‌نام کن
                    </p>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-6 text-lg font-semibold"
                      asChild
                    >
                      <Link href="/auth/register">
                        ثبت‌نام کامل با اطلاعات مدرسه
                        <ArrowRight className="h-5 w-5 mr-2" />
                      </Link>
                    </Button>
                  </div>

                  {/* Guarantee */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">تضمین رضایت ۱۰۰٪</span>
                    </div>
                    <p className="text-sm text-green-700">
                      اگر به هر دلیلی راضی نبودی، تمام پولت رو فوراً برمی‌گردونیم
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Urgency Message */}
              <div className="mt-6 text-center">
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-200 font-semibold">
                    ⚠️ فقط ۲۳ نفر ظرفیت باقی‌مانده برای تخفیف ویژه امروز
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-400">۵۰+</div>
              <div className="text-gray-300">مدرسه ایرانی</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-400">۱۰K+</div>
              <div className="text-gray-300">دانش‌آموز</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-400">۹۸٪</div>
              <div className="text-gray-300">رضایت مشتریان</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-yellow-400">۲۴/۷</div>
              <div className="text-gray-300">پشتیبانی</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
