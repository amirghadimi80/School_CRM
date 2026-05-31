"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Edit,
  Trash2,
  Copy,
  RefreshCw,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Question {
  id: number;
  title: string;
  question_type: string;
  points: string;
  difficulty: string;
  grade_level: string;
  branch: string | null;
  course_name: string;
  status: string;
  is_approved: boolean;
  is_public: boolean;
  usage_count: number;
  created_by_teacher_name: string;
  created_at: string;
}

interface QuestionListProps {
  questions: Question[];
  isLoading: boolean;
  onRefresh: () => void;
}

const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "پیش‌نویس", color: "bg-gray-100 text-gray-800", icon: FileText },
  pending: { label: "در انتظار تایید", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  approved: { label: "تایید شده", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "رد شده", color: "bg-red-100 text-red-800", icon: XCircle },
  archived: { label: "بایگانی", color: "bg-purple-100 text-purple-800", icon: FileText },
};

const difficultyLabels: Record<string, string> = {
  easy: "آسان",
  medium: "متوسط",
  hard: "سخت",
};

const typeLabels: Record<string, string> = {
  multiple_choice: "چند گزینه‌ای",
  true_false: "صحیح/غلط",
  short_answer: "پاسخ کوتاه",
  essay: "تشریحی",
  fill_blank: "جای خالی",
  matching: "تطابق",
};

export function QuestionList({
  questions,
  isLoading,
  onRefresh,
}: QuestionListProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [gradeFilter, setGradeFilter] = useState<string>("");

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این سوال اطمینان دارید؟")) return;

    try {
      const response = await fetch(`/api/v1/exams/questions/${id}/`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast({
        title: "Success",
        description: "سوال حذف شد",
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "خطا در حذف سوال",
        variant: "destructive",
      });
    }
  };

  const handleCopy = async (id: number) => {
    try {
      const response = await fetch(`/api/v1/exams/questions/${id}/`);
      if (!response.ok) throw new Error("Failed to fetch");
      const question = await response.json();

      // Create copy
      const copyResponse = await fetch("/api/v1/exams/questions/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...question,
          title: `${question.title} (کپی)`,
        }),
      });

      if (!copyResponse.ok) throw new Error("Failed to copy");

      toast({
        title: "Success",
        description: "سوال کپی شد",
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "خطا در کپی سوال",
        variant: "destructive",
      });
    }
  };

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      !searchTerm ||
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.course_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || q.status === statusFilter;
    const matchesGrade = !gradeFilter || q.grade_level === gradeFilter;

    return matchesSearch && matchesStatus && matchesGrade;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32 bg-gray-100" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="جستجو..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64 text-right"
        />
        <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="همه وضعیت‌ها" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            <SelectItem value="draft">پیش‌نویس</SelectItem>
            <SelectItem value="pending">در انتظار تایید</SelectItem>
            <SelectItem value="approved">تایید شده</SelectItem>
            <SelectItem value="rejected">رد شده</SelectItem>
          </SelectContent>
        </Select>
        <Select value={gradeFilter || "all"} onValueChange={(v) => setGradeFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="همه پایه‌ها" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>
                پایه {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            سوالی یافت نشد
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((question) => {
            const StatusIcon = statusLabels[question.status]?.icon || FileText;
            const statusClass =
              statusLabels[question.status]?.color || "bg-gray-100";

            return (
              <Card key={question.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold text-lg">{question.title}</h3>
                        <Badge className={cn("text-xs", statusClass)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusLabels[question.status]?.label || question.status}
                        </Badge>
                        {question.is_public && (
                          <Badge variant="outline" className="text-xs">
                            عمومی
                          </Badge>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span>
                          نوع: {typeLabels[question.question_type] || question.question_type}
                        </span>
                        <span>نمره: {question.points}</span>
                        <span>
                          سطح: {difficultyLabels[question.difficulty] || question.difficulty}
                        </span>
                        <span>
                          پایه {question.grade_level}
                          {question.branch && ` - ${question.branch}`}
                        </span>
                        <span>درس: {question.course_name}</span>
                        <span>استفاده: {question.usage_count} بار</span>
                      </div>

                      {/* Footer */}
                      <div className="mt-3 text-xs text-gray-400">
                        ساخته شده توسط {question.created_by_teacher_name} |{" "}
                        {new Date(question.created_at).toLocaleDateString("fa-IR")}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600"
                        title="مشاهده"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600"
                        title="کپی"
                        onClick={() => handleCopy(question.id)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="ویرایش"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        title="حذف"
                        onClick={() => handleDelete(question.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
