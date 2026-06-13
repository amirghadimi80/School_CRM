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

function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-1 p-4">
      {sidebarItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'sidebar-nav-link',
              isActive && 'sidebar-nav-link-active'
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

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

  const pageTitle =
    pathname === '/profile'
      ? 'پروفایل'
      : sidebarItems.find(
          (item) =>
            pathname === item.href || pathname.startsWith(`${item.href}/`)
        )?.name || 'داشبورد';

  return (
    <div className="platform-shell">
      {/* Desktop Sidebar */}
      <aside className="platform-sidebar fixed inset-y-0 right-0 z-50 hidden w-64 lg:block">
        <div className="flex h-full flex-col">
          <div className="flex min-h-16 items-center border-b border-sidebar-border/60 px-4 py-3">
            <Link href="/dashboard" className="min-w-0">
              <PlatformBrand schoolName={schoolName} />
            </Link>
          </div>

          <SidebarNav pathname={pathname} />

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
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="platform-header sticky top-0 z-40 flex h-16 items-center justify-between px-4 lg:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 border-sidebar-border/60 bg-sidebar p-0">
            <div className="flex h-full flex-col">
              <div className="flex min-h-16 items-center border-b border-sidebar-border/60 px-4 py-3">
                <PlatformBrand schoolName={schoolName} />
              </div>
              <SidebarNav
                pathname={pathname}
                onNavigate={() => setIsMobileMenuOpen(false)}
              />
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
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/dashboard" className="min-w-0">
          <PlatformBrand schoolName={schoolName} titleClassName="text-xs" />
        </Link>

        <Button variant="ghost" size="icon" className="relative rounded-xl">
          <Bell className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="lg:mr-64">
        <header className="platform-header sticky top-0 z-30 hidden h-16 items-center justify-between px-6 lg:flex">
          <h2 className="text-lg font-semibold tracking-tight">{pageTitle}</h2>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative rounded-xl">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground ring-2 ring-card">
                3
              </span>
            </Button>
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/40 py-1.5 pr-1.5 pl-3 transition-colors hover:border-primary/20 hover:bg-secondary/70"
              title="مشاهده پروفایل"
            >
              <div className="hidden text-right xl:block">
                <p className="text-sm font-medium leading-tight">
                  {userName || 'کاربر'}
                </p>
                {roleDisplay && (
                  <p className="text-xs text-muted-foreground">{roleDisplay}</p>
                )}
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-sm font-semibold text-primary-foreground shadow-sm">
                {userInitial}
              </div>
            </Link>
          </div>
        </header>

        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
