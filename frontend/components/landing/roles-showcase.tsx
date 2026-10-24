'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Shield, BookOpen, Users, Wallet } from 'lucide-react';
import { SectionHeading } from '@/components/landing/section-heading';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { RoleStage } from '@/components/landing/visuals';

const roles = [
  {
    id: 'admin' as const,
    label: 'مدیر مدرسه',
    title: 'کنترل مدرسه از یک داشبورد',
    features: [
      'گزارش لحظه‌ای حضور و نمرات',
      'مدیریت مالی و شهریه',
      'تخصیص معلم و برنامه هفتگی',
      'آمار همه کلاس‌ها',
    ],
    icon: Shield,
  },
  {
    id: 'teacher' as const,
    label: 'معلم',
    title: 'وقت تدریس، نه کاغذبازی',
    features: [
      'ثبت سریع حضور و غیاب',
      'ورود نمرات و کارنامه',
      'مشاهده برنامه هفتگی',
      'ارتباط با اولیا',
    ],
    icon: BookOpen,
  },
  {
    id: 'student' as const,
    label: 'دانش‌آموز',
    title: 'برنامه، نمره و پیام در دسترس',
    features: [
      'برنامه کلاسی هفتگی',
      'کارنامه و نمرات',
      'وضعیت حضور و غیاب',
      'پیام‌های مدرسه',
    ],
    icon: Users,
  },
  {
    id: 'parent' as const,
    label: 'والدین',
    title: 'وضعیت فرزند، بدون پیگیری تلفنی',
    features: [
      'مشاهده نمرات و کارنامه',
      'اعلان غیبت و تأخیر',
      'پیگیری شهریه',
      'پیام مستقیم با مدرسه',
    ],
    icon: Wallet,
  },
];

export function RolesShowcase() {
  return (
    <section id="roles" className="scroll-mt-24 bg-[#e9e3d6] py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <SectionHeading
            badge="نقش‌ها"
            title="برای هر کس در مدرسه، یک پنل"
            description="مدیر، معلم، دانش‌آموز و والدین هر کدام همان چیزی را می‌بینند که به کارشان می‌آید."
          />
        </ScrollReveal>

        <ScrollReveal>
          <Tabs defaultValue="admin" className="mx-auto max-w-5xl">
            <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-2 bg-[#102033]/5 p-1.5 md:grid-cols-4">
              {roles.map((role) => (
                <TabsTrigger
                  key={role.id}
                  value={role.id}
                  className="rounded-xl py-2.5 text-sm data-[state=active]:bg-[#102033] data-[state=active]:text-white"
                >
                  {role.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {roles.map((role) => (
              <TabsContent key={role.id} value={role.id} className="mt-0">
                <div className="overflow-hidden rounded-[28px] border border-[#102033]/10 bg-white shadow-[0_24px_60px_-30px_rgba(16,32,51,0.45)]">
                  <div className="grid lg:grid-cols-2">
                    <div className="min-h-[320px] border-b border-[#102033]/10 lg:border-b-0 lg:border-e">
                      <p className="sr-only">نمونه تصویری پنل {role.label}</p>
                      <RoleStage role={role.id} />
                    </div>
                    <div className="flex flex-col justify-center p-7 lg:p-10">
                      <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#102033] px-3 py-1 text-xs font-medium text-white">
                        <role.icon className="h-3.5 w-3.5 text-[#14c4d4]" aria-hidden />
                        پنل {role.label}
                      </span>
                      <h3 className="mb-6 text-2xl font-extrabold leading-snug text-[#102033]">{role.title}</h3>
                      <ul className="space-y-3">
                        {role.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-3 text-[#102033]">
                            <CheckCircle className="h-4 w-4 shrink-0 text-[#0c6670]" aria-hidden />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </ScrollReveal>
      </div>
    </section>
  );
}
