'use client';

import { useEffect, useState, type ElementType } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { School, Wallet, Clock, Bell, Shield, Calendar, Plus, Copy, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// Jalali conversion helpers
const div = (a: number, b: number) => Math.floor(a / b);
const g2d = (gy: number, gm: number, gd: number) => {
  const d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * ((gm + 9) % 12) + 2, 5) + gd - 34840408;
  return d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
};
const d2g = (jdn: number) => {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(j % 1461, 4) * 5 + 308;
  const gd = div(i % 153, 5) + 1;
  const gm = (div(i, 153) % 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
};
const jalCal = (jy: number) => {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  let bl = breaks.length;
  let gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jm = breaks[0];
  let jump = 0;
  let leap = 0;
  let leapG = 0;
  let march = 0;
  for (let i = 1; i < bl; i += 1) {
    jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ += div(jump, 33) * 8 + div(jump % 33, 4);
    jp = jm;
  }
  let n = jy - jp;
  leapJ += div(n, 33) * 8 + div((n % 33) + 3, 4);
  if (jump % 33 === 4 && jump - n === 4) leapJ += 1;
  leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  march = 20 + leapJ - leapG;
  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  leap = (((n + 1) % 33) - 1) % 4;
  if (leap === -1) leap = 4;
  return { leap, gy, march };
};
const j2d = (jy: number, jm: number, jd: number) => {
  const r = jalCal(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
};
const d2j = (jdn: number) => {
  const gy = d2g(jdn).gy;
  let jy = gy - 621;
  const r = jalCal(jy);
  const jdn1f = g2d(gy, 3, r.march);
  let k = jdn - jdn1f;
  let jm: number;
  let jd: number;
  if (k >= 0) {
    if (k <= 185) {
      jm = 1 + div(k, 31);
      jd = (k % 31) + 1;
      return { jy, jm, jd };
    }
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  jm = 7 + div(k, 30);
  jd = (k % 30) + 1;
  return { jy, jm, jd };
};
const toGregorian = (jy: number, jm: number, jd: number) => d2g(j2d(jy, jm, jd));
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const jalaliToIso = (jy: number, jm: number, jd: number) => {
  const g = toGregorian(jy, jm, jd);
  return `${g.gy}-${pad(g.gm)}-${pad(g.gd)}`;
};

const EDUCATION_LEVELS = [
  { value: 'elementary', label: 'ابتدایی (پایه ۱ تا ۶)' },
  { value: 'middle', label: 'متوسطه اول (پایه ۷ تا ۹)' },
  { value: 'high_school', label: 'متوسطه دوم (پایه ۱۰ تا ۱۲)' },
];

const PERIODS_OPTIONS = [
  { value: '4', label: '۴ زنگ' },
  { value: '5', label: '۵ زنگ' },
];

const DURATION_OPTIONS = [
  { value: '45', label: '۴۵ دقیقه' },
  { value: '50', label: '۵۰ دقیقه' },
  { value: '90', label: '۹۰ دقیقه' },
];

const GRADES_BY_LEVEL: Record<string, string[]> = {
  elementary: ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم'],
  middle: ['هفتم', 'هشتم', 'نهم'],
  high_school: ['دهم', 'یازدهم', 'دوازدهم'],
};

type TabType = 'school' | 'financial' | 'scheduling' | 'notifications' | 'security';

const TABS: { id: TabType | 'academic_years'; label: string; icon: ElementType }[] = [
  { id: 'school', label: 'اطلاعات مدرسه', icon: School },
  { id: 'financial', label: 'تنظیمات مالی', icon: Wallet },
  { id: 'scheduling', label: 'تنظیمات زمانی', icon: Clock },
  { id: 'notifications', label: 'اعلان‌ها', icon: Bell },
  { id: 'security', label: 'امنیت و سیستم', icon: Shield },
  { id: 'academic_years', label: 'سال‌های تحصیلی', icon: Calendar },
];

const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType | 'academic_years'>('school');

  const [settings, setSettings] = useState({
    schoolName: 'دبیرستان نمونه',
    phone: '021-12345678',
    email: 'school@example.com',
    address: 'تهران، خیابان آزادی',
    principalName: '',
    notifications: true,
    autoAttendance: false,
    educationLevel: 'high_school',
    periodsPerDay: '4',
    periodDuration: '45',
    schoolStartTime: '08:00',
    maxClassCapacity: '30',
    workingDays: ['0', '1', '2', '3', '4'],
  });

  const [tuitionFees, setTuitionFees] = useState<Record<string, string>>({
    'دهم': '3000000',
    'یازدهم': '3500000',
    'دوازدهم': '4000000',
  });

  type AcademicYear = {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    is_active: boolean;
  };

  const [years, setYears] = useState<AcademicYear[]>([]);
  const [isYearLoading, setIsYearLoading] = useState(true);
  const [yearDialogOpen, setYearDialogOpen] = useState(false);
  const [newYear, setNewYear] = useState({ name: '' });
  const [startJDate, setStartJDate] = useState<{ y: number | null; m: number | null; d: number | null }>({ y: null, m: null, d: null });
  const [endJDate, setEndJDate] = useState<{ y: number | null; m: number | null; d: number | null }>({ y: null, m: null, d: null });
  const [copyFromYear, setCopyFromYear] = useState<number | null>(null);

  const yearOptions = Array.from({ length: 15 }, (_, i) => 1398 + i);
  const monthOptions = [
    { value: 1, label: 'فروردین' },
    { value: 2, label: 'اردیبهشت' },
    { value: 3, label: 'خرداد' },
    { value: 4, label: 'تیر' },
    { value: 5, label: 'مرداد' },
    { value: 6, label: 'شهریور' },
    { value: 7, label: 'مهر' },
    { value: 8, label: 'آبان' },
    { value: 9, label: 'آذر' },
    { value: 10, label: 'دی' },
    { value: 11, label: 'بهمن' },
    { value: 12, label: 'اسفند' },
  ];
  const jalaliMonthLength = (jy: number, jm: number) => {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    // Esfand leap
    return jalCal(jy).leap === 1 ? 30 : 29;
  };
  const dayOptions = (jy: number | null, jm: number | null) => {
    if (!jy || !jm) return [];
    const len = jalaliMonthLength(jy, jm);
    return Array.from({ length: len }, (_, i) => i + 1);
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setIsLoading(false);
    loadYears();
  }, [router]);

  useEffect(() => {
    const grades = GRADES_BY_LEVEL[settings.educationLevel] || [];
    const newFees: Record<string, string> = {};
    grades.forEach((g) => {
      newFees[g] = tuitionFees[g] || '0';
    });
    setTuitionFees(newFees);
  }, [settings.educationLevel]);

  const handleSave = () => {
    toast({ title: 'موفق', description: 'تنظیمات ذخیره شد' });
  };

  const handleWorkingDayToggle = (day: string) => {
    const current = settings.workingDays;
    if (current.includes(day)) {
      setSettings({ ...settings, workingDays: current.filter((d) => d !== day) });
    } else {
      setSettings({ ...settings, workingDays: [...current, day] });
    }
  };

  const workingDayLabels = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه'];
  const currentGrades = GRADES_BY_LEVEL[settings.educationLevel] || [];

  const authHeaders = (extra?: Record<string, string>) => {
    const token = localStorage.getItem('access_token');
    const schoolId = localStorage.getItem('school_id');
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(schoolId ? { 'X-Tenant-ID': schoolId } : {}),
      ...extra,
    } as Record<string, string>;
  };

  const loadYears = async () => {
    try {
      const res = await fetch(`${apiBase}/api/v1/schools/academic-years/`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('load failed');
      const data = await res.json();
      setYears(data);
    } catch (err) {
      toast({ title: 'خطا', description: 'در بارگذاری سال‌های تحصیلی خطا رخ داد', variant: 'destructive' });
    } finally {
      setIsYearLoading(false);
    }
  };

  const createYear = async () => {
    try {
      if (!newYear.name || !startJDate.y || !startJDate.m || !startJDate.d || !endJDate.y || !endJDate.m || !endJDate.d) {
        toast({ title: 'خطا', description: 'نام و تاریخ‌ها را کامل وارد کنید', variant: 'destructive' });
        return;
      }
      const res = await fetch(`${apiBase}/api/v1/schools/academic-years/`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          name: newYear.name,
          start_date: jalaliToIso(startJDate.y, startJDate.m, startJDate.d),
          end_date: jalaliToIso(endJDate.y, endJDate.m, endJDate.d),
        }),
      });
      if (!res.ok) throw new Error('create failed');
      const created = await res.json();
      if (copyFromYear) {
        await fetch(`${apiBase}/api/v1/schools/academic-years/${created.id}/copy_classes/`, {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ source_year_id: copyFromYear }),
        });
      }
      toast({ title: 'موفق', description: 'سال تحصیلی ایجاد شد' });
      setYearDialogOpen(false);
      setNewYear({ name: '' });
      setStartJDate({ y: null, m: null, d: null });
      setEndJDate({ y: null, m: null, d: null });
      setCopyFromYear(null);
      setIsYearLoading(true);
      loadYears();
    } catch (err) {
      toast({ title: 'خطا', description: 'در ایجاد سال تحصیلی خطا رخ داد', variant: 'destructive' });
    }
  };

  const setCurrentYear = async (id: number) => {
    try {
      const res = await fetch(`${apiBase}/api/v1/schools/academic-years/${id}/set_current/`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('set current failed');
      toast({ title: 'موفق', description: 'سال فعال تنظیم شد' });
      setIsYearLoading(true);
      loadYears();
    } catch (err) {
      toast({ title: 'خطا', description: 'در تنظیم سال فعال خطا رخ داد', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">تنظیمات پایه</h1>
          <Button onClick={handleSave}>ذخیره تغییرات</Button>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* School Info Tab */}
        {activeTab === 'school' && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  <CardTitle>اطلاعات مدرسه</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">نام مدرسه</Label>
                  <Input
                    id="schoolName"
                    value={settings.schoolName}
                    onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="principalName">نام مدیر</Label>
                  <Input
                    id="principalName"
                    value={settings.principalName}
                    onChange={(e) => setSettings({ ...settings, principalName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">تلفن</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">آدرس</Label>
                  <Input
                    id="address"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مقطع تحصیلی</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>مقطع</Label>
                  <Select
                    value={settings.educationLevel}
                    onValueChange={(value) => setSettings({ ...settings, educationLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">حداکثر ظرفیت هر کلاس</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={settings.maxClassCapacity}
                    onChange={(e) => setSettings({ ...settings, maxClassCapacity: e.target.value })}
                  />
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-muted-foreground">پایه‌های فعال:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentGrades.map((g) => (
                      <span key={g} className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>درباره سیستم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-sm text-muted-foreground">نسخه</p>
                    <p className="font-bold">1.0.0</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-sm text-muted-foreground">تاریخ نصب</p>
                    <p className="font-bold">1403/03/01</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-sm text-muted-foreground">مقطع</p>
                    <p className="font-bold">
                      {EDUCATION_LEVELS.find((l) => l.value === settings.educationLevel)?.label}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-sm text-muted-foreground">تعداد پایه</p>
                    <p className="font-bold">{currentGrades.length} پایه</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Financial Tab */}
        {activeTab === 'financial' && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  <CardTitle>شهریه هر پایه تحصیلی</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">مبلغ شهریه ماهانه هر پایه را وارد کنید (تومان)</p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {currentGrades.map((grade) => (
                    <div key={grade} className="border rounded-lg p-4 space-y-2">
                      <Label className="text-base font-bold">پایه {grade}</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={tuitionFees[grade] || ''}
                          onChange={(e) => setTuitionFees({ ...tuitionFees, [grade]: e.target.value })}
                          placeholder="مبلغ شهریه"
                          className="pl-16"
                        />
                        <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">تومان</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {Number(tuitionFees[grade] || 0).toLocaleString()} تومان
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تنظیمات پرداخت</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>پرداخت اقساطی</Label>
                    <p className="text-sm text-muted-foreground">امکان پرداخت شهریه به صورت قسطی</p>
                  </div>
                  <Switch checked={true} onCheckedChange={() => {}} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>یادآوری پرداخت</Label>
                    <p className="text-sm text-muted-foreground">ارسال یادآوری قبل از سررسید</p>
                  </div>
                  <Switch checked={true} onCheckedChange={() => {}} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>خلاصه مالی</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentGrades.map((grade) => (
                  <div key={grade} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>پایه {grade}</span>
                    <span className="font-bold">{Number(tuitionFees[grade] || 0).toLocaleString()} ت</span>
                  </div>
                ))}
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-bold">میانگین شهریه</span>
                  <span className="font-bold text-blue-600">
                    {currentGrades.length > 0
                      ? Math.round(
                          currentGrades.reduce((sum, g) => sum + Number(tuitionFees[g] || 0), 0) /
                            currentGrades.length,
                        ).toLocaleString()
                      : '0'}{' '}
                    ت
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Scheduling Tab */}
        {activeTab === 'scheduling' && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <CardTitle>تنظیمات زنگ‌ها</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>تعداد زنگ در روز</Label>
                  <Select
                    value={settings.periodsPerDay}
                    onValueChange={(value) => setSettings({ ...settings, periodsPerDay: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERIODS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>مدت زمان هر زنگ</Label>
                  <Select
                    value={settings.periodDuration}
                    onValueChange={(value) => setSettings({ ...settings, periodDuration: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">ساعت شروع مدرسه</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={settings.schoolStartTime}
                    onChange={(e) => setSettings({ ...settings, schoolStartTime: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <CardTitle>روزهای کاری</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {workingDayLabels.map((label, idx) => (
                    <div key={idx} className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        checked={settings.workingDays.includes(idx.toString())}
                        onCheckedChange={() => handleWorkingDayToggle(idx.toString())}
                      />
                      <Label>{label}</Label>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-blue-50 rounded text-center">
                  <span className="text-sm font-medium">{settings.workingDays.length} روز کاری در هفته</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>تنظیمات اعلان‌ها</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>اعلان‌های پیامکی</Label>
                  <p className="text-sm text-muted-foreground">ارسال اعلان از طریق پیامک</p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked: boolean) => setSettings({ ...settings, notifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>ثبت خودکار حضور</Label>
                  <p className="text-sm text-muted-foreground">ثبت خودکار حاضر برای همه دانش‌آموزان</p>
                </div>
                <Switch
                  checked={settings.autoAttendance}
                  onCheckedChange={(checked: boolean) => setSettings({ ...settings, autoAttendance: checked })}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <CardTitle>امنیت</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">تغییر رمز عبور</Button>
                <Button variant="outline" className="w-full">مدیریت کاربران</Button>
                <Button variant="outline" className="w-full">پشتیبان‌گیری</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>درباره سیستم</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">نسخه</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تاریخ نصب</span>
                  <span>1403/03/01</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Academic Years Tab */}
        {activeTab === 'academic_years' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  سال‌های تحصیلی
                </CardTitle>
                <p className="text-sm text-muted-foreground">مدیریت سال‌های تحصیلی مدرسه</p>
              </div>
              <Button onClick={() => setYearDialogOpen(true)}>
                <Plus className="h-4 w-4 ml-2" />
                سال جدید
              </Button>
            </CardHeader>
            <CardContent>
              {isYearLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : years.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">هنوز سال تحصیلی ثبت نشده است</p>
              ) : (
                <div className="space-y-3">
                  {years.map((y) => (
                    <div key={y.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{y.name}</span>
                          {y.is_current && (
                            <Badge className="bg-green-600">
                              <CheckCircle className="h-3 w-3 ml-1" /> فعال
                            </Badge>
                          )}
                          {!y.is_active && <Badge variant="secondary">غیرفعال</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">از {y.start_date} تا {y.end_date}</p>
                      </div>
                      <div className="flex gap-2">
                        {!y.is_current && y.is_active && (
                          <Button size="sm" variant="outline" onClick={() => setCurrentYear(y.id)}>
                            تنظیم به عنوان فعال
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Academic Year Dialog */}
        <Dialog open={yearDialogOpen} onOpenChange={setYearDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>ایجاد سال تحصیلی جدید</DialogTitle>
              <DialogDescription>اطلاعات سال تحصیلی جدید را وارد کنید</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>نام سال تحصیلی</Label>
                <Input
                  placeholder="مثال: 1403-1404"
                  value={newYear.name}
                  onChange={(e) => setNewYear({ ...newYear, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>تاریخ شروع (جلالی)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      value={startJDate.y?.toString() || ''}
                      onValueChange={(v) => setStartJDate({ ...startJDate, y: parseInt(v) })}
                    >
                      <SelectTrigger><SelectValue placeholder="سال" /></SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((y) => (
                          <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={startJDate.m?.toString() || ''}
                      onValueChange={(v) => setStartJDate({ ...startJDate, m: parseInt(v) })}
                    >
                      <SelectTrigger><SelectValue placeholder="ماه" /></SelectTrigger>
                      <SelectContent>
                        {monthOptions.map((m) => (
                          <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={startJDate.d?.toString() || ''}
                      onValueChange={(v) => setStartJDate({ ...startJDate, d: parseInt(v) })}
                    >
                      <SelectTrigger><SelectValue placeholder="روز" /></SelectTrigger>
                      <SelectContent>
                        {dayOptions(startJDate.y, startJDate.m).map((d) => (
                          <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">مثال: 1403 / مهر / 01</p>
                </div>
                <div className="space-y-2">
                  <Label>تاریخ پایان (جلالی)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      value={endJDate.y?.toString() || ''}
                      onValueChange={(v) => setEndJDate({ ...endJDate, y: parseInt(v) })}
                    >
                      <SelectTrigger><SelectValue placeholder="سال" /></SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((y) => (
                          <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={endJDate.m?.toString() || ''}
                      onValueChange={(v) => setEndJDate({ ...endJDate, m: parseInt(v) })}
                    >
                      <SelectTrigger><SelectValue placeholder="ماه" /></SelectTrigger>
                      <SelectContent>
                        {monthOptions.map((m) => (
                          <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={endJDate.d?.toString() || ''}
                      onValueChange={(v) => setEndJDate({ ...endJDate, d: parseInt(v) })}
                    >
                      <SelectTrigger><SelectValue placeholder="روز" /></SelectTrigger>
                      <SelectContent>
                        {dayOptions(endJDate.y, endJDate.m).map((d) => (
                          <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">مثال: 1404 / مهر / 01</p>
                </div>
              </div>
              {years.length > 0 && (
                <div className="space-y-2">
                  <Label>کپی کلاس‌ها از سال قبلی (اختیاری)</Label>
                  <Select
                    value={copyFromYear?.toString()}
                    onValueChange={(v) => setCopyFromYear(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب سال" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y.id} value={y.id.toString()}>
                          {y.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setYearDialogOpen(false)}>انصراف</Button>
              <Button
                onClick={createYear}
                disabled={
                  !newYear.name ||
                  !startJDate.y || !startJDate.m || !startJDate.d ||
                  !endJDate.y || !endJDate.m || !endJDate.d
                }
              >
                <Copy className="h-4 w-4 ml-2" />
                {copyFromYear ? 'ایجاد و کپی' : 'ایجاد'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
