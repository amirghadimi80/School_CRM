'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, Plus, TrendingUp, Star } from 'lucide-react';
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

interface Grade {
  id: number;
  studentName: string;
  courseName: string;
  score: number;
  maxScore: number;
  date: string;
  type: 'quiz' | 'midterm' | 'final' | 'homework';
}

const STUDENTS = ['علی احمدی', 'مریم رضایی', 'حسن محمدی', 'سارا کریمی', 'رضا نوری'];
const COURSES = ['ریاضی', 'فیزیک', 'شیمی', 'زیست‌شناسی', 'ادبیات فارسی', 'عربی', 'انگلیسی'];
const GRADE_TYPES = [
  { value: 'quiz', label: 'آزمون کوتاه' },
  { value: 'midterm', label: 'میان‌ترم' },
  { value: 'final', label: 'پایان‌ترم' },
  { value: 'homework', label: 'تکلیف' },
];

export default function GradesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newGrade, setNewGrade] = useState({
    studentName: '',
    courseName: '',
    score: '',
    maxScore: '20',
    type: 'quiz' as 'quiz' | 'midterm' | 'final' | 'homework',
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    setGrades([
      { id: 1, studentName: 'علی احمدی', courseName: 'ریاضی', score: 18.5, maxScore: 20, date: '1403/03/15', type: 'quiz' },
      { id: 2, studentName: 'مریم رضایی', courseName: 'فیزیک', score: 19, maxScore: 20, date: '1403/03/14', type: 'midterm' },
      { id: 3, studentName: 'حسن محمدی', courseName: 'شیمی', score: 16, maxScore: 20, date: '1403/03/13', type: 'final' },
    ]);
    setIsLoading(false);
  }, [router]);

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 70) return 'bg-blue-100 text-blue-800';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getTypeLabel = (type: string) => {
    const found = GRADE_TYPES.find(g => g.value === type);
    return found?.label || type;
  };

  const handleAddGrade = () => {
    if (!newGrade.studentName || !newGrade.courseName || !newGrade.score) {
      toast({ title: 'خطا', description: 'لطفاً همه فیلدها را پر کنید', variant: 'destructive' });
      return;
    }

    const scoreNum = Number(newGrade.score);
    const maxScoreNum = Number(newGrade.maxScore);

    if (scoreNum < 0 || scoreNum > maxScoreNum) {
      toast({ title: 'خطا', description: 'نمره باید بین 0 و حداکثر باشد', variant: 'destructive' });
      return;
    }

    const grade: Grade = {
      id: grades.length + 1,
      studentName: newGrade.studentName,
      courseName: newGrade.courseName,
      score: scoreNum,
      maxScore: maxScoreNum,
      type: newGrade.type,
      date: new Date().toLocaleDateString('fa-IR'),
    };

    setGrades([grade, ...grades]);
    setIsAddDialogOpen(false);
    setNewGrade({ studentName: '', courseName: '', score: '', maxScore: '20', type: 'quiz' });
    toast({ title: 'موفق', description: 'نمره با موفقیت ثبت شد' });
  };

  const stats = {
    avg: grades.length > 0 ? (grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 20, 0) / grades.length).toFixed(1) : '0',
    total: grades.length,
    excellent: grades.filter(g => (g.score / g.maxScore) * 100 >= 90).length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">نمرات</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                ثبت نمره جدید
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>ثبت نمره جدید</DialogTitle>
                <DialogDescription>نمره دانش‌آموز را وارد کنید</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>دانش‌آموز</Label>
                  <Select value={newGrade.studentName} onValueChange={(value) => setNewGrade({...newGrade, studentName: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {STUDENTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>درس</Label>
                  <Select value={newGrade.courseName} onValueChange={(value) => setNewGrade({...newGrade, courseName: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>نوع آزمون</Label>
                  <Select value={newGrade.type} onValueChange={(value: any) => setNewGrade({...newGrade, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_TYPES.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="score">نمره</Label>
                    <Input id="score" type="number" step="0.5" value={newGrade.score} onChange={(e) => setNewGrade({...newGrade, score: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxScore">حداکثر نمره</Label>
                    <Input id="maxScore" type="number" value={newGrade.maxScore} onChange={(e) => setNewGrade({...newGrade, maxScore: e.target.value})} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>انصراف</Button>
                <Button onClick={handleAddGrade}>ثبت</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل کل</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avg}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تعداد نمرات</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">دانش‌آموزان ممتاز</CardTitle>
              <Star className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.excellent}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>آخرین نمرات</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">در حال بارگذاری...</div>
            ) : (
              <div className="divide-y">
                {grades.map((grade) => (
                  <div key={grade.id} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{grade.studentName}</p>
                        <p className="text-sm text-muted-foreground">{grade.courseName} • {grade.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${getScoreBgColor(grade.score, grade.maxScore)}`}>
                        {getTypeLabel(grade.type)}
                      </span>
                      <span className={`text-xl font-bold ${getScoreColor(grade.score, grade.maxScore)}`}>
                        {grade.score} / {grade.maxScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
