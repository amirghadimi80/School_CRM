import { Star, Users, TrendingUp, Award, Shield } from 'lucide-react';
import { SectionHeading } from '@/components/landing/section-heading';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    name: 'مریم احمدی',
    role: 'مدیر مدرسه فرزانگان',
    content:
      'قبل از سپاد هر روز ساعت‌ها برای گزارش‌گیری وقت می‌گذاشتم. الان همه‌چیز در چند دقیقه انجام می‌شود.',
    mark: 'م',
    tone: 'bg-[#14c4d4] text-[#082028]',
  },
  {
    name: 'رضا محمدی',
    role: 'مدیر آموزشگاه پارس',
    content:
      'شفافیت مالی و ارتباط با اولیا خیلی بهتر شده. والدین از دسترسی آنلاین به نمرات راضی‌اند.',
    mark: 'ر',
    tone: 'bg-[#243eae] text-white',
  },
  {
    name: 'سارا قاسمی',
    role: 'معاون دبیرستان آینده',
    content:
      'خطای انسانی در ثبت نمرات تقریباً صفر شده و معلمان حضور و غیاب را خیلی سریع‌تر ثبت می‌کنند.',
    mark: 'س',
    tone: 'bg-[#f5c451] text-[#082028]',
  },
];

const stats = [
  { icon: Users, value: '۵۰+', label: 'مدرسه فعال' },
  { icon: TrendingUp, value: '+۱۰ هزار', label: 'دانش‌آموز' },
  { icon: Award, value: '۹۸٪', label: 'رضایت' },
  { icon: Star, value: '۴٫۹', label: 'امتیاز کاربران' },
];

export function SocialProof() {
  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <SectionHeading
            badge="اعتماد"
            title="مدارس، سپاد را در کار روزانه گذاشته‌اند"
            description="آنچه مدیران و معاونان بعد از کنار گذاشتن فایل‌های جدا گفته‌اند."
          />
        </ScrollReveal>

        <div className="mb-12 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 60}>
              <div className="rounded-[24px] bg-[#102033] px-4 py-6 text-white">
                <stat.icon className="mb-4 h-5 w-5 text-[#14c4d4]" aria-hidden />
                <p className="text-3xl font-extrabold">{stat.value}</p>
                <p className="mt-1 text-sm text-white/60">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item, i) => (
            <ScrollReveal key={item.name} delay={i * 80}>
              <figure className="flex h-full flex-col rounded-[24px] border border-[#102033]/10 bg-[#f7f4ee] p-6">
                <div className="mb-4 flex gap-0.5" aria-hidden>
                  {Array.from({ length: 5 }).map((_, star) => (
                    <Star key={star} className="h-3.5 w-3.5 fill-[#f5c451] text-[#f5c451]" />
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-8 text-[#102033]">
                  <span className="ms-1 text-3xl font-extrabold leading-none text-[#14c4d4]" aria-hidden>
                    «
                  </span>
                  {item.content}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-[#102033]/10 pt-4">
                  <span
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-full text-base font-extrabold',
                      item.tone
                    )}
                    aria-hidden
                  >
                    {item.mark}
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-[#102033]">{item.name}</span>
                    <span className="block text-xs text-slate-500">{item.role}</span>
                  </span>
                </figcaption>
              </figure>
            </ScrollReveal>
          ))}
        </div>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
          {[
            { label: 'رمزنگاری SSL' },
            { label: 'سرورهای ایران' },
            { label: 'پشتیبانی فارسی' },
          ].map((item) => (
            <li key={item.label} className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#0c6670]" aria-hidden />
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
