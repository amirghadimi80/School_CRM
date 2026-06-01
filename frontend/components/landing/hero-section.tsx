'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Shield, Clock } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-green-50 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-right space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              <Shield className="h-4 w-4" />
              سامانه مدیریت مدرسه معتبر
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                سامانه جامع مدیریت مدرسه{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                  سپاد
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 font-medium">
                راه‌حل هوشمند برای مدیریت یکپارچه آموزشی
              </p>
            </div>

            {/* Subheading */}
            <p className="text-lg text-gray-600 leading-relaxed">
              با سپاد، تمام فرآیندهای مدیریتی مدرسه خود را در یک پلتفرم یکپارچه مدیریت کنید.
              <br />
              <span className="font-semibold text-green-600">
                افزایش کارایی و کاهش خطا در مدیریت مدرسه
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                asChild
              >
                <Link href="/auth/register">
                  <span>درخواست دمو رایگان</span>
                  <ArrowRight className="h-5 w-5 mr-2" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-600 text-gray-700 hover:bg-gray-600 hover:text-white px-8 py-6 text-lg font-semibold transition-all duration-300"
                asChild
              >
                <Link href="#features">
                  <span>اطلاعات بیشتر</span>
                  <ArrowRight className="h-5 w-5 mr-2" />
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>پیاده‌سازی سریع و آسان</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>پشتیبانی فنی ۲۴/۷</span>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
              {/* Dashboard Preview */}
              <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">س</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">داشبورد مدیریت سپاد</h3>
                  <p className="text-gray-600">همه‌چیز در یک نگاه</p>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
                <span className="font-semibold">+۹۵% سرعت</span>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
                <span className="font-semibold">-۱۰۰% خطا</span>
              </div>
            </div>

            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-green-400/20 rounded-2xl blur-xl -z-10"></div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-12 text-gray-50"
          viewBox="0 0 1440 48"
          fill="currentColor"
        >
          <path d="M0,48L1440,48L1440,0L0,0Z" />
        </svg>
      </div>
    </section>
  );
}
