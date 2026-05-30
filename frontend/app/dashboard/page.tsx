'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  GraduationCap,
  BookOpen,
  Wallet,
  TrendingUp,
  Calendar,
  Clock,
  Bell,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  attendanceRate: number;
  pendingPayments: number;
  monthlyRevenue: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    attendanceRate: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalStudents: 245,
        totalTeachers: 18,
        totalClasses: 12,
        attendanceRate: 94.5,
        pendingPayments: 15600000,
        monthlyRevenue: 124500000,
      });
      setIsLoading(false);
    }, 1000);
  }, [router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: 'دانش‌آموزان',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/students',
    },
    {
      title: 'معلمان',
      value: stats.totalTeachers,
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/teachers',
    },
    {
      title: 'کلاس‌ها',
      value: stats.totalClasses,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/classes',
    },
    {
      title: 'نرخ حضور',
      value: `${stats.attendanceRate}%`,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      link: '/attendance',
      showProgress: true,
      progress: stats.attendanceRate,
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">داشبورد</h1>
            <p className="text-muted-foreground">نمای کلی مدرسه</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 ml-2" />
              امروز: {new Date().toLocaleDateString('fa-IR')}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Link key={stat.title} href={stat.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-y-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      {stat.showProgress && (
                        <Progress value={stat.progress} className="h-2" />
                      )}
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Financial Summary */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                وضعیت مالی
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">درآمد این ماه</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(stats.monthlyRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">مطالبات معوق</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(stats.pendingPayments)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-medium">موجودی کل</span>
                <span className="font-bold text-lg">
                  {formatCurrency(stats.monthlyRevenue - stats.pendingPayments)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                اعلانات اخیر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-red-500" />
                  <div>
                    <p className="text-sm font-medium">غیبت متوالی</p>
                    <p className="text-xs text-muted-foreground">3 دانش‌آموز بیش از 3 روز غیبت دارند</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-amber-500" />
                  <div>
                    <p className="text-sm font-medium">پرداخت معوق</p>
                    <p className="text-xs text-muted-foreground">12 دانش‌آموز شهریه پرداخت نکرده‌اند</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium">امتحانات پیش‌رو</p>
                    <p className="text-xs text-muted-foreground">امتحان نیمسال اول در 2 هفته آینده</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
