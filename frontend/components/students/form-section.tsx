import { LucideIcon } from 'lucide-react';

const accentStyles = {
  blue: {
    wrap: 'border-blue-100 bg-gradient-to-l from-blue-50/90 via-white to-white',
    title: 'text-blue-800',
    icon: 'bg-blue-100 text-blue-600',
  },
  emerald: {
    wrap: 'border-emerald-100 bg-gradient-to-l from-emerald-50/90 via-white to-white',
    title: 'text-emerald-800',
    icon: 'bg-emerald-100 text-emerald-600',
  },
  violet: {
    wrap: 'border-violet-100 bg-gradient-to-l from-violet-50/90 via-white to-white',
    title: 'text-violet-800',
    icon: 'bg-violet-100 text-violet-600',
  },
  amber: {
    wrap: 'border-amber-100 bg-gradient-to-l from-amber-50/90 via-white to-white',
    title: 'text-amber-800',
    icon: 'bg-amber-100 text-amber-600',
  },
} as const;

export type FormSectionAccent = keyof typeof accentStyles;

interface FormSectionProps {
  title: string;
  icon: LucideIcon;
  accent: FormSectionAccent;
  children: React.ReactNode;
}

export function FormSection({ title, icon: Icon, accent, children }: FormSectionProps) {
  const styles = accentStyles[accent];

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${styles.wrap}`}>
      <h3 className={`mb-4 flex items-center gap-2 text-sm font-semibold ${styles.title}`}>
        <span className={`flex h-7 w-7 items-center justify-center rounded-full ${styles.icon}`}>
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}
