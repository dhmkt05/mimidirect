export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="rounded-[2rem] border border-border bg-surface px-6 py-12 shadow-sm sm:px-10">
        <div className="mx-auto max-w-3xl animate-pulse text-center">
          <div className="mx-auto h-4 w-48 rounded-full bg-surface-strong" />
          <div className="mx-auto mt-6 h-14 w-3/4 rounded-2xl bg-surface-strong" />
          <div className="mx-auto mt-4 h-5 w-2/3 rounded-full bg-surface-strong" />
          <div className="mx-auto mt-3 h-5 w-1/2 rounded-full bg-surface-strong" />
          <div className="mt-8 flex justify-center gap-3">
            <div className="h-12 w-32 rounded-full bg-surface-strong" />
            <div className="h-12 w-36 rounded-full bg-surface-strong" />
          </div>
        </div>
      </section>

      <section className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm"
          >
            <div className="h-56 animate-pulse bg-surface-strong" />
            <div className="space-y-3 p-5">
              <div className="h-6 w-1/2 animate-pulse rounded bg-surface-strong" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-surface-strong" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-surface-strong" />
              <div className="h-10 w-full animate-pulse rounded-full bg-surface-strong" />
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}
