'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Calendar, RefreshCw, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه'];
const PERIODS = [1, 2, 3, 4, 5];

const TEACHERS = [
  { id: 1, name: 'علی کریمی', specialization: 'ریاضی' },
  { id: 2, name: 'سارا نوری', specialization: 'فیزیک' },
  { id: 3, name: 'رضا محمدی', specialization: 'شیمی' },
  { id: 4, name: 'مریم احمدی', specialization: 'ادبیات' },
];

const CLASSES = [
  { id: 1, name: '101', grade: 'دهم' },
  { id: 2, name: '102', grade: 'دهم' },
  { id: 3, name: '201', grade: 'یازدهم' },
  { id: 4, name: '301', grade: 'دوازدهم' },
];

interface ScheduleCell {
  course: string;
  teacher: string;
}

export default function SchedulesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'class' | 'teacher'>('class');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [schedule, setSchedule] = useState<Record<string, Record<number, ScheduleCell>>>({});

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setIsLoading(false);
  }, [router]);

  const handleGenerate = () => {
    toast({ title: 'در حال تولید...', description: 'لطفاً صبر کنید' });
    
    // Mock generated schedule
    const mockSchedule: Record<string, Record<number, ScheduleCell>> = {};
    
    DAYS.forEach(day => {
      mockSchedule[day] = {};
      PERIODS.forEach(period => {
        const randomTeacher = TEACHERS[Math.floor(Math.random() * TEACHERS.length)];
        const courses = ['ریاضی', 'فیزیک', 'شیمی', 'ادبیات', 'عربی', 'انگلیسی'];
        mockSchedule[day][period] = {
          course: courses[Math.floor(Math.random() * courses.length)],
          teacher: randomTeacher.name,
        };
      });
    });
    
    setTimeout(() => {
      setSchedule(mockSchedule);
      toast({ title: 'موفق', description: 'برنامه تولید شد' });
    }, 1000);
  };

  const renderScheduleTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-3 bg-gray-50 text-right">روز / زنگ</th>
              {PERIODS.map(p => (
                <th key={p} className="border p-3 bg-gray-50 text-center">
                  زنگ {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map(day => (
              <tr key={day}>
                <td className="border p-3 font-medium bg-gray-50">{day}</td>
                {PERIODS.map(period => {
                  const cell = schedule[day]?.[period];
                  return (
                    <td key={period} className="border p-2 text-center">
                      {cell ? (
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{cell.course}</div>
                          <div className="text-xs text-muted-foreground">{cell.teacher}</div>
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">برنامه هفتگی</h1>
          <Button onClick={handleGenerate}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تولید برنامه
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">حالت نمایش</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Select value={viewMode} onValueChange={(v: 'class' | 'teacher') => setViewMode(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">بر اساس کلاس</SelectItem>
                  <SelectItem value="teacher">بر اساس معلم</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {viewMode === 'class' ? 'انتخاب کلاس' : 'انتخاب معلم'}
              </CardTitle>
              {viewMode === 'class' ? <Calendar className="h-4 w-4 text-muted-foreground" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              {viewMode === 'class' ? (
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="کلاس را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSES.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name} ({c.grade})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger>
                    <SelectValue placeholder="معلم را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEACHERS.map(t => (
                      <SelectItem key={t.id} value={t.id.toString()}>{t.name} ({t.specialization})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">سال تحصیلی</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1403-1404</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>برنامه هفتگی</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">در حال بارگذاری...</div>
            ) : Object.keys(schedule).length > 0 ? (
              renderScheduleTable()
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>برنامه‌ای تولید نشده است</p>
                <p className="text-sm">روی "تولید برنامه" کلیک کنید</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
