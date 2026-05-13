export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border/20 bg-card/40 p-4">
      <div className="aspect-[4/3] rounded-xl bg-muted" />
      <div className="mt-4 space-y-2">
        <div className="h-4 w-3/4 rounded bg-muted-foreground/20" />
        <div className="h-3 w-1/2 rounded bg-muted-foreground/10" />
        <div className="h-3 w-1/4 rounded bg-muted-foreground/20" />
      </div>
    </div>
  )
}
