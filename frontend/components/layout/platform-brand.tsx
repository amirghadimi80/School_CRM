import { PLATFORM_NAME } from '@/lib/brand';
import { cn } from '@/lib/utils';

interface PlatformBrandProps {
  schoolName?: string;
  className?: string;
  titleClassName?: string;
}

export function PlatformBrand({ schoolName, className, titleClassName }: PlatformBrandProps) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent p-1.5 ring-1 ring-primary/10">
        <img src="/images/logo.png" alt="سپاد" className="h-full w-full object-contain" />
      </div>
      <div className="min-w-0">
        <p className={cn('font-bold leading-tight', titleClassName || 'text-sm')}>
          {PLATFORM_NAME}
        </p>
        {schoolName && (
          <p className="truncate text-xs text-muted-foreground">{schoolName}</p>
        )}
      </div>
    </div>
  );
}
