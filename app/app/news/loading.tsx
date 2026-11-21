import { Skeleton } from "@/components/ui/skeleton"

export default function NewsLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8" role="status" aria-label="Loading news">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      <Skeleton className="mt-6 h-10 w-full" />
      <div className="mt-6 space-y-6">
        {[0, 1].map((group) => (
          <section key={group}>
            <Skeleton className="mb-3 h-3 w-24" />
            <ul className="space-y-3">
              {[0, 1, 2].map((row) => (
                <li key={row}>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="mt-3 h-4 w-3/4" />
                    <Skeleton className="mt-2 h-3 w-full" />
                    <Skeleton className="mt-1.5 h-3 w-5/6" />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
