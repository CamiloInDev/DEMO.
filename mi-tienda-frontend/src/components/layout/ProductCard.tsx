import { Link } from "react-router-dom"
import { ShoppingCart, Star, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/types/product"

interface ProductCardProps {
  product: Product
  onAddToCart?: (productId: number) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0

  const isLowStock = product.stock > 0 && product.stock <= 5
  const isOutOfStock = product.stock === 0

  return (
    <article className={`group cursor-pointer overflow-hidden rounded-2xl border transition-all duration-200 hover:shadow-xl hover:shadow-primary/5 [perspective:800px] ${
      isOutOfStock
        ? "border-border/10 opacity-60"
        : isLowStock
        ? "border-red-500/30 bg-card/40 hover:border-red-500/40 hover:bg-card/70"
        : "border-border/30 bg-card/40 hover:border-primary/25 hover:bg-card/70"
    }`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <Link to={`/producto/${product.id}`} aria-label={product.name}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {discount > 0 && (
            <Badge className="absolute left-3 top-3 z-10 border-0 bg-gradient-to-r from-primary to-amber-400 px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
              -{discount}%
            </Badge>
          )}
          {isLowStock && !isOutOfStock && (
            <Badge className="absolute right-3 top-3 z-10 border-0 bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white animate-pulse">
              <Zap className="mr-0.5 inline h-2.5 w-2.5" />
              {product.stock} uds
            </Badge>
          )}
          {isOutOfStock && (
            <Badge className="absolute right-3 top-3 z-10 border-0 bg-muted-foreground/60 px-2 py-0.5 text-[10px] font-semibold text-background">
              Agotado
            </Badge>
          )}
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
            loading="lazy"
            crossOrigin="anonymous"
            decoding="async"
            width={400}
            height={400}
          />
        </div>
      </Link>

      <div className="relative p-4 sm:p-5">
        <p className="mb-1 text-[10px] tracking-wider text-muted-foreground uppercase">{product.category}</p>
        <Link to={`/producto/${product.id}`}>
          <h3 className="font-heading text-lg font-semibold text-foreground transition-colors duration-200 hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{product.description}</p>

        <div className="mt-2.5 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 transition-all duration-200 ${
                i < Math.floor(product.rating)
                  ? "fill-primary text-primary"
                  : "fill-muted-foreground/20 text-muted-foreground/20"
              }`}
            />
          ))}
          <span className="ml-1.5 text-[10px] text-muted-foreground">{product.rating}</span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/20 pt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-primary">${product.price}</span>
            {product.original_price && (
              <span className="text-[11px] text-muted-foreground line-through">${product.original_price}</span>
            )}
          </div>
          <Button
            size="sm"
            disabled={isOutOfStock}
            className={`h-7 gap-1 text-[11px] font-medium px-2.5 shadow-sm transition-all duration-200 ${
              isOutOfStock
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20"
            }`}
            onClick={(e) => { e.preventDefault(); if (!isOutOfStock) onAddToCart?.(product.id) }}
          >
            {isOutOfStock ? <Zap className="h-3 w-3" /> : <ShoppingCart className="h-3 w-3" />}
            {isOutOfStock ? "Agotado" : "Comprar"}
          </Button>
        </div>
      </div>
    </article>
  )
}
