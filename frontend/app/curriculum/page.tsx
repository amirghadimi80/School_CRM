'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, BookOpen, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

// Official curriculum for each grade level (Iranian education system)
const OFFICIAL_CURRICULUM: Record<string, string[]> = {
  '1': ['هدیه‌های آسمانی', 'فارسی', 'ریاضی', 'علوم', 'هنر', 'ورزش'],
  '2': ['هدیه‌های آسمانی', 'فارسی', 'ریاضی', 'علوم', 'هنر', 'ورزش'],
  '3': ['هدیه‌های آسمانی', 'فارسی', 'ریاضی', 'علوم', 'هنر', 'ورزش'],
  '4': ['هدیه‌های آسمانی', 'فارسی', 'ریاضی', 'علوم', 'اجتماعی', 'هنر', 'ورزش'],
  '5': ['هدیه‌های آسمانی', 'فارسی', 'ریاضی', 'علوم', 'اجتماعی', 'هنر', 'ورزش'],
  '6': ['هدیه‌های آسمانی', 'فارسی', 'ریاضی', 'علوم', 'اجتماعی', 'هنر', 'ورزش'],
  '7': ['قرآن', 'فارسی', 'ریاضی', 'علوم', 'اجتماعی', 'عربی', 'انگلیسی', 'هنر', 'ورزش'],
  '8': ['قرآن', 'فارسی', 'ریاضی', 'علوم', 'اجتماعی', 'عربی', 'انگلیسی', 'هنر', 'ورزش'],
  '9': ['قرآن', 'فارسی', 'ریاضی', 'علوم', 'اجتماعی', 'عربی', 'انگلیسی', 'هنر', 'ورزش'],
  '10_general': ['دین و زندگی', 'فارسی', 'نگارش', 'ریاضی', 'هندسه', 'فیزیک', 'شیمی', 'زیست', 'عربی', 'انگلیسی', 'جغرافیا', 'تاریخ'],
  '11_math': ['دین و زندگی', 'فارسی', 'نگارش', 'حسابان', 'هندسه', 'آمار', 'فیزیک', 'شیمی', 'عربی', 'انگلیسی', 'تاریخ', 'محیط زیست'],
  '11_science': ['دین و زندگی', 'فارسی', 'نگارش', 'ریاضی', 'فیزیک', 'شیمی', 'زیست', 'زمین‌شناسی', 'عربی', 'انگلیسی', 'تاریخ', 'محیط زیست'],
  '11_humanities': ['دین و زندگی', 'فارسی', 'نگارش', 'ریاضی و آمار', 'علوم ادبی', 'تاریخ', 'جغرافیا', 'اقتصاد', 'منطق', 'جامعه‌شناسی', 'انگلیسی', 'محیط زیست'],
  '12_math': ['دین و زندگی', 'فارسی', 'نگارش', 'حسابان', 'هندسه', 'گسسته', 'فیزیک', 'شیمی', 'عربی', 'انگلیسی', 'هویت اجتماعی', 'سلامت'],
  '12_science': ['دین و زندگی', 'فارسی', 'نگارش', 'ریاضی', 'فیزیک', 'شیمی', 'زیست', 'عربی', 'انگلیسی', 'هویت اجتماعی', 'سلامت'],
  '12_humanities': ['دین و زندگی', 'فارسی', 'نگارش', 'ریاضی و آمار', 'علوم ادبی', 'تاریخ', 'جغرافیا', 'جامعه‌شناسی', 'فلسفه', 'انگلیسی', 'سلامت'],
};

const GRADE_OPTIONS = [
  { value: '1', label: 'پایه اول' },
  { value: '2', label: 'پایه دوم' },
  { value: '3', label: 'پایه سوم' },
  { value: '4', label: 'پایه چهارم' },
  { value: '5', label: 'پایه پنجم' },
  { value: '6', label: 'پایه ششم' },
  { value: '7', label: 'پایه هفتم' },
  { value: '8', label: 'پایه هشتم' },
  { value: '9', label: 'پایه نهم' },
  { value: '10', label: 'پایه دهم' },
  { value: '11', label: 'پایه یازدهم' },
  { value: '12', label: 'پایه دوازدهم' },
];

const BRANCH_OPTIONS = [
  { value: 'general', label: 'عمومی' },
  { value: 'math', label: 'ریاضی' },
  { value: 'science', label: 'تجربی' },
  { value: 'humanities', label: 'انسانی' },
];

interface CurriculumEntry {
  id: number;
  gradeLevel: string;
  branch: string;
  courseName: string;
  weeklyHours: number;
  isSpecialized: boolean;
}

export default function CurriculumPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<CurriculumEntry[]>([]);
  const [selectedGrade, setSelectedGrade] = useState('10');
  const [selectedBranch, setSelectedBranch] = useState('general');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newEntry, setNewEntry] = useState({
    courseName: '',
    weeklyHours: '2',
    isSpecialized: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Load mock data
    const mockData: CurriculumEntry[] = [
      { id: 1, gradeLevel: '10', branch: 'general', courseName: 'دین و زندگی', weeklyHours: 2, isSpecialized: false },
      { id: 2, gradeLevel: '10', branch: 'general', courseName: 'فارسی', weeklyHours: 3, isSpecialized: false },
      { id: 3, gradeLevel: '10', branch: 'general', courseName: 'ریاضی', weeklyHours: 3, isSpecialized: false },
      { id: 4, gradeLevel: '10', branch: 'general', courseName: 'فیزیک', weeklyHours: 2, isSpecialized: false },
      { id: 5, gradeLevel: '10', branch: 'general', courseName: 'شیمی', weeklyHours: 2, isSpecialized: false },
    ];
    setEntries(mockData);
    setIsLoading(false);
  }, [router]);

  const filteredEntries = entries.filter(
    e => e.gradeLevel === selectedGrade && e.branch === selectedBranch
  );

  const handleAddEntry = () => {
    if (!newEntry.courseName) {
      toast({ title: 'خطا', description: 'نام درس را وارد کنید', variant: 'destructive' });
      return;
    }

    const entry: CurriculumEntry = {
      id: entries.length + 1,
      gradeLevel: selectedGrade,
      branch: selectedBranch,
      courseName: newEntry.courseName,
      weeklyHours: parseInt(newEntry.weeklyHours),
      isSpecialized: newEntry.isSpecialized,
    };

    setEntries([...entries, entry]);
    setIsAddDialogOpen(false);
    setNewEntry({ courseName: '', weeklyHours: '2', isSpecialized: false });
    toast({ title: 'موفق', description: 'درس اضافه شد' });
  };

  const handleDelete = (id: number) => {
    setEntries(entries.filter(e => e.id !== id));
    toast({ title: 'موفق', description: 'درس حذف شد' });
  };

  const handleLoadOfficial = () => {
    const key = selectedGrade + (selectedBranch !== 'general' ? `_${selectedBranch}` : '');
    const courses = OFFICIAL_CURRICULUM[key] || OFFICIAL_CURRICULUM[selectedGrade] || [];
    
    const newEntries = courses.map((course, idx) => ({
      id: entries.length + idx + 1,
      gradeLevel: selectedGrade,
      branch: selectedBranch,
      courseName: course,
      weeklyHours: 2,
      isSpecialized: selectedBranch !== 'general' && !['دین و زندگی', 'فارسی', 'نگارش', 'عربی', 'انگلیسی'].includes(course),
    }));

    // Remove existing entries for this grade/branch
    const filtered = entries.filter(e => !(e.gradeLevel === selectedGrade && e.branch === selectedBranch));
    setEntries([...filtered, ...newEntries]);
    toast({ title: 'موفق', description: `${newEntries.length} درس اضافه شد` });
  };

  const totalHours = filteredEntries.reduce((sum, e) => sum + e.weeklyHours, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">برنامه درسی</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleLoadOfficial}>
              <BookOpen className="ml-2 h-4 w-4" />
              بارگذاری رسمی
            </Button>
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
                    <Label>پایه تحصیلی</Label>
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_OPTIONS.map(g => (
                          <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {['10', '11', '12'].includes(selectedGrade) && (
                    <div className="space-y-2">
                      <Label>رشته</Label>
                      <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BRANCH_OPTIONS.map(b => (
                            <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="courseName">نام درس</Label>
                    <Input
                      id="courseName"
                      value={newEntry.courseName}
                      onChange={(e) => setNewEntry({ ...newEntry, courseName: e.target.value })}
                    />
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
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>انصراف</Button>
                  <Button onClick={handleAddEntry}>ذخیره</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="mb-2 block">پایه تحصیلی</Label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_OPTIONS.map(g => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {['10', '11', '12'].includes(selectedGrade) && (
                <div className="flex-1">
                  <Label className="mb-2 block">رشته</Label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCH_OPTIONS.map(b => (
                        <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex-1 text-left">
                <p className="text-sm text-muted-foreground">مجموع ساعت هفتگی</p>
                <p className="text-2xl font-bold">{totalHours}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">در حال بارگذاری...</div>
            ) : (
              <div className="divide-y">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{entry.courseName}</p>
                        {entry.isSpecialized && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                            تخصصی
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{entry.weeklyHours} ساعت</span>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredEntries.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    درسی ثبت نشده است
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
