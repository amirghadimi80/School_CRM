'use client';

import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Shield, BookOpen, Users, Wallet } from 'lucide-react';
import { SectionHeading } from '@/components/landing/section-heading';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { landingImages } from '@/lib/landing-images';

const roles = [
  {
    id: 'admin',
    label: 'مدیر مدرسه',
    image: landingImages.roles.admin,
    title: 'کنترل کامل مدرسه از یک داشبورد',
    features: [
      'گزارش لحظه‌ای حضور و نمرات',
      'مدیریت مالی و شهریه',
      'تخصیص معلم و برنامه هفتگی',
      'دسترسی به آمار تمام کلاس‌ها',
    ],
    icon: Shield,
    color: 'from-blue-600 to-blue-700',
  },
  {
    id: 'teacher',
    label: 'معلم',
    image: landingImages.roles.teacher,
    title: 'تمرکز روی تدریس، نه کاغذبازی',
    features: [
      'ثبت سریع حضور و غیاب',
      'ورود نمرات و کارنامه',
      'مشاهده برنامه هفتگی',
      'ارتباط با اولیا',
    ],
    icon: BookOpen,
    color: 'from-violet-600 to-violet-700',
  },
  {
    id: 'student',
    label: 'دانش‌آموز',
    image: landingImages.roles.student,
    title: 'همه‌چیز در دسترس دانش‌آموز',
    features: [
      'برنامه کلاسی هفتگی',
      'کارنامه و نمرات',
      'وضعیت حضور و غیاب',
      'پیام‌های مدرسه',
    ],
    icon: Users,
    color: 'from-emerald-600 to-emerald-700',
  },
  {
    id: 'parent',
    label: 'والدین',
    image: landingImages.roles.parent,
    title: 'اطلاع از وضعیت فرزند، هر لحظه',
    features: [
      'مشاهده نمرات و کارنامه',
      'اعلان غیبت و تأخیر',
      'پیگیری شهریه',
      'پیام مستقیم با مدرسه',
    ],
    icon: Wallet,
    color: 'from-amber-600 to-amber-700',
  },
];

export function RolesShowcase() {
  return (
    <section id="roles" className="py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <SectionHeading
            badge="نقش‌ها"
            title="سپاد برای همه اعضای مدرسه"
            description="هر نقش پنل اختصاصی خود را دارد — مدیر، معلم، دانش‌آموز و والدین"
          />
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <Tabs defaultValue="admin" className="mx-auto max-w-5xl">
            <TabsList className="mb-8 grid h-auto w-full grid-cols-2 gap-2 bg-slate-100 p-1.5 md:grid-cols-4">
              {roles.map((role) => (
                <TabsTrigger
                  key={role.id}
                  value={role.id}
                  className="rounded-lg py-2.5 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  {role.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {roles.map((role) => (
              <TabsContent key={role.id} value={role.id} className="mt-0">
                <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl">
                  <div className="grid lg:grid-cols-2">
                    <div className="relative h-64 lg:h-auto lg:min-h-[380px]">
                      <Image
                        src={role.image}
                        alt={role.label}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:bg-gradient-to-l lg:from-black/40" />
                      <div className="absolute bottom-4 right-4 left-4 lg:bottom-6 lg:right-6">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-l ${role.color} px-3 py-1 text-xs font-medium text-white`}
                        >
                          <role.icon className="h-3.5 w-3.5" />
                          پنل {role.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center p-8 lg:p-10">
                      <h3 className="mb-6 text-2xl font-bold text-slate-900">{role.title}</h3>
                      <ul className="space-y-4">
                        {role.features.map((f) => (
                          <li key={f} className="flex items-center gap-3 text-slate-700">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            </span>
                            {f}
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
