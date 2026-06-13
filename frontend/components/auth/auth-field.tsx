'use client';

import { InputHTMLAttributes, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  children?: ReactNode;
}

export function AuthField({ label, icon: Icon, className, children, id, ...props }: AuthFieldProps) {
  const fieldId = id || props.name;

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-medium text-slate-700">
        {label}
      </Label>
      {children ?? (
        <div className="relative">
          {Icon && (
            <Icon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            id={fieldId}
            className={cn(
              'h-11 border-slate-200 bg-slate-50/80 transition-colors focus:bg-white',
              Icon && 'pr-10',
              className
            )}
            {...props}
          />
        </div>
      )}
    </div>
  );
}
