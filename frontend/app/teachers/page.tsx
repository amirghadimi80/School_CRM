'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Plus, Search, Eye, Phone, Mail, BookOpen, Clock, ChevronDown, UserCircle, Pencil, Trash2, FileDown } from 'lucide-react';
import Link from 'next/link';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Teacher {
  id: number;
  full_name: string;
  employee_id: string;
  specialization: string;
  status: string;
  email?: string;
}

const SPECIALIZATIONS = ['ریاضی', 'فیزیک', 'شیمی', 'زیست‌شناسی', 'ادبیات فارسی', 'عربی', 'تاریخ', 'جغرافیا', 'انگلیسی', 'ورزش'];

export default function TeachersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const [newTeacher, setNewTeacher] = useState({
    firstName: '',
    lastName: '',
    employeeId: '',
    specialization: '',
    phone: '',
    email: '',
    password: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const [academicYear, setAcademicYear] = useState('');

  const loadTeachers = async () => {
    const teachersRes = await api.getTeachers({ status: 'active' });
    const list = Array.isArray(teachersRes) ? teachersRes : teachersRes.results || [];
    setTeachers(list);
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const load = async () => {
      try {
        await loadTeachers();
      } catch {
        toast({ title: 'خطا', description: 'بارگذاری معلمان ناموفق بود', variant: 'destructive' });
      }

      try {
        const schoolRes = await api.getMySchool();
        setAcademicYear(schoolRes.current_academic_year || '');
      } catch {
        // سال تحصیلی اختیاری است
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [router, toast]);

  const filteredTeachers = teachers.filter(t =>
    t.full_name.includes(searchQuery) ||
    t.employee_id.includes(searchQuery) ||
    t.specialization.includes(searchQuery)
  );

  const handleDownloadGradebook = async (teacher: Teacher) => {
    try {
      const blob = await api.downloadTeacherGradebook(teacher.id, academicYear || undefined);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `gradebook_${teacher.employee_id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast({ title: 'موفق', description: 'دفتر کلاسی دانلود شد' });
    } catch {
      toast({ title: 'خطا', description: 'دانلود دفتر کلاسی ناموفق بود', variant: 'destructive' });
    }
  };

  const handleAddTeacher = async () => {
    if (!newTeacher.firstName || !newTeacher.lastName || !newTeacher.email || !newTeacher.password) {
      toast({ title: 'خطا', description: 'نام، نام خانوادگی، ایمیل و رمز عبور الزامی است', variant: 'destructive' });
      return;
    }
    if (!newTeacher.employeeId) {
      toast({ title: 'خطا', description: 'کد پرسنلی الزامی است', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const created = await api.createTeacher({
        first_name: newTeacher.firstName,
        last_name: newTeacher.lastName,
        email: newTeacher.email,
        phone: newTeacher.phone,
        password: newTeacher.password,
        employee_id: newTeacher.employeeId,
        specialization: newTeacher.specialization,
      });
      setTeachers((prev) => [...prev, created]);
      setIsAddDialogOpen(false);
      setNewTeacher({
        firstName: '', lastName: '', employeeId: '', specialization: '',
        phone: '', email: '', password: '',
      });
      toast({ title: 'موفق', description: 'معلم با موفقیت اضافه شد' });
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string[] | string> } })?.response?.data;
      const msg = typeof data?.email === 'object' ? data.email[0]
        : typeof data?.employee_id === 'object' ? data.employee_id[0]
        : typeof data?.detail === 'string' ? data.detail
        : 'افزودن معلم ناموفق بود';
      toast({ title: 'خطا', description: msg, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsViewDialogOpen(true);
  };

  const handleEditTeacher = () => {
    toast({ title: 'راهنما', description: 'ویرایش معلم از پنل مدیریت کاربران انجام می‌شود.' });
  };

  const handleDeleteTeacher = (teacherId: number) => {
    if (!confirm('آیا از حذف این معلم اطمینان دارید؟')) return;

    setTeachers(teachers.filter(t => t.id !== teacherId));
    toast({ title: 'موفق', description: 'معلم حذف شد', variant: 'destructive' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">معلمان</h1>
          <div className="flex gap-2">
            <Link href="/teachers/availability">
              <Button variant="outline">
                <Clock className="ml-2 h-4 w-4" />
                زمان‌بندی
              </Button>
            </Link>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  معلم جدید
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>افزودن معلم جدید</DialogTitle>
                  <DialogDescription>اطلاعات معلم را وارد کنید</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">نام</Label>
                      <Input id="firstName" value={newTeacher.firstName} onChange={(e) => setNewTeacher({...newTeacher, firstName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">نام خانوادگی</Label>
                      <Input id="lastName" value={newTeacher.lastName} onChange={(e) => setNewTeacher({...newTeacher, lastName: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">کد پرسنلی</Label>
                    <Input id="employeeId" value={newTeacher.employeeId} onChange={(e) => setNewTeacher({...newTeacher, employeeId: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>تخصص</Label>
                    <Select value={newTeacher.specialization} onValueChange={(value) => setNewTeacher({...newTeacher, specialization: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALIZATIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">رمز عبور</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="حداقل ۶ کاراکتر"
                      value={newTeacher.password}
                      onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">شماره تماس</Label>
                    <Input id="phone" value={newTeacher.phone} onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">ایمیل</Label>
                    <Input id="email" type="email" value={newTeacher.email} onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>انصراف</Button>
                  <Button onClick={handleAddTeacher} disabled={isSaving}>
                    {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="جستجوی معلم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">در حال بارگذاری...</div>
            ) : (
              <div className="divide-y">
                {filteredTeachers.map((teacher) => (
                  <div key={teacher.id} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{teacher.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {teacher.employee_id} • {teacher.specialization}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          عملیات
                          <ChevronDown className="mr-1 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/teacher/dashboard?id=${teacher.id}`}>
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <UserCircle className="h-4 w-4" />
                            ورود به پنل استاد
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                          onClick={() => handleDownloadGradebook(teacher)}
                          className="gap-2 cursor-pointer"
                        >
                          <FileDown className="h-4 w-4" />
                          چاپ دفتر کلاسی
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditTeacher()} className="gap-2 cursor-pointer">
                          <Pencil className="h-4 w-4" />
                          ویرایش
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTeacher(teacher.id)} 
                          className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>اطلاعات معلم</DialogTitle>
            </DialogHeader>
            {selectedTeacher && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedTeacher.full_name}</h3>
                    <p className="text-muted-foreground">{selectedTeacher.employee_id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>تخصص: {selectedTeacher.specialization}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-sm ${selectedTeacher.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedTeacher.status === 'active' ? 'فعال' : 'غیرفعال'}
                    </span>
                  </div>
                </div>
                {selectedTeacher.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedTeacher.email}</span>
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
