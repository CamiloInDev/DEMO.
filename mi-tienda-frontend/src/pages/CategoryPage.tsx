import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { MorphingBackground } from "@/components/layout/MorphingBackground"
import { AuthModal } from "@/components/layout/AuthModal"
import { ProductCard } from "@/components/layout/ProductCard"
import { fetchProducts, fetchCart, addToCart, removeFromCart } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { categoryIconMap, categoryDescriptions } from "@/constants/categories"
import type { Product } from "@/types/product"
import type { CartItem } from "@/lib/api"

interface CartDisplayItem extends CartItem {
  product_name?: string
  product_price?: number
}

export function CategoryPage() {
  const { category } = useParams()
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showAuth, setShowAuth] = useState<"login" | "register" | null>(null)

  useEffect(() => {
    if (category) {
      document.title = `Market - ${category}`
      fetchProducts(category).then(setProducts).catch(console.error)
      fetchCart().then(setCartItems).catch(console.error)
    }
  }, [category])

  const handleAddToCart = async (productId: number) => {
    if (!user) { setShowAuth("login"); return }
    await addToCart(productId, 1)
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
    product_name: products.find((p) => p.id === item.product_id)?.name,
    product_price: products.find((p) => p.id === item.product_id)?.price,
  }))

  const totalPrice = cartDisplayItems.reduce((sum, item) => sum + (item.product_price || 0) * item.quantity, 0)
  const CatIcon = category ? categoryIconMap[category] : null
  const catDesc = category ? categoryDescriptions[category] : null

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
        <AuthModal mode={showAuth} onClose={() => setShowAuth(null)} onSwitch={() => setShowAuth(showAuth === "login" ? "register" : "login")} />
      )}

      <main>
        <div className="relative overflow-hidden border-b border-border/20 bg-gradient-to-b from-primary/5 to-background pt-24 pb-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Volver a tienda
            </Link>
            <div className="flex items-center gap-4">
              {CatIcon && <CatIcon className="h-8 w-8 text-primary" />}
              <div>
                <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">{category}</h1>
                {catDesc && <p className="mt-1 text-muted-foreground">{catDesc}</p>}
                <p className="mt-1 text-sm text-muted-foreground">{products.length} productos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No hay productos en esta categoría</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
