'use client';

import { useState } from 'react';
import { ChevronDown, Shield, Clock, Users, Database, Smartphone, HelpCircle, Phone } from 'lucide-react';
import { SectionHeading } from '@/components/landing/section-heading';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'آیا داده‌های مدرسه امن است؟',
    answer:
      'بله. داده‌ها با رمزنگاری AES-256 محافظت می‌شوند و روی سرورهای امن نگهداری می‌شوند. سطوح دسترسی برای هر نقش جداگانه تعریف شده است.',
    icon: Shield,
  },
  {
    question: 'آیا می‌توانم داده‌ها را خارج کنم؟',
    answer:
      'بله. هر زمان می‌توانید اطلاعات را در فرمت Excel، CSV یا PDF دریافت کنید. داده‌ها متعلق به شماست.',
    icon: Database,
  },
  {
    question: 'راه‌اندازی چقدر طول می‌کشد؟',
    answer:
      'ثبت‌نام و تنظیمات اولیه کمتر از یک ساعت زمان می‌برد. تیم پشتیبانی در تمام مراحل همراه شماست.',
    icon: Clock,
  },
  {
    question: 'برای مدرسه کوچک هم مناسب است؟',
    answer:
      'بله. پلن‌های مختلف برای هر اندازه مدرسه وجود دارد. دوره ۷ روزه رایگان به شما امکان می‌دهد قبل از خرید تست کنید.',
    icon: Users,
  },
  {
    question: 'اپلیکیشن موبایل دارید؟',
    answer:
      'بله. از طریق مرورگر موبایل تمام بخش‌ها در دسترس است. معلمان حضور و غیاب ثبت می‌کنند و اولیا نمرات را می‌بینند.',
    icon: Smartphone,
  },
  {
    question: 'پشتیبانی چگونه است؟',
    answer:
      'پشتیبانی تلفنی، ایمیل و چت آنلاین. پلن‌های بالاتر پشتیبانی ۲۴ ساعته دارند. معمولاً کمتر از ۵ دقیقه پاسخ می‌دهیم.',
    icon: HelpCircle,
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-slate-50 py-24">
      <div className="container mx-auto px-4">
        <SectionHeading
          badge="سوالات"
          title="پرسش‌های متداول"
          description="پاسخ سوالات رایج درباره سپاد"
        />

        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center gap-4 p-5 text-right"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <faq.icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="flex-1 font-semibold text-slate-900">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 shrink-0 text-slate-400 transition-transform',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 px-5 pb-5 pt-0">
                    <p className="pr-14 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-blue-100 bg-blue-50/50 p-6 text-center">
          <Phone className="mx-auto mb-2 h-5 w-5 text-blue-600" />
          <p className="font-semibold text-slate-900">سوال دیگری دارید؟</p>
          <p className="mt-1 text-sm text-slate-600">
            با ما تماس بگیرید:{' '}
            <a href="tel:09126609261" className="font-medium text-blue-600 hover:underline">
              ۰۹۱۲۶۶۰۹۲۶۱
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
