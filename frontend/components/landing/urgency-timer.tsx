'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function UrgencyTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          return { ...prev, seconds: seconds - 1 };
        } else if (minutes > 0) {
          return { hours, minutes: minutes - 1, seconds: 59 };
        } else if (hours > 0) {
          return { hours: hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (value: number) => {
    return value.toString().padStart(2, '0');
  };

  return (
    <section className="py-16 bg-gradient-to-r from-red-600 to-orange-600">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center text-white space-y-8">
          {/* Alert Icon */}
          <div className="flex items-center justify-center gap-3">
            <AlertTriangle className="h-8 w-8 animate-pulse" />
            <h2 className="text-3xl lg:text-4xl font-bold">
              این پیشنهاد فقط برای مدت محدود معتبره!
            </h2>
          </div>

          {/* Timer Display */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
            <p className="text-xl mb-6 font-semibold">
              تخفیف ۲۰٪ + ۱ ماه رایگان در صورت ثبت‌نام امروز
            </p>
            
            <div className="flex justify-center items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <Clock className="h-6 w-6" />
                <span className="text-lg font-semibold">زمان باقی‌مانده:</span>
              </div>
              
              <div className="flex gap-2">
                <div className="bg-white/20 backdrop-blur px-4 py-3 rounded-lg min-w-[80px]">
                  <div className="text-3xl font-bold">
                    {formatTime(timeLeft.hours)}
                  </div>
                  <div className="text-sm opacity-80">ساعت</div>
                </div>
                <div className="text-3xl font-bold self-center">:</div>
                <div className="bg-white/20 backdrop-blur px-4 py-3 rounded-lg min-w-[80px]">
                  <div className="text-3xl font-bold">
                    {formatTime(timeLeft.minutes)}
                  </div>
                  <div className="text-sm opacity-80">دقیقه</div>
                </div>
                <div className="text-3xl font-bold self-center">:</div>
                <div className="bg-white/20 backdrop-blur px-4 py-3 rounded-lg min-w-[80px]">
                  <div className="text-3xl font-bold">
                    {formatTime(timeLeft.seconds)}
                  </div>
                  <div className="text-sm opacity-80">ثانیه</div>
                </div>
              </div>
            </div>

            {/* Savings Calculation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold mb-1">۲,۰۰۰,۰۰۰ تومان</div>
                <div className="text-sm opacity-80">صرفه‌جویی سالانه</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold mb-1">۱ ماه رایگان</div>
                <div className="text-sm opacity-80">امتیاز ویژه امروز</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold mb-1">فقط ۲۳ نفر</div>
                <div className="text-sm opacity-80">ظرفیت باقی‌مانده</div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="space-y-4">
              <Button
                size="lg"
                className="bg-white text-red-600 hover:bg-gray-100 px-12 py-8 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                asChild
              >
                <Link href="/auth/register">
                  همین الان ثبت‌نام کن و تخفیف بگیر
                  <ArrowRight className="h-6 w-6 mr-3" />
                </Link>
              </Button>
              
              <p className="text-sm opacity-80">
                بدون نیاز به کارت اعتباری • ۷ روز استفاده رایگان • لغو هر زمان
              </p>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-400/20 backdrop-blur rounded-lg p-4 border border-yellow-400/30">
            <p className="text-yellow-100 font-semibold">
              ⚠️ توجه: این پیشنهاد بعد از اتمام زمان دیگر قابل دسترس نخواهد بود
            </p>
          </div>

          {/* Social Proof */}
          <div className="text-sm opacity-80">
            <p>در ۲۴ ساعت گذشته ۱۲ مدرسه از این پیشنهاد استفاده کردند</p>
          </div>
        </div>
      </div>
    </section>
  );
}
