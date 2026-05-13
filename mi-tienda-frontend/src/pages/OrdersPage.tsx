import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Package, ChevronDown, ChevronUp } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { MorphingBackground } from "@/components/layout/MorphingBackground"
import { useAuth } from "@/lib/auth"
import { fetchOrders } from "@/lib/api"
import type { Order } from "@/lib/api"

export function OrdersPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    document.title = "Market - Mis pedidos"
    if (!user) { navigate("/"); return }
    fetchOrders().then(setOrders).catch(console.error)
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MorphingBackground />
      <Header cartItems={[]} onRemoveFromCart={() => {}} totalPrice={0} onOpenAuth={() => {}} />
      <main className="mx-auto max-w-3xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Volver a tienda
        </Link>
        <h1 className="font-heading text-3xl font-bold text-foreground">Mis pedidos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Historial de tus compras</p>

        {orders.length === 0 ? (
          <div className="mt-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">No tienes pedidos aún</p>
            <Link to="/" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">Ir a la tienda</Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-border/20 bg-card/30 overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/20"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${order.status === "confirmado" ? "bg-green-400" : "bg-amber-400"}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">Pedido #{order.id}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary">${order.total.toFixed(2)}</span>
                    <span className="text-xs capitalize text-muted-foreground">{order.status}</span>
                    {expanded === order.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>
                {expanded === order.id && (
                  <div className="border-t border-border/20 px-4 pb-4 pt-3 space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{item.product_name} <span className="text-muted-foreground">x{item.quantity}</span></span>
                        <span className="text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-border/10 pt-2 text-xs text-muted-foreground">
                      <p>Envío: {order.shipping_name} — {order.shipping_phone}</p>
                      <p>{order.shipping_address}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
