import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PLATFORM_NAME } from '@/lib/brand';

const links = [
  { title: 'ویژگی‌ها', href: '#features' },
  { title: 'قیمت‌گذاری', href: '#pricing' },
  { title: 'سوالات', href: '#faq' },
  { title: 'درباره سامانه', href: '#about' },
];

export function Footer() {
  return (
    <footer id="contact" className="scroll-mt-24 bg-[#08141f] text-slate-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-5 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image src="/images/logo.png" alt="" width={44} height={44} className="h-11 w-11 rounded-xl bg-white/10 object-contain p-1" />
              <span>
                <span className="block font-extrabold text-white">{PLATFORM_NAME}</span>
                <span className="block text-xs text-slate-400">سامانه مدیریت مدرسه</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-8 text-slate-400">
              حضور و غیاب، نمرات، برنامه درسی و امور مالی در یک سامانه برای مدیر، معلم، دانش‌آموز و اولیا.
            </p>
            <Button size="sm" className="bg-[#14c4d4] text-[#082028] hover:bg-[#7eebf2]" asChild>
              <Link href="/auth/register">
                شروع رایگان
                <ArrowLeft className="ms-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div>
            <p className="mb-4 text-sm font-bold text-white">دسترسی</p>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white">
                    {link.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/auth/login" className="text-sm hover:text-white">
                  ورود
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-sm hover:text-white">
                  ثبت‌نام
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-sm font-bold text-white">تماس</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#14c4d4]" aria-hidden />
                <span>تهران، خیابان ولیعصر</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[#14c4d4]" aria-hidden />
                <a href="tel:09126609261" className="hover:text-white">
                  ۰۹۱۲۶۶۰۹۲۶۱
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[#14c4d4]" aria-hidden />
                <a href="mailto:info@sepaad.ir" dir="ltr" className="hover:text-white">
                  info@sepaad.ir
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} سپاد. همه حقوق محفوظ است.</p>
          <p>ساخته‌شده برای مدارس ایران</p>
        </div>
      </div>
    </footer>
  );
}
