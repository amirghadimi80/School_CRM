'use client';

import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PLATFORM_NAME } from '@/lib/brand';

const links = [
  { title: 'ویژگی‌ها', href: '#features' },
  { title: 'قیمت‌گذاری', href: '#pricing' },
  { title: 'سوالات', href: '#faq' },
  { title: 'درباره ما', href: '#about' },
];

export function Footer() {
  return (
    <footer id="contact" className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <img src="/images/logo.png" alt="سپاد" className="h-10 w-10 rounded-lg bg-white/10 p-1 object-contain" />
              <div>
                <p className="font-bold text-white">سپاد</p>
                <p className="text-xs text-slate-400">{PLATFORM_NAME}</p>
              </div>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              سامانه یکپارچه مدیریت مدرسه — حضور و غیاب، نمرات، برنامه درسی و امور مالی در یک
              پلتفرم.
            </p>
            <Button
              size="sm"
              className="bg-gradient-to-l from-blue-600 to-emerald-600"
              asChild
            >
              <Link href="/auth/register">
                شروع رایگان
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">دسترسی سریع</h4>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/auth/login" className="text-sm hover:text-white transition-colors">
                  ورود
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">تماس با ما</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <span>تهران، خیابان ولیعصر</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-slate-500" />
                <a href="tel:09126609261" className="hover:text-white transition-colors">
                  ۰۹۱۲۶۶۰۹۲۶۱
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-slate-500" />
                <a href="mailto:info@sepaad.ir" className="hover:text-white transition-colors">
                  info@sepaad.ir
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} سپاد — تمامی حقوق محفوظ است.</p>
          <p>ساخته شده با ❤️ برای مدارس ایران</p>
        </div>
      </div>
    </footer>
  );
}
