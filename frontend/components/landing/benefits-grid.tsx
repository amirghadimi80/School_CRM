'use client';

import {
  Clock,
  TrendingUp,
  Users,
  Shield,
  Smartphone,
  BarChart3,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { SectionHeading } from '@/components/landing/section-heading';
import { ScrollReveal } from '@/components/landing/scroll-reveal';

const benefits = [
  {
    icon: Clock,
    title: 'صرفه‌جویی زمانی',
    description: 'کاهش زمان فرآیندهای اداری و گزارش‌گیری',
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    icon: TrendingUp,
    title: 'افزایش کارایی',
    description: 'بهبود بهره‌وری تیم مدیریتی و آموزشی',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    icon: Users,
    title: 'رضایت ذی‌نفعان',
    description: 'ارتباط بهتر با والدین و دانش‌آموزان',
    color: 'text-violet-600 bg-violet-50',
  },
  {
    icon: Shield,
    title: 'دقت اطلاعات',
    description: 'کاهش خطا در ثبت و پردازش داده‌ها',
    color: 'text-red-600 bg-red-50',
  },
  {
    icon: Smartphone,
    title: 'دسترسی همه‌جا',
    description: 'مدیریت از موبایل، تبلت و دسکتاپ',
    color: 'text-amber-600 bg-amber-50',
  },
  {
    icon: BarChart3,
    title: 'گزارش‌دهی آنی',
    description: 'دسترسی سریع به آمار و تحلیل‌ها',
    color: 'text-indigo-600 bg-indigo-50',
  },
  {
    icon: Calendar,
    title: 'تقویم فارسی',
    description: 'سازگار با تقویم رسمی ایران',
    color: 'text-teal-600 bg-teal-50',
  },
  {
    icon: DollarSign,
    title: 'مدیریت مالی',
    description: 'کنترل شهریه، پرداخت‌ها و بدهی‌ها',
    color: 'text-emerald-600 bg-emerald-50',
  },
];

export function BenefitsGrid() {
  return (
    <section id="features" className="bg-slate-50 py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <SectionHeading
            badge="امکانات"
            title="هر آنچه یک مدرسه نیاز دارد"
            description="ابزارهای کامل برای مدیریت روزانه مدرسه، از ثبت‌نام تا کارنامه"
          />
        </ScrollReveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <ScrollReveal key={b.title} delay={i * 60}>
              <div className="group h-full rounded-2xl border border-slate-200/80 bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/50">
                <div className={`mb-4 inline-flex rounded-xl p-3 ${b.color} transition-transform group-hover:scale-110`}>
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1.5 font-bold text-slate-900">{b.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{b.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
