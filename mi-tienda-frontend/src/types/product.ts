export interface Product {
  id: number
  name: string
  description: string
  price: number
  original_price: number | null
  image: string
  images: string[]
  category: string
  rating: number
  stock: number
}
