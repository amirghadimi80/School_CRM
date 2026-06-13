'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
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

  const navLinkClass = (isActive: boolean) =>
    cn('sidebar-nav-link', isActive && 'sidebar-nav-link-active');

  return (
    <div className="platform-shell flex">
      <aside className="platform-sidebar fixed right-0 top-0 bottom-0 z-40 hidden w-64 flex-col lg:flex">
        <div className="border-b border-sidebar-border/60 p-4">
          <PlatformBrand schoolName={schoolName} />
          <p className="mt-2 truncate text-xs text-muted-foreground">{studentName}</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={navLinkClass(isActive)}>
                <Icon className="h-5 w-5 shrink-0" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border/60 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="ml-2 h-5 w-5" />
            خروج
          </Button>
        </div>
      </aside>

      <div className="platform-header fixed left-0 right-0 top-0 z-50 px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between">
          <PlatformBrand schoolName={schoolName} titleClassName="text-xs" />
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {isMobileMenuOpen && (
          <nav className="mt-4 space-y-1 border-t border-border/60 pt-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={navLinkClass(isActive)}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              className="mt-4 w-full justify-start rounded-xl text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="ml-2 h-5 w-5" />
              خروج
            </Button>
          </nav>
        )}
      </div>

      <main className="min-h-screen flex-1 lg:mr-64">
        <div className="p-4 pt-20 lg:p-8 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
