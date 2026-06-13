'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormSection } from '@/components/students/form-section';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import {
  User,
  Phone,
  Shield,
  Bell,
  Upload,
  Lock,
  Mail,
} from 'lucide-react';

interface UserProfileData {
  id: number;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role_display: string;
  school_name?: string;
  avatar?: string | null;
  preferred_language: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  profile?: {
    national_id?: string;
    birth_date?: string | null;
    gender?: string;
    address?: string;
    city?: string;
    province?: string;
    bio?: string;
  };
}

function resolveAvatarUrl(avatar?: string | null) {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return `${base}${avatar}`;
}

function syncSessionCache(user: UserProfileData) {
  localStorage.setItem('user', JSON.stringify(user));
  window.dispatchEvent(new Event('session-updated'));
}

export function UserProfileForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [accountInfo, setAccountInfo] = useState({
    email: '',
    roleDisplay: '',
    schoolName: '',
  });
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    nationalId: '',
    birthDate: '',
    gender: '',
    address: '',
    city: '',
    province: '',
    bio: '',
    preferredLanguage: 'fa',
    emailNotifications: true,
    smsNotifications: true,
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const load = async () => {
      try {
        const data = (await api.getMe()) as UserProfileData;
        setAccountInfo({
          email: data.email || '',
          roleDisplay: data.role_display || '',
          schoolName: data.school_name || '',
        });
        setForm({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          phone: data.phone || '',
          nationalId: data.profile?.national_id || '',
          birthDate: data.profile?.birth_date || '',
          gender: data.profile?.gender || '',
          address: data.profile?.address || '',
          city: data.profile?.city || '',
          province: data.profile?.province || '',
          bio: data.profile?.bio || '',
          preferredLanguage: data.preferred_language || 'fa',
          emailNotifications: data.email_notifications ?? true,
          smsNotifications: data.sms_notifications ?? true,
        });
        setAvatarPreview(resolveAvatarUrl(data.avatar));
      } catch {
        toast({
          title: 'خطا',
          description: 'بارگذاری پروفایل ناموفق بود',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [router, toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let updated = (await api.updateMe({
        first_name: form.firstName,
        last_name: form.lastName,
        phone: form.phone,
        preferred_language: form.preferredLanguage,
        email_notifications: form.emailNotifications,
        sms_notifications: form.smsNotifications,
        profile: {
          national_id: form.nationalId || '',
          birth_date: form.birthDate || null,
          gender: form.gender || '',
          address: form.address,
          city: form.city,
          province: form.province,
          bio: form.bio,
        },
      })) as UserProfileData;

      if (avatarFile) {
        updated = (await api.uploadUserAvatar(avatarFile)) as UserProfileData;
        setAvatarFile(null);
        setAvatarPreview(resolveAvatarUrl(updated.avatar));
      }

      syncSessionCache(updated);
      toast({ title: 'موفق', description: 'پروفایل با موفقیت ذخیره شد' });
    } catch {
      toast({
        title: 'خطا',
        description: 'ذخیره پروفایل ناموفق بود',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.newPasswordConfirm) {
      toast({
        title: 'خطا',
        description: 'رمز عبور جدید و تکرار آن یکسان نیست',
        variant: 'destructive',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.changePassword({
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword,
        new_password_confirm: passwordForm.newPasswordConfirm,
      });
      setPasswordForm({ oldPassword: '', newPassword: '', newPasswordConfirm: '' });
      toast({ title: 'موفق', description: 'رمز عبور با موفقیت تغییر کرد' });
    } catch {
      toast({
        title: 'خطا',
        description: 'تغییر رمز عبور ناموفق بود. رمز فعلی را بررسی کنید',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/10 bg-gradient-to-l from-primary/5 via-card to-accent/30 px-5 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-xl font-bold text-primary-foreground shadow-md">
              {avatarPreview ? (
                <img src={avatarPreview} alt="پروفایل" className="h-full w-full object-cover" />
              ) : (
                form.firstName.charAt(0) || '؟'
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">پروفایل من</h1>
              <p className="text-sm text-muted-foreground">
                {accountInfo.roleDisplay}
                {accountInfo.schoolName ? ` · ${accountInfo.schoolName}` : ''}
              </p>
            </div>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl border border-border/60 bg-card px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-secondary/60">
            <Upload className="h-4 w-4" />
            تغییر تصویر
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

      <Card>
        <CardContent className="grid gap-4 pt-6">
          <FormSection title="اطلاعات شخصی" icon={User} accent="blue">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>نام</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>نام خانوادگی</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>کد ملی</Label>
                <Input
                  value={form.nationalId}
                  onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
                  placeholder="اختیاری"
                />
              </div>
              <div className="space-y-2">
                <Label>تاریخ تولد</Label>
                <Input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>جنسیت</Label>
                <Select
                  value={form.gender || 'unset'}
                  onValueChange={(value) =>
                    setForm({ ...form, gender: value === 'unset' ? '' : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unset">انتخاب نشده</SelectItem>
                    <SelectItem value="male">مرد</SelectItem>
                    <SelectItem value="female">زن</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>درباره من</Label>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="توضیح کوتاه درباره خودتان..."
                  rows={3}
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="اطلاعات تماس" icon={Phone} accent="emerald">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>شماره موبایل</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="09xxxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label>شهر</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>استان</Label>
                <Input
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>آدرس</Label>
                <Textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="اطلاعات حساب" icon={Mail} accent="violet">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>ایمیل</Label>
                <Input value={accountInfo.email} readOnly className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label>نقش</Label>
                <Input value={accountInfo.roleDisplay} readOnly className="bg-muted/50" />
              </div>
              {accountInfo.schoolName && (
                <div className="space-y-2 sm:col-span-2">
                  <Label>مدرسه</Label>
                  <Input value={accountInfo.schoolName} readOnly className="bg-muted/50" />
                </div>
              )}
            </div>
          </FormSection>

          <FormSection title="تنظیمات اعلان" icon={Bell} accent="amber">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">اعلان ایمیل</p>
                  <p className="text-xs text-muted-foreground">دریافت اعلان‌ها از طریق ایمیل</p>
                </div>
                <Switch
                  checked={form.emailNotifications}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, emailNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">اعلان پیامک</p>
                  <p className="text-xs text-muted-foreground">دریافت اعلان‌ها از طریق پیامک</p>
                </div>
                <Switch
                  checked={form.smsNotifications}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, smsNotifications: checked })
                  }
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="امنیت" icon={Shield} accent="blue">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>رمز عبور فعلی</Label>
                <Input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>رمز عبور جدید</Label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>تکرار رمز جدید</Label>
                <Input
                  type="password"
                  value={passwordForm.newPasswordConfirm}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPasswordConfirm: e.target.value })
                  }
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-4 rounded-xl"
              disabled={isChangingPassword || !passwordForm.oldPassword}
              onClick={handleChangePassword}
            >
              <Lock className="ml-2 h-4 w-4" />
              {isChangingPassword ? 'در حال تغییر...' : 'تغییر رمز عبور'}
            </Button>
          </FormSection>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="rounded-xl px-8">
              {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
