"use client";

import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Reusable empty state for when lists/collections have no items. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-brand-lilac flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-brand-purple" />
      </div>
      <h4 className="text-sm font-bold text-slate-800 mb-1">{title}</h4>
      {description && (
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-5 py-2.5 bg-brand-purple hover:bg-brand-indigo text-white text-xs font-bold rounded-xl transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
