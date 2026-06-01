'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Shield, Clock, Users, Database, Smartphone, HelpCircle } from 'lucide-react';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "آیا داده‌های مدرسه من امن هستن؟",
      answer: "بله، ما از بالاترین استانداردهای امنیتی استفاده می‌کنیم. تمام داده‌ها با رمزنگاری AES-256 محافظت میشن و روی سرورهای امن ایران نگهداری میشن. همچنین ما به GDPR و قوانین حفاظت از داده‌های ایران پایبند هستیم.",
      icon: Shield,
      category: "امنیت"
    },
    {
      question: "آیا می‌تونم داده‌هام رو از سیستم خارج کنم؟",
      answer: "قطعاً. شما مالک کامل داده‌های خودتون هستید و هر زمان که بخواید می‌تونید تمام اطلاعات رو در فرمت‌های استاندارد (Excel, CSV, PDF) export کنید. ما هیچ‌وقت شما رو قفل نمی‌کنیم.",
      icon: Database,
      category: "داده‌ها"
    },
    {
      question: "چقدر طول می‌کشه تا سیستم رو راه‌اندازی کنم؟",
      answer: "راه‌اندازی اولیه فقط ۴ دقیقه طول می‌کشه! ثبت‌نام ۲ دقیقه، تنظیمات اولیه ۲ دقیقه. بعد از اون می‌تونید بلافاصله شروع به استفاده کنید. تیم پشتیبانی هم در تمام مراحل کنار شماست.",
      icon: Clock,
      category: "شروع"
    },
    {
      question: "آیا برای مدرسه کوچک من مناسب هست؟",
      answer: "بله! ما پلن‌های مختلفی برای هر سایزی داریم. از مدرسه با ۱۰ دانش‌آموز گرفته تا زنجیره‌های بزرگ. پلن آزمایشی رایگان به شما اجازه میده قبل از خرید تست کنید که چقدر برای مدرسه شما مناسب هست.",
      icon: Users,
      category: "مناسب‌سازی"
    },
    {
      question: "آیا اپلیکیشن موبایل هم دارید؟",
      answer: "بله! اپلیکیشن موبایل ما برای اندروید و iOS در دسترس هست. معلمان می‌تونن حضور و غیاب ثبت کنن، والدین نمرات فرزندانشون رو ببینن، و مدیران از هر کجا به داشبورد دسترسی داشته باشن.",
      icon: Smartphone,
      category: "دسترسی"
    },
    {
      question: "اگه مشکلی پیش بیاد چطور پشتیبانی می‌کنید؟",
      answer: "پشتیبانی ما ۲۴/۷ آماده پاسخگویی هست. پلن‌های پایه به بالا پشتیبانی تلفنی هم دارن. معمولاً کمتر از ۵ دقیقه پاسخ می‌دیم. علاوه بر این، آموزش‌های ویدیویی و مستندات کامل هم در اختیار شماست.",
      icon: HelpCircle,
      category: "پشتیبانی"
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const categories = ["همه", "امنیت", "داده‌ها", "شروع", "مناسب‌سازی", "دسترسی", "پشتیبانی"];
  const [selectedCategory, setSelectedCategory] = useState("همه");

  const filteredFAQs = selectedCategory === "همه" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            سوالات متداول شما
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            هر سوالی دارید اینجا جواب دادیم. باز هم سوالی بود؟ تیم پشتیبانی آماده‌ست.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="px-6 py-2"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4 mb-16">
          {filteredFAQs.map((faq, index) => (
            <Card 
              key={index} 
              className="border-2 border-gray-100 hover:border-gray-200 transition-all duration-300"
            >
              <CardContent className="p-6">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-start gap-4 text-right"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <faq.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {faq.question}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {faq.category}
                        </span>
                        {openIndex === index ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {openIndex === index && (
                      <div className="mt-4 text-gray-600 leading-relaxed animate-in slide-in-from-top-2 duration-200">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">
              هنوز سوالی دارید؟
            </h3>
            <p className="text-lg text-gray-600">
              تیم پشتیبانی ما ۲۴/۷ آماده پاسخگویی به تمام سوالات شماست
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">تلفنی</h4>
                <p className="text-sm text-gray-600">۰۹۱۲۶۶۰۹۲۶۱</p>
                <p className="text-xs text-gray-500">۲۴/۷ پاسخگویی</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">چت آنلاین</h4>
                <p className="text-sm text-gray-600">همین الان</p>
                <p className="text-xs text-gray-500">کمتر از ۵ دقیقه</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">ایمیل</h4>
                <p className="text-sm text-gray-600">support@sepaad.ir</p>
                <p className="text-xs text-gray-500">حداکثر ۲ ساعت</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-semibold">
                💡 نکته: بیشتر سوالات در کمتر از ۲ دقیقه پاسخ داده میشن!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
