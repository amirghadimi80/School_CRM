'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, Check, X, RefreshCw, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AssignmentRow {
  course_id: number;
  course_name: string;
  weekly_hours: number;
  teacher_id: number | null;
  teacher_name: string | null;
  is_assigned: boolean;
}

interface Teacher {
  id: number;
  full_name: string;
  specialization: string;
}

interface AssignmentStatus {
  total_courses: number;
  assigned_count: number;
  is_complete: boolean;
  missing_courses: string[];
}

export default function ClassAssignmentsPage() {
  const router = useRouter();
  const params = useParams();
  const classId = Number(params.id);
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [classInfo, setClassInfo] = useState<{
    id: number;
    name: string;
    grade_level: string;
    branch: string | null;
    branch_display: string | null;
  } | null>(null);
  const [academicYear, setAcademicYear] = useState('');
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [status, setStatus] = useState<AssignmentStatus | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherSelections, setTeacherSelections] = useState<Record<number, string>>({});

  const loadData = useCallback(async () => {
    try {
      const [assignmentRes, teachersRes, schoolRes] = await Promise.all([
        api.getClassAssignments(classId),
        api.getTeachers({ status: 'active' }),
        api.getMySchool(),
      ]);

      setClassInfo(assignmentRes.class);
      setAcademicYear(
        assignmentRes.academic_year || schoolRes.current_academic_year || ''
      );
      setAssignments(assignmentRes.assignments || []);
      setStatus(assignmentRes.status);

      const teacherList = Array.isArray(teachersRes) ? teachersRes : teachersRes.results || [];
      setTeachers(teacherList);

      const selections: Record<number, string> = {};
      (assignmentRes.assignments || []).forEach((row: AssignmentRow) => {
        if (row.teacher_id) {
          selections[row.course_id] = String(row.teacher_id);
        }
      });
      setTeacherSelections(selections);
    } catch {
      toast({ title: 'خطا', description: 'بارگذاری تخصیص‌ها ناموفق بود', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [classId, toast]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    if (classId) loadData();
  }, [router, classId, loadData]);

  const handleSave = async () => {
    const payload = assignments
      .filter((row) => teacherSelections[row.course_id])
      .map((row) => ({
        course_id: row.course_id,
        teacher_id: parseInt(teacherSelections[row.course_id]),
      }));

    if (payload.length === 0) {
      toast({ title: 'خطا', description: 'حداقل یک معلم انتخاب کنید', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.bulkAssignTeachers({
        class_id: classId,
        academic_year: academicYear,
        assignments: payload,
      });
      setStatus(res.status);
      await loadData();
      toast({ title: 'موفق', description: 'تخصیص معلمان ذخیره شد' });
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast({ title: 'خطا', description: detail || 'ذخیره ناموفق بود', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!status?.is_complete) {
      toast({
        title: 'ناقص',
        description: 'ابتدا معلم همه دروس را مشخص کنید',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await api.generateClassSchedule({
        class_id: classId,
        academic_year: academicYear,
        regenerate: true,
      });
      const warnings = res.warnings?.length ? ` — ${res.warnings.join(' ')}` : '';
      toast({
        title: res.status === 'partial' ? 'ناقص' : 'موفق',
        description: `${res.generated} زنگ تولید شد${warnings}`,
        variant: res.status === 'partial' ? 'destructive' : 'default',
      });
      router.push('/schedules');
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { errors?: string[]; detail?: string } } })?.response?.data;
      const msg = data?.errors?.join(' — ') || data?.detail || 'تولید برنامه ناموفق بود';
      toast({ title: 'خطا', description: msg, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const progressPercent = status
    ? Math.round((status.assigned_count / Math.max(status.total_courses, 1)) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/classes">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">تخصیص معلمان</h1>
              {classInfo && (
                <p className="text-muted-foreground mt-1">
                  {classInfo.name} — پایه {classInfo.grade_level}
                  {classInfo.branch_display ? ` — ${classInfo.branch_display}` : ''}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              <Save className="ml-2 h-4 w-4" />
              {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
            </Button>
            <Button onClick={handleGenerate} disabled={!status?.is_complete || isGenerating}>
              <RefreshCw className="ml-2 h-4 w-4" />
              {isGenerating ? 'در حال تولید...' : 'تولید برنامه این کلاس'}
            </Button>
          </div>
        </div>

        {status && (
          <Card>
            <CardContent className="pt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>پیشرفت تخصیص</span>
                <span>{status.assigned_count} از {status.total_courses} درس</span>
              </div>
              <Progress value={progressPercent} />
              {!status.is_complete && status.missing_courses.length > 0 && (
                <p className="text-sm text-amber-600">
                  دروس بدون معلم: {status.missing_courses.join('، ')}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>تخصیص معلم به هر درس</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">در حال بارگذاری...</div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                برنامه درسی برای این پایه/رشته تعریف نشده. ابتدا از بخش «برنامه درسی» دروس را ثبت کنید.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-3 bg-gray-50 text-right">درس</th>
                      <th className="border p-3 bg-gray-50 text-center">ساعات هفتگی</th>
                      <th className="border p-3 bg-gray-50 text-right">معلم</th>
                      <th className="border p-3 bg-gray-50 text-center">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((row) => {
                      const selected = teacherSelections[row.course_id];
                      const isAssigned = !!selected;
                      return (
                        <tr key={row.course_id}>
                          <td className="border p-3 font-medium">{row.course_name}</td>
                          <td className="border p-3 text-center">{row.weekly_hours}</td>
                          <td className="border p-2">
                            <Select
                              value={selected || ''}
                              onValueChange={(value) =>
                                setTeacherSelections({ ...teacherSelections, [row.course_id]: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="انتخاب معلم" />
                              </SelectTrigger>
                              <SelectContent>
                                {teachers.map((t) => (
                                  <SelectItem key={t.id} value={String(t.id)}>
                                    {t.full_name}
                                    {t.specialization ? ` (${t.specialization})` : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="border p-3 text-center">
                            {isAssigned ? (
                              <Check className="h-5 w-5 text-green-600 inline" />
                            ) : (
                              <X className="h-5 w-5 text-red-400 inline" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
