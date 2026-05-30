'use client';

import { StudentLayout } from '@/components/layout/student-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

export default function StudentProfilePage() {
  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-green-600" />
          <h1 className="text-2xl font-bold">پروفایل</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>اطلاعات شخصی</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">
              این بخش در حال توسعه است...
            </p>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
