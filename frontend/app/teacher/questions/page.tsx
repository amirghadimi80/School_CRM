"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QuestionFormPopup } from "@/components/teacher/QuestionFormPopup";
import { QuestionList } from "@/components/teacher/QuestionList";
import { useToast } from "@/hooks/use-toast";

// Mock data for testing
const MOCK_QUESTIONS = [
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
  {
    id: 2,
    title: "قانون نیوتن",
    question_type: "short_answer",
    points: "3",
    difficulty: "hard",
    grade_level: "11",
    branch: "science",
    course_name: "فیزیک 2",
    status: "draft",
    is_approved: false,
    is_public: false,
    usage_count: 0,
    created_by_teacher_name: "علی محمدی",
    created_at: "2024-01-20T14:20:00Z",
  },
];

export default function TeacherQuestionsPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/v1/exams/questions/");
      if (!response.ok) throw new Error("Failed to fetch questions");
      const data = await response.json();
      setQuestions(data.results || data);
    } catch (error) {
      // Use mock data if API fails
      console.log("Using mock data - API not available");
      setQuestions(MOCK_QUESTIONS);
      toast({
        title: "اطلاع",
        description: "دیتای نمونه نمایش داده می‌شود",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleQuestionCreated = () => {
    fetchQuestions();
    toast({
      title: "Success",
      description: "Question saved successfully",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">سوالات من</h1>
          <p className="text-gray-500 mt-1">
            مدیریت و ساخت سوالات برای بانک سوالات
          </p>
        </div>
        <Button onClick={() => setIsPopupOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          سوال جدید
        </Button>
      </div>

      <QuestionList
        questions={questions}
        isLoading={isLoading}
        onRefresh={fetchQuestions}
      />

      <QuestionFormPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSubmit={handleQuestionCreated}
      />
    </div>
  );
}
