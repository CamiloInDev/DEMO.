import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, ShoppingCart, Star, ShieldCheck, Truck, RotateCcw, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { MorphingBackground } from "@/components/layout/MorphingBackground"
import { AuthModal } from "@/components/layout/AuthModal"
import { fetchProduct, fetchCart, addToCart, removeFromCart } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import type { Product } from "@/types/product"
import type { CartItem } from "@/lib/api"

interface CartDisplayItem extends CartItem {
  product_name?: string
  product_price?: number
}

export function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showAuth, setShowAuth] = useState<"login" | "register" | null>(null)
  const [added, setAdded] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [zoomActive, setZoomActive] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (id) fetchProduct(Number(id)).then(setProduct).catch(console.error)
    fetchCart().then(setCartItems).catch(console.error)
  }, [id])

  useEffect(() => {
    if (product) {
      document.title = `Market - ${product.name}`
    } else {
      document.title = "Market - Producto"
    }
  }, [product])

  const handleAddToCart = async () => {
    if (!user) {
      setShowAuth("login")
      return
    }
    if (!product) return
    await addToCart(product.id, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
    const items = await fetchCart()
    setCartItems(items)
  }

  const handleRemoveFromCart = async (itemId: number) => {
    await removeFromCart(itemId)
    const items = await fetchCart()
    setCartItems(items)
  }

  const cartDisplayItems: CartDisplayItem[] = cartItems.map((item) => ({
    ...item,
    product_name: product?.name,
    product_price: product?.price,
  }))

  const totalPrice = cartDisplayItems.reduce((sum, item) => sum + (item.product_price || 0) * item.quantity, 0)

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  const allImages = product.images?.length > 0 ? product.images : [product.image]
  const isLowStock = product.stock > 0 && product.stock <= 5
  const isOutOfStock = product.stock === 0

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0

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

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Volver a tienda
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div
              ref={imageRef}
              className="relative aspect-square overflow-hidden rounded-3xl border border-border/20 bg-muted cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setZoomActive(true)}
              onMouseLeave={() => setZoomActive(false)}
            >
              {discount > 0 && (
                <span className="absolute left-4 top-4 z-10 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  -{discount}%
                </span>
              )}
              {isLowStock && (
                <span className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold text-white">
                  <Zap className="h-3 w-3" />
                  Solo {product.stock} uds
                </span>
              )}
              <img
                src={allImages[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover transition-all duration-500"
                crossOrigin="anonymous"
                decoding="async"
                width={800}
                height={800}
                style={
                  zoomActive
                    ? { transform: "scale(2)", transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                    : {}
                }
              />
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                      i === selectedImage
                        ? "border-primary shadow-md shadow-primary/20"
                        : "border-border/20 opacity-60 hover:opacity-100 hover:border-border/50"
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" crossOrigin="anonymous" decoding="async" width={64} height={64} />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Truck className="h-3 w-3 text-primary" />
              <span>Envío 24-48h · Stock en almacén</span>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-xs tracking-wider text-primary uppercase font-semibold">{product.category}</p>
            <h1 className="font-heading mt-2 text-3xl font-bold text-foreground sm:text-4xl">{product.name}</h1>

            <div className="mt-3 flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-primary text-primary" : "fill-muted-foreground/20 text-muted-foreground/20"}`}
                />
              ))}
              <span className="ml-1 text-sm text-muted-foreground">{product.rating} / 5</span>
            </div>

            <p className="mt-6 text-base leading-relaxed text-muted-foreground">{product.description}</p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-heading text-4xl font-bold text-primary">${product.price}</span>
              {product.original_price && (
                <span className="text-lg text-muted-foreground line-through">${product.original_price}</span>
              )}
            </div>

            {isOutOfStock ? (
              <div className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium">
                Producto agotado temporalmente
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-3">
                <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                  isLowStock
                    ? "bg-red-500/10 text-red-400"
                    : "bg-green-500/10 text-green-400"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    isLowStock ? "bg-red-400 animate-pulse" : "bg-green-400"
                  }`} />
                  {isLowStock ? `Solo quedan ${product.stock} unidades` : `${product.stock} en stock`}
                </div>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">Envío 24h</span>
              </div>
            )}

            <Button
              size="lg"
              disabled={isOutOfStock}
              className={`mt-8 gap-2 text-base font-semibold transition-all duration-200 ${
                isOutOfStock
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : added
                  ? "bg-green-600 text-white hover:bg-green-500"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
              onClick={handleAddToCart}
            >
              {isOutOfStock ? <Zap className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
              {isOutOfStock ? "Agotado" : added ? "✓ Agregado" : "Agregar al carrito"}
            </Button>

            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-border/20 pt-6">
              {[
                { icon: Truck, text: "Envío 24h" },
                { icon: ShieldCheck, text: "Garantía 2 años" },
                { icon: RotateCcw, text: "30 días devolución" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 rounded-xl border border-border/20 bg-card/30 p-3 text-center">
                  <item.icon className="h-4 w-4 text-primary" />
                  <span className="text-[11px] text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
