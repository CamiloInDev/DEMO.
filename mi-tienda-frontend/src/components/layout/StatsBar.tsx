const stats = [
  { value: "50K+", label: "Clientes satisfechos" },
  { value: "98%", label: "Entregas a tiempo" },
  { value: "24/7", label: "Soporte" },
  { value: "4.9", label: "Rating promedio" },
]

export function StatsBar() {
  return (
    <div className="border-y border-border/20 bg-card/30 py-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-4 sm:px-6 lg:px-8">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="font-heading text-2xl font-bold text-primary">{stat.value}</span>
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}