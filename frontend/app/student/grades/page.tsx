'use client';

import { useEffect, useState } from 'react';
import { StudentLayout } from '@/components/layout/student-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, TrendingUp } from 'lucide-react';

interface GradesData {
  student: {
    full_name: string;
    student_code: string;
  };
  grades: Array<{
    id: number;
    course: string;
    score: number;
    max_score: number;
    percentage: number;
    grade_type: string;
    date: string;
  }>;
  overall_gpa: number | null;
  total_courses: number;
  courses_summary: Array<{
    course_name: string;
    average: number;
    count: number;
  }>;
}

export default function StudentGradesPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<GradesData | null>(null);

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      const response = await api.get<GradesData>('/users/student/dashboard/grades/');
      setData(response.data);
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'در بارگذاری نمرات خطا رخ داد',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
          <BookOpen className="h-8 w-8 text-green-600" />
          <h1 className="text-2xl font-bold">کارنامه</h1>
        </div>

        {/* GPA Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">معدل کل</p>
                  <p className="text-4xl font-bold">
                    {data?.overall_gpa?.toFixed(2) || '—'}
                  </p>
                </div>
                <div className="p-4 bg-blue-100 rounded-full">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">تعداد دروس</p>
                  <p className="text-4xl font-bold">{data?.total_courses || 0}</p>
                </div>
                <div className="p-4 bg-purple-100 rounded-full">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Summary */}
        <Card>
          <CardHeader>
            <CardTitle>میانگین نمرات به تفکیک درس</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.courses_summary.length === 0 ? (
              <p className="text-center text-gray-500 py-8">نمره‌ای ثبت نشده</p>
            ) : (
              <div className="divide-y">
                {data?.courses_summary.map((course) => (
                  <div key={course.course_name} className="py-4 flex items-center justify-between">
                    <span className="font-medium">{course.course_name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">{course.count} نمره</span>
                      <span className={`font-bold ${
                        course.average >= 17 ? 'text-green-600' :
                        course.average >= 12 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {course.average.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Grades */}
        <Card>
          <CardHeader>
            <CardTitle>تمام نمرات</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.grades.length === 0 ? (
              <p className="text-center text-gray-500 py-8">نمره‌ای ثبت نشده</p>
            ) : (
              <div className="divide-y">
                {data?.grades.map((grade) => (
                  <div key={grade.id} className="py-4 flex items-center justify-between">
                    <div>
                      <span className="font-medium">{grade.course}</span>
                      <p className="text-xs text-gray-500">{grade.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">{grade.grade_type}</span>
                      <span className={`font-bold ${
                        grade.percentage >= 85 ? 'text-green-600' :
                        grade.percentage >= 60 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {grade.score}/{grade.max_score}
                      </span>
                    </div>
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
