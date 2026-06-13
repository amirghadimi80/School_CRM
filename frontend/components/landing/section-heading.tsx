import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  badge?: string;
  title: string;
  description?: string;
  className?: string;
  align?: 'center' | 'right';
}

export function SectionHeading({
  badge,
  title,
  description,
  className,
  align = 'center',
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-14 max-w-3xl',
        align === 'center' ? 'mx-auto text-center' : 'text-right',
        className
      )}
    >
      {badge && (
        <span className="mb-4 inline-block rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
          {badge}
        </span>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">{title}</h2>
      {description && (
        <p className="mt-4 text-lg leading-relaxed text-slate-600">{description}</p>
      )}
    </div>
  );
}
