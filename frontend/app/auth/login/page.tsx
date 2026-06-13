'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthField } from '@/components/auth/auth-field';
import { Loader2, Lock, Mail, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'ایمیل/کد ملی یا رمز عبور اشتباه است');
      }

      const data = await response.json();

      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));

      const schoolId =
        typeof data.user?.school === 'object'
          ? data.user?.school?.id
          : data.user?.school;
      if (schoolId !== undefined && schoolId !== null) {
        localStorage.setItem('school_id', String(schoolId));
      }

      const role = data.user.role;
      if (role === 'teacher') {
        router.push('/teacher/dashboard');
      } else if (role === 'student') {
        router.push('/student/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'ورود ناموفق بود';
      setError(errorMessage || 'ایمیل/کد ملی یا رمز عبور اشتباه است');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="خوش آمدید"
      subtitle="برای دسترسی به پنل، وارد حساب کاربری خود شوید"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AuthField
          label="ایمیل یا کد ملی"
          id="email"
          icon={Mail}
          type="text"
          placeholder="example@school.com یا ۱۲۳۴۵۶۷۸۹۰"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />

        <AuthField
          label="رمز عبور"
          id="password"
          icon={Lock}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <div className="flex items-center justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary transition-colors hover:text-primary/80"
          >
            رمز عبور را فراموش کرده‌اید؟
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-11 w-full bg-gradient-to-l from-blue-600 to-blue-700 text-base font-semibold shadow-md shadow-blue-200/50 transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              در حال ورود...
            </>
          ) : (
            'ورود به سامانه'
          )}
        </Button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-muted-foreground">یا</span>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          حساب کاربری ندارید؟{' '}
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-1 font-semibold text-primary transition-colors hover:text-primary/80"
          >
            ثبت‌نام کنید
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
