import { useState, useEffect, useCallback, useRef } from "react"
import { Clock, Package } from "lucide-react"

const slides = [
  { type: "offer", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=85", alt: "Oferta relámpago" },
  {
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&q=85",
    alt: "Auriculares premium",
  },
  {
    image: "https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=1920&q=85",
    alt: "Control gaming",
  },
]

interface HeroCarouselProps {
  onSlideChange?: (index: number) => void
}

export function HeroCarousel({ onSlideChange }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0)

  const offerEnd = useRef(Date.now() + 48 * 60 * 60 * 1000)
  const [timeLeft, setTimeLeft] = useState({ hours: 48, minutes: 0, seconds: 0 })

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = offerEnd.current - Date.now()
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        clearInterval(timer)
        return
      }
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft({ hours, minutes, seconds })
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  
  useEffect(() => {
    onSlideChange?.(current)
  }, [current, onSlideChange])

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label="Banner principal de ofertas"
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          role="group"
          aria-roledescription="slide"
          aria-label={`Slide ${i + 1} de ${slides.length}`}
          aria-hidden={i !== current}
          className="absolute inset-0 transition-all duration-1000 ease-in-out"
          style={{
            opacity: i === current ? 1 : 0,
            transform: `scale(${i === current ? 1 : 1.05})`,
          }}
        >
          <img
            src={slide.image}
            alt={slide.alt}
            className="h-full w-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
            crossOrigin="anonymous"
            decoding="async"
            width={1920}
            height={1080}
          />
          {slide.type === "offer" && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-background/70 via-background/40 to-background/20">
              <div className="mx-auto max-w-lg px-6 text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-400 backdrop-blur-sm">
                  <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <Clock className="h-3.5 w-3.5" />
                  Oferta relámpago
                </div>
                <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
                  Envío gratis en tu primera compra
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Usa el código{" "}
                  <span className="rounded-lg bg-primary/20 px-3 py-1 font-mono text-sm font-bold text-primary">
                    BIENVENIDO
                  </span>
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  {[
                    { label: "Horas", value: timeLeft.hours },
                    { label: "Min", value: timeLeft.minutes },
                    { label: "Seg", value: timeLeft.seconds },
                  ].map((unit) => (
                    <div key={unit.label} className="flex flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-background/60 border border-border/30 text-xl font-bold text-primary font-mono shadow-sm backdrop-blur-sm sm:h-16 sm:w-16 sm:text-2xl">
                        {String(unit.value).padStart(2, "0")}
                      </div>
                      <span className="mt-1.5 text-[10px] text-muted-foreground">{unit.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>Aplica a todos los productos · Sin mínimo de compra</span>
                </div>
              </div>
            </div>
          )}
          {slide.type !== "offer" && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-transparent" />
          )}
        </div>
      ))}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Ir a slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-primary" : "w-1.5 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
