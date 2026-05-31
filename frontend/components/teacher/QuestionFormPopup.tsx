"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Trash2,
  Check,
  FileText,
  Type,
  Loader2,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Grade {
  value: string;
  label: string;
}

interface Branch {
  value: string;
  label: string;
}

interface Course {
  id: number;
  code: string;
  name: string;
  category: string;
}

interface QuestionFormPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  initialData?: any;
  mode?: "create" | "edit";
}

export function QuestionFormPopup({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "create",
}: QuestionFormPopupProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Cascading dropdown states
  const [grades, setGrades] = useState<Grade[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Form data
  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [course, setCourse] = useState<string>("");

  // Input method
  const [inputMethod, setInputMethod] = useState<"type" | "upload">("type");

  // Question content
  const [questionType, setQuestionType] = useState("multiple_choice");
  const [questionText, setQuestionText] = useState("");
  const [points, setPoints] = useState("1");
  const [difficulty, setDifficulty] = useState("medium");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // Multiple choice options
  const [options, setOptions] = useState<
    { id: number; text: string; isCorrect: boolean }[]
  >([
    { id: 1, text: "", isCorrect: false },
    { id: 2, text: "", isCorrect: false },
    { id: 3, text: "", isCorrect: false },
    { id: 4, text: "", isCorrect: false },
  ]);

  // File upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Load grades on mount
  useEffect(() => {
    if (isOpen) {
      fetchGrades();
    }
  }, [isOpen]);

  // Load branches when grade changes
  useEffect(() => {
    if (grade) {
      fetchBranches(grade);
      setBranch("");
      setCourse("");
      setCourses([]);
    }
  }, [grade]);

  // Load courses when branch or grade changes
  useEffect(() => {
    if (grade && (parseInt(grade) < 10 || branch)) {
      fetchCourses(grade, branch);
      setCourse("");
    }
  }, [grade, branch]);

  const fetchGrades = async () => {
    try {
      const response = await fetch("/api/v1/exams/curriculum/grades/");
      const data = await response.json();
      setGrades(data);
    } catch (error) {
      console.error("Failed to fetch grades:", error);
      // Fallback
      setGrades(
        Array.from({ length: 12 }, (_, i) => ({
          value: String(i + 1),
          label: `پایه ${i + 1}`,
        }))
      );
    }
  };

  const fetchBranches = async (gradeValue: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `/api/v1/exams/curriculum/branches/?grade=${gradeValue}`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setBranches(data);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
      // Fallback for testing
      if (parseInt(gradeValue) >= 10) {
        setBranches([
          { value: 'math', label: 'ریاضی' },
          { value: 'science', label: 'تجربی' },
          { value: 'humanities', label: 'انسانی' },
        ]);
      }
    }
  };

  const fetchCourses = async (gradeValue: string, branchValue: string) => {
    try {
      const token = localStorage.getItem('access_token');
      let url = `/api/v1/exams/curriculum/courses/?grade=${gradeValue}`;
      if (branchValue) {
        url += `&branch=${branchValue}`;
      }
      const response = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      // Comprehensive fallback data for all grades (Iranian curriculum)
      const gradeNum = parseInt(gradeValue);
      let fallbackCourses: Course[] = [];
      
      if (gradeNum <= 6) {
        // Elementary (پایه ۱-۶)
        fallbackCourses = [
          { id: 1, code: 'FA', name: 'فارسی', category: 'language' },
          { id: 2, code: 'NG', name: 'نگارش', category: 'language' },
          { id: 3, code: 'MA', name: 'ریاضی', category: 'math' },
          { id: 4, code: 'SC', name: 'علوم تجربی', category: 'science' },
          { id: 5, code: 'QR', name: 'قرآن', category: 'religion' },
          { id: 6, code: 'HD', name: 'هدیه‌های آسمانی', category: 'religion' },
          { id: 7, code: 'PE', name: 'تربیت بدنی', category: 'sports' },
          { id: 8, code: 'AR', name: 'آموزش هنر', category: 'arts' },
        ];
        if (gradeNum >= 3) {
          fallbackCourses.push({ id: 9, code: 'SO', name: 'مطالعات اجتماعی', category: 'general' });
        }
        if (gradeNum >= 5) {
          fallbackCourses.push({ id: 10, code: 'TP', name: 'تفکر و پژوهش', category: 'general' });
        }
        if (gradeNum >= 6) {
          fallbackCourses.push({ id: 11, code: 'WF', name: 'کار و فناوری', category: 'technology' });
        }
      } else if (gradeNum <= 9) {
        // Middle School (پایه ۷-۹)
        fallbackCourses = [
          { id: 1, code: 'FA', name: 'فارسی', category: 'language' },
          { id: 2, code: 'NG', name: 'نگارش', category: 'language' },
          { id: 3, code: 'MA', name: 'ریاضی', category: 'math' },
          { id: 4, code: 'SC', name: 'علوم تجربی', category: 'science' },
          { id: 5, code: 'SO', name: 'مطالعات اجتماعی', category: 'general' },
          { id: 6, code: 'QR', name: 'قرآن', category: 'religion' },
          { id: 7, code: 'PA', name: 'پیام‌های آسمان', category: 'religion' },
          { id: 8, code: 'AR', name: 'عربی', category: 'language' },
          { id: 9, code: 'EN', name: 'زبان انگلیسی', category: 'language' },
          { id: 10, code: 'CU', name: 'فرهنگ و هنر', category: 'arts' },
          { id: 11, code: 'WF', name: 'کار و فناوری', category: 'technology' },
          { id: 12, code: 'TS', name: 'تفکر و سبک زندگی', category: 'general' },
          { id: 13, code: 'PE', name: 'تربیت بدنی', category: 'sports' },
        ];
        if (gradeNum === 9) {
          fallbackCourses.push({ id: 14, code: 'AD', name: 'آمادگی دفاعی', category: 'sports' });
        }
      } else {
        // High School (پایه ۱۰-۱۲) - Branch specific
        const branch = branchValue || 'math';
        if (branch === 'science') {
          fallbackCourses = [
            { id: 1, code: 'FA', name: `فارسی ${gradeNum-9}`, category: 'language' },
            { id: 2, code: 'NG', name: `نگارش ${gradeNum-9}`, category: 'language' },
            { id: 3, code: 'MA', name: `ریاضی ${gradeNum-9}`, category: 'math' },
            { id: 4, code: 'PH', name: `فیزیک ${gradeNum-9}`, category: 'science' },
            { id: 5, code: 'CH', name: `شیمی ${gradeNum-9}`, category: 'science' },
            { id: 6, code: 'BI', name: `زیست‌شناسی ${gradeNum-9}`, category: 'science' },
            { id: 7, code: 'AB', name: 'عربی، زبان قرآن', category: 'language' },
            { id: 8, code: 'DZ', name: 'دین و زندگی', category: 'religion' },
            { id: 9, code: 'EN', name: `زبان انگلیسی ${gradeNum-9}`, category: 'language' },
            { id: 10, code: 'PE', name: 'تربیت بدنی', category: 'sports' },
          ];
        } else if (branch === 'math') {
          fallbackCourses = [
            { id: 1, code: 'FA', name: `فارسی ${gradeNum-9}`, category: 'language' },
            { id: 2, code: 'NG', name: `نگارش ${gradeNum-9}`, category: 'language' },
            { id: 3, code: `MA${gradeNum-9}`, name: gradeNum === 10 ? 'هندسه ۱' : (gradeNum === 11 ? 'حسابان ۱' : 'حسابان ۲'), category: 'math' },
            { id: 4, code: 'MA2', name: `ریاضی ${gradeNum-9}`, category: 'math' },
            { id: 5, code: 'PH', name: `فیزیک ${gradeNum-9}`, category: 'science' },
            { id: 6, code: 'CH', name: `شیمی ${gradeNum-9}`, category: 'science' },
            { id: 7, code: 'AB', name: 'عربی، زبان قرآن', category: 'language' },
            { id: 8, code: 'DZ', name: 'دین و زندگی', category: 'religion' },
            { id: 9, code: 'EN', name: `زبان انگلیسی ${gradeNum-9}`, category: 'language' },
            { id: 10, code: 'PE', name: 'تربیت بدنی', category: 'sports' },
          ];
        } else {
          // humanities
          fallbackCourses = [
            { id: 1, code: 'FA', name: `فارسی ${gradeNum-9}`, category: 'language' },
            { id: 2, code: 'NG', name: `نگارش ${gradeNum-9}`, category: 'language' },
            { id: 3, code: 'MA', name: `ریاضی و آمار ${gradeNum-9}`, category: 'math' },
            { id: 4, code: 'SC', name: 'اجتماعی', category: 'general' },
            { id: 5, code: 'AB', name: 'عربی، زبان قرآن', category: 'language' },
            { id: 6, code: 'DZ', name: 'دین و زندگی', category: 'religion' },
            { id: 7, code: 'EN', name: `زبان انگلیسی ${gradeNum-9}`, category: 'language' },
            { id: 8, code: 'PE', name: 'تربیت بدنی', category: 'sports' },
          ];
        }
      }
      setCourses(fallbackCourses);
    }
  };

  const handleAddOption = () => {
    const newId = Math.max(...options.map((o) => o.id), 0) + 1;
    setOptions([...options, { id: newId, text: "", isCorrect: false }]);
  };

  const handleRemoveOption = (id: number) => {
    if (options.length <= 2) {
      toast({
        title: "Error",
        description: "Minimum 2 options required",
        variant: "destructive",
      });
      return;
    }
    setOptions(options.filter((o) => o.id !== id));
  };

  const handleOptionChange = (id: number, text: string) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const handleCorrectToggle = (id: number) => {
    if (questionType === "multiple_choice") {
      // Single correct answer
      setOptions(
        options.map((o) => ({ ...o, isCorrect: o.id === id }))
      );
    } else if (questionType === "true_false") {
      // Single correct answer
      setOptions(
        options.map((o) => ({ ...o, isCorrect: o.id === id }))
      );
    }
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "عنوان سوال الزامی است",
        variant: "destructive",
      });
      return false;
    }
    if (!grade) {
      toast({
        title: "Error",
        description: "انتخاب پایه الزامی است",
        variant: "destructive",
      });
      return false;
    }
    if (parseInt(grade) >= 10 && !branch) {
      toast({
        title: "Error",
        description: "انتخاب رشته الزامی است",
        variant: "destructive",
      });
      return false;
    }
    if (!course) {
      toast({
        title: "Error",
        description: "انتخاب درس الزامی است",
        variant: "destructive",
      });
      return false;
    }

    if (inputMethod === "type") {
      if (!questionText.trim()) {
        toast({
          title: "Error",
          description: "متن سوال الزامی است",
          variant: "destructive",
        });
        return false;
      }

      if (
        questionType === "multiple_choice" ||
        questionType === "true_false"
      ) {
        const hasCorrect = options.some((o) => o.isCorrect);
        if (!hasCorrect) {
          toast({
            title: "Error",
            description: "حداقل یک گزینه صحیح انتخاب کنید",
            variant: "destructive",
          });
          return false;
        }

        const emptyOptions = options.some((o) => !o.text.trim());
        if (emptyOptions) {
          toast({
            title: "Error",
            description: "همه گزینه‌ها باید متن داشته باشند",
            variant: "destructive",
          });
          return false;
        }
      }
    } else {
      if (!uploadedFile) {
        toast({
          title: "Error",
          description: "فایل PDF آپلود کنید",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSave = async (submitForApproval: boolean = false) => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      let questionData: any = {
        title,
        grade_level: grade,
        branch: parseInt(grade) >= 10 ? branch : "",
        course: parseInt(course),
        question_type: questionType,
        points: parseFloat(points),
        difficulty,
        tags,
      };

      if (inputMethod === "type") {
        questionData.question_text = questionText;
        questionData.options = {
          options: options.map((o) => ({
            id: o.id,
            text: o.text,
            is_correct: o.isCorrect,
          })),
        };
        questionData.correct_answer = options
          .filter((o) => o.isCorrect)
          .map((o) => o.id);
      } else {
        // PDF upload mode
        questionData.question_text = `PDF Question: ${uploadedFile?.name}`;
        questionData.options = {};
        questionData.correct_answer = {};
      }

      // Create question
      const response = await fetch("/api/v1/exams/questions/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        throw new Error("Failed to save question");
      }

      const savedQuestion = await response.json();

      // If PDF uploaded, upload the file
      if (inputMethod === "upload" && uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);

        const uploadResponse = await fetch(
          `/api/v1/exams/questions/${savedQuestion.id}/upload_file/`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error("Question saved but file upload failed");
        }
      }

      // Submit for approval if requested
      if (submitForApproval) {
        const approvalResponse = await fetch(
          `/api/v1/exams/questions/${savedQuestion.id}/submit_for_approval/`,
          {
            method: "POST",
          }
        );

        if (!approvalResponse.ok) {
          throw new Error("Question saved but approval submission failed");
        }
      }

      toast({
        title: "Success",
        description: submitForApproval
          ? "سوال ذخیره و برای تایید ارسال شد"
          : "سوال به عنوان پیش‌نویس ذخیره شد",
      });

      onSubmit();
      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save question",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setTitle("");
    setGrade("");
    setBranch("");
    setCourse("");
    setQuestionText("");
    setPoints("1");
    setDifficulty("medium");
    setTags([]);
    setOptions([
      { id: 1, text: "", isCorrect: false },
      { id: 2, text: "", isCorrect: false },
      { id: 3, text: "", isCorrect: false },
      { id: 4, text: "", isCorrect: false },
    ]);
    setUploadedFile(null);
    setInputMethod("type");
    setBranches([]);
    setCourses([]);
    onClose();
  };

  // Check if branch should be shown
  const showBranch = grade && parseInt(grade) >= 10;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === "create" ? "ثبت سوال جدید" : "ویرایش سوال"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">عنوان سوال *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلا: مساحت مثلث - هندسه 2"
              className="text-right"
            />
          </div>

          {/* Cascading Dropdowns */}
          <div className="space-y-4">
            <Label>دسته‌بندی *</Label>
            <div className="grid grid-cols-3 gap-4">
              {/* Grade */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-500">پایه</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="انتخاب پایه" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Branch - Only for grades 10-12 */}
              <div className={cn("space-y-2", !showBranch && "opacity-50 pointer-events-none")}>
                <Label className="text-sm text-gray-500">رشته</Label>
                <Select
                  value={branch}
                  onValueChange={setBranch}
                  disabled={!showBranch}
                >
                  <SelectTrigger className="text-right">
                    <SelectValue
                      placeholder={
                        showBranch ? "انتخاب رشته" : "فقط پایه ۱۰ به بالا"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.value} value={b.value}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Course */}
              <div className={cn("space-y-2", !grade && "opacity-50 pointer-events-none")}>
                <Label className="text-sm text-gray-500">درس</Label>
                <Select
                  value={course}
                  onValueChange={setCourse}
                  disabled={!grade || (parseInt(grade) >= 10 && !branch)}
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="انتخاب درس" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Input Method Tabs */}
          <Tabs
            value={inputMethod}
            onValueChange={(v: string) => setInputMethod(v as "type" | "upload")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="type" className="gap-2">
                <Type className="w-4 h-4" />
                تایپ دستی
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2">
                <FileText className="w-4 h-4" />
                آپلود PDF
              </TabsTrigger>
            </TabsList>

            <TabsContent value="type" className="space-y-4">
              {/* Question Type */}
              <div className="space-y-2">
                <Label>نوع سوال</Label>
                <Select value={questionType} onValueChange={setQuestionType}>
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">
                      چند گزینه‌ای
                    </SelectItem>
                    <SelectItem value="true_false">صحیح / غلط</SelectItem>
                    <SelectItem value="short_answer">پاسخ کوتاه</SelectItem>
                    <SelectItem value="essay">تشریحی</SelectItem>
                    <SelectItem value="fill_blank">جای خالی</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <Label>متن سوال</Label>
                <Textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="متن کامل سوال را وارد کنید..."
                  className="min-h-[100px] text-right"
                />
              </div>

              {/* Options for Multiple Choice / True False */}
              {(questionType === "multiple_choice" ||
                questionType === "true_false") && (
                <div className="space-y-3">
                  <Label>گزینه‌ها</Label>
                  {options.map((option, index) => (
                    <div
                      key={option.id}
                      className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50"
                    >
                      <button
                        onClick={() => handleCorrectToggle(option.id)}
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                          option.isCorrect
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-400 hover:bg-gray-300"
                        )}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-gray-500 w-6">
                        {index + 1}.
                      </span>
                      <Input
                        value={option.text}
                        onChange={(e) =>
                          handleOptionChange(option.id, e.target.value)
                        }
                        placeholder={`گزینه ${index + 1}`}
                        className="flex-1 text-right"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(option.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={handleAddOption}
                    className="w-full gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    افزودن گزینه
                  </Button>
                </div>
              )}

              {/* Points and Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نمره سوال</Label>
                  <Input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    min="0.5"
                    step="0.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>سطح دشواری</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">آسان</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="hard">سخت</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>برچسب‌ها</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="برچسب جدید"
                    className="text-right"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button variant="outline" onClick={handleAddTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <FileText className="w-12 h-12 text-gray-400" />
                  <span className="text-gray-600">
                    {uploadedFile
                      ? uploadedFile.name
                      : "فایل PDF را انتخاب کنید"}
                  </span>
                  <span className="text-sm text-gray-400">
                    حداکثر ۱۰ مگابایت
                  </span>
                </label>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            انصراف
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              "💾 ذخیره پیش‌نویس"
            )}
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                در حال ارسال...
              </>
            ) : (
              "📤 ارسال برای تایید"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
