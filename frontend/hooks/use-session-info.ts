'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface StoredUser {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  role_display?: string;
  school_name?: string;
}

function resolveUserName(user: StoredUser | null): string {
  if (!user) return '';
  if (user.full_name?.trim()) return user.full_name.trim();
  return `${user.first_name || ''} ${user.last_name || ''}`.trim();
}

export function useSessionInfo() {
  const [userName, setUserName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [roleDisplay, setRoleDisplay] = useState('');

  useEffect(() => {
    const cached = localStorage.getItem('user');
    let parsed: StoredUser | null = null;
    if (cached) {
      try {
        parsed = JSON.parse(cached) as StoredUser;
        setUserName(resolveUserName(parsed));
        setRoleDisplay(parsed.role_display || '');
        if (parsed.school_name) setSchoolName(parsed.school_name);
      } catch {
        // ignore invalid cache
      }
    }

    const load = async () => {
      const [me, school] = await Promise.all([
        api.getMe().catch(() => null),
        api.getMySchool().catch(() => null),
      ]);

      if (me) {
        const name = resolveUserName(me);
        if (name) setUserName(name);
        if (me.role_display) setRoleDisplay(me.role_display);
        if (me.school_name && !school?.name) setSchoolName(me.school_name);
      }
      if (school?.name) setSchoolName(school.name);
    };

    load();

    const onSessionUpdated = () => {
      const cached = localStorage.getItem('user');
      if (!cached) return;
      try {
        const parsed = JSON.parse(cached) as StoredUser;
        setUserName(resolveUserName(parsed));
        setRoleDisplay(parsed.role_display || '');
        if (parsed.school_name) setSchoolName(parsed.school_name);
      } catch {
        // ignore invalid cache
      }
    };

    window.addEventListener('session-updated', onSessionUpdated);
    return () => window.removeEventListener('session-updated', onSessionUpdated);
  }, []);

  const userInitial = userName ? userName.trim().charAt(0) : '؟';

  return { userName, schoolName, roleDisplay, userInitial };
}
