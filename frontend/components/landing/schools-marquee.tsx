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
    <section className="border-y border-[#102033]/10 bg-[#f4f1ea] py-6" aria-label="مدارس">
      <p className="mb-4 text-center text-xs font-semibold text-[#0c6670]">
        بیش از ۵۰ مدرسه به سپاد اعتماد کرده‌اند
      </p>

      <ul className="hidden flex-wrap justify-center gap-2 px-4 motion-reduce:flex">
        {schools.map((name) => (
          <li
            key={name}
            className="flex items-center gap-2 rounded-full border border-[#102033]/10 bg-white px-4 py-1.5 text-sm font-medium text-[#102033]"
          >
            <GraduationCap className="h-4 w-4 text-[#0c6670]" aria-hidden />
            {name}
          </li>
        ))}
      </ul>

      <div
        dir="ltr"
        className="relative w-full max-w-full overflow-hidden motion-reduce:hidden [contain:inline-size]"
        aria-hidden
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#f4f1ea] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#f4f1ea] to-transparent" />
        <div className="animate-marquee flex w-max gap-3 hover:[animation-play-state:paused]">
          {items.map((name, i) => (
            <div
              key={`${name}-${i}`}
              dir="rtl"
              className="flex shrink-0 items-center gap-2 rounded-full border border-[#102033]/10 bg-white px-4 py-1.5 shadow-sm"
            >
              <GraduationCap className="h-4 w-4 text-[#0c6670]" />
              <span className="whitespace-nowrap text-sm font-medium text-[#102033]">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
