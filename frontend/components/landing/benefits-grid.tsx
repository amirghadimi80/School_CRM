'use client';

import { Card, CardContent } from '@/components/ui/card';
import { 
  Clock, 
  TrendingUp, 
  Users, 
  Shield, 
  Smartphone, 
  BarChart3,
  Calendar,
  DollarSign,
  CheckCircle
} from 'lucide-react';

export function BenefitsGrid() {
  const benefits = [
    {
      icon: Clock,
      title: "بهینه‌سازی زمان",
      description: "کاهش زمان مورد نیاز برای فرآیندهای مدیریتی و اداری",
      value: "صرفه‌جویی زمانی",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: TrendingUp,
      title: "افزایش کارایی",
      description: "بهبود فرآیندها و افزایش بهره‌وری مدیریتی",
      value: "کارایی بالاتر",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Users,
      title: "رضایت ذی‌نفعان",
      description: "افزایش رضایت والدین و دانش‌آموزان از خدمات آموزشی",
      value: "رضایت بیشتر",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Shield,
      title: "دقت در اطلاعات",
      description: "کاهش خطا در ثبت و پردازش اطلاعات آموزشی",
      value: "دقت بالا",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      icon: Smartphone,
      title: "دسترسی آسان",
      description: "امکان مدیریت از طریق دستگاه‌های مختلف",
      value: "دسترسی کامل",
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      icon: BarChart3,
      title: "گزارش‌دهی سریع",
      description: "دسترسی سریع به گزارش‌های مدیریتی و تحلیلی",
      value: "گزارش‌دهی آنی",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      icon: Calendar,
      title: "تقویم فارسی",
      description: "سازگاری کامل با تقویم رسمی جمهوری اسلامی ایران",
      value: "مناسب ایران",
      color: "teal-600",
      bgColor: "bg-teal-50"
    },
    {
      icon: DollarSign,
      title: "کنترل مالی",
      description: "مدیریت بهینه هزینه‌ها و درآمدهای آموزشی",
      value: "مدیریت مالی",
      color: "emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      icon: CheckCircle,
      title: "مدیریت یکپارچه",
      description: "تمام فرآیندها در یک پلتفرم هماهنگ",
      value: "یکپارچگی",
      color: "cyan-600",
      bgColor: "bg-cyan-50"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            مزایای استفاده از سامانه سپاد
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            بهینه‌سازی فرآیندهای مدیریتی و افزایش کارایی آموزشی
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card 
              key={index} 
              className="border-2 border-gray-100 hover:border-gray-300 hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className={`w-20 h-20 ${benefit.bgColor} rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className={`h-10 w-10 ${benefit.color}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {benefit.title}
                  </h3>
                  <div className={`text-2xl font-bold ${benefit.color}`}>
                    {benefit.value}
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">
              اینا فقط آمار نیستن، واقعیت هستن
            </h3>
            <p className="text-xl mb-6 opacity-90">
              بیش از ۵۰ مدرسه ایرانی این نتایج رو تجربه کردن
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-lg">
                <span className="font-semibold">میانگین صرفه‌جویی ماهانه: </span>
                <span className="text-2xl font-bold">۵,۰۰۰,۰۰۰ تومان</span>
              </div>
              <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-lg">
                <span className="font-semibold">میانگین زمان صرفه‌جویی: </span>
                <span className="text-2xl font-bold">۴۰ ساعت در ماه</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
