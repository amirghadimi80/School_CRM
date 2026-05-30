'use client';

import { useEffect, useState } from 'react';
import { StudentLayout } from '@/components/layout/student-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ClipboardList, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface AttendanceData {
  attendance: Array<{
    id: number;
    date: string;
    status: string;
    status_display: string;
    class_name: string;
  }>;
  statistics: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendance_rate: number;
  };
  month: number;
  year: string;
}

export default function StudentAttendancePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AttendanceData | null>(null);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const response = await api.get<AttendanceData>('/users/student/dashboard/attendance/');
      setData(response.data);
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'در بارگذاری حضور و غیاب خطا رخ داد',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'excused':
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      excused: 'bg-blue-100 text-blue-800',
    };
    const labels = {
      present: 'حاضر',
      absent: 'غایب',
      late: 'با تاخیر',
      excused: 'موجه',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[status as keyof typeof styles] || 'bg-gray-100'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <p>در حال بارگذاری...</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-green-600" />
          <h1 className="text-2xl font-bold">حضور و غیاب</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">نرخ حضور</p>
              <p className="text-2xl font-bold text-blue-600">{data?.statistics.attendance_rate}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">حاضر</p>
              <p className="text-2xl font-bold text-green-600">{data?.statistics.present}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">غایب</p>
              <p className="text-2xl font-bold text-red-600">{data?.statistics.absent}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">تاخیر</p>
              <p className="text-2xl font-bold text-yellow-600">{data?.statistics.late}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">موجه</p>
              <p className="text-2xl font-bold text-blue-600">{data?.statistics.excused}</p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Records */}
        <Card>
          <CardHeader>
            <CardTitle>رکوردهای حضور و غیاب</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.attendance.length === 0 ? (
              <p className="text-center text-gray-500 py-8">رکوردی ثبت نشده</p>
            ) : (
              <div className="divide-y">
                {data?.attendance.map((record) => (
                  <div key={record.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(record.status)}
                      <div>
                        <p className="font-medium">{record.class_name}</p>
                        <p className="text-sm text-gray-500">{record.date}</p>
                      </div>
                    </div>
                    {getStatusBadge(record.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
