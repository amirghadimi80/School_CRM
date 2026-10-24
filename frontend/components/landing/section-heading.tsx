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
        'mb-12 max-w-3xl',
        align === 'center' ? 'mx-auto text-center' : 'text-start',
        className
      )}
    >
      {badge && (
        <p
          className={cn(
            'mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#0c6670]',
            align === 'center' && 'justify-center'
          )}
        >
          <span className="h-px w-8 bg-[#14c4d4]" aria-hidden />
          {badge}
        </p>
      )}
      <h2 className="text-3xl font-extrabold leading-[1.45] tracking-normal text-[#102033] lg:text-[2.6rem]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-8 text-slate-600 lg:text-lg">{description}</p>
      )}
    </div>
  );
}
