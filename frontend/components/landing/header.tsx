'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PLATFORM_NAME } from '@/lib/brand';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const href = e.currentTarget.href;
    const targetId = href.replace(/.*#/, '');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(targetId)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const navigation = [
    { name: 'ویژگی‌ها', href: '#features' },
    { name: 'نحوه کار', href: '#demo' },
    { name: 'قیمت‌گذاری', href: '#pricing' },
    { name: 'سوالات', href: '#faq' },
    { name: 'تماس', href: '#contact' },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0c1b2a]/85 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14c4d4]">
            <Image src="/images/logo.png" alt="" width={36} height={36} className="h-9 w-9 object-contain" />
            <span className="leading-tight">
              <span className="block text-sm font-extrabold text-white">{PLATFORM_NAME}</span>
              <span className="block text-[11px] text-white/60">مدیریت مدرسه</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="اصلی">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleScroll}
                className="text-sm font-medium text-white/75 transition-colors hover:text-[#7eebf2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#14c4d4]"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white" asChild>
              <Link href="/auth/login">ورود</Link>
            </Button>
            <Button size="sm" className="bg-[#14c4d4] text-[#082028] shadow-none hover:bg-[#7eebf2]" asChild>
              <Link href="/auth/register">شروع رایگان</Link>
            </Button>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-white md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#14c4d4]"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav"
            aria-label={isMobileMenuOpen ? 'بستن منو' : 'باز کردن منو'}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div id="mobile-nav" className="border-t border-white/10 py-4 md:hidden">
            <nav className="mb-4 flex flex-col gap-1" aria-label="موبایل">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/5"
                  onClick={handleScroll}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" asChild>
                <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                  ورود
                </Link>
              </Button>
              <Button className="w-full bg-[#14c4d4] text-[#082028] hover:bg-[#7eebf2]" asChild>
                <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                  شروع رایگان
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
