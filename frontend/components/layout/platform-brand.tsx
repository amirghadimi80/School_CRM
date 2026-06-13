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
      <img src="/images/logo.png" alt="سپاد" className="h-8 w-8 shrink-0 object-contain" />
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
