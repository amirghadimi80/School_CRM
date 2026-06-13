'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, Search, Eye, GraduationCap, Phone, Mail, Wallet, ArrowDownLeft, ArrowUpRight, RefreshCw, Upload, ImageIcon, User, FolderOpen } from 'lucide-react';
import { FormSection } from '@/components/students/form-section';
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

interface Invoice {
  id: number;
  invoiceNumber: string;
  amount: number;
  paidAmount: number;
  status: 'pending' | 'paid' | 'partial' | 'overdue';
  feeType: string;
  issueDate: string;
  dueDate: string;
}

interface Payment {
  id: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  studentCode: string;
  gradeLevel: string;
  className: string;
  status: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  address?: string;
  balance: number;
  invoices: Invoice[];
  payments: Payment[];
}

interface ApiStudent {
  id: number;
  student_code: string;
  full_name: string;
  email?: string;
  phone?: string;
  grade_level: string;
  class_name?: string | null;
  status: string;
}

function mapApiStudent(student: ApiStudent): Student {
  const nameParts = student.full_name.trim().split(/\s+/);
  return {
    id: student.id,
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    studentCode: student.student_code,
    gradeLevel: student.grade_level,
    className: student.class_name || '—',
    status: student.status,
    phone: student.phone,
    email: student.email,
    balance: 0,
    invoices: [],
    payments: [],
  };
}
const GRADE_LEVELS = ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم', 'هفتم', 'هشتم', 'نهم', 'دهم', 'یازدهم', 'دوازدهم'];
const FEE_TYPES = ['شهریه', 'ثبت‌نام', 'کتاب', ' uniform', 'بلیط', 'آزمون', 'سایر'];

interface ClassOption {
  id: number;
  name: string;
}

export default function StudentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [registrationFiles, setRegistrationFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    studentCode: '',
    gradeLevel: '',
    classId: '',
    phone: '',
    fatherPhone: '',
    motherPhone: '',
    birthDate: '',
  });

  const resetNewStudentForm = () => {
    setNewStudent({
      firstName: '', lastName: '', nationalId: '', studentCode: '',
      gradeLevel: '', classId: '', phone: '', fatherPhone: '', motherPhone: '', birthDate: '',
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setRegistrationFiles([]);
  };

  const handleNationalIdChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    setNewStudent((prev) => ({ ...prev, nationalId: digits, studentCode: digits }));
  };

  const handleGenerateCode = async () => {
    setIsGeneratingCode(true);
    try {
      const res = await api.generateStudentCode();
      handleNationalIdChange(res.national_id);
    } catch {
      toast({ title: 'خطا', description: 'تولید کد ناموفق بود', variant: 'destructive' });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleRegistrationFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) setRegistrationFiles((prev) => [...prev, ...files]);
  };

  const [newInvoice, setNewInvoice] = useState({
    feeType: '',
    amount: '',
    description: '',
    dueDate: '',
  });

  const [newPayment, setNewPayment] = useState({
    amount: '',
    paymentMethod: 'cash',
    reference: '',
    description: '',
  });

  const loadStudents = async () => {
    const response = await api.getStudents({ status: 'active' });
    const list = Array.isArray(response) ? response : response.results || [];
    setStudents(list.map((item: ApiStudent) => mapApiStudent(item)));
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const load = async () => {
      try {
        await loadStudents();
      } catch {
        toast({ title: 'خطا', description: 'بارگذاری دانش‌آموزان ناموفق بود', variant: 'destructive' });
      }

      try {
        const classesRes = await api.getClasses();
        const classList = Array.isArray(classesRes) ? classesRes : classesRes.results || [];
        setClasses(classList.map((c: ClassOption) => ({ id: c.id, name: c.name })));
      } catch {
        // کلاس‌ها اختیاری‌اند
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [router, toast]);

  const filteredStudents = students.filter(s => 
    s.firstName.includes(searchQuery) || 
    s.lastName.includes(searchQuery) || 
    s.studentCode.includes(searchQuery)
  );

  const handleAddStudent = async () => {
    if (!newStudent.firstName || !newStudent.lastName || !newStudent.nationalId) {
      toast({ title: 'خطا', description: 'نام، نام خانوادگی و کد ملی الزامی است', variant: 'destructive' });
      return;
    }
    if (newStudent.nationalId.length !== 10) {
      toast({ title: 'خطا', description: 'کد ملی باید ۱۰ رقم باشد', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const created = await api.createStudent({
        first_name: newStudent.firstName,
        last_name: newStudent.lastName,
        national_id: newStudent.nationalId,
        ...(newStudent.birthDate ? { birth_date: newStudent.birthDate } : {}),
        phone: newStudent.phone,
        father_phone: newStudent.fatherPhone,
        mother_phone: newStudent.motherPhone,
        ...(newStudent.gradeLevel ? { grade_level: newStudent.gradeLevel } : {}),
        ...(newStudent.classId ? { current_class: Number(newStudent.classId) } : {}),
      });

      if (avatarFile) {
        await api.uploadStudentAvatar(created.id, avatarFile);
      }
      for (const file of registrationFiles) {
        await api.uploadStudentDocument(created.id, file);
      }

      await loadStudents();
      setIsAddDialogOpen(false);
      resetNewStudentForm();
      toast({ title: 'موفق', description: 'دانش‌آموز با موفقیت اضافه شد' });
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string[] | string> } })?.response?.data;
      const msg = typeof data?.national_id === 'object' ? data.national_id[0]
        : typeof data?.student_code === 'object' ? data.student_code[0]
        : typeof data?.detail === 'string' ? data.detail
        : 'افزودن دانش‌آموز ناموفق بود';
      toast({ title: 'خطا', description: msg, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };

  const handleOpenInvoiceDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsInvoiceDialogOpen(true);
  };

  const handleOpenPaymentDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsPaymentDialogOpen(true);
  };

  const handleAddInvoice = () => {
    if (!selectedStudent || !newInvoice.feeType || !newInvoice.amount) {
      toast({ title: 'خطا', description: 'لطفاً نوع هزینه و مبلغ را وارد کنید', variant: 'destructive' });
      return;
    }

    const invoice: Invoice = {
      id: Date.now(),
      invoiceNumber: `INV-${Date.now()}`,
      amount: Number(newInvoice.amount),
      paidAmount: 0,
      status: 'pending',
      feeType: newInvoice.feeType,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: newInvoice.dueDate || new Date().toISOString().split('T')[0],
    };

    const updatedStudents = students.map(s => {
      if (s.id === selectedStudent.id) {
        return {
          ...s,
          invoices: [...s.invoices, invoice],
          balance: s.balance - Number(newInvoice.amount),
        };
      }
      return s;
    });

    setStudents(updatedStudents);
    setSelectedStudent({
      ...selectedStudent,
      invoices: [...selectedStudent.invoices, invoice],
      balance: selectedStudent.balance - Number(newInvoice.amount),
    });
    setIsInvoiceDialogOpen(false);
    setNewInvoice({ feeType: '', amount: '', description: '', dueDate: '' });
    toast({ title: 'موفق', description: `صورتحساب ${newInvoice.feeType} به مبلغ ${Number(newInvoice.amount).toLocaleString()} تومان ثبت شد` });
  };

  const handleAddPayment = () => {
    if (!selectedStudent || !newPayment.amount) {
      toast({ title: 'خطا', description: 'لطفاً مبلغ پرداخت را وارد کنید', variant: 'destructive' });
      return;
    }

    const payment: Payment = {
      id: Date.now(),
      amount: Number(newPayment.amount),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: newPayment.paymentMethod,
      reference: newPayment.reference,
    };

    const updatedStudents = students.map(s => {
      if (s.id === selectedStudent.id) {
        return {
          ...s,
          payments: [...s.payments, payment],
          balance: s.balance + Number(newPayment.amount),
        };
      }
      return s;
    });

    setStudents(updatedStudents);
    setSelectedStudent({
      ...selectedStudent,
      payments: [...selectedStudent.payments, payment],
      balance: selectedStudent.balance + Number(newPayment.amount),
    });
    setIsPaymentDialogOpen(false);
    setNewPayment({ amount: '', paymentMethod: 'cash', reference: '', description: '' });
    toast({ title: 'موفق', description: `پرداخت ${Number(newPayment.amount).toLocaleString()} تومان ثبت شد` });
  };

  const getBalanceColor = (balance: number) => {
    if (balance < 0) return 'text-red-600';
    if (balance > 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const getBalanceText = (balance: number) => {
    if (balance < 0) return `بدهکار: ${Math.abs(balance).toLocaleString()} ت`;
    if (balance > 0) return `بستانکار: ${balance.toLocaleString()} ت`;
    return 'تسویه';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      pending: 'در انتظار',
      paid: 'پرداخت شده',
      partial: 'پرداخت جزئی',
      overdue: 'سررسید',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">دانش‌آموزان</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                دانش‌آموز جدید
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto border-0 p-0 gap-0">
              <div className="rounded-t-lg bg-gradient-to-l from-primary/10 via-blue-50 to-indigo-50 px-6 py-5 border-b border-blue-100/80">
                <DialogHeader className="space-y-1 text-right">
                  <DialogTitle className="text-xl text-slate-800">افزودن دانش‌آموز جدید</DialogTitle>
                  <DialogDescription className="text-slate-600">
                    فقط نام، نام خانوادگی و کد ملی الزامی است. بقیه اطلاعات را می‌توانید بعداً یا توسط خود دانش‌آموز تکمیل کنید.
                  </DialogDescription>
                </DialogHeader>
              </div>
              <div className="grid gap-4 px-6 py-5">
                <FormSection title="اطلاعات هویتی" icon={User} accent="blue">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-slate-700">نام *</Label>
                        <Input id="firstName" className="border-blue-100 bg-white/80 focus-visible:ring-blue-300" value={newStudent.firstName} onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-slate-700">نام خانوادگی *</Label>
                        <Input id="lastName" className="border-blue-100 bg-white/80 focus-visible:ring-blue-300" value={newStudent.lastName} onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nationalId" className="text-slate-700">کد ملی *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="nationalId"
                            inputMode="numeric"
                            maxLength={10}
                            value={newStudent.nationalId}
                            onChange={(e) => handleNationalIdChange(e.target.value)}
                            placeholder="۱۰ رقم"
                            className="border-blue-100 bg-white/80 focus-visible:ring-blue-300"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleGenerateCode}
                            disabled={isGeneratingCode}
                            title="تولید کد یکتا"
                            className="shrink-0 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                          >
                            <RefreshCw className={`h-4 w-4 ${isGeneratingCode ? 'animate-spin' : ''}`} />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studentCode" className="text-slate-700">کد دانش‌آموزی</Label>
                        <Input id="studentCode" value={newStudent.studentCode} readOnly className="border-indigo-100 bg-indigo-50/70 font-medium text-indigo-900" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthDate" className="text-slate-700">تاریخ تولد</Label>
                      <Input id="birthDate" type="date" className="border-blue-100 bg-white/80 focus-visible:ring-blue-300" value={newStudent.birthDate} onChange={(e) => setNewStudent({ ...newStudent, birthDate: e.target.value })} />
                    </div>
                  </div>
                </FormSection>

                <FormSection title="اطلاعات تماس" icon={Phone} accent="emerald">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-700">موبایل دانش‌آموز</Label>
                      <Input id="phone" className="border-emerald-100 bg-white/80 focus-visible:ring-emerald-300" value={newStudent.phone} onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fatherPhone" className="text-slate-700">موبایل پدر</Label>
                      <Input id="fatherPhone" className="border-emerald-100 bg-white/80 focus-visible:ring-emerald-300" value={newStudent.fatherPhone} onChange={(e) => setNewStudent({ ...newStudent, fatherPhone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motherPhone" className="text-slate-700">موبایل مادر</Label>
                      <Input id="motherPhone" className="border-emerald-100 bg-white/80 focus-visible:ring-emerald-300" value={newStudent.motherPhone} onChange={(e) => setNewStudent({ ...newStudent, motherPhone: e.target.value })} />
                    </div>
                  </div>
                </FormSection>

                <FormSection title="اطلاعات تحصیلی (اختیاری)" icon={GraduationCap} accent="violet">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700">پایه تحصیلی</Label>
                      <Select value={newStudent.gradeLevel} onValueChange={(value) => setNewStudent({ ...newStudent, gradeLevel: value })}>
                        <SelectTrigger className="border-violet-100 bg-white/80"><SelectValue placeholder="انتخاب کنید" /></SelectTrigger>
                        <SelectContent>
                          {GRADE_LEVELS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700">کلاس</Label>
                      <Select value={newStudent.classId} onValueChange={(value) => setNewStudent({ ...newStudent, classId: value })}>
                        <SelectTrigger className="border-violet-100 bg-white/80"><SelectValue placeholder={classes.length ? 'انتخاب کنید' : 'کلاسی تعریف نشده'} /></SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </FormSection>

                <FormSection title="پرونده ثبت‌نام" icon={FolderOpen} accent="amber">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-slate-700">عکس پرسنلی ۳×۴</Label>
                      <div className="flex items-start gap-4">
                        <div className="flex h-28 w-[84px] items-center justify-center overflow-hidden rounded-lg border-2 border-amber-200 bg-amber-50/50 shadow-inner">
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="پیش‌نمایش" className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-8 w-8 text-amber-400" />
                          )}
                        </div>
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-sm text-amber-900 transition-colors hover:bg-amber-100">
                          <Upload className="h-4 w-4" />
                          انتخاب عکس
                          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700">فایل‌های ثبت‌نام</Label>
                      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-amber-200 bg-amber-50/40 px-3 py-6 text-sm text-amber-900 transition-colors hover:border-amber-300 hover:bg-amber-50">
                        <Upload className="h-5 w-5 text-amber-500" />
                        آپلود فایل (چند فایل)
                        <input type="file" multiple className="hidden" onChange={handleRegistrationFilesChange} />
                      </label>
                      {registrationFiles.length > 0 && (
                        <ul className="space-y-1 rounded-md bg-white/70 p-2 text-xs text-amber-900/80">
                          {registrationFiles.map((f, i) => (
                            <li key={`${f.name}-${i}`} className="truncate">• {f.name}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </FormSection>
              </div>
              <DialogFooter className="border-t border-slate-100 bg-slate-50/80 px-6 py-4">
                <Button variant="outline" className="border-slate-200" onClick={() => { setIsAddDialogOpen(false); resetNewStudentForm(); }}>انصراف</Button>
                <Button onClick={handleAddStudent} disabled={isSaving} className="bg-gradient-to-l from-primary to-blue-600 shadow-md hover:from-primary/90 hover:to-blue-600/90">
                  {isSaving ? 'در حال ذخیره...' : 'ذخیره دانش‌آموز'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="جستجوی دانش‌آموز..."
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
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                هنوز دانش‌آموزی ثبت نشده است
              </div>
            ) : (
              <div className="divide-y">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{student.firstName} {student.lastName}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.studentCode} • {student.gradeLevel} • کلاس {student.className}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`text-sm font-medium ${getBalanceColor(student.balance)}`}>
                        {getBalanceText(student.balance)}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleOpenPaymentDialog(student)}>
                        <ArrowDownLeft className="ml-1 h-4 w-4 text-green-600" />
                        دریافت
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleOpenInvoiceDialog(student)}>
                        <ArrowUpRight className="ml-1 h-4 w-4 text-red-600" />
                        شهریه
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewStudent(student)}>
                        <Eye className="ml-1 h-4 w-4" />
                        مشاهده
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Dialog */}
        <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>ثبت صورتحساب جدید</DialogTitle>
              <DialogDescription>
                {selectedStudent && `برای: ${selectedStudent.firstName} ${selectedStudent.lastName}`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>نوع هزینه</Label>
                <Select value={newInvoice.feeType} onValueChange={(value) => setNewInvoice({...newInvoice, feeType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEE_TYPES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>مبلغ (تومان)</Label>
                <Input 
                  type="number" 
                  value={newInvoice.amount} 
                  onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                  placeholder="مثلاً 3000000"
                />
              </div>
              <div className="space-y-2">
                <Label>تاریخ سررسید</Label>
                <Input 
                  type="date" 
                  value={newInvoice.dueDate} 
                  onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>توضیحات</Label>
                <Input 
                  value={newInvoice.description} 
                  onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                  placeholder="توضیحات اختیاری"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>انصراف</Button>
              <Button onClick={handleAddInvoice}>ثبت صورتحساب</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>ثبت پرداخت</DialogTitle>
              <DialogDescription>
                {selectedStudent && `برای: ${selectedStudent.firstName} ${selectedStudent.lastName}`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="p-3 bg-gray-50 rounded">
                <span className="text-sm text-muted-foreground">مانده حساب: </span>
                <span className={`font-bold ${selectedStudent ? getBalanceColor(selectedStudent.balance) : ''}`}>
                  {selectedStudent ? getBalanceText(selectedStudent.balance) : '-'}
                </span>
              </div>
              <div className="space-y-2">
                <Label>مبلغ پرداخت (تومان)</Label>
                <Input 
                  type="number" 
                  value={newPayment.amount} 
                  onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                  placeholder="مثلاً 1000000"
                />
              </div>
              <div className="space-y-2">
                <Label>روش پرداخت</Label>
                <Select value={newPayment.paymentMethod} onValueChange={(value) => setNewPayment({...newPayment, paymentMethod: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدی</SelectItem>
                    <SelectItem value="card">کارت به کارت</SelectItem>
                    <SelectItem value="pos">پوز</SelectItem>
                    <SelectItem value="check">چک</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>شماره پیگیری / رسید</Label>
                <Input 
                  value={newPayment.reference} 
                  onChange={(e) => setNewPayment({...newPayment, reference: e.target.value})}
                  placeholder="اختیاری"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>انصراف</Button>
              <Button onClick={handleAddPayment}>ثبت پرداخت</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Student Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>اطلاعات دانش‌آموز</DialogTitle>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-6 py-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                    <p className="text-muted-foreground">{selectedStudent.studentCode}</p>
                  </div>
                  <div className="mr-auto text-left">
                    <p className="text-sm text-muted-foreground">وضعیت مالی:</p>
                    <p className={`font-bold ${getBalanceColor(selectedStudent.balance)}`}>
                      {getBalanceText(selectedStudent.balance)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">پایه:</span>
                    <span>{selectedStudent.gradeLevel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">کلاس:</span>
                    <span>{selectedStudent.className}</span>
                  </div>
                </div>

                {selectedStudent.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedStudent.phone}</span>
                  </div>
                )}
                {selectedStudent.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedStudent.email}</span>
                  </div>
                )}

                {/* Invoices Section */}
                <div className="border rounded-lg">
                  <div className="p-3 bg-gray-50 border-b flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    <span className="font-medium">صورتحساب‌ها</span>
                  </div>
                  <div className="divide-y">
                    {selectedStudent.invoices.length === 0 ? (
                      <p className="p-4 text-center text-muted-foreground">صورتحسابی ثبت نشده</p>
                    ) : (
                      selectedStudent.invoices.map(inv => (
                        <div key={inv.id} className="p-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{inv.feeType}</p>
                            <p className="text-sm text-muted-foreground">{inv.invoiceNumber}</p>
                          </div>
                          <div className="text-left">
                            <p className="font-medium">{inv.amount.toLocaleString()} ت</p>
                            <div className="mt-1">{getStatusBadge(inv.status)}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Payments Section */}
                <div className="border rounded-lg">
                  <div className="p-3 bg-gray-50 border-b flex items-center gap-2">
                    <ArrowDownLeft className="h-5 w-5 text-green-600" />
                    <span className="font-medium">پرداخت‌ها</span>
                  </div>
                  <div className="divide-y">
                    {selectedStudent.payments.length === 0 ? (
                      <p className="p-4 text-center text-muted-foreground">پرداختی ثبت نشده</p>
                    ) : (
                      selectedStudent.payments.map(pay => (
                        <div key={pay.id} className="p-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-green-600">{pay.amount.toLocaleString()} تومان</p>
                            <p className="text-sm text-muted-foreground">{pay.paymentMethod}</p>
                          </div>
                          <span className="text-sm text-muted-foreground">{pay.paymentDate}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
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
