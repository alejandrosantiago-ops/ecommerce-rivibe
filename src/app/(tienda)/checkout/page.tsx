import type { Metadata } from "next"

import { PageHeader } from "@/components/product/shop-view"
import { CheckoutForm } from "@/components/checkout/checkout-form"

export const metadata: Metadata = { title: "Finalizar compra" }

export default function CheckoutPage() {
  return (
    <div className="page-container">
      <PageHeader title="Finalizar compra" crumbs={[{ label: "Carrito", href: "/carrito" }, { label: "Checkout" }]} />
      <CheckoutForm />
    </div>
  )
}
