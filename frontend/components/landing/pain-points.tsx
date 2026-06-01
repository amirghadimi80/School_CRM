'use client';

import { Card, CardContent } from '@/components/ui/card';
import { FileX, Clock, Users, AlertTriangle } from 'lucide-react';

export function PainPoints() {
  const painPoints = [
    {
      icon: FileX,
      title: "مدیریت پراکنده اطلاعات",
      description: "جمع‌آوری اطلاعات از منابع مختلف و عدم یکپارچگی داده‌های آموزشی",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      icon: Clock,
      title: "مصرف زمان بالا",
      description: "صرف زمان قابل توجه برای فرآیندهای دستی و گزارش‌گیری‌های روزمره",
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      icon: Users,
      title: "احتمال خطای انسانی",
      description: "خطا در ثبت اطلاعات، محاسبات و گزارش‌گیری به دلیل فرآیندهای دستی",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: AlertTriangle,
      title: "عدم دسترسی آنی",
      description: "محدودیت در دسترسی به اطلاعات و گزارش‌های مورد نیاز برای تصمیم‌گیری",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            چالش‌های رایج در مدیریت مدارس
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            سامانه سپاد راه‌حل‌های جامعی برای چالش‌های مدیریتی شما ارائه می‌دهد
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {painPoints.map((point, index) => (
            <Card key={index} className="border-2 border-gray-100 hover:border-red-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center space-y-4">
                <div className={`w-16 h-16 ${point.bgColor} rounded-full flex items-center justify-center mx-auto`}>
                  <point.icon className={`h-8 w-8 ${point.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {point.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {point.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-red-800 mb-4">
              این مشکلات هزینه‌بر و زمان‌بر رو دیگه تحمل نکنید!
            </h3>
            <p className="text-red-700 text-lg mb-6">
              هر روزی که صبر می‌کنید، یعنی از دست دادن زمان، پول و آرامش
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white px-6 py-3 rounded-lg border border-red-200">
                <span className="text-red-800 font-semibold">هزینه روزانه: </span>
                <span className="text-2xl font-bold text-red-600">۱۵۰,۰۰۰ تومان</span>
              </div>
              <div className="bg-white px-6 py-3 rounded-lg border border-red-200">
                <span className="text-red-800 font-semibold">زمان تلف شده: </span>
                <span className="text-2xl font-bold text-red-600">۳ ساعت در روز</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
