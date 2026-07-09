"use client";

// Reusable skeleton loading components.
// Use these in place of content while async data loads.

interface SkeletonProps {
  className?: string;
}

export function SkeletonLine({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-200 rounded-lg h-4 ${className}`}
    />
  );
}

export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-white border border-slate-100 rounded-2xl p-5 space-y-3 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-200 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="w-3/4" />
          <SkeletonLine className="w-1/2 h-3" />
        </div>
      </div>
      <SkeletonLine />
      <SkeletonLine className="w-5/6" />
    </div>
  );
}

export function SkeletonAvatar({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse w-10 h-10 bg-slate-200 rounded-full flex-shrink-0 ${className}`}
    />
  );
}

export function SkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
