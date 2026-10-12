import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { clearSession } from '@/lib/session';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) return null;

  if (!refreshPromise) {
    refreshPromise = axios
      .post('/api/v1/auth/refresh', { refresh })
      .then((res) => {
        const access = res.data?.access as string | undefined;
        const nextRefresh = res.data?.refresh as string | undefined;
        if (!access) return null;
        localStorage.setItem('access_token', access);
        if (nextRefresh) localStorage.setItem('refresh_token', nextRefresh);
        if (res.data?.user) localStorage.setItem('user', JSON.stringify(res.data.user));
        document.cookie = `access_token=${encodeURIComponent(access)}; Path=/; SameSite=Lax`;
        return access;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const schoolId = localStorage.getItem('school_id');
    if (schoolId) {
      config.headers['X-Tenant-ID'] = schoolId;
    }
  }
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const url = original?.url || '';
    const isAuthCall = url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/register');
    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      const access = await refreshAccessToken();
      if (access) {
        original.headers.Authorization = `Bearer ${access}`;
        return apiClient(original);
      }
      clearSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  },
);

type Query = Record<string, string | number | boolean | undefined | null>;

interface AssignmentRow {
  course_id: number;
  course_name: string;
  weekly_hours: number;
  teacher_id: number | null;
  teacher_name: string | null;
  is_assigned: boolean;
}

function params(query?: Query) {
  if (!query) return undefined;
  const cleaned: Record<string, string | number | boolean> = {};
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value;
    }
  });
  return cleaned;
}

async function unwrap<T>(promise: Promise<{ data: T }>): Promise<T> {
  const response = await promise;
  return response.data;
}

export const api = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return apiClient.get<T>(url, config);
  },

  getMe: () => unwrap<any>(apiClient.get('/auth/me')),
  updateMe: (payload: Record<string, unknown>) => unwrap<any>(apiClient.patch('/auth/me', payload)),
  uploadUserAvatar: (file: File) => {
    const body = new FormData();
    body.append('avatar', file);
    return unwrap(apiClient.post('/auth/me/upload_avatar', body));
  },
  changePassword: (payload: { old_password: string; new_password: string; new_password_confirm: string }) =>
    unwrap(apiClient.post('/auth/me/change_password', payload)),

  getMySchool: () => unwrap<{ current_academic_year?: string; name?: string }>(apiClient.get('/schools/schools/me/')),
  getAcademicYears: () => unwrap<any>(apiClient.get('/schools/academic-years/')),
  getPeriods: () => unwrap<any>(apiClient.get('/schools/periods/')),
  ensureOfficialCurriculum: (payload: { grade_level: string; branch?: string }) =>
    unwrap<any>(apiClient.post('/schools/curriculum/ensure_official/', payload)),
  createCurriculumEntry: (payload: Record<string, unknown>) =>
    unwrap(apiClient.post('/schools/curriculum/', payload)),
  deleteCurriculumEntry: (id: number) => unwrap(apiClient.delete(`/schools/curriculum/${id}/`)),

  getTeacherAvailabilities: (teacherId: number) =>
    unwrap<any>(apiClient.get('/schools/teacher-availabilities/', { params: { teacher: teacherId } })),
  updateTeacherAvailability: (id: number, payload: { periods: number[] }) =>
    unwrap(apiClient.patch(`/schools/teacher-availabilities/${id}/`, payload)),
  saveTeacherAvailability: (payload: { teacher: number; day_of_week: number; periods: number[] }) =>
    unwrap(apiClient.post('/schools/teacher-availabilities/', payload)),

  getSchedulesByClass: (academicYear?: string) =>
    unwrap<Record<string, { schedules?: Array<{ day_of_week: number; period_number: number; course_name: string; teacher_name: string }> }>>(
      apiClient.get('/schools/schedules/by_class/', { params: params({ academic_year: academicYear }) }),
    ),
  generateClassSchedule: (payload: { class_id: number; academic_year?: string; regenerate?: boolean }) =>
    unwrap<{ generated: number; warnings?: string[]; status?: string; errors?: string[] }>(
      apiClient.post('/schools/schedules/generate/', payload),
    ),

  getClasses: () => unwrap<any>(apiClient.get('/classes/')),
  createClass: (payload: Record<string, unknown>) => unwrap(apiClient.post('/classes/', payload)),

  getTeachers: (query?: Query) => unwrap<any>(apiClient.get('/teachers/', { params: params(query) })),
  createTeacher: (payload: Record<string, unknown>) => unwrap<any>(apiClient.post('/teachers/', payload)),
  downloadTeacherGradebook: async (teacherId: number, academicYear?: string) => {
    const response = await apiClient.get(`/teachers/${teacherId}/gradebook_pdf/`, {
      params: params({ academic_year: academicYear }),
      responseType: 'blob',
    });
    return response.data as Blob;
  },
  getClassAssignments: (classId: number | string) =>
    unwrap<{
      class: { id: number; name: string; grade_level: string; branch: string | null; branch_display: string | null };
      academic_year?: string;
      assignments?: AssignmentRow[];
      status: {
        is_complete: boolean;
        assigned_count: number;
        total_courses: number;
        missing_courses: string[];
      };
    }>(apiClient.get('/teachers/assignments/', { params: { class_id: classId } })),
  getAssignmentStatus: (classId: number, academicYear?: string) =>
    unwrap<{ is_complete: boolean; assigned_count: number; total_courses: number; missing_courses: string[] }>(
      apiClient.get('/teachers/assignments/status/', {
        params: params({ class_id: classId, academic_year: academicYear }),
      }),
    ),
  bulkAssignTeachers: (payload: {
    class_id: number | string;
    academic_year: string;
    assignments: Array<{ course_id: number; teacher_id: number }>;
  }) => unwrap<{
    status: {
      is_complete: boolean;
      assigned_count: number;
      total_courses: number;
      missing_courses: string[];
    };
  }>(apiClient.post('/teachers/assignments/bulk/', payload)),

  getStudents: (query?: Query) => unwrap<any>(apiClient.get('/students/', { params: params(query) })),
  createStudent: (payload: Record<string, unknown>) =>
    unwrap<{ id: number }>(apiClient.post('/students/', payload)),
  generateStudentCode: () => unwrap<{ national_id: string }>(apiClient.get('/students/generate_code/')),
  getStudentMe: () => unwrap<any>(apiClient.get('/students/me/')),
  updateStudent: (id: string | number, payload: Record<string, unknown>) =>
    unwrap(apiClient.patch(`/students/${id}/`, payload)),
  uploadStudentAvatar: (studentId: string | number, file: File) => {
    const body = new FormData();
    body.append('avatar', file);
    return unwrap(apiClient.post(`/students/${studentId}/upload_avatar/`, body));
  },
  uploadStudentDocument: (studentId: string | number, file: File) => {
    const body = new FormData();
    body.append('student', String(studentId));
    body.append('file', file);
    body.append('title', file.name);
    body.append('document_type', 'other');
    return unwrap(apiClient.post('/students/documents/', body));
  },
};

export default api;
