import { FileX, Clock, Users, AlertTriangle } from 'lucide-react';
import { SectionHeading } from '@/components/landing/section-heading';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { ScatteredDesk } from '@/components/landing/visuals';

const painPoints = [
  {
    icon: FileX,
    title: 'پراکندگی اطلاعات',
    description: 'داده دانش‌آموز، نمره و امور مالی در فایل‌ها و سامانه‌های جدا می‌ماند و به هم وصل نیست.',
  },
  {
    icon: Clock,
    title: 'اتلاف وقت',
    description: 'حضور و غیاب، کارنامه و گزارش روزانه هنوز با دست جمع می‌شود و ساعت می‌گیرد.',
  },
  {
    icon: Users,
    title: 'خطای انسانی',
    description: 'ثبت نمره و محاسبه، وقتی خودکار نباشد، جا برای اشتباه می‌گذارد.',
  },
  {
    icon: AlertTriangle,
    title: 'دسترسی محدود',
    description: 'معلم و اولیا همان لحظه به چیزی که لازم دارند نمی‌رسند.',
  },
];

const steps = ['۰۱', '۰۲', '۰۳', '۰۴'];

export function PainPoints() {
  return (
    <section className="bg-[#f4f1ea] py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <ScrollReveal>
            <SectionHeading
              badge="چالش‌ها"
              title="وقتی مدرسه چند دفتر جدا دارد"
              description="نمره در یک فایل، حضور در دفتر دیگر، شهریه در اکسل. این پراکندگی وقت می‌گیرد و خطا می‌سازد."
              align="right"
              className="mb-8"
            />
            <ol className="space-y-3">
              {painPoints.map((point, i) => (
                <li key={point.title} className="flex gap-4 rounded-2xl border border-[#102033]/8 bg-white p-4">
                  <span className="mt-0.5 text-sm font-extrabold text-[#0c6670]">{steps[i]}</span>
                  <div>
                    <h3 className="flex items-center gap-2 font-bold text-[#102033]">
                      <point.icon className="h-4 w-4 text-[#0c6670]" aria-hidden />
                      {point.title}
                    </h3>
                    <p className="mt-1 text-sm leading-7 text-slate-600">{point.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </ScrollReveal>

          <ScrollReveal direction="left" className="lg:pt-16">
            <ScatteredDesk />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
