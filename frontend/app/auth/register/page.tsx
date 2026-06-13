'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthField } from '@/components/auth/auth-field';
import {
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Users,
} from 'lucide-react';

const roleOptions = [
  { value: 'student', label: 'دانش‌آموز', icon: BookOpen },
  { value: 'teacher', label: 'معلم', icon: GraduationCap },
  { value: 'parent', label: 'والد', icon: Users },
];

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('رمز عبور و تکرار آن مطابقت ندارند');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          password,
          role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'ثبت‌نام ناموفق بود');
      }

      const data = await response.json();

      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user?.school) {
        localStorage.setItem('school_id', data.user.school.id);
      }

      const userRole = data.user?.role;
      if (userRole === 'teacher') {
        router.push('/teacher/dashboard');
      } else if (userRole === 'student') {
        router.push('/student/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'ثبت‌نام ناموفق بود';
      setError(errorMessage || 'خطا در ثبت‌نام. لطفاً دوباره تلاش کنید');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="ثبت‌نام در سپاد"
      subtitle="اطلاعات خود را وارد کنید تا حساب کاربری ایجاد شود"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-3">
          <AuthField
            label="نام"
            id="firstName"
            icon={User}
            type="text"
            placeholder="نام"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            autoComplete="given-name"
          />
          <AuthField
            label="نام خانوادگی"
            id="lastName"
            type="text"
            placeholder="نام خانوادگی"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            autoComplete="family-name"
          />
        </div>

        <AuthField
          label="ایمیل"
          id="email"
          icon={Mail}
          type="email"
          placeholder="example@school.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <AuthField
          label="شماره موبایل"
          id="phone"
          icon={Phone}
          type="tel"
          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />

        <AuthField
          label="رمز عبور"
          id="password"
          icon={Lock}
          type="password"
          placeholder="حداقل ۸ کاراکتر"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />

        <AuthField
          label="تکرار رمز عبور"
          id="confirmPassword"
          icon={Lock}
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />

        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium text-slate-700">
            نوع کاربر
          </Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="role" className="h-11 border-slate-200 bg-slate-50/80">
              <SelectValue placeholder="نوع کاربر را انتخاب کنید" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map(({ value, label, icon: Icon }) => (
                <SelectItem key={value} value={value}>
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="mt-2 h-11 w-full bg-gradient-to-l from-emerald-600 to-blue-600 text-base font-semibold shadow-md shadow-emerald-200/50 transition-all hover:from-emerald-700 hover:to-blue-700 hover:shadow-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              در حال ثبت‌نام...
            </>
          ) : (
            'ایجاد حساب کاربری'
          )}
        </Button>

        <p className="pt-1 text-center text-sm text-muted-foreground">
          قبلاً حساب دارید؟{' '}
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1 font-semibold text-primary transition-colors hover:text-primary/80"
          >
            وارد شوید
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
