import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>

      {/* Summary card skeleton */}
      <div className="rounded-lg border p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-7 w-24" />
            </div>
          ))}
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border">
        <div className="p-4 flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="space-y-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 border-t px-4 py-3">
              <Skeleton className="h-4 w-4 shrink-0" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
