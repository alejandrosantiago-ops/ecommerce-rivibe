import type { Metadata } from "next"

import { PageHeader } from "@/components/product/shop-view"
import { CartPage } from "@/components/cart/cart-page"

export const metadata: Metadata = { title: "Carrito" }

export default function Page() {
  return (
    <div className="page-container">
      <PageHeader title="Carrito" crumbs={[{ label: "Carrito" }]} />
      <CartPage />
    </div>
  )
}
