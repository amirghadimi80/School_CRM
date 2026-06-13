'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlatformBrand } from '@/components/layout/platform-brand';
import { useSessionInfo } from '@/hooks/use-session-info';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  ClipboardList,
  Wallet,
  MessageSquare,
  User,
  LogOut,
  Menu,
} from 'lucide-react';

const sidebarItems = [
  { name: 'داشبورد', href: '/student/dashboard', icon: LayoutDashboard },
  { name: 'برنامه هفتگی', href: '/student/schedule', icon: Calendar },
  { name: 'کارنامه', href: '/student/grades', icon: BookOpen },
  { name: 'حضور و غیاب', href: '/student/attendance', icon: ClipboardList },
  { name: 'وضعیت مالی', href: '/student/finance', icon: Wallet },
  { name: 'پیام‌ها', href: '/student/messages', icon: MessageSquare },
  { name: 'پروفایل', href: '/student/profile', icon: User },
];

interface StudentLayoutProps {
  children: React.ReactNode;
}

export function StudentLayout({ children }: StudentLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [studentName, setStudentName] = useState('دانش‌آموز');
  const { schoolName } = useSessionInfo();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.role !== 'student') {
        router.push('/dashboard');
        return;
      }
      setStudentName(userData.full_name || 'دانش‌آموز');
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('school_id');
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-l border-gray-200 fixed right-0 top-0 bottom-0 z-40">
        <div className="border-b border-gray-200 p-4">
          <PlatformBrand schoolName={schoolName} />
          <p className="mt-2 truncate text-xs text-gray-500">{studentName}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 ml-2" />
            خروج
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <PlatformBrand schoolName={schoolName} titleClassName="text-xs" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {isMobileMenuOpen && (
          <nav className="mt-4 space-y-1 border-t border-gray-100 pt-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                    isActive
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 mt-4"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 ml-2" />
              خروج
            </Button>
          </nav>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:mr-64 min-h-screen">
        <div className="p-4 lg:p-8 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
