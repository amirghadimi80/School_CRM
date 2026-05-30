'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentLayout } from '@/components/layout/student-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  BookOpen,
  ClipboardList,
  Wallet,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface StudentDashboardData {
  student: {
    id: number;
    student_code: string;
    full_name: string;
    grade_level: string;
    class_name: string | null;
    class_id: number | null;
  };
  today_schedule: Array<{
    id: number;
    period: number;
    course: string;
    teacher: string;
    start_time: string;
    end_time: string;
  }>;
  gpa: number | null;
  attendance_rate: number;
  financial_balance: number;
  recent_absences: Array<{
    date: string;
    status: string;
    course: string;
  }>;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<StudentDashboardData | null>(null);

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
      const response = await api.get<StudentDashboardData>('/users/student/dashboard/dashboard/');
      setData(response.data);
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
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <p>در حال بارگذاری...</p>
        </div>
      </StudentLayout>
    );
  }

  if (!data) {
    return (
      <StudentLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">خطا در دریافت اطلاعات</p>
        </div>
      </StudentLayout>
    );
  }

  const hasDebt = data.financial_balance > 0;

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">داشبورد دانش‌آموز</h1>
            <p className="text-gray-500">
              {data.student.full_name} • پایه {data.student.grade_level}
              {data.student.class_name && ` • ${data.student.class_name}`}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">معدل کل</p>
                  <p className="text-3xl font-bold">
                    {data.gpa ? data.gpa.toFixed(2) : '—'}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">نرخ حضور</p>
                  <p className="text-3xl font-bold">{data.attendance_rate}%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">کلاس امروز</p>
                  <p className="text-3xl font-bold">{data.today_schedule.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={hasDebt ? 'border-red-200' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">بدهی مالی</p>
                  <p className={`text-3xl font-bold ${hasDebt ? 'text-red-600' : ''}`}>
                    {data.financial_balance.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${hasDebt ? 'bg-red-100' : 'bg-gray-100'}`}>
                  <Wallet className={`h-6 w-6 ${hasDebt ? 'text-red-600' : 'text-gray-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Warning */}
        {hasDebt && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <p className="font-medium text-red-800">بدهی مالی دارید</p>
              <p className="text-sm text-red-600">
                مبلغ {data.financial_balance.toLocaleString()} تومان بدهکار هستید.
              </p>
            </div>
            <Link href="/student/finance">
              <Button variant="outline" size="sm" className="border-red-300 text-red-700">
                مشاهده
              </Button>
            </Link>
          </div>
        )}

        {/* Today's Schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>برنامه امروز</CardTitle>
            <Link href="/student/schedule">
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
                      <div className="bg-green-50 text-green-600 w-10 h-10 rounded-lg flex items-center justify-center font-bold">
                        {item.period}
                      </div>
                      <div>
                        <p className="font-medium">{item.course}</p>
                        <p className="text-sm text-gray-500">استاد: {item.teacher}</p>
                        {item.start_time && (
                          <p className="text-xs text-gray-400">
                            {item.start_time} - {item.end_time}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Absences */}
          <Card>
            <CardHeader>
              <CardTitle>غیبت‌های اخیر</CardTitle>
            </CardHeader>
            <CardContent>
              {data.recent_absences.length === 0 ? (
                <p className="text-center text-gray-500 py-4">غیبت ثبت نشده</p>
              ) : (
                <div className="divide-y">
                  {data.recent_absences.map((absence, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{absence.course}</p>
                        <p className="text-sm text-gray-500">{absence.date}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        absence.status === 'absent' 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {absence.status === 'absent' ? 'غایب' : 'تاخیر'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>دسترسی سریع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/student/grades">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <BookOpen className="h-6 w-6" />
                    <span>کارنامه</span>
                  </Button>
                </Link>
                <Link href="/student/attendance">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <ClipboardList className="h-6 w-6" />
                    <span>حضور و غیاب</span>
                  </Button>
                </Link>
                <Link href="/student/finance">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <Wallet className="h-6 w-6" />
                    <span>وضعیت مالی</span>
                  </Button>
                </Link>
                <Link href="/student/schedule">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <Calendar className="h-6 w-6" />
                    <span>برنامه</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
}
