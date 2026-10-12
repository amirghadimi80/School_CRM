export interface SessionUser {
  role?: string;
  school?: { id?: string | number } | string | number | null;
  [key: string]: unknown;
}

export interface SessionPayload {
  access: string;
  refresh: string;
  user: SessionUser;
}

const COOKIE = 'access_token';

export function setSession(data: SessionPayload) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  localStorage.setItem('user', JSON.stringify(data.user));

  const school = data.user?.school;
  const schoolId = typeof school === 'object' && school ? school.id : school;
  if (schoolId !== undefined && schoolId !== null && schoolId !== '') {
    localStorage.setItem('school_id', String(schoolId));
  }

  document.cookie = `${COOKIE}=${encodeURIComponent(data.access)}; Path=/; SameSite=Lax`;
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('school_id');
  document.cookie = `${COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
