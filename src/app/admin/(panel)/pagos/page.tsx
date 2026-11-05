import type { Metadata } from "next"
import { PaymentsAdmin } from "@/components/admin/payments-admin"

export const metadata: Metadata = { title: "Pagos" }

export default function AdminPaymentsPage() {
  return <PaymentsAdmin />
}
