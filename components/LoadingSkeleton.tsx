"use client";

export function StatsSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-card p-6">
          <div className="h-4 bg-neutral-200 rounded w-1/3 mb-4 animate-pulse" />
          <div className="h-10 bg-neutral-200 rounded w-1/2 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      <div className="animate-pulse">
        <div className="h-12 bg-neutral-100" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-16 border-b border-neutral-200 flex items-center px-6">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-neutral-200 rounded w-1/4" />
              <div className="h-3 bg-neutral-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-card p-6 animate-pulse">
      <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-neutral-200 rounded w-full" />
        <div className="h-4 bg-neutral-200 rounded w-5/6" />
        <div className="h-4 bg-neutral-200 rounded w-4/6" />
      </div>
    </div>
  );
}
