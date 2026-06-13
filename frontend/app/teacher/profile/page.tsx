'use client';

import { TeacherLayout } from '@/components/layout/teacher-layout';
import { UserProfileForm } from '@/components/profile/user-profile-form';

export default function TeacherProfilePage() {
  return (
    <TeacherLayout>
      <UserProfileForm />
    </TeacherLayout>
  );
}
