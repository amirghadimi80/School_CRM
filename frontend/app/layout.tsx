import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'سپاد - سامانه یکپارچه مدیریت مدرسه | تریال رایگان ۷ روزه',
  description: 'با سپاد مدیریت مدرسه رو هوشمند کن! صرفه‌جویی ۱۰ ساعتی در هفته، حذف خطای انسانی، گزارش‌گیری آنی. ۷ روز استفاده کامل رایگان + تضمین بازگشت پول. بیش از ۵۰ مدرسه ایرانی به ما اعتماد کردن.',
  keywords: ['مدیریت مدرسه', 'سامانه مدرسه', 'نرم افزار مدرسه', 'حضور و غیاب', 'نمرات دانش آموزان', 'مدیریت مالی مدرسه', 'سپاد', 'School CRM', 'نرم افزار آموزشی'],
  authors: [{ name: 'سپاد' }],
  openGraph: {
    title: 'سپاد - سامانه یکپارچه مدیریت مدرسه',
    description: 'با سپاد مدیریت مدرسه رو هوشمند کن! صرفه‌جویی ۱۰ ساعتی در هفته، حذف خطای انسانی، گزارش‌گیری آنی. ۷ روز استفاده کامل رایگان.',
    url: 'https://sepaad.ir',
    siteName: 'سپاد',
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'سپاد - سامانه یکپارچه مدیریت مدرسه',
    description: 'با سپاد مدیریت مدرسه رو هوشمند کن! ۷ روز استفاده کامل رایگان.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html dir="rtl" lang="fa" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-vazirmatn antialiased">
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
