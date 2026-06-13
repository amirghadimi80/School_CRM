'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { PLATFORM_NAME } from '@/lib/brand';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const href = e.currentTarget.href;
    const targetId = href.replace(/.*#/, '');
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/images/logo.png" alt="سپاد" className="h-9 w-9 object-contain" />
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-900">سپاد</p>
              <p className="text-[11px] text-slate-500">{PLATFORM_NAME}</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleScroll}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" size="sm" className="text-slate-600" asChild>
              <Link href="/auth/login">ورود</Link>
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-l from-blue-600 to-blue-700 shadow-sm shadow-blue-200/50"
              asChild
            >
              <Link href="/auth/register">شروع رایگان</Link>
            </Button>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="منو"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-slate-700" />
            ) : (
              <Menu className="h-6 w-6 text-slate-700" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-slate-100 py-4 md:hidden">
            <nav className="mb-4 flex flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={handleScroll}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                  ورود
                </Link>
              </Button>
              <Button className="w-full bg-gradient-to-l from-blue-600 to-blue-700" asChild>
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
