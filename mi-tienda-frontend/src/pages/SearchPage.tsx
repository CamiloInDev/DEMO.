import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { MorphingBackground } from "@/components/layout/MorphingBackground"
import { ProductCard } from "@/components/layout/ProductCard"
import { AuthModal } from "@/components/layout/AuthModal"
import { fetchProducts, fetchCart, addToCart, removeFromCart } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import type { Product } from "@/types/product"
import type { CartItem } from "@/lib/api"

interface CartDisplayItem extends CartItem {
  product_name?: string
  product_price?: number
}

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") || ""
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showAuth, setShowAuth] = useState<"login" | "register" | null>(null)

  useEffect(() => {
    document.title = query ? `Market - Búsqueda: ${query}` : "Market - Búsqueda"
    fetchProducts().then((all) => {
      const filtered = all.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
      setProducts(filtered)
    }).catch(console.error)
    fetchCart().then(setCartItems).catch(console.error)
  }, [query])

  const handleAddToCart = async (productId: number) => {
    if (!user) { setShowAuth("login"); return }
    await addToCart(productId, 1)
    fetchCart().then(setCartItems).catch(console.error)
  }

  const handleRemoveFromCart = async (itemId: number) => {
    await removeFromCart(itemId)
    fetchCart().then(setCartItems).catch(console.error)
  }

  const cartDisplayItems: CartDisplayItem[] = cartItems.map((item) => ({
    ...item,
    product_name: products.find((p) => p.id === item.product_id)?.name,
    product_price: products.find((p) => p.id === item.product_id)?.price,
  }))
  const totalPrice = cartDisplayItems.reduce((s, i) => s + (i.product_price || 0) * i.quantity, 0)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MorphingBackground />
      <Header cartItems={cartDisplayItems} onRemoveFromCart={handleRemoveFromCart} totalPrice={totalPrice} onOpenAuth={() => setShowAuth("login")} />
      {showAuth && <AuthModal mode={showAuth} onClose={() => setShowAuth(null)} onSwitch={() => setShowAuth(showAuth === "login" ? "register" : "login")} />}
      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <h1 className="font-heading text-2xl font-bold text-foreground">Resultados para "{query}"</h1>
        <p className="mt-1 text-sm text-muted-foreground">{products.length} productos encontrados</p>
        {products.length === 0 ? (
          <p className="mt-10 text-center text-muted-foreground">No se encontraron productos para esta búsqueda</p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
