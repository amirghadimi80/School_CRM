'use client';

import Image from 'next/image';
import { SectionHeading } from '@/components/landing/section-heading';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { landingImages } from '@/lib/landing-images';

const photos = [
  {
    src: landingImages.campus.group,
    alt: 'دانش‌آموزان در کلاس',
    span: 'col-span-2 row-span-2',
    caption: 'یادگیری تعاملی',
  },
  {
    src: landingImages.campus.studying,
    alt: 'دانش‌آموز در حال مطالعه',
    span: 'col-span-1 row-span-1',
    caption: 'پیگیری تحصیلی',
  },
  {
    src: landingImages.campus.library,
    alt: 'محیط مدرسه',
    span: 'col-span-1 row-span-1',
    caption: 'فضای آموزشی',
  },
  {
    src: landingImages.campus.computer,
    alt: 'کلاس کامپیوتر',
    span: 'col-span-1 row-span-1',
    caption: 'فناوری در آموزش',
  },
  {
    src: landingImages.campus.parent,
    alt: 'والد و فرزند',
    span: 'col-span-1 row-span-1',
    caption: 'مشارکت اولیا',
  },
  {
    src: landingImages.campus.graduation,
    alt: 'فارغ‌التحصیلی',
    span: 'col-span-2 row-span-1',
    caption: 'مسیر موفقیت',
  },
];

export function CampusLife() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <SectionHeading
            badge="زندگی مدرسه‌ای"
            title="محیطی که سپاد آن را بهتر می‌کند"
            description="از کلاس درس تا ارتباط با اولیا — همه‌چیز با تصویر و شفافیت"
          />
        </ScrollReveal>

        <div className="grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[200px] md:grid-cols-4 md:gap-4">
          {photos.map((photo, i) => (
            <ScrollReveal
              key={photo.alt}
              delay={i * 80}
              className={`group relative overflow-hidden rounded-2xl ${photo.span}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
              <div className="absolute bottom-0 right-0 left-0 p-4">
                <p className="text-sm font-semibold text-white">{photo.caption}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
