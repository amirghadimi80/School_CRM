'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Plus, Users, UserCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

interface ClassItem {
  id: number;
  name: string;
  grade_level: string;
  branch: string | null;
  branch_display: string | null;
  room_number?: string;
  capacity: number;
  student_count: number;
  academic_year: number;
  academic_year_name: string;
}

interface AcademicYear {
  id: number;
  name: string;
  is_current: boolean;
}

const GRADE_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `پایه ${['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم', 'هفتم', 'هشتم', 'نهم', 'دهم', 'یازدهم', 'دوازدهم'][i]}`,
}));

const BRANCH_OPTIONS = [
  { value: 'math', label: 'ریاضی' },
  { value: 'science', label: 'تجربی' },
  { value: 'humanities', label: 'انسانی' },
];

export default function ClassesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newClass, setNewClass] = useState({
    name: '',
    grade_level: '',
    branch: '',
    room_number: '',
    capacity: '30',
    academic_year: '',
  });

  const showBranch = newClass.grade_level && parseInt(newClass.grade_level) >= 10;

  const loadData = async () => {
    try {
      const [classesRes, yearsRes] = await Promise.all([
        api.getClasses(),
        api.getAcademicYears(),
      ]);
      const classList = Array.isArray(classesRes) ? classesRes : classesRes.results || [];
      const yearList = Array.isArray(yearsRes) ? yearsRes : yearsRes.results || [];
      setClasses(classList);
      setAcademicYears(yearList);
      const current = yearList.find((y: AcademicYear) => y.is_current);
      if (current && !newClass.academic_year) {
        setNewClass((prev) => ({ ...prev, academic_year: String(current.id) }));
      }
    } catch {
      toast({ title: 'خطا', description: 'بارگذاری کلاس‌ها ناموفق بود', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    loadData();
  }, [router]);

  const handleAddClass = async () => {
    if (!newClass.name || !newClass.grade_level || !newClass.academic_year) {
      toast({ title: 'خطا', description: 'نام کلاس، پایه و سال تحصیلی الزامی است', variant: 'destructive' });
      return;
    }
    if (showBranch && !newClass.branch) {
      toast({ title: 'خطا', description: 'رشته برای پایه ۱۰ تا ۱۲ الزامی است', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      await api.createClass({
        name: newClass.name,
        grade_level: newClass.grade_level,
        branch: showBranch ? newClass.branch : null,
        room_number: newClass.room_number,
        capacity: parseInt(newClass.capacity) || 30,
        academic_year: parseInt(newClass.academic_year),
      });
      setIsAddDialogOpen(false);
      setNewClass({ name: '', grade_level: '', branch: '', room_number: '', capacity: '30', academic_year: newClass.academic_year });
      await loadData();
      toast({ title: 'موفق', description: 'کلاس با موفقیت اضافه شد' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { branch?: string[]; detail?: string } } })?.response?.data;
      toast({
        title: 'خطا',
        description: msg?.branch?.[0] || msg?.detail || 'افزودن کلاس ناموفق بود',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const gradeLabel = (value: string) => GRADE_OPTIONS.find((g) => g.value === value)?.label || value;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">کلاس‌ها</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                کلاس جدید
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>افزودن کلاس جدید</DialogTitle>
                <DialogDescription>اطلاعات کلاس را وارد کنید</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">نام کلاس</Label>
                  <Input
                    id="name"
                    placeholder="مثال: دهم تجربی ۱"
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>پایه تحصیلی</Label>
                  <Select
                    value={newClass.grade_level}
                    onValueChange={(value) => setNewClass({ ...newClass, grade_level: value, branch: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_OPTIONS.map((g) => (
                        <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {showBranch && (
                  <div className="space-y-2">
                    <Label>رشته</Label>
                    <Select value={newClass.branch} onValueChange={(value) => setNewClass({ ...newClass, branch: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب رشته" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRANCH_OPTIONS.map((b) => (
                          <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>سال تحصیلی</Label>
                  <Select value={newClass.academic_year} onValueChange={(value) => setNewClass({ ...newClass, academic_year: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب سال" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((y) => (
                        <SelectItem key={y.id} value={String(y.id)}>{y.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">شماره کلاس</Label>
                  <Input
                    id="roomNumber"
                    value={newClass.room_number}
                    onChange={(e) => setNewClass({ ...newClass, room_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">ظرفیت</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newClass.capacity}
                    onChange={(e) => setNewClass({ ...newClass, capacity: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>انصراف</Button>
                <Button onClick={handleAddClass} disabled={isSaving}>
                  {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full text-center py-8">در حال بارگذاری...</div>
          ) : classes.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">کلاسی ثبت نشده است</div>
          ) : (
            classes.map((cls) => (
              <Card key={cls.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-bold">{cls.name}</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {gradeLabel(cls.grade_level)}
                    {cls.branch_display ? ` — ${cls.branch_display}` : ''}
                  </p>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{cls.student_count} دانش‌آموز</span>
                  </div>
                  <Link href={`/classes/${cls.id}/assignments`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <UserCog className="ml-2 h-4 w-4" />
                      تخصیص معلمان
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
