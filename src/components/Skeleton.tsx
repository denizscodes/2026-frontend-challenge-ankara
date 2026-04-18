import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
    />
  );
};

export const CardSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
    <Skeleton className="mb-4 h-6 w-3/4" />
    <Skeleton className="mb-2 h-4 w-1/2" />
    <Skeleton className="mb-2 h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);
