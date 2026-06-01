'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote, TrendingUp, Users, Award, Shield } from 'lucide-react';

export function SocialProof() {
  const testimonials = [
    {
      name: "مریم احمدی",
      role: "مدیر مدرسه فرزانگان",
      content: "قبل از سپاد هر روز ۳ ساعت فقط برای گزارش‌گیری وقت می‌ذاشتم. الان فقط ۱۵ دقیقه طول می‌کشه! واقعاً معجزه‌ست.",
      rating: 5,
      avatar: "م‌ا"
    },
    {
      name: "رضا محمدی",
      role: "مدیر آموزشگاه پارس",
      content: "شهریه‌های معوق ما ۶۰٪ کم شد. والدین هم راضی‌ترن چون همه‌چیز شفاف و آنلاینه.",
      rating: 5,
      avatar: "ر‌م"
    },
    {
      name: "سارا قاسمی",
      role: "معاون دبیرستان آینده",
      content: "از وقتی سپاد داریم، خطای انسانی در نمرات صفر شده. والدین همیشه از وضعیت فرزندانشون مطلعن.",
      rating: 5,
      avatar: "س‌ق"
    }
  ];

  const stats = [
    {
      icon: Users,
      value: "۵۰+",
      label: "مدرسه ایرانی",
      description: "به ما اعتماد کردن"
    },
    {
      icon: TrendingUp,
      value: "۱۰,۰۰۰+",
      label: "دانش‌آموز",
      description: "در پلتفرم ما"
    },
    {
      icon: Award,
      value: "۹۸٪",
      label: "رضایت",
      description: "مشتریان"
    },
    {
      icon: Star,
      value: "۴.۹/۵",
      label: "امتیاز",
      description: "از کاربران"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Stats Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              بیش از ۵۰ مدرسه ایرانی به ما اعتماد کردن
            </h2>
            <p className="text-xl text-gray-600">
              آمار واقعی از نتایج مشتریان ما
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="border-2 border-white shadow-lg">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-gray-800">
                    {stat.label}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.description}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              اینا نظرات واقعی مشتریان ماست
            </h2>
            <p className="text-xl text-gray-600">
              از زبان کسانی که هر روز از سپاد استفاده می‌کنن
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 space-y-4">
                  {/* Rating */}
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="relative">
                    <Quote className="h-8 w-8 text-gray-300 absolute -top-2 -right-2" />
                    <p className="text-gray-700 leading-relaxed pr-6">
                      {testimonial.content}
                    </p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                استانداردها و گواهینامه‌ها
              </h3>
              <p className="text-gray-600">
                ما تمام استانداردهای امنیتی و کیفی رو رعایت می‌کنیم
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-sm font-semibold text-gray-800">SSL Security</div>
                <div className="text-xs text-gray-600">رمزنگاری کامل</div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-sm font-semibold text-gray-800">GDPR Compliant</div>
                <div className="text-xs text-gray-600">حفظ حریم خصوصی</div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-sm font-semibold text-gray-800">ISO 27001</div>
                <div className="text-xs text-gray-600">مدیریت امنیت</div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                  <Star className="h-8 w-8 text-amber-600" />
                </div>
                <div className="text-sm font-semibold text-gray-800">24/7 Support</div>
                <div className="text-xs text-gray-600">پشتیبانی همیشگی</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
