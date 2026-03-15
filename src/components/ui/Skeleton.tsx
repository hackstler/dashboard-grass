interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <span
      className={`block bg-surface-hi rounded-[var(--radius-md)] animate-shimmer ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-8 w-full mt-4" />
    </div>
  );
}
