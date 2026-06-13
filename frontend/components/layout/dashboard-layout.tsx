'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PlatformBrand } from '@/components/layout/platform-brand';
import { useSessionInfo } from '@/hooks/use-session-info';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Wallet,
  BarChart3,
  Settings,
  Bell,
  Menu,
  LogOut,
  ChevronLeft,
  BookText,
  Clock,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  { name: 'داشبورد', href: '/dashboard', icon: LayoutDashboard },
  { name: 'دانش‌آموزان', href: '/students', icon: Users },
  { name: 'معلمان', href: '/teachers', icon: GraduationCap },
  { name: 'کلاس‌ها', href: '/classes', icon: BookOpen },
  { name: 'حضور و غیاب', href: '/attendance', icon: Calendar },
  { name: 'نمرات', href: '/grades', icon: BarChart3 },
  { name: 'مالی', href: '/finance', icon: Wallet },
  { name: 'برنامه درسی', href: '/curriculum', icon: BookText },
  { name: 'برنامه هفتگی', href: '/schedules', icon: Clock },
  { name: 'تنظیمات پایه', href: '/settings', icon: Settings },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userName, schoolName, roleDisplay, userInitial } = useSessionInfo();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('school_id');
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 right-0 z-50 hidden w-64 border-l bg-card lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex min-h-16 items-center border-b px-4 py-3">
            <Link href="/dashboard" className="min-w-0">
              <PlatformBrand schoolName={schoolName} />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="ml-2 h-5 w-5" />
              خروج
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card px-4 lg:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 p-0">
            <div className="flex h-full flex-col">
              <div className="flex min-h-16 items-center border-b px-4 py-3">
                <PlatformBrand schoolName={schoolName} />
              </div>
              <nav className="flex-1 space-y-1 p-4">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t p-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground"
                  onClick={handleLogout}
                >
                  <LogOut className="ml-2 h-5 w-5" />
                  خروج
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/dashboard" className="min-w-0">
          <PlatformBrand schoolName={schoolName} titleClassName="text-xs" />
        </Link>

        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="lg:mr-64">
        {/* Desktop Header */}
        <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b bg-card px-6 lg:flex">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">
              {sidebarItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.name || 'داشبورد'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                3
              </span>
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <span className="text-sm font-medium">{userInitial}</span>
              </div>
              <div className="hidden text-right xl:block">
                <p className="text-sm font-medium">{userName || 'کاربر'}</p>
                {roleDisplay && (
                  <p className="text-xs text-muted-foreground">{roleDisplay}</p>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
