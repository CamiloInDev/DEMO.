import { Truck, Shield, RotateCcw, Headphones } from "lucide-react"

const benefits = [
  { icon: Truck, title: "Envío gratis +50€", desc: "Delivery en 24-48h" },
  { icon: Shield, title: "Garantía 2 años", desc: "Protección total" },
  { icon: RotateCcw, title: "30 días devolución", desc: "Sin preguntas" },
  { icon: Headphones, title: "Soporte 24/7", desc: "siempre online" },
]

export function TrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {benefits.map((b, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-border/20 bg-card/40 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <b.icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{b.title}</p>
            <p className="text-xs text-muted-foreground">{b.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}