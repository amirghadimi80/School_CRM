'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, Search, Eye, GraduationCap, Phone, Mail, Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
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

const GRADE_LEVELS = ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم', 'هفتم', 'هشتم', 'نهم', 'دهم', 'یازدهم', 'دوازدهم'];
const CLASS_NAMES = ['101', '102', '103', '201', '202', '203', '301', '302', '303'];
const FEE_TYPES = ['شهریه', 'ثبت‌نام', 'کتاب', ' uniform', 'بلیط', 'آزمون', 'سایر'];

export default function StudentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    studentCode: '',
    gradeLevel: '',
    className: '',
    phone: '',
    email: '',
    birthDate: '',
    address: '',
  });

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

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    setStudents([
      { 
        id: 1, 
        firstName: 'علی', 
        lastName: 'احمدی', 
        studentCode: 'STD001', 
        gradeLevel: 'دهم', 
        className: '101', 
        status: 'active', 
        phone: '09123456789', 
        email: 'ali@example.com', 
        birthDate: '1385/01/15', 
        address: 'تهران، خیابان آزادی',
        balance: -2500000,
        invoices: [
          { id: 1, invoiceNumber: 'INV-001', amount: 3000000, paidAmount: 500000, status: 'partial', feeType: 'شهریه', issueDate: '1403/01/01', dueDate: '1403/01/15' },
        ],
        payments: [
          { id: 1, amount: 500000, paymentDate: '1403/01/10', paymentMethod: 'کارت به کارت', reference: '12345' },
        ],
      },
      { 
        id: 2, 
        firstName: 'مریم', 
        lastName: 'رضایی', 
        studentCode: 'STD002', 
        gradeLevel: 'یازدهم', 
        className: '201', 
        status: 'active', 
        phone: '09129876543', 
        email: 'maryam@example.com', 
        birthDate: '1384/05/20', 
        address: 'تهران، خیابان انقلاب',
        balance: 0,
        invoices: [
          { id: 2, invoiceNumber: 'INV-002', amount: 3500000, paidAmount: 3500000, status: 'paid', feeType: 'شهریه', issueDate: '1403/01/01', dueDate: '1403/01/15' },
        ],
        payments: [
          { id: 2, amount: 3500000, paymentDate: '1403/01/05', paymentMethod: 'نقدی', reference: '12346' },
        ],
      },
      { 
        id: 3, 
        firstName: 'حسن', 
        lastName: 'محمدی', 
        studentCode: 'STD003', 
        gradeLevel: 'دوازدهم', 
        className: '301', 
        status: 'active', 
        phone: '09121234567', 
        email: 'hasan@example.com', 
        birthDate: '1383/11/10', 
        address: 'تهران، خیابان ولیعصر',
        balance: -4000000,
        invoices: [
          { id: 3, invoiceNumber: 'INV-003', amount: 4000000, paidAmount: 0, status: 'pending', feeType: 'شهریه', issueDate: '1403/01/01', dueDate: '1403/01/15' },
        ],
        payments: [],
      },
    ]);
    setIsLoading(false);
  }, [router]);

  const filteredStudents = students.filter(s => 
    s.firstName.includes(searchQuery) || 
    s.lastName.includes(searchQuery) || 
    s.studentCode.includes(searchQuery)
  );

  const handleAddStudent = () => {
    if (!newStudent.firstName || !newStudent.lastName || !newStudent.studentCode) {
      toast({ title: 'خطا', description: 'لطفاً نام، نام خانوادگی و کد دانش‌آموزی را وارد کنید', variant: 'destructive' });
      return;
    }
    
    const student: Student = {
      id: students.length + 1,
      ...newStudent,
      status: 'active',
      balance: 0,
      invoices: [],
      payments: [],
    };
    
    setStudents([...students, student]);
    setIsAddDialogOpen(false);
    setNewStudent({ firstName: '', lastName: '', studentCode: '', gradeLevel: '', className: '', phone: '', email: '', birthDate: '', address: '' });
    toast({ title: 'موفق', description: 'دانش‌آموز با موفقیت اضافه شد' });
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
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>افزودن دانش‌آموز جدید</DialogTitle>
                <DialogDescription>اطلاعات دانش‌آموز را وارد کنید</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">نام</Label>
                    <Input id="firstName" value={newStudent.firstName} onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">نام خانوادگی</Label>
                    <Input id="lastName" value={newStudent.lastName} onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentCode">کد دانش‌آموزی</Label>
                  <Input id="studentCode" value={newStudent.studentCode} onChange={(e) => setNewStudent({...newStudent, studentCode: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>پایه تحصیلی</Label>
                    <Select value={newStudent.gradeLevel} onValueChange={(value) => setNewStudent({...newStudent, gradeLevel: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_LEVELS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>کلاس</Label>
                    <Select value={newStudent.className} onValueChange={(value) => setNewStudent({...newStudent, className: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_NAMES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">شماره تماس</Label>
                  <Input id="phone" value={newStudent.phone} onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input id="email" type="email" value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>انصراف</Button>
                <Button onClick={handleAddStudent}>ذخیره</Button>
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
