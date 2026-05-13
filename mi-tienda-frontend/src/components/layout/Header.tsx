import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ShoppingCart, Trash2, CreditCard, User, Search, Menu, X, Package, Settings, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import type { CartItem, Category } from "@/lib/api"
import { fetchCategories, checkout as apiCheckout } from "@/lib/api"
import { useCartPulse } from "@/lib/cartPulse"
import { useAuth } from "@/lib/auth"
import { categoryIconMap } from "@/constants/categories"

interface CartItemWithProduct extends CartItem {
  product_name?: string
  product_price?: number
}

export function Header({
  cartItems = [],
  onRemoveFromCart,
  totalPrice = 0,
  onOpenAuth,
}: {
  cartItems?: CartItemWithProduct[]
  onRemoveFromCart?: (id: number) => void
  totalPrice?: number
  onOpenAuth?: () => void
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [showCats, setShowCats] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileSearch, setMobileSearch] = useState("")
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)
  const [checkoutForm, setCheckoutForm] = useState({ name: "", phone: "", address: "" })
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "form" | "done">("cart")
  const pulseKey = useCartPulse(cartItems.length)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCats(false)
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (mobileSearch.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(mobileSearch.trim())}`)
      setMobileSearch("")
      setMobileSheetOpen(false)
    }
  }

  const scrollToContact = () => {
    const el = document.getElementById("contacto")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    } else {
      navigate("/")
      setTimeout(() => document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" }), 300)
    }
  }

  const handleCheckoutSubmit = async () => {
    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) return
    setCheckoutLoading(true)
    try {
      await apiCheckout({
        shipping_name: checkoutForm.name,
        shipping_phone: checkoutForm.phone,
        shipping_address: checkoutForm.address,
      })
      setCheckoutStep("done")
      setTimeout(() => { setCheckoutStep("cart"); setCheckoutForm({ name: "", phone: "", address: "" }) }, 3000)
    } catch { console.error("Error en checkout") }
    setCheckoutLoading(false)
  }

  return (
    <header className="sticky top-4 z-50 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex h-14 items-center gap-3 rounded-2xl border border-border/30 bg-background/60 px-5 backdrop-blur-2xl shadow-lg shadow-primary/5 sm:gap-6">
        <button
          className="flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          onClick={() => setMobileSheetOpen(true)}
          aria-label="Menú"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-amber-400 shadow-md shadow-primary/30">
            <span className="text-xs font-bold text-primary-foreground">M</span>
          </div>
          <span className="font-heading text-base font-semibold tracking-wide text-foreground transition-colors duration-200 group-hover:text-primary">
            Market
          </span>
        </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <button
              onClick={() => { navigate("/"); window.scrollTo({ top: 0, behavior: "smooth" }) }}
              className="rounded-lg px-3 py-1.5 text-sm text-foreground transition-all duration-200 hover:bg-muted/50"
            >
              Inicio
            </button>
            <button
              onClick={scrollToContact}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground"
            >
              Contacto
            </button>
            <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowCats(!showCats)}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground"
            >
              Categorías
              <svg className={`h-3 w-3 transition-transform duration-200 ${showCats ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showCats && (
              <div className="absolute left-0 top-full mt-1 min-w-[200px] rounded-xl border border-border/30 bg-background p-1.5 shadow-xl z-50">
                <Link to="/categorias"
                  onClick={() => setShowCats(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
                >
                  Todas las categorías
                </Link>
                <div className="my-1 border-t border-border/20" />
                {categories.map((cat) => (
                  <Link key={cat.name} to={`/categoria/${cat.name}`}
                    onClick={() => setShowCats(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  >
                    {(() => {
                      const Icon = categoryIconMap[cat.name]
                      return Icon ? <Icon className="h-4 w-4" /> : null
                    })()}
                    <span>{cat.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground/60">{cat.count}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex-1" />

        <div className="hidden items-center gap-2 sm:flex">
          <div className="relative">
            <form onSubmit={handleSearch} className="relative">
            <label htmlFor="search-desktop" className="sr-only">Buscar productos</label>
            <Input
              id="search-desktop"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="h-8 w-40 border-border/40 bg-muted/50 pl-8 text-xs text-foreground placeholder:text-muted-foreground transition-all duration-200 focus-visible:w-56 focus-visible:border-primary/30 lg:w-48"
            />
            <button type="submit" className="absolute left-2.5 top-1/2 -translate-y-1/2" aria-label="Buscar">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </form>
          </div>
        </div>

        {user ? (
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setUserDropdown(!userDropdown)}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <User className="h-4 w-4" />
              <span className="hidden max-w-[100px] truncate sm:block">{user.full_name || user.email}</span>
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${userDropdown ? "rotate-180" : ""}`} />
            </button>
            {userDropdown && (
              <div className="absolute right-0 top-full mt-1 min-w-[180px] rounded-xl border border-border/30 bg-background p-1.5 shadow-xl z-50">
                <Link to="/cuenta" onClick={() => setUserDropdown(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                ><Settings className="h-4 w-4" /> Mi cuenta</Link>
                <Link to="/pedidos" onClick={() => setUserDropdown(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                ><Package className="h-4 w-4" /> Mis pedidos</Link>
                <div className="my-1 border-t border-border/20" />
                <button onClick={() => { setUserDropdown(false); logout() }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                ><LogOut className="h-4 w-4" /> Cerrar sesión</button>
              </div>
            )}
          </div>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onOpenAuth}>
            <User className="h-4 w-4" />
          </Button>
        )}

        <Sheet>
          <SheetTrigger
            className="relative text-muted-foreground transition-colors duration-200 hover:text-primary"
            render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
          >
            <ShoppingCart className="h-4 w-4" />
            <span key={pulseKey} className="animate-cart-pulse">
              <Badge className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center border-0 bg-primary p-0 text-[8px] font-semibold text-primary-foreground">
                {cartItems.length}
              </Badge>
            </span>
          </SheetTrigger>
          <SheetContent className="flex w-full flex-col border-l border-border bg-background sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="font-heading text-2xl text-foreground">Carrito</SheetTitle>
            </SheetHeader>
            {cartItems.length === 0 ? (
              <div className="mt-8 flex-1 text-center text-sm text-muted-foreground">
                Tu carrito está vacío
              </div>
            ) : (
              <>
                <div className="mt-6 flex-1 space-y-3 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border/30 bg-card/40 p-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.product_name || `Producto #${item.product_id}`}</p>
                        <p className="text-xs text-muted-foreground">Cant: {item.quantity}</p>
                        {item.product_price && (
                          <p className="text-sm font-bold text-primary">${item.product_price.toFixed(2)}</p>
                        )}
                      </div>
                      <button
                        onClick={() => onRemoveFromCart?.(item.id)}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <SheetFooter className="border-t border-border/20 pt-4">
                  {checkoutStep === "cart" && (
                    <>
                      <div className="flex w-full items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total</span>
                        <span className="font-heading text-xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                      </div>
                      <Button
                        className="mt-3 w-full gap-2 bg-primary text-primary-foreground font-semibold transition-all duration-200 hover:bg-primary/90"
                        onClick={() => { setCheckoutForm({ name: user?.full_name || "", phone: user?.phone || "", address: user?.address || "" }); setCheckoutStep("form") }}
                      >
                        <CreditCard className="h-4 w-4" />
                        Finalizar compra
                      </Button>
                    </>
                  )}
                  {checkoutStep === "form" && (
                    <div className="flex flex-col gap-3">
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Datos de envío</p>
                      <label htmlFor="checkout-name" className="sr-only">Nombre completo</label>
                      <Input id="checkout-name" value={checkoutForm.name} onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })} placeholder="Nombre completo" className="border-border/40 bg-muted/50 text-sm" />
                      <label htmlFor="checkout-phone" className="sr-only">Teléfono</label>
                      <Input id="checkout-phone" value={checkoutForm.phone} onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })} placeholder="Teléfono" className="border-border/40 bg-muted/50 text-sm" />
                      <label htmlFor="checkout-address" className="sr-only">Dirección de envío</label>
                      <Input id="checkout-address" value={checkoutForm.address} onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })} placeholder="Dirección de envío" className="border-border/40 bg-muted/50 text-sm" />
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setCheckoutStep("cart")}>Atrás</Button>
                        <Button size="sm" className="flex-1 gap-1 bg-primary text-xs text-primary-foreground font-semibold hover:bg-primary/90" onClick={handleCheckoutSubmit} disabled={checkoutLoading}>
                          {checkoutLoading ? "Procesando..." : "Confirmar pedido"}
                        </Button>
                      </div>
                    </div>
                  )}
                  {checkoutStep === "done" && (
                    <div className="py-4 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                        <Package className="h-6 w-6 text-green-400" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-foreground">Pedido confirmado</p>
                      <p className="text-xs text-muted-foreground">Recibirás un email con los detalles</p>
                    </div>
                  )}
                </SheetFooter>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Mobile navigation sheet */}
        <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <SheetContent side="left" className="w-72 border-r border-border bg-background p-0" showCloseButton={false}>
            <div className="flex h-14 items-center justify-between border-b border-border/20 px-4">
              <span className="font-heading text-base font-semibold text-foreground">Menú</span>
              <button
                onClick={() => setMobileSheetOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <form onSubmit={handleMobileSearch} className="relative mb-4">
                <label htmlFor="search-mobile" className="sr-only">Buscar productos</label>
                <Input
                  id="search-mobile"
                  value={mobileSearch}
                  onChange={(e) => setMobileSearch(e.target.value)}
                  placeholder="Buscar productos..."
                  className="h-9 w-full border-border/40 bg-muted/50 pl-8 text-sm text-foreground placeholder:text-muted-foreground"
                />
                <button type="submit" className="absolute left-2.5 top-1/2 -translate-y-1/2" aria-label="Buscar">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </form>

              <nav className="flex flex-col gap-1">
                <button
                  onClick={() => { setMobileSheetOpen(false); navigate("/"); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted text-left"
                >
                  Inicio
                </button>
                <button
                  onClick={() => { setMobileSheetOpen(false); scrollToContact() }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted text-left"
                >
                  Contacto
                </button>
                <Link
                  to="/categorias"
                  onClick={() => setMobileSheetOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Todas las categorías
                </Link>
              </nav>

              <div className="my-3 border-t border-border/20" />

              <div className="flex flex-col gap-0.5">
                <p className="px-3 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Categorías</p>
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    to={`/categoria/${cat.name}`}
                    onClick={() => setMobileSheetOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {(() => {
                      const Icon = categoryIconMap[cat.name]
                      return Icon ? <Icon className="h-4 w-4" /> : null
                    })()}
                    <span>{cat.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground/60">{cat.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
