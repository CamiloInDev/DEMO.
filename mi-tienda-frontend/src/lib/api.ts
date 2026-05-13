import type { Product } from "@/types/product"

const API_BASE = "/api"

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export interface Category {
  name: string
  count: number
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/products/categories`)
  if (!res.ok) throw new Error("Error al cargar categorías")
  return res.json()
}

export async function fetchProducts(category?: string): Promise<Product[]> {
  const url = category ? `${API_BASE}/products?category=${encodeURIComponent(category)}` : `${API_BASE}/products`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Error al cargar productos")
  return res.json()
}

export async function fetchProduct(id: number): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`)
  if (!res.ok) throw new Error("Producto no encontrado")
  return res.json()
}

export interface CartItem {
  id: number
  product_id: number
  quantity: number
  created_at: string
}

export async function fetchCart(): Promise<CartItem[]> {
  const res = await fetch(`${API_BASE}/cart`, { headers: authHeaders() })
  if (!res.ok) throw new Error("Error al cargar carrito")
  return res.json()
}

export async function addToCart(product_id: number, quantity: number = 1): Promise<CartItem> {
  const res = await fetch(`${API_BASE}/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ product_id, quantity }),
  })
  if (!res.ok) throw new Error("Error al agregar al carrito")
  return res.json()
}

export async function removeFromCart(itemId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/cart/${itemId}`, { method: "DELETE", headers: authHeaders() })
  if (!res.ok) throw new Error("Error al eliminar del carrito")
}

export interface RecentPurchase {
  name: string
  product: string
  time: string
  city: string
}

export async function fetchRecentPurchases(): Promise<RecentPurchase[]> {
  const res = await fetch(`${API_BASE}/products/recent-purchases/list`)
  if (!res.ok) return []
  return res.json()
}

export interface OrderItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  price: number
}

export interface Order {
  id: number
  user_id: number
  total: number
  status: string
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  created_at: string
  items: OrderItem[]
}

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/orders`, { headers: authHeaders() })
  if (!res.ok) throw new Error("Error al cargar pedidos")
  return res.json()
}

export async function checkout(data: { shipping_name: string; shipping_phone: string; shipping_address: string }): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Error al procesar el pedido")
  }
  return res.json()
}

export async function updateProfile(data: Record<string, any>): Promise<Record<string, any>> {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Error al actualizar perfil")
  return res.json()
}
