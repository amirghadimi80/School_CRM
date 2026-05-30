'use client';

import { TeacherLayout } from '@/components/layout/teacher-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function TeacherMessagesPage() {
  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold">پیام‌ها</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>صندوق پیام</CardTitle>
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
