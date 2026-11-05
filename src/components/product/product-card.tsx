import Image from "next/image"
import Link from "next/link"

import { type Product, formatPrice, isLifestyle, productHref, productImages, totalStock } from "@/lib/catalog"
import { FavoriteButton } from "@/components/product/favorite-button"
import { QuickAdd } from "@/components/product/quick-add"
import { cn } from "@/lib/utils"

const MAX_SWATCHES = 6

export function TierLine({ product, className }: { product: Product; className?: string }) {
  if (!product.tiers.length) return null
  return (
    <p className={cn("text-[10px] leading-[1.3] text-smoke-charcoal", className)}>
      {product.tiers.map((t) => `+${t.minQty} u.: ${formatPrice(t.unitPrice)}`).join(" · ")}
    </p>
  )
}

export function ProductCard({
  product,
  sizes,
  quickAdd,
  eager,
}: {
  product: Product
  sizes?: string
  quickAdd?: boolean
  /** Primeras tarjetas visibles: carga prioritaria (LCP) */
  eager?: boolean
}) {
  const { primary, secondary } = productImages(product)
  const href = productHref(product)
  const extra = product.colors.length - MAX_SWATCHES
  const imgSizes = sizes ?? "(min-width: 1024px) 25vw, 50vw"

  return (
    <article className="group/card relative flex flex-col">
      <Link href={href} className="block" aria-label={product.name}>
        <div className="relative aspect-[3/4] overflow-hidden bg-white">
          <Image
            src={primary}
            alt={product.name}
            fill
            sizes={imgSizes}
            loading={eager ? "eager" : undefined}
            fetchPriority={eager ? "high" : undefined}
            className={cn(
              "transition-opacity duration-500",
              isLifestyle(product, primary) ? "object-cover" : "object-contain p-[6%]",
              secondary && "group-hover/card:opacity-0",
            )}
          />
          {secondary && (
            <Image
              src={secondary}
              alt=""
              fill
              sizes={imgSizes}
              className={cn(
                "opacity-0 transition-opacity duration-500 group-hover/card:opacity-100",
                isLifestyle(product, secondary) ? "object-cover" : "object-contain p-[6%]",
              )}
            />
          )}
          {totalStock(product) === 0 ? (
            <span className="absolute top-3 left-3 bg-carbon-ink px-1.5 py-0.5 text-micro tracking-label text-white uppercase">
              Agotado
            </span>
          ) : product.tags?.includes("nuevo") && (
            <span className="absolute top-3 left-3 bg-white px-1.5 py-0.5 text-micro uppercase tracking-label">
              Nuevo
            </span>
          )}
        </div>
      </Link>

      <FavoriteButton slug={product.slug} name={product.name} className="absolute top-2 right-2" />

      <div className="flex flex-1 flex-col pt-3">
        {!quickAdd && product.colors.length > 0 && (
          <ul className="mb-2 flex items-center gap-1" aria-label={`${product.colors.length} colores`}>
            {product.colors.slice(0, MAX_SWATCHES).map((c) => (
              <li key={c.slug}>
                <span title={c.name} className="block size-3 border border-black/15" style={{ backgroundColor: c.hex }} />
              </li>
            ))}
            {extra > 0 && <li className="pl-1 text-micro text-smoke-charcoal">+{extra}</li>}
          </ul>
        )}
        <h3 className="text-caption">
          <Link href={href} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-caption">{formatPrice(product.price)}</p>
        <TierLine product={product} className="mt-0.5" />
        {quickAdd && <QuickAdd product={product} />}
      </div>
    </article>
  )
}

export function ProductGrid({
  products,
  className,
  quickAdd,
  eager,
}: {
  products: Product[]
  className?: string
  quickAdd?: boolean
  eager?: boolean
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-4 lg:grid-cols-4 lg:gap-y-14", className)}>
      {products.map((p, i) => (
        <ProductCard key={p.slug} product={p} quickAdd={quickAdd} eager={eager && i < 4} />
      ))}
    </div>
  )
}
