'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/format';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variantColors = {
  default: 'text-primary',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  danger: 'text-red-600',
  info: 'text-blue-600',
};

const variantBg = {
  default: 'bg-primary/10',
  success: 'bg-green-50',
  warning: 'bg-yellow-50',
  danger: 'bg-red-50',
  info: 'bg-blue-50',
};

export function StatsCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
  variant = 'default',
}: StatsCardProps) {
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn('text-2xl font-bold', variantColors[variant])}>
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.positive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
          <div className={cn('p-3 rounded-lg', variantBg[variant])}>
            <div className={cn('h-6 w-6', variantColors[variant])}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
