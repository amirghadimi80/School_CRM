'use client';

import { TeacherLayout } from '@/components/layout/teacher-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

export default function TeacherAttendancePage() {
  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold">حضور و غیاب</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ثبت حضور و غیاب</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">
              این بخش در حال توسعه است...
            </p>
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  );
}
