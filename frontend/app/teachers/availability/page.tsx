'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه'];
const PERIODS = [1, 2, 3, 4, 5];

const TEACHERS = [
  { id: 1, name: 'علی کریمی', specialization: 'ریاضی' },
  { id: 2, name: 'سارا نوری', specialization: 'فیزیک' },
  { id: 3, name: 'رضا محمدی', specialization: 'شیمی' },
  { id: 4, name: 'مریم احمدی', specialization: 'ادبیات' },
];

interface Availability {
  [day: string]: number[];
}

export default function TeacherAvailabilityPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('1');
  const [availability, setAvailability] = useState<Availability>({
    'شنبه': [1, 2, 3],
    'یکشنبه': [1, 2, 3, 4],
    'دوشنبه': [1, 2, 3],
    'سه‌شنبه': [1, 2, 3, 4],
    'چهارشنبه': [1, 2, 3],
    'پنج‌شنبه': [],
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setIsLoading(false);
  }, [router]);

  const togglePeriod = (day: string, period: number) => {
    const current = availability[day] || [];
    if (current.includes(period)) {
      setAvailability({
        ...availability,
        [day]: current.filter(p => p !== period),
      });
    } else {
      setAvailability({
        ...availability,
        [day]: [...current, period].sort(),
      });
    }
  };

  const handleSave = () => {
    toast({ title: 'موفق', description: 'زمان‌بندی معلم ذخیره شد' });
  };

  const selectedTeacherData = TEACHERS.find(t => t.id.toString() === selectedTeacher);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/teachers">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">زمان‌بندی معلمان</h1>
          </div>
          <Button onClick={handleSave}>ذخیره تغییرات</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>انتخاب معلم</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEACHERS.map(t => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.name} ({t.specialization})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedTeacherData && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <CardTitle>برنامه حضور: {selectedTeacherData.name}</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                زنگ‌هایی که معلم می‌تواند درس بدهد را انتخاب کنید
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">در حال بارگذاری...</div>
              ) : (
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
                            const isAvailable = (availability[day] || []).includes(period);
                            return (
                              <td key={period} className="border p-2 text-center">
                                <Switch
                                  checked={isAvailable}
                                  onCheckedChange={() => togglePeriod(day, period)}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>خلاصه</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {DAYS.map(day => {
                const count = (availability[day] || []).length;
                return (
                  <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span>{day}</span>
                    <span className="font-bold">{count} زنگ</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded text-center">
              <span className="text-lg font-bold">
                مجموع: {Object.values(availability).reduce((sum, arr) => sum + arr.length, 0)} زنگ در هفته
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
