import { SectionHeading } from '@/components/landing/section-heading';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import {
  ClassroomScene,
  StudyScene,
  LibraryScene,
  LabScene,
  FamilyScene,
  GraduationScene,
} from '@/components/landing/visuals';
import { cn } from '@/lib/utils';

const scenes = [
  {
    caption: 'کلاس',
    alt: 'تخته، پنجره و میزهای کلاس',
    span: 'sm:col-span-2 md:col-span-2 md:row-span-2 min-h-[240px]',
    Scene: ClassroomScene,
  },
  {
    caption: 'مطالعه',
    alt: 'چراغ و کتاب روی میز',
    span: 'min-h-[180px]',
    Scene: StudyScene,
  },
  {
    caption: 'کتابخانه',
    alt: 'قفسه‌های کتاب',
    span: 'min-h-[180px]',
    Scene: LibraryScene,
  },
  {
    caption: 'آزمایشگاه رایانه',
    alt: 'ردیف مانیتور در کلاس رایانه',
    span: 'min-h-[180px]',
    Scene: LabScene,
  },
  {
    caption: 'اولیا',
    alt: 'والد و دانش‌آموز کنار کارت وضعیت',
    span: 'min-h-[180px]',
    Scene: FamilyScene,
  },
  {
    caption: 'فارغ‌التحصیلی',
    alt: 'کلاه فارغ‌التحصیلی و مدرک',
    span: 'sm:col-span-2 min-h-[180px]',
    Scene: GraduationScene,
  },
];

export function CampusLife() {
  return (
    <section className="bg-[#0c1b2a] py-20 text-white lg:py-24" aria-label="بخش‌های مدرسه">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="mb-12 max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#7eebf2]">
              <span className="h-px w-8 bg-[#14c4d4]" aria-hidden />
              زندگی مدرسه‌ای
            </p>
            <h2 className="text-3xl font-extrabold leading-[1.45] lg:text-[2.6rem]">
              هر بخش مدرسه، جای خودش را دارد
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/70 lg:text-lg">
              از کلاس و کتابخانه تا کارنامه و گفتگو با اولیا. سپاد این قطعه‌ها را جدا نگه نمی‌دارد.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:auto-rows-[190px] md:grid-cols-4 md:gap-4">
          {scenes.map((scene, i) => (
            <ScrollReveal key={scene.caption} delay={i * 70} className={cn('min-h-[180px]', scene.span)}>
              <figure className="group relative h-full overflow-hidden rounded-[24px]" aria-label={scene.alt}>
                <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                  <scene.Scene />
                </div>
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0c1b2a] via-[#0c1b2a]/70 to-transparent p-4 pt-10 text-sm font-bold text-white">
                  {scene.caption}
                </figcaption>
              </figure>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
