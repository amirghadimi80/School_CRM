'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
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
const DAY_INDEX: Record<string, number> = {
  'شنبه': 0, 'یکشنبه': 1, 'دوشنبه': 2, 'سه‌شنبه': 3, 'چهارشنبه': 4, 'پنج‌شنبه': 5,
};

interface Teacher {
  id: number;
  full_name: string;
  specialization: string;
}

interface AvailabilityRecord {
  id: number;
  day_of_week: number;
  periods: number[];
}

export default function TeacherAvailabilityPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [periods, setPeriods] = useState<number[]>([1, 2, 3, 4, 5]);
  const [availability, setAvailability] = useState<Record<string, number[]>>({});
  const [existingRecords, setExistingRecords] = useState<AvailabilityRecord[]>([]);

  const emptyAvailability = () => {
    const init: Record<string, number[]> = {};
    DAYS.forEach((d) => { init[d] = []; });
    return init;
  };

  const loadTeacherAvailability = useCallback(async (teacherId: string) => {
    if (!teacherId) return;
    try {
      const res = await api.getTeacherAvailabilities(parseInt(teacherId));
      const records: AvailabilityRecord[] = Array.isArray(res) ? res : res.results || [];
      setExistingRecords(records);
      const grid = emptyAvailability();
      records.forEach((rec) => {
        const dayName = DAYS[rec.day_of_week];
        if (dayName) grid[dayName] = rec.periods || [];
      });
      setAvailability(grid);
    } catch {
      toast({ title: 'خطا', description: 'بارگذاری زمان‌بندی ناموفق بود', variant: 'destructive' });
    }
  }, [toast]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const init = async () => {
      try {
        const [teachersRes, periodsRes] = await Promise.all([
          api.getTeachers({ status: 'active' }),
          api.getPeriods(),
        ]);
        const teacherList = Array.isArray(teachersRes) ? teachersRes : teachersRes.results || [];
        setTeachers(teacherList);
        if (teacherList.length > 0) {
          setSelectedTeacher(String(teacherList[0].id));
        }
        const periodList = Array.isArray(periodsRes) ? periodsRes : periodsRes.results || [];
        if (periodList.length > 0) {
          setPeriods(periodList.map((p: { period_number: number }) => p.period_number).sort());
        }
      } catch {
        toast({ title: 'خطا', description: 'بارگذاری معلمان ناموفق بود', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [router, toast]);

  useEffect(() => {
    if (selectedTeacher) loadTeacherAvailability(selectedTeacher);
  }, [selectedTeacher, loadTeacherAvailability]);

  const togglePeriod = (day: string, period: number) => {
    const current = availability[day] || [];
    if (current.includes(period)) {
      setAvailability({ ...availability, [day]: current.filter((p) => p !== period) });
    } else {
      setAvailability({ ...availability, [day]: [...current, period].sort() });
    }
  };

  const handleSave = async () => {
    if (!selectedTeacher) return;
    setIsSaving(true);
    try {
      for (const day of DAYS) {
        const dayIndex = DAY_INDEX[day];
        const periodsForDay = availability[day] || [];
        const existing = existingRecords.find((r) => r.day_of_week === dayIndex);

        if (existing) {
          await api.updateTeacherAvailability(existing.id, { periods: periodsForDay });
        } else if (periodsForDay.length > 0) {
          await api.saveTeacherAvailability({
            teacher: parseInt(selectedTeacher),
            day_of_week: dayIndex,
            periods: periodsForDay,
          });
        }
      }
      await loadTeacherAvailability(selectedTeacher);
      toast({ title: 'موفق', description: 'زمان‌بندی معلم ذخیره شد' });
    } catch {
      toast({ title: 'خطا', description: 'ذخیره ناموفق بود', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedTeacherData = teachers.find((t) => t.id.toString() === selectedTeacher);

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
          <Button onClick={handleSave} disabled={isSaving || !selectedTeacher}>
            {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>انتخاب معلم</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="انتخاب معلم" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.full_name} ({t.specialization || '—'})
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
                <CardTitle>برنامه حضور: {selectedTeacherData.full_name}</CardTitle>
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
                        {periods.map((p) => (
                          <th key={p} className="border p-3 bg-gray-50 text-center">زنگ {p}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map((day) => (
                        <tr key={day}>
                          <td className="border p-3 font-medium bg-gray-50">{day}</td>
                          {periods.map((period) => {
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
      </div>
    </DashboardLayout>
  );
}
