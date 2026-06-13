'use client';

import { GraduationCap } from 'lucide-react';

const schools = [
  'دبیرستان فرزانگان',
  'مدرسه نور',
  'آموزشگاه پارس',
  'دبستان آینده',
  'هنرستان سپهر',
  'مدرسه رشد',
  'دبیرستان دانش',
  'آموزشگاه مهر',
];

export function SchoolsMarquee() {
  const items = [...schools, ...schools];

  return (
    <section className="overflow-hidden border-y border-slate-200/80 bg-slate-50 py-5">
      <div className="container mx-auto mb-3 px-4">
        <p className="text-center text-xs font-medium text-slate-500">
          بیش از ۵۰ مدرسه به سپاد اعتماد کرده‌اند
        </p>
      </div>
      <div className="relative flex overflow-hidden">
        <div className="animate-marquee flex shrink-0 items-center gap-10">
          {items.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 shadow-sm"
            >
              <GraduationCap className="h-4 w-4 text-blue-600" />
              <span className="whitespace-nowrap text-sm font-medium text-slate-700">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
