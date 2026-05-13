import { useState, useEffect, useCallback, useRef } from "react"
import { Link } from "react-router-dom"
import { Truck, ShieldCheck, MessageCircle, ShoppingCart, Clock } from "lucide-react"
import { useStaggerFade } from "@/lib/animations"
import { useAuth } from "@/lib/auth"
import { Header } from "@/components/layout/Header"
import { Hero } from "@/components/layout/Hero"
import { StatsBar } from "@/components/layout/StatsBar"
import { TrustBadges } from "@/components/layout/TrustBadges"
import { ProductCard } from "@/components/layout/ProductCard"
import { Footer } from "@/components/layout/Footer"
import { MorphingBackground } from "@/components/layout/MorphingBackground"
import { AuthModal } from "@/components/layout/AuthModal"
import { fetchProducts, fetchCart, addToCart, removeFromCart, fetchRecentPurchases } from "@/lib/api"
import { categoryIconMap } from "@/constants/categories"
import type { Product } from "@/types/product"
import type { CartItem, RecentPurchase } from "@/lib/api"

interface CartDisplayItem extends CartItem {
  product_name?: string
  product_price?: number
}

export function Home() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showAuth, setShowAuth] = useState<"login" | "register" | null>(null)
  const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([])
  const [visiblePurchase, setVisiblePurchase] = useState(0)
  const [timeLeft, setTimeLeft] = useState({ hours: 48, minutes: 0, seconds: 0 })
  const offerEnd = useRef(Date.now() + 48 * 60 * 60 * 1000)

  useEffect(() => {
    document.title = "Market - Tu tienda de tecnología"
  }, [])

  const loadCart = useCallback(async () => {
    try {
      const items = await fetchCart()
      setCartItems(items)
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    fetchProducts().then(setProducts).catch(console.error)
    loadCart()
    fetchRecentPurchases().then(setRecentPurchases).catch(console.error)
  }, [loadCart])

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = offerEnd.current - Date.now()
      if (diff <= 0) { setTimeLeft({ hours: 0, minutes: 0, seconds: 0 }); clearInterval(timer); return }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (recentPurchases.length === 0) return
    const interval = setInterval(() => {
      setVisiblePurchase((prev) => (prev + 1) % recentPurchases.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [recentPurchases.length])

  const handleAddToCart = async (productId: number) => {
    if (!user) { setShowAuth("login"); return }
    try {
      await addToCart(productId, 1)
      await loadCart()
    } catch (e) {
      console.error(e)
    }
  }

  const handleRemoveFromCart = async (itemId: number) => {
    try {
      await removeFromCart(itemId)
      await loadCart()
    } catch (e) {
      console.error(e)
    }
  }

  const cartDisplayItems: CartDisplayItem[] = cartItems.map((item) => {
    const product = products.find((p) => p.id === item.product_id)
    return { ...item, product_name: product?.name, product_price: product?.price }
  })

  const totalPrice = cartDisplayItems.reduce((sum, item) => sum + (item.product_price || 0) * item.quantity, 0)
  const productsRef = useRef<HTMLDivElement>(null)
  useStaggerFade(productsRef, "[data-card]", 0.08)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MorphingBackground />
      <Header
        cartItems={cartDisplayItems}
        onRemoveFromCart={handleRemoveFromCart}
        totalPrice={totalPrice}
        onOpenAuth={() => setShowAuth("login")}
      />

      {showAuth && (
        <AuthModal
          mode={showAuth}
          onClose={() => setShowAuth(null)}
          onSwitch={() => setShowAuth(showAuth === "login" ? "register" : "login")}
        />
      )}

      <main>
        <Hero />
        <StatsBar />

        {/* Featured product */}
        {products.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-border/30 bg-card/40">
              <div className="grid md:grid-cols-2">
                <div className="relative aspect-square overflow-hidden md:aspect-auto">
                  <img
                    src={          products[0].image}
                    alt={products[0].name}
                    className="h-full w-full object-cover transition-all duration-500 hover:scale-105"
                    crossOrigin="anonymous"
                    decoding="async"
                    width={800}
                    height={800}
                    loading="lazy"
                  />
                  {products[0].original_price && (
                    <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                      -{Math.round((1 - products[0].price / products[0].original_price) * 100)}%
                    </span>
                  )}
                </div>
                <div className="flex flex-col justify-center p-8 sm:p-12">
                  <p className="text-xs tracking-wider text-primary uppercase font-semibold">Más vendido</p>
                  <h2 className="font-heading mt-2 text-3xl font-bold text-foreground sm:text-4xl">
                    {products[0].name}
                  </h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{products[0].description}</p>
                  <div className="mt-6 flex items-center gap-3">
                    <span className="font-heading text-3xl font-bold text-primary">${products[0].price}</span>
                    {products[0].original_price && (
                      <span className="text-lg text-muted-foreground line-through">${products[0].original_price}</span>
                    )}
                  </div>
                  <Link
                    to={`/producto/${products[0].id}`}
                    className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:-translate-y-0.5"
                  >
                    Ver detalle
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Benefits section */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: Truck, title: "Envío gratis +$50", desc: "Entregas en 24-48h en toda la ciudad" },
              { icon: ShieldCheck, title: "Garantía extendida", desc: "2 años de cobertura en productos seleccionados" },
              { icon: MessageCircle, title: "Soporte real", desc: "Atención personalizada por expertos en tecnología" },
            ].map((benefit, i) => (
              <div key={i} className="rounded-2xl border border-border/20 bg-card/30 p-6 transition-all duration-200 hover:border-primary/20 hover:bg-card/50">
                <benefit.icon className="h-6 w-6 text-primary" />
                <h3 className="font-heading mt-3 text-lg font-semibold text-foreground">{benefit.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Products by category */}
        <section ref={productsRef} id="productos" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">Productos destacados</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Los más vendidos del mes • Envío inmediato</p>
          </div>

          {["Audio", "Gaming", "Monitores", "Accesorios", "Cámaras"].map((category) => {
            const catProducts = products.filter((p) => p.category === category)
            if (catProducts.length === 0) return null

            const CatIcon = categoryIconMap[category]

            return (
              <div key={category} className="mb-10 last:mb-0">
                <div className="mb-5 flex items-center gap-3">
                  {CatIcon && <CatIcon className="h-5 w-5 text-muted-foreground" />}
                  <Link to={`/categoria/${category}`} className="font-heading text-xl font-semibold text-foreground transition-colors hover:text-primary">
                    {category}
                  </Link>
                  <div className="h-px flex-1 bg-border/30" />
                  <Link to={`/categoria/${category}`} className="text-xs text-muted-foreground transition-colors hover:text-primary">
                    Ver todo ({catProducts.length})
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {catProducts.map((product) => (
                    <div key={product.id} data-card>
                      <ProductCard product={product} onAddToCart={handleAddToCart} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </section>

        {/* Urgency section */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-border/20 bg-gradient-to-r from-primary/10 to-background">
            <div className="grid md:grid-cols-2">
              <div className="flex flex-col justify-center p-8 sm:p-12">
                <p className="text-xs tracking-wider text-primary uppercase font-semibold">Oferta relámpago</p>
                <h2 className="font-heading mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                  Envío gratis en tu primera compra
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Usa el código <span className="rounded-lg bg-primary/20 px-3 py-1 font-mono text-sm font-bold text-primary">BIENVENIDO</span> y recibe tu pedido sin cargo
                </p>

                <div className="mt-5 flex gap-3">
                  {[
                    { label: "Horas", value: timeLeft.hours },
                    { label: "Min", value: timeLeft.minutes },
                    { label: "Seg", value: timeLeft.seconds },
                  ].map((unit) => (
                    <div key={unit.label} className="flex flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/80 border border-border/30 text-lg font-bold text-primary font-mono shadow-sm sm:h-14 sm:w-14 sm:text-xl">
                        {String(unit.value).padStart(2, "0")}
                      </div>
                      <span className="mt-1 text-[10px] text-muted-foreground">{unit.label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Aplica a todos los productos</span>
                  </div>
                </div>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
                  alt="Auriculares oferta"
                  className="h-full w-full object-cover"
                  crossOrigin="anonymous"
                  decoding="async"
                  width={800}
                  height={600}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contact section */}
        <section id="contacto" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-border/20 bg-gradient-to-br from-card/50 to-background">
            <div className="grid md:grid-cols-2">
              <div className="flex flex-col justify-center p-8 sm:p-12">
                <p className="text-xs tracking-wider text-primary uppercase font-semibold">Contáctanos</p>
                <h2 className="font-heading mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                  ¿Tienes dudas? Estamos aquí
                </h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Nuestro equipo de expertos en tecnología está listo para ayudarte a elegir el producto perfecto.
                </p>

                <div className="mt-6 flex flex-col gap-4">
                  <div className="flex items-center gap-3 rounded-xl border border-border/20 bg-card/30 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Email</p>
                      <p className="text-xs text-muted-foreground">soporte@market.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-border/20 bg-card/30 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Teléfono</p>
                      <p className="text-xs text-muted-foreground">+34 900 123 456</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-border/20 bg-card/30 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Ubicación</p>
                      <p className="text-xs text-muted-foreground">Calle Mayor 42, Madrid</p>
                    </div>
                  </div>
                </div>

                <a
                  href="mailto:soporte@market.com"
                  className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:-translate-y-0.5"
                >
                  Enviar mensaje
                </a>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
                  alt="Atención al cliente"
                  className="h-full w-full object-cover"
                  crossOrigin="anonymous"
                  decoding="async"
                  width={800}
                  height={600}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <TrustBadges />
        </section>
      </main>

      {/* FOMO: Recent sales notification */}
      {recentPurchases.length > 0 && (
        <div aria-live="polite" aria-atomic="true" className="fixed bottom-28 left-4 z-40 max-w-xs animate-in slide-in-from-left-2 fade-in duration-500 sm:bottom-32 sm:left-6">
          <div className="rounded-2xl border border-border/30 bg-background/90 px-4 py-3 shadow-xl backdrop-blur-xl transition-all duration-500 hover:bg-background">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <ShoppingCart className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">
                  {recentPurchases[visiblePurchase]?.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  compró {recentPurchases[visiblePurchase]?.product}
                </p>
                <p className="text-[10px] text-muted-foreground/60">
                  {recentPurchases[visiblePurchase]?.city} · {recentPurchases[visiblePurchase]?.time}
                </p>
              </div>
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
