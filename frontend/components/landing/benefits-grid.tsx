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
import { cn } from '@/lib/utils';

const benefits = [
  {
    icon: Clock,
    title: 'وقت اداری کمتر',
    description: 'حضور، کارنامه و گزارش روزانه را از بین چند فایل جمع نمی‌کنید.',
    span: 'md:col-span-2 md:row-span-2',
    featured: true,
  },
  {
    icon: BarChart3,
    title: 'گزارش دم‌دست',
    description: 'آمار کلاس را همان روز می‌بینید، نه آخر ماه.',
  },
  {
    icon: Calendar,
    title: 'تقویم فارسی',
    description: 'تاریخ‌ها با تقویم رسمی ایران ثبت می‌شود.',
  },
  {
    icon: DollarSign,
    title: 'شهریه',
    description: 'پرداخت، بدهی و تسویه در همان سامانه می‌ماند.',
  },
  {
    icon: Smartphone,
    title: 'موبایل و دسکتاپ',
    description: 'از مرورگر گوشی، تبلت و رایانه وارد می‌شوید.',
  },
  {
    icon: Shield,
    title: 'دقت ثبت',
    description: 'گردش مشخص، جای حساب‌کتاب پراکنده را می‌گیرد.',
  },
  {
    icon: Users,
    title: 'اولیا در جریان',
    description: 'نمره و غیبت را بدون تماس مکرر پیگیری می‌کنند.',
  },
  {
    icon: TrendingUp,
    title: 'کار تیم مدرسه',
    description: 'مدیر، معاون و معلم روی یک تصویر مشترک کار می‌کنند.',
    span: 'md:col-span-2',
  },
];

const heat = [3, 4, 2, 5, 4, 3, 5, 4, 5, 2, 4, 3, 5, 4];

export function BenefitsGrid() {
  return (
    <section id="features" className="scroll-mt-24 bg-[#f4f1ea] py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <SectionHeading
            badge="امکانات"
            title="ابزار کار روزانه مدرسه"
            description="از ثبت‌نام و حضور تا کارنامه و شهریه، همان کارهایی که هر هفته تکرار می‌شود."
          />
        </ScrollReveal>

        <div className="grid gap-4 md:grid-cols-4">
          {benefits.map((benefit, i) => (
            <ScrollReveal key={benefit.title} delay={i * 40} className={benefit.span}>
              <article
                className={cn(
                  'flex h-full flex-col rounded-[24px] border border-[#102033]/10 bg-white p-5 transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
                  benefit.featured && 'bg-[#102033] text-white'
                )}
              >
                <span
                  className={cn(
                    'mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl',
                    benefit.featured ? 'bg-[#14c4d4] text-[#082028]' : 'bg-[#e7f4f3] text-[#0c6670]'
                  )}
                >
                  <benefit.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className={cn('font-extrabold', benefit.featured ? 'text-2xl leading-snug' : 'text-base')}>
                  {benefit.title}
                </h3>
                <p className={cn('mt-2 text-sm leading-7', benefit.featured ? 'text-white/75' : 'text-slate-600')}>
                  {benefit.description}
                </p>
                {benefit.featured && (
                  <div className="mt-6" aria-hidden>
                    <p className="mb-2 text-xs text-white/50">نمونه تراکم حضور دو هفته</p>
                    <div className="grid grid-cols-7 gap-1.5">
                      {heat.map((level, index) => (
                        <span
                          key={index}
                          className="aspect-square rounded-md"
                          style={{ background: `rgba(20, 196, 212, ${0.25 + level * 0.15})` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
