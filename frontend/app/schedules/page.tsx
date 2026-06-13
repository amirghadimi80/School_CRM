'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Calendar, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

const DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه'];

interface ScheduleCell {
  course: string;
  teacher: string;
}

interface ClassOption {
  id: number;
  name: string;
  grade_level: string;
  branch_display?: string;
}

interface ScheduleEntry {
  day_of_week: number;
  period_number: number;
  course_name: string;
  teacher_name: string;
}

interface AssignmentStatus {
  is_complete: boolean;
  assigned_count: number;
  total_courses: number;
  missing_courses: string[];
}

export default function SchedulesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [academicYear, setAcademicYear] = useState('');
  const [schedule, setSchedule] = useState<Record<string, Record<number, ScheduleCell>>>({});
  const [periods, setPeriods] = useState<number[]>([1, 2, 3, 4, 5]);
  const [assignmentStatus, setAssignmentStatus] = useState<AssignmentStatus | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const buildScheduleGrid = (entries: ScheduleEntry[]) => {
    const grid: Record<string, Record<number, ScheduleCell>> = {};
    DAYS.forEach((day) => { grid[day] = {}; });
    entries.forEach((entry) => {
      const day = DAYS[entry.day_of_week];
      if (day) {
        grid[day][entry.period_number] = {
          course: entry.course_name,
          teacher: entry.teacher_name,
        };
      }
    });
    return grid;
  };

  const loadClassSchedule = useCallback(async (classId: string) => {
    if (!classId) return;
    try {
      const [byClassRes, statusRes] = await Promise.all([
        api.getSchedulesByClass(academicYear || undefined),
        api.getAssignmentStatus(parseInt(classId), academicYear || undefined),
      ]);
      setAssignmentStatus(statusRes);
      const classData = byClassRes[classId];
      if (classData?.schedules) {
        setSchedule(buildScheduleGrid(classData.schedules));
      } else {
        setSchedule({});
      }
    } catch {
      toast({ title: 'خطا', description: 'بارگذاری برنامه ناموفق بود', variant: 'destructive' });
    }
  }, [academicYear, toast]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const init = async () => {
      try {
        const [classesRes, schoolRes, periodsRes] = await Promise.all([
          api.getClasses(),
          api.getMySchool(),
          api.getPeriods(),
        ]);
        const classList = Array.isArray(classesRes) ? classesRes : classesRes.results || [];
        setClasses(classList);
        setAcademicYear(schoolRes.current_academic_year || '');
        const periodList = Array.isArray(periodsRes) ? periodsRes : periodsRes.results || [];
        if (periodList.length > 0) {
          setPeriods(periodList.map((p: { period_number: number }) => p.period_number).sort());
        }
      } catch {
        toast({ title: 'خطا', description: 'بارگذاری اطلاعات ناموفق بود', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [router, toast]);

  useEffect(() => {
    if (selectedClass) loadClassSchedule(selectedClass);
  }, [selectedClass, loadClassSchedule]);

  const handleGenerate = async () => {
    if (!selectedClass) {
      toast({ title: 'خطا', description: 'کلاس را انتخاب کنید', variant: 'destructive' });
      return;
    }
    if (assignmentStatus && !assignmentStatus.is_complete) {
      toast({
        title: 'ناقص',
        description: 'ابتدا معلم همه دروس را در صفحه تخصیص مشخص کنید',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setWarnings([]);
    try {
      const res = await api.generateClassSchedule({
        class_id: parseInt(selectedClass),
        academic_year: academicYear,
        regenerate: true,
      });
      setWarnings(res.warnings || []);
      await loadClassSchedule(selectedClass);
      toast({
        title: res.status === 'partial' ? 'ناقص' : 'موفق',
        description: `${res.generated} زنگ تولید شد`,
        variant: res.status === 'partial' ? 'destructive' : 'default',
      });
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { errors?: string[]; detail?: string } } })?.response?.data;
      toast({
        title: 'خطا',
        description: data?.errors?.join(' — ') || data?.detail || 'تولید ناموفق بود',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedClassData = classes.find((c) => String(c.id) === selectedClass);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">برنامه هفتگی</h1>
          <Button onClick={handleGenerate} disabled={!selectedClass || isGenerating}>
            <RefreshCw className="ml-2 h-4 w-4" />
            {isGenerating ? 'در حال تولید...' : 'تولید برنامه'}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">انتخاب کلاس</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="کلاس را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name} (پایه {c.grade_level}{c.branch_display ? ` — ${c.branch_display}` : ''})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">سال تحصیلی</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{academicYear || '—'}</div>
            </CardContent>
          </Card>
        </div>

        {selectedClass && assignmentStatus && (
          <Card>
            <CardContent className="pt-6">
              {assignmentStatus.is_complete ? (
                <p className="text-green-600 text-sm">
                  تخصیص معلمان کامل است ({assignmentStatus.assigned_count}/{assignmentStatus.total_courses})
                </p>
              ) : (
                <div className="flex items-start gap-2 text-amber-600 text-sm">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <p>تخصیص ناقص: {assignmentStatus.assigned_count} از {assignmentStatus.total_courses} درس</p>
                    <Link href={`/classes/${selectedClass}/assignments`} className="underline">
                      رفتن به صفحه تخصیص معلمان {selectedClassData?.name}
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {warnings.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6 text-sm text-amber-800">
              {warnings.map((w, i) => <p key={i}>{w}</p>)}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>برنامه هفتگی {selectedClassData ? `— ${selectedClassData.name}` : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">در حال بارگذاری...</div>
            ) : !selectedClass ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>کلاسی انتخاب کنید</p>
              </div>
            ) : Object.keys(schedule).some((d) => Object.keys(schedule[d]).length > 0) ? (
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
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>برنامه‌ای تولید نشده است</p>
                <p className="text-sm">پس از تخصیص معلمان، «تولید برنامه» را بزنید</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
