'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Plus, Search, Eye, Phone, Mail, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';
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

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  employeeId: string;
  specialization: string;
  status: string;
  phone?: string;
  email?: string;
  degree?: string;
  experience?: number;
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
    degree: '',
    experience: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    setTeachers([
      { id: 1, firstName: 'علی', lastName: 'کریمی', employeeId: 'TCH001', specialization: 'ریاضی', status: 'active', phone: '09123456789', email: 'karimi@example.com', degree: 'کارشناسی ارشد', experience: 10 },
      { id: 2, firstName: 'سارا', lastName: 'نوری', employeeId: 'TCH002', specialization: 'فیزیک', status: 'active', phone: '09129876543', email: 'nouri@example.com', degree: 'دکتری', experience: 8 },
    ]);
    setIsLoading(false);
  }, [router]);

  const filteredTeachers = teachers.filter(t => 
    t.firstName.includes(searchQuery) || 
    t.lastName.includes(searchQuery) || 
    t.employeeId.includes(searchQuery)
  );

  const handleAddTeacher = () => {
    if (!newTeacher.firstName || !newTeacher.lastName || !newTeacher.employeeId) {
      toast({ title: 'خطا', description: 'لطفاً نام، نام خانوادگی و کد پرسنلی را وارد کنید', variant: 'destructive' });
      return;
    }

    const teacher: Teacher = {
      id: teachers.length + 1,
      ...newTeacher,
      experience: Number(newTeacher.experience) || 0,
      status: 'active',
    };

    setTeachers([...teachers, teacher]);
    setIsAddDialogOpen(false);
    setNewTeacher({ firstName: '', lastName: '', employeeId: '', specialization: '', phone: '', email: '', degree: '', experience: '' });
    toast({ title: 'موفق', description: 'معلم با موفقیت اضافه شد' });
  };

  const handleViewTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsViewDialogOpen(true);
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
                    <Label htmlFor="degree">مدرک تحصیلی</Label>
                    <Input id="degree" value={newTeacher.degree} onChange={(e) => setNewTeacher({...newTeacher, degree: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">سابقه (سال)</Label>
                    <Input id="experience" type="number" value={newTeacher.experience} onChange={(e) => setNewTeacher({...newTeacher, experience: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">شماره تماس</Label>
                    <Input id="phone" value={newTeacher.phone} onChange={(e) => setNewTeacher({...newTeacher, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">ایمیل</Label>
                    <Input id="email" type="email" value={newTeacher.email} onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>انصراف</Button>
                  <Button onClick={handleAddTeacher}>ذخیره</Button>
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
                        <p className="font-medium">{teacher.firstName} {teacher.lastName}</p>
                        <p className="text-sm text-muted-foreground">
                          {teacher.employeeId} • {teacher.specialization}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleViewTeacher(teacher)}>
                      <Eye className="ml-2 h-4 w-4" />
                      مشاهده
                    </Button>
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
                    <h3 className="text-xl font-bold">{selectedTeacher.firstName} {selectedTeacher.lastName}</h3>
                    <p className="text-muted-foreground">{selectedTeacher.employeeId}</p>
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
                {selectedTeacher.degree && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">مدرک تحصیلی</Label>
                    <p>{selectedTeacher.degree}</p>
                  </div>
                )}
                {selectedTeacher.experience !== undefined && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">سابقه</Label>
                    <p>{selectedTeacher.experience} سال</p>
                  </div>
                )}
                {selectedTeacher.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedTeacher.phone}</span>
                  </div>
                )}
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
