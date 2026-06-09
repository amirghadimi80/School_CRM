"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QuestionFormPopup } from "@/components/teacher/QuestionFormPopup";
import { QuestionList } from "@/components/teacher/QuestionList";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: number;
  title: string;
  question_type: string;
  points: string;
  difficulty: string;
  grade_level: string;
  branch: string;
  course_name: string;
  status: string;
  is_approved: boolean;
  is_public: boolean;
  usage_count: number;
  created_by_teacher_name: string;
  created_at: string;
}

const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    title: "مساحت مثلث",
    question_type: "multiple_choice",
    points: "2",
    difficulty: "medium",
    grade_level: "10",
    branch: "math",
    course_name: "هندسه 1",
    status: "approved",
    is_approved: true,
    is_public: true,
    usage_count: 5,
    created_by_teacher_name: "علی محمدی",
    created_at: "2024-01-15T10:30:00Z",
  },
];

export default function TeacherQuestionsPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  const fetchQuestions = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem("access_token");
      const schoolId = localStorage.getItem("school_id");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      if (schoolId) {
        headers["X-Tenant-ID"] = schoolId;
      }
      const response = await fetch("/api/v1/exams/questions/", {
        headers,
        signal,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      setQuestions(Array.isArray(data) ? data : data.results ?? []);
    } catch (error: any) {
      if (error?.name === "AbortError") return;

      console.error("Failed to fetch questions:", error);

      setQuestions(MOCK_QUESTIONS);

      toast({
        title: "خطا",
        description: "امکان دریافت سوالات وجود ندارد",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const controller = new AbortController();

    fetchQuestions(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchQuestions]);

  const handleQuestionCreated = async () => {
    setIsPopupOpen(false);

    await fetchQuestions();

    toast({
      title: "موفق",
      description: "سوال با موفقیت ذخیره شد",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">سوالات من</h1>
          <p className="mt-1 text-gray-500">
            مدیریت و ساخت سوالات برای بانک سوالات
          </p>
        </div>

        <Button
          onClick={() => setIsPopupOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          سوال جدید
        </Button>
      </div>

      <QuestionList
        questions={questions}
        isLoading={isLoading}
        onRefresh={() => fetchQuestions()}
      />

      <QuestionFormPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSubmit={handleQuestionCreated}
      />
    </div>
  );
}