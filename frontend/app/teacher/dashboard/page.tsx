'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TeacherLayout } from '@/components/layout/teacher-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Users,
  BookOpen,
  Clock,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';

interface TeacherDashboardData {
  teacher: {
    id: number;
    full_name: string;
    specialization: string;
    employee_id: string;
  };
  today_classes_count: number;
  total_classes: number;
  today_schedule: Array<{
    id: number;
    period: number;
    course: string;
    class_name: string;
    class_id: number;
    student_count: number;
    start_time: string;
    end_time: string;
  }>;
  my_classes: Array<{
    id: number;
    name: string;
    grade_level: string;
    course: string;
    student_count: number;
    is_primary: boolean;
  }>;
  working_days: number;
}

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<TeacherDashboardData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    loadDashboard();
  }, [router]);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/v1/auth/teacher/dashboard/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const data = await response.json();
      setData(data);
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'در بارگذاری اطلاعات خطا رخ داد',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <p>در حال بارگذاری...</p>
        </div>
      </TeacherLayout>
    );
  }

  if (!data) {
    return (
      <TeacherLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">خطا در دریافت اطلاعات</p>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">داشبورد معلم</h1>
            <p className="text-gray-500">خوش آمدید، {data.teacher.full_name}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">کلاس‌های امروز</p>
                  <p className="text-3xl font-bold">{data.today_classes_count}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">کلاس‌های من</p>
                  <p className="text-3xl font-bold">{data.total_classes}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">روزهای کاری</p>
                  <p className="text-3xl font-bold">{data.working_days}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">دانش‌آموزان</p>
                  <p className="text-3xl font-bold">
                    {data.my_classes.reduce((sum, c) => sum + c.student_count, 0)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>برنامه امروز</CardTitle>
            <Link href="/teacher/schedule">
              <Button variant="ghost" size="sm">
                مشاهده کامل
                <ChevronLeft className="h-4 w-4 mr-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data.today_schedule.length === 0 ? (
              <p className="text-center text-gray-500 py-4">امروز کلاسی ندارید</p>
            ) : (
              <div className="divide-y">
                {data.today_schedule.map((item) => (
                  <div key={item.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-lg flex items-center justify-center font-bold">
                        {item.period}
                      </div>
                      <div>
                        <p className="font-medium">{item.course}</p>
                        <p className="text-sm text-gray-500">
                          {item.class_name} • {item.student_count} دانش‌آموز
                        </p>
                        {item.start_time && (
                          <p className="text-xs text-gray-400">
                            {item.start_time} - {item.end_time}
                          </p>
                        )}
                      </div>
                    </div>
                    <Link href={`/teacher/attendance?class_id=${item.class_id}&date=today`}>
                      <Button variant="outline" size="sm">
                        حضورغیاب
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Classes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>کلاس‌های من</CardTitle>
            <Link href="/teacher/classes">
              <Button variant="ghost" size="sm">
                مشاهده همه
                <ChevronLeft className="h-4 w-4 mr-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.my_classes.map((cls) => (
                <Card key={cls.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold">{cls.name}</h3>
                      {cls.is_primary && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          مربی
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{cls.course}</p>
                    <p className="text-sm text-gray-500">پایه {cls.grade_level}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm">{cls.student_count} دانش‌آموز</span>
                      <Link href={`/teacher/grades?class_id=${cls.id}`}>
                        <Button variant="outline" size="sm">
                          نمرات
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  );
}
