'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
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

interface Payment {
  id: number;
  studentName: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  description: string;
  category: string;
}

const STUDENTS = ['علی احمدی', 'مریم رضایی', 'حسن محمدی', 'سارا کریمی', 'رضا نوری'];
const INCOME_CATEGORIES = ['شهریه', 'ثبت‌نام', 'کتاب', 'سایر'];
const EXPENSE_CATEGORIES = ['حقوق معلمان', 'تجهیزات', 'اجاره', 'آب و برق', 'سایر'];

export default function FinancePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newPayment, setNewPayment] = useState({
    studentName: '',
    amount: '',
    type: 'income' as 'income' | 'expense',
    description: '',
    category: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    setPayments([
      { id: 1, studentName: 'علی احمدی', amount: 2500000, type: 'income', date: '1403/03/15', description: 'شهریه بهار', category: 'شهریه' },
      { id: 2, studentName: 'مریم رضایی', amount: 2500000, type: 'income', date: '1403/03/14', description: 'شهریه بهار', category: 'شهریه' },
      { id: 3, studentName: '', amount: 500000, type: 'expense', date: '1403/03/13', description: 'خرید تجهیزات', category: 'تجهیزات' },
    ]);
    setIsLoading(false);
  }, [router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddPayment = () => {
    if (!newPayment.amount || !newPayment.description || !newPayment.category) {
      toast({ title: 'خطا', description: 'لطفاً همه فیلدها را پر کنید', variant: 'destructive' });
      return;
    }

    const amountNum = Number(newPayment.amount);
    if (amountNum <= 0) {
      toast({ title: 'خطا', description: 'مبلغ باید بزرگتر از صفر باشد', variant: 'destructive' });
      return;
    }

    const payment: Payment = {
      id: payments.length + 1,
      studentName: newPayment.studentName,
      amount: amountNum,
      type: newPayment.type,
      description: newPayment.description,
      category: newPayment.category,
      date: new Date().toLocaleDateString('fa-IR'),
    };

    setPayments([payment, ...payments]);
    setIsAddDialogOpen(false);
    setNewPayment({ studentName: '', amount: '', type: 'income', description: '', category: '' });
    toast({ title: 'موفق', description: 'تراکنش با موفقیت ثبت شد' });
  };

  const totalIncome = payments.filter(p => p.type === 'income').reduce((sum, p) => sum + p.amount, 0);
  const totalExpense = payments.filter(p => p.type === 'expense').reduce((sum, p) => sum + p.amount, 0);
  const balance = totalIncome - totalExpense;

  const getCategoryOptions = () => {
    return newPayment.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">مالی</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                ثبت تراکنش
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>ثبت تراکنش جدید</DialogTitle>
                <DialogDescription>اطلاعات تراکنش را وارد کنید</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>نوع تراکنش</Label>
                  <Select value={newPayment.type} onValueChange={(value: 'income' | 'expense') => setNewPayment({...newPayment, type: value, category: ''})}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">درآمد</SelectItem>
                      <SelectItem value="expense">هزینه</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newPayment.type === 'income' && (
                  <div className="space-y-2">
                    <Label>دانش‌آموز (اختیاری)</Label>
                    <Select value={newPayment.studentName} onValueChange={(value) => setNewPayment({...newPayment, studentName: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent>
                        {STUDENTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>دسته‌بندی</Label>
                  <Select value={newPayment.category} onValueChange={(value) => setNewPayment({...newPayment, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCategoryOptions().map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">توضیحات</Label>
                  <Input id="description" value={newPayment.description} onChange={(e) => setNewPayment({...newPayment, description: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">مبلغ (ریال)</Label>
                  <Input id="amount" type="number" value={newPayment.amount} onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>انصراف</Button>
                <Button onClick={handleAddPayment}>ثبت</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">درآمد</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">هزینه</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">موجودی</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>تراکنش‌های اخیر</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">در حال بارگذاری...</div>
            ) : (
              <div className="divide-y">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        payment.type === 'income' ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        <Wallet className={`h-5 w-5 ${
                          payment.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className={`px-2 py-0.5 rounded text-xs ${payment.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {payment.category}
                          </span>
                          {payment.studentName && <span>{payment.studentName}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className={`font-bold ${payment.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {payment.type === 'income' ? '+' : '-'}{formatCurrency(payment.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">{payment.date}</p>
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
