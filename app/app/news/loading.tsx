import { Skeleton } from "@/components/ui/skeleton"

export default function NewsLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8" role="status" aria-label="Loading news">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      <div className="mt-6 grid grid-cols-5 gap-1 rounded-xl border border-border bg-surface-2 p-1">
        {[0, 1, 2, 3, 4].map((tab) => (
          <Skeleton key={tab} className="h-10 rounded-lg" />
        ))}
      </div>
      <div className="mt-6 space-y-6">
        {[0, 1].map((group) => (
          <section key={group}>
            <Skeleton className="mb-3 h-3 w-24" />
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="flex h-44 flex-col rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="mt-4 h-4 w-4/5" />
                  <Skeleton className="mt-2 h-4 w-2/3" />
                  <Skeleton className="mt-auto h-10 w-full rounded-lg sm:w-40" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
