'use client';

import { useEffect, useState } from 'react';
import { StudentLayout } from '@/components/layout/student-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Wallet, CreditCard, Receipt, AlertCircle } from 'lucide-react';

interface FinanceData {
  student: {
    full_name: string;
    student_code: string;
  };
  summary: {
    total_invoiced: number;
    total_paid: number;
    total_balance: number;
  };
  invoices: Array<{
    id: number;
    invoice_number: string;
    fee_type: string;
    amount: number;
    paid_amount: number;
    balance: number;
    status: string;
    issue_date: string;
    due_date: string;
  }>;
  payments: Array<{
    id: number;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference: string;
    invoice_number: string;
  }>;
}

export default function StudentFinancePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<FinanceData | null>(null);

  useEffect(() => {
    loadFinance();
  }, []);

  const loadFinance = async () => {
    try {
      const response = await api.get<FinanceData>('/users/student/dashboard/finance/');
      setData(response.data);
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'در بارگذاری اطلاعات مالی خطا رخ داد',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasDebt = data?.summary.total_balance && data.summary.total_balance > 0;

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <p>در حال بارگذاری...</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Wallet className="h-8 w-8 text-green-600" />
          <h1 className="text-2xl font-bold">وضعیت مالی</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">کل صورت‌حساب</p>
                  <p className="text-2xl font-bold">
                    {data?.summary.total_invoiced.toLocaleString()} ت
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">کل پرداخت</p>
                  <p className="text-2xl font-bold text-green-600">
                    {data?.summary.total_paid.toLocaleString()} ت
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={hasDebt ? 'border-red-200' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">بدهی</p>
                  <p className={`text-2xl font-bold ${hasDebt ? 'text-red-600' : ''}`}>
                    {data?.summary.total_balance.toLocaleString()} ت
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${hasDebt ? 'bg-red-100' : 'bg-gray-100'}`}>
                  <Wallet className={`h-6 w-6 ${hasDebt ? 'text-red-600' : 'text-gray-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debt Warning */}
        {hasDebt && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">
              شما <strong>{data?.summary.total_balance.toLocaleString()} تومان</strong> بدهکار هستید.
              لطفاً هرچه سریع‌تر نسبت به پرداخت اقدام کنید.
            </p>
          </div>
        )}

        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>صورت‌حساب‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.invoices.length === 0 ? (
              <p className="text-center text-gray-500 py-8">صورت‌حسابی ثبت نشده</p>
            ) : (
              <div className="divide-y">
                {data?.invoices.map((invoice) => (
                  <div key={invoice.id} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{invoice.fee_type}</p>
                      <p className="text-sm text-gray-500">
                        شماره: {invoice.invoice_number} • سررسید: {invoice.due_date}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold">{invoice.amount.toLocaleString()} ت</p>
                      <p className={`text-sm ${
                        invoice.balance > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {invoice.balance > 0 
                          ? `${invoice.balance.toLocaleString()} ت بدهکار` 
                          : 'تسویه شده'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payments */}
        <Card>
          <CardHeader>
            <CardTitle>پرداخت‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.payments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">پرداختی ثبت نشده</p>
            ) : (
              <div className="divide-y">
                {data?.payments.map((payment) => (
                  <div key={payment.id} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-600">
                        {payment.amount.toLocaleString()} تومان
                      </p>
                      <p className="text-sm text-gray-500">
                        {payment.payment_date} • {payment.payment_method}
                        {payment.reference && ` • شماره: ${payment.reference}`}
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      پرداخت شده
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
