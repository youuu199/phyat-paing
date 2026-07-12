interface SkeletonProps {
  className?: string;
  rounded?: string;
}

export function Skeleton({ className = '', rounded = 'rounded' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 ${rounded} ${className}`}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-5 bg-bg-card rounded-xl border border-border flex-1">
      <Skeleton className="w-9 h-9 rounded-lg" />
      <Skeleton className="w-20 h-3" />
      <Skeleton className="w-24 h-6" />
    </div>
  );
}

export function BillRowSkeleton() {
  return (
    <div className="flex items-center gap-3.5 px-4 h-[72px] bg-bg-card rounded-xl border border-border">
      <Skeleton className="w-[42px] h-[42px] rounded-[10px] shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1">
        <Skeleton className="w-40 h-3.5" />
        <Skeleton className="w-28 h-3" />
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <Skeleton className="w-20 h-3.5" />
        <Skeleton className="w-14 h-5 rounded-full" />
      </div>
    </div>
  );
}

export function BillTableSkeleton() {
  return (
    <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center h-12 px-5 bg-bg">
        <Skeleton className="w-20 h-3" />
        <Skeleton className="w-16 h-3 ml-auto" />
        <Skeleton className="w-16 h-3 ml-auto" />
        <Skeleton className="w-20 h-3 ml-auto" />
        <Skeleton className="w-14 h-3 ml-auto" />
        <Skeleton className="w-16 h-3 ml-auto" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center h-14 px-5 border-t border-border">
          <div className="flex items-center gap-3 w-[280px]">
            <Skeleton className="w-[34px] h-[34px] rounded-lg shrink-0" />
            <Skeleton className="w-36 h-3.5" />
          </div>
          <Skeleton className="w-20 h-3.5" />
          <Skeleton className="w-20 h-3.5" />
          <Skeleton className="w-24 h-3.5" />
          <Skeleton className="w-14 h-5 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="w-[30px] h-[30px] rounded-md" />
            <Skeleton className="w-[30px] h-[30px] rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="bg-bg-card rounded-xl border border-border overflow-hidden flex-1">
      <div className="flex bg-bg">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 h-10 flex items-center justify-center">
            <Skeleton className="w-8 h-3" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="min-h-[80px] p-1.5 border-b border-r border-border">
            <Skeleton className="w-7 h-7 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-5 p-6 bg-bg-card rounded-xl border border-border">
        <Skeleton className="w-[72px] h-[72px] rounded-full shrink-0" />
        <div className="flex flex-col gap-2">
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-48 h-3.5" />
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6 bg-bg-card rounded-xl border border-border">
        <Skeleton className="w-40 h-5" />
        <div className="flex gap-4">
          <Skeleton className="flex-1 h-[42px] rounded-lg" />
          <Skeleton className="flex-1 h-[42px] rounded-lg" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="flex-1 h-[42px] rounded-lg" />
          <Skeleton className="flex-1 h-[42px] rounded-lg" />
        </div>
      </div>
    </div>
  );
}
