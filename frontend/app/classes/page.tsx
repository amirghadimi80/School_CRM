'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Plus, Users, Eye, GraduationCap } from 'lucide-react';
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

interface Class {
  id: number;
  name: string;
  gradeLevel: string;
  teacherName: string;
  studentCount: number;
  roomNumber?: string;
  schedule?: string;
}

const GRADE_LEVELS = ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم', 'هفتم', 'هشتم', 'نهم', 'دهم', 'یازدهم', 'دوازدهم'];
const TEACHERS = ['علی کریمی', 'سارا نوری', 'رضا محمدی', 'مریم احمدی', 'حسن رضایی'];

export default function ClassesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const [newClass, setNewClass] = useState({
    name: '',
    gradeLevel: '',
    teacherName: '',
    roomNumber: '',
    schedule: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    setClasses([
      { id: 1, name: '101', gradeLevel: 'دهم', teacherName: 'علی کریمی', studentCount: 25, roomNumber: '12', schedule: 'شنبه تا چهارشنبه 8-12' },
      { id: 2, name: '201', gradeLevel: 'یازدهم', teacherName: 'سارا نوری', studentCount: 22, roomNumber: '15', schedule: 'شنبه تا چهارشنبه 8-12' },
      { id: 3, name: '301', gradeLevel: 'دوازدهم', teacherName: 'رضا محمدی', studentCount: 28, roomNumber: '18', schedule: 'شنبه تا چهارشنبه 8-12' },
    ]);
    setIsLoading(false);
  }, [router]);

  const handleAddClass = () => {
    if (!newClass.name || !newClass.gradeLevel || !newClass.teacherName) {
      toast({ title: 'خطا', description: 'لطفاً نام کلاس، پایه و معلم را انتخاب کنید', variant: 'destructive' });
      return;
    }

    const cls: Class = {
      id: classes.length + 1,
      ...newClass,
      studentCount: 0,
    };

    setClasses([...classes, cls]);
    setIsAddDialogOpen(false);
    setNewClass({ name: '', gradeLevel: '', teacherName: '', roomNumber: '', schedule: '' });
    toast({ title: 'موفق', description: 'کلاس با موفقیت اضافه شد' });
  };

  const handleViewClass = (cls: Class) => {
    setSelectedClass(cls);
    setIsViewDialogOpen(true);
  };

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
                  <Input id="name" placeholder="مثال: 101" value={newClass.name} onChange={(e) => setNewClass({...newClass, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>پایه تحصیلی</Label>
                  <Select value={newClass.gradeLevel} onValueChange={(value) => setNewClass({...newClass, gradeLevel: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_LEVELS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>معلم</Label>
                  <Select value={newClass.teacherName} onValueChange={(value) => setNewClass({...newClass, teacherName: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEACHERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">شماره کلاس</Label>
                  <Input id="roomNumber" value={newClass.roomNumber} onChange={(e) => setNewClass({...newClass, roomNumber: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">برنامه زمانی</Label>
                  <Input id="schedule" placeholder="مثال: شنبه تا چهارشنبه 8-12" value={newClass.schedule} onChange={(e) => setNewClass({...newClass, schedule: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>انصراف</Button>
                <Button onClick={handleAddClass}>ذخیره</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full text-center py-8">در حال بارگذاری...</div>
          ) : (
            classes.map((cls) => (
              <Card key={cls.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewClass(cls)}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-bold">کلاس {cls.name}</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">پایه {cls.gradeLevel}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{cls.studentCount} دانش‌آموز</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{cls.teacherName}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>اطلاعات کلاس</DialogTitle>
            </DialogHeader>
            {selectedClass && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="h-16 w-16 rounded-full bg-purple-50 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">کلاس {selectedClass.name}</h3>
                    <p className="text-muted-foreground">پایه {selectedClass.gradeLevel}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>معلم: {selectedClass.teacherName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClass.studentCount} دانش‌آموز</span>
                  </div>
                </div>
                {selectedClass.roomNumber && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">شماره کلاس</Label>
                    <p>{selectedClass.roomNumber}</p>
                  </div>
                )}
                {selectedClass.schedule && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">برنامه زمانی</Label>
                    <p>{selectedClass.schedule}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)}>بستن</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
