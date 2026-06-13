'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, BookOpen, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const GRADE_OPTIONS = [
  { value: '10', label: 'پایه دهم' },
  { value: '11', label: 'پایه یازدهم' },
  { value: '12', label: 'پایه دوازدهم' },
];

const BRANCH_OPTIONS = [
  { value: 'math', label: 'ریاضی‌فیزیک' },
  { value: 'science', label: 'علوم تجربی' },
  { value: 'humanities', label: 'علوم انسانی' },
];

interface CurriculumEntry {
  id: number;
  grade_level: string;
  branch: string | null;
  course: number;
  course_name: string;
  weekly_hours: number;
  is_specialized: boolean;
}

export default function CurriculumPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<CurriculumEntry[]>([]);
  const [selectedGrade, setSelectedGrade] = useState('10');
  const [selectedBranch, setSelectedBranch] = useState('math');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<{ id: number; name: string }[]>([]);

  const [newEntry, setNewEntry] = useState({
    courseId: '',
    weeklyHours: '2',
    isSpecialized: false,
  });

  const apiBranch = selectedBranch;

  const loadCourses = useCallback(async () => {
    try {
      const params = new URLSearchParams({ grade: selectedGrade });
      params.set('branch', apiBranch);
      const res = await api.get<{ id: number; name: string }[]>(`/exams/curriculum/courses/?${params}`);
      setAvailableCourses(res.data || []);
    } catch {
      setAvailableCourses([]);
    }
  }, [selectedGrade, apiBranch]);

  const syncOfficialCurriculum = useCallback(async () => {
    try {
      const res = await api.ensureOfficialCurriculum({
        grade_level: selectedGrade,
        branch: apiBranch,
      });
      setEntries(res.entries || []);
      if (res.missing_courses?.length > 0) {
        toast({
          title: 'توجه',
          description: `${res.missing_courses.length} درس در سیستم یافت نشد. دستور create_iranian_curriculum را اجرا کنید.`,
          variant: 'destructive',
        });
      }
    } catch {
      toast({ title: 'خطا', description: 'بارگذاری برنامه درسی ناموفق بود', variant: 'destructive' });
    }
  }, [selectedGrade, apiBranch, toast]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setIsLoading(true);
    Promise.all([syncOfficialCurriculum(), loadCourses()]).finally(() => setIsLoading(false));
  }, [router, selectedGrade, selectedBranch, syncOfficialCurriculum, loadCourses]);

  const generalEntries = entries.filter((e) => !e.is_specialized);
  const specializedEntries = entries.filter((e) => e.is_specialized);

  const addedCourseIds = new Set(entries.map((e) => e.course));
  const coursesToAdd = availableCourses.filter((c) => !addedCourseIds.has(c.id));

  const handleAddEntry = async () => {
    if (!newEntry.courseId) {
      toast({ title: 'خطا', description: 'درس را انتخاب کنید', variant: 'destructive' });
      return;
    }

    try {
      await api.createCurriculumEntry({
        grade_level: selectedGrade,
        branch: apiBranch,
        course: parseInt(newEntry.courseId),
        weekly_hours: parseInt(newEntry.weeklyHours),
        is_specialized: newEntry.isSpecialized,
      });
      setIsAddDialogOpen(false);
      setNewEntry({ courseId: '', weeklyHours: '2', isSpecialized: false });
      await syncOfficialCurriculum();
      toast({ title: 'موفق', description: 'درس اضافه شد' });
    } catch {
      toast({ title: 'خطا', description: 'افزودن درس ناموفق بود', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteCurriculumEntry(id);
      await syncOfficialCurriculum();
      toast({ title: 'موفق', description: 'درس حذف شد' });
    } catch {
      toast({ title: 'خطا', description: 'حذف ناموفق بود', variant: 'destructive' });
    }
  };

  const totalHours = entries.reduce((sum, e) => sum + e.weekly_hours, 0);

  const branchLabel = BRANCH_OPTIONS.find((b) => b.value === selectedBranch)?.label || '';
  const gradeLabel = GRADE_OPTIONS.find((g) => g.value === selectedGrade)?.label || '';

  const renderEntryList = (list: CurriculumEntry[], emptyText: string) => (
    <div className="divide-y">
      {list.map((entry) => (
        <div key={entry.id} className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <p className="font-medium">{entry.course_name}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">{entry.weekly_hours} ساعت</span>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)}>
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      ))}
      {list.length === 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm">{emptyText}</div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">برنامه درسی</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              با انتخاب پایه و رشته، دروس رسمی به‌صورت خودکار بارگذاری می‌شوند
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                افزودن درس
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>افزودن درس جدید</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>درس</Label>
                  <Select value={newEntry.courseId} onValueChange={(v) => setNewEntry({ ...newEntry, courseId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب درس" />
                    </SelectTrigger>
                    <SelectContent>
                      {coursesToAdd.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weeklyHours">ساعت هفتگی</Label>
                  <Input
                    id="weeklyHours"
                    type="number"
                    min="1"
                    max="10"
                    value={newEntry.weeklyHours}
                    onChange={(e) => setNewEntry({ ...newEntry, weeklyHours: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isSpecialized"
                    checked={newEntry.isSpecialized}
                    onChange={(e) => setNewEntry({ ...newEntry, isSpecialized: e.target.checked })}
                  />
                  <Label htmlFor="isSpecialized">درس تخصصی</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>انصراف</Button>
                <Button onClick={handleAddEntry}>ذخیره</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <Label className="mb-2 block">پایه تحصیلی</Label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_OPTIONS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">رشته</Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCH_OPTIONS.map((b) => (
                      <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mr-auto text-left">
                <p className="text-sm text-muted-foreground">مجموع ساعت هفتگی</p>
                <p className="text-2xl font-bold">{totalHours}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {gradeLabel} — {branchLabel} — {entries.length} درس
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {isLoading ? (
              <div className="text-center py-8">در حال بارگذاری...</div>
            ) : (
              <>
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-purple-700">دروس تخصصی</h3>
                  {renderEntryList(specializedEntries, 'درس تخصصی ثبت نشده')}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-blue-700">دروس عمومی</h3>
                  {renderEntryList(generalEntries, 'درس عمومی ثبت نشده')}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
