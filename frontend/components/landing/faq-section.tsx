'use client';

import { useState } from 'react';
import { ChevronDown, Shield, Clock, Users, Database, Smartphone, HelpCircle, Phone } from 'lucide-react';
import { SectionHeading } from '@/components/landing/section-heading';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'داده‌های مدرسه امن می‌ماند؟',
    answer: (
      <>
        دسترسی هر نقش جداست. داده‌ها با رمزنگاری <bdi>AES-256</bdi> نگهداری می‌شوند و فقط افراد مجاز همان
        مدرسه آن‌ها را می‌بینند.
      </>
    ),
    icon: Shield,
  },
  {
    question: 'می‌توانم داده‌ها را خارج کنم؟',
    answer: (
      <>
        بله. خروجی را در قالب اکسل، <bdi>CSV</bdi> یا <bdi>PDF</bdi> می‌گیرید. داده متعلق به مدرسه است.
      </>
    ),
    icon: Database,
  },
  {
    question: 'راه‌اندازی چقدر طول می‌کشد؟',
    answer: 'ثبت‌نام و تنظیم اولیه معمولاً کمتر از یک ساعت است. پشتیبانی در همین مسیر کنار شماست.',
    icon: Clock,
  },
  {
    question: 'برای مدرسه کوچک هم مناسب است؟',
    answer: 'پلن‌ها بر اساس تعداد دانش‌آموز جدا شده‌اند. هفت روز رایگان دارید تا قبل از خرید امتحان کنید.',
    icon: Users,
  },
  {
    question: 'اپلیکیشن جدا دارید؟',
    answer: 'نسخه جدا در فروشگاه نیست. از مرورگر گوشی به همان سامانه وارد می‌شوید؛ حضور، نمره و پیام همان‌جا هست.',
    icon: Smartphone,
  },
  {
    question: 'پشتیبانی چطور است؟',
    answer: 'تلفن، ایمیل و گفتگوی آنلاین. پلن‌های بالاتر پشتیبانی ۲۴ ساعته دارند.',
    icon: HelpCircle,
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 bg-white py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <SectionHeading
          badge="سوالات"
          title="پرسش‌هایی که قبل از ثبت‌نام می‌پرسند"
          description="اگر جوابتان این‌جا نیست، همان شماره تماس پایین صفحه باز است."
        />

        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;
            return (
              <div key={faq.question} className="overflow-hidden rounded-[20px] border border-[#102033]/10 bg-[#f7f4ee]">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center gap-4 p-5 text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0c6670]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#102033] text-[#14c4d4]">
                      <faq.icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="flex-1 font-bold text-[#102033]">{faq.question}</span>
                    <ChevronDown
                      className={cn('h-5 w-5 shrink-0 text-slate-400 transition-transform motion-reduce:transition-none', isOpen && 'rotate-180')}
                      aria-hidden
                    />
                  </button>
                </h3>
                {isOpen && (
                  <div id={panelId} role="region" aria-labelledby={buttonId} className="px-5 pb-5 ps-16">
                    <p className="text-sm leading-8 text-slate-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-10 max-w-md rounded-[24px] bg-[#102033] p-6 text-center text-white">
          <Phone className="mx-auto mb-2 h-5 w-5 text-[#14c4d4]" aria-hidden />
          <p className="font-bold">سوال دیگری دارید؟</p>
          <p className="mt-1 text-sm text-white/70">
            تماس:{' '}
            <a href="tel:09126609261" className="font-semibold text-[#7eebf2] underline-offset-4 hover:underline">
              ۰۹۱۲۶۶۰۹۲۶۱
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
