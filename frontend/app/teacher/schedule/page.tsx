'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TeacherLayout } from '@/components/layout/teacher-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays } from 'lucide-react';

interface ScheduleData {
  schedule: Record<string, Array<{
    id: number;
    period: number;
    course: string;
    class_name: string;
    start_time: string;
    end_time: string;
  }>>;
  days: string[];
}

export default function TeacherSchedulePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ScheduleData | null>(null);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const response = await api.get<ScheduleData>('/users/teacher/dashboard/schedule/');
      setData(response.data);
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'در بارگذاری برنامه خطا رخ داد',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const persianDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه'];

  if (isLoading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <p>در حال بارگذاری...</p>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold">برنامه هفتگی</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {persianDays.map((day) => {
            const daySchedule = data?.schedule[day] || [];
            return (
              <Card key={day} className="min-h-[300px]">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-center text-lg">{day}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  {daySchedule.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-4">
                      بدون کلاس
                    </p>
                  ) : (
                    daySchedule.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-blue-50 rounded-lg border border-blue-100"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-blue-700">
                            زنگ {item.period}
                          </span>
                          <span className="text-xs text-blue-500">
                            {item.start_time}
                          </span>
                        </div>
                        <p className="font-medium text-sm">{item.course}</p>
                        <p className="text-xs text-gray-500">{item.class_name}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </TeacherLayout>
  );
}
