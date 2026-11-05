import Link from "next/link"

import { type Product, findProduct, formatPrice, unitPriceFor } from "@/lib/catalog"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const EXAMPLES = ["polo-basic-boxy-fit", "polo-basic-oversized", "jogger-baggy-basic", "hoodie-basic-oversized", "camisero-piquet"]

export function VolumePricing({ products }: { products: Product[] }) {
  const examples = EXAMPLES.map((slug) => findProduct(products, slug)).filter(
    (p): p is Product => p !== undefined && p.tiers.length > 0,
  )

  return (
    <section className="mt-section bg-blush-sand">
      <div className="page-container grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-20">
        <div>
          <p className="label-caps text-smoke-charcoal">Precios por volumen</p>
          <h2 className="mt-3 text-display font-normal md:text-[36px]">Desde 3 y 5 unidades, pagas menos por cada una</h2>
          <p className="mt-4 max-w-md text-body text-smoke-charcoal">
            Lleva 3 o 5 unidades del mismo producto y combina los colores y tallas que quieras. El precio especial se
            activa automáticamente en tu carrito.
          </p>
          <Link href="/catalogo" className={cn(buttonVariants({ variant: "ink", size: "cta" }), "mt-7")}>
            Armar mi pedido
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[380px] border-t border-carbon-ink text-body">
            <thead>
              <tr className="text-micro uppercase tracking-label text-smoke-charcoal">
                <th scope="col" className="py-3 text-left font-normal">Prenda</th>
                <th scope="col" className="py-3 text-right font-normal">1–2 u.</th>
                <th scope="col" className="py-3 text-right font-normal">3–4 u.</th>
                <th scope="col" className="py-3 text-right font-normal">5+ u.</th>
              </tr>
            </thead>
            <tbody>
              {examples.map((p) => (
                <tr key={p.slug} className="border-t border-carbon-ink/20">
                  <th scope="row" className="py-4 text-left font-normal">
                    <Link href={`/producto/${p.slug}`} className="hover:underline">{p.name}</Link>
                  </th>
                  <td className="py-4 text-right text-smoke-charcoal">{formatPrice(p.price)}</td>
                  <td className="py-4 text-right">{formatPrice(unitPriceFor(p, 3))}</td>
                  <td className="py-4 text-right font-medium">{formatPrice(unitPriceFor(p, 5))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
