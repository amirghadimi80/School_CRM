import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'سپاد - سامانه یکپارچه مدیریت مدرسه | تریال رایگان ۷ روزه',
  description:
    'حضور و غیاب، نمرات، برنامه درسی و امور مالی مدرسه در یک سامانه. صرفه‌جویی ۱۰ ساعت در هفته، گزارش لحظه‌ای و ۷ روز استفاده رایگان. بیش از ۵۰ مدرسه.',
  keywords: ['مدیریت مدرسه', 'سامانه مدرسه', 'نرم افزار مدرسه', 'حضور و غیاب', 'نمرات دانش آموزان', 'مدیریت مالی مدرسه', 'سپاد', 'School CRM', 'نرم افزار آموزشی'],
  authors: [{ name: 'سپاد' }],
  openGraph: {
    title: 'سپاد - سامانه یکپارچه مدیریت مدرسه',
    description:
      'حضور و غیاب، نمرات و امور مالی مدرسه در یک سامانه. ۷ روز استفاده رایگان و گزارش لحظه‌ای.',
    url: 'https://sepaad.ir',
    siteName: 'سپاد',
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'سپاد - سامانه یکپارچه مدیریت مدرسه',
    description: 'حضور و غیاب، نمرات و امور مالی مدرسه در یک سامانه. ۷ روز استفاده رایگان.',
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
      <head>
        <link
          rel="preload"
          href="/fonts/Vazirmatn-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Vazirmatn-ExtraBold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-background font-vazirmatn antialiased">
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
