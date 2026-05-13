import { useRef, useState } from "react"
import { ArrowRight, Zap, Truck, Crosshair, ShieldCheck, Wind, Undo2, Gamepad } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroCarousel } from "@/components/layout/HeroCarousel"
import { useHeroAnimation } from "@/lib/animations"

interface SlideContent {
  tagIcon?: React.ComponentType<{ className?: string }>
  tag: string
  title: React.ReactNode
  desc: string
  features: Array<{ icon: React.ComponentType<{ className?: string }>; text: string }>
}

const slideContent: (SlideContent | null)[] = [
  null,
  {
    tag: "50K+ clientes satisfechos",
    title: <>Tecnología que<br /><span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">transforma</span><br />tu día a día</>,
    desc: "Equipos premium seleccionados por expertos. Envío 24h, garantía 2 años y devolución sin preguntas.",
    features: [
      { icon: Truck, text: "Envío 24h" },
      { icon: ShieldCheck, text: "2 años garantía" },
      { icon: Undo2, text: "30 días devolución" },
    ],
  },
  {
    tagIcon: Gamepad,
    tag: "Zona gamer",
    title: <>Domina cada<br /><span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-500 bg-clip-text text-transparent">partida</span><br />como un pro</>,
    desc: "Periféricos con precisión milimétrica. RGB sincronizable, switches mecánicos y 0% latencia.",
    features: [
      { icon: Zap, text: "0% latencia" },
      { icon: Crosshair, text: "Switches Cherry MX" },
      { icon: Wind, text: "60fps estables" },
    ],
  },
]

export function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const isOffer = currentSlide === 0
  useHeroAnimation(ref)

  const scrollToProducts = () => {
    document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" })
  }

  const content = !isOffer ? slideContent[currentSlide] : null

  return (
    <section className="relative min-h-[90vh] overflow-hidden pt-20 sm:pt-24">
      <HeroCarousel onSlideChange={setCurrentSlide} />

      {content && (
        <div ref={ref} className="pointer-events-none absolute inset-0 mx-auto flex min-h-[80vh] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="pointer-events-auto max-w-2xl">
            <div data-anim className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-400 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-amber-400" />
              {content.tagIcon && <content.tagIcon className="h-3.5 w-3.5" />}
              {content.tag}
            </div>

            <h1 data-anim className="font-heading text-5xl font-bold leading-tight text-foreground sm:text-7xl sm:leading-tight">
              {content.title}
            </h1>

            <p data-anim className="mt-6 max-w-lg text-base text-white/80 font-light leading-relaxed sm:text-lg">
              {content.desc}
            </p>

            <div data-anim className="mt-10 flex items-center gap-4">
              <Button
                size="lg"
                className="gap-2 bg-primary text-primary-foreground font-semibold px-8 shadow-lg shadow-primary/30 transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1"
                onClick={scrollToProducts}
              >
                Comprar ahora
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-border/60 text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:text-foreground"
                onClick={scrollToProducts}
              >
                Ver ofertas
              </Button>
            </div>

            <div data-anim className="mt-12 flex items-center gap-6 text-sm text-muted-foreground">
              {content.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <feature.icon className="h-4 w-4" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
