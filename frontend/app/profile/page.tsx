'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { UserProfileForm } from '@/components/profile/user-profile-form';

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const cached = localStorage.getItem('user');
    if (cached) {
      try {
        const user = JSON.parse(cached) as { role?: string };
        if (user.role === 'teacher') {
          router.replace('/teacher/profile');
        } else if (user.role === 'student') {
          router.replace('/student/profile');
        }
      } catch {
        // ignore invalid cache
      }
    }
  }, [router]);

  return (
    <DashboardLayout>
      <UserProfileForm />
    </DashboardLayout>
  );
}
