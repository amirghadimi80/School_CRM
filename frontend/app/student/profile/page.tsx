'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentLayout } from '@/components/layout/student-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Upload, ImageIcon, Phone, GraduationCap, FolderOpen } from 'lucide-react';
import { FormSection } from '@/components/students/form-section';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

const GRADE_LEVELS = ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم', 'هفتم', 'هشتم', 'نهم', 'دهم', 'یازدهم', 'دوازدهم'];

interface StudentProfileData {
  id: number;
  student_code: string;
  grade_level: string;
  father_phone: string;
  mother_phone: string;
  profile_completed: boolean;
  user: {
    first_name: string;
    last_name: string;
    phone: string;
    avatar?: string | null;
  };
  profile?: {
    national_id?: string;
    birth_date?: string | null;
  };
}

export default function StudentProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [registrationFiles, setRegistrationFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    phone: '',
    fatherPhone: '',
    motherPhone: '',
    birthDate: '',
    gradeLevel: '',
    nationalId: '',
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const load = async () => {
      try {
        const data = await api.getStudentMe() as StudentProfileData;
        setStudentId(data.id);
        setForm({
          phone: data.user.phone || '',
          fatherPhone: data.father_phone || '',
          motherPhone: data.mother_phone || '',
          birthDate: data.profile?.birth_date || '',
          gradeLevel: data.grade_level || '',
          nationalId: data.profile?.national_id || data.student_code || '',
          firstName: data.user.first_name || '',
          lastName: data.user.last_name || '',
        });
        if (data.user.avatar) {
          const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          setAvatarPreview(data.user.avatar.startsWith('http') ? data.user.avatar : `${base}${data.user.avatar}`);
        }
      } catch {
        toast({ title: 'خطا', description: 'بارگذاری پروفایل ناموفق بود', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [router, toast]);

  const handleSave = async () => {
    if (!studentId) return;
    setIsSaving(true);
    try {
      await api.updateStudent(String(studentId), {
        phone: form.phone,
        father_phone: form.fatherPhone,
        mother_phone: form.motherPhone,
        birth_date: form.birthDate || null,
        grade_level: form.gradeLevel,
      });
      if (avatarFile) {
        await api.uploadStudentAvatar(studentId, avatarFile);
      }
      for (const file of registrationFiles) {
        await api.uploadStudentDocument(studentId, file);
      }
      toast({ title: 'موفق', description: 'پروفایل با موفقیت ذخیره شد' });
      setRegistrationFiles([]);
      setAvatarFile(null);
    } catch {
      toast({ title: 'خطا', description: 'ذخیره پروفایل ناموفق بود', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="py-12 text-center text-gray-500">در حال بارگذاری...</div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="rounded-xl bg-gradient-to-l from-emerald-50 via-white to-green-50 border border-emerald-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <User className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">پروفایل من</h1>
              <p className="text-sm text-slate-600">اطلاعات خود را تکمیل کنید تا پرونده شما کامل شود</p>
            </div>
          </div>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="grid gap-4 pt-6">
            <FormSection title="اطلاعات هویتی" icon={User} accent="blue">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-700">نام</Label>
                  <Input value={form.firstName} readOnly className="border-indigo-100 bg-indigo-50/60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">نام خانوادگی</Label>
                  <Input value={form.lastName} readOnly className="border-indigo-100 bg-indigo-50/60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">کد ملی / کد دانش‌آموزی</Label>
                  <Input value={form.nationalId} readOnly className="border-indigo-100 bg-indigo-50/60 font-medium text-indigo-900" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">تاریخ تولد</Label>
                  <Input type="date" className="border-blue-100 bg-white/80" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
                </div>
              </div>
            </FormSection>

            <FormSection title="اطلاعات تماس" icon={Phone} accent="emerald">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-slate-700">موبایل دانش‌آموز</Label>
                  <Input className="border-emerald-100 bg-white/80" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">موبایل پدر</Label>
                  <Input className="border-emerald-100 bg-white/80" value={form.fatherPhone} onChange={(e) => setForm({ ...form, fatherPhone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">موبایل مادر</Label>
                  <Input className="border-emerald-100 bg-white/80" value={form.motherPhone} onChange={(e) => setForm({ ...form, motherPhone: e.target.value })} />
                </div>
              </div>
            </FormSection>

            <FormSection title="اطلاعات تحصیلی" icon={GraduationCap} accent="violet">
              <div className="space-y-2 max-w-xs">
                <Label className="text-slate-700">پایه تحصیلی</Label>
                <Select value={form.gradeLevel} onValueChange={(value) => setForm({ ...form, gradeLevel: value })}>
                  <SelectTrigger className="border-violet-100 bg-white/80"><SelectValue placeholder="انتخاب کنید" /></SelectTrigger>
                  <SelectContent>
                    {GRADE_LEVELS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </FormSection>

            <FormSection title="پرونده ثبت‌نام" icon={FolderOpen} accent="amber">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-700">عکس پرسنلی ۳×۴</Label>
                  <div className="flex items-start gap-4">
                    <div className="flex h-28 w-[84px] items-center justify-center overflow-hidden rounded-lg border-2 border-amber-200 bg-amber-50/50">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="پروفایل" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-amber-400" />
                      )}
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-sm text-amber-900 hover:bg-amber-100">
                      <Upload className="h-4 w-4" />
                      انتخاب عکس
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setAvatarFile(file);
                          setAvatarPreview(URL.createObjectURL(file));
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">فایل‌های ثبت‌نام</Label>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-amber-200 bg-amber-50/40 px-3 py-6 text-sm text-amber-900 hover:border-amber-300 hover:bg-amber-50">
                    <Upload className="h-5 w-5 text-amber-500" />
                    آپلود فایل
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length) setRegistrationFiles((prev) => [...prev, ...files]);
                      }}
                    />
                  </label>
                  {registrationFiles.length > 0 && (
                    <ul className="space-y-1 rounded-md bg-white/70 p-2 text-xs text-amber-900/80">
                      {registrationFiles.map((f, i) => <li key={`${f.name}-${i}`} className="truncate">• {f.name}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            </FormSection>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-gradient-to-l from-emerald-600 to-green-600 shadow-md hover:from-emerald-600/90 hover:to-green-600/90 sm:w-auto"
            >
              {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
