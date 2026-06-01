'use client';

import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  ArrowRight,
  Shield,
  Clock,
  Users
} from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const quickLinks = [
    { title: "ویژگی‌ها", href: "#features" },
    { title: "قیمت‌گذاری", href: "#pricing" },
    { title: "دمو", href: "#demo" },
    { title: "درباره ما", href: "#about" },
    { title: "وبلاگ", href: "#blog" },
    { title: "تماس با ما", href: "#contact" }
  ];

  const supportLinks = [
    { title: "مرکز کمک", href: "#help" },
    { title: "مستندات", href: "#docs" },
    { title: "آموزش ویدیویی", href: "#videos" },
    { title: "پشتیبانی", href: "#support" },
    { title: "نظرات مشتریان", href: "#reviews" },
    { title: "سوالات متداول", href: "#faq" }
  ];

  const legalLinks = [
    { title: "شرایط استفاده", href: "#terms" },
    { title: "حریم خصوصی", href: "#privacy" },
    { title: "قوانین و مقررات", href: "#legal" },
    { title: "سیاست بازگشت پول", href: "#refund" },
    { title: "GDPR", href: "#gdpr" },
    { title: "امنیت", href: "#security" }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">س</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">سپاد</h3>
                <p className="text-gray-400 text-sm">سامانه یکپارچه مدیریت مدرسه</p>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed max-w-md">
              سپاد پلتفرم هوشمند مدیریت مدرسه است که به مدیران کمک می‌کنه با صرفه‌جویی زمان و هزینه، بهترین نتیجه رو بگیرن.
            </p>

            {/* Trust Badges */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="h-4 w-4 text-green-400" />
                <span>امنیت کامل</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="h-4 w-4 text-blue-400" />
                <span>پشتیبانی ۲۴/۷</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users className="h-4 w-4 text-purple-400" />
                <span>۵۰+ مدرسه</span>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-4 max-w-sm">
              <h4 className="font-semibold mb-2">شروع کن همین امروز!</h4>
              <p className="text-sm text-white/80 mb-3">۷ روز استفاده کامل رایگان</p>
              <Button
                size="sm"
                className="bg-white text-gray-900 hover:bg-gray-100 w-full"
                asChild
              >
                <Link href="/auth/register">
                  شروع رایگان
                  <ArrowRight className="h-4 w-4 mr-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">دسترسی سریع</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">پشتیبانی</h4>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">تماس با ما</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-300">تهران، خیابان ولیعصر</p>
                  <p className="text-gray-300 text-sm">پلاک ۱۲۳، طبقه ۴</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <a 
                  href="tel:09126609261" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  ۰۹۱۲۶۶۰۹۲۶۱
                </a>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <a 
                  href="mailto:info@sepaad.ir" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  info@sepaad.ir
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6">
              <h5 className="text-sm font-semibold mb-3 text-gray-400">ما را دنبال کنید</h5>
              <div className="flex gap-3">
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © ۱۴۰۳ سپاد. تمام حقوق محفوظ است.
            </div>
            
            <div className="flex flex-wrap gap-6">
              {legalLinks.map((link, index) => (
                <Link 
                  key={index}
                  href={link.href}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trust Seal */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center">
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>🇮🇷 ساخته شده در ایران</span>
              <span>🔐 SSL Security</span>
              <span>📱 اپلیکیشن موبایل</span>
              <span>🌐 پشتیبانی فارسی</span>
            </div>
            <div className="text-sm text-gray-400">
              قدرت گرفته از ❤️ برای مدارس ایران
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
