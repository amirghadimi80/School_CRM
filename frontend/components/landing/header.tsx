'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone, Shield } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const href = e.currentTarget.href;
    const targetId = href.replace(/.*#/, "");
    const elem = document.getElementById(targetId);
    elem?.scrollIntoView({
      behavior: 'smooth',
    });
    setIsMobileMenuOpen(false);
  };

  const navigation = [
    { name: 'ویژگی‌ها', href: '#features' },
    { name: 'قیمت‌گذاری', href: '#pricing' },
    { name: 'دمو', href: '#demo' },
    { name: 'درباره ما', href: '#about' },
    { name: 'تماس با ما', href: '#contact' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">س</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">سپاد</h1>
              <p className="text-xs text-gray-600">سامانه مدیریت مدرسه</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleScroll}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="border-green-600 text-green-600 hover:bg-green-50"
              asChild
            >
              <Link href="#demo" onClick={handleScroll}>
                مشاهده دمو
              </Link>
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              asChild
            >
              <Link href="/auth/register">
                شروع رایگان
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col gap-4 mb-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                  onClick={handleScroll}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50 w-full"
                asChild
              >
                <Link href="#demo" onClick={handleScroll}>
                  مشاهده دمو
                </Link>
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white w-full"
                asChild
              >
                <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                  شروع رایگان
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Trust Bar */}
      <div className="bg-green-50 border-t border-green-100 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-6 text-sm text-green-800">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>تضمین بازگشت پول ۳۰ روزه</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>پشتیبانی ۲۴/۷: ۰۹۱۲۶۶۰۹۲۶۱</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
