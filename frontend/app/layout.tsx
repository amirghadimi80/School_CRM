import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'سیستم مدیریت مدرسه | School CRM',
  description: 'سیستم جامع مدیریت مدرسه با پشتیبانی از زبان فارسی',
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
