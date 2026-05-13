import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { MorphingBackground } from "@/components/layout/MorphingBackground"
import { AuthModal } from "@/components/layout/AuthModal"
import { fetchCategories, fetchCart, removeFromCart } from "@/lib/api"
import type { CartItem, Category } from "@/lib/api"
import { categoryIconMap, categoryColors } from "@/constants/categories"

interface CartDisplayItem extends CartItem {
  product_name?: string
  product_price?: number
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showAuth, setShowAuth] = useState<"login" | "register" | null>(null)

  useEffect(() => {
    document.title = "Market - Categorías"
    fetchCategories().then(setCategories).catch(console.error)
    fetchCart().then(setCartItems).catch(console.error)
  }, [])

  const handleRemoveFromCart = async (itemId: number) => {
    await removeFromCart(itemId)
    fetchCart().then(setCartItems).catch(console.error)
  }

  const cartDisplayItems: CartDisplayItem[] = cartItems.map((item) => ({ ...item }))
  const totalPrice = 0

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MorphingBackground />
      <Header cartItems={cartDisplayItems} onRemoveFromCart={handleRemoveFromCart} totalPrice={totalPrice} onOpenAuth={() => setShowAuth("login")} />
      {showAuth && <AuthModal mode={showAuth} onClose={() => setShowAuth(null)} onSwitch={() => setShowAuth(showAuth === "login" ? "register" : "login")} />}
      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Categorías</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Explora nuestros productos por categoría</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link key={cat.name} to={`/categoria/${cat.name}`}
              className={`group relative overflow-hidden rounded-2xl border border-border/20 bg-gradient-to-br ${categoryColors[cat.name] || "from-primary/10 to-primary/5"} p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10`}
            >
              {(() => {
                const CatIcon = categoryIconMap[cat.name]
                return CatIcon ? <CatIcon className="h-8 w-8 text-primary" /> : null
              })()}
              <h2 className="font-heading mt-4 text-xl font-semibold text-foreground group-hover:text-primary transition-colors">{cat.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{cat.count} productos</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
                Ver todos →
              </span>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
